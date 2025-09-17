# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

KwachaLite is a modern personal and business finance tracker built with React, TypeScript, Vite, Tailwind CSS, and Supabase. The application supports dual workspaces (personal/business) with comprehensive financial management features including transactions, budgets, bills, goals, clients, quotes, and analytics.

## Architecture

### Tech Stack
- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + shadcn/ui components
- **Database**: Supabase (PostgreSQL)
- **State Management**: Zustand with persistence
- **Routing**: React Router DOM
- **Charts**: Recharts
- **Forms**: React Hook Form + Zod validation

### Project Structure
- `src/app/` - Next.js-style page components and layouts
- `src/components/` - Reusable UI components
- `src/lib/` - Core utilities, data store, and database sync
- `src/hooks/` - Custom React hooks
- `src/types/` - TypeScript type definitions
- `supabase/migrations/` - Database schema and migrations

### Key Architectural Patterns
- **Dual Workspace Design**: All features support both personal and business contexts
- **Zustand Store**: Centralized state management with Supabase sync
- **Real-time Sync**: Changes are automatically synced to Supabase
- **Component Composition**: Heavy use of shadcn/ui for consistent design

## Development Commands

### Setup
```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local
# Edit .env.local with your Supabase credentials

# Start development server
npm run dev
```

### Development
```bash
# Run development server (port 9002)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Type checking
npm run typecheck

# Lint code
npm run lint
```

### Database
```bash
# Apply migrations (using provided script)
./apply-migration.sh

# Or manually run SQL files in Supabase dashboard
# Files in supabase/migrations/ should be run in order
```

## Environment Configuration

Required environment variables in `.env.local`:
- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Supabase anonymous key
- `VITE_SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key (optional)
- `VITE_APP_URL` - Application URL (default: http://localhost:9002)

## Key Components & Features

### Core Data Models
- **Transactions**: Income/expense tracking with categories
- **Categories**: Workspace-specific with optional budgets
- **Bills**: Recurring payment tracking
- **Goals**: Savings targets with progress tracking
- **Clients**: Business contact management
- **Products**: Business inventory/services
- **Quotes**: Business quotation system
- **Loans**: Debt tracking and management

### State Management
The app uses Zustand with the main store in `src/lib/data.ts`. Key methods:
- Transaction CRUD operations
- Real-time Supabase sync via `supabase-sync.ts`
- Workspace-aware filtering
- Local persistence with automatic sync

### Authentication
- Supabase Auth integration
- User profile management
- Business profile metadata
- Row-level security (RLS) policies

## Database Schema

### Key Tables
- `users` - User profiles (extends auth.users)
- `transactions` - All financial transactions
- `categories` - User-defined transaction categories
- `bills` - Recurring bills and payments
- `savings_goals` - Financial targets
- `clients` - Business contacts
- `products` - Business items/services
- `quotes` - Business quotations
- `loans` - Debt tracking

### Workspace Isolation
All major tables include a `workspace` enum ('personal' | 'business') and `user_id` for proper data isolation.

## Common Development Tasks

### Adding New Features
1. Define types in `src/lib/types.ts`
2. Add database table/migration in `supabase/migrations/`
3. Update Supabase types in `src/types/supabase.ts`
4. Add store methods in `src/lib/data.ts`
5. Implement sync methods in `src/lib/supabase-sync.ts`
6. Create UI components and pages

### Working with Categories
Categories are workspace-specific and include:
- Default categories defined in `initialCategories`
- Budget amounts and frequencies
- Icon and color customization
- Type classification (income/expense)

### Supabase Integration
- Use `src/lib/supabase.ts` for client initialization
- All mutations should trigger sync via store methods
- RLS policies ensure data security
- Real-time subscriptions for live updates

### UI Development
- Use shadcn/ui components consistently
- Follow the established color scheme (blue/purple gradients)
- Implement responsive design patterns
- Use Tailwind for styling

## Testing & Quality

### Code Style
- TypeScript strict mode enabled
- ESLint configuration for code quality
- Consistent file naming conventions
- Component composition over inheritance

### Error Handling
- Toast notifications for user feedback
- Error boundaries for crash prevention
- Graceful degradation for offline scenarios
- Validation with Zod schemas

## Known Issues & Todos

### Current MVP Limitations
- Some Supabase sync methods are incomplete (goals, clients, products)
- Hardcoded currency formatting (MK)
- Default budget values in categories
- Limited error handling in some components
- No offline functionality
- Basic responsive design

### Priority Fixes for MVP
1. Complete Supabase sync for all data types
2. Implement proper error handling
3. Add loading states
4. Improve mobile responsiveness
5. Add data validation
6. Implement proper user onboarding

## File Patterns

### Component Files
- Use TypeScript with proper type definitions
- Export default for page components
- Use named exports for utility components
- Include proper prop interfaces

### API Integration
- Use Supabase client from `src/lib/supabase.ts`
- Handle errors gracefully with toast notifications
- Implement optimistic updates where appropriate
- Use proper TypeScript types from database schema

### Styling
- Use Tailwind classes with shadcn/ui components
- Follow consistent spacing and color schemes
- Implement responsive design breakpoints
- Use CSS variables for theme consistency