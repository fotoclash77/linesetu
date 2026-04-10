import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const glassStyle = {
  background: 'rgba(255, 255, 255, 0.7)',
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
  border: '1px solid rgba(255, 255, 255, 0.8)',
  boxShadow: '0 8px 32px rgba(31, 38, 135, 0.08)'
};

export function Login() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[100dvh] w-full max-w-[390px] mx-auto relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #EEF2FF 0%, #F0FDFB 100%)' }}>
      
      {/* Decorative background blobs */}
      <div className="absolute top-[-10%] left-[-20%] w-[300px] h-[300px] rounded-full bg-indigo-200/50 blur-[60px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-20%] w-[300px] h-[300px] rounded-full bg-cyan-200/50 blur-[60px] pointer-events-none" />

      <div className="w-full px-6 z-10">
        <div 
          className="rounded-3xl p-8 flex flex-col items-center text-center"
          style={glassStyle}
        >
          <div className="mb-2">
            <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-600 to-cyan-500 bg-clip-text text-transparent">
              LINESETU
            </h1>
          </div>
          
          <p className="text-slate-600 font-medium mb-8">
            Smart Queue. Zero Wait Anxiety.
          </p>

          <div className="w-full space-y-4">
            <div className="space-y-1">
              <Input 
                type="tel" 
                placeholder="Enter Mobile Number" 
                className="h-14 rounded-2xl bg-white/60 border-white/80 focus-visible:ring-indigo-500 shadow-sm text-center text-lg placeholder:text-slate-400"
                defaultValue="9876543210"
              />
            </div>
            
            <div className="space-y-1">
              <Input 
                type="text" 
                placeholder="Enter OTP" 
                className="h-14 rounded-2xl bg-white/60 border-white/80 focus-visible:ring-indigo-500 shadow-sm text-center text-lg tracking-widest placeholder:text-slate-400"
                defaultValue="4285"
              />
            </div>

            <Button 
              className="w-full h-14 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-lg shadow-lg shadow-indigo-200 transition-all active:scale-[0.98] mt-4"
            >
              Verify & Login
            </Button>
          </div>

          <div className="mt-8 text-sm text-slate-500">
            By continuing, you agree to our <a href="#" className="text-indigo-600 hover:underline">Terms of Service</a> & <a href="#" className="text-indigo-600 hover:underline">Privacy Policy</a>
          </div>
        </div>
      </div>
    </div>
  );
}
