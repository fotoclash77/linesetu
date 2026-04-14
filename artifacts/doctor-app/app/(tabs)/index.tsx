import React, { useState, useCallback, useEffect, useMemo } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Platform, DimensionValue,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { BG, TEAL, TEAL_LT } from '../../constants/theme';
import Svg, { Polyline, Polygon, Rect, G, Line, Text as SvgText } from 'react-native-svg';
import { useDoctor } from '../../contexts/DoctorContext';

const BASE   = () => `https://${process.env.EXPO_PUBLIC_DOMAIN}`;
const isWeb  = Platform.OS === 'web';

type EarningPeriod = 'Today' | 'Last 7 days' | 'Last 30 days';

interface DashStats {
  earningsNormal: number; earningsEmergency: number; earningsTotal: number; spark: number[];
  total: number; consulted: number; noShow: number; waitlisted: number;
  emergency: number; onlineBooked: number; walkIn: number;
  firstVisit: number; followUp: number;
  dailyData: { label: string; total: number; consulted: number; firstVisit: number; followUp: number }[];
}

const EMPTY: DashStats = {
  earningsNormal:0, earningsEmergency:0, earningsTotal:0, spark:[0,0,0,0,0,0],
  total:0, consulted:0, noShow:0, waitlisted:0, emergency:0, onlineBooked:0, walkIn:0,
  firstVisit:0, followUp:0, dailyData:[],
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
function isoDate(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}
function shortDate(iso: string) {
  const [,m,d] = iso.split('-');
  const MONTHS = ['','Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${parseInt(d,10)} ${MONTHS[parseInt(m,10)]}`;
}
function dayRange(periodDays: number) {
  const today = new Date();
  const from  = new Date(today);
  from.setDate(from.getDate() - periodDays + 1);
  from.setHours(0,0,0,0);
  const days: string[] = [];
  for (let i = 0; i < periodDays; i++) {
    const d = new Date(from);
    d.setDate(d.getDate() + i);
    days.push(isoDate(d));
  }
  return days;
}

// ─── Sparkline ───────────────────────────────────────────────────────────────
function Sparkline({ data, color }: { data: number[]; color: string }) {
  const w = 80, h = 30;
  const min = Math.min(...data), max = Math.max(...data);
  const pts = data.map((v, i) => {
    const x = (i / Math.max(data.length - 1, 1)) * w;
    const y = h - ((v - min) / (max - min + 0.001)) * h * 0.85 - 2;
    return `${x},${y}`;
  }).join(' ');
  const fillPts = `0,${h} ${pts} ${w},${h}`;
  return (
    <Svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <Polyline points={pts} stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <Polygon points={fillPts} fill={color} fillOpacity="0.25" />
    </Svg>
  );
}

// ─── Daily Bar Chart ──────────────────────────────────────────────────────────
function DailyBarChart({ data }: {
  data: { label: string; total: number; consulted: number; firstVisit: number; followUp: number }[];
}) {
  const W = 330, H = 120, padL = 4, padR = 4, padB = 28, padT = 8;
  const chartW = W - padL - padR;
  const chartH = H - padB - padT;
  if (!data.length) return null;

  const maxVal  = Math.max(...data.map(d => d.total), 1);
  const barGap  = 4;
  const barW    = Math.max(6, Math.floor((chartW - (data.length - 1) * barGap) / data.length));
  const spacing = barW + barGap;

  // Label every nth item to avoid crowding
  const step = data.length <= 7 ? 1 : data.length <= 14 ? 2 : 5;

  return (
    <Svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ alignSelf:'center' }}>
      <G x={padL} y={padT}>
        {/* Horizontal guides */}
        {[0, 0.25, 0.5, 0.75, 1].map(f => {
          const y = chartH * (1 - f);
          return (
            <Line key={f} x1={0} y1={y} x2={chartW} y2={y}
              stroke="rgba(255,255,255,0.06)" strokeWidth="1"/>
          );
        })}

        {/* Bars */}
        {data.map((d, i) => {
          const x        = i * spacing;
          const totalH   = (d.total / maxVal) * chartH;
          const consultH = (d.consulted / maxVal) * chartH;
          const fvH      = (d.firstVisit / maxVal) * chartH;
          const fuH      = (d.followUp / maxVal) * chartH;

          return (
            <G key={d.label} x={x}>
              {/* Total bg bar */}
              <Rect
                x={0} y={chartH - totalH} width={barW} height={Math.max(totalH, 1)}
                rx={3} fill="rgba(165,180,252,0.18)"
              />
              {/* Consulted bar */}
              <Rect
                x={0} y={chartH - consultH} width={barW} height={Math.max(consultH, 1)}
                rx={3} fill="rgba(74,222,128,0.7)"
              />
              {/* First visit dot */}
              {d.firstVisit > 0 && (
                <Rect
                  x={0} y={chartH - fvH - 1} width={barW} height={2}
                  rx={1} fill="#818CF8"
                />
              )}
              {/* Follow-up dot */}
              {d.followUp > 0 && (
                <Rect
                  x={0} y={chartH - fuH - 4} width={barW} height={2}
                  rx={1} fill="#34D399"
                />
              )}
              {/* Date label */}
              {i % step === 0 && (
                <SvgText
                  x={barW / 2} y={chartH + 16}
                  fontSize="8" fill="rgba(255,255,255,0.3)"
                  textAnchor="middle" fontWeight="700"
                >
                  {d.label.split(' ')[0]}
                </SvgText>
              )}
            </G>
          );
        })}
      </G>
    </Svg>
  );
}

