import React, { useState } from 'react';
import {
  Sun, Moon, UserPlus, Users,
  TrendingUp, Activity,
  Bell, Stethoscope, Zap,
  Smartphone, Footprints, BarChart2, ArrowUpRight,
  CheckCircle2, XCircle, Clock, UserX, AlertCircle,
  House, CalendarClock, SlidersHorizontal,
} from 'lucide-react';

const BG = '#070B14';
const TEAL = '#0D9488';
const TEAL_LT = '#2DD4BF';
const GLASS: React.CSSProperties = {
  background: 'rgba(255,255,255,0.05)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  border: '1px solid rgba(255,255,255,0.09)',
};

/* ─── SPARKLINE SVG ─── */
function Sparkline({ data, color, fill }: { data: number[]; color: string; fill: string }) {
  const w = 80, h = 30;
  const min = Math.min(...data), max = Math.max(...data);
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / (max - min)) * h * 0.85 - 2;
    return `${x},${y}`;
  }).join(' ');
  const fillPts = `0,${h} ${pts} ${w},${h}`;
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} fill="none">
      <polyline points={pts} stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <polygon points={fillPts} fill={fill} opacity="0.35" />
    </svg>
  );
}

/* ─── TOGGLE SWITCH ─── */
function Toggle({ value, onToggle, onColor }: { value: boolean; onToggle: () => void; onColor: string }) {
  return (
    <div onClick={onToggle} style={{ width: 46, height: 26, borderRadius: 13, cursor: 'pointer', position: 'relative', transition: 'all 0.25s',
      background: value ? onColor : 'rgba(255,255,255,0.1)', border: `1px solid ${value ? onColor : 'rgba(255,255,255,0.15)'}`,
      boxShadow: value ? `0 0 12px ${onColor}60` : 'none' }}>
      <div style={{ position: 'absolute', top: 3, left: value ? 23 : 3, width: 18, height: 18, borderRadius: '50%', background: '#FFF', transition: 'left 0.25s', boxShadow: '0 1px 4px rgba(0,0,0,0.3)' }} />
    </div>
  );
}

/* ─── STAT CARD ─── */
function StatCard({ label, value, sub, color, bg, sparkData }: {
  label: string; value: string | number; sub: string; color: string; bg: string; sparkData: number[];
}) {
  return (
    <div style={{ flex: 1, borderRadius: 18, padding: '12px 12px 10px', background: bg, border: `1px solid ${color}25` }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 6 }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 900, color, lineHeight: 1 }}>{value}</div>
          <div style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.07em', marginTop: 3 }}>{label}</div>
        </div>
        <Sparkline data={sparkData} color={color} fill={color} />
      </div>
      <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', fontWeight: 500 }}>{sub}</div>
    </div>
  );
}

/* ─── MAIN ─── */
type EarningPeriod = 'Daily' | 'Weekly' | 'Monthly';
type Shift = 'Morning' | 'Evening';

const EARNINGS = {
  Daily:   { n1:  540,  n2:  300,  n3:   160, n4:  1360, n5:  480,  total:  2840,  spark: [2200,2600,1900,3100,2500,2840]               },
  Weekly:  { n1: 3400,  n2: 1900,  n3:   980, n4:  8500, n5: 3780,  total: 18560,  spark: [14200,17800,15600,19200,16800,18560]           },
  Monthly: { n1:13400,  n2: 7500,  n3:  3900, n4: 34200, n5:15200,  total: 74200,  spark: [62000,68000,71000,66000,70000,74200]           },
};

/* ─── PATIENT DATA ─── */
type PatientPeriod = 'Daily' | 'Weekly' | 'Monthly';

