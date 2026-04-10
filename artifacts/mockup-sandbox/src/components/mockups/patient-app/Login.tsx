import React, { useState } from 'react';
import { Stethoscope, Mail, Lock, Eye, EyeOff, Shield, ChevronRight } from 'lucide-react';

export function Login() {
  const [showPass, setShowPass] = useState(false);

  return (
    <div
      style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        width: 390,
        height: 844,
        fontFamily: "'Inter', sans-serif",
        background: '#0A0E1A',
        overflow: 'hidden',
      }}
    >
      {/* Glow orbs */}
      <div style={{ position: 'absolute', top: -80, left: -60, width: 280, height: 280, borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.38) 0%, transparent 70%)', filter: 'blur(20px)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: 40, right: -80, width: 260, height: 260, borderRadius: '50%', background: 'radial-gradient(circle, rgba(6,182,212,0.22) 0%, transparent 70%)', filter: 'blur(24px)', pointerEvents: 'none' }} />

      {/* STATUS BAR */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 22px 6px', position: 'relative', zIndex: 10 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.7)' }}>9:41</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          {[0.4, 0.65, 0.9, 1].map((op, i) => (
            <div key={i} style={{ width: 3, height: 6 + i * 2, borderRadius: 2, background: `rgba(255,255,255,${op})` }} />
          ))}
          <div style={{ width: 8 }} />
          <svg width="16" height="11" viewBox="0 0 16 11" fill="none">
            <path d="M8 2C10.4 2 12.6 3 14.1 4.7L15.5 3.2C13.6 1.2 10.9 0 8 0C5.1 0 2.4 1.2 0.5 3.2L1.9 4.7C3.4 3 5.6 2 8 2Z" fill="white" opacity="0.4"/>
            <path d="M8 5C9.7 5 11.2 5.7 12.3 6.8L13.7 5.3C12.2 3.9 10.2 3 8 3C5.8 3 3.8 3.9 2.3 5.3L3.7 6.8C4.8 5.7 6.3 5 8 5Z" fill="white" opacity="0.7"/>
            <circle cx="8" cy="9.5" r="1.5" fill="white"/>
          </svg>
          <div style={{ width: 5 }} />
          <svg width="24" height="12" viewBox="0 0 24 12" fill="none">
            <rect x="0.5" y="0.5" width="20" height="11" rx="3.5" stroke="white" strokeOpacity="0.3"/>
            <rect x="2" y="2" width="14" height="8" rx="2" fill="white" fillOpacity="0.85"/>
            <path d="M22 4.5V7.5C22.8 7.2 23.5 6.4 23.5 6C23.5 5.6 22.8 4.8 22 4.5Z" fill="white" opacity="0.35"/>
          </svg>
        </div>
      </div>

      {/* BRAND */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 28, paddingBottom: 20, position: 'relative', zIndex: 10 }}>
        <div style={{ width: 60, height: 60, borderRadius: 18, background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.35)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
          <Stethoscope style={{ width: 26, height: 26, color: '#818CF8' }} />
        </div>
        <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.5px', background: 'linear-gradient(135deg, #FFFFFF 30%, #818CF8 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0, marginBottom: 4 }}>
          LINESETU
        </h1>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.38)', fontWeight: 500, margin: 0 }}>
          Smart Queue · Zero Wait Anxiety
        </p>
      </div>

      {/* GLASS CARD */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '0 20px', position: 'relative', zIndex: 10 }}>
        <div style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: 28, padding: '26px 22px' }}>

          <h2 style={{ fontSize: 21, fontWeight: 700, color: '#FFFFFF', margin: 0, marginBottom: 4 }}>Welcome back</h2>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.42)', margin: 0, marginBottom: 22 }}>Sign in to your account</p>

          {/* ── GOOGLE BUTTON ── */}
          <button
            style={{
              width: '100%',
              height: 52,
              borderRadius: 14,
              background: 'rgba(255,255,255,0.97)',
              border: '1px solid rgba(255,255,255,0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
              cursor: 'pointer',
              marginBottom: 12,
              boxShadow: '0 2px 12px rgba(0,0,0,0.3)',
            }}
          >
            {/* Google G logo SVG */}
            <svg width="20" height="20" viewBox="0 0 48 48" fill="none">
              <path d="M43.6 20.5H42V20H24V28H35.3C33.7 32.7 29.2 36 24 36C17.4 36 12 30.6 12 24C12 17.4 17.4 12 24 12C27.1 12 29.9 13.1 32.1 15L37.9 9.2C34.4 5.9 29.5 4 24 4C13 4 4 13 4 24C4 35 13 44 24 44C35 44 44 35 44 24C44 22.8 43.9 21.6 43.6 20.5Z" fill="#FFC107"/>
              <path d="M6.3 14.7L13 19.8C14.8 15.5 19 12 24 12C27.1 12 29.9 13.1 32.1 15L37.9 9.2C34.4 5.9 29.5 4 24 4C16.3 4 9.7 8.4 6.3 14.7Z" fill="#FF3D00"/>
              <path d="M24 44C29.4 44 34.2 42.2 37.7 39.1L31.3 33.7C29.2 35.2 26.7 36 24 36C18.8 36 14.4 32.7 12.7 28.1L6.1 33.4C9.5 39.8 16.2 44 24 44Z" fill="#4CAF50"/>
              <path d="M43.6 20.5H42V20H24V28H35.3C34.5 30.3 33 32.2 31.3 33.7L37.7 39.1C37.3 39.5 44 34 44 24C44 22.8 43.9 21.6 43.6 20.5Z" fill="#1976D2"/>
            </svg>
            <span style={{ fontSize: 14, fontWeight: 600, color: '#1F1F1F', letterSpacing: '0.01em' }}>
              Continue with Google
            </span>
          </button>

          {/* ── DIVIDER ── */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }} />
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.28)', fontWeight: 500 }}>or sign in with email</span>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }} />
          </div>

          {/* ── EMAIL FIELD ── */}
          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.07em', color: 'rgba(255,255,255,0.32)', textTransform: 'uppercase', display: 'block', marginBottom: 7 }}>
              Email Address
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 14, padding: '0 14px', height: 50 }}>
              <Mail style={{ width: 16, height: 16, color: 'rgba(255,255,255,0.3)', flexShrink: 0 }} />
              <span style={{ fontSize: 14, fontWeight: 500, color: 'rgba(255,255,255,0.75)', flex: 1, letterSpacing: '0.01em' }}>
                aryan.mehta@gmail.com
              </span>
            </div>
          </div>

          {/* ── PASSWORD FIELD ── */}
          <div style={{ marginBottom: 8 }}>
            <label style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.07em', color: 'rgba(255,255,255,0.32)', textTransform: 'uppercase', display: 'block', marginBottom: 7 }}>
              Password
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(255,255,255,0.06)', border: '1.5px solid rgba(99,102,241,0.5)', borderRadius: 14, padding: '0 14px', height: 50, boxShadow: '0 0 0 3px rgba(99,102,241,0.1)' }}>
              <Lock style={{ width: 16, height: 16, color: '#818CF8', flexShrink: 0 }} />
              <span style={{ fontSize: 14, fontWeight: 500, color: '#FFFFFF', flex: 1, letterSpacing: '0.12em' }}>
                ••••••••••
              </span>
              <button onClick={() => setShowPass(!showPass)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}>
                {showPass
                  ? <EyeOff style={{ width: 16, height: 16, color: 'rgba(255,255,255,0.3)' }} />
                  : <Eye style={{ width: 16, height: 16, color: 'rgba(255,255,255,0.3)' }} />
                }
              </button>
            </div>
          </div>

          {/* Forgot password */}
          <div style={{ textAlign: 'right', marginBottom: 22 }}>
            <button style={{ fontSize: 12, fontWeight: 600, color: '#818CF8', background: 'none', border: 'none', cursor: 'pointer' }}>
              Forgot password?
            </button>
          </div>

          {/* ── SIGN IN CTA ── */}
          <button
            style={{
              width: '100%',
              height: 52,
              borderRadius: 14,
              background: 'linear-gradient(135deg, #4F46E5 0%, #6366F1 60%, #0EA5E9 100%)',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 7,
              fontSize: 15,
              fontWeight: 700,
              color: '#FFFFFF',
              boxShadow: '0 8px 28px rgba(79,70,229,0.45)',
              letterSpacing: '0.01em',
            }}
          >
            Sign In
            <ChevronRight style={{ width: 18, height: 18 }} />
          </button>
        </div>

        {/* Sign up link */}
        <p style={{ textAlign: 'center', fontSize: 13, color: 'rgba(255,255,255,0.3)', marginTop: 18, fontWeight: 500 }}>
          New to LINESETU?{' '}
          <span style={{ color: '#818CF8', fontWeight: 700 }}>Create account</span>
        </p>

        {/* Security note */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, marginTop: 14 }}>
          <Shield style={{ width: 12, height: 12, color: 'rgba(255,255,255,0.2)' }} />
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)', fontWeight: 500 }}>256-bit encrypted · Your data is safe</span>
        </div>

        {/* Stats strip */}
        <div style={{ display: 'flex', alignItems: 'center', marginTop: 18, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: '12px 0' }}>
          {[{ v: '500+', l: 'Clinics' }, { v: '12K+', l: 'Patients' }, { v: '4.9★', l: 'Rating' }].map(({ v, l }, i) => (
            <React.Fragment key={l}>
              {i > 0 && <div style={{ width: 1, height: 24, background: 'rgba(255,255,255,0.08)' }} />}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                <span style={{ fontSize: 15, fontWeight: 700, color: '#FFFFFF' }}>{v}</span>
                <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.32)', fontWeight: 500 }}>{l}</span>
              </div>
            </React.Fragment>
          ))}
        </div>

        {/* Terms */}
        <p style={{ textAlign: 'center', fontSize: 11, color: 'rgba(255,255,255,0.18)', marginTop: 14, lineHeight: 1.6 }}>
          By continuing, you agree to our{' '}
          <span style={{ color: '#818CF8', fontWeight: 600 }}>Terms</span>
          {' '}&{' '}
          <span style={{ color: '#818CF8', fontWeight: 600 }}>Privacy Policy</span>
        </p>
      </div>
    </div>
  );
}
