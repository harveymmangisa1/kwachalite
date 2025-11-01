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
    <div className="fixed inset-0 bg-slate-50 flex items-center justify-center z-50">
      <div className="relative z-10 text-center space-y-8 max-w-md mx-auto px-6">
        {/* Logo */}
        <div className="w-20 h-20 mx-auto">
          <img 
            src="/Assets/logo.png" 
            alt="KwachaLite Logo" 
            className="w-full h-full object-contain rounded-2xl shadow-sm"
          />
        </div>

        {/* Title */}
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold text-slate-900">{title}</h2>
          <p className="text-slate-600">{subtitle}</p>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="w-full bg-slate-200 rounded-full h-2">
            <div 
              className="bg-slate-900 h-2 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="text-xs text-slate-500">{Math.round(progress)}% complete</p>
        </div>

        {/* Steps */}
        <div className="space-y-3 text-left pt-4">
          {steps.map((step, index) => {
            const isCompleted = completedSteps.has(step.id);
            const isCurrent = index === currentStep;

            return (
              <div key={step.id} className="flex items-center gap-3">
                <div className="flex-shrink-0">
                  {isCompleted ? (
                    <CheckCircle className="w-5 h-5 text-emerald-500" />
                  ) : isCurrent ? (
                    <Loader2 className="w-5 h-5 text-slate-900 animate-spin" />
                  ) : (
                    <div className="w-5 h-5 rounded-full border-2 border-slate-300"></div>
                  )}
                </div>
                <p className={`text-sm font-medium transition-colors duration-200 ${
                  isCompleted 
                    ? 'text-emerald-600' 
                    : isCurrent 
                      ? 'text-slate-900' 
                      : 'text-slate-500'
                }`}>
                  {step.text}
                </p>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="pt-6 text-xs text-slate-500">
          <p>Preparing your personalized financial experience</p>
        </div>
      </div>
    </div>
  );
}