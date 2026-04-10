import React, { useState } from 'react';
import {
  ChevronLeft, ChevronRight, Sun, Moon, Building2,
  Users, CheckCircle2, XCircle, Calendar, Stethoscope,
  Bell, Copy, Save, AlertCircle, Clock, StickyNote,
  House, CalendarClock, TrendingUp, SlidersHorizontal, UserPlus,
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
const MORNING_C = '#FCD34D';
const EVENING_C = '#A5B4FC';
const BOTH_C    = TEAL_LT;

/* ── CLINICS ── */
const CLINICS = [
  { name: 'Sharma Heart Clinic', short: 'Sharma HC', color: '#0D9488' },
  { name: 'City Cardiac Centre',  short: 'City CC',   color: '#7C3AED' },
  { name: 'Juhu Med Center',      short: 'Juhu MC',   color: '#0891B2' },
];

/* ── TYPES ── */
type ShiftType = 'morning' | 'evening' | 'both';
interface DayData {
  present: boolean;
  shift?: ShiftType;
  clinicIdx?: number;
  morningMax?: number;
  eveningMax?: number;
  note?: string;
}

/* ── HELPERS ── */
const START = new Date(2026, 3, 10); // Apr 10 2026
function makeKey(d: Date) { return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; }
function addDays(d: Date, n: number) { const r = new Date(d); r.setDate(r.getDate() + n); return r; }
function sameMonth(d: Date, y: number, m: number) { return d.getFullYear() === y && d.getMonth() === m; }
const DAY_LABELS = ['S','M','T','W','T','F','S'];
const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];

/* ── INITIAL DATA ── */
function buildInitial(): Record<string, DayData> {
  const out: Record<string, DayData> = {};
  for (let i = 0; i < 30; i++) {
    const d = addDays(START, i);
    const k = makeKey(d);
    const dow = d.getDay();
    if (dow === 0) {
      out[k] = { present: false };
    } else if (dow === 6) {
      out[k] = { present: true, shift: 'morning', clinicIdx: 0, morningMax: 20, eveningMax: 0, note: '' };
    } else {
      out[k] = { present: true, shift: 'both', clinicIdx: i % 2, morningMax: 30, eveningMax: 25, note: '' };
    }
  }
  return out;
}

