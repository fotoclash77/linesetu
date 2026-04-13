import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  ActivityIndicator, RefreshControl, Platform, Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { BG, TEAL, TEAL_LT } from '../../constants/theme';
import { useDoctor } from '../../contexts/DoctorContext';

const isWeb = Platform.OS === 'web';

// ─── API ────────────────────────────────────────────────────────
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
async function apiCall(id: string)   { await fetch(`${BASE()}/api/tokens/${id}/call`,   { method:'PATCH' }); }
async function apiDone(id: string)   { await fetch(`${BASE()}/api/tokens/${id}/done`,   { method:'PATCH' }); }
async function apiCancel(id: string) { await fetch(`${BASE()}/api/tokens/${id}/cancel`, { method:'PATCH' }); }

// ─── Types ───────────────────────────────────────────────────────
type DisplayStatus = 'consulting' | 'waiting' | 'done' | 'skipped';
type TabKey = 'queue' | 'emergency' | 'notshown' | 'done';

interface Token {
  id: string; tokenNumber: number; patientName: string; patientPhone: string;
  type: 'normal' | 'emergency'; source: string; status: string;
  displayStatus: DisplayStatus; shift: string; calledAt?: any;
}

function mapToken(t: any): Token {
  return {
    id: t.id, tokenNumber: t.tokenNumber ?? 0,
    patientName: t.patientName ?? 'Unknown',
    patientPhone: t.patientPhone ?? '',
    type: t.type === 'emergency' ? 'emergency' : 'normal',
    source: t.source ?? 'online',
    status: t.status,
    displayStatus:
      t.status === 'in_consult' ? 'consulting' :
      t.status === 'done'       ? 'done'       :
      t.status === 'cancelled'  ? 'skipped'    : 'waiting',
    shift: t.shift ?? 'morning', calledAt: t.calledAt,
  };
}

function typeCfg(tok: Token) {
  if (tok.type === 'emergency') return { color:'#F87171', bg:'rgba(239,68,68,0.18)',  label:'Emergency', dot:'#F87171' };
  if (tok.source === 'walkin') return  { color:'#67E8F9', bg:'rgba(6,182,212,0.18)',  label:'Walk-in',   dot:'#67E8F9' };
  return                               { color:'#4ADE80', bg:'rgba(34,197,94,0.18)',  label:'Online',    dot:'#4ADE80' };
}

// ─── Pulsing dot ─────────────────────────────────────────────────
function PulseDot({ color, size = 7 }: { color: string; size?: number }) {
  const s = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    const a = Animated.loop(Animated.sequence([
      Animated.timing(s, { toValue:1.6, duration:700, useNativeDriver:true }),
      Animated.timing(s, { toValue:1,   duration:700, useNativeDriver:true }),
    ]));
    a.start(); return () => a.stop();
  }, []);
  return <Animated.View style={{ width:size, height:size, borderRadius:size/2, backgroundColor:color, transform:[{scale:s}] }} />;
}

// ─── Elapsed timer ───────────────────────────────────────────────
function useElapsed(calledAt: any) {
  const [t, setT] = useState('');
  useEffect(() => {
    const ms = calledAt?.seconds ? calledAt.seconds*1000 : null;
    if (!ms) { setT(''); return; }
    const upd = () => { const m = Math.floor((Date.now()-ms)/60000); setT(m<1?'< 1 min':`${m} min`); };
    upd(); const id = setInterval(upd, 30000); return () => clearInterval(id);
  }, [calledAt]);
  return t;
}

