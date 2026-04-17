import React, { useState, useEffect, useRef } from 'react';
import {
  ChevronLeft, Bell, Clock, Users, MapPin,
  CheckCircle2, AlertTriangle, Zap, Activity,
  Building2, RefreshCw, Siren, ArrowRight,
  ShieldCheck, Sunrise,
} from 'lucide-react';

const BG = '#0A0E1A';
const GLASS: React.CSSProperties = {
  background: 'rgba(255,255,255,0.05)',
  backdropFilter: 'blur(16px)',
  WebkitBackdropFilter: 'blur(16px)',
  border: '1px solid rgba(255,255,255,0.08)',
};

const USER_TOKEN  = 56;
const TOTAL       = 72;   // max tokens this shift
const START_TOKEN = 44;   // simulation starts here (ahead=11)
const AVG_MIN     = 2.5;  // minutes per patient

/* ── Pulsing ring CSS ── */
const KEYFRAMES = `
@keyframes ping  { 0%{transform:scale(1);opacity:.6} 80%,100%{transform:scale(1.9);opacity:0} }
@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.55} }
@keyframes spin  { to{transform:rotate(360deg)} }
@keyframes blink { 0%,100%{opacity:1} 50%{opacity:.3} }
@keyframes slideUp { from{transform:translateY(12px);opacity:0} to{transform:translateY(0);opacity:1} }
`;

function useTicker(ms: number) {
  const [n, setN] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setN(v => v + 1), ms);
    return () => clearInterval(id);
  }, [ms]);
  return n;
}

