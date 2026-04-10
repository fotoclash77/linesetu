import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Users, Clock, CheckCircle2, User, UserPlus } from 'lucide-react';

const glassStyle = {
  background: 'rgba(255,255,255,0.7)',
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
  border: '1px solid rgba(255,255,255,0.8)',
  boxShadow: '0 8px 32px rgba(31,38,135,0.08)'
};

export function Dashboard() {
  return (
    <div className="min-h-[100dvh] bg-[#F8FAFC] pb-20" style={{ width: 390, margin: '0 auto' }}>
      {/* Header */}
      <div className="px-6 pt-12 pb-6 rounded-b-[40px] bg-white shadow-sm border-b border-gray-100">
        <div className="flex justify-between items-center mb-6">
          <div>
            <p className="text-gray-500 font-medium text-sm">Mon, 24 Oct 2023</p>
            <h1 className="text-2xl font-bold text-gray-900 mt-1">Good Morning,</h1>
            <h2 className="text-xl font-semibold text-[#4F46E5]">Dr. Sharma</h2>
          </div>
          <div className="w-14 h-14 rounded-full bg-gray-200 overflow-hidden border-2 border-white shadow-sm">
             <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=Sharma`} alt="Dr. Sharma" className="w-full h-full object-cover" />
          </div>
        </div>
      </div>

      <div className="px-5 mt-6 space-y-6">
        {/* Metric Cards Row */}
        <div className="flex space-x-3 overflow-x-auto pb-4 snap-x hide-scrollbar" style={{ scrollbarWidth: 'none' }}>
          
          <div className="flex-none w-36 p-4 rounded-3xl snap-start flex flex-col justify-center" style={glassStyle}>
            <div className="w-10 h-10 rounded-2xl bg-[#4F46E5]/10 flex items-center justify-center mb-3 text-[#4F46E5]">
              <Users className="w-5 h-5" />
            </div>
            <p className="text-sm font-medium text-gray-500">Total Today</p>
            <h3 className="text-2xl font-bold text-gray-900 mt-1">24</h3>
            <p className="text-xs text-gray-400 mt-1">patients</p>
          </div>
          
          <div className="flex-none w-36 p-4 rounded-3xl snap-start flex flex-col justify-center" style={glassStyle}>
            <div className="w-10 h-10 rounded-2xl bg-[#06B6D4]/10 flex items-center justify-center mb-3 text-[#06B6D4]">
              <Clock className="w-5 h-5" />
            </div>
            <p className="text-sm font-medium text-gray-500">Active Queue</p>
            <h3 className="text-2xl font-bold text-gray-900 mt-1">8</h3>
            <p className="text-xs text-gray-400 mt-1">waiting</p>
          </div>

          <div className="flex-none w-36 p-4 rounded-3xl snap-start flex flex-col justify-center" style={glassStyle}>
            <div className="w-10 h-10 rounded-2xl bg-[#22C55E]/10 flex items-center justify-center mb-3 text-[#22C55E]">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <p className="text-sm font-medium text-gray-500">Completed</p>
            <h3 className="text-2xl font-bold text-gray-900 mt-1">16</h3>
            <p className="text-xs text-gray-400 mt-1">done</p>
          </div>

        </div>

        {/* Quick Actions */}
        <div className="flex gap-3">
           <Button className="flex-1 rounded-2xl bg-[#4F46E5] hover:bg-[#4F46E5]/90 text-white shadow-lg shadow-[#4F46E5]/30 h-14 text-base font-semibold">
              Open Queue
           </Button>
        </div>

        <div className="flex items-center justify-between p-4 rounded-3xl" style={glassStyle}>
          <div>
            <h4 className="font-semibold text-gray-900">Pause Bookings</h4>
            <p className="text-xs text-gray-500 mt-0.5">Temporarily stop new patients</p>
          </div>
          <Switch className="data-[state=checked]:bg-[#4F46E5]" />
        </div>

        {/* Queue Status */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">Today's Queue Status</h3>
            <a href="#" className="text-sm font-medium text-[#4F46E5]">View All</a>
          </div>

          <div className="space-y-3">
            {[
              { token: 47, name: 'Priya Mehta', type: 'Online', typeColor: 'text-[#22C55E] bg-[#22C55E]/10', current: true },
              { token: 48, name: 'Rajan Gupta', type: 'Walk-in', typeColor: 'text-[#06B6D4] bg-[#06B6D4]/10' },
              { token: 49, name: 'Sunita Patel', type: 'Online', typeColor: 'text-[#22C55E] bg-[#22C55E]/10' }
            ].map((patient, i) => (
              <div key={i} className="p-4 rounded-3xl flex items-center justify-between" style={{
                ...glassStyle,
                ...(patient.current ? { borderColor: '#4F46E5', background: 'rgba(79, 70, 229, 0.05)' } : {})
              }}>
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg ${patient.current ? 'bg-[#4F46E5] text-white shadow-md shadow-[#4F46E5]/30' : 'bg-white text-gray-700'}`}>
                    {patient.token}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{patient.name}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${patient.typeColor}`}>
                        {patient.type}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
