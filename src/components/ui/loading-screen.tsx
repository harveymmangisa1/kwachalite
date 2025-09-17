'use client';

import React, { useState, useEffect } from 'react';
import { CheckCircle, Loader2 } from 'lucide-react';

interface LoadingStep {
  id: string;
  text: string;
  duration: number;
}

interface LoadingScreenProps {
  onComplete: () => void;
  steps?: LoadingStep[];
  title?: string;
  subtitle?: string;
}

const defaultSteps: LoadingStep[] = [
  { id: 'data', text: 'Getting your financial data ready...', duration: 2000 },
  { id: 'analyze', text: 'Analyzing your spending patterns...', duration: 1500 },
  { id: 'optimize', text: 'Optimizing your dashboard...', duration: 1000 },
  { id: 'complete', text: 'Welcome to KwachaLite!', duration: 800 }
];

export function LoadingScreen({ 
  onComplete, 
  steps = defaultSteps, 
  title = "Setting up your financial dashboard",
  subtitle = "We're preparing everything for you"
}: LoadingScreenProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (currentStep >= steps.length) {
      // Wait a bit before calling onComplete
      const timer = setTimeout(onComplete, 500);
      return () => clearTimeout(timer);
    }

    const step = steps[currentStep];
    const timer = setTimeout(() => {
      setCompletedSteps(prev => new Set([...prev, step.id]));
      setCurrentStep(prev => prev + 1);
    }, step.duration);

    return () => clearTimeout(timer);
  }, [currentStep, steps, onComplete]);

  const progress = ((currentStep) / steps.length) * 100;

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-100/40 flex items-center justify-center z-50">
      {/* Background Animation */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-32 h-32 bg-blue-400/10 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute top-60 right-32 w-24 h-24 bg-purple-400/10 rounded-full blur-xl animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute bottom-40 left-40 w-40 h-40 bg-emerald-400/10 rounded-full blur-xl animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>

      <div className="relative z-10 text-center space-y-8 max-w-md mx-auto px-6">
        {/* Logo */}
        <div className="relative">
          <div className="w-24 h-24 mx-auto relative">
            <img 
              src="/Assets/logo.png" 
              alt="KwachaLite Logo" 
              className="w-full h-full object-contain rounded-2xl shadow-lg"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-600/20 rounded-2xl animate-pulse"></div>
          </div>
          {/* Floating elements around logo */}
          <div className="absolute -top-2 -right-2 w-4 h-4 bg-emerald-500 rounded-full animate-bounce" style={{animationDelay: '0.5s'}}></div>
          <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '1s'}}></div>
        </div>

        {/* Title */}
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-slate-900">{title}</h2>
          <p className="text-slate-600">{subtitle}</p>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="w-full bg-slate-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="text-sm text-slate-500">{Math.round(progress)}% complete</p>
        </div>

        {/* Steps */}
        <div className="space-y-3 text-left">
          {steps.map((step, index) => {
            const isCompleted = completedSteps.has(step.id);
            const isCurrent = index === currentStep && !isCompleted;
            const isPending = index > currentStep;

            return (
              <div key={step.id} className="flex items-center gap-3">
                <div className="flex-shrink-0">
                  {isCompleted ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : isCurrent ? (
                    <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
                  ) : (
                    <div className="w-5 h-5 rounded-full border-2 border-slate-300"></div>
                  )}
                </div>
                <p className={`text-sm transition-colors duration-200 ${
                  isCompleted 
                    ? 'text-green-700 font-medium' 
                    : isCurrent 
                      ? 'text-blue-700 font-medium' 
                      : 'text-slate-500'
                }`}>
                  {step.text}
                </p>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="pt-4 text-xs text-slate-500">
          <p>Preparing your personalized financial experience</p>
        </div>
      </div>
    </div>
  );
}