const PATIENT_DATA: Record<PatientPeriod, {
  total: number; consulted: number; noShow: number; waitlisted: number; emergency: number; walkIn: number;
  onlineBooked: number; followUp: number; newPatient: number;
  consultedSpark: number[]; noShowSpark: number[]; waitSpark: number[];
  onlineSpark: number[]; followUpSpark: number[]; newSpark: number[];
}> = {
  Daily:   { total: 29,  consulted: 18,  noShow: 4,  waitlisted: 7,   emergency: 3,  walkIn: 8,
             onlineBooked: 21, followUp: 11, newPatient: 8,
    consultedSpark: [12,16,14,19,15,18], noShowSpark: [2,4,3,5,3,4],   waitSpark:    [8,6,9,5,7,7],
    onlineSpark:    [14,18,16,22,19,21], followUpSpark: [7,10,9,12,10,11], newSpark: [4,7,5,9,6,8] },
  Weekly:  { total: 184, consulted: 121, noShow: 24, waitlisted: 39,  emergency: 18, walkIn: 46,
             onlineBooked: 138, followUp: 73, newPatient: 48,
    consultedSpark: [95,112,108,125,115,121], noShowSpark: [18,22,20,26,21,24], waitSpark: [42,36,44,30,38,39],
    onlineSpark:    [108,125,118,142,130,138], followUpSpark: [55,68,62,78,68,73], newSpark: [35,44,40,52,44,48] },
  Monthly: { total: 736, consulted: 484, noShow: 96, waitlisted: 156, emergency: 72, walkIn: 184,
             onlineBooked: 552, followUp: 292, newPatient: 192,
    consultedSpark: [420,455,470,440,468,484], noShowSpark: [78,90,85,98,88,96], waitSpark: [168,145,175,130,152,156],
    onlineSpark:    [430,498,472,568,520,552], followUpSpark: [220,272,248,312,272,292], newSpark: [140,176,160,208,176,192] },
};

function PatientStats() {
  const [period, setPeriod] = useState<PatientPeriod>('Daily');
  const d = PATIENT_DATA[period];

  const rows: { label: string; value: number; sub: string; icon: React.ElementType; color: string; bg: string; spark: number[]; divider?: boolean }[] = [
    { label: 'Total Patients',         value: d.total,       sub: 'All registered',        icon: Users,        color: '#A5B4FC', bg: 'rgba(99,102,241,0.15)', spark: [20,24,22,28,25,d.total] },
    { label: 'Consulted',              value: d.consulted,   sub: 'Seen by doctor',         icon: CheckCircle2, color: '#4ADE80', bg: 'rgba(34,197,94,0.13)',  spark: d.consultedSpark },
    { label: 'Not Shown',              value: d.noShow,      sub: 'Absent / skipped',       icon: UserX,        color: '#F87171', bg: 'rgba(239,68,68,0.13)',  spark: d.noShowSpark },
    { label: 'Waitlisted',             value: d.waitlisted,  sub: 'Still in queue',         icon: Clock,        color: '#FCD34D', bg: 'rgba(245,158,11,0.13)', spark: d.waitSpark },
    { label: 'Emergency Patients',     value: d.emergency,   sub: 'Priority tokens',        icon: AlertCircle,  color: '#FB923C', bg: 'rgba(249,115,22,0.13)', spark: [1,3,2,4,2,d.emergency] },
    { label: 'Walk-in Patients',       value: d.walkIn,      sub: 'Direct registration',    icon: Footprints,   color: '#67E8F9', bg: 'rgba(6,182,212,0.13)',  spark: [5,8,6,10,7,d.walkIn], divider: true },
    { label: 'Online Token Booked',    value: d.onlineBooked,sub: 'Via app (Normal + Emerg)',icon: Smartphone,   color: '#818CF8', bg: 'rgba(99,102,241,0.15)', spark: d.onlineSpark },
    { label: 'Follow-up Patients',     value: d.followUp,    sub: 'Returning patients',     icon: Activity,     color: '#34D399', bg: 'rgba(16,185,129,0.13)', spark: d.followUpSpark },
    { label: 'New Patients',           value: d.newPatient,  sub: 'First-time visit',       icon: UserPlus,     color: '#F9A8D4', bg: 'rgba(236,72,153,0.13)', spark: d.newSpark },
  ];

  const consultPct = Math.round((d.consulted / d.total) * 100);

  return (
    <div style={{ borderRadius: 22, padding: '14px 14px 16px', ...GLASS }}>
      {/* Header + period toggle */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <BarChart2 style={{ width: 14, height: 14, color: TEAL_LT }} />
          <span style={{ fontSize: 12, fontWeight: 800, color: '#FFF' }}>Patient Data</span>
        </div>
        <div style={{ display: 'flex', gap: 4, padding: 3, borderRadius: 12, background: 'rgba(0,0,0,0.3)' }}>
          {(['Daily','Weekly','Monthly'] as PatientPeriod[]).map(p => (
            <button key={p} onClick={() => setPeriod(p)}
              style={{ padding: '4px 9px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 10, fontWeight: 800,
                background: period === p ? TEAL : 'transparent',
                color: period === p ? '#FFF' : 'rgba(255,255,255,0.4)',
                boxShadow: period === p ? `0 2px 8px rgba(13,148,136,0.4)` : 'none' }}>{p}</button>
          ))}
        </div>
      </div>

      {/* Consultation rate pill */}
      <div style={{ padding: '10px 12px', borderRadius: 14, marginBottom: 12,
        background: 'linear-gradient(135deg, rgba(34,197,94,0.12), rgba(13,148,136,0.1))',
        border: '1px solid rgba(34,197,94,0.2)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.6)' }}>Consultation Rate</span>
          <span style={{ fontSize: 14, fontWeight: 900, color: '#4ADE80' }}>{consultPct}%</span>
        </div>
        <div style={{ height: 5, borderRadius: 5, background: 'rgba(255,255,255,0.08)' }}>
          <div style={{ height: '100%', borderRadius: 5, width: `${consultPct}%`,
            background: 'linear-gradient(90deg, #0D9488, #4ADE80)', transition: 'width 0.4s ease' }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 5 }}>
          <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', fontWeight: 600 }}>{d.consulted} seen</span>
          <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', fontWeight: 600 }}>{d.total} total</span>
        </div>
      </div>

      {/* Stats rows */}
      {rows.map((row, i) => {
        const Icon = row.icon;
        const pct = Math.min(100, Math.round((row.value / d.total) * 100));
        return (
          <React.Fragment key={row.label}>
            {row.divider && (
              <div style={{ margin: '8px 0 6px', display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }} />
                <span style={{ fontSize: 9, fontWeight: 800, color: 'rgba(255,255,255,0.22)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Booking Type</span>
                <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }} />
              </div>
            )}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10,
            padding: '9px 0', borderTop: i > 0 && !row.divider ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
            <div style={{ width: 34, height: 34, borderRadius: 11, display: 'flex', alignItems: 'center', justifyContent: 'center', background: row.bg, flexShrink: 0 }}>
              <Icon style={{ width: 14, height: 14, color: row.color, strokeWidth: 1.8 }} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.7)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '65%' }}>{row.label}</span>
                <span style={{ fontSize: 14, fontWeight: 900, color: '#FFF', flexShrink: 0, marginLeft: 4 }}>{row.value}</span>
              </div>
              <div style={{ height: 3, borderRadius: 3, background: 'rgba(255,255,255,0.07)' }}>
                <div style={{ height: '100%', borderRadius: 3, width: `${pct}%`, background: row.color, transition: 'width 0.4s ease', opacity: 0.85 }} />
              </div>
              <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.25)', fontWeight: 500, marginTop: 3 }}>{row.sub}</div>
            </div>
            <Sparkline data={row.spark} color={row.color} fill={row.color} />
          </div>
          </React.Fragment>
        );
      })}
    </div>
  );
}

