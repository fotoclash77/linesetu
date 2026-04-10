import React, { useState } from 'react';
import { Stethoscope, Calendar, Clock3, ShieldCheck, ChevronRight } from 'lucide-react';

export function Login() {
  const [phone, setPhone] = useState('98765 43210');
  const [otp, setOtp] = useState(['4', '2', '8', '5']);
  const [step, setStep] = useState<'phone' | 'otp'>('otp');

  return (
    <div
      className="relative flex flex-col w-full overflow-hidden"
      style={{ width: 390, height: 844, fontFamily: "'Inter', sans-serif", background: '#F0F4FF' }}
    >
      {/* ── STATUS BAR ── */}
      <div className="flex items-center justify-between px-5 pt-3 pb-1 z-20 relative">
        <span className="text-xs font-semibold text-indigo-900/70">9:41</span>
        <div className="flex items-center gap-1.5">
          <svg width="15" height="11" viewBox="0 0 15 11" fill="none">
            <rect x="0" y="4" width="3" height="7" rx="1" fill="#4F46E5" opacity="0.4"/>
            <rect x="4" y="2.5" width="3" height="8.5" rx="1" fill="#4F46E5" opacity="0.6"/>
            <rect x="8" y="1" width="3" height="10" rx="1" fill="#4F46E5" opacity="0.8"/>
            <rect x="12" y="0" width="3" height="11" rx="1" fill="#4F46E5"/>
          </svg>
          <svg width="16" height="12" viewBox="0 0 16 12" fill="none">
            <path d="M8 2.5C10.2 2.5 12.2 3.4 13.6 4.9L15 3.4C13.2 1.5 10.7 0.3 8 0.3C5.3 0.3 2.8 1.5 1 3.4L2.4 4.9C3.8 3.4 5.8 2.5 8 2.5Z" fill="#4F46E5" opacity="0.4"/>
            <path d="M8 5.5C9.5 5.5 10.8 6.1 11.8 7.1L13.2 5.6C11.8 4.2 9.9 3.3 8 3.3C6.1 3.3 4.2 4.2 2.8 5.6L4.2 7.1C5.2 6.1 6.5 5.5 8 5.5Z" fill="#4F46E5" opacity="0.7"/>
            <circle cx="8" cy="10" r="1.5" fill="#4F46E5"/>
          </svg>
          <svg width="25" height="12" viewBox="0 0 25 12" fill="none">
            <rect x="0.5" y="0.5" width="21" height="11" rx="3.5" stroke="#4F46E5" strokeOpacity="0.4"/>
            <rect x="2" y="2" width="16" height="8" rx="2" fill="#4F46E5"/>
            <path d="M23 4.5V7.5C23.8 7.2 24.5 6.4 24.5 6C24.5 5.6 23.8 4.8 23 4.5Z" fill="#4F46E5" opacity="0.4"/>
          </svg>
        </div>
      </div>

      {/* ── HERO SECTION ── */}
      <div
        className="relative flex flex-col items-center px-6 pt-4 pb-10 overflow-hidden"
        style={{
          background: 'linear-gradient(145deg, #4F46E5 0%, #6366F1 40%, #06B6D4 100%)',
          borderRadius: '0 0 40px 40px',
          minHeight: 330,
        }}
      >
        {/* Background glow orbs */}
        <div className="absolute top-[-40px] right-[-40px] w-48 h-48 rounded-full opacity-20" style={{ background: '#22C55E', filter: 'blur(50px)' }} />
        <div className="absolute bottom-[-20px] left-[-30px] w-40 h-40 rounded-full opacity-15" style={{ background: '#fff', filter: 'blur(40px)' }} />

        {/* Brand */}
        <div className="flex flex-col items-center mt-2 mb-6 z-10">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-9 h-9 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center border border-white/30">
              <Stethoscope className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight">LINESETU</h1>
          </div>
          <p className="text-indigo-100 text-sm font-medium">Smart Queue · Zero Wait Anxiety</p>
        </div>

        {/* Feature pill cards */}
        <div className="flex gap-3 z-10 w-full">
          {[
            { icon: Calendar, label: 'Book Slot', sub: 'Skip the line' },
            { icon: Clock3, label: 'Live Token', sub: 'Real-time' },
            { icon: ShieldCheck, label: 'Secure', sub: 'OTP login' },
          ].map(({ icon: Icon, label, sub }) => (
            <div
              key={label}
              className="flex-1 flex flex-col items-center gap-1 py-3 px-2 rounded-2xl"
              style={{
                background: 'rgba(255,255,255,0.15)',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255,255,255,0.25)',
              }}
            >
              <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
                <Icon className="w-4 h-4 text-white" />
              </div>
              <span className="text-white text-xs font-semibold">{label}</span>
              <span className="text-indigo-100 text-[10px]">{sub}</span>
            </div>
          ))}
        </div>

        {/* Floating stats strip */}
        <div
          className="flex items-center gap-4 mt-5 px-5 py-3 rounded-2xl z-10"
          style={{
            background: 'rgba(255,255,255,0.18)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.3)',
          }}
        >
          {[
            { value: '500+', label: 'Clinics' },
            { value: '12K+', label: 'Patients' },
            { value: '4.9★', label: 'Rating' },
          ].map(({ value, label }, i) => (
            <React.Fragment key={label}>
              {i > 0 && <div className="w-px h-8 bg-white/25" />}
              <div className="flex flex-col items-center flex-1">
                <span className="text-white font-bold text-base leading-tight">{value}</span>
                <span className="text-indigo-100 text-[10px]">{label}</span>
              </div>
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* ── FORM PANEL ── */}
      <div
        className="flex-1 flex flex-col px-5 pt-6 pb-6"
        style={{ background: '#F0F4FF' }}
      >
        <div className="mb-5">
          <h2 className="text-2xl font-bold text-gray-900">Welcome back 👋</h2>
          <p className="text-gray-500 text-sm mt-0.5">
            {step === 'phone' ? 'Enter your mobile number to continue' : 'Enter the 4-digit OTP sent to you'}
          </p>
        </div>

        {/* Glass form card */}
        <div
          className="rounded-3xl p-5"
          style={{
            background: 'rgba(255,255,255,0.85)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255,255,255,0.95)',
            boxShadow: '0 8px 40px rgba(79,70,229,0.08)',
          }}
        >
          {/* Phone field */}
          <div className="mb-4">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">
              Mobile Number
            </label>
            <div
              className="flex items-center gap-3 px-4 rounded-2xl h-13"
              style={{
                background: step === 'otp' ? 'rgba(79,70,229,0.04)' : 'rgba(255,255,255,0.9)',
                border: step === 'phone' ? '2px solid #4F46E5' : '1.5px solid rgba(79,70,229,0.15)',
                height: 52,
              }}
            >
              <div
                className="flex items-center gap-1.5 pr-3 shrink-0"
                style={{ borderRight: '1.5px solid rgba(0,0,0,0.08)' }}
              >
                <span className="text-base">🇮🇳</span>
                <span className="text-sm font-semibold text-gray-700">+91</span>
              </div>
              <span className="text-gray-800 font-semibold text-base tracking-wide flex-1">{phone}</span>
              {step === 'otp' && (
                <button
                  className="text-xs font-semibold text-indigo-600 shrink-0"
                  onClick={() => setStep('phone')}
                >
                  Change
                </button>
              )}
            </div>
          </div>

          {/* OTP boxes */}
          {step === 'otp' && (
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">OTP</label>
                <button className="text-xs font-semibold text-indigo-600">Resend in 28s</button>
              </div>
              <div className="flex gap-3">
                {otp.map((digit, i) => (
                  <div
                    key={i}
                    className="flex-1 flex items-center justify-center rounded-2xl text-2xl font-bold text-indigo-700"
                    style={{
                      height: 60,
                      background: i === 3 ? 'rgba(79,70,229,0.08)' : 'rgba(79,70,229,0.06)',
                      border: i === 3 ? '2px solid #4F46E5' : '1.5px solid rgba(79,70,229,0.12)',
                      boxShadow: i === 3 ? '0 0 0 3px rgba(79,70,229,0.08)' : 'none',
                    }}
                  >
                    {digit}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CTA Button */}
          <button
            className="w-full flex items-center justify-center gap-2 rounded-2xl font-bold text-white text-base transition-all active:scale-[0.98]"
            style={{
              height: 54,
              background: 'linear-gradient(135deg, #4F46E5 0%, #6366F1 60%, #06B6D4 100%)',
              boxShadow: '0 8px 24px rgba(79,70,229,0.35)',
            }}
          >
            {step === 'phone' ? 'Send OTP' : 'Verify & Login'}
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Social proof row */}
        <div className="flex items-center gap-2 mt-4 justify-center">
          <div className="flex -space-x-2">
            {['#4F46E5','#06B6D4','#22C55E','#F59E0B'].map((c, i) => (
              <div
                key={i}
                className="w-7 h-7 rounded-full border-2 border-white flex items-center justify-center text-white text-[10px] font-bold"
                style={{ background: c }}
              >
                {['A','R','S','M'][i]}
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-500 font-medium">
            <span className="text-indigo-600 font-semibold">12,000+</span> patients trust LINESETU
          </p>
        </div>

        {/* Terms */}
        <p className="text-center text-[11px] text-gray-400 mt-auto pt-4 leading-relaxed">
          By continuing, you agree to our{' '}
          <span className="text-indigo-600 font-medium">Terms of Service</span> &{' '}
          <span className="text-indigo-600 font-medium">Privacy Policy</span>
        </p>
      </div>
    </div>
  );
}
