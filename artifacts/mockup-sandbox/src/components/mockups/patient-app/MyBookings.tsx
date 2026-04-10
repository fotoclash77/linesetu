import React, { useState } from 'react';
import {
  Bell, CalendarDays, Home, User,
  MapPin, Clock, Users, Ticket,
  CheckCircle2, XCircle, Activity,
  ChevronRight, Zap, IndianRupee,
  Sunrise, Sunset, BadgeCheck,
  Building2, ArrowRight,
} from 'lucide-react';

const BG = '#0A0E1A';
const GLASS: React.CSSProperties = {
  background: 'rgba(255,255,255,0.05)',
  backdropFilter: 'blur(16px)',
  WebkitBackdropFilter: 'blur(16px)',
  border: '1px solid rgba(255,255,255,0.08)',
};

/* ──────────────────────────────
   DATA MODEL
────────────────────────────── */
type BookingStatus = 'active' | 'upcoming' | 'completed' | 'skipped';
interface Booking {
  id: string;
  memberId: string;
  status: BookingStatus;
  tokenNo: number | string;
  isEmergency?: boolean;
  doctor: string;
  doctorPhoto: string;
  specialty: string;
  clinic: string;
  clinicLoc: string;
  date: string;
  shift: 'Morning' | 'Evening';
  time: string;
  visitType: 'First Visit' | 'Follow-up';
  ahead?: number;
  platformFee: number;
  consultFee: number;
  consultPaid?: boolean;
}
interface Member {
  id: string; name: string; relation: string;
  age: number; avatar: string; color: string;
}

const MEMBERS: Member[] = [
  { id: 'self',   name: 'Rahul Sharma',  relation: 'Self',   age: 32, avatar: 'https://randomuser.me/api/portraits/men/32.jpg',    color: '#6366F1' },
  { id: 'wife',   name: 'Priya Sharma',  relation: 'Wife',   age: 29, avatar: 'https://randomuser.me/api/portraits/women/26.jpg',  color: '#EC4899' },
  { id: 'mother', name: 'Sunita Sharma', relation: 'Mother', age: 58, avatar: 'https://randomuser.me/api/portraits/women/55.jpg',  color: '#F59E0B' },
  { id: 'father', name: 'Ramesh Sharma', relation: 'Father', age: 62, avatar: 'https://randomuser.me/api/portraits/men/58.jpg',    color: '#10B981' },
];

const BOOKINGS: Booking[] = [
  /* ── RAHUL ── */
  {
    id: 'b1', memberId: 'self', status: 'active',
    tokenNo: 56, doctor: 'Dr. Ananya Sharma',
    doctorPhoto: 'https://randomuser.me/api/portraits/women/44.jpg',
    specialty: 'Cardiologist', clinic: 'HeartCare Clinic', clinicLoc: 'Andheri West',
    date: 'Today, 10 Apr', shift: 'Morning', time: '10:00 AM – 2:00 PM',
    visitType: 'First Visit', ahead: 9,
    platformFee: 20, consultFee: 500,
  },
  {
    id: 'b2', memberId: 'self', status: 'upcoming',
    tokenNo: 12, doctor: 'Dr. Meera Joshi',
    doctorPhoto: 'https://randomuser.me/api/portraits/women/68.jpg',
    specialty: 'Ophthalmologist', clinic: 'Vision Care Center', clinicLoc: 'Bandra West',
    date: 'Wed, 15 Apr', shift: 'Morning', time: '9:00 AM – 1:00 PM',
    visitType: 'Follow-up', platformFee: 20, consultFee: 400,
  },
  /* ── PRIYA ── */
  {
    id: 'b3', memberId: 'wife', status: 'upcoming',
    tokenNo: 7, doctor: 'Dr. Vikram Patel',
    doctorPhoto: 'https://randomuser.me/api/portraits/men/52.jpg',
    specialty: 'Dermatologist', clinic: 'SkinCure Clinic', clinicLoc: 'Juhu',
    date: 'Sat, 18 Apr', shift: 'Evening', time: '5:00 PM – 9:00 PM',
    visitType: 'First Visit', platformFee: 20, consultFee: 600,
  },
  /* ── SUNITA (MOTHER) ── */
  {
    id: 'b4', memberId: 'mother', status: 'completed',
    tokenNo: 23, doctor: 'Dr. Suresh Nair',
    doctorPhoto: 'https://randomuser.me/api/portraits/men/45.jpg',
    specialty: 'Orthopedist', clinic: 'Bone & Joint Clinic', clinicLoc: 'Powai',
    date: 'Sun, 5 Apr', shift: 'Morning', time: '9:00 AM – 1:00 PM',
    visitType: 'Follow-up', platformFee: 20, consultFee: 800, consultPaid: true,
  },
  {
    id: 'b5', memberId: 'mother', status: 'skipped',
    tokenNo: 41, doctor: 'Dr. Ananya Sharma',
    doctorPhoto: 'https://randomuser.me/api/portraits/women/44.jpg',
    specialty: 'Cardiologist', clinic: 'HeartCare Clinic', clinicLoc: 'Andheri West',
    date: 'Wed, 1 Apr', shift: 'Morning', time: '10:00 AM – 2:00 PM',
    visitType: 'First Visit', platformFee: 20, consultFee: 500,
  },
  /* ── RAMESH (FATHER) ── */
  {
    id: 'b6', memberId: 'father', status: 'upcoming',
    tokenNo: 5, isEmergency: false,
    doctor: 'Dr. Rohit Gupta',
    doctorPhoto: 'https://randomuser.me/api/portraits/men/61.jpg',
    specialty: 'Endocrinologist', clinic: 'Metro Hospital', clinicLoc: 'Goregaon',
    date: 'Wed, 22 Apr', shift: 'Morning', time: '10:00 AM – 2:00 PM',
    visitType: 'First Visit', platformFee: 30, consultFee: 700,
  },
];

