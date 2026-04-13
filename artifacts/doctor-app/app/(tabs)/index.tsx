import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Switch, Platform, DimensionValue,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { BG, TEAL, TEAL_LT } from '../../constants/theme';
import Svg, { Polyline, Polygon } from 'react-native-svg';

const isWeb = Platform.OS === 'web';

type EarningPeriod = 'Today' | 'Last 7 days' | 'Last Month';
type PatientPeriod = 'Today' | 'Last 7 days' | 'Last Month';

const EARNINGS = {
  Today:   { n1:  540,  n2:  300,  total:   840,  spark: [620,740,580,920,760,840] },
  'Last 7 days':  { n1: 3400,  n2: 1900,  total:  5300,  spark: [4100,5000,4500,5700,4900,5300] },
  'Last Month': { n1:13400,  n2: 7500,  total: 20900,  spark: [17200,19000,18400,21600,20100,20900] },
};

const PATIENT_DATA = {
  Today:   { total: 29,  consulted: 18,  noShow: 4,  waitlisted: 7,   emergency: 3,  walkIn: 8,
             onlineBooked: 21, followUp: 11, newPatient: 8,
    consultedSpark: [12,16,14,19,15,18], noShowSpark: [2,4,3,5,3,4], waitSpark: [8,6,9,5,7,7],
    onlineSpark: [14,18,16,22,19,21], followUpSpark: [7,10,9,12,10,11], newSpark: [4,7,5,9,6,8] },
  'Last 7 days':  { total: 184, consulted: 121, noShow: 24, waitlisted: 39,  emergency: 18, walkIn: 46,
             onlineBooked: 138, followUp: 73, newPatient: 48,
    consultedSpark: [95,112,108,125,115,121], noShowSpark: [18,22,20,26,21,24], waitSpark: [42,36,44,30,38,39],
    onlineSpark: [108,125,118,142,130,138], followUpSpark: [55,68,62,78,68,73], newSpark: [35,44,40,52,44,48] },
  'Last Month': { total: 736, consulted: 484, noShow: 96, waitlisted: 156, emergency: 72, walkIn: 184,
             onlineBooked: 552, followUp: 292, newPatient: 192,
    consultedSpark: [420,455,470,440,468,484], noShowSpark: [78,90,85,98,88,96], waitSpark: [168,145,175,130,152,156],
    onlineSpark: [430,498,472,568,520,552], followUpSpark: [220,272,248,312,272,292], newSpark: [140,176,160,208,176,192] },
};

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
  const [period, setPeriod] = useState<EarningPeriod>('Today');
  const [available, setAvailable] = useState(true);
  const [bookingOn, setBookingOn] = useState(true);
  const [patientPeriod, setPatientPeriod] = useState<PatientPeriod>('Today');

  const earn = EARNINGS[period];
  const pd = PATIENT_DATA[patientPeriod];
  const fmt = (n: number) => n >= 1000 ? `₹${(n/1000).toFixed(1)}k` : `₹${n}`;
  const consultPct = Math.round((pd.consulted / pd.total) * 100);

  interface PatientRow {
    label: string; value: number; sub: string; icon: string;
    color: string; spark: number[]; divider?: boolean;
  }
  const patientRows: PatientRow[] = [
    { label: 'Total Patients',      value: pd.total,       sub: 'All registered',        icon: '👥', color: '#A5B4FC', spark: [20,24,22,28,25,pd.total] },
    { label: 'Consulted',           value: pd.consulted,   sub: 'Seen by doctor',         icon: '✓',  color: '#4ADE80', spark: pd.consultedSpark },
    { label: 'Not Shown',           value: pd.noShow,      sub: 'Absent / skipped',       icon: '✗',  color: '#F87171', spark: pd.noShowSpark },
    { label: 'Waitlisted',          value: pd.waitlisted,  sub: 'Still in queue',         icon: '⏱', color: '#FCD34D', spark: pd.waitSpark },
    { label: 'Emergency Patients',  value: pd.emergency,   sub: 'Priority tokens',        icon: '⚡', color: '#FB923C', spark: [1,3,2,4,2,pd.emergency] },
    { label: 'Online Token Booked', value: pd.onlineBooked,sub: 'Via app',                icon: '📱', color: '#818CF8', spark: pd.onlineSpark, divider: true },
    { label: 'Follow-up Patients',  value: pd.followUp,    sub: 'Returning patients',     icon: '↩', color: '#34D399', spark: pd.followUpSpark },
    { label: 'New Patients',        value: pd.newPatient,  sub: 'First-time visit',       icon: '★',  color: '#F9A8D4', spark: pd.newSpark },
  ];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.container}>
        <View style={styles.glowTop} />
        <View style={styles.glowRight} />

        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerDate}>Fri, 10 Apr 2026</Text>
            <Text style={styles.headerTitle}>
              Good Morning, <Text style={styles.headerName}>Dr. Sharma</Text>
            </Text>
          </View>
          <View style={styles.headerIcons}>
            <View style={styles.bellBtn}>
              <Text style={styles.bellIcon}>🔔</Text>
              <View style={styles.bellDot} />
            </View>
            <View style={styles.avatarBtn}>
              <Text style={styles.avatarIcon}>⚕</Text>
            </View>
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
              onPress={() => setAvailable(p => !p)}
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
              <Toggle value={available} onToggle={() => setAvailable(p => !p)} onColor="#22C55E" />
            </TouchableOpacity>

            {/* Booking toggle */}
            <View style={[styles.bookingRow, bookingOn ? styles.bookingRowOn : styles.bookingRowOff]}>
              <View>
                <Text style={styles.bookingTitle}>E-Token Booking</Text>
                <Text style={[styles.bookingStatus, { color: bookingOn ? TEAL_LT : 'rgba(255,255,255,0.3)' }]}>
                  {bookingOn ? 'Accepting new patients' : 'Bookings paused'}
                </Text>
              </View>
              <Toggle value={bookingOn} onToggle={() => setBookingOn(p => !p)} onColor={TEAL} />
            </View>

            {/* Quick actions */}
            <View style={styles.quickActions}>
              <TouchableOpacity style={styles.walkinBtn} onPress={() => router.push('/walkin')}>
                <Text style={styles.walkinBtnText}>✚ Add Walk-in</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.queueBtn} onPress={() => router.push('/(tabs)/queue')}>
                <Text style={styles.queueBtnText}>👥 View Queue</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Earnings Overview */}
          <View style={styles.earningsCard}>
            <View style={styles.sectionHeaderRow}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionDot}>↗</Text>
                <Text style={styles.sectionTitle}>Earnings Overview</Text>
              </View>
              <View style={styles.periodTabs}>
                {(['Today','Last 7 days','Last Month'] as EarningPeriod[]).map(p => (
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
            <View style={styles.sectionHeaderRow}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionDot}>📊</Text>
                <Text style={styles.sectionTitle}>Patient Data</Text>
              </View>
              <View style={styles.periodTabs}>
                {(['Today','Last 7 days','Last Month'] as PatientPeriod[]).map(p => (
                  <TouchableOpacity key={p} onPress={() => setPatientPeriod(p)} style={[styles.periodTab, patientPeriod === p && styles.periodTabActive]}>
                    <Text style={[styles.periodTabText, patientPeriod === p && styles.periodTabTextActive]}>{p}</Text>
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
  avatarBtn: {
    width: 38, height: 38, borderRadius: 13, backgroundColor: TEAL, alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: 'rgba(45,212,191,0.3)',
  },
  avatarIcon: { fontSize: 18, color: '#FFF' },
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
  bookingRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 12, borderRadius: 14, marginBottom: 12, borderWidth: 1,
  },
  bookingRowOn: { backgroundColor: 'rgba(45,212,191,0.08)', borderColor: 'rgba(45,212,191,0.25)' },
  bookingRowOff: { backgroundColor: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.07)' },
  bookingTitle: { fontSize: 13, fontWeight: '700', color: '#FFF' },
  bookingStatus: { fontSize: 10, fontWeight: '600', marginTop: 2 },
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
});
