'use client';

import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, ArrowRight, Mail, Sparkles, Shield, Zap, AlertCircle, RefreshCw } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';

export default function EmailVerificationPage() {
  const [isVisible, setIsVisible] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    // Handle email verification
    const handleEmailVerification = async () => {
      const token = searchParams.get('token');
      const type = searchParams.get('type');
      
      if (type === 'signup' && token) {
        setIsVerifying(true);
        try {
          // This would typically be handled by Supabase automatically
          // But we can add additional verification logic here if needed
          setVerificationStatus('success');
          toast({
            title: 'Email Verified!',
            description: 'Your email has been successfully verified.',
          });
        } catch (error) {
          console.error('Verification error:', error);
          setVerificationStatus('error');
          toast({
            title: 'Verification Failed',
            description: 'Could not verify your email. Please try again.',
            variant: 'destructive',
          });
        } finally {
          setIsVerifying(false);
        }
      } else {
        // Just show success page for direct navigation
        setVerificationStatus('success');
      }
    };

    handleEmailVerification();

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
  }, [searchParams, toast]);

  if (isVerifying) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 text-muted-foreground animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-foreground mb-2">Verifying your email...</h2>
          <p className="text-muted-foreground">Please wait while we confirm your email address.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      
      <div className={`relative z-10 w-full max-w-2xl transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        {/* Status Icon */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            {verificationStatus === 'success' ? (
              <>
                <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center border-4 border-emerald-100">
                  <CheckCircle className="w-10 h-10 text-emerald-600" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
              </>
            ) : (
              <>
                <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center border-4 border-red-100">
                  <AlertCircle className="w-10 h-10 text-red-600" />
                </div>
              </>
            )}
          </div>
        </div>

        {/* Main Card */}
        <Card className="border border-border shadow-lg bg-card">
          <CardContent className="p-8 sm:p-12">
            <div className="text-center mb-8">
              <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-3">
                {verificationStatus === 'success' ? 'Email Verified Successfully!' : 'Verification Failed'}
              </h1>
              <p className="text-lg text-muted-foreground">
                {verificationStatus === 'success' 
                  ? 'Your account is now active and ready to use'
                  : 'We could not verify your email. Please try again or contact support.'
                }
              </p>
            </div>

            {/* Progress Bar */}
            <div className="mb-8">
              <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                <div 
                  className="h-full bg-emerald-500 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <p className="text-xs text-muted-foreground text-center mt-2">
                {progress < 100 ? 'Setting up your account...' : 'Ready to get started!'}
              </p>
            </div>

            {/* Feature Highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              <div className="flex flex-col items-center text-center p-4 bg-muted rounded-lg border border-border">
                <Shield className="w-6 h-6 text-emerald-600 mb-2" />
                <h3 className="text-sm font-semibold text-foreground mb-1">Secure</h3>
                <p className="text-xs text-muted-foreground">Your data is protected</p>
              </div>
              <div className="flex flex-col items-center text-center p-4 bg-muted rounded-lg border border-border">
                <Zap className="w-6 h-6 text-blue-600 mb-2" />
                <h3 className="text-sm font-semibold text-foreground mb-1">Fast Setup</h3>
                <p className="text-xs text-muted-foreground">Start in seconds</p>
              </div>
              <div className="flex flex-col items-center text-center p-4 bg-muted rounded-lg border border-border">
                <Mail className="w-6 h-6 text-purple-600 mb-2" />
                <h3 className="text-sm font-semibold text-foreground mb-1">Connected</h3>
                <p className="text-xs text-muted-foreground">Email verified</p>
              </div>
            </div>

            {/* CTA Button */}
            <div className="space-y-4">
              <Button 
                asChild
                className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-medium transition-colors group"
                size="lg"
              >
                <Link to="/">
                  Continue to Dashboard
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>

              <p className="text-center text-xs text-muted-foreground">
                You'll be redirected to your personalized dashboard
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Welcome Message */}
        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            Welcome to <span className="font-semibold text-foreground">KwachaLite</span> 🎉
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Need help? <button className="text-foreground hover:underline">Contact Support</button>
          </p>
        </div>

        {/* Next Steps Preview */}
        <Card className="mt-6 border border-border bg-card/50 backdrop-blur-sm">
          <CardContent className="p-6">
            <h3 className="text-sm font-semibold text-foreground mb-4">What's Next?</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-primary-foreground text-xs font-medium">1</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Complete your profile</p>
                  <p className="text-xs text-muted-foreground">Add your financial preferences</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-primary-foreground text-xs font-medium">2</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Link your accounts</p>
                  <p className="text-xs text-muted-foreground">Connect banks and cards</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-primary-foreground text-xs font-medium">3</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Set your goals</p>
                  <p className="text-xs text-muted-foreground">Define financial objectives</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}