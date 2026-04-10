import React, { useState } from 'react';
import {
  User, UserPlus, Building2, Clock, IndianRupee, Users, Smartphone,
  Bell, Shield, LogOut, ChevronRight, Edit3, Sun, Moon,
  AlertCircle, BadgeCheck, MessageSquare, CalendarDays,
  Stethoscope, Phone, MapPin, ToggleLeft, Zap, Eye,
  CheckCircle2, Save, Camera, HeartPulse, Award, Plus, Trash2, Hospital, Link2, Map,
  House, CalendarClock, TrendingUp, SlidersHorizontal,
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
  height: 40, borderRadius: 11, border: '1px solid rgba(255,255,255,0.1)',
  background: 'rgba(255,255,255,0.07)', color: '#FFF', fontSize: 12, fontWeight: 600,
  padding: '0 12px', outline: 'none', fontFamily: "'Inter', sans-serif",
  width: '100%', boxSizing: 'border-box' as const,
};

/* ─── Toggle switch ─── */
function Toggle({ on, onChange, color = TEAL }: { on: boolean; onChange: () => void; color?: string }) {
  return (
    <div onClick={onChange} style={{ width: 44, height: 24, borderRadius: 12, cursor: 'pointer', position: 'relative', flexShrink: 0, transition: 'background 0.25s',
      background: on ? color : 'rgba(255,255,255,0.12)', border: `1px solid ${on ? color : 'rgba(255,255,255,0.15)'}` }}>
      <div style={{ position: 'absolute', top: 2, left: on ? 22 : 2, width: 18, height: 18, borderRadius: '50%', background: '#FFF',
        transition: 'left 0.25s', boxShadow: '0 1px 4px rgba(0,0,0,0.4)' }} />
    </div>
  );
}

/* ─── Section header ─── */
function SectionHead({ icon: Icon, label, color }: { icon: React.ElementType; label: string; color: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 7, margin: '18px 0 8px' }}>
      <div style={{ width: 26, height: 26, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: `${color}22`, border: `1px solid ${color}44` }}>
        <Icon style={{ width: 13, height: 13, color }} />
      </div>
      <span style={{ fontSize: 10, fontWeight: 800, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{label}</span>
    </div>
  );
}

/* ─── Fee row ─── */
function FeeRow({ icon: Icon, label, sub, value, color }: { icon: React.ElementType; label: string; sub: string; value: string; color: string }) {
  const [val, setVal] = useState(value);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
      <div style={{ width: 34, height: 34, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        background: `${color}1A`, border: `1px solid ${color}33` }}>
        <Icon style={{ width: 14, height: 14, color }} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#FFF', marginBottom: 1 }}>{label}</div>
        <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', fontWeight: 500 }}>{sub}</div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
        <span style={{ fontSize: 13, fontWeight: 800, color }}>₹</span>
        <input value={val} onChange={e => setVal(e.target.value)}
          style={{ ...INPUT, width: 60, textAlign: 'right', color, fontWeight: 800, fontSize: 13, padding: '0 6px' }} />
      </div>
    </div>
  );
}

/* ─── Row item ─── */
function RowItem({ icon: Icon, label, sub, right, color = 'rgba(255,255,255,0.3)' }: {
  icon: React.ElementType; label: string; sub?: string; right: React.ReactNode; color?: string;
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
      <div style={{ width: 34, height: 34, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.07)' }}>
        <Icon style={{ width: 14, height: 14, color }} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: '#FFF' }}>{label}</div>
        {sub && <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', fontWeight: 500, marginTop: 1 }}>{sub}</div>}
      </div>
      {right}
    </div>
  );
}

/* ─── Profile form field ─── */
function ProfileField({ icon: Icon, label, color, defaultValue, type = 'text', suffix, hint }: {
  icon: React.ElementType; label: string; color: string; defaultValue: string;
  type?: string; suffix?: string; hint?: string;
}) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 5, display: 'flex', alignItems: 'center', gap: 5 }}>
        <Icon style={{ width: 9, height: 9, color }} /> {label}
      </div>
      <div style={{ position: 'relative' }}>
        <input type={type} defaultValue={defaultValue}
          style={{ ...INPUT, paddingRight: suffix ? 52 : 12 }} />
        {suffix && (
          <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.25)', pointerEvents: 'none' }}>
            {suffix}
          </span>
        )}
      </div>
      {hint && <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.2)', marginTop: 3, fontWeight: 600 }}>{hint}</div>}
    </div>
  );
}