export function LiveQueue() {
  const tick4s  = useTicker(4000);
  const tick1s  = useTicker(1000);
  const [current, setCurrent] = useState(START_TOKEN);
  const prevRef = useRef(START_TOKEN);

  /* Advance current token every 4 s (stops at user's token) */
  useEffect(() => {
    setCurrent(c => {
      const next = c < USER_TOKEN ? c + 1 : c;
      prevRef.current = c;
      return next;
    });
  }, [tick4s]);

  const ahead     = Math.max(0, USER_TOKEN - current - 1);
  const waitMin   = Math.round(ahead * AVG_MIN);
  const isDone    = current >= USER_TOKEN;
  const isNear    = !isDone && ahead <= 3;
  const isNext    = !isDone && ahead === 0;
  const progPct   = Math.min(100, Math.round((current / TOTAL) * 100));
  const userPct   = Math.min(100, Math.round((USER_TOKEN / TOTAL) * 100));
  const tokenChanged = current !== prevRef.current;

  /* Status derivations */
  const status     = isDone ? 'done' : isNext ? 'next' : isNear ? 'near' : 'waiting';
  const statusCfg  = {
    waiting: { label: 'Waiting',     color: '#818CF8', bg: 'rgba(99,102,241,0.18)',  border: 'rgba(99,102,241,0.4)'  },
    near:    { label: 'Almost There',color: '#F59E0B', bg: 'rgba(245,158,11,0.18)',  border: 'rgba(245,158,11,0.4)'  },
    next:    { label: "You're Next!", color: '#4ADE80', bg: 'rgba(34,197,94,0.18)',   border: 'rgba(34,197,94,0.4)'   },
    done:    { label: 'In Progress',  color: '#67E8F9', bg: 'rgba(6,182,212,0.18)',   border: 'rgba(6,182,212,0.4)'   },
  }[status];

  /* Clock: format seconds ticking */
  const secs = tick1s % 60;
  const lastUpdate = secs === 0 ? 'just now' : `${secs}s ago`;

  return (
    <div style={{ width: 390, height: 844, background: BG, fontFamily: "'Inter', sans-serif",
      display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>
      <style>{KEYFRAMES}</style>

      {/* ── Glow orbs ── */}
      <div style={{ position: 'absolute', top: -60, left: -60, width: 260, height: 260, borderRadius: '50%',
        background: isNear || isDone
          ? 'radial-gradient(circle, rgba(245,158,11,0.2) 0%, transparent 70%)'
          : 'radial-gradient(circle, rgba(99,102,241,0.25) 0%, transparent 70%)',
        filter: 'blur(32px)', pointerEvents: 'none', transition: 'background 1s ease' }} />
      <div style={{ position: 'absolute', top: 200, right: -80, width: 200, height: 200, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(6,182,212,0.14) 0%, transparent 70%)',
        filter: 'blur(28px)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: 120, left: -50, width: 180, height: 180, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)',
        filter: 'blur(24px)', pointerEvents: 'none' }} />

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
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 18px 8px', position: 'relative', zIndex: 10, flexShrink: 0 }}>
        <button style={{ width: 36, height: 36, borderRadius: 11, ...GLASS, border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <ChevronLeft style={{ width: 18, height: 18, color: 'rgba(255,255,255,0.8)' }} />
        </button>
        <span style={{ fontSize: 15, fontWeight: 700, color: '#FFF' }}>Live Queue</span>
        {/* LIVE badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 20, background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.4)' }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#22C55E', animation: 'pulse 1.5s ease-in-out infinite' }} />
          <span style={{ fontSize: 10, fontWeight: 800, color: '#4ADE80', letterSpacing: '0.08em' }}>LIVE</span>
        </div>
      </div>

      {/* ── SHIFT INFO STRIP ── */}
      <div style={{ margin: '0 18px 10px', padding: '8px 12px', borderRadius: 14, display: 'flex', alignItems: 'center', gap: 8, ...GLASS }}>
        <Sunrise style={{ width: 12, height: 12, color: '#F59E0B', flexShrink: 0 }} />
        <span style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.55)' }}>Morning Shift · 10:00 AM–2:00 PM</span>
        <div style={{ width: 1, height: 12, background: 'rgba(255,255,255,0.12)', marginLeft: 'auto' }} />
        <Building2 style={{ width: 11, height: 11, color: 'rgba(255,255,255,0.35)', flexShrink: 0 }} />
        <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>HeartCare Clinic</span>
      </div>

      {/* ── SCROLLABLE BODY ── */}
      <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '0 18px', paddingBottom: 20 }}>

        {/* ════ NOW CONSULTING HERO ════ */}
        <div style={{ marginBottom: 14, padding: '20px 16px 18px', borderRadius: 24, position: 'relative', overflow: 'hidden',
          background: 'linear-gradient(145deg, rgba(99,102,241,0.18) 0%, rgba(6,182,212,0.1) 100%)',
          border: '1.5px solid rgba(99,102,241,0.3)' }}>

          {/* subtle grid texture */}
          <div style={{ position: 'absolute', inset: 0, opacity: 0.04,
            backgroundImage: 'repeating-linear-gradient(0deg,rgba(255,255,255,0.5) 0px,transparent 1px,transparent 28px), repeating-linear-gradient(90deg,rgba(255,255,255,0.5) 0px,transparent 1px,transparent 28px)',
            pointerEvents: 'none' }} />

          <div style={{ fontSize: 10, fontWeight: 800, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em', textAlign: 'center', marginBottom: 14 }}>
            Now Consulting
          </div>

          {/* Pulsing ring + big number */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', marginBottom: 14 }}>
            {/* outer ping ring */}
            <div style={{ position: 'absolute', width: 120, height: 120, borderRadius: '50%',
              background: 'rgba(99,102,241,0.12)', border: '1.5px solid rgba(99,102,241,0.25)',
              animation: 'ping 2.4s cubic-bezier(0,0,0.2,1) infinite' }} />
            {/* middle ring */}
            <div style={{ position: 'absolute', width: 92, height: 92, borderRadius: '50%',
              border: '1.5px solid rgba(99,102,241,0.35)', background: 'rgba(99,102,241,0.08)' }} />
            {/* inner disc */}
            <div style={{ width: 72, height: 72, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', zIndex: 2,
              background: 'linear-gradient(135deg, rgba(99,102,241,0.45) 0%, rgba(6,182,212,0.3) 100%)',
              boxShadow: '0 0 28px rgba(99,102,241,0.5), inset 0 1px 0 rgba(255,255,255,0.15)',
              border: '2px solid rgba(165,180,252,0.5)' }}>
              <span key={current} style={{ fontSize: 26, fontWeight: 900, color: '#FFF', letterSpacing: '-1px', animation: 'slideUp 0.35s ease' }}>
                {current}
              </span>
            </div>
          </div>

          {/* Doctor consulting label */}
          <div style={{ textAlign: 'center', marginBottom: 8 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.9)' }}>
              Doctor is consulting{' '}
              <span key={`lbl-${current}`} style={{ color: '#A5B4FC', animation: 'slideUp 0.3s ease' }}>Token #{current}</span>
            </div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', marginTop: 3 }}>
              Dr. Ananya Sharma · Cardiologist
            </div>
          </div>

          {/* ── QUEUE PROGRESS BAR ── */}
          <div style={{ marginTop: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
              <span style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Queue Progress</span>
              <span style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.35)' }}>{current}/{TOTAL} tokens</span>
            </div>
            {/* Track */}
            <div style={{ position: 'relative', height: 10, borderRadius: 99, background: 'rgba(255,255,255,0.07)', overflow: 'visible' }}>
              {/* Filled portion */}
              <div style={{ height: '100%', borderRadius: 99, width: `${progPct}%`,
                background: 'linear-gradient(90deg, #4F46E5, #06B6D4)',
                boxShadow: '0 0 8px rgba(6,182,212,0.5)', transition: 'width 0.8s ease' }} />
              {/* User token marker */}
              <div style={{ position: 'absolute', top: '50%', left: `${userPct}%`,
                transform: 'translate(-50%, -50%)', zIndex: 5 }}>
                <div style={{ width: 14, height: 14, borderRadius: '50%', background: '#FFF',
                  border: '2.5px solid #6366F1', boxShadow: '0 0 8px rgba(99,102,241,0.7)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#6366F1' }} />
                </div>
                <div style={{ position: 'absolute', top: 16, left: '50%', transform: 'translateX(-50%)',
                  fontSize: 8, fontWeight: 800, color: '#A5B4FC', whiteSpace: 'nowrap' }}>YOU</div>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10 }}>
              <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.25)' }}>Token 1</span>
              <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.25)' }}>Token {TOTAL}</span>
            </div>
          </div>
        </div>

        {/* ════ ALERT BANNER (near/next/done) ════ */}
        {(isNear || isNext || isDone) && (
          <div style={{ marginBottom: 12, padding: '11px 14px', borderRadius: 16, display: 'flex', alignItems: 'center', gap: 10,
            background: isDone ? 'rgba(6,182,212,0.14)' : isNext ? 'rgba(34,197,94,0.14)' : 'rgba(245,158,11,0.14)',
            border: `1.5px solid ${isDone ? 'rgba(6,182,212,0.4)' : isNext ? 'rgba(34,197,94,0.4)' : 'rgba(245,158,11,0.4)'}`,
            animation: 'slideUp 0.4s ease' }}>
            {isDone
              ? <CheckCircle2 style={{ width: 18, height: 18, color: '#67E8F9', flexShrink: 0 }} />
              : isNext
              ? <Zap style={{ width: 18, height: 18, color: '#4ADE80', flexShrink: 0, animation: 'pulse 1s infinite' }} />
              : <Siren style={{ width: 18, height: 18, color: '#F59E0B', flexShrink: 0, animation: 'pulse 1s infinite' }} />}
            <div>
              <div style={{ fontSize: 12, fontWeight: 800, color: isDone ? '#67E8F9' : isNext ? '#4ADE80' : '#FCD34D' }}>
                {isDone ? 'You are in consultation now' : isNext ? "You're Next! Head to the clinic now" : `Only ${ahead} patient${ahead > 1 ? 's' : ''} ahead — Get ready!`}
              </div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>
                {isDone ? "Please proceed to the doctor's cabin" : isNext ? 'Be at the clinic entrance immediately' : 'Start heading to the clinic soon'}
              </div>
            </div>
          </div>
        )}

        {/* ════ YOUR APPOINTMENT CARD ════ */}
        <div style={{ marginBottom: 14, borderRadius: 24, overflow: 'hidden', position: 'relative',
          background: 'linear-gradient(145deg, rgba(99,102,241,0.22) 0%, rgba(6,182,212,0.14) 100%)',
          border: '1.5px solid rgba(99,102,241,0.45)',
          boxShadow: '0 8px 32px rgba(99,102,241,0.2)' }}>

          {/* Card header */}
          <div style={{ padding: '12px 16px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 10, fontWeight: 800, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Your Appointment</span>
            <div style={{ padding: '3px 8px', borderRadius: 8, background: statusCfg.bg, border: `1px solid ${statusCfg.border}` }}>
              <span style={{ fontSize: 10, fontWeight: 800, color: statusCfg.color }}>{statusCfg.label}</span>
            </div>
          </div>

          {/* Token number + people ahead */}
          <div style={{ padding: '10px 16px 14px', display: 'flex', alignItems: 'center', gap: 16 }}>
            {/* Big token */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <span style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 2 }}>Your Token</span>
              <div style={{ width: 72, height: 72, borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'linear-gradient(135deg, rgba(99,102,241,0.5), rgba(6,182,212,0.35))',
                border: '2px solid rgba(165,180,252,0.55)', boxShadow: '0 4px 20px rgba(99,102,241,0.35)' }}>
                <span style={{ fontSize: 28, fontWeight: 900, color: '#FFF', letterSpacing: '-1px' }}>
                  {isDone ? '✓' : `#${USER_TOKEN}`}
                </span>
              </div>
            </div>

            {/* Stats */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {/* People ahead */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', borderRadius: 12, background: 'rgba(255,255,255,0.06)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Users style={{ width: 12, height: 12, color: '#818CF8' }} />
                  <span style={{ fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.5)' }}>Ahead</span>
                </div>
                <span key={`ahead-${ahead}`} style={{ fontSize: 16, fontWeight: 900, color: isDone ? '#4ADE80' : ahead <= 3 ? '#F59E0B' : '#FFF', animation: 'slideUp 0.3s ease' }}>
                  {isDone ? '—' : ahead === 0 ? 'Next!' : ahead}
                </span>
              </div>
              {/* Wait time */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', borderRadius: 12, background: 'rgba(255,255,255,0.06)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Clock style={{ width: 12, height: 12, color: '#67E8F9' }} />
                  <span style={{ fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.5)' }}>Est. Wait</span>
                </div>
                <span key={`wait-${waitMin}`} style={{ fontSize: 14, fontWeight: 900, color: isDone ? '#4ADE80' : waitMin <= 8 ? '#F59E0B' : '#FFF', animation: 'slideUp 0.3s ease' }}>
                  {isDone ? 'Done' : waitMin <= 0 ? 'Now' : `~${waitMin}m`}
                </span>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div style={{ height: 1, background: 'rgba(255,255,255,0.07)', margin: '0 16px' }} />

          {/* Bottom: doctor + location */}
          <div style={{ padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <img src="https://randomuser.me/api/portraits/women/44.jpg" alt=""
              style={{ width: 28, height: 28, borderRadius: 9, objectFit: 'cover', objectPosition: 'top', border: '1.5px solid rgba(239,68,68,0.35)', flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.85)' }}>Dr. Ananya Sharma</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 1 }}>
                <MapPin style={{ width: 9, height: 9, color: 'rgba(255,255,255,0.3)' }} />
                <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)' }}>HeartCare Clinic · Andheri West</span>
              </div>
            </div>
            <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.3)' }}>Fri, 10 Apr</div>
          </div>
        </div>

        {/* ════ STAT TILES ════ */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 14 }}>
          {[
            { icon: Activity,    label: 'Avg / Patient', val: '~2.5 min', color: '#818CF8', bg: 'rgba(99,102,241,0.12)' },
            { icon: Users,       label: 'Tokens Left',   val: `${TOTAL - current}`,        color: '#67E8F9', bg: 'rgba(6,182,212,0.1)' },
            { icon: ShieldCheck, label: 'Clinic',        val: 'Open',                      color: '#4ADE80', bg: 'rgba(34,197,94,0.1)' },
          ].map(({ icon: Icon, label, val, color, bg }) => (
            <div key={label} style={{ padding: '11px 10px', borderRadius: 16, textAlign: 'center', background: bg, border: `1px solid ${color}22` }}>
              <Icon style={{ width: 16, height: 16, color, margin: '0 auto 5px' }} />
              <div style={{ fontSize: 13, fontWeight: 900, color: '#FFF', marginBottom: 2 }}>{val}</div>
              <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)', fontWeight: 600, lineHeight: 1.3 }}>{label}</div>
            </div>
          ))}
        </div>

        {/* ════ NOTIFICATION REMINDER ════ */}
        <div style={{ padding: '12px 14px', borderRadius: 18, display: 'flex', alignItems: 'flex-start', gap: 12, ...GLASS }}>
          <div style={{ width: 36, height: 36, borderRadius: 11, background: 'rgba(99,102,241,0.2)', border: '1px solid rgba(99,102,241,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Bell style={{ width: 16, height: 16, color: '#A5B4FC' }} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#FFF', marginBottom: 3 }}>Notification set</div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', lineHeight: 1.55 }}>
              You'll be alerted when <strong style={{ color: '#A5B4FC' }}>3 tokens remain</strong> before yours. Head to the clinic by then.
            </div>
          </div>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#4ADE80', marginTop: 4, flexShrink: 0, animation: 'pulse 2s infinite' }} />
        </div>

        {/* ── auto-refresh ticker ── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, marginTop: 12, marginBottom: 4 }}>
          <RefreshCw style={{ width: 10, height: 10, color: 'rgba(255,255,255,0.2)', animation: 'spin 3s linear infinite' }} />
          <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)', fontWeight: 500 }}>Updated {lastUpdate}</span>
        </div>

      </div>
    </div>
  );
}
