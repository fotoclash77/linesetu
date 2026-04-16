import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  ActivityIndicator, Platform, Animated, Modal, RefreshControl, TextInput, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { BG, TEAL, TEAL_LT } from '../../constants/theme';
import { FeatherIcon as Feather } from "../../components/FeatherIcon";
import { useDoctor } from '../../contexts/DoctorContext';

const isWeb = Platform.OS === 'web';

// ─── Colors ──────────────────────────────────────────────────────
const AMBER    = '#F59E0B';
const AMBER_LT = '#FCD34D';
const RED      = '#EF4444';
const CYAN     = '#67E8F9';
const GREEN    = '#4ADE80';
const PURPLE   = '#A78BFA';

// ─── API ─────────────────────────────────────────────────────────
const BASE = () => `https://${process.env.EXPO_PUBLIC_DOMAIN}`;
const todayISO = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
};

// ─── Date utilities ───────────────────────────────────────────────
function dateISO(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}
function getNext30Days(): Date[] {
  return Array.from({ length: 30 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() + i); d.setHours(0,0,0,0); return d;
  });
}
// Kept for compatibility — no longer used in the modal
function getNext7Days(): Date[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() + i); d.setHours(0,0,0,0); return d;
  });
}
function dayLabel(d: Date): string {
  const today = new Date(); today.setHours(0,0,0,0);
  const tomorrow = new Date(today); tomorrow.setDate(today.getDate()+1);
  if (d.getTime() === today.getTime())    return 'Today';
  if (d.getTime() === tomorrow.getTime()) return 'Tmrw';
  return d.toLocaleDateString('en-IN', { weekday: 'short' });
}
function fmtScheduleLabel(iso: string, shift: string): string {
  const d = new Date(iso + 'T00:00:00');
  const today = new Date(); today.setHours(0,0,0,0);
  const prefix = d.getTime() === today.getTime()
    ? 'Today'
    : d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  return `${prefix} · ${shift === 'morning' ? 'Morning' : 'Evening'}`;
}

async function apiFetchQueue(doctorId: string, shift: string, date: string) {
  const r = await fetch(`${BASE()}/api/queues/${doctorId}?date=${date}&shift=${shift}`);
  if (!r.ok) throw new Error('queue fetch failed');
  return r.json();
}
async function apiFetchAll(doctorId: string, date: string) {
  const r = await fetch(`${BASE()}/api/tokens?doctorId=${doctorId}&date=${date}`);
  if (!r.ok) throw new Error('tokens fetch failed');
  return r.json();
}
async function apiCall(id: string)   { await fetch(`${BASE()}/api/tokens/${id}/call`,   { method: 'PATCH' }); }
async function apiDone(id: string) {
  await fetch(`${BASE()}/api/tokens/${id}/done`, { method: 'PATCH' });
}
async function apiSkip(id: string)   { await fetch(`${BASE()}/api/tokens/${id}/skip`,   { method: 'PATCH' }); }
async function apiCancel(id: string) { await fetch(`${BASE()}/api/tokens/${id}/cancel`, { method: 'PATCH' }); }
async function apiRefund(id: string) {
  const r = await fetch(`${BASE()}/api/tokens/${id}/refund`, { method: 'PATCH' });
  if (!r.ok) { const j = await r.json().catch(() => ({})); throw new Error(j.error || 'Refund failed'); }
  return r.json();
}
async function apiSendAlert(payload: {
  tokenId: string; message: string; patientId: string;
  phone: string; doctorId: string; doctorName: string;
}) {
  const r = await fetch(`${BASE()}/api/notifications/send-alert`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!r.ok) { const j = await r.json().catch(() => ({})); throw new Error(j.error || 'Alert failed'); }
  return r.json();
}

// ─── Types ───────────────────────────────────────────────────────
type DisplayStatus = 'consulting' | 'waiting' | 'done' | 'skipped';
type TabKey = 'all' | 'normal' | 'emergency' | 'skipped' | 'consulted';

interface MasterRow {
  id: string; tokenNumber: number; patientName: string;
  type: string; source: string; status: string; bookedAt: any;
  visitType?: string;
}

interface Token {
  id: string; tokenNumber: number; patientName: string; patientPhone: string;
  patientId?: string;
  type: 'normal' | 'emergency'; source: string; status: string;
  displayStatus: DisplayStatus; shift: string; calledAt?: any;
  age?: string; gender?: string; area?: string; visitType?: string;
  paymentStatus?: string; paymentId?: string;
}

function sortRows(tokens: MasterRow[]) {
  return [...tokens].sort((a, b) => (a.tokenNumber ?? 0) - (b.tokenNumber ?? 0));
}

function mapToken(t: any): Token {
  return {
    id: t.id, tokenNumber: t.tokenNumber ?? 0,
    patientName: t.patientName ?? 'Unknown',
    patientPhone: t.patientPhone ?? '',
    patientId: t.patientId ?? undefined,
    type: t.type === 'emergency' ? 'emergency' : 'normal',
    source: t.source || '',
    status: t.status,
    displayStatus:
      t.status === 'in_consult' ? 'consulting' :
      t.status === 'done'       ? 'done'       :
      t.status === 'skipped'    ? 'skipped'    :
      t.status === 'cancelled'  ? 'skipped'    : 'waiting',
    shift: t.shift ?? 'morning', calledAt: t.calledAt,
    age: t.age ?? undefined,
    gender: t.gender ?? undefined,
    area: t.area ?? undefined,
    visitType: t.visitType ?? undefined,
    paymentStatus: t.paymentStatus ?? undefined,
    paymentId: t.paymentId ?? undefined,
  };
}

// ─── Master Queue (SSE + REST polling) ───────────────────────────
function useMasterQueue(doctorId: string, date: string) {
  const [rows, setRows] = useState<MasterRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!doctorId) return;
    let active = true;
    setRows([]); setLoading(true);
    const fetchNow = async () => {
      try {
        const res = await fetch(`${BASE()}/api/tokens?doctorId=${doctorId}&date=${date}`);
        const data = await res.json();
        if (data.tokens && active) setRows(sortRows(data.tokens));
      } catch (_) {}
      if (active) setLoading(false);
    };
    fetchNow();
    // Poll every 5 s so new tokens appear within seconds regardless of SSE proxy behaviour
    const iv = setInterval(fetchNow, 5_000);
    let es: any = null;
    if (typeof EventSource !== 'undefined') {
      es = new EventSource(`${BASE()}/api/tokens/stream/${doctorId}?date=${date}`);
      es.onmessage = (e: MessageEvent) => {
        try {
          const tokens: MasterRow[] = JSON.parse(e.data);
          if (active) { setRows(sortRows(tokens)); setLoading(false); }
        } catch (_) {}
      };
    }
    return () => { active = false; clearInterval(iv); es?.close(); };
  }, [doctorId, date]);

  return { rows, loading };
}

// ─── Pulsing dot ─────────────────────────────────────────────────
function PulseDot({ color, size = 7 }: { color: string; size?: number }) {
  const s = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    const a = Animated.loop(Animated.sequence([
      Animated.timing(s, { toValue: 1.6, duration: 700, useNativeDriver: true }),
      Animated.timing(s, { toValue: 1,   duration: 700, useNativeDriver: true }),
    ]));
    a.start(); return () => a.stop();
  }, []);
  return <Animated.View style={{ width: size, height: size, borderRadius: size/2, backgroundColor: color, transform: [{ scale: s }] }} />;
}

// ─── Animated pulse rings (sonar / radar effect) ──────────────────
function PulseRings({ color, borderRadius = 16 }: { color: string; borderRadius?: number }) {
  const a1 = useRef(new Animated.Value(0)).current;
  const a2 = useRef(new Animated.Value(0)).current;
  const a3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const wave = (val: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(val, { toValue: 0, duration: 0, useNativeDriver: true }),
          Animated.delay(delay),
          Animated.timing(val, { toValue: 1, duration: 1600, useNativeDriver: true }),
        ])
      );
    const a = Animated.parallel([wave(a1, 0), wave(a2, 533), wave(a3, 1066)]);
    a.start();
    return () => a.stop();
  }, []);

  const ring = (val: Animated.Value) => ({
    position: 'absolute' as const,
    top: 0, left: 0, right: 0, bottom: 0,
    borderRadius,
    borderWidth: 1.5,
    borderColor: color,
    transform: [{ scale: val.interpolate({ inputRange: [0, 1], outputRange: [1, 1.85] }) }],
    opacity: val.interpolate({ inputRange: [0, 0.15, 0.7, 1], outputRange: [0, 0.75, 0.3, 0] }),
  });

  return (
    <>
      <Animated.View style={ring(a1)} />
      <Animated.View style={ring(a2)} />
      <Animated.View style={ring(a3)} />
    </>
  );
}

