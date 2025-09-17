'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingScreen } from '@/components/ui/loading-screen';
import { 
  Plus, 
  TrendingUp, 
  Target, 
  BarChart3,
  DollarSign,
  Receipt,
  CreditCard,
  PiggyBank,
  ArrowRight,
  CheckCircle,
  X,
  Mail,
  HelpCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import React, { useState, useEffect } from 'react';

interface GettingStartedProps {
  onSkip?: () => void;
  onComplete?: () => void;
}

export function GettingStarted({ onSkip, onComplete }: GettingStartedProps = {}) {
  const [currentStep, setCurrentStep] = useState(0);
  const [showLoading, setShowLoading] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  const steps = [
    {
      icon: DollarSign,
      title: "Add Your First Transaction",
      description: "Start by recording your first income or expense transaction",
      action: "Add Transaction",
      link: "/dashboard/transactions",
      color: "from-blue-500 to-indigo-600"
    },
    {
      icon: Target,
      title: "Set Financial Goals", 
      description: "Create savings goals to track your progress",
      action: "Create Goal",
      link: "/dashboard/goals",
      color: "from-emerald-500 to-teal-600"
    },
    {
      icon: BarChart3,
      title: "Create Your First Budget",
      description: "Plan your spending with smart budget categories",
      action: "Set Budget",
      link: "/dashboard/budgets", 
      color: "from-purple-500 to-pink-600"
    },
    {
      icon: Receipt,
      title: "Track Bills & Expenses",
      description: "Never miss a payment with bill reminders",
      action: "Add Bills",
      link: "/dashboard/bills",
      color: "from-orange-500 to-red-600"
    }
  ];

  useEffect(() => {
    if (isCompleted) return;
    
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % steps.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [steps.length, isCompleted]);

  const handleSkip = () => {
    setShowLoading(true);
  };

  const handleComplete = () => {
    setIsCompleted(true);
    setShowLoading(true);
  };

  const handleLoadingComplete = () => {
    onSkip?.() || onComplete?.();
  };

  const handleEmailSupport = () => {
    const subject = encodeURIComponent('KwachaLite - Help & Suggestions');
    const body = encodeURIComponent('Hi,\n\nI need help with KwachaLite or have suggestions for improvement.\n\nDetails:\n\n\nThanks!');
    window.open(`mailto:harveymmangisa@gmail.com?subject=${subject}&body=${body}`);
  };

  if (showLoading) {
    const loadingSteps = isCompleted ? [
      { id: 'save', text: 'Saving your preferences...', duration: 1000 },
      { id: 'prepare', text: 'Preparing your dashboard...', duration: 1500 },
      { id: 'optimize', text: 'Optimizing your experience...', duration: 1000 },
      { id: 'ready', text: 'You\'re all set!', duration: 500 }
    ] : [
      { id: 'skip', text: 'No worries, we\'ll get you started...', duration: 1500 },
      { id: 'prepare', text: 'Setting up your dashboard...', duration: 1000 },
      { id: 'ready', text: 'Ready to explore!', duration: 500 }
    ];

    return (
      <LoadingScreen 
        onComplete={handleLoadingComplete}
        steps={loadingSteps}
        title={isCompleted ? "Welcome aboard!" : "Let's get started!"}
        subtitle={isCompleted ? "Thanks for completing the setup" : "You can always come back to this later"}
      />
    );
  }

  return (
    <div className="space-y-8 relative">
      {/* Skip/Complete Bar */}
      <div className="flex justify-between items-center mb-6">
        <Button 
          variant="ghost" 
          onClick={handleSkip}
          className="text-slate-600 hover:text-slate-800 gap-2"
        >
          <X className="w-4 h-4" />
          Skip for now
        </Button>
        <Button 
          onClick={handleComplete}
          className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white gap-2"
        >
          <CheckCircle className="w-4 h-4" />
          Mark as Complete
        </Button>
      </div>
      {/* Welcome Header */}
      <div className="text-center space-y-4">
        <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto shadow-lg">
          <PiggyBank className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-slate-900">Welcome to KwachaLite!</h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          You're ready to take control of your finances. Let's get you started with these quick actions.
        </p>
      </div>

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isActive = index === currentStep;
          
          return (
            <Link to={step.link} key={index}>
              <Card className={`h-full hover:shadow-lg transition-all duration-300 cursor-pointer transform hover:scale-[1.02] ${
                isActive ? 'ring-2 ring-blue-500 ring-opacity-50 shadow-lg' : ''
              }`}>
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 bg-gradient-to-br ${step.color} rounded-xl flex items-center justify-center flex-shrink-0 ${
                      isActive ? 'animate-pulse' : ''
                    }`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-lg font-semibold text-slate-900">
                        {step.title}
                      </CardTitle>
                    </div>
                    <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-slate-600 transition-colors" />
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-slate-600 mb-4">{step.description}</p>
                  <Button 
                    variant="outline" 
                    className="w-full justify-center gap-2 hover:bg-slate-50"
                    onClick={(e) => {
                      e.preventDefault();
                      window.location.href = step.link;
                    }}
                  >
                    {step.action}
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Progress Indicators */}
      <div className="flex justify-center gap-2">
        {steps.map((_, index) => (
          <div
            key={index}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              index === currentStep ? 'bg-blue-500 w-8' : 'bg-slate-300'
            }`}
          />
        ))}
      </div>

      {/* Alternative Actions */}
      <Card className="bg-gradient-to-br from-slate-50 to-blue-50/50 border-slate-200">
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <h3 className="text-lg font-semibold text-slate-900">Need help getting started?</h3>
            <p className="text-slate-600">
              Our help center has guides and tutorials to help you make the most of KwachaLite.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/dashboard/help">
                <Button variant="outline" className="gap-2">
                  <CheckCircle className="w-4 h-4" />
                  View Help Center
                </Button>
              </Link>
              <Link to="/dashboard/analytics">
                <Button variant="outline" className="gap-2">
                  <TrendingUp className="w-4 h-4" />
                  See Demo Data
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex gap-4">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
            <CheckCircle className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h4 className="font-semibold text-blue-900 mb-2">💡 Pro Tip</h4>
            <p className="text-blue-800 text-sm">
              Start with adding a few transactions to see your spending patterns. 
              You can import data from bank statements later to get a complete picture.
            </p>
          </div>
        </div>
      </div>

      {/* Contact Support */}
      <Card className="bg-gradient-to-r from-emerald-50 to-blue-50 border-emerald-200">
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-3">
              <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                <HelpCircle className="w-5 h-5 text-emerald-600" />
              </div>
              <h3 className="text-lg font-semibold text-emerald-900">Need Help?</h3>
            </div>
            <p className="text-emerald-800 text-sm max-w-md mx-auto">
              Have questions or suggestions? We'd love to hear from you!
            </p>
            <Button 
              onClick={handleEmailSupport}
              variant="outline" 
              className="gap-2 border-emerald-300 text-emerald-700 hover:bg-emerald-100"
            >
              <Mail className="w-4 h-4" />
              Email Support (harveymmangisa@gmail.com)
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}