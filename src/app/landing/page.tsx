'use client';

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Wallet, 
  TrendingUp, 
  BarChart3, 
  Target, 
  Shield, 
  Zap, 
  ArrowRight,
  CheckCircle2,
  Lock,
  Sparkles,
  Globe
} from 'lucide-react';

export default function LandingPage() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#fafafa] text-slate-900 selection:bg-blue-100">
      {/* Dynamic Nav */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white/80 backdrop-blur-md border-b py-3' : 'bg-transparent py-5'
      }`}>
        <div className="container mx-auto px-6 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200 group-hover:rotate-6 transition-transform">
              <Wallet className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight">KwachaLite</span>
          </Link>
          
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <a href="#features" className="hover:text-blue-600 transition-colors">Features</a>
            <a href="#security" className="hover:text-blue-600 transition-colors">Security</a>
            <a href="#pricing" className="hover:text-blue-600 transition-colors">Pricing</a>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/login">
              <Button variant="ghost" className="font-medium">Log in</Button>
            </Link>
            <Link to="/signup">
              <Button className="bg-slate-900 hover:bg-slate-800 text-white px-5 rounded-full shadow-xl shadow-slate-200 transition-all hover:-translate-y-0.5">
                Join Now
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section: Premium Impact */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        {/* Abstract Background Elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-100/50 rounded-full blur-[120px]" />
          <div className="absolute bottom-[10%] right-[-5%] w-[30%] h-[30%] bg-purple-100/50 rounded-full blur-[100px]" />
        </div>

        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-white border border-slate-200 px-3 py-1 rounded-full text-xs font-semibold text-slate-600 mb-6 shadow-sm">
              <span className="flex h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
              Trusted by 10,000+ users worldwide
            </div>
            
            <h1 className="text-6xl md:text-8xl font-black tracking-tight text-slate-900 mb-8 leading-[0.9]">
              Master your money <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-500">
                without the stress.
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
              KwachaLite turns complex financial data into a clear roadmap. Track spending, save for goals, and grow your wealth with AI-driven insights.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" className="h-14 px-8 bg-blue-600 hover:bg-blue-700 text-white text-lg rounded-2xl shadow-2xl shadow-blue-200 w-full sm:w-auto transition-all hover:scale-105">
                Start for free <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button variant="outline" size="lg" className="h-14 px-8 border-2 rounded-2xl text-lg w-full sm:w-auto bg-white">
                View Demo
              </Button>
            </div>

            {/* Mockup Preview */}
            <div className="mt-20 relative group">
               <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-500 rounded-[2rem] blur opacity-20 group-hover:opacity-30 transition duration-1000"></div>
               <div className="relative bg-white border border-slate-200 rounded-[2rem] p-4 shadow-2xl">
                 <div className="bg-slate-50 rounded-xl aspect-[16/9] flex items-center justify-center border border-dashed border-slate-300">
                    <span className="text-slate-400 font-medium">✨ Dashboard Preview Interface ✨</span>
                 </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Bento Grid */}
      <section id="features" className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="mb-16">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-slate-900 mb-4">Powerful tools for <br/>serious savers.</h2>
            <p className="text-slate-600 text-lg">Clean, fast, and surprisingly powerful.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Large Feature */}
            <Card className="md:col-span-2 overflow-hidden border-none bg-slate-50 shadow-none hover:shadow-xl transition-shadow duration-500">
              <CardContent className="p-10 flex flex-col justify-between h-full">
                <div className="max-w-md">
                  <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mb-6 shadow-lg shadow-blue-100">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4">Precision Analytics</h3>
                  <p className="text-slate-600 leading-relaxed">
                    Automatically categorize every transaction. See where your money goes with 
                    interactive charts that don't require a finance degree to understand.
                  </p>
                </div>
                <div className="mt-10 pt-10 border-t border-slate-200 flex gap-10">
                   <div>
                      <p className="text-2xl font-bold text-blue-600">99.9%</p>
                      <p className="text-sm text-slate-500">Accuracy</p>
                   </div>
                   <div>
                      <p className="text-2xl font-bold text-blue-600">Instant</p>
                      <p className="text-sm text-slate-500">Syncing</p>
                   </div>
                </div>
              </CardContent>
            </Card>

            {/* Small Feature 1 */}
            <Card className="border-none bg-indigo-600 text-white shadow-none">
              <CardContent className="p-10 flex flex-col justify-between h-full">
                <Target className="w-10 h-10 mb-6 opacity-80" />
                <div>
                  <h3 className="text-2xl font-bold mb-2">Smart Goals</h3>
                  <p className="text-indigo-100">Set it and forget it. We'll tell you exactly how much to save weekly to hit your target.</p>
                </div>
              </CardContent>
            </Card>

            {/* Small Feature 2 */}
            <Card className="border-none bg-slate-900 text-white shadow-none">
              <CardContent className="p-10 flex flex-col justify-between h-full">
                <Lock className="w-10 h-10 mb-6 text-blue-400" />
                <div>
                  <h3 className="text-2xl font-bold mb-2">Bank-Level Security</h3>
                  <p className="text-slate-400">256-bit encryption and multi-factor authentication keep your data yours.</p>
                </div>
              </CardContent>
            </Card>

            {/* Large Feature 2 */}
            <Card className="md:col-span-2 overflow-hidden border-none bg-slate-100 shadow-none">
              <CardContent className="p-10 flex items-center gap-8">
                 <div className="hidden sm:block w-1/3 bg-white h-48 rounded-2xl shadow-inner p-4">
                    <div className="space-y-3">
                        <div className="h-2 w-full bg-slate-100 rounded" />
                        <div className="h-2 w-2/3 bg-slate-100 rounded" />
                        <div className="h-2 w-full bg-blue-200 rounded" />
                    </div>
                 </div>
                 <div className="flex-1">
                    <Sparkles className="text-blue-600 mb-4 w-8 h-8" />
                    <h3 className="text-2xl font-bold mb-2">AI Budgeting</h3>
                    <p className="text-slate-600">Our algorithm learns your habits and suggests budgets that actually stick.</p>
                 </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Final Conversion Section */}
      <section className="py-24">
        <div className="container mx-auto px-6">
          <div className="bg-blue-600 rounded-[3rem] p-12 md:p-20 text-center relative overflow-hidden shadow-2xl shadow-blue-200">
            <div className="absolute top-0 right-0 p-10 opacity-10">
               <Globe className="w-64 h-64 text-white" />
            </div>
            
            <div className="relative z-10 max-w-2xl mx-auto">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
                Stop guessing. <br /> Start growing.
              </h2>
              <p className="text-blue-100 text-lg mb-10">
                Join thousands of users who saved an average of $450 in their first month using KwachaLite.
              </p>
              <div className="flex flex-col items-center gap-6">
                <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50 h-14 px-10 rounded-2xl text-lg font-bold">
                  Get Started for Free
                </Button>
                <div className="flex items-center gap-4 text-sm text-blue-100/80">
                  <span className="flex items-center gap-1"><CheckCircle2 className="w-4 h-4" /> No credit card</span>
                  <span className="flex items-center gap-1"><CheckCircle2 className="w-4 h-4" /> Cancel anytime</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-slate-200">
        <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6 text-slate-500 text-sm">
          <p>© 2024 KwachaLite Finance. All rights reserved.</p>
          <div className="flex gap-8">
            <a href="#" className="hover:text-slate-900 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-slate-900 transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-slate-900 transition-colors">Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
}