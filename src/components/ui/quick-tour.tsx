'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X, ArrowRight, ArrowLeft, Check, Sparkles, BarChart3, Users, Target, Receipt, FileText, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TourStep {
  id: string;
  title: string;
  description: string;
  target: string; // CSS selector for the target element
  icon: React.ReactNode;
  action?: string; // Optional action text
  position: 'top' | 'bottom' | 'left' | 'right' | 'center';
  highlightPadding?: number;
}

interface QuickTourProps {
  isOpen: boolean;
  onComplete: () => void;
  onSkip: () => void;
  isFirstTime?: boolean;
}

const tourSteps: TourStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to Kwachalite! 🎉',
    description: 'Let\'s take a quick tour of most important features to help you get started with your business management platform.',
    target: 'body',
    icon: <Sparkles className="h-6 w-6" />,
    position: 'center',
    action: 'Get Started'
  },
  {
    id: 'dashboard',
    title: 'Business Dashboard',
    description: 'Your main hub shows key business metrics at a glance - revenue, expenses, profit margins, and recent activities.',
    target: '[data-tour="dashboard"]',
    icon: <BarChart3 className="h-6 w-6" />,
    position: 'bottom',
    action: 'Next Feature'
  },
  {
    id: 'navigation',
    title: 'Smart Navigation',
    description: 'Access all your business tools from sidebar. Invoices, quotes, clients, products, CRM, and more - everything organized for efficiency.',
    target: '[data-tour="sidebar"]',
    icon: <Settings className="h-6 w-6" />,
    position: 'right',
    action: 'Continue Tour'
  },
  {
    id: 'crm',
    title: 'CRM & Client Management',
    description: 'Manage your customer relationships effectively. Track client interactions, communication logs, and build stronger business relationships.',
    target: '[data-tour="crm"]',
    icon: <Users className="h-6 w-6" />,
    position: 'left',
    action: 'Explore CRM'
  },
  {
    id: 'savings',
    title: 'Group Savings',
    description: 'Create and manage group savings goals. Perfect for team projects, employee funds, or collaborative financial goals.',
    target: '[data-tour="savings"]',
    icon: <Users className="h-6 w-6" />,
    position: 'left',
    action: 'Learn More'
  },
  {
    id: 'contributions',
    title: 'Smart Contributions',
    description: 'Members can contribute with proof of payment. Admins review and verify contributions to ensure transparency and trust.',
    target: '[data-tour="contributions"]',
    icon: <Target className="h-6 w-6" />,
    position: 'top',
    action: 'Next'
  },
  {
    id: 'invoices',
    title: 'Professional Invoicing',
    description: 'Create and send professional invoices in seconds. Track payments, manage due dates, and improve cash flow.',
    target: '[data-tour="invoices"]',
    icon: <FileText className="h-6 w-6" />,
    position: 'left',
    action: 'Continue'
  },
  {
    id: 'receipts',
    title: 'Receipt Management',
    description: 'Upload and organize all your business receipts. Perfect for expense tracking and tax preparation.',
    target: '[data-tour="receipts"]',
    icon: <Receipt className="h-6 w-6" />,
    position: 'right',
    action: 'Almost Done'
  },
  {
    id: 'complete',
    title: 'You\'re All Set! 🚀',
    description: 'You\'ve learned the key features including CRM, invoicing, and group savings. Start exploring and managing your business like a pro. Remember, you can always access help from menu.',
    target: 'body',
    icon: <Check className="h-6 w-6" />,
    position: 'center',
    action: 'Start Using Kwachalite'
  }
];

