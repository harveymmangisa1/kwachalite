'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './button';

interface Step {
  id: number;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

interface ProgressiveFormProps {
  steps: Step[];
  currentStep: number;
  onStepChange: (step: number) => void;
  canProceed: boolean;
  isSubmitting?: boolean;
  onSubmit?: () => void;
  submitText?: string;
  children: React.ReactNode;
  className?: string;
}

export function ProgressiveForm({
  steps,
  currentStep,
  onStepChange,
  canProceed,
  isSubmitting = false,
  onSubmit,
  submitText = 'Submit',
  children,
  className
}: ProgressiveFormProps) {
  const nextStep = () => {
    if (currentStep < steps.length) {
      onStepChange(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      onStepChange(currentStep - 1);
    }
  };

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Progress Steps */}
      <div className="px-4 sm:px-6 py-3 bg-muted/50 border-b border-border">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <React.Fragment key={step.id}>
              <div className="flex flex-col items-center flex-1">
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300",
                    currentStep > step.id
                      ? "bg-emerald-500 border-emerald-500 text-white"
                      : currentStep === step.id
                      ? "bg-primary border-primary text-primary-foreground"
                      : "bg-background border-border text-muted-foreground"
                  )}
                >
                  {currentStep > step.id ? (
                    <Check className="w-3 h-3" />
                  ) : (
                    <step.icon className="w-3 h-3" />
                  )}
                </div>
                <div className="mt-1 text-center hidden sm:block">
                  <p className={cn(
                    "text-xs font-medium",
                    currentStep >= step.id ? "text-foreground" : "text-muted-foreground"
                  )}>
                    {step.name}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">{step.description}</p>
                </div>
                {currentStep === step.id && (
                  <p className="text-xs font-medium text-foreground mt-1 sm:hidden">
                    {step.name}
                  </p>
                )}
              </div>
              {index < steps.length - 1 && (
                <div className={cn(
                  "h-0.5 flex-1 mx-2 transition-all duration-300",
                  currentStep > step.id ? "bg-emerald-500" : "bg-muted"
                )} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Form Content */}
      <div className="flex-1 overflow-hidden">
        {children}
      </div>

      {/* Navigation Footer */}
      <div className="px-4 sm:px-6 py-2 sm:py-3 border-t border-border bg-background">
        <div className="flex items-center justify-between gap-2 sm:gap-3">
          <div className="flex gap-2">
            {currentStep > 1 && (
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
                className="gap-1 h-9 sm:h-8 text-xs sm:text-sm"
                disabled={isSubmitting}
              >
                <ChevronLeft className="h-3 w-3" />
                <span className="hidden sm:inline">Back</span>
              </Button>
            )}
            <Button
              type="button"
              variant="ghost"
              onClick={() => {}}
              disabled={isSubmitting}
              className="text-muted-foreground h-9 sm:h-8 text-xs sm:text-sm"
            >
              Cancel
            </Button>
          </div>
          
          <div className="flex gap-2">
            {currentStep < steps.length ? (
              <Button
                type="button"
                onClick={nextStep}
                disabled={!canProceed || isSubmitting}
                className="gap-1 bg-primary hover:bg-primary/90 h-9 sm:h-8 text-xs sm:text-sm"
              >
                <span className="hidden sm:inline">Continue</span>
                <span className="sm:hidden">Next</span>
                <ChevronRight className="h-3 w-3" />
              </Button>
            ) : (
              <Button 
                type="submit"
                onClick={onSubmit}
                disabled={!canProceed || isSubmitting}
                className="gap-1 bg-emerald-600 hover:bg-emerald-700 h-9 sm:h-8 text-xs sm:text-sm"
              >
                <Check className="h-3 w-3" />
                {isSubmitting ? 'Submitting...' : submitText}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

interface StepContentProps {
  step: number;
  currentStep: number;
  children: React.ReactNode;
  className?: string;
}

export function StepContent({ step, currentStep, children, className }: StepContentProps) {
  if (step !== currentStep) return null;

  return (
    <div className={cn(
      "space-y-6 animate-in fade-in slide-in-from-right-5 duration-300",
      className
    )}>
      {children}
    </div>
  );
}