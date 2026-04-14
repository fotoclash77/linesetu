import React, { useMemo, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  TextInput, ActivityIndicator, RefreshControl, Platform, Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Calendar } from 'react-native-calendars';
import { BG, TEAL } from '../../constants/theme';
import { useDoctor } from '../../contexts/DoctorContext';

const isWeb = Platform.OS === 'web';
const BASE  = () => `https://${process.env.EXPO_PUBLIC_DOMAIN}`;

// ─── Date helpers ────────────────────────────────────────────────────────────
function toYMD(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}
function startOfDay(d: Date): Date {
  const n = new Date(d); n.setHours(0,0,0,0); return n;
}
function endOfDay(d: Date): Date {
  const n = new Date(d); n.setHours(23,59,59,999); return n;
}
function addDays(d: Date, n: number): Date {
  const r = new Date(d); r.setDate(r.getDate() + n); return r;
}
function tokenBookedAt(t: any): Date {
  return t.bookedAt?.seconds ? new Date(t.bookedAt.seconds * 1000) : new Date(0);
}
function displayRange(start: string | null, end: string | null) {
  if (!start) return 'All time';
  const fmt = (s: string) => {
    const [y,m,d] = s.split('-');
    const mn = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return `${parseInt(d,10)} ${mn[parseInt(m,10)-1]} ${y}`;
  };
  if (!end || end === start) return fmt(start);
  return `${fmt(start)} – ${fmt(end)}`;
}

// ─── API ─────────────────────────────────────────────────────────────────────
async function fetchAllTokens(doctorId: string) {
  const r = await fetch(`${BASE()}/api/tokens?doctorId=${doctorId}`);
  if (!r.ok) throw new Error('fetch failed');
  const data = await r.json();
  return (data.tokens ?? []) as any[];
}

// ─── Build marked-dates for calendar range ────────────────────────────────────
function buildMarked(start: string | null, end: string | null) {
  if (!start) return {};
  const TEAL_DARK = '#0D9488';
  if (!end || end === start) {
    return { [start]: { startingDay:true, endingDay:true, color: TEAL_DARK, textColor:'#FFF' } };
  }
  const marked: Record<string, any> = {};
  let cur = new Date(start);
  const last = new Date(end);
  while (cur <= last) {
    const key = toYMD(cur);
    const isStart = key === start;
    const isEnd   = key === end;
    marked[key] = {
      startingDay: isStart,
      endingDay:   isEnd,
      color: isStart || isEnd ? TEAL_DARK : 'rgba(13,148,136,0.25)',
      textColor: '#FFF',
    };
    cur = addDays(cur, 1);
  }
  return marked;
}

// ─── Types ────────────────────────────────────────────────────────────────────
type SourceFilter = 'all' | 'walkin' | 'online' | 'emergency';
type Preset = 'Today' | '7 days' | '30 days' | 'All';

// ─── Status helpers ───────────────────────────────────────────────────────────
function statusLabel(s: string) {
  if (s === 'in_consult') return { label:'In Consult', color:'#2DD4BF', bg:'rgba(45,212,191,0.15)' };
  if (s === 'done')       return { label:'Consulted',  color:'#4ADE80', bg:'rgba(74,222,128,0.15)' };
  if (s === 'cancelled')  return { label:'Not Shown',  color:'#FCD34D', bg:'rgba(252,211,77,0.15)' };
  return                         { label:'Waiting',    color:'#A5B4FC', bg:'rgba(165,180,252,0.15)' };
}
function fmtDate(t: any) {
  const d = t.bookedAt?.seconds ? new Date(t.bookedAt.seconds * 1000) : null;
  if (!d) return '';
  return d.toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' });
}

