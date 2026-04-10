import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Calendar, Clock, MapPin, AlertCircle } from 'lucide-react';

const glassStyle = {
  background: 'rgba(255, 255, 255, 0.7)',
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
  border: '1px solid rgba(255, 255, 255, 0.8)',
  boxShadow: '0 8px 32px rgba(31, 38, 135, 0.08)'
};

export function Booking() {
  return (
    <div className="flex flex-col min-h-[100dvh] w-full max-w-[390px] mx-auto relative bg-slate-50 overflow-hidden pb-24">
      {/* Header */}
      <div className="px-4 pt-6 pb-2 flex items-center gap-3">
        <button className="p-2 rounded-full bg-white shadow-sm border border-slate-100 text-slate-600">
          <ChevronLeft size={20} />
        </button>
        <h1 className="text-lg font-bold text-slate-900 flex-1 text-center pr-10">Confirm Booking</h1>
      </div>

      <div className="px-4 py-4 flex-1 overflow-y-auto space-y-4">
        
        {/* Summary Card */}
        <div className="rounded-3xl p-5 flex flex-col gap-4" style={glassStyle}>
          <div className="flex gap-4 items-center border-b border-white/60 pb-4">
            <div className="w-14 h-14 rounded-full bg-rose-100 border-2 border-white shadow-sm flex items-center justify-center shrink-0">
              <span className="text-lg font-bold text-rose-700">AS</span>
            </div>
            <div>
              <h2 className="font-bold text-slate-900 text-lg">Dr. Ananya Sharma</h2>
              <p className="text-cyan-700 text-sm font-medium">Cardiologist</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-start gap-2">
              <Calendar size={16} className="text-slate-400 mt-0.5" />
              <div>
                <p className="text-xs text-slate-500 font-medium">Date</p>
                <p className="text-sm font-semibold text-slate-900">Today, 24 Oct</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Clock size={16} className="text-slate-400 mt-0.5" />
              <div>
                <p className="text-xs text-slate-500 font-medium">Estimated Time</p>
                <p className="text-sm font-semibold text-slate-900">02:15 PM</p>
              </div>
            </div>
          </div>
          
          <div className="bg-indigo-50 rounded-2xl p-4 flex flex-col items-center justify-center mt-2 border border-indigo-100">
            <p className="text-xs text-indigo-600 font-semibold uppercase tracking-wider mb-1">Your Token Number</p>
            <p className="text-4xl font-extrabold text-indigo-700">#57</p>
            <div className="mt-2 text-sm font-medium text-slate-600 bg-white/60 px-3 py-1 rounded-full">
              14 people ahead
            </div>
          </div>
        </div>

        {/* Fee Breakdown */}
        <div className="rounded-3xl p-5" style={glassStyle}>
          <h3 className="font-bold text-slate-900 mb-4">Payment Summary</h3>
          
          <div className="space-y-3 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-slate-600">Platform Booking Fee</span>
              <span className="font-medium text-slate-900">₹10</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-600 flex items-center gap-1.5">
                Consultation Fee
                <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded font-bold uppercase">Pay at clinic</span>
              </span>
              <span className="font-medium text-slate-900">₹500</span>
            </div>
            
            <div className="h-px bg-slate-200/60 my-2"></div>
            
            <div className="flex justify-between items-center text-lg font-bold">
              <span className="text-slate-900">Pay Now</span>
              <span className="text-indigo-600">₹10</span>
            </div>
          </div>
        </div>

        <div className="flex items-start gap-2 p-3 bg-amber-50 rounded-xl border border-amber-100">
          <AlertCircle size={16} className="text-amber-500 mt-0.5 shrink-0" />
          <p className="text-xs text-amber-700 leading-relaxed font-medium">
            Please arrive at the clinic when your token is 5 numbers away. Consultation fee of ₹500 is to be paid directly at the clinic.
          </p>
        </div>
      </div>

      {/* Bottom Action */}
      <div className="fixed bottom-0 w-full max-w-[390px] px-4 py-4 bg-white/80 backdrop-blur-md border-t border-slate-200/50 z-20 pb-safe">
        <Button className="w-full h-14 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-lg shadow-lg shadow-indigo-200">
          Confirm & Pay ₹10
        </Button>
      </div>
    </div>
  );
}
