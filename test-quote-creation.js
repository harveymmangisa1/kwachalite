// Test script to check quote creation
import { supabase } from './src/lib/supabase.js';

async function testQuoteCreation() {
  console.log('Testing quote creation...');
  
  // Test with a mock user session (you'll need to be logged in)
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  
  if (sessionError || !session) {
    console.error('No active session. Please log in first.');
    return;
  }
  
  console.log('User session found:', session.user.email);
  
  // Test quote data
  const testQuote = {
    id: 'test-quote-' + Date.now(),
    quote_number: 'TEST-001',
    client_id: '00000000-0000-0000-0000-000000000000', // This will fail but test the structure
    items: [{ productId: 'test', quantity: 1, price: 100 }],
    total_amount: 100,
    status: 'draft',
    valid_until: '2024-12-31',
    user_id: session.user.id,
  };
  
  try {
    const { data, error } = await supabase
      .from('quotes')
      .insert(testQuote)
      .select();
    
    if (error) {
      console.error('Quote creation failed:', error);
    } else {
      console.log('Quote created successfully:', data);
    }
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

testQuoteCreation();