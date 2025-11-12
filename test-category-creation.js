// Test script to check budget category creation
import { supabase } from './src/lib/supabase.js';

async function testCategoryCreation() {
  console.log('Testing budget category creation...');
  
  // Test with a mock user session (you'll need to be logged in)
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  
  if (sessionError || !session) {
    console.error('No active session. Please log in first.');
    return;
  }
  
  console.log('User session found:', session.user.email);
  
  // Test category data
  const testCategory = {
    id: 'test-category-' + Date.now(),
    name: 'Test Budget Category',
    icon: 'folder',
    color: '#0066cc',
    type: 'expense',
    workspace: 'personal',
    budget: 500.00,
    budget_frequency: 'monthly',
    user_id: session.user.id,
  };
  
  try {
    const { data, error } = await supabase
      .from('categories')
      .insert(testCategory)
      .select();
    
    if (error) {
      console.error('Category creation failed:', error);
    } else {
      console.log('Category created successfully:', data);
      
      // Test updating the category
      const updateData = {
        budget: 750.00,
        budget_frequency: 'weekly'
      };
      
      const { data: updatedData, error: updateError } = await supabase
        .from('categories')
        .update(updateData)
        .eq('id', testCategory.id)
        .select();
      
      if (updateError) {
        console.error('Category update failed:', updateError);
      } else {
        console.log('Category updated successfully:', updatedData);
      }
      
      // Test deleting the category
      const { error: deleteError } = await supabase
        .from('categories')
        .delete()
        .eq('id', testCategory.id);
      
      if (deleteError) {
        console.error('Category deletion failed:', deleteError);
      } else {
        console.log('Category deleted successfully');
      }
    }
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

testCategoryCreation();