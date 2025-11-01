import React from 'react';
import { LoadingScreen } from '@/components/ui/loading-screen';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import ErrorBoundary from '@/components/error-boundary';
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
import Loans from '@/app/dashboard/loans/page';
import Products from '@/app/dashboard/products/page';
import Quotes from '@/app/dashboard/quotes/page';
import QuoteDetail from '@/app/dashboard/quotes/[id]/page';
import Settings from '@/app/dashboard/settings/page';
import Transactions from '@/app/dashboard/transactions/page';
import About from '@/app/dashboard/about/page';
import SignUp from '@/app/signup/page';
import Invoices from '@/app/dashboard/invoices/page';
import InvoiceDetail from '@/app/dashboard/invoices/[id]/page';
import Receipts from '@/app/dashboard/receipts/page';
import DeliveryNotes from '@/app/dashboard/delivery-notes/page';
import BusinessFinancials from '@/app/dashboard/business-financials/page';
import BusinessBudgets from '@/app/dashboard/business-budgets/page';
import TestProfile from '@/app/dashboard/test-profile/page';
import LandingPage from '@/app/landing/page';

function App() {
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 3000); // Simulate loading time
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <LoadingScreen onComplete={() => setLoading(false)} />;
  }

  return (
    <ErrorBoundary>
      <Router>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/landing" element={<LandingPage />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="bills" element={<Bills />} />
            <Route path="budgets" element={<Budgets />} />
            <Route path="business" element={<Business />} />
            <Route path="clients" element={<Clients />} />
            <Route path="clients/:id" element={<ClientDetail />} />
            <Route path="goals" element={<Goals />} />
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
            <Route path="transactions" element={<Transactions />} />
            <Route path="about" element={<About />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <Toaster />
      </Router>
    </ErrorBoundary>
  );
}

export default App;