/* ──────────────────────────────
   STATUS CONFIG
────────────────────────────── */
const STATUS_CFG = {
  active:    { label: 'Active',    color: '#4ADE80', bg: 'rgba(34,197,94,0.18)',   border: 'rgba(34,197,94,0.4)',   glow: 'rgba(34,197,94,0.25)'  },
  upcoming:  { label: 'Upcoming',  color: '#67E8F9', bg: 'rgba(6,182,212,0.15)',   border: 'rgba(6,182,212,0.35)',  glow: 'rgba(6,182,212,0.15)'  },
  completed: { label: 'Completed', color: '#A5B4FC', bg: 'rgba(99,102,241,0.14)',  border: 'rgba(99,102,241,0.3)', glow: 'none'                   },
  skipped:   { label: 'Skipped',   color: '#F59E0B', bg: 'rgba(245,158,11,0.14)',  border: 'rgba(245,158,11,0.3)', glow: 'none'                   },
};

/* ──────────────────────────────
   BOOKING CARD
────────────────────────────── */
function BookingCard({ bk, member }: { bk: Booking; member: Member }) {
  const cfg = STATUS_CFG[bk.status];
  const isActive = bk.status === 'active';
  const isCompleted = bk.status === 'completed';
  const isSkipped = bk.status === 'skipped';
  const ShiftIcon = bk.shift === 'Morning' ? Sunrise : Sunset;
  const waitMin = bk.ahead != null ? Math.round(bk.ahead * 2.5) : null;

  return (
    <div style={{
      borderRadius: 22, overflow: 'hidden', marginBottom: 10, position: 'relative',
      background: isActive
        ? 'linear-gradient(145deg, rgba(34,197,94,0.12) 0%, rgba(99,102,241,0.15) 100%)'
        : 'rgba(255,255,255,0.04)',
      border: `1.5px solid ${isActive ? 'rgba(34,197,94,0.35)' : 'rgba(255,255,255,0.08)'}`,
      boxShadow: isActive ? '0 4px 24px rgba(34,197,94,0.15)' : 'none',
      opacity: isSkipped ? 0.72 : 1,
    }}>
      {/* ─ Card Header ─ */}
      <div style={{ padding: '12px 14px 10px', display: 'flex', alignItems: 'flex-start', gap: 10, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        {/* Doctor photo */}
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <img src={bk.doctorPhoto} alt={bk.doctor}
            style={{ width: 42, height: 42, borderRadius: 13, objectFit: 'cover', objectPosition: 'top',
              border: `2px solid ${isActive ? 'rgba(34,197,94,0.45)' : 'rgba(255,255,255,0.12)'}`,
              filter: isSkipped ? 'grayscale(60%)' : 'none' }} />
          {isActive && (
            <div style={{ position: 'absolute', bottom: -2, right: -2, width: 12, height: 12, borderRadius: '50%',
              background: '#22C55E', border: '2px solid #0A0E1A',
              boxShadow: '0 0 6px rgba(34,197,94,0.8)' }} />
          )}
        </div>
        {/* Doctor info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 2 }}>
            <span style={{ fontSize: 13, fontWeight: 800, color: isSkipped ? 'rgba(255,255,255,0.5)' : '#FFF',
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{bk.doctor}</span>
            <BadgeCheck style={{ width: 12, height: 12, color: '#4F46E5', flexShrink: 0 }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 10, color: 'rgba(103,232,249,0.8)', fontWeight: 600 }}>{bk.specialty}</span>
            <span style={{ color: 'rgba(255,255,255,0.15)', fontSize: 10 }}>·</span>
            <span style={{ fontSize: 10, fontWeight: 600, padding: '1px 6px', borderRadius: 5,
              background: bk.visitType === 'First Visit' ? 'rgba(99,102,241,0.2)' : 'rgba(16,185,129,0.2)',
              color: bk.visitType === 'First Visit' ? '#A5B4FC' : '#6EE7B7' }}>{bk.visitType}</span>
          </div>
        </div>
        {/* Status badge + token */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 5, flexShrink: 0 }}>
          <div style={{ padding: '3px 8px', borderRadius: 8, background: cfg.bg, border: `1px solid ${cfg.border}` }}>
            {isActive && <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: '#22C55E', marginRight: 4, boxShadow: '0 0 6px #22C55E' }} />}
            <span style={{ fontSize: 9, fontWeight: 800, color: cfg.color, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{cfg.label}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <Ticket style={{ width: 9, height: 9, color: isActive ? '#A5B4FC' : 'rgba(255,255,255,0.3)' }} />
            <span style={{ fontSize: 11, fontWeight: 900, color: isActive ? '#A5B4FC' : 'rgba(255,255,255,0.45)' }}>
              #{bk.tokenNo}
            </span>
          </div>
        </div>
      </div>

      {/* ─ Token + Stats row ─ */}
      <div style={{ padding: '10px 14px', display: 'flex', alignItems: 'stretch', gap: 8 }}>
        {/* Big token number */}
        <div style={{ width: 64, borderRadius: 16, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '8px 4px',
          background: isActive ? 'linear-gradient(135deg, rgba(99,102,241,0.35), rgba(6,182,212,0.25))' : 'rgba(255,255,255,0.05)',
          border: `1.5px solid ${isActive ? 'rgba(99,102,241,0.5)' : 'rgba(255,255,255,0.08)'}`,
          boxShadow: isActive ? '0 2px 14px rgba(99,102,241,0.3)' : 'none', flexShrink: 0 }}>
          <span style={{ fontSize: 7, fontWeight: 700, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 2 }}>Token</span>
          <span style={{ fontSize: 24, fontWeight: 900, color: isActive ? '#FFF' : isSkipped ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.7)', lineHeight: 1, letterSpacing: '-1px' }}>
            #{bk.tokenNo}
          </span>
          {isActive && <span style={{ fontSize: 7, color: 'rgba(165,180,252,0.7)', fontWeight: 600, marginTop: 2 }}>YOURS</span>}
          {isCompleted && <CheckCircle2 style={{ width: 12, height: 12, color: '#A5B4FC', marginTop: 3 }} />}
          {isSkipped && <XCircle style={{ width: 12, height: 12, color: '#F59E0B', marginTop: 3 }} />}
        </div>

        {/* Info grid */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 5 }}>
          {/* Date + Shift */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <CalendarDays style={{ width: 11, height: 11, color: 'rgba(255,255,255,0.35)', flexShrink: 0 }} />
            <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.75)' }}>{bk.date}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 3, marginLeft: 4, padding: '1px 6px', borderRadius: 5,
              background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.2)' }}>
              <ShiftIcon style={{ width: 9, height: 9, color: '#F59E0B' }} />
              <span style={{ fontSize: 9, fontWeight: 700, color: '#FCD34D' }}>{bk.shift}</span>
            </div>
          </div>
          {/* Time */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Clock style={{ width: 11, height: 11, color: 'rgba(255,255,255,0.3)', flexShrink: 0 }} />
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>{bk.time}</span>
          </div>
          {/* Clinic */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Building2 style={{ width: 11, height: 11, color: 'rgba(255,255,255,0.3)', flexShrink: 0 }} />
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{bk.clinic}</span>
            <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)' }}>· {bk.clinicLoc}</span>
          </div>
          {/* Active: people ahead + wait */}
          {isActive && bk.ahead != null && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '3px 8px', borderRadius: 8,
                background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <Users style={{ width: 9, height: 9, color: '#818CF8' }} />
                <span style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.7)' }}>{bk.ahead} ahead</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '3px 8px', borderRadius: 8,
                background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.2)' }}>
                <Clock style={{ width: 9, height: 9, color: '#F59E0B' }} />
                <span style={{ fontSize: 10, fontWeight: 700, color: '#FCD34D' }}>~{waitMin}m</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ─ Payment summary ─ */}
      <div style={{ margin: '0 14px', padding: '7px 10px', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 8,
        background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
        <IndianRupee style={{ width: 10, height: 10, color: '#4ADE80', flexShrink: 0 }} />
        <span style={{ fontSize: 10, fontWeight: 700, color: '#4ADE80' }}>₹{bk.platformFee} paid</span>
        <span style={{ color: 'rgba(255,255,255,0.15)', fontSize: 10 }}>·</span>
        <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>
          {isCompleted && bk.consultPaid
            ? `₹${bk.consultFee} consult paid ✓`
            : `₹${bk.consultFee} consult at clinic`}
        </span>
        <div style={{ flex: 1 }} />
        <span style={{ fontSize: 9, fontWeight: 600, padding: '2px 6px', borderRadius: 5,
          background: bk.visitType === 'First Visit' ? 'rgba(99,102,241,0.15)' : 'rgba(16,185,129,0.15)',
          color: bk.visitType === 'First Visit' ? 'rgba(165,180,252,0.7)' : 'rgba(110,231,183,0.7)' }}>{bk.visitType}</span>
      </div>

      {/* ─ CTA row ─ */}
      <div style={{ padding: '10px 14px 12px', display: 'flex', gap: 8 }}>
        {isActive ? (
          <>
            <button style={{ flex: 1, height: 38, borderRadius: 12, background: 'linear-gradient(135deg, #16A34A, #22C55E)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: 12, fontWeight: 800, color: '#FFF', boxShadow: '0 4px 14px rgba(34,197,94,0.35)' }}>
              <Activity style={{ width: 13, height: 13 }} />
              View Live Queue
            </button>
            <button style={{ width: 38, height: 38, borderRadius: 12, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ChevronRight style={{ width: 15, height: 15, color: 'rgba(255,255,255,0.5)' }} />
            </button>
          </>
        ) : (
          <button style={{ flex: 1, height: 36, borderRadius: 12, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.55)' }}>
            View Details
            <ArrowRight style={{ width: 12, height: 12 }} />
          </button>
        )}
      </div>
    </div>
  );
}

/* ──────────────────────────────
   MEMBER SECTION
────────────────────────────── */
function MemberSection({ member, bookings }: { member: Member; bookings: Booking[] }) {
  if (bookings.length === 0) return null;
  const active    = bookings.filter(b => b.status === 'active');
  const upcoming  = bookings.filter(b => b.status === 'upcoming');
  const past      = bookings.filter(b => b.status === 'completed' || b.status === 'skipped');

  return (
    <div style={{ marginBottom: 18 }}>
      {/* Member header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, padding: '8px 12px', borderRadius: 16,
        background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <img src={member.avatar} alt={member.name}
            style={{ width: 34, height: 34, borderRadius: 11, objectFit: 'cover',
              border: `2px solid ${member.color}60` }} />
          {active.length > 0 && (
            <div style={{ position: 'absolute', bottom: -2, right: -2, width: 10, height: 10, borderRadius: '50%',
              background: '#22C55E', border: '2px solid #0A0E1A' }} />
          )}
        </div>
        <div style={{ flex: 1 }}>
          <span style={{ fontSize: 13, fontWeight: 800, color: '#FFF' }}>{member.name}</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 1 }}>
            <span style={{ fontSize: 9, fontWeight: 700, padding: '1px 6px', borderRadius: 5,
              background: `${member.color}22`, color: member.color }}>{member.relation}</span>
            <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>{member.age} yrs</span>
            <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.15)' }}>·</span>
            <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)' }}>{bookings.length} booking{bookings.length > 1 ? 's' : ''}</span>
          </div>
        </div>
        {active.length > 0 && (
          <div style={{ padding: '3px 8px', borderRadius: 8, background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.35)', flexShrink: 0 }}>
            <span style={{ fontSize: 9, fontWeight: 800, color: '#4ADE80' }}>● ACTIVE</span>
          </div>
        )}
      </div>

      {/* Active bookings first */}
      {active.length > 0 && (
        <>
          <div style={{ fontSize: 9, fontWeight: 800, color: 'rgba(34,197,94,0.7)', textTransform: 'uppercase', letterSpacing: '0.09em', marginBottom: 6, paddingLeft: 4 }}>
            Active Now
          </div>
          {active.map(b => <BookingCard key={b.id} bk={b} member={member} />)}
        </>
      )}

      {/* Upcoming */}
      {upcoming.length > 0 && (
        <>
          <div style={{ fontSize: 9, fontWeight: 800, color: 'rgba(103,232,249,0.6)', textTransform: 'uppercase', letterSpacing: '0.09em', marginBottom: 6, paddingLeft: 4, marginTop: active.length > 0 ? 10 : 0 }}>
            Upcoming
          </div>
          {upcoming.map(b => <BookingCard key={b.id} bk={b} member={member} />)}
        </>
      )}

      {/* Past */}
      {past.length > 0 && (
        <>
          <div style={{ fontSize: 9, fontWeight: 800, color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', letterSpacing: '0.09em', marginBottom: 6, paddingLeft: 4, marginTop: (active.length > 0 || upcoming.length > 0) ? 10 : 0 }}>
            Past
          </div>
          {past.map(b => <BookingCard key={b.id} bk={b} member={member} />)}
        </>
      )}
    </div>
  );
}

/* ──────────────────────────────
   MAIN SCREEN
────────────────────────────── */
type FilterTab = 'all' | 'active' | 'upcoming' | 'past';

const TABS: { id: FilterTab; label: string; color: string }[] = [
  { id: 'all',      label: 'All',      color: '#A5B4FC' },
  { id: 'active',   label: 'Active',   color: '#4ADE80' },
  { id: 'upcoming', label: 'Upcoming', color: '#67E8F9' },
  { id: 'past',     label: 'Past',     color: 'rgba(255,255,255,0.45)' },
];

export function MyBookings() {
  const [filter, setFilter] = useState<FilterTab>('all');

  const activeCount = BOOKINGS.filter(b => b.status === 'active').length;

  const filterFn = (b: Booking) => {
    if (filter === 'all')      return true;
    if (filter === 'active')   return b.status === 'active';
    if (filter === 'upcoming') return b.status === 'upcoming';
    if (filter === 'past')     return b.status === 'completed' || b.status === 'skipped';
    return true;
  };

  return (
    <div style={{ width: 390, height: 844, background: BG, fontFamily: "'Inter', sans-serif",
      display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>

      {/* Glow orbs */}
      <div style={{ position: 'absolute', top: -50, left: -60, width: 240, height: 240, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(99,102,241,0.2) 0%, transparent 70%)', filter: 'blur(32px)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', top: 300, right: -80, width: 200, height: 200, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(6,182,212,0.13) 0%, transparent 70%)', filter: 'blur(28px)', pointerEvents: 'none' }} />

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

      {/* HEADER */}
      <div style={{ padding: '4px 18px 10px', position: 'relative', zIndex: 10, flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 22, fontWeight: 900, color: '#FFF', letterSpacing: '-0.5px' }}>My Bookings</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 1 }}>
              {BOOKINGS.length} total · {activeCount} active now
            </div>
          </div>
          <div style={{ position: 'relative' }}>
            <button style={{ width: 40, height: 40, borderRadius: 13, ...GLASS, border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <Bell style={{ width: 18, height: 18, color: 'rgba(255,255,255,0.7)' }} />
            </button>
            <div style={{ position: 'absolute', top: 6, right: 8, width: 8, height: 8, borderRadius: '50%', background: '#EF4444', border: '1.5px solid #0A0E1A' }} />
          </div>
        </div>
      </div>

      {/* FILTER TABS */}
      <div style={{ padding: '0 18px 10px', flexShrink: 0, zIndex: 10, position: 'relative' }}>
        <div style={{ display: 'flex', gap: 6, padding: 4, borderRadius: 16, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.07)' }}>
          {TABS.map(tab => {
            const active = filter === tab.id;
            const cnt = tab.id === 'all' ? BOOKINGS.length
              : tab.id === 'active' ? BOOKINGS.filter(b => b.status === 'active').length
              : tab.id === 'upcoming' ? BOOKINGS.filter(b => b.status === 'upcoming').length
              : BOOKINGS.filter(b => b.status === 'completed' || b.status === 'skipped').length;
            return (
              <button key={tab.id} onClick={() => setFilter(tab.id)}
                style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, padding: '8px 4px', borderRadius: 12, border: 'none', cursor: 'pointer', transition: 'all 0.2s ease',
                  background: active ? 'rgba(99,102,241,0.3)' : 'transparent',
                  boxShadow: active ? '0 2px 10px rgba(99,102,241,0.25)' : 'none' }}>
                <span style={{ fontSize: 11, fontWeight: active ? 800 : 600, color: active ? '#FFF' : 'rgba(255,255,255,0.4)' }}>{tab.label}</span>
                <span style={{ fontSize: 9, fontWeight: 800, padding: '1px 5px', borderRadius: 20,
                  background: active ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.08)',
                  color: active ? '#FFF' : 'rgba(255,255,255,0.35)' }}>{cnt}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* SCROLLABLE */}
      <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '0 18px', paddingBottom: 80 }}>
        {MEMBERS.map(member => {
          const memberBookings = BOOKINGS.filter(b => b.memberId === member.id && filterFn(b));
          if (memberBookings.length === 0) return null;
          return <MemberSection key={member.id} member={member} bookings={memberBookings} />;
        })}

        {/* Empty state */}
        {BOOKINGS.filter(filterFn).length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div style={{ width: 60, height: 60, borderRadius: 18, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
              <CalendarDays style={{ width: 26, height: 26, color: 'rgba(255,255,255,0.2)' }} />
            </div>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'rgba(255,255,255,0.4)', marginBottom: 6 }}>No bookings here</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)' }}>Try a different filter tab</div>
          </div>
        )}
      </div>

      {/* BOTTOM NAV */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 68, display: 'flex', alignItems: 'center', justifyContent: 'space-around',
        background: 'rgba(10,14,26,0.95)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
        borderTop: '1px solid rgba(255,255,255,0.07)', zIndex: 20 }}>
        {[
          { icon: Home,         label: 'Home',     active: false },
          { icon: CalendarDays, label: 'Bookings', active: true  },
          { icon: User,         label: 'Profile',  active: false },
        ].map(({ icon: Icon, label, active: isActiveTab }) => (
          <button key={label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, background: 'none', border: 'none', cursor: 'pointer', padding: '4px 20px' }}>
            <div style={{ width: 40, height: 32, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: isActiveTab ? 'rgba(99,102,241,0.2)' : 'transparent' }}>
              <Icon style={{ width: 20, height: 20, color: isActiveTab ? '#A5B4FC' : 'rgba(255,255,255,0.35)', strokeWidth: isActiveTab ? 2.5 : 2 }} />
            </div>
            <span style={{ fontSize: 9, fontWeight: isActiveTab ? 800 : 500, color: isActiveTab ? '#A5B4FC' : 'rgba(255,255,255,0.3)', letterSpacing: '0.04em' }}>{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