// ─── Toggle ───────────────────────────────────────────────────────────────────
function Toggle({ value, onToggle, onColor }: { value: boolean; onToggle: () => void; onColor: string }) {
  return (
    <TouchableOpacity
      onPress={onToggle}
      style={[styles.toggle, value ? { backgroundColor: onColor, borderColor: onColor } : styles.toggleOff]}
    >
      <View style={[styles.toggleThumb, value ? styles.toggleThumbOn : styles.toggleThumbOff]} />
    </TouchableOpacity>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function DashboardScreen() {
  const { doctor, setAvailability: setCtxAvailability } = useDoctor();
  const [period,    setPeriod]    = useState<EarningPeriod>('Today');
  const [available, setAvailable] = useState(() => (doctor as any)?.isAvailable !== false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [stats, setStats]         = useState<DashStats>(EMPTY);

  // Reset all stats immediately whenever the logged-in doctor account changes
  useEffect(() => {
    setStats(EMPTY);
    setUnreadCount(0);
  }, [doctor?.id]);

  // Keep toggle in sync with real-time Firestore value from context
  useEffect(() => {
    if (doctor) setAvailable(doctor.isAvailable !== false);
  }, [doctor?.isAvailable]);

  // ── Real-time patient stats fetch ─────────────────────────────────────────
  const periodDays = period === 'Today' ? 1 : period === 'Last 7 days' ? 7 : 30;

  const fetchStats = useCallback(async () => {
    if (!doctor?.id) return;
    const today = isoDate(new Date());
    const fromD = new Date();
    fromD.setDate(fromD.getDate() - periodDays + 1);
    fromD.setHours(0,0,0,0);
    const fromDate = isoDate(fromD);

    const B = BASE();
    const tokenUrl = periodDays === 1
      ? `${B}/api/tokens?doctorId=${doctor.id}&date=${today}`
      : `${B}/api/tokens?doctorId=${doctor.id}&from=${fromDate}&to=${today}`;

    try {
      const [tokenRes, earningsRes] = await Promise.all([
        fetch(tokenUrl).then(r => r.json()).catch(() => ({ tokens:[] })),
        fetch(`${B}/api/doctors/${doctor.id}/earnings?from=${fromDate}&to=${today}`)
          .then(r => r.json()).catch(() => ({ earnings:[] })),
      ]);
      const tokens: any[] = tokenRes.tokens ?? [];
      const edocs: any[]  = earningsRes.earnings ?? [];

      const total       = tokens.length;
      const consulted   = tokens.filter(t => t.status === 'done').length;
      const noShow      = tokens.filter(t => t.status === 'cancelled' || t.status === 'skipped').length;
      const waitlisted  = tokens.filter(t => ['waiting','up_next','in_consult'].includes(t.status)).length;
      const emergency   = tokens.filter(t => t.type === 'emergency').length;
      const onlineBooked = tokens.filter(t => t.source !== 'walkin').length;
      const walkIn      = tokens.filter(t => t.source === 'walkin').length;
      const firstVisit  = tokens.filter(t => t.visitType === 'first-visit').length;
      const followUp    = tokens.filter(t => t.visitType === 'follow-up').length;

      const earningsTotal     = edocs.reduce((s, e) => s + (e.earned ?? 0), 0);
      const earningsNormal    = edocs.reduce((s, e) => s + ((e.tokensNormal    ?? 0) * 10), 0);
      const earningsEmergency = edocs.reduce((s, e) => s + ((e.tokensEmergency ?? 0) * 20), 0);

      // ── Daily breakdown for bar chart ──────────────────────────────
      const days = dayRange(periodDays);
      const dailyData = days.map(iso => {
        const day = tokens.filter(t => {
          const d = t.bookedAt?.seconds
            ? isoDate(new Date(t.bookedAt.seconds * 1000))
            : (t.date ?? '');
          return d === iso;
        });
        return {
          label:      shortDate(iso),
          total:      day.length,
          consulted:  day.filter(t => t.status === 'done').length,
          firstVisit: day.filter(t => t.visitType === 'first-visit').length,
          followUp:   day.filter(t => t.visitType === 'follow-up').length,
        };
      });

      const spark = days.slice(-6).map(iso =>
        dailyData.find(d => d.label === shortDate(iso))?.total ?? 0
      );

      setStats({ total, consulted, noShow, waitlisted, emergency, onlineBooked, walkIn,
        firstVisit, followUp, earningsNormal, earningsEmergency, earningsTotal, spark, dailyData });
    } catch (_) {}
  }, [doctor?.id, periodDays]);

  useEffect(() => {
    fetchStats();
    const iv = setInterval(fetchStats, 30_000);
    return () => clearInterval(iv);
  }, [fetchStats]);

  // ── Notifications ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!doctor?.id) return;
    const poll = async () => {
      try {
        const res  = await fetch(`${BASE()}/api/notifications/${doctor.id}`);
        const data = await res.json();
        if (data.notifications)
          setUnreadCount((data.notifications as any[]).filter((n:any) => !n.read).length);
      } catch (_) {}
    };
    poll();
    const iv = setInterval(poll, 30_000);
    return () => clearInterval(iv);
  }, [doctor?.id]);

  const toggleAvailability = useCallback(async () => {
    const newVal = !available;
    setAvailable(newVal);
    setCtxAvailability(newVal);
    if (!doctor?.id) return;
    try {
      await fetch(`${BASE()}/api/doctors/${doctor.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isAvailable: newVal }),
      });
    } catch {
      setAvailable(!newVal);
      setCtxAvailability(!newVal);
    }
  }, [available, doctor?.id, setCtxAvailability]);

  // ── Derived ───────────────────────────────────────────────────────────────
  const pd   = stats;
  const earn = { n1: pd.earningsNormal, n2: pd.earningsEmergency, total: pd.earningsTotal, spark: pd.spark };
  const fmt  = (n: number) => n >= 1000 ? `₹${(n/1000).toFixed(1)}k` : `₹${n}`;
  const consultPct   = pd.total > 0 ? Math.round((pd.consulted   / pd.total) * 100) : 0;
  const firstVisitPct = pd.total > 0 ? Math.round((pd.firstVisit / pd.total) * 100) : 0;
  const followUpPct   = pd.total > 0 ? Math.round((pd.followUp   / pd.total) * 100) : 0;

  const now = new Date();
  const DOW_S = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const MON_S = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const headerDate  = `${DOW_S[now.getDay()]}, ${now.getDate()} ${MON_S[now.getMonth()]} ${now.getFullYear()}`;
  const greetHour   = now.getHours();
  const greetTime   = greetHour < 12 ? 'Morning' : greetHour < 17 ? 'Afternoon' : 'Evening';
  const greetName   = (doctor as any)?.name?.replace(/^Dr\.?\s*/i,'').split(' ')[0] ?? 'Doctor';

  interface PatientRow { label:string; value:number; sub:string; icon:string; color:string; spark:number[]; divider?:boolean }
  const spark1 = (v: number) => [0,0,0,0,0,v];
  const patientRows: PatientRow[] = [
    { label:'Total Patients',     value:pd.total,        sub:'All registered',              icon:'👥', color:'#A5B4FC', spark:spark1(pd.total) },
    { label:'Consulted',          value:pd.consulted,    sub:'Seen by doctor',              icon:'✓',  color:'#4ADE80', spark:spark1(pd.consulted) },
    { label:'Not Shown',          value:pd.noShow,       sub:'Absent / skipped',            icon:'✗',  color:'#F87171', spark:spark1(pd.noShow) },
    { label:'Waitlisted',         value:pd.waitlisted,   sub:'Still in queue',              icon:'⏱', color:'#FCD34D', spark:spark1(pd.waitlisted) },
    { label:'Emergency Patients', value:pd.emergency,    sub:'Priority tokens',             icon:'⚡', color:'#FB923C', spark:spark1(pd.emergency) },
    { label:'First Visit',        value:pd.firstVisit,   sub:'New patients, first time',    icon:'🆕', color:'#818CF8', spark:spark1(pd.firstVisit) },
    { label:'Follow-up',          value:pd.followUp,     sub:'Return visits',               icon:'🔄', color:'#34D399', spark:spark1(pd.followUp) },
    { label:'Online Tokens',      value:pd.onlineBooked, sub:'Via app',                     icon:'📱', color:'#A78BFA', spark:spark1(pd.onlineBooked), divider:true },
    { label:'Walk-in Tokens',     value:pd.walkIn,       sub:'Added at clinic',             icon:'🚶', color:'#2DD4BF', spark:spark1(pd.walkIn) },
  ];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.container}>
        <View style={styles.glowTop}/>
        <View style={styles.glowRight}/>

        {/* ── HEADER ── */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerDate}>{headerDate}</Text>
            <Text style={styles.headerTitle}>
              Good {greetTime}, <Text style={styles.headerName}>{greetName}</Text>
            </Text>
          </View>
          <View style={styles.headerIcons}>
            <TouchableOpacity style={styles.bellBtn} onPress={() => router.push('/notifications')} activeOpacity={0.8}>
              <Text style={styles.bellIcon}>🔔</Text>
              {unreadCount > 0 && <View style={styles.bellDot}/>}
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView style={styles.scroll} contentContainerStyle={{paddingBottom:100}} showsVerticalScrollIndicator={false}>

          {/* ── QUICK CONTROLS ── */}
          <View style={styles.glassCard}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionDot}>⚡</Text>
              <Text style={styles.sectionTitle}>Quick Controls</Text>
            </View>
            <TouchableOpacity
              onPress={toggleAvailability}
              style={[styles.availRow, available ? styles.availRowOn : styles.availRowOff]}
              activeOpacity={0.85}
            >
              <View style={styles.availLeft}>
                <View style={[styles.availDot, { backgroundColor: available ? '#22C55E' : '#EF4444' }]}/>
                <View>
                  <Text style={styles.availTitle}>{available ? 'Available' : 'Unavailable'}</Text>
                  <Text style={[styles.availSub, { color: available ? '#4ADE80' : '#F87171' }]}>
                    {available ? 'Accepting patients now' : 'Not seeing patients'}
                  </Text>
                </View>
              </View>
              <Toggle value={available} onToggle={toggleAvailability} onColor="#22C55E"/>
            </TouchableOpacity>
            <View style={styles.quickActions}>
              <TouchableOpacity style={styles.walkinBtn} onPress={() => router.push('/walkin')}>
                <Text style={styles.walkinBtnText}>✚ Add Walk-in</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.queueBtn} onPress={() => router.navigate('/(tabs)/queue' as any)}>
                <Text style={styles.queueBtnText}>⏱ View Queue</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* ── EARNINGS ── */}
          <View style={styles.earningsCard}>
            <View style={{marginBottom:14}}>
              <View style={[styles.sectionHeader,{marginBottom:10}]}>
                <Text style={styles.sectionDot}>↗</Text>
                <Text style={styles.sectionTitle}>Earnings Overview</Text>
              </View>
              <PeriodTabs value={period} onChange={setPeriod}/>
            </View>
            <View style={styles.earningsTotal}>
              <View>
                <Text style={styles.earningsTotalLabel}>Total {period}</Text>
                <Text style={styles.earningsTotalValue}>{fmt(earn.total)}</Text>
              </View>
              <Sparkline data={earn.spark} color={TEAL_LT}/>
            </View>
            <View style={styles.earningsRow}>
              <View style={styles.earningsItem}>
                <Text style={styles.earningsItemValue} numberOfLines={1}>{fmt(earn.n1)}</Text>
                <Text style={styles.earningsItemLabel}>Normal</Text>
              </View>
              <View style={styles.earningsDivider}/>
              <View style={styles.earningsItem}>
                <Text style={[styles.earningsItemValue,{color:'#FCD34D'}]} numberOfLines={1}>{fmt(earn.n2)}</Text>
                <Text style={styles.earningsItemLabel}>Emergency</Text>
              </View>
              <View style={styles.earningsDivider}/>
              <View style={styles.earningsItem}>
                <Text style={[styles.earningsItemValue,{color:'#4ADE80'}]} numberOfLines={1}>{fmt(earn.total)}</Text>
                <Text style={styles.earningsItemLabel}>Total</Text>
              </View>
            </View>
          </View>

          {/* ── PATIENT DATA ── */}
          <View style={styles.glassCard}>
            <View style={{marginBottom:14}}>
              <View style={[styles.sectionHeader,{marginBottom:10}]}>
                <Text style={styles.sectionDot}>📊</Text>
                <Text style={styles.sectionTitle}>Patient Data</Text>
                <View style={{flex:1,alignItems:'flex-end'}}>
                  <TouchableOpacity style={styles.patientsBtn} onPress={() => router.push('/patients')}>
                    <Text style={styles.patientsBtnText}>👤  My Patients</Text>
                    <Text style={styles.patientsBtnArrow}>›</Text>
                  </TouchableOpacity>
                </View>
              </View>
              <PeriodTabs value={period} onChange={setPeriod}/>
            </View>

            {/* ── CONSULTATION RATE ── */}
            <ProgressCard
              label="Consultation Rate"
              pct={consultPct}
              value={pd.consulted}
              total={pd.total}
              color="#4ADE80"
              bg="rgba(34,197,94,0.1)"
              border="rgba(34,197,94,0.2)"
              sub="Seen by doctor"
            />

            {/* ── STAT ROWS ── */}
            {patientRows.map((row, i) => {
              const pct = Math.min(100, Math.round((row.value / Math.max(pd.total,1)) * 100));
              return (
                <React.Fragment key={row.label}>
                  {row.divider && (
                    <View style={styles.sectionDivider}>
                      <View style={styles.dividerLine2}/>
                      <Text style={styles.dividerLabel}>BOOKING TYPE</Text>
                      <View style={styles.dividerLine2}/>
                    </View>
                  )}
                  <View style={[styles.statRow, i > 0 && {borderTopWidth:1,borderTopColor:'rgba(255,255,255,0.05)'}]}>
                    <View style={[styles.statIcon,{backgroundColor:`${row.color}22`}]}>
                      <Text style={{fontSize:14,color:row.color}}>{row.icon}</Text>
                    </View>
                    <View style={{flex:1,minWidth:0}}>
                      <View style={styles.statTopRow}>
                        <Text style={styles.statLabel} numberOfLines={1}>{row.label}</Text>
                        <Text style={styles.statValue}>{row.value}</Text>
                      </View>
                      <View style={styles.statBar}>
                        <View style={[styles.statBarFg,{width:`${pct}%` as DimensionValue,backgroundColor:row.color}]}/>
                      </View>
                      <Text style={styles.statSub}>{row.sub}</Text>
                    </View>
                    <Sparkline data={row.spark} color={row.color}/>
                  </View>
                </React.Fragment>
              );
            })}
          </View>

        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function PeriodTabs({ value, onChange }: { value: EarningPeriod; onChange: (p: EarningPeriod) => void }) {
  const TABS: EarningPeriod[] = ['Today','Last 7 days','Last 30 days'];
  return (
    <View style={[styles.periodTabs,{alignSelf:'flex-start'}]}>
      {TABS.map(p => (
        <TouchableOpacity key={p} onPress={() => onChange(p)} style={[styles.periodTab, value===p && styles.periodTabActive]}>
          <Text style={[styles.periodTabText, value===p && styles.periodTabTextActive]}>{p}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

function ProgressCard({ label, pct, value, total, color, bg, border, sub }: {
  label:string; pct:number; value:number; total:number;
  color:string; bg:string; border:string; sub:string;
}) {
  return (
    <View style={[styles.progressCard,{backgroundColor:bg,borderColor:border}]}>
      <View style={styles.progressTopRow}>
        <View>
          <Text style={styles.progressLabel}>{label}</Text>
          <Text style={styles.progressSub}>{sub}</Text>
        </View>
        <Text style={[styles.progressPct,{color}]}>{pct}%</Text>
      </View>
      <View style={styles.progressBg}>
        <View style={[styles.progressFg,{width:`${pct}%` as DimensionValue,backgroundColor:color}]}/>
      </View>
      <View style={styles.progressFootRow}>
        <Text style={styles.progressFoot}>{value} patients</Text>
        <Text style={styles.progressFoot}>{total} total</Text>
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe:      { flex:1, backgroundColor:BG, ...(isWeb&&{paddingTop:44}) },
  container: { flex:1, backgroundColor:BG },
  glowTop:   { position:'absolute', top:-80, left:-60, width:280, height:280, borderRadius:140, backgroundColor:'rgba(13,148,136,0.22)', opacity:0.5 },
  glowRight: { position:'absolute', top:350, right:-80, width:220, height:220, borderRadius:110, backgroundColor:'rgba(6,182,212,0.13)', opacity:0.5 },

  header:      { flexDirection:'row', justifyContent:'space-between', alignItems:'center', paddingHorizontal:18, paddingTop:18, paddingBottom:10 },
  headerDate:  { fontSize:11, color:'rgba(255,255,255,0.35)', fontWeight:'600' },
  headerTitle: { fontSize:19, fontWeight:'900', color:'#FFF', letterSpacing:-0.4 },
  headerName:  { color:TEAL_LT },
  headerIcons: { flexDirection:'row', gap:8, alignItems:'center' },
  bellBtn:     { width:38, height:38, borderRadius:13, backgroundColor:'rgba(255,255,255,0.05)', borderWidth:1, borderColor:'rgba(255,255,255,0.1)', alignItems:'center', justifyContent:'center', position:'relative' },
  bellIcon:    { fontSize:17 },
  bellDot:     { position:'absolute', top:6, right:7, width:8, height:8, borderRadius:4, backgroundColor:'#EF4444', borderWidth:1.5, borderColor:BG },

  scroll:     { flex:1, paddingHorizontal:16 },
  glassCard:  { borderRadius:22, padding:14, marginBottom:12, backgroundColor:'rgba(255,255,255,0.05)', borderWidth:1, borderColor:'rgba(255,255,255,0.09)' },
  earningsCard:{ borderRadius:22, padding:16, marginBottom:12, backgroundColor:'rgba(13,148,136,0.2)', borderWidth:1.5, borderColor:'rgba(45,212,191,0.22)' },

  sectionHeader:  { flexDirection:'row', alignItems:'center', gap:6, marginBottom:12 },
  sectionDot:     { fontSize:14, color:TEAL_LT },
  sectionTitle:   { fontSize:12, fontWeight:'800', color:'#FFF' },

  availRow:    { flexDirection:'row', justifyContent:'space-between', alignItems:'center', padding:14, borderRadius:16, marginBottom:10, borderWidth:1.5 },
  availRowOn:  { backgroundColor:'rgba(34,197,94,0.08)', borderColor:'rgba(34,197,94,0.3)' },
  availRowOff: { backgroundColor:'rgba(239,68,68,0.08)', borderColor:'rgba(239,68,68,0.3)' },
  availLeft:   { flexDirection:'row', alignItems:'center', gap:10 },
  availDot:    { width:10, height:10, borderRadius:5 },
  availTitle:  { fontSize:14, fontWeight:'800', color:'#FFF' },
  availSub:    { fontSize:10, fontWeight:'600', marginTop:1 },

  toggle:         { width:46, height:26, borderRadius:13, justifyContent:'center', borderWidth:1, position:'relative' },
  toggleOff:      { backgroundColor:'rgba(255,255,255,0.1)', borderColor:'rgba(255,255,255,0.15)' },
  toggleThumb:    { position:'absolute', width:18, height:18, borderRadius:9, backgroundColor:'#FFF' },
  toggleThumbOn:  { right:3 },
  toggleThumbOff: { left:3 },

  quickActions:  { flexDirection:'row', gap:8 },
  walkinBtn:     { flex:1, height:46, borderRadius:14, backgroundColor:TEAL, alignItems:'center', justifyContent:'center' },
  walkinBtnText: { fontSize:12, fontWeight:'800', color:'#FFF' },
  queueBtn:      { flex:1, height:46, borderRadius:14, backgroundColor:'rgba(255,255,255,0.07)', borderWidth:1, borderColor:'rgba(255,255,255,0.12)', alignItems:'center', justifyContent:'center' },
  queueBtnText:  { fontSize:12, fontWeight:'800', color:'rgba(255,255,255,0.75)' },

  periodTabs:         { flexDirection:'row', gap:4, padding:3, borderRadius:12, backgroundColor:'rgba(0,0,0,0.3)' },
  periodTab:          { paddingHorizontal:10, paddingVertical:4, borderRadius:8 },
  periodTabActive:    { backgroundColor:TEAL },
  periodTabText:      { fontSize:10, fontWeight:'800', color:'rgba(255,255,255,0.4)' },
  periodTabTextActive:{ color:'#FFF' },

  earningsTotal:      { flexDirection:'row', justifyContent:'space-between', alignItems:'flex-start', marginBottom:14 },
  earningsTotalLabel: { fontSize:10, color:'rgba(255,255,255,0.4)', fontWeight:'600', marginBottom:4 },
  earningsTotalValue: { fontSize:28, fontWeight:'900', color:'#FFF', letterSpacing:-1 },
  earningsRow:        { flexDirection:'row', paddingTop:12, borderTopWidth:1, borderTopColor:'rgba(255,255,255,0.12)' },
  earningsItem:       { flex:1, alignItems:'center' },
  earningsItemValue:  { fontSize:14, fontWeight:'900', color:'#FFF', marginBottom:2 },
  earningsItemLabel:  { fontSize:9, fontWeight:'700', color:'rgba(255,255,255,0.35)', textTransform:'uppercase' },
  earningsDivider:    { width:1, backgroundColor:'rgba(255,255,255,0.12)', marginVertical:2 },

  // Bar chart
  chartWrap:   { borderRadius:14, padding:12, marginBottom:14, backgroundColor:'rgba(0,0,0,0.2)', borderWidth:1, borderColor:'rgba(255,255,255,0.06)' },
  chartLegend: { flexDirection:'row', gap:12, marginTop:8, flexWrap:'wrap' },
  legendItem:  { flexDirection:'row', alignItems:'center', gap:4 },
  legendDot:   { width:8, height:8, borderRadius:4 },
  legendTxt:   { fontSize:9, fontWeight:'700', color:'rgba(255,255,255,0.4)' },

  // Progress cards
  progressCard:   { borderRadius:14, padding:12, marginBottom:10, borderWidth:1 },
  progressTopRow: { flexDirection:'row', justifyContent:'space-between', alignItems:'flex-start', marginBottom:8 },
  progressLabel:  { fontSize:12, fontWeight:'800', color:'#FFF' },
  progressSub:    { fontSize:9, color:'rgba(255,255,255,0.3)', fontWeight:'600', marginTop:2 },
  progressPct:    { fontSize:18, fontWeight:'900', letterSpacing:-0.5 },
  progressBg:     { height:6, borderRadius:6, backgroundColor:'rgba(255,255,255,0.08)', marginBottom:6 },
  progressFg:     { height:'100%' as DimensionValue, borderRadius:6 },
  progressFootRow:{ flexDirection:'row', justifyContent:'space-between' },
  progressFoot:   { fontSize:9, color:'rgba(255,255,255,0.3)', fontWeight:'600' },

  sectionDivider: { flexDirection:'row', alignItems:'center', gap:8, marginVertical:8 },
  dividerLine2:   { flex:1, height:1, backgroundColor:'rgba(255,255,255,0.08)' },
  dividerLabel:   { fontSize:9, fontWeight:'800', color:'rgba(255,255,255,0.22)', textTransform:'uppercase', letterSpacing:1 },

  statRow:    { flexDirection:'row', alignItems:'center', gap:10, paddingVertical:9 },
  statIcon:   { width:34, height:34, borderRadius:11, alignItems:'center', justifyContent:'center', flexShrink:0 },
  statTopRow: { flexDirection:'row', justifyContent:'space-between', alignItems:'baseline', marginBottom:4 },
  statLabel:  { fontSize:11, fontWeight:'700', color:'rgba(255,255,255,0.7)', flex:1 },
  statValue:  { fontSize:14, fontWeight:'900', color:'#FFF', marginLeft:4 },
  statBar:    { height:3, borderRadius:3, backgroundColor:'rgba(255,255,255,0.07)' },
  statBarFg:  { height:'100%' as DimensionValue, borderRadius:3, opacity:0.85 },
  statSub:    { fontSize:9, color:'rgba(255,255,255,0.25)', fontWeight:'500', marginTop:3 },

  patientsBtn:      { flexDirection:'row', alignItems:'center', justifyContent:'space-between', marginTop:8, height:44, borderRadius:14, paddingHorizontal:16, backgroundColor:'rgba(99,102,241,0.14)', borderWidth:1.5, borderColor:'rgba(99,102,241,0.38)' },
  patientsBtnText:  { fontSize:12, fontWeight:'800', color:'#A5B4FC' },
  patientsBtnArrow: { fontSize:20, color:'#A5B4FC', fontWeight:'300' },

  // Unused legacy – kept to avoid ref errors
  consultRate:    { padding:12, borderRadius:14, marginBottom:12, backgroundColor:'rgba(34,197,94,0.1)', borderWidth:1, borderColor:'rgba(34,197,94,0.2)' },
  consultRateRow: { flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginBottom:6 },
  consultRateLabel:{ fontSize:11, fontWeight:'700', color:'rgba(255,255,255,0.6)' },
  consultRatePct: { fontSize:14, fontWeight:'900', color:'#4ADE80' },
  consultRateSub: { fontSize:9, color:'rgba(255,255,255,0.3)', fontWeight:'600', marginTop:5 },
  sectionHeaderRow:{ flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginBottom:14 },
});
