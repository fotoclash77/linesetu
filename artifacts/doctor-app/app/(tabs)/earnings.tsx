import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, DimensionValue,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BG, TEAL, TEAL_LT } from '../../constants/theme';
import Svg, { Polyline, Path, Defs, LinearGradient, Stop } from 'react-native-svg';

type Period = 'Today' | 'Week' | 'Month' | 'LastMonth' | 'AllTime';

const PERIOD_DATA = {
  Today:     { label: 'Today',      total: 840,    online: 540,   emergency: 300,  normalCount: 7,   emergCount: 2,  trend: 5.2 },
  Week:      { label: 'This Week',  total: 5880,   online: 3780,  emergency: 2100, normalCount: 54,  emergCount: 15, trend: 8.4 },
  Month:     { label: 'This Month', total: 25200,  online: 16200, emergency: 9000, normalCount: 231, emergCount: 64, trend: 12.1 },
  LastMonth: { label: 'Last Month', total: 21600,  online: 14400, emergency: 7200, normalCount: 206, emergCount: 51, trend: -3.2 },
  AllTime:   { label: 'Lifetime',   total: 206500, online: 134500,emergency: 72000,normalCount: 1920,emergCount: 514,trend: 0 },
};

const PAYOUTS = [
  { id: 'P2026041', date: 'Today, 10 Apr',  amount: 8400,  status: 'processing', utr: null,            note: 'Processing – expected by midnight' },
  { id: 'P2026040', date: 'Tue, 8 Apr',     amount: 12400, status: 'paid',       utr: 'HDFC82631047', note: 'Transferred to HDFC ••4782' },
  { id: 'P2026039', date: 'Tue, 1 Apr',     amount: 18750, status: 'paid',       utr: 'ICIC74920163', note: 'Transferred to HDFC ••4782' },
  { id: 'P2026038', date: 'Tue, 25 Mar',    amount: 9850,  status: 'paid',       utr: 'HDFC61830294', note: 'Transferred to HDFC ••4782' },
  { id: 'P2026037', date: 'Tue, 18 Mar',    amount: 15200, status: 'paid',       utr: 'HDFC50192837', note: 'Transferred to HDFC ••4782' },
];
const PENDING_AMOUNT = 17950;
const PROCESSING_AMOUNT = 8400;
const TOTAL_PAID = PAYOUTS.filter(p => p.status === 'paid').reduce((a, p) => a + p.amount, 0);
const AVAILABLE = PENDING_AMOUNT;

const fmt = (n: number) =>
  n >= 100000 ? `₹${(n/100000).toFixed(2)}L`
  : n >= 1000  ? `₹${(n/1000).toFixed(1)}k`
  : `₹${n}`;
const fmtFull = (n: number) => `₹${n.toLocaleString('en-IN')}`;

function MiniSparkline({ data, color }: { data: number[]; color: string }) {
  const w = 60, h = 22;
  const mn = Math.min(...data), mx = Math.max(...data);
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - mn) / (mx - mn + 0.001)) * h;
    return `${x},${y}`;
  });
  const linePoints = pts.join(' ');
  const areaPath = `M0,${h} L${pts.join(' L')} L${w},${h} Z`;
  const gradId = `g${color.replace('#','')}`;
  return (
    <Svg width={w} height={h}>
      <Defs>
        <LinearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%" stopColor={color} stopOpacity={0.35} />
          <Stop offset="100%" stopColor={color} stopOpacity={0.02} />
        </LinearGradient>
      </Defs>
      <Path d={areaPath} fill={`url(#${gradId})`} />
      <Polyline points={linePoints} fill="none" stroke={color} strokeWidth={1.5} strokeLinejoin="round" strokeLinecap="round" />
    </Svg>
  );
}

