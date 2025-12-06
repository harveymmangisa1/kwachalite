# KwachaLite Quick Reference Guide

> **Last Updated:** December 6, 2025  
> **Status:** ✅ Production-Ready MVP

---

## 🚀 Quick Start Commands

```bash
# Install dependencies
npm install

# Run development server
npm run dev
# → Opens at http://localhost:9002

# Build for production
npm run build

# Preview production build
npm run preview

# Type checking
npm run typecheck

# Linting
npm run lint
```

---

## 📂 Key Files & Locations

### **Core Application Files**
```
src/
├── App.tsx                      # Main app component & routing
├── main.tsx                     # App entry point
├── lib/
│   ├── data.ts                  # 🔴 ZUSTAND STORE (main state)
│   ├── types.ts                 # 🔴 TYPE DEFINITIONS
│   ├── supabase-sync.ts         # 🔴 REAL-TIME SYNC LOGIC
│   ├── supabase.ts              # Supabase client
│   ├── config.ts                # App configuration
│   └── validations.ts           # Form schemas
```

### **Database Files**
```
supabase/
├── migrations/                  # Database migrations
database-setup.sql               # 🔴 MAIN DB SCHEMA
```

### **Documentation**
```
README.md                        # Setup guide
ROADMAP.md                       # 24-month roadmap
PROJECT_ANALYSIS.md              # 🔴 THIS ANALYSIS
COMPLETE_FUNCTIONALITY_FIXES.md  # Feature status
features.md                      # Feature list
```

---

## 🎯 Core Concepts

### **1. Multi-Workspace System**
```typescript
type Workspace = 'personal' | 'business';

// Users can switch between:
// - Personal: Home finances, personal goals, personal bills
// - Business: Clients, products, quotes, invoices
```

### **2. State Management Pattern**
```typescript
// Zustand Store (src/lib/data.ts)
const useAppStore = create<AppState>((set, get) => ({
  transactions: [],
  bills: [],
  savingsGoals: [],
  // ... all state
  
  // Methods automatically sync to Supabase
  addTransaction: async (transaction) => {
    set(state => ({ transactions: [transaction, ...state.transactions] }));
    await supabaseSync.syncTransaction(transaction, 'create');
  }
}));
```

### **3. Real-time Sync**
```typescript
// Automatic sync flow:
User Action → Local State Update → Supabase Sync → Real-time Update
                    ↓
            Immediate UI Feedback
```

---

## 🗄️ Database Tables Quick Reference

| Table | Purpose | Key Fields | Sync Status |
|-------|---------|------------|-------------|
| `transactions` | Income/expense tracking | amount, type, category, workspace | ✅ Full |
| `bills` | Bill management | name, amount, due_date, is_recurring | ✅ Full |
| `savings_goals` | Savings tracking | target_amount, current_amount, items | ✅ Full |
| `categories` | Custom categories | name, type, workspace, budget | ✅ Full |
| `clients` | CRM clients | name, email, phone, address | ✅ Full |
| `products` | Product catalog | name, price, cost_price | ✅ Full |
| `quotes` | Quotations | quote_number, client_id, items, status | ✅ Full |
| `invoices` | Invoices | invoice_number, items, status | ⚠️ Local only |
| `loans` | Loan tracking | principal_amount, remaining_amount | ✅ Full |
| `business_budgets` | Business budgets | budget_amount, period, current_spent | ✅ Full |

---

## 🔑 Important Code Patterns

### **Adding a New Feature**

1. **Define Type** (`src/lib/types.ts`)
```typescript
export interface MyFeature {
  id: string;
  user_id: string;
  name: string;
  // ... other fields
}
```

2. **Add to Store** (`src/lib/data.ts`)
```typescript
interface AppState {
  myFeatures: MyFeature[];
  addMyFeature: (feature: MyFeature) => Promise<void>;
  updateMyFeature: (feature: MyFeature) => Promise<void>;
  deleteMyFeature: (id: string) => Promise<void>;
}
```

3. **Implement Methods**
```typescript
addMyFeature: async (feature) => {
  set(state => ({ myFeatures: [feature, ...state.myFeatures] }));
  await supabaseSync.syncMyFeature(feature, 'create');
}
```

4. **Add Sync Method** (`src/lib/supabase-sync.ts`)
```typescript
async syncMyFeature(feature: MyFeature, operation: 'create' | 'update' | 'delete') {
  // Implement sync logic
}
```

5. **Create UI Components**
```typescript
// src/components/my-feature/add-my-feature-dialog.tsx
// src/components/my-feature/my-feature-list.tsx
```

---

## 🎨 UI Component Library

### **ShadCN Components Used**
```
✅ Button, Input, Label, Textarea
✅ Dialog, Sheet, Popover, Dropdown Menu
✅ Card, Separator, Tabs, Accordion
✅ Table, DataTable (custom)
✅ Toast, Alert Dialog
✅ Select, Checkbox, Radio Group
✅ Calendar, Date Picker
✅ Progress, Slider
✅ Avatar, Badge, Tooltip
```

### **Custom Components**
```
✅ ModernCard (with hover effects)
✅ StatCard (dashboard metrics)
✅ DataTable (with sorting, filtering)
✅ LoadingScreen
✅ ErrorBoundary
```

---

## 🔐 Authentication Flow

