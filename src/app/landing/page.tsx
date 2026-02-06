'use client';

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Logo from '@/components/logo';
import { DashboardPreview } from '@/components/landing/dashboard-preview';
import { MobileDashboardPreview } from '@/components/landing/mobile-dashboard-preview';
import { ThemeProvider, useTheme } from '@/contexts/theme-context';
// Swapped Map -> Activity for the 'Global' section to resolve the export error
import { Menu, TrendingUp, Lock, Phone, MapPin, CheckCircle2, ChevronRight } from 'lucide-react';

function LandingPageContent() {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const handleSignIn = () => navigate('/login');
  const handleOpenAccount = () => navigate('/signup');

  return (
    <div className="min-h-screen bg-white text-slate-900 dark:bg-[#0A0A0B] dark:text-white selection:bg-blue-500/30 font-sans tracking-tight overflow-x-hidden">
      
      {/* Ultra-Thin Global Header */}
      <nav className="fixed top-0 w-full z-50 border-b border-slate-200/60 dark:border-white/5 bg-white/80 dark:bg-[#0A0A0B]/80 backdrop-blur-xl">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <a href="/landing" className="flex items-center gap-2.5">
              <Logo size="sm" showText={true} />
            </a>
            <div className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-white/60">
              <a href="#simplicity" className="hover:text-white transition-colors">How it Works</a>
              <a href="#peace-of-mind" className="hover:text-white transition-colors">Peace of Mind</a>
              <a href="#safety" className="hover:text-white transition-colors">Safety</a>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Theme Toggle */}
            <div className="hidden md:flex items-center gap-1 p-1 bg-white/10 rounded-full">
              <button
                onClick={() => toggleTheme()}
                className="p-2 rounded-full text-slate-600 dark:text-white/70 hover:text-slate-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                title="Toggle theme"
              >
                {theme === 'light' ? '🌙' : '☀️'}
              </button>
            </div>
            
            <Button variant="ghost" className="hidden md:flex text-sm font-medium hover:bg-black/5 dark:hover:bg-white/5 text-slate-600 dark:text-white/70" onClick={handleSignIn}>
              Log In
            </Button>
            <Button className="bg-white text-black hover:bg-gray-200 rounded-full px-5 py-2 text-sm font-bold transition-all hover:scale-105" onClick={handleOpenAccount}>
              Get Started
            </Button>
            <button 
              className="md:hidden text-slate-600 dark:text-white/70 hover:text-slate-900 dark:hover:text-white transition-colors" 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle menu"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
        
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200/60 dark:border-white/5 bg-white/95 dark:bg-[#0A0A0B]/95 backdrop-blur-xl">
            <div className="container mx-auto px-6 py-4 flex flex-col gap-4">
              <a href="#simplicity" className="text-sm font-medium text-slate-600 dark:text-white/60 hover:text-slate-900 dark:hover:text-white transition-colors py-2">How it Works</a>
              <a href="#peace-of-mind" className="text-sm font-medium text-slate-600 dark:text-white/60 hover:text-slate-900 dark:hover:text-white transition-colors py-2">Peace of Mind</a>
              <a href="#safety" className="text-sm font-medium text-slate-600 dark:text-white/60 hover:text-slate-900 dark:hover:text-white transition-colors py-2">Safety</a>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 lg:pt-48 pb-20 overflow-hidden">
        <div className="container mx-auto px-6">
          <div className="flex flex-col items-center gap-10 lg:gap-14">
            <div className="w-full max-w-3xl space-y-8 text-center">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-blue-500/20 bg-blue-500/10 text-blue-300 text-xs font-bold uppercase tracking-widest mx-auto lg:mx-0">
                <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
                No finance degree required
              </div>
              <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-medium leading-[0.95] tracking-tighter">
                Money, made <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-violet-400">human.</span>
              </h1>
              <p className="text-lg md:text-xl text-slate-600 dark:text-white/60 max-w-xl mx-auto leading-relaxed font-light">
                Stop stressing over spreadsheets and complex charts. We translate your finances into simple, actionable insights. 
                <span className="text-white block mt-2 font-medium">Finally, banking that speaks your language.</span>
              </p>
              <div className="flex flex-col sm:flex-row items-center gap-4 justify-center pt-2">
                <Button size="lg" className="w-full sm:w-auto h-14 px-8 bg-blue-600 hover:bg-blue-500 rounded-full text-base font-semibold group transition-all" onClick={handleOpenAccount}>
                  Try It Free <ChevronRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
                <div className="text-sm text-slate-500 dark:text-white/40 font-medium">Takes less than 3 minutes</div>
              </div>
            </div>

            {/* Right Content - Dashboard Previews */}
            <div className="w-full relative flex justify-center">
              <div className="w-full max-w-5xl space-y-6">
                <div className="text-center">
                  <p className="text-xs uppercase tracking-[0.25em] text-slate-500 dark:text-white/40">Live Preview</p>
                  <h3 className="text-xl font-semibold mt-2">Desktop and mobile, perfectly aligned</h3>
                </div>

                {/* Desktop + Mobile Preview (Desktop Only) */}
                <div className="hidden lg:grid grid-cols-12 gap-6 items-end relative mt-8">
                  <div className="absolute -inset-6 bg-gradient-to-r from-blue-500/20 to-violet-500/20 rounded-[2rem] blur-3xl" />

                  {/* Desktop Mockup */}
                  <div className="col-span-8 relative z-10 bg-[#0f1012] border border-white/10 rounded-2xl overflow-hidden shadow-2xl animate-[float_9s_ease-in-out_infinite]">
                    <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5 bg-white/5">
                      <div className="flex items-center gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-500/20 border border-red-500/40" />
                        <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20 border border-yellow-500/40" />
                        <div className="w-2.5 h-2.5 rounded-full bg-green-500/20 border border-green-500/40" />
                      </div>
                      <div className="ml-3 text-[10px] text-slate-500 dark:text-white/40 font-mono">app.kwachalite.com</div>
                    </div>
                    <div className="aspect-[16/10] bg-slate-950 dark:bg-[#0A0A0B] overflow-hidden">
                      <DashboardPreview isDark={theme === 'dark'} />
                    </div>
                  </div>

                  {/* Phone Mockup */}
                  <div className="col-span-4 relative z-10 flex justify-center">
                    <div className="relative p-2.5 bg-[#080809] border-[6px] border-[#1a1a1e] rounded-[3rem] shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden w-[240px] animate-[float_12s_ease-in-out_infinite]">
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-6 bg-[#1a1a1e] rounded-b-2xl z-30 flex items-center justify-center">
                        <div className="w-10 h-1 bg-white/10 rounded-full mb-1" />
                      </div>
                      <div className="aspect-[9/19.5] rounded-[2.2rem] overflow-hidden bg-black">
                        <MobileDashboardPreview isDark={theme === 'dark'} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Mobile Preview (Mobile Only) */}
                <div className="lg:hidden">
                  <div className="relative mx-auto" style={{ maxWidth: '320px' }}>
                    <div className="absolute inset-0 bg-gradient-to-r from-violet-500/20 to-blue-500/20 rounded-2xl blur-3xl"></div>
                    <div className="relative bg-black/60 backdrop-blur-sm rounded-[2rem] p-3 border border-white/15 animate-[float_10s_ease-in-out_infinite]">
                      <div className="absolute top-2 left-1/2 -translate-x-1/2 w-16 h-3 bg-white/10 rounded-full" />
                      <div className="aspect-[9/19.5] rounded-[1.6rem] overflow-hidden">
                        <MobileDashboardPreview isDark={theme === 'dark'} />
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap justify-center gap-2">
                    {['Real-time Sync', 'Dark Mode', 'Mobile First'].map((feature) => (
                      <span key={feature} className="px-3 py-1 rounded-full bg-black/5 dark:bg-white/10 text-slate-700 dark:text-white/80 text-xs font-medium border border-slate-200 dark:border-white/20">
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Section */}
      <section id="simplicity" className="py-20 lg:py-32 bg-white dark:bg-[#0A0A0B]">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 group relative overflow-hidden rounded-[2.5rem] bg-white dark:bg-[#111113] border border-slate-200 dark:border-white/5 p-8 md:p-12 transition-all hover:border-blue-500/30">
              <div className="flex flex-col md:flex-row gap-8 items-start">
                <div className="flex-1 space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-4">
                    <TrendingUp className="w-6 h-6 text-blue-400" />
                  </div>
                  <h3 className="text-2xl md:text-3xl font-bold text-white">Know where your money goes.</h3>
                  <p className="text-slate-600 dark:text-white/50 text-base md:text-lg leading-relaxed">
                    We automatically categorize everything. No manual entry, no confusing spreadsheets. Just a clear picture of your life.
                  </p>
                  <div className="pt-4 flex flex-wrap gap-3">
                     {['Groceries', 'Rent', 'Fun'].map(tag => (
                       <span key={tag} className="px-3 py-1 rounded-full bg-black/5 dark:bg-white/5 text-xs font-medium text-slate-600 dark:text-white/70 border border-slate-200 dark:border-white/5">
                         {tag}
                       </span>
                     ))}
                  </div>
                </div>
                <div className="w-full md:w-1/3 aspect-square bg-gradient-to-tr from-neutral-800 to-neutral-900 rounded-full flex items-center justify-center relative p-6">
                   <div className="absolute inset-4 border-8 border-blue-500/20 rounded-full border-t-blue-500"></div>
                   <div className="text-center">
                     <span className="block text-2xl font-bold text-white">Simple</span>
                    <span className="text-xs text-slate-500 dark:text-white/40">breakdown</span>
                   </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-4 rounded-[2.5rem] bg-gradient-to-br from-blue-700 to-violet-800 p-8 md:p-12 flex flex-col justify-between text-white shadow-2xl shadow-blue-900/10">
               <Lock className="w-10 h-10 text-slate-700 dark:text-white/80 mb-6" />
               <div className="space-y-4">
                 <h3 className="text-2xl md:text-3xl font-bold leading-tight">Your money is safe.</h3>
                 <p className="text-slate-700 dark:text-white/80 leading-relaxed">We use the same security measures as the world&apos;s biggest banks. Your data is yours alone.</p>
               </div>
            </div>

            <div className="lg:col-span-4 rounded-[2.5rem] bg-white dark:bg-[#111113] border border-slate-200 dark:border-white/5 p-8 md:p-12">
                <Phone className="w-8 h-8 text-violet-400 mb-6" />
                <h4 className="text-xl font-bold mb-3">On every device</h4>
                <p className="text-slate-600 dark:text-white/40 mb-6">Start on your phone, finish on your laptop. Your account stays in sync instantly.</p>
                <div className="flex gap-2 opacity-30">
                   <div className="w-8 h-12 border border-white rounded-md"></div>
                   <div className="w-16 h-12 border border-white rounded-md"></div>
                </div>
            </div>

            <div className="lg:col-span-8 rounded-[2.5rem] bg-white dark:bg-[#111113] border border-slate-200 dark:border-white/5 p-8 md:p-12 flex flex-col md:flex-row items-center gap-8">
               <div className="flex-1">
                 <div className="flex items-center gap-2 mb-4 text-emerald-400">
                    {/* Using Activity icon here */}
                    <MapPin className="w-5 h-5" />
                    <span className="text-xs font-bold uppercase tracking-widest">Global Friendly</span>
                 </div>
                 <h4 className="text-2xl md:text-3xl font-bold mb-4">Travel without worry.</h4>
                 <p className="text-slate-600 dark:text-white/50 text-lg">Use your card anywhere in the world with zero hidden fees. We handle the currency exchange automatically.</p>
               </div>
               <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-3 px-5 py-3 bg-neutral-900 rounded-xl border border-white/5">
                    <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-xs">🇺🇸</div>
                    <div>
                      <div className="text-xs text-slate-500 dark:text-white/40">Paying in</div>
                      <div className="text-sm font-bold">USD</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 px-5 py-3 bg-neutral-900 rounded-xl border border-white/5">
                    <div className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center text-xs">🇿🇲</div>
                    <div>
                      <div className="text-xs text-slate-500 dark:text-white/40">Spending in</div>
                      <div className="text-sm font-bold">Kwacha</div>
                    </div>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-20 border-t border-white/5">
        <div className="container mx-auto px-6 text-center">
            <h3 className="text-lg text-slate-600 dark:text-white/40 mb-8 font-medium">Join thousands of people mastering their money</h3>
            <div className="flex flex-wrap justify-center gap-4 md:gap-12 opacity-50">
               {['Zero Hidden Fees', '24/7 Support', 'Instant Alerts'].map((item) => (
                   <div key={item} className="flex items-center gap-2">
                       <CheckCircle2 className="w-5 h-5 text-blue-500" />
                       <span className="text-lg font-medium">{item}</span>
                   </div>
               ))}
            </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[100px]" />
        <div className="container mx-auto px-6 relative z-10 text-center max-w-3xl">
          <h2 className="text-4xl md:text-6xl font-bold tracking-tighter mb-6">Financial freedom <br /> starts with a single tap.</h2>
          <p className="text-xl text-slate-600 dark:text-white/50 mb-10 font-light">No paperwork. No waiting in lines. Just a better way to live.</p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button size="lg" className="h-14 px-10 bg-white text-black hover:bg-gray-100 rounded-full text-base font-bold transition-transform hover:-translate-y-1" onClick={handleOpenAccount}>Open Free Account</Button>
            <Button size="lg" variant="outline" className="h-14 px-10 rounded-full text-base font-bold border-white/10 hover:bg-white/5 hover:text-white" onClick={handleSignIn}>Log In</Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12 bg-[#050506]">
        <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2 opacity-50">
             <Logo size="sm" showText={false} />
             <span className="text-sm font-medium tracking-wide">KwachaLite</span>
          </div>
          <p className="text-xs font-medium text-white/30 text-center md:text-right">
            © {new Date().getFullYear()} KwachaLite. Built for everyone. <br className="md:hidden"/> Powered by Octet Systems.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default function LandingPage() {
  return (
    <ThemeProvider>
      <LandingPageContent />
    </ThemeProvider>
  );
}
