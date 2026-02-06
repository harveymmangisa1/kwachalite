import React from 'react';
import { Wallet, TrendingUp, Target, Flame, Zap, Trophy, Calendar, DollarSign, Eye, EyeOff, Bell, Search, Menu, ChevronRight, FileText, Users } from 'lucide-react';

interface DashboardPreviewProps {
  isDark?: boolean;
  className?: string;
}

export function DashboardPreview({ isDark = false, className = '' }: DashboardPreviewProps) {
  const bgColor = isDark ? 'bg-slate-900' : 'bg-white';
  const textColor = isDark ? 'text-white' : 'text-slate-900';
  const mutedColor = isDark ? 'text-slate-400' : 'text-slate-500';
  const cardBg = isDark ? 'bg-slate-800' : 'bg-white';
  const borderColor = isDark ? 'border-slate-700' : 'border-slate-200';

  return (
    <div className={`w-full h-full ${bgColor} ${textColor} ${className} rounded-2xl overflow-hidden shadow-2xl`}>
      {/* Top Navigation Bar */}
      <div className={`${cardBg} border-b ${borderColor} px-6 py-4 flex items-center justify-between`}>
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Wallet className="w-5 h-5 text-white" />
          </div>
          <span className="font-semibold text-lg">KwachaLite</span>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative hidden md:block">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search transactions..." 
              className={`pl-10 pr-4 py-2 rounded-lg border ${borderColor} ${isDark ? 'bg-slate-700 text-white' : 'bg-slate-50'} text-sm w-64`}
              readOnly
            />
          </div>
          
          <button className="relative p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
          
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full"></div>
            <div>
              <p className="text-sm font-medium">John Doe</p>
              <p className="text-xs text-slate-500">Premium</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6 space-y-6">
        {/* Welcome Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-1">Good morning, John!</h1>
            <p className={mutedColor}>Here's your financial overview for today</p>
          </div>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
            <Zap className="w-4 h-4" />
            Quick Action
          </button>
        </div>

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Net Balance Card */}
          <div className={`${cardBg} border ${borderColor} rounded-xl p-6 relative overflow-hidden`}>
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-500/20 to-transparent rounded-full blur-2xl"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <Wallet className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Net Balance</span>
              </div>
              <p className="text-2xl font-bold mb-2">K 245,890</p>
              <div className="flex items-center gap-1 text-sm text-green-600">
                <TrendingUp className="w-4 h-4" />
                <span>12.5%</span>
              </div>
            </div>
          </div>

          {/* Income Card */}
          <div className={`${cardBg} border ${borderColor} rounded-xl p-6 relative overflow-hidden`}>
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-green-500/20 to-transparent rounded-full blur-2xl"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Income</span>
              </div>
              <p className="text-2xl font-bold mb-2">K 485,000</p>
              <div className="flex items-center gap-1 text-sm text-green-600">
                <TrendingUp className="w-4 h-4" />
                <span>8.2%</span>
              </div>
            </div>
          </div>

          {/* Expenses Card */}
          <div className={`${cardBg} border ${borderColor} rounded-xl p-6 relative overflow-hidden`}>
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-red-500/20 to-transparent rounded-full blur-2xl"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-red-600 dark:text-red-400 transform rotate-180" />
                </div>
                <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Expenses</span>
              </div>
              <p className="text-2xl font-bold mb-2">K 239,110</p>
              <div className="flex items-center gap-1 text-sm text-red-600">
                <TrendingUp className="w-4 h-4 transform rotate-180" />
                <span>3.1%</span>
              </div>
            </div>
          </div>

          {/* Savings Rate Card */}
          <div className={`${cardBg} border ${borderColor} rounded-xl p-6 relative overflow-hidden`}>
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-purple-500/20 to-transparent rounded-full blur-2xl"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <Target className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Savings Rate</span>
              </div>
              <p className="text-2xl font-bold mb-2">24.7%</p>
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                <div className="bg-purple-600 h-2 rounded-full" style={{ width: '24.7%' }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Charts and Recent Transactions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Spending Chart */}
          <div className={`${cardBg} border ${borderColor} rounded-xl p-6`}>
            <h3 className="text-lg font-semibold mb-4">Spending Overview</h3>
            <div className="space-y-3">
              {[
                { category: 'Food & Dining', amount: 45600, percentage: 65, color: 'bg-blue-500' },
                { category: 'Transport', amount: 28300, percentage: 40, color: 'bg-green-500' },
                { category: 'Shopping', amount: 35700, percentage: 51, color: 'bg-purple-500' },
                { category: 'Utilities', amount: 18900, percentage: 27, color: 'bg-orange-500' },
              ].map((item, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>{item.category}</span>
                    <span className="font-medium">K {item.amount.toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                    <div className={`${item.color} h-2 rounded-full transition-all duration-500`} style={{ width: `${item.percentage}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="lg:col-span-2 ${cardBg} border ${borderColor} rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Recent Transactions</h3>
              <button className="text-sm text-blue-600 hover:text-blue-700">View All</button>
            </div>
            <div className="space-y-3">
              {[
                { name: 'Shoprite', category: 'Groceries', amount: -45800, time: '2 hours ago', icon: '🛒', color: 'text-green-600' },
                { name: 'Salary', category: 'Income', amount: 485000, time: 'Yesterday', icon: '💰', color: 'text-green-600' },
                { name: 'Uber', category: 'Transport', amount: -12500, time: 'Yesterday', icon: '🚗', color: 'text-red-600' },
                { name: 'Electric Bill', category: 'Utilities', amount: -38900, time: '2 days ago', icon: '⚡', color: 'text-red-600' },
                { name: 'Freelance Project', category: 'Income', amount: 125000, time: '3 days ago', icon: '💼', color: 'text-green-600' },
              ].map((transaction, index) => (
                <div key={index} className={`flex items-center justify-between p-3 rounded-lg ${isDark ? 'hover:bg-slate-700' : 'hover:bg-slate-50'} transition-colors`}>
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">{transaction.icon}</div>
                    <div>
                      <p className="font-medium">{transaction.name}</p>
                      <p className={`text-sm ${mutedColor}`}>{transaction.category} • {transaction.time}</p>
                    </div>
                  </div>
                  <span className={`font-semibold ${transaction.color}`}>
                    {transaction.amount > 0 ? '+' : ''}K {Math.abs(transaction.amount).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className={`${cardBg} border ${borderColor} rounded-xl p-4 flex items-center gap-3`}>
            <div className="p-2 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg">
              <Flame className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Budget Streak</p>
              <p className="font-semibold">15 days 🔥</p>
            </div>
          </div>
          
          <div className={`${cardBg} border ${borderColor} rounded-xl p-4 flex items-center gap-3`}>
            <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg">
              <Trophy className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Goals Completed</p>
              <p className="font-semibold">8 / 10 this month</p>
            </div>
          </div>
          
          <div className={`${cardBg} border ${borderColor} rounded-xl p-4 flex items-center gap-3`}>
            <div className="p-2 bg-gradient-to-br from-green-500 to-teal-500 rounded-lg">
              <Target className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Monthly Target</p>
              <p className="font-semibold">76% achieved</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}