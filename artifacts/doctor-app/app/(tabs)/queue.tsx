import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  ActivityIndicator, RefreshControl, Platform, Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { BG, TEAL, TEAL_LT } from '../../constants/theme';
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

async function apiFetchQueue(doctorId: string, shift: string) {
  const r = await fetch(`${BASE()}/api/queues/${doctorId}?date=${todayISO()}&shift=${shift}`);
  if (!r.ok) throw new Error('queue fetch failed');
  return r.json();
}
async function apiFetchAll(doctorId: string) {
  const r = await fetch(`${BASE()}/api/tokens?doctorId=${doctorId}&date=${todayISO()}`);
  if (!r.ok) throw new Error('tokens fetch failed');
  return r.json();
}
async function apiCall(id: string)   { await fetch(`${BASE()}/api/tokens/${id}/call`,   { method: 'PATCH' }); }
async function apiDone(id: string, callNextId?: string) {
  await fetch(`${BASE()}/api/tokens/${id}/done`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ callNextId: callNextId ?? null }),
  });
}
async function apiSendNext(id: string) {
  const r = await fetch(`${BASE()}/api/tokens/${id}/upnext`, { method: 'PATCH' });
  if (!r.ok) throw new Error(`sendNext failed ${r.status}`);
  return r.json();
}
async function apiSkip(id: string)   { await fetch(`${BASE()}/api/tokens/${id}/skip`,   { method: 'PATCH' }); }
async function apiCancel(id: string) { await fetch(`${BASE()}/api/tokens/${id}/cancel`, { method: 'PATCH' }); }

// ─── Types ───────────────────────────────────────────────────────
type DisplayStatus = 'consulting' | 'upnext' | 'waiting' | 'done' | 'skipped';
type TabKey = 'normal' | 'emergency' | 'skipped' | 'consulted';

interface MasterRow {
  id: string; tokenNumber: number; patientName: string;
  type: string; source: string; status: string; bookedAt: any;
}

interface Token {
  id: string; tokenNumber: number; patientName: string; patientPhone: string;
  type: 'normal' | 'emergency'; source: string; status: string;
  displayStatus: DisplayStatus; shift: string; calledAt?: any;
  age?: string; gender?: string; area?: string;
}

function sortRows(tokens: MasterRow[]) {
  return [...tokens].sort((a, b) => (a.tokenNumber ?? 0) - (b.tokenNumber ?? 0));
}

function mapToken(t: any): Token {
  return {
    id: t.id, tokenNumber: t.tokenNumber ?? 0,
    patientName: t.patientName ?? 'Unknown',
    patientPhone: t.patientPhone ?? '',
    type: t.type === 'emergency' ? 'emergency' : 'normal',
    source: t.source || '',
    status: t.status,
    displayStatus:
      t.status === 'in_consult' ? 'consulting' :
      t.status === 'up_next'    ? 'upnext'     :
      t.status === 'done'       ? 'done'       :
      t.status === 'skipped'    ? 'skipped'    :
      t.status === 'cancelled'  ? 'skipped'    : 'waiting',
    shift: t.shift ?? 'morning', calledAt: t.calledAt,
    age: t.age ?? undefined,
    gender: t.gender ?? undefined,
    area: t.area ?? undefined,
  };
}

// ─── Master Queue (SSE + REST polling) ───────────────────────────
function useMasterQueue(doctorId: string) {
  const [rows, setRows] = useState<MasterRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!doctorId) return;
    let active = true;
    const fetchNow = async () => {
      try {
        const res = await fetch(`${BASE()}/api/tokens?doctorId=${doctorId}&date=${todayISO()}`);
        const data = await res.json();
        if (data.tokens && active) setRows(sortRows(data.tokens));
      } catch (_) {}
      if (active) setLoading(false);
    };
    fetchNow();
    const iv = setInterval(fetchNow, 30_000);
    let es: any = null;
    if (typeof EventSource !== 'undefined') {
      es = new EventSource(`${BASE()}/api/tokens/stream/${doctorId}?date=${todayISO()}`);
      es.onmessage = (e: MessageEvent) => {
        try {
          const tokens: MasterRow[] = JSON.parse(e.data);
          if (active) { setRows(sortRows(tokens)); setLoading(false); }
        } catch (_) {}
      };
    }
    return () => { active = false; clearInterval(iv); es?.close(); };
  }, [doctorId]);

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

