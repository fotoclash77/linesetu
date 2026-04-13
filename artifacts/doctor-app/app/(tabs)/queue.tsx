import React, { useCallback, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  FlatList, ActivityIndicator, RefreshControl, Platform,
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

async function fetchQueue(doctorId: string, shift = 'morning') {
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

interface TokenItem {
  id: string;
  tokenNumber: number;
  patientName: string;
  patientPhone: string;
  type: 'normal' | 'emergency';
  status: string; // raw API status
  displayStatus: DisplayStatus;
  shift: string;
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
    status: t.status,
    displayStatus,
    shift: t.shift ?? 'morning',
  };
}

// ─── Status / Type config ─────────────────────────────────────
const STATUS_CFG = {
  consulting: { label: 'In Cabin',  color: '#2DD4BF', bg: 'rgba(13,148,136,0.22)',  border: 'rgba(45,212,191,0.5)' },
  waiting:    { label: 'Waiting',   color: '#A5B4FC', bg: 'rgba(99,102,241,0.15)',  border: 'rgba(99,102,241,0.35)' },
  done:       { label: 'Consulted', color: '#4ADE80', bg: 'rgba(34,197,94,0.14)',   border: 'rgba(34,197,94,0.3)' },
  skipped:    { label: 'Not Shown', color: '#F59E0B', bg: 'rgba(245,158,11,0.14)',  border: 'rgba(245,158,11,0.3)' },
};

const TYPE_CFG = {
  normal:    { color: '#4ADE80', bg: 'rgba(34,197,94,0.15)',  icon: '📱', label: 'Online' },
  emergency: { color: '#F87171', bg: 'rgba(239,68,68,0.15)',  icon: '⚡', label: 'Emergency' },
};

// ─── Queue Card ───────────────────────────────────────────────
function QueueCard({ token, onCall, onDone, onSkip, busy }: {
  token: TokenItem;
  onCall?: () => void;
  onDone?: () => void;
  onSkip?: () => void;
  busy?: boolean;
}) {
  const sc = STATUS_CFG[token.displayStatus];
  const tc = TYPE_CFG[token.type];
  const isCurrent = token.displayStatus === 'consulting';
  const isPast = token.displayStatus === 'done' || token.displayStatus === 'skipped';
  const isEmergency = token.type === 'emergency';

  return (
    <View style={[
      styles.qCard,
      isCurrent && styles.qCardCurrent,
      isEmergency && styles.qCardEmergency,
      isPast && { opacity: 0.55 },
    ]}>
      <View style={styles.qCardTop}>
        <View style={[styles.tokenBox, isCurrent && styles.tokenBoxCurrent, isEmergency && styles.tokenBoxEmergency]}>
          <Text style={styles.tokenText}>#{token.tokenNumber}</Text>
          {isCurrent && <Text style={{ fontSize: 10, color: TEAL_LT }}>●</Text>}
        </View>
        <View style={{ flex: 1, minWidth: 0 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 3 }}>
            <Text style={[styles.patName, isPast && { color: 'rgba(255,255,255,0.45)' }]} numberOfLines={1}>
              {token.patientName}
            </Text>
          </View>
          <View style={{ flexDirection: 'row', gap: 5, flexWrap: 'wrap' }}>
            <View style={[styles.typeBadge, { backgroundColor: tc.bg }]}>
              <Text style={{ fontSize: 9, color: tc.color, fontWeight: '800' }}>{tc.icon} {tc.label}</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: sc.bg, borderColor: sc.border }]}>
              <Text style={{ fontSize: 9, color: sc.color, fontWeight: '800' }}>{sc.label}</Text>
            </View>
          </View>
          {!!token.patientPhone && (
            <Text style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', marginTop: 2 }}>{token.patientPhone}</Text>
          )}
        </View>
      </View>

      {!isPast && (
        <View style={styles.qCardBtns}>
          {isCurrent ? (
            <>
              <TouchableOpacity style={[styles.btnDone, busy && { opacity: 0.5 }]} onPress={onDone} disabled={busy}>
                <Text style={styles.btnDoneTxt}>✓ Consultation Done</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <TouchableOpacity style={[styles.btnCall, busy && { opacity: 0.5 }]} onPress={onCall} disabled={busy}>
                <Text style={styles.btnCallTxt}>📢 Call In</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.btnSkip, busy && { opacity: 0.5 }]} onPress={onSkip} disabled={busy}>
                <Text style={styles.btnSkipTxt}>Skip</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      )}
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────
export default function QueueScreen() {
  const { doctor } = useDoctor();
  const qc = useQueryClient();
  const [tab, setTab] = useState<'queue' | 'emergency' | 'done'>('queue');
  const [shift, setShift] = useState<'morning' | 'evening'>('morning');
  const [busy, setBusy] = useState<string | null>(null);

  const doctorId = doctor?.id ?? '';

  const { data: queueData, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['doctor-queue', doctorId, shift],
    queryFn: () => fetchQueue(doctorId, shift),
    enabled: !!doctorId,
    refetchInterval: 10_000,
    staleTime: 0,
  });

  const { data: allData } = useQuery({
    queryKey: ['doctor-tokens-all', doctorId, shift],
    queryFn: () => fetchAllTokens(doctorId),
    enabled: !!doctorId,
    refetchInterval: 15_000,
    staleTime: 0,
  });

  const invalidate = useCallback(() => {
    qc.invalidateQueries({ queryKey: ['doctor-queue', doctorId] });
    qc.invalidateQueries({ queryKey: ['doctor-tokens-all', doctorId] });
  }, [qc, doctorId]);

  const handleCall = async (tokenId: string) => {
    setBusy(tokenId);
    try { await callToken(tokenId); invalidate(); } catch {}
    setBusy(null);
  };

  const handleDone = async (tokenId: string) => {
    setBusy(tokenId);
    try { await doneToken(tokenId); invalidate(); } catch {}
    setBusy(null);
  };

  const handleSkip = async (tokenId: string) => {
    setBusy(tokenId);
    try { await cancelToken(tokenId); invalidate(); } catch {}
    setBusy(null);
  };

  // Map API tokens → display tokens
  const liveTokens: TokenItem[] = (queueData?.tokens ?? []).map(mapToken);
  const current    = liveTokens.find(t => t.displayStatus === 'consulting');
  const waiting    = liveTokens.filter(t => t.displayStatus === 'waiting');
  const emergency  = waiting.filter(t => t.type === 'emergency');
  const normal     = waiting.filter(t => t.type === 'normal');

  const allTokens: TokenItem[] = (allData?.tokens ?? []).map(mapToken);
  const doneList   = allTokens.filter(t => t.displayStatus === 'done').sort((a, b) => b.tokenNumber - a.tokenNumber);
  const skippedList = allTokens.filter(t => t.displayStatus === 'skipped');

  const doneCount    = doneList.length;
  const waitingCount = waiting.length;

  const visibleList =
    tab === 'queue'     ? normal :
    tab === 'emergency' ? emergency :
    [...doneList, ...skippedList];

  const noQueue = !isLoading && !current && waiting.length === 0;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.container}>
        <View style={styles.glowTeal} />
        <View style={styles.glowRed} />

        {/* Header */}
        <View style={styles.header}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <View style={styles.liveDot} />
            <Text style={styles.headerTitle}>Master Queue</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Text style={{ fontSize: 13, color: TEAL_LT }}>⚕ {doctor?.name ?? 'Doctor'}</Text>
            <TouchableOpacity
              style={[styles.shiftBtn, shift === 'morning' && styles.shiftBtnActive]}
              onPress={() => setShift(s => s === 'morning' ? 'evening' : 'morning')}
            >
              <Text style={{ fontSize: 10, fontWeight: '700', color: shift === 'morning' ? '#FCD34D' : 'rgba(255,255,255,0.4)' }}>
                {shift === 'morning' ? '☀️ Morning' : '🌙 Evening'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {isLoading ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <ActivityIndicator color={TEAL} size="large" />
            <Text style={{ color: 'rgba(255,255,255,0.4)', marginTop: 12, fontSize: 13 }}>Loading queue…</Text>
          </View>
        ) : (
          <ScrollView
            showsVerticalScrollIndicator={false}
            refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={TEAL} />}
          >
            {/* Currently Consulting */}
            {current ? (
              <View style={styles.consultingCard}>
                <View style={styles.glowBlob} />
                <View style={styles.consultingTop}>
                  <View style={styles.liveBadge}>
                    <Text style={styles.liveDot2}>●</Text>
                    <Text style={styles.liveBadgeText}>CURRENTLY CONSULTING</Text>
                  </View>
                </View>
                <View style={styles.consultingHero}>
                  <View style={styles.bigTokenBox}>
                    <Text style={styles.bigTokenLabel}>Token</Text>
                    <Text style={styles.bigTokenText}>#{current.tokenNumber}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.consultingName}>{current.patientName}</Text>
                    <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>{current.patientPhone}</Text>
                    <View style={[styles.typeBadge2, { backgroundColor: TYPE_CFG[current.type].bg, marginTop: 6 }]}>
                      <Text style={{ fontSize: 10, fontWeight: '800', color: TYPE_CFG[current.type].color }}>
                        {TYPE_CFG[current.type].icon} {TYPE_CFG[current.type].label}
                      </Text>
                    </View>
                  </View>
                </View>
                <TouchableOpacity
                  style={[styles.doneBtn, busy === current.id && { opacity: 0.5 }]}
                  onPress={() => handleDone(current.id)}
                  disabled={!!busy}
                >
                  <Text style={styles.doneBtnText}>✓ Done · Call Next</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={[styles.callNextBtn, (!waiting.length || !!busy) && { opacity: 0.5 }]}
                onPress={() => waiting.length && handleCall(waiting[0].id)}
                disabled={!waiting.length || !!busy}
              >
                <Text style={styles.callNextText}>
                  {waiting.length ? `📢 Call Token #${waiting[0].tokenNumber}` : 'No patients waiting'}
                </Text>
              </TouchableOpacity>
            )}

            {/* Stats Row */}
            <View style={styles.statsRow}>
              {[
                { label: 'Waiting', val: waitingCount, color: '#A5B4FC' },
                { label: 'Done',    val: doneCount,    color: '#4ADE80' },
                { label: 'Emerg',   val: emergency.length, color: '#F87171' },
              ].map(s => (
                <View key={s.label} style={styles.statPill}>
                  <Text style={[styles.statVal, { color: s.color }]}>{s.val}</Text>
                  <Text style={styles.statLbl}>{s.label}</Text>
                </View>
              ))}
            </View>

            {/* Tabs */}
            <View style={styles.tabRow}>
              {([
                { key: 'queue',     label: `Queue (${normal.length})` },
                { key: 'emergency', label: `⚡ Emerg (${emergency.length})` },
                { key: 'done',      label: `Done (${doneCount})` },
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

            {/* List */}
            {visibleList.length === 0 ? (
              <View style={styles.emptyBox}>
                <Text style={styles.emptyIcon}>{tab === 'emergency' ? '⚡' : tab === 'done' ? '✅' : '🎉'}</Text>
                <Text style={styles.emptyTxt}>
                  {tab === 'emergency' ? 'No emergency tokens' :
                   tab === 'done'      ? 'No completed tokens yet' :
                   'Queue is empty · All done!'}
                </Text>
              </View>
            ) : (
              <View style={styles.listWrap}>
                {visibleList.map(token => (
                  <QueueCard
                    key={token.id}
                    token={token}
                    busy={busy === token.id}
                    onCall={() => handleCall(token.id)}
                    onDone={() => handleDone(token.id)}
                    onSkip={() => handleSkip(token.id)}
                  />
                ))}
              </View>
            )}

            <View style={{ height: 100 }} />
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
  glowTeal:  { position: 'absolute', top: -80, left: -80, width: 260, height: 260, borderRadius: 130, backgroundColor: 'rgba(45,212,191,0.12)' },
  glowRed:   { position: 'absolute', bottom: 40, right: -60, width: 200, height: 200, borderRadius: 100, backgroundColor: 'rgba(248,113,113,0.08)' },

  header:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 18, paddingTop: 10, paddingBottom: 10 },
  headerTitle:  { fontSize: 18, fontWeight: '900', color: '#FFF' },
  liveDot:      { width: 8, height: 8, borderRadius: 4, backgroundColor: TEAL },
  shiftBtn:     { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  shiftBtnActive: { backgroundColor: 'rgba(252,211,77,0.12)', borderColor: 'rgba(252,211,77,0.3)' },

  consultingCard: { marginHorizontal: 16, marginBottom: 12, borderRadius: 20, overflow: 'hidden', backgroundColor: 'rgba(13,148,136,0.15)', borderWidth: 1.5, borderColor: 'rgba(45,212,191,0.4)', padding: 16 },
  glowBlob:       { position: 'absolute', top: -30, right: -30, width: 120, height: 120, borderRadius: 60, backgroundColor: 'rgba(45,212,191,0.15)' },
  consultingTop:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  liveBadge:      { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: 'rgba(45,212,191,0.2)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  liveDot2:       { fontSize: 10, color: TEAL },
  liveBadgeText:  { fontSize: 10, fontWeight: '800', color: TEAL_LT, letterSpacing: 0.5 },
  consultingHero: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 14 },
  bigTokenBox:    { width: 64, height: 64, borderRadius: 18, backgroundColor: 'rgba(45,212,191,0.25)', borderWidth: 2, borderColor: 'rgba(45,212,191,0.5)', alignItems: 'center', justifyContent: 'center' },
  bigTokenLabel:  { fontSize: 8, fontWeight: '700', color: TEAL_LT, letterSpacing: 0.5 },
  bigTokenText:   { fontSize: 22, fontWeight: '900', color: '#FFF' },
  consultingName: { fontSize: 18, fontWeight: '800', color: '#FFF' },
  typeBadge2:     { flexDirection: 'row', alignSelf: 'flex-start', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  doneBtn:        { height: 44, borderRadius: 14, backgroundColor: TEAL, alignItems: 'center', justifyContent: 'center' },
  doneBtnText:    { fontSize: 14, fontWeight: '800', color: BG },
  callNextBtn:    { marginHorizontal: 16, marginBottom: 12, height: 52, borderRadius: 16, backgroundColor: 'rgba(45,212,191,0.15)', borderWidth: 1.5, borderColor: 'rgba(45,212,191,0.4)', alignItems: 'center', justifyContent: 'center' },
  callNextText:   { fontSize: 15, fontWeight: '800', color: TEAL_LT },

  statsRow:  { flexDirection: 'row', marginHorizontal: 16, marginBottom: 14, borderRadius: 16, overflow: 'hidden', backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)' },
  statPill:  { flex: 1, alignItems: 'center', paddingVertical: 10 },
  statVal:   { fontSize: 18, fontWeight: '900' },
  statLbl:   { fontSize: 9, fontWeight: '700', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 2 },

  tabRow:     { flexDirection: 'row', marginHorizontal: 16, marginBottom: 10, backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 14, padding: 3, borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)' },
  tab:        { flex: 1, paddingVertical: 7, alignItems: 'center', borderRadius: 11 },
  tabActive:  { backgroundColor: 'rgba(45,212,191,0.2)' },
  tabTxt:     { fontSize: 11, fontWeight: '700', color: 'rgba(255,255,255,0.35)' },
  tabTxtActive: { color: TEAL_LT },

  listWrap: { paddingHorizontal: 16, gap: 10 },
  emptyBox: { alignItems: 'center', paddingVertical: 48 },
  emptyIcon: { fontSize: 40, marginBottom: 12 },
  emptyTxt:  { fontSize: 13, color: 'rgba(255,255,255,0.3)', fontWeight: '600', textAlign: 'center' },

  qCard:          { borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', padding: 14 },
  qCardCurrent:   { backgroundColor: 'rgba(45,212,191,0.08)', borderColor: 'rgba(45,212,191,0.3)' },
  qCardEmergency: { backgroundColor: 'rgba(248,113,113,0.08)', borderColor: 'rgba(248,113,113,0.3)' },
  qCardTop:       { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 10 },
  tokenBox:       { width: 50, height: 50, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.08)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  tokenBoxCurrent: { backgroundColor: 'rgba(45,212,191,0.2)', borderColor: 'rgba(45,212,191,0.4)' },
  tokenBoxEmergency: { backgroundColor: 'rgba(248,113,113,0.2)', borderColor: 'rgba(248,113,113,0.4)' },
  tokenText:      { fontSize: 15, fontWeight: '900', color: '#FFF' },
  patName:        { fontSize: 14, fontWeight: '800', color: '#FFF' },
  typeBadge:      { borderRadius: 8, paddingHorizontal: 7, paddingVertical: 2 },
  statusBadge:    { borderRadius: 8, paddingHorizontal: 7, paddingVertical: 2, borderWidth: 1 },
  qCardBtns:      { flexDirection: 'row', gap: 8 },
  btnCall:        { flex: 1, height: 36, borderRadius: 10, backgroundColor: 'rgba(45,212,191,0.2)', borderWidth: 1, borderColor: 'rgba(45,212,191,0.4)', alignItems: 'center', justifyContent: 'center' },
  btnCallTxt:     { fontSize: 12, fontWeight: '800', color: TEAL_LT },
  btnSkip:        { height: 36, paddingHorizontal: 16, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)', alignItems: 'center', justifyContent: 'center' },
  btnSkipTxt:     { fontSize: 12, fontWeight: '700', color: 'rgba(255,255,255,0.45)' },
  btnDone:        { flex: 1, height: 36, borderRadius: 10, backgroundColor: 'rgba(34,197,94,0.2)', borderWidth: 1, borderColor: 'rgba(34,197,94,0.4)', alignItems: 'center', justifyContent: 'center' },
  btnDoneTxt:     { fontSize: 12, fontWeight: '800', color: '#4ADE80' },
});
