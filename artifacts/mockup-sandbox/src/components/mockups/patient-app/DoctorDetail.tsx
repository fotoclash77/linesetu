import React, { useState } from 'react';
import {
  ChevronLeft, Share2, BadgeCheck,
  MapPin, Clock, Users, IndianRupee,
  Building2, Timer, Radio, Stethoscope, BookOpen,
  CalendarCheck, Sunrise, Sunset, Monitor,
  CheckCircle2,
} from 'lucide-react';

const BG = '#0A0E1A';
const GLASS = { background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.08)' };
const ACCENT = '#EF4444';

const schedule = [
  {
    days: 'Mon – Wed',
    active: true,
    shifts: [
      { label: 'Morning', icon: Sunrise,  time: '9:00 AM – 1:00 PM', clinic: 'HeartCare Clinic',     loc: 'Andheri West',  color: '#F59E0B' },
      { label: 'Evening', icon: Sunset,   time: '5:00 PM – 9:00 PM', clinic: 'City Heart Center',    loc: 'Bandra East',   color: '#818CF8' },
    ],
  },
  {
    days: 'Thu – Fri',
    active: true,
    shifts: [
      { label: 'Morning', icon: Sunrise,  time: '10:00 AM – 2:00 PM', clinic: 'HeartCare Clinic',    loc: 'Andheri West',  color: '#F59E0B' },
    ],
  },
  {
    days: 'Sat',
    active: true,
    shifts: [
      { label: 'Morning', icon: Sunrise,  time: '9:00 AM – 12:00 PM', clinic: 'MedPlus Hospital',    loc: 'Powai',         color: '#22C55E', note: 'Alternate Sat only' },
    ],
  },
  {
    days: 'Sun',
    active: false,
    shifts: [],
  },
];

const fees = [
  { icon: CheckCircle2, label: 'Walk-in Token',          sub: 'Come early at clinic by 9 AM to take your token', amount: '₹0',  color: '#4ADE80', bg: 'rgba(34,197,94,0.1)',  border: 'rgba(34,197,94,0.3)'  },
  { icon: Monitor,      label: 'Clinic E-Appointment',  sub: 'Take token online via LINESETU — no standing in line, from home', amount: '₹20',  color: '#06B6D4', bg: 'rgba(6,182,212,0.1)',    border: 'rgba(6,182,212,0.25)'  },
  { icon: Building2,    label: 'Consultation at Clinic',sub: 'Pay directly at the clinic',  amount: '₹500', color: '#22C55E', bg: 'rgba(34,197,94,0.1)',    border: 'rgba(34,197,94,0.25)'  },
];

