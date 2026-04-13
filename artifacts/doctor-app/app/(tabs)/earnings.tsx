import React, { useMemo, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, DimensionValue, Platform, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { BG, TEAL, TEAL_LT } from '../../constants/theme';
import { useDoctor } from '../../contexts/DoctorContext';
import Svg, { Polyline, Path, Defs, LinearGradient, Stop } from 'react-native-svg';

const isWeb = Platform.OS === 'web';
const BASE = () => `https://${process.env.EXPO_PUBLIC_DOMAIN}`;

type Period = 'Today' | 'Week' | 'Month' | 'LastMonth' | 'AllTime';

// ─── Date Helpers ─────────────────────────────────────────────
function pad(n: number) { return String(n).padStart(2, '0'); }
function dateFmt(d: Date) { return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`; }

function dateRanges() {
  const now = new Date();
  const today = dateFmt(now);

  // Monday of current week
  const dow = now.getDay() === 0 ? 6 : now.getDay() - 1;
  const mon = new Date(now); mon.setDate(now.getDate() - dow);
  const weekFrom = dateFmt(mon);

  // Start of this month
  const monthFrom = `${now.getFullYear()}-${pad(now.getMonth()+1)}-01`;

  // Last month
  const lmDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lmEnd  = new Date(now.getFullYear(), now.getMonth(), 0);
  const lastMonthFrom = dateFmt(lmDate);
  const lastMonthTo   = dateFmt(lmEnd);

  // For fetching: from 13 months ago
  const yearAgo = new Date(now); yearAgo.setMonth(now.getMonth() - 13);
  const fetchFrom = dateFmt(yearAgo);

  return { today, weekFrom, monthFrom, lastMonthFrom, lastMonthTo, fetchFrom };
}

interface EarningRecord {
  date: string;
  earned: number;
  totalTokens: number;
  tokensNormal: number;
  tokensEmergency: number;
  shift: string;
}

interface PeriodSummary {
  earned: number;
  tokensNormal: number;
  tokensEmergency: number;
  totalTokens: number;
}

function sum(records: EarningRecord[]): PeriodSummary {
  return records.reduce((acc, r) => ({
    earned:          acc.earned          + (r.earned ?? 0),
    tokensNormal:    acc.tokensNormal    + (r.tokensNormal ?? 0),
    tokensEmergency: acc.tokensEmergency + (r.tokensEmergency ?? 0),
    totalTokens:     acc.totalTokens     + (r.totalTokens ?? 0),
  }), { earned: 0, tokensNormal: 0, tokensEmergency: 0, totalTokens: 0 });
}

async function fetchEarnings(doctorId: string, from: string): Promise<EarningRecord[]> {
  const res = await fetch(`${BASE()}/api/doctors/${doctorId}/earnings?from=${from}&limit=365`);
  if (!res.ok) throw new Error('Failed to fetch earnings');
  const data = await res.json();
  return data.earnings ?? [];
}

// ─── Sparkline ────────────────────────────────────────────────
function MiniSparkline({ data, color }: { data: number[]; color: string }) {
  if (data.length < 2) return null;
  const w = 60, h = 22;
  const mn = Math.min(...data), mx = Math.max(...data);
  const range = mx - mn || 1;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - mn) / range) * h;
    return `${x},${y}`;
  });
  const areaPath = `M0,${h} L${pts.join(' L')} L${w},${h} Z`;
  const gradId = `g${color.replace('#', '')}`;
  return (
    <Svg width={w} height={h}>
      <Defs>
        <LinearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%" stopColor={color} stopOpacity={0.35} />
          <Stop offset="100%" stopColor={color} stopOpacity={0.02} />
        </LinearGradient>
      </Defs>
      <Path d={areaPath} fill={`url(#${gradId})`} />
      <Polyline points={pts.join(' ')} fill="none" stroke={color} strokeWidth={1.5} strokeLinejoin="round" strokeLinecap="round" />
    </Svg>
  );
}

const fmt     = (n: number) => n >= 100000 ? `₹${(n/100000).toFixed(2)}L` : n >= 1000 ? `₹${(n/1000).toFixed(1)}k` : `₹${n}`;
const fmtFull = (n: number) => `₹${n.toLocaleString('en-IN')}`;

const PERIOD_LABELS: Record<Period, string> = {
  Today: 'Today', Week: 'This Week', Month: 'This Month', LastMonth: 'Last Month', AllTime: 'Lifetime',
};

// ─── Main Screen ──────────────────────────────────────────────
export default function EarningsScreen() {
  const { doctor } = useDoctor();
  const [tab, setTab]       = useState<'earnings' | 'payouts'>('earnings');
  const [period, setPeriod] = useState<Period>('Month');

  const ranges = useMemo(() => dateRanges(), []);

  const { data: rawEarnings = [], isLoading } = useQuery<EarningRecord[]>({
    queryKey: ['doctor-earnings', doctor?.id, ranges.fetchFrom],
    queryFn:  () => fetchEarnings(doctor!.id, ranges.fetchFrom),
    enabled:  !!doctor?.id,
    staleTime: 60_000,
    refetchInterval: 60_000,
  });

  // Aggregate per period
  const periods = useMemo<Record<Period, PeriodSummary>>(() => {
    const todayRecs     = rawEarnings.filter(r => r.date === ranges.today);
    const weekRecs      = rawEarnings.filter(r => r.date >= ranges.weekFrom);
    const monthRecs     = rawEarnings.filter(r => r.date >= ranges.monthFrom && r.date <= ranges.today);
    const lastMonthRecs = rawEarnings.filter(r => r.date >= ranges.lastMonthFrom && r.date <= ranges.lastMonthTo);
    return {
      Today:     sum(todayRecs),
      Week:      sum(weekRecs),
      Month:     sum(monthRecs),
      LastMonth: sum(lastMonthRecs),
      AllTime:   sum(rawEarnings),
    };
  }, [rawEarnings, ranges]);

  // Last 7 days sparkline data
  const sparkData = useMemo(() => {
    const last7: number[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const dateStr = dateFmt(d);
      const dayRecs = rawEarnings.filter(r => r.date === dateStr);
      last7.push(sum(dayRecs).earned);
    }
    return last7;
  }, [rawEarnings]);

  const d = periods[period];
  const totalEarned = periods.AllTime.earned;

  // Trend vs previous period
  const trend = useMemo(() => {
    if (period === 'Month') {
      const cur = periods.Month.earned;
      const prv = periods.LastMonth.earned;
      if (!prv) return null;
      return +((cur - prv) / prv * 100).toFixed(1);
    }
    return null;
  }, [period, periods]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.container}>
        <View style={styles.glowTop} />
        <View style={styles.glowRight} />

        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>My Earnings</Text>
            <Text style={styles.headerSub}>{doctor?.name ?? 'Doctor'} · LINESETU</Text>
          </View>
          <View style={{ flexDirection: 'row', gap: 7 }}>
            <View style={styles.iconBtn}><Text style={styles.iconBtnText}>⬇</Text></View>
          </View>
        </View>

        {/* Balance Hero */}
        <View style={styles.heroCard}>
          {isLoading ? (
            <View style={{ alignItems: 'center', paddingVertical: 24 }}>
              <ActivityIndicator color={TEAL_LT} />
              <Text style={{ color: 'rgba(255,255,255,0.3)', marginTop: 10, fontSize: 12 }}>Loading earnings…</Text>
            </View>
          ) : (
            <>
              <View style={styles.heroTop}>
                <View>
                  <Text style={styles.heroBalanceLabel}>Lifetime Earned</Text>
                  <Text style={styles.heroBalance}>{fmtFull(totalEarned)}</Text>
                  <Text style={styles.heroReady}>
                    {periods.Today.earned > 0
                      ? `✓ +${fmtFull(periods.Today.earned)} today`
                      : '✓ Live from your token data'}
                  </Text>
                </View>
                <TouchableOpacity style={styles.withdrawBtn}>
                  <Text style={styles.withdrawBtnText}>💳 Withdraw</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.heroStats}>
                {[
                  { label: 'Today',      value: fmt(periods.Today.earned),     color: '#4ADE80', sub: `${periods.Today.totalTokens} tokens` },
                  { label: 'This Week',  value: fmt(periods.Week.earned),       color: '#67E8F9', sub: `${periods.Week.totalTokens} tokens` },
                  { label: 'This Month', value: fmt(periods.Month.earned),      color: '#FCD34D', sub: `${periods.Month.totalTokens} tokens` },
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
            </>
          )}
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
                      <Text style={[styles.periodChipText, period === p && styles.periodChipTextActive]}>{PERIOD_LABELS[p]}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>

              {isLoading ? (
                <View style={{ alignItems: 'center', paddingVertical: 32 }}>
                  <ActivityIndicator color={TEAL} />
                </View>
              ) : d.earned === 0 && d.totalTokens === 0 ? (
                <View style={[styles.glassCard, { alignItems: 'center', paddingVertical: 36 }]}>
                  <Text style={{ fontSize: 36, marginBottom: 12 }}>📊</Text>
                  <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, fontWeight: '700' }}>No earnings yet</Text>
                  <Text style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12, marginTop: 4 }}>for {PERIOD_LABELS[period]}</Text>
                </View>
              ) : (
                <>
                  {/* Total + trend */}
                  <View style={styles.glassCard}>
                    <View style={styles.totalRow}>
                      <View>
                        <Text style={styles.totalLabel}>Total — {PERIOD_LABELS[period]}</Text>
                        <Text style={styles.totalValue}>{fmtFull(d.earned)}</Text>
                        {trend !== null && (
                          <Text style={[styles.trendText, { color: trend >= 0 ? '#4ADE80' : '#F87171' }]}>
                            {trend >= 0 ? '↑' : '↓'} {trend >= 0 ? '+' : ''}{trend}% vs last month
                          </Text>
                        )}
                      </View>
                      <MiniSparkline data={sparkData} color={TEAL_LT} />
                    </View>
                    <View style={{ flexDirection: 'row', gap: 5, flexWrap: 'wrap', marginTop: 12 }}>
                      {[
                        { label: `${d.tokensNormal} Normal`,    color: '#A5B4FC' },
                        { label: `${d.tokensEmergency} Emergency`, color: '#FCD34D' },
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
                    {[
                      { label: 'Online Normal Token',    value: d.tokensNormal    * 10, count: d.tokensNormal,    icon: '📱', color: '#A5B4FC', bg: 'rgba(99,102,241,0.15)', rate: '₹10/token' },
                      { label: 'Online Emergency Token', value: d.tokensEmergency * 20, count: d.tokensEmergency, icon: '⚡', color: '#FCD34D', bg: 'rgba(245,158,11,0.15)', rate: '₹20/token' },
                    ].map((row) => {
                      const pct = d.earned > 0 ? Math.round((row.value / d.earned) * 100) : 0;
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
                </>
              )}

              {/* Rate Card — always visible */}
              <View style={[styles.glassCard, { marginTop: 10 }]}>
                <View style={styles.sectionHeaderRow}>
                  <View style={styles.sectionHeader}>
                    <Text style={styles.sectionDot}>🛡</Text>
                    <Text style={styles.sectionTitle}>Your Rate Card</Text>
                  </View>
                  <Text style={styles.platformSetText}>Platform-set</Text>
                </View>
                {[
                  { type: 'Online Normal Token',    earn: '₹10', platform: '₹10', patient: '₹20' },
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
              {/* Payout summary from real earnings */}
              <View style={styles.payoutSummary}>
                {[
                  { label: 'Lifetime',    value: fmtFull(totalEarned),                   color: '#4ADE80', bg: 'rgba(74,222,128,0.1)',   icon: '✓' },
                  { label: 'This Month',  value: fmtFull(periods.Month.earned),           color: '#67E8F9', bg: 'rgba(103,232,249,0.08)', icon: '📅' },
                  { label: 'Today',       value: fmtFull(periods.Today.earned),           color: '#FCD34D', bg: 'rgba(252,211,77,0.08)',  icon: '⚡' },
                ].map(s => (
                  <View key={s.label} style={[styles.summaryCard, { backgroundColor: s.bg, borderColor: `${s.color}33` }]}>
                    <Text style={{ fontSize: 16, color: s.color, marginBottom: 6 }}>{s.icon}</Text>
                    <Text style={[styles.summaryValue, { color: s.color }]}>{s.value}</Text>
                    <Text style={styles.summaryLabel}>{s.label}</Text>
                  </View>
                ))}
              </View>

              {/* Bank info placeholder */}
              <View style={styles.bankCard}>
                <View style={styles.bankIcon}>
                  <Text style={{ fontSize: 16, color: TEAL_LT }}>🏦</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.bankName}>Bank Account</Text>
                  <Text style={styles.bankSub}>Link your bank for weekly auto-settlement</Text>
                </View>
                <TouchableOpacity style={styles.verifiedBadge}>
                  <Text style={styles.verifiedBadgeText}>+ Add</Text>
                </TouchableOpacity>
              </View>

              {/* Settlement note */}
              <View style={styles.settlementNote}>
                <Text style={{ fontSize: 13, color: '#FCD34D' }}>ℹ</Text>
                <Text style={styles.settlementNoteText}>
                  Payouts are settled weekly every Tuesday. Link your bank account to enable automatic transfers.
                </Text>
              </View>

              {/* Payout history — real per-day breakdown */}
              <View style={[styles.glassCard, { marginTop: 0 }]}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionDot}>📋</Text>
                  <Text style={styles.sectionTitle}>Earnings Per Day</Text>
                </View>
                {rawEarnings.length === 0 ? (
                  <View style={{ alignItems: 'center', paddingVertical: 24 }}>
                    <Text style={{ fontSize: 28, marginBottom: 8 }}>💸</Text>
                    <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>No earnings records yet</Text>
                  </View>
                ) : (
                  rawEarnings.slice(0, 30).map((rec) => {
                    const isToday = rec.date === ranges.today;
                    return (
                      <View key={`${rec.date}-${rec.shift}`} style={styles.payoutRow}>
                        <View style={[styles.payoutIcon, { backgroundColor: 'rgba(45,212,191,0.12)' }]}>
                          <Text style={{ color: TEAL_LT, fontSize: 13 }}>{rec.shift === 'morning' ? '☀️' : '🌙'}</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                          <View style={styles.payoutTopRow}>
                            <Text style={styles.payoutDate}>{isToday ? 'Today' : rec.date} · {rec.shift}</Text>
                            <Text style={styles.payoutAmount}>{fmtFull(rec.earned ?? 0)}</Text>
                          </View>
                          <Text style={styles.payoutNote}>
                            {rec.totalTokens ?? 0} tokens · {rec.tokensNormal ?? 0} normal · {rec.tokensEmergency ?? 0} emergency
                          </Text>
                        </View>
                        <View style={[styles.payoutStatusBadge, { backgroundColor: 'rgba(74,222,128,0.1)', borderColor: 'rgba(74,222,128,0.3)' }]}>
                          <Text style={[styles.payoutStatusText, { color: '#4ADE80' }]}>Done</Text>
                        </View>
                      </View>
                    );
                  })
                )}
              </View>
            </>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG, ...(isWeb && { paddingTop: 44 }) },
  container: { flex: 1, backgroundColor: BG },
  glowTop: { position: 'absolute', top: -80, left: -40, width: 260, height: 260, borderRadius: 130, backgroundColor: 'rgba(13,148,136,0.2)', opacity: 0.5 },
  glowRight: { position: 'absolute', top: 360, right: -60, width: 200, height: 200, borderRadius: 100, backgroundColor: 'rgba(99,102,241,0.12)', opacity: 0.5 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 18, paddingBottom: 8 },
  headerTitle: { fontSize: 19, fontWeight: '900', color: '#FFF', letterSpacing: -0.4 },
  headerSub: { fontSize: 11, color: 'rgba(255,255,255,0.35)', fontWeight: '600', marginTop: 1 },
  iconBtn: { width: 36, height: 36, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' },
  iconBtnText: { fontSize: 15 },
  heroCard: { margin: 14, marginTop: 0, marginBottom: 0, borderRadius: 22, padding: 18, backgroundColor: 'rgba(13,148,136,0.22)', borderWidth: 1.5, borderColor: 'rgba(45,212,191,0.25)' },
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
  barFg: { height: '100%' as any, borderRadius: 4, opacity: 0.9 },
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
  payoutStatusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, borderWidth: 1 },
  payoutStatusText: { fontSize: 9, fontWeight: '800' },
});
