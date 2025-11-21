// Test script to check localStorage persistence
console.log('Testing localStorage persistence...');

// Check if kwachalite-storage exists
const storage = localStorage.getItem('kwachalite-storage');
if (storage) {
  console.log('Found localStorage data:', storage);
  const parsed = JSON.parse(storage);
  console.log('Savings goals in localStorage:', parsed.state?.savingsGoals || 'No savings goals found');
} else {
  console.log('No localStorage data found');
}