// ─── Patient card ─────────────────────────────────────────────────────────────
function PatientCard({ tok }: { tok: any }) {
  const st     = statusLabel(tok.status);
  const isEmrg = tok.type === 'emergency';
  const tokenDisp = isEmrg
    ? `E${String(tok.tokenNumber).padStart(2, '0')}`
    : `#${String(tok.tokenNumber).padStart(2, '0')}`;

  const srcLabel = tok.source === 'walkin' ? 'Walk-in' : 'E-Token';
  const srcClr   = tok.source === 'walkin' ? '#2DD4BF' : '#A5B4FC';
  const srcBg    = tok.source === 'walkin' ? 'rgba(45,212,191,0.12)' : 'rgba(165,180,252,0.12)';
  const srcBd    = tok.source === 'walkin' ? 'rgba(45,212,191,0.28)' : 'rgba(165,180,252,0.28)';

  const priClr = isEmrg ? '#F87171' : '#4ADE80';
  const priBg  = isEmrg ? 'rgba(239,68,68,0.12)' : 'rgba(74,222,128,0.12)';
  const priBd  = isEmrg ? 'rgba(239,68,68,0.28)' : 'rgba(74,222,128,0.28)';

  const genderStr =
    tok.gender === 'M' || tok.gender === 'male'   ? 'Male'   :
    tok.gender === 'F' || tok.gender === 'female' ? 'Female' : tok.gender ?? '';
  const demo = [tok.age ? `${tok.age} yr` : '', genderStr].filter(Boolean).join(' · ');

  return (
    <TouchableOpacity
      style={[S.card, isEmrg && S.cardEmerg]}
      onPress={() => router.push(`/patients/${tok.id}`)}
      activeOpacity={0.75}
    >
      <View style={[S.tokenBlock, isEmrg && S.tokenBlockEmerg]}>
        <Text style={[S.tokenNum, isEmrg && { color:'#FCA5A5' }]}>{tokenDisp}</Text>
      </View>
      <View style={S.cardInfo}>
        <View style={S.cardRow}>
          <Text style={S.cardName} numberOfLines={1}>{tok.patientName ?? 'Unknown'}</Text>
          <View style={[S.badge, { backgroundColor:st.bg, borderWidth:0.5, borderColor:`${st.color}55` }]}>
            <Text style={[S.badgeTxt, { color:st.color }]}>{st.label}</Text>
          </View>
        </View>
        <View style={S.badgeRow}>
          {!!demo && <Text style={S.cardMeta}>{demo}</Text>}
          {!!demo && <Text style={S.cardMetaDot}>·</Text>}
          <View style={[S.pill, { backgroundColor:srcBg, borderColor:srcBd }]}>
            <Text style={[S.pillTxt, { color:srcClr }]}>{srcLabel}</Text>
          </View>
          <Text style={S.cardMetaDot}>·</Text>
          <View style={[S.pill, { backgroundColor:priBg, borderColor:priBd }]}>
            <Text style={[S.pillTxt, { color:priClr }]}>{isEmrg ? 'Emergency' : 'Normal'}</Text>
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
        {fmtDate(tok) ? <Text style={S.cardDate}>{fmtDate(tok)}</Text> : null}
      </View>
      <Text style={S.cardChevron}>›</Text>
    </TouchableOpacity>
  );
}

