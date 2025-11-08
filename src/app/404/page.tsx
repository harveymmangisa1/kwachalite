'use client';

import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Home, Search, RefreshCw, ArrowLeft } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function NotFoundPage() {
  const [isAnimating, setIsAnimating] = useState(false);
  const [currentJoke, setCurrentJoke] = useState(0);

  const jokes = [
    {
      title: "Lost in the Financial Matrix?",
      description: "This page is like that one expense you forgot to track - completely missing!"
    },
    {
      title: "404: Budget Not Found",
      description: "Looks like this page spent more than it earned and disappeared!"
    },
    {
      title: "Transaction Failed",
      description: "This page couldn't be processed. Please check your connection and try again!"
    },
    {
      title: "Account Overdrawn",
      description: "This page has insufficient funds to exist. Try another URL!"
    },
    {
      title: "Investment Gone Wrong",
      description: "This page invested in crypto and vanished. Let's go back to safety!"
    }
  ];

  useEffect(() => {
    const timer = setTimeout(() => setIsAnimating(true), 100);
    const jokeTimer = setInterval(() => {
      setCurrentJoke((prev) => (prev + 1) % jokes.length);
    }, 5000);

    return () => {
      clearTimeout(timer);
      clearInterval(jokeTimer);
    };
  }, []);

  const handleRefresh = () => {
    window.location.reload();
  };

  const handleGoBack = () => {
    window.history.back();
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(15,23,42,0.03),transparent_70%)]" />
      
      <div className={`relative z-10 text-center max-w-2xl mx-auto transition-all duration-700 ${isAnimating ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        
        {/* 404 Number with Animation */}
        <div className="mb-8 relative">
          <div className="text-8xl sm:text-9xl font-bold text-slate-200 select-none">
            404
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-4xl sm:text-5xl font-bold text-slate-900 animate-bounce">
              😱
            </div>
          </div>
        </div>

        {/* Dynamic Joke Content */}
        <div className="mb-8 space-y-4 transition-all duration-500">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
            {jokes[currentJoke].title}
          </h1>
          <p className="text-lg text-slate-600 max-w-md mx-auto">
            {jokes[currentJoke].description}
          </p>
        </div>

        {/* Funny Finance Icons */}
        <div className="flex justify-center gap-4 mb-8">
          <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center animate-pulse">
            <span className="text-xl">💰</span>
          </div>
          <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center animate-pulse delay-75">
            <span className="text-xl">📊</span>
          </div>
          <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center animate-pulse delay-150">
            <span className="text-xl">💸</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
          <Link to="/" className="w-full sm:w-auto">
            <Button size="lg" className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white gap-2 h-12">
              <Home className="w-5 h-5" />
              Back to Safety
            </Button>
          </Link>
          
          <Button 
            variant="outline" 
            size="lg" 
            onClick={handleGoBack}
            className="w-full sm:w-auto gap-2 h-12"
          >
            <ArrowLeft className="w-5 h-5" />
            Go Back
          </Button>
        </div>

        {/* Additional Options */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-sm text-slate-500">
          <Button 
            variant="ghost" 
            onClick={handleRefresh}
            className="gap-2 text-slate-600 hover:text-slate-900"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </Button>
          
          <Link to="/dashboard" className="text-slate-600 hover:text-slate-900 hover:underline">
            Go to Dashboard
          </Link>
        </div>

        {/* Fun Message */}
        <div className="mt-12 p-4 bg-slate-100 rounded-lg border border-slate-200">
          <p className="text-sm text-slate-600">
            <span className="font-semibold">Pro tip:</span> While you're here, maybe it's time to check your budget? 
            <Link to="/dashboard/budgets" className="text-slate-900 hover:underline font-medium ml-1">
              Let's check! →
            </Link>
          </p>
        </div>

        {/* Progress Indicator for Jokes */}
        <div className="mt-6 flex justify-center gap-2">
          {jokes.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentJoke ? 'bg-slate-900 w-8' : 'bg-slate-300'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}