/* ── STEPPER ── */
function Stepper({ value, onChange, min = 5, max = 60, step = 5 }: { value: number; onChange: (v: number) => void; min?: number; max?: number; step?: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <button onClick={() => onChange(Math.max(min, value - step))}
        style={{ width: 28, height: 28, borderRadius: 9, border: '1.5px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.06)',
          color: '#FFF', fontSize: 16, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
      <span style={{ fontSize: 18, fontWeight: 900, color: '#FFF', minWidth: 32, textAlign: 'center' }}>{value}</span>
      <button onClick={() => onChange(Math.min(max, value + step))}
        style={{ width: 28, height: 28, borderRadius: 9, border: '1.5px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.06)',
          color: '#FFF', fontSize: 16, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
    </div>
  );
}

/* ── NAV BAR ── */
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

/* ══════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════ */
export function Schedule() {
  const [schedule, setSchedule] = useState<Record<string, DayData>>(buildInitial);
  const [selectedKey, setSelectedKey] = useState<string>(makeKey(START));
  const [viewYear, setViewYear]   = useState(2026);
  const [viewMonth, setViewMonth] = useState(3); // 0-indexed: 3 = April
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  /* key helpers */
  const END_KEY   = makeKey(addDays(START, 29));
  const START_KEY = makeKey(START);
  const inRange   = (k: string) => k >= START_KEY && k <= END_KEY;

  /* navigate months */
  function prevMonth() {
    if (viewMonth === 0) { setViewYear(y => y-1); setViewMonth(11); }
    else setViewMonth(m => m-1);
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewYear(y => y+1); setViewMonth(0); }
    else setViewMonth(m => m+1);
  }

  /* build calendar grid */
  const firstDay = new Date(viewYear, viewMonth, 1);
  const startPad = firstDay.getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const cells: (Date | null)[] = [
    ...Array(startPad).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => new Date(viewYear, viewMonth, i + 1)),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  /* selected day data */
  const sel   = schedule[selectedKey] ?? { present: false };
  const selDate = new Date(selectedKey + 'T00:00:00');
  const dayName = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][selDate.getDay()];
  const selInRange = inRange(selectedKey);

  /* update helpers */
  function update(patch: Partial<DayData>) {
    setSchedule(s => ({ ...s, [selectedKey]: { ...s[selectedKey], ...patch } }));
    setSaved(false);
  }

  /* copy to all same-weekday remaining dates */
  function copyToSimilar() {
    const dow = selDate.getDay();
    setSchedule(s => {
      const next = { ...s };
      for (let i = 0; i < 30; i++) {
        const d = addDays(START, i);
        if (d.getDay() === dow) {
          const k = makeKey(d);
          if (k !== selectedKey) next[k] = { ...sel };
        }
      }
      return next;
    });
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  /* save */
  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  /* stats */
  const stats = (() => {
    let working = 0, morning = 0, evening = 0, both = 0, off = 0;
    for (let i = 0; i < 30; i++) {
      const k = makeKey(addDays(START, i));
      const d = schedule[k];
      if (!d || !d.present) { off++; continue; }
      working++;
      if (d.shift === 'morning') morning++;
      else if (d.shift === 'evening') evening++;
      else both++;
    }
    return { working, morning, evening, both, off };
  })();

  /* dot indicator for a day */
  function getDotColor(k: string): string | null {
    if (!inRange(k)) return null;
    const d = schedule[k];
    if (!d || !d.present) return '#374151';
    if (d.shift === 'morning') return MORNING_C;
    if (d.shift === 'evening') return EVENING_C;
    return BOTH_C;
  }

  /* shift label helper */
  function shiftLabel(s?: ShiftType) {
    if (s === 'morning') return 'Morning Only';
    if (s === 'evening') return 'Evening Only';
    if (s === 'both') return 'Both Shifts';
    return '';
  }

  const clinic = CLINICS[sel.clinicIdx ?? 0];

  return (
    <div style={{ width: 390, height: 844, background: BG, fontFamily: "'Inter', sans-serif",
      display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>

      {/* Glow orbs */}
      <div style={{ position: 'absolute', top: -60, left: -40, width: 240, height: 240, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(13,148,136,0.2) 0%, transparent 65%)', filter: 'blur(44px)', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'absolute', top: 400, right: -60, width: 200, height: 200, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(124,58,237,0.12) 0%, transparent 70%)', filter: 'blur(36px)', pointerEvents: 'none', zIndex: 0 }} />

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

      {/* ── HEADER ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 18px 8px', flexShrink: 0, zIndex: 10, position: 'relative' }}>
        <div>
          <div style={{ fontSize: 19, fontWeight: 900, color: '#FFF', letterSpacing: '-0.4px' }}>
            My Schedule
          </div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', fontWeight: 600, marginTop: 1 }}>
            Next 30 days — Apr 10 to May 9, 2026
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: MORNING_C }} />
            <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>Morn</span>
          </div>
          <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: EVENING_C }} />
            <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>Eve</span>
          </div>
          <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: BOTH_C }} />
            <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>Both</span>
          </div>
        </div>
      </div>

      {/* ── SCROLLABLE BODY ── */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 14px 90px', position: 'relative', zIndex: 10 }}>

        {/* ── CALENDAR CARD ── */}
        <div style={{ borderRadius: 20, padding: '12px 10px 10px', marginBottom: 10, ...GLASS }}>
          {/* Month nav */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, padding: '0 2px' }}>
            <button onClick={prevMonth} style={{ width: 30, height: 30, borderRadius: 10, border: 'none', background: 'rgba(255,255,255,0.07)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ChevronLeft style={{ width: 16, height: 16, color: 'rgba(255,255,255,0.6)' }} />
            </button>
            <span style={{ fontSize: 14, fontWeight: 800, color: '#FFF' }}>{MONTH_NAMES[viewMonth]} {viewYear}</span>
            <button onClick={nextMonth} style={{ width: 30, height: 30, borderRadius: 10, border: 'none', background: 'rgba(255,255,255,0.07)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ChevronRight style={{ width: 16, height: 16, color: 'rgba(255,255,255,0.6)' }} />
            </button>
          </div>

          {/* Day-of-week headers */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: 4 }}>
            {DAY_LABELS.map((l, i) => (
              <div key={i} style={{ textAlign: 'center', fontSize: 10, fontWeight: 700,
                color: i === 0 ? '#F87171' : 'rgba(255,255,255,0.3)', paddingBottom: 4 }}>{l}</div>
            ))}
          </div>

          {/* Calendar cells */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '3px 2px' }}>
            {cells.map((cell, idx) => {
              if (!cell) return <div key={idx} />;
              const k = makeKey(cell);
              const dot = getDotColor(k);
              const isSelected = k === selectedKey;
              const isInRange  = inRange(k);
              const isToday    = k === makeKey(START);
              const dayData    = schedule[k];
              const absent     = !dayData?.present;
              const isSunday   = cell.getDay() === 0;

              return (
                <button key={idx}
                  onClick={() => isInRange && setSelectedKey(k)}
                  style={{
                    padding: '5px 0 4px', borderRadius: 10, border: 'none',
                    cursor: isInRange ? 'pointer' : 'default',
                    background: isSelected ? 'rgba(13,148,136,0.22)' : 'transparent',
                    outline: isSelected ? `1.5px solid ${TEAL}` : 'none',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
                    opacity: !isInRange ? 0.22 : 1,
                    position: 'relative',
                  }}>
                  {isToday && (
                    <div style={{ position: 'absolute', top: 1, right: 2, width: 5, height: 5, borderRadius: '50%', background: '#F87171' }} />
                  )}
                  <span style={{
                    fontSize: 12, fontWeight: isSelected ? 900 : 700,
                    color: isSelected ? TEAL_LT : isSunday ? '#F87171' : absent && isInRange ? 'rgba(255,255,255,0.3)' : '#FFF',
                  }}>{cell.getDate()}</span>
                  {dot && (
                    <div style={{ width: absent ? 6 : 6, height: absent ? 6 : 6, borderRadius: '50%',
                      background: absent ? '#374151' : dot,
                      boxShadow: !absent ? `0 0 5px ${dot}88` : 'none',
                    }} />
                  )}
                  {!dot && <div style={{ height: 6 }} />}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── SELECTED DAY DETAIL ── */}
        {selInRange ? (
          <div style={{ borderRadius: 20, padding: '14px 14px 10px', marginBottom: 10, ...GLASS,
            border: `1px solid ${sel.present ? 'rgba(13,148,136,0.3)' : 'rgba(239,68,68,0.2)'}` }}>

            {/* Day header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <div>
                <div style={{ fontSize: 16, fontWeight: 900, color: '#FFF' }}>
                  {dayName}, {selDate.getDate()} {MONTH_NAMES[selDate.getMonth()]}
                </div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', fontWeight: 600, marginTop: 2 }}>
                  {sel.present ? shiftLabel(sel.shift) + ' · ' + (sel.clinicIdx !== undefined ? CLINICS[sel.clinicIdx]?.short : '') : 'Day Off / Leave'}
                </div>
              </div>
              {/* Present / Leave toggle pill */}
              <button onClick={() => update({ present: !sel.present })}
                style={{ padding: '6px 14px', borderRadius: 20, border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 800,
                  background: sel.present ? 'rgba(74,222,128,0.15)' : 'rgba(239,68,68,0.15)',
                  color: sel.present ? '#4ADE80' : '#F87171',
                  border: `1.5px solid ${sel.present ? 'rgba(74,222,128,0.4)' : 'rgba(239,68,68,0.35)'}` as any,
                  display: 'flex', alignItems: 'center', gap: 5 }}>
                {sel.present
                  ? <><CheckCircle2 style={{ width: 12, height: 12 }} /> Working</>
                  : <><XCircle      style={{ width: 12, height: 12 }} /> Leave</>}
              </button>
            </div>

            {sel.present && (
              <>
                {/* ── SHIFT SELECTOR ── */}
                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 7 }}>Shift</div>
                  <div style={{ display: 'flex', gap: 5, padding: 4, borderRadius: 14, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                    {(['morning','both','evening'] as ShiftType[]).map(s => {
                      const active = sel.shift === s;
                      const color  = s === 'morning' ? MORNING_C : s === 'evening' ? EVENING_C : BOTH_C;
                      const icon   = s === 'morning' ? Sun : s === 'evening' ? Moon : Stethoscope;
                      const Icon   = icon;
                      return (
                        <button key={s} onClick={() => update({ shift: s })}
                          style={{ flex: 1, height: 36, borderRadius: 10, border: 'none', cursor: 'pointer',
                            background: active ? `rgba(${s==='morning'?'252,211,77':s==='evening'?'165,180,252':'45,212,191'},0.18)` : 'transparent',
                            outline: active ? `1.5px solid ${color}55` : 'none',
                            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
                          <Icon style={{ width: 11, height: 11, color: active ? color : 'rgba(255,255,255,0.3)' }} />
                          <span style={{ fontSize: 9, fontWeight: 800, color: active ? color : 'rgba(255,255,255,0.3)' }}>
                            {s === 'morning' ? 'Morning' : s === 'evening' ? 'Evening' : 'Both'}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* ── CLINIC SELECTOR ── */}
                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 7 }}>Clinic</div>
                  <div style={{ display: 'flex', gap: 5 }}>
                    {CLINICS.map((c, i) => {
                      const active = sel.clinicIdx === i;
                      return (
                        <button key={i} onClick={() => update({ clinicIdx: i })}
                          style={{ flex: 1, padding: '7px 4px', borderRadius: 12, border: `1.5px solid ${active ? c.color+'99' : 'rgba(255,255,255,0.08)'}`,
                            cursor: 'pointer', background: active ? `${c.color}22` : 'rgba(255,255,255,0.03)',
                            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                          <Building2 style={{ width: 12, height: 12, color: active ? c.color : 'rgba(255,255,255,0.3)' }} />
                          <span style={{ fontSize: 8, fontWeight: 800, color: active ? '#FFF' : 'rgba(255,255,255,0.35)',
                            textAlign: 'center', lineHeight: 1.2 }}>{c.short}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* ── MAX TOKENS ── */}
                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Max Tokens</div>

                  {(sel.shift === 'morning' || sel.shift === 'both') && (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', borderRadius: 12,
                      background: 'rgba(252,211,77,0.07)', border: '1px solid rgba(252,211,77,0.15)', marginBottom: 6 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                        <Sun style={{ width: 13, height: 13, color: MORNING_C }} />
                        <span style={{ fontSize: 12, fontWeight: 700, color: MORNING_C }}>Morning</span>
                      </div>
                      <Stepper value={sel.morningMax ?? 30} onChange={v => update({ morningMax: v })} />
                    </div>
                  )}

                  {(sel.shift === 'evening' || sel.shift === 'both') && (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', borderRadius: 12,
                      background: 'rgba(165,180,252,0.07)', border: '1px solid rgba(165,180,252,0.15)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                        <Moon style={{ width: 13, height: 13, color: EVENING_C }} />
                        <span style={{ fontSize: 12, fontWeight: 700, color: EVENING_C }}>Evening</span>
                      </div>
                      <Stepper value={sel.eveningMax ?? 25} onChange={v => update({ eveningMax: v })} />
                    </div>
                  )}
                </div>

                {/* ── NOTE ── */}
                <div style={{ marginBottom: 10 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Note (optional)</div>
                  <div style={{ position: 'relative' }}>
                    <StickyNote style={{ position: 'absolute', top: 10, left: 10, width: 13, height: 13, color: 'rgba(255,255,255,0.25)' }} />
                    <input
                      value={sel.note ?? ''}
                      onChange={e => update({ note: e.target.value })}
                      placeholder="e.g. Available for emergency calls"
                      style={{ width: '100%', height: 36, paddingLeft: 28, paddingRight: 10, borderRadius: 12, fontSize: 11, fontWeight: 500,
                        background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)',
                        color: '#FFF', outline: 'none', boxSizing: 'border-box' }} />
                  </div>
                </div>
              </>
            )}

            {/* ── ACTIONS ── */}
            <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
              <button onClick={copyToSimilar}
                style={{ flex: 1, height: 38, borderRadius: 12, border: '1.5px solid rgba(255,255,255,0.12)', cursor: 'pointer',
                  background: copied ? 'rgba(74,222,128,0.1)' : 'rgba(255,255,255,0.05)',
                  color: copied ? '#4ADE80' : 'rgba(255,255,255,0.6)', fontSize: 11, fontWeight: 700,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
                <Copy style={{ width: 12, height: 12 }} />
                {copied ? 'Copied!' : `Copy to all ${dayName}s`}
              </button>
              <button onClick={handleSave}
                style={{ flex: 1, height: 38, borderRadius: 12, border: 'none', cursor: 'pointer',
                  background: saved ? 'linear-gradient(135deg,#22C55E,#16A34A)' : `linear-gradient(135deg,${TEAL},#0891B2)`,
                  color: '#FFF', fontSize: 11, fontWeight: 800,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                  boxShadow: saved ? '0 4px 14px rgba(34,197,94,0.4)' : '0 4px 14px rgba(13,148,136,0.35)' }}>
                {saved ? <><CheckCircle2 style={{ width: 13, height: 13 }} /> Saved!</> : <><Save style={{ width: 13, height: 13 }} /> Save Day</>}
              </button>
            </div>
          </div>
        ) : (
          <div style={{ borderRadius: 20, padding: 20, ...GLASS, textAlign: 'center' }}>
            <AlertCircle style={{ width: 24, height: 24, color: 'rgba(255,255,255,0.2)', margin: '0 auto 8px' }} />
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', fontWeight: 600 }}>Select a date in the highlighted range (Apr 10 – May 9)</p>
          </div>
        )}

        {/* ── 30-DAY STATS ── */}
        <div style={{ borderRadius: 20, padding: '14px 14px 12px', ...GLASS }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
            <Calendar style={{ width: 14, height: 14, color: TEAL_LT }} />
            <span style={{ fontSize: 12, fontWeight: 800, color: '#FFF' }}>30-Day Summary</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 6 }}>
            {[
              { label: 'Working', value: stats.working, color: '#4ADE80' },
              { label: 'Morning', value: stats.morning, color: MORNING_C },
              { label: 'Evening', value: stats.evening, color: EVENING_C },
              { label: 'Both',    value: stats.both,    color: BOTH_C    },
              { label: 'Off',     value: stats.off,     color: '#F87171' },
            ].map(s => (
              <div key={s.label} style={{ borderRadius: 12, padding: '8px 4px', background: 'rgba(255,255,255,0.04)',
                border: `1px solid ${s.color}33`, textAlign: 'center' }}>
                <div style={{ fontSize: 18, fontWeight: 900, color: s.color }}>{s.value}</div>
                <div style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.35)', marginTop: 2 }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Upcoming week strip */}
          <div style={{ marginTop: 12 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Next 7 Days</div>
            <div style={{ display: 'flex', gap: 4 }}>
              {Array.from({ length: 7 }, (_, i) => {
                const d = addDays(START, i);
                const k = makeKey(d);
                const dd = schedule[k];
                const dot = dd?.present ? (dd.shift === 'morning' ? MORNING_C : dd.shift === 'evening' ? EVENING_C : BOTH_C) : '#374151';
                const isSel = k === selectedKey;
                return (
                  <button key={i} onClick={() => setSelectedKey(k)}
                    style={{ flex: 1, padding: '7px 2px', borderRadius: 10, border: 'none', cursor: 'pointer',
                      background: isSel ? 'rgba(13,148,136,0.2)' : 'rgba(255,255,255,0.04)',
                      outline: isSel ? `1.5px solid ${TEAL}` : 'none',
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                    <span style={{ fontSize: 8, fontWeight: 700, color: 'rgba(255,255,255,0.4)' }}>
                      {['Su','Mo','Tu','We','Th','Fr','Sa'][d.getDay()]}
                    </span>
                    <span style={{ fontSize: 12, fontWeight: 900, color: isSel ? TEAL_LT : '#FFF' }}>{d.getDate()}</span>
                    <div style={{ width: 5, height: 5, borderRadius: '50%', background: dot, boxShadow: dd?.present ? `0 0 4px ${dot}99` : 'none' }} />
                    <span style={{ fontSize: 7, fontWeight: 700, color: 'rgba(255,255,255,0.3)', lineHeight: 1.1, textAlign: 'center' }}>
                      {dd?.present ? (dd.shift === 'both' ? 'M+E' : dd.shift === 'morning' ? 'Morn' : 'Eve') : 'Off'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

      </div>

      {/* ── NAV BAR ── */}
      <DocNavBar active="queue" />
    </div>
  );
}
