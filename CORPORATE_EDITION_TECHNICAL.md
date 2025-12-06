# 🔧 KwachaLite Corporate Edition - Technical Implementation Guide

**Version:** 1.0  
**Date:** December 6, 2025  
**For:** Development Team

---

## 📋 Technical Overview

This document provides the **technical blueprint** for implementing KwachaLite Corporate Edition, transforming the personal finance app into an enterprise-grade organizational financial management platform.

---

## 🏗️ Architecture Changes

### **Current Architecture (Personal)**
```
User → Personal Workspace → Transactions/Bills/Goals
```

### **New Architecture (Corporate)**
```
Organization
├── Users (with roles)
├── Projects
│   ├── Fund Accounts
│   ├── Teams
│   ├── Individual Assignees
│   └── Transactions (with evidence & approvals)
└── Reports & Analytics
```

---

## 🗄️ Database Schema

### **1. Organizations Table**

```sql
CREATE TABLE organizations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL, -- for custom domains
    type TEXT NOT NULL CHECK (type IN ('ngo', 'government', 'corporate', 'research', 'social_enterprise')),
    
    -- Registration Info
    registration_number TEXT,
    tax_id TEXT,
    registration_document_url TEXT,
    
    -- Contact Info
    email TEXT NOT NULL,
    phone TEXT,
    website TEXT,
    
    -- Address
    country TEXT NOT NULL,
    region TEXT,
    city TEXT,
    address TEXT,
    postal_code TEXT,
    
    -- Financial Settings
    currency TEXT DEFAULT 'USD',
    fiscal_year_start INTEGER DEFAULT 1, -- Month (1-12)
    
    -- Branding
    logo_url TEXT,
    primary_color TEXT DEFAULT '#627d98',
    secondary_color TEXT DEFAULT '#ff6b4a',
    
    -- Subscription
    plan TEXT DEFAULT 'starter' CHECK (plan IN ('starter', 'professional', 'enterprise')),
    subscription_status TEXT DEFAULT 'active' CHECK (subscription_status IN ('active', 'trial', 'suspended', 'cancelled')),
    subscription_start_date TIMESTAMPTZ,
    subscription_end_date TIMESTAMPTZ,
    billing_email TEXT,
    
    -- Settings
    settings JSONB DEFAULT '{}'::jsonb,
    
    -- Metadata
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Indexes
    CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$')
);

CREATE INDEX organizations_slug_idx ON organizations(slug);
CREATE INDEX organizations_type_idx ON organizations(type);
CREATE INDEX organizations_plan_idx ON organizations(plan);
```

### **2. Organization Users Table**

```sql
CREATE TABLE organization_users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Role & Permissions
    role TEXT NOT NULL CHECK (role IN (
        'super_admin',
        'finance_manager',
        'auditor',
        'project_manager',
        'team_lead',
        'team_member',
        'individual_assignee'
    )),
    
    -- Custom Permissions (override role defaults)
    permissions JSONB DEFAULT '{
        "can_create_projects": false,
        "can_approve_expenses": false,
        "can_view_all_projects": false,
        "can_manage_users": false,
        "can_export_data": false,
        "can_edit_budgets": false
    }'::jsonb,
    
    -- Status
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    invited_by UUID REFERENCES auth.users(id),
    invited_at TIMESTAMPTZ DEFAULT NOW(),
    joined_at TIMESTAMPTZ,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints
    UNIQUE(organization_id, user_id)
);

CREATE INDEX organization_users_org_idx ON organization_users(organization_id);
CREATE INDEX organization_users_user_idx ON organization_users(user_id);
CREATE INDEX organization_users_role_idx ON organization_users(role);
```

### **3. Projects Table**

