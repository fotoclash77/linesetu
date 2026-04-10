import React, { useState } from 'react';
import {
  CalendarDays, Home, User,
  ChevronRight, Edit3, LogOut, Trash2,
  Bell, Globe, SlidersHorizontal, HelpCircle,
  MessageCircle, FileQuestion, Activity,
  History, Users, UserPlus, CreditCard,
  ReceiptText, ShieldCheck, Camera, Phone,
  CheckCircle2,
} from 'lucide-react';

const BG = '#0A0E1A';
const GLASS: React.CSSProperties = {
  background: 'rgba(255,255,255,0.05)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  border: '1px solid rgba(255,255,255,0.09)',
};

/* ──────────────────────────────────────
   MENU DATA
────────────────────────────────────── */
interface MenuItem {
  icon: React.ElementType;
  label: string;
  sub?: string;
  iconBg: string;
  iconColor: string;
  badge?: string;
  badgeColor?: string;
  danger?: boolean;
}
interface MenuGroup {
  title: string;
  items: MenuItem[];
}

const MENU_GROUPS: MenuGroup[] = [
  {
    title: '📌  Bookings & Activity',
    items: [
      { icon: CalendarDays, label: 'My Bookings',    sub: '6 total, 1 active',  iconBg: 'rgba(99,102,241,0.2)',   iconColor: '#A5B4FC', badge: '1 Active', badgeColor: 'rgba(34,197,94,0.85)' },
      { icon: Activity,     label: 'Live Queue',     sub: 'Track token live',    iconBg: 'rgba(34,197,94,0.18)',   iconColor: '#4ADE80' },
      { icon: History,      label: 'Booking History',sub: 'All past visits',     iconBg: 'rgba(6,182,212,0.18)',   iconColor: '#67E8F9' },
    ],
  },
  {
    title: '👨‍👩‍👧  Family Management',
    items: [
      { icon: Users,    label: 'Manage Family Members', sub: '4 members added',   iconBg: 'rgba(236,72,153,0.18)',  iconColor: '#F9A8D4' },
      { icon: UserPlus, label: 'Add Member',            sub: 'Add a new member',   iconBg: 'rgba(245,158,11,0.18)',  iconColor: '#FCD34D' },
    ],
  },
  {
    title: '💳  Payments & Transactions',
    items: [
      { icon: CreditCard,  label: 'Payment History',  sub: 'View all payments',      iconBg: 'rgba(16,185,129,0.18)',  iconColor: '#6EE7B7', badge: '1 Pending', badgeColor: 'rgba(245,158,11,0.85)' },
      { icon: ReceiptText, label: 'Transactions',      sub: 'Detailed ledger',        iconBg: 'rgba(99,102,241,0.18)',  iconColor: '#C4B5FD' },
    ],
  },
  {
    title: '⚙️  Settings & Preferences',
    items: [
      { icon: Bell,              label: 'Notification Settings', sub: 'Alerts & reminders',    iconBg: 'rgba(239,68,68,0.18)',   iconColor: '#FCA5A5' },
      { icon: Globe,             label: 'Language',              sub: 'English (India)',        iconBg: 'rgba(6,182,212,0.18)',   iconColor: '#67E8F9' },
      { icon: SlidersHorizontal, label: 'App Preferences',       sub: 'Theme, display & more', iconBg: 'rgba(99,102,241,0.18)', iconColor: '#A5B4FC' },
    ],
  },
  {
    title: '🏥  App & Support',
    items: [
      { icon: HelpCircle,   label: 'Help & Support', sub: 'Chat with us',      iconBg: 'rgba(16,185,129,0.18)',  iconColor: '#6EE7B7' },
      { icon: FileQuestion, label: 'FAQs',           sub: 'Common questions',  iconBg: 'rgba(245,158,11,0.18)',  iconColor: '#FCD34D' },
      { icon: MessageCircle,label: 'Contact Us',     sub: 'Get in touch',      iconBg: 'rgba(6,182,212,0.18)',   iconColor: '#67E8F9' },
    ],
  },
  {
    title: '🔐  Account',
    items: [
      { icon: ShieldCheck, label: 'Privacy & Security', sub: 'Manage account security', iconBg: 'rgba(99,102,241,0.18)',  iconColor: '#A5B4FC' },
      { icon: LogOut,      label: 'Log Out',             sub: 'Sign out safely',         iconBg: 'rgba(239,68,68,0.15)',   iconColor: '#FCA5A5', danger: true },
      { icon: Trash2,      label: 'Delete Account',      sub: 'Permanent action',        iconBg: 'rgba(239,68,68,0.1)',    iconColor: 'rgba(252,165,165,0.6)', danger: true },
    ],
  },
];

