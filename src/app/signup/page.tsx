'use client';

import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Logo from '@/components/logo';
import React from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, TrendingUp, BarChart3, Target, Wallet, Shield, Zap, Check } from 'lucide-react';

export default function SignupPage() {
  const navigate = useNavigate();
  const { signUpWithEmail, loading, user } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [fullName, setFullName] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (!loading && user) {
      navigate('/dashboard');
    }
  }, [user, loading, navigate]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password || !fullName) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all fields.',
        variant: 'destructive',
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: 'Password Too Short',
        description: 'Password must be at least 6 characters long.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await signUpWithEmail(email, password, fullName);
      
      if (result.user && !result.user.email_confirmed_at) {
        toast({
          title: 'Check Your Email',
          description: 'Please check your email and click the confirmation link to complete your registration.',
          variant: 'default',
        });
        // Redirect to email verification page
        navigate('/email-verification');
      } else if (result.user) {
        toast({
          title: 'Account Created',
          description: 'Your account has been created successfully!',
          variant: 'default',
        });
        navigate('/dashboard');
      }
    } catch (error: any) {
      console.error('Signup error details:', error);
      
      let errorMessage = 'Could not create your account. Please try again.';
      
      if (error.message) {
        if (error.message.includes('Failed to fetch') || error.message.includes('fetch')) {
          errorMessage = 'Unable to connect to authentication service. Please check your internet connection and try again.';
        } else if (error.message.includes('already registered')) {
          errorMessage = 'This email is already registered. Please try logging in instead.';
        } else if (error.message.includes('Invalid login credentials')) {
          errorMessage = 'Invalid email format. Please check your email address.';
        } else if (error.message.includes('Unable to validate email')) {
          errorMessage = 'Invalid email format. Please check your email address.';
        } else {
          errorMessage = error.message;
        }
      } else if (error.status === 0) {
        errorMessage = 'Network error. Please check your internet connection and try again.';
      } else if (error.name === 'AuthApiError') {
        errorMessage = 'Authentication service error. Please try again later.';
      }
      
      toast({
        title: 'Sign-up Failed',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading || user) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="flex min-h-screen">
        {/* Left Panel - Feature Showcase */}
        <div className="hidden lg:flex lg:flex-1 relative bg-card">
          {/* Subtle grid pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
          
          {/* Content */}
          <div className="relative z-10 flex flex-col justify-between px-16 py-12 text-white">
            {/* Logo & Brand */}
            <div>
              <div className="flex items-center gap-3 mb-16">
                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                  <Wallet className="w-5 h-5 text-foreground" />
                </div>
                <span className="text-xl font-semibold">KwachaLite</span>
              </div>
              
              <div className="max-w-md">
                <h1 className="text-4xl font-bold mb-4 leading-tight">
                  Professional Financial Management
                </h1>
                <p className="text-lg text-muted-foreground mb-12">
                  Advanced tools and insights to help you take control of your financial future with confidence.
                </p>
              </div>
            </div>
            
            {/* Features List */}
            <div className="max-w-md space-y-8">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center flex-shrink-0 border border-border">
                  <BarChart3 className="w-6 h-6 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-1">Comprehensive Analytics</h3>
                  <p className="text-sm text-muted-foreground">Track expenses, income, and investments with detailed reporting and visualizations.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center flex-shrink-0 border border-border">
                  <Shield className="w-6 h-6 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-1">Bank-Level Security</h3>
                  <p className="text-sm text-muted-foreground">Your data is encrypted and protected with enterprise-grade security protocols.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center flex-shrink-0 border border-border">
                  <Target className="w-6 h-6 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-1">Goal Tracking</h3>
                  <p className="text-sm text-muted-foreground">Set financial goals and track progress with intelligent insights and recommendations.</p>
                </div>
              </div>
            </div>
            
            
          </div>
        </div>
        
        {/* Right Panel - Signup Form */}
        <div className="flex-1 lg:max-w-xl flex items-center justify-center p-4 sm:p-6 lg:p-12 bg-white">
          <div className="w-full max-w-md">
            {/* Mobile Logo */}
            <div className="lg:hidden text-center mb-6 sm:mb-8">
              <div className="flex justify-center mb-3 sm:mb-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary rounded-lg flex items-center justify-center">
                  <Wallet className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
              </div>
              <h1 className="text-lg sm:text-xl font-semibold text-foreground">KwachaLite</h1>
            </div>
            
            <div className="mb-6 sm:mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">Create Account</h2>
              <p className="text-sm sm:text-base text-muted-foreground">Get started with your free account today</p>
            </div>
            
            <form className="space-y-4 sm:space-y-5" onSubmit={handleSignUp}>
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-sm font-medium text-foreground">
                  Full Name
                </Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="John Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="h-12 sm:h-11 border-slate-300 focus:border-slate-900 focus:ring-slate-900 text-base"
                  autoComplete="name"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-foreground">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-12 sm:h-11 border-slate-300 focus:border-slate-900 focus:ring-slate-900 text-base"
                  autoComplete="email"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-foreground">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Minimum 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="h-12 sm:h-11 border-slate-300 focus:border-slate-900 focus:ring-slate-900 pr-12 text-base"
                    autoComplete="new-password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 sm:h-9 sm:w-9 hover:bg-muted"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">Must be at least 6 characters</p>
              </div>
              
              {/* Feature Checklist */}
              <div className="bg-muted rounded-lg p-4 border border-border">
                <p className="text-xs font-medium text-foreground mb-3">Your account includes:</p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-slate-900 flex items-center justify-center">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-xs text-muted-foreground">Advanced analytics</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-slate-900 flex items-center justify-center">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-xs text-muted-foreground">Priority support</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-slate-900 flex items-center justify-center">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-xs text-muted-foreground">Secure data storage</span>
                  </div>
                </div>
              </div>
              
              <Button 
                type="submit" 
                className="w-full h-12 sm:h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-medium transition-colors text-base" 
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Creating Account...' : 'Create Account'}
              </Button>
            </form>
            
            <div className="mt-6 space-y-4">
              <div className="text-center text-sm text-muted-foreground">
                Already have an account?{' '}
                <Link to="/" className="text-foreground hover:underline font-medium">
                  Sign in
                </Link>
              </div>
              
              <div className="text-center text-xs text-muted-foreground pt-4 border-t border-border">
                By creating an account, you agree to our{' '}
                <button className="text-foreground hover:underline">Terms of Service</button>
                {' '}and{' '}
                <button className="text-foreground hover:underline">Privacy Policy</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}