// ─── Calendar Modal ───────────────────────────────────────────────────────────
function CalendarModal({
  visible, onClose, startDate, endDate, onApply,
}: {
  visible: boolean;
  onClose: () => void;
  startDate: string | null;
  endDate: string | null;
  onApply: (s: string | null, e: string | null) => void;
}) {
  const today = toYMD(new Date());
  const [selStart, setSelStart] = useState<string | null>(startDate);
  const [selEnd,   setSelEnd]   = useState<string | null>(endDate);
  const [picking,  setPicking]  = useState<'start' | 'end'>('start');

  const PRESETS: { label: string; key: Preset }[] = [
    { label: 'Today',    key: 'Today' },
    { label: 'Last 7d',  key: '7 days' },
    { label: 'Last 30d', key: '30 days' },
    { label: 'All time', key: 'All' },
  ];

  function applyPreset(p: Preset) {
    const t = new Date();
    if (p === 'Today') {
      const s = toYMD(t);
      setSelStart(s); setSelEnd(s); setPicking('start');
    } else if (p === '7 days') {
      setSelStart(toYMD(addDays(t, -6))); setSelEnd(toYMD(t)); setPicking('start');
    } else if (p === '30 days') {
      setSelStart(toYMD(addDays(t, -29))); setSelEnd(toYMD(t)); setPicking('start');
    } else {
      setSelStart(null); setSelEnd(null); setPicking('start');
    }
  }

  function handleDayPress(day: { dateString: string }) {
    const d = day.dateString;
    if (picking === 'start') {
      setSelStart(d); setSelEnd(null); setPicking('end');
    } else {
      if (selStart && d < selStart) {
        setSelEnd(selStart); setSelStart(d);
      } else {
        setSelEnd(d);
      }
      setPicking('start');
    }
  }

  const marked = buildMarked(selStart, selEnd);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={CS.overlay}>
        <View style={CS.sheet}>
          {/* Header */}
          <View style={CS.sheetHdr}>
            <Text style={CS.sheetTitle}>Select Date Range</Text>
            <TouchableOpacity onPress={onClose} style={CS.closeBtn}>
              <Text style={CS.closeTxt}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Preset chips */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={CS.presetRow}>
            {PRESETS.map(p => (
              <TouchableOpacity key={p.key} style={CS.presetChip} onPress={() => applyPreset(p.key)}>
                <Text style={CS.presetTxt}>{p.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Picking hint */}
          <Text style={CS.hint}>
            {picking === 'start' ? '📅 Tap to set start date' : '📅 Tap to set end date'}
          </Text>

          {/* Selected range display */}
          {selStart && (
            <View style={CS.selectedRow}>
              <Text style={CS.selectedLabel}>From</Text>
              <Text style={CS.selectedVal}>{displayRange(selStart, null)}</Text>
              {selEnd && <Text style={CS.selectedLabel}>  →  To</Text>}
              {selEnd && <Text style={CS.selectedVal}>{displayRange(selEnd, null)}</Text>}
            </View>
          )}

          {/* Calendar */}
          <Calendar
            markingType="period"
            markedDates={marked}
            onDayPress={handleDayPress}
            maxDate={today}
            theme={{
              calendarBackground: 'transparent',
              textSectionTitleColor: 'rgba(255,255,255,0.35)',
              selectedDayBackgroundColor: '#0D9488',
              selectedDayTextColor: '#FFF',
              todayTextColor: '#2DD4BF',
              dayTextColor: '#FFF',
              textDisabledColor: 'rgba(255,255,255,0.2)',
              dotColor: '#0D9488',
              arrowColor: '#2DD4BF',
              monthTextColor: '#FFF',
              textMonthFontWeight: '800',
              textDayFontWeight: '600',
              textDayHeaderFontWeight: '700',
            }}
            style={CS.calendar}
          />

          {/* Buttons */}
          <View style={CS.btnRow}>
            <TouchableOpacity style={CS.clearBtn} onPress={() => { setSelStart(null); setSelEnd(null); setPicking('start'); }}>
              <Text style={CS.clearTxt}>Clear</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[CS.applyBtn, !selStart && CS.applyBtnDisabled]}
              onPress={() => { onApply(selStart, selEnd); onClose(); }}
            >
              <Text style={CS.applyTxt}>Apply Range</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function PatientsScreen() {
  const { doctor } = useDoctor();
  const docId = doctor?.id ?? '';

  const [search,    setSearch]    = useState('');
  const [srcFilt,   setSrcFilt]   = useState<SourceFilter>('all');
  const [calOpen,   setCalOpen]   = useState(false);
  const [rangeStart, setRangeStart] = useState<string | null>(null);
  const [rangeEnd,   setRangeEnd]   = useState<string | null>(null);

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['all-tokens', docId],
    queryFn: () => fetchAllTokens(docId),
    enabled: !!docId, staleTime: 0, refetchInterval: 15_000,
  });

  const tokens: any[] = data ?? [];

  // ── Filter by date range ──
  const rangeFiltered = useMemo(() => {
    if (!rangeStart) return tokens;
    const s = startOfDay(new Date(rangeStart));
    const e = endOfDay(new Date(rangeEnd ?? rangeStart));
    return tokens.filter(t => {
      const d = tokenBookedAt(t);
      return d >= s && d <= e;
    });
  }, [tokens, rangeStart, rangeEnd]);

  // ── Filter by source ──
  const sourceFiltered = useMemo(() => {
    if (srcFilt === 'all')       return rangeFiltered;
    if (srcFilt === 'emergency') return rangeFiltered.filter(t => t.type === 'emergency');
    if (srcFilt === 'walkin')    return rangeFiltered.filter(t => t.source === 'walkin' && t.type !== 'emergency');
    if (srcFilt === 'online')    return rangeFiltered.filter(t => t.source !== 'walkin' && t.type !== 'emergency');
    return rangeFiltered;
  }, [rangeFiltered, srcFilt]);

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
    [...filtered].sort((a, b) => (b.bookedAt?.seconds ?? 0) - (a.bookedAt?.seconds ?? 0)),
  [filtered]);

  // ── Stats (off rangeFiltered) ──
  const totalCount   = rangeFiltered.length;
  const walkinCount  = rangeFiltered.filter(t => t.source === 'walkin' && t.type !== 'emergency').length;
  const onlineCount  = rangeFiltered.filter(t => t.source !== 'walkin' && t.type !== 'emergency').length;
  const emergCount   = rangeFiltered.filter(t => t.type === 'emergency').length;
  const doneCount    = rangeFiltered.filter(t => t.status === 'done').length;

  const SRC_TABS: { key: SourceFilter; label: string; color: string; count: number }[] = [
    { key:'all',       label:'All',       color:'#A5B4FC', count: totalCount },
    { key:'walkin',    label:'Walk-in',   color:'#67E8F9', count: walkinCount },
    { key:'online',    label:'Online',    color:'#4ADE80', count: onlineCount },
    { key:'emergency', label:'Emergency', color:'#F87171', count: emergCount },
  ];

  const rangeLabel = displayRange(rangeStart, rangeEnd);

  return (
    <SafeAreaView style={S.safe} edges={['top']}>
      <View style={S.root}>
        <View style={S.glow1}/><View style={S.glow2}/>

        {/* ── HEADER ── */}
        <View style={S.hdr}>
          <TouchableOpacity onPress={() => router.back()} style={S.back}>
            <Text style={S.backTxt}>‹</Text>
          </TouchableOpacity>
          <View style={{ flex:1 }}>
            <Text style={S.hdrTitle}>My Patients</Text>
            <Text style={S.hdrSub}>{totalCount} patient{totalCount !== 1 ? 's' : ''} · {rangeLabel}</Text>
          </View>
          {isRefetching && <ActivityIndicator size="small" color={TEAL} />}
        </View>

        {/* ── SEARCH BAR ── */}
        <View style={S.searchWrap}>
          <Text style={S.searchIcon}>🔍</Text>
          <TextInput
            style={S.searchInput}
            placeholder="Search by name or phone…"
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

        {/* ── DATE RANGE PICKER BUTTON ── */}
        <TouchableOpacity style={S.rangeBtn} onPress={() => setCalOpen(true)} activeOpacity={0.75}>
          <Text style={S.rangeIcon}>📅</Text>
          <View style={{ flex:1 }}>
            <Text style={S.rangeBtnLabel}>Date Range</Text>
            <Text style={S.rangeBtnValue}>{rangeLabel}</Text>
          </View>
          {rangeStart && (
            <TouchableOpacity
              onPress={() => { setRangeStart(null); setRangeEnd(null); }}
              style={S.rangeClearBtn}
              hitSlop={{ top:10, bottom:10, left:10, right:10 }}
            >
              <Text style={S.rangeClearTxt}>Clear ✕</Text>
            </TouchableOpacity>
          )}
          <Text style={S.rangeChevron}>›</Text>
        </TouchableOpacity>

        {isLoading ? (
          <View style={S.loadWrap}>
            <ActivityIndicator color={TEAL} size="large"/>
            <Text style={S.loadTxt}>Loading patient history…</Text>
          </View>
        ) : (
          <ScrollView
            showsVerticalScrollIndicator={false}
            refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={TEAL}/>}
            contentContainerStyle={{ paddingBottom:100 }}
          >
            <View style={S.inner}>

              {/* ── STATS ── */}
              <View style={S.statsRow}>
                {[
                  { label:'Total',     val:totalCount,  color:'#A5B4FC' },
                  { label:'Walk-in',   val:walkinCount, color:'#67E8F9' },
                  { label:'Online',    val:onlineCount, color:'#4ADE80' },
                  { label:'Emergency', val:emergCount,  color:'#F87171' },
                  { label:'Consulted', val:doneCount,   color:'#FCD34D' },
                ].map((s, i, arr) => (
                  <View key={s.label} style={[S.statCell, i < arr.length-1 && S.statBorder]}>
                    <Text style={[S.statVal, { color:s.color }]}>{s.val}</Text>
                    <Text style={S.statLbl}>{s.label}</Text>
                  </View>
                ))}
              </View>

              {/* ── SOURCE FILTER ── */}
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={S.srcRow}>
                {SRC_TABS.map(st => (
                  <TouchableOpacity
                    key={st.key}
                    style={[S.srcPill, srcFilt===st.key && { backgroundColor:`${st.color}22`, borderColor:`${st.color}55` }]}
                    onPress={() => setSrcFilt(st.key)}
                  >
                    <Text style={[S.srcPillTxt, srcFilt===st.key && { color:st.color }]}>
                      {st.label}{st.count > 0 ? ` (${st.count})` : ''}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* ── RESULTS COUNT ── */}
              <View style={S.resultsRow}>
                <Text style={S.resultsTxt}>
                  {sorted.length} result{sorted.length !== 1 ? 's' : ''}{search ? ` for "${search}"` : ''}
                </Text>
              </View>

              {/* ── LIST ── */}
              {sorted.length === 0 ? (
                <View style={S.empty}>
                  <Text style={S.emptyIcon}>{search ? '🔍' : '📋'}</Text>
                  <Text style={S.emptyTxt}>
                    {search ? `No patients matching "${search}"` : 'No patients in this date range'}
                  </Text>
                  {search ? (
                    <TouchableOpacity onPress={() => setSearch('')} style={S.clearBtn}>
                      <Text style={S.clearBtnTxt}>Clear search</Text>
                    </TouchableOpacity>
                  ) : rangeStart ? (
                    <TouchableOpacity onPress={() => { setRangeStart(null); setRangeEnd(null); }} style={S.clearBtn}>
                      <Text style={S.clearBtnTxt}>Show all time</Text>
                    </TouchableOpacity>
                  ) : null}
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

      {/* ── CALENDAR MODAL ── */}
      <CalendarModal
        visible={calOpen}
        onClose={() => setCalOpen(false)}
        startDate={rangeStart}
        endDate={rangeEnd}
        onApply={(s, e) => { setRangeStart(s); setRangeEnd(e); }}
      />
    </SafeAreaView>
  );
}

// ─── Main Styles ──────────────────────────────────────────────────────────────
const S = StyleSheet.create({
  safe:  { flex:1, backgroundColor:BG, ...(isWeb && { paddingTop:44 }) },
  root:  { flex:1, backgroundColor:BG },
  glow1: { position:'absolute', top:-60, left:-60, width:200, height:200, borderRadius:100, backgroundColor:'rgba(99,102,241,0.2)' },
  glow2: { position:'absolute', top:320, right:-60, width:160, height:160, borderRadius:80, backgroundColor:'rgba(13,148,136,0.14)' },
  inner: { paddingHorizontal:16, gap:10 },

  hdr:     { flexDirection:'row', alignItems:'center', gap:12, paddingHorizontal:16, paddingTop:12, paddingBottom:8 },
  back:    { width:36, height:36, borderRadius:12, backgroundColor:'rgba(255,255,255,0.06)', borderWidth:1, borderColor:'rgba(255,255,255,0.1)', alignItems:'center', justifyContent:'center' },
  backTxt: { fontSize:22, color:'#FFF', fontWeight:'300', lineHeight:28 },
  hdrTitle:{ fontSize:17, fontWeight:'900', color:'#FFF', letterSpacing:-0.3 },
  hdrSub:  { fontSize:10, color:'rgba(255,255,255,0.35)', fontWeight:'600', marginTop:1 },

  searchWrap:    { flexDirection:'row', alignItems:'center', marginHorizontal:16, marginBottom:8, height:44, borderRadius:14, backgroundColor:'rgba(255,255,255,0.06)', borderWidth:1, borderColor:'rgba(255,255,255,0.1)', paddingHorizontal:12, gap:8 },
  searchIcon:    { fontSize:14, opacity:0.5 },
  searchInput:   { flex:1, fontSize:13, color:'#FFF', fontWeight:'600' },
  searchClear:   { padding:4 },
  searchClearTxt:{ fontSize:11, color:'rgba(255,255,255,0.3)', fontWeight:'700' },

  rangeBtn:       { flexDirection:'row', alignItems:'center', marginHorizontal:16, marginBottom:10, paddingHorizontal:14, paddingVertical:12, borderRadius:14, backgroundColor:'rgba(13,148,136,0.12)', borderWidth:1.5, borderColor:'rgba(45,212,191,0.3)', gap:10 },
  rangeIcon:      { fontSize:18 },
  rangeBtnLabel:  { fontSize:10, fontWeight:'800', color:'rgba(255,255,255,0.4)', textTransform:'uppercase', letterSpacing:0.5 },
  rangeBtnValue:  { fontSize:13, fontWeight:'800', color:'#2DD4BF', marginTop:1 },
  rangeClearBtn:  { paddingHorizontal:10, paddingVertical:5, borderRadius:8, backgroundColor:'rgba(239,68,68,0.15)', borderWidth:1, borderColor:'rgba(239,68,68,0.3)' },
  rangeClearTxt:  { fontSize:10, fontWeight:'800', color:'#F87171' },
  rangeChevron:   { fontSize:20, color:'rgba(45,212,191,0.5)', fontWeight:'300' },

  loadWrap: { flex:1, alignItems:'center', justifyContent:'center', gap:12 },
  loadTxt:  { fontSize:12, color:'rgba(255,255,255,0.3)', fontWeight:'600' },

  statsRow:   { flexDirection:'row', borderRadius:16, overflow:'hidden', backgroundColor:'rgba(255,255,255,0.04)', borderWidth:1, borderColor:'rgba(255,255,255,0.07)' },
  statCell:   { flex:1, alignItems:'center', paddingVertical:10 },
  statBorder: { borderRightWidth:1, borderRightColor:'rgba(255,255,255,0.06)' },
  statVal:    { fontSize:18, fontWeight:'900', letterSpacing:-0.5 },
  statLbl:    { fontSize:8, fontWeight:'700', color:'rgba(255,255,255,0.28)', textTransform:'uppercase', letterSpacing:0.3, marginTop:1 },

  srcRow:     { paddingHorizontal:0, gap:6, paddingBottom:2 },
  srcPill:    { paddingHorizontal:14, paddingVertical:8, borderRadius:20, backgroundColor:'rgba(255,255,255,0.05)', borderWidth:1.5, borderColor:'rgba(255,255,255,0.1)' },
  srcPillTxt: { fontSize:11, fontWeight:'800', color:'rgba(255,255,255,0.35)' },

  resultsRow: { flexDirection:'row', alignItems:'center' },
  resultsTxt: { fontSize:10, color:'rgba(255,255,255,0.25)', fontWeight:'700', textTransform:'uppercase', letterSpacing:0.5 },

  empty:       { alignItems:'center', paddingVertical:56, gap:8 },
  emptyIcon:   { fontSize:38 },
  emptyTxt:    { fontSize:13, color:'rgba(255,255,255,0.25)', fontWeight:'600', textAlign:'center' },
  clearBtn:    { marginTop:8, paddingHorizontal:18, paddingVertical:8, borderRadius:12, backgroundColor:'rgba(99,102,241,0.2)', borderWidth:1, borderColor:'rgba(99,102,241,0.4)' },
  clearBtnTxt: { fontSize:12, fontWeight:'800', color:'#A5B4FC' },
  list:        { gap:8 },

  card:           { flexDirection:'row', alignItems:'center', gap:10, paddingHorizontal:12, paddingVertical:11, borderRadius:16, backgroundColor:'rgba(255,255,255,0.04)', borderWidth:1.5, borderColor:'rgba(255,255,255,0.08)' },
  cardEmerg:      { backgroundColor:'rgba(239,68,68,0.07)', borderColor:'rgba(239,68,68,0.28)' },
  tokenBlock:     { width:52, height:52, alignItems:'center', justifyContent:'center', borderRadius:13, backgroundColor:'rgba(13,148,136,0.2)', borderWidth:1.5, borderColor:'rgba(45,212,191,0.35)', flexShrink:0 },
  tokenBlockEmerg:{ backgroundColor:'rgba(239,68,68,0.22)', borderColor:'rgba(239,68,68,0.45)' },
  tokenNum:       { fontSize:14, fontWeight:'900', color:'#FFF', letterSpacing:-0.3 },
  cardInfo:       { flex:1, gap:4, minWidth:0 },
  cardRow:        { flexDirection:'row', alignItems:'center', gap:8, justifyContent:'space-between' },
  cardName:       { fontSize:13, fontWeight:'800', color:'#FFF', flex:1, minWidth:0 },
  badgeRow:       { flexDirection:'row', alignItems:'center', gap:4, flexWrap:'wrap' },
  badge:          { paddingHorizontal:8, paddingVertical:3, borderRadius:20 },
  badgeTxt:       { fontSize:9, fontWeight:'800' },
  cardMeta:       { fontSize:10, color:'rgba(255,255,255,0.4)', fontWeight:'600' },
  cardMetaDot:    { fontSize:10, color:'rgba(255,255,255,0.2)', fontWeight:'600' },
  pill:           { paddingHorizontal:6, paddingVertical:2, borderRadius:6, borderWidth:1 },
  pillTxt:        { fontSize:9, fontWeight:'800' },
  cardDate:       { fontSize:9, color:'rgba(255,255,255,0.25)', fontWeight:'600', marginTop:1 },
  cardChevron:    { fontSize:20, color:'rgba(255,255,255,0.18)', fontWeight:'300', alignSelf:'center' },
});

// ─── Calendar Modal Styles ────────────────────────────────────────────────────
const CS = StyleSheet.create({
  overlay:  { flex:1, backgroundColor:'rgba(0,0,0,0.7)', justifyContent:'flex-end' },
  sheet:    { backgroundColor:'#0F1117', borderTopLeftRadius:24, borderTopRightRadius:24, paddingBottom:34, borderWidth:1, borderColor:'rgba(255,255,255,0.08)' },
  sheetHdr: { flexDirection:'row', alignItems:'center', justifyContent:'space-between', paddingHorizontal:20, paddingVertical:16, borderBottomWidth:1, borderBottomColor:'rgba(255,255,255,0.07)' },
  sheetTitle:{ fontSize:15, fontWeight:'900', color:'#FFF', letterSpacing:-0.3 },
  closeBtn: { width:30, height:30, borderRadius:10, backgroundColor:'rgba(255,255,255,0.08)', alignItems:'center', justifyContent:'center' },
  closeTxt: { fontSize:11, color:'rgba(255,255,255,0.5)', fontWeight:'700' },

  presetRow: { paddingHorizontal:16, paddingVertical:12, gap:8 },
  presetChip:{ paddingHorizontal:14, paddingVertical:8, borderRadius:20, backgroundColor:'rgba(13,148,136,0.18)', borderWidth:1.5, borderColor:'rgba(45,212,191,0.3)' },
  presetTxt: { fontSize:12, fontWeight:'800', color:'#2DD4BF' },

  hint: { textAlign:'center', fontSize:11, color:'rgba(255,255,255,0.3)', fontWeight:'700', marginBottom:4 },

  selectedRow:   { flexDirection:'row', alignItems:'center', justifyContent:'center', gap:8, paddingHorizontal:16, paddingBottom:8 },
  selectedLabel: { fontSize:10, color:'rgba(255,255,255,0.35)', fontWeight:'700', textTransform:'uppercase' },
  selectedVal:   { fontSize:13, fontWeight:'900', color:'#2DD4BF' },

  calendar: { marginHorizontal:8 },

  btnRow:    { flexDirection:'row', gap:12, marginTop:12, paddingHorizontal:20 },
  clearBtn:  { flex:1, height:46, borderRadius:14, alignItems:'center', justifyContent:'center', backgroundColor:'rgba(255,255,255,0.06)', borderWidth:1, borderColor:'rgba(255,255,255,0.1)' },
  clearTxt:  { fontSize:13, fontWeight:'800', color:'rgba(255,255,255,0.4)' },
  applyBtn:  { flex:2, height:46, borderRadius:14, alignItems:'center', justifyContent:'center', backgroundColor:'#0D9488' },
  applyBtnDisabled: { opacity:0.4 },
  applyTxt:  { fontSize:13, fontWeight:'900', color:'#FFF' },
});
