import React, { useState } from 'react';
import {
  PhoneCall, CheckCircle2, XCircle,
  AlertCircle,
  Clock, Users, Smartphone, Footprints,
  Stethoscope, Activity, ChevronRight,
  MapPin, Phone as PhoneIcon, BadgeCheck,
  House, CalendarClock, TrendingUp, SlidersHorizontal,
} from 'lucide-react';

const BG      = '#070B14';
const TEAL    = '#0D9488';
const TEAL_LT = '#2DD4BF';

/* ─── DATA ─── */
type QStatus = 'consulting' | 'next' | 'waiting' | 'done' | 'skipped';
type QType   = 'Online' | 'Walk-in' | 'Emergency';

interface Patient {
  id: string; token: string; name: string; age: number; gender: 'M' | 'F';
  phone: string; addr: string; type: QType; status: QStatus; visitType: 'First Visit' | 'Follow-up';
}

const INIT_QUEUE: Patient[] = [
  { id:'p1', token:'#47', name:'Priya Mehta',  age:34, gender:'F', phone:'+91 98765 11111', addr:'Andheri West', type:'Online',  status:'consulting', visitType:'First Visit' },
  { id:'p2', token:'#48', name:'Rajan Gupta',  age:28, gender:'M', phone:'+91 97654 22222', addr:'Bandra East',  type:'Walk-in', status:'next',       visitType:'Follow-up'   },
  { id:'p3', token:'#49', name:'Sunita Patel', age:52, gender:'F', phone:'+91 96543 33333', addr:'Juhu',         type:'Online',  status:'waiting',    visitType:'First Visit' },
  { id:'p4', token:'#50', name:'Arvind Kumar', age:41, gender:'M', phone:'+91 95432 44444', addr:'Goregaon',     type:'Walk-in', status:'waiting',    visitType:'Follow-up'   },
  { id:'p5', token:'#51', name:'Meena Kaur',   age:45, gender:'F', phone:'+91 94321 55555', addr:'Malad West',   type:'Online',  status:'waiting',    visitType:'First Visit' },
  { id:'p6', token:'#45', name:'Rahul Sharma', age:32, gender:'M', phone:'+91 98765 43210', addr:'Andheri West', type:'Online',  status:'done',       visitType:'Follow-up'   },
  { id:'p7', token:'#46', name:'Pooja Nair',   age:27, gender:'F', phone:'+91 93219 87654', addr:'Versova',      type:'Walk-in', status:'skipped',    visitType:'First Visit' },
];
const INIT_EMERGENCY: Patient[] = [
  { id:'e1', token:'E01', name:'Deepak Joshi', age:58, gender:'M', phone:'+91 93210 66666', addr:'Versova',     type:'Emergency', status:'waiting', visitType:'First Visit' },
  { id:'e2', token:'E02', name:'Anita Roy',    age:44, gender:'F', phone:'+91 92109 77777', addr:'Lokhandwala', type:'Emergency', status:'waiting', visitType:'First Visit' },
];

const TYPE_CFG: Record<QType, { color: string; bg: string; icon: React.ElementType }> = {
  Online:    { color: '#4ADE80', bg: 'rgba(34,197,94,0.15)',  icon: Smartphone  },
  'Walk-in': { color: '#67E8F9', bg: 'rgba(6,182,212,0.15)',  icon: Footprints  },
  Emergency: { color: '#F87171', bg: 'rgba(239,68,68,0.15)',  icon: AlertCircle },
};

