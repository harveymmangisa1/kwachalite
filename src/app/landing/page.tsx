'use client';

import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Wallet, 
  TrendingUp, 
  BarChart3, 
  PieChart, 
  DollarSign, 
  Target, 
  Shield, 
  Zap, 
  Users, 
  ArrowRight,
  CheckCircle,
  Star,
  Activity,
  Bell,
  Smartphone
} from 'lucide-react';
import React, { useState, useEffect } from 'react';

export default function LandingPage() {
  const [animateCards, setAnimateCards] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setAnimateCards(true), 300);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top Nav */}
      <div className="border-b bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="container mx-auto px-6 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center">
              <Wallet className="w-4 h-4 text-white" aria-hidden="true" />
            </div>
            <span className="font-semibold text-slate-900">KwachaLite</span>
          </Link>
          <div className="flex items-center gap-2">
            <Link to="/">
              <Button variant="ghost" className="h-9 text-sm px-3 sm:px-4">Sign in</Button>
            </Link>
            <Link to="/signup">
              <Button className="h-9 bg-slate-900 text-white hover:bg-slate-800 text-sm px-3 sm:px-4">Get started</Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(15,23,42,0.06),transparent_60%)]" />
        <div className="relative z-10 container mx-auto px-6 py-20 container-narrow">
          <div className="text-center space-y-12">
            {/* Logo and Title */}
            <div className="space-y-6">
              <div className="relative inline-block">
                <div className="relative w-24 h-24 bg-slate-900 rounded-3xl flex items-center justify-center shadow-sm mx-auto ui-smooth hover:scale-[1.02]">
                  <Wallet className="w-10 h-10 text-white" />
                </div>
              </div>
              
              <div className="space-y-4">
                <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-slate-900">
                  <span>
                    Welcome to
                  </span>
                  <br />
                  <span className="text-blue-600">
                    KwachaLite
                  </span>
                </h1>
                <p className="text-xl sm:text-2xl text-slate-600 max-w-4xl mx-auto leading-relaxed">
                  Your journey to financial freedom starts here. Track, analyze, and optimize your finances with beautiful, intelligent insights.
                </p>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-sm sm:max-w-none mx-auto">
              <Link to="/signup" className="w-full sm:w-auto">
                <Button size="lg" className="bg-slate-900 hover:bg-slate-800 text-white px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold rounded-xl shadow-sm h-12 sm:h-11 ui-smooth hover:-translate-y-0.5 w-full">
                  <span className="truncate">Get Started</span>
                  <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                </Button>
              </Link>
              <Link to="/" className="w-full sm:w-auto">
                <Button variant="outline" size="lg" className="px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold rounded-xl border-2 h-12 sm:h-11 border-slate-300 hover:bg-slate-100 ui-smooth w-full">
                  Sign In
                </Button>
              </Link>
            </div>

            
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              Everything you need to manage your finances
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              KwachaLite provides all the tools you need to take control of your financial life with ease and intelligence.
            </p>
          </div>

          <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 transition-all duration-1000 ${animateCards ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            {/* Smart Analytics */}
            <Card className="p-6 border border-slate-200 shadow-sm">
              <CardContent className="p-0 text-center space-y-4">
                <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto">
                  <TrendingUp className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900">Smart Analytics</h3>
                <p className="text-slate-600">
                  Get intelligent insights into your spending patterns with beautiful charts and detailed analysis.
                </p>
              </CardContent>
            </Card>

            {/* Goal Tracking */}
            <Card className="p-6 border border-slate-200 shadow-sm">
              <CardContent className="p-0 text-center space-y-4">
                <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto">
                  <Target className="w-8 h-8 text-emerald-600" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900">Goal Tracking</h3>
                <p className="text-slate-600">
                  Set financial goals and track your progress with visual indicators and milestone celebrations.
                </p>
              </CardContent>
            </Card>

            {/* Budget Management */}
            <Card className="p-6 border border-slate-200 shadow-sm">
              <CardContent className="p-0 text-center space-y-4">
                <div className="w-16 h-16 bg-purple-50 rounded-2xl flex items-center justify-center mx-auto">
                  <BarChart3 className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900">Budget Management</h3>
                <p className="text-slate-600">
                  Create intelligent budgets and get alerts when you're approaching your spending limits.
                </p>
              </CardContent>
            </Card>

            {/* Secure & Private */}
            <Card className="p-6 border border-slate-200 shadow-sm">
              <CardContent className="p-0 text-center space-y-4">
                <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto">
                  <Shield className="w-8 h-8 text-emerald-600" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900">Secure & Private</h3>
                <p className="text-slate-600">
                  Your financial data is encrypted and protected with bank-level security protocols.
                </p>
              </CardContent>
            </Card>

            {/* Quick Setup */}
            <Card className="p-6 border border-slate-200 shadow-sm">
              <CardContent className="p-0 text-center space-y-4">
                <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto">
                  <Zap className="w-8 h-8 text-amber-600" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900">Quick Setup</h3>
                <p className="text-slate-600">
                  Get started in just 2 minutes with our intuitive onboarding and setup process.
                </p>
              </CardContent>
            </Card>

            {/* Community */}
            <Card className="p-6 border border-slate-200 shadow-sm">
              <CardContent className="p-0 text-center space-y-4">
                <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto">
                  <Users className="w-8 h-8 text-slate-600" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900">Trusted Community</h3>
                <p className="text-slate-600">
                  Join thousands of users who have transformed their financial lives with KwachaLite.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Final CTA Section */}
      <div className="py-20 bg-slate-900 text-white">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to transform your finances?</h2>
          <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
            Take control of your financial future with KwachaLite's powerful tools and insights.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/signup">
              <Button size="lg" className="bg-white text-slate-900 hover:bg-slate-200 px-8 py-4 text-lg font-semibold rounded-xl shadow-sm h-11">
                Start Your Journey
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <p className="text-slate-400 text-sm">Free forever • No credit card required</p>
          </div>
        </div>
      </div>
    </div>
  );
}