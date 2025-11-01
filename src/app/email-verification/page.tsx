'use client';

import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, ArrowRight, Mail, Sparkles, Shield, Zap } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function EmailVerificationPage() {
  const [isVisible, setIsVisible] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Fade in animation
    setIsVisible(true);

    // Animated progress bar
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          return 100;
        }
        return prev + 2;
      });
    }, 20);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      
      <div className={`relative z-10 w-full max-w-2xl transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        {/* Success Icon */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center border-4 border-emerald-100">
              <CheckCircle className="w-10 h-10 text-emerald-600" />
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
          </div>
        </div>

        {/* Main Card */}
        <Card className="border border-slate-200 shadow-lg bg-white">
          <CardContent className="p-8 sm:p-12">
            <div className="text-center mb-8">
              <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-3">
                Email Verified Successfully!
              </h1>
              <p className="text-lg text-slate-600">
                Your account is now active and ready to use
              </p>
            </div>

            {/* Progress Bar */}
            <div className="mb-8">
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div 
                  className="h-full bg-emerald-500 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <p className="text-xs text-slate-500 text-center mt-2">
                {progress < 100 ? 'Setting up your account...' : 'Ready to get started!'}
              </p>
            </div>

            {/* Feature Highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              <div className="flex flex-col items-center text-center p-4 bg-slate-50 rounded-lg border border-slate-100">
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center mb-3">
                  <Shield className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="text-sm font-semibold text-slate-900 mb-1">Secure</h3>
                <p className="text-xs text-slate-600">Your data is protected</p>
              </div>

              <div className="flex flex-col items-center text-center p-4 bg-slate-50 rounded-lg border border-slate-100">
                <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center mb-3">
                  <Zap className="w-5 h-5 text-emerald-600" />
                </div>
                <h3 className="text-sm font-semibold text-slate-900 mb-1">Fast Setup</h3>
                <p className="text-xs text-slate-600">Start in seconds</p>
              </div>

              <div className="flex flex-col items-center text-center p-4 bg-slate-50 rounded-lg border border-slate-100">
                <div className="w-10 h-10 bg-violet-50 rounded-lg flex items-center justify-center mb-3">
                  <Mail className="w-5 h-5 text-violet-600" />
                </div>
                <h3 className="text-sm font-semibold text-slate-900 mb-1">Connected</h3>
                <p className="text-xs text-slate-600">Email verified</p>
              </div>
            </div>

            {/* CTA Button */}
            <div className="space-y-4">
              <Button 
                asChild
                className="w-full h-12 bg-slate-900 hover:bg-slate-800 text-white font-medium transition-colors group"
                size="lg"
              >
                <Link to="/">
                  Continue to Dashboard
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>

              <p className="text-center text-xs text-slate-500">
                You'll be redirected to your personalized dashboard
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Welcome Message */}
        <div className="mt-6 text-center">
          <p className="text-sm text-slate-600">
            Welcome to <span className="font-semibold text-slate-900">KwachaLite</span> 🎉
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Need help? <button className="text-slate-900 hover:underline">Contact Support</button>
          </p>
        </div>

        {/* Next Steps Preview */}
        <Card className="mt-6 border border-slate-200 bg-white/50 backdrop-blur-sm">
          <CardContent className="p-6">
            <h3 className="text-sm font-semibold text-slate-900 mb-4">What's Next?</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-slate-900 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-xs font-medium">1</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900">Complete your profile</p>
                  <p className="text-xs text-slate-600">Add your financial preferences</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-slate-900 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-xs font-medium">2</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900">Link your accounts</p>
                  <p className="text-xs text-slate-600">Connect banks and cards</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-slate-900 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-xs font-medium">3</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900">Set your goals</p>
                  <p className="text-xs text-slate-600">Define financial objectives</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}