/* ──────────────────────────────────────
   ROW ITEM
────────────────────────────────────── */
function MenuRow({ item, last }: { item: MenuItem; last: boolean }) {
  const Icon = item.icon;
  return (
    <div style={{ position: 'relative' }}>
      <button style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '11px 14px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
        {/* Icon bubble */}
        <div style={{ width: 40, height: 40, borderRadius: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', background: item.iconBg, flexShrink: 0 }}>
          <Icon style={{ width: 18, height: 18, color: item.iconColor, strokeWidth: 1.8 }} />
        </div>
        {/* Text */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: item.danger ? '#FCA5A5' : '#F1F5F9', lineHeight: 1.2 }}>{item.label}</div>
          {item.sub && <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.32)', marginTop: 2, fontWeight: 500 }}>{item.sub}</div>}
        </div>
        {/* Badge */}
        {item.badge && (
          <div style={{ padding: '2px 8px', borderRadius: 20, background: item.badgeColor, flexShrink: 0, marginRight: 4 }}>
            <span style={{ fontSize: 9, fontWeight: 800, color: '#FFF' }}>{item.badge}</span>
          </div>
        )}
        {/* Chevron */}
        {!item.danger && <ChevronRight style={{ width: 15, height: 15, color: 'rgba(255,255,255,0.2)', flexShrink: 0 }} />}
        {item.danger && item.label !== 'Delete Account' && (
          <ChevronRight style={{ width: 15, height: 15, color: 'rgba(252,165,165,0.3)', flexShrink: 0 }} />
        )}
      </button>
      {!last && <div style={{ height: 1, background: 'rgba(255,255,255,0.05)', margin: '0 14px' }} />}
    </div>
  );
}

/* ──────────────────────────────────────
   GROUP CARD
────────────────────────────────────── */
function MenuCard({ group }: { group: MenuGroup }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontSize: 10, fontWeight: 800, color: 'rgba(255,255,255,0.28)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 7, paddingLeft: 4 }}>
        {group.title}
      </div>
      <div style={{ borderRadius: 20, overflow: 'hidden', ...GLASS }}>
        {group.items.map((item, i) => (
          <MenuRow key={item.label} item={item} last={i === group.items.length - 1} />
        ))}
      </div>
    </div>
  );
}