// ─── Token Chip ──────────────────────────────────────────────────
function TokenChip({ token, type, large = false, amber = false }: { token: number; type: string; large?: boolean; amber?: boolean }) {
  const isE = type === 'emergency';
  const color  = amber ? AMBER_LT : isE ? RED      : TEAL_LT;
  const bg     = amber ? 'rgba(180,83,9,0.35)'   : isE ? 'rgba(239,68,68,0.18)'   : 'rgba(13,148,136,0.2)';
  const border = amber ? 'rgba(252,211,77,0.55)'  : isE ? 'rgba(239,68,68,0.4)'    : 'rgba(45,212,191,0.4)';
  const label  = isE ? `E${String(token).padStart(2,'0')}` : `#${String(token).padStart(2,'0')}`;
  return (
    <View style={[S.chip, large && S.chipLg, { backgroundColor: bg, borderColor: border }]}>
      <Text style={S.chipLabel}>TOKEN</Text>
      <Text style={[S.chipNum, large && S.chipNumLg, { color }]}>{label}</Text>
    </View>
  );
}

// ─── Type Badge — always shows booking source (token chip already shows emergency) ──
function TypeBadge({ type, source }: { type?: string; source: string }) {
  const isWalkin = source === 'walkin';
  const isEmrg   = type === 'emergency';
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
      <View style={[S.badge, {
        backgroundColor: isWalkin ? 'rgba(13,148,136,0.10)' : 'rgba(99,102,241,0.10)',
        borderColor:     isWalkin ? 'rgba(45,212,191,0.55)' : 'rgba(129,140,248,0.55)',
      }]}>
        <Text style={[S.badgeTxt, { color: isWalkin ? TEAL_LT : '#A5B4FC' }]}>
          {isWalkin ? 'Walk-in' : 'E-Token'}
        </Text>
      </View>
      {isEmrg && (
        <View style={[S.badge, {
          backgroundColor: 'rgba(239,68,68,0.10)',
          borderColor:     'rgba(239,68,68,0.55)',
        }]}>
          <Text style={[S.badgeTxt, { color: '#F87171' }]}>Emergency</Text>
        </View>
      )}
    </View>
  );
}

// ─── Patient Info ────────────────────────────────────────────────
function VisitTypePill({ vt }: { vt?: string }) {
  if (!vt) return null;
  const isFirst = vt === 'first-visit';
  return (
    <View style={{
      paddingHorizontal: 6, paddingVertical: 2, borderRadius: 5,
      backgroundColor: isFirst ? 'rgba(99,102,241,0.15)' : 'rgba(16,185,129,0.15)',
      borderWidth: 1,
      borderColor: isFirst ? 'rgba(129,140,248,0.35)' : 'rgba(52,211,153,0.35)',
    }}>
      <Text style={{ fontSize: 9, fontWeight: '800', color: isFirst ? '#A5B4FC' : '#6EE7B7' }}>
        {isFirst ? 'First Visit' : 'Follow-up'}
      </Text>
    </View>
  );
}

function PatientInfo({ tok, large = false }: { tok: Token; large?: boolean }) {
  const genderLabel = tok.gender === 'M' || tok.gender === 'male'   ? 'Male'
    : tok.gender === 'F' || tok.gender === 'female' ? 'Female'
    : tok.gender ?? '';
  const metaParts = [tok.age ? `${tok.age} yr` : '', genderLabel].filter(Boolean);
  return (
    <View style={{ flex: 1, minWidth: 0 }}>
      <Text style={[S.patName, large && S.patNameLg]} numberOfLines={1}>{tok.patientName}</Text>
      {/* single horizontal meta row: age · gender · badge · visit type */}
      <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 5, marginTop: 3 }}>
        {metaParts.length > 0 && (
          <Text style={S.patMeta}>{metaParts.join(' · ')}</Text>
        )}
        {metaParts.length > 0 && <Text style={[S.patMeta, { opacity: 0.35 }]}>·</Text>}
        <TypeBadge type={tok.type} source={tok.source} />
        {!!tok.visitType && <Text style={[S.patMeta, { opacity: 0.35 }]}>·</Text>}
        <VisitTypePill vt={tok.visitType} />
      </View>
    </View>
  );
}

// ─── Stats Bar ───────────────────────────────────────────────────
function StatsBar({ all, maxTokens, clinicName, timeRange }: {
  all: Token[]; maxTokens: number | null; clinicName: string; timeRange: string;
}) {
  const total    = all.filter(t => t.displayStatus !== 'skipped').length;
  const waiting  = all.filter(t => t.displayStatus === 'waiting').length;
  const done     = all.filter(t => t.displayStatus === 'done').length;
  const skipped  = all.filter(t => t.displayStatus === 'skipped').length;
  const walkin   = all.filter(t => t.source === 'walkin').length;
  const etoken   = all.filter(t => t.source !== 'walkin').length;
  const fillPct = maxTokens ? Math.min(Math.round((total / maxTokens) * 100), 100) : 0;
  const fillColor = fillPct >= 90 ? RED : fillPct >= 70 ? AMBER : TEAL_LT;
  const stats = [
    { label: 'Booked',  val: maxTokens ? `${total}/${maxTokens}` : String(total), color: TEAL_LT  },
    { label: 'Waiting', val: waiting, color: AMBER_LT },
    { label: 'Done',    val: done,    color: GREEN    },
    { label: 'Skipped', val: skipped, color: PURPLE   },
  ];
  return (
    <View>
      {/* Clinic + time info */}
      {(clinicName || timeRange) ? (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6, paddingHorizontal: 2 }}>
          {clinicName ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Feather name="home" size={10} color="rgba(255,255,255,0.4)" />
              <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', fontWeight: '600' }}>{clinicName}</Text>
            </View>
          ) : null}
          {timeRange ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', fontWeight: '500' }}>·</Text>
              <Feather name="clock" size={10} color="rgba(255,255,255,0.3)" />
              <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', fontWeight: '500' }}>{timeRange}</Text>
            </View>
          ) : null}
        </View>
      ) : null}
      <View style={S.statsBar}>
        {stats.map((s, i) => (
          <View key={s.label} style={[S.statCell, i < 3 && S.statBorder]}>
            <Text style={[S.statVal, { color: s.color, fontSize: 17 }]}>{s.val}</Text>
            <Text style={S.statLbl}>{s.label}</Text>
          </View>
        ))}
      </View>
      {/* Capacity bar */}
      {maxTokens ? (
        <View style={{ marginTop: 6, gap: 3 }}>
          <View style={{ height: 4, borderRadius: 99, backgroundColor: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
            <View style={{ width: `${fillPct}%`, height: '100%', borderRadius: 99, backgroundColor: fillColor }} />
          </View>
          <Text style={{ fontSize: 9, fontWeight: '700', color: 'rgba(255,255,255,0.3)', textAlign: 'right' }}>
            {fillPct}% capacity used · {maxTokens - total > 0 ? `${maxTokens - total} slots left` : 'Shift Full'}
          </Text>
        </View>
      ) : null}

      {/* Walk-in / E-Token real-time breakdown */}
      {all.length > 0 && (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.07)' }}>
          <Text style={{ fontSize: 10, fontWeight: '700', color: 'rgba(255,255,255,0.35)', flex: 1 }}>Bookings</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: 'rgba(13,148,136,0.22)', paddingHorizontal: 9, paddingVertical: 4, borderRadius: 8, borderWidth: 1, borderColor: 'rgba(45,212,191,0.45)' }}>
            <Feather name="user-plus" size={10} color={TEAL_LT} />
            <Text style={{ fontSize: 10, fontWeight: '800', color: TEAL_LT }}>Walk-in</Text>
            <View style={{ width: 1, height: 10, backgroundColor: 'rgba(45,212,191,0.3)' }} />
            <Text style={{ fontSize: 11, fontWeight: '900', color: '#FFF' }}>{walkin}</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: 'rgba(99,102,241,0.2)', paddingHorizontal: 9, paddingVertical: 4, borderRadius: 8, borderWidth: 1, borderColor: 'rgba(129,140,248,0.45)' }}>
            <Feather name="smartphone" size={10} color="#A5B4FC" />
            <Text style={{ fontSize: 10, fontWeight: '800', color: '#A5B4FC' }}>E-Token</Text>
            <View style={{ width: 1, height: 10, backgroundColor: 'rgba(129,140,248,0.3)' }} />
            <Text style={{ fontSize: 11, fontWeight: '900', color: '#FFF' }}>{etoken}</Text>
          </View>
        </View>
      )}
    </View>
  );
}

