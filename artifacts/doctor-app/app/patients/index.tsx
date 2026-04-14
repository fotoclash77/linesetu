import React, { useMemo, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  TextInput, ActivityIndicator, RefreshControl, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { BG, TEAL, TEAL_LT } from '../../constants/theme';
import { useDoctor } from '../../contexts/DoctorContext';
// Unused but kept for reference: import { useQueryClient } from '@tanstack/react-query';

const isWeb = Platform.OS === 'web';
const BASE  = () => `https://${process.env.EXPO_PUBLIC_DOMAIN}`;

// ─── Date helpers ──────────────────────────────────────────────────────
function isoDate(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}
function daysBefore(n: number) {
  const d = new Date(); d.setDate(d.getDate() - n); d.setHours(0,0,0,0); return d;
}
function tokenDate(t: any): Date {
  const raw = t.bookedAt?.seconds
    ? new Date(t.bookedAt.seconds * 1000)
    : new Date();
  return raw;
}
function tokenDateStr(t: any): string {
  const raw = t.date ?? '';
  // Normalise legacy "13" → today's ISO if it's just a day number
  if (/^\d{1,2}$/.test(raw)) {
    const d = new Date();
    const day = parseInt(raw, 10);
    return isoDate(new Date(d.getFullYear(), d.getMonth(), day));
  }
  return raw;
}

// ─── API ──────────────────────────────────────────────────────────────
async function fetchAllTokens(doctorId: string) {
  const r = await fetch(`${BASE()}/api/tokens?doctorId=${doctorId}`);
  if (!r.ok) throw new Error('fetch failed');
  const data = await r.json();
  return (data.tokens ?? []) as any[];
}

// ─── Types ────────────────────────────────────────────────────────────
type Period = 'Today' | '7 days' | '30 days' | 'All';
type SourceFilter = 'all' | 'walkin' | 'online' | 'emergency';

// ─── Status helpers ────────────────────────────────────────────────────
function statusLabel(s: string) {
  if (s === 'in_consult')  return { label:'In Consult', color:'#2DD4BF', bg:'rgba(45,212,191,0.15)' };
  if (s === 'done')        return { label:'Consulted',  color:'#4ADE80', bg:'rgba(74,222,128,0.15)' };
  if (s === 'cancelled')   return { label:'Not Shown',  color:'#FCD34D', bg:'rgba(252,211,77,0.15)' };
  return                          { label:'Waiting',    color:'#A5B4FC', bg:'rgba(165,180,252,0.15)' };
}
function sourceInfo(t: any) {
  if (t.type === 'emergency') return { label:'⚡ Emergency', color:'#F87171', bg:'rgba(239,68,68,0.15)' };
  if (t.source === 'walkin')  return { label:'🚶 Walk-in',   color:'#67E8F9', bg:'rgba(6,182,212,0.15)' };
  return                             { label:'📱 Online',    color:'#4ADE80', bg:'rgba(34,197,94,0.15)' };
}
function fmtDate(t: any) {
  const d = t.bookedAt?.seconds
    ? new Date(t.bookedAt.seconds * 1000)
    : null;
  if (!d) return tokenDateStr(t);
  return d.toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' });
}
function fmtTime(t: any) {
  const d = t.bookedAt?.seconds ? new Date(t.bookedAt.seconds * 1000) : null;
  if (!d) return '';
  return d.toLocaleTimeString('en-IN', { hour:'2-digit', minute:'2-digit', hour12:true });
}

// ─── Patient card ──────────────────────────────────────────────────────
function PatientCard({ tok }: { tok: any }) {
  const st     = statusLabel(tok.status);
  const isEmrg = tok.type === 'emergency';

  // Token display — "E03" for emergency, "#03" for normal
  const tokenDisp = isEmrg
    ? `E${String(tok.tokenNumber).padStart(2, '0')}`
    : `#${String(tok.tokenNumber).padStart(2, '0')}`;

  // Source pill
  const srcLabel = tok.source === 'walkin' ? 'Walk-in' : 'E-Token';
  const srcClr   = tok.source === 'walkin' ? '#2DD4BF' : '#A5B4FC';
  const srcBg    = tok.source === 'walkin' ? 'rgba(45,212,191,0.12)'  : 'rgba(165,180,252,0.12)';
  const srcBd    = tok.source === 'walkin' ? 'rgba(45,212,191,0.28)'  : 'rgba(165,180,252,0.28)';

  // Priority pill
  const priLabel = isEmrg ? 'Emergency' : 'Normal';
  const priClr   = isEmrg ? '#F87171' : '#4ADE80';
  const priBg    = isEmrg ? 'rgba(239,68,68,0.12)'  : 'rgba(74,222,128,0.12)';
  const priBd    = isEmrg ? 'rgba(239,68,68,0.28)'  : 'rgba(74,222,128,0.28)';

  // Demographics
  const genderStr =
    tok.gender === 'M' || tok.gender === 'male'   ? 'Male'   :
    tok.gender === 'F' || tok.gender === 'female' ? 'Female' :
    tok.gender ?? '';
  const demo = [tok.age ? `${tok.age} yr` : '', genderStr].filter(Boolean).join(' · ');

  return (
    <TouchableOpacity
      style={[S.card, isEmrg && S.cardEmerg]}
      onPress={() => router.push(`/patients/${tok.id}`)}
      activeOpacity={0.75}
    >
      {/* Token chip */}
      <View style={[S.tokenBlock, isEmrg && S.tokenBlockEmerg]}>
        <Text style={[S.tokenNum, isEmrg && { color: '#FCA5A5' }]}>{tokenDisp}</Text>
      </View>

      {/* Info */}
      <View style={S.cardInfo}>
        {/* Row 1: name + status badge */}
        <View style={S.cardRow}>
          <Text style={S.cardName} numberOfLines={1}>{tok.patientName ?? 'Unknown'}</Text>
          <View style={[S.badge, { backgroundColor: st.bg, borderWidth: 0.5, borderColor: `${st.color}55` }]}>
            <Text style={[S.badgeTxt, { color: st.color }]}>{st.label}</Text>
          </View>
        </View>

        {/* Row 2: age · gender · [Walk-in/E-Token] · [Normal/Emergency] · [Visit Type] */}
        <View style={S.badgeRow}>
          {demo ? <Text style={S.cardMeta}>{demo}</Text> : null}
          {demo ? <Text style={S.cardMetaDot}>·</Text> : null}
          <View style={[S.pill, { backgroundColor: srcBg, borderColor: srcBd }]}>
            <Text style={[S.pillTxt, { color: srcClr }]}>{srcLabel}</Text>
          </View>
          <Text style={S.cardMetaDot}>·</Text>
          <View style={[S.pill, { backgroundColor: priBg, borderColor: priBd }]}>
            <Text style={[S.pillTxt, { color: priClr }]}>{priLabel}</Text>
          </View>
          {!!tok.visitType && <Text style={S.cardMetaDot}>·</Text>}
          {!!tok.visitType && (() => {
            const isFirst = tok.visitType === 'first-visit';
            return (
              <View style={[S.pill, {
                backgroundColor: isFirst ? 'rgba(99,102,241,0.12)' : 'rgba(16,185,129,0.12)',
                borderColor: isFirst ? 'rgba(129,140,248,0.30)' : 'rgba(52,211,153,0.30)',
              }]}>
                <Text style={[S.pillTxt, { color: isFirst ? '#A5B4FC' : '#6EE7B7' }]}>
                  {isFirst ? 'First Visit' : 'Follow-up'}
                </Text>
              </View>
            );
          })()}
        </View>
      </View>

      {/* Chevron */}
      <Text style={S.cardChevron}>›</Text>
    </TouchableOpacity>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────
export default function PatientsScreen() {
  const { doctor } = useDoctor();
  const docId = doctor?.id ?? '';

  const [search,  setSearch]  = useState('');
  const [period,  setPeriod]  = useState<Period>('Today');
  const [srcFilt, setSrcFilt] = useState<SourceFilter>('all');

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['all-tokens', docId],
    queryFn: () => fetchAllTokens(docId),
    enabled: !!docId, staleTime: 30_000,
  });

  const tokens: any[] = data ?? [];

  // ── Filter by period ──
  const periodFiltered = useMemo(() => {
    const now = new Date(); now.setHours(23,59,59,999);
    const today = daysBefore(0);
    return tokens.filter(t => {
      const d = tokenDate(t);
      if (period === 'Today')   return d >= today && d <= now;
      if (period === '7 days')  return d >= daysBefore(6) && d <= now;
      if (period === '30 days') return d >= daysBefore(29) && d <= now;
      return true; // All
    });
  }, [tokens, period]);

  // ── Filter by source ──
  const sourceFiltered = useMemo(() => {
    if (srcFilt === 'all')       return periodFiltered;
    if (srcFilt === 'emergency') return periodFiltered.filter(t => t.type === 'emergency');
    if (srcFilt === 'walkin')    return periodFiltered.filter(t => t.source === 'walkin' && t.type !== 'emergency');
    if (srcFilt === 'online')    return periodFiltered.filter(t => t.source !== 'walkin' && t.type !== 'emergency');
    return periodFiltered;
  }, [periodFiltered, srcFilt]);

  // ── Search ──
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return sourceFiltered;
    return sourceFiltered.filter(t =>
      (t.patientName ?? '').toLowerCase().includes(q) ||
      (t.patientPhone ?? '').replace(/\s/g,'').includes(q.replace(/\s/g,''))
    );
  }, [sourceFiltered, search]);

  // ── Sort by date desc ──
  const sorted = useMemo(() =>
    [...filtered].sort((a, b) => {
      const da = a.bookedAt?.seconds ?? 0;
      const db = b.bookedAt?.seconds ?? 0;
      return db - da;
    }),
  [filtered]);

  // ── Stats ──
  const totalInPeriod  = periodFiltered.length;
  const walkinCount    = periodFiltered.filter(t => t.source === 'walkin' && t.type !== 'emergency').length;
  const onlineCount    = periodFiltered.filter(t => t.source !== 'walkin' && t.type !== 'emergency').length;
  const emergCount     = periodFiltered.filter(t => t.type === 'emergency').length;
  const consultedCount = periodFiltered.filter(t => t.status === 'done').length;

  const PERIODS: Period[] = ['Today', '7 days', '30 days', 'All'];
  const SRC_TABS: { key: SourceFilter; label: string; color: string; count: number }[] = [
    { key:'all',       label:'All',       color:'#A5B4FC', count: totalInPeriod },
    { key:'walkin',    label:'Walk-in',   color:'#67E8F9', count: walkinCount },
    { key:'online',    label:'Online',    color:'#4ADE80', count: onlineCount },
    { key:'emergency', label:'Emergency', color:'#F87171', count: emergCount },
  ];

  return (
    <SafeAreaView style={S.safe} edges={['top']}>
      <View style={S.root}>
        <View style={S.glow1}/><View style={S.glow2}/>

        {/* ── HEADER ── */}
        <View style={S.hdr}>
          <TouchableOpacity onPress={() => router.back()} style={S.back}>
            <Text style={S.backTxt}>‹</Text>
          </TouchableOpacity>
          <View>
            <Text style={S.hdrTitle}>My Patients</Text>
            <Text style={S.hdrSub}>{totalInPeriod} patient{totalInPeriod !== 1 ? 's' : ''} · {period}</Text>
          </View>
          {isRefetching && <ActivityIndicator size="small" color={TEAL} style={{marginLeft:'auto'}}/>}
        </View>

        {/* ── SEARCH BAR ── */}
        <View style={S.searchWrap}>
          <Text style={S.searchIcon}>🔍</Text>
          <TextInput
            style={S.searchInput}
            placeholder="Search by name or phone number…"
            placeholderTextColor="rgba(255,255,255,0.22)"
            value={search}
            onChangeText={setSearch}
            clearButtonMode="while-editing"
            returnKeyType="search"
          />
          {!!search && (
            <TouchableOpacity onPress={() => setSearch('')} style={S.searchClear}>
              <Text style={S.searchClearTxt}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* ── PERIOD TABS ── */}
        <View style={S.periodRow}>
          {PERIODS.map(p => (
            <TouchableOpacity
              key={p}
              style={[S.periodTab, period===p && S.periodTabActive]}
              onPress={() => setPeriod(p)}
            >
              <Text style={[S.periodTabTxt, period===p && S.periodTabTxtActive]}>{p}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {isLoading ? (
          <View style={S.loadWrap}>
            <ActivityIndicator color={TEAL} size="large"/>
            <Text style={S.loadTxt}>Loading patient history…</Text>
          </View>
        ) : (
          <ScrollView
            showsVerticalScrollIndicator={false}
            refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={TEAL}/>}
            contentContainerStyle={{paddingBottom:100}}
          >
            <View style={S.inner}>

              {/* ── STATS SUMMARY ROW ── */}
              <View style={S.statsRow}>
                {[
                  {label:'Total',     val:totalInPeriod,  color:'#A5B4FC'},
                  {label:'Walk-in',   val:walkinCount,    color:'#67E8F9'},
                  {label:'Online',    val:onlineCount,    color:'#4ADE80'},
                  {label:'Emergency', val:emergCount,     color:'#F87171'},
                  {label:'Consulted', val:consultedCount, color:'#FCD34D'},
                ].map((s,i,arr) => (
                  <View key={s.label} style={[S.statCell, i<arr.length-1&&S.statBorder]}>
                    <Text style={[S.statVal,{color:s.color}]}>{s.val}</Text>
                    <Text style={S.statLbl}>{s.label}</Text>
                  </View>
                ))}
              </View>

              {/* ── SOURCE FILTER PILLS ── */}
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={S.srcRow}>
                {SRC_TABS.map(st => (
                  <TouchableOpacity
                    key={st.key}
                    style={[S.srcPill, srcFilt===st.key && {backgroundColor:`${st.color}22`, borderColor:`${st.color}55`}]}
                    onPress={() => setSrcFilt(st.key)}
                  >
                    <Text style={[S.srcPillTxt, srcFilt===st.key && {color:st.color}]}>
                      {st.label}{st.count > 0 ? ` (${st.count})` : ''}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* ── RESULTS COUNT ── */}
              <View style={S.resultsRow}>
                <Text style={S.resultsTxt}>
                  {sorted.length} result{sorted.length !== 1 ? 's' : ''}
                  {search ? ` for "${search}"` : ''}
                </Text>
              </View>

              {/* ── LIST ── */}
              {sorted.length === 0 ? (
                <View style={S.empty}>
                  <Text style={S.emptyIcon}>{search ? '🔍' : '📋'}</Text>
                  <Text style={S.emptyTxt}>
                    {search ? `No patients matching "${search}"` : `No patients for this period`}
                  </Text>
                  {search && (
                    <TouchableOpacity onPress={() => setSearch('')} style={S.clearBtn}>
                      <Text style={S.clearBtnTxt}>Clear search</Text>
                    </TouchableOpacity>
                  )}
                </View>
              ) : (
                <View style={S.list}>
                  {sorted.map(t => <PatientCard key={t.id} tok={t}/>)}
                </View>
              )}

            </View>
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
}

// ─── STYLES ────────────────────────────────────────────────────────────
const S = StyleSheet.create({
  safe: { flex:1, backgroundColor:BG, ...(isWeb&&{paddingTop:44}) },
  root: { flex:1, backgroundColor:BG },
  glow1:{ position:'absolute', top:-60, left:-60, width:200, height:200, borderRadius:100, backgroundColor:'rgba(99,102,241,0.2)' },
  glow2:{ position:'absolute', top:320, right:-60, width:160, height:160, borderRadius:80, backgroundColor:'rgba(13,148,136,0.14)' },
  inner:{ paddingHorizontal:16, gap:10 },

  // Header
  hdr:    { flexDirection:'row', alignItems:'center', gap:12, paddingHorizontal:16, paddingTop:12, paddingBottom:8 },
  back:   { width:36, height:36, borderRadius:12, backgroundColor:'rgba(255,255,255,0.06)', borderWidth:1, borderColor:'rgba(255,255,255,0.1)', alignItems:'center', justifyContent:'center' },
  backTxt:{ fontSize:22, color:'#FFF', fontWeight:'300', lineHeight:28 },
  hdrTitle:{ fontSize:17, fontWeight:'900', color:'#FFF', letterSpacing:-0.3 },
  hdrSub:{ fontSize:10, color:'rgba(255,255,255,0.35)', fontWeight:'600', marginTop:1 },

  // Search
  searchWrap:{ flexDirection:'row', alignItems:'center', marginHorizontal:16, marginBottom:4, height:44, borderRadius:14, backgroundColor:'rgba(255,255,255,0.06)', borderWidth:1, borderColor:'rgba(255,255,255,0.1)', paddingHorizontal:12, gap:8 },
  searchIcon:{ fontSize:14, opacity:0.5 },
  searchInput:{ flex:1, fontSize:13, color:'#FFF', fontWeight:'600' },
  searchClear:{ padding:4 },
  searchClearTxt:{ fontSize:11, color:'rgba(255,255,255,0.3)', fontWeight:'700' },

  // Period tabs
  periodRow:{ flexDirection:'row', gap:4, marginHorizontal:16, marginBottom:4, padding:3, borderRadius:13, backgroundColor:'rgba(0,0,0,0.3)' },
  periodTab:{ flex:1, height:32, borderRadius:10, alignItems:'center', justifyContent:'center' },
  periodTabActive:{ backgroundColor:TEAL },
  periodTabTxt:{ fontSize:11, fontWeight:'800', color:'rgba(255,255,255,0.35)' },
  periodTabTxtActive:{ color:'#FFF' },

  // Load
  loadWrap:{ flex:1, alignItems:'center', justifyContent:'center', gap:12 },
  loadTxt:{ fontSize:12, color:'rgba(255,255,255,0.3)', fontWeight:'600' },

  // Stats
  statsRow:{ flexDirection:'row', borderRadius:16, overflow:'hidden', backgroundColor:'rgba(255,255,255,0.04)', borderWidth:1, borderColor:'rgba(255,255,255,0.07)' },
  statCell:{ flex:1, alignItems:'center', paddingVertical:10 },
  statBorder:{ borderRightWidth:1, borderRightColor:'rgba(255,255,255,0.06)' },
  statVal:{ fontSize:18, fontWeight:'900', letterSpacing:-0.5 },
  statLbl:{ fontSize:8, fontWeight:'700', color:'rgba(255,255,255,0.28)', textTransform:'uppercase', letterSpacing:0.3, marginTop:1 },

  // Source filter
  srcRow:{ paddingHorizontal:0, gap:6, paddingBottom:2 },
  srcPill:{ paddingHorizontal:14, paddingVertical:8, borderRadius:20, backgroundColor:'rgba(255,255,255,0.05)', borderWidth:1.5, borderColor:'rgba(255,255,255,0.1)' },
  srcPillTxt:{ fontSize:11, fontWeight:'800', color:'rgba(255,255,255,0.35)' },

  // Results
  resultsRow:{ flexDirection:'row', alignItems:'center' },
  resultsTxt:{ fontSize:10, color:'rgba(255,255,255,0.25)', fontWeight:'700', textTransform:'uppercase', letterSpacing:0.5 },

  // Empty
  empty:{ alignItems:'center', paddingVertical:56, gap:8 },
  emptyIcon:{ fontSize:38 },
  emptyTxt:{ fontSize:13, color:'rgba(255,255,255,0.25)', fontWeight:'600', textAlign:'center' },
  clearBtn:{ marginTop:8, paddingHorizontal:18, paddingVertical:8, borderRadius:12, backgroundColor:'rgba(99,102,241,0.2)', borderWidth:1, borderColor:'rgba(99,102,241,0.4)' },
  clearBtnTxt:{ fontSize:12, fontWeight:'800', color:'#A5B4FC' },
  list:{ gap:8 },

  // Card
  card:{ flexDirection:'row', alignItems:'center', gap:10, paddingHorizontal:12, paddingVertical:11, borderRadius:16, backgroundColor:'rgba(255,255,255,0.04)', borderWidth:1.5, borderColor:'rgba(255,255,255,0.08)' },
  cardEmerg:{ backgroundColor:'rgba(239,68,68,0.07)', borderColor:'rgba(239,68,68,0.28)' },
  tokenBlock:{ width:52, height:52, alignItems:'center', justifyContent:'center', borderRadius:13, backgroundColor:'rgba(13,148,136,0.2)', borderWidth:1.5, borderColor:'rgba(45,212,191,0.35)', flexShrink:0 },
  tokenBlockEmerg:{ backgroundColor:'rgba(239,68,68,0.22)', borderColor:'rgba(239,68,68,0.45)' },
  tokenNum:{ fontSize:14, fontWeight:'900', color:'#FFF', letterSpacing:-0.3 },
  cardInfo:{ flex:1, gap:4, minWidth:0 },
  cardRow:{ flexDirection:'row', alignItems:'center', gap:8, justifyContent:'space-between' },
  cardName:{ fontSize:13, fontWeight:'800', color:'#FFF', flex:1, minWidth:0 },
  badgeRow:{ flexDirection:'row', alignItems:'center', gap:4, flexWrap:'wrap' },
  badge:{ paddingHorizontal:8, paddingVertical:3, borderRadius:20 },
  badgeTxt:{ fontSize:9, fontWeight:'800' },
  cardMeta:{ fontSize:10, color:'rgba(255,255,255,0.4)', fontWeight:'600' },
  cardMetaDot:{ fontSize:10, color:'rgba(255,255,255,0.2)', fontWeight:'600' },
  pill:{ paddingHorizontal:6, paddingVertical:2, borderRadius:6, borderWidth:1 },
  pillTxt:{ fontSize:9, fontWeight:'800' },
  cardChevron:{ fontSize:20, color:'rgba(255,255,255,0.18)', fontWeight:'300', alignSelf:'center' },
});