// ─── CONSULTING CARD (large teal gradient, matches mockup) ───────
function ConsultingCard({ tok, onNotShown, onDone, busy }: {
  tok: Token; onNotShown:()=>void; onDone:()=>void; busy:boolean;
}) {
  const tc = typeCfg(tok);
  const elapsed = useElapsed(tok.calledAt);
  return (
    <View style={S.cc}>
      <View style={S.ccGlow1}/><View style={S.ccGlow2}/>
      {/* Top badges row */}
      <View style={S.ccTopRow}>
        <View style={S.ccLiveBadge}>
          <PulseDot color="#4ADE80" size={6}/>
          <Text style={S.ccLiveText}>CURRENTLY CONSULTING</Text>
        </View>
        {!!elapsed && (
          <View style={S.ccTimerBadge}>
            <Text style={S.ccTimerText}>⏱ {elapsed}</Text>
          </View>
        )}
      </View>
      {/* Hero: token block + name */}
      <View style={S.ccHero}>
        <View style={S.ccTokenBlock}>
          <Text style={S.ccTokenLabel}>TOKEN</Text>
          <Text style={S.ccTokenNum}>#{tok.tokenNumber}</Text>
        </View>
        <View style={{flex:1}}>
          <Text style={S.ccName} numberOfLines={1}>{tok.patientName}</Text>
          <View style={S.ccBadges}>
            <View style={[S.pill, {backgroundColor:tc.bg}]}>
              <View style={{width:5,height:5,borderRadius:3,backgroundColor:tc.dot,marginRight:3}}/>
              <Text style={[S.pillTxt,{color:tc.color}]}>{tc.label.toUpperCase()}</Text>
            </View>
          </View>
        </View>
      </View>
      {/* Detail grid */}
      <View style={S.ccGrid}>
        <View style={S.ccGridCell}>
          <View style={[S.ccGridIcon,{backgroundColor:'rgba(45,212,191,0.18)'}]}>
            <Text style={{fontSize:11}}>📞</Text>
          </View>
          <View>
            <Text style={S.ccGridLabel}>PHONE</Text>
            <Text style={S.ccGridValue}>{tok.patientPhone || '—'}</Text>
          </View>
        </View>
        <View style={S.ccGridCell}>
          <View style={[S.ccGridIcon,{backgroundColor:'rgba(99,102,241,0.18)'}]}>
            <Text style={{fontSize:11}}>📍</Text>
          </View>
          <View>
            <Text style={S.ccGridLabel}>SOURCE</Text>
            <Text style={[S.ccGridValue,{color:tc.color}]}>{tc.label}</Text>
          </View>
        </View>
      </View>
      {/* Action buttons */}
      <View style={S.ccBtnRow}>
        <TouchableOpacity style={[S.ccNotShown, busy&&{opacity:.5}]} onPress={onNotShown} disabled={busy}>
          {busy ? <ActivityIndicator color="#FCD34D" size="small"/> : <Text style={S.ccNotShownTxt}>✕  Not Shown</Text>}
        </TouchableOpacity>
        <TouchableOpacity style={[S.ccDone, busy&&{opacity:.5}]} onPress={onDone} disabled={busy}>
          {busy ? <ActivityIndicator color="#FFF" size="small"/> : <Text style={S.ccDoneTxt}>✓  Done</Text>}
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── NEXT PATIENT CARD (amber, always shown below consulting) ────
function NextCard({ tok, onCall, busy }: { tok:Token; onCall:()=>void; busy:boolean }) {
  const tc = typeCfg(tok);
  const isEmerg = tok.type === 'emergency';
  const borderC = isEmerg ? 'rgba(239,68,68,0.4)'  : 'rgba(245,158,11,0.42)';
  const bgC     = isEmerg ? 'rgba(239,68,68,0.13)' : 'rgba(245,158,11,0.11)';
  const lblC    = isEmerg ? '#F87171' : '#FCD34D';
  return (
    <TouchableOpacity style={[S.nc, {backgroundColor:bgC, borderColor:borderC}]} onPress={onCall} disabled={busy} activeOpacity={0.75}>
      <View style={S.ncInner}>
        {/* Token block */}
        <View style={[S.ncToken, {backgroundColor: isEmerg?'rgba(239,68,68,0.28)':'rgba(245,158,11,0.24)', borderColor:isEmerg?'rgba(239,68,68,0.55)':'rgba(245,158,11,0.55)'}]}>
          <Text style={[S.ncTokenLabel,{color:lblC}]}>NEXT</Text>
          <Text style={S.ncTokenNum}>#{tok.tokenNumber}</Text>
        </View>
        {/* Info */}
        <View style={{flex:1,minWidth:0}}>
          <Text style={S.ncName} numberOfLines={1}>{tok.patientName}</Text>
          <View style={S.ncBadgeRow}>
            <View style={[S.pill,{backgroundColor: isEmerg?'rgba(239,68,68,0.2)':'rgba(99,102,241,0.2)'}]}>
              <View style={{width:5,height:5,borderRadius:3,backgroundColor: isEmerg?'#F87171':'#A5B4FC',marginRight:3}}/>
              <Text style={[S.pillTxt,{color: isEmerg?'#F87171':'#A5B4FC'}]}>{isEmerg?'EMERGENCY':'NORMAL'}</Text>
            </View>
            <View style={[S.pill,{backgroundColor:tc.bg}]}>
              <Text style={[S.pillTxt,{color:tc.color}]}>{tc.label.toUpperCase()}</Text>
            </View>
          </View>
          {!!tok.patientPhone && (
            <View style={[S.ncFooter, {borderTopColor: isEmerg?'rgba(239,68,68,0.18)':'rgba(245,158,11,0.18)'}]}>
              <Text style={S.ncFooterTxt}>📞 {tok.patientPhone}</Text>
            </View>
          )}
        </View>
        {/* Chevron / loading */}
        {busy
          ? <ActivityIndicator color={lblC} size="small"/>
          : <Text style={[S.ncChevron,{color:lblC}]}>›</Text>}
      </View>
    </TouchableOpacity>
  );
}

// ─── QUEUE ROW CARD (waiting patients) ──────────────────────────
function QCard({ tok, onSendAlert, onNotShown, busy }: {
  tok:Token; onSendAlert:()=>void; onNotShown:()=>void; busy:boolean;
}) {
  const tc = typeCfg(tok);
  const isEmerg = tok.type === 'emergency';
  return (
    <View style={[S.qc, isEmerg&&S.qcEmerg]}>
      {/* Top row */}
      <View style={S.qcTop}>
        <View style={[S.qcToken, isEmerg&&S.qcTokenEmerg]}>
          <Text style={S.qcTokenTxt}>#{tok.tokenNumber}</Text>
        </View>
        <View style={{flex:1,minWidth:0}}>
          <Text style={S.qcName} numberOfLines={1}>{tok.patientName}</Text>
          <View style={S.qcBadgeRow}>
            <View style={[S.pill,{backgroundColor:tc.bg}]}>
              <View style={{width:5,height:5,borderRadius:3,backgroundColor:tc.dot,marginRight:3}}/>
              <Text style={[S.pillTxt,{color:tc.color}]}>{tc.label.toUpperCase()}</Text>
            </View>
            {isEmerg && (
              <View style={[S.pill,{backgroundColor:'rgba(239,68,68,0.15)'}]}>
                <Text style={[S.pillTxt,{color:'#F87171'}]}>⚡ PRIORITY</Text>
              </View>
            )}
          </View>
          {!!tok.patientPhone && <Text style={S.qcPhone}>📞 {tok.patientPhone}</Text>}
        </View>
        {/* WAITING badge (top right) */}
        <View style={S.waitingBadge}>
          <Text style={S.waitingBadgeTxt}>WAITING</Text>
        </View>
      </View>
      {/* Action buttons */}
      <View style={S.qcBtns}>
        <TouchableOpacity style={[S.qcSendAlert, busy&&{opacity:.5}]} onPress={onSendAlert} disabled={busy}>
          {busy ? <ActivityIndicator color="#A5B4FC" size="small"/> : <Text style={S.qcSendAlertTxt}>⊙  Send Alert</Text>}
        </TouchableOpacity>
        <TouchableOpacity style={[S.qcNotShown, busy&&{opacity:.5}]} onPress={onNotShown} disabled={busy}>
          <Text style={S.qcNotShownTxt}>⊗  Not Shown</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── PAST CARD (done / skipped) ──────────────────────────────────
function PastCard({ tok }: { tok:Token }) {
  const tc = typeCfg(tok);
  const isDone = tok.displayStatus === 'done';
  return (
    <View style={[S.qc,{opacity:.55}]}>
      <View style={S.qcTop}>
        <View style={[S.qcToken,{backgroundColor:isDone?'rgba(34,197,94,0.14)':'rgba(245,158,11,0.12)',borderColor:isDone?'rgba(34,197,94,0.28)':'rgba(245,158,11,0.28)'}]}>
          <Text style={S.qcTokenTxt}>#{tok.tokenNumber}</Text>
        </View>
        <View style={{flex:1}}>
          <Text style={[S.qcName,{color:'rgba(255,255,255,0.45)'}]} numberOfLines={1}>{tok.patientName}</Text>
          <View style={S.qcBadgeRow}>
            <View style={[S.pill,{backgroundColor:tc.bg}]}>
              <Text style={[S.pillTxt,{color:tc.color}]}>{tc.label.toUpperCase()}</Text>
            </View>
            <View style={[S.pill,{backgroundColor:isDone?'rgba(34,197,94,0.14)':'rgba(245,158,11,0.12)'}]}>
              <Text style={[S.pillTxt,{color:isDone?'#4ADE80':'#FCD34D'}]}>{isDone?'✓ CONSULTED':'↷ NOT SHOWN'}</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

// ─── MAIN SCREEN ─────────────────────────────────────────────────
export default function QueueScreen() {
  const { doctor } = useDoctor();
  const qc = useQueryClient();
  const [tab,    setTab]    = useState<TabKey>('queue');
  const [shift,  setShift]  = useState<'morning'|'evening'>('morning');
  const [paused, setPaused] = useState(false);
  const [busyId, setBusy]   = useState<string|null>(null);
  const docId = doctor?.id ?? '';

  const { data: qData, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['dq', docId, shift],
    queryFn: () => apiFetchQueue(docId, shift),
    enabled: !!docId, refetchInterval: 5000, staleTime: 0,
  });
  const { data: aData } = useQuery({
    queryKey: ['da', docId],
    queryFn: () => apiFetchAll(docId),
    enabled: !!docId, refetchInterval: 8000, staleTime: 0,
  });

  const inv = useCallback(() => {
    qc.invalidateQueries({ queryKey: ['dq', docId] });
    qc.invalidateQueries({ queryKey: ['da', docId] });
  }, [qc, docId]);

  const doCall = async (id: string) => {
    setBusy(id); try { await apiCall(id); inv(); } catch {} setBusy(null);
  };
  const doDone = async (id: string) => {
    setBusy(id);
    try {
      await apiDone(id); inv();
      await new Promise(r => setTimeout(r, 600));
      const fresh = await apiFetchQueue(docId, shift);
      const nxt = (fresh.tokens ?? [])
        .filter((t:any) => t.status === 'waiting')
        .sort((a:any, b:any) => {
          if (a.type==='emergency' && b.type!=='emergency') return -1;
          if (b.type==='emergency' && a.type!=='emergency') return 1;
          return (a.tokenNumber??0) - (b.tokenNumber??0);
        })[0];
      if (nxt) { await apiCall(nxt.id); inv(); }
    } catch {}
    setBusy(null);
  };
  const doCancel = async (id: string) => {
    setBusy(id); try { await apiCancel(id); inv(); } catch {} setBusy(null);
  };

  // ── Process ──
  const live: Token[] = (qData?.tokens ?? []).map(mapToken);
  const current = live.find(t => t.displayStatus === 'consulting');
  const waitSorted = live.filter(t => t.displayStatus === 'waiting').sort((a,b) => {
    if (a.type==='emergency' && b.type!=='emergency') return -1;
    if (b.type==='emergency' && a.type!=='emergency') return 1;
    return a.tokenNumber - b.tokenNumber;
  });
  const nextTok  = waitSorted[0];         // the "Next" patient card
  const queueRest = waitSorted.slice(1);  // rest shown in queue tab
  const emergList = waitSorted.filter(t => t.type === 'emergency');

  const all: Token[] = (aData?.tokens ?? []).map(mapToken);
  const doneList    = all.filter(t => t.displayStatus === 'done').sort((a,b)=>b.tokenNumber-a.tokenNumber);
  const skippedList = all.filter(t => t.displayStatus === 'skipped').sort((a,b)=>b.tokenNumber-a.tokenNumber);
  const totalAll    = all.length;

  const TABS = [
    { key:'queue',    icon:'👥', label:'Queue',   count: waitSorted.length, activeColor:TEAL_LT,  activeBg:'rgba(13,148,136,0.28)',  dot:false },
    { key:'emergency',icon:'⚡', label:'Emerg',   count: emergList.length,  activeColor:'#F87171', activeBg:'rgba(239,68,68,0.22)',   dot: emergList.length > 0 },
    { key:'notshown', icon:'✕',  label:'Skipped', count:skippedList.length, activeColor:'#FCD34D', activeBg:'rgba(245,158,11,0.2)',   dot:false },
    { key:'done',     icon:'✓',  label:'Done',    count: doneList.length,   activeColor:'#4ADE80', activeBg:'rgba(34,197,94,0.18)',   dot:false },
  ] as const;

  return (
    <SafeAreaView style={S.safe} edges={['top']}>
      <View style={S.root}>
        <View style={S.glowTL}/><View style={S.glowBR}/>

        {/* ── HEADER ── */}
        <View style={S.hdr}>
          <View style={{flexDirection:'row',alignItems:'center',gap:6}}>
            <PulseDot color="#4ADE80" size={8}/>
            <Text style={S.hdrTitle}>Master Queue</Text>
            {isRefetching && <ActivityIndicator size="small" color="rgba(255,255,255,0.25)" style={{marginLeft:2}}/>}
          </View>
          <View style={{flexDirection:'row',alignItems:'center',gap:8}}>
            <Text style={S.hdrDoc}>⚕ {doctor?.name ?? 'Dr. Sharma'}</Text>
            <TouchableOpacity
              style={[S.shiftBtn, shift==='morning' ? S.shiftMorn : S.shiftEve]}
              onPress={()=>setShift(s=>s==='morning'?'evening':'morning')}
            >
              <Text style={[S.shiftTxt,{color:shift==='morning'?'#FCD34D':'#C4B5FD'}]}>
                {shift==='morning'?'☀ Morning':'☾ Evening'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {isLoading ? (
          <View style={{flex:1,alignItems:'center',justifyContent:'center'}}>
            <ActivityIndicator color={TEAL} size="large"/>
            <Text style={{color:'rgba(255,255,255,0.3)',marginTop:12,fontSize:13}}>Loading queue…</Text>
          </View>
        ) : (
          <ScrollView
            showsVerticalScrollIndicator={false}
            refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={TEAL}/>}
            contentContainerStyle={{paddingBottom:110}}
          >
            <View style={S.inner}>

              {/* ── CURRENTLY CONSULTING ── */}
              {current ? (
                <ConsultingCard
                  tok={current}
                  onNotShown={()=>doCancel(current.id)}
                  onDone={()=>doDone(current.id)}
                  busy={busyId===current.id}
                />
              ) : (
                <View style={S.noConsulting}>
                  <View style={S.ccLiveBadge}>
                    <View style={{width:6,height:6,borderRadius:3,backgroundColor:'rgba(255,255,255,0.2)'}}/>
                    <Text style={[S.ccLiveText,{color:'rgba(255,255,255,0.28)'}]}>NO PATIENT IN CONSULTATION</Text>
                  </View>
                  <Text style={S.noConsultingHint}>
                    {nextTok ? 'Tap the Next Patient card below to call them in' : 'No patients waiting in this shift'}
                  </Text>
                </View>
              )}

              {/* ── NEXT PATIENT (always visible when waiting) ── */}
              {nextTok && (
                <NextCard tok={nextTok} onCall={()=>doCall(nextTok.id)} busy={busyId===nextTok.id}/>
              )}

              {/* ── STATS ROW ── */}
              <View style={S.stats}>
                {[
                  {label:'TOTAL',   val:totalAll,         color:'#A5B4FC'},
                  {label:'WAITING', val:waitSorted.length, color:'#FCD34D'},
                  {label:'DONE',    val:doneList.length,   color:'#4ADE80'},
                  {label:'SKIPPED', val:skippedList.length,color:'#F87171'},
                ].map((s,i) => (
                  <View key={s.label} style={[S.statCell, i<3&&S.statBorder]}>
                    <Text style={[S.statVal,{color:s.color}]}>{s.val}</Text>
                    <Text style={S.statLbl}>{s.label}</Text>
                  </View>
                ))}
              </View>

              {/* ── PAUSE / RESUME ── */}
              <TouchableOpacity
                style={[S.pauseBtn, paused&&S.pauseBtnOn]}
                onPress={()=>setPaused(p=>!p)}
              >
                <Text style={[S.pauseTxt,{color:paused?'#4ADE80':'#FCD34D'}]}>
                  {paused ? '▶  Resume Queue' : '⏸  Pause Queue'}
                </Text>
              </TouchableOpacity>

              {/* ── 4 TABS ── */}
              <View style={S.tabBar}>
                {TABS.map(t=>{
                  const active = tab === t.key;
                  return (
                    <TouchableOpacity
                      key={t.key}
                      style={[S.tabItem, active&&{backgroundColor:t.activeBg}]}
                      onPress={()=>setTab(t.key)}
                    >
                      {t.dot && !active && <View style={S.tabDot}/>}
                      <Text style={{fontSize:12,color:active?t.activeColor:'rgba(255,255,255,0.35)'}}>{t.icon}</Text>
                      <Text style={[S.tabTxt,active&&{color:'#FFF',fontWeight:'800'}]}>
                        {t.label}{t.count>0?` (${t.count})`:''}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* ── QUEUE TAB: waiting patients (excluding nextTok) ── */}
              {tab==='queue' && (
                <View style={S.list}>
                  {queueRest.length===0 ? (
                    <View style={S.empty}>
                      <Text style={S.emptyIcon}>{current||nextTok?'⏳':'🎉'}</Text>
                      <Text style={S.emptyTxt}>
                        {current||nextTok ? 'No more patients waiting' : 'Queue is empty for this shift'}
                      </Text>
                    </View>
                  ) : (
                    queueRest.map(t=>(
                      <QCard
                        key={t.id} tok={t}
                        busy={busyId===t.id}
                        onSendAlert={()=>doCall(t.id)}
                        onNotShown={()=>doCancel(t.id)}
                      />
                    ))
                  )}
                </View>
              )}

              {/* ── EMERGENCY TAB ── */}
              {tab==='emergency' && (
                <View style={S.list}>
                  {emergList.length>0&&(
                    <View style={S.emergHdr}>
                      <Text style={S.emergHdrTxt}>⚡  Priority — Immediate Attention</Text>
                    </View>
                  )}
                  {emergList.length===0 ? (
                    <View style={S.empty}><Text style={S.emptyIcon}>✅</Text><Text style={S.emptyTxt}>No emergency patients</Text></View>
                  ) : (
                    emergList.map(t=>(
                      <QCard key={t.id} tok={t} busy={busyId===t.id}
                        onSendAlert={()=>doCall(t.id)} onNotShown={()=>doCancel(t.id)}/>
                    ))
                  )}
                </View>
              )}

              {/* ── SKIPPED TAB ── */}
              {tab==='notshown' && (
                <View style={S.list}>
                  {skippedList.length===0
                    ? <View style={S.empty}><Text style={S.emptyIcon}>👍</Text><Text style={S.emptyTxt}>No skipped patients</Text></View>
                    : skippedList.map(t=><PastCard key={t.id} tok={t}/>)
                  }
                </View>
              )}

              {/* ── DONE TAB ── */}
              {tab==='done' && (
                <View style={S.list}>
                  {doneList.length===0
                    ? <View style={S.empty}><Text style={S.emptyIcon}>📋</Text><Text style={S.emptyTxt}>No completed consultations yet</Text></View>
                    : doneList.map(t=><PastCard key={t.id} tok={t}/>)
                  }
                </View>
              )}

            </View>
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
}

// ─── STYLES ──────────────────────────────────────────────────────
const S = StyleSheet.create({
  safe: { flex:1, backgroundColor:BG, ...(isWeb&&{paddingTop:44}) },
  root: { flex:1, backgroundColor:BG },
  glowTL: { position:'absolute', top:-60,  left:-60,  width:240, height:240, borderRadius:120, backgroundColor:'rgba(13,148,136,0.2)' },
  glowBR: { position:'absolute', top:320,  right:-80, width:200, height:200, borderRadius:100, backgroundColor:'rgba(239,68,68,0.08)' },
  inner: { paddingHorizontal:16, gap:8 },

  // Header
  hdr:      { flexDirection:'row', alignItems:'center', justifyContent:'space-between', paddingHorizontal:18, paddingTop:10, paddingBottom:10 },
  hdrTitle: { fontSize:13, fontWeight:'800', color:'#FFF', letterSpacing:-0.2 },
  hdrDoc:   { fontSize:12, fontWeight:'700', color:TEAL_LT },
  shiftBtn: { paddingHorizontal:10, paddingVertical:4, borderRadius:10, borderWidth:1 },
  shiftMorn:{ backgroundColor:'rgba(252,211,77,0.1)', borderColor:'rgba(252,211,77,0.3)' },
  shiftEve: { backgroundColor:'rgba(196,181,253,0.1)', borderColor:'rgba(196,181,253,0.3)' },
  shiftTxt: { fontSize:10, fontWeight:'800' },

  // Consulting card
  cc:         { borderRadius:22, padding:16, overflow:'hidden', backgroundColor:'rgba(13,148,136,0.2)', borderWidth:1.5, borderColor:'rgba(45,212,191,0.38)', shadowColor:'#0D9488', shadowOffset:{width:0,height:8}, shadowOpacity:0.25, shadowRadius:20 },
  ccGlow1:    { position:'absolute', top:-30, right:-30, width:140, height:140, borderRadius:70, backgroundColor:'rgba(45,212,191,0.18)' },
  ccGlow2:    { position:'absolute', bottom:-20, left:-20, width:100, height:100, borderRadius:50, backgroundColor:'rgba(6,182,212,0.12)' },
  ccTopRow:   { flexDirection:'row', alignItems:'center', justifyContent:'space-between', marginBottom:12 },
  ccLiveBadge:{ flexDirection:'row', alignItems:'center', gap:5, paddingHorizontal:10, paddingVertical:4, borderRadius:20, backgroundColor:'rgba(74,222,128,0.12)', borderWidth:1, borderColor:'rgba(74,222,128,0.28)' },
  ccLiveText: { fontSize:9, fontWeight:'800', color:'#4ADE80', letterSpacing:0.6 },
  ccTimerBadge:{ flexDirection:'row', alignItems:'center', gap:4, paddingHorizontal:9, paddingVertical:4, borderRadius:20, backgroundColor:'rgba(255,255,255,0.07)', borderWidth:1, borderColor:'rgba(255,255,255,0.1)' },
  ccTimerText:{ fontSize:9, fontWeight:'700', color:'rgba(255,255,255,0.45)' },
  ccHero:     { flexDirection:'row', alignItems:'flex-start', gap:14, marginBottom:14 },
  ccTokenBlock:{ width:64, height:64, borderRadius:18, alignItems:'center', justifyContent:'center', backgroundColor:TEAL, shadowColor:TEAL, shadowOffset:{width:0,height:4}, shadowOpacity:0.55, shadowRadius:16 },
  ccTokenLabel:{ fontSize:8, fontWeight:'700', color:'rgba(255,255,255,0.6)', textTransform:'uppercase', letterSpacing:0.6 },
  ccTokenNum: { fontSize:26, fontWeight:'900', color:'#FFF', letterSpacing:-1.5, lineHeight:30 },
  ccName:     { fontSize:20, fontWeight:'900', color:'#FFF', letterSpacing:-0.5, lineHeight:26, marginBottom:6 },
  ccBadges:   { flexDirection:'row', gap:5, flexWrap:'wrap' },
  ccGrid:     { flexDirection:'row', gap:8, marginBottom:14 },
  ccGridCell: { flex:1, flexDirection:'row', alignItems:'center', gap:8, padding:10, borderRadius:12, backgroundColor:'rgba(255,255,255,0.06)', borderWidth:1, borderColor:'rgba(255,255,255,0.08)' },
  ccGridIcon: { width:28, height:28, borderRadius:9, alignItems:'center', justifyContent:'center' },
  ccGridLabel:{ fontSize:8, fontWeight:'700', color:'rgba(255,255,255,0.3)', textTransform:'uppercase', letterSpacing:0.5 },
  ccGridValue:{ fontSize:10, fontWeight:'700', color:'rgba(255,255,255,0.85)' },
  ccBtnRow:   { flexDirection:'row', gap:8 },
  ccNotShown: { flex:1, height:42, borderRadius:13, alignItems:'center', justifyContent:'center', backgroundColor:'rgba(245,158,11,0.16)', borderWidth:1.5, borderColor:'rgba(245,158,11,0.45)' },
  ccNotShownTxt:{ fontSize:12, fontWeight:'800', color:'#FCD34D' },
  ccDone:     { flex:1, height:42, borderRadius:13, alignItems:'center', justifyContent:'center', backgroundColor:'#16A34A', shadowColor:'#22C55E', shadowOffset:{width:0,height:4}, shadowOpacity:0.4, shadowRadius:12 },
  ccDoneTxt:  { fontSize:12, fontWeight:'800', color:'#FFF' },

  noConsulting:    { borderRadius:22, padding:16, backgroundColor:'rgba(255,255,255,0.03)', borderWidth:1, borderColor:'rgba(255,255,255,0.07)', alignItems:'center', paddingVertical:20 },
  noConsultingHint:{ fontSize:11, color:'rgba(255,255,255,0.22)', marginTop:7, textAlign:'center', fontWeight:'600' },

  // Next card
  nc:       { borderRadius:16, borderWidth:1.5, overflow:'hidden', shadowOffset:{width:0,height:4}, shadowOpacity:0.18, shadowRadius:14 },
  ncInner:  { flexDirection:'row', alignItems:'center', gap:12, padding:12 },
  ncToken:  { width:50, height:50, borderRadius:13, alignItems:'center', justifyContent:'center', borderWidth:1.5, flexShrink:0 },
  ncTokenLabel:{ fontSize:8, fontWeight:'700', textTransform:'uppercase', letterSpacing:0.4, lineHeight:12 },
  ncTokenNum:  { fontSize:18, fontWeight:'900', color:'#FFF', letterSpacing:-0.5, lineHeight:22 },
  ncName:   { fontSize:13, fontWeight:'800', color:'#FFF', marginBottom:5 },
  ncBadgeRow:{ flexDirection:'row', gap:5, flexWrap:'wrap', marginBottom:4 },
  ncFooter: { flexDirection:'row', alignItems:'center', gap:10, marginTop:6, paddingTop:6, borderTopWidth:1 },
  ncFooterTxt:{ fontSize:10, color:'rgba(255,255,255,0.42)', fontWeight:'500' },
  ncChevron:{ fontSize:24, fontWeight:'800', marginLeft:4 },

  // Stats
  stats:    { flexDirection:'row', borderRadius:14, overflow:'hidden', backgroundColor:'rgba(255,255,255,0.04)', borderWidth:1, borderColor:'rgba(255,255,255,0.07)' },
  statCell: { flex:1, alignItems:'center', paddingVertical:10 },
  statBorder:{ borderRightWidth:1, borderRightColor:'rgba(255,255,255,0.06)' },
  statVal:  { fontSize:22, fontWeight:'900', letterSpacing:-0.5 },
  statLbl:  { fontSize:9, fontWeight:'700', color:'rgba(255,255,255,0.3)', textTransform:'uppercase', letterSpacing:0.4, marginTop:1 },

  // Pause
  pauseBtn: { height:40, borderRadius:13, alignItems:'center', justifyContent:'center', backgroundColor:'rgba(245,158,11,0.09)', borderWidth:1.5, borderColor:'rgba(245,158,11,0.45)' },
  pauseBtnOn:{ backgroundColor:'rgba(34,197,94,0.09)', borderColor:'rgba(34,197,94,0.45)' },
  pauseTxt: { fontSize:12, fontWeight:'800' },

  // Tabs
  tabBar:   { flexDirection:'row', gap:4, padding:4, borderRadius:14, backgroundColor:'rgba(255,255,255,0.05)', borderWidth:1, borderColor:'rgba(255,255,255,0.07)' },
  tabItem:  { flex:1, height:42, borderRadius:10, alignItems:'center', justifyContent:'center', gap:2, position:'relative' },
  tabDot:   { position:'absolute', top:4, right:6, width:5, height:5, borderRadius:3, backgroundColor:'#EF4444' },
  tabTxt:   { fontSize:9, fontWeight:'700', color:'rgba(255,255,255,0.38)', textAlign:'center' },

  // Queue card
  list:       { gap:8 },
  empty:      { alignItems:'center', paddingVertical:44 },
  emptyIcon:  { fontSize:34, marginBottom:10 },
  emptyTxt:   { fontSize:12, color:'rgba(255,255,255,0.28)', fontWeight:'600', textAlign:'center' },
  emergHdr:   { marginBottom:6 },
  emergHdrTxt:{ fontSize:10, fontWeight:'800', color:'rgba(239,68,68,0.7)', textTransform:'uppercase', letterSpacing:0.7 },

  qc:         { borderRadius:20, backgroundColor:'rgba(255,255,255,0.04)', borderWidth:1.5, borderColor:'rgba(255,255,255,0.07)', overflow:'hidden' },
  qcEmerg:    { backgroundColor:'rgba(239,68,68,0.09)', borderColor:'rgba(239,68,68,0.3)', shadowColor:'#EF4444', shadowOffset:{width:0,height:4}, shadowOpacity:0.14, shadowRadius:14 },
  qcTop:      { flexDirection:'row', alignItems:'flex-start', gap:10, padding:12, paddingBottom:8 },
  qcToken:    { width:44, height:44, borderRadius:13, alignItems:'center', justifyContent:'center', backgroundColor:'rgba(255,255,255,0.07)', borderWidth:1.5, borderColor:'rgba(255,255,255,0.1)', flexShrink:0 },
  qcTokenEmerg:{ backgroundColor:'rgba(239,68,68,0.26)', borderColor:'rgba(239,68,68,0.42)' },
  qcTokenTxt: { fontSize:14, fontWeight:'900', color:'#FFF', letterSpacing:-0.5 },
  qcName:     { fontSize:13, fontWeight:'800', color:'#FFF', marginBottom:4 },
  qcBadgeRow: { flexDirection:'row', gap:5, flexWrap:'wrap', marginBottom:4 },
  qcPhone:    { fontSize:10, color:'rgba(255,255,255,0.35)', fontWeight:'500' },
  waitingBadge:{ paddingHorizontal:9, paddingVertical:4, borderRadius:8, backgroundColor:'rgba(99,102,241,0.25)', borderWidth:1, borderColor:'rgba(99,102,241,0.4)', flexShrink:0 },
  waitingBadgeTxt:{ fontSize:9, fontWeight:'800', color:'#A5B4FC', letterSpacing:0.4 },
  qcBtns:     { flexDirection:'row', gap:6, padding:12, paddingTop:0 },
  qcSendAlert:{ flex:1, height:38, borderRadius:11, alignItems:'center', justifyContent:'center', backgroundColor:'rgba(99,102,241,0.2)', borderWidth:1.5, borderColor:'rgba(99,102,241,0.42)' },
  qcSendAlertTxt:{ fontSize:11, fontWeight:'800', color:'#A5B4FC' },
  qcNotShown: { flex:1, height:38, borderRadius:11, alignItems:'center', justifyContent:'center', backgroundColor:'rgba(245,158,11,0.16)', borderWidth:1.5, borderColor:'rgba(245,158,11,0.42)' },
  qcNotShownTxt:{ fontSize:11, fontWeight:'800', color:'#FCD34D' },

  // Pill (shared badge)
  pill:    { flexDirection:'row', alignItems:'center', paddingHorizontal:7, paddingVertical:3, borderRadius:20 },
  pillTxt: { fontSize:9, fontWeight:'800', letterSpacing:0.3 },
});
