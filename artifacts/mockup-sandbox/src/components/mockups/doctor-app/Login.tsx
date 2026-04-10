import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const glassStyle = {
  background: 'rgba(255,255,255,0.7)',
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
  border: '1px solid rgba(255,255,255,0.8)',
  boxShadow: '0 8px 32px rgba(31,38,135,0.08)'
};

export function Login() {
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => setLoading(false), 1000);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#F8FAFC] relative overflow-hidden" style={{ width: 390, margin: '0 auto' }}>
      {/* Background gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[120%] h-[120%] bg-gradient-to-br from-[#4F46E5]/20 via-[#F8FAFC] to-[#06B6D4]/20 pointer-events-none" />
      
      <div className="w-full px-6 relative z-10 flex flex-col items-center">
        {/* Logo Section */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-[#4F46E5] text-white font-bold text-3xl mb-4 shadow-lg shadow-[#4F46E5]/30">
            L
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">LINESETU</h1>
          <p className="text-[#06B6D4] font-medium mt-1 tracking-wide uppercase text-sm">Doctor Portal</p>
        </div>

        {/* Login Card */}
        <div className="w-full rounded-3xl p-6" style={glassStyle}>
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">Email or Phone</Label>
              <Input 
                id="email" 
                placeholder="dr.sharma@clinic.com" 
                className="rounded-2xl border-gray-200 bg-white/50 focus-visible:ring-[#4F46E5]" 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input 
                id="password" 
                type="password" 
                placeholder="••••••••" 
                className="rounded-2xl border-gray-200 bg-white/50 focus-visible:ring-[#4F46E5]" 
              />
            </div>
            
            <div className="flex justify-end">
              <a href="#" className="text-sm font-medium text-[#4F46E5] hover:text-[#4F46E5]/80">Forgot password?</a>
            </div>

            <Button 
              type="submit" 
              className="w-full rounded-2xl bg-[#4F46E5] hover:bg-[#4F46E5]/90 text-white shadow-lg shadow-[#4F46E5]/30 h-12 text-base font-semibold"
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Login to Dashboard'}
            </Button>
          </form>
        </div>
        
        <p className="mt-8 text-sm text-gray-500 font-medium text-center">
          Manage your clinic queue effortlessly.
        </p>
      </div>
    </div>
  );
}
