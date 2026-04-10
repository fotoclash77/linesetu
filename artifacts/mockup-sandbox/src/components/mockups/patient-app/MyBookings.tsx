import React, { useState } from 'react';
import {
  ChevronDown, Bell, Home, CalendarDays, User,
  Clock, Building2, IndianRupee, Activity,
  CheckCircle2, XCircle, Ticket, Sunrise, Sunset,
  BadgeCheck, ArrowRight, Users, CalendarX,
} from 'lucide-react';

const BG = '#0A0E1A';
const GLASS: React.CSSProperties = {
  background: 'rgba(255,255,255,0.05)',
  backdropFilter: 'blur(16px)',
  WebkitBackdropFilter: 'blur(16px)',
  border: '1px solid rgba(255,255,255,0.08)',
};

/* ──────────────────────── DATA ──────────────────────── */
type BookingStatus = 'active' | 'upcoming' | 'completed' | 'skipped';

interface Booking {
  id: string;
  memberId: string;
  status: BookingStatus;
  tokenNo: number;
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
  id: string;
  name: string;
  relation: string;
  age: number;
  avatar: string;
  color: string;
}

const MEMBERS: Member[] = [
  { id: 'all',    name: 'All Members',    relation: '',       age: 0,  avatar: '', color: '#A5B4FC' },
  { id: 'self',   name: 'Rahul Sharma',   relation: 'Self',   age: 32, avatar: 'https://randomuser.me/api/portraits/men/32.jpg',   color: '#6366F1' },
  { id: 'wife',   name: 'Priya Sharma',   relation: 'Wife',   age: 29, avatar: 'https://randomuser.me/api/portraits/women/26.jpg', color: '#EC4899' },
  { id: 'mother', name: 'Sunita Sharma',  relation: 'Mother', age: 58, avatar: 'https://randomuser.me/api/portraits/women/55.jpg', color: '#F59E0B' },
  { id: 'father', name: 'Ramesh Sharma',  relation: 'Father', age: 62, avatar: 'https://randomuser.me/api/portraits/men/58.jpg',   color: '#10B981' },
];

const BOOKINGS: Booking[] = [
  { id: 'b1', memberId: 'self',   status: 'active',    tokenNo: 56, doctor: 'Dr. Ananya Sharma', doctorPhoto: 'https://randomuser.me/api/portraits/women/44.jpg', specialty: 'Cardiologist',    clinic: 'HeartCare Clinic',    clinicLoc: 'Andheri West', date: 'Today, 10 Apr',  shift: 'Morning', time: '10:00 AM – 2:00 PM', visitType: 'First Visit', ahead: 9,  platformFee: 20, consultFee: 500 },
  { id: 'b2', memberId: 'self',   status: 'upcoming',  tokenNo: 12, doctor: 'Dr. Meera Joshi',   doctorPhoto: 'https://randomuser.me/api/portraits/women/68.jpg', specialty: 'Ophthalmologist', clinic: 'Vision Care Center',  clinicLoc: 'Bandra West',  date: 'Wed, 15 Apr', shift: 'Morning', time: '9:00 AM – 1:00 PM',  visitType: 'Follow-up',   platformFee: 20, consultFee: 400 },
  { id: 'b3', memberId: 'wife',   status: 'upcoming',  tokenNo: 7,  doctor: 'Dr. Vikram Patel',  doctorPhoto: 'https://randomuser.me/api/portraits/men/52.jpg',   specialty: 'Dermatologist',   clinic: 'SkinCure Clinic',     clinicLoc: 'Juhu',         date: 'Sat, 18 Apr', shift: 'Evening', time: '5:00 PM – 9:00 PM',  visitType: 'First Visit', platformFee: 20, consultFee: 600 },
  { id: 'b4', memberId: 'mother', status: 'completed', tokenNo: 23, doctor: 'Dr. Suresh Nair',   doctorPhoto: 'https://randomuser.me/api/portraits/men/45.jpg',   specialty: 'Orthopedist',     clinic: 'Bone & Joint Clinic', clinicLoc: 'Powai',        date: 'Sun, 5 Apr',  shift: 'Morning', time: '9:00 AM – 1:00 PM',  visitType: 'Follow-up',   platformFee: 20, consultFee: 800, consultPaid: true },
  { id: 'b5', memberId: 'mother', status: 'skipped',   tokenNo: 41, doctor: 'Dr. Ananya Sharma', doctorPhoto: 'https://randomuser.me/api/portraits/women/44.jpg', specialty: 'Cardiologist',    clinic: 'HeartCare Clinic',    clinicLoc: 'Andheri West', date: 'Wed, 1 Apr',  shift: 'Morning', time: '10:00 AM – 2:00 PM', visitType: 'First Visit', platformFee: 20, consultFee: 500 },
  { id: 'b6', memberId: 'father', status: 'upcoming',  tokenNo: 5,  doctor: 'Dr. Rohit Gupta',   doctorPhoto: 'https://randomuser.me/api/portraits/men/61.jpg',   specialty: 'Endocrinologist', clinic: 'Metro Hospital',       clinicLoc: 'Goregaon',     date: 'Wed, 22 Apr', shift: 'Morning', time: '10:00 AM – 2:00 PM', visitType: 'First Visit', platformFee: 30, consultFee: 700 },
];

