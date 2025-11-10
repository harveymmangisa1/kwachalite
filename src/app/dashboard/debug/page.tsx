'use client';

import { useAuth } from '@/hooks/use-auth';
import { useAppStore } from '@/lib/data';
import { supabaseSync } from '@/lib/supabase-sync';
import { supabase } from '@/lib/supabase';

export default function DebugPage() {
  const { user, loading, session } = useAuth();
  const { clients, products, quotes } = useAppStore();

  const testQuoteCreation = async () => {
    if (!user) {
      console.error('No user logged in');
      return;
    }

    const testQuote = {
      id: 'test-quote-' + Date.now(),
      quoteNumber: 'TEST-001',
      clientId: clients[0]?.id || 'test-client',
      date: new Date().toISOString().split('T')[0],
      expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      items: [{ productId: products[0]?.id || 'test-product', quantity: 1, price: 100 }],
      status: 'draft' as const,
    };

    console.log('Testing quote creation:', testQuote);
    console.log('User:', user);
    console.log('Session:', session);

    try {
      // Test direct Supabase insert
      const { data, error } = await (supabase as any)
        .from('quotes')
        .insert({
          id: testQuote.id,
          quote_number: testQuote.quoteNumber,
          client_id: testQuote.clientId,
          valid_until: testQuote.expiryDate,
          items: testQuote.items,
          total_amount: 100,
          status: testQuote.status,
          user_id: user.id,
        })
        .select();

      console.log('Direct Supabase result:', { data, error });

      // Test via sync function
      await supabaseSync.syncQuote(testQuote, 'create');
      console.log('Sync function completed');
    } catch (error) {
      console.error('Test failed:', error);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Debug Page</h1>
      
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold">Auth Status</h2>
          <p>Loading: {loading ? 'Yes' : 'No'}</p>
          <p>User: {user ? user.email : 'Not logged in'}</p>
          <p>Session: {session ? 'Active' : 'None'}</p>
        </div>

        <div>
          <h2 className="text-lg font-semibold">Data Counts</h2>
          <p>Clients: {clients.length}</p>
          <p>Products: {products.length}</p>
          <p>Quotes: {quotes.length}</p>
        </div>

        <div>
          <h2 className="text-lg font-semibold">Sync State</h2>
          <pre>{JSON.stringify(supabaseSync.getSyncState(), null, 2)}</pre>
        </div>

        <button
          onClick={testQuoteCreation}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Test Quote Creation
        </button>
      </div>
    </div>
  );
}