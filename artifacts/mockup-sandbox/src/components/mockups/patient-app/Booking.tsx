import React, { useState, useEffect } from 'react';
import {
  ChevronLeft, ChevronRight, BadgeCheck, MapPin,
  Building2, Clock, Users, Sunrise, Sunset, Ticket,
  AlertCircle, CalendarCheck, Navigation,
  Radio, Footprints, Wifi, Siren, ShieldAlert,
  Phone, UserCircle2, ChevronDown, ChevronUp,
  Stethoscope, RefreshCw,
} from 'lucide-react';

const BG = '#0A0E1A';
const GLASS = { background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.08)' };

/* ── Live Queue mock data ── */
type TokenType = 'emergency' | 'online' | 'walkin';
interface QueueEntry { id: string; name: string; type: TokenType; status: 'waiting' | 'in-progress' | 'done'; }

const EMERGENCY: QueueEntry[] = [
  { id: 'E1', name: 'Ramesh Joshi',    type: 'emergency', status: 'in-progress' },
  { id: 'E2', name: 'Sunita Mehta',   type: 'emergency', status: 'waiting'     },
];
const NORMAL: QueueEntry[] = [
  { id: '1',  name: 'Priya Kulkarni', type: 'online',    status: 'done'        },
  { id: '2',  name: 'Amit Desai',     type: 'walkin',    status: 'done'        },
  { id: '3',  name: 'Rekha Nair',     type: 'online',    status: 'done'        },
  { id: '4',  name: 'Kiran Patil',    type: 'walkin',    status: 'in-progress' },
  { id: '5',  name: 'Deepa Shah',     type: 'online',    status: 'waiting'     },
  { id: '6',  name: 'Sanjay Gupte',   type: 'walkin',    status: 'waiting'     },
  { id: '7',  name: 'Meena Rao',      type: 'online',    status: 'waiting'     },
  { id: '8',  name: 'Vijay Tiwari',   type: 'walkin',    status: 'waiting'     },
  { id: '9',  name: 'Anita Sawant',   type: 'online',    status: 'waiting'     },
  { id: '10', name: 'Nikhil More',    type: 'walkin',    status: 'waiting'     },
];

const TYPE_META: Record<TokenType, { label: string; color: string; bg: string; border: string }> = {
  emergency: { label: 'Emergency', color: '#F87171', bg: 'rgba(239,68,68,0.15)',  border: 'rgba(239,68,68,0.4)'  },
  online:    { label: 'Online',    color: '#67E8F9', bg: 'rgba(6,182,212,0.12)',  border: 'rgba(6,182,212,0.3)'  },
  walkin:    { label: 'Walk-in',   color: '#4ADE80', bg: 'rgba(34,197,94,0.12)',  border: 'rgba(34,197,94,0.3)'  },
};

/* ── Calendar data – April 2026 ── */
const MONTH = 'April 2026';
const DAYS_IN_MONTH = 30;
const FIRST_DAY_OF_WEEK = 3; // April 1 2026 = Wednesday (0=Sun)