const STATUS_CFG = {
  active:    { label: 'Active',    color: '#4ADE80', bg: 'rgba(34,197,94,0.18)',  border: 'rgba(34,197,94,0.4)',  glow: '0 4px 20px rgba(34,197,94,0.2)' },
  upcoming:  { label: 'Upcoming',  color: '#67E8F9', bg: 'rgba(6,182,212,0.15)',  border: 'rgba(6,182,212,0.35)', glow: 'none' },
  completed: { label: 'Completed', color: '#A5B4FC', bg: 'rgba(99,102,241,0.14)', border: 'rgba(99,102,241,0.3)', glow: 'none' },
  skipped:   { label: 'Skipped',   color: '#F59E0B', bg: 'rgba(245,158,11,0.14)', border: 'rgba(245,158,11,0.3)', glow: 'none' },
};

/* ──────────────────────── DROPDOWN ──────────────────────── */
function MemberDropdown({ selected, onSelect }: { selected: Member; onSelect: (m: Member) => void }) {
  const [open, setOpen] = useState(false);
  const hasAvatar = selected.id !== 'all';
  const member = selected;

  return (
    <div style={{ position: 'relative', zIndex: 50 }}>
      <button
        onClick={() => setOpen(p => !p)}
        style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 16, background: 'rgba(255,255,255,0.07)', border: `1.5px solid ${open ? 'rgba(99,102,241,0.5)' : 'rgba(255,255,255,0.1)'}`, cursor: 'pointer', boxShadow: open ? '0 0 20px rgba(99,102,241,0.2)' : 'none' }}>
        {hasAvatar
          ? <img src={member.avatar} alt="" style={{ width: 32, height: 32, borderRadius: 10, objectFit: 'cover', border: `2px solid ${member.color}60` }} />
          : <div style={{ width: 32, height: 32, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(165,180,252,0.15)', border: '2px solid rgba(165,180,252,0.3)' }}>
              <Users style={{ width: 15, height: 15, color: '#A5B4FC' }} />
            </div>
        }
        <div style={{ flex: 1, textAlign: 'left' }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: '#FFF' }}>{member.name}</div>
          {hasAvatar && (
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>
              {member.relation} · {member.age} yrs
            </div>
          )}
        </div>
        <ChevronDown style={{ width: 16, height: 16, color: 'rgba(255,255,255,0.4)', transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
      </button>

      {open && (
        <div style={{ position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0, borderRadius: 16, overflow: 'hidden', background: '#111827', border: '1.5px solid rgba(255,255,255,0.1)', boxShadow: '0 16px 48px rgba(0,0,0,0.7)', zIndex: 100 }}>
          {MEMBERS.map((m, i) => {
            const isSelected = m.id === selected.id;
            const hA = m.id !== 'all';
            return (
              <button key={m.id} onClick={() => { onSelect(m); setOpen(false); }}
                style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '11px 14px', background: isSelected ? 'rgba(99,102,241,0.2)' : 'transparent', border: 'none', cursor: 'pointer', borderBottom: i < MEMBERS.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                {hA
                  ? <img src={m.avatar} alt="" style={{ width: 32, height: 32, borderRadius: 10, objectFit: 'cover', border: `2px solid ${m.color}50` }} />
                  : <div style={{ width: 32, height: 32, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(165,180,252,0.12)', border: '2px solid rgba(165,180,252,0.2)' }}>
                      <Users style={{ width: 14, height: 14, color: '#A5B4FC' }} />
                    </div>
                }
                <div style={{ flex: 1, textAlign: 'left' }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: isSelected ? '#A5B4FC' : '#FFF' }}>{m.name}</div>
                  {hA && <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', marginTop: 1 }}>{m.relation} · {m.age} yrs</div>}
                </div>
                {isSelected && <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#6366F1' }} />}
                {/* Booking count badge */}
                {(() => {
                  const cnt = m.id === 'all' ? BOOKINGS.length : BOOKINGS.filter(b => b.memberId === m.id).length;
                  return cnt > 0 ? <span style={{ fontSize: 9, fontWeight: 800, padding: '2px 6px', borderRadius: 20, background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.4)' }}>{cnt}</span> : null;
                })()}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ──────────────────────── SUMMARY STRIP ──────────────────────── */
function SummaryStrip({ bookings }: { bookings: Booking[] }) {
  const active    = bookings.filter(b => b.status === 'active').length;
  const upcoming  = bookings.filter(b => b.status === 'upcoming').length;
  const completed = bookings.filter(b => b.status === 'completed').length;
  const skipped   = bookings.filter(b => b.status === 'skipped').length;

  const tiles = [
    { label: 'Active',    value: active,    color: '#4ADE80', bg: 'rgba(34,197,94,0.12)'   },
    { label: 'Upcoming',  value: upcoming,  color: '#67E8F9', bg: 'rgba(6,182,212,0.12)'   },
    { label: 'Done',      value: completed, color: '#A5B4FC', bg: 'rgba(99,102,241,0.12)'  },
    { label: 'Skipped',   value: skipped,   color: '#F59E0B', bg: 'rgba(245,158,11,0.12)'  },
  ];

  return (
    <div style={{ display: 'flex', gap: 6 }}>
      {tiles.map(t => (
        <div key={t.label} style={{ flex: 1, borderRadius: 14, padding: '10px 6px', background: t.bg, border: `1px solid ${t.color}25`, textAlign: 'center' }}>
          <div style={{ fontSize: 22, fontWeight: 900, color: t.color, lineHeight: 1 }}>{t.value}</div>
          <div style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.4)', marginTop: 3, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{t.label}</div>
        </div>
      ))}
    </div>
  );
}

/* ──────────────────────── BOOKING CARD ──────────────────────── */
function BookingCard({ bk, showMember }: { bk: Booking; showMember: boolean }) {
  const cfg = STATUS_CFG[bk.status];
  const isActive    = bk.status === 'active';
  const isCompleted = bk.status === 'completed';
  const isSkipped   = bk.status === 'skipped';
  const ShiftIcon   = bk.shift === 'Morning' ? Sunrise : Sunset;
  const waitMin     = bk.ahead != null ? Math.round(bk.ahead * 2.5) : null;
  const member      = MEMBERS.find(m => m.id === bk.memberId)!;

  return (
    <div style={{ borderRadius: 20, marginBottom: 10, overflow: 'hidden', opacity: isSkipped ? 0.72 : 1,
      background: isActive
        ? 'linear-gradient(145deg, rgba(34,197,94,0.1) 0%, rgba(99,102,241,0.13) 100%)'
        : 'rgba(255,255,255,0.04)',
      border: `1.5px solid ${isActive ? 'rgba(34,197,94,0.3)' : 'rgba(255,255,255,0.08)'}`,
      boxShadow: isActive ? cfg.glow : 'none',
    }}>

      {/* Member tag (only when "All Members" selected) */}
      {showMember && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 12px', background: `${member.color}10`, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <img src={member.avatar} alt="" style={{ width: 18, height: 18, borderRadius: 6, objectFit: 'cover' }} />
          <span style={{ fontSize: 10, fontWeight: 700, color: member.color }}>{member.name}</span>
          <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)' }}>· {member.relation}</span>
        </div>
      )}

      {/* Top: Doctor + Status */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '12px 14px 8px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <img src={bk.doctorPhoto} alt="" style={{ width: 44, height: 44, borderRadius: 14, objectFit: 'cover', objectPosition: 'top',
            border: `2px solid ${isActive ? 'rgba(34,197,94,0.4)' : 'rgba(255,255,255,0.1)'}`,
            filter: isSkipped ? 'grayscale(50%)' : 'none' }} />
          {isActive && <div style={{ position: 'absolute', bottom: -2, right: -2, width: 11, height: 11, borderRadius: '50%', background: '#22C55E', border: '2px solid #0A0E1A', boxShadow: '0 0 6px #22C55E' }} />}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ fontSize: 13, fontWeight: 800, color: isSkipped ? 'rgba(255,255,255,0.5)' : '#FFF', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{bk.doctor}</span>
            <BadgeCheck style={{ width: 11, height: 11, color: '#4F46E5', flexShrink: 0 }} />
          </div>
          <div style={{ fontSize: 10, color: 'rgba(103,232,249,0.8)', fontWeight: 600, marginTop: 2 }}>{bk.specialty}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 4 }}>
            <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 7px', borderRadius: 6,
              background: bk.visitType === 'First Visit' ? 'rgba(99,102,241,0.2)' : 'rgba(16,185,129,0.2)',
              color: bk.visitType === 'First Visit' ? '#A5B4FC' : '#6EE7B7' }}>{bk.visitType}</span>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, flexShrink: 0 }}>
          <div style={{ padding: '3px 8px', borderRadius: 8, background: cfg.bg, border: `1px solid ${cfg.border}` }}>
            {isActive && <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: '#22C55E', marginRight: 4, boxShadow: '0 0 6px #22C55E' }} />}
            {isCompleted && <CheckCircle2 style={{ display: 'inline', width: 8, height: 8, color: '#A5B4FC', marginRight: 3 }} />}
            {isSkipped && <XCircle style={{ display: 'inline', width: 8, height: 8, color: '#F59E0B', marginRight: 3 }} />}
            <span style={{ fontSize: 9, fontWeight: 800, color: cfg.color, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{cfg.label}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <Ticket style={{ width: 9, height: 9, color: isActive ? '#A5B4FC' : 'rgba(255,255,255,0.3)' }} />
            <span style={{ fontSize: 12, fontWeight: 900, color: isActive ? '#A5B4FC' : 'rgba(255,255,255,0.45)' }}>#{bk.tokenNo}</span>
          </div>
        </div>
      </div>

      {/* ── Summary Body ── */}
      <div style={{ display: 'flex', gap: 8, padding: '10px 14px' }}>
        {/* Token block */}
        <div style={{ width: 60, borderRadius: 14, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '8px 2px', flexShrink: 0,
          background: isActive ? 'linear-gradient(135deg, rgba(99,102,241,0.35), rgba(6,182,212,0.25))' : 'rgba(255,255,255,0.05)',
          border: `1.5px solid ${isActive ? 'rgba(99,102,241,0.45)' : 'rgba(255,255,255,0.07)'}`,
          boxShadow: isActive ? '0 2px 14px rgba(99,102,241,0.3)' : 'none' }}>
          <span style={{ fontSize: 7, fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Token</span>
          <span style={{ fontSize: 22, fontWeight: 900, color: isActive ? '#FFF' : isSkipped ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.65)', lineHeight: 1.1, letterSpacing: '-1px' }}>#{bk.tokenNo}</span>
          {isActive && <span style={{ fontSize: 7, fontWeight: 700, color: 'rgba(165,180,252,0.8)', marginTop: 2 }}>YOURS</span>}
        </div>

        {/* Info grid */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 5 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <CalendarDays style={{ width: 11, height: 11, color: 'rgba(255,255,255,0.3)', flexShrink: 0 }} />
            <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.75)' }}>{bk.date}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 3, padding: '1px 6px', borderRadius: 5, background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.2)' }}>
              <ShiftIcon style={{ width: 9, height: 9, color: '#F59E0B' }} />
              <span style={{ fontSize: 9, fontWeight: 700, color: '#FCD34D' }}>{bk.shift}</span>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <Clock style={{ width: 11, height: 11, color: 'rgba(255,255,255,0.25)', flexShrink: 0 }} />
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)' }}>{bk.time}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <Building2 style={{ width: 11, height: 11, color: 'rgba(255,255,255,0.25)', flexShrink: 0 }} />
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{bk.clinic} · {bk.clinicLoc}</span>
          </div>
          {isActive && bk.ahead != null && (
            <div style={{ display: 'flex', gap: 6, marginTop: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 3, padding: '3px 8px', borderRadius: 8, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.7)' }}>{bk.ahead} ahead</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 3, padding: '3px 8px', borderRadius: 8, background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.2)' }}>
                <Clock style={{ width: 9, height: 9, color: '#F59E0B' }} />
                <span style={{ fontSize: 10, fontWeight: 700, color: '#FCD34D' }}>~{waitMin}m</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Payment row */}
      <div style={{ margin: '0 14px', padding: '7px 10px', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
        <IndianRupee style={{ width: 10, height: 10, color: '#4ADE80', flexShrink: 0 }} />
        <span style={{ fontSize: 10, fontWeight: 700, color: '#4ADE80' }}>₹{bk.platformFee} paid</span>
        <span style={{ color: 'rgba(255,255,255,0.15)', fontSize: 10 }}>·</span>
        <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>
          {isCompleted && bk.consultPaid ? `₹${bk.consultFee} consult paid ✓` : `₹${bk.consultFee} at clinic`}
        </span>
      </div>

      {/* CTA */}
      <div style={{ padding: '10px 14px 12px', display: 'flex', gap: 8 }}>
        {isActive ? (
          <button style={{ flex: 1, height: 38, borderRadius: 12, background: 'linear-gradient(135deg, #16A34A, #22C55E)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: 12, fontWeight: 800, color: '#FFF', boxShadow: '0 4px 16px rgba(34,197,94,0.35)' }}>
            <Activity style={{ width: 13, height: 13 }} />
            View Live Queue
          </button>
        ) : (
          <button style={{ flex: 1, height: 36, borderRadius: 12, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.5)' }}>
            View Details <ArrowRight style={{ width: 11, height: 11 }} />
          </button>
        )}
      </div>
    </div>
  );
}

/* ──────────────────────── MAIN SCREEN ──────────────────────── */
type FilterTab = 'all' | 'active' | 'upcoming' | 'past';

const FILTER_TABS: { id: FilterTab; label: string }[] = [
  { id: 'all',      label: 'All'      },
  { id: 'active',   label: 'Active'   },
  { id: 'upcoming', label: 'Upcoming' },
  { id: 'past',     label: 'Past'     },
];

export function MyBookings() {
  const [selectedMember, setSelectedMember] = useState<Member>(MEMBERS[0]);
  const [filter, setFilter]                 = useState<FilterTab>('all');

  const memberBookings = selectedMember.id === 'all'
    ? BOOKINGS
    : BOOKINGS.filter(b => b.memberId === selectedMember.id);

  const filtered = memberBookings.filter(b => {
    if (filter === 'all')      return true;
    if (filter === 'active')   return b.status === 'active';
    if (filter === 'upcoming') return b.status === 'upcoming';
    if (filter === 'past')     return b.status === 'completed' || b.status === 'skipped';
    return true;
  });

  const tabCount = (t: FilterTab) => {
    if (t === 'all')      return memberBookings.length;
    if (t === 'active')   return memberBookings.filter(b => b.status === 'active').length;
    if (t === 'upcoming') return memberBookings.filter(b => b.status === 'upcoming').length;
    return memberBookings.filter(b => b.status === 'completed' || b.status === 'skipped').length;
  };

  const showMember = selectedMember.id === 'all';

  return (
    <div style={{ width: 390, height: 844, background: BG, fontFamily: "'Inter', sans-serif", display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>

      {/* Glow orbs */}
      <div style={{ position: 'absolute', top: -60, left: -60, width: 260, height: 260, borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.18) 0%, transparent 70%)', filter: 'blur(36px)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', top: 280, right: -80, width: 220, height: 220, borderRadius: '50%', background: 'radial-gradient(circle, rgba(6,182,212,0.12) 0%, transparent 70%)', filter: 'blur(32px)', pointerEvents: 'none' }} />

      {/* STATUS BAR */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px 4px', position: 'relative', zIndex: 10, flexShrink: 0 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.65)' }}>9:41</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          {[0.4,0.65,0.9,1].map((op,i) => <div key={i} style={{ width: 3, height: 6+i*2, borderRadius: 2, background: `rgba(255,255,255,${op})` }} />)}
          <div style={{ width: 6 }} />
          <svg width="16" height="11" viewBox="0 0 16 11" fill="none"><path d="M8 2C10.4 2 12.6 3 14.1 4.7L15.5 3.2C13.6 1.2 10.9 0 8 0C5.1 0 2.4 1.2 0.5 3.2L1.9 4.7C3.4 3 5.6 2 8 2Z" fill="white" opacity="0.4"/><path d="M8 5C9.7 5 11.2 5.7 12.3 6.8L13.7 5.3C12.2 3.9 10.2 3 8 3C5.8 3 3.8 3.9 2.3 5.3L3.7 6.8C4.8 5.7 6.3 5 8 5Z" fill="white" opacity="0.7"/><circle cx="8" cy="9.5" r="1.5" fill="white"/></svg>
          <div style={{ width: 4 }} />
          <svg width="24" height="12" viewBox="0 0 24 12" fill="none"><rect x="0.5" y="0.5" width="20" height="11" rx="3.5" stroke="white" strokeOpacity="0.3"/><rect x="2" y="2" width="14" height="8" rx="2" fill="white" fillOpacity="0.85"/><path d="M22 4.5V7.5C22.8 7.2 23.5 6.4 23.5 6C23.5 5.6 22.8 4.8 22 4.5Z" fill="white" opacity="0.35"/></svg>
        </div>
      </div>

      {/* HEADER */}
      <div style={{ padding: '2px 18px 12px', flexShrink: 0, zIndex: 10, position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <div>
            <div style={{ fontSize: 22, fontWeight: 900, color: '#FFF', letterSpacing: '-0.5px' }}>My Bookings</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginTop: 1 }}>{BOOKINGS.length} appointments · family</div>
          </div>
          <div style={{ position: 'relative' }}>
            <button style={{ width: 40, height: 40, borderRadius: 13, ...GLASS, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: '1px solid rgba(255,255,255,0.1)' }}>
              <Bell style={{ width: 18, height: 18, color: 'rgba(255,255,255,0.65)' }} />
            </button>
            <div style={{ position: 'absolute', top: 7, right: 8, width: 8, height: 8, borderRadius: '50%', background: '#EF4444', border: '1.5px solid #0A0E1A' }} />
          </div>
        </div>

        {/* ── STEP 1: Family Member Dropdown ── */}
        <div style={{ marginBottom: 6 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.09em', marginBottom: 6 }}>Select Family Member</div>
          <MemberDropdown selected={selectedMember} onSelect={m => { setSelectedMember(m); setFilter('all'); }} />
        </div>
      </div>

      {/* ── STEP 2: Filter Tabs + Summary ── */}
      <div style={{ padding: '0 18px 10px', flexShrink: 0, zIndex: 9, position: 'relative' }}>
        {/* Tabs */}
        <div style={{ display: 'flex', gap: 5, padding: 4, borderRadius: 14, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.07)', marginBottom: 10 }}>
          {FILTER_TABS.map(tab => {
            const isActive = filter === tab.id;
            const cnt = tabCount(tab.id);
            return (
              <button key={tab.id} onClick={() => setFilter(tab.id)}
                style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, padding: '7px 4px', borderRadius: 10, border: 'none', cursor: 'pointer',
                  background: isActive ? 'rgba(99,102,241,0.3)' : 'transparent',
                  boxShadow: isActive ? '0 2px 10px rgba(99,102,241,0.25)' : 'none' }}>
                <span style={{ fontSize: 11, fontWeight: isActive ? 800 : 600, color: isActive ? '#FFF' : 'rgba(255,255,255,0.38)' }}>{tab.label}</span>
                <span style={{ fontSize: 9, fontWeight: 800, padding: '1px 5px', borderRadius: 20,
                  background: isActive ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.07)',
                  color: isActive ? '#FFF' : 'rgba(255,255,255,0.3)' }}>{cnt}</span>
              </button>
            );
          })}
        </div>

        {/* ── STEP 3: Summary Strip ── */}
        <SummaryStrip bookings={memberBookings} />
      </div>

      {/* ── STEP 4: Booking Cards ── */}
      <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '6px 18px 80px' }}>
        {filtered.length > 0
          ? filtered.map(b => <BookingCard key={b.id} bk={b} showMember={showMember} />)
          : (
            <div style={{ textAlign: 'center', padding: '50px 20px' }}>
              <div style={{ width: 56, height: 56, borderRadius: 18, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
                <CalendarX style={{ width: 24, height: 24, color: 'rgba(255,255,255,0.2)' }} />
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'rgba(255,255,255,0.35)', marginBottom: 5 }}>No bookings here</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)' }}>Try a different filter or member</div>
            </div>
          )
        }
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
          <button key={label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, background: 'none', border: 'none', cursor: 'pointer', padding: '4px 24px' }}>
            <div style={{ width: 40, height: 30, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', background: isActiveTab ? 'rgba(99,102,241,0.2)' : 'transparent' }}>
              <Icon style={{ width: 20, height: 20, color: isActiveTab ? '#A5B4FC' : 'rgba(255,255,255,0.3)', strokeWidth: isActiveTab ? 2.5 : 2 }} />
            </div>
            <span style={{ fontSize: 9, fontWeight: isActiveTab ? 800 : 500, color: isActiveTab ? '#A5B4FC' : 'rgba(255,255,255,0.28)', letterSpacing: '0.04em' }}>{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
