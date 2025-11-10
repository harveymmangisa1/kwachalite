import React from 'react';
import { LoadingScreen } from '@/components/ui/loading-screen';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import ErrorBoundary from '@/components/error-boundary';
import { DarkModeProvider } from '@/contexts/dark-mode-context';
import LoginPage from '@/app/page';
import DashboardLayout from '@/app/dashboard/layout';
import Dashboard from '@/app/dashboard/page';
import Analytics from '@/app/dashboard/analytics/page';
import Bills from '@/app/dashboard/bills/page';
import Budgets from '@/app/dashboard/budgets/page';
import Business from '@/app/dashboard/business/page';
import Clients from '@/app/dashboard/clients/page';
import ClientDetail from '@/app/dashboard/clients/[id]/page';
import Goals from '@/app/dashboard/goals/page';
import Help from '@/app/dashboard/help/page';
import GroupSavings from '@/app/dashboard/savings/groups/page';
import Loans from '@/app/dashboard/loans/page';
import Products from '@/app/dashboard/products/page';
import Quotes from '@/app/dashboard/quotes/page';
import QuoteDetail from '@/app/dashboard/quotes/[id]/page';
import Settings from '@/app/dashboard/settings/page';
import CurrencySettings from '@/app/dashboard/settings/currency/page';
import Transactions from '@/app/dashboard/transactions/page';
import About from '@/app/dashboard/about/page';
import SignUp from '@/app/signup/page';
import JoinGroup from '@/app/join-group/[token]/page';
import Invoices from '@/app/dashboard/invoices/page';
import InvoiceDetail from '@/app/dashboard/invoices/[id]/page';
import Receipts from '@/app/dashboard/receipts/page';
import DeliveryNotes from '@/app/dashboard/delivery-notes/page';
import BusinessFinancials from '@/app/dashboard/business-financials/page';
import BusinessBudgets from '@/app/dashboard/business-budgets/page';
import TestProfile from '@/app/dashboard/test-profile/page';
import LandingPage from '@/app/landing/page';
import NotFoundPage from '@/app/404/page';

function App() {
  const [showLoading, setShowLoading] = React.useState(true);

  if (showLoading) {
    return <LoadingScreen onComplete={() => setShowLoading(false)} />;
  }

  return (
    <ErrorBoundary>
      <DarkModeProvider>
        <Router>
          <Routes>
            <Route path="/" element={<LoginPage />} />
            <Route path="/landing" element={<LandingPage />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/join-group/:token" element={<JoinGroup />} />
            <Route path="/dashboard" element={<DashboardLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="bills" element={<Bills />} />
              <Route path="budgets" element={<Budgets />} />
              <Route path="business" element={<Business />} />
              <Route path="clients" element={<Clients />} />
              <Route path="clients/:id" element={<ClientDetail />} />
              <Route path="goals" element={<Goals />} />
              <Route path="savings/groups" element={<GroupSavings />} />
              <Route path="help" element={<Help />} />
              <Route path="loans" element={<Loans />} />
              <Route path="products" element={<Products />} />
              <Route path="quotes" element={<Quotes />} />
              <Route path="quotes/:id" element={<QuoteDetail />} />
              <Route path="invoices" element={<Invoices />} />
              <Route path="invoices/:id" element={<InvoiceDetail />} />
              <Route path="receipts" element={<Receipts />} />
              <Route path="delivery-notes" element={<DeliveryNotes />} />
              <Route path="business-financials" element={<BusinessFinancials />} />
              <Route path="business-budgets" element={<BusinessBudgets />} />
              <Route path="test-profile" element={<TestProfile />} />
              <Route path="settings" element={<Settings />} />
              <Route path="settings/currency" element={<CurrencySettings />} />
              <Route path="transactions" element={<Transactions />} />
              <Route path="about" element={<About />} />
            </Route>
            <Route path="/404" element={<NotFoundPage />} />
            <Route path="*" element={<Navigate to="/404" replace />} />
          </Routes>
          <Toaster />
        </Router>
      </DarkModeProvider>
    </ErrorBoundary>
  );
}

export default App;