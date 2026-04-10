import React, { useState } from 'react';
import {
  UserPlus, ArrowLeft, Clock, AlertCircle,
  BadgeCheck, Phone, MapPin, User, Calendar,
  CheckCircle2, Footprints,
} from 'lucide-react';

const BG      = '#070B14';
const TEAL    = '#0D9488';
const TEAL_LT = '#2DD4BF';
const GLASS: React.CSSProperties = {
  background: 'rgba(255,255,255,0.05)',
  backdropFilter: 'blur(18px)',
  WebkitBackdropFilter: 'blur(18px)',
  border: '1px solid rgba(255,255,255,0.09)',
};

const INPUT: React.CSSProperties = {
  width: '100%', height: 46, borderRadius: 13, border: '1px solid rgba(255,255,255,0.1)',
  background: 'rgba(255,255,255,0.06)', color: '#FFF', fontSize: 13, fontWeight: 500,
  padding: '0 14px', outline: 'none', boxSizing: 'border-box',
  fontFamily: "'Inter', sans-serif",
};

interface Field { label: string; placeholder: string; icon: React.ElementType; type?: string }

const RECENT = [
  { token: '#50', name: 'Arvind Kumar',  age: 41, gender: 'M', type: 'Normal',    time: '2m ago'  },
  { token: '#48', name: 'Rajan Gupta',   age: 28, gender: 'M', type: 'Normal',    time: '15m ago' },
  { token: 'E01', name: 'Deepak Joshi',  age: 58, gender: 'M', type: 'Emergency', time: '22m ago' },
];

