'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Logo from '@/components/logo';
import { ArrowRight, Shield, BarChart3, Grid3x3 } from 'lucide-react';

export default function LandingPage() {
  const [activeTab, setActiveTab] = useState(0);
  const router = useRouter();

  const handleSignIn = () => router.push('/');
  const handleOpenAccount = () => router.push('/signup');

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-white selection:bg-blue-500/30 font-sans tracking-tight">
      {/* Ultra-Thin Global Header */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-[#0A0A0B]/80 backdrop-blur-xl">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <a href="/landing" className="flex items-center gap-2.5">
              <Logo size="sm" showText={true} />
            </a>
            <div className="hidden md:flex items-center gap-6 text-[13px] uppercase tracking-widest font-medium text-white/50">
              <a href="#platform" className="hover:text-white transition-colors">Platform</a>
              <a href="#intelligence" className="hover:text-white transition-colors">Intelligence</a>
              <a href="#security" className="hover:text-white transition-colors">Security</a>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" className="text-sm font-medium hover:bg-white/5" onClick={handleSignIn}>
              Sign In
            </Button>
            <Button className="bg-white text-black hover:bg-white/90 rounded-full px-6 text-sm font-bold shadow-[0_0_20px_rgba(255,255,255,0.15)]" onClick={handleOpenAccount}>
              Open Account
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 lg:pt-48 overflow-hidden">
        <div className="container mx-auto px-6">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="w-full lg:w-1/2 space-y-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-400 text-xs font-bold uppercase tracking-widest">
                Built for the next generation
              </div>
              <h1 className="text-6xl md:text-8xl font-medium leading-[0.85] tracking-tighter">
                Finance <br />
                <span className="text-white/40 italic">Redefined.</span>
              </h1>
              <p className="text-xl text-white/60 max-w-lg leading-relaxed font-light">
                Escape the clutter of traditional banking. One interface to track every asset, 
                predict every expense, and reach your goals faster.
              </p>
              <div className="flex items-center gap-6">
                <Button size="lg" className="h-16 px-10 bg-blue-600 hover:bg-blue-500 rounded-2xl text-lg font-semibold group" onClick={handleOpenAccount}>
                  Get Started <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </Button>
              </div>
            </div>

            {/* Financial Motion Visual */}
            <div className="w-full lg:w-1/2 relative">
              <div className="relative aspect-square rounded-[3rem] overflow-hidden border border-white/10 bg-gradient-to-br from-white/5 to-transparent p-8">
                <div className="absolute inset-0 flex items-end justify-between px-12 pb-20 opacity-20">
                  {[40, 70, 45, 90, 65, 80, 30, 95].map((h, i) => (
                    <div 
                      key={i} 
                      className="w-8 bg-blue-500 rounded-t-lg animate-bounce" 
                      style={{ height: `${h}%`, animationDelay: `${i * 0.1}s`, animationDuration: '3s' }} 
                    />
                  ))}
                </div>
                <div className="relative z-10 w-full h-full flex items-center justify-center">
                  <div className="w-64 h-[500px] bg-neutral-900 rounded-[3rem] border-[8px] border-neutral-800 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 w-full h-6 bg-neutral-800 flex justify-center pt-1">
                      <div className="w-16 h-1 bg-black rounded-full" />
                    </div>
                    {/* Optional image can go here */}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Section */}
      <section id="platform" className="py-32">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Bento Box 1 */}
            <div className="lg:col-span-8 group relative overflow-hidden rounded-[2.5rem] bg-neutral-900 border border-white/5 p-12 transition-all hover:border-blue-500/50">
              <div className="flex flex-col md:flex-row gap-12 items-start">
                <div className="flex-1 space-y-4">
                  <BarChart3 className="w-10 h-10 text-blue-500" />
                  <h3 className="text-3xl font-bold">Predictive Cashflow</h3>
                  <p className="text-white/50 text-lg leading-relaxed">
                    Our neural engine analyzes your past 24 months to predict upcoming trends with 98% accuracy.
                  </p>
                  <ul className="space-y-2 pt-4">
                    {['Automated Tagging', 'Merchant Analysis', 'Recurring Detection'].map(item => (
                      <li key={item} className="flex items-center gap-2 text-sm font-medium text-white/80">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500" /> {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="w-full md:w-1/2 bg-black/40 rounded-2xl p-6 border border-white/5">
                  <div className="h-40 flex items-end gap-2">
                    {[30, 50, 40, 80, 60, 90, 100].map((v, i) => (
                      <div key={i} className="flex-1 bg-gradient-to-t from-blue-600/50 to-blue-400 rounded-sm transition-all duration-700 hover:scale-y-110 cursor-pointer" style={{height: `${v}%`}} />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Bento Box 2 */}
            <div className="lg:col-span-4 rounded-[2.5rem] bg-gradient-to-br from-blue-600 to-violet-700 p-12 flex flex-col justify-between">
               <Shield className="w-12 h-12 text-white" />
               <div className="space-y-4">
                 <h3 className="text-3xl font-bold leading-tight">Fortress Grade <br />Security.</h3>
                 <p className="text-white/80">Hardware-level encryption for every transaction.</p>
               </div>
            </div>

            {/* Bento Box 3 */}
            <div className="lg:col-span-4 rounded-[2.5rem] bg-[#141415] border border-white/5 p-12 group">
                <Grid3x3 className="w-8 h-8 text-violet-400 mb-6" />
                <h4 className="text-xl font-bold mb-3">Multi-Device Sync</h4>
                <p className="text-white/40 mb-8">Your data follows you from Apple Watch to high-res desktop monitors.</p>
            </div>

            {/* Bento Box 4 */}
            <div className="lg:col-span-8 rounded-[2.5rem] bg-[#141415] border border-white/5 p-12 flex flex-col md:flex-row items-center gap-8">
               <div className="flex-1">
                 <h4 className="text-3xl font-bold mb-4 italic">Borderless.</h4>
                 <p className="text-white/50 text-lg">Manage accounts across 40+ countries and 150+ currencies in one unified view.</p>
               </div>
               <div className="flex items-center gap-4 text-sm font-bold opacity-30">
                 <span className="px-4 py-2 border border-white rounded-full">USD</span>
                 <span className="px-4 py-2 border border-white rounded-full">EUR</span>
                 <span className="px-4 py-2 border border-white rounded-full">ZMW</span>
                 <span className="px-4 py-2 border border-white rounded-full">GBP</span>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600/10 rounded-full blur-[120px]" />
        <div className="container mx-auto px-6 relative z-10 text-center">
          <h2 className="text-5xl md:text-7xl font-bold tracking-tighter mb-8">The future of your <br />wealth is KwachaLite.</h2>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button size="lg" className="h-16 px-12 bg-white text-black rounded-full text-lg font-bold" onClick={handleOpenAccount}>Open Your Account</Button>
            <Button size="lg" variant="outline" className="h-16 px-12 rounded-full text-lg font-bold border-white/20" onClick={handleSignIn}>Sign In</Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8">
        <div className="container mx-auto px-6 text-center">
          <p className="text-xs font-medium text-white/40 tracking-widest uppercase">
            Powered by Octet Systems
          </p>
        </div>
      </footer>
    </div>
  );
}