```sql
CREATE TABLE projects (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    
    -- Basic Info
    name TEXT NOT NULL,
    code TEXT, -- e.g., "PROJ-001"
    description TEXT,
    category TEXT CHECK (category IN (
        'infrastructure', 'education', 'health', 'agriculture',
        'environment', 'technology', 'research', 'community', 'other'
    )),
    
    -- Budget
    total_budget DECIMAL(15,2) NOT NULL,
    allocated_funds DECIMAL(15,2) DEFAULT 0,
    spent_funds DECIMAL(15,2) DEFAULT 0,
    remaining_funds DECIMAL(15,2) GENERATED ALWAYS AS (total_budget - spent_funds) STORED,
    
    -- Timeline
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status TEXT DEFAULT 'planning' CHECK (status IN (
        'planning', 'active', 'on_hold', 'completed', 'cancelled'
    )),
    
    -- Team
    project_manager_id UUID REFERENCES auth.users(id),
    
    -- Location
    location JSONB DEFAULT '{
        "country": null,
        "region": null,
        "district": null,
        "coordinates": null
    }'::jsonb,
    
    -- Donors
    donors JSONB DEFAULT '[]'::jsonb,
    -- Example: [{"name": "UN", "amount": 50000, "restrictions": "education only"}]
    
    -- Compliance Settings
    requires_receipts BOOLEAN DEFAULT true,
    requires_approval BOOLEAN DEFAULT true,
    approval_threshold DECIMAL(10,2) DEFAULT 500, -- Amount requiring approval
    
    -- Metadata
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_dates CHECK (end_date >= start_date),
    CONSTRAINT valid_budget CHECK (total_budget >= 0)
);

CREATE INDEX projects_org_idx ON projects(organization_id);
CREATE INDEX projects_status_idx ON projects(status);
CREATE INDEX projects_manager_idx ON projects(project_manager_id);
```

### **4. Teams Table**

```sql
CREATE TABLE teams (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    
    -- Basic Info
    name TEXT NOT NULL,
    description TEXT,
    
    -- Team Lead
    team_lead_id UUID REFERENCES auth.users(id),
    
    -- Budget Allocation
    allocated_budget DECIMAL(15,2) DEFAULT 0,
    spent_budget DECIMAL(15,2) DEFAULT 0,
    remaining_budget DECIMAL(15,2) GENERATED ALWAYS AS (allocated_budget - spent_budget) STORED,
    
    -- Spending Limits
    daily_limit DECIMAL(10,2),
    weekly_limit DECIMAL(10,2),
    monthly_limit DECIMAL(10,2),
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX teams_project_idx ON teams(project_id);
CREATE INDEX teams_lead_idx ON teams(team_lead_id);
```

### **5. Team Members Table**

```sql
CREATE TABLE team_members (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Role in Team
    role TEXT DEFAULT 'member' CHECK (role IN ('lead', 'member')),
    
    -- Individual Allocation (optional)
    allocated_budget DECIMAL(10,2),
    spent_budget DECIMAL(10,2) DEFAULT 0,
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints
    UNIQUE(team_id, user_id)
);

CREATE INDEX team_members_team_idx ON team_members(team_id);
CREATE INDEX team_members_user_idx ON team_members(user_id);
```

### **6. Fund Accounts Table**

```sql
CREATE TABLE fund_accounts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    
    -- Basic Info
    name TEXT NOT NULL,
    description TEXT,
    
    -- Amounts
    total_amount DECIMAL(15,2) NOT NULL,
    allocated_amount DECIMAL(15,2) DEFAULT 0,
    spent_amount DECIMAL(15,2) DEFAULT 0,
    remaining_amount DECIMAL(15,2) GENERATED ALWAYS AS (total_amount - spent_amount) STORED,
    
    -- Allocation Type
    allocation_type TEXT CHECK (allocation_type IN ('team', 'individual', 'category', 'hybrid')),
    
    -- Allocations (JSONB for flexibility)
    allocations JSONB DEFAULT '[]'::jsonb,
    -- Example: [{"assigneeId": "uuid", "assigneeType": "team", "amount": 10000}]
    
    -- Restrictions
    allowed_categories JSONB DEFAULT '[]'::jsonb,
    requires_approval BOOLEAN DEFAULT true,
    approvers JSONB DEFAULT '[]'::jsonb, -- Array of user IDs
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    
    -- Metadata
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX fund_accounts_project_idx ON fund_accounts(project_id);
```

