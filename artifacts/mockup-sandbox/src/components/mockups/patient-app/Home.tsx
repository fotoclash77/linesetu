import React from 'react';
import {
  Bell, Search, MapPin,
  Home as HomeIcon, CalendarDays, User,
  CalendarPlus, ClipboardList, UserPlus, QrCode,
  Star, Clock, ChevronRight,
  Heart, Smile, Baby, Bone, Ear, Brain, Eye, Stethoscope,
  Zap, Radio, Timer, Hash, BadgeCheck, Building2, Users,
} from 'lucide-react';

const BG = '#0A0E1A';
const GLASS = { background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.08)' };
const GLASS_STRONG = { background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.11)' };

const quickLinks = [
  { icon: CalendarPlus, label: 'Book Token',  color: '#4F46E5', glow: 'rgba(79,70,229,0.3)' },
  { icon: ClipboardList, label: 'My Appointments', color: '#06B6D4', glow: 'rgba(6,182,212,0.3)' },
  { icon: UserPlus,     label: 'Add Family',  color: '#22C55E', glow: 'rgba(34,197,94,0.3)' },
  { icon: QrCode,       label: 'Scan QR',    color: '#F59E0B', glow: 'rgba(245,158,11,0.3)' },
];

const recommended = [
  { name: 'Dr. Ananya Sharma', spec: 'Cardiologist',  token: 47, wait: '25 min', fee: '₹500', rating: 4.9, initials: 'AS', accent: '#EF4444', photo: 'https://randomuser.me/api/portraits/women/44.jpg', clinic: 'HeartCare Clinic, Andheri', patients: '4.2K+', exp: '12 yrs' },
  { name: 'Dr. Vikram Patel',  spec: 'Dermatologist', token: 12, wait: '10 min', fee: '₹400', rating: 4.8, initials: 'VP', accent: '#3B82F6', photo: 'https://randomuser.me/api/portraits/men/32.jpg',   clinic: 'Skin Glow Center, Bandra', patients: '3.1K+', exp: '9 yrs'  },
  { name: 'Dr. Priya Nair',    spec: 'Neurologist',   token: 31, wait: '18 min', fee: '₹600', rating: 4.7, initials: 'PN', accent: '#8B5CF6', photo: 'https://randomuser.me/api/portraits/women/68.jpg', clinic: 'NeuroPlus Hospital, Powai', patients: '2.8K+', exp: '15 yrs' },
];

const topRated = [
  { name: 'Dr. Rohan Desai',  spec: 'Pediatrician', rating: 5.0, reviews: 312, fee: '₹350', initials: 'RD', accent: '#10B981', photo: 'https://randomuser.me/api/portraits/men/46.jpg'   },
  { name: 'Dr. Sneha Joshi',  spec: 'Gynecologist', rating: 4.9, reviews: 278, fee: '₹550', initials: 'SJ', accent: '#EC4899', photo: 'https://randomuser.me/api/portraits/women/56.jpg' },
  { name: 'Dr. Arun Kumar',   spec: 'Orthopedic',   rating: 4.9, reviews: 195, fee: '₹450', initials: 'AK', accent: '#F97316', photo: 'https://randomuser.me/api/portraits/men/74.jpg'   },
];

const categories = [
  { icon: Heart,      label: 'Cardiology', color: '#EF4444' },
  { icon: Smile,      label: 'Dentist',    color: '#3B82F6' },
  { icon: Eye,        label: 'Eye Care',   color: '#06B6D4' },
  { icon: Baby,       label: 'Pediatric',  color: '#22C55E' },
  { icon: Brain,      label: 'Neurology',  color: '#8B5CF6' },
  { icon: Bone,       label: 'Orthopedic', color: '#F97316' },
  { icon: Ear,        label: 'ENT',        color: '#EC4899' },
  { icon: Stethoscope,label: 'General',    color: '#F59E0B' },
];

