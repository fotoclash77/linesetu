import React from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Settings2, Bell, CalendarClock, Users, LogOut, ShieldCheck, ChevronRight } from 'lucide-react';

const glassStyle = {
  background: 'rgba(255,255,255,0.7)',
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
  border: '1px solid rgba(255,255,255,0.8)',
  boxShadow: '0 8px 32px rgba(31,38,135,0.08)'
};

export function Settings() {
  return (
    <div className="min-h-[100dvh] bg-[#F8FAFC] pb-10" style={{ width: 390, margin: '0 auto' }}>
      
      {/* Header */}
      <div className="pt-12 px-6 pb-6">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
      </div>

      <div className="px-5 space-y-6">
        
        {/* Profile Card */}
        <div className="p-5 rounded-3xl flex items-center gap-4" style={glassStyle}>
          <div className="w-16 h-16 rounded-2xl bg-gray-200 overflow-hidden border-2 border-white shadow-sm shrink-0">
             <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=Sharma`} alt="Dr. Sharma" className="w-full h-full object-cover" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-900">Dr. Sharma</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-[#4F46E5]/10 text-[#4F46E5]">
                Cardiologist
              </span>
              <span className="text-xs text-gray-500 font-medium">10+ yrs exp</span>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="rounded-xl">
            <Settings2 className="w-5 h-5 text-gray-400" />
          </Button>
        </div>

        {/* Quick Settings */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide ml-2">Clinic Operations</h3>
          
          <div className="p-1 rounded-3xl" style={glassStyle}>
            {/* Consultation Fee */}
            <div className="p-4 border-b border-gray-100/50 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-gray-800">Consultation Fee</span>
              </div>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">₹</span>
                  <Input 
                    defaultValue="500"
                    className="h-12 rounded-xl border-gray-200 bg-white/60 pl-8 font-semibold text-gray-900" 
                  />
                </div>
                <Button className="h-12 rounded-xl bg-gray-900 text-white font-semibold px-6 hover:bg-gray-800">
                  Save
                </Button>
              </div>
            </div>

            {/* Online Booking */}
            <div className="p-4 border-b border-gray-100/50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#22C55E]/10 flex items-center justify-center text-[#22C55E]">
                  <CalendarClock className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800">Online Booking</h4>
                  <p className="text-xs text-gray-500 font-medium">Accept patients via app</p>
                </div>
              </div>
              <Switch defaultChecked className="data-[state=checked]:bg-[#22C55E]" />
            </div>

            {/* Queue Capacity */}
            <div className="p-4 border-b border-gray-100/50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#06B6D4]/10 flex items-center justify-center text-[#06B6D4]">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800">Queue Capacity</h4>
                  <p className="text-xs text-gray-500 font-medium">Max 30 patients per day</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" className="rounded-full text-gray-400 hover:text-gray-900">
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>

            {/* Clinic Hours */}
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#4F46E5]/10 flex items-center justify-center text-[#4F46E5]">
                  <Settings2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800">Clinic Hours</h4>
                  <p className="text-xs text-gray-500 font-medium">9 AM - 5 PM Mon-Sat</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" className="rounded-full text-gray-400 hover:text-gray-900">
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* App Settings */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide ml-2">Preferences</h3>
          
          <div className="p-1 rounded-3xl" style={glassStyle}>
            <div className="p-4 border-b border-gray-100/50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-600">
                  <Bell className="w-5 h-5" />
                </div>
                <h4 className="font-semibold text-gray-800">Notifications</h4>
              </div>
              <Switch defaultChecked className="data-[state=checked]:bg-[#4F46E5]" />
            </div>

            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-600">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h4 className="font-semibold text-gray-800">Privacy & Security</h4>
              </div>
              <Button variant="ghost" size="icon" className="rounded-full text-gray-400 hover:text-gray-900">
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>

        <Button variant="outline" className="w-full h-14 rounded-2xl border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 font-bold text-base mt-4 bg-white/50">
          <LogOut className="w-5 h-5 mr-2" />
          Logout
        </Button>

      </div>
    </div>
  );
}
