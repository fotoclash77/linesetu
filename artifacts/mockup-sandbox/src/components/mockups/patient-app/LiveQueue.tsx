import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, RefreshCcw, Bell, MapPin, Clock } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

const glassStyle = {
  background: 'rgba(255, 255, 255, 0.7)',
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
  border: '1px solid rgba(255, 255, 255, 0.8)',
  boxShadow: '0 8px 32px rgba(31, 38, 135, 0.08)'
};

export function LiveQueue() {
  return (
    <div className="flex flex-col min-h-[100dvh] w-full max-w-[390px] mx-auto relative bg-slate-50 overflow-hidden pb-10">
      {/* Decorative gradient blob */}
      <div className="absolute top-[-15%] left-1/2 -translate-x-1/2 w-[400px] h-[400px] rounded-full bg-indigo-100/60 blur-[80px] pointer-events-none" />

      {/* Header */}
      <div className="px-4 pt-6 pb-2 flex items-center justify-between z-10 relative">
        <button className="p-2 rounded-full bg-white shadow-sm border border-slate-100 text-slate-600">
          <ChevronLeft size={20} />
        </button>
        <div className="flex items-center gap-2 bg-green-100 text-green-700 px-3 py-1.5 rounded-full">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
          <span className="text-xs font-bold tracking-wider uppercase">Live</span>
        </div>
      </div>

      <div className="px-4 py-4 flex-1 flex flex-col items-center justify-start mt-4 z-10">
        
        <h2 className="text-slate-500 font-semibold mb-2 uppercase tracking-widest text-sm">Current Token</h2>
        
        {/* Huge Number Display */}
        <div className="relative flex justify-center items-center h-40 w-full mb-8">
          <div className="absolute inset-0 bg-gradient-to-b from-indigo-50/0 to-indigo-50/50 rounded-[3rem]"></div>
          <span className="text-[120px] font-black tracking-tighter text-indigo-600 drop-shadow-sm leading-none" style={{ textShadow: '0 8px 24px rgba(79, 70, 229, 0.15)' }}>
            47
          </span>
        </div>

        {/* Patient Status Card */}
        <div className="w-full rounded-3xl p-6 text-center shadow-lg relative border-2 border-indigo-100" style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(20px)' }}>
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-indigo-600 text-white px-4 py-1 rounded-full text-sm font-bold shadow-md">
            Your Token
          </div>
          
          <p className="text-4xl font-extrabold text-slate-900 mt-4 mb-2">#56</p>
          <p className="text-lg font-medium text-slate-600">
            <strong className="text-indigo-600">9 people</strong> ahead of you
          </p>
          
          <div className="mt-6 mb-3">
            <div className="flex justify-between text-xs font-semibold text-slate-500 mb-2 px-1">
              <span>Token 47</span>
              <span>Token 56</span>
            </div>
            <Progress value={20} className="h-3 bg-slate-100 [&>div]:bg-indigo-500" />
          </div>
          
          <div className="flex items-center justify-center gap-2 mt-5 text-slate-700 bg-slate-50 py-3 rounded-2xl">
            <Clock size={18} className="text-orange-500" />
            <span className="font-semibold">Est. Wait: <span className="text-orange-600">~22 minutes</span></span>
          </div>
        </div>

        {/* Status Pills */}
        <div className="flex w-full gap-3 mt-6">
          <div className="flex-1 flex items-center justify-center gap-2 p-3 rounded-2xl bg-emerald-50 text-emerald-700 font-medium text-sm border border-emerald-100">
            <div className="w-2 h-2 rounded-full bg-emerald-500"></div> Clinic Open
          </div>
          <div className="flex-1 flex items-center justify-center gap-2 p-3 rounded-2xl bg-emerald-50 text-emerald-700 font-medium text-sm border border-emerald-100">
            <div className="w-2 h-2 rounded-full bg-emerald-500"></div> Dr. Available
          </div>
        </div>

        <div className="mt-8 flex items-center gap-1.5 text-slate-400 text-xs font-medium">
          <RefreshCcw size={12} className="animate-[spin_4s_linear_infinite]" />
          Updates automatically
        </div>

        {/* Reminder notification */}
        <div className="w-full mt-auto mb-4 bg-indigo-50 p-4 rounded-2xl flex gap-3 items-start border border-indigo-100">
          <div className="p-2 bg-indigo-100 rounded-full text-indigo-600 shrink-0">
            <Bell size={18} />
          </div>
          <div>
            <h4 className="font-bold text-indigo-900 text-sm">Be ready!</h4>
            <p className="text-xs text-indigo-700/80 mt-0.5 leading-relaxed font-medium">We'll send a notification when you are 3 tokens away. Please start heading to the clinic soon.</p>
          </div>
        </div>

      </div>
    </div>
  );
}