function Avatar({ initials, accent, photo, size = 44 }: { initials: string; accent: string; photo?: string; size?: number }) {
  const radius = size / 2.5;
  if (photo) {
    return (
      <div style={{ width: size, height: size, borderRadius: radius, border: `2px solid ${accent}55`, overflow: 'hidden', flexShrink: 0, background: accent + '22' }}>
        <img
          src={photo}
          alt={initials}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
        />
      </div>
    );
  }
  return (
    <div style={{ width: size, height: size, borderRadius: radius, background: accent + '22', border: `1.5px solid ${accent}55`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <span style={{ fontSize: size * 0.32, fontWeight: 700, color: accent }}>{initials}</span>
    </div>
  );
}

function SectionHeader({ title, onSeeAll }: { title: string; onSeeAll?: () => void }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
      <span style={{ fontSize: 15, fontWeight: 700, color: '#FFFFFF' }}>{title}</span>
      <button style={{ fontSize: 12, fontWeight: 600, color: '#818CF8', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 2 }}>
        See All <ChevronRight style={{ width: 13, height: 13 }} />
      </button>
    </div>
  );
}

export function Home() {
  return (
    <div style={{ width: 390, height: 844, background: BG, fontFamily: "'Inter', sans-serif", display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>

      {/* Glow orbs */}
      <div style={{ position: 'absolute', top: -60, left: -40, width: 220, height: 220, borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.28) 0%, transparent 70%)', filter: 'blur(20px)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', top: 200, right: -60, width: 180, height: 180, borderRadius: '50%', background: 'radial-gradient(circle, rgba(6,182,212,0.18) 0%, transparent 70%)', filter: 'blur(20px)', pointerEvents: 'none' }} />

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

      {/* ── HEADER ── */}
      <div style={{ padding: '8px 20px 14px', flexShrink: 0, position: 'relative', zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <div>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', fontWeight: 500, margin: 0 }}>Good Morning,</p>
            <h1 style={{ fontSize: 20, fontWeight: 800, color: '#FFFFFF', margin: 0, letterSpacing: '-0.3px' }}>Hello, Rahul 👋</h1>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button style={{ position: 'relative', width: 40, height: 40, borderRadius: 12, ...GLASS, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: '1px solid rgba(255,255,255,0.1)' }}>
              <Bell style={{ width: 18, height: 18, color: 'rgba(255,255,255,0.7)' }} />
              <span style={{ position: 'absolute', top: 8, right: 9, width: 7, height: 7, borderRadius: '50%', background: '#EF4444', border: '1.5px solid #0A0E1A' }} />
            </button>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: 'linear-gradient(135deg,#4F46E5,#06B6D4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: '#FFF' }}>R</span>
            </div>
          </div>
        </div>

        {/* Search */}
        <div style={{ position: 'relative' }}>
          <Search style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, color: 'rgba(255,255,255,0.3)' }} />
          <div style={{ ...GLASS, borderRadius: 14, height: 46, paddingLeft: 40, display: 'flex', alignItems: 'center' }}>
            <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.3)' }}>Search doctors, clinics…</span>
          </div>
          <div style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center', gap: 4 }}>
            <MapPin style={{ width: 12, height: 12, color: '#06B6D4' }} />
            <span style={{ fontSize: 11, fontWeight: 600, color: '#06B6D4' }}>Mumbai</span>
          </div>
        </div>
      </div>

      {/* ── SCROLLABLE BODY ── */}
      <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', paddingBottom: 72 }}>

        {/* ── QUICK LINKS ── */}
        <div style={{ padding: '0 20px 20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
            {quickLinks.map(({ icon: Icon, label, color, glow }) => (
              <button key={label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 7, padding: '14px 6px', borderRadius: 16, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', cursor: 'pointer' }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: color + '1A', border: `1px solid ${color}33`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 4px 14px ${glow}` }}>
                  <Icon style={{ width: 18, height: 18, color }} />
                </div>
                <span style={{ fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.65)', textAlign: 'center', lineHeight: 1.2 }}>{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ── LIVE QUEUE CARD ── */}
        <div style={{ padding: '0 20px 20px' }}>
          <div style={{ position: 'relative', borderRadius: 22, overflow: 'hidden', padding: '18px 18px 16px', background: 'linear-gradient(135deg, rgba(79,70,229,0.22) 0%, rgba(6,182,212,0.15) 100%)', border: '1px solid rgba(99,102,241,0.35)', backdropFilter: 'blur(20px)' }}>

            {/* Animated pulse ring behind token */}
            <div style={{ position: 'absolute', top: 14, right: 14, width: 70, height: 70, borderRadius: '50%', background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)' }} />
            <div style={{ position: 'absolute', top: 20, right: 20, width: 58, height: 58, borderRadius: '50%', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.25)' }} />

            {/* Header row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 14 }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#22C55E', boxShadow: '0 0 8px #22C55E' }} />
              <span style={{ fontSize: 11, fontWeight: 700, color: '#4ADE80', letterSpacing: '0.07em', textTransform: 'uppercase' }}>Live Queue</span>
              <div style={{ flex: 1 }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'rgba(255,255,255,0.07)', borderRadius: 8, padding: '3px 8px' }}>
                <Radio style={{ width: 10, height: 10, color: '#818CF8' }} />
                <span style={{ fontSize: 10, fontWeight: 600, color: '#818CF8' }}>Dr. Ananya Sharma</span>
              </div>
            </div>

            {/* Three stat boxes */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
              {/* My Token */}
              <div style={{ background: 'rgba(79,70,229,0.2)', border: '1px solid rgba(99,102,241,0.4)', borderRadius: 16, padding: '12px 8px', textAlign: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3, marginBottom: 4 }}>
                  <Hash style={{ width: 10, height: 10, color: '#818CF8' }} />
                  <span style={{ fontSize: 9, fontWeight: 600, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>My Token</span>
                </div>
                <span style={{ fontSize: 30, fontWeight: 900, color: '#A5B4FC', lineHeight: 1, display: 'block' }}>52</span>
                <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', marginTop: 2, display: 'block' }}>Your number</span>
              </div>

              {/* Current Token */}
              <div style={{ background: 'rgba(6,182,212,0.12)', border: '1px solid rgba(6,182,212,0.3)', borderRadius: 16, padding: '12px 8px', textAlign: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3, marginBottom: 4 }}>
                  <Radio style={{ width: 10, height: 10, color: '#06B6D4' }} />
                  <span style={{ fontSize: 9, fontWeight: 600, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Current</span>
                </div>
                <span style={{ fontSize: 30, fontWeight: 900, color: '#67E8F9', lineHeight: 1, display: 'block' }}>47</span>
                <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', marginTop: 2, display: 'block' }}>Being served</span>
              </div>

              {/* Est. Wait */}
              <div style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)', borderRadius: 16, padding: '12px 8px', textAlign: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3, marginBottom: 4 }}>
                  <Timer style={{ width: 10, height: 10, color: '#22C55E' }} />
                  <span style={{ fontSize: 9, fontWeight: 600, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Est. Wait</span>
                </div>
                <span style={{ fontSize: 22, fontWeight: 900, color: '#4ADE80', lineHeight: 1, display: 'block', marginTop: 4 }}>~25</span>
                <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', marginTop: 2, display: 'block' }}>minutes</span>
              </div>
            </div>

            {/* Progress bar — 47 of 52, so ~90% */}
            <div style={{ marginTop: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', fontWeight: 500 }}>5 tokens ahead of you</span>
                <span style={{ fontSize: 10, color: '#818CF8', fontWeight: 600 }}>Cardiology OPD</span>
              </div>
              <div style={{ height: 5, borderRadius: 99, background: 'rgba(255,255,255,0.07)', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: '90%', borderRadius: 99, background: 'linear-gradient(90deg, #4F46E5, #06B6D4)' }} />
              </div>
            </div>
          </div>
        </div>

        {/* ── PROMO BANNER ── */}
        <div style={{ margin: '0 20px 22px' }}>
          <div style={{ borderRadius: 20, padding: '16px 18px', background: 'linear-gradient(135deg, rgba(79,70,229,0.55) 0%, rgba(6,182,212,0.4) 100%)', border: '1px solid rgba(99,102,241,0.3)', backdropFilter: 'blur(12px)', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', right: -20, top: -20, width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
            <div style={{ position: 'absolute', right: 20, bottom: -30, width: 70, height: 70, borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <Zap style={{ width: 14, height: 14, color: '#FCD34D' }} />
              <span style={{ fontSize: 11, fontWeight: 700, color: '#FCD34D', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Platform Fee Offer</span>
            </div>
            <h3 style={{ fontSize: 15, fontWeight: 800, color: '#FFFFFF', margin: '0 0 2px' }}>Book today for just ₹10</h3>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', margin: '0 0 10px' }}>Skip the queue · Pay consultation at clinic</p>
            <button style={{ background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.25)', borderRadius: 10, padding: '5px 14px', fontSize: 12, fontWeight: 700, color: '#FFF', cursor: 'pointer' }}>
              Book Now
            </button>
          </div>
        </div>

        {/* ── RECOMMENDED DOCTORS ── */}
        <div style={{ padding: '0 20px', marginBottom: 22 }}>
          <SectionHeader title="Recommended for You" />
          <div style={{ display: 'flex', gap: 14, overflowX: 'auto', paddingBottom: 6, scrollbarWidth: 'none' }}>
            {recommended.map((doc) => (
              <div key={doc.name} style={{ minWidth: 210, borderRadius: 22, padding: '16px 14px 14px', background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', border: `1px solid ${doc.accent}28`, flexShrink: 0, cursor: 'pointer', position: 'relative', overflow: 'hidden' }}>

                {/* Subtle accent glow top-right */}
                <div style={{ position: 'absolute', top: -20, right: -20, width: 80, height: 80, borderRadius: '50%', background: doc.accent + '18', filter: 'blur(16px)', pointerEvents: 'none' }} />

                {/* Photo + Verified badge */}
                <div style={{ position: 'relative', width: 88, height: 88, marginBottom: 10 }}>
                  <div style={{ width: 88, height: 88, borderRadius: 14, overflow: 'hidden', border: `2.5px solid ${doc.accent}55`, background: doc.accent + '22' }}>
                    <img src={doc.photo} alt={doc.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  {/* Verified badge */}
                  <div style={{ position: 'absolute', bottom: -4, right: -4, width: 22, height: 22, borderRadius: '50%', background: '#0A0E1A', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1.5px solid #0A0E1A' }}>
                    <BadgeCheck style={{ width: 18, height: 18, color: '#4F46E5', fill: '#4F46E5', stroke: '#FFF', strokeWidth: 1 }} />
                  </div>
                </div>

                {/* Name + Specialty */}
                <p style={{ fontSize: 13, fontWeight: 800, color: '#FFF', margin: '0 0 1px', lineHeight: 1.2 }}>{doc.name}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 6 }}>
                  <span style={{ fontSize: 10, fontWeight: 600, color: doc.accent, background: doc.accent + '18', padding: '2px 7px', borderRadius: 6 }}>{doc.spec}</span>
                </div>

                {/* Clinic */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 10 }}>
                  <Building2 style={{ width: 10, height: 10, color: 'rgba(255,255,255,0.3)', flexShrink: 0 }} />
                  <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{doc.clinic}</span>
                </div>

                {/* Stats row */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6, marginBottom: 12 }}>
                  {[
                    { icon: Users, val: doc.patients, lbl: 'Patients' },
                    { icon: Clock,  val: doc.exp,      lbl: 'Exp'      },
                    { icon: Timer,  val: doc.wait,     lbl: 'Wait'     },
                  ].map(({ icon: Icon, val, lbl }) => (
                    <div key={lbl} style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 10, padding: '6px 4px', textAlign: 'center' }}>
                      <Icon style={{ width: 10, height: 10, color: 'rgba(255,255,255,0.3)', marginBottom: 2 }} />
                      <div style={{ fontSize: 11, fontWeight: 700, color: '#FFF', lineHeight: 1 }}>{val}</div>
                      <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', marginTop: 1 }}>{lbl}</div>
                    </div>
                  ))}
                </div>

                {/* Live token row */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, padding: '6px 10px', background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22C55E', display: 'inline-block', boxShadow: '0 0 5px #22C55E' }} />
                    <span style={{ fontSize: 10, fontWeight: 700, color: '#4ADE80' }}>Token #{doc.token} Live</span>
                  </div>
                  <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)' }}>~{doc.wait}</span>
                </div>

                {/* CTA */}
                <button style={{ width: '100%', borderRadius: 12, background: `linear-gradient(135deg, ${doc.accent} 0%, ${doc.accent}BB 100%)`, border: 'none', padding: '9px 0', cursor: 'pointer', boxShadow: `0 6px 18px ${doc.accent}44` }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#FFF' }}>Get Token</span>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* ── TOP RATED ── */}
        <div style={{ padding: '0 20px', marginBottom: 22 }}>
          <SectionHeader title="Top Rated Doctors" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {topRated.map((doc, i) => (
              <div key={doc.name} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 16, ...GLASS_STRONG, cursor: 'pointer' }}>
                <div style={{ position: 'relative', flexShrink: 0 }}>
                  <Avatar initials={doc.initials} accent={doc.accent} photo={doc.photo} size={46} />
                  <div style={{ position: 'absolute', bottom: -4, right: -4, width: 18, height: 18, borderRadius: '50%', background: '#0A0E1A', border: `1.5px solid ${['#FFD700','#C0C0C0','#CD7F32'][i]}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: 8, fontWeight: 800, color: ['#FFD700','#C0C0C0','#CD7F32'][i] }}>{i + 1}</span>
                  </div>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 13, fontWeight: 700, color: '#FFF', margin: '0 0 2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{doc.name}</p>
                  <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', margin: '0 0 4px' }}>{doc.spec}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Star style={{ width: 10, height: 10, fill: '#F59E0B', color: '#F59E0B' }} />
                      <span style={{ fontSize: 11, fontWeight: 700, color: '#F59E0B' }}>{doc.rating}</span>
                    </div>
                    <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)' }}>({doc.reviews} reviews)</span>
                  </div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <p style={{ fontSize: 13, fontWeight: 800, color: '#818CF8', margin: '0 0 4px' }}>{doc.fee}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                    <Clock style={{ width: 9, height: 9, color: 'rgba(255,255,255,0.3)' }} />
                    <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>Available</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── BROWSE BY CATEGORY ── */}
        <div style={{ padding: '0 20px', marginBottom: 10 }}>
          <SectionHeader title="Browse by Specialty" />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
            {categories.map(({ icon: Icon, label, color }) => (
              <button key={label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 7, padding: '13px 6px', borderRadius: 16, ...GLASS, cursor: 'pointer', border: '1px solid rgba(255,255,255,0.07)' }}>
                <div style={{ width: 38, height: 38, borderRadius: 11, background: color + '1A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon style={{ width: 17, height: 17, color }} />
                </div>
                <span style={{ fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.55)', textAlign: 'center', lineHeight: 1.2 }}>{label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── BOTTOM NAV ── */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-around', background: 'rgba(10,14,26,0.95)', backdropFilter: 'blur(20px)', borderTop: '1px solid rgba(255,255,255,0.07)', zIndex: 20, paddingBottom: 4 }}>
        {[
          { icon: HomeIcon,    label: 'Home',     active: true  },
          { icon: CalendarDays,label: 'Bookings', active: false },
          { icon: User,        label: 'Profile',  active: false },
        ].map(({ icon: Icon, label, active }) => (
          <button key={label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, background: 'none', border: 'none', cursor: 'pointer', flex: 1 }}>
            <div style={{ width: 36, height: 36, borderRadius: 11, background: active ? 'rgba(79,70,229,0.2)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon style={{ width: 20, height: 20, color: active ? '#818CF8' : 'rgba(255,255,255,0.3)', strokeWidth: active ? 2.5 : 1.8 }} />
            </div>
            <span style={{ fontSize: 9, fontWeight: active ? 700 : 500, color: active ? '#818CF8' : 'rgba(255,255,255,0.3)' }}>{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