### **7. Corporate Transactions Table**

```sql
CREATE TABLE corporate_transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    fund_account_id UUID REFERENCES fund_accounts(id),
    team_id UUID REFERENCES teams(id),
    
    -- Transaction Details
    date DATE NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'USD',
    category TEXT NOT NULL,
    subcategory TEXT,
    description TEXT NOT NULL,
    
    -- Vendor Info
    vendor_name TEXT,
    vendor_contact TEXT,
    invoice_number TEXT,
    
    -- Evidence & Documentation
    receipts JSONB DEFAULT '[]'::jsonb,
    -- Example: [{"id": "uuid", "url": "...", "filename": "...", "uploadedAt": "..."}]
    
    photos JSONB DEFAULT '[]'::jsonb,
    -- Example: [{"id": "uuid", "url": "...", "caption": "...", "location": {...}}]
    
    -- Approval Workflow
    status TEXT DEFAULT 'draft' CHECK (status IN (
        'draft', 'pending', 'approved', 'rejected', 'flagged'
    )),
    
    submitted_by UUID NOT NULL REFERENCES auth.users(id),
    submitted_at TIMESTAMPTZ,
    
    approved_by UUID REFERENCES auth.users(id),
    approved_at TIMESTAMPTZ,
    
    rejection_reason TEXT,
    
    -- Audit Trail
    audit_log JSONB DEFAULT '[]'::jsonb,
    -- Example: [{"action": "created", "userId": "...", "timestamp": "...", "changes": {...}}]
    
    -- Location & Context
    location JSONB,
    -- Example: {"lat": 0.0, "lng": 0.0, "address": "..."}
    
    tags JSONB DEFAULT '[]'::jsonb,
    notes TEXT,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_amount CHECK (amount > 0)
);

CREATE INDEX corporate_transactions_org_idx ON corporate_transactions(organization_id);
CREATE INDEX corporate_transactions_project_idx ON corporate_transactions(project_id);
CREATE INDEX corporate_transactions_status_idx ON corporate_transactions(status);
CREATE INDEX corporate_transactions_submitted_idx ON corporate_transactions(submitted_by);
CREATE INDEX corporate_transactions_date_idx ON corporate_transactions(date);
```

### **8. Approval Workflows Table**

```sql
CREATE TABLE approval_workflows (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    
    -- Basic Info
    name TEXT NOT NULL,
    description TEXT,
    
    -- Trigger Conditions
    triggers JSONB DEFAULT '{
        "amountThreshold": null,
        "categories": [],
        "projects": []
    }'::jsonb,
    
    -- Approval Levels
    levels JSONB DEFAULT '[]'::jsonb,
    -- Example: [{"level": 1, "approverRole": "project_manager", "approvers": ["uuid"], "requiresAll": false}]
    
    -- Actions
    on_approval TEXT DEFAULT 'next_level' CHECK (on_approval IN ('next_level', 'complete')),
    on_rejection TEXT DEFAULT 'return_to_submitter' CHECK (on_rejection IN ('return_to_submitter', 'escalate')),
    on_timeout TEXT DEFAULT 'escalate' CHECK (on_timeout IN ('auto_approve', 'escalate', 'reject')),
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    
    -- Metadata
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX approval_workflows_org_idx ON approval_workflows(organization_id);
```

---

## 🔐 Row Level Security (RLS) Policies

### **Organizations**