export function AddWalkin() {
  const [tokenType, setTokenType] = useState<'Normal' | 'Emergency'>('Normal');
  const [gender,    setGender]    = useState<'M' | 'F'>('M');
  const [booked,    setBooked]    = useState(false);

  const isEmerg = tokenType === 'Emergency';

  const handleBook = () => { setBooked(true); setTimeout(() => setBooked(false), 2000); };

  return (
    <div style={{ width: 390, height: 844, background: BG, fontFamily: "'Inter', sans-serif",
      display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>

      {/* Glow orbs */}
      <div style={{ position: 'absolute', top: -60, left: -60, width: 240, height: 240, borderRadius: '50%',
        background: `radial-gradient(circle, ${isEmerg ? 'rgba(239,68,68,0.18)' : 'rgba(13,148,136,0.18)'} 0%, transparent 65%)`,
        filter: 'blur(40px)', pointerEvents: 'none', transition: 'background 0.4s' }} />
      <div style={{ position: 'absolute', bottom: 100, right: -60, width: 180, height: 180, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(99,102,241,0.1) 0%, transparent 70%)', filter: 'blur(32px)', pointerEvents: 'none' }} />

      {/* Status bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px 0', flexShrink: 0 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.55)' }}>9:41</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          {[0.4,0.65,0.9,1].map((op,i) => <div key={i} style={{ width: 3, height: 6+i*2, borderRadius: 2, background: `rgba(255,255,255,${op})` }} />)}
          <div style={{ width: 6 }} />
          <svg width="16" height="11" viewBox="0 0 16 11" fill="none"><path d="M8 2C10.4 2 12.6 3 14.1 4.7L15.5 3.2C13.6 1.2 10.9 0 8 0C5.1 0 2.4 1.2 0.5 3.2L1.9 4.7C3.4 3 5.6 2 8 2Z" fill="white" opacity="0.4"/><path d="M8 5C9.7 5 11.2 5.7 12.3 6.8L13.7 5.3C12.2 3.9 10.2 3 8 3C5.8 3 3.8 3.9 2.3 5.3L3.7 6.8C4.8 5.7 6.3 5 8 5Z" fill="white" opacity="0.7"/><circle cx="8" cy="9.5" r="1.5" fill="white"/></svg>
          <div style={{ width: 4 }} />
          <svg width="24" height="12" viewBox="0 0 24 12" fill="none"><rect x="0.5" y="0.5" width="20" height="11" rx="3.5" stroke="white" strokeOpacity="0.3"/><rect x="2" y="2" width="14" height="8" rx="2" fill="white" fillOpacity="0.85"/></svg>
        </div>
      </div>

      {/* Scrollable body */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '10px 16px 24px' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <div style={{ width: 36, height: 36, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', ...GLASS, cursor: 'pointer' }}>
            <ArrowLeft style={{ width: 16, height: 16, color: 'rgba(255,255,255,0.6)' }} />
          </div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 900, color: '#FFF', letterSpacing: '-0.5px' }}>Book Walk-in Token</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', fontWeight: 500 }}>Register patient directly at clinic</div>
          </div>
        </div>

        {/* Next token info strip */}
        <div style={{ borderRadius: 16, padding: '10px 14px', marginBottom: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: isEmerg ? 'rgba(239,68,68,0.13)' : 'rgba(13,148,136,0.13)',
          border: `1px solid ${isEmerg ? 'rgba(239,68,68,0.3)' : 'rgba(13,148,136,0.3)'}`,
          transition: 'all 0.3s' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              background: isEmerg ? 'rgba(239,68,68,0.25)' : 'rgba(13,148,136,0.25)',
              border: `1px solid ${isEmerg ? 'rgba(239,68,68,0.4)' : 'rgba(45,212,191,0.4)'}` }}>
              <span style={{ fontSize: 9, fontWeight: 700, color: isEmerg ? '#FCA5A5' : TEAL_LT, textTransform: 'uppercase', letterSpacing: '0.04em', lineHeight: 1 }}>Next</span>
              <span style={{ fontSize: 14, fontWeight: 900, color: '#FFF', lineHeight: 1.2 }}>{isEmerg ? 'E03' : '#52'}</span>
            </div>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Next Token</div>
              <div style={{ fontSize: 13, fontWeight: 800, color: '#FFF' }}>{isEmerg ? 'Emergency E03' : 'Normal #52'}</div>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <Clock style={{ width: 11, height: 11, color: 'rgba(255,255,255,0.35)' }} />
              <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.45)' }}>4 waiting</span>
            </div>
            <div style={{ fontSize: 10, color: isEmerg ? '#FCA5A5' : TEAL_LT, fontWeight: 700, marginTop: 2 }}>FREE</div>
          </div>
        </div>

        {/* ── TOKEN TYPE TOGGLE ── */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 10, fontWeight: 800, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 7 }}>Token Type</div>
          <div style={{ display: 'flex', gap: 5, padding: 4, borderRadius: 16, ...GLASS }}>
            {(['Normal', 'Emergency'] as const).map(t => {
              const active = tokenType === t;
              const isE = t === 'Emergency';
              return (
                <button key={t} onClick={() => setTokenType(t)}
                  style={{ flex: 1, height: 52, borderRadius: 12, border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3, transition: 'all 0.25s',
                    background: active ? (isE ? 'rgba(239,68,68,0.25)' : 'rgba(13,148,136,0.28)') : 'transparent',
                    boxShadow: active ? `0 2px 12px ${isE ? 'rgba(239,68,68,0.3)' : 'rgba(13,148,136,0.35)'}` : 'none',
                    border: active ? `1.5px solid ${isE ? 'rgba(239,68,68,0.5)' : 'rgba(45,212,191,0.5)'}` : '1.5px solid transparent' }}>
                  {isE
                    ? <AlertCircle style={{ width: 16, height: 16, color: active ? '#F87171' : 'rgba(255,255,255,0.3)' }} />
                    : <BadgeCheck  style={{ width: 16, height: 16, color: active ? TEAL_LT : 'rgba(255,255,255,0.3)' }} />}
                  <span style={{ fontSize: 11, fontWeight: 800, color: active ? '#FFF' : 'rgba(255,255,255,0.38)' }}>{t}</span>
                  <span style={{ fontSize: 9, fontWeight: 700, color: active ? (isE ? '#FCA5A5' : TEAL_LT) : 'rgba(255,255,255,0.2)' }}>FREE</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── PATIENT FORM ── */}
        <div style={{ borderRadius: 20, padding: '16px 14px', marginBottom: 14, ...GLASS }}>
          <div style={{ fontSize: 10, fontWeight: 800, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>Patient Details</div>

          {/* Name */}
          <div style={{ marginBottom: 10 }}>
            <label style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.07em', display: 'flex', alignItems: 'center', gap: 5, marginBottom: 5 }}>
              <User style={{ width: 10, height: 10 }} /> Patient Name
            </label>
            <input style={INPUT} placeholder="Enter full name" />
          </div>

          {/* Age + Gender row */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.07em', display: 'flex', alignItems: 'center', gap: 5, marginBottom: 5 }}>
                <Calendar style={{ width: 10, height: 10 }} /> Age
              </label>
              <input style={{ ...INPUT, width: '100%' }} placeholder="e.g. 35" type="number" />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 5, display: 'block' }}>Gender</label>
              <div style={{ display: 'flex', gap: 5, height: 46 }}>
                {(['M', 'F'] as const).map(g => (
                  <button key={g} onClick={() => setGender(g)}
                    style={{ flex: 1, borderRadius: 13, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 800,
                      background: gender === g ? 'rgba(99,102,241,0.28)' : 'rgba(255,255,255,0.06)',
                      border: gender === g ? '1.5px solid rgba(99,102,241,0.5)' : '1px solid rgba(255,255,255,0.1)',
                      color: gender === g ? '#A5B4FC' : 'rgba(255,255,255,0.38)' }}>
                    {g === 'M' ? '♂ Male' : '♀ Female'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Phone */}
          <div style={{ marginBottom: 10 }}>
            <label style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.07em', display: 'flex', alignItems: 'center', gap: 5, marginBottom: 5 }}>
              <Phone style={{ width: 10, height: 10 }} /> Phone Number
            </label>
            <div style={{ display: 'flex', gap: 6 }}>
              <div style={{ width: 50, height: 46, borderRadius: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.6)' }}>
                +91
              </div>
              <input style={{ ...INPUT, flex: 1, width: 'auto' }} placeholder="98765 43210" type="tel" />
            </div>
          </div>

          {/* Address */}
          <div>
            <label style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.07em', display: 'flex', alignItems: 'center', gap: 5, marginBottom: 5 }}>
              <MapPin style={{ width: 10, height: 10 }} /> Address
            </label>
            <input style={INPUT} placeholder="Area / locality" />
          </div>
        </div>

        {/* ── BOOK BUTTON ── */}
        <button onClick={handleBook}
          style={{ width: '100%', height: 52, borderRadius: 16, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            fontSize: 14, fontWeight: 900, color: '#FFF', marginBottom: 18, transition: 'all 0.25s',
            background: booked
              ? 'linear-gradient(135deg, #16A34A, #22C55E)'
              : isEmerg
              ? 'linear-gradient(135deg, #DC2626, #EF4444)'
              : `linear-gradient(135deg, ${TEAL}, #0891B2)`,
            boxShadow: booked
              ? '0 4px 20px rgba(34,197,94,0.45)'
              : isEmerg
              ? '0 4px 20px rgba(239,68,68,0.45)'
              : '0 4px 20px rgba(13,148,136,0.45)' }}>
          {booked
            ? <><CheckCircle2 style={{ width: 18, height: 18 }} /> Token Booked!</>
            : <><UserPlus style={{ width: 18, height: 18 }} /> Book {tokenType} Token — FREE</>}
        </button>

        {/* ── RECENT WALK-INS ── */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
            <Footprints style={{ width: 11, height: 11, color: 'rgba(255,255,255,0.3)' }} />
            <span style={{ fontSize: 10, fontWeight: 800, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Recent Walk-ins Today</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {RECENT.map((r, i) => {
              const isE = r.type === 'Emergency';
              return (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 14, ...GLASS }}>
                  <div style={{ width: 38, height: 38, borderRadius: 11, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    background: isE ? 'rgba(239,68,68,0.2)' : 'rgba(13,148,136,0.2)',
                    border: `1px solid ${isE ? 'rgba(239,68,68,0.35)' : 'rgba(45,212,191,0.35)'}` }}>
                    <span style={{ fontSize: 11, fontWeight: 900, color: '#FFF', letterSpacing: '-0.3px' }}>{r.token}</span>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#FFF' }}>{r.name}</div>
                    <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', fontWeight: 500 }}>
                      {r.age}{r.gender} · <span style={{ color: isE ? '#F87171' : TEAL_LT }}>{r.type}</span>
                    </div>
                  </div>
                  <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)', fontWeight: 600 }}>{r.time}</span>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
