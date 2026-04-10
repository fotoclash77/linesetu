import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UserPlus, ArrowLeft, Clock } from 'lucide-react';

const glassStyle = {
  background: 'rgba(255,255,255,0.7)',
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
  border: '1px solid rgba(255,255,255,0.8)',
  boxShadow: '0 8px 32px rgba(31,38,135,0.08)'
};

export function AddWalkin() {
  return (
    <div className="min-h-[100dvh] bg-[#F8FAFC] pb-10" style={{ width: 390, margin: '0 auto' }}>
      
      {/* Header */}
      <div className="pt-12 px-6 pb-6 flex items-center gap-4">
        <button className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm border border-gray-100 text-gray-700 hover:bg-gray-50">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Add Walk-in</h1>
      </div>

      <div className="px-5 space-y-6">
        
        {/* Queue Summary */}
        <div className="bg-[#4F46E5] text-white p-5 rounded-3xl shadow-lg shadow-[#4F46E5]/30 flex items-center justify-between">
          <div>
            <p className="text-white/80 font-medium text-sm">Next available token</p>
            <div className="text-3xl font-extrabold mt-1">#51</div>
          </div>
          <div className="text-right">
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/20 text-sm font-semibold">
              <Clock className="w-4 h-4" />
              8 Waiting
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="p-6 rounded-3xl" style={glassStyle}>
          <form className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-gray-700 font-semibold ml-1">Patient Name</Label>
              <Input 
                id="name" 
                placeholder="Enter full name" 
                className="h-14 rounded-2xl border-gray-200 bg-white/60 focus-visible:ring-[#4F46E5] text-base" 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-gray-700 font-semibold ml-1">Phone Number</Label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium border-r border-gray-200 pr-3 py-1">
                  +91
                </span>
                <Input 
                  id="phone" 
                  type="tel" 
                  placeholder="98765 43210" 
                  className="h-14 rounded-2xl border-gray-200 bg-white/60 focus-visible:ring-[#4F46E5] text-base pl-16" 
                />
              </div>
            </div>

            <div className="pt-2">
              <Button 
                type="button" 
                className="w-full rounded-2xl bg-[#4F46E5] hover:bg-[#4F46E5]/90 text-white shadow-lg shadow-[#4F46E5]/30 h-14 text-lg font-bold"
              >
                <UserPlus className="w-5 h-5 mr-2" />
                Add to Queue
              </Button>
              
              <Button variant="ghost" className="w-full mt-2 h-12 rounded-2xl text-gray-500 font-medium hover:text-gray-900">
                Cancel
              </Button>
            </div>
          </form>
        </div>

        {/* Recent Additions */}
        <div>
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide ml-2 mb-3">Recent Walk-ins</h3>
          <div className="space-y-2">
            {[
              { token: 50, name: 'Arvind Kumar', time: '2 mins ago' },
              { token: 48, name: 'Rajan Gupta', time: '15 mins ago' },
              { token: 46, name: 'Vikram Singh', time: '34 mins ago' }
            ].map((patient, i) => (
              <div key={i} className="flex items-center justify-between p-3 px-4 rounded-2xl bg-white border border-gray-100 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center font-bold text-gray-700 text-sm">
                    {patient.token}
                  </div>
                  <span className="font-medium text-gray-900">{patient.name}</span>
                </div>
                <span className="text-xs text-gray-400 font-medium">{patient.time}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