export function QuickTour({ isOpen, onComplete, onSkip, isFirstTime = true }: QuickTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [highlightedElement, setHighlightedElement] = useState<Element | null>(null);

  const currentTourStep = tourSteps[currentStep];
  const isLastStep = currentStep === tourSteps.length - 1;
  const isFirstStep = currentStep === 0;

  useEffect(() => {
    if (!isOpen) {
      cleanup();
      return;
    }

    const step = tourSteps[currentStep];
    
    if (step.target !== 'body') {
      const element = document.querySelector(step.target);
      if (element) {
        setHighlightedElement(element);
        highlightElement(element, step.highlightPadding || 8);
        
        // Scroll element into view
        element.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
          inline: 'center'
        });
      }
    } else {
      cleanup();
    }

    return cleanup;
  }, [currentStep, isOpen]);

  const cleanup = () => {
    // Remove highlight overlay
    const overlay = document.getElementById('tour-highlight');
    if (overlay) {
      overlay.remove();
    }
    setHighlightedElement(null);
  };

  const highlightElement = (element: Element, padding: number) => {
    // Remove existing highlight
    const existingOverlay = document.getElementById('tour-highlight');
    if (existingOverlay) {
      existingOverlay.remove();
    }

    const rect = element.getBoundingClientRect();
    const overlay = document.createElement('div');
    overlay.id = 'tour-highlight';
    
    Object.assign(overlay.style, {
      position: 'fixed',
      top: `${rect.top - padding}px`,
      left: `${rect.left - padding}px`,
      width: `${rect.width + padding * 2}px`,
      height: `${rect.height + padding * 2}px`,
      border: '3px solid rgb(59 130 246)',
      borderRadius: '8px',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      pointerEvents: 'none',
      zIndex: 9998,
      transition: 'all 0.3s ease',
      boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.7)'
    });

    document.body.appendChild(overlay);
  };

  const handleNext = () => {
    if (isLastStep) {
      handleComplete();
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (!isFirstStep) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleComplete = () => {
    // Mark tour as completed
    if (typeof window !== 'undefined') {
      localStorage.setItem('kwachalite-tour-completed', 'true');
    }
    cleanup();
    onComplete();
  };

  const handleSkip = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('kwachalite-tour-completed', 'true');
    }
    cleanup();
    onSkip();
  };

  const getTourPosition = () => {
    if (!highlightedElement || currentTourStep.target === 'body') {
      return {
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)'
      };
    }

    const rect = highlightedElement.getBoundingClientRect();
    const tourCard = document.getElementById('tour-card');
    
    if (!tourCard) return {};

    const cardWidth = 400; // Approximate width
    const cardHeight = 250; // Approximate height
    const padding = 20;

    switch (currentTourStep.position) {
      case 'top':
        return {
          bottom: `${window.innerHeight - rect.top + padding}px`,
          left: `${Math.min(rect.left + rect.width / 2 - cardWidth / 2, window.innerWidth - cardWidth - padding)}px`
        };
      case 'bottom':
        return {
          top: `${rect.bottom + padding}px`,
          left: `${Math.min(rect.left + rect.width / 2 - cardWidth / 2, window.innerWidth - cardWidth - padding)}px`
        };
      case 'left':
        return {
          top: `${Math.min(rect.top + rect.height / 2 - cardHeight / 2, window.innerHeight - cardHeight - padding)}px`,
          right: `${window.innerWidth - rect.left + padding}px`
        };
      case 'right':
        return {
          top: `${Math.min(rect.top + rect.height / 2 - cardHeight / 2, window.innerHeight - cardHeight - padding)}px`,
          left: `${rect.right + padding}px`
        };
      default:
        return {
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)'
        };
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Tour Card */}
      <Card 
        id="tour-card"
        className={cn(
          "fixed z-[9999] w-full max-w-sm shadow-2xl border-2 border-primary animate-in fade-in zoom-in duration-300",
          currentTourStep.position === 'center' && "max-w-md"
        )}
        style={getTourPosition()}
      >
        <CardContent className="p-6 space-y-4">
          {/* Progress Indicator */}
          <div className="flex items-center justify-between">
            <Badge variant="secondary" className="text-xs">
              Step {currentStep + 1} of {tourSteps.length}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSkip}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / tourSteps.length) * 100}%` }}
            />
          </div>

          {/* Content */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg text-primary">
                {currentTourStep.icon}
              </div>
              <h3 className="text-lg font-semibold leading-tight">
                {currentTourStep.title}
              </h3>
            </div>
            
            <p className="text-sm text-muted-foreground leading-relaxed">
              {currentTourStep.description}
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handlePrevious}
              disabled={isFirstStep}
              className={cn(isFirstStep && "invisible")}
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>

            <Button
              onClick={handleNext}
              size="sm"
              className="min-w-[100px]"
            >
              {currentTourStep.action || (isLastStep ? 'Get Started' : 'Next')}
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Overlay for center steps */}
      {currentTourStep.position === 'center' && (
        <div className="fixed inset-0 bg-black/50 z-[9997] animate-in fade-in duration-300" />
      )}
    </>
  );
}