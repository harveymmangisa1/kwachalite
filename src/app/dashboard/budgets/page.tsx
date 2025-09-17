import React, { useState, useMemo } from 'react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar 
} from 'recharts';
import { 
  TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Target, 
  Plus, Settings, Bell, Calendar, DollarSign, CreditCard, Home, 
  Car, Utensils, ShoppingBag, Heart, Gamepad2, Book, Plane, 
  Coffee, Phone, Wifi, Shirt, Gift, Wallet, Users, PiggyBank
} from 'lucide-react';
import { useAppStore } from '@/lib/data';
import { useActiveWorkspace } from '@/hooks/use-active-workspace';
import { formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BudgetAdjustModal } from '@/components/budgets/budget-adjust-modal';

const BudgetDashboard = () => {
  const { activeWorkspace } = useActiveWorkspace();
  const { transactions, categories } = useAppStore();
  
  const [notifications, setNotifications] = useState([
    { id: 1, message: "You're 13% over budget in Food & Dining", type: 'warning', time: '2 hours ago' },
    { id: 2, message: "Great job staying under budget in Entertainment!", type: 'success', time: '1 day ago' },
    { id: 3, message: "Monthly budget summary is ready", type: 'info', time: '2 days ago' }
  ]);

  const [showNotifications, setShowNotifications] = useState(false);
  const [selectedTimeframe, setSelectedTimeframe] = useState('month');

  // State for the budget adjustment modal
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Filter data for active workspace
  const workspaceTransactions = useMemo(() => 
    transactions.filter(t => t.workspace === activeWorkspace), 
    [transactions, activeWorkspace]
  );
  
  const workspaceCategories = useMemo(() => 
    categories.filter(c => c.workspace === activeWorkspace), 
    [categories, activeWorkspace]
  );

  // Calculate budget data
  const budgetData = useMemo(() => {
    // Group transactions by category
    const categoryTransactions: Record<string, any[]> = {};
    workspaceTransactions.forEach(transaction => {
      if (!categoryTransactions[transaction.category]) {
        categoryTransactions[transaction.category] = [];
      }
      categoryTransactions[transaction.category].push(transaction);
    });

    // Create budget data for each category with a budget
    return workspaceCategories
      .filter(category => category.budget && category.type === 'expense')
      .map(category => {
        const categorySpent = categoryTransactions[category.id]?.reduce((sum, t) => sum + t.amount, 0) || 0;
        
        // Get appropriate icon
        const iconMap: Record<string, string> = {
          'housing': '🏠',
          'transport': '🚗',
          'groceries': '🛍️',
          'food': '🍽️',
          'health': '❤️',
          'entertainment': '🎮',
          'education': '📚',
          'gifts': '🎁',
          'office_supplies': '💼',
          'software': '💻',
          'marketing': '📈',
          'travel': '✈️',
          'client_expenses': '👥',
          'shipping': '🚚'
        };
        
        return {
          id: category.id,
          name: category.name,
          icon: iconMap[category.id] || '📊',
          budgetAmount: category.budget || 0,
          spentAmount: categorySpent,
          color: category.color,
          transactions: categoryTransactions[category.id] || [],
          categoryData: category // Store the original category data
        };
      });
  }, [workspaceTransactions, workspaceCategories]);

  // Calculate totals
  const totalBudget = useMemo(() => 
    budgetData.reduce((sum, category) => sum + category.budgetAmount, 0), 
    [budgetData]
  );
  
  const totalSpent = useMemo(() => 
    budgetData.reduce((sum, category) => sum + category.spentAmount, 0), 
    [budgetData]
  );
  
  const totalRemaining = totalBudget - totalSpent;
  const budgetHealthScore = totalBudget > 0 ? Math.max(0, Math.min(100, ((totalBudget - totalSpent) / totalBudget) * 100)) : 0;

  // Trend data for charts (using last 5 months)
  const trendData = useMemo(() => {
    // In a real app, this would be calculated from historical data
    // For now, we'll simulate with the current data
    return [
      { month: 'May', spent: totalSpent * 0.8, budget: totalBudget },
      { month: 'Jun', spent: totalSpent * 0.9, budget: totalBudget },
      { month: 'Jul', spent: totalSpent * 0.85, budget: totalBudget },
      { month: 'Aug', spent: totalSpent * 0.95, budget: totalBudget },
      { month: 'Sep', spent: totalSpent, budget: totalBudget }
    ];
  }, [totalSpent, totalBudget]);

  // Get budget status and color
  const getBudgetStatus = (spent: number, budget: number) => {
    const percentage = budget > 0 ? (spent / budget) * 100 : 0;
    if (percentage >= 100) return { status: 'Over Budget', color: '#EF4444', textColor: 'text-red-600' };
    if (percentage >= 90) return { status: 'Near Limit', color: '#F59E0B', textColor: 'text-yellow-600' };
    if (percentage >= 75) return { status: 'On Track', color: '#F59E0B', textColor: 'text-yellow-600' };
    return { status: 'Under Budget', color: '#10B981', textColor: 'text-green-600' };
  };

  // Progress circle component
  const ProgressCircle = ({ percentage, size = 60, strokeWidth = 4, color = '#10B981' }: { percentage: number, size?: number, strokeWidth?: number, color?: string }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const strokeDasharray = `${circumference} ${circumference}`;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          className="transform -rotate-90"
          width={size}
          height={size}
        >
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#E5E7EB"
            strokeWidth={strokeWidth}
            fill="none"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-500"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-semibold" style={{ color }}>
            {Math.round(percentage)}%
          </span>
        </div>
      </div>
    );
  };

  // Budget health component
  const BudgetHealthScore = () => {
    const getHealthColor = (score: number) => {
      if (score >= 70) return '#10B981';
      if (score >= 40) return '#F59E0B';
      return '#EF4444';
    };

    const getHealthText = (score: number) => {
      if (score >= 70) return 'Excellent';
      if (score >= 40) return 'Good';
      return 'Needs Attention';
    };

    return (
      <div className="bg-white rounded-2xl p-6 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Budget Health</h3>
          <Target className="w-5 h-5 text-gray-400" />
        </div>
        <div className="flex items-center space-x-4">
          <ProgressCircle 
            percentage={budgetHealthScore} 
            size={80} 
            color={getHealthColor(budgetHealthScore)} 
          />
          <div>
            <div className="text-2xl font-bold" style={{ color: getHealthColor(budgetHealthScore) }}>
              {Math.round(budgetHealthScore)}%
            </div>
            <div className="text-sm text-gray-600">{getHealthText(budgetHealthScore)}</div>
          </div>
        </div>
      </div>
    );
  };

  // Function to handle viewing details
  const handleViewDetails = (category: any) => {
    setSelectedCategory(category.categoryData);
    setIsModalOpen(true);
  };

  // Function to handle adjusting budget
  const handleAdjustBudget = (category: any) => {
    setSelectedCategory(category.categoryData);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Budget Dashboard</h1>
            <p className="text-gray-600">Track, analyze, and optimize your spending</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 bg-white rounded-full shadow-md hover:shadow-lg transition-shadow"
              >
                <Bell className="w-5 h-5 text-gray-600" />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {notifications.length}
                </span>
              </button>
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border z-50">
                  <div className="p-4 border-b">
                    <h3 className="font-semibold text-gray-800">Notifications</h3>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {notifications.map((notif) => (
                      <div key={notif.id} className="p-4 border-b hover:bg-gray-50">
                        <div className="flex items-start space-x-3">
                          <div className={`w-2 h-2 rounded-full mt-2 ${
                            notif.type === 'warning' ? 'bg-yellow-500' :
                            notif.type === 'success' ? 'bg-green-500' : 'bg-blue-500'
                          }`} />
                          <div>
                            <p className="text-sm text-gray-800">{notif.message}</p>
                            <p className="text-xs text-gray-500 mt-1">{notif.time}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <select
              value={selectedTimeframe}
              onChange={(e) => setSelectedTimeframe(e.target.value)}
              className="px-4 py-2 bg-white rounded-lg shadow-md border focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
              <option value="year">This Year</option>
            </select>
          </div>
        </div>

        {/* Hero Section - Budget Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Total Budget Overview */}
          <div className="lg:col-span-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">Monthly Budget Overview</h2>
                <p className="text-blue-100">Track your financial progress</p>
              </div>
              <DollarSign className="w-8 h-8 text-blue-200" />
            </div>
            
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                <div className="text-blue-100 text-sm mb-1">Total Budget</div>
                <div className="text-2xl font-bold">{formatCurrency(totalBudget)}</div>
              </div>
              <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                <div className="text-blue-100 text-sm mb-1">Total Spent</div>
                <div className="text-2xl font-bold">{formatCurrency(totalSpent)}</div>
              </div>
              <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                <div className="text-blue-100 text-sm mb-1">Remaining</div>
                <div className={`text-2xl font-bold ${totalRemaining >= 0 ? 'text-green-300' : 'text-red-300'}`}>
                  {formatCurrency(Math.abs(totalRemaining))}
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
              <div className="flex justify-between text-sm text-blue-100 mb-2">
                <span>Budget Progress</span>
                <span>{totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0}%</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-3">
                <div
                  className={`h-3 rounded-full transition-all duration-500 ${
                    totalBudget > 0 && (totalSpent / totalBudget) > 1 ? 'bg-red-400' : 
                    totalBudget > 0 && (totalSpent / totalBudget) > 0.9 ? 'bg-yellow-400' : 'bg-green-400'
                  }`}
                  style={{ width: `${totalBudget > 0 ? Math.min(100, (totalSpent / totalBudget) * 100) : 0}%` }}
                />
              </div>
            </div>
          </div>

          {/* Budget Health Score */}
          <BudgetHealthScore />
        </div>

        {/* Analytics Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Spending Trend */}
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Spending Trends</h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" stroke="#666" />
                <YAxis stroke="#666" />
                <Tooltip 
                  formatter={(value) => [formatCurrency(Number(value)), 'Amount']}
                  labelStyle={{ color: '#333' }}
                />
                <Line type="monotone" dataKey="budget" stroke="#E5E7EB" strokeDasharray="5 5" strokeWidth={2} />
                <Line type="monotone" dataKey="spent" stroke="#3B82F6" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Category Distribution */}
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Spending Distribution</h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={budgetData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="spentAmount"
                  nameKey="name"
                >
                  {budgetData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [formatCurrency(Number(value)), 'Spent']} />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-2 mt-4">
              {budgetData.map((category) => (
                <div key={category.id} className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: category.color }} />
                  <span className="text-xs text-gray-600 truncate">{category.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Category Management */}
        <div className="bg-white rounded-2xl p-6 shadow-lg mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-800">Budget Categories</h3>
            <Button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <Plus className="w-4 h-4" />
              <span>Add Category</span>
            </Button>
          </div>

          {/* Category Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {budgetData.map((category, index) => {
              const percentage = category.budgetAmount > 0 ? (category.spentAmount / category.budgetAmount) * 100 : 0;
              const status = getBudgetStatus(category.spentAmount, category.budgetAmount);

              return (
                <div
                  key={category.id}
                  className="bg-gray-50 rounded-xl p-4 transition-all duration-200 hover:shadow-md"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{category.icon}</span>
                      <div>
                        <h4 className="font-semibold text-gray-800">{category.name}</h4>
                        <span className={`text-xs font-medium ${status.textColor}`}>
                          {status.status}
                        </span>
                      </div>
                    </div>
                    <ProgressCircle 
                      percentage={Math.min(100, percentage)} 
                      size={50} 
                      color={status.color} 
                    />
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Spent</span>
                      <span className="font-semibold">{formatCurrency(category.spentAmount)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Budget</span>
                      <span className="font-semibold">{formatCurrency(category.budgetAmount)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Remaining</span>
                      <span className={`font-semibold ${
                        category.budgetAmount - category.spentAmount >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {formatCurrency(Math.abs(category.budgetAmount - category.spentAmount))}
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                    <div
                      className="h-2 rounded-full transition-all duration-500"
                      style={{ 
                        width: `${Math.min(100, percentage)}%`,
                        backgroundColor: status.color
                      }}
                    />
                  </div>

                  {/* Quick Actions */}
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      className="flex-1 text-xs px-3 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
                      onClick={() => handleViewDetails(category)}
                    >
                      View Details
                    </Button>
                    <Button 
                      variant="outline" 
                      className="flex-1 text-xs px-3 py-1 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                      onClick={() => handleAdjustBudget(category)}
                    >
                      Adjust Budget
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* AI Insights & Recommendations */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Smart Recommendations */}
          <Card className="bg-white rounded-2xl shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
                Smart Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <div className="flex items-start space-x-3">
                    <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-yellow-800">Food Spending Alert</h4>
                      <p className="text-sm text-yellow-700 mt-1">
                        You're 13% over budget in Food & Dining. Consider meal planning to reduce costs.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-green-800">Great Job on Entertainment</h4>
                      <p className="text-sm text-green-700 mt-1">
                        You're 40% under budget in Entertainment. Consider reallocating some funds to other categories.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Seasonal Spending */}
          <Card className="bg-white rounded-2xl shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-purple-600" />
                Seasonal Spending
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-start space-x-3">
                  <div className="w-5 h-5 text-blue-600 mt-0.5">🎄</div>
                  <div>
                    <h4 className="font-medium text-blue-800">Holiday Season Approaching</h4>
                    <p className="text-sm text-blue-700 mt-1">
                      Consider setting aside $300-500 for holiday gifts and celebrations in the next 2 months.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Budget Adjustment Modal */}
      {selectedCategory && (
        <BudgetAdjustModal
          category={selectedCategory}
          open={isModalOpen}
          onOpenChange={setIsModalOpen}
          transactions={workspaceTransactions}
        />
      )}
    </div>
  );
};

export default BudgetDashboard;