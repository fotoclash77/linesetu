import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChevronLeft, Lock, ShieldCheck, CheckCircle2 } from 'lucide-react';

const glassStyle = {
  background: 'rgba(255, 255, 255, 0.7)',
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
  border: '1px solid rgba(255, 255, 255, 0.8)',
  boxShadow: '0 8px 32px rgba(31, 38, 135, 0.08)'
};

export function Payment() {
  return (
    <div className="flex flex-col min-h-[100dvh] w-full max-w-[390px] mx-auto relative bg-slate-50 overflow-hidden pb-24">
      {/* Header */}
      <div className="px-4 pt-6 pb-2 flex items-center gap-3">
        <button className="p-2 rounded-full bg-white shadow-sm border border-slate-100 text-slate-600">
          <ChevronLeft size={20} />
        </button>
        <h1 className="text-lg font-bold text-slate-900 flex-1 text-center pr-10">Payment</h1>
      </div>

      <div className="px-4 py-4 flex-1 overflow-y-auto space-y-6">
        
        {/* Amount Card */}
        <div className="rounded-3xl p-6 flex flex-col items-center justify-center bg-indigo-600 text-white shadow-lg shadow-indigo-200">
          <p className="text-indigo-100 text-sm font-medium mb-1">Platform Booking Fee</p>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold">₹</span>
            <span className="text-5xl font-extrabold tracking-tight">10</span>
          </div>
          <div className="mt-4 inline-flex items-center gap-1.5 bg-white/20 px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm">
            <ShieldCheck size={14} /> Secure Checkout
          </div>
        </div>

        {/* Note */}
        <div className="text-center text-sm font-medium text-slate-600">
          Note: Consultation fee (₹500) will be paid at the clinic.
        </div>

        {/* Payment Methods */}
        <div className="space-y-3">
          <h3 className="font-bold text-slate-900 ml-1">Select Payment Method</h3>
          
          <div className="rounded-2xl p-4 border-2 border-indigo-500 bg-indigo-50/50 flex flex-col gap-4 relative">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm">
                  <span className="font-bold text-indigo-700">UPI</span>
                </div>
                <span className="font-semibold text-slate-900">UPI / QR</span>
              </div>
              <CheckCircle2 className="text-indigo-600" size={24} />
            </div>
            
            <div className="pt-2">
              <Input 
                placeholder="Enter UPI ID (e.g. rahul@okicici)" 
                className="h-12 rounded-xl bg-white border-indigo-200 focus-visible:ring-indigo-500"
              />
            </div>
          </div>

          <div className="rounded-2xl p-4" style={glassStyle}>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3 text-slate-600">
                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                  <span className="font-bold text-slate-500 text-xs">CARD</span>
                </div>
                <span className="font-medium">Credit / Debit Card</span>
              </div>
              <div className="w-5 h-5 rounded-full border-2 border-slate-300"></div>
            </div>
          </div>

          <div className="rounded-2xl p-4" style={glassStyle}>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3 text-slate-600">
                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                  <span className="font-bold text-slate-500 text-xs">WLT</span>
                </div>
                <span className="font-medium">Wallets</span>
              </div>
              <div className="w-5 h-5 rounded-full border-2 border-slate-300"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Action */}
      <div className="fixed bottom-0 w-full max-w-[390px] px-4 py-4 bg-white/80 backdrop-blur-md border-t border-slate-200/50 z-20 pb-safe">
        <Button className="w-full h-14 rounded-2xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-700 hover:to-indigo-600 text-white font-semibold text-lg shadow-lg shadow-indigo-200 flex items-center justify-center gap-2">
          <Lock size={18} /> Pay ₹10 Securely
        </Button>
        <p className="text-center text-[10px] text-slate-400 mt-3 flex items-center justify-center gap-1">
          <Lock size={10} /> 256-bit SSL encrypted • Powered by LINESETU
        </p>
      </div>
    </div>
  );
}