// ─── Type Badge ──────────────────────────────────────────────────
function TypeBadge({ type, source }: { type: string; source: string }) {
  if (type === 'emergency') {
    return (
      <View style={[S.badge, { backgroundColor: 'rgba(239,68,68,0.18)', borderColor: 'rgba(239,68,68,0.4)' }]}>
        <Text style={[S.badgeTxt, { color: RED }]}>🚨 EMERGENCY</Text>
      </View>
    );
  }
  if (source === 'walkin') {
    return (
      <View style={[S.badge, { backgroundColor: 'rgba(103,232,249,0.12)', borderColor: 'rgba(103,232,249,0.3)' }]}>
        <Text style={[S.badgeTxt, { color: CYAN }]}>WALK-IN</Text>
      </View>
    );
  }
  return (
    <View style={[S.badge, { backgroundColor: 'rgba(74,222,128,0.12)', borderColor: 'rgba(74,222,128,0.3)' }]}>
      <Text style={[S.badgeTxt, { color: GREEN }]}>E-TOKEN</Text>
    </View>
  );
}

// ─── Patient Info ────────────────────────────────────────────────
function PatientInfo({ tok, large = false }: { tok: Token; large?: boolean }) {
  const genderLabel = tok.gender === 'M' || tok.gender === 'male'   ? 'Male'
    : tok.gender === 'F' || tok.gender === 'female' ? 'Female'
    : tok.gender ?? '';
  return (
    <View style={{ flex: 1, minWidth: 0 }}>
      <Text style={[S.patName, large && S.patNameLg]} numberOfLines={1}>{tok.patientName}</Text>
      {(tok.age || genderLabel) ? (
        <Text style={S.patMeta}>
          {[tok.age ? `${tok.age} yr` : '', genderLabel].filter(Boolean).join(' • ')}
        </Text>
      ) : null}
      <View style={{ flexDirection: 'row', marginTop: 5, flexWrap: 'wrap', gap: 5 }}>
        <TypeBadge type={tok.type} source={tok.source} />
      </View>
    </View>
  );
}

// ─── Stats Bar ───────────────────────────────────────────────────
function StatsBar({ all }: { all: Token[] }) {
  const total   = all.length;
  const waiting = all.filter(t => t.displayStatus === 'waiting' || t.displayStatus === 'upnext').length;
  const done    = all.filter(t => t.displayStatus === 'done').length;
  const skipped = all.filter(t => t.displayStatus === 'skipped').length;
  const stats = [
    { label: 'Total',   val: total,   color: TEAL_LT  },
    { label: 'Waiting', val: waiting, color: AMBER_LT },
    { label: 'Done',    val: done,    color: GREEN    },
    { label: 'Skipped', val: skipped, color: PURPLE   },
  ];
  return (
    <View style={S.statsBar}>
      {stats.map((s, i) => (
        <View key={s.label} style={[S.statCell, i < 3 && S.statBorder]}>
          <Text style={[S.statVal, { color: s.color }]}>{s.val}</Text>
          <Text style={S.statLbl}>{s.label}</Text>
        </View>
      ))}
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
        <Text style={{ color: 'rgba(255,255,255,0.25)', fontSize: 20, alignSelf: 'center' }}>›</Text>
      </TouchableOpacity>
      <View style={S.consBtnRow}>
        <TouchableOpacity
          style={[S.skipBtn, busy && { opacity: 0.5 }]}
          onPress={onSkip} disabled={busy}
        >
          {busy
            ? <ActivityIndicator color="#FCA5A5" size="small" />
            : <Text style={S.skipBtnTxt}>⏭  Skip</Text>}
        </TouchableOpacity>
        <TouchableOpacity
          style={[S.doneBtn, busy && { opacity: 0.5 }]}
          onPress={onDone} disabled={busy}
        >
          {busy
            ? <ActivityIndicator color="#FFF" size="small" />
            : <Text style={S.doneBtnTxt}>✓  Consulted & Call Next</Text>}
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
        {nextTok ? 'Tap "Send Next" below to call a patient in' : 'No patient in consultation'}
      </Text>
    </View>
  );
}

