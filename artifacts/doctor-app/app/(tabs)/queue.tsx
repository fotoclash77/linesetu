import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  ActivityIndicator, RefreshControl, Platform, Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { BG, TEAL, TEAL_LT } from '../../constants/theme';
import { useDoctor } from '../../contexts/DoctorContext';

const isWeb = Platform.OS === 'web';

// ─── API helpers ──────────────────────────────────────────────
const BASE = () => `https://${process.env.EXPO_PUBLIC_DOMAIN}`;

const todayDate = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const todayLabel = () => {
  return new Date().toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
};

async function fetchQueue(doctorId: string, shift: string) {
  const res = await fetch(`${BASE()}/api/queues/${doctorId}?date=${todayDate()}&shift=${shift}`);
  if (!res.ok) throw new Error('Failed to fetch queue');
  return res.json();
}

async function fetchAllTokens(doctorId: string) {
  const res = await fetch(`${BASE()}/api/tokens?doctorId=${doctorId}&date=${todayDate()}`);
  if (!res.ok) throw new Error('Failed to fetch tokens');
  return res.json();
}

async function callToken(tokenId: string) {
  const res = await fetch(`${BASE()}/api/tokens/${tokenId}/call`, { method: 'PATCH' });
  if (!res.ok) throw new Error('Failed to call patient');
  return res.json();
}

async function doneToken(tokenId: string) {
  const res = await fetch(`${BASE()}/api/tokens/${tokenId}/done`, { method: 'PATCH' });
  if (!res.ok) throw new Error('Failed to complete consultation');
  return res.json();
}

async function cancelToken(tokenId: string) {
  const res = await fetch(`${BASE()}/api/tokens/${tokenId}/cancel`, { method: 'PATCH' });
  if (!res.ok) throw new Error('Failed to cancel token');
  return res.json();
}

// ─── Types ────────────────────────────────────────────────────
type DisplayStatus = 'consulting' | 'waiting' | 'done' | 'skipped';
type TabKey = 'queue' | 'done';

interface TokenItem {
  id: string;
  tokenNumber: number;
  patientName: string;
  patientPhone: string;
  type: 'normal' | 'emergency';
  source?: string;
  status: string;
  displayStatus: DisplayStatus;
  shift: string;
  calledAt?: any;
}

function mapToken(t: any): TokenItem {
  const displayStatus: DisplayStatus =
    t.status === 'in_consult' ? 'consulting' :
    t.status === 'done'       ? 'done'       :
    t.status === 'cancelled'  ? 'skipped'    : 'waiting';
  return {
    id: t.id,
    tokenNumber: t.tokenNumber ?? 0,
    patientName: t.patientName ?? 'Unknown',
    patientPhone: t.patientPhone ?? '',
    type: t.type === 'emergency' ? 'emergency' : 'normal',
    source: t.source ?? 'online',
    status: t.status,
    displayStatus,
    shift: t.shift ?? 'morning',
    calledAt: t.calledAt,
  };
}

function getTypeCfg(token: TokenItem) {
  if (token.type === 'emergency') return { color: '#F87171', bg: 'rgba(239,68,68,0.15)', icon: '⚡', label: 'Emergency' };
  if (token.source === 'walkin')  return { color: '#FBBF24', bg: 'rgba(251,191,36,0.15)', icon: '🚶', label: 'Walk-in' };
  return { color: '#4ADE80', bg: 'rgba(34,197,94,0.15)', icon: '📱', label: 'Online' };
}

// ─── Live elapsed timer ────────────────────────────────────────
function useElapsed(calledAt: any) {
  const [elapsed, setElapsed] = useState('');
  useEffect(() => {
    const start = calledAt?.seconds ? calledAt.seconds * 1000 : null;
    if (!start) { setElapsed(''); return; }
    const update = () => {
      const mins = Math.floor((Date.now() - start) / 60000);
      setElapsed(mins < 1 ? 'just now' : `${mins}m`);
    };
    update();
    const id = setInterval(update, 30_000);
    return () => clearInterval(id);
  }, [calledAt]);
  return elapsed;
}

// ─── Currently consulting card ─────────────────────────────────
function ConsultingCard({ token, onDone, busy }: { token: TokenItem; onDone: () => void; busy: boolean }) {
  const tc = getTypeCfg(token);
  const elapsed = useElapsed(token.calledAt);
  const pulse = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    const anim = Animated.loop(Animated.sequence([
      Animated.timing(pulse, { toValue: 1.25, duration: 800, useNativeDriver: true }),
      Animated.timing(pulse, { toValue: 1,    duration: 800, useNativeDriver: true }),
    ]));
    anim.start();
    return () => anim.stop();
  }, []);

  return (
    <View style={styles.consultingCard}>
      <View style={styles.glowBlob} />
      <View style={styles.consultingTop}>
        <View style={styles.liveBadge}>
          <Animated.View style={[styles.liveDot2, { transform: [{ scale: pulse }] }]} />
          <Text style={styles.liveBadgeText}>IN CONSULTATION</Text>
        </View>
        {!!elapsed && <Text style={styles.elapsedText}>{elapsed}</Text>}
      </View>
      <View style={styles.consultingHero}>
        <View style={styles.bigTokenBox}>
          <Text style={styles.bigTokenLabel}>TOKEN</Text>
          <Text style={styles.bigTokenText}>#{token.tokenNumber}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.consultingName} numberOfLines={1}>{token.patientName}</Text>
          {!!token.patientPhone && (
            <Text style={styles.consultingPhone}>{token.patientPhone}</Text>
          )}
          <View style={[styles.typeBadge2, { backgroundColor: tc.bg, marginTop: 6 }]}>
            <Text style={{ fontSize: 10, fontWeight: '800', color: tc.color }}>{tc.icon} {tc.label}</Text>
          </View>
        </View>
      </View>
      <TouchableOpacity
        style={[styles.doneBtn, busy && { opacity: 0.5 }]}
        onPress={onDone}
        disabled={busy}
      >
        {busy
          ? <ActivityIndicator color={BG} size="small" />
          : <Text style={styles.doneBtnText}>✓ Done · Next Patient</Text>}
      </TouchableOpacity>
    </View>
  );
}

// ─── Waiting token card ────────────────────────────────────────
function WaitingCard({ token, onCall, onSkip, busy, rank }: {
  token: TokenItem; onCall: () => void; onSkip: () => void; busy: boolean; rank: number;
}) {
  const tc = getTypeCfg(token);
  const isEmergency = token.type === 'emergency';
  return (
    <View style={[styles.qCard, isEmergency && styles.qCardEmergency]}>
      <View style={styles.qCardTop}>
        <View style={{ alignItems: 'center', gap: 3 }}>
          <View style={[styles.tokenBox, isEmergency && styles.tokenBoxEmergency]}>
            <Text style={styles.tokenText}>#{token.tokenNumber}</Text>
          </View>
          <Text style={styles.rankText}>{rank === 1 ? 'Next' : `#${rank}`}</Text>
        </View>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={styles.patName} numberOfLines={1}>{token.patientName}</Text>
          <View style={{ flexDirection: 'row', gap: 5, marginTop: 4, flexWrap: 'wrap' }}>
            <View style={[styles.typeBadge, { backgroundColor: tc.bg }]}>
              <Text style={{ fontSize: 9, color: tc.color, fontWeight: '800' }}>{tc.icon} {tc.label}</Text>
            </View>
            {isEmergency && (
              <View style={styles.priorityBadge}>
                <Text style={styles.priorityBadgeText}>PRIORITY</Text>
              </View>
            )}
          </View>
          {!!token.patientPhone && (
            <Text style={styles.phoneText}>{token.patientPhone}</Text>
          )}
        </View>
      </View>
      <View style={styles.qCardBtns}>
        <TouchableOpacity
          style={[styles.btnCall, rank === 1 && styles.btnCallPrimary, busy && { opacity: 0.5 }]}
          onPress={onCall}
          disabled={busy}
        >
          {busy
            ? <ActivityIndicator color={TEAL_LT} size="small" />
            : <Text style={[styles.btnCallTxt, rank === 1 && { color: BG }]}>
                {rank === 1 ? '📢 Call In Now' : '📢 Call In'}
              </Text>}
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.btnSkip, busy && { opacity: 0.5 }]}
          onPress={onSkip}
          disabled={busy}
        >
          <Text style={styles.btnSkipTxt}>Skip</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── Done/skipped card ─────────────────────────────────────────
function DoneCard({ token }: { token: TokenItem }) {
  const tc = getTypeCfg(token);
  const isDone = token.displayStatus === 'done';
  return (
    <View style={[styles.qCard, { opacity: 0.65 }]}>
      <View style={styles.qCardTop}>
        <View style={[styles.tokenBox, { backgroundColor: isDone ? 'rgba(34,197,94,0.12)' : 'rgba(245,158,11,0.12)', borderColor: isDone ? 'rgba(34,197,94,0.3)' : 'rgba(245,158,11,0.3)' }]}>
          <Text style={styles.tokenText}>#{token.tokenNumber}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.patName, { color: 'rgba(255,255,255,0.55)' }]} numberOfLines={1}>{token.patientName}</Text>
          <View style={{ flexDirection: 'row', gap: 5, marginTop: 4 }}>
            <View style={[styles.typeBadge, { backgroundColor: tc.bg }]}>
              <Text style={{ fontSize: 9, color: tc.color, fontWeight: '800' }}>{tc.icon} {tc.label}</Text>
            </View>
            <View style={[styles.statusBadge, {
              backgroundColor: isDone ? 'rgba(34,197,94,0.1)' : 'rgba(245,158,11,0.1)',
              borderColor: isDone ? 'rgba(34,197,94,0.3)' : 'rgba(245,158,11,0.3)',
            }]}>
              <Text style={{ fontSize: 9, fontWeight: '800', color: isDone ? '#4ADE80' : '#F59E0B' }}>
                {isDone ? '✓ Consulted' : '↷ Skipped'}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────
export default function QueueScreen() {
  const { doctor } = useDoctor();
  const qc = useQueryClient();
  const [tab, setTab] = useState<TabKey>('queue');
  const [shift, setShift] = useState<'morning' | 'evening'>('morning');
  const [busyId, setBusyId] = useState<string | null>(null);

  const doctorId = doctor?.id ?? '';

  const { data: queueData, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['doctor-queue', doctorId, shift],
    queryFn: () => fetchQueue(doctorId, shift),
    enabled: !!doctorId,
    refetchInterval: 5_000,
    staleTime: 0,
  });

  const { data: allData } = useQuery({
    queryKey: ['doctor-tokens-all', doctorId],
    queryFn: () => fetchAllTokens(doctorId),
    enabled: !!doctorId,
    refetchInterval: 8_000,
    staleTime: 0,
  });

  const invalidate = useCallback(() => {
    qc.invalidateQueries({ queryKey: ['doctor-queue', doctorId] });
    qc.invalidateQueries({ queryKey: ['doctor-tokens-all', doctorId] });
  }, [qc, doctorId]);

  const handleCall = async (tokenId: string) => {
    setBusyId(tokenId);
    try { await callToken(tokenId); invalidate(); } catch {}
    setBusyId(null);
  };

  const handleDone = async (tokenId: string) => {
    setBusyId(tokenId);
    try {
      await doneToken(tokenId);
      invalidate();
      // Auto-advance: call next waiting token
      await new Promise(r => setTimeout(r, 600));
      const refreshed = await fetchQueue(doctorId, shift);
      const nextWaiting = (refreshed.tokens ?? [])
        .filter((t: any) => t.status === 'waiting')
        .sort((a: any, b: any) => {
          if (a.type === 'emergency' && b.type !== 'emergency') return -1;
          if (b.type === 'emergency' && a.type !== 'emergency') return 1;
          return (a.tokenNumber ?? 0) - (b.tokenNumber ?? 0);
        })[0];
      if (nextWaiting) {
        await callToken(nextWaiting.id);
        invalidate();
      }
    } catch {}
    setBusyId(null);
  };

  const handleSkip = async (tokenId: string) => {
    setBusyId(tokenId);
    try { await cancelToken(tokenId); invalidate(); } catch {}
    setBusyId(null);
  };

  // Process tokens
  const liveTokens: TokenItem[] = (queueData?.tokens ?? []).map(mapToken);
  const current = liveTokens.find(t => t.displayStatus === 'consulting');
  const waiting = liveTokens
    .filter(t => t.displayStatus === 'waiting')
    .sort((a, b) => {
      // Emergency first, then by token number
      if (a.type === 'emergency' && b.type !== 'emergency') return -1;
      if (b.type === 'emergency' && a.type !== 'emergency') return 1;
      return a.tokenNumber - b.tokenNumber;
    });

  const allTokens: TokenItem[] = (allData?.tokens ?? []).map(mapToken);
  const doneList    = allTokens.filter(t => t.displayStatus === 'done').sort((a, b) => b.tokenNumber - a.tokenNumber);
  const skippedList = allTokens.filter(t => t.displayStatus === 'skipped').sort((a, b) => b.tokenNumber - a.tokenNumber);

  const emergencyCount = waiting.filter(t => t.type === 'emergency').length;
  const totalDone      = doneList.length + skippedList.length;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.container}>
        <View style={styles.glowTeal} />

        {/* Header */}
        <View style={styles.header}>
          <View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <View style={[styles.liveDot, !!current && styles.liveDotActive]} />
              <Text style={styles.headerTitle}>Queue</Text>
              {isRefetching && <ActivityIndicator size="small" color={TEAL} style={{ marginLeft: 4 }} />}
            </View>
            <Text style={styles.headerDate}>{todayLabel()}</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Text style={styles.headerDoc} numberOfLines={1}>{doctor?.name ?? 'Doctor'}</Text>
            <TouchableOpacity
              style={[styles.shiftBtn, shift === 'morning' ? styles.shiftBtnMorning : styles.shiftBtnEvening]}
              onPress={() => setShift(s => s === 'morning' ? 'evening' : 'morning')}
            >
              <Text style={{ fontSize: 11, fontWeight: '800', color: shift === 'morning' ? '#FCD34D' : '#C4B5FD' }}>
                {shift === 'morning' ? '☀️ Morning' : '🌙 Evening'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Stats bar */}
        <View style={styles.statsRow}>
          {[
            { label: 'Waiting',   val: waiting.length,  color: '#A5B4FC' },
            { label: 'Serving',   val: current ? 1 : 0, color: TEAL_LT  },
            { label: 'Emergency', val: emergencyCount,   color: '#F87171' },
            { label: 'Done',      val: doneList.length,  color: '#4ADE80' },
          ].map((s, i) => (
            <View key={s.label} style={[styles.statPill, i < 3 && styles.statPillBorder]}>
              <Text style={[styles.statVal, { color: s.color }]}>{s.val}</Text>
              <Text style={styles.statLbl}>{s.label}</Text>
            </View>
          ))}
        </View>

        {isLoading ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <ActivityIndicator color={TEAL} size="large" />
            <Text style={{ color: 'rgba(255,255,255,0.35)', marginTop: 12, fontSize: 13 }}>Loading queue…</Text>
          </View>
        ) : (
          <ScrollView
            showsVerticalScrollIndicator={false}
            refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={TEAL} />}
            contentContainerStyle={{ paddingBottom: 100 }}
          >
            {/* Currently consulting */}
            {current ? (
              <ConsultingCard
                token={current}
                onDone={() => handleDone(current.id)}
                busy={busyId === current.id}
              />
            ) : (
              <TouchableOpacity
                style={[styles.callNextBtn, (!waiting.length || !!busyId) && { opacity: 0.45 }]}
                onPress={() => waiting.length && handleCall(waiting[0].id)}
                disabled={!waiting.length || !!busyId}
              >
                {busyId ? (
                  <ActivityIndicator color={TEAL_LT} />
                ) : waiting.length > 0 ? (
                  <View style={{ alignItems: 'center', gap: 4 }}>
                    <Text style={styles.callNextText}>
                      📢 Call Token #{waiting[0].tokenNumber}
                    </Text>
                    <Text style={styles.callNextSub}>{waiting[0].patientName} · {getTypeCfg(waiting[0]).label}</Text>
                  </View>
                ) : (
                  <Text style={[styles.callNextText, { color: 'rgba(255,255,255,0.3)' }]}>No patients waiting</Text>
                )}
              </TouchableOpacity>
            )}

            {/* Tab bar */}
            <View style={styles.tabRow}>
              {([
                { key: 'queue', label: `Queue  ${waiting.length > 0 ? `(${waiting.length})` : ''}` },
                { key: 'done',  label: `Done${totalDone > 0 ? ` (${totalDone})` : ''}` },
              ] as const).map(t => (
                <TouchableOpacity
                  key={t.key}
                  style={[styles.tab, tab === t.key && styles.tabActive]}
                  onPress={() => setTab(t.key)}
                >
                  <Text style={[styles.tabTxt, tab === t.key && styles.tabTxtActive]}>{t.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Queue tab */}
            {tab === 'queue' && (
              <View style={styles.listWrap}>
                {waiting.length === 0 ? (
                  <View style={styles.emptyBox}>
                    <Text style={styles.emptyIcon}>{current ? '⏳' : '🎉'}</Text>
                    <Text style={styles.emptyTxt}>
                      {current ? 'Patient in consultation — no one waiting' : 'Queue is empty · All done!'}
                    </Text>
                  </View>
                ) : (
                  waiting.map((token, i) => (
                    <WaitingCard
                      key={token.id}
                      token={token}
                      rank={i + 1}
                      busy={busyId === token.id}
                      onCall={() => handleCall(token.id)}
                      onSkip={() => handleSkip(token.id)}
                    />
                  ))
                )}
              </View>
            )}

            {/* Done tab */}
            {tab === 'done' && (
              <View style={styles.listWrap}>
                {totalDone === 0 ? (
                  <View style={styles.emptyBox}>
                    <Text style={styles.emptyIcon}>📋</Text>
                    <Text style={styles.emptyTxt}>No completed tokens yet</Text>
                  </View>
                ) : (
                  <>
                    {doneList.length > 0 && (
                      <>
                        <Text style={styles.sectionLabel}>✓ Consulted ({doneList.length})</Text>
                        {doneList.map(t => <DoneCard key={t.id} token={t} />)}
                      </>
                    )}
                    {skippedList.length > 0 && (
                      <>
                        <Text style={[styles.sectionLabel, { marginTop: 14 }]}>↷ Skipped ({skippedList.length})</Text>
                        {skippedList.map(t => <DoneCard key={t.id} token={t} />)}
                      </>
                    )}
                  </>
                )}
              </View>
            )}
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe:      { flex: 1, backgroundColor: BG, ...(isWeb && { paddingTop: 44 }) },
  container: { flex: 1, backgroundColor: BG },
  glowTeal:  { position: 'absolute', top: -80, left: -80, width: 260, height: 260, borderRadius: 130, backgroundColor: 'rgba(45,212,191,0.10)' },

  header:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 18, paddingTop: 10, paddingBottom: 8 },
  headerTitle: { fontSize: 20, fontWeight: '900', color: '#FFF', letterSpacing: -0.5 },
  headerDate:  { fontSize: 11, color: 'rgba(255,255,255,0.3)', fontWeight: '600', marginTop: 1 },
  headerDoc:   { fontSize: 12, color: 'rgba(255,255,255,0.45)', fontWeight: '700', maxWidth: 120 },
  liveDot:     { width: 8, height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.2)' },
  liveDotActive: { backgroundColor: TEAL },
  shiftBtn:    { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10, borderWidth: 1 },
  shiftBtnMorning: { backgroundColor: 'rgba(252,211,77,0.1)', borderColor: 'rgba(252,211,77,0.3)' },
  shiftBtnEvening: { backgroundColor: 'rgba(196,181,253,0.1)', borderColor: 'rgba(196,181,253,0.3)' },

  statsRow:      { flexDirection: 'row', marginHorizontal: 16, marginBottom: 12, borderRadius: 16, overflow: 'hidden', backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)' },
  statPill:      { flex: 1, alignItems: 'center', paddingVertical: 10 },
  statPillBorder: { borderRightWidth: 1, borderRightColor: 'rgba(255,255,255,0.06)' },
  statVal:       { fontSize: 20, fontWeight: '900', letterSpacing: -0.5 },
  statLbl:       { fontSize: 9, fontWeight: '700', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: 0.4, marginTop: 2 },

  consultingCard: { marginHorizontal: 16, marginBottom: 12, borderRadius: 20, backgroundColor: 'rgba(13,148,136,0.15)', borderWidth: 1.5, borderColor: 'rgba(45,212,191,0.45)', padding: 16, overflow: 'hidden' },
  glowBlob:       { position: 'absolute', top: -30, right: -30, width: 120, height: 120, borderRadius: 60, backgroundColor: 'rgba(45,212,191,0.15)' },
  consultingTop:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  liveBadge:      { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(45,212,191,0.18)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 },
  liveDot2:       { width: 7, height: 7, borderRadius: 3.5, backgroundColor: TEAL },
  liveBadgeText:  { fontSize: 10, fontWeight: '800', color: TEAL_LT, letterSpacing: 0.5 },
  elapsedText:    { fontSize: 11, fontWeight: '700', color: 'rgba(255,255,255,0.35)' },
  consultingHero: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 14 },
  bigTokenBox:    { width: 64, height: 64, borderRadius: 18, backgroundColor: 'rgba(45,212,191,0.22)', borderWidth: 2, borderColor: 'rgba(45,212,191,0.5)', alignItems: 'center', justifyContent: 'center' },
  bigTokenLabel:  { fontSize: 8, fontWeight: '700', color: TEAL_LT, letterSpacing: 0.5 },
  bigTokenText:   { fontSize: 22, fontWeight: '900', color: '#FFF', lineHeight: 26 },
  consultingName: { fontSize: 18, fontWeight: '800', color: '#FFF' },
  consultingPhone:{ fontSize: 12, color: 'rgba(255,255,255,0.35)', marginTop: 4 },
  typeBadge2:     { alignSelf: 'flex-start', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  doneBtn:        { height: 46, borderRadius: 14, backgroundColor: TEAL, alignItems: 'center', justifyContent: 'center' },
  doneBtnText:    { fontSize: 14, fontWeight: '800', color: BG },

  callNextBtn:    { marginHorizontal: 16, marginBottom: 12, paddingVertical: 16, borderRadius: 16, backgroundColor: 'rgba(45,212,191,0.1)', borderWidth: 1.5, borderColor: 'rgba(45,212,191,0.35)', alignItems: 'center', justifyContent: 'center' },
  callNextText:   { fontSize: 15, fontWeight: '800', color: TEAL_LT },
  callNextSub:    { fontSize: 11, color: 'rgba(255,255,255,0.4)', fontWeight: '600' },

  tabRow:       { flexDirection: 'row', marginHorizontal: 16, marginBottom: 12, backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 14, padding: 3, borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)' },
  tab:          { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 11 },
  tabActive:    { backgroundColor: 'rgba(45,212,191,0.18)', borderWidth: 1, borderColor: 'rgba(45,212,191,0.3)' },
  tabTxt:       { fontSize: 12, fontWeight: '700', color: 'rgba(255,255,255,0.35)' },
  tabTxtActive: { color: TEAL_LT },

  listWrap:   { paddingHorizontal: 16, gap: 10 },
  emptyBox:   { alignItems: 'center', paddingVertical: 48 },
  emptyIcon:  { fontSize: 40, marginBottom: 12 },
  emptyTxt:   { fontSize: 13, color: 'rgba(255,255,255,0.3)', fontWeight: '600', textAlign: 'center' },
  sectionLabel: { fontSize: 11, fontWeight: '700', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 },

  qCard:          { borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', padding: 14 },
  qCardEmergency: { backgroundColor: 'rgba(248,113,113,0.07)', borderColor: 'rgba(248,113,113,0.35)', borderWidth: 1.5 },
  qCardTop:       { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 12 },
  tokenBox:       { width: 50, height: 50, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.08)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)' },
  tokenBoxEmergency: { backgroundColor: 'rgba(248,113,113,0.18)', borderColor: 'rgba(248,113,113,0.4)' },
  tokenText:      { fontSize: 15, fontWeight: '900', color: '#FFF' },
  rankText:       { fontSize: 9, fontWeight: '700', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase' },
  patName:        { fontSize: 14, fontWeight: '800', color: '#FFF' },
  typeBadge:      { borderRadius: 8, paddingHorizontal: 7, paddingVertical: 2 },
  statusBadge:    { borderRadius: 8, paddingHorizontal: 7, paddingVertical: 2, borderWidth: 1 },
  priorityBadge:  { borderRadius: 8, paddingHorizontal: 7, paddingVertical: 2, backgroundColor: 'rgba(248,113,113,0.15)', borderWidth: 1, borderColor: 'rgba(248,113,113,0.3)' },
  priorityBadgeText: { fontSize: 9, fontWeight: '800', color: '#F87171', letterSpacing: 0.5 },
  phoneText:      { fontSize: 10, color: 'rgba(255,255,255,0.3)', marginTop: 3 },
  qCardBtns:      { flexDirection: 'row', gap: 8 },
  btnCall:        { flex: 1, height: 38, borderRadius: 11, backgroundColor: 'rgba(45,212,191,0.15)', borderWidth: 1, borderColor: 'rgba(45,212,191,0.35)', alignItems: 'center', justifyContent: 'center' },
  btnCallPrimary: { backgroundColor: TEAL, borderColor: TEAL },
  btnCallTxt:     { fontSize: 12, fontWeight: '800', color: TEAL_LT },
  btnSkip:        { height: 38, paddingHorizontal: 16, borderRadius: 11, backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' },
  btnSkipTxt:     { fontSize: 12, fontWeight: '700', color: 'rgba(255,255,255,0.4)' },
  btnDone:        { flex: 1, height: 38, borderRadius: 11, backgroundColor: 'rgba(34,197,94,0.18)', borderWidth: 1, borderColor: 'rgba(34,197,94,0.4)', alignItems: 'center', justifyContent: 'center' },
  btnDoneTxt:     { fontSize: 12, fontWeight: '800', color: '#4ADE80' },
});
