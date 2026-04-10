import React from 'react';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, Clock, HomeIcon, CalendarDays, User, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const glassStyle = {
  background: 'rgba(255, 255, 255, 0.7)',
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
  border: '1px solid rgba(255, 255, 255, 0.8)',
  boxShadow: '0 8px 32px rgba(31, 38, 135, 0.08)'
};

const topBarStyle = {
  background: 'rgba(248, 250, 252, 0.8)',
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
};

export function MyBookings() {
  return (
    <div className="flex flex-col min-h-[100dvh] w-full max-w-[390px] mx-auto relative bg-slate-50 overflow-hidden pb-20">
      
      {/* Header */}
      <div className="px-4 pt-6 pb-2" style={topBarStyle}>
        <h1 className="text-2xl font-bold text-slate-900">My Bookings</h1>
        
        <div className="flex mt-6 border-b border-slate-200">
          <button className="flex-1 pb-3 text-center font-semibold text-indigo-600 border-b-2 border-indigo-600">
            Active
          </button>
          <button className="flex-1 pb-3 text-center font-medium text-slate-400 hover:text-slate-600 transition-colors">
            Completed
          </button>
        </div>
      </div>

      <div className="px-4 py-4 flex-1 overflow-y-auto space-y-4">
        
        {/* Booking Card 1 */}
        <div className="rounded-3xl p-5 border-2 border-indigo-100/50" style={glassStyle}>
          <div className="flex justify-between items-start mb-4">
            <div className="flex gap-3">
              <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center font-bold text-rose-700 shrink-0">
                AS
              </div>
              <div>
                <h3 className="font-bold text-slate-900 leading-tight">Dr. Ananya Sharma</h3>
                <p className="text-xs text-cyan-700 font-medium mt-0.5">Cardiology</p>
              </div>
            </div>
            <Badge className="bg-green-100 text-green-700 hover:bg-green-200 border-0 shrink-0">
              Today
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4 bg-white/50 rounded-2xl p-3">
            <div>
              <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mb-0.5">Your Token</p>
              <p className="text-2xl font-extrabold text-indigo-600">#56</p>
            </div>
            <div className="flex flex-col justify-center border-l border-slate-200 pl-3">
              <span className="text-sm font-semibold text-slate-900">14 ahead</span>
              <span className="text-xs text-orange-600 font-medium">~35m wait</span>
            </div>
          </div>

          <Button className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium">
            View Live Queue
          </Button>
        </div>

        {/* Booking Card 2 */}
        <div className="rounded-3xl p-5" style={glassStyle}>
          <div className="flex justify-between items-start mb-4">
            <div className="flex gap-3">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-700 shrink-0">
                VP
              </div>
              <div>
                <h3 className="font-bold text-slate-900 leading-tight">Dr. Vikram Patel</h3>
                <p className="text-xs text-cyan-700 font-medium mt-0.5">Dermatology</p>
              </div>
            </div>
            <Badge variant="outline" className="bg-slate-100 text-slate-600 hover:bg-slate-200 border-0 shrink-0">
              Tomorrow
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4 bg-white/50 rounded-2xl p-3">
            <div>
              <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mb-0.5">Your Token</p>
              <p className="text-2xl font-extrabold text-slate-700">#12</p>
            </div>
            <div className="flex flex-col justify-center border-l border-slate-200 pl-3">
              <span className="text-sm font-semibold text-slate-900">Est. 10:30 AM</span>
              <span className="text-xs text-slate-500 font-medium">Queue not started</span>
            </div>
          </div>

          <Button variant="outline" className="w-full rounded-xl font-medium border-slate-200 text-slate-700 bg-white/50 hover:bg-white">
            Booking Details
          </Button>
        </div>

        <h3 className="font-bold text-slate-900 mt-6 mb-2 pl-1">Past Bookings</h3>

        {/* Completed Card (Preview) */}
        <div className="rounded-3xl p-4 bg-white/40 border border-slate-200/50 opacity-70">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-semibold text-slate-800">Dr. Rohan Desai</h3>
              <p className="text-xs text-slate-500 mt-0.5">12 Oct 2023</p>
            </div>
            <Badge variant="secondary" className="bg-slate-200 text-slate-600 border-0">
              Completed
            </Badge>
          </div>
        </div>

      </div>

      {/* Bottom Nav */}
      <div className="fixed bottom-0 w-full max-w-[390px] px-6 py-4 border-t border-slate-200/50 flex justify-between items-center z-20 pb-safe" style={topBarStyle}>
        <button className="flex flex-col items-center gap-1 text-slate-400 hover:text-slate-600 transition-colors">
          <div className="p-1.5"><HomeIcon size={22} strokeWidth={2} /></div>
          <span className="text-[10px] font-medium">Home</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-indigo-600">
          <div className="p-1.5 bg-indigo-50 rounded-xl"><CalendarDays size={22} strokeWidth={2.5} /></div>
          <span className="text-[10px] font-semibold">Bookings</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-slate-400 hover:text-slate-600 transition-colors">
          <div className="p-1.5"><User size={22} /></div>
          <span className="text-[10px] font-medium">Profile</span>
        </button>
      </div>

    </div>
  );
}
