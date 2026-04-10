import React, { useState } from 'react';
import {
  User, Building2, IndianRupee, Bell, Shield, LogOut, ChevronRight,
  Camera, Phone, Lock, Smartphone, HelpCircle, FileText, Star,
  Trash2, BadgeCheck, CalendarDays, SlidersHorizontal,
  House, CalendarClock, TrendingUp, CreditCard, Landmark,
  UserCog, MessageSquare, AlertTriangle, ChevronDown, X,
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

/* ── DocNavBar ── */
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

/* ── Section header ── */
function SectionLabel({ label }: { label: string }) {
  return (
    <div style={{ fontSize: 9, fontWeight: 800, color: 'rgba(255,255,255,0.28)', textTransform: 'uppercase',
      letterSpacing: '0.1em', marginBottom: 6, marginTop: 18, paddingLeft: 2 }}>
      {label}
    </div>
  );
}

/* ── Settings row ── */
function SettingRow({
  icon: Icon, iconBg, iconColor, label, sub, badge, right, danger = false, last = false,
}: {
  icon: React.ElementType; iconBg: string; iconColor: string;
  label: string; sub?: string; badge?: string;
  right?: React.ReactNode; danger?: boolean; last?: boolean;
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 14px',
      borderBottom: last ? 'none' : '1px solid rgba(255,255,255,0.045)', cursor: 'pointer' }}>
      <div style={{ width: 36, height: 36, borderRadius: 11, display: 'flex', alignItems: 'center',
        justifyContent: 'center', flexShrink: 0, background: iconBg, border: `1px solid ${iconColor}33` }}>
        <Icon style={{ width: 16, height: 16, color: iconColor }} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: danger ? '#F87171' : '#FFF', lineHeight: 1.2 }}>{label}</div>
        {sub && <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.32)', fontWeight: 500, marginTop: 2 }}>{sub}</div>}
      </div>
      {badge && (
        <span style={{ fontSize: 9, fontWeight: 800, padding: '2px 7px', borderRadius: 20,
          background: 'rgba(45,212,191,0.15)', color: TEAL_LT, border: `1px solid rgba(45,212,191,0.3)`,
          flexShrink: 0 }}>
          {badge}
        </span>
      )}
      {right ?? <ChevronRight style={{ width: 15, height: 15, color: 'rgba(255,255,255,0.2)', flexShrink: 0 }} />}
    </div>
  );
}

/* ── Toggle ── */
function Toggle({ on, onChange }: { on: boolean; onChange: () => void }) {
  return (
    <div onClick={e => { e.stopPropagation(); onChange(); }}
      style={{ width: 40, height: 22, borderRadius: 11, cursor: 'pointer', position: 'relative', flexShrink: 0, transition: 'background 0.25s',
        background: on ? TEAL : 'rgba(255,255,255,0.12)', border: `1px solid ${on ? TEAL : 'rgba(255,255,255,0.15)'}` }}>
      <div style={{ position: 'absolute', top: 2, left: on ? 19 : 2, width: 16, height: 16, borderRadius: '50%',
        background: '#FFF', transition: 'left 0.25s', boxShadow: '0 1px 4px rgba(0,0,0,0.4)' }} />
    </div>
  );
}

/* ── Logout confirmation sheet ── */
function LogoutSheet({ onClose }: { onClose: () => void }) {
  return (
    <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)',
      WebkitBackdropFilter: 'blur(6px)', zIndex: 50, display: 'flex', alignItems: 'flex-end' }}>
      <div style={{ width: '100%', borderRadius: '24px 24px 0 0', padding: '24px 20px 32px',
        background: 'linear-gradient(180deg,#111827 0%,#0A0F1E 100%)', border: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ width: 36, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.15)', margin: '0 auto 20px' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
          <div style={{ width: 44, height: 44, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)' }}>
            <LogOut style={{ width: 20, height: 20, color: '#F87171' }} />
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 800, color: '#FFF' }}>Log Out?</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>You'll need to sign in again to access your account.</div>
          </div>
        </div>
        <button style={{ width: '100%', height: 48, borderRadius: 14, border: 'none', cursor: 'pointer', fontWeight: 800, fontSize: 14,
          background: 'linear-gradient(135deg,#EF4444,#DC2626)', color: '#FFF', marginBottom: 10,
          fontFamily: "'Inter', sans-serif" }}>
          Yes, Log Out
        </button>
        <button onClick={onClose} style={{ width: '100%', height: 44, borderRadius: 14, border: '1px solid rgba(255,255,255,0.1)',
          cursor: 'pointer', fontWeight: 700, fontSize: 13, background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.6)',
          fontFamily: "'Inter', sans-serif" }}>
          Cancel
        </button>
      </div>
    </div>
  );
}