```
1. User visits app
   ↓
2. Check Supabase session
   ↓
3. If authenticated → Dashboard
   If not → Login page
   ↓
4. On login success:
   - Store user in Supabase Auth
   - Initialize sync
   - Redirect to dashboard
   ↓
5. Real-time sync starts
```

---

## 📊 Data Flow Diagram

```
┌─────────────┐
│   User UI   │
└──────┬──────┘
       │
       ↓
┌─────────────────┐
│ React Component │
└──────┬──────────┘
       │
       ↓
┌─────────────────┐
│ Zustand Store   │ ← Global State
└──────┬──────────┘
       │
       ↓
┌─────────────────┐
│ Supabase Sync   │ ← Sync Logic
└──────┬──────────┘
       │
       ↓
┌─────────────────┐
│ Supabase DB     │ ← PostgreSQL
└──────┬──────────┘
       │
       ↓
┌─────────────────┐
│ Real-time Sub   │ ← Updates all clients
└─────────────────┘
```

---

## 🐛 Common Issues & Solutions

### **Issue: Data not syncing**
```bash
# Check Supabase connection
1. Verify .env.local has correct credentials
2. Check browser console for errors
3. Verify RLS policies in Supabase dashboard
4. Check network tab for failed requests
```

### **Issue: Build fails**
```bash
# Type errors
npm run typecheck

# Clear cache and rebuild
rm -rf node_modules dist
npm install
npm run build
```

### **Issue: Authentication not working**
```bash
# Check Supabase Auth settings
1. Verify email templates are set up
2. Check redirect URLs in Supabase dashboard
3. Ensure auth.users table exists
```

---

## 🚦 Development Workflow

### **Daily Development**
```bash
1. Pull latest changes
   git pull origin main

2. Install any new dependencies
   npm install

3. Start dev server
   npm run dev

4. Make changes

5. Test locally

6. Commit and push
   git add .
   git commit -m "feat: your feature"
   git push origin main
```

### **Before Deployment**
```bash
1. Run type checking
   npm run typecheck

2. Run linting
   npm run lint

3. Test production build
   npm run build
   npm run preview

4. Deploy to Vercel
   git push origin main (auto-deploys)
```

---

## 📈 Performance Tips

### **Optimization Checklist**
- ✅ Use React.memo for expensive components
- ✅ Implement virtualization for long lists
- ✅ Lazy load routes
- ✅ Optimize images (use WebP)
- ⚠️ Add React Query for caching (TODO)
- ⚠️ Implement service workers (TODO)

### **Bundle Size**
```bash
# Analyze bundle
npm run build
# Check dist/ folder size

# Current size: ~2.5MB (uncompressed)
# Target: <1MB (with optimizations)
```

---

## 🔧 Environment Variables

### **Required Variables**
```env
# .env.local
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_SUPABASE_SERVICE_ROLE_KEY=your-service-role-key (optional)
```

### **Getting Credentials**
```
1. Go to Supabase Dashboard
2. Select your project
3. Settings → API
4. Copy Project URL and anon/public key
```

---

## 📱 Mobile Development Notes

### **Current Mobile Support**
- ✅ Responsive design (Tailwind breakpoints)
- ✅ Touch-friendly UI
- ✅ Mobile navigation
- ⚠️ No native app yet (planned)

### **Breakpoints**
```css
sm: 640px   /* Small tablets */
md: 768px   /* Tablets */
lg: 1024px  /* Laptops */
xl: 1280px  /* Desktops */
2xl: 1536px /* Large screens */
```

---

## 🎯 Feature Flags

### **Completed Features** ✅
- Personal finance tracking
- Business workspace
- Transaction management
- Budget tracking
- Savings goals
- Bill management
- Client management (CRM)
- Product catalog
- Quotation system
- Loan tracking
- Data export

### **In Development** 🚧
- Group savings (UI exists, needs full sync)
- Invoice management (UI exists, needs sync)
- Project tracking (partial)
- Advanced analytics

### **Planned** 📋
- Payment integrations
- Mobile app
- 2FA authentication
- AI categorization
- Multi-language support

---

## 🆘 Getting Help

### **Resources**
- 📖 [Supabase Docs](https://supabase.com/docs)
- 📖 [React Docs](https://react.dev)
- 📖 [Tailwind CSS](https://tailwindcss.com)
- 📖 [ShadCN UI](https://ui.shadcn.com)
- 📖 [Zustand](https://github.com/pmndrs/zustand)

### **Common Commands**
```bash
# View logs
npm run dev (check terminal)

# Check Supabase logs
# Go to Supabase Dashboard → Logs

# Debug state
# Open React DevTools → Components → useAppStore
```

---

## 📊 Project Stats

```
Total Files: ~200+
Lines of Code: ~15,000+
Components: ~100+
Database Tables: 15+
Routes: 25+
Dependencies: 50+
```

---

## ✅ Pre-Launch Checklist

- [x] All CRUD operations working
- [x] Authentication functional
- [x] Real-time sync working
- [x] Mobile responsive
- [x] Error handling implemented
- [x] Toast notifications
- [x] Form validation
- [ ] Unit tests (TODO)
- [ ] E2E tests (TODO)
- [ ] Performance audit (TODO)
- [ ] Security audit (TODO)
- [ ] User documentation (TODO)

---

**Quick Reference Version:** 1.0  
**Last Updated:** December 6, 2025  
**Maintained By:** KwachaLite Team