// ─── In Consultation Card ────────────────────────────────────────
function InConsultationCard({ tok, onSkip, onDone, busy }: {
  tok: Token; onSkip: () => void; onDone: () => void; busy: boolean;
}) {
  const ringColor = tok.type === 'emergency' ? 'rgba(251,113,133,0.85)' : 'rgba(252,211,77,0.85)';
  return (
    <View style={S.consCard}>
      <View style={S.consHeader}>
        <PulseDot color={AMBER_LT} size={8} />
        <Text style={S.consLabel}>IN CONSULTATION</Text>
      </View>
      <TouchableOpacity
        style={S.consRow}
        onPress={() => router.push(`/patients/${tok.id}` as any)}
        activeOpacity={0.75}
      >
        {/* Token chip wrapped in animated pulse rings */}
        <View style={S.ringWrap}>
          <PulseRings color={ringColor} borderRadius={14} />
          <TokenChip token={tok.tokenNumber} type={tok.type} large amber={tok.type !== 'emergency'} />
        </View>
        <PatientInfo tok={tok} large />
        <Feather name="chevron-right" size={18} color="rgba(255,255,255,0.25)" />
      </TouchableOpacity>
      <View style={S.consBtnRow}>
        <TouchableOpacity
          style={[S.skipBtn, busy && { opacity: 0.5 }]}
          onPress={onSkip} disabled={busy}
        >
          {busy
            ? <ActivityIndicator color="#FCA5A5" size="small" />
            : <View style={{flexDirection:'row',alignItems:'center',gap:5}}>
                <Feather name="skip-forward" size={13} color="#FCD34D" />
                <Text style={S.skipBtnTxt}>Skip</Text>
              </View>}
        </TouchableOpacity>
        <TouchableOpacity
          style={[S.doneBtn, busy && { opacity: 0.5 }]}
          onPress={onDone} disabled={busy}
        >
          {busy
            ? <ActivityIndicator color="#FFF" size="small" />
            : <View style={{flexDirection:'row',alignItems:'center',gap:5}}>
                <Feather name="check" size={13} color="#FCD34D" />
                <Text style={S.doneBtnTxt}>Mark Consulted</Text>
              </View>}
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── In Consultation Empty ────────────────────────────────────────
function NoConsultation({ nextTok }: { nextTok?: Token }) {
  return (
    <View style={S.emptyCard}>
      <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.2)', marginRight: 8 }} />
      <Text style={S.emptyCardTxt}>
        {nextTok ? 'Tap Send Next on a patient below' : 'No patient in consultation'}
      </Text>
    </View>
  );
}

// ─── Waiting Card ────────────────────────────────────────────────
function WaitingCard({ tok, onSendNext, onSendAlert, onSkip, onRefund, busy, isManualNext, isRefundable, consultingActive }: {
  tok: Token; onSendNext: () => void; onSendAlert: () => void; onSkip: () => void; onRefund: () => void;
  busy: boolean; isManualNext?: boolean; isRefundable?: boolean; consultingActive?: boolean;
}) {
  const isCancelled = tok.status === 'cancelled' || tok.status === 'refunded';
  const sendNextDisabled = busy || !!consultingActive;
  return (
    <View style={[S.waitCard, isManualNext && { borderColor: 'rgba(252,211,77,0.45)', backgroundColor: 'rgba(180,83,9,0.1)' }]}>
      <TouchableOpacity
        style={S.waitRow}
        onPress={() => router.push(`/patients/${tok.id}` as any)}
        activeOpacity={0.75}
      >
        <TokenChip token={tok.tokenNumber} type={tok.type} />
        <PatientInfo tok={tok} />
        <Feather name="chevron-right" size={16} color="rgba(255,255,255,0.2)" style={{ marginLeft: 4 }} />
      </TouchableOpacity>
      {isCancelled && (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingBottom: 10 }}>
          <Feather name="x-circle" size={13} color="#F87171" />
          <Text style={{ fontSize: 11, fontWeight: '800', color: '#F87171', letterSpacing: 0.3 }}>Cancelled & Refunded</Text>
        </View>
      )}
      {!isCancelled && (
        <View style={S.waitBtns}>
          <TouchableOpacity
            style={[S.sendNextBtn, sendNextDisabled && { opacity: 0.4 }]}
            onPress={onSendNext} disabled={sendNextDisabled}
          >
            {busy
              ? <ActivityIndicator color={TEAL_LT} size="small" />
              : <View style={{flexDirection:'row',alignItems:'center',gap:5}}>
                  <Feather
                    name={consultingActive ? 'clock' : isManualNext ? 'star' : 'play'}
                    size={12}
                    color={consultingActive ? 'rgba(255,255,255,0.35)' : isManualNext ? AMBER_LT : TEAL_LT}
                  />
                  <Text style={[S.sendNextTxt, isManualNext && !consultingActive && { color: AMBER_LT }, consultingActive && { color: 'rgba(255,255,255,0.35)' }]}>
                    {consultingActive ? 'In Consultation' : isManualNext ? 'Set as Next' : 'Send Next'}
                  </Text>
                </View>}
          </TouchableOpacity>
          {tok.displayStatus !== 'skipped' ? (
            <TouchableOpacity
              style={[S.skipWaitBtn, busy && { opacity: 0.5 }]}
              onPress={onSkip} disabled={busy}
            >
              <View style={{flexDirection:'row',alignItems:'center',gap:5}}>
                <Feather name="corner-down-right" size={12} color={AMBER_LT} />
                <Text style={S.skipWaitTxt}>Skip</Text>
              </View>
            </TouchableOpacity>
          ) : isRefundable ? (
            <TouchableOpacity
              style={[
                S.refundBtn, { flex: 1, marginTop: 0 },
                busy && { opacity: 0.5 },
                { backgroundColor: 'rgba(248,113,113,0.15)', borderColor: 'rgba(248,113,113,0.35)' },
              ]}
              onPress={onRefund} disabled={busy}
            >
              {busy
                ? <ActivityIndicator color="#FCA5A5" size="small" />
                : <View style={{flexDirection:'row',alignItems:'center',gap:4}}>
                    <Feather name="rotate-ccw" size={12} color="#FCA5A5" />
                    <Text style={[S.refundTxt, { color: '#FCA5A5' }]}>
                      Cancel & Refund
                    </Text>
                  </View>}
            </TouchableOpacity>
          ) : null}
          <TouchableOpacity
            style={[S.alertBtn, busy && { opacity: 0.5 }]}
            onPress={onSendAlert} disabled={busy}
          >
            <Feather name="bell" size={16} color="#F59E0B" />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

// ─── All Serial Card — compact, read-only, shown only in "All" tab ──
interface GapRow { gap: true; tokenNumber: number; }
type SerialRow = Token | GapRow;

const STATUS_BADGE: Record<DisplayStatus, { label: string; color: string; bg: string }> = {
  consulting: { label: 'Consulting', color: AMBER,  bg: 'rgba(180,83,9,0.28)'   },
  waiting:    { label: 'Waiting',    color: CYAN,   bg: 'rgba(22,78,99,0.35)'   },
  done:       { label: 'Done',       color: GREEN,  bg: 'rgba(21,128,61,0.28)'  },
  skipped:    { label: 'Skipped',    color: PURPLE, bg: 'rgba(109,40,217,0.22)' },
};

function AllSerialCard({ row }: { row: SerialRow }) {
  if ('gap' in row) {
    return (
      <View style={[S.allRow, { opacity: 0.38, paddingVertical: 9 }]}>
        <View style={[S.chip, { backgroundColor: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.08)' }]}>
          <Text style={S.chipLabel}>TOKEN</Text>
          <Text style={[S.chipNum, { color: 'rgba(255,255,255,0.2)' }]}>{`#${String(row.tokenNumber).padStart(2, '0')}`}</Text>
        </View>
        <Text style={{ flex: 1, fontSize: 12, color: 'rgba(255,255,255,0.2)', marginLeft: 10, fontStyle: 'italic' }}>
          — Expired reservation
        </Text>
        <View style={[S.allBadge, { backgroundColor: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.09)' }]}>
          <Text style={{ fontSize: 9, color: 'rgba(255,255,255,0.25)', fontWeight: '700' }}>GAP</Text>
        </View>
      </View>
    );
  }
  const badge  = STATUS_BADGE[row.displayStatus];

  // Demographics
  const genderStr =
    row.gender === 'M' || row.gender === 'male'   ? 'Male'   :
    row.gender === 'F' || row.gender === 'female' ? 'Female' :
    row.gender ?? '';
  const demo = [row.age ? `${row.age} yr` : '', genderStr].filter(Boolean).join(' · ');

  return (
    <TouchableOpacity
      style={[S.allRow, { paddingVertical: 11, alignItems: 'flex-start' }]}
      onPress={() => router.push(`/patients/${row.id}` as any)}
      activeOpacity={0.72}
    >
      {/* Token chip — aligned to first line */}
      <View style={{ marginTop: 1 }}>
        <TokenChip token={row.tokenNumber} type={row.type} />
      </View>

      {/* Main content */}
      <View style={{ flex: 1, minWidth: 0, marginLeft: 10, gap: 4 }}>

        {/* Row 1: name + status badge */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
          <Text style={{ fontSize: 13, fontWeight: '800', color: '#FFF', flex: 1 }} numberOfLines={1}>
            {row.patientName}
          </Text>
          <View style={[S.allBadge, { backgroundColor: badge.bg, borderColor: `${badge.color}55` }]}>
            <Text style={{ fontSize: 9, color: badge.color, fontWeight: '800' }}>{badge.label}</Text>
          </View>
        </View>

        {/* Row 2: age · gender · source pill · priority pill · visit type */}
        <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 4 }}>
          {demo ? <Text style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', fontWeight: '600' }}>{demo}</Text> : null}
          {demo ? <Text style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)' }}>·</Text> : null}
          <TypeBadge type={row.type} source={row.source} />
          {!!row.visitType && <Text style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)' }}>·</Text>}
          <VisitTypePill vt={row.visitType} />
        </View>

      </View>
    </TouchableOpacity>
  );
}

// ─── Past Card (done / skipped, read-only) ───────────────────────
function PastCard({ tok }: { tok: Token }) {
  const isDone = tok.displayStatus === 'done';
  return (
    <TouchableOpacity
      style={[S.waitCard, { opacity: 0.72 }]}
      onPress={() => router.push(`/patients/${tok.id}` as any)}
      activeOpacity={0.65}
    >
      <View style={[S.waitRow, { alignItems: 'center' }]}>
        <TokenChip token={tok.tokenNumber} type={tok.type} />
        <PatientInfo tok={tok} />
        <Feather name={isDone ? 'check' : 'corner-down-right'} size={16} color={isDone ? GREEN : AMBER} style={{ marginLeft: 6 }} />
      </View>
    </TouchableOpacity>
  );
}

// ─── MAIN SCREEN ─────────────────────────────────────────────────
export default function QueueScreen() {
  const { doctor } = useDoctor();
  const qc = useQueryClient();
  const [tab,          setTab]        = useState<TabKey>('all');
  const [shift,        setShift]      = useState<'morning' | 'evening'>('morning');
  const [schedDate,    setSchedDate]  = useState<string>(todayISO);
  const [showSchedule, setShowSchedule] = useState(false);
  const [pickDate,     setPickDate]   = useState<string>(todayISO);
  const [pickShift,    setPickShift]  = useState<'morning' | 'evening'>('morning');
  const [busyId,       setBusy]       = useState<string | null>(null);
  const [manualNextId, setManualNext] = useState<string | null>(null);
  const [autoHandoffId, setAutoHandoffId] = useState<string | null>(null);
  const [alertTok,     setAlertTok]   = useState<Token | null>(null);
  const [alertMsg,     setAlertMsg]   = useState('');
  const [alertSending, setAlertSending] = useState(false);
  const [alertResult,  setAlertResult] = useState<'sent' | 'error' | null>(null);
  const [unreadCount,  setUnreadCount] = useState(0);
  const upNextRef = useRef<string | undefined>(undefined);
  const docId = doctor?.id ?? '';

  const { data: qData } = useQuery({
    queryKey: ['dq', docId, schedDate, shift],
    queryFn: () => apiFetchQueue(docId, shift, schedDate),
    enabled: !!docId, refetchInterval: 5000, staleTime: 3000, retry: 1,
  });
  const { data: aData, isLoading, isRefetching, refetch } = useQuery({
    queryKey: ['da', docId, schedDate],
    queryFn: () => apiFetchAll(docId, schedDate),
    enabled: !!docId, refetchInterval: 5000, staleTime: 3000, retry: 1,
  });
  const { rows: masterRows } = useMasterQueue(docId, schedDate);

  const inv = useCallback(() => Promise.all([
    qc.invalidateQueries({ queryKey: ['dq', docId, schedDate] }),
    qc.invalidateQueries({ queryKey: ['da', docId, schedDate] }),
  ]), [qc, docId, schedDate]);

  // Clear manual pick whenever schedule changes
  useEffect(() => { setManualNext(null); setAutoHandoffId(null); }, [shift, schedDate]);

  useEffect(() => {
    if (!docId) return;
    const poll = async () => {
      try {
        const res = await fetch(`${BASE()}/api/notifications/${docId}`);
        const data = await res.json();
        if (data.notifications)
          setUnreadCount((data.notifications as any[]).filter((n: any) => !n.read).length);
      } catch (_) {}
    };
    poll();
    const iv = setInterval(poll, 30_000);
    return () => clearInterval(iv);
  }, [docId]);

  const doCall = async (id: string) => {
    setBusy(id);
    try {
      await apiCall(id);
      setManualNext(prev => prev === id ? null : prev);
      setAutoHandoffId(null);
      await inv();
    } catch {}
    setBusy(null);
  };
  const doDone = async (id: string) => {
    setBusy(id);
    try {
      await apiDone(id);
      setManualNext(null);
      setAutoHandoffId(null);
      await inv();
    } catch {}
    setBusy(null);
  };
  const doSkipToken = async (id: string) => {
    setBusy(id);
    try {
      await apiSkip(id);
      if (upNextRef.current) setAutoHandoffId(upNextRef.current);
      await inv();
    } catch {}
    setBusy(null);
  };
  const doCancel = async (id: string) => {
    setBusy(id); try { await apiCancel(id); await inv(); } catch {} setBusy(null);
  };
  const doRefund = async (id: string) => {
    setBusy(id);
    try {
      await apiRefund(id);
      await inv();
    } catch (e: any) {
      console.warn('[Queue] Refund failed:', e?.message);
    }
    setBusy(null);
  };
  const openAlert = (tok: Token) => {
    setAlertResult(null);
    setAlertMsg((doctor as any)?.alertMessage ?? 'Your turn is coming soon. Please be ready!');
    setAlertTok(tok);
  };
  const doSendAlert = async () => {
    if (!alertTok || !alertMsg.trim()) return;
    setAlertSending(true);
    try {
      const alertResp = await apiSendAlert({
        tokenId:    alertTok.id,
        message:    alertMsg.trim(),
        patientId:  alertTok.patientId ?? alertTok.patientPhone,
        phone:      alertTok.patientPhone,
        doctorId:   docId,
        doctorName: doctor?.name ?? '',
      });
      console.log('[Alert] Response:', JSON.stringify(alertResp));
      setAlertResult('sent');
      setTimeout(() => { setAlertTok(null); setAlertResult(null); }, 1400);
    } catch {
      setAlertResult('error');
    }
    setAlertSending(false);
  };

  // ── Data (REST is primary; SSE is fallback before REST loads) ──────────────
  const restTokens: Token[]     = (aData?.tokens ?? []).map(mapToken).filter((t: Token) => t.shift === shift);
  const masterFiltered: Token[] = masterRows.map(mapToken).filter((t: Token) => t.shift === shift);
  const all: Token[] = restTokens.length > 0 ? restTokens : masterFiltered;

  const consulting = all.find(t => t.displayStatus === 'consulting');
  const waitSorted = all.filter(t => t.displayStatus === 'waiting').sort((a, b) => {
    if (a.type === 'emergency' && b.type !== 'emergency') return -1;
    if (b.type === 'emergency' && a.type !== 'emergency') return 1;
    return a.tokenNumber - b.tokenNumber;
  });
  // Priority: 1) Manually chosen via Send Next  2) Emergency  3) Normal
  const doneList    = all.filter(t => t.displayStatus === 'done');
  const skippedList = all.filter(t => t.displayStatus === 'skipped').sort((a, b) => a.tokenNumber - b.tokenNumber);

  // Skipped patients CAN be manually chosen as next — same logic as waiting
  const manualNext = manualNextId
    ? [...waitSorted, ...skippedList].find(t => t.id === manualNextId) ?? null
    : null;
  const queuedNext = manualNext ?? waitSorted[0] ?? skippedList[0] ?? null;
  const upNext = autoHandoffId
    ? [...waitSorted, ...skippedList].find(t => t.id === autoHandoffId) ?? queuedNext
    : queuedNext;
  upNextRef.current = upNext?.id; // always tracks what the Up Next card shows

  // ── Tab config ────────────────────────────────────────────────
  const normalList  = waitSorted.filter(t => t.type === 'normal');
  const emergList   = waitSorted.filter(t => t.type === 'emergency');

  // ── Gap detection for "All" tab ───────────────────────────────
  // nextTokenNumber = highest token number ever issued (from queue doc).
  // Any number 1..nextTokenNumber missing from booked tokens = abandoned reservation.
  const highestIssued = (qData?.nextTokenNumber ?? 0) as number;
  const bookedNums    = new Set(all.map(t => t.tokenNumber));
  const gapNums       = Array.from({ length: highestIssued }, (_, i) => i + 1)
                              .filter(n => !bookedNums.has(n));
  const allSerialRows: SerialRow[] = [
    ...all,
    ...gapNums.map(n => ({ gap: true as const, tokenNumber: n })),
  ].sort((a, b) => a.tokenNumber - b.tokenNumber);

  const TABS: { key: TabKey; label: string; color: string; count: number }[] = [
    { key: 'all',       label: 'All',       color: CYAN,   count: highestIssued || all.length },
    { key: 'normal',    label: 'Normal',    color: GREEN,  count: normalList.length  },
    { key: 'emergency', label: 'Emergency', color: RED,    count: emergList.length   },
    { key: 'skipped',   label: 'Skipped',   color: AMBER,  count: skippedList.length },
    { key: 'consulted', label: 'Consulted', color: PURPLE, count: doneList.length    },
  ];

  const tabPatients: Token[] = (() => {
    if (tab === 'normal')    return normalList;
    if (tab === 'emergency') return emergList;
    if (tab === 'skipped')   return skippedList;
    if (tab === 'consulted') return doneList;
    return [];
  })();

  // ── Calendar-derived shift info ───────────────────────────────
  const calendarEntry = (doctor as any)?.calendar?.[schedDate];
  const shiftCfg = calendarEntry?.[shift];
  const maxTokens: number | null = shiftCfg?.maxTokens ? Number(shiftCfg.maxTokens) : null;
  const clinicName: string = shiftCfg?.clinicName ?? doctor?.clinicName ?? '';
  const timeRange: string = shiftCfg?.startTime && shiftCfg?.endTime
    ? `${shiftCfg.startTime} – ${shiftCfg.endTime}`
    : '';

  return (
    <SafeAreaView style={S.safe} edges={['top']}>
      <View style={S.root}>
        {/* Ambient orbs */}
        <View style={S.orbTR} /><View style={S.orbBL} />

        {/* ── HEADER ─────────────────────────────────── */}
        <View style={S.hdr}>
          <View>
            <Text style={S.hdrSub}>MASTER QUEUE</Text>
            <Text style={S.hdrTitle}>
              {doctor ? (doctor.name.startsWith('Dr.') ? doctor.name : `Dr. ${doctor.name}`) : 'Dr. Sharma'}
              {isRefetching ? '  ·' : ''}
            </Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7 }}>
            {/* Schedule pill — tap to change date/shift */}
            <TouchableOpacity
              style={S.schedBtn}
              onPress={() => { setPickDate(schedDate); setPickShift(shift); setShowSchedule(true); }}
            >
              <Text style={S.schedTxt}>{fmtScheduleLabel(schedDate, shift)}</Text>
            </TouchableOpacity>
            {/* Walk-in shortcut */}
            <TouchableOpacity
              style={S.walkInBtn}
              onPress={() => router.push(`/walkin?date=${schedDate}&shift=${shift}` as any)}
            >
              <Feather name="plus" size={18} color={TEAL_LT} />
            </TouchableOpacity>
            <TouchableOpacity style={S.bellBtn} onPress={() => router.push('/notifications')} activeOpacity={0.8}>
              <Feather name="bell" size={16} color={unreadCount > 0 ? '#FCD34D' : 'rgba(255,255,255,0.5)'} />
              {unreadCount > 0 && <View style={S.bellDot} />}
            </TouchableOpacity>
          </View>
        </View>

        {isLoading ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <ActivityIndicator color={TEAL} size="large" />
            <Text style={{ color: 'rgba(255,255,255,0.3)', marginTop: 12, fontSize: 13 }}>Loading queue…</Text>
          </View>
        ) : (
          <>
            {/* ── STATS ──────────────────────────────── */}
            <View style={{ paddingHorizontal: 14, paddingBottom: 6 }}>
              <StatsBar all={all} maxTokens={maxTokens} clinicName={clinicName} timeRange={timeRange} />
            </View>

            {/* ── IN CONSULTATION (sticky) ───────────── */}
            <View style={{ paddingHorizontal: 14, paddingBottom: 6 }}>
              {consulting
                ? <InConsultationCard
                    tok={consulting}
                    onSkip={() => doSkipToken(consulting.id)}
                    onDone={() => doDone(consulting.id)}
                    busy={busyId === consulting.id}
                  />
                : <NoConsultation nextTok={upNext} />
              }
            </View>

            {/* ── WAITING LIST HEADER + TABS ─────────── */}
            <View style={{ paddingHorizontal: 14 }}>
              <View style={S.waitingHeader}>
                <Text style={S.waitingTitle}>{tab === 'all' ? 'Token List' : 'Waiting List'}</Text>
                <Text style={S.waitingCount}>
                  {tab === 'all'
                    ? `${highestIssued || all.length} issued today`
                    : `${waitSorted.length} patients`}
                </Text>
              </View>
              {/* Tab bar — equal-width flex tabs filling the full row */}
              <View style={S.tabBar}>
                {TABS.map(t => {
                  const active = tab === t.key;
                  return (
                    <TouchableOpacity
                      key={t.key}
                      onPress={() => setTab(t.key)}
                      style={[
                        S.tabItem,
                        active && { backgroundColor: `${t.color}30`, borderColor: `${t.color}70` },
                      ]}
                    >
                      <Text style={[S.tabTxt, { color: active ? t.color : 'rgba(255,255,255,0.28)' }]}>
                        {t.label}
                      </Text>
                      {t.count > 0 && (
                        <View style={[S.tabBadge, { backgroundColor: t.color }]}>
                          <Text style={[S.tabBadgeTxt, { color: BG }]}>{t.count}</Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* ── SCROLLABLE WAITING CARDS ───────────── */}
            <ScrollView
              style={{ flex: 1 }}
              showsVerticalScrollIndicator={false}
              refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={TEAL} />}
              contentContainerStyle={{ paddingHorizontal: 14, paddingBottom: 100, paddingTop: 8 }}
            >
              {tab === 'all' ? (
                allSerialRows.length === 0 ? (
                  <View style={S.emptyState}>
                    <Feather name="list" size={36} color="rgba(255,255,255,0.2)" style={{ marginBottom: 10 }} />
                    <Text style={S.emptyStateTxt}>No tokens issued yet for this shift</Text>
                  </View>
                ) : (
                  allSerialRows.map(row => (
                    <AllSerialCard
                      key={'gap' in row ? `gap-${row.tokenNumber}` : row.id}
                      row={row}
                    />
                  ))
                )
              ) : tabPatients.length === 0 ? (
                <View style={S.emptyState}>
                  <Feather
                    name={tab === 'consulted' ? 'check-circle' : tab === 'skipped' ? 'corner-down-right' : 'clock'}
                    size={36}
                    color="rgba(255,255,255,0.2)"
                    style={{ marginBottom: 10 }}
                  />
                  <Text style={S.emptyStateTxt}>No patients in this category</Text>
                </View>
              ) : (
                tabPatients.map(tok => {
                  if (tab === 'consulted') {
                    return <PastCard key={tok.id} tok={tok} />;
                  }
                  const isRefundable = tok.source !== 'walkin'
                    && tok.paymentStatus === 'paid'
                    && !!tok.paymentId;
                  return (
                    <WaitingCard
                      key={tok.id} tok={tok}
                      busy={busyId === tok.id}
                      isManualNext={tok.id === manualNextId}
                      isRefundable={isRefundable}
                      consultingActive={!!consulting}
                      onSendNext={() => { setManualNext(tok.id); doCall(tok.id); }}
                      onSendAlert={() => openAlert(tok)}
                      onSkip={() => doSkipToken(tok.id)}
                      onRefund={() => doRefund(tok.id)}
                    />
                  );
                })
              )}
            </ScrollView>
          </>
        )}
      </View>

      {/* ── SCHEDULE PICKER MODAL ─────────────────── */}
      <Modal visible={showSchedule} transparent animationType="slide" onRequestClose={() => setShowSchedule(false)}>
        <TouchableOpacity style={S.modalOverlay} activeOpacity={1} onPress={() => setShowSchedule(false)}>
          <TouchableOpacity activeOpacity={1} onPress={() => {}}>
            <View style={S.modalSheet}>
              <View style={S.modalHandle} />
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <Feather name="calendar" size={18} color={TEAL_LT} />
                <Text style={S.modalTitle}>Select Schedule</Text>
              </View>
              <Text style={S.modalSub}>Dates & shifts from your configured calendar</Text>

              {/* ── Date selector — real 30-day calendar ── */}
              <Text style={S.modalSectionLabel}>DATE</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 18 }}>
                <View style={{ flexDirection: 'row', gap: 8, paddingVertical: 4 }}>
                  {getNext30Days().map(d => {
                    const iso = dateISO(d);
                    const cfg = (doctor as any)?.calendar?.[iso];
                    const hasMorning = cfg?.morning?.enabled === true;
                    const hasEvening = cfg?.evening?.enabled === true;
                    const hasAny = hasMorning || hasEvening;
                    // No calendar entry OR explicitly off OR no enabled shift → treat as holiday
                    const isOff = !cfg || cfg?.off === true || !hasAny;
                    const active = pickDate === iso;
                    return (
                      <TouchableOpacity
                        key={iso}
                        onPress={() => {
                          setPickDate(iso);
                          if (hasMorning && !hasEvening) setPickShift('morning');
                          else if (hasEvening && !hasMorning) setPickShift('evening');
                        }}
                        disabled={isOff}
                        style={[
                          S.dateCell,
                          active && S.dateCellActive,
                          isOff && { opacity: 0.22 },
                          !isOff && !active && { borderColor: 'rgba(45,212,191,0.2)' },
                        ]}
                      >
                        <Text style={[S.dateDayLabel, active && { color: TEAL_LT }]}>{dayLabel(d)}</Text>
                        <Text style={[S.dateDayNum,   active && { color: '#FFF'   }]}>{d.getDate()}</Text>
                        <Text style={[S.dateMonth,    active && { color: TEAL_LT }]}>
                          {d.toLocaleDateString('en-IN', { month: 'short' })}
                        </Text>
                        {/* Shift dots — only show on properly configured days */}
                        <View style={{ flexDirection: 'row', gap: 3, marginTop: 2 }}>
                          {!isOff && hasMorning && <View style={{ width: 5, height: 5, borderRadius: 2.5, backgroundColor: '#FCD34D' }} />}
                          {!isOff && hasEvening && <View style={{ width: 5, height: 5, borderRadius: 2.5, backgroundColor: '#A5B4FC' }} />}
                          {isOff && <Text style={{ fontSize: 9, color: '#F87171' }}>Off</Text>}
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </ScrollView>

              {/* ── Shift selector — driven by calendar[pickDate] ── */}
              <Text style={S.modalSectionLabel}>SHIFT</Text>
              {(() => {
                const cal = (doctor as any)?.calendar ?? {};
                const dayCfg = cal[pickDate];
                const isOff = !dayCfg || dayCfg?.off === true
                  || !(dayCfg?.morning?.enabled === true || dayCfg?.evening?.enabled === true);

                if (isOff) {
                  return (
                    <View style={{ alignItems: 'center', paddingVertical: 20, marginBottom: 16 }}>
                      <Feather name="slash" size={28} color="#F87171" style={{ marginBottom: 8 }} />
                      <Text style={{ color: '#F87171', fontWeight: '700', fontSize: 13 }}>This day is marked as Holiday</Text>
                    </View>
                  );
                }

                return (
                  <View style={S.shiftRow}>
                    {(['morning', 'evening'] as const).map(s => {
                      const shiftCfg = dayCfg?.[s];
                      const enabled = shiftCfg?.enabled === true;
                      const active = pickShift === s;
                      const timeRange = shiftCfg ? `${shiftCfg.startTime ?? ''} – ${shiftCfg.endTime ?? ''}` : '';
                      const clinicName = shiftCfg?.clinicName ?? '';
                      const maxTok = shiftCfg?.maxTokens ? String(shiftCfg.maxTokens) : null;
                      return (
                        <TouchableOpacity
                          key={s}
                          onPress={() => enabled && setPickShift(s)}
                          disabled={!enabled}
                          style={[
                            S.shiftOpt,
                            active && (s === 'morning' ? S.shiftOptMorn : S.shiftOptEve),
                            !enabled && { opacity: 0.25 },
                            { height: 'auto', minHeight: 68, paddingVertical: 12, paddingHorizontal: 8, gap: 3, alignItems: 'flex-start' },
                          ]}
                        >
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                            <Feather name={s === 'morning' ? 'sun' : 'moon'} size={16} color={active ? (s === 'morning' ? '#FCD34D' : '#A5B4FC') : 'rgba(255,255,255,0.4)'} />
                            <Text style={[S.shiftOptLabel, active && { color: '#FFF' }]}>
                              {s === 'morning' ? 'Morning' : 'Evening'}
                            </Text>
                            {!enabled && <Text style={S.shiftOptOff}>Off</Text>}
                          </View>
                          {timeRange.trim() !== '–' && timeRange !== '' && (
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                              <Feather name="clock" size={10} color={active ? 'rgba(255,255,255,0.75)' : 'rgba(255,255,255,0.3)'} />
                              <Text style={{ fontSize: 11, color: active ? 'rgba(255,255,255,0.75)' : 'rgba(255,255,255,0.3)', fontWeight: '600' }}>{timeRange}</Text>
                            </View>
                          )}
                          {clinicName ? (
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                              <Feather name="home" size={10} color={active ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.25)'} />
                              <Text style={{ fontSize: 10, color: active ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.25)', fontWeight: '500' }} numberOfLines={1}>{clinicName}</Text>
                            </View>
                          ) : null}
                          {maxTok ? (
                            <Text style={{ fontSize: 10, color: active ? TEAL_LT : 'rgba(255,255,255,0.3)', fontWeight: '700', marginTop: 2 }}>
                              Max: {maxTok} tokens
                            </Text>
                          ) : null}
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                );
              })()}

              {/* Confirm */}
              <TouchableOpacity
                style={S.confirmBtn}
                onPress={() => {
                  const cal = (doctor as any)?.calendar ?? {};
                  const dayCfg = cal[pickDate];
                  const isDayOff = !dayCfg || dayCfg?.off === true
                    || !(dayCfg?.morning?.enabled === true || dayCfg?.evening?.enabled === true);
                  const shiftEnabled = dayCfg?.[pickShift]?.enabled === true;
                  if (isDayOff || !shiftEnabled) {
                    Alert.alert(
                      'Select a Clinic',
                      'Please select a valid date and shift with a clinic assigned before applying.',
                      [{ text: 'OK' }]
                    );
                    return;
                  }
                  setSchedDate(pickDate);
                  setShift(pickShift);
                  setShowSchedule(false);
                }}
              >
                <View style={{flexDirection:'row',alignItems:'center',gap:7}}>
                <Feather name="check" size={15} color="#FFF" />
                <Text style={S.confirmBtnTxt}>Open Queue</Text>
              </View>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* ── SEND ALERT MODAL ──────────────────────── */}
      <Modal
        visible={!!alertTok}
        transparent
        animationType="slide"
        onRequestClose={() => { if (!alertSending) setAlertTok(null); }}
      >
        <TouchableOpacity
          style={S.modalOverlay}
          activeOpacity={1}
          onPress={() => { if (!alertSending) setAlertTok(null); }}
        >
          <TouchableOpacity activeOpacity={1} onPress={() => {}}>
            <View style={S.modalSheet}>
              <View style={S.modalHandle} />

              {/* Patient info row */}
              <View style={S.alertPatRow}>
                <Feather name="bell" size={26} color="#F59E0B" />
                <View style={{ flex: 1 }}>
                  <Text style={S.alertPatName}>{alertTok?.patientName}</Text>
                  <Text style={S.alertPatPhone}>{alertTok?.patientPhone}</Text>
                </View>
              </View>

              <Text style={S.alertLabel}>MESSAGE  <Text style={{ color: alertMsg.length > 60 ? RED : 'rgba(255,255,255,0.3)' }}>{alertMsg.length}/60</Text></Text>
              <TextInput
                style={S.alertInput}
                value={alertMsg}
                onChangeText={t => setAlertMsg(t.slice(0, 60))}
                placeholder="Type your message…"
                placeholderTextColor="rgba(255,255,255,0.25)"
                multiline
                numberOfLines={3}
                maxLength={60}
                autoFocus
              />
              {/* Read-only doctor name suffix preview */}
              <View style={S.alertSuffix}>
                <Text style={S.alertSuffixTxt}>
                  {`-${doctor?.name?.startsWith('Dr.') ? doctor?.name : `Dr. ${doctor?.name ?? ''}`} (LineSetu App)`}
                </Text>
                <Text style={S.alertSuffixHint}>auto-appended to SMS</Text>
              </View>

              {alertResult === 'sent' && (
                <View style={S.alertSuccess}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Feather name="check" size={14} color={GREEN} />
                    <Text style={{ color: GREEN, fontWeight: '800', fontSize: 14 }}>Alert sent!</Text>
                  </View>
                </View>
              )}
              {alertResult === 'error' && (
                <View style={S.alertError}>
                  <Text style={{ color: RED, fontWeight: '700', fontSize: 13 }}>Failed to send — try again</Text>
                </View>
              )}

              <TouchableOpacity
                style={[S.alertSendBtn, (alertSending || alertMsg.trim().length === 0) && { opacity: 0.5 }]}
                onPress={doSendAlert}
                disabled={alertSending || alertMsg.trim().length === 0}
              >
                {alertSending
                  ? <ActivityIndicator color="#FFF" size="small" />
                  : <View style={{flexDirection:'row',alignItems:'center',gap:7}}>
                      <Feather name="bell" size={15} color="#FCD34D" />
                      <Text style={S.alertSendTxt}>Send Alert</Text>
                    </View>}
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

// ─── STYLES ──────────────────────────────────────────────────────
const S = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG, ...(isWeb && { paddingTop: 44 }) },
  root: { flex: 1, backgroundColor: BG },
  orbTR: { position: 'absolute', top: -60, right: -60, width: 180, height: 180, borderRadius: 90, backgroundColor: 'rgba(13,148,136,0.18)' },
  orbBL: { position: 'absolute', bottom: 120, left: -80, width: 200, height: 200, borderRadius: 100, backgroundColor: 'rgba(245,158,11,0.1)' },

  // Header
  hdr:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 10, paddingBottom: 12 },
  hdrSub:    { fontSize: 10, fontWeight: '700', color: 'rgba(255,255,255,0.4)', letterSpacing: 1.5, textTransform: 'uppercase' },
  hdrTitle:  { fontSize: 16, fontWeight: '800', color: '#FFF', marginTop: 2 },
  schedBtn:  { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20, borderWidth: 1, backgroundColor: 'rgba(13,148,136,0.18)', borderColor: 'rgba(45,212,191,0.4)' },
  schedTxt:  { fontSize: 11, fontWeight: '800', color: TEAL_LT },
  walkInBtn: { width: 34, height: 34, borderRadius: 10, backgroundColor: 'rgba(13,148,136,0.25)', borderWidth: 1, borderColor: 'rgba(45,212,191,0.45)', alignItems: 'center', justifyContent: 'center' },
  bellBtn:   { width: 36, height: 36, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center', position: 'relative' },
  bellDot:   { position: 'absolute', top: 6, right: 7, width: 8, height: 8, borderRadius: 4, backgroundColor: '#EF4444', borderWidth: 1.5, borderColor: BG },

  // Schedule modal
  modalOverlay:    { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalSheet:      { backgroundColor: '#0D1321', borderTopLeftRadius: 26, borderTopRightRadius: 26, padding: 22, paddingBottom: 36, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.08)' },
  modalHandle:     { width: 36, height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.15)', alignSelf: 'center', marginBottom: 18 },
  modalTitle:      { fontSize: 18, fontWeight: '900', color: '#FFF', marginBottom: 4 },
  modalSub:        { fontSize: 12, color: 'rgba(255,255,255,0.4)', fontWeight: '500', marginBottom: 20 },
  modalSectionLabel:{ fontSize: 10, fontWeight: '800', color: 'rgba(255,255,255,0.35)', letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 10 },
  dateCell:        { width: 60, height: 72, borderRadius: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', backgroundColor: 'rgba(255,255,255,0.04)', alignItems: 'center', justifyContent: 'center', gap: 2 },
  dateCellActive:  { backgroundColor: 'rgba(13,148,136,0.25)', borderColor: 'rgba(45,212,191,0.5)', borderWidth: 1.5 },
  dateDayLabel:    { fontSize: 10, fontWeight: '700', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' },
  dateDayNum:      { fontSize: 22, fontWeight: '900', color: 'rgba(255,255,255,0.7)', lineHeight: 26 },
  dateMonth:       { fontSize: 10, fontWeight: '600', color: 'rgba(255,255,255,0.35)' },
  shiftRow:        { flexDirection: 'row', gap: 10, marginBottom: 22 },
  shiftOpt:        { flex: 1, height: 60, borderRadius: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.09)', backgroundColor: 'rgba(255,255,255,0.04)', alignItems: 'center', justifyContent: 'center', gap: 4 },
  shiftOptMorn:    { backgroundColor: 'rgba(245,158,11,0.18)', borderColor: 'rgba(245,158,11,0.45)', borderWidth: 1.5 },
  shiftOptEve:     { backgroundColor: 'rgba(196,181,253,0.15)', borderColor: 'rgba(196,181,253,0.4)', borderWidth: 1.5 },
  shiftOptIcon:    { fontSize: 18, opacity: 0.55 },
  shiftOptLabel:   { fontSize: 12, fontWeight: '800', color: 'rgba(255,255,255,0.5)' },
  shiftOptOff:     { fontSize: 9, fontWeight: '700', color: '#F87171', textTransform: 'uppercase' },
  confirmBtn:      { height: 52, borderRadius: 16, backgroundColor: TEAL, alignItems: 'center', justifyContent: 'center' },
  confirmBtnTxt:   { fontSize: 15, fontWeight: '900', color: '#FFF' },

  // Stats
  statsBar:  { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)', overflow: 'hidden' },
  statCell:  { flex: 1, alignItems: 'center', paddingVertical: 10 },
  statBorder:{ borderRightWidth: 1, borderRightColor: 'rgba(255,255,255,0.06)' },
  statVal:   { fontSize: 20, fontWeight: '900', letterSpacing: -0.5 },
  statLbl:   { fontSize: 9, fontWeight: '700', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: 0.6, marginTop: 1 },

  // Token chip
  chip:     { backgroundColor: 'rgba(13,148,136,0.2)', borderWidth: 1, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 5, alignItems: 'center', minWidth: 52, flexShrink: 0 },
  chipLg:   { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 12, minWidth: 66 },
  chipLabel:{ fontSize: 9, fontWeight: '600', color: 'rgba(255,255,255,0.5)', letterSpacing: 1, textTransform: 'uppercase' },
  chipNum:  { fontSize: 16, fontWeight: '900', lineHeight: 20 },
  chipNumLg:{ fontSize: 22, lineHeight: 26 },

  // Badge
  badge:    { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 99, borderWidth: 1 },
  badgeTxt: { fontSize: 10, fontWeight: '800', letterSpacing: 0.8 },

  // Patient info
  patName:   { fontSize: 15, fontWeight: '700', color: '#FFF' },
  patNameLg: { fontSize: 18, fontWeight: '800' },
  patMeta:   { fontSize: 12, color: 'rgba(255,255,255,0.45)', marginTop: 2 },

  // In Consultation card — amber / gold theme
  consCard:   { backgroundColor: 'rgba(180,83,9,0.18)', borderWidth: 1.5, borderColor: 'rgba(252,211,77,0.4)', borderRadius: 18, padding: 16, shadowColor: '#F59E0B', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.28, shadowRadius: 20 },
  consHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 },
  consLabel:  { fontSize: 11, fontWeight: '800', color: AMBER_LT, letterSpacing: 1.5, textTransform: 'uppercase' },
  consRow:    { flexDirection: 'row', alignItems: 'flex-start', gap: 14 },
  ringWrap:   { position: 'relative', padding: 10, alignSelf: 'flex-start' },
  consBtnRow: { flexDirection: 'row', gap: 10, marginTop: 14 },
  skipBtn:    { flex: 1, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(180,83,9,0.3)', borderWidth: 1, borderColor: 'rgba(252,211,77,0.3)' },
  skipBtnTxt: { fontSize: 13, fontWeight: '800', color: '#FCD34D' },
  doneBtn:    { flex: 2, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: '#B45309', borderWidth: 1, borderColor: 'rgba(252,211,77,0.5)', shadowColor: '#F59E0B', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.45, shadowRadius: 14 },
  doneBtnTxt: { fontSize: 13, fontWeight: '800', color: '#FCD34D' },

  // Empty placeholder cards
  emptyCard:    { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', borderRadius: 16, padding: 14 },
  emptyCardTxt: { fontSize: 13, color: 'rgba(255,255,255,0.3)', fontWeight: '600' },

  // Up Next
  upNextCard:   { backgroundColor: 'rgba(13,148,136,0.1)', borderWidth: 1.5, borderColor: 'rgba(45,212,191,0.3)', borderRadius: 18, padding: 14 },
  upNextHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  upNextLabel:  { fontSize: 11, fontWeight: '800', color: TEAL_LT, letterSpacing: 1.5, textTransform: 'uppercase' },
  upNextRow:    { flexDirection: 'row', alignItems: 'center', gap: 12 },
  upNextChevron:{ fontSize: 24, fontWeight: '300', color: TEAL_LT },
  callBtn:      { width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(13,148,136,0.2)', borderWidth: 1, borderColor: 'rgba(45,212,191,0.3)', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },

  // Waiting list header
  waitingHeader:{ alignItems: 'center', justifyContent: 'center', marginBottom: 8, paddingTop: 6, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.07)', gap: 2 },
  waitingTitle: { fontSize: 17, fontWeight: '900', color: '#FFFFFF', letterSpacing: 2, textTransform: 'uppercase', textAlign: 'center' },
  waitingCount: { fontSize: 12, fontWeight: '700', color: TEAL_LT, textAlign: 'center' },

  // Tabs
  tabBar:     { flexDirection: 'row', gap: 5, marginBottom: 4 },
  tabItem:    { flex: 1, paddingVertical: 10, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.09)', backgroundColor: 'rgba(255,255,255,0.05)', alignItems: 'center', position: 'relative' },
  tabTxt:     { fontSize: 11, fontWeight: '700' },
  tabBadge:   { position: 'absolute', top: -7, right: -5, width: 18, height: 18, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  tabBadgeTxt:{ fontSize: 10, fontWeight: '900' },

  // Waiting cards
  waitCard:   { backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.09)', borderRadius: 16, padding: 14, marginBottom: 8 },
  waitRow:    { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 10 },
  waitBtns:   { flexDirection: 'row', gap: 7, marginTop: 2 },
  sendNextBtn:{ flex: 1.1, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(13,148,136,0.22)', borderWidth: 1, borderColor: 'rgba(45,212,191,0.35)' },
  sendNextTxt:{ fontSize: 12, fontWeight: '800', color: TEAL_LT },
  skipWaitBtn:{ flex: 0.9, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(180,83,9,0.18)', borderWidth: 1, borderColor: 'rgba(252,211,77,0.3)' },
  skipWaitTxt:{ fontSize: 12, fontWeight: '800', color: AMBER_LT },
  alertBtn:   { width: 44, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(245,158,11,0.12)', borderWidth: 1, borderColor: 'rgba(245,158,11,0.25)' },
  alertBtnTxt:{ fontSize: 16 },

  // Alert modal
  alertPatRow:   { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 20, backgroundColor: 'rgba(245,158,11,0.08)', borderRadius: 14, padding: 12, borderWidth: 1, borderColor: 'rgba(245,158,11,0.2)' },
  alertPatIcon:  { fontSize: 26 },
  alertPatName:  { fontSize: 15, fontWeight: '800', color: '#FFF' },
  alertPatPhone: { fontSize: 12, color: 'rgba(255,255,255,0.45)', marginTop: 2 },
  alertLabel:    { fontSize: 10, fontWeight: '800', color: 'rgba(255,255,255,0.4)', letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 8 },
  alertInput:    { backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)', borderRadius: 14, padding: 14, color: '#FFF', fontSize: 14, fontWeight: '600', minHeight: 88, textAlignVertical: 'top', marginBottom: 14 },
  alertSuccess:  { backgroundColor: 'rgba(74,222,128,0.1)', borderWidth: 1, borderColor: 'rgba(74,222,128,0.3)', borderRadius: 10, padding: 12, alignItems: 'center', marginBottom: 12 },
  alertError:    { backgroundColor: 'rgba(239,68,68,0.1)', borderWidth: 1, borderColor: 'rgba(239,68,68,0.25)', borderRadius: 10, padding: 12, alignItems: 'center', marginBottom: 12 },
  alertSuffix:   { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'rgba(255,255,255,0.03)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8, marginBottom: 14 },
  alertSuffixTxt:{ fontSize: 13, fontWeight: '700', color: 'rgba(255,255,255,0.55)', fontStyle: 'italic' },
  alertSuffixHint:{ fontSize: 10, color: 'rgba(255,255,255,0.25)', fontWeight: '600' },
  alertSendBtn:  { height: 50, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: '#B45309', borderWidth: 1, borderColor: 'rgba(252,211,77,0.5)', shadowColor: '#F59E0B', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 12 },
  alertSendTxt:  { fontSize: 15, fontWeight: '800', color: '#FCD34D', letterSpacing: 0.4 },
  refundBtn:  { marginTop: 8, height: 38, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(239,68,68,0.1)', borderWidth: 1, borderColor: 'rgba(239,68,68,0.25)' },
  refundTxt:  { fontSize: 11, fontWeight: '800', color: '#FCA5A5', letterSpacing: 0.3 },

  // Empty state
  emptyState:    { alignItems: 'center', paddingVertical: 44 },
  emptyStateIcon:{ fontSize: 32, marginBottom: 10 },
  emptyStateTxt: { fontSize: 13, color: 'rgba(255,255,255,0.25)', fontWeight: '600', textAlign: 'center' },

  // All-tab serial rows
  allRow:   { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)', borderRadius: 12, padding: 10, marginBottom: 6 },
  allBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 7, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
});