export function Settings() {
  const [notifBooking,   setNotifBooking]   = useState(true);
  const [notifEmergency, setNotifEmergency] = useState(true);
  const [notifPayout,    setNotifPayout]    = useState(true);
  const [showLogout,     setShowLogout]     = useState(false);

  return (
    <div style={{ width: 390, height: 844, background: BG, fontFamily: "'Inter', sans-serif",
      display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>

      {/* Glow orbs */}
      <div style={{ position: 'absolute', top: -80, right: -60, width: 240, height: 240, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(13,148,136,0.16) 0%, transparent 65%)', filter: 'blur(40px)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: 140, left: -50, width: 180, height: 180, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(99,102,241,0.1) 0%, transparent 70%)', filter: 'blur(30px)', pointerEvents: 'none' }} />

      {/* Status bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px 0', flexShrink: 0 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.55)' }}>9:41</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          {[0.4,0.65,0.9,1].map((op,i) => <div key={i} style={{ width: 3, height: 6+i*2, borderRadius: 2, background: `rgba(255,255,255,${op})` }} />)}
          <div style={{ width: 6 }} />
          <svg width="16" height="11" viewBox="0 0 16 11" fill="none"><path d="M8 2C10.4 2 12.6 3 14.1 4.7L15.5 3.2C13.6 1.2 10.9 0 8 0C5.1 0 2.4 1.2 0.5 3.2L1.9 4.7C3.4 3 5.6 2 8 2Z" fill="white" opacity="0.4"/><path d="M8 5C9.7 5 11.2 5.7 12.3 6.8L13.7 5.3C12.2 3.9 10.2 3.9 8 3C5.8 3 3.8 3.9 2.3 5.3L3.7 6.8C4.8 5.7 6.3 5 8 5Z" fill="white" opacity="0.7"/><circle cx="8" cy="9.5" r="1.5" fill="white"/></svg>
          <div style={{ width: 4 }} />
          <svg width="24" height="12" viewBox="0 0 24 12" fill="none"><rect x="0.5" y="0.5" width="20" height="11" rx="3.5" stroke="white" strokeOpacity="0.3"/><rect x="2" y="2" width="14" height="8" rx="2" fill="white" fillOpacity="0.85"/></svg>
        </div>
      </div>

      {/* Page header */}
      <div style={{ padding: '10px 16px 6px', flexShrink: 0 }}>
        <div style={{ fontSize: 22, fontWeight: 900, color: '#FFF', letterSpacing: '-0.5px' }}>Settings</div>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', fontWeight: 500 }}>Account, clinic & preferences</div>
      </div>

      {/* Scrollable body */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '4px 14px 90px' }}>

        {/* ── PROFILE HERO CARD ── */}
        <div style={{ borderRadius: 20, padding: '16px 14px', ...GLASS, marginTop: 8,
          background: 'linear-gradient(135deg, rgba(13,148,136,0.14) 0%, rgba(255,255,255,0.04) 100%)',
          border: '1px solid rgba(45,212,191,0.2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            {/* Avatar */}
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <img src="https://randomuser.me/api/portraits/women/44.jpg" alt="Dr. Sharma"
                style={{ width: 68, height: 68, borderRadius: 20, objectFit: 'cover',
                  border: '2.5px solid rgba(45,212,191,0.45)', boxShadow: '0 0 20px rgba(13,148,136,0.35)' }} />
              <div style={{ position: 'absolute', bottom: -5, right: -5, width: 24, height: 24, borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: TEAL, border: '2px solid #070B14', cursor: 'pointer', boxShadow: '0 2px 8px rgba(13,148,136,0.5)' }}>
                <Camera style={{ width: 11, height: 11, color: '#FFF' }} />
              </div>
            </div>
            {/* Info */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                <div style={{ fontSize: 16, fontWeight: 900, color: '#FFF', letterSpacing: '-0.3px' }}>Dr. Ananya Sharma</div>
                <BadgeCheck style={{ width: 16, height: 16, color: TEAL_LT, flexShrink: 0 }} />
              </div>
              <div style={{ fontSize: 11, color: TEAL_LT, fontWeight: 700, marginBottom: 4 }}>Cardiologist · MBBS, MD, DM</div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 8px', borderRadius: 20,
                  background: 'rgba(45,212,191,0.12)', color: TEAL_LT, border: '1px solid rgba(45,212,191,0.25)' }}>
                  ● Online
                </span>
                <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 8px', borderRadius: 20,
                  background: 'rgba(129,140,248,0.12)', color: '#A5B4FC', border: '1px solid rgba(129,140,248,0.25)' }}>
                  10 yrs exp
                </span>
                <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 8px', borderRadius: 20,
                  background: 'rgba(251,191,36,0.1)', color: '#FCD34D', border: '1px solid rgba(251,191,36,0.25)' }}>
                  ★ 4.9
                </span>
              </div>
            </div>
          </div>

          {/* Stats strip */}
          <div style={{ display: 'flex', marginTop: 14, paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.07)', gap: 0 }}>
            {[
              { label: 'Patients', value: '12.4k' },
              { label: 'Clinics',  value: '2 Active' },
              { label: 'Rating',   value: '4.9 / 5' },
            ].map((s, i) => (
              <div key={i} style={{ flex: 1, textAlign: 'center', borderRight: i < 2 ? '1px solid rgba(255,255,255,0.07)' : 'none' }}>
                <div style={{ fontSize: 14, fontWeight: 900, color: '#FFF' }}>{s.value}</div>
                <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)', fontWeight: 600, marginTop: 1 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── ACCOUNT ── */}
        <SectionLabel label="Account" />
        <div style={{ borderRadius: 18, overflow: 'hidden', ...GLASS }}>
          <SettingRow
            icon={UserCog} iconBg="rgba(129,140,248,0.15)" iconColor="#818CF8"
            label="Manage Profile"
            sub="Name, qualifications, bio & photo"
          />
          <SettingRow
            icon={Lock} iconBg="rgba(251,191,36,0.12)" iconColor="#FCD34D"
            label="Change Password"
            sub="Update your login password"
          />
          <SettingRow
            icon={Smartphone} iconBg="rgba(74,222,128,0.12)" iconColor="#4ADE80"
            label="Linked Devices"
            sub="2 devices active"
            badge="2"
          />
          <SettingRow
            icon={Phone} iconBg="rgba(103,232,249,0.12)" iconColor="#67E8F9"
            label="Registered Mobile"
            sub="+91 98765 00001"
            last
          />
        </div>

        {/* ── PRACTICE ── */}
        <SectionLabel label="Practice" />
        <div style={{ borderRadius: 18, overflow: 'hidden', ...GLASS }}>
          <SettingRow
            icon={Building2} iconBg="rgba(103,232,249,0.12)" iconColor="#67E8F9"
            label="Manage Clinics"
            sub="2 clinics configured"
            badge="2"
          />
          <SettingRow
            icon={CalendarDays} iconBg="rgba(45,212,191,0.12)" iconColor={TEAL_LT}
            label="Schedule & Availability"
            sub="Shifts, days off & max tokens"
          />
          <SettingRow
            icon={IndianRupee} iconBg="rgba(251,191,36,0.12)" iconColor="#FCD34D"
            label="Fee Structure"
            sub="Normal ₹10 · Emergency ₹20"
            last
          />
        </div>

        {/* ── BANK & PAYMENTS ── */}
        <SectionLabel label="Bank & Payments" />
        <div style={{ borderRadius: 18, overflow: 'hidden', ...GLASS }}>
          <SettingRow
            icon={Landmark} iconBg="rgba(45,212,191,0.12)" iconColor={TEAL_LT}
            label="Bank Account"
            sub="HDFC ••4782 — Settlement every Tuesday"
            badge="Linked"
          />
          <SettingRow
            icon={CreditCard} iconBg="rgba(129,140,248,0.12)" iconColor="#A5B4FC"
            label="Payout Settings"
            sub="Auto-settlement · Weekly cycle"
            last
          />
        </div>

        {/* ── NOTIFICATIONS ── */}
        <SectionLabel label="Notifications" />
        <div style={{ borderRadius: 18, overflow: 'hidden', ...GLASS }}>
          <SettingRow
            icon={Bell} iconBg="rgba(45,212,191,0.12)" iconColor={TEAL_LT}
            label="New Booking Alerts"
            sub="Notify when a token is booked"
            right={<Toggle on={notifBooking} onChange={() => setNotifBooking(p => !p)} />}
          />
          <SettingRow
            icon={AlertTriangle} iconBg="rgba(239,68,68,0.12)" iconColor="#F87171"
            label="Emergency Alerts"
            sub="High-priority push notifications"
            right={<Toggle on={notifEmergency} onChange={() => setNotifEmergency(p => !p)} />}
          />
          <SettingRow
            icon={IndianRupee} iconBg="rgba(251,191,36,0.12)" iconColor="#FCD34D"
            label="Payout Notifications"
            sub="Settlement & transfer updates"
            right={<Toggle on={notifPayout} onChange={() => setNotifPayout(p => !p)} />}
            last
          />
        </div>

        {/* ── SUPPORT ── */}
        <SectionLabel label="Support & Legal" />
        <div style={{ borderRadius: 18, overflow: 'hidden', ...GLASS }}>
          <SettingRow
            icon={HelpCircle} iconBg="rgba(103,232,249,0.12)" iconColor="#67E8F9"
            label="Help & Support"
            sub="Chat, call or raise a ticket"
          />
          <SettingRow
            icon={MessageSquare} iconBg="rgba(129,140,248,0.12)" iconColor="#818CF8"
            label="Send Feedback"
            sub="Help us improve LINESETU"
          />
          <SettingRow
            icon={Star} iconBg="rgba(251,191,36,0.12)" iconColor="#FCD34D"
            label="Rate the App"
            sub="Love the app? Leave a review"
          />
          <SettingRow
            icon={FileText} iconBg="rgba(255,255,255,0.07)" iconColor="rgba(255,255,255,0.4)"
            label="Terms & Privacy Policy"
            sub="v2.1.0 · Last updated Jan 2026"
            last
          />
        </div>

        {/* ── DANGER ZONE ── */}
        <SectionLabel label="Account Actions" />
        <div style={{ borderRadius: 18, overflow: 'hidden', ...GLASS }}>
          <SettingRow
            icon={LogOut} iconBg="rgba(239,68,68,0.12)" iconColor="#F87171"
            label="Log Out"
            danger
            right={<ChevronRight style={{ width: 15, height: 15, color: '#F87171', flexShrink: 0 }} />}
            last={false}
          />
          <div onClick={() => setShowLogout(true)} style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, cursor: 'pointer', zIndex: 0, pointerEvents: 'none' }} />
          <SettingRow
            icon={Trash2} iconBg="rgba(239,68,68,0.08)" iconColor="rgba(239,68,68,0.55)"
            label="Delete Account"
            sub="Permanently remove your LINESETU account"
            danger
            right={<ChevronRight style={{ width: 15, height: 15, color: 'rgba(239,68,68,0.45)', flexShrink: 0 }} />}
            last
          />
        </div>

        {/* App version */}
        <div style={{ textAlign: 'center', padding: '20px 0 4px' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.15)' }}>LINESETU Doctor · v2.1.0</div>
          <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.1)', marginTop: 3 }}>Build 20260410 · © 2026 LINESETU</div>
        </div>

      </div>

      {/* Logout sheet trigger overlay on last section */}
      <div onClick={() => setShowLogout(true)} style={{
        position: 'absolute', bottom: 72, left: 14, right: 14, height: 50,
        borderRadius: '0 0 18px 18px', cursor: 'pointer', zIndex: 5,
        background: 'transparent',
      }} />

      {/* Logout confirmation sheet */}
      {showLogout && <LogoutSheet onClose={() => setShowLogout(false)} />}

      <DocNavBar active="settings" />
    </div>
  );
}
