import React, { useState } from 'react';
import {
  TrendingUp, TrendingDown, IndianRupee, ArrowUpRight,
  CheckCircle2, Clock, RefreshCw, AlertCircle, Wallet,
  Smartphone, Zap, Footprints, Stethoscope, Activity,
  ChevronRight, Download, Bell, Filter,
  House, CalendarClock, SlidersHorizontal, UserPlus,
  BarChart2, BadgeCheck, Shield, Info,
} from 'lucide-react';

/* ── THEME ── */
const BG      = '#070B14';
const TEAL    = '#0D9488';
const TEAL_LT = '#2DD4BF';
const GLASS: React.CSSProperties = {
  background: 'rgba(255,255,255,0.05)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  border: '1px solid rgba(255,255,255,0.09)',
};

const fmt = (n: number) =>
  n >= 100000 ? `₹${(n/100000).toFixed(2)}L`
  : n >= 1000  ? `₹${(n/1000).toFixed(1)}k`
  : `₹${n}`;
const fmtFull = (n: number) => `₹${n.toLocaleString('en-IN')}`;

/* ── NAV BAR ── */
function DocNavBar({ active }: { active: 'home'|'queue'|'earnings'|'settings'|'walkin' }) {
  const C = (a: string) => active === a ? TEAL_LT : 'rgba(255,255,255,0.3)';
  return (
    <div style={{ height: 72, flexShrink: 0, position: 'relative', background: 'rgba(7,11,20,0.96)',
      backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
      <div style={{ position: 'absolute', top: -26, left: '50%', transform: 'translateX(-50%)',
        width: 54, height: 54, borderRadius: '50%',
        background: active === 'walkin' ? 'linear-gradient(135deg,#2DD4BF,#06B6D4)' : 'linear-gradient(135deg,#0D9488,#0891B2)',
        boxShadow: `0 4px 24px ${active==='walkin' ? 'rgba(45,212,191,0.7)' : 'rgba(13,148,136,0.55)'}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', border: '3px solid #070B14', zIndex: 10 }}>
        <UserPlus style={{ width: 22, height: 22, color: '#FFF' }} />
      </div>
      <div style={{ display: 'flex', height: '100%', alignItems: 'center' }}>
        {[
          { key: 'home',     icon: House,            label: 'Home'     },
          { key: 'queue',    icon: CalendarClock,    label: 'Manage'   },
          { key: '_fab',     icon: null,             label: ''         },
          { key: 'earnings', icon: TrendingUp,       label: 'Earnings' },
          { key: 'settings', icon: SlidersHorizontal,label: 'Settings' },
        ].map((t, i) => {
          if (t.key === '_fab') return <div key={i} style={{ flex: 1 }} />;
          const Icon = t.icon!;
          return (
            <button key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, background: 'none', border: 'none', cursor: 'pointer', paddingBottom: 6 }}>
              <Icon style={{ width: 20, height: 20, color: C(t.key) }} />
              <span style={{ fontSize: 9, fontWeight: 700, color: C(t.key), letterSpacing: '0.03em' }}>{t.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ── PERIOD DATA ── */
type Period = 'Week' | 'Month' | 'LastMonth' | 'AllTime';

const PERIOD_DATA: Record<Period, {
  label: string; total: number; online: number; emergency: number; walkin: number; normalConsult: number; emergConsult: number;
  normalCount: number; emergCount: number; walkinCount: number; ncCount: number; ecCount: number;
  trend: number;
}> = {
  Week: {
    label: 'This Week',    total: 19600,  online: 3780,  emergency: 2100, walkin: 1120,  normalConsult: 9800,  emergConsult: 2800,
    normalCount: 54, emergCount: 15, walkinCount: 32, ncCount: 14, ecCount: 4, trend: 8.4,
  },
  Month: {
    label: 'This Month',   total: 84200,  online: 16200, emergency: 9000, walkin: 4800,  normalConsult: 42000, emergConsult: 14400,
    normalCount: 231, emergCount: 64, walkinCount: 138, ncCount: 60, ecCount: 21, trend: 12.1,
  },
  LastMonth: {
    label: 'Last Month',   total: 74800,  online: 14400, emergency: 7200, walkin: 3900,  normalConsult: 37800, emergConsult: 11500,
    normalCount: 206, emergCount: 51, walkinCount: 112, ncCount: 54, ecCount: 17, trend: -3.2,
  },
  AllTime: {
    label: 'All Time',     total: 748500, online: 134500,emergency: 72000,walkin: 38000, normalConsult: 387000,emergConsult: 117000,
    normalCount: 1920, emergCount: 514, walkinCount: 1085, ncCount: 552, ecCount: 167, trend: 0,
  },
};

/* ── PAYOUTS ── */
const PAYOUTS = [
  { id: 'P2026041', date: 'Today, 10 Apr',     amount: 8400,  status: 'processing', utr: null,          note: 'Processing – expected by midnight' },
  { id: 'P2026040', date: 'Tue, 8 Apr',        amount: 12400, status: 'paid',       utr: 'HDFC82631047', note: 'Transferred to HDFC ••4782' },
  { id: 'P2026039', date: 'Tue, 1 Apr',        amount: 18750, status: 'paid',       utr: 'ICIC74920163', note: 'Transferred to HDFC ••4782' },
  { id: 'P2026038', date: 'Tue, 25 Mar',       amount: 9850,  status: 'paid',       utr: 'HDFC61830294', note: 'Transferred to HDFC ••4782' },
  { id: 'P2026037', date: 'Tue, 18 Mar',       amount: 15200, status: 'paid',       utr: 'HDFC50192837', note: 'Transferred to HDFC ••4782' },
  { id: 'P2026036', date: 'Tue, 11 Mar',       amount: 22100, status: 'paid',       utr: 'ICIC38472910', note: 'Transferred to HDFC ••4782' },
  { id: 'P2026035', date: 'Tue, 4 Mar',        amount: 20200, status: 'paid',       utr: 'HDFC29103847', note: 'Transferred to HDFC ••4782' },
  { id: 'P2026034', date: 'Tue, 25 Feb',       amount: 13400, status: 'paid',       utr: 'HDFC18293047', note: 'Transferred to HDFC ••4782' },
];
const PENDING_AMOUNT = 17950;
const PROCESSING_AMOUNT = 8400;
const TOTAL_PAID = PAYOUTS.filter(p => p.status === 'paid').reduce((a, p) => a + p.amount, 0);
const AVAILABLE = PENDING_AMOUNT; // settled but not yet requested

/* ── SPARKLINE ── */
function Mini({ data, color }: { data: number[]; color: string }) {
  const w = 60, h = 22;
  const mn = Math.min(...data), mx = Math.max(...data);
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - mn) / (mx - mn + 0.001)) * h;
    return `${x},${y}`;
  }).join(' ');
  const area = `M0,${h} L${pts.split(' ').join(' L')} L${w},${h} Z`;
  return (
    <svg width={w} height={h}>
      <defs>
        <linearGradient id={`sg${color.replace('#','')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.35} />
          <stop offset="100%" stopColor={color} stopOpacity={0.02} />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#sg${color.replace('#','')})`} />
      <polyline points={pts} fill="none" stroke={color} strokeWidth={1.5} strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

/* ═══════════════════════════════════════
   MAIN
═══════════════════════════════════════ */
export function Earnings() {
  const [tab,    setTab]    = useState<'earnings' | 'payouts'>('earnings');
  const [period, setPeriod] = useState<Period>('Month');
  const [expand, setExpand] = useState<string | null>(null);

  const d = PERIOD_DATA[period];
  const rows = [
    { label: 'Online Normal Token',         value: d.online,        count: d.normalCount,  icon: Smartphone, color: '#A5B4FC', bg: 'rgba(99,102,241,0.15)',  rate: '₹10/token'  },
    { label: 'Online Emergency Token',      value: d.emergency,     count: d.emergCount,   icon: Zap,        color: '#FCD34D', bg: 'rgba(245,158,11,0.15)',  rate: '₹20/token'  },
    { label: 'Walk-in Token',               value: d.walkin,        count: d.walkinCount,  icon: Footprints, color: '#67E8F9', bg: 'rgba(6,182,212,0.15)',   rate: '₹5/token'   },
    { label: 'In-Clinic Normal Consult',    value: d.normalConsult, count: d.ncCount,      icon: Stethoscope,color: '#4ADE80', bg: 'rgba(34,197,94,0.12)',   rate: '₹500/visit' },
    { label: 'In-Clinic Emergency Consult', value: d.emergConsult,  count: d.ecCount,      icon: Zap,        color: '#F87171', bg: 'rgba(239,68,68,0.12)',   rate: '₹700/visit' },
  ];

  const weekSpark = [14200, 16800, 13400, 19600, 17200, 22100, 19600];

  return (
    <div style={{ width: 390, height: 844, background: BG, fontFamily: "'Inter', sans-serif",
      display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>

      {/* Glow orbs */}
      <div style={{ position: 'absolute', top: -80, left: -40, width: 260, height: 260, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(13,148,136,0.2) 0%, transparent 65%)', filter: 'blur(44px)', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'absolute', top: 360, right: -60, width: 200, height: 200, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)', filter: 'blur(36px)', pointerEvents: 'none', zIndex: 0 }} />

      {/* STATUS BAR */}
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

      {/* HEADER */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 18px 8px', flexShrink: 0, zIndex: 10, position: 'relative' }}>
        <div>
          <div style={{ fontSize: 19, fontWeight: 900, color: '#FFF', letterSpacing: '-0.4px' }}>My Earnings</div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', fontWeight: 600, marginTop: 1 }}>Dr. Ananya Sharma · LINESETU</div>
        </div>
        <div style={{ display: 'flex', gap: 7 }}>
          <button style={{ width: 36, height: 36, borderRadius: 12, ...GLASS, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer' }}>
            <Download style={{ width: 15, height: 15, color: 'rgba(255,255,255,0.55)' }} />
          </button>
          <div style={{ position: 'relative' }}>
            <button style={{ width: 36, height: 36, borderRadius: 12, ...GLASS, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer' }}>
              <Bell style={{ width: 15, height: 15, color: 'rgba(255,255,255,0.55)' }} />
            </button>
            <div style={{ position: 'absolute', top: 7, right: 8, width: 7, height: 7, borderRadius: '50%', background: '#EF4444', border: '1.5px solid #070B14' }} />
          </div>
        </div>
      </div>

      {/* ── BALANCE HERO CARD ── */}
      <div style={{ padding: '0 14px', flexShrink: 0, zIndex: 10, position: 'relative' }}>
        <div style={{ borderRadius: 22, padding: '16px 18px 14px',
          background: 'linear-gradient(140deg, rgba(13,148,136,0.28) 0%, rgba(6,182,212,0.16) 50%, rgba(99,102,241,0.12) 100%)',
          border: '1.5px solid rgba(45,212,191,0.25)', boxShadow: '0 8px 36px rgba(13,148,136,0.2)' }}>

          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.4)', marginBottom: 4 }}>Available Balance</div>
              <div style={{ fontSize: 34, fontWeight: 900, color: '#FFF', letterSpacing: '-1.5px', lineHeight: 1 }}>
                {fmtFull(AVAILABLE)}
              </div>
              <div style={{ fontSize: 10, color: '#4ADE80', fontWeight: 700, marginTop: 5, display: 'flex', alignItems: 'center', gap: 4 }}>
                <BadgeCheck style={{ width: 11, height: 11 }} /> Ready for payout · Settles every Tuesday
              </div>
            </div>
            <button style={{ padding: '8px 14px', borderRadius: 14, border: 'none', cursor: 'pointer',
              background: 'linear-gradient(135deg,#2DD4BF,#0D9488)',
              boxShadow: '0 4px 16px rgba(13,148,136,0.45)',
              fontSize: 11, fontWeight: 800, color: '#FFF', display: 'flex', alignItems: 'center', gap: 5 }}>
              <Wallet style={{ width: 13, height: 13 }} /> Withdraw
            </button>
          </div>

          {/* 3-stat strip */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1px 1fr 1px 1fr' }}>
            {[
              { label: 'Paid Out',    value: fmtFull(TOTAL_PAID),    color: '#4ADE80',  sub: `${PAYOUTS.filter(p=>p.status==='paid').length} payouts` },
              { label: 'Processing',  value: fmtFull(PROCESSING_AMOUNT), color: '#67E8F9',  sub: 'By midnight today' },
              { label: 'Pending',     value: fmtFull(PENDING_AMOUNT), color: '#FCD34D',  sub: 'Next settlement' },
            ].map((s, i) => (
              <React.Fragment key={i}>
                {i > 0 && <div style={{ background: 'rgba(255,255,255,0.1)', margin: '2px 0' }} />}
                <div style={{ textAlign: 'center', padding: '4px 6px' }}>
                  <div style={{ fontSize: 13, fontWeight: 900, color: s.color }}>{s.value}</div>
                  <div style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>{s.label}</div>
                  <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.3)', fontWeight: 500, marginTop: 1 }}>{s.sub}</div>
                </div>
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* ── MAIN TABS ── */}
      <div style={{ padding: '10px 14px 6px', flexShrink: 0, zIndex: 10, position: 'relative' }}>
        <div style={{ display: 'flex', padding: 4, borderRadius: 14, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
          {([['earnings','Earnings'] , ['payouts','Payouts']] as const).map(([k, l]) => (
            <button key={k} onClick={() => setTab(k)}
              style={{ flex: 1, height: 32, borderRadius: 10, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 800,
                background: tab === k ? `linear-gradient(135deg,${TEAL},#0891B2)` : 'transparent',
                color: tab === k ? '#FFF' : 'rgba(255,255,255,0.4)',
                boxShadow: tab === k ? '0 2px 10px rgba(13,148,136,0.35)' : 'none' }}>{l}</button>
          ))}
        </div>
      </div>

      {/* ── SCROLL BODY ── */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 14px 90px', zIndex: 10, position: 'relative' }}>

        {/* ══════════ EARNINGS TAB ══════════ */}
        {tab === 'earnings' && (
          <>
            {/* Period selector */}
            <div style={{ display: 'flex', gap: 5, marginBottom: 12, overflowX: 'auto', paddingBottom: 2 }}>
              {(['Week','Month','LastMonth','AllTime'] as Period[]).map(p => (
                <button key={p} onClick={() => setPeriod(p)}
                  style={{ flexShrink: 0, padding: '5px 12px', borderRadius: 20, border: 'none', cursor: 'pointer', fontSize: 10, fontWeight: 800,
                    background: period === p ? TEAL : 'rgba(255,255,255,0.06)',
                    color: period === p ? '#FFF' : 'rgba(255,255,255,0.4)',
                    boxShadow: period === p ? '0 2px 10px rgba(13,148,136,0.4)' : 'none' }}>
                  {PERIOD_DATA[p].label}
                </button>
              ))}
            </div>

            {/* Total + trend */}
            <div style={{ borderRadius: 20, padding: '14px 16px', marginBottom: 10, ...GLASS }}>
              <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 12 }}>
                <div>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', fontWeight: 600, marginBottom: 3 }}>Total — {PERIOD_DATA[period].label}</div>
                  <div style={{ fontSize: 28, fontWeight: 900, color: '#FFF', letterSpacing: '-1px', lineHeight: 1 }}>{fmtFull(d.total)}</div>
                  {period !== 'AllTime' && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 5 }}>
                      {d.trend >= 0
                        ? <ArrowUpRight style={{ width: 11, height: 11, color: '#4ADE80' }} />
                        : <TrendingDown style={{ width: 11, height: 11, color: '#F87171' }} />}
                      <span style={{ fontSize: 11, fontWeight: 700, color: d.trend >= 0 ? '#4ADE80' : '#F87171' }}>
                        {d.trend >= 0 ? '+' : ''}{d.trend}% vs previous
                      </span>
                    </div>
                  )}
                </div>
                <Mini data={weekSpark} color={TEAL_LT} />
              </div>

              {/* Token count chips */}
              <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                {[
                  { label: `${d.normalCount} Normal`,   color: '#A5B4FC' },
                  { label: `${d.emergCount} Emergency`, color: '#FCD34D' },
                  { label: `${d.walkinCount} Walk-in`,  color: '#67E8F9' },
                  { label: `${d.ncCount} N-Consult`,    color: '#4ADE80' },
                  { label: `${d.ecCount} E-Consult`,    color: '#F87171' },
                ].map(c => (
                  <div key={c.label} style={{ padding: '4px 9px', borderRadius: 20, fontSize: 9, fontWeight: 700, color: c.color,
                    background: `${c.color}18`, border: `1px solid ${c.color}33` }}>
                    {c.label}
                  </div>
                ))}
              </div>
            </div>

            {/* Breakdown rows */}
            <div style={{ borderRadius: 20, padding: '14px 14px 10px', marginBottom: 10, ...GLASS }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                <BarChart2 style={{ width: 13, height: 13, color: TEAL_LT }} />
                <span style={{ fontSize: 12, fontWeight: 800, color: '#FFF' }}>Earnings Breakdown</span>
              </div>
              {rows.map(row => {
                const Icon = row.icon;
                const pct  = Math.round((row.value / d.total) * 100);
                return (
                  <div key={row.label} style={{ paddingBottom: 11, borderBottom: '1px solid rgba(255,255,255,0.05)', marginBottom: 11 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 7 }}>
                      <div style={{ width: 30, height: 30, borderRadius: 10, background: row.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Icon style={{ width: 13, height: 13, color: row.color, strokeWidth: 1.8 }} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                          <span style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.7)' }}>{row.label}</span>
                          <span style={{ fontSize: 13, fontWeight: 900, color: '#FFF' }}>{fmt(row.value)}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 2 }}>
                          <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', fontWeight: 600 }}>{row.count} × {row.rate}</span>
                          <span style={{ fontSize: 9, color: row.color, fontWeight: 700 }}>{pct}%</span>
                        </div>
                      </div>
                    </div>
                    <div style={{ height: 4, borderRadius: 4, background: 'rgba(255,255,255,0.06)' }}>
                      <div style={{ height: '100%', borderRadius: 4, width: `${pct}%`, background: `linear-gradient(90deg,${row.color}bb,${row.color})`, transition: 'width 0.5s ease', boxShadow: `0 0 8px ${row.color}55` }} />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Fee structure reference */}
            <div style={{ borderRadius: 20, padding: '12px 14px', ...GLASS }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                <Shield style={{ width: 13, height: 13, color: TEAL_LT }} />
                <span style={{ fontSize: 12, fontWeight: 800, color: '#FFF' }}>Your Rate Card</span>
                <span style={{ marginLeft: 'auto', fontSize: 9, fontWeight: 600, color: 'rgba(255,255,255,0.3)' }}>Platform-set</span>
              </div>
              {[
                { type: 'Online Normal Token',  earn: '₹10',  platform: '₹10', patient: '₹20' },
                { type: 'Online Emergency Token',earn: '₹20', platform: '₹10', patient: '₹30' },
                { type: 'Walk-in Token',         earn: '₹5',  platform: '₹0',  patient: 'Free' },
                { type: 'Normal Consult',        earn: '₹500',platform: '—',   patient: '₹500' },
                { type: 'Emergency Consult',     earn: '₹700',platform: '—',   patient: '₹700' },
              ].map(r => (
                <div key={r.type} style={{ display: 'flex', alignItems: 'center', padding: '7px 0', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                  <span style={{ flex: 1, fontSize: 10, color: 'rgba(255,255,255,0.55)', fontWeight: 600 }}>{r.type}</span>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 11, fontWeight: 800, color: '#4ADE80' }}>{r.earn}</div>
                      <div style={{ fontSize: 7, color: 'rgba(255,255,255,0.25)', fontWeight: 600 }}>You earn</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 11, fontWeight: 800, color: '#F87171' }}>{r.platform}</div>
                      <div style={{ fontSize: 7, color: 'rgba(255,255,255,0.25)', fontWeight: 600 }}>Platform</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 11, fontWeight: 800, color: 'rgba(255,255,255,0.6)' }}>{r.patient}</div>
                      <div style={{ fontSize: 7, color: 'rgba(255,255,255,0.25)', fontWeight: 600 }}>Patient</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* ══════════ PAYOUTS TAB ══════════ */}
        {tab === 'payouts' && (
          <>
            {/* Payout status summary */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginBottom: 12 }}>
              {[
                { label: 'Total Paid',   value: fmtFull(TOTAL_PAID),        color: '#4ADE80', bg: 'rgba(74,222,128,0.1)',  border: 'rgba(74,222,128,0.2)',  icon: CheckCircle2 },
                { label: 'Processing',   value: fmtFull(PROCESSING_AMOUNT),  color: '#67E8F9', bg: 'rgba(103,232,249,0.08)',border: 'rgba(103,232,249,0.18)', icon: RefreshCw    },
                { label: 'Upcoming',     value: fmtFull(PENDING_AMOUNT),     color: '#FCD34D', bg: 'rgba(252,211,77,0.08)', border: 'rgba(252,211,77,0.2)',  icon: Clock        },
              ].map(s => {
                const Icon = s.icon;
                return (
                  <div key={s.label} style={{ borderRadius: 16, padding: '12px 10px', background: s.bg, border: `1.5px solid ${s.border}`, textAlign: 'center' }}>
                    <Icon style={{ width: 16, height: 16, color: s.color, marginBottom: 6 }} />
                    <div style={{ fontSize: 13, fontWeight: 900, color: s.color, letterSpacing: '-0.5px' }}>{s.value}</div>
                    <div style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.4)', marginTop: 3 }}>{s.label}</div>
                  </div>
                );
              })}
            </div>

            {/* Bank account info */}
            <div style={{ borderRadius: 16, padding: '11px 14px', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 10,
              background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ width: 36, height: 36, borderRadius: 12, background: 'rgba(13,148,136,0.2)', border: '1.5px solid rgba(13,148,136,0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Wallet style={{ width: 16, height: 16, color: TEAL_LT }} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#FFF' }}>HDFC Bank ••••4782</div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', fontWeight: 600, marginTop: 1 }}>Weekly auto-settlement · Every Tuesday</div>
              </div>
              <div style={{ padding: '4px 10px', borderRadius: 20, background: 'rgba(74,222,128,0.12)', border: '1px solid rgba(74,222,128,0.3)', fontSize: 9, fontWeight: 800, color: '#4ADE80' }}>Verified</div>
            </div>

            {/* Settlement cycle info */}
            <div style={{ borderRadius: 14, padding: '9px 12px', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8,
              background: 'rgba(252,211,77,0.06)', border: '1px solid rgba(252,211,77,0.15)' }}>
              <Info style={{ width: 13, height: 13, color: '#FCD34D', flexShrink: 0 }} />
              <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', fontWeight: 600, lineHeight: 1.4 }}>
                Next settlement: <span style={{ color: '#FCD34D' }}>Tue, 15 Apr 2026</span> · Expected payout {fmtFull(PENDING_AMOUNT + PROCESSING_AMOUNT)}
              </span>
            </div>

            {/* Payout list */}
            <div style={{ borderRadius: 20, padding: '14px 14px 8px', ...GLASS }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                <Activity style={{ width: 13, height: 13, color: TEAL_LT }} />
                <span style={{ fontSize: 12, fontWeight: 800, color: '#FFF' }}>Payout History</span>
                <span style={{ marginLeft: 'auto', fontSize: 9, fontWeight: 600, color: 'rgba(255,255,255,0.3)' }}>by LINESETU Admin</span>
              </div>

              {PAYOUTS.map(p => {
                const isExpanded = expand === p.id;
                const statusColor = p.status === 'paid' ? '#4ADE80' : p.status === 'processing' ? '#67E8F9' : '#FCD34D';
                const StatusIcon  = p.status === 'paid' ? CheckCircle2 : p.status === 'processing' ? RefreshCw : Clock;
                const statusLabel = p.status === 'paid' ? 'Transferred' : p.status === 'processing' ? 'Processing' : 'Pending';
                return (
                  <div key={p.id}>
                    <div onClick={() => setExpand(isExpanded ? null : p.id)}
                      style={{ display: 'flex', alignItems: 'center', gap: 10, paddingBottom: 11, marginBottom: 11,
                        borderBottom: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer' }}>
                      {/* Status dot */}
                      <div style={{ width: 34, height: 34, borderRadius: 12, background: `${statusColor}18`, border: `1.5px solid ${statusColor}44`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <StatusIcon style={{ width: 14, height: 14, color: statusColor }} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div>
                            <div style={{ fontSize: 12, fontWeight: 700, color: '#FFF' }}>{fmtFull(p.amount)}</div>
                            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', fontWeight: 600, marginTop: 2 }}>{p.date}</div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                            <div style={{ padding: '3px 8px', borderRadius: 20, background: `${statusColor}18`, border: `1px solid ${statusColor}33`,
                              fontSize: 9, fontWeight: 800, color: statusColor }}>{statusLabel}</div>
                            <ChevronRight style={{ width: 13, height: 13, color: 'rgba(255,255,255,0.25)',
                              transform: isExpanded ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }} />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Expanded detail */}
                    {isExpanded && (
                      <div style={{ marginTop: -8, marginBottom: 12, padding: '10px 12px', borderRadius: 12,
                        background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                          <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', fontWeight: 600 }}>Payout ID</span>
                          <span style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.7)', fontFamily: 'monospace' }}>{p.id}</span>
                        </div>
                        {p.utr && (
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                            <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', fontWeight: 600 }}>UTR Number</span>
                            <span style={{ fontSize: 10, fontWeight: 700, color: TEAL_LT, fontFamily: 'monospace' }}>{p.utr}</span>
                          </div>
                        )}
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', fontWeight: 600 }}>Status</span>
                          <span style={{ fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.6)' }}>{p.note}</span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Lifetime total */}
              <div style={{ padding: '10px 12px', borderRadius: 14, background: 'rgba(13,148,136,0.08)', border: '1px solid rgba(13,148,136,0.2)', marginTop: 2 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', fontWeight: 700 }}>Lifetime Total Received</span>
                  <span style={{ fontSize: 16, fontWeight: 900, color: TEAL_LT }}>{fmtFull(TOTAL_PAID)}</span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      <DocNavBar active="earnings" />
    </div>
  );
}