/* ─── Shift block ─── */
function ShiftBlock({ icon: Icon, label, color, defaultOn }: { icon: React.ElementType; label: string; color: string; defaultOn: boolean }) {
  const [on, setOn] = useState(defaultOn);
  const [start, setStart] = useState(label === 'Morning' ? '09:00' : '17:00');
  const [end,   setEnd]   = useState(label === 'Morning' ? '13:00' : '21:00');
  const [max,   setMax]   = useState(label === 'Morning' ? '20' : '15');
  return (
    <div style={{ borderRadius: 16, padding: '11px 12px', marginBottom: 8, border: `1px solid ${on ? `${color}33` : 'rgba(255,255,255,0.07)'}`,
      background: on ? `${color}0D` : 'rgba(255,255,255,0.03)', transition: 'all 0.3s' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: on ? 10 : 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Icon style={{ width: 14, height: 14, color: on ? color : 'rgba(255,255,255,0.3)' }} />
          <span style={{ fontSize: 12, fontWeight: 800, color: on ? '#FFF' : 'rgba(255,255,255,0.4)' }}>{label} Shift</span>
          {on && <span style={{ fontSize: 9, fontWeight: 700, padding: '1px 6px', borderRadius: 6, background: `${color}22`, color }}>Active</span>}
        </div>
        <Toggle on={on} onChange={() => setOn(p => !p)} color={color} />
      </div>
      {on && (
        <div style={{ display: 'flex', gap: 8 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', fontWeight: 700, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Start</div>
            <input type="time" value={start} onChange={e => setStart(e.target.value)} style={{ ...INPUT, fontSize: 11 }} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', fontWeight: 700, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>End</div>
            <input type="time" value={end} onChange={e => setEnd(e.target.value)} style={{ ...INPUT, fontSize: 11 }} />
          </div>
          <div style={{ width: 60 }}>
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', fontWeight: 700, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Max Tokens</div>
            <input value={max} onChange={e => setMax(e.target.value)} style={{ ...INPUT, textAlign: 'center', fontSize: 13, fontWeight: 800, color }} />
          </div>
        </div>
      )}
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

export function Settings() {
  const [clinics, setClinics] = useState([
    { name: 'Sharma Heart Clinic', address: 'Andheri West, Mumbai', phone: '+91 22 1234 5678', mapLink: 'https://maps.google.com/?q=Sharma+Heart+Clinic+Andheri', active: true },
    { name: 'City Cardiac Centre', address: 'Bandra East, Mumbai',  phone: '+91 22 9876 5432', mapLink: '',                                                              active: true },
  ]);
  const [activeClinic, setActiveClinic] = useState(0);

  const addClinic = () => {
    if (clinics.length < 3) setClinics(prev => [...prev, { name: '', address: '', phone: '', mapLink: '', active: true }]);
  };
  const removeClinic = (idx: number) => {
    if (clinics.length <= 1) return;
    setClinics(prev => prev.filter((_, i) => i !== idx));
    setActiveClinic(0);
  };
  const updateClinic = (idx: number, field: string, val: string | boolean) => {
    setClinics(prev => prev.map((c, i) => i === idx ? { ...c, [field]: val } : c));
  };

  const [onlineBooking, setOnlineBooking]   = useState(true);
  const [emergencyOn,   setEmergencyOn]     = useState(true);
  const [showWait,      setShowWait]        = useState(true);
  const [showPosition,  setShowPosition]    = useState(true);
  const [showDoctorName,setShowDoctorName]  = useState(true);
  const [showFee,       setShowFee]         = useState(true);
  const [alertMsg,      setAlertMsg]        = useState('Your turn is coming soon. Please be ready at the clinic.');
  const [notifSound,    setNotifSound]      = useState(true);
  const [notifVibrate,  setNotifVibrate]    = useState(true);
  const [saved,         setSaved]           = useState(false);

  const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };

  return (
    <div style={{ width: 390, height: 844, background: BG, fontFamily: "'Inter', sans-serif",
      display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>

      {/* Glow orbs */}
      <div style={{ position: 'absolute', top: -60, right: -60, width: 220, height: 220, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(13,148,136,0.18) 0%, transparent 65%)', filter: 'blur(40px)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: 100, left: -40, width: 160, height: 160, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(99,102,241,0.1) 0%, transparent 70%)', filter: 'blur(30px)', pointerEvents: 'none' }} />

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

      {/* Header */}
      <div style={{ padding: '10px 16px 6px', flexShrink: 0 }}>
        <div style={{ fontSize: 18, fontWeight: 900, color: '#FFF', letterSpacing: '-0.5px' }}>Settings</div>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', fontWeight: 500 }}>Manage clinic, fees & patient app</div>
      </div>

      {/* Scrollable */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 14px 90px' }}>

        {/* ── DOCTOR PROFILE ── */}
        <SectionHead icon={User} label="Doctor Profile" color="#818CF8" />
        <div style={{ borderRadius: 18, padding: '14px 12px', ...GLASS, display: 'flex', flexDirection: 'column', gap: 0 }}>

          {/* Photo row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingBottom: 14, marginBottom: 14, borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <img src="https://randomuser.me/api/portraits/women/44.jpg" alt="Dr. Sharma"
                style={{ width: 60, height: 60, borderRadius: 18, objectFit: 'cover', border: '2px solid rgba(45,212,191,0.4)' }} />
              <div style={{ position: 'absolute', bottom: -4, right: -4, width: 22, height: 22, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: TEAL, border: '2px solid #070B14', cursor: 'pointer' }}>
                <Camera style={{ width: 10, height: 10, color: '#FFF' }} />
              </div>
            </div>
            <div>
              <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 3 }}>Profile Photo</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', fontWeight: 500 }}>Tap camera icon to update</div>
              <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.2)', marginTop: 2 }}>JPG or PNG · Max 2 MB</div>
            </div>
          </div>

          {/* Full Name */}
          <ProfileField icon={User} label="Full Name" color="#818CF8" defaultValue="Dr. Ananya Sharma" />

          {/* Qualifications */}
          <ProfileField icon={Award} label="Qualifications" color="#A5B4FC" defaultValue="MBBS, MD, DM – Cardiology" />

          {/* Specialisation */}
          <ProfileField icon={Stethoscope} label="Specialisation" color={TEAL_LT} defaultValue="Cardiologist" />

          {/* Experience */}
          <ProfileField icon={CalendarDays} label="Years of Experience" color="#FCD34D" defaultValue="10" type="number" suffix="yrs" />

          {/* Patients Consulted */}
          <ProfileField icon={HeartPulse} label="Patients Consulted (Total)" color="#F87171" defaultValue="12450" type="number" suffix="patients" hint="Displayed on your public profile" />

          {/* Mobile */}
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 5, display: 'flex', alignItems: 'center', gap: 5 }}>
              <Phone style={{ width: 9, height: 9, color: '#4ADE80' }} /> Registered Mobile
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <div style={{ width: 46, height: 40, borderRadius: 11, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.55)' }}>
                +91
              </div>
              <input style={{ ...INPUT }} defaultValue="98765 00001" type="tel" />
            </div>
          </div>

          {/* About / Bio */}
          <div>
            <div style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 5,
              display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <MessageSquare style={{ width: 9, height: 9, color: '#67E8F9' }} /> About / Bio
              </div>
              <span style={{ fontSize: 8, color: TEAL_LT, fontWeight: 700, textTransform: 'none' }}>Shown to patients</span>
            </div>
            <textarea defaultValue="Cardiologist with 10+ years of clinical expertise in interventional cardiology and heart disease management. Committed to patient-centric care with over 12,000 successful consultations at Sharma Heart Clinic, Andheri West."
              style={{ width: '100%', borderRadius: 12, border: '1px solid rgba(255,255,255,0.1)',
                background: 'rgba(255,255,255,0.07)', color: '#FFF', fontSize: 11, fontWeight: 500,
                padding: '10px 12px', outline: 'none', resize: 'none', height: 82,
                fontFamily: "'Inter', sans-serif", boxSizing: 'border-box', lineHeight: 1.6 }} />
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.2)', marginTop: 3, fontWeight: 600 }}>This description appears on your clinic page in the patient app</div>
          </div>

        </div>

        {/* ── CLINIC INFO ── */}
        <SectionHead icon={Building2} label="Clinic Info" color="#67E8F9" />

        {/* Clinic tab selector + Add button */}
        <div style={{ display: 'flex', gap: 5, marginBottom: 8 }}>
          {clinics.map((c, i) => (
            <button key={i} onClick={() => setActiveClinic(i)}
              style={{ flex: 1, height: 38, borderRadius: 12, cursor: 'pointer', fontSize: 11, fontWeight: 800, transition: 'all 0.2s',
                background: activeClinic === i
                  ? (c.active ? 'rgba(103,232,249,0.2)' : 'rgba(239,68,68,0.15)')
                  : 'rgba(255,255,255,0.05)',
                border: activeClinic === i
                  ? `1.5px solid ${c.active ? 'rgba(103,232,249,0.45)' : 'rgba(239,68,68,0.4)'}`
                  : '1.5px solid rgba(255,255,255,0.08)',
                color: activeClinic === i ? '#FFF' : 'rgba(255,255,255,0.35)' }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: activeClinic === i ? (c.active ? '#67E8F9' : '#F87171') : 'rgba(255,255,255,0.2)', marginBottom: 1 }}>
                {c.active ? '● Active' : '○ Off'}
              </div>
              Clinic {i + 1}
            </button>
          ))}
          {clinics.length < 3 && (
            <button onClick={addClinic}
              style={{ width: 38, height: 38, borderRadius: 12, border: '1.5px dashed rgba(103,232,249,0.3)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'rgba(103,232,249,0.06)', flexShrink: 0 }}>
              <Plus style={{ width: 14, height: 14, color: 'rgba(103,232,249,0.6)' }} />
            </button>
          )}
        </div>

        {/* Active clinic form */}
        {clinics[activeClinic] && (
          <div style={{ borderRadius: 18, padding: '12px', ...GLASS }}>
            {/* Active toggle + remove */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, paddingBottom: 10, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Hospital style={{ width: 13, height: 13, color: '#67E8F9' }} />
                <span style={{ fontSize: 12, fontWeight: 800, color: '#FFF' }}>Clinic {activeClinic + 1}</span>
                <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 7px', borderRadius: 6,
                  background: clinics[activeClinic].active ? 'rgba(74,222,128,0.15)' : 'rgba(239,68,68,0.15)',
                  color: clinics[activeClinic].active ? '#4ADE80' : '#F87171',
                  border: clinics[activeClinic].active ? '1px solid rgba(74,222,128,0.3)' : '1px solid rgba(239,68,68,0.3)' }}>
                  {clinics[activeClinic].active ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {clinics.length > 1 && (
                  <button onClick={() => removeClinic(activeClinic)}
                    style={{ width: 28, height: 28, borderRadius: 8, border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.1)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Trash2 style={{ width: 11, height: 11, color: '#F87171' }} />
                  </button>
                )}
                <Toggle on={clinics[activeClinic].active} onChange={() => updateClinic(activeClinic, 'active', !clinics[activeClinic].active)} />
              </div>
            </div>

            {/* Clinic Name */}
            <div style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 5, display: 'flex', alignItems: 'center', gap: 5 }}>
                <Building2 style={{ width: 9, height: 9, color: '#67E8F9' }} /> Clinic Name
              </div>
              <input style={INPUT} value={clinics[activeClinic].name} placeholder="e.g. Sharma Heart Clinic"
                onChange={e => updateClinic(activeClinic, 'name', e.target.value)} />
            </div>

            {/* Address */}
            <div style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 5, display: 'flex', alignItems: 'center', gap: 5 }}>
                <MapPin style={{ width: 9, height: 9, color: '#A5B4FC' }} /> Address
              </div>
              <input style={INPUT} value={clinics[activeClinic].address} placeholder="Area / locality, City"
                onChange={e => updateClinic(activeClinic, 'address', e.target.value)} />
            </div>

            {/* Phone */}
            <div style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 5, display: 'flex', alignItems: 'center', gap: 5 }}>
                <Phone style={{ width: 9, height: 9, color: '#4ADE80' }} /> Clinic Phone
              </div>
              <input style={INPUT} value={clinics[activeClinic].phone} placeholder="+91 XX XXXX XXXX"
                onChange={e => updateClinic(activeClinic, 'phone', e.target.value)} />
            </div>

            {/* Google Maps link */}
            <div>
              <div style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <Map style={{ width: 9, height: 9, color: '#F87171' }} /> Google Maps Link
                </div>
                {clinics[activeClinic].mapLink && (
                  <a href={clinics[activeClinic].mapLink} target="_blank" rel="noreferrer"
                    style={{ fontSize: 8, color: TEAL_LT, fontWeight: 700, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 3 }}>
                    <Link2 style={{ width: 8, height: 8 }} /> Preview
                  </a>
                )}
              </div>
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                  <Map style={{ width: 13, height: 13, color: clinics[activeClinic].mapLink ? '#F87171' : 'rgba(255,255,255,0.2)' }} />
                </div>
                <input
                  style={{ ...INPUT, paddingLeft: 32 }}
                  value={clinics[activeClinic].mapLink}
                  placeholder="Paste Google Maps link here…"
                  onChange={e => updateClinic(activeClinic, 'mapLink', e.target.value)}
                />
              </div>
              <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.18)', marginTop: 4, fontWeight: 600 }}>
                Shown to patients as "Get Directions" on the booking screen
              </div>
            </div>
          </div>
        )}

        {/* ── SHIFT TIMINGS ── */}
        <SectionHead icon={Clock} label="Shift Timings & Capacity" color="#FCD34D" />
        <ShiftBlock icon={Sun}  label="Morning" color="#F59E0B" defaultOn={true}  />
        <ShiftBlock icon={Moon} label="Evening" color="#818CF8" defaultOn={true}  />
        <div style={{ borderRadius: 14, padding: '9px 12px', ...GLASS, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#FFF', marginBottom: 2 }}>Working Days</div>
            <div style={{ display: 'flex', gap: 4, marginTop: 4 }}>
              {['M','T','W','T','F','S','S'].map((d,i) => (
                <div key={i} style={{ width: 24, height: 24, borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 800,
                  background: i < 6 ? 'rgba(13,148,136,0.25)' : 'rgba(255,255,255,0.06)',
                  color: i < 6 ? TEAL_LT : 'rgba(255,255,255,0.2)',
                  border: i < 6 ? '1px solid rgba(45,212,191,0.3)' : '1px solid rgba(255,255,255,0.08)' }}>{d}</div>
              ))}
            </div>
          </div>
          <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', fontWeight: 600 }}>Tap to edit</div>
        </div>

        {/* ── FEE STRUCTURE ── */}
        <SectionHead icon={IndianRupee} label="Fee Structure" color="#4ADE80" />
        <div style={{ borderRadius: 18, overflow: 'hidden', ...GLASS }}>
          <FeeRow icon={Smartphone}  label="Online Normal Token"    sub="E-Appointment fee (patient pays)"   value="10"  color="#4ADE80" />
          <FeeRow icon={AlertCircle} label="Online Emergency Token" sub="Priority booking fee (patient pays)" value="20"  color="#F87171" />
          <div style={{ padding: '8px 12px 10px', background: 'rgba(45,212,191,0.06)' }}>
            <div style={{ fontSize: 9, color: 'rgba(45,212,191,0.6)', fontWeight: 700 }}>
              Platform fee ₹10 auto-added on all online tokens.
            </div>
          </div>
        </div>

        {/* ── ONLINE TOKEN SETTINGS ── */}
        <SectionHead icon={Smartphone} label="Online Token Settings" color="#818CF8" />
        <div style={{ borderRadius: 18, overflow: 'hidden', ...GLASS }}>
          <RowItem icon={Smartphone}  label="Online Token Booking"   sub="Allow patients to book via app"        color="#818CF8"
            right={<Toggle on={onlineBooking}  onChange={() => setOnlineBooking(p => !p)}  />} />
          <RowItem icon={AlertCircle} label="Emergency Token Booking" sub="Patients can book emergency tokens"    color="#F87171"
            right={<Toggle on={emergencyOn}    onChange={() => setEmergencyOn(p => !p)}    color="#EF4444" />} />
        </div>

        {/* ── PATIENT APP VISIBILITY ── */}
        <SectionHead icon={Eye} label="Patient App — Visible Info" color="#F9A8D4" />
        <div style={{ borderRadius: 18, overflow: 'hidden', ...GLASS }}>
          <RowItem icon={Clock}        label="Show Estimated Wait Time"   sub="Patients see approx. wait minutes" color={TEAL_LT}
            right={<Toggle on={showWait}       onChange={() => setShowWait(p => !p)}       />} />
          <RowItem icon={Users}        label="Show Queue Position"        sub="Patients see their token position" color="#A5B4FC"
            right={<Toggle on={showPosition}   onChange={() => setShowPosition(p => !p)}   />} />
          <RowItem icon={User}         label="Show Doctor Name"           sub="Display name on patient booking"   color="#FCD34D"
            right={<Toggle on={showDoctorName} onChange={() => setShowDoctorName(p => !p)} color="#F59E0B" />} />
          <RowItem icon={IndianRupee}  label="Show Fee on Booking Screen" sub="Patients see fee breakdown"        color="#4ADE80"
            right={<Toggle on={showFee}        onChange={() => setShowFee(p => !p)}        />} />
        </div>

        {/* ── ALERT MESSAGE TEMPLATE ── */}
        <SectionHead icon={MessageSquare} label="Send Alert Message Template" color="#67E8F9" />
        <div style={{ borderRadius: 18, padding: '12px', ...GLASS }}>
          <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', fontWeight: 700, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
            Sent to patient when "Send Alert" is tapped
          </div>
          <textarea value={alertMsg} onChange={e => setAlertMsg(e.target.value)}
            style={{ width: '100%', borderRadius: 12, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.07)',
              color: '#FFF', fontSize: 12, fontWeight: 500, padding: '10px 12px', outline: 'none', resize: 'none', height: 70,
              fontFamily: "'Inter', sans-serif", boxSizing: 'border-box' }} />
          <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.2)', marginTop: 4 }}>Max 160 characters · {alertMsg.length}/160</div>
        </div>

        {/* ── NOTIFICATIONS ── */}
        <SectionHead icon={Bell} label="Notifications" color="#FCD34D" />
        <div style={{ borderRadius: 18, overflow: 'hidden', ...GLASS }}>
          <RowItem icon={Bell}   label="Sound Alerts"   sub="Play sound for new bookings & actions" color="#FCD34D"
            right={<Toggle on={notifSound}   onChange={() => setNotifSound(p => !p)}   color="#F59E0B" />} />
          <RowItem icon={Zap}    label="Vibration"      sub="Vibrate on queue updates"              color="#FB923C"
            right={<Toggle on={notifVibrate} onChange={() => setNotifVibrate(p => !p)} color="#EA580C" />} />
          <RowItem icon={Shield} label="Privacy & Security" sub="Change PIN · 2-step verification"  color="#A5B4FC"
            right={<ChevronRight style={{ width: 14, height: 14, color: 'rgba(255,255,255,0.2)' }} />} />
        </div>

        {/* ── SAVE BUTTON ── */}
        <button onClick={handleSave}
          style={{ width: '100%', height: 50, borderRadius: 16, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            fontSize: 14, fontWeight: 900, color: '#FFF', marginTop: 18, marginBottom: 10,
            background: saved ? 'linear-gradient(135deg, #16A34A, #22C55E)' : `linear-gradient(135deg, ${TEAL}, #0891B2)`,
            boxShadow: saved ? '0 4px 20px rgba(34,197,94,0.4)' : '0 4px 20px rgba(13,148,136,0.4)',
            transition: 'all 0.25s' }}>
          {saved ? <><CheckCircle2 style={{ width: 17, height: 17 }} /> Changes Saved!</> : <><Save style={{ width: 17, height: 17 }} /> Save All Settings</>}
        </button>

        {/* Logout */}
        <button style={{ width: '100%', height: 46, borderRadius: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
          fontSize: 13, fontWeight: 800, color: '#F87171', background: 'rgba(239,68,68,0.1)', border: '1.5px solid rgba(239,68,68,0.25)' }}>
          <LogOut style={{ width: 15, height: 15 }} /> Logout
        </button>
      </div>

      {/* ── NAV BAR ── */}
      <DocNavBar active="settings" />
    </div>
  );
}
