import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, MapPin, Star, Clock, Users, IndianRupee } from 'lucide-react';

const glassStyle = {
  background: 'rgba(255, 255, 255, 0.7)',
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
  border: '1px solid rgba(255, 255, 255, 0.8)',
  boxShadow: '0 8px 32px rgba(31, 38, 135, 0.08)'
};

export function DoctorDetail() {
  return (
    <div className="flex flex-col min-h-[100dvh] w-full max-w-[390px] mx-auto relative bg-slate-50 overflow-hidden pb-24">
      {/* Header */}
      <div className="px-4 pt-6 pb-2 flex items-center gap-3">
        <button className="p-2 rounded-full bg-white shadow-sm border border-slate-100 text-slate-600">
          <ChevronLeft size={20} />
        </button>
        <h1 className="text-lg font-bold text-slate-900 flex-1 text-center pr-10">Doctor Profile</h1>
      </div>

      <div className="px-4 py-4 flex-1 overflow-y-auto space-y-6">
        
        {/* Hero Card */}
        <div className="rounded-3xl p-6 flex flex-col items-center text-center relative mt-8" style={glassStyle}>
          <div className="absolute -top-10 w-24 h-24 rounded-full bg-rose-100 border-4 border-white shadow-md flex items-center justify-center">
            <span className="text-3xl font-bold text-rose-700">AS</span>
          </div>
          
          <div className="mt-12 w-full">
            <h2 className="text-2xl font-bold text-slate-900">Dr. Ananya Sharma</h2>
            <Badge className="mt-2 bg-cyan-50 text-cyan-700 hover:bg-cyan-100 font-medium border-0">
              Cardiologist • 12 Yrs Exp
            </Badge>
            
            <div className="flex items-center justify-center gap-1 mt-3 text-sm text-slate-600">
              <MapPin size={14} className="text-slate-400" />
              <span>HeartCare Clinic, Andheri West</span>
            </div>
            
            <div className="flex items-center justify-center gap-1 mt-2 font-semibold text-slate-800">
              <IndianRupee size={14} className="text-green-600" />
              <span>500 <span className="text-xs font-normal text-slate-500">(Pay at clinic)</span></span>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-2xl p-3 flex flex-col items-center justify-center text-center gap-1" style={glassStyle}>
            <div className="p-2 rounded-full bg-amber-50 text-amber-500"><Star size={18} fill="currentColor" /></div>
            <span className="text-sm font-bold text-slate-900">4.8</span>
            <span className="text-[10px] text-slate-500 font-medium">Rating</span>
          </div>
          <div className="rounded-2xl p-3 flex flex-col items-center justify-center text-center gap-1" style={glassStyle}>
            <div className="p-2 rounded-full bg-indigo-50 text-indigo-500"><Users size={18} /></div>
            <span className="text-sm font-bold text-slate-900">5k+</span>
            <span className="text-[10px] text-slate-500 font-medium">Patients</span>
          </div>
          <div className="rounded-2xl p-3 flex flex-col items-center justify-center text-center gap-1" style={glassStyle}>
            <div className="p-2 rounded-full bg-green-50 text-green-500"><Clock size={18} /></div>
            <span className="text-sm font-bold text-slate-900">10am-8pm</span>
            <span className="text-[10px] text-slate-500 font-medium">Timing</span>
          </div>
        </div>

        {/* Queue Status */}
        <div className="rounded-3xl p-5 border-2 border-indigo-100" style={glassStyle}>
          <div className="flex items-center gap-2 mb-4">
            <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></span>
            <h3 className="font-bold text-slate-900">Live Queue Status</h3>
          </div>
          
          <div className="flex justify-between items-center bg-white/50 rounded-2xl p-4 mb-4">
            <div className="text-center">
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wide mb-1">Current</p>
              <p className="text-2xl font-bold text-slate-900">42</p>
            </div>
            <div className="w-px h-10 bg-slate-200"></div>
            <div className="text-center">
              <p className="text-xs text-indigo-600 font-bold uppercase tracking-wide mb-1">Your Est.</p>
              <p className="text-2xl font-bold text-indigo-600">56</p>
            </div>
          </div>
          
          <div className="flex justify-between text-sm font-medium px-2">
            <span className="text-slate-600">14 people ahead</span>
            <span className="text-orange-600">~35 min wait</span>
          </div>
        </div>
      </div>

      {/* Bottom Action */}
      <div className="fixed bottom-0 w-full max-w-[390px] px-4 py-4 bg-white/80 backdrop-blur-md border-t border-slate-200/50 z-20 pb-safe">
        <Button className="w-full h-14 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-lg shadow-lg shadow-indigo-200">
          Book Appointment
        </Button>
      </div>
    </div>
  );
}