/* ─── STATS MINI CARD ─── */
function MiniStat({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div style={{ flex: 1, textAlign: 'center', padding: '8px 4px', borderRadius: 14,
      background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.07)' }}>
      <div style={{ fontSize: 20, fontWeight: 900, color, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.32)', marginTop: 2, textTransform: 'uppercase', letterSpacing: '0.07em' }}>{label}</div>
    </div>
  );
}

/* ─── QUEUE ROW CARD ─── */
function QueueCard({ patient, onCall, onDone, onSkip, isEmergency }:{
  patient: Patient;
  onCall: () => void; onDone: () => void; onSkip: () => void;
  isEmergency?: boolean;
}) {
  const tc  = TYPE_CFG[patient.type];
  const TypeIcon = tc.icon;
  const isCurrent  = patient.status === 'consulting';
  const isDone     = patient.status === 'done';
  const isSkipped  = patient.status === 'skipped';
  const isPast     = isDone || isSkipped;
  const isWaiting  = patient.status === 'waiting' || patient.status === 'next';

  return (
    <div style={{
      borderRadius: 20, marginBottom: 8, overflow: 'hidden',
      opacity: isPast ? 0.6 : 1,
      background: isCurrent
        ? 'linear-gradient(145deg, rgba(13,148,136,0.2), rgba(6,182,212,0.12))'
        : isEmergency
        ? 'linear-gradient(145deg, rgba(239,68,68,0.12), rgba(249,115,22,0.08))'
        : 'rgba(255,255,255,0.04)',
      border: `1.5px solid ${isCurrent ? 'rgba(45,212,191,0.4)' : isEmergency ? 'rgba(239,68,68,0.3)' : isWaiting ? 'rgba(245,158,11,0.25)' : 'rgba(255,255,255,0.07)'}`,
      boxShadow: isCurrent ? '0 4px 24px rgba(13,148,136,0.2)' : isEmergency ? '0 4px 16px rgba(239,68,68,0.15)' : 'none',
    }}>
      {/* Top row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '11px 13px 8px' }}>
        {/* Token block */}
        <div style={{ width: 44, height: 44, borderRadius: 14, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          background: isCurrent ? 'linear-gradient(135deg, #0D9488, #0891B2)' : isEmergency ? 'rgba(239,68,68,0.25)' : 'rgba(255,255,255,0.07)',
          border: `1.5px solid ${isCurrent ? 'rgba(45,212,191,0.5)' : isEmergency ? 'rgba(239,68,68,0.4)' : 'rgba(255,255,255,0.1)'}`,
          boxShadow: isCurrent ? '0 2px 14px rgba(13,148,136,0.4)' : 'none' }}>
          <span style={{ fontSize: 14, fontWeight: 900, color: isPast ? 'rgba(255,255,255,0.4)' : '#FFF', letterSpacing: '-0.5px', lineHeight: 1 }}>{patient.token}</span>
          {isCurrent && <Activity style={{ width: 9, height: 9, color: TEAL_LT, marginTop: 2 }} />}
        </div>
        {/* Patient info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 3 }}>
            <span style={{ fontSize: 13, fontWeight: 800, color: isPast ? 'rgba(255,255,255,0.45)' : '#FFF',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{patient.name}</span>
            <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)' }}>{patient.age}{patient.gender}</span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 3, padding: '2px 7px', borderRadius: 20, background: tc.bg }}>
              <TypeIcon style={{ width: 9, height: 9, color: tc.color }} />
              <span style={{ fontSize: 9, fontWeight: 800, color: tc.color, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{patient.type}</span>
            </div>
            <div style={{ padding: '2px 7px', borderRadius: 20,
              background: patient.visitType === 'First Visit' ? 'rgba(99,102,241,0.15)' : 'rgba(16,185,129,0.15)',
              color: patient.visitType === 'First Visit' ? '#A5B4FC' : '#6EE7B7', fontSize: 9, fontWeight: 700 }}>
              {patient.visitType}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 5 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <PhoneIcon style={{ width: 10, height: 10, color: 'rgba(255,255,255,0.28)' }} />
              <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.38)', fontWeight: 500 }}>{patient.phone}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <MapPin style={{ width: 10, height: 10, color: 'rgba(255,255,255,0.28)' }} />
              <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.38)', fontWeight: 500 }}>{patient.addr}</span>
            </div>
          </div>
        </div>
        {/* Right action: "Send Next" for any waiting, status badge for past */}
        {!isCurrent && (
          <div style={{ flexShrink: 0 }}>
            {isWaiting ? (
              <button onClick={onCall}
                style={{ height: 30, padding: '0 10px', borderRadius: 10, border: 'none', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, fontWeight: 800, color: '#FFF',
                  background: isEmergency
                    ? 'linear-gradient(135deg, #DC2626, #EF4444)'
                    : 'linear-gradient(135deg, #0D9488, #0891B2)',
                  boxShadow: isEmergency
                    ? '0 2px 10px rgba(239,68,68,0.4)'
                    : '0 2px 10px rgba(13,148,136,0.4)' }}>
                <ChevronRight style={{ width: 11, height: 11 }} /> Send Next
              </button>
            ) : (
              <div style={{ padding: '3px 8px', borderRadius: 8,
                background: isDone ? 'rgba(34,197,94,0.14)' : 'rgba(245,158,11,0.14)',
                border: `1px solid ${isDone ? 'rgba(34,197,94,0.3)' : 'rgba(245,158,11,0.3)'}` }}>
                <span style={{ fontSize: 9, fontWeight: 800,
                  color: isDone ? '#4ADE80' : '#F59E0B',
                  textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {isDone ? 'Done' : 'Skipped'}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Send Alert for skipped patients */}
      {patient.status === 'skipped' && (
        <div style={{ padding: '0 13px 11px' }}>
          <button onClick={onCall}
            style={{ width: '100%', height: 36, borderRadius: 11, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, fontSize: 11, fontWeight: 800,
              background: 'rgba(99,102,241,0.2)', border: '1.5px solid rgba(99,102,241,0.4)', color: '#A5B4FC' }}>
            <BadgeCheck style={{ width: 12, height: 12 }} /> Send Alert
          </button>
        </div>
      )}

      {/* Action buttons — only for active patients */}
      {!isPast && (
        <div style={{ display: 'flex', gap: 6, padding: '0 13px 11px' }}>
          {isCurrent ? (
            <>
              <button onClick={onSkip}
                style={{ flex: 1, height: 38, borderRadius: 11, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, fontSize: 11, fontWeight: 800,
                  background: 'rgba(245,158,11,0.18)', border: '1.5px solid rgba(245,158,11,0.4)', color: '#FCD34D' }}>
                <XCircle style={{ width: 13, height: 13 }} /> Not Shown
              </button>
              <button onClick={onDone}
                style={{ flex: 1, height: 38, borderRadius: 11, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, fontSize: 11, fontWeight: 800, color: '#FFF',
                  background: 'linear-gradient(135deg, #16A34A, #22C55E)',
                  boxShadow: '0 3px 12px rgba(34,197,94,0.35)' }}>
                <CheckCircle2 style={{ width: 13, height: 13 }} /> Done
              </button>
            </>
          ) : (
            <>
              <button onClick={onSkip}
                style={{ flex: 1, height: 38, borderRadius: 11, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, fontSize: 11, fontWeight: 800,
                  background: 'rgba(245,158,11,0.18)', border: '1.5px solid rgba(245,158,11,0.4)', color: '#FCD34D' }}>
                <XCircle style={{ width: 13, height: 13 }} /> Not Shown
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

/* ─── NAV BAR ─── */
function DocNavBar({ active }: { active: 'home'|'queue'|'earnings'|'settings' }) {
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

/* ─── MAIN ─── */
export function MasterQueue() {
  const [tab,   setTab]   = useState<'queue' | 'emergency' | 'notshown' | 'done'>('queue');
  const [queue, setQueue] = useState<Patient[]>(INIT_QUEUE);
  const [emerg, setEmerg] = useState<Patient[]>(INIT_EMERGENCY);

  const updateStatus = (list: Patient[], setter: React.Dispatch<React.SetStateAction<Patient[]>>, id: string, status: QStatus) => {
    setter(list.map(p => p.id === id ? { ...p, status } : p));
  };

  const sendNext = () => {
    const nextIdx = queue.findIndex(p => p.status === 'next');
    if (nextIdx === -1) return;
    setQueue(prev => prev.map((p, i) => {
      if (p.status === 'consulting') return { ...p, status: 'done' };
      if (i === nextIdx) return { ...p, status: 'consulting' };
      if (i === nextIdx + 1 && p.status === 'waiting') return { ...p, status: 'next' };
      return p;
    }));
  };

  const current    = queue.find(p => p.status === 'consulting');
  const nextPt     = [...emerg.filter(p => p.status === 'waiting'), ...queue.filter(p => p.status === 'next' || p.status === 'waiting')][0];
  const waiting    = queue.filter(p => p.status === 'waiting' || p.status === 'next');
  const done       = queue.filter(p => p.status === 'done').length;
  const skipped    = queue.filter(p => p.status === 'skipped').length;
  const emergCount = emerg.filter(p => p.status === 'waiting').length;
  const isEmergNext = nextPt?.type === 'Emergency';
  const accentC = isEmergNext ? '#F87171' : '#FCD34D';
  const borderC = isEmergNext ? 'rgba(239,68,68,0.45)' : 'rgba(245,158,11,0.45)';
  const bgC     = isEmergNext ? 'rgba(239,68,68,0.10)' : 'rgba(245,158,11,0.09)';

  return (
    <div style={{ width: 390, height: 844, background: BG, fontFamily: "'Inter', sans-serif",
      display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>

      {/* Glow orbs */}
      <div style={{ position: 'absolute', top: -60, left: -60, width: 240, height: 240, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(13,148,136,0.2) 0%, transparent 65%)', filter: 'blur(40px)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', top: 300, right: -80, width: 200, height: 200, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(239,68,68,0.1) 0%, transparent 70%)', filter: 'blur(32px)', pointerEvents: 'none' }} />

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

      {/* ── STICKY TOP ── */}
      <div style={{ padding: '8px 16px 10px', flexShrink: 0, position: 'relative', zIndex: 10 }}>
        {/* Title row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#4ADE80', boxShadow: '0 0 8px #4ADE80' }} />
            <span style={{ fontSize: 12, fontWeight: 800, color: '#FFF' }}>Master Queue</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Stethoscope style={{ width: 13, height: 13, color: TEAL_LT }} />
            <span style={{ fontSize: 11, fontWeight: 700, color: TEAL_LT }}>Dr. Sharma</span>
          </div>
        </div>

        {/* ── CURRENTLY CONSULTING CARD ── */}
        <div style={{ borderRadius: 22, padding: '16px 16px 14px', position: 'relative', overflow: 'hidden', marginBottom: 8,
          background: 'linear-gradient(145deg, rgba(13,148,136,0.28) 0%, rgba(6,182,212,0.16) 60%, rgba(7,11,20,0.6) 100%)',
          border: '1.5px solid rgba(45,212,191,0.38)',
          boxShadow: '0 8px 32px rgba(13,148,136,0.25)' }}>
          <div style={{ position: 'absolute', top: -30, right: -30, width: 140, height: 140, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(45,212,191,0.22) 0%, transparent 70%)', filter: 'blur(24px)', pointerEvents: 'none' }} />

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '3px 10px', borderRadius: 20,
              background: 'rgba(74,222,128,0.12)', border: '1px solid rgba(74,222,128,0.3)' }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ADE80', boxShadow: '0 0 6px #4ADE80', display: 'inline-block' }} />
              <span style={{ fontSize: 9, fontWeight: 800, color: '#4ADE80', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Currently Consulting</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '3px 9px', borderRadius: 20,
              background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <Clock style={{ width: 9, height: 9, color: 'rgba(255,255,255,0.4)' }} />
              <span style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.45)' }}>12 min</span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 14 }}>
            <div style={{ width: 64, height: 64, borderRadius: 18, display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              background: 'linear-gradient(135deg, #0D9488, #0891B2)',
              boxShadow: '0 4px 20px rgba(13,148,136,0.55)' }}>
              <span style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.06em', lineHeight: 1 }}>Token</span>
              <span style={{ fontSize: 28, fontWeight: 900, color: '#FFF', letterSpacing: '-1.5px', lineHeight: 1.1 }}>{current?.token ?? '—'}</span>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 20, fontWeight: 900, color: '#FFF', letterSpacing: '-0.5px', lineHeight: 1.15, marginBottom: 5 }}>
                {current?.name ?? 'No patient'}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.5)',
                  background: 'rgba(255,255,255,0.08)', padding: '2px 8px', borderRadius: 8 }}>
                  {current?.age} yrs · {current?.gender === 'M' ? 'Male' : 'Female'}
                </span>
                {current && (
                  <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 8,
                    background: current.visitType === 'First Visit' ? 'rgba(99,102,241,0.2)' : 'rgba(16,185,129,0.2)',
                    color: current.visitType === 'First Visit' ? '#A5B4FC' : '#6EE7B7' }}>
                    {current.visitType}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => current && updateStatus(queue, setQueue, current.id, 'skipped')}
              style={{ flex: 1, height: 42, borderRadius: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: 12, fontWeight: 800,
                background: 'rgba(245,158,11,0.18)', border: '1.5px solid rgba(245,158,11,0.45)', color: '#FCD34D' }}>
              <XCircle style={{ width: 14, height: 14 }} /> Not Shown
            </button>
            <button onClick={() => current && updateStatus(queue, setQueue, current.id, 'done')}
              style={{ flex: 1, height: 42, borderRadius: 13, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: 12, fontWeight: 800, color: '#FFF',
                background: 'linear-gradient(135deg, #16A34A, #22C55E)',
                boxShadow: '0 4px 14px rgba(34,197,94,0.4)' }}>
              <CheckCircle2 style={{ width: 14, height: 14 }} /> Done
            </button>
          </div>
        </div>

        {/* ── UP NEXT COMPACT CARD ── */}
        {nextPt && (
          <div style={{ borderRadius: 14, padding: '8px 12px', marginBottom: 8,
            background: bgC, border: `1.5px solid ${borderC}` }}>
            {/* Label row */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 7 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <div style={{ width: 5, height: 5, borderRadius: '50%', background: accentC }} />
                <span style={{ fontSize: 9, fontWeight: 800, color: accentC, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  {isEmergNext ? '⚡ Up Next — Emergency' : '🔜 Up Next'}
                </span>
              </div>
              <div style={{ padding: '2px 7px', borderRadius: 20, background: 'rgba(255,255,255,0.07)' }}>
                <span style={{ fontSize: 9, fontWeight: 800,
                  color: nextPt.type === 'Walk-in' ? '#67E8F9' : nextPt.type === 'Online' ? '#4ADE80' : '#F87171',
                  textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  {nextPt.type === 'Walk-in' ? 'Walk-In' : nextPt.type === 'Online' ? 'E-Token' : 'Emergency'}
                </span>
              </div>
            </div>
            {/* Patient row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 40, height: 40, borderRadius: 11, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: `1.5px solid ${borderC}`,
                background: isEmergNext ? 'rgba(239,68,68,0.22)' : 'rgba(245,158,11,0.18)' }}>
                <span style={{ fontSize: 13, fontWeight: 900, color: accentC }}>{nextPt.token}</span>
              </div>
              <span style={{ flex: 1, fontSize: 13, fontWeight: 800, color: '#FFF', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {nextPt.name}
              </span>
              <button onClick={sendNext}
                style={{ padding: '6px 12px', borderRadius: 10, border: `1.5px solid ${borderC}`, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 800, color: accentC,
                  background: isEmergNext ? 'rgba(239,68,68,0.22)' : 'rgba(245,158,11,0.18)' }}>
                Call In <ChevronRight style={{ width: 12, height: 12 }} />
              </button>
            </div>
          </div>
        )}

        {/* Stats row */}
        <div style={{ display: 'flex', gap: 6 }}>
          <MiniStat label="Total"   value={queue.length}   color="#A5B4FC" />
          <MiniStat label="Waiting" value={waiting.length} color="#FCD34D" />
          <MiniStat label="Done"    value={done}           color="#4ADE80" />
          <MiniStat label="Skipped" value={skipped}        color="#F87171" />
        </div>
      </div>

      {/* ── TAB TOGGLE + SEND NEXT ── */}
      <div style={{ padding: '0 16px 8px', flexShrink: 0, zIndex: 10, position: 'relative' }}>
        <div style={{ display: 'flex', gap: 4, padding: 4, borderRadius: 14, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.07)' }}>
          {([
            { key: 'queue',    label: 'Queue',   count: waiting.length, activeColor: TEAL_LT,  activeBg: 'rgba(13,148,136,0.3)',  activeShadow: 'rgba(13,148,136,0.3)'  },
            { key: 'emergency',label: 'Emerg',   count: emergCount,     activeColor: '#F87171', activeBg: 'rgba(239,68,68,0.22)',  activeShadow: 'rgba(239,68,68,0.25)', dot: emergCount > 0 },
            { key: 'notshown', label: 'Skipped', count: skipped,        activeColor: '#FCD34D', activeBg: 'rgba(245,158,11,0.22)', activeShadow: 'rgba(245,158,11,0.25)' },
            { key: 'done',     label: 'Done',    count: done,           activeColor: '#4ADE80', activeBg: 'rgba(34,197,94,0.2)',   activeShadow: 'rgba(34,197,94,0.25)'  },
          ] as const).map(t => {
            const active = tab === t.key;
            return (
              <button key={t.key} onClick={() => setTab(t.key)}
                style={{ flex: 1, height: 34, borderRadius: 10, border: 'none', cursor: 'pointer',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 1,
                  background: active ? t.activeBg : 'transparent',
                  boxShadow: active ? `0 2px 10px ${t.activeShadow}` : 'none',
                  position: 'relative' }}>
                <span style={{ fontSize: 9, fontWeight: 800, color: active ? '#FFF' : 'rgba(255,255,255,0.38)', whiteSpace: 'nowrap' }}>
                  {t.label} {t.count > 0 ? `(${t.count})` : ''}
                </span>
                {'dot' in t && t.dot && (
                  <div style={{ position: 'absolute', top: 4, right: 6, width: 5, height: 5, borderRadius: '50%', background: '#EF4444', boxShadow: '0 0 5px #EF4444' }} />
                )}
              </button>
            );
          })}
          {/* Send Next action button */}
          <button onClick={sendNext}
            style={{ height: 34, padding: '0 8px', borderRadius: 10, cursor: nextPt ? 'pointer' : 'not-allowed',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2,
              opacity: nextPt ? 1 : 0.35,
              background: 'rgba(13,148,136,0.22)', border: `1.5px solid rgba(45,212,191,0.4)` }}>
            <ChevronRight style={{ width: 12, height: 12, color: TEAL_LT }} />
            <span style={{ fontSize: 8, fontWeight: 800, color: TEAL_LT, textAlign: 'center', lineHeight: 1.2, whiteSpace: 'nowrap' }}>Send{'\n'}Next</span>
          </button>
        </div>
      </div>

      {/* ── SCROLLABLE QUEUE LIST ── */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 16px 16px', position: 'relative', zIndex: 10 }}>
        {tab === 'queue' && (
          <>
            {queue.filter(p => !['done','skipped','consulting'].includes(p.status)).map(p => (
              <QueueCard key={p.id} patient={p}
                onCall={sendNext}
                onDone={() => updateStatus(queue, setQueue, p.id, 'done')}
                onSkip={() => updateStatus(queue, setQueue, p.id, 'skipped')} />
            ))}
            {waiting.length === 0 && (
              <div style={{ textAlign: 'center', padding: '24px 0', color: 'rgba(255,255,255,0.2)', fontSize: 12, fontWeight: 600 }}>No patients waiting</div>
            )}
          </>
        )}

        {tab === 'emergency' && (
          <>
            <div style={{ fontSize: 10, fontWeight: 800, color: 'rgba(239,68,68,0.7)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
              <AlertCircle style={{ width: 12, height: 12 }} /> Priority — Immediate Attention
            </div>
            {emerg.filter(p => !['done','skipped'].includes(p.status)).map(p => (
              <QueueCard key={p.id} patient={p} isEmergency
                onCall={sendNext}
                onDone={() => updateStatus(emerg, setEmerg, p.id, 'done')}
                onSkip={() => updateStatus(emerg, setEmerg, p.id, 'skipped')} />
            ))}
            {emerg.filter(p => !['done','skipped'].includes(p.status)).length === 0 && (
              <div style={{ textAlign: 'center', padding: '24px 0', color: 'rgba(255,255,255,0.2)', fontSize: 12, fontWeight: 600 }}>No emergency patients</div>
            )}
          </>
        )}

        {tab === 'notshown' && (
          <>
            <div style={{ fontSize: 10, fontWeight: 800, color: 'rgba(245,158,11,0.7)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
              <XCircle style={{ width: 12, height: 12 }} /> Not Shown / Skipped
            </div>
            {[...queue, ...emerg].filter(p => p.status === 'skipped').map(p => (
              <QueueCard key={p.id} patient={p} onCall={() => {}} onDone={() => {}} onSkip={() => {}} />
            ))}
            {[...queue, ...emerg].filter(p => p.status === 'skipped').length === 0 && (
              <div style={{ textAlign: 'center', padding: '24px 0', color: 'rgba(255,255,255,0.2)', fontSize: 12, fontWeight: 600 }}>No skipped patients</div>
            )}
          </>
        )}

        {tab === 'done' && (
          <>
            <div style={{ fontSize: 10, fontWeight: 800, color: 'rgba(74,222,128,0.7)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
              <CheckCircle2 style={{ width: 12, height: 12 }} /> Consulted Today
            </div>
            {[...queue, ...emerg].filter(p => p.status === 'done').map(p => (
              <QueueCard key={p.id} patient={p} onCall={() => {}} onDone={() => {}} onSkip={() => {}} />
            ))}
            {[...queue, ...emerg].filter(p => p.status === 'done').length === 0 && (
              <div style={{ textAlign: 'center', padding: '24px 0', color: 'rgba(255,255,255,0.2)', fontSize: 12, fontWeight: 600 }}>No consultations yet</div>
            )}
          </>
        )}
      </div>

      {/* ── NAV BAR ── */}
      <DocNavBar active="queue" />
    </div>
  );
}
