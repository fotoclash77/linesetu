import React, { useState, useRef, useEffect } from 'react';
import {
  Stethoscope, Phone, ChevronRight,
  ShieldCheck, ArrowLeft, RefreshCw,
  Building2, BadgeCheck,
} from 'lucide-react';

const BG = '#070B14';

/* ── tiny trust badge ── */
function TrustBadge({ icon: Icon, label }: { icon: React.ElementType; label: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 20,
      background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
      <Icon style={{ width: 11, height: 11, color: '#2DD4BF' }} />
      <span style={{ fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.45)' }}>{label}</span>
    </div>
  );
}

/* ── OTP single box ── */
function OtpBox({ value, focused }: { value: string; focused: boolean }) {
  return (
    <div style={{ width: 52, height: 58, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: value ? 'rgba(45,212,191,0.12)' : 'rgba(255,255,255,0.05)',
      border: `2px solid ${focused ? '#2DD4BF' : value ? 'rgba(45,212,191,0.4)' : 'rgba(255,255,255,0.1)'}`,
      boxShadow: focused ? '0 0 18px rgba(45,212,191,0.25)' : 'none',
      transition: 'all 0.15s ease' }}>
      <span style={{ fontSize: 24, fontWeight: 900, color: value ? '#FFF' : 'transparent', letterSpacing: '-1px' }}>
        {value || '·'}
      </span>
    </div>
  );
}

/* ──────────────────────────────
   MAIN SCREEN
────────────────────────────── */
export function Login() {
  const [step, setStep]       = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone]     = useState('');
  const [otp, setOtp]         = useState(['', '', '', '', '', '']);
  const [otpFocus, setOtpFocus] = useState(0);
  const [sending, setSending] = useState(false);
  const [timer, setTimer]     = useState(0);
  const otpRefs               = useRef<(HTMLInputElement | null)[]>([]);

  /* countdown */
  useEffect(() => {
    if (timer <= 0) return;
    const id = setTimeout(() => setTimer(t => t - 1), 1000);
    return () => clearTimeout(id);
  }, [timer]);

  const handleSendOtp = () => {
    if (phone.length < 10) return;
    setSending(true);
    setTimeout(() => { setSending(false); setStep('otp'); setTimer(30); otpRefs.current[0]?.focus(); }, 800);
  };

  const handleOtpInput = (i: number, val: string) => {
    const d = val.replace(/\D/g, '').slice(-1);
    const next = [...otp]; next[i] = d;
    setOtp(next);
    if (d && i < 5) { otpRefs.current[i + 1]?.focus(); setOtpFocus(i + 1); }
  };

  const handleOtpKey = (i: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[i] && i > 0) { otpRefs.current[i - 1]?.focus(); setOtpFocus(i - 1); }
  };

  const otpFilled = otp.every(d => d !== '');
  const phoneValid = phone.length === 10;

  return (
    <div style={{ width: 390, height: 844, background: BG, fontFamily: "'Inter', sans-serif",
      display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative', alignItems: 'center', justifyContent: 'space-between' }}>

      {/* ── BG glows — teal palette (distinct from patient indigo) ── */}
      <div style={{ position: 'absolute', top: -100, left: '50%', transform: 'translateX(-50%)', width: 340, height: 340, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(13,148,136,0.28) 0%, transparent 65%)', filter: 'blur(50px)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: 60, right: -60, width: 220, height: 220, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(6,182,212,0.14) 0%, transparent 70%)', filter: 'blur(36px)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: 100, left: -40, width: 160, height: 160, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(13,148,136,0.1) 0%, transparent 70%)', filter: 'blur(28px)', pointerEvents: 'none' }} />

      {/* ── STATUS BAR ── */}
      <div style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 22px 0', position: 'relative', zIndex: 10, flexShrink: 0 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.5)' }}>9:41</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          {[0.4,0.65,0.9,1].map((op,i) => <div key={i} style={{ width: 3, height: 6+i*2, borderRadius: 2, background: `rgba(255,255,255,${op})` }} />)}
          <div style={{ width: 6 }} />
          <svg width="16" height="11" viewBox="0 0 16 11" fill="none"><path d="M8 2C10.4 2 12.6 3 14.1 4.7L15.5 3.2C13.6 1.2 10.9 0 8 0C5.1 0 2.4 1.2 0.5 3.2L1.9 4.7C3.4 3 5.6 2 8 2Z" fill="white" opacity="0.4"/><path d="M8 5C9.7 5 11.2 5.7 12.3 6.8L13.7 5.3C12.2 3.9 10.2 3 8 3C5.8 3 3.8 3.9 2.3 5.3L3.7 6.8C4.8 5.7 6.3 5 8 5Z" fill="white" opacity="0.7"/><circle cx="8" cy="9.5" r="1.5" fill="white"/></svg>
          <div style={{ width: 4 }} />
          <svg width="24" height="12" viewBox="0 0 24 12" fill="none"><rect x="0.5" y="0.5" width="20" height="11" rx="3.5" stroke="white" strokeOpacity="0.3"/><rect x="2" y="2" width="14" height="8" rx="2" fill="white" fillOpacity="0.85"/></svg>
        </div>
      </div>

      {/* ── HERO / BRANDING ── */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0, paddingTop: 30, position: 'relative', zIndex: 10 }}>
        {/* Logo mark */}
        <div style={{ position: 'relative', marginBottom: 18 }}>
          {/* Outer ring */}
          <div style={{ width: 90, height: 90, borderRadius: 28, display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'linear-gradient(145deg, rgba(13,148,136,0.35) 0%, rgba(6,182,212,0.25) 100%)',
            border: '2px solid rgba(45,212,191,0.3)',
            boxShadow: '0 0 40px rgba(13,148,136,0.35), inset 0 1px 0 rgba(255,255,255,0.1)' }}>
            <div style={{ width: 66, height: 66, borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'linear-gradient(135deg, #0D9488 0%, #0891B2 100%)',
              boxShadow: '0 4px 20px rgba(13,148,136,0.5)' }}>
              <Stethoscope style={{ width: 32, height: 32, color: '#FFF', strokeWidth: 1.6 }} />
            </div>
          </div>
          {/* Verified dot */}
          <div style={{ position: 'absolute', top: -4, right: -4, width: 22, height: 22, borderRadius: '50%',
            background: '#0D9488', border: '2.5px solid #070B14', display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 10px rgba(13,148,136,0.6)' }}>
            <BadgeCheck style={{ width: 12, height: 12, color: '#FFF' }} />
          </div>
        </div>

        {/* Brand name */}
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 28, fontWeight: 900, color: '#FFF', letterSpacing: '-1px', lineHeight: 1 }}>LINESETU</div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 5 }}>
            <div style={{ height: 1, width: 28, background: 'linear-gradient(to right, transparent, rgba(45,212,191,0.5))' }} />
            <span style={{ fontSize: 11, fontWeight: 800, color: '#2DD4BF', letterSpacing: '0.18em', textTransform: 'uppercase' }}>Doctor Portal</span>
            <div style={{ height: 1, width: 28, background: 'linear-gradient(to left, transparent, rgba(45,212,191,0.5))' }} />
          </div>
        </div>

        {/* Trust badges */}
        <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
          <TrustBadge icon={ShieldCheck}  label="Secure Login" />
          <TrustBadge icon={Building2}    label="Clinic Verified" />
          <TrustBadge icon={BadgeCheck}   label="MCI Registered" />
        </div>
      </div>

      {/* ── LOGIN CARD ── */}
      <div style={{ width: '100%', padding: '0 20px 0', position: 'relative', zIndex: 10, flex: '0 0 auto' }}>
        <div style={{ borderRadius: 28, padding: '24px 22px 22px', position: 'relative',
          background: 'rgba(255,255,255,0.05)',
          backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
          border: '1.5px solid rgba(255,255,255,0.1)',
          boxShadow: '0 20px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.08)' }}>

          {/* ── STEP INDICATOR ── */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 22 }}>
            {step === 'otp' && (
              <button onClick={() => { setStep('phone'); setOtp(['','','','','','']); }}
                style={{ width: 30, height: 30, borderRadius: 10, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
                <ArrowLeft style={{ width: 14, height: 14, color: 'rgba(255,255,255,0.7)' }} />
              </button>
            )}
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 16, fontWeight: 900, color: '#FFF' }}>
                {step === 'phone' ? 'Welcome, Doctor' : 'Verify OTP'}
              </div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.38)', marginTop: 2, fontWeight: 500 }}>
                {step === 'phone'
                  ? 'Enter your registered mobile number'
                  : `6-digit OTP sent to +91 ${phone}`}
              </div>
            </div>
            {/* Step dots */}
            <div style={{ display: 'flex', gap: 5, flexShrink: 0 }}>
              {[0,1].map(i => (
                <div key={i} style={{ height: 4, borderRadius: 4,
                  width: (step === 'phone' ? i === 0 : i === 1) ? 20 : 6,
                  background: (step === 'phone' ? i === 0 : i === 1) ? '#2DD4BF' : 'rgba(255,255,255,0.15)',
                  transition: 'all 0.3s ease' }} />
              ))}
            </div>
          </div>

          {/* ── STEP 1: PHONE ── */}
          {step === 'phone' && (
            <div>
              {/* Phone input */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>
                  Mobile Number
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 0, borderRadius: 16, overflow: 'hidden',
                  background: 'rgba(255,255,255,0.06)', border: `1.5px solid ${phoneValid ? 'rgba(45,212,191,0.5)' : 'rgba(255,255,255,0.1)'}`,
                  boxShadow: phoneValid ? '0 0 16px rgba(45,212,191,0.12)' : 'none', transition: 'all 0.2s' }}>
                  {/* Country prefix */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '0 14px', height: 54, borderRight: '1px solid rgba(255,255,255,0.08)', flexShrink: 0 }}>
                    <span style={{ fontSize: 18 }}>🇮🇳</span>
                    <span style={{ fontSize: 14, fontWeight: 700, color: 'rgba(255,255,255,0.6)' }}>+91</span>
                  </div>
                  {/* Number input */}
                  <div style={{ display: 'flex', alignItems: 'center', flex: 1, padding: '0 14px', gap: 10 }}>
                    <Phone style={{ width: 16, height: 16, color: 'rgba(255,255,255,0.25)', flexShrink: 0 }} />
                    <input
                      type="tel" maxLength={10} value={phone}
                      onChange={e => setPhone(e.target.value.replace(/\D/g,'').slice(0,10))}
                      placeholder="98765 43210"
                      style={{ flex: 1, background: 'none', border: 'none', outline: 'none', fontSize: 18, fontWeight: 700, color: '#FFF', letterSpacing: '1px',
                        caretColor: '#2DD4BF' }}
                    />
                    {phoneValid && <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#2DD4BF', flexShrink: 0, boxShadow: '0 0 8px #2DD4BF' }} />}
                  </div>
                </div>
                {phone.length > 0 && phone.length < 10 && (
                  <div style={{ fontSize: 10, color: 'rgba(245,158,11,0.8)', marginTop: 6, paddingLeft: 4, fontWeight: 600 }}>
                    {10 - phone.length} more digits needed
                  </div>
                )}
              </div>

              {/* Info note */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '10px 12px', borderRadius: 12, background: 'rgba(13,148,136,0.1)', border: '1px solid rgba(13,148,136,0.2)', marginBottom: 20 }}>
                <ShieldCheck style={{ width: 14, height: 14, color: '#2DD4BF', flexShrink: 0, marginTop: 1 }} />
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', lineHeight: 1.5, fontWeight: 500 }}>
                  OTP will be sent to your clinic-registered number. For doctor access only.
                </span>
              </div>

              {/* CTA */}
              <button
                onClick={handleSendOtp}
                disabled={!phoneValid || sending}
                style={{ width: '100%', height: 52, borderRadius: 16, border: 'none', cursor: phoneValid ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontSize: 15, fontWeight: 800, color: '#FFF',
                  background: phoneValid
                    ? 'linear-gradient(135deg, #0D9488 0%, #0891B2 100%)'
                    : 'rgba(255,255,255,0.07)',
                  boxShadow: phoneValid ? '0 6px 24px rgba(13,148,136,0.45)' : 'none',
                  transition: 'all 0.2s ease', opacity: sending ? 0.8 : 1 }}>
                {sending ? (
                  <>
                    <RefreshCw style={{ width: 16, height: 16, animation: 'spin 1s linear infinite' }} />
                    Sending OTP…
                  </>
                ) : (
                  <>
                    Send OTP
                    <ChevronRight style={{ width: 18, height: 18 }} />
                  </>
                )}
              </button>
            </div>
          )}

          {/* ── STEP 2: OTP ── */}
          {step === 'otp' && (
            <div>
              {/* Hidden real input for mobile keyboard */}
              <input
                type="tel" inputMode="numeric" maxLength={6}
                value={otp.join('')}
                onChange={e => {
                  const val = e.target.value.replace(/\D/g,'').slice(0,6);
                  const next = val.split('').concat(Array(6).fill('')).slice(0,6);
                  setOtp(next);
                  setOtpFocus(Math.min(val.length, 5));
                }}
                style={{ position: 'absolute', opacity: 0, pointerEvents: 'none', top: 0, left: 0 }}
                ref={el => { otpRefs.current[0] = el; }}
                autoFocus
              />

              {/* OTP boxes */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 20 }}
                onClick={() => otpRefs.current[0]?.focus()}>
                {otp.map((d, i) => <OtpBox key={i} value={d} focused={otpFocus === i && !otpFilled} />)}
              </div>

              {/* Resend */}
              <div style={{ textAlign: 'center', marginBottom: 20 }}>
                {timer > 0 ? (
                  <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', fontWeight: 600 }}>
                    Resend OTP in <span style={{ color: '#2DD4BF' }}>{timer}s</span>
                  </span>
                ) : (
                  <button onClick={() => setTimer(30)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                    <RefreshCw style={{ width: 12, height: 12, color: '#2DD4BF' }} />
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#2DD4BF' }}>Resend OTP</span>
                  </button>
                )}
              </div>

              {/* Verify CTA */}
              <button
                disabled={!otpFilled}
                style={{ width: '100%', height: 52, borderRadius: 16, border: 'none', cursor: otpFilled ? 'pointer' : 'not-allowed',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontSize: 15, fontWeight: 800, color: '#FFF',
                  background: otpFilled
                    ? 'linear-gradient(135deg, #0D9488 0%, #0891B2 100%)'
                    : 'rgba(255,255,255,0.07)',
                  boxShadow: otpFilled ? '0 6px 24px rgba(13,148,136,0.45)' : 'none',
                  transition: 'all 0.2s ease' }}>
                <ShieldCheck style={{ width: 17, height: 17 }} />
                {otpFilled ? 'Verify & Enter Dashboard' : 'Enter 6-digit OTP'}
              </button>

              {/* Demo hint */}
              <div style={{ textAlign: 'center', marginTop: 12 }}>
                <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)', fontWeight: 500 }}>
                  Demo: tap boxes and type any 6 digits
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── FOOTER ── */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, padding: '0 0 24px', position: 'relative', zIndex: 10 }}>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)', fontWeight: 600 }}>LINESETU · Smart Queue Management</div>
        <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.12)' }}>Authorised clinicians only · v1.0.4</div>
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