```sql
-- Users can only see organizations they belong to
CREATE POLICY "Users can view their organizations"
ON organizations FOR SELECT
USING (
    id IN (
        SELECT organization_id FROM organization_users
        WHERE user_id = auth.uid()
    )
);

-- Only super admins can update organization
CREATE POLICY "Super admins can update organization"
ON organizations FOR UPDATE
USING (
    id IN (
        SELECT organization_id FROM organization_users
        WHERE user_id = auth.uid() AND role = 'super_admin'
    )
);
```

### **Projects**

```sql
-- Users can view projects in their organization
CREATE POLICY "Users can view organization projects"
ON projects FOR SELECT
USING (
    organization_id IN (
        SELECT organization_id FROM organization_users
        WHERE user_id = auth.uid()
    )
);

-- Project managers and finance managers can create projects
CREATE POLICY "Authorized users can create projects"
ON projects FOR INSERT
WITH CHECK (
    organization_id IN (
        SELECT organization_id FROM organization_users
        WHERE user_id = auth.uid()
        AND role IN ('super_admin', 'finance_manager')
    )
);
```

### **Corporate Transactions**

```sql
-- Users can view transactions in their projects
CREATE POLICY "Users can view project transactions"
ON corporate_transactions FOR SELECT
USING (
    project_id IN (
        SELECT p.id FROM projects p
        INNER JOIN organization_users ou ON p.organization_id = ou.organization_id
        WHERE ou.user_id = auth.uid()
    )
);

-- Team members can create transactions
CREATE POLICY "Team members can create transactions"
ON corporate_transactions FOR INSERT
WITH CHECK (
    submitted_by = auth.uid()
    AND project_id IN (
        SELECT p.id FROM projects p
        INNER JOIN organization_users ou ON p.organization_id = ou.organization_id
        WHERE ou.user_id = auth.uid()
    )
);
```

---

## 📱 TypeScript Interfaces

```typescript
// Organization
interface Organization {
  id: string;
  name: string;
  slug: string;
  type: 'ngo' | 'government' | 'corporate' | 'research' | 'social_enterprise';
  email: string;
  country: string;
  currency: string;
  plan: 'starter' | 'professional' | 'enterprise';
  subscriptionStatus: 'active' | 'trial' | 'suspended' | 'cancelled';
  logoUrl?: string;
  settings: Record<string, any>;
  createdAt: Date;
}

// Organization User
interface OrganizationUser {
  id: string;
  organizationId: string;
  userId: string;
  role: 'super_admin' | 'finance_manager' | 'auditor' | 'project_manager' | 'team_lead' | 'team_member' | 'individual_assignee';
  permissions: {
    canCreateProjects: boolean;
    canApproveExpenses: boolean;
    canViewAllProjects: boolean;
    canManageUsers: boolean;
    canExportData: boolean;
    canEditBudgets: boolean;
  };
  status: 'active' | 'inactive' | 'suspended';
}

// Project
interface Project {
  id: string;
  organizationId: string;
  name: string;
  code?: string;
  description?: string;
  category: string;
  totalBudget: number;
  allocatedFunds: number;
  spentFunds: number;
  remainingFunds: number;
  startDate: Date;
  endDate: Date;
  status: 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled';
  projectManagerId?: string;
  location?: {
    country?: string;
    region?: string;
    district?: string;
    coordinates?: { lat: number; lng: number };
  };
  donors?: Array<{
    name: string;
    amount: number;
    restrictions?: string;
  }>;
  requiresReceipts: boolean;
  requiresApproval: boolean;
  approvalThreshold: number;
}

// Corporate Transaction
interface CorporateTransaction {
  id: string;
  organizationId: string;
  projectId: string;
  fundAccountId?: string;
  teamId?: string;
  date: Date;
  amount: number;
  currency: string;
  category: string;
  subcategory?: string;
  description: string;
  vendorName?: string;
  vendorContact?: string;
  invoiceNumber?: string;
  receipts: Array<{
    id: string;
    url: string;
    filename: string;
    uploadedAt: Date;
    uploadedBy: string;
  }>;
  photos: Array<{
    id: string;
    url: string;
    caption?: string;
    location?: { lat: number; lng: number };
    takenAt: Date;
  }>;
  status: 'draft' | 'pending' | 'approved' | 'rejected' | 'flagged';
  submittedBy: string;
  submittedAt?: Date;
  approvedBy?: string;
  approvedAt?: Date;
  rejectionReason?: string;
  auditLog: Array<{
    action: 'created' | 'submitted' | 'approved' | 'rejected' | 'edited';
    userId: string;
    userName: string;
    timestamp: Date;
    changes?: any;
  }>;
  location?: {
    lat: number;
    lng: number;
    address?: string;
  };
  tags?: string[];
  notes?: string;
}
```

