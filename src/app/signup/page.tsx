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
import { Eye, EyeOff, TrendingUp, BarChart3, PieChart, DollarSign, Target, Wallet, Shield, Zap, Users } from 'lucide-react';

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
      } else {
        toast({
          title: 'Account Created',
          description: 'Your account has been created successfully!',
          variant: 'default',
        });
        navigate('/dashboard');
      }
    } catch (error: any) {
      console.error('Signup error details:', error);
      
      // More descriptive error messages
      let errorMessage = 'Could not create your account. Please try again.';
      
      if (error.message) {
        // Handle specific Supabase auth errors
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
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 via-teal-700 to-blue-800"></div>
          
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
                  Start Your Journey to
                  <span className="block bg-gradient-to-r from-yellow-300 to-green-300 bg-clip-text text-transparent">
                    Financial Freedom
                  </span>
                </h2>
                
                <p className="text-xl text-blue-100 mb-8 leading-relaxed">
                  Join thousands of users who have transformed their financial lives with KwachaLite's powerful tools and insights.
                </p>
              </div>
              
              {/* Feature highlights */}
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm flex-shrink-0">
                    <Shield className="w-5 h-5 text-green-300" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Secure & Private</h3>
                    <p className="text-blue-100 text-sm">Your financial data is encrypted and protected with bank-level security.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm flex-shrink-0">
                    <Zap className="w-5 h-5 text-yellow-300" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Quick Setup</h3>
                    <p className="text-blue-100 text-sm">Get started in minutes with our intuitive onboarding process.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm flex-shrink-0">
                    <Users className="w-5 h-5 text-purple-300" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Trusted by Thousands</h3>
                    <p className="text-blue-100 text-sm">Join a community of financially savvy individuals.</p>
                  </div>
                </div>
              </div>
              
              {/* Benefits preview */}
              <div className="mt-12 grid grid-cols-2 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white mb-1">Free</div>
                  <div className="text-blue-200 text-sm">Forever</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white mb-1">2 min</div>
                  <div className="text-blue-200 text-sm">Setup Time</div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Benefits cards - floating */}
          <div className="absolute right-8 top-1/2 transform -translate-y-1/2 space-y-4">
            {/* Track Everything card */}
            <div className="bg-white/20 backdrop-blur-md rounded-2xl p-4 w-64 border border-white/30">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-4 h-4 text-white" />
                </div>
                <span className="text-white font-semibold">Track Everything</span>
              </div>
              <p className="text-white/80 text-sm">Monitor all your expenses, income, and financial goals in one place.</p>
            </div>
            
            {/* Smart Insights card */}
            <div className="bg-white/20 backdrop-blur-md rounded-2xl p-4 w-64 border border-white/30">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-white" />
                </div>
                <span className="text-white font-semibold">Smart Insights</span>
              </div>
              <p className="text-white/80 text-sm">Get personalized recommendations to improve your financial health.</p>
            </div>
            
            {/* Goal Achievement card */}
            <div className="bg-white/20 backdrop-blur-md rounded-2xl p-4 w-64 border border-white/30">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                  <Target className="w-4 h-4 text-white" />
                </div>
                <span className="text-white font-semibold">Achieve Goals</span>
              </div>
              <p className="text-white/80 text-sm">Set and track financial goals with visual progress indicators.</p>
            </div>
          </div>
        </div>
        
        {/* Signup Section */}
        <div className="flex-1 lg:max-w-md xl:max-w-lg flex items-center justify-center p-6 lg:p-12">
          <div className="w-full max-w-sm">
            {/* Mobile header - only visible on smaller screens */}
            <div className="lg:hidden text-center mb-8">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-600 to-blue-600 rounded-2xl flex items-center justify-center">
                  <Wallet className="w-8 h-8 text-white" />
                </div>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">KwachaLite</h1>
              <p className="text-gray-600">Start your financial journey</p>
            </div>
            
            <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="space-y-4">
                <div className="hidden lg:flex justify-center mb-4">
                  <Logo />
                </div>
                <CardTitle className="text-2xl font-bold text-center text-gray-900">Create Your Account</CardTitle>
                <CardDescription className="text-center text-gray-600">
                  Start managing your finances like a pro in just 2 minutes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form className="grid gap-4" onSubmit={handleSignUp}>
                  <div className="grid gap-2">
                    <Label htmlFor="fullName" className="text-gray-700">Full Name</Label>
                    <Input
                      id="fullName"
                      type="text"
                      placeholder="Enter your full name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                      className="h-12 bg-white/60 border-gray-200 focus:border-emerald-500 focus:ring-emerald-500"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="email" className="text-gray-700">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="h-12 bg-white/60 border-gray-200 focus:border-emerald-500 focus:ring-emerald-500"
                    />
                  </div>
                  <div className="grid gap-2 relative">
                    <Label htmlFor="password" className="text-gray-700">Password</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Choose a strong password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={6}
                        className="h-12 bg-white/60 border-gray-200 focus:border-emerald-500 focus:ring-emerald-500 pr-12"
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
                    <p className="text-xs text-gray-500">Must be at least 6 characters long</p>
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full h-12 bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 text-white font-semibold rounded-lg transition-all duration-200" 
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Creating your account...' : 'Create Account'}
                  </Button>
                </form>
                
                <div className="mt-6 space-y-4 text-center">
                  <div className="text-sm text-gray-600">
                    Already have an account?{' '}
                    <Link to="/" className="text-emerald-600 hover:text-emerald-700 underline font-semibold">
                      Sign in
                    </Link>
                  </div>
                  
                  <div className="text-xs text-gray-500 pt-4 border-t border-gray-200">
                    By creating an account, you agree to our{' '}
                    <span className="text-emerald-600">Terms of Service</span> and{' '}
                    <span className="text-emerald-600">Privacy Policy</span>.
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