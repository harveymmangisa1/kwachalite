import React from 'react';
import { Wallet, TrendingUp, Target, Flame, Zap, Trophy, Bell, Search, Menu, ChevronRight, Home, FileText, Users, Settings } from 'lucide-react';

interface MobileDashboardPreviewProps {
  isDark?: boolean;
  className?: string;
}

export function MobileDashboardPreview({ isDark = false, className = '' }: MobileDashboardPreviewProps) {
  const bgColor = isDark ? 'bg-slate-900' : 'bg-white';
  const textColor = isDark ? 'text-white' : 'text-slate-900';
  const mutedColor = isDark ? 'text-slate-400' : 'text-slate-500';
  const cardBg = isDark ? 'bg-slate-800' : 'bg-white';
  const borderColor = isDark ? 'border-slate-700' : 'border-slate-200';

  return (
    <div className={`w-full h-full ${bgColor} ${textColor} ${className} rounded-2xl overflow-hidden shadow-2xl relative`}>
      {/* Mobile Status Bar */}
      <div className={`${isDark ? 'bg-slate-900' : 'bg-white'} px-4 py-2 flex justify-between items-center text-xs border-b ${borderColor}`}>
        <span className="font-medium">9:41</span>
        <div className="flex items-center gap-1">
          <div className="w-4 h-3 border border-current rounded-sm">
            <div className="w-2 h-1.5 bg-current rounded-sm m-0.5"></div>
          </div>
          <div className="w-1 h-1 bg-current rounded-full"></div>
          <div className="w-1 h-1 bg-current rounded-full"></div>
          <div className="w-1 h-1 bg-current rounded-full"></div>
        </div>
      </div>

      {/* Mobile Header */}
      <div className={`${cardBg} border-b ${borderColor} px-4 py-3 flex items-center justify-between`}>
        <div className="flex items-center gap-3">
          <Menu className="w-5 h-5" />
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Wallet className="w-5 h-5 text-white" />
          </div>
          <span className="font-semibold">KwachaLite</span>
        </div>
        
        <div className="flex items-center gap-2">
          <button className="relative p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
        </div>
      </div>

      {/* Mobile Content */}
      <div className="p-4 space-y-4 overflow-y-auto" style={{ maxHeight: '500px' }}>
        {/* Welcome Header */}
        <div className="space-y-2">
          <h1 className="text-xl font-bold">Good morning, John!</h1>
          <p className={`text-sm ${mutedColor}`}>Here's your financial overview</p>
        </div>

        {/* Balance Card */}
        <div className={`${cardBg} border ${borderColor} rounded-xl p-4 relative overflow-hidden`}>
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-500/20 to-transparent rounded-full blur-2xl"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Net Balance</span>
              <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Wallet className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <p className="text-3xl font-bold mb-2">K 245,890</p>
            <div className="flex items-center gap-1 text-sm text-green-600">
              <TrendingUp className="w-4 h-4" />
              <span>+12.5% this month</span>
            </div>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className={`${cardBg} border ${borderColor} rounded-xl p-3`}>
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />
              </div>
              <span className="text-xs text-slate-500 dark:text-slate-400">Income</span>
            </div>
            <p className="text-lg font-bold">K 485K</p>
            <p className="text-xs text-green-600">+8.2%</p>
          </div>

          <div className={`${cardBg} border ${borderColor} rounded-xl p-3`}>
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 bg-red-100 dark:bg-red-900/30 rounded-lg">
                <TrendingUp className="w-4 h-4 text-red-600 dark:text-red-400 transform rotate-180" />
              </div>
              <span className="text-xs text-slate-500 dark:text-slate-400">Expenses</span>
            </div>
            <p className="text-lg font-bold">K 239K</p>
            <p className="text-xs text-red-600">-3.1%</p>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className={`${cardBg} border ${borderColor} rounded-xl p-4`}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">Recent Activity</h3>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </div>
          <div className="space-y-3">
            {[
              { name: 'Shoprite', category: 'Groceries', amount: -45800, time: '2h ago', icon: '🛒' },
              { name: 'Salary', category: 'Income', amount: 485000, time: 'Yesterday', icon: '💰' },
              { name: 'Uber', category: 'Transport', amount: -12500, time: 'Yesterday', icon: '🚗' },
              { name: 'Electric Bill', category: 'Utilities', amount: -38900, time: '2d ago', icon: '⚡' },
            ].map((transaction, index) => (
              <div key={index} className={`flex items-center justify-between p-2 rounded-lg ${isDark ? 'hover:bg-slate-700' : 'hover:bg-slate-50'} transition-colors`}>
                <div className="flex items-center gap-3">
                  <div className="text-xl">{transaction.icon}</div>
                  <div>
                    <p className="font-medium text-sm">{transaction.name}</p>
                    <p className={`text-xs ${mutedColor}`}>{transaction.time}</p>
                  </div>
                </div>
                <span className={`font-semibold text-sm ${transaction.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {transaction.amount > 0 ? '+' : ''}K {Math.abs(transaction.amount).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Goals Progress */}
        <div className={`${cardBg} border ${borderColor} rounded-xl p-4`}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">Monthly Goals</h3>
            <Target className="w-4 h-4 text-slate-400" />
          </div>
          <div className="space-y-3">
            {[
              { name: 'Emergency Fund', target: 500000, current: 385000, percentage: 77 },
              { name: 'Vacation', target: 200000, current: 125000, percentage: 62.5 },
              { name: 'New Laptop', target: 150000, current: 45000, percentage: 30 },
            ].map((goal, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">{goal.name}</span>
                  <span className={mutedColor}>K {goal.current.toLocaleString()}</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5">
                  <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-1.5 rounded-full transition-all duration-500" style={{ width: `${goal.percentage}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3">
          <button className="p-3 bg-blue-600 text-white rounded-xl font-medium text-sm hover:bg-blue-700 transition-colors">
            <Zap className="w-4 h-4 mb-1" />
            Quick Add
          </button>
          <button className={`p-3 ${cardBg} border ${borderColor} rounded-xl font-medium text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors`}>
            <FileText className="w-4 h-4 mb-1" />
            View Reports
          </button>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className={`${cardBg} border-t ${borderColor} px-4 py-2 flex justify-around items-center absolute bottom-0 left-0 right-0`}>
        <button className="p-2 text-blue-600">
          <Home className="w-5 h-5" />
        </button>
        <button className="p-2 text-slate-400">
          <FileText className="w-5 h-5" />
        </button>
        <button className="p-2 text-slate-400">
          <Target className="w-5 h-5" />
        </button>
        <button className="p-2 text-slate-400">
          <Users className="w-5 h-5" />
        </button>
        <button className="p-2 text-slate-400">
          <Settings className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}