export default function EarningsScreen() {
  const [tab, setTab] = useState<'earnings' | 'payouts'>('earnings');
  const [period, setPeriod] = useState<Period>('Month');

  const d = PERIOD_DATA[period];
  const weekSpark = [14200, 16800, 13400, 19600, 17200, 22100, 19600];

  const rows = [
    { label: 'Online Normal Token',    value: d.online,    count: d.normalCount, icon: '📱', color: '#A5B4FC', bg: 'rgba(99,102,241,0.15)', rate: '₹10/token' },
    { label: 'Online Emergency Token', value: d.emergency, count: d.emergCount,  icon: '⚡', color: '#FCD34D', bg: 'rgba(245,158,11,0.15)', rate: '₹20/token' },
  ];

  const payoutStatusCfg = {
    paid:       { color: '#4ADE80', bg: 'rgba(74,222,128,0.1)',   icon: '✓' },
    processing: { color: '#67E8F9', bg: 'rgba(103,232,249,0.08)', icon: '↻' },
    pending:    { color: '#FCD34D', bg: 'rgba(252,211,77,0.08)',  icon: '⏱' },
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.container}>
        <View style={styles.glowTop} />
        <View style={styles.glowRight} />

        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>My Earnings</Text>
            <Text style={styles.headerSub}>Dr. Ananya Sharma · LINESETU</Text>
          </View>
          <View style={{ flexDirection: 'row', gap: 7 }}>
            <View style={styles.iconBtn}><Text style={styles.iconBtnText}>⬇</Text></View>
            <View style={[styles.iconBtn, { position: 'relative' }]}>
              <Text style={styles.iconBtnText}>🔔</Text>
              <View style={styles.notifDot} />
            </View>
          </View>
        </View>

        {/* Balance Hero */}
        <View style={styles.heroCard}>
          <View style={styles.heroTop}>
            <View>
              <Text style={styles.heroBalanceLabel}>Available Balance</Text>
              <Text style={styles.heroBalance}>{fmtFull(AVAILABLE)}</Text>
              <Text style={styles.heroReady}>✓ Ready for payout · Settles every Tuesday</Text>
            </View>
            <TouchableOpacity style={styles.withdrawBtn}>
              <Text style={styles.withdrawBtnText}>💳 Withdraw</Text>
            </TouchableOpacity>
          </View>
          {/* 3-stat strip */}
          <View style={styles.heroStats}>
            {[
              { label: 'Paid Out',   value: fmtFull(TOTAL_PAID),        color: '#4ADE80', sub: `${PAYOUTS.filter(p=>p.status==='paid').length} payouts` },
              { label: 'Processing', value: fmtFull(PROCESSING_AMOUNT),  color: '#67E8F9', sub: 'By midnight' },
              { label: 'Pending',    value: fmtFull(PENDING_AMOUNT),     color: '#FCD34D', sub: 'Next settlement' },
            ].map((s, i) => (
              <React.Fragment key={i}>
                {i > 0 && <View style={styles.heroStatDivider} />}
                <View style={styles.heroStat}>
                  <Text style={[styles.heroStatValue, { color: s.color }]}>{s.value}</Text>
                  <Text style={styles.heroStatLabel}>{s.label}</Text>
                  <Text style={styles.heroStatSub}>{s.sub}</Text>
                </View>
              </React.Fragment>
            ))}
          </View>
        </View>

        {/* Tab bar */}
        <View style={styles.mainTabs}>
          {([['earnings','Earnings'],['payouts','Payouts']] as const).map(([k, l]) => (
            <TouchableOpacity key={k} onPress={() => setTab(k)} style={[styles.mainTab, tab === k && styles.mainTabActive]}>
              <Text style={[styles.mainTabText, tab === k && styles.mainTabTextActive]}>{l}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 14, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
          {tab === 'earnings' && (
            <>
              {/* Period selector */}
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
                <View style={{ flexDirection: 'row', gap: 5 }}>
                  {(['Today','Week','Month','LastMonth','AllTime'] as Period[]).map(p => (
                    <TouchableOpacity key={p} onPress={() => setPeriod(p)} style={[styles.periodChip, period === p && styles.periodChipActive]}>
                      <Text style={[styles.periodChipText, period === p && styles.periodChipTextActive]}>{PERIOD_DATA[p].label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>

              {/* Total + trend */}
              <View style={styles.glassCard}>
                <View style={styles.totalRow}>
                  <View>
                    <Text style={styles.totalLabel}>Total — {PERIOD_DATA[period].label}</Text>
                    <Text style={styles.totalValue}>{fmtFull(d.total)}</Text>
                    {period !== 'AllTime' && (
                      <Text style={[styles.trendText, { color: d.trend >= 0 ? '#4ADE80' : '#F87171' }]}>
                        {d.trend >= 0 ? '↑' : '↓'} {d.trend >= 0 ? '+' : ''}{d.trend}% vs previous
                      </Text>
                    )}
                  </View>
                  <MiniSparkline data={weekSpark} color={TEAL_LT} />
                </View>
                <View style={{ flexDirection: 'row', gap: 5, flexWrap: 'wrap', marginTop: 12 }}>
                  {[
                    { label: `${d.normalCount} Normal`, color: '#A5B4FC' },
                    { label: `${d.emergCount} Emergency`, color: '#FCD34D' },
                  ].map(c => (
                    <View key={c.label} style={[styles.countChip, { backgroundColor: `${c.color}18`, borderColor: `${c.color}33` }]}>
                      <Text style={[styles.countChipText, { color: c.color }]}>{c.label}</Text>
                    </View>
                  ))}
                </View>
              </View>

              {/* Breakdown */}
              <View style={[styles.glassCard, { marginTop: 10 }]}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionDot}>📊</Text>
                  <Text style={styles.sectionTitle}>Earnings Breakdown</Text>
                </View>
                {rows.map((row) => {
                  const pct = Math.round((row.value / d.total) * 100);
                  return (
                    <View key={row.label} style={styles.breakdownRow}>
                      <View style={styles.breakdownTop}>
                        <View style={[styles.breakdownIcon, { backgroundColor: row.bg }]}>
                          <Text style={{ fontSize: 13, color: row.color }}>{row.icon}</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                          <View style={styles.breakdownTopRow}>
                            <Text style={styles.breakdownLabel} numberOfLines={1}>{row.label}</Text>
                            <Text style={styles.breakdownValue}>{fmt(row.value)}</Text>
                          </View>
                          <View style={styles.breakdownTopRow}>
                            <Text style={styles.breakdownSub}>{row.count} × {row.rate}</Text>
                            <Text style={[styles.breakdownPct, { color: row.color }]}>{pct}%</Text>
                          </View>
                        </View>
                      </View>
                      <View style={styles.barBg}>
                        <View style={[styles.barFg, { width: `${pct}%` as DimensionValue, backgroundColor: row.color }]} />
                      </View>
                    </View>
                  );
                })}
              </View>

              {/* Rate Card */}
              <View style={[styles.glassCard, { marginTop: 10 }]}>
                <View style={styles.sectionHeaderRow}>
                  <View style={styles.sectionHeader}>
                    <Text style={styles.sectionDot}>🛡</Text>
                    <Text style={styles.sectionTitle}>Your Rate Card</Text>
                  </View>
                  <Text style={styles.platformSetText}>Platform-set</Text>
                </View>
                {[
                  { type: 'Online Normal Token',   earn: '₹10', platform: '₹10', patient: '₹20' },
                  { type: 'Online Emergency Token', earn: '₹20', platform: '₹10', patient: '₹30' },
                ].map(r => (
                  <View key={r.type} style={styles.rateRow}>
                    <Text style={styles.rateType} numberOfLines={1}>{r.type}</Text>
                    <View style={{ flexDirection: 'row', gap: 10 }}>
                      {[{ v: r.earn, c: '#4ADE80', l: 'You earn' }, { v: r.platform, c: '#F87171', l: 'Platform' }, { v: r.patient, c: 'rgba(255,255,255,0.6)', l: 'Patient' }].map(s => (
                        <View key={s.l} style={{ alignItems: 'center' }}>
                          <Text style={[styles.rateVal, { color: s.c }]}>{s.v}</Text>
                          <Text style={styles.rateSub}>{s.l}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                ))}
              </View>
            </>
          )}

          {tab === 'payouts' && (
            <>
              {/* Payout status summary */}
              <View style={styles.payoutSummary}>
                {[
                  { label: 'Total Paid',  value: fmtFull(TOTAL_PAID),       color: '#4ADE80', bg: 'rgba(74,222,128,0.1)',   icon: '✓' },
                  { label: 'Processing',  value: fmtFull(PROCESSING_AMOUNT), color: '#67E8F9', bg: 'rgba(103,232,249,0.08)', icon: '↻' },
                  { label: 'Upcoming',    value: fmtFull(PENDING_AMOUNT),    color: '#FCD34D', bg: 'rgba(252,211,77,0.08)',  icon: '⏱' },
                ].map(s => (
                  <View key={s.label} style={[styles.summaryCard, { backgroundColor: s.bg, borderColor: `${s.color}33` }]}>
                    <Text style={{ fontSize: 16, color: s.color, marginBottom: 6 }}>{s.icon}</Text>
                    <Text style={[styles.summaryValue, { color: s.color }]}>{s.value}</Text>
                    <Text style={styles.summaryLabel}>{s.label}</Text>
                  </View>
                ))}
              </View>

              {/* Bank info */}
              <View style={styles.bankCard}>
                <View style={styles.bankIcon}>
                  <Text style={{ fontSize: 16, color: TEAL_LT }}>🏦</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.bankName}>HDFC Bank ••••4782</Text>
                  <Text style={styles.bankSub}>Weekly auto-settlement · Every Tuesday</Text>
                </View>
                <View style={styles.verifiedBadge}>
                  <Text style={styles.verifiedBadgeText}>Verified</Text>
                </View>
              </View>

              {/* Settlement note */}
              <View style={styles.settlementNote}>
                <Text style={{ fontSize: 13, color: '#FCD34D' }}>ℹ</Text>
                <Text style={styles.settlementNoteText}>
                  Earnings settle automatically every Tuesday. LINESETU platform fee is deducted before transfer.
                </Text>
              </View>

              {/* Payout list */}
              <View style={[styles.glassCard, { marginTop: 0 }]}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionDot}>📋</Text>
                  <Text style={styles.sectionTitle}>Payout History</Text>
                </View>
                {PAYOUTS.map((p) => {
                  const cfg = p.status === 'paid' ? { color: '#4ADE80', bg: 'rgba(74,222,128,0.1)', label: 'Paid' } :
                    p.status === 'processing' ? { color: '#67E8F9', bg: 'rgba(103,232,249,0.08)', label: 'Processing' } :
                    { color: '#FCD34D', bg: 'rgba(252,211,77,0.08)', label: 'Pending' };
                  return (
                    <View key={p.id} style={styles.payoutRow}>
                      <View style={[styles.payoutIcon, { backgroundColor: cfg.bg }]}>
                        <Text style={{ color: cfg.color, fontSize: 14 }}>{p.status === 'paid' ? '✓' : p.status === 'processing' ? '↻' : '⏱'}</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <View style={styles.payoutTopRow}>
                          <Text style={styles.payoutDate}>{p.date}</Text>
                          <Text style={styles.payoutAmount}>{fmtFull(p.amount)}</Text>
                        </View>
                        <Text style={styles.payoutNote}>{p.note}</Text>
                        {p.utr && <Text style={styles.payoutUtr}>UTR: {p.utr}</Text>}
                      </View>
                      <View style={[styles.payoutStatusBadge, { backgroundColor: cfg.bg, borderColor: `${cfg.color}44` }]}>
                        <Text style={[styles.payoutStatusText, { color: cfg.color }]}>{cfg.label}</Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            </>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  container: { flex: 1, backgroundColor: BG },
  glowTop: { position: 'absolute', top: -80, left: -40, width: 260, height: 260, borderRadius: 130, backgroundColor: 'rgba(13,148,136,0.2)', opacity: 0.5 },
  glowRight: { position: 'absolute', top: 360, right: -60, width: 200, height: 200, borderRadius: 100, backgroundColor: 'rgba(99,102,241,0.12)', opacity: 0.5 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 18, paddingBottom: 8 },
  headerTitle: { fontSize: 19, fontWeight: '900', color: '#FFF', letterSpacing: -0.4 },
  headerSub: { fontSize: 11, color: 'rgba(255,255,255,0.35)', fontWeight: '600', marginTop: 1 },
  iconBtn: { width: 36, height: 36, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' },
  iconBtnText: { fontSize: 15 },
  notifDot: { position: 'absolute', top: 7, right: 8, width: 7, height: 7, borderRadius: 3.5, backgroundColor: '#EF4444', borderWidth: 1.5, borderColor: BG },
  heroCard: {
    margin: 14, marginTop: 0, marginBottom: 0, borderRadius: 22, padding: 18,
    backgroundColor: 'rgba(13,148,136,0.22)', borderWidth: 1.5, borderColor: 'rgba(45,212,191,0.25)',
  },
  heroTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 },
  heroBalanceLabel: { fontSize: 11, fontWeight: '600', color: 'rgba(255,255,255,0.4)', marginBottom: 4 },
  heroBalance: { fontSize: 34, fontWeight: '900', color: '#FFF', letterSpacing: -1.5, lineHeight: 38 },
  heroReady: { fontSize: 10, color: '#4ADE80', fontWeight: '700', marginTop: 5 },
  withdrawBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 14, backgroundColor: TEAL_LT },
  withdrawBtnText: { fontSize: 11, fontWeight: '800', color: '#FFF' },
  heroStats: { flexDirection: 'row', paddingTop: 12, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.12)' },
  heroStat: { flex: 1, alignItems: 'center', padding: 4 },
  heroStatValue: { fontSize: 13, fontWeight: '900', letterSpacing: -0.5 },
  heroStatLabel: { fontSize: 9, fontWeight: '700', color: 'rgba(255,255,255,0.5)', marginTop: 2 },
  heroStatSub: { fontSize: 8, color: 'rgba(255,255,255,0.3)', fontWeight: '500', marginTop: 1 },
  heroStatDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.1)', marginVertical: 2 },
  mainTabs: { flexDirection: 'row', margin: 14, marginBottom: 10, padding: 4, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)' },
  mainTab: { flex: 1, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  mainTabActive: { backgroundColor: TEAL },
  mainTabText: { fontSize: 12, fontWeight: '800', color: 'rgba(255,255,255,0.4)' },
  mainTabTextActive: { color: '#FFF' },
  glassCard: { borderRadius: 20, padding: 14, backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.09)' },
  periodChip: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.06)' },
  periodChipActive: { backgroundColor: TEAL },
  periodChipText: { fontSize: 10, fontWeight: '800', color: 'rgba(255,255,255,0.4)' },
  periodChipTextActive: { color: '#FFF' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  totalLabel: { fontSize: 10, color: 'rgba(255,255,255,0.35)', fontWeight: '600', marginBottom: 3 },
  totalValue: { fontSize: 28, fontWeight: '900', color: '#FFF', letterSpacing: -1 },
  trendText: { fontSize: 11, fontWeight: '700', marginTop: 5 },
  countChip: { paddingHorizontal: 9, paddingVertical: 4, borderRadius: 20, borderWidth: 1 },
  countChipText: { fontSize: 9, fontWeight: '700' },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 },
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionDot: { fontSize: 13, color: TEAL_LT },
  sectionTitle: { fontSize: 12, fontWeight: '800', color: '#FFF' },
  platformSetText: { fontSize: 9, fontWeight: '600', color: 'rgba(255,255,255,0.3)' },
  breakdownRow: { paddingBottom: 11, marginBottom: 11, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
  breakdownTop: { flexDirection: 'row', alignItems: 'center', gap: 9, marginBottom: 7 },
  breakdownIcon: { width: 30, height: 30, borderRadius: 10, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  breakdownTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', flex: 1 },
  breakdownLabel: { fontSize: 11, fontWeight: '600', color: 'rgba(255,255,255,0.7)', flex: 1 },
  breakdownValue: { fontSize: 13, fontWeight: '900', color: '#FFF' },
  breakdownSub: { fontSize: 9, color: 'rgba(255,255,255,0.3)', fontWeight: '600' },
  breakdownPct: { fontSize: 9, fontWeight: '700' },
  barBg: { height: 4, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.06)' },
  barFg: { height: '100%', borderRadius: 4, opacity: 0.9 },
  rateRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 7, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)' },
  rateType: { flex: 1, fontSize: 10, color: 'rgba(255,255,255,0.55)', fontWeight: '600' },
  rateVal: { fontSize: 11, fontWeight: '800' },
  rateSub: { fontSize: 7, color: 'rgba(255,255,255,0.25)', fontWeight: '600' },
  payoutSummary: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  summaryCard: { flex: 1, borderRadius: 16, padding: 12, alignItems: 'center', borderWidth: 1.5 },
  summaryValue: { fontSize: 13, fontWeight: '900', letterSpacing: -0.5 },
  summaryLabel: { fontSize: 9, fontWeight: '700', color: 'rgba(255,255,255,0.4)', marginTop: 3 },
  bankCard: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 11, borderRadius: 16, marginBottom: 12, backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  bankIcon: { width: 36, height: 36, borderRadius: 12, backgroundColor: 'rgba(13,148,136,0.2)', borderWidth: 1.5, borderColor: 'rgba(13,148,136,0.3)', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  bankName: { fontSize: 12, fontWeight: '700', color: '#FFF' },
  bankSub: { fontSize: 10, color: 'rgba(255,255,255,0.35)', fontWeight: '600', marginTop: 1 },
  verifiedBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, backgroundColor: 'rgba(74,222,128,0.12)', borderWidth: 1, borderColor: 'rgba(74,222,128,0.3)' },
  verifiedBadgeText: { fontSize: 9, fontWeight: '800', color: '#4ADE80' },
  settlementNote: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, padding: 9, borderRadius: 14, marginBottom: 12, backgroundColor: 'rgba(252,211,77,0.06)', borderWidth: 1, borderColor: 'rgba(252,211,77,0.15)' },
  settlementNoteText: { fontSize: 10, color: 'rgba(255,255,255,0.5)', fontWeight: '600', lineHeight: 14, flex: 1 },
  payoutRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 11, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)' },
  payoutIcon: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  payoutTopRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 3 },
  payoutDate: { fontSize: 12, fontWeight: '700', color: '#FFF' },
  payoutAmount: { fontSize: 13, fontWeight: '900', color: '#FFF' },
  payoutNote: { fontSize: 10, color: 'rgba(255,255,255,0.35)', fontWeight: '500' },
  payoutUtr: { fontSize: 9, color: 'rgba(255,255,255,0.25)', fontWeight: '600', marginTop: 2 },
  payoutStatusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, borderWidth: 1 },
  payoutStatusText: { fontSize: 9, fontWeight: '800' },
});