/* ──────────────────────────────────────
   STAT PILL
────────────────────────────────────── */
function StatPill({ value, label, color }: { value: string | number; label: string; color: string }) {
  return (
    <div style={{ flex: 1, textAlign: 'center', padding: '10px 4px', borderRadius: 14, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
      <div style={{ fontSize: 20, fontWeight: 900, color, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.35)', marginTop: 3, textTransform: 'uppercase', letterSpacing: '0.07em' }}>{label}</div>
    </div>
  );
}

/* ──────────────────────────────────────
   MAIN SCREEN
────────────────────────────────────── */
export function Profile() {
  const [verified] = useState(true);

  return (
    <div style={{ width: 390, height: 844, background: BG, fontFamily: "'Inter', sans-serif",
      display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>

      {/* Glow orbs */}
      <div style={{ position: 'absolute', top: -80, left: -60, width: 280, height: 280, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(99,102,241,0.22) 0%, transparent 70%)', filter: 'blur(40px)', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'absolute', top: 160, right: -80, width: 200, height: 200, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(6,182,212,0.14) 0%, transparent 70%)', filter: 'blur(32px)', pointerEvents: 'none', zIndex: 0 }} />

      {/* STATUS BAR */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px 6px', position: 'relative', zIndex: 10, flexShrink: 0 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.65)' }}>9:41</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          {[0.4,0.65,0.9,1].map((op,i) => <div key={i} style={{ width: 3, height: 6+i*2, borderRadius: 2, background: `rgba(255,255,255,${op})` }} />)}
          <div style={{ width: 6 }} />
          <svg width="16" height="11" viewBox="0 0 16 11" fill="none"><path d="M8 2C10.4 2 12.6 3 14.1 4.7L15.5 3.2C13.6 1.2 10.9 0 8 0C5.1 0 2.4 1.2 0.5 3.2L1.9 4.7C3.4 3 5.6 2 8 2Z" fill="white" opacity="0.4"/><path d="M8 5C9.7 5 11.2 5.7 12.3 6.8L13.7 5.3C12.2 3.9 10.2 3 8 3C5.8 3 3.8 3.9 2.3 5.3L3.7 6.8C4.8 5.7 6.3 5 8 5Z" fill="white" opacity="0.7"/><circle cx="8" cy="9.5" r="1.5" fill="white"/></svg>
          <div style={{ width: 4 }} />
          <svg width="24" height="12" viewBox="0 0 24 12" fill="none"><rect x="0.5" y="0.5" width="20" height="11" rx="3.5" stroke="white" strokeOpacity="0.3"/><rect x="2" y="2" width="14" height="8" rx="2" fill="white" fillOpacity="0.85"/><path d="M22 4.5V7.5C22.8 7.2 23.5 6.4 23.5 6C23.5 5.6 22.8 4.8 22 4.5Z" fill="white" opacity="0.35"/></svg>
        </div>
      </div>

      {/* ── USER INFO CARD ── */}
      <div style={{ padding: '4px 18px 14px', flexShrink: 0, position: 'relative', zIndex: 10 }}>
        <div style={{ borderRadius: 24, padding: '18px 18px 16px', position: 'relative', overflow: 'hidden',
          background: 'linear-gradient(135deg, rgba(99,102,241,0.22) 0%, rgba(6,182,212,0.14) 100%)',
          border: '1.5px solid rgba(255,255,255,0.12)',
          boxShadow: '0 8px 32px rgba(99,102,241,0.2)' }}>

          {/* Subtle inner glow */}
          <div style={{ position: 'absolute', top: -30, right: -30, width: 120, height: 120, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(99,102,241,0.3) 0%, transparent 70%)', filter: 'blur(20px)', pointerEvents: 'none' }} />

          <div style={{ display: 'flex', alignItems: 'center', gap: 14, position: 'relative' }}>
            {/* Avatar */}
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <div style={{ width: 68, height: 68, borderRadius: 22, display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'linear-gradient(135deg, #4F46E5 0%, #0EA5E9 100%)',
                border: '2.5px solid rgba(255,255,255,0.25)',
                boxShadow: '0 4px 20px rgba(79,70,229,0.45)' }}>
                <span style={{ fontSize: 26, fontWeight: 900, color: '#FFF', letterSpacing: '-1px' }}>RS</span>
              </div>
              {/* Camera edit */}
              <button style={{ position: 'absolute', bottom: -4, right: -4, width: 22, height: 22, borderRadius: 8, background: '#1E293B', border: '1.5px solid rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <Camera style={{ width: 11, height: 11, color: 'rgba(255,255,255,0.7)' }} />
              </button>
            </div>

            {/* Name & info */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                <span style={{ fontSize: 17, fontWeight: 900, color: '#FFF', letterSpacing: '-0.3px' }}>Rahul Sharma</span>
                {verified && <CheckCircle2 style={{ width: 14, height: 14, color: '#4ADE80', flexShrink: 0 }} />}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 8 }}>
                <Phone style={{ width: 11, height: 11, color: 'rgba(255,255,255,0.4)' }} />
                <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', fontWeight: 500 }}>+91 98765 43210</span>
              </div>
              <button style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 12px', borderRadius: 10, background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.15)', cursor: 'pointer' }}>
                <Edit3 style={{ width: 11, height: 11, color: '#A5B4FC' }} />
                <span style={{ fontSize: 11, fontWeight: 700, color: '#A5B4FC' }}>Edit Profile</span>
              </button>
            </div>
          </div>

          {/* Stats row */}
          <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
            <StatPill value={6}  label="Bookings"  color="#A5B4FC" />
            <StatPill value={1}  label="Active"    color="#4ADE80" />
            <StatPill value={4}  label="Family"    color="#F9A8D4" />
            <StatPill value="₹20" label="Pending" color="#FCD34D" />
          </div>
        </div>
      </div>

      {/* ── SCROLLABLE MENU ── */}
      <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '2px 18px 80px', position: 'relative', zIndex: 10 }}>
        {MENU_GROUPS.map(group => (
          <MenuCard key={group.title} group={group} />
        ))}

        {/* Version */}
        <div style={{ textAlign: 'center', padding: '6px 0 4px' }}>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.18)', fontWeight: 600 }}>LINESETU Patient App</div>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.12)', marginTop: 2 }}>Version 1.0.4 · Build 42</div>
        </div>
      </div>

      {/* BOTTOM NAV */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 68, display: 'flex', alignItems: 'center', justifyContent: 'space-around',
        background: 'rgba(10,14,26,0.95)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
        borderTop: '1px solid rgba(255,255,255,0.07)', zIndex: 20 }}>
        {[
          { icon: Home,         label: 'Home',     active: false },
          { icon: CalendarDays, label: 'Bookings', active: false },
          { icon: User,         label: 'Profile',  active: true  },
        ].map(({ icon: Icon, label, active }) => (
          <button key={label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, background: 'none', border: 'none', cursor: 'pointer', padding: '4px 24px' }}>
            <div style={{ width: 40, height: 30, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', background: active ? 'rgba(99,102,241,0.2)' : 'transparent' }}>
              <Icon style={{ width: 20, height: 20, color: active ? '#A5B4FC' : 'rgba(255,255,255,0.3)', strokeWidth: active ? 2.5 : 2 }} />
            </div>
            <span style={{ fontSize: 9, fontWeight: active ? 800 : 500, color: active ? '#A5B4FC' : 'rgba(255,255,255,0.28)', letterSpacing: '0.04em' }}>{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