---

## 🔄 API Endpoints

### **Organizations**
```
GET    /api/organizations/:id
POST   /api/organizations
PUT    /api/organizations/:id
DELETE /api/organizations/:id
GET    /api/organizations/:id/users
POST   /api/organizations/:id/users/invite
```

### **Projects**
```
GET    /api/organizations/:orgId/projects
POST   /api/organizations/:orgId/projects
GET    /api/projects/:id
PUT    /api/projects/:id
DELETE /api/projects/:id
GET    /api/projects/:id/dashboard
GET    /api/projects/:id/budget-status
```

### **Transactions**
```
GET    /api/projects/:projectId/transactions
POST   /api/projects/:projectId/transactions
GET    /api/transactions/:id
PUT    /api/transactions/:id
DELETE /api/transactions/:id
POST   /api/transactions/:id/submit
POST   /api/transactions/:id/approve
POST   /api/transactions/:id/reject
POST   /api/transactions/:id/upload-receipt
```

### **Reports**
```
GET    /api/projects/:id/reports/donor
GET    /api/projects/:id/reports/financial
GET    /api/projects/:id/reports/audit
POST   /api/projects/:id/reports/export
```

---

## 📊 Implementation Phases

### **Phase 1: Foundation (Weeks 1-4)**
- [ ] Database schema implementation
- [ ] RLS policies
- [ ] Organization CRUD
- [ ] User management
- [ ] Basic authentication

### **Phase 2: Projects (Weeks 5-8)**
- [ ] Project CRUD
- [ ] Fund account management
- [ ] Team creation
- [ ] Budget allocation
- [ ] Project dashboard

### **Phase 3: Transactions (Weeks 9-12)**
- [ ] Enhanced transaction model
- [ ] Receipt upload (Supabase Storage)
- [ ] Photo evidence
- [ ] GPS tagging
- [ ] Transaction list/detail views

### **Phase 4: Approvals (Weeks 13-16)**
- [ ] Approval workflow engine
- [ ] Multi-level approvals
- [ ] Notifications (email, SMS, push)
- [ ] Approval dashboard
- [ ] Audit trail

### **Phase 5: Reporting (Weeks 17-20)**
- [ ] Report templates
- [ ] PDF generation
- [ ] Excel export
- [ ] Scheduled reports
- [ ] Custom reports

### **Phase 6: Mobile (Weeks 21-24)**
- [ ] React Native app
- [ ] Offline support
- [ ] Camera integration
- [ ] GPS integration
- [ ] Push notifications

---

## ✅ Testing Strategy

### **Unit Tests**
- Database functions
- API endpoints
- Business logic
- Calculations (budgets, allocations)

### **Integration Tests**
- Approval workflows
- Multi-user scenarios
- RLS policies
- File uploads

### **E2E Tests**
- Complete user journeys
- Organization setup
- Project creation
- Expense submission & approval
- Report generation

---

**Ready to build the future of organizational finance management!** 🚀

---

**Document By:** Antigravity AI  
**Date:** December 6, 2025  
**Version:** 1.0 - Technical Implementation
