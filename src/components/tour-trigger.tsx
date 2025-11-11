'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles, Play } from 'lucide-react';
import { QuickTour } from '@/components/ui/quick-tour';

export function TourTrigger() {
  const [showTour, setShowTour] = useState(false);
  const [isFirstTime, setIsFirstTime] = useState(false);
  const [tourCompleted, setTourCompleted] = useState(false);

  useEffect(() => {
    // Check if user has completed tour
    const tourStatus = localStorage.getItem('kwachalite-tour-completed');
    if (tourStatus === 'true') {
      setTourCompleted(true);
    } else {
      setIsFirstTime(true);
      // Auto-show tour for first-time users after a short delay
      const timer = setTimeout(() => {
        setShowTour(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    // Listen for custom tour start event
    const handleStartTour = () => {
      setShowTour(true);
    };

    window.addEventListener('start-tour', handleStartTour);
    return () => window.removeEventListener('start-tour', handleStartTour);
  }, []);

  const handleTourComplete = () => {
    setShowTour(false);
    setIsFirstTime(false);
    setTourCompleted(true);
  };

  const handleTourSkip = () => {
    setShowTour(false);
    setIsFirstTime(false);
    setTourCompleted(true);
  };

  return (
    <>
      {/* Tour Trigger Button - Show only if tour hasn't been completed */}
      {!tourCompleted && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowTour(true)}
          className="fixed bottom-6 right-6 z-50 shadow-lg bg-background/95 backdrop-blur-sm border-2 hover:bg-primary hover:text-primary-foreground transition-all duration-200"
        >
          <Play className="h-4 w-4 mr-2" />
          Quick Tour
        </Button>
      )}

      {/* First-time user prompt */}
      {isFirstTime && !showTour && (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-5 duration-300">
          <div className="bg-background border-2 border-primary rounded-lg shadow-lg p-4 max-w-xs">
            <div className="flex items-center gap-3 mb-3">
              <Sparkles className="h-5 w-5 text-primary" />
              <span className="font-medium">New to Kwachalite?</span>
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              Take a quick tour to learn about the most important features.
            </p>
            <Button
              onClick={() => setShowTour(true)}
              className="w-full"
              size="sm"
            >
              Start Tour
            </Button>
          </div>
        </div>
      )}

      {/* Quick Tour Component */}
      <QuickTour
        isOpen={showTour}
        onComplete={handleTourComplete}
        onSkip={handleTourSkip}
        isFirstTime={isFirstTime}
      />
    </>
  );
}