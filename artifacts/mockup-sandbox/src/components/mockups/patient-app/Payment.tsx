import React, { useState } from 'react';
import {
  ChevronLeft, BadgeCheck, Building2, MapPin,
  Sunrise, CalendarCheck, Ticket, Monitor,
  Lock, ShieldCheck, Smartphone,
  CreditCard, Wallet, IndianRupee, Clock,
  ShieldAlert, Siren,
} from 'lucide-react';

const BG = '#0A0E1A';
const GLASS = { background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.08)' };

const PAYMENT_METHODS = [
  { id: 'upi',    label: 'UPI / QR Pay',        sub: 'GPay, PhonePe, Paytm, BHIM', icon: Smartphone, color: '#818CF8' },
  { id: 'card',   label: 'Credit / Debit Card',  sub: 'Visa, Mastercard, RuPay',    icon: CreditCard,  color: '#06B6D4' },
  { id: 'wallet', label: 'Wallets',               sub: 'Paytm, Amazon Pay, Mobikwik',icon: Wallet,      color: '#22C55E' },
];

export function Payment() {
  const [method, setMethod] = useState('upi');
  const [upiId, setUpiId] = useState('');
  const [tokenType, setTokenType] = useState<'normal' | 'emergency'>('normal');

  const isEmergency = tokenType === 'emergency';
  const eAppFee     = isEmergency ? 20 : 10;
  const platformFee = 10;
  const total       = eAppFee + platformFee;
  const consultFee  = isEmergency ? 700 : 500;
  const tokenNo     = isEmergency ? '#E34' : '#34';
  const tokenLabel  = `${tokenNo} · ${isEmergency ? 'Emergency' : 'Online'}`;

  const btnBg   = isEmergency
    ? 'linear-gradient(135deg, #DC2626 0%, #EF4444 60%, #F97316 100%)'
    : 'linear-gradient(135deg, #4F46E5 0%, #6366F1 60%, #0EA5E9 100%)';
  const btnGlow = isEmergency ? '0 8px 28px rgba(239,68,68,0.5)' : '0 8px 28px rgba(79,70,229,0.45)';

  return (
    <div style={{ width: 390, height: 844, background: BG, fontFamily: "'Inter', sans-serif", display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>

      {/* Glow orbs */}
      <div style={{ position: 'absolute', top: -50, left: -50, width: 220, height: 220, borderRadius: '50%', background: isEmergency ? 'radial-gradient(circle, rgba(239,68,68,0.2) 0%, transparent 70%)' : 'radial-gradient(circle, rgba(99,102,241,0.22) 0%, transparent 70%)', filter: 'blur(24px)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: 160, right: -60, width: 180, height: 180, borderRadius: '50%', background: 'radial-gradient(circle, rgba(6,182,212,0.16) 0%, transparent 70%)', filter: 'blur(24px)', pointerEvents: 'none' }} />

      {/* STATUS BAR */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px 4px', position: 'relative', zIndex: 10, flexShrink: 0 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.7)' }}>9:41</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          {[0.4, 0.65, 0.9, 1].map((op, i) => <div key={i} style={{ width: 3, height: 6 + i * 2, borderRadius: 2, background: `rgba(255,255,255,${op})` }} />)}
          <div style={{ width: 6 }} />
          <svg width="16" height="11" viewBox="0 0 16 11" fill="none"><path d="M8 2C10.4 2 12.6 3 14.1 4.7L15.5 3.2C13.6 1.2 10.9 0 8 0C5.1 0 2.4 1.2 0.5 3.2L1.9 4.7C3.4 3 5.6 2 8 2Z" fill="white" opacity="0.4"/><path d="M8 5C9.7 5 11.2 5.7 12.3 6.8L13.7 5.3C12.2 3.9 10.2 3 8 3C5.8 3 3.8 3.9 2.3 5.3L3.7 6.8C4.8 5.7 6.3 5 8 5Z" fill="white" opacity="0.7"/><circle cx="8" cy="9.5" r="1.5" fill="white"/></svg>
          <div style={{ width: 4 }} />
          <svg width="24" height="12" viewBox="0 0 24 12" fill="none"><rect x="0.5" y="0.5" width="20" height="11" rx="3.5" stroke="white" strokeOpacity="0.3"/><rect x="2" y="2" width="14" height="8" rx="2" fill="white" fillOpacity="0.85"/><path d="M22 4.5V7.5C22.8 7.2 23.5 6.4 23.5 6C23.5 5.6 22.8 4.8 22 4.5Z" fill="white" opacity="0.35"/></svg>
        </div>
      </div>

      {/* TOP NAV */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 18px 10px', position: 'relative', zIndex: 10, flexShrink: 0 }}>
        <button style={{ width: 38, height: 38, borderRadius: 12, ...GLASS, border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <ChevronLeft style={{ width: 20, height: 20, color: 'rgba(255,255,255,0.8)' }} />
        </button>
        <span style={{ fontSize: 15, fontWeight: 700, color: '#FFF' }}>Confirm & Pay</span>
        <div style={{ width: 38 }} />
      </div>

      {/* SCROLLABLE */}
      <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', paddingBottom: 100 }}>

        {/* ── TOKEN TYPE SELECTOR ── */}
        <div style={{ margin: '0 18px 14px' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.4)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Select Token Type</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {/* Normal */}
            <button onClick={() => setTokenType('normal')}
              style={{ padding: '12px 10px', borderRadius: 16, border: `1.5px solid ${!isEmergency ? 'rgba(99,102,241,0.6)' : 'rgba(255,255,255,0.08)'}`, background: !isEmergency ? 'rgba(99,102,241,0.18)' : 'rgba(255,255,255,0.04)', cursor: 'pointer', textAlign: 'center' }}>
              <div style={{ width: 32, height: 32, borderRadius: 10, background: !isEmergency ? 'rgba(99,102,241,0.3)' : 'rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 6px' }}>
                <Ticket style={{ width: 15, height: 15, color: !isEmergency ? '#A5B4FC' : 'rgba(255,255,255,0.3)' }} />
              </div>
              <div style={{ fontSize: 13, fontWeight: 800, color: !isEmergency ? '#A5B4FC' : 'rgba(255,255,255,0.35)' }}>Normal</div>
              <div style={{ fontSize: 9, color: !isEmergency ? 'rgba(165,180,252,0.6)' : 'rgba(255,255,255,0.22)', marginTop: 2 }}>Pay ₹20 · Consult ₹500</div>
            </button>
            {/* Emergency */}
            <button onClick={() => setTokenType('emergency')}
              style={{ padding: '12px 10px', borderRadius: 16, border: `1.5px solid ${isEmergency ? 'rgba(239,68,68,0.6)' : 'rgba(255,255,255,0.08)'}`, background: isEmergency ? 'rgba(239,68,68,0.15)' : 'rgba(255,255,255,0.04)', cursor: 'pointer', textAlign: 'center' }}>
              <div style={{ width: 32, height: 32, borderRadius: 10, background: isEmergency ? 'rgba(239,68,68,0.25)' : 'rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 6px' }}>
                <ShieldAlert style={{ width: 15, height: 15, color: isEmergency ? '#F87171' : 'rgba(255,255,255,0.3)' }} />
              </div>
              <div style={{ fontSize: 13, fontWeight: 800, color: isEmergency ? '#F87171' : 'rgba(255,255,255,0.35)' }}>Emergency</div>
              <div style={{ fontSize: 9, color: isEmergency ? 'rgba(248,113,113,0.6)' : 'rgba(255,255,255,0.22)', marginTop: 2 }}>Pay ₹30 · Consult ₹700</div>
            </button>
          </div>
          {isEmergency && (
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6, marginTop: 8, padding: '8px 10px', borderRadius: 11, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)' }}>
              <Siren style={{ width: 11, height: 11, color: '#F87171', flexShrink: 0, marginTop: 1 }} />
              <span style={{ fontSize: 10, color: 'rgba(248,113,113,0.8)', lineHeight: 1.5 }}>Emergency tokens go to the top of the queue and are seen before all normal patients. Priority fee applies.</span>
            </div>
          )}
        </div>

        {/* ── APPOINTMENT SUMMARY ── */}
        <div style={{ margin: '0 18px 14px', borderRadius: 20, overflow: 'hidden', ...GLASS }}>
          {/* Doctor row */}
          <div style={{ padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <img src="https://randomuser.me/api/portraits/women/44.jpg" alt="Dr. Ananya Sharma"
              style={{ width: 44, height: 44, borderRadius: 13, objectFit: 'cover', objectPosition: 'top', border: '2px solid rgba(239,68,68,0.35)', flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 2 }}>
                <span style={{ fontSize: 13, fontWeight: 800, color: '#FFF' }}>Dr. Ananya Sharma</span>
                <BadgeCheck style={{ width: 13, height: 13, color: '#4F46E5', fill: '#4F46E5', stroke: '#FFF', strokeWidth: 1 }} />
              </div>
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>Cardiologist · HeartCare Clinic</span>
            </div>
            <div style={{ padding: '3px 9px', borderRadius: 8, background: isEmergency ? 'rgba(239,68,68,0.15)' : 'rgba(34,197,94,0.15)', border: `1px solid ${isEmergency ? 'rgba(239,68,68,0.35)' : 'rgba(34,197,94,0.3)'}`, flexShrink: 0 }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: isEmergency ? '#F87171' : '#4ADE80' }}>{isEmergency ? 'Emergency' : 'Confirmed'}</span>
            </div>
          </div>

          {/* Appointment details grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, background: 'rgba(255,255,255,0.035)' }}>
            {[
              { icon: CalendarCheck, label: 'Date',      val: 'Fri, 10 Apr 2026', color: '#67E8F9' },
              { icon: Sunrise,       label: 'Shift',     val: 'Morning Shift',    color: '#F59E0B' },
              { icon: Clock,         label: 'Timing',    val: '10:00 AM – 2:00 PM', color: '#818CF8' },
              { icon: isEmergency ? ShieldAlert : Ticket, label: 'Token No.', val: tokenLabel, color: isEmergency ? '#F87171' : '#A5B4FC' },
            ].map(({ icon: Icon, label, val, color }, idx) => (
              <div key={label} style={{ padding: '11px 13px', borderRight: idx % 2 === 0 ? '1px solid rgba(255,255,255,0.05)' : 'none', borderBottom: idx < 2 ? '1px solid rgba(255,255,255,0.05)' : 'none', background: 'rgba(255,255,255,0.02)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 3 }}>
                  <Icon style={{ width: 10, height: 10, color }} />
                  <span style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</span>
                </div>
                <span style={{ fontSize: 12, fontWeight: 700, color: label === 'Token No.' ? color : '#FFF' }}>{val}</span>
              </div>
            ))}
          </div>

          {/* Clinic location */}
          <div style={{ padding: '9px 14px', display: 'flex', alignItems: 'center', gap: 6, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
            <Building2 style={{ width: 11, height: 11, color: 'rgba(255,255,255,0.3)', flexShrink: 0 }} />
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>HeartCare Clinic</span>
            <span style={{ color: 'rgba(255,255,255,0.18)' }}>·</span>
            <MapPin style={{ width: 10, height: 10, color: 'rgba(255,255,255,0.3)', flexShrink: 0 }} />
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>Andheri West, Mumbai</span>
          </div>
        </div>

        {/* ── PAYMENT SUMMARY ── */}
        <div style={{ margin: '0 18px 14px', borderRadius: 20, overflow: 'hidden', ...GLASS }}>
          <div style={{ padding: '12px 16px 10px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#FFF' }}>Payment Summary</span>
          </div>
          <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>

            {/* Clinic E-Appointment */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 30, height: 30, borderRadius: 9, background: isEmergency ? 'rgba(239,68,68,0.15)' : 'rgba(6,182,212,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Monitor style={{ width: 14, height: 14, color: isEmergency ? '#F87171' : '#67E8F9' }} />
                </div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.85)' }}>Clinic E-Appointment{isEmergency ? ' (Priority)' : ''}</div>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)' }}>{isEmergency ? 'Emergency priority token fee' : 'Online token booking fee'}</div>
                </div>
              </div>
              <span style={{ fontSize: 14, fontWeight: 800, color: isEmergency ? '#F87171' : '#67E8F9' }}>₹{eAppFee}</span>
            </div>

            {/* Platform fee */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 30, height: 30, borderRadius: 9, background: 'rgba(99,102,241,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ShieldCheck style={{ width: 14, height: 14, color: '#818CF8' }} />
                </div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.85)' }}>Platform Fee</div>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)' }}>LINESETU service charge</div>
                </div>
              </div>
              <span style={{ fontSize: 14, fontWeight: 800, color: '#818CF8' }}>₹{platformFee}</span>
            </div>

            {/* Divider */}
            <div style={{ height: 1, background: 'rgba(255,255,255,0.06)' }} />

            {/* Total */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', borderRadius: 14,
              background: isEmergency ? 'linear-gradient(135deg, rgba(239,68,68,0.2), rgba(249,115,22,0.12))' : 'linear-gradient(135deg, rgba(79,70,229,0.2), rgba(6,182,212,0.12))',
              border: `1px solid ${isEmergency ? 'rgba(239,68,68,0.35)' : 'rgba(99,102,241,0.3)'}` }}>
              <div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>Total Payable Now</div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.28)' }}>₹{eAppFee} + ₹{platformFee} = ₹{total}</div>
              </div>
              <div style={{ fontSize: 30, fontWeight: 900, color: isEmergency ? '#F87171' : '#A5B4FC', lineHeight: 1, letterSpacing: '-0.5px' }}>₹{total}</div>
            </div>

            {/* Clinic fee note */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6, padding: '8px 10px', borderRadius: 12, background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)' }}>
              <IndianRupee style={{ width: 11, height: 11, color: '#F59E0B', marginTop: 1, flexShrink: 0 }} />
              <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', lineHeight: 1.6 }}>
                Consultation fee of <strong style={{ color: isEmergency ? '#F87171' : '#FCD34D' }}>₹{consultFee}</strong> {isEmergency ? '(Emergency)' : ''} is paid separately at the clinic. Not included here.
              </span>
            </div>
          </div>
        </div>

        {/* ── PAYMENT METHOD ── */}
        <div style={{ margin: '0 18px 14px' }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#FFF', display: 'block', marginBottom: 10 }}>Pay Via</span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {PAYMENT_METHODS.map(({ id, label, sub, icon: Icon, color }) => {
              const active = method === id;
              return (
                <div key={id} onClick={() => setMethod(id)}
                  style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 16, cursor: 'pointer',
                    background: active ? color + '14' : 'rgba(255,255,255,0.04)',
                    border: `1.5px solid ${active ? color + '55' : 'rgba(255,255,255,0.07)'}` }}>
                  <div style={{ width: 40, height: 40, borderRadius: 12, background: active ? color + '22' : 'rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon style={{ width: 18, height: 18, color: active ? color : 'rgba(255,255,255,0.35)' }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: active ? '#FFF' : 'rgba(255,255,255,0.6)', marginBottom: 2 }}>{label}</div>
                    <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>{sub}</div>
                  </div>
                  <div style={{ width: 20, height: 20, borderRadius: '50%', border: `2px solid ${active ? color : 'rgba(255,255,255,0.15)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {active && <div style={{ width: 10, height: 10, borderRadius: '50%', background: color }} />}
                  </div>
                </div>
              );
            })}
          </div>
          {method === 'upi' && (
            <div style={{ marginTop: 10, padding: '4px 14px', borderRadius: 14, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(99,102,241,0.35)' }}>
              <input value={upiId} onChange={e => setUpiId(e.target.value)}
                placeholder="Enter UPI ID  e.g. name@okicici"
                style={{ width: '100%', height: 44, background: 'transparent', border: 'none', outline: 'none', fontSize: 13, color: '#FFF', fontFamily: "'Inter', sans-serif" }} />
            </div>
          )}
        </div>

      </div>

      {/* BOTTOM CTA */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '12px 18px 20px', background: 'rgba(10,14,26,0.95)', backdropFilter: 'blur(20px)', borderTop: '1px solid rgba(255,255,255,0.07)', zIndex: 20 }}>
        <button style={{ width: '100%', height: 52, borderRadius: 16, background: btnBg, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontSize: 16, fontWeight: 800, color: '#FFF', boxShadow: btnGlow }}>
          <Lock style={{ width: 16, height: 16 }} />
          Pay ₹{total} Securely · {isEmergency ? 'Emergency Token' : 'Normal Token'}
        </button>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, marginTop: 8 }}>
          <ShieldCheck style={{ width: 10, height: 10, color: 'rgba(255,255,255,0.25)' }} />
          <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)', fontWeight: 500 }}>256-bit SSL encrypted · Powered by LINESETU</span>
        </div>
      </div>
    </div>
  );
}