// ─── Up Next Card ────────────────────────────────────────────────
function UpNextCard({ tok, onCall, busy, isManual }: { tok: Token; onCall: () => void; busy: boolean; isManual?: boolean }) {
  return (
    <View style={[S.upNextCard, isManual && { borderColor: 'rgba(252,211,77,0.5)', backgroundColor: 'rgba(180,83,9,0.12)' }]}>
      <View style={S.upNextHeader}>
        <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: isManual ? AMBER_LT : TEAL_LT, marginRight: 6 }} />
        <Text style={[S.upNextLabel, isManual && { color: AMBER_LT }]}>{isManual ? '⭐  MANUALLY CHOSEN' : 'UP NEXT'}</Text>
      </View>
      <View style={S.upNextRow}>
        <TouchableOpacity
          style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }}
          onPress={() => router.push(`/patients/${tok.id}` as any)}
          activeOpacity={0.75}
        >
          <TokenChip token={tok.tokenNumber} type={tok.type} />
          <PatientInfo tok={tok} />
        </TouchableOpacity>
        {busy && <ActivityIndicator color={TEAL_LT} size="small" style={{ marginLeft: 4 }} />}
      </View>
    </View>
  );
}

// ─── Up Next Empty ───────────────────────────────────────────────
function UpNextEmpty() {
  return (
    <View style={S.emptyCard}>
      <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: 'rgba(45,212,191,0.3)', marginRight: 8 }} />
      <Text style={S.emptyCardTxt}>No patients waiting</Text>
    </View>
  );
}

