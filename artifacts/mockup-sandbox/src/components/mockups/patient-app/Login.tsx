import React, { useState } from 'react';
import { Stethoscope, ChevronRight, Shield } from 'lucide-react';

export function Login() {
  const [otp] = useState(['4', '2', '8', '5']);

  return (
    <div
      className="relative flex flex-col w-full overflow-hidden"
      style={{
        width: 390,
        height: 844,
        fontFamily: "'Inter', sans-serif",
        background: '#0A0E1A',
      }}
    >
      {/* Background glow orbs */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: -80,
          left: -60,
          width: 280,
          height: 280,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99,102,241,0.35) 0%, transparent 70%)',
          filter: 'blur(20px)',
        }}
      />
      <div
        className="absolute pointer-events-none"
        style={{
          bottom: 60,
          right: -80,
          width: 260,
          height: 260,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(6,182,212,0.2) 0%, transparent 70%)',
          filter: 'blur(24px)',
        }}
      />

      {/* STATUS BAR */}
      <div className="flex items-center justify-between px-6 pt-4 pb-2 relative z-10">
        <span style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.7)' }}>9:41</span>
        <div className="flex items-center gap-1.5">
          {[0.4, 0.65, 0.9, 1].map((op, i) => (
            <div
              key={i}
              style={{
                width: 3,
                height: 6 + i * 2,
                borderRadius: 2,
                background: `rgba(255,255,255,${op})`,
              }}
            />
          ))}
          <div style={{ width: 8 }} />
          <svg width="16" height="12" viewBox="0 0 16 12" fill="none">
            <path d="M8 2.5C10.2 2.5 12.2 3.4 13.6 4.9L15 3.4C13.2 1.5 10.7 0.3 8 0.3C5.3 0.3 2.8 1.5 1 3.4L2.4 4.9C3.8 3.4 5.8 2.5 8 2.5Z" fill="white" opacity="0.4"/>
            <path d="M8 5.5C9.5 5.5 10.8 6.1 11.8 7.1L13.2 5.6C11.8 4.2 9.9 3.3 8 3.3C6.1 3.3 4.2 4.2 2.8 5.6L4.2 7.1C5.2 6.1 6.5 5.5 8 5.5Z" fill="white" opacity="0.7"/>
            <circle cx="8" cy="10" r="1.5" fill="white"/>
          </svg>
          <div style={{ width: 4 }} />
          <svg width="25" height="12" viewBox="0 0 25 12" fill="none">
            <rect x="0.5" y="0.5" width="21" height="11" rx="3.5" stroke="white" strokeOpacity="0.35"/>
            <rect x="2" y="2" width="15" height="8" rx="2" fill="white" fillOpacity="0.85"/>
            <path d="M23 4.5V7.5C23.8 7.2 24.5 6.4 24.5 6C24.5 5.6 23.8 4.8 23 4.5Z" fill="white" opacity="0.4"/>
          </svg>
        </div>
      </div>

      {/* BRAND HEADER */}
      <div className="flex flex-col items-center pt-8 pb-6 relative z-10">
        <div
          className="flex items-center justify-center mb-4"
          style={{
            width: 64,
            height: 64,
            borderRadius: 20,
            background: 'rgba(99,102,241,0.15)',
            border: '1px solid rgba(99,102,241,0.35)',
            backdropFilter: 'blur(12px)',
          }}
        >
          <Stethoscope style={{ width: 28, height: 28, color: '#818CF8' }} />
        </div>
        <h1
          style={{
            fontSize: 30,
            fontWeight: 800,
            letterSpacing: '-0.5px',
            background: 'linear-gradient(135deg, #FFFFFF 30%, #818CF8 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: 4,
          }}
        >
          LINESETU
        </h1>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', fontWeight: 500 }}>
          Smart Queue · Zero Wait Anxiety
        </p>
      </div>

      {/* MAIN GLASS CARD */}
      <div className="flex-1 flex flex-col px-5 relative z-10">
        <div
          style={{
            background: 'rgba(255,255,255,0.05)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            border: '1px solid rgba(255,255,255,0.09)',
            borderRadius: 28,
            padding: '28px 24px',
          }}
        >
          {/* Heading */}
          <h2 style={{ fontSize: 22, fontWeight: 700, color: '#FFFFFF', marginBottom: 4 }}>
            Welcome back
          </h2>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', marginBottom: 24 }}>
            Verify your identity to continue
          </p>

          {/* Mobile field */}
          <div style={{ marginBottom: 20 }}>
            <label
              style={{
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: '0.08em',
                color: 'rgba(255,255,255,0.35)',
                textTransform: 'uppercase',
                display: 'block',
                marginBottom: 8,
              }}
            >
              Mobile Number
            </label>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 16,
                padding: '0 16px',
                height: 52,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  paddingRight: 12,
                  borderRight: '1px solid rgba(255,255,255,0.1)',
                }}
              >
                <span style={{ fontSize: 16 }}>🇮🇳</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.7)' }}>+91</span>
              </div>
              <span style={{ fontSize: 15, fontWeight: 600, color: '#FFFFFF', flex: 1, letterSpacing: '0.03em' }}>
                98765 43210
              </span>
              <button
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: '#818CF8',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                Change
              </button>
            </div>
          </div>

          {/* OTP section */}
          <div style={{ marginBottom: 28 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <label
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: '0.08em',
                  color: 'rgba(255,255,255,0.35)',
                  textTransform: 'uppercase',
                }}
              >
                One-Time Password
              </label>
              <button
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: '#06B6D4',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                Resend in 28s
              </button>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              {otp.map((digit, i) => (
                <div
                  key={i}
                  style={{
                    flex: 1,
                    height: 62,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 16,
                    fontSize: 24,
                    fontWeight: 700,
                    background: i === 3
                      ? 'rgba(99,102,241,0.18)'
                      : 'rgba(255,255,255,0.06)',
                    border: i === 3
                      ? '1.5px solid rgba(99,102,241,0.6)'
                      : '1px solid rgba(255,255,255,0.08)',
                    color: i === 3 ? '#A5B4FC' : 'rgba(255,255,255,0.85)',
                    boxShadow: i === 3 ? '0 0 16px rgba(99,102,241,0.2)' : 'none',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {digit}
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <button
            style={{
              width: '100%',
              height: 54,
              borderRadius: 16,
              background: 'linear-gradient(135deg, #4F46E5 0%, #6366F1 60%, #0EA5E9 100%)',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              fontSize: 15,
              fontWeight: 700,
              color: '#FFFFFF',
              boxShadow: '0 8px 28px rgba(79,70,229,0.45)',
              letterSpacing: '0.01em',
            }}
          >
            Verify & Login
            <ChevronRight style={{ width: 18, height: 18 }} />
          </button>
        </div>

        {/* Security note */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            marginTop: 20,
          }}
        >
          <Shield style={{ width: 13, height: 13, color: 'rgba(255,255,255,0.25)' }} />
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)', fontWeight: 500 }}>
            256-bit encrypted · Your data is safe
          </span>
        </div>

        {/* Stats row */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 0,
            marginTop: 24,
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: 18,
            padding: '14px 0',
          }}
        >
          {[
            { v: '500+', l: 'Clinics' },
            { v: '12K+', l: 'Patients' },
            { v: '4.9★', l: 'Rating' },
          ].map(({ v, l }, i) => (
            <React.Fragment key={l}>
              {i > 0 && (
                <div style={{ width: 1, height: 28, background: 'rgba(255,255,255,0.08)' }} />
              )}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                <span style={{ fontSize: 16, fontWeight: 700, color: '#FFFFFF' }}>{v}</span>
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', fontWeight: 500 }}>{l}</span>
              </div>
            </React.Fragment>
          ))}
        </div>

        {/* Terms */}
        <p
          style={{
            textAlign: 'center',
            fontSize: 11,
            color: 'rgba(255,255,255,0.22)',
            marginTop: 20,
            lineHeight: 1.6,
          }}
        >
          By continuing, you agree to our{' '}
          <span style={{ color: '#818CF8', fontWeight: 600 }}>Terms of Service</span>
          {' '}&{' '}
          <span style={{ color: '#818CF8', fontWeight: 600 }}>Privacy Policy</span>
        </p>
      </div>
    </div>
  );
}