/* Availability per weekday (0=Sun … 6=Sat) */
const AVAIL: Record<number, { label: string; icon: typeof Sunrise; time: string; clinic: string; loc: string; maps: string; max: number; booked: number; color: string }[]> = {
  1: [ // Mon
    { label: 'Morning', icon: Sunrise, time: '9:00 AM – 1:00 PM',  clinic: 'HeartCare Clinic',  loc: 'Andheri West', maps: 'https://maps.google.com/?q=HeartCare+Clinic+Andheri+West+Mumbai', max: 60, booked: 42, color: '#F59E0B' },
    { label: 'Evening', icon: Sunset,  time: '5:00 PM – 9:00 PM',  clinic: 'City Heart Center', loc: 'Bandra East',  maps: 'https://maps.google.com/?q=City+Heart+Center+Bandra+East+Mumbai',  max: 50, booked: 28, color: '#818CF8' },
  ],
  2: [ // Tue
    { label: 'Morning', icon: Sunrise, time: '9:00 AM – 1:00 PM',  clinic: 'HeartCare Clinic',  loc: 'Andheri West', maps: 'https://maps.google.com/?q=HeartCare+Clinic+Andheri+West+Mumbai', max: 60, booked: 38, color: '#F59E0B' },
    { label: 'Evening', icon: Sunset,  time: '5:00 PM – 9:00 PM',  clinic: 'City Heart Center', loc: 'Bandra East',  maps: 'https://maps.google.com/?q=City+Heart+Center+Bandra+East+Mumbai',  max: 50, booked: 21, color: '#818CF8' },
  ],
  3: [ // Wed
    { label: 'Morning', icon: Sunrise, time: '9:00 AM – 1:00 PM',  clinic: 'HeartCare Clinic',  loc: 'Andheri West', maps: 'https://maps.google.com/?q=HeartCare+Clinic+Andheri+West+Mumbai', max: 60, booked: 45, color: '#F59E0B' },
    { label: 'Evening', icon: Sunset,  time: '5:00 PM – 9:00 PM',  clinic: 'City Heart Center', loc: 'Bandra East',  maps: 'https://maps.google.com/?q=City+Heart+Center+Bandra+East+Mumbai',  max: 50, booked: 31, color: '#818CF8' },
  ],
  4: [ // Thu
    { label: 'Morning', icon: Sunrise, time: '10:00 AM – 2:00 PM', clinic: 'HeartCare Clinic',  loc: 'Andheri West', maps: 'https://maps.google.com/?q=HeartCare+Clinic+Andheri+West+Mumbai', max: 55, booked: 42, color: '#F59E0B' },
  ],
  5: [ // Fri
    { label: 'Morning', icon: Sunrise, time: '10:00 AM – 2:00 PM', clinic: 'HeartCare Clinic',  loc: 'Andheri West', maps: 'https://maps.google.com/?q=HeartCare+Clinic+Andheri+West+Mumbai', max: 55, booked: 33, color: '#F59E0B' },
  ],
  6: [ // Sat (alternate – even weeks only; Sat 11 & 25 in April 2026)
    { label: 'Morning', icon: Sunrise, time: '9:00 AM – 12:00 PM', clinic: 'MedPlus Hospital',  loc: 'Powai',        maps: 'https://maps.google.com/?q=MedPlus+Hospital+Powai+Mumbai',         max: 30, booked: 14, color: '#22C55E' },
  ],
  0: [], // Sun – off
};

const ALT_SAT = new Set([11, 25]); // alternate Saturdays in April 2026

function getDayOfWeek(date: number) {
  return (FIRST_DAY_OF_WEEK + date - 1) % 7;
}

function getShifts(date: number) {
  const dow = getDayOfWeek(date);
  if (dow === 6 && !ALT_SAT.has(date)) return [];
  return AVAIL[dow] ?? [];
}

const DOW_LABELS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

/* ── Family members (simulated from Family Members screen) ── */
interface FamilyMember {
  id: string; name: string; relation: string;
  age: number; phone: string; blood: string; gender: string;
  avatar: string;
}
const FAMILY: FamilyMember[] = [
  { id: 'self',   name: 'Rahul Sharma',  relation: 'Self',   age: 32, phone: '+91 98765 43210', blood: 'B+',  gender: 'Male',   avatar: 'https://randomuser.me/api/portraits/men/32.jpg'    },
  { id: 'wife',   name: 'Priya Sharma',  relation: 'Wife',   age: 29, phone: '+91 98765 12345', blood: 'O+',  gender: 'Female', avatar: 'https://randomuser.me/api/portraits/women/26.jpg'  },
  { id: 'mother', name: 'Sunita Sharma', relation: 'Mother', age: 58, phone: '+91 99887 65432', blood: 'A+',  gender: 'Female', avatar: 'https://randomuser.me/api/portraits/women/55.jpg'  },
  { id: 'father', name: 'Ramesh Sharma', relation: 'Father', age: 62, phone: '+91 99887 12345', blood: 'AB+', gender: 'Male',   avatar: 'https://randomuser.me/api/portraits/men/58.jpg'    },
];

