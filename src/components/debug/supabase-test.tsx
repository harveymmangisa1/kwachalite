import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/use-auth';

export function SupabaseTest() {
  const { user } = useAuth();
  const [testResult, setTestResult] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const testConnection = async () => {
    setIsLoading(true);
    setTestResult('Testing connection...');

    try {
      // Test 1: Basic connection
      const { error: connectionError } = await supabase
        .from('users')
        .select('id')
        .limit(1);

      if (connectionError) {
        throw new Error(`Connection test failed: ${connectionError.message}`);
      }

      setTestResult(prev => prev + '\n✅ Connection test passed');

      if (!user) {
        setTestResult(prev => prev + '\n❌ User not authenticated');
        return;
      }

      // Test 2: Check if user exists in users table
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (userError && userError.code !== 'PGRST116') {
        throw new Error(`User check failed: ${userError.message}`);
      }

      if (userData) {
        setTestResult(prev => prev + '\n✅ User found in users table');
      } else {
        setTestResult(prev => prev + '\n⚠️ User not found in users table, creating...');
        
        // Create user record
        const { error: insertError } = await (supabase as any)
          .from('users')
          .insert({
            id: user.id,
            email: user.email!,
            name: user.user_metadata?.full_name || user.user_metadata?.name || null,
          });

        if (insertError) {
          throw new Error(`User creation failed: ${insertError.message}`);
        }
        
        setTestResult(prev => prev + '\n✅ User created successfully');
      }

      // Test 3: Check user_metadata table access
      const { data: metadataData, error: metadataError } = await supabase
        .from('user_metadata')
        .select('*')
        .eq('user_id', user.id);

      if (metadataError) {
        throw new Error(`Metadata access failed: ${metadataError.message}`);
      }

      setTestResult(prev => prev + `\n✅ user_metadata table accessible, found ${metadataData.length} records`);

      // Test 4: Try to insert a test metadata record
      const testMetadata = {
        user_id: user.id,
        key: 'test_connection',
        metadata: { test: 'success', timestamp: new Date().toISOString() }
      };

      const { error: insertMetadataError } = await (supabase as any)
        .from('user_metadata')
        .upsert(testMetadata, { 
          onConflict: 'user_id,key'
        });

      if (insertMetadataError) {
        throw new Error(`Metadata insert failed: ${insertMetadataError.message}`);
      }

      setTestResult(prev => prev + '\n✅ Metadata insert test passed');

      // Test 5: Test business profile specifically
      const businessProfileData = {
        name: 'Test Business',
        email: 'test@business.com',
        phone: '123-456-7890',
        address: 'Test Address'
      };

      const { error: businessError } = await (supabase as any)
        .from('user_metadata')
        .upsert({
          user_id: user.id,
          key: 'business_profile',
          metadata: businessProfileData
        }, { 
          onConflict: 'user_id,key'
        });

      if (businessError) {
        throw new Error(`Business profile test failed: ${businessError.message}`);
      }

      setTestResult(prev => prev + '\n✅ Business profile test passed');
      setTestResult(prev => prev + '\n\n🎉 All tests passed! Database is working correctly.');

    } catch (error) {
      console.error('Test failed:', error);
      setTestResult(prev => prev + `\n❌ Test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Supabase Connection Test</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={testConnection} 
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? 'Testing...' : 'Test Database Connection'}
        </Button>
        
        {testResult && (
          <div className="p-4 bg-gray-100 rounded-md">
            <pre className="text-sm whitespace-pre-wrap">{testResult}</pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