export function DoctorDetail() {
  const [activeDay, setActiveDay] = useState(0);

  return (
    <div style={{ width: 390, height: 844, background: BG, fontFamily: "'Inter', sans-serif", display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>

      {/* Glow orbs */}
      <div style={{ position: 'absolute', top: -40, left: -40, width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(239,68,68,0.22) 0%, transparent 70%)', filter: 'blur(20px)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', top: 160, right: -60, width: 180, height: 180, borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.18) 0%, transparent 70%)', filter: 'blur(24px)', pointerEvents: 'none' }} />

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
        <span style={{ fontSize: 15, fontWeight: 700, color: '#FFF' }}>Doctor Profile</span>
        <button style={{ width: 38, height: 38, borderRadius: 12, ...GLASS, border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <Share2 style={{ width: 17, height: 17, color: 'rgba(255,255,255,0.7)' }} />
        </button>
      </div>

      {/* SCROLLABLE BODY */}
      <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', paddingBottom: 84 }}>

        {/* HERO PHOTO */}
        <div style={{ margin: '0 18px', position: 'relative', borderRadius: 22, overflow: 'hidden' }}>
          <img src="https://randomuser.me/api/portraits/women/44.jpg" alt="Dr. Ananya Sharma"
            style={{ width: '100%', height: 220, objectFit: 'cover', objectPosition: 'top', display: 'block' }} />
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 90, background: 'linear-gradient(to top, #0A0E1A 0%, transparent 100%)' }} />
          <div style={{ position: 'absolute', top: 12, right: 12, display: 'flex', alignItems: 'center', gap: 5, background: 'rgba(10,14,26,0.75)', backdropFilter: 'blur(8px)', borderRadius: 20, padding: '4px 10px 4px 6px', border: '1px solid rgba(79,70,229,0.4)' }}>
            <BadgeCheck style={{ width: 16, height: 16, color: '#4F46E5', fill: '#4F46E5', stroke: '#FFF', strokeWidth: 1 }} />
            <span style={{ fontSize: 11, fontWeight: 700, color: '#A5B4FC' }}>Verified</span>
          </div>
          <div style={{ position: 'absolute', top: 12, left: 12, display: 'flex', alignItems: 'center', gap: 5, background: 'rgba(10,14,26,0.75)', backdropFilter: 'blur(8px)', borderRadius: 20, padding: '4px 10px 4px 8px', border: '1px solid rgba(34,197,94,0.3)' }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#22C55E', boxShadow: '0 0 6px #22C55E' }} />
            <span style={{ fontSize: 11, fontWeight: 700, color: '#4ADE80' }}>Available</span>
          </div>
        </div>

        {/* IDENTITY */}
        <div style={{ margin: '0 18px', marginTop: -2, padding: '14px 16px 12px', borderRadius: '0 0 18px 18px', background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.07)', borderTop: 'none', marginBottom: 12 }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: '#FFF', margin: '0 0 5px', letterSpacing: '-0.3px' }}>Dr. Ananya Sharma</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: ACCENT, background: ACCENT + '1A', padding: '3px 9px', borderRadius: 8 }}>Cardiologist</span>
            <span style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.45)', background: 'rgba(255,255,255,0.07)', padding: '3px 9px', borderRadius: 8 }}>12 yrs exp</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <Building2 style={{ width: 12, height: 12, color: 'rgba(255,255,255,0.3)', flexShrink: 0 }} />
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)' }}>HeartCare Clinic</span>
            <span style={{ color: 'rgba(255,255,255,0.2)' }}>·</span>
            <MapPin style={{ width: 11, height: 11, color: 'rgba(255,255,255,0.3)', flexShrink: 0 }} />
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)' }}>Andheri West, Mumbai</span>
          </div>
        </div>

        {/* STATS — no rating */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, padding: '0 18px', marginBottom: 14 }}>
          {[
            { icon: Users,       val: '4.2K+', lbl: 'Patients',   color: '#818CF8' },
            { icon: Stethoscope, val: '12 yrs', lbl: 'Experience', color: '#06B6D4' },
            { icon: Timer,       val: '~25 min', lbl: 'Avg Wait',  color: '#22C55E' },
          ].map(({ icon: Icon, val, lbl, color }) => (
            <div key={lbl} style={{ borderRadius: 16, padding: '12px 6px', textAlign: 'center', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <div style={{ width: 34, height: 34, borderRadius: 11, background: color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 7px' }}>
                <Icon style={{ width: 16, height: 16, color }} />
              </div>
              <div style={{ fontSize: 13, fontWeight: 800, color: '#FFF', lineHeight: 1 }}>{val}</div>
              <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)', marginTop: 3, fontWeight: 500 }}>{lbl}</div>
            </div>
          ))}
        </div>

        {/* FEE BREAKDOWN */}
        <div style={{ margin: '0 18px', marginBottom: 14, padding: '14px 16px', borderRadius: 18, ...GLASS }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 12 }}>
            <IndianRupee style={{ width: 14, height: 14, color: '#F59E0B' }} />
            <span style={{ fontSize: 13, fontWeight: 700, color: '#FFF' }}>Fee Structure</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {fees.map(({ icon: Icon, label, sub, amount, color, bg, border }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 14, background: bg, border: `1px solid ${border}` }}>
                <div style={{ width: 36, height: 36, borderRadius: 11, background: color + '22', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon style={{ width: 16, height: 16, color }} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#FFF', marginBottom: 1 }}>{label}</div>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.38)' }}>{sub}</div>
                </div>
                <div style={{ fontSize: 16, fontWeight: 900, color, flexShrink: 0 }}>{amount}</div>
              </div>
            ))}
          </div>
        </div>

        {/* WEEKLY SCHEDULE */}
        <div style={{ margin: '0 18px', marginBottom: 14, padding: '14px 16px', borderRadius: 18, ...GLASS }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 12 }}>
            <CalendarCheck style={{ width: 14, height: 14, color: '#06B6D4' }} />
            <span style={{ fontSize: 13, fontWeight: 700, color: '#FFF' }}>Weekly Schedule</span>
          </div>

          {/* Day selector */}
          <div style={{ display: 'flex', gap: 6, marginBottom: 14, overflowX: 'auto', scrollbarWidth: 'none' }}>
            {schedule.map((s, i) => (
              <button key={s.days} onClick={() => setActiveDay(i)}
                style={{ flexShrink: 0, padding: '5px 12px', borderRadius: 10, cursor: 'pointer', border: 'none',
                  background: activeDay === i ? 'rgba(99,102,241,0.3)' : 'rgba(255,255,255,0.05)',
                  outline: activeDay === i ? '1px solid rgba(99,102,241,0.6)' : '1px solid rgba(255,255,255,0.08)',
                }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: activeDay === i ? '#A5B4FC' : s.active ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.22)' }}>
                  {s.days}
                </span>
              </button>
            ))}
          </div>

          {/* Shifts for selected day */}
          {schedule[activeDay].active ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {schedule[activeDay].shifts.map((shift) => {
                const Icon = shift.icon;
                return (
                  <div key={shift.label} style={{ padding: '12px 14px', borderRadius: 14, background: shift.color + '0F', border: `1px solid ${shift.color}28` }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div style={{ width: 28, height: 28, borderRadius: 9, background: shift.color + '22', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Icon style={{ width: 14, height: 14, color: shift.color }} />
                        </div>
                        <span style={{ fontSize: 12, fontWeight: 700, color: shift.color }}>{shift.label} Shift</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                        <Clock style={{ width: 10, height: 10, color: 'rgba(255,255,255,0.35)' }} />
                        <span style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.65)' }}>{shift.time}</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      <Building2 style={{ width: 11, height: 11, color: 'rgba(255,255,255,0.3)', flexShrink: 0 }} />
                      <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', fontWeight: 600 }}>{shift.clinic}</span>
                      <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)' }}>·</span>
                      <MapPin style={{ width: 10, height: 10, color: 'rgba(255,255,255,0.3)', flexShrink: 0 }} />
                      <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>{shift.loc}</span>
                    </div>
                    {'note' in shift && shift.note && (
                      <div style={{ marginTop: 5, fontSize: 10, color: '#F59E0B', fontWeight: 600 }}>⚠ {shift.note}</div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '18px 0' }}>
              <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.25)', fontWeight: 500 }}>Not available on Sunday</span>
            </div>
          )}
        </div>

        {/* LIVE QUEUE */}
        <div style={{ margin: '0 18px', marginBottom: 14, borderRadius: 18, padding: '14px 16px', background: 'linear-gradient(135deg, rgba(79,70,229,0.2) 0%, rgba(6,182,212,0.13) 100%)', border: '1px solid rgba(99,102,241,0.3)', backdropFilter: 'blur(16px)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#22C55E', boxShadow: '0 0 8px #22C55E' }} />
            <span style={{ fontSize: 12, fontWeight: 700, color: '#4ADE80', letterSpacing: '0.07em', textTransform: 'uppercase' }}>Live Queue</span>
            <div style={{ flex: 1 }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <Radio style={{ width: 10, height: 10, color: '#818CF8' }} />
              <span style={{ fontSize: 10, color: '#818CF8', fontWeight: 600 }}>Cardiology OPD</span>
            </div>
          </div>
          {/* Day & Date */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12, padding: '6px 10px', borderRadius: 10, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', alignSelf: 'flex-start', width: 'fit-content' }}>
            <CalendarCheck style={{ width: 12, height: 12, color: '#67E8F9' }} />
            <span style={{ fontSize: 11, fontWeight: 700, color: '#67E8F9' }}>Thursday</span>
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', fontWeight: 500 }}>·</span>
            <span style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.55)' }}>10 Apr 2026</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
            {[
              { label: 'Current Token', val: '42', color: '#67E8F9', bg: 'rgba(6,182,212,0.15)', border: 'rgba(6,182,212,0.3)' },
              { label: 'Your Token',    val: '56', color: '#A5B4FC', bg: 'rgba(79,70,229,0.2)',  border: 'rgba(99,102,241,0.45)' },
              { label: 'Est. Wait',     val: '~35m',color: '#4ADE80', bg: 'rgba(34,197,94,0.1)', border: 'rgba(34,197,94,0.25)' },
            ].map(({ label, val, color, bg, border }) => (
              <div key={label} style={{ background: bg, border: `1px solid ${border}`, borderRadius: 14, padding: '10px 6px', textAlign: 'center' }}>
                <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.38)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>{label}</div>
                <div style={{ fontSize: 22, fontWeight: 900, color, lineHeight: 1 }}>{val}</div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 10 }}>
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>14 people ahead · HeartCare Clinic, Andheri (Morning)</span>
          </div>
        </div>

      </div>

      {/* BOTTOM CTA */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '12px 18px 20px', background: 'rgba(10,14,26,0.95)', backdropFilter: 'blur(20px)', borderTop: '1px solid rgba(255,255,255,0.07)', zIndex: 20 }}>
        <button style={{ width: '100%', height: 52, borderRadius: 16, background: 'linear-gradient(135deg, #4F46E5 0%, #6366F1 60%, #0EA5E9 100%)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontSize: 15, fontWeight: 700, color: '#FFF', boxShadow: '0 8px 28px rgba(79,70,229,0.45)' }}>
          <CalendarCheck style={{ width: 18, height: 18 }} />
          Book Appointment · ₹10 Platform Fee
        </button>
      </div>
    </div>
  );
}
