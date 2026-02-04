// Test script to verify Supabase sync functionality
import { supabase } from './src/lib/supabase.js';

console.log('Testing Supabase connection...');

async function testConnection() {
  try {
    const { data, error } = await supabase
      .from('transactions')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('❌ Supabase connection failed:', error.message);
      return false;
    }
    
    console.log('✅ Supabase connection successful');
    console.log('✅ Database accessible');
    return true;
  } catch (err) {
    console.error('❌ Unexpected error:', err);
    return false;
  }
}

async function testRealtime() {
  try {
    const channel = supabase
      .channel('test-channel')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'transactions' }, 
        (payload) => {
          console.log('🔄 Realtime event received:', payload);
        }
      )
      .subscribe((status) => {
        console.log('📡 Realtime subscription status:', status);
      });
    
    console.log('✅ Realtime subscription created');
    
    // Test subscription for 5 seconds
    setTimeout(() => {
      supabase.removeChannel(channel);
      console.log('🔌 Realtime subscription closed');
    }, 5000);
    
  } catch (err) {
    console.error('❌ Realtime test failed:', err);
  }
}

async function runTests() {
  console.log('🚀 Starting Supabase sync tests...\n');
  
  const connectionOk = await testConnection();
  
  if (connectionOk) {
    await testRealtime();
  }
  
  console.log('\n✨ Tests completed');
}

runTests();