function DocNavBar({ active }: { active: 'home'|'queue'|'earnings'|'settings'|'walkin' }) {
  const C = (a: string) => active === a ? TEAL_LT : 'rgba(255,255,255,0.3)';
  return (
    <div style={{ height: 72, flexShrink: 0, position: 'relative', background: 'rgba(7,11,20,0.96)',
      backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
      <div style={{ display: 'flex', height: '100%', alignItems: 'center' }}>
        <button style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, background: 'none', border: 'none', cursor: 'pointer', paddingBottom: 6 }}>
          <House style={{ width: 20, height: 20, color: C('home') }} />
          <span style={{ fontSize: 9, fontWeight: 700, color: C('home'), letterSpacing: '0.03em' }}>Home</span>
        </button>
        <button style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, background: 'none', border: 'none', cursor: 'pointer', paddingBottom: 6 }}>
          <CalendarClock style={{ width: 20, height: 20, color: C('queue') }} />
          <span style={{ fontSize: 9, fontWeight: 700, color: C('queue'), letterSpacing: '0.03em' }}>Manage</span>
        </button>
        <button style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, background: 'none', border: 'none', cursor: 'pointer', paddingBottom: 6 }}>
          <TrendingUp style={{ width: 20, height: 20, color: C('earnings') }} />
          <span style={{ fontSize: 9, fontWeight: 700, color: C('earnings'), letterSpacing: '0.03em' }}>Earnings</span>
        </button>
        <button style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, background: 'none', border: 'none', cursor: 'pointer', paddingBottom: 6 }}>
          <SlidersHorizontal style={{ width: 20, height: 20, color: C('settings') }} />
          <span style={{ fontSize: 9, fontWeight: 700, color: C('settings'), letterSpacing: '0.03em' }}>Settings</span>
        </button>
      </div>
    </div>
  );
}

export function Dashboard() {
  const [period,       setPeriod]       = useState<EarningPeriod>('Daily');
  const [shift,        setShift]        = useState<Shift>('Morning');
  const [bookingOn,    setBookingOn]    = useState(true);

  const earn = EARNINGS[period];
  const fmt  = (n: number) => n >= 1000 ? `₹${(n/1000).toFixed(1)}k` : `₹${n}`;

  return (
    <div style={{ width: 390, height: 844, background: BG, fontFamily: "'Inter', sans-serif",
      display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>

      {/* Glow orbs */}
      <div style={{ position: 'absolute', top: -80, left: -60, width: 280, height: 280, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(13,148,136,0.22) 0%, transparent 65%)', filter: 'blur(44px)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', top: 350, right: -80, width: 220, height: 220, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(6,182,212,0.13) 0%, transparent 70%)', filter: 'blur(36px)', pointerEvents: 'none' }} />

      {/* ── STATUS BAR ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px 0', flexShrink: 0, position: 'relative', zIndex: 10 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.55)' }}>9:41</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          {[0.4,0.65,0.9,1].map((op,i) => <div key={i} style={{ width: 3, height: 6+i*2, borderRadius: 2, background: `rgba(255,255,255,${op})` }} />)}
          <div style={{ width: 6 }} />
          <svg width="16" height="11" viewBox="0 0 16 11" fill="none"><path d="M8 2C10.4 2 12.6 3 14.1 4.7L15.5 3.2C13.6 1.2 10.9 0 8 0C5.1 0 2.4 1.2 0.5 3.2L1.9 4.7C3.4 3 5.6 2 8 2Z" fill="white" opacity="0.4"/><path d="M8 5C9.7 5 11.2 5.7 12.3 6.8L13.7 5.3C12.2 3.9 10.2 3 8 3C5.8 3 3.8 3.9 2.3 5.3L3.7 6.8C4.8 5.7 6.3 5 8 5Z" fill="white" opacity="0.7"/><circle cx="8" cy="9.5" r="1.5" fill="white"/></svg>
          <div style={{ width: 4 }} />
          <svg width="24" height="12" viewBox="0 0 24 12" fill="none"><rect x="0.5" y="0.5" width="20" height="11" rx="3.5" stroke="white" strokeOpacity="0.3"/><rect x="2" y="2" width="14" height="8" rx="2" fill="white" fillOpacity="0.85"/></svg>
        </div>
      </div>

      {/* ── TOP HEADER ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 18px 10px', flexShrink: 0, position: 'relative', zIndex: 10 }}>
        <div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', fontWeight: 600 }}>Fri, 10 Apr 2026</div>
          <div style={{ fontSize: 19, fontWeight: 900, color: '#FFF', letterSpacing: '-0.4px', lineHeight: 1.2, marginTop: 2 }}>
            Good Morning, <span style={{ background: `linear-gradient(90deg, ${TEAL_LT}, #67E8F9)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Dr. Sharma</span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ position: 'relative' }}>
            <button style={{ width: 38, height: 38, borderRadius: 13, ...GLASS, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: '1px solid rgba(255,255,255,0.1)' }}>
              <Bell style={{ width: 17, height: 17, color: 'rgba(255,255,255,0.65)' }} />
            </button>
            <div style={{ position: 'absolute', top: 6, right: 7, width: 8, height: 8, borderRadius: '50%', background: '#EF4444', border: '1.5px solid #070B14' }} />
          </div>
          <div style={{ width: 38, height: 38, borderRadius: 13, background: `linear-gradient(135deg, ${TEAL}, #0891B2)`, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid rgba(45,212,191,0.3)', boxShadow: `0 2px 12px rgba(13,148,136,0.4)` }}>
            <Stethoscope style={{ width: 18, height: 18, color: '#FFF', strokeWidth: 1.8 }} />
          </div>
        </div>
      </div>

      {/* ── SCROLLABLE BODY ── */}
      <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '0 16px 80px', position: 'relative', zIndex: 10 }}>

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            SECTION 1 — QUICK CONTROLS
        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <div style={{ borderRadius: 22, padding: '14px 14px 12px', marginBottom: 12, ...GLASS }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
            <Activity style={{ width: 14, height: 14, color: TEAL_LT }} />
            <span style={{ fontSize: 12, fontWeight: 800, color: '#FFF' }}>Quick Controls</span>
          </div>

          {/* Shift toggle */}
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 7 }}>Clinic Shift</div>
            <div
              onClick={() => setShift(s => s === 'Morning' ? 'Evening' : 'Morning')}
              style={{ position: 'relative', display: 'flex', height: 52, borderRadius: 16, cursor: 'pointer', padding: 4,
                background: 'rgba(255,255,255,0.06)', border: '1.5px solid rgba(255,255,255,0.1)',
                boxShadow: shift === 'Morning' ? '0 2px 16px rgba(245,158,11,0.2)' : '0 2px 16px rgba(99,102,241,0.2)',
                transition: 'box-shadow 0.3s ease' }}>
              {/* Sliding pill */}
              <div style={{ position: 'absolute', top: 4, bottom: 4,
                left: shift === 'Morning' ? 4 : 'calc(50% + 2px)',
                width: 'calc(50% - 6px)', borderRadius: 12, transition: 'left 0.28s cubic-bezier(0.4,0,0.2,1)',
                background: shift === 'Morning'
                  ? 'linear-gradient(135deg, rgba(245,158,11,0.35), rgba(253,186,116,0.2))'
                  : 'linear-gradient(135deg, rgba(99,102,241,0.35), rgba(165,180,252,0.2))',
                border: shift === 'Morning' ? '1.5px solid rgba(245,158,11,0.5)' : '1.5px solid rgba(165,180,252,0.5)',
                boxShadow: shift === 'Morning' ? '0 2px 12px rgba(245,158,11,0.3)' : '0 2px 12px rgba(99,102,241,0.3)' }} />
              {/* Morning side */}
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, position: 'relative', zIndex: 1 }}>
                <Sun style={{ width: 15, height: 15, color: shift === 'Morning' ? '#FCD34D' : 'rgba(255,255,255,0.25)', strokeWidth: 2, transition: 'color 0.25s' }} />
                <span style={{ fontSize: 12, fontWeight: 800, color: shift === 'Morning' ? '#FCD34D' : 'rgba(255,255,255,0.28)', letterSpacing: '0.03em', transition: 'color 0.25s' }}>Morning</span>
              </div>
              {/* Evening side */}
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, position: 'relative', zIndex: 1 }}>
                <Moon style={{ width: 14, height: 14, color: shift === 'Evening' ? '#A5B4FC' : 'rgba(255,255,255,0.25)', strokeWidth: 2, transition: 'color 0.25s' }} />
                <span style={{ fontSize: 12, fontWeight: 800, color: shift === 'Evening' ? '#A5B4FC' : 'rgba(255,255,255,0.28)', letterSpacing: '0.03em', transition: 'color 0.25s' }}>Evening</span>
              </div>
            </div>
          </div>

          {/* Booking toggle */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', borderRadius: 14,
            background: bookingOn ? 'rgba(45,212,191,0.08)' : 'rgba(255,255,255,0.04)',
            border: `1px solid ${bookingOn ? 'rgba(45,212,191,0.25)' : 'rgba(255,255,255,0.07)'}`, marginBottom: 12 }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#FFF' }}>Online Token Booking</div>
              <div style={{ fontSize: 10, color: bookingOn ? '#2DD4BF' : 'rgba(255,255,255,0.3)', fontWeight: 600, marginTop: 2 }}>
                {bookingOn ? 'Accepting new patients' : 'Bookings paused'}
              </div>
            </div>
            <Toggle value={bookingOn} onToggle={() => setBookingOn(p => !p)} onColor={TEAL} />
          </div>

          {/* Quick action buttons */}
          <div style={{ display: 'flex', gap: 8 }}>
            <button style={{ flex: 1, height: 46, borderRadius: 14, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, fontSize: 12, fontWeight: 800, color: '#FFF',
              background: 'linear-gradient(135deg, #0D9488, #0891B2)', boxShadow: `0 4px 16px rgba(13,148,136,0.4)` }}>
              <UserPlus style={{ width: 15, height: 15 }} /> Add Walk-in
            </button>
            <button style={{ flex: 1, height: 46, borderRadius: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, fontSize: 12, fontWeight: 800, color: 'rgba(255,255,255,0.75)',
              background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)' }}>
              <Users style={{ width: 15, height: 15 }} /> View Queue
            </button>
          </div>
        </div>

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            SECTION 2 — EARNINGS
        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <div style={{ borderRadius: 22, padding: '16px 16px 14px', marginBottom: 12,
          background: 'linear-gradient(145deg, rgba(13,148,136,0.2) 0%, rgba(6,182,212,0.12) 100%)',
          border: '1.5px solid rgba(45,212,191,0.22)',
          boxShadow: '0 8px 32px rgba(13,148,136,0.18)' }}>

          {/* Period toggle */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <TrendingUp style={{ width: 14, height: 14, color: TEAL_LT }} />
              <span style={{ fontSize: 12, fontWeight: 800, color: '#FFF' }}>Earnings Overview</span>
            </div>
            <div style={{ display: 'flex', gap: 4, padding: 3, borderRadius: 12, background: 'rgba(0,0,0,0.3)' }}>
              {(['Daily','Weekly','Monthly'] as EarningPeriod[]).map(p => (
                <button key={p} onClick={() => setPeriod(p)}
                  style={{ padding: '4px 10px', borderRadius: 9, border: 'none', cursor: 'pointer', fontSize: 10, fontWeight: 800,
                    background: period === p ? TEAL : 'transparent',
                    color: period === p ? '#FFF' : 'rgba(255,255,255,0.4)',
                    boxShadow: period === p ? `0 2px 8px rgba(13,148,136,0.4)` : 'none' }}>{p}</button>
              ))}
            </div>
          </div>

          {/* Total + sparkline */}
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 14 }}>
            <div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', fontWeight: 600, marginBottom: 2 }}>Total {period}</div>
              <div style={{ fontSize: 32, fontWeight: 900, color: '#FFF', letterSpacing: '-1px', lineHeight: 1 }}>
                {fmt(earn.total)}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
                <ArrowUpRight style={{ width: 11, height: 11, color: '#4ADE80' }} />
                <span style={{ fontSize: 11, fontWeight: 700, color: '#4ADE80' }}>+12% vs last {period.toLowerCase()}</span>
              </div>
            </div>
            <Sparkline data={earn.spark} color={TEAL_LT} fill={TEAL} />
          </div>

          {/* Breakdown rows */}
          {[
            { label: 'Online Normal Token',         value: earn.n1, icon: Smartphone, color: '#A5B4FC', bg: 'rgba(99,102,241,0.15)'  },
            { label: 'Online Emergency Token',      value: earn.n2, icon: Zap,        color: '#FCD34D', bg: 'rgba(245,158,11,0.15)'  },
            { label: 'Walk-in Token',               value: earn.n3, icon: Footprints, color: '#67E8F9', bg: 'rgba(6,182,212,0.15)'   },
            { label: 'In-Clinic Normal Consult',    value: earn.n4, icon: Stethoscope,color: '#4ADE80', bg: 'rgba(34,197,94,0.12)'   },
            { label: 'In-Clinic Emergency Consult', value: earn.n5, icon: Zap,        color: '#F87171', bg: 'rgba(239,68,68,0.12)'   },
          ].map(row => {
            const Icon = row.icon;
            const pct = Math.round((row.value / earn.total) * 100);
            return (
              <div key={row.label} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ width: 30, height: 30, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', background: row.bg, flexShrink: 0 }}>
                  <Icon style={{ width: 13, height: 13, color: row.color, strokeWidth: 1.8 }} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.65)' }}>{row.label}</span>
                    <span style={{ fontSize: 12, fontWeight: 800, color: '#FFF' }}>{fmt(row.value)}</span>
                  </div>
                  <div style={{ height: 3, borderRadius: 3, background: 'rgba(255,255,255,0.08)' }}>
                    <div style={{ height: '100%', borderRadius: 3, width: `${pct}%`, background: row.color, transition: 'width 0.4s ease' }} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            SECTION 4 — PATIENT DATA
        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <PatientStats />

      </div>

      {/* ── NAV BAR ── */}
      <DocNavBar active="home" />
    </div>
  );
}