function QueueRow({ entry, isYours }: { entry: QueueEntry; isYours: boolean }) {
  const meta = TYPE_META[entry.type];
  const statusColor = entry.status === 'in-progress' ? '#22C55E' : entry.status === 'done' ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.45)';
  const isEmergency = entry.type === 'emergency';
  const TypeIcon = entry.type === 'walkin' ? Footprints : entry.type === 'emergency' ? Siren : Wifi;

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10, padding: '8px 6px', marginBottom: 4, borderRadius: 12,
      background: isYours ? 'rgba(99,102,241,0.18)' : 'transparent',
      border: isYours ? '1px solid rgba(99,102,241,0.45)' : '1px solid transparent',
    }}>
      {/* Token number */}
      <div style={{ width: 36, height: 36, borderRadius: 11, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: isEmergency ? 'rgba(239,68,68,0.18)' : isYours ? 'rgba(99,102,241,0.3)' : 'rgba(255,255,255,0.07)',
        border: `1.5px solid ${isEmergency ? 'rgba(239,68,68,0.5)' : isYours ? 'rgba(99,102,241,0.6)' : 'rgba(255,255,255,0.1)'}` }}>
        <span style={{ fontSize: 11, fontWeight: 900, color: isEmergency ? '#F87171' : isYours ? '#A5B4FC' : 'rgba(255,255,255,0.7)' }}>#{entry.id}</span>
      </div>
      {/* Name */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <span style={{ fontSize: 12, fontWeight: isYours ? 800 : 600, color: isYours ? '#FFF' : entry.status === 'done' ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.75)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{entry.name}</span>
          {isYours && <span style={{ fontSize: 9, fontWeight: 800, color: '#A5B4FC', background: 'rgba(99,102,241,0.3)', padding: '1px 5px', borderRadius: 4 }}>YOU</span>}
        </div>
        {/* Type badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 3, marginTop: 2 }}>
          <TypeIcon style={{ width: 9, height: 9, color: meta.color }} />
          <span style={{ fontSize: 9, fontWeight: 700, color: meta.color }}>{meta.label}</span>
        </div>
      </div>
      {/* Status */}
      <div style={{ flexShrink: 0, padding: '3px 8px', borderRadius: 8, background: entry.status === 'in-progress' ? 'rgba(34,197,94,0.15)' : 'transparent' }}>
        <span style={{ fontSize: 9, fontWeight: 700, color: statusColor, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {entry.status === 'in-progress' ? '● In' : entry.status === 'done' ? '✓ Done' : 'Waiting'}
        </span>
      </div>
    </div>
  );
}

export function Booking() {
  const [selectedDate, setSelectedDate] = useState(10);
  const [selectedShift, setSelectedShift] = useState(0);
  const [tokenType, setTokenType] = useState<'normal' | 'emergency'>('normal');
  const [selectedMember, setSelectedMember] = useState<string>('self');
  const [expandedMember, setExpandedMember] = useState<string | null>(null);
  const [visitType, setVisitType] = useState<'first' | 'followup'>('first');

  const shifts = getShifts(selectedDate);
  const shift = shifts[selectedShift] ?? null;
  const yourToken = shift ? shift.booked + 1 : null;
  const remaining = shift ? shift.max - shift.booked : 0;
  const isEmergency = tokenType === 'emergency';
  const payableNow = isEmergency ? 30 : 20;
  const consultFee = isEmergency ? 700 : 500;

  useEffect(() => {
    localStorage.setItem('linesetu_booking', JSON.stringify({
      tokenType,
      date: selectedDate,
      shiftLabel:  shift?.label  ?? 'Morning',
      shiftTime:   shift?.time   ?? '10:00 AM – 2:00 PM',
      shiftClinic: shift?.clinic ?? 'HeartCare Clinic',
      shiftLoc:    shift?.loc    ?? 'Andheri West, Mumbai',
      yourToken:   yourToken ?? 43,
      payableNow,
      consultFee,
      eAppFee:     isEmergency ? 20 : 10,
      platformFee: 10,
    }));
  }, [tokenType, selectedDate, selectedShift, shift, yourToken, payableNow, consultFee, isEmergency]);

  return (
    <div style={{ width: 390, height: 844, background: BG, fontFamily: "'Inter', sans-serif", display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>

      {/* Glow orbs */}
      <div style={{ position: 'absolute', top: -60, left: -60, width: 220, height: 220, borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.25) 0%, transparent 70%)', filter: 'blur(24px)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', top: 300, right: -80, width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(6,182,212,0.16) 0%, transparent 70%)', filter: 'blur(24px)', pointerEvents: 'none' }} />

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
        <span style={{ fontSize: 15, fontWeight: 700, color: '#FFF' }}>Book Appointment</span>
        <div style={{ width: 38 }} />
      </div>

      {/* SCROLLABLE */}
      <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', paddingBottom: 84 }}>

        {/* ── VISIT TYPE TOGGLE ── */}
        <div style={{ margin: '0 18px 14px', padding: '5px', borderRadius: 18, display: 'flex', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
          {(['first', 'followup'] as const).map((type) => {
            const active = visitType === type;
            const isFirst = type === 'first';
            return (
              <button key={type} onClick={() => setVisitType(type)}
                style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, padding: '10px 8px', borderRadius: 13, border: 'none', cursor: 'pointer', transition: 'all 0.2s ease',
                  background: active ? (isFirst ? 'linear-gradient(135deg, rgba(99,102,241,0.55), rgba(6,182,212,0.4))' : 'linear-gradient(135deg, rgba(16,185,129,0.5), rgba(6,182,212,0.35))') : 'transparent',
                  boxShadow: active ? '0 2px 12px rgba(99,102,241,0.3)' : 'none' }}>
                {isFirst
                  ? <Stethoscope style={{ width: 14, height: 14, color: active ? '#FFF' : 'rgba(255,255,255,0.35)', flexShrink: 0 }} />
                  : <RefreshCw   style={{ width: 14, height: 14, color: active ? '#FFF' : 'rgba(255,255,255,0.35)', flexShrink: 0 }} />}
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: 12, fontWeight: 800, color: active ? '#FFF' : 'rgba(255,255,255,0.4)', lineHeight: 1.2 }}>
                    {isFirst ? 'First Visit' : 'Follow-up'}
                  </div>
                  <div style={{ fontSize: 9, color: active ? 'rgba(255,255,255,0.65)' : 'rgba(255,255,255,0.22)', marginTop: 1 }}>
                    {isFirst ? 'New consultation' : 'Continuing treatment'}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* DOCTOR MINI CARD */}
        <div style={{ margin: '0 18px 14px', padding: '12px 14px', borderRadius: 18, display: 'flex', alignItems: 'center', gap: 12, ...GLASS }}>
          <img src="https://randomuser.me/api/portraits/women/44.jpg" alt="Dr. Ananya Sharma"
            style={{ width: 48, height: 48, borderRadius: 14, objectFit: 'cover', objectPosition: 'top', border: '2px solid rgba(239,68,68,0.4)', flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ fontSize: 14, fontWeight: 800, color: '#FFF' }}>Dr. Ananya Sharma</span>
              <BadgeCheck style={{ width: 14, height: 14, color: '#4F46E5', fill: '#4F46E5', stroke: '#FFF', strokeWidth: 1 }} />
            </div>
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)' }}>Cardiologist · 12 yrs exp</span>
          </div>
          <div style={{ padding: '4px 10px', borderRadius: 8, background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)' }}>
            <span style={{ fontSize: 10, fontWeight: 700, color: '#4ADE80' }}>Available</span>
          </div>
        </div>

        {/* ── BOOKING FOR ── */}
        <div style={{ margin: '0 18px 14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Booking For
            </div>
            <span style={{ fontSize: 10, color: 'rgba(99,102,241,0.7)', fontWeight: 600 }}>From Family Members</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {FAMILY.map((m) => {
              const isSelected = selectedMember === m.id;
              const isExpanded = expandedMember === m.id;
              return (
                <div key={m.id}
                  style={{ borderRadius: 16, overflow: 'hidden',
                    border: `1.5px solid ${isSelected ? 'rgba(99,102,241,0.55)' : 'rgba(255,255,255,0.07)'}`,
                    background: isSelected ? 'rgba(99,102,241,0.14)' : 'rgba(255,255,255,0.04)',
                    transition: 'all 0.2s ease' }}>

                  {/* Row */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', cursor: 'pointer' }}
                    onClick={() => {
                      setSelectedMember(m.id);
                      setExpandedMember(isExpanded ? null : m.id);
                    }}>
                    {/* Avatar */}
                    <div style={{ position: 'relative', flexShrink: 0 }}>
                      <img src={m.avatar} alt={m.name}
                        style={{ width: 38, height: 38, borderRadius: 12, objectFit: 'cover',
                          border: `2px solid ${isSelected ? 'rgba(99,102,241,0.6)' : 'rgba(255,255,255,0.1)'}` }} />
                      {isSelected && (
                        <div style={{ position: 'absolute', bottom: -3, right: -3, width: 14, height: 14, borderRadius: '50%',
                          background: '#4F46E5', border: '2px solid #0A0E1A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <svg width="7" height="7" viewBox="0 0 7 7" fill="none">
                            <path d="M1 3.5L2.8 5.5L6 1.5" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                      )}
                    </div>

                    {/* Name + age + phone */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                        <span style={{ fontSize: 13, fontWeight: 800, color: isSelected ? '#FFF' : 'rgba(255,255,255,0.7)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.name}</span>
                        <span style={{ fontSize: 9, fontWeight: 700, padding: '1px 6px', borderRadius: 5,
                          background: isSelected ? 'rgba(99,102,241,0.3)' : 'rgba(255,255,255,0.07)',
                          color: isSelected ? '#A5B4FC' : 'rgba(255,255,255,0.35)', flexShrink: 0 }}>{m.relation}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)' }}>{m.age} yrs</span>
                        <span style={{ color: 'rgba(255,255,255,0.15)', fontSize: 10 }}>·</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                          <Phone style={{ width: 9, height: 9, color: 'rgba(255,255,255,0.3)' }} />
                          <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)' }}>{m.phone}</span>
                        </div>
                      </div>
                    </div>

                    {/* Expand chevron */}
                    <div style={{ flexShrink: 0 }}>
                      {isExpanded
                        ? <ChevronUp  style={{ width: 14, height: 14, color: 'rgba(255,255,255,0.35)' }} />
                        : <ChevronDown style={{ width: 14, height: 14, color: 'rgba(255,255,255,0.25)' }} />}
                    </div>
                  </div>

                  {/* Expanded detail panel */}
                  {isExpanded && (
                    <div style={{ padding: '0 12px 12px', borderTop: '1px solid rgba(255,255,255,0.06)', marginTop: 0 }}>
                      <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '0 0 10px' }} />
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                        {[
                          { label: 'Full Name',    val: m.name     },
                          { label: 'Relation',     val: m.relation },
                          { label: 'Age',          val: `${m.age} years` },
                          { label: 'Gender',       val: m.gender   },
                          { label: 'Phone',        val: m.phone    },
                          { label: 'Blood Group',  val: m.blood    },
                        ].map(({ label, val }) => (
                          <div key={label} style={{ padding: '8px 10px', borderRadius: 11, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                            <div style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 3 }}>{label}</div>
                            <div style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.8)' }}>{val}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* CALENDAR */}
        <div style={{ margin: '0 18px 14px', padding: '14px 14px 10px', borderRadius: 20, ...GLASS }}>
          {/* Month header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <button style={{ width: 30, height: 30, borderRadius: 9, background: 'rgba(255,255,255,0.07)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <ChevronLeft style={{ width: 16, height: 16, color: 'rgba(255,255,255,0.5)' }} />
            </button>
            <span style={{ fontSize: 14, fontWeight: 700, color: '#FFF' }}>{MONTH}</span>
            <button style={{ width: 30, height: 30, borderRadius: 9, background: 'rgba(255,255,255,0.07)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <ChevronRight style={{ width: 16, height: 16, color: 'rgba(255,255,255,0.5)' }} />
            </button>
          </div>

          {/* DOW headers */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: 6 }}>
            {DOW_LABELS.map(d => (
              <div key={d} style={{ textAlign: 'center', fontSize: 10, fontWeight: 700, color: d === 'Su' ? 'rgba(239,68,68,0.6)' : 'rgba(255,255,255,0.3)', paddingBottom: 6 }}>{d}</div>
            ))}
          </div>

          {/* Date cells */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px 2px' }}>
            {/* Empty leading cells */}
            {Array.from({ length: FIRST_DAY_OF_WEEK }).map((_, i) => <div key={`e${i}`} />)}

            {Array.from({ length: DAYS_IN_MONTH }, (_, i) => i + 1).map(date => {
              const dow = getDayOfWeek(date);
              const shifts = getShifts(date);
              const available = shifts.length > 0;
              const isSelected = date === selectedDate;
              const isToday = date === 10;
              const isPast = date < 10;
              const isSun = dow === 0;

              let bg = 'transparent';
              let textColor = isPast ? 'rgba(255,255,255,0.18)' : isSun ? 'rgba(239,68,68,0.45)' : 'rgba(255,255,255,0.6)';
              let border = 'none';

              if (isSelected) {
                bg = 'linear-gradient(135deg, #4F46E5, #6366F1)';
                textColor = '#FFF';
              } else if (isToday && !isSelected) {
                border = '1.5px solid rgba(99,102,241,0.6)';
                textColor = '#A5B4FC';
              }

              return (
                <div key={date} onClick={() => { if (!isPast && available) { setSelectedDate(date); setSelectedShift(0); } }}
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 40, borderRadius: 11, cursor: (!isPast && available) ? 'pointer' : 'default', background: bg, border, position: 'relative', opacity: isPast ? 0.5 : 1 }}>
                  <span style={{ fontSize: 13, fontWeight: isSelected || isToday ? 800 : 500, color: textColor, lineHeight: 1 }}>{date}</span>
                  {/* Availability dot */}
                  {!isPast && available && !isSelected && (
                    <div style={{ width: 4, height: 4, borderRadius: '50%', background: shifts.length > 1 ? '#818CF8' : '#4ADE80', marginTop: 2 }} />
                  )}
                  {!isPast && !available && (
                    <div style={{ width: 4, height: 4, borderRadius: '50%', background: 'rgba(239,68,68,0.4)', marginTop: 2 }} />
                  )}
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 10, paddingTop: 10, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#818CF8' }} />
              <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)', fontWeight: 600 }}>2 Shifts</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ADE80' }} />
              <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)', fontWeight: 600 }}>1 Shift</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'rgba(239,68,68,0.4)' }} />
              <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)', fontWeight: 600 }}>Not Available</span>
            </div>
          </div>
        </div>

        {/* DATE DISPLAY + SHIFT PICKER */}
        {shifts.length > 0 ? (
          <>
            {/* Selected date header */}
            <div style={{ margin: '0 18px 10px', display: 'flex', alignItems: 'center', gap: 7 }}>
              <CalendarCheck style={{ width: 13, height: 13, color: '#67E8F9' }} />
              <span style={{ fontSize: 12, fontWeight: 700, color: '#67E8F9' }}>
                {['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][getDayOfWeek(selectedDate)]},&nbsp;
                {selectedDate} April 2026
              </span>
            </div>

            {/* Shift buttons */}
            <div style={{ display: 'flex', gap: 10, padding: '0 18px', marginBottom: 14 }}>
              {shifts.map((s, i) => {
                const Icon = s.icon;
                const active = i === selectedShift;
                return (
                  <button key={s.label} onClick={() => setSelectedShift(i)}
                    style={{ flex: 1, padding: '10px 8px', borderRadius: 16, border: `1.5px solid ${active ? s.color : 'rgba(255,255,255,0.08)'}`, background: active ? s.color + '18' : 'rgba(255,255,255,0.04)', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                    <div style={{ width: 30, height: 30, borderRadius: 10, background: s.color + '22', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Icon style={{ width: 14, height: 14, color: s.color }} />
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 700, color: active ? s.color : 'rgba(255,255,255,0.45)' }}>{s.label}</span>
                    <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)', fontWeight: 500 }}>{s.time}</span>
                  </button>
                );
              })}
            </div>

            {/* ── TOKEN TYPE SELECTOR ── */}
            <div style={{ padding: '0 18px', marginBottom: 14 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.5)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Token Type</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {/* Normal */}
                <button onClick={() => setTokenType('normal')}
                  style={{ padding: '12px 10px', borderRadius: 16, border: `1.5px solid ${!isEmergency ? 'rgba(99,102,241,0.6)' : 'rgba(255,255,255,0.08)'}`, background: !isEmergency ? 'rgba(99,102,241,0.18)' : 'rgba(255,255,255,0.04)', cursor: 'pointer', textAlign: 'center' }}>
                  <div style={{ width: 32, height: 32, borderRadius: 10, background: !isEmergency ? 'rgba(99,102,241,0.3)' : 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 6px' }}>
                    <Ticket style={{ width: 15, height: 15, color: !isEmergency ? '#A5B4FC' : 'rgba(255,255,255,0.3)' }} />
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 800, color: !isEmergency ? '#A5B4FC' : 'rgba(255,255,255,0.4)' }}>Normal</div>
                  <div style={{ fontSize: 9, color: !isEmergency ? 'rgba(165,180,252,0.65)' : 'rgba(255,255,255,0.25)', marginTop: 2 }}>Pay ₹20 · Consult ₹500</div>
                </button>
                {/* Emergency */}
                <button onClick={() => setTokenType('emergency')}
                  style={{ padding: '12px 10px', borderRadius: 16, border: `1.5px solid ${isEmergency ? 'rgba(239,68,68,0.6)' : 'rgba(255,255,255,0.08)'}`, background: isEmergency ? 'rgba(239,68,68,0.15)' : 'rgba(255,255,255,0.04)', cursor: 'pointer', textAlign: 'center' }}>
                  <div style={{ width: 32, height: 32, borderRadius: 10, background: isEmergency ? 'rgba(239,68,68,0.25)' : 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 6px' }}>
                    <ShieldAlert style={{ width: 15, height: 15, color: isEmergency ? '#F87171' : 'rgba(255,255,255,0.3)' }} />
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 800, color: isEmergency ? '#F87171' : 'rgba(255,255,255,0.4)' }}>Emergency</div>
                  <div style={{ fontSize: 9, color: isEmergency ? 'rgba(248,113,113,0.65)' : 'rgba(255,255,255,0.25)', marginTop: 2 }}>Pay ₹30 · Consult ₹700</div>
                </button>
              </div>
              {isEmergency && (
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6, marginTop: 8, padding: '8px 10px', borderRadius: 11, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)' }}>
                  <Siren style={{ width: 11, height: 11, color: '#F87171', flexShrink: 0, marginTop: 1 }} />
                  <span style={{ fontSize: 10, color: 'rgba(248,113,113,0.8)', lineHeight: 1.5 }}>Emergency tokens are placed at the top of the queue and seen before all normal patients. Priority fee applies.</span>
                </div>
              )}
            </div>

            {/* Clinic location row */}
            {shift && (
              <div style={{ margin: '0 18px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', borderRadius: 14, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Building2 style={{ width: 13, height: 13, color: 'rgba(255,255,255,0.3)', flexShrink: 0 }} />
                  <div>
                    <span style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.7)' }}>{shift.clinic}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 3, marginTop: 1 }}>
                      <MapPin style={{ width: 9, height: 9, color: 'rgba(255,255,255,0.3)' }} />
                      <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>{shift.loc}, Mumbai</span>
                    </div>
                  </div>
                </div>
                <a href={shift.maps} target="_blank" rel="noreferrer"
                  style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 9px', borderRadius: 9, background: 'rgba(66,133,244,0.18)', border: '1px solid rgba(66,133,244,0.35)', textDecoration: 'none' }}>
                  <Navigation style={{ width: 10, height: 10, color: '#4285F4' }} />
                  <span style={{ fontSize: 10, fontWeight: 700, color: '#4285F4' }}>Maps</span>
                </a>
              </div>
            )}

            {/* TOKEN SUMMARY CARD */}
            {shift && (
              <div style={{ margin: '0 18px 14px', borderRadius: 20, overflow: 'hidden', background: 'linear-gradient(135deg, rgba(79,70,229,0.22) 0%, rgba(6,182,212,0.13) 100%)', border: '1px solid rgba(99,102,241,0.3)', backdropFilter: 'blur(16px)' }}>
                {/* Stats row */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 1, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  {[
                    { label: 'Max Tokens',    val: shift.max,    icon: Users,   color: '#67E8F9' },
                    { label: 'Tokens Booked', val: shift.booked, icon: Ticket,  color: '#F87171' },
                    { label: 'Remaining',     val: remaining,    icon: Clock,   color: '#4ADE80' },
                  ].map(({ label, val, icon: Icon, color }, idx) => (
                    <div key={label} style={{ padding: '12px 8px', textAlign: 'center', borderRight: idx < 2 ? '1px solid rgba(255,255,255,0.06)' : 'none' }}>
                      <Icon style={{ width: 14, height: 14, color, margin: '0 auto 5px' }} />
                      <div style={{ fontSize: 18, fontWeight: 900, color, lineHeight: 1 }}>{val}</div>
                      <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)', marginTop: 3, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</div>
                    </div>
                  ))}
                </div>

                {/* Your token highlight */}
                <div style={{ padding: '16px 14px', textAlign: 'center' }}>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Your Token Number</div>
                  <div style={{ fontSize: 52, fontWeight: 900, color: '#A5B4FC', lineHeight: 1, letterSpacing: '-2px' }}>#{yourToken}</div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 8 }}>
                    <div style={{ padding: '4px 12px', borderRadius: 20, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}>
                      <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>{shift.booked} people ahead</span>
                    </div>
                    <div style={{ padding: '4px 12px', borderRadius: 20, background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)' }}>
                      <span style={{ fontSize: 11, color: '#FCD34D', fontWeight: 700 }}>~{shift.booked * 5} min wait</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Notice */}
            <div style={{ margin: '0 18px 14px', display: 'flex', alignItems: 'flex-start', gap: 8, padding: '10px 12px', borderRadius: 14, background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)' }}>
              <AlertCircle style={{ width: 14, height: 14, color: '#F59E0B', flexShrink: 0, marginTop: 1 }} />
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', lineHeight: 1.6, margin: 0 }}>
                Arrive at the clinic when your token is <strong style={{ color: '#FCD34D' }}>5 numbers away</strong>. Consultation fee of <strong style={{ color: isEmergency ? '#F87171' : '#FCD34D' }}>₹{consultFee}</strong> is paid directly at the clinic.
              </p>
            </div>

            {/* ── LIVE MASTER QUEUE ── */}
            <div style={{ margin: '0 18px 14px' }}>
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 10 }}>
                <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#22C55E', boxShadow: '0 0 8px #22C55E' }} />
                <span style={{ fontSize: 13, fontWeight: 700, color: '#FFF' }}>Live Master Queue</span>
                <div style={{ flex: 1 }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Radio style={{ width: 10, height: 10, color: '#818CF8' }} />
                  <span style={{ fontSize: 10, color: '#818CF8', fontWeight: 600 }}>Cardiology OPD</span>
                </div>
              </div>

              {/* ── Emergency section ── */}
              <div style={{ marginBottom: 8, padding: '8px 10px 4px', borderRadius: 14, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.22)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 6 }}>
                  <Siren style={{ width: 12, height: 12, color: '#F87171' }} />
                  <span style={{ fontSize: 10, fontWeight: 800, color: '#F87171', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Emergency Priority</span>
                </div>
                {EMERGENCY.map((entry) => (
                  <QueueRow key={entry.id} entry={entry} isYours={false} />
                ))}
              </div>

              {/* ── Normal tokens ── */}
              <div style={{ padding: '8px 10px 4px', borderRadius: 14, ...GLASS }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 6 }}>
                  <Ticket style={{ width: 12, height: 12, color: 'rgba(255,255,255,0.4)' }} />
                  <span style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Normal Queue</span>
                </div>
                {NORMAL.map((entry) => (
                  <QueueRow key={entry.id} entry={entry} isYours={entry.id === String(yourToken)} />
                ))}
              </div>
            </div>
          </>
        ) : (
          <div style={{ margin: '0 18px 14px', padding: '20px', borderRadius: 18, textAlign: 'center', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
            <span style={{ fontSize: 13, color: 'rgba(239,68,68,0.7)', fontWeight: 600 }}>
              {getDayOfWeek(selectedDate) === 0 ? 'Doctor is not available on Sundays.' : 'No sessions on this date. Please choose another day.'}
            </span>
          </div>
        )}

      </div>

      {/* BOTTOM CTA */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '12px 18px 20px', background: 'rgba(10,14,26,0.95)', backdropFilter: 'blur(20px)', borderTop: '1px solid rgba(255,255,255,0.07)', zIndex: 20 }}>
        <button
          disabled={shifts.length === 0}
          style={{ width: '100%', height: 52, borderRadius: 16, background: shifts.length === 0 ? 'rgba(255,255,255,0.07)' : isEmergency ? 'linear-gradient(135deg, #DC2626 0%, #EF4444 60%, #F97316 100%)' : 'linear-gradient(135deg, #4F46E5 0%, #6366F1 60%, #0EA5E9 100%)', border: 'none', cursor: shifts.length > 0 ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontSize: 15, fontWeight: 700, color: shifts.length > 0 ? '#FFF' : 'rgba(255,255,255,0.25)', boxShadow: shifts.length > 0 ? isEmergency ? '0 8px 28px rgba(239,68,68,0.5)' : '0 8px 28px rgba(79,70,229,0.45)' : 'none' }}>
          <CalendarCheck style={{ width: 18, height: 18 }} />
          {shifts.length > 0 ? `Confirm ${isEmergency ? 'Emergency' : ''} Token #${isEmergency ? 'E' : ''}${yourToken} · Pay ₹${payableNow}` : 'Select an Available Date'}
        </button>
      </div>
    </div>
  );
}
