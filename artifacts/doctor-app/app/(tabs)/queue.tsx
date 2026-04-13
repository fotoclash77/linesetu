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

const todayLabel = () =>
  new Date().toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });

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
type TabKey = 'queue' | 'emergency' | 'notshown' | 'done';

interface TokenItem {
  id: string;
  tokenNumber: number;
  patientName: string;
  patientPhone: string;
  type: 'normal' | 'emergency';
  source: string;
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
  if (token.type === 'emergency')  return { color: '#F87171', bg: 'rgba(239,68,68,0.15)',   icon: '🚨', label: 'Emergency' };
  if (token.source === 'walkin')   return { color: '#67E8F9', bg: 'rgba(6,182,212,0.15)',   icon: '🚶', label: 'Walk-in'   };
  return                                  { color: '#4ADE80', bg: 'rgba(34,197,94,0.15)',   icon: '📱', label: 'Online'    };
}

// ─── Live elapsed timer ────────────────────────────────────────
function useElapsed(calledAt: any) {
  const [elapsed, setElapsed] = useState('');
  useEffect(() => {
    const start = calledAt?.seconds ? calledAt.seconds * 1000 : null;
    if (!start) { setElapsed(''); return; }
    const update = () => {
      const mins = Math.floor((Date.now() - start) / 60000);
      setElapsed(mins < 1 ? '< 1 min' : `${mins} min`);
    };
    update();
    const id = setInterval(update, 30_000);
    return () => clearInterval(id);
  }, [calledAt]);
  return elapsed;
}

// ─── Pulsing live dot ──────────────────────────────────────────
function PulsingDot({ color }: { color: string }) {
  const pulse = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    const anim = Animated.loop(Animated.sequence([
      Animated.timing(pulse, { toValue: 1.5, duration: 700, useNativeDriver: true }),
      Animated.timing(pulse, { toValue: 1,   duration: 700, useNativeDriver: true }),
    ]));
    anim.start();
    return () => anim.stop();
  }, []);
  return <Animated.View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: color, transform: [{ scale: pulse }] }} />;
}