// ─── Waiting Card ────────────────────────────────────────────────
function WaitingCard({ tok, onSendNext, onSendAlert, onSkip, onRefund, busy, isManualNext }: {
  tok: Token; onSendNext: () => void; onSendAlert: () => void; onSkip: () => void; onRefund: () => void; busy: boolean; isManualNext?: boolean;
}) {
  return (
    <View style={[S.waitCard, isManualNext && { borderColor: 'rgba(252,211,77,0.45)', backgroundColor: 'rgba(180,83,9,0.1)' }]}>
      <TouchableOpacity
        style={S.waitRow}
        onPress={() => router.push(`/patients/${tok.id}` as any)}
        activeOpacity={0.75}
      >
        <TokenChip token={tok.tokenNumber} type={tok.type} />
        <PatientInfo tok={tok} />
        <Text style={{ color: 'rgba(255,255,255,0.2)', fontSize: 16, marginLeft: 4 }}>›</Text>
      </TouchableOpacity>
      <View style={S.waitBtns}>
        <TouchableOpacity
          style={[S.sendNextBtn, busy && { opacity: 0.5 }]}
          onPress={onSendNext} disabled={busy}
        >
          {busy
            ? <ActivityIndicator color={TEAL_LT} size="small" />
            : <Text style={[S.sendNextTxt, isManualNext && { color: AMBER_LT }]}>
                {isManualNext ? '⭐  Set as Next' : '▶  Send Next'}
              </Text>}
        </TouchableOpacity>
        <TouchableOpacity
          style={[S.skipWaitBtn, busy && { opacity: 0.5 }]}
          onPress={onSkip} disabled={busy}
        >
          <Text style={S.skipWaitTxt}>↷  Skip</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[S.alertBtn, busy && { opacity: 0.5 }]}
          onPress={onSendAlert} disabled={busy}
        >
          <Text style={S.alertBtnTxt}>🔔</Text>
        </TouchableOpacity>
      </View>
      {tok.displayStatus === 'skipped' && (
        <TouchableOpacity
          style={[S.refundBtn, busy && { opacity: 0.5 }]}
          onPress={onRefund} disabled={busy}
        >
          <Text style={S.refundTxt}>↩  Refund & Cancel</Text>
        </TouchableOpacity>
      )}
    </View>
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
        <Text style={{ color: isDone ? GREEN : AMBER, fontSize: 16, marginLeft: 6 }}>
          {isDone ? '✓' : '↷'}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

// ─── MAIN SCREEN ─────────────────────────────────────────────────
export default function QueueScreen() {
  const { doctor } = useDoctor();
  const qc = useQueryClient();
  const [tab,    setTab]  = useState<TabKey>('normal');
  const [shift,  setShift] = useState<'morning' | 'evening'>('morning');
  const [busyId, setBusy]  = useState<string | null>(null);
  const upNextRef = useRef<string | undefined>(undefined);
  const docId = doctor?.id ?? '';

  const { data: qData, refetch: refetchQ } = useQuery({
    queryKey: ['dq', docId, shift],
    queryFn: () => apiFetchQueue(docId, shift),
    enabled: !!docId, refetchInterval: 30000, staleTime: 15000, retry: 1,
  });
  const { data: aData, isLoading, isRefetching, refetch } = useQuery({
    queryKey: ['da', docId],
    queryFn: () => apiFetchAll(docId),
    enabled: !!docId, refetchInterval: 30000, staleTime: 15000, retry: 1,
  });
  const { rows: masterRows } = useMasterQueue(docId);

  const inv = useCallback(() => {
    qc.invalidateQueries({ queryKey: ['dq', docId] });
    qc.invalidateQueries({ queryKey: ['da', docId] });
  }, [qc, docId]);

  const doCall = async (id: string) => {
    setBusy(id); try { await apiCall(id); inv(); } catch {} setBusy(null);
  };
  const doDone = async (id: string) => {
    const nextId = upNextRef.current; // locked at click-time — matches what Up Next card shows
    setBusy(id);
    try {
      // Single atomic API call: marks done + calls next in ONE Firebase batch → ONE SSE event
      await apiDone(id, nextId);
      inv(); // single invalidation after everything is committed
    } catch {}
    setBusy(null);
  };
  const doSkipToken = async (id: string) => {
    setBusy(id); try { await apiSkip(id); inv(); } catch {} setBusy(null);
  };
  const doCancel = async (id: string) => {
    setBusy(id); try { await apiCancel(id); inv(); } catch {} setBusy(null);
  };
  const doSendNext = async (id: string) => {
    setBusy(id); try { await apiSendNext(id); inv(); } catch {} setBusy(null);
  };

  // ── Data (filter to selected shift only — prevents cross-shift token bleed) ──
  const restTokens: Token[] = (aData?.tokens ?? []).map(mapToken).filter(t => t.shift === shift);
  const masterFiltered: Token[] = masterRows.map(mapToken).filter(t => t.shift === shift);
  const all: Token[] = restTokens.length > 0 ? restTokens : masterFiltered;

  const consulting = all.find(t => t.displayStatus === 'consulting');
  const waitSorted = all.filter(t => t.displayStatus === 'waiting').sort((a, b) => {
    if (a.type === 'emergency' && b.type !== 'emergency') return -1;
    if (b.type === 'emergency' && a.type !== 'emergency') return 1;
    return a.tokenNumber - b.tokenNumber;
  });
  // Priority: 1) DB-persisted up_next pin  2) First emergency  3) First normal
  const pinnedNext = all.find(t => t.displayStatus === 'upnext');
  const upNext = pinnedNext ?? waitSorted[0];
  upNextRef.current = upNext?.id; // always tracks what the Up Next card shows

  const doneList    = all.filter(t => t.displayStatus === 'done');
  const skippedList = all.filter(t => t.displayStatus === 'skipped');

  // ── Tab config ────────────────────────────────────────────────
  const normalList  = waitSorted.filter(t => t.type === 'normal');
  const emergList   = waitSorted.filter(t => t.type === 'emergency');

  const TABS: { key: TabKey; label: string; color: string; count: number }[] = [
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

  const timeOfDay = (() => {
    const h = new Date().getHours();
    if (h < 12) return '☀ Morning';
    if (h < 17) return '🌤 Afternoon';
    return '🌙 Evening';
  })();

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
              {doctor ? `Dr. ${doctor.name}` : 'Dr. Sharma'}
              {isRefetching ? '  ·' : ''}
            </Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <TouchableOpacity
              style={[S.shiftBtn, shift === 'morning' ? S.shiftMorn : S.shiftEve]}
              onPress={() => setShift(s => s === 'morning' ? 'evening' : 'morning')}
            >
              <Text style={[S.shiftTxt, { color: shift === 'morning' ? AMBER_LT : '#C4B5FD' }]}>
                {shift === 'morning' ? '☀ Morning' : '☾ Evening'}
              </Text>
            </TouchableOpacity>
            <View style={S.bellBtn}>
              <Text style={{ fontSize: 16 }}>🔔</Text>
            </View>
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
              <StatsBar all={all} />
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

            {/* ── UP NEXT (sticky) ───────────────────── */}
            <View style={{ paddingHorizontal: 14, paddingBottom: 6 }}>
              {upNext
                ? <UpNextCard tok={upNext} onCall={() => doCall(upNext.id)} busy={busyId === upNext.id} isManual={!!pinnedNext} />
                : <UpNextEmpty />
              }
            </View>

            {/* ── WAITING LIST HEADER + TABS ─────────── */}
            <View style={{ paddingHorizontal: 14 }}>
              <View style={S.waitingHeader}>
                <Text style={S.waitingTitle}>Waiting List</Text>
                <Text style={S.waitingCount}>{waitSorted.length + (pinnedNext ? 1 : 0)} patients</Text>
              </View>
              {/* Tab bar */}
              <View style={S.tabBar}>
                {TABS.map(t => {
                  const active = tab === t.key;
                  return (
                    <TouchableOpacity
                      key={t.key}
                      onPress={() => setTab(t.key)}
                      style={[
                        S.tabItem,
                        active && { backgroundColor: `${t.color}20`, borderColor: `${t.color}55` },
                      ]}
                    >
                      <Text style={[S.tabTxt, { color: active ? t.color : 'rgba(255,255,255,0.3)' }]}>
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
              {tabPatients.length === 0 ? (
                <View style={S.emptyState}>
                  <Text style={S.emptyStateIcon}>
                    {tab === 'consulted' ? '📋' : tab === 'skipped' ? '👍' : '✅'}
                  </Text>
                  <Text style={S.emptyStateTxt}>No patients in this category</Text>
                </View>
              ) : (
                tabPatients.map(tok => {
                  if (tab === 'consulted') {
                    return <PastCard key={tok.id} tok={tok} />;
                  }
                  return (
                    <WaitingCard
                      key={tok.id} tok={tok}
                      busy={busyId === tok.id}
                      isManualNext={false}
                      onSendNext={() => doSendNext(tok.id)}
                      onSendAlert={() => doCall(tok.id)}
                      onSkip={() => doSkipToken(tok.id)}
                      onRefund={() => doCancel(tok.id)}
                    />
                  );
                })
              )}
            </ScrollView>
          </>
        )}
      </View>
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
  hdr:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 10, paddingBottom: 12 },
  hdrSub:   { fontSize: 10, fontWeight: '700', color: 'rgba(255,255,255,0.4)', letterSpacing: 1.5, textTransform: 'uppercase' },
  hdrTitle: { fontSize: 16, fontWeight: '800', color: '#FFF', marginTop: 2 },
  shiftBtn: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20, borderWidth: 1 },
  shiftMorn:{ backgroundColor: 'rgba(245,158,11,0.14)', borderColor: 'rgba(245,158,11,0.35)' },
  shiftEve: { backgroundColor: 'rgba(196,181,253,0.1)',  borderColor: 'rgba(196,181,253,0.3)' },
  shiftTxt: { fontSize: 11, fontWeight: '800' },
  bellBtn:  { width: 36, height: 36, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' },

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
  tabBar:     { flexDirection: 'row', gap: 6, marginBottom: 4 },
  tabItem:    { flex: 1, paddingVertical: 8, borderRadius: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', backgroundColor: 'rgba(255,255,255,0.04)', alignItems: 'center', position: 'relative' },
  tabTxt:     { fontSize: 10, fontWeight: '800' },
  tabBadge:   { position: 'absolute', top: -6, right: -4, width: 16, height: 16, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  tabBadgeTxt:{ fontSize: 9, fontWeight: '900' },

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
  refundBtn:  { marginTop: 8, height: 38, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(239,68,68,0.1)', borderWidth: 1, borderColor: 'rgba(239,68,68,0.25)' },
  refundTxt:  { fontSize: 11, fontWeight: '800', color: '#FCA5A5', letterSpacing: 0.3 },

  // Empty state
  emptyState:    { alignItems: 'center', paddingVertical: 44 },
  emptyStateIcon:{ fontSize: 32, marginBottom: 10 },
  emptyStateTxt: { fontSize: 13, color: 'rgba(255,255,255,0.25)', fontWeight: '600', textAlign: 'center' },
});
