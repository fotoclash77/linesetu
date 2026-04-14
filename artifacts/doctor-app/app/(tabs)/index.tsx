import React, { useState, useCallback, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Switch, Platform, DimensionValue,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { BG, TEAL, TEAL_LT } from '../../constants/theme';
import Svg, { Polyline, Polygon } from 'react-native-svg';
import { useDoctor } from '../../contexts/DoctorContext';

const BASE = () => `https://${process.env.EXPO_PUBLIC_DOMAIN}`;

const isWeb = Platform.OS === 'web';

type EarningPeriod = 'Today' | 'Last 7 days' | 'Last 30 days';

interface DashStats {
  earningsNormal: number; earningsEmergency: number; earningsTotal: number; spark: number[];
  total: number; consulted: number; noShow: number; waitlisted: number;
  emergency: number; onlineBooked: number; walkIn: number; followUp: number; newPatient: number;
}
const EMPTY_STATS: DashStats = {
  earningsNormal: 0, earningsEmergency: 0, earningsTotal: 0, spark: [0,0,0,0,0,0],
  total: 0, consulted: 0, noShow: 0, waitlisted: 0, emergency: 0,
  onlineBooked: 0, walkIn: 0, followUp: 0, newPatient: 0,
};

function isoDate(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

function Sparkline({ data, color }: { data: number[]; color: string }) {
  const w = 80, h = 30;
  const min = Math.min(...data), max = Math.max(...data);
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
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

export default function DashboardScreen() {
  const { doctor } = useDoctor();
  const [period, setPeriod] = useState<EarningPeriod>('Today');
  const [available, setAvailable] = useState(() => (doctor as any)?.isAvailable !== false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [stats, setStats] = useState<DashStats>(EMPTY_STATS);

  // Keep toggle in sync when doctor context hydrates from AsyncStorage
  const availSynced = React.useRef(false);
  useEffect(() => {
    if (!availSynced.current && doctor) {
      availSynced.current = true;
      setAvailable((doctor as any).isAvailable !== false);
    }
  }, [doctor]);

  // Fetch real token + earnings stats for the selected period
  useEffect(() => {
    if (!doctor?.id) return;
    const todayD = new Date();
    const toDate = isoDate(todayD);
    let fromDate = toDate;
    if (period === 'Last 7 days') {
      const d = new Date(todayD); d.setDate(d.getDate() - 6);
      fromDate = isoDate(d);
    } else if (period === 'Last 30 days') {
      const d = new Date(todayD); d.setDate(d.getDate() - 29);
      fromDate = isoDate(d);
    }
    const B = BASE();
    const tokenUrl = fromDate === toDate
      ? `${B}/api/tokens?doctorId=${doctor.id}&date=${toDate}`
      : `${B}/api/tokens?doctorId=${doctor.id}&from=${fromDate}&to=${toDate}`;
    Promise.all([
      fetch(tokenUrl).then(r => r.json()).catch(() => ({ tokens: [] })),
      fetch(`${B}/api/doctors/${doctor.id}/earnings?from=${fromDate}&to=${toDate}`)
        .then(r => r.json()).catch(() => ({ earnings: [] })),
    ]).then(([tokenRes, earningsRes]) => {
      const tokens: any[] = tokenRes.tokens ?? [];
      const edocs: any[] = earningsRes.earnings ?? [];
      const total       = tokens.length;
      const consulted   = tokens.filter(t => t.status === 'done').length;
      const noShow      = tokens.filter(t => t.status === 'cancelled' || t.status === 'skipped').length;
      const waitlisted  = tokens.filter(t => ['waiting','up_next','in_consult'].includes(t.status)).length;
      const emergency   = tokens.filter(t => t.type === 'emergency').length;
      const onlineBooked = tokens.filter(t => t.source !== 'walkin').length;
      const walkIn      = tokens.filter(t => t.source === 'walkin').length;
      const earningsTotal     = edocs.reduce((s, e) => s + (e.earned ?? 0), 0);
      const earningsNormal    = edocs.reduce((s, e) => s + ((e.tokensNormal ?? 0) * 10), 0);
      const earningsEmergency = edocs.reduce((s, e) => s + ((e.tokensEmergency ?? 0) * 20), 0);
      setStats({ total, consulted, noShow, waitlisted, emergency, onlineBooked, walkIn,
        followUp: 0, newPatient: 0, earningsNormal, earningsEmergency, earningsTotal,
        spark: [0, 0, 0, 0, 0, earningsTotal],
      });
    }).catch(() => {});
  }, [doctor?.id, period]);

  useEffect(() => {
    if (!doctor?.id) return;
    const fetchUnread = async () => {
      try {
        const res  = await fetch(`${BASE()}/api/notifications/${doctor.id}`);
        const data = await res.json();
        if (data.notifications) {
          setUnreadCount((data.notifications as any[]).filter((n: any) => !n.read).length);
        }
      } catch (_) {}
    };
    fetchUnread();
    const iv = setInterval(fetchUnread, 30_000);
    return () => clearInterval(iv);
  }, [doctor?.id]);

  const toggleAvailability = useCallback(async () => {
    const newVal = !available;
    setAvailable(newVal);
    if (!doctor?.id) return;
    try {
      await fetch(`${BASE()}/api/doctors/${doctor.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isAvailable: newVal }),
      });
    } catch {
      setAvailable(!newVal);
    }
  }, [available, doctor?.id]);

  const earn = { n1: stats.earningsNormal, n2: stats.earningsEmergency, total: stats.earningsTotal, spark: stats.spark };
  const pd   = stats;
  const fmt = (n: number) => n >= 1000 ? `₹${(n/1000).toFixed(1)}k` : `₹${n}`;
  const consultPct = pd.total > 0 ? Math.round((pd.consulted / pd.total) * 100) : 0;

  const now = new Date();
  const DOW_S = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const MON_S = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const headerDate = `${DOW_S[now.getDay()]}, ${now.getDate()} ${MON_S[now.getMonth()]} ${now.getFullYear()}`;
  const greetingTime = now.getHours() < 12 ? 'Morning' : now.getHours() < 17 ? 'Afternoon' : 'Evening';
  const greetingName = (doctor as any)?.name?.replace(/^Dr\.?\s*/i, '').split(' ')[0] ?? 'Doctor';

  interface PatientRow {
    label: string; value: number; sub: string; icon: string;
    color: string; spark: number[]; divider?: boolean;
  }
  const spark1 = (v: number) => [0,0,0,0,0,v];
  const patientRows: PatientRow[] = [
    { label: 'Total Patients',      value: pd.total,        sub: 'All registered',    icon: '👥', color: '#A5B4FC', spark: spark1(pd.total) },
    { label: 'Consulted',           value: pd.consulted,    sub: 'Seen by doctor',    icon: '✓',  color: '#4ADE80', spark: spark1(pd.consulted) },
    { label: 'Not Shown',           value: pd.noShow,       sub: 'Absent / skipped',  icon: '✗',  color: '#F87171', spark: spark1(pd.noShow) },
    { label: 'Waitlisted',          value: pd.waitlisted,   sub: 'Still in queue',    icon: '⏱', color: '#FCD34D', spark: spark1(pd.waitlisted) },
    { label: 'Emergency Patients',  value: pd.emergency,    sub: 'Priority tokens',   icon: '⚡', color: '#FB923C', spark: spark1(pd.emergency) },
    { label: 'Online Tokens',       value: pd.onlineBooked, sub: 'Via app',           icon: '📱', color: '#818CF8', spark: spark1(pd.onlineBooked), divider: true },
    { label: 'Walk-in Tokens',      value: pd.walkIn,       sub: 'Added at clinic',   icon: '🚶', color: '#34D399', spark: spark1(pd.walkIn) },
  ];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.container}>
        <View style={styles.glowTop} />
        <View style={styles.glowRight} />

        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerDate}>{headerDate}</Text>
            <Text style={styles.headerTitle}>
              Good {greetingTime}, <Text style={styles.headerName}>{greetingName}</Text>
            </Text>
          </View>
          <View style={styles.headerIcons}>
            <TouchableOpacity style={styles.bellBtn} onPress={() => router.push('/notifications')} activeOpacity={0.8}>
              <Text style={styles.bellIcon}>🔔</Text>
              {unreadCount > 0 && <View style={styles.bellDot} />}
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={{ paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Quick Controls */}
          <View style={styles.glassCard}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionDot}>⚡</Text>
              <Text style={styles.sectionTitle}>Quick Controls</Text>
            </View>

            {/* Availability toggle */}
            <TouchableOpacity
              onPress={toggleAvailability}
              style={[styles.availRow, available ? styles.availRowOn : styles.availRowOff]}
              activeOpacity={0.85}
            >
              <View style={styles.availLeft}>
                <View style={[styles.availDot, { backgroundColor: available ? '#22C55E' : '#EF4444' }]} />
                <View>
                  <Text style={styles.availTitle}>
                    {available ? 'Available' : 'Unavailable'}
                  </Text>
                  <Text style={[styles.availSub, { color: available ? '#4ADE80' : '#F87171' }]}>
                    {available ? 'Accepting patients now' : 'Not seeing patients'}
                  </Text>
                </View>
              </View>
              <Toggle value={available} onToggle={toggleAvailability} onColor="#22C55E" />
            </TouchableOpacity>


            {/* Quick actions */}
            <View style={styles.quickActions}>
              <TouchableOpacity style={styles.walkinBtn} onPress={() => router.push('/walkin')}>
                <Text style={styles.walkinBtnText}>✚ Add Walk-in</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.queueBtn} onPress={() => router.navigate('/(tabs)/queue' as any)}>
                <Text style={styles.queueBtnText}>⏱ View Queue</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Earnings Overview */}
          <View style={styles.earningsCard}>
            <View style={{ marginBottom: 14 }}>
              <View style={[styles.sectionHeader, { marginBottom: 10 }]}>
                <Text style={styles.sectionDot}>↗</Text>
                <Text style={styles.sectionTitle}>Earnings Overview</Text>
              </View>
              <View style={[styles.periodTabs, { alignSelf: 'flex-start' }]}>
                {(['Today','Last 7 days','Last 30 days'] as EarningPeriod[]).map(p => (
                  <TouchableOpacity key={p} onPress={() => setPeriod(p)} style={[styles.periodTab, period === p && styles.periodTabActive]}>
                    <Text style={[styles.periodTabText, period === p && styles.periodTabTextActive]}>{p}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.earningsTotal}>
              <View>
                <Text style={styles.earningsTotalLabel}>Total {period}</Text>
                <Text style={styles.earningsTotalValue}>{fmt(earn.total)}</Text>
              </View>
              <Sparkline data={earn.spark} color={TEAL_LT} />
            </View>

            <View style={styles.earningsRow}>
              <View style={styles.earningsItem}>
                <Text style={styles.earningsItemValue} numberOfLines={1}>{fmt(earn.n1)}</Text>
                <Text style={styles.earningsItemLabel}>Normal</Text>
              </View>
              <View style={styles.earningsDivider} />
              <View style={styles.earningsItem}>
                <Text style={[styles.earningsItemValue, { color: '#FCD34D' }]} numberOfLines={1}>{fmt(earn.n2)}</Text>
                <Text style={styles.earningsItemLabel}>Emergency</Text>
              </View>
              <View style={styles.earningsDivider} />
              <View style={styles.earningsItem}>
                <Text style={[styles.earningsItemValue, { color: '#4ADE80' }]} numberOfLines={1}>{fmt(earn.total)}</Text>
                <Text style={styles.earningsItemLabel}>Total</Text>
              </View>
            </View>
          </View>

          {/* Patient Data */}
          <View style={styles.glassCard}>
            <View style={{ marginBottom: 14 }}>
              <View style={[styles.sectionHeader, { marginBottom: 10 }]}>
                <Text style={styles.sectionDot}>📊</Text>
                <Text style={styles.sectionTitle}>Patient Data</Text>
                <TouchableOpacity style={styles.patientsBtn} onPress={() => router.push('/patients')}>
                  <Text style={styles.patientsBtnText}>👤  My Patients</Text>
                  <Text style={styles.patientsBtnArrow}>›</Text>
                </TouchableOpacity>
              </View>
              <View style={[styles.periodTabs, { alignSelf: 'flex-start' }]}>
                {(['Today','Last 7 days','Last 30 days'] as EarningPeriod[]).map(p => (
                  <TouchableOpacity key={p} onPress={() => setPeriod(p)} style={[styles.periodTab, period === p && styles.periodTabActive]}>
                    <Text style={[styles.periodTabText, period === p && styles.periodTabTextActive]}>{p}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Consultation rate */}
            <View style={styles.consultRate}>
              <View style={styles.consultRateRow}>
                <Text style={styles.consultRateLabel}>Consultation Rate</Text>
                <Text style={styles.consultRatePct}>{consultPct}%</Text>
              </View>
              <View style={styles.progressBg}>
                <View style={[styles.progressFg, { width: `${consultPct}%` as DimensionValue }]} />
              </View>
              <View style={styles.consultRateRow}>
                <Text style={styles.consultRateSub}>{pd.consulted} seen</Text>
                <Text style={styles.consultRateSub}>{pd.total} total</Text>
              </View>
            </View>

            {/* Stats rows */}
            {patientRows.map((row, i) => {
              const pct = Math.min(100, Math.round((row.value / pd.total) * 100));
              return (
                <React.Fragment key={row.label}>
                  {row.divider && (
                    <View style={styles.sectionDivider}>
                      <View style={styles.dividerLine2} />
                      <Text style={styles.dividerLabel}>BOOKING TYPE</Text>
                      <View style={styles.dividerLine2} />
                    </View>
                  )}
                  <View style={[styles.statRow, i > 0 && { borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)' }]}>
                    <View style={[styles.statIcon, { backgroundColor: `${row.color}22` }]}>
                      <Text style={{ fontSize: 14, color: row.color }}>{row.icon}</Text>
                    </View>
                    <View style={{ flex: 1, minWidth: 0 }}>
                      <View style={styles.statTopRow}>
                        <Text style={styles.statLabel} numberOfLines={1}>{row.label}</Text>
                        <Text style={styles.statValue}>{row.value}</Text>
                      </View>
                      <View style={styles.statBar}>
                        <View style={[styles.statBarFg, { width: `${pct}%` as DimensionValue, backgroundColor: row.color }]} />
                      </View>
                      <Text style={styles.statSub}>{row.sub}</Text>
                    </View>
                    <Sparkline data={row.spark} color={row.color} />
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

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG, ...(isWeb && { paddingTop: 44 }) },
  container: { flex: 1, backgroundColor: BG },
  glowTop: {
    position: 'absolute', top: -80, left: -60, width: 280, height: 280, borderRadius: 140,
    backgroundColor: 'rgba(13,148,136,0.22)', opacity: 0.5,
  },
  glowRight: {
    position: 'absolute', top: 350, right: -80, width: 220, height: 220, borderRadius: 110,
    backgroundColor: 'rgba(6,182,212,0.13)', opacity: 0.5,
  },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 18, paddingTop: 18, paddingBottom: 10,
  },
  headerDate: { fontSize: 11, color: 'rgba(255,255,255,0.35)', fontWeight: '600' },
  headerTitle: { fontSize: 19, fontWeight: '900', color: '#FFF', letterSpacing: -0.4 },
  headerName: { color: TEAL_LT },
  headerIcons: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  bellBtn: {
    width: 38, height: 38, borderRadius: 13, backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center',
    position: 'relative',
  },
  bellIcon: { fontSize: 17 },
  bellDot: { position: 'absolute', top: 6, right: 7, width: 8, height: 8, borderRadius: 4, backgroundColor: '#EF4444', borderWidth: 1.5, borderColor: BG },
  scroll: { flex: 1, paddingHorizontal: 16 },
  glassCard: {
    borderRadius: 22, padding: 14, marginBottom: 12,
    backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.09)',
  },
  earningsCard: {
    borderRadius: 22, padding: 16, marginBottom: 12,
    backgroundColor: 'rgba(13,148,136,0.2)', borderWidth: 1.5, borderColor: 'rgba(45,212,191,0.22)',
  },
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 },
  sectionDot: { fontSize: 14, color: TEAL_LT },
  sectionTitle: { fontSize: 12, fontWeight: '800', color: '#FFF' },
  availRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 14, borderRadius: 16, marginBottom: 10, borderWidth: 1.5,
  },
  availRowOn: { backgroundColor: 'rgba(34,197,94,0.08)', borderColor: 'rgba(34,197,94,0.3)' },
  availRowOff: { backgroundColor: 'rgba(239,68,68,0.08)', borderColor: 'rgba(239,68,68,0.3)' },
  availLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  availDot: { width: 10, height: 10, borderRadius: 5 },
  availTitle: { fontSize: 14, fontWeight: '800', color: '#FFF' },
  availSub: { fontSize: 10, fontWeight: '600', marginTop: 1 },
  toggle: { width: 46, height: 26, borderRadius: 13, justifyContent: 'center', borderWidth: 1, position: 'relative' },
  toggleOff: { backgroundColor: 'rgba(255,255,255,0.1)', borderColor: 'rgba(255,255,255,0.15)' },
  toggleThumb: { position: 'absolute', width: 18, height: 18, borderRadius: 9, backgroundColor: '#FFF' },
  toggleThumbOn: { right: 3 },
  toggleThumbOff: { left: 3 },
  quickActions: { flexDirection: 'row', gap: 8 },
  walkinBtn: {
    flex: 1, height: 46, borderRadius: 14, backgroundColor: TEAL,
    alignItems: 'center', justifyContent: 'center',
  },
  walkinBtnText: { fontSize: 12, fontWeight: '800', color: '#FFF' },
  queueBtn: {
    flex: 1, height: 46, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.07)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)', alignItems: 'center', justifyContent: 'center',
  },
  queueBtnText: { fontSize: 12, fontWeight: '800', color: 'rgba(255,255,255,0.75)' },
  periodTabs: { flexDirection: 'row', gap: 4, padding: 3, borderRadius: 12, backgroundColor: 'rgba(0,0,0,0.3)' },
  periodTab: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  periodTabActive: { backgroundColor: TEAL },
  periodTabText: { fontSize: 10, fontWeight: '800', color: 'rgba(255,255,255,0.4)' },
  periodTabTextActive: { color: '#FFF' },
  earningsTotal: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 },
  earningsTotalLabel: { fontSize: 10, color: 'rgba(255,255,255,0.4)', fontWeight: '600', marginBottom: 4 },
  earningsTotalValue: { fontSize: 28, fontWeight: '900', color: '#FFF', letterSpacing: -1 },
  earningsRow: { flexDirection: 'row', paddingTop: 12, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.12)' },
  earningsItem: { flex: 1, alignItems: 'center' },
  earningsItemValue: { fontSize: 14, fontWeight: '900', color: '#FFF', marginBottom: 2 },
  earningsItemLabel: { fontSize: 9, fontWeight: '700', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase' },
  earningsDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.12)', marginVertical: 2 },
  consultRate: {
    padding: 12, borderRadius: 14, marginBottom: 12,
    backgroundColor: 'rgba(34,197,94,0.1)', borderWidth: 1, borderColor: 'rgba(34,197,94,0.2)',
  },
  consultRateRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  consultRateLabel: { fontSize: 11, fontWeight: '700', color: 'rgba(255,255,255,0.6)' },
  consultRatePct: { fontSize: 14, fontWeight: '900', color: '#4ADE80' },
  consultRateSub: { fontSize: 9, color: 'rgba(255,255,255,0.3)', fontWeight: '600', marginTop: 5 },
  progressBg: { height: 5, borderRadius: 5, backgroundColor: 'rgba(255,255,255,0.08)' },
  progressFg: { height: '100%', borderRadius: 5, backgroundColor: TEAL },
  sectionDivider: { flexDirection: 'row', alignItems: 'center', gap: 8, marginVertical: 8 },
  dividerLine2: { flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.08)' },
  dividerLabel: { fontSize: 9, fontWeight: '800', color: 'rgba(255,255,255,0.22)', textTransform: 'uppercase', letterSpacing: 1 },
  statRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 9 },
  statIcon: { width: 34, height: 34, borderRadius: 11, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  statTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4 },
  statLabel: { fontSize: 11, fontWeight: '700', color: 'rgba(255,255,255,0.7)', flex: 1 },
  statValue: { fontSize: 14, fontWeight: '900', color: '#FFF', marginLeft: 4 },
  statBar: { height: 3, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.07)' },
  statBarFg: { height: '100%', borderRadius: 3, opacity: 0.85 },
  statSub: { fontSize: 9, color: 'rgba(255,255,255,0.25)', fontWeight: '500', marginTop: 3 },
  patientsBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginTop: 8, height: 44, borderRadius: 14, paddingHorizontal: 16,
    backgroundColor: 'rgba(99,102,241,0.14)', borderWidth: 1.5, borderColor: 'rgba(99,102,241,0.38)',
  },
  patientsBtnText: { fontSize: 12, fontWeight: '800', color: '#A5B4FC' },
  patientsBtnArrow: { fontSize: 20, color: '#A5B4FC', fontWeight: '300' },
});
