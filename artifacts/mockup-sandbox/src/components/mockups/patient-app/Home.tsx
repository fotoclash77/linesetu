import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, Search, MapPin, Home as HomeIcon, CalendarDays, User } from 'lucide-react';

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

export function Home() {
  const doctors = [
    { id: 1, name: "Dr. Ananya Sharma", spec: "Cardiologist", clinic: "HeartCare Clinic", loc: "Andheri West", token: 47, wait: "25 min", initials: "AS", color: "bg-rose-100 text-rose-700" },
    { id: 2, name: "Dr. Vikram Patel", spec: "Dermatologist", clinic: "Skin Glow Center", loc: "Bandra East", token: 12, wait: "10 min", initials: "VP", color: "bg-blue-100 text-blue-700" },
    { id: 3, name: "Dr. Rohan Desai", spec: "Pediatrician", clinic: "Little Smiles Hospital", loc: "Powai", token: 89, wait: "45 min", initials: "RD", color: "bg-emerald-100 text-emerald-700" }
  ];

  return (
    <div className="flex flex-col min-h-[100dvh] w-full max-w-[390px] mx-auto relative bg-slate-50 overflow-hidden pb-20">
      {/* Fixed Header */}
      <div className="sticky top-0 z-20 px-4 pt-6 pb-4 border-b border-slate-200/50" style={topBarStyle}>
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-slate-500 text-sm font-medium">Good Morning,</h2>
            <h1 className="text-xl font-bold text-slate-900">Hello, Rahul 👋</h1>
          </div>
          <button className="relative p-2 rounded-full bg-white shadow-sm border border-slate-100 text-slate-600">
            <Bell size={20} />
            <span className="absolute top-1.5 right-2 w-2 h-2 bg-rose-500 rounded-full border border-white"></span>
          </button>
        </div>

        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <Input 
            placeholder="Search doctors, clinics..." 
            className="pl-11 h-12 rounded-2xl bg-white/80 border-white shadow-sm focus-visible:ring-indigo-500 text-base"
            style={glassStyle}
          />
        </div>
      </div>

      <div className="px-4 py-6 flex-1 overflow-y-auto">
        <div className="flex justify-between items-end mb-4">
          <h2 className="text-lg font-bold text-slate-900">Nearby Doctors</h2>
          <button className="text-sm font-medium text-indigo-600">See All</button>
        </div>

        <div className="space-y-4">
          {doctors.map(doc => (
            <div key={doc.id} className="rounded-3xl p-4 flex flex-col gap-3" style={glassStyle}>
              <div className="flex items-start gap-3">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${doc.color}`}>
                  {doc.initials}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-slate-900 leading-tight">{doc.name}</h3>
                  </div>
                  <Badge variant="secondary" className="mt-1 bg-cyan-50 text-cyan-700 hover:bg-cyan-100 font-medium px-2 py-0">
                    {doc.spec}
                  </Badge>
                  <div className="flex items-center text-xs text-slate-500 mt-2">
                    <MapPin size={12} className="mr-1 shrink-0" />
                    <span className="truncate">{doc.clinic}, {doc.loc}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between mt-1 pt-3 border-t border-white/50">
                <div className="flex flex-col">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                    <span className="text-xs font-semibold text-green-700">Token #{doc.token} Live</span>
                  </div>
                  <span className="text-xs font-medium text-slate-500 mt-0.5">~{doc.wait} wait</span>
                </div>
                <Button size="sm" className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-200 h-9 px-4">
                  Get Token
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Nav */}
      <div className="fixed bottom-0 w-full max-w-[390px] px-6 py-4 border-t border-slate-200/50 flex justify-between items-center z-20 pb-safe" style={topBarStyle}>
        <button className="flex flex-col items-center gap-1 text-indigo-600">
          <div className="p-1.5 bg-indigo-50 rounded-xl"><HomeIcon size={22} strokeWidth={2.5} /></div>
          <span className="text-[10px] font-semibold">Home</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-slate-400 hover:text-slate-600 transition-colors">
          <div className="p-1.5"><CalendarDays size={22} /></div>
          <span className="text-[10px] font-medium">Bookings</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-slate-400 hover:text-slate-600 transition-colors">
          <div className="p-1.5"><User size={22} /></div>
          <span className="text-[10px] font-medium">Profile</span>
        </button>
      </div>
    </div>
  );
}
