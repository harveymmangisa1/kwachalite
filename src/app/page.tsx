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
import { Eye, EyeOff, TrendingUp, BarChart3, PieChart, DollarSign, Target, Wallet, ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function LoginPage() {
  const navigate = useNavigate();
  const { loginWithEmail, loading, user } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (!loading && user) {
      navigate('/dashboard');
    }
  }, [user, loading, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: 'Missing Information',
        description: 'Please enter both email and password.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await loginWithEmail(email, password);
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Login error details:', error);
      
      // More descriptive error messages
      let errorMessage = 'Could not log you in. Please try again.';
      
      if (error.message) {
        // Handle specific Supabase auth errors
        if (error.message.includes('Failed to fetch') || error.message.includes('fetch')) {
          errorMessage = 'Unable to connect to authentication service. Please check your internet connection and try again.';
        } else if (error.message.includes('Invalid login credentials')) {
          errorMessage = 'Invalid email or password. Please check your credentials and try again.';
        } else if (error.message.includes('Email not confirmed')) {
          errorMessage = 'Please confirm your email address before logging in.';
        } else {
          errorMessage = error.message;
        }
      } else if (error.status === 0) {
        errorMessage = 'Network error. Please check your internet connection and try again.';
      } else if (error.name === 'AuthApiError') {
        errorMessage = 'Authentication service error. Please try again later.';
      }
      
      toast({
        title: 'Login Failed',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading || user) {
    return (
        <div className="flex h-screen items-center justify-center">
            Loading...
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="flex min-h-screen">
        {/* Finance Preview Section - Hidden on mobile, visible on lg+ */}
        <div className="hidden lg:flex lg:flex-1 relative overflow-hidden">
          {/* Background with gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800"></div>
          
          {/* Animated background elements */}
          <div className="absolute top-20 left-20 w-32 h-32 bg-white/10 rounded-full blur-xl animate-pulse"></div>
          <div className="absolute top-60 right-32 w-24 h-24 bg-white/10 rounded-full blur-xl animate-pulse" style={{animationDelay: '1s'}}></div>
          <div className="absolute bottom-40 left-40 w-40 h-40 bg-white/10 rounded-full blur-xl animate-pulse" style={{animationDelay: '2s'}}></div>
          
          {/* Content */}
          <div className="relative z-10 flex flex-col justify-center px-12 py-24 text-white">
            <div className="max-w-lg">
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                    <Wallet className="w-6 h-6 text-white" />
                  </div>
                  <h1 className="text-3xl font-bold">KwachaLite</h1>
                </div>
                
                <h2 className="text-4xl font-bold mb-4 leading-tight">
                  Take Control of Your
                  <span className="block bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                    Financial Future
                  </span>
                </h2>
                
                <p className="text-xl text-blue-100 mb-8 leading-relaxed">
                  Track expenses, manage budgets, and achieve your financial goals with intelligent insights and beautiful analytics.
                </p>
              </div>
              
              {/* Feature highlights */}
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm flex-shrink-0">
                    <TrendingUp className="w-5 h-5 text-green-300" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Smart Analytics</h3>
                    <p className="text-blue-100 text-sm">Gain insights with advanced charts and spending patterns analysis.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm flex-shrink-0">
                    <Target className="w-5 h-5 text-yellow-300" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Goal Tracking</h3>
                    <p className="text-blue-100 text-sm">Set and monitor financial goals with progress visualization.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm flex-shrink-0">
                    <BarChart3 className="w-5 h-5 text-purple-300" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Budget Management</h3>
                    <p className="text-blue-100 text-sm">Create budgets and get alerts when you're approaching limits.</p>
                  </div>
                </div>
              </div>
              
              {/* Stats preview */}
              <div className="mt-12 grid grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">10K+</div>
                  <div className="text-blue-200 text-sm">Active Users</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">$2M+</div>
                  <div className="text-blue-200 text-sm">Tracked</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">98%</div>
                  <div className="text-blue-200 text-sm">Satisfaction</div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Financial data preview cards - floating */}
          <div className="absolute right-8 top-1/2 transform -translate-y-1/2 space-y-4">
            {/* Income card */}
            <div className="bg-white/20 backdrop-blur-md rounded-2xl p-4 w-64 border border-white/30">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white/80 text-sm">Monthly Income</span>
                <ArrowUpRight className="w-4 h-4 text-green-300" />
              </div>
              <div className="text-2xl font-bold text-white mb-1">$5,240</div>
              <div className="text-green-300 text-sm">+12% from last month</div>
            </div>
            
            {/* Expenses card */}
            <div className="bg-white/20 backdrop-blur-md rounded-2xl p-4 w-64 border border-white/30">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white/80 text-sm">Monthly Expenses</span>
                <ArrowDownRight className="w-4 h-4 text-red-300" />
              </div>
              <div className="text-2xl font-bold text-white mb-1">$3,180</div>
              <div className="text-red-300 text-sm">-8% from last month</div>
            </div>
            
            {/* Savings card */}
            <div className="bg-white/20 backdrop-blur-md rounded-2xl p-4 w-64 border border-white/30">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white/80 text-sm">Total Savings</span>
                <PieChart className="w-4 h-4 text-blue-300" />
              </div>
              <div className="text-2xl font-bold text-white mb-1">$12,840</div>
              <div className="text-blue-300 text-sm">Goal: $15,000</div>
            </div>
          </div>
        </div>
        
        {/* Login Section */}
        <div className="flex-1 lg:max-w-md xl:max-w-lg flex items-center justify-center p-6 lg:p-12">
          <div className="w-full max-w-sm">
            {/* Mobile header - only visible on smaller screens */}
            <div className="lg:hidden text-center mb-8">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center">
                  <Wallet className="w-8 h-8 text-white" />
                </div>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">KwachaLite</h1>
              <p className="text-gray-600">Your personal finance companion</p>
            </div>
            
            <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="space-y-4">
                <div className="hidden lg:flex justify-center mb-4">
                  <Logo />
                </div>
                <CardTitle className="text-2xl font-bold text-center text-gray-900">Welcome Back</CardTitle>
                <CardDescription className="text-center text-gray-600">
                  Enter your email and password to access your financial dashboard
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form className="grid gap-4" onSubmit={handleLogin}>
                  <div className="grid gap-2">
                    <Label htmlFor="email" className="text-gray-700">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="h-12 bg-white/60 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div className="grid gap-2 relative">
                    <Label htmlFor="password" className="text-gray-700">Password</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="h-12 bg-white/60 border-gray-200 focus:border-blue-500 focus:ring-blue-500 pr-12"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 hover:bg-gray-100"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4 text-gray-500" /> : <Eye className="h-4 w-4 text-gray-500" />}
                      </Button>
                    </div>
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg transition-all duration-200" 
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Signing in...' : 'Sign In'}
                  </Button>
                </form>
                
                <div className="mt-6 space-y-4 text-center">
                  <Link to="/forgot-password" className="text-sm text-blue-600 hover:text-blue-700 underline">
                    Forgot your password?
                  </Link>
                  
                  <div className="text-sm text-gray-600">
                    Don&apos;t have an account?{' '}
                    <Link to="/signup" className="text-blue-600 hover:text-blue-700 underline font-semibold">
                      Sign up
                    </Link>
                  </div>
                  
                  <div className="text-xs text-gray-500 pt-4 border-t border-gray-200">
                    By signing in, you agree to our{' '}
                    <span className="text-blue-600">Terms of Service</span> and{' '}
                    <span className="text-blue-600">Privacy Policy</span>.
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}