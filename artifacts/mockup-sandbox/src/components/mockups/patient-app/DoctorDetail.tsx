import React from 'react';
import {
  ChevronLeft, Share2, BadgeCheck,
  MapPin, Star, Clock, Users, IndianRupee,
  Building2, Timer, Radio, Stethoscope, BookOpen,
  CalendarCheck,
} from 'lucide-react';

const BG = '#0A0E1A';
const GLASS = { background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.08)' };
const ACCENT = '#EF4444';

export function DoctorDetail() {
  return (
    <div style={{ width: 390, height: 844, background: BG, fontFamily: "'Inter', sans-serif", display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>

      {/* Glow orbs */}
      <div style={{ position: 'absolute', top: -40, left: -40, width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(239,68,68,0.22) 0%, transparent 70%)', filter: 'blur(20px)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', top: 160, right: -60, width: 180, height: 180, borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.18) 0%, transparent 70%)', filter: 'blur(24px)', pointerEvents: 'none' }} />

      {/* ── STATUS BAR ── */}
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

      {/* ── TOP NAV ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 18px 10px', position: 'relative', zIndex: 10, flexShrink: 0 }}>
        <button style={{ width: 38, height: 38, borderRadius: 12, ...GLASS, border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <ChevronLeft style={{ width: 20, height: 20, color: 'rgba(255,255,255,0.8)' }} />
        </button>
        <span style={{ fontSize: 15, fontWeight: 700, color: '#FFF' }}>Doctor Profile</span>
        <button style={{ width: 38, height: 38, borderRadius: 12, ...GLASS, border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <Share2 style={{ width: 17, height: 17, color: 'rgba(255,255,255,0.7)' }} />
        </button>
      </div>

      {/* ── SCROLLABLE BODY ── */}
      <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', paddingBottom: 80 }}>

        {/* ── HERO PHOTO ── */}
        <div style={{ margin: '0 18px', position: 'relative', borderRadius: 22, overflow: 'hidden', marginBottom: 0 }}>
          <img
            src="https://randomuser.me/api/portraits/women/44.jpg"
            alt="Dr. Ananya Sharma"
            style={{ width: '100%', height: 230, objectFit: 'cover', objectPosition: 'top', display: 'block' }}
          />
          {/* Gradient overlay bottom */}
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 100, background: 'linear-gradient(to top, #0A0E1A 0%, transparent 100%)' }} />
          {/* Verified badge top-right */}
          <div style={{ position: 'absolute', top: 12, right: 12, display: 'flex', alignItems: 'center', gap: 5, background: 'rgba(10,14,26,0.75)', backdropFilter: 'blur(8px)', borderRadius: 20, padding: '4px 10px 4px 6px', border: '1px solid rgba(79,70,229,0.4)' }}>
            <BadgeCheck style={{ width: 16, height: 16, color: '#4F46E5', fill: '#4F46E5', stroke: '#FFF', strokeWidth: 1 }} />
            <span style={{ fontSize: 11, fontWeight: 700, color: '#A5B4FC' }}>Verified</span>
          </div>
          {/* Live status top-left */}
          <div style={{ position: 'absolute', top: 12, left: 12, display: 'flex', alignItems: 'center', gap: 5, background: 'rgba(10,14,26,0.75)', backdropFilter: 'blur(8px)', borderRadius: 20, padding: '4px 10px 4px 8px', border: '1px solid rgba(34,197,94,0.3)' }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#22C55E', boxShadow: '0 0 6px #22C55E' }} />
            <span style={{ fontSize: 11, fontWeight: 700, color: '#4ADE80' }}>Available</span>
          </div>
        </div>

        {/* ── IDENTITY CARD ── */}
        <div style={{ margin: '0 18px', marginTop: -2, padding: '16px 16px 14px', borderRadius: '0 0 20px 20px', background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.07)', borderTop: 'none', marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <div style={{ flex: 1 }}>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: '#FFF', margin: '0 0 4px', letterSpacing: '-0.3px' }}>Dr. Ananya Sharma</h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: ACCENT, background: ACCENT + '1A', padding: '3px 9px', borderRadius: 8 }}>Cardiologist</span>
                <span style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.45)', background: 'rgba(255,255,255,0.07)', padding: '3px 9px', borderRadius: 8 }}>12 yrs exp</span>
              </div>
            </div>
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 3, justifyContent: 'flex-end', marginBottom: 2 }}>
                <Star style={{ width: 13, height: 13, fill: '#F59E0B', color: '#F59E0B' }} />
                <span style={{ fontSize: 15, fontWeight: 800, color: '#F59E0B' }}>4.9</span>
              </div>
              <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>312 reviews</span>
            </div>
          </div>

          {/* Clinic row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 10 }}>
            <Building2 style={{ width: 13, height: 13, color: 'rgba(255,255,255,0.3)', flexShrink: 0 }} />
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>HeartCare Clinic</span>
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.2)' }}>·</span>
            <MapPin style={{ width: 11, height: 11, color: 'rgba(255,255,255,0.3)', flexShrink: 0 }} />
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>Andheri West, Mumbai</span>
          </div>
        </div>

        {/* ── STATS GRID ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, padding: '0 18px', marginBottom: 14 }}>
          {[
            { icon: Users,        val: '4.2K+', lbl: 'Patients',   color: '#818CF8' },
            { icon: Stethoscope,  val: '12 yrs', lbl: 'Experience', color: '#06B6D4' },
            { icon: Timer,        val: '25 min', lbl: 'Avg Wait',   color: '#22C55E' },
            { icon: IndianRupee,  val: '₹500',  lbl: 'At Clinic',  color: '#F59E0B' },
          ].map(({ icon: Icon, val, lbl, color }) => (
            <div key={lbl} style={{ borderRadius: 16, padding: '11px 6px', textAlign: 'center', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <div style={{ width: 32, height: 32, borderRadius: 10, background: color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 6px' }}>
                <Icon style={{ width: 15, height: 15, color }} />
              </div>
              <div style={{ fontSize: 12, fontWeight: 800, color: '#FFF', lineHeight: 1 }}>{val}</div>
              <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)', marginTop: 3, fontWeight: 500 }}>{lbl}</div>
            </div>
          ))}
        </div>

        {/* ── ABOUT ── */}
        <div style={{ margin: '0 18px', marginBottom: 14, padding: '14px 16px', borderRadius: 18, ...GLASS }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 8 }}>
            <BookOpen style={{ width: 14, height: 14, color: '#818CF8' }} />
            <span style={{ fontSize: 13, fontWeight: 700, color: '#FFF' }}>About</span>
          </div>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', lineHeight: 1.7, margin: 0 }}>
            Dr. Ananya Sharma is a senior Cardiologist at HeartCare Clinic with over 12 years of clinical experience. She specialises in preventive cardiology, echocardiography, and cardiac rehabilitation, and has treated 4,200+ patients across Mumbai.
          </p>
        </div>

        {/* ── AVAILABILITY ── */}
        <div style={{ margin: '0 18px', marginBottom: 14, padding: '14px 16px', borderRadius: 18, ...GLASS }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 10 }}>
            <CalendarCheck style={{ width: 14, height: 14, color: '#06B6D4' }} />
            <span style={{ fontSize: 13, fontWeight: 700, color: '#FFF' }}>Availability</span>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map((d) => (
              <div key={d} style={{ padding: '5px 12px', borderRadius: 10, background: 'rgba(99,102,241,0.18)', border: '1px solid rgba(99,102,241,0.35)' }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#A5B4FC' }}>{d}</span>
              </div>
            ))}
            {['Sat', 'Sun'].map((d) => (
              <div key={d} style={{ padding: '5px 12px', borderRadius: 10, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.25)' }}>{d}</span>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 10 }}>
            <Clock style={{ width: 12, height: 12, color: 'rgba(255,255,255,0.3)' }} />
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>10:00 AM – 8:00 PM</span>
          </div>
        </div>

        {/* ── LIVE QUEUE ── */}
        <div style={{ margin: '0 18px', marginBottom: 14, borderRadius: 18, overflow: 'hidden', padding: '14px 16px', background: 'linear-gradient(135deg, rgba(79,70,229,0.2) 0%, rgba(6,182,212,0.13) 100%)', border: '1px solid rgba(99,102,241,0.3)', backdropFilter: 'blur(16px)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#22C55E', boxShadow: '0 0 8px #22C55E' }} />
            <span style={{ fontSize: 12, fontWeight: 700, color: '#4ADE80', letterSpacing: '0.07em', textTransform: 'uppercase' }}>Live Queue Status</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
            {[
              { label: 'Current Token', val: '42', color: '#67E8F9', bg: 'rgba(6,182,212,0.15)', border: 'rgba(6,182,212,0.3)' },
              { label: 'Your Token', val: '56', color: '#A5B4FC', bg: 'rgba(79,70,229,0.2)', border: 'rgba(99,102,241,0.45)' },
              { label: 'Est. Wait', val: '~35m', color: '#4ADE80', bg: 'rgba(34,197,94,0.1)', border: 'rgba(34,197,94,0.25)' },
            ].map(({ label, val, color, bg, border }) => (
              <div key={label} style={{ background: bg, border: `1px solid ${border}`, borderRadius: 14, padding: '10px 6px', textAlign: 'center' }}>
                <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.38)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>{label}</div>
                <div style={{ fontSize: 22, fontWeight: 900, color, lineHeight: 1 }}>{val}</div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10 }}>
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>14 people ahead of you</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <Radio style={{ width: 10, height: 10, color: '#818CF8' }} />
              <span style={{ fontSize: 11, color: '#818CF8', fontWeight: 600 }}>Cardiology OPD</span>
            </div>
          </div>
        </div>

      </div>

      {/* ── BOTTOM CTA ── */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '12px 18px 20px', background: 'rgba(10,14,26,0.95)', backdropFilter: 'blur(20px)', borderTop: '1px solid rgba(255,255,255,0.07)', zIndex: 20 }}>
        <button style={{ width: '100%', height: 52, borderRadius: 16, background: 'linear-gradient(135deg, #4F46E5 0%, #6366F1 60%, #0EA5E9 100%)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontSize: 15, fontWeight: 700, color: '#FFF', boxShadow: '0 8px 28px rgba(79,70,229,0.45)' }}>
          <CalendarCheck style={{ width: 18, height: 18 }} />
          Book Appointment · ₹10 Platform Fee
        </button>
      </div>
    </div>
  );
}
