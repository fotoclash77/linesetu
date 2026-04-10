import React from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle2, ChevronRight, SkipForward, ArrowRight, Activity } from 'lucide-react';

const glassStyle = {
  background: 'rgba(255,255,255,0.7)',
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
  border: '1px solid rgba(255,255,255,0.8)',
  boxShadow: '0 8px 32px rgba(31,38,135,0.08)'
};

export function MasterQueue() {
  return (
    <div className="min-h-[100dvh] bg-[#F8FAFC] pb-32" style={{ width: 390, margin: '0 auto' }}>
      
      {/* Header & Hero Display */}
      <div className="pt-12 px-6 pb-8 bg-gradient-to-b from-white to-[#F8FAFC] border-b border-gray-100 rounded-b-[40px] shadow-sm">
        <div className="flex justify-center mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#22C55E]/10 border border-[#22C55E]/20">
            <span className="w-2 h-2 rounded-full bg-[#22C55E] animate-pulse"></span>
            <span className="text-xs font-bold text-[#22C55E] uppercase tracking-wide">Dr. Sharma — Consulting</span>
          </div>
        </div>
        
        <div className="text-center">
          <h2 className="text-gray-500 font-medium text-sm tracking-wide uppercase mb-2">Current Token</h2>
          <div className="text-[100px] font-extrabold text-[#4F46E5] leading-none tracking-tighter tabular-nums drop-shadow-sm">
            47
          </div>
        </div>
      </div>

      {/* Patient List */}
      <div className="px-5 mt-6 space-y-4">
        {[
          { token: 47, name: 'Priya Mehta', type: 'Online', typeColor: 'text-[#22C55E] bg-[#22C55E]/10 border-[#22C55E]/20', isCurrent: true },
          { token: 48, name: 'Rajan Gupta', type: 'Walk-in', typeColor: 'text-[#06B6D4] bg-[#06B6D4]/10 border-[#06B6D4]/20' },
          { token: 49, name: 'Sunita Patel', type: 'Online', typeColor: 'text-[#22C55E] bg-[#22C55E]/10 border-[#22C55E]/20' },
          { token: 50, name: 'Arvind Kumar', type: 'Walk-in', typeColor: 'text-[#06B6D4] bg-[#06B6D4]/10 border-[#06B6D4]/20' },
        ].map((patient, i) => (
          <div 
            key={i} 
            className={`p-4 rounded-3xl flex items-center justify-between transition-all ${
              patient.isCurrent 
                ? 'bg-[#4F46E5]/5 border-[#4F46E5] border-2 shadow-md' 
                : 'border border-white shadow-sm'
            }`} 
            style={patient.isCurrent ? {} : glassStyle}
          >
            <div className="flex items-center gap-4">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-2xl ${
                patient.isCurrent 
                  ? 'bg-[#4F46E5] text-white shadow-lg shadow-[#4F46E5]/30' 
                  : 'bg-white text-gray-800 border border-gray-100'
              }`}>
                {patient.token}
              </div>
              <div>
                <h4 className={`font-bold text-lg ${patient.isCurrent ? 'text-[#4F46E5]' : 'text-gray-900'}`}>
                  {patient.name}
                </h4>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border ${patient.typeColor}`}>
                    {patient.type}
                  </span>
                  {patient.isCurrent && (
                     <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#4F46E5] text-white">
                        In Cabin
                     </span>
                  )}
                </div>
              </div>
            </div>
            
            {patient.isCurrent && (
              <Activity className="text-[#4F46E5] w-6 h-6 animate-pulse" />
            )}
          </div>
        ))}
      </div>

      {/* Floating Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 w-[390px] mx-auto p-4 z-50">
        <div className="p-3 rounded-[2rem] flex items-center justify-between gap-2 shadow-2xl" style={{
          background: 'rgba(255,255,255,0.9)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,1)',
        }}>
          <Button variant="outline" className="flex-1 rounded-2xl h-14 bg-amber-50 hover:bg-amber-100 text-amber-600 border-amber-200 font-bold">
            <SkipForward className="w-5 h-5 mr-1" />
            Skip
          </Button>
          
          <Button className="flex-1 rounded-2xl h-14 bg-[#22C55E] hover:bg-[#22C55E]/90 text-white shadow-lg shadow-[#22C55E]/30 font-bold border-none">
            <CheckCircle2 className="w-5 h-5 mr-1" />
            Done
          </Button>

          <Button className="flex-1 rounded-2xl h-14 bg-[#4F46E5] hover:bg-[#4F46E5]/90 text-white shadow-lg shadow-[#4F46E5]/30 font-bold border-none">
            Next
            <ArrowRight className="w-5 h-5 ml-1" />
          </Button>
        </div>
      </div>
      
    </div>
  );
}
