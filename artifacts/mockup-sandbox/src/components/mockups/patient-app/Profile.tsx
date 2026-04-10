import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronRight, Settings, Bell, HelpCircle, Shield, LogOut, HomeIcon, CalendarDays, User as UserIcon, HeartPulse } from 'lucide-react';

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

export function Profile() {
  const menuItems = [
    { icon: <HeartPulse size={20} />, label: "My Medical Records", color: "text-rose-500", bg: "bg-rose-50" },
    { icon: <Settings size={20} />, label: "Account Settings", color: "text-slate-700", bg: "bg-slate-100" },
    { icon: <Bell size={20} />, label: "Notifications", color: "text-indigo-500", bg: "bg-indigo-50" },
    { icon: <HelpCircle size={20} />, label: "Help & Support", color: "text-cyan-600", bg: "bg-cyan-50" },
    { icon: <Shield size={20} />, label: "Privacy Policy", color: "text-emerald-600", bg: "bg-emerald-50" },
  ];

  return (
    <div className="flex flex-col min-h-[100dvh] w-full max-w-[390px] mx-auto relative bg-slate-50 overflow-hidden pb-20">
      
      {/* Decorative background */}
      <div className="absolute top-0 left-0 w-full h-[200px] bg-gradient-to-b from-indigo-100/50 to-transparent pointer-events-none" />

      <div className="px-4 pt-10 pb-6 flex flex-col items-center z-10 relative">
        <div className="relative">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500 to-cyan-500 p-1 shadow-lg">
            <div className="w-full h-full rounded-full bg-white flex items-center justify-center border-2 border-white">
              <span className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-cyan-500 bg-clip-text text-transparent">RK</span>
            </div>
          </div>
          <button className="absolute bottom-0 right-0 bg-white border border-slate-200 p-1.5 rounded-full shadow-sm text-slate-600">
            <Settings size={14} />
          </button>
        </div>
        
        <h1 className="text-2xl font-bold text-slate-900 mt-4">Rahul Kumar</h1>
        <p className="text-slate-500 font-medium mt-1">+91 98765 43210</p>
      </div>

      <div className="px-4 py-2 flex-1 overflow-y-auto space-y-6 z-10 relative">
        
        {/* Info Cards List */}
        <div className="rounded-3xl p-2 space-y-1" style={glassStyle}>
          {menuItems.map((item, i) => (
            <button key={i} className="w-full flex items-center p-3 rounded-2xl hover:bg-white/60 transition-colors group">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${item.bg} ${item.color}`}>
                {item.icon}
              </div>
              <span className="flex-1 text-left px-4 font-semibold text-slate-800">{item.label}</span>
              <ChevronRight size={18} className="text-slate-300 group-hover:text-indigo-500 transition-colors" />
            </button>
          ))}
        </div>

        <div className="px-2">
          <button className="w-full flex items-center p-4 rounded-2xl bg-white border border-red-100 text-red-600 font-bold justify-center gap-2 hover:bg-red-50 transition-colors shadow-sm">
            <LogOut size={18} /> Logout
          </button>
        </div>

        <div className="text-center pb-8">
          <p className="text-xs text-slate-400 font-medium">LINESETU Patient App</p>
          <p className="text-[10px] text-slate-400">Version 1.0.4 (Build 42)</p>
        </div>

      </div>

      {/* Bottom Nav */}
      <div className="fixed bottom-0 w-full max-w-[390px] px-6 py-4 border-t border-slate-200/50 flex justify-between items-center z-20 pb-safe" style={topBarStyle}>
        <button className="flex flex-col items-center gap-1 text-slate-400 hover:text-slate-600 transition-colors">
          <div className="p-1.5"><HomeIcon size={22} /></div>
          <span className="text-[10px] font-medium">Home</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-slate-400 hover:text-slate-600 transition-colors">
          <div className="p-1.5"><CalendarDays size={22} /></div>
          <span className="text-[10px] font-medium">Bookings</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-indigo-600">
          <div className="p-1.5 bg-indigo-50 rounded-xl"><UserIcon size={22} strokeWidth={2.5} /></div>
          <span className="text-[10px] font-semibold">Profile</span>
        </button>
      </div>

    </div>
  );
}
