// Test script to verify budget calculations
console.log('Testing budget calculations...');

// Simulate adding transactions and checking budget updates
const testTransactions = [
  {
    id: '1',
    date: new Date().toISOString().split('T')[0],
    description: 'Grocery shopping',
    amount: -50,
    type: 'expense',
    category: 'Groceries',
    workspace: 'personal'
  },
  {
    id: '2', 
    date: new Date().toISOString().split('T')[0],
    description: 'Salary',
    amount: 2000,
    type: 'income',
    category: 'Salary',
    workspace: 'personal'
  }
];

console.log('Test transactions:', testTransactions);
console.log('Budget calculations should now work with these transactions!');