// ─── Currently Consulting card (matches mockup large card) ─────
function ConsultingCard({ token, onNotShown, onDone, busy }: {
  token: TokenItem; onNotShown: () => void; onDone: () => void; busy: boolean;
}) {
  const tc = getTypeCfg(token);
  const elapsed = useElapsed(token.calledAt);

  return (
    <View style={styles.consultingCard}>
      {/* Glow blobs */}
      <View style={styles.cGlowTopRight} />
      <View style={styles.cGlowBottomLeft} />

      {/* Top row: badges */}
      <View style={styles.cTopRow}>
        <View style={styles.cLiveBadge}>
          <PulsingDot color="#4ADE80" />
          <Text style={styles.cLiveBadgeText}>Currently Consulting</Text>
        </View>
        {!!elapsed && (
          <View style={styles.cTimerBadge}>
            <Text style={styles.cTimerIcon}>⏱</Text>
            <Text style={styles.cTimerText}>{elapsed}</Text>
          </View>
        )}
      </View>

      {/* Hero row: token + name */}
      <View style={styles.cHero}>
        <View style={styles.cTokenBlock}>
          <Text style={styles.cTokenLabel}>TOKEN</Text>
          <Text style={styles.cTokenNum}>#{token.tokenNumber}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.cPatName} numberOfLines={1}>{token.patientName}</Text>
          <View style={styles.cBadgeRow}>
            <View style={[styles.cTypeBadge, { backgroundColor: tc.bg }]}>
              <Text style={{ fontSize: 9, fontWeight: '800', color: tc.color }}>{tc.icon} {tc.label}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Patient detail grid (phone) */}
      {!!token.patientPhone && (
        <View style={styles.cDetailGrid}>
          <View style={styles.cDetailCard}>
            <View style={styles.cDetailIcon}>
              <Text style={{ fontSize: 12, color: TEAL_LT }}>📞</Text>
            </View>
            <View>
              <Text style={styles.cDetailLabel}>PHONE</Text>
              <Text style={styles.cDetailValue}>{token.patientPhone}</Text>
            </View>
          </View>
          <View style={styles.cDetailCard}>
            <View style={[styles.cDetailIcon, { backgroundColor: 'rgba(99,102,241,0.15)' }]}>
              <Text style={{ fontSize: 12, color: '#A5B4FC' }}>{token.source === 'walkin' ? '🚶' : '📱'}</Text>
            </View>
            <View>
              <Text style={styles.cDetailLabel}>SOURCE</Text>
              <Text style={[styles.cDetailValue, { color: tc.color }]}>{tc.label}</Text>
            </View>
          </View>
        </View>
      )}

      {/* Action buttons */}
      <View style={styles.cActionRow}>
        <TouchableOpacity
          style={[styles.cNotShownBtn, busy && { opacity: 0.5 }]}
          onPress={onNotShown}
          disabled={busy}
        >
          {busy
            ? <ActivityIndicator color="#FCD34D" size="small" />
            : <Text style={styles.cNotShownText}>✕ Not Shown</Text>}
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.cDoneBtn, busy && { opacity: 0.5 }]}
          onPress={onDone}
          disabled={busy}
        >
          {busy
            ? <ActivityIndicator color="#FFF" size="small" />
            : <Text style={styles.cDoneText}>✓ Done</Text>}
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── Next patient card (amber, matches mockup) ─────────────────
function NextCard({ token, onCall, busy }: { token: TokenItem; onCall: () => void; busy: boolean }) {
  const tc = getTypeCfg(token);
  const isEmerg = token.type === 'emergency';
  const borderColor = isEmerg ? 'rgba(239,68,68,0.38)' : 'rgba(245,158,11,0.38)';
  const bgGrad = isEmerg ? 'rgba(239,68,68,0.15)' : 'rgba(245,158,11,0.13)';
  const labelColor = isEmerg ? '#F87171' : '#FCD34D';

  return (
    <View style={[styles.nextCard, { backgroundColor: bgGrad, borderColor }]}>
      <View style={styles.nextCardInner}>
        {/* Token */}
        <View style={[styles.nextTokenBlock, { backgroundColor: isEmerg ? 'rgba(239,68,68,0.25)' : 'rgba(245,158,11,0.22)', borderColor: isEmerg ? 'rgba(239,68,68,0.5)' : 'rgba(245,158,11,0.5)' }]}>
          <Text style={[styles.nextTokenLabel, { color: labelColor }]}>Next</Text>
          <Text style={styles.nextTokenNum}>#{token.tokenNumber}</Text>
        </View>
        {/* Info */}
        <View style={{ flex: 1 }}>
          <Text style={styles.nextPatName} numberOfLines={1}>{token.patientName}</Text>
          <View style={styles.nextBadgeRow}>
            <View style={[styles.cTypeBadge, { backgroundColor: tc.bg }]}>
              <Text style={{ fontSize: 9, fontWeight: '800', color: tc.color }}>{tc.icon} {tc.label}</Text>
            </View>
          </View>
          {!!token.patientPhone && (
            <Text style={styles.nextPhone}>📞 {token.patientPhone}</Text>
          )}
        </View>
        {/* Call in button */}
        <TouchableOpacity
          style={[styles.callNextBtn2, { borderColor, backgroundColor: isEmerg ? 'rgba(239,68,68,0.2)' : 'rgba(245,158,11,0.18)' }, busy && { opacity: 0.5 }]}
          onPress={onCall}
          disabled={busy}
        >
          {busy
            ? <ActivityIndicator color={labelColor} size="small" />
            : <Text style={[styles.callNextBtn2Text, { color: labelColor }]}>Call In ›</Text>}
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── Queue row card (matches mockup QueueCard) ─────────────────
function QueueCard({ token, onSendAlert, onNotShown, busy, rank }: {
  token: TokenItem; onSendAlert: () => void; onNotShown: () => void; busy: boolean; rank: number;
}) {
  const tc = getTypeCfg(token);
  const isEmerg = token.type === 'emergency';

  return (
    <View style={[styles.qCard, isEmerg && styles.qCardEmergency]}>
      {/* Top row */}
      <View style={styles.qCardTop}>
        <View style={[styles.qTokenBlock, isEmerg && styles.qTokenBlockEmergency]}>
          <Text style={styles.qTokenNum}>#{token.tokenNumber}</Text>
        </View>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={styles.qPatName} numberOfLines={1}>{token.patientName}</Text>
          <View style={styles.qBadgeRow}>
            <View style={[styles.cTypeBadge, { backgroundColor: tc.bg }]}>
              <Text style={{ fontSize: 9, fontWeight: '800', color: tc.color }}>{tc.icon} {tc.label}</Text>
            </View>
            {isEmerg && (
              <View style={styles.qEmergBadge}>
                <Text style={styles.qEmergBadgeText}>⚡ PRIORITY</Text>
              </View>
            )}
          </View>
          {!!token.patientPhone && (
            <Text style={styles.qPhone}>📞 {token.patientPhone}</Text>
          )}
        </View>
        {/* Rank / status badge top right */}
        <View style={[styles.qStatusBadge, { backgroundColor: rank === 1 ? 'rgba(245,158,11,0.18)' : 'rgba(99,102,241,0.12)', borderColor: rank === 1 ? 'rgba(245,158,11,0.4)' : 'rgba(99,102,241,0.25)' }]}>
          <Text style={[styles.qStatusBadgeText, { color: rank === 1 ? '#FCD34D' : '#A5B4FC' }]}>
            {rank === 1 ? 'Next' : `#${rank}`}
          </Text>
        </View>
      </View>

      {/* Action buttons */}
      <View style={styles.qCardBtns}>
        <TouchableOpacity
          style={[styles.qSendAlertBtn, busy && { opacity: 0.5 }]}
          onPress={onSendAlert}
          disabled={busy}
        >
          {busy
            ? <ActivityIndicator color="#A5B4FC" size="small" />
            : <Text style={styles.qSendAlertText}>📣 Send Alert</Text>}
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.qNotShownBtn, busy && { opacity: 0.5 }]}
          onPress={onNotShown}
          disabled={busy}
        >
          <Text style={styles.qNotShownText}>✕ Not Shown</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── Done/Skipped card ─────────────────────────────────────────
function PastCard({ token }: { token: TokenItem }) {
  const tc = getTypeCfg(token);
  const isDone = token.displayStatus === 'done';
  return (
    <View style={[styles.qCard, { opacity: 0.58 }]}>
      <View style={styles.qCardTop}>
        <View style={[styles.qTokenBlock, { backgroundColor: isDone ? 'rgba(34,197,94,0.12)' : 'rgba(245,158,11,0.1)', borderColor: isDone ? 'rgba(34,197,94,0.25)' : 'rgba(245,158,11,0.25)' }]}>
          <Text style={styles.qTokenNum}>#{token.tokenNumber}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.qPatName, { color: 'rgba(255,255,255,0.45)' }]} numberOfLines={1}>{token.patientName}</Text>
          <View style={styles.qBadgeRow}>
            <View style={[styles.cTypeBadge, { backgroundColor: tc.bg }]}>
              <Text style={{ fontSize: 9, fontWeight: '800', color: tc.color }}>{tc.icon} {tc.label}</Text>
            </View>
            <View style={[styles.qStatusBadge, { backgroundColor: isDone ? 'rgba(34,197,94,0.1)' : 'rgba(245,158,11,0.1)', borderColor: isDone ? 'rgba(34,197,94,0.3)' : 'rgba(245,158,11,0.3)' }]}>
              <Text style={[styles.qStatusBadgeText, { color: isDone ? '#4ADE80' : '#FCD34D' }]}>
                {isDone ? '✓ Consulted' : '↷ Not Shown'}
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
  const [tab, setTab]     = useState<TabKey>('queue');
  const [shift, setShift] = useState<'morning' | 'evening'>('morning');
  const [paused, setPaused] = useState(false);
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
      await new Promise(r => setTimeout(r, 600));
      const refreshed = await fetchQueue(doctorId, shift);
      const nextWaiting = (refreshed.tokens ?? [])
        .filter((t: any) => t.status === 'waiting')
        .sort((a: any, b: any) => {
          if (a.type === 'emergency' && b.type !== 'emergency') return -1;
          if (b.type === 'emergency' && a.type !== 'emergency') return 1;
          return (a.tokenNumber ?? 0) - (b.tokenNumber ?? 0);
        })[0];
      if (nextWaiting) { await callToken(nextWaiting.id); invalidate(); }
    } catch {}
    setBusyId(null);
  };

  const handleNotShown = async (tokenId: string) => {
    setBusyId(tokenId);
    try { await cancelToken(tokenId); invalidate(); } catch {}
    setBusyId(null);
  };

  // ── Process tokens ──
  const liveTokens: TokenItem[] = (queueData?.tokens ?? []).map(mapToken);
  const current = liveTokens.find(t => t.displayStatus === 'consulting');
  const waitingAll = liveTokens.filter(t => t.displayStatus === 'waiting')
    .sort((a, b) => {
      if (a.type === 'emergency' && b.type !== 'emergency') return -1;
      if (b.type === 'emergency' && a.type !== 'emergency') return 1;
      return a.tokenNumber - b.tokenNumber;
    });
  const nextToken  = waitingAll[0];
  const queueWait  = waitingAll.slice(1); // excluding "next" card

  const allTokens: TokenItem[] = (allData?.tokens ?? []).map(mapToken);
  const doneList    = allTokens.filter(t => t.displayStatus === 'done').sort((a, b) => b.tokenNumber - a.tokenNumber);
  const skippedList = allTokens.filter(t => t.displayStatus === 'skipped').sort((a, b) => b.tokenNumber - a.tokenNumber);
  const emergList   = waitingAll.filter(t => t.type === 'emergency');

  const totalTokens = allTokens.length;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.container}>
        {/* Glow orbs matching mockup */}
        <View style={styles.glowTL} />
        <View style={styles.glowBR} />

        {/* ── Header ── */}
        <View style={styles.header}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <PulsingDot color="#4ADE80" />
            <Text style={styles.headerTitle}>Master Queue</Text>
            {isRefetching && <ActivityIndicator size="small" color="rgba(255,255,255,0.3)" style={{ marginLeft: 2 }} />}
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Text style={{ fontSize: 13, color: TEAL_LT }}>⚕</Text>
            <Text style={styles.headerDoc} numberOfLines={1}>{doctor?.name ?? 'Dr. Sharma'}</Text>
            <TouchableOpacity
              style={[styles.shiftBtn, shift === 'morning' ? styles.shiftBtnMorning : styles.shiftBtnEvening]}
              onPress={() => setShift(s => s === 'morning' ? 'evening' : 'morning')}
            >
              <Text style={{ fontSize: 10, fontWeight: '800', color: shift === 'morning' ? '#FCD34D' : '#C4B5FD' }}>
                {shift === 'morning' ? '☀ Morning' : '☾ Evening'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {isLoading ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <ActivityIndicator color={TEAL} size="large" />
            <Text style={{ color: 'rgba(255,255,255,0.3)', marginTop: 12, fontSize: 13 }}>Loading queue…</Text>
          </View>
        ) : (
          <ScrollView
            showsVerticalScrollIndicator={false}
            refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={TEAL} />}
            contentContainerStyle={{ paddingBottom: 100 }}
          >
            <View style={{ paddingHorizontal: 16 }}>

              {/* ── Currently Consulting (large card) ── */}
              {current ? (
                <ConsultingCard
                  token={current}
                  onNotShown={() => handleNotShown(current.id)}
                  onDone={() => handleDone(current.id)}
                  busy={busyId === current.id}
                />
              ) : (
                <View style={styles.emptyConsultingCard}>
                  <View style={styles.cLiveBadge}>
                    <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.2)' }} />
                    <Text style={[styles.cLiveBadgeText, { color: 'rgba(255,255,255,0.3)' }]}>No patient in consultation</Text>
                  </View>
                  <Text style={styles.emptyConsultingText}>
                    {waitingAll.length > 0 ? 'Tap "Call In ›" on the next patient below to start' : 'Queue is empty for this shift'}
                  </Text>
                </View>
              )}

              {/* ── Next Patient card ── */}
              {!current && nextToken && (
                <NextCard
                  token={nextToken}
                  onCall={() => handleCall(nextToken.id)}
                  busy={busyId === nextToken.id}
                />
              )}

              {/* ── Stats row ── */}
              <View style={styles.statsRow}>
                {[
                  { label: 'Total',   val: totalTokens,       color: '#A5B4FC' },
                  { label: 'Waiting', val: waitingAll.length,  color: '#FCD34D' },
                  { label: 'Done',    val: doneList.length,    color: '#4ADE80' },
                  { label: 'Skipped', val: skippedList.length, color: '#F87171' },
                ].map((s, i) => (
                  <View key={s.label} style={[styles.statPill, i < 3 && styles.statPillBorder]}>
                    <Text style={[styles.statVal, { color: s.color }]}>{s.val}</Text>
                    <Text style={styles.statLbl}>{s.label}</Text>
                  </View>
                ))}
              </View>

              {/* ── Pause / Resume Queue button ── */}
              <TouchableOpacity
                style={[styles.pauseBtn, paused && styles.pauseBtnResumed]}
                onPress={() => setPaused(p => !p)}
              >
                <Text style={[styles.pauseBtnText, paused && { color: '#4ADE80' }]}>
                  {paused ? '▶  Resume Queue' : '⏸  Pause Queue'}
                </Text>
              </TouchableOpacity>

              {/* ── 4-Tab toggle ── */}
              <View style={styles.tabRow}>
                {([
                  { key: 'queue',    icon: '👥', label: 'Queue',   count: waitingAll.length, activeColor: TEAL_LT,  activeBg: 'rgba(13,148,136,0.28)'  },
                  { key: 'emergency',icon: '⚡', label: 'Emerg',   count: emergList.length,  activeColor: '#F87171', activeBg: 'rgba(239,68,68,0.2)',   dot: emergList.length > 0 },
                  { key: 'notshown', icon: '✕',  label: 'Skipped', count: skippedList.length,activeColor: '#FCD34D', activeBg: 'rgba(245,158,11,0.2)'  },
                  { key: 'done',     icon: '✓',  label: 'Done',    count: doneList.length,   activeColor: '#4ADE80', activeBg: 'rgba(34,197,94,0.18)' },
                ] as const).map(t => {
                  const active = tab === t.key;
                  return (
                    <TouchableOpacity key={t.key} style={[styles.tab, active && { backgroundColor: t.activeBg }]} onPress={() => setTab(t.key)}>
                      {t.dot && !active && <View style={styles.tabDot} />}
                      <Text style={{ fontSize: 10, color: active ? t.activeColor : 'rgba(255,255,255,0.35)' }}>{t.icon}</Text>
                      <Text style={[styles.tabTxt, active && { color: '#FFF', fontWeight: '800' }]}>
                        {t.label}{t.count > 0 ? ` (${t.count})` : ''}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* ── Queue tab ── */}
              {tab === 'queue' && (
                <View style={styles.listWrap}>
                  {waitingAll.length === 0 ? (
                    <View style={styles.emptyBox}>
                      <Text style={styles.emptyIcon}>{current ? '⏳' : '🎉'}</Text>
                      <Text style={styles.emptyTxt}>
                        {current ? 'No patients waiting — one in consultation' : 'No patients in queue'}
                      </Text>
                    </View>
                  ) : (
                    waitingAll.map((token, i) => (
                      <QueueCard
                        key={token.id}
                        token={token}
                        rank={i + 1}
                        busy={busyId === token.id}
                        onSendAlert={() => handleCall(token.id)}
                        onNotShown={() => handleNotShown(token.id)}
                      />
                    ))
                  )}
                </View>
              )}

              {/* ── Emergency tab ── */}
              {tab === 'emergency' && (
                <View style={styles.listWrap}>
                  {emergList.length > 0 && (
                    <View style={styles.emergHeader}>
                      <Text style={styles.emergHeaderText}>⚡ Priority — Immediate Attention</Text>
                    </View>
                  )}
                  {emergList.length === 0 ? (
                    <View style={styles.emptyBox}>
                      <Text style={styles.emptyIcon}>✅</Text>
                      <Text style={styles.emptyTxt}>No emergency patients</Text>
                    </View>
                  ) : (
                    emergList.map((token, i) => (
                      <QueueCard
                        key={token.id}
                        token={token}
                        rank={i + 1}
                        busy={busyId === token.id}
                        onSendAlert={() => handleCall(token.id)}
                        onNotShown={() => handleNotShown(token.id)}
                      />
                    ))
                  )}
                </View>
              )}

              {/* ── Not Shown tab ── */}
              {tab === 'notshown' && (
                <View style={styles.listWrap}>
                  {skippedList.length === 0 ? (
                    <View style={styles.emptyBox}>
                      <Text style={styles.emptyIcon}>👍</Text>
                      <Text style={styles.emptyTxt}>No skipped patients</Text>
                    </View>
                  ) : (
                    skippedList.map(t => <PastCard key={t.id} token={t} />)
                  )}
                </View>
              )}

              {/* ── Done tab ── */}
              {tab === 'done' && (
                <View style={styles.listWrap}>
                  {doneList.length === 0 ? (
                    <View style={styles.emptyBox}>
                      <Text style={styles.emptyIcon}>📋</Text>
                      <Text style={styles.emptyTxt}>No completed consultations yet</Text>
                    </View>
                  ) : (
                    doneList.map(t => <PastCard key={t.id} token={t} />)
                  )}
                </View>
              )}

            </View>
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
  glowTL:    { position: 'absolute', top: -60, left: -60, width: 240, height: 240, borderRadius: 120, backgroundColor: 'rgba(13,148,136,0.18)' },
  glowBR:    { position: 'absolute', top: 320, right: -80, width: 200, height: 200, borderRadius: 100, backgroundColor: 'rgba(239,68,68,0.08)' },

  header:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 18, paddingTop: 10, paddingBottom: 10 },
  headerTitle: { fontSize: 14, fontWeight: '800', color: '#FFF', letterSpacing: -0.2 },
  headerDoc:   { fontSize: 12, fontWeight: '700', color: TEAL_LT, maxWidth: 110 },
  shiftBtn:    { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, borderWidth: 1 },
  shiftBtnMorning: { backgroundColor: 'rgba(252,211,77,0.1)', borderColor: 'rgba(252,211,77,0.3)' },
  shiftBtnEvening: { backgroundColor: 'rgba(196,181,253,0.1)', borderColor: 'rgba(196,181,253,0.3)' },

  // ── Consulting Card ──
  consultingCard:  {
    borderRadius: 22, padding: 16, marginBottom: 10, overflow: 'hidden',
    backgroundColor: 'rgba(13,148,136,0.2)',
    borderWidth: 1.5, borderColor: 'rgba(45,212,191,0.38)',
    shadowColor: '#0D9488', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.25, shadowRadius: 20,
  },
  cGlowTopRight:   { position: 'absolute', top: -30, right: -30, width: 140, height: 140, borderRadius: 70, backgroundColor: 'rgba(45,212,191,0.18)' },
  cGlowBottomLeft: { position: 'absolute', bottom: -20, left: -20, width: 100, height: 100, borderRadius: 50, backgroundColor: 'rgba(6,182,212,0.12)' },
  cTopRow:         { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  cLiveBadge:      { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, backgroundColor: 'rgba(74,222,128,0.12)', borderWidth: 1, borderColor: 'rgba(74,222,128,0.3)' },
  cLiveBadgeText:  { fontSize: 9, fontWeight: '800', color: '#4ADE80', textTransform: 'uppercase', letterSpacing: 0.8 },
  cTimerBadge:     { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 9, paddingVertical: 4, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.07)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  cTimerIcon:      { fontSize: 10 },
  cTimerText:      { fontSize: 9, fontWeight: '700', color: 'rgba(255,255,255,0.45)' },
  cHero:           { flexDirection: 'row', alignItems: 'flex-start', gap: 14, marginBottom: 14 },
  cTokenBlock:     { width: 64, height: 64, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: TEAL, shadowColor: TEAL, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.55, shadowRadius: 16 },
  cTokenLabel:     { fontSize: 8, fontWeight: '700', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: 0.6 },
  cTokenNum:       { fontSize: 26, fontWeight: '900', color: '#FFF', letterSpacing: -1.5, lineHeight: 30 },
  cPatName:        { fontSize: 20, fontWeight: '900', color: '#FFF', letterSpacing: -0.5, lineHeight: 24, marginBottom: 6 },
  cBadgeRow:       { flexDirection: 'row', gap: 5, flexWrap: 'wrap' },
  cTypeBadge:      { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 7, paddingVertical: 3, borderRadius: 20 },
  cDetailGrid:     { flexDirection: 'row', gap: 8, marginBottom: 14 },
  cDetailCard:     { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8, padding: 10, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  cDetailIcon:     { width: 28, height: 28, borderRadius: 9, backgroundColor: 'rgba(45,212,191,0.15)', alignItems: 'center', justifyContent: 'center' },
  cDetailLabel:    { fontSize: 8, fontWeight: '700', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: 0.5 },
  cDetailValue:    { fontSize: 10, fontWeight: '700', color: 'rgba(255,255,255,0.85)' },
  cActionRow:      { flexDirection: 'row', gap: 8 },
  cNotShownBtn:    { flex: 1, height: 42, borderRadius: 13, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(245,158,11,0.18)', borderWidth: 1.5, borderColor: 'rgba(245,158,11,0.45)' },
  cNotShownText:   { fontSize: 12, fontWeight: '800', color: '#FCD34D' },
  cDoneBtn:        { flex: 1, height: 42, borderRadius: 13, alignItems: 'center', justifyContent: 'center', backgroundColor: '#16A34A', shadowColor: '#22C55E', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 12 },
  cDoneText:       { fontSize: 12, fontWeight: '800', color: '#FFF' },

  emptyConsultingCard: { borderRadius: 22, padding: 16, marginBottom: 10, backgroundColor: 'rgba(255,255,255,0.03)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)', alignItems: 'center', paddingVertical: 22 },
  emptyConsultingText: { fontSize: 11, color: 'rgba(255,255,255,0.25)', fontWeight: '600', marginTop: 8, textAlign: 'center' },

  // ── Next Card ──
  nextCard:        { borderRadius: 16, padding: 12, marginBottom: 10, borderWidth: 1.5, overflow: 'hidden', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.18, shadowRadius: 14 },
  nextCardInner:   { flexDirection: 'row', alignItems: 'center', gap: 12 },
  nextTokenBlock:  { width: 48, height: 48, borderRadius: 13, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5 },
  nextTokenLabel:  { fontSize: 8, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.4, lineHeight: 1 },
  nextTokenNum:    { fontSize: 16, fontWeight: '900', color: '#FFF', letterSpacing: -0.5, lineHeight: 20 },
  nextPatName:     { fontSize: 13, fontWeight: '800', color: '#FFF', marginBottom: 4 },
  nextBadgeRow:    { flexDirection: 'row', gap: 5, flexWrap: 'wrap', marginBottom: 4 },
  nextPhone:       { fontSize: 10, color: 'rgba(255,255,255,0.4)', fontWeight: '500' },
  callNextBtn2:    { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 11, borderWidth: 1.5 },
  callNextBtn2Text:{ fontSize: 11, fontWeight: '800' },

  // ── Stats ──
  statsRow:        { flexDirection: 'row', marginBottom: 8, borderRadius: 14, overflow: 'hidden', backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)' },
  statPill:        { flex: 1, alignItems: 'center', paddingVertical: 10 },
  statPillBorder:  { borderRightWidth: 1, borderRightColor: 'rgba(255,255,255,0.06)' },
  statVal:         { fontSize: 20, fontWeight: '900', letterSpacing: -0.5 },
  statLbl:         { fontSize: 9, fontWeight: '700', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: 0.3, marginTop: 1 },

  // ── Pause button ──
  pauseBtn:         { height: 40, borderRadius: 13, marginBottom: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(245,158,11,0.1)', borderWidth: 1.5, borderColor: 'rgba(245,158,11,0.45)' },
  pauseBtnResumed:  { backgroundColor: 'rgba(34,197,94,0.1)', borderColor: 'rgba(34,197,94,0.45)' },
  pauseBtnText:     { fontSize: 12, fontWeight: '800', color: '#FCD34D' },

  // ── Tabs ──
  tabRow:      { flexDirection: 'row', gap: 4, padding: 4, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)', marginBottom: 10 },
  tab:         { flex: 1, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center', gap: 1, position: 'relative' },
  tabDot:      { position: 'absolute', top: 4, right: 6, width: 5, height: 5, borderRadius: 3, backgroundColor: '#EF4444' },
  tabTxt:      { fontSize: 9, fontWeight: '700', color: 'rgba(255,255,255,0.38)', textAlign: 'center' },

  // ── Queue cards ──
  listWrap:        { gap: 8 },
  emptyBox:        { alignItems: 'center', paddingVertical: 48 },
  emptyIcon:       { fontSize: 36, marginBottom: 10 },
  emptyTxt:        { fontSize: 12, color: 'rgba(255,255,255,0.3)', fontWeight: '600', textAlign: 'center' },
  emergHeader:     { marginBottom: 8 },
  emergHeaderText: { fontSize: 10, fontWeight: '800', color: 'rgba(239,68,68,0.7)', textTransform: 'uppercase', letterSpacing: 0.8 },

  qCard:            { borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.07)', overflow: 'hidden' },
  qCardEmergency:   { backgroundColor: 'rgba(239,68,68,0.1)', borderColor: 'rgba(239,68,68,0.3)', shadowColor: '#EF4444', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 14 },
  qCardTop:         { flexDirection: 'row', alignItems: 'flex-start', gap: 10, padding: 12, paddingBottom: 8 },
  qTokenBlock:      { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.07)', borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.1)', flexShrink: 0 },
  qTokenBlockEmergency: { backgroundColor: 'rgba(239,68,68,0.25)', borderColor: 'rgba(239,68,68,0.4)' },
  qTokenNum:        { fontSize: 14, fontWeight: '900', color: '#FFF', letterSpacing: -0.5 },
  qPatName:         { fontSize: 13, fontWeight: '800', color: '#FFF', marginBottom: 4 },
  qBadgeRow:        { flexDirection: 'row', gap: 5, flexWrap: 'wrap', marginBottom: 4 },
  qEmergBadge:      { paddingHorizontal: 7, paddingVertical: 3, borderRadius: 20, backgroundColor: 'rgba(239,68,68,0.15)' },
  qEmergBadgeText:  { fontSize: 9, fontWeight: '800', color: '#F87171', letterSpacing: 0.3 },
  qPhone:           { fontSize: 10, color: 'rgba(255,255,255,0.35)', fontWeight: '500' },
  qStatusBadge:     { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, borderWidth: 1, flexShrink: 0 },
  qStatusBadgeText: { fontSize: 9, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.3 },
  qCardBtns:        { flexDirection: 'row', gap: 6, padding: 12, paddingTop: 0 },
  qSendAlertBtn:    { flex: 1, height: 38, borderRadius: 11, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(99,102,241,0.2)', borderWidth: 1.5, borderColor: 'rgba(99,102,241,0.4)' },
  qSendAlertText:   { fontSize: 11, fontWeight: '800', color: '#A5B4FC' },
  qNotShownBtn:     { flex: 1, height: 38, borderRadius: 11, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(245,158,11,0.18)', borderWidth: 1.5, borderColor: 'rgba(245,158,11,0.4)' },
  qNotShownText:    { fontSize: 11, fontWeight: '800', color: '#FCD34D' },
});
