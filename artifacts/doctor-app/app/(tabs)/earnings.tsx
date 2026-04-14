import React, { useMemo, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, DimensionValue, Platform, ActivityIndicator,
  Modal, TextInput,
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

  // Fresh doctor data for pendingPayout + in-clinic fees
  const { data: doctorLive, refetch: refetchDoctorLive } = useQuery<any>({
    queryKey: ['doctor-live', doctor?.id],
    queryFn:  async () => {
      const res = await fetch(`${BASE()}/api/doctors/${doctor!.id}`);
      return res.json();
    },
    enabled:  !!doctor?.id,
    staleTime: 30_000,
    refetchInterval: 60_000,
  });

  // Payout requests from Firebase
  const { data: payoutsData, refetch: refetchPayouts } = useQuery<any>({
    queryKey: ['doctor-payouts', doctor?.id],
    queryFn:  async () => {
      const res = await fetch(`${BASE()}/api/doctors/${doctor!.id}/payouts`);
      return res.json();
    },
    enabled:  !!doctor?.id && tab === 'payouts',
    staleTime: 15_000,
    refetchInterval: 30_000,
  });

  // Withdraw modal state
  const [withdrawModal, setWithdrawModal] = useState(false);
  const [upiId, setUpiId]               = useState('');
  const [withdrawAmt, setWithdrawAmt]   = useState('');
  const [withdrawing, setWithdrawing]   = useState(false);
  const [withdrawError, setWithdrawError] = useState('');

  const pendingPayout  = doctorLive?.pendingPayout ?? 0;
  const inClinicFee    = doctorLive?.consultFee    ?? (doctor as any)?.consultFee    ?? 0;
  const inClinicEmFee  = doctorLive?.emergencyFee  ?? (doctor as any)?.emergencyFee  ?? 0;
  const inClinicWalkin = doctorLive?.walkinFee     ?? (doctor as any)?.walkinFee     ?? 0;
  const payouts: any[] = payoutsData?.payouts ?? [];

  async function submitWithdraw() {
    const amt = Number(withdrawAmt);
    if (!upiId.trim()) { setWithdrawError('Enter a valid UPI ID'); return; }
    if (!amt || amt <= 0) { setWithdrawError('Enter a valid amount'); return; }
    if (amt > pendingPayout) { setWithdrawError(`Amount exceeds available balance of ${fmtFull(pendingPayout)}`); return; }
    setWithdrawing(true); setWithdrawError('');
    try {
      const res = await fetch(`${BASE()}/api/doctors/${doctor!.id}/payouts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ upiId: upiId.trim(), amount: amt }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Request failed');
      setWithdrawModal(false);
      setUpiId(''); setWithdrawAmt('');
      refetchDoctorLive();
      refetchPayouts();
    } catch (e: any) {
      setWithdrawError(e.message || 'Something went wrong');
    }
    setWithdrawing(false);
  }

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
                  <Text style={styles.heroBalanceLabel}>Lifetime Earned (Online)</Text>
                  <Text style={styles.heroBalance}>{fmtFull(totalEarned)}</Text>
                  <Text style={styles.heroReady}>
                    {periods.Today.earned > 0
                      ? `✓ +${fmtFull(periods.Today.earned)} today`
                      : '✓ Live from your token data'}
                  </Text>
                </View>
                <View style={{ alignItems: 'flex-end', gap: 6 }}>
                  <TouchableOpacity
                    style={[styles.withdrawBtn, pendingPayout === 0 && { opacity: 0.5 }]}
                    onPress={() => { setWithdrawAmt(String(pendingPayout)); setWithdrawModal(true); }}
                    disabled={pendingPayout === 0}
                  >
                    <Text style={styles.withdrawBtnText}>💳 Withdraw</Text>
                  </TouchableOpacity>
                  <View style={styles.pendingBadge}>
                    <Text style={styles.pendingBadgeLabel}>Available</Text>
                    <Text style={styles.pendingBadgeValue}>{fmtFull(pendingPayout)}</Text>
                  </View>
                </View>
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
                    <Text style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', marginBottom: 8, fontStyle: 'italic' }}>
                      Calculated at your current fee rates. Actual payouts may differ if rates were updated mid-period.
                    </Text>
                    {[
                      { label: 'Online Normal Token',    value: d.tokensNormal    * (inClinicFee   ?? 10), count: d.tokensNormal,    icon: '📱', color: '#A5B4FC', bg: 'rgba(99,102,241,0.15)', rate: `₹${inClinicFee   ?? 10}/token` },
                      { label: 'Online Emergency Token', value: d.tokensEmergency * (inClinicEmFee ?? 20), count: d.tokensEmergency, icon: '⚡', color: '#FCD34D', bg: 'rgba(245,158,11,0.15)', rate: `₹${inClinicEmFee ?? 20}/token` },
                    ].map((row) => {
                      const total = (d.tokensNormal * (inClinicFee ?? 10)) + (d.tokensEmergency * (inClinicEmFee ?? 20));
                      const pct = total > 0 ? Math.round((row.value / total) * 100) : 0;
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

              {/* Rate Card — online E-token rates (platform-set) */}
              <View style={[styles.glassCard, { marginTop: 10 }]}>
                <View style={styles.sectionHeaderRow}>
                  <View style={styles.sectionHeader}>
                    <Text style={styles.sectionDot}>🛡</Text>
                    <Text style={styles.sectionTitle}>Online E-Token Rates</Text>
                  </View>
                  <Text style={styles.platformSetText}>Doctor-set</Text>
                </View>
                {[
                  { type: 'Normal E-Token',    earn: `₹${inClinicFee   ?? 10}`, platform: '₹10', patient: `₹${(inClinicFee   ?? 10) + 10}` },
                  { type: 'Emergency E-Token', earn: `₹${inClinicEmFee ?? 20}`, platform: '₹10', patient: `₹${(inClinicEmFee ?? 20) + 10}` },
                ].map(r => (
                  <View key={r.type} style={styles.rateRow}>
                    <Text style={styles.rateType} numberOfLines={1}>{r.type}</Text>
                    <View style={{ flexDirection: 'row', gap: 10 }}>
                      {[{ v: r.earn, c: '#4ADE80', l: 'You earn' }, { v: r.platform, c: '#F87171', l: 'Platform' }, { v: r.patient, c: 'rgba(255,255,255,0.6)', l: 'Patient pays' }].map(s => (
                        <View key={s.l} style={{ alignItems: 'center' }}>
                          <Text style={[styles.rateVal, { color: s.c }]}>{s.v}</Text>
                          <Text style={styles.rateSub}>{s.l}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                ))}
              </View>

              {/* Doctor's configured fee rates */}
              <View style={[styles.glassCard, { marginTop: 10 }]}>
                <View style={styles.sectionHeaderRow}>
                  <View style={styles.sectionHeader}>
                    <Text style={styles.sectionDot}>💰</Text>
                    <Text style={styles.sectionTitle}>Your Fee Rates</Text>
                  </View>
                  <Text style={[styles.platformSetText, { color: '#A5B4FC' }]}>Set by Doctor</Text>
                </View>
                {[
                  { type: 'Normal E-Token',  val: `₹${inClinicFee   ?? 10}`, color: '#A5B4FC' },
                  { type: 'Emergency Token', val: `₹${inClinicEmFee ?? 20}`, color: '#FCD34D' },
                ].map(r => (
                  <View key={r.type} style={[styles.rateRow, { justifyContent: 'space-between' }]}>
                    <Text style={styles.rateType}>{r.type}</Text>
                    <Text style={[styles.rateVal, { color: r.color }]}>{r.val}</Text>
                  </View>
                ))}
                <Text style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', marginTop: 8, fontStyle: 'italic' }}>
                  Update these in Settings → Fee Structure. Online payments add ₹10 platform fee on top.
                </Text>
              </View>
            </>
          )}

          {tab === 'payouts' && (
            <>
              {/* Available balance + quick action */}
              <View style={styles.payoutBalanceCard}>
                <View>
                  <Text style={styles.payoutBalanceLabel}>Available for Payout</Text>
                  <Text style={styles.payoutBalanceValue}>{fmtFull(pendingPayout)}</Text>
                  <Text style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', marginTop: 4 }}>
                    Accumulated from completed online tokens
                  </Text>
                </View>
                <TouchableOpacity
                  style={[styles.withdrawBtn, pendingPayout === 0 && { opacity: 0.5 }]}
                  onPress={() => { setWithdrawAmt(String(pendingPayout)); setWithdrawModal(true); }}
                  disabled={pendingPayout === 0}
                >
                  <Text style={styles.withdrawBtnText}>💳 Withdraw</Text>
                </TouchableOpacity>
              </View>

              {/* Earnings summary */}
              <View style={styles.payoutSummary}>
                {[
                  { label: 'Lifetime',   value: fmtFull(totalEarned),          color: '#4ADE80', bg: 'rgba(74,222,128,0.1)',   icon: '✓' },
                  { label: 'This Month', value: fmtFull(periods.Month.earned),  color: '#67E8F9', bg: 'rgba(103,232,249,0.08)', icon: '📅' },
                  { label: 'Today',      value: fmtFull(periods.Today.earned),  color: '#FCD34D', bg: 'rgba(252,211,77,0.08)',  icon: '⚡' },
                ].map(s => (
                  <View key={s.label} style={[styles.summaryCard, { backgroundColor: s.bg, borderColor: `${s.color}33` }]}>
                    <Text style={{ fontSize: 16, color: s.color, marginBottom: 6 }}>{s.icon}</Text>
                    <Text style={[styles.summaryValue, { color: s.color }]}>{s.value}</Text>
                    <Text style={styles.summaryLabel}>{s.label}</Text>
                  </View>
                ))}
              </View>

              {/* Real payout request history from Firebase */}
              <View style={[styles.glassCard, { marginTop: 0 }]}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionDot}>📋</Text>
                  <Text style={styles.sectionTitle}>Payout Requests</Text>
                </View>
                {payouts.length === 0 ? (
                  <View style={{ alignItems: 'center', paddingVertical: 24 }}>
                    <Text style={{ fontSize: 28, marginBottom: 8 }}>💸</Text>
                    <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>No payout requests yet</Text>
                    <Text style={{ color: 'rgba(255,255,255,0.25)', fontSize: 11, marginTop: 4 }}>
                      Tap Withdraw above to request your first payout
                    </Text>
                  </View>
                ) : (
                  payouts.map((p: any) => {
                    const statusMap: Record<string, { label: string; color: string; bg: string; border: string }> = {
                      pending:  { label: 'Pending',  color: '#FCD34D', bg: 'rgba(252,211,77,0.1)',   border: 'rgba(252,211,77,0.3)' },
                      approved: { label: 'Approved', color: '#4ADE80', bg: 'rgba(74,222,128,0.1)',   border: 'rgba(74,222,128,0.3)' },
                      rejected: { label: 'Rejected', color: '#F87171', bg: 'rgba(248,113,113,0.1)',  border: 'rgba(248,113,113,0.3)' },
                    };
                    const st = statusMap[p.status] ?? statusMap.pending;
                    const dateStr = p.requestedAt ? new Date(p.requestedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';
                    return (
                      <View key={p.id} style={styles.payoutRow}>
                        <View style={[styles.payoutIcon, { backgroundColor: `${st.color}15` }]}>
                          <Text style={{ fontSize: 14 }}>
                            {p.status === 'approved' ? '✅' : p.status === 'rejected' ? '❌' : '⏳'}
                          </Text>
                        </View>
                        <View style={{ flex: 1 }}>
                          <View style={styles.payoutTopRow}>
                            <Text style={styles.payoutDate}>{dateStr}</Text>
                            <Text style={styles.payoutAmount}>{fmtFull(p.amount ?? 0)}</Text>
                          </View>
                          <Text style={styles.payoutNote}>UPI: {p.upiId}</Text>
                        </View>
                        <View style={[styles.payoutStatusBadge, { backgroundColor: st.bg, borderColor: st.border }]}>
                          <Text style={[styles.payoutStatusText, { color: st.color }]}>{st.label}</Text>
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

      {/* ── Withdraw Modal ── */}
      <Modal visible={withdrawModal} transparent animationType="slide" onRequestClose={() => setWithdrawModal(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setWithdrawModal(false)}>
          <View style={styles.withdrawCard} onStartShouldSetResponder={() => true}>
            <Text style={styles.withdrawCardTitle}>Request Payout</Text>
            <View style={styles.withdrawAvailRow}>
              <Text style={styles.withdrawAvailLabel}>Available Balance</Text>
              <Text style={styles.withdrawAvailValue}>{fmtFull(pendingPayout)}</Text>
            </View>

            <Text style={styles.withdrawFieldLabel}>UPI ID</Text>
            <TextInput
              style={styles.withdrawInput}
              value={upiId}
              onChangeText={setUpiId}
              placeholder="yourname@upi"
              placeholderTextColor="rgba(255,255,255,0.2)"
              autoCapitalize="none"
              keyboardType="email-address"
              autoCorrect={false}
            />

            <Text style={styles.withdrawFieldLabel}>Amount (₹ whole number)</Text>
            <TextInput
              style={styles.withdrawInput}
              value={withdrawAmt}
              onChangeText={v => setWithdrawAmt(v.replace(/[^0-9]/g, ''))}
              placeholder={String(Math.floor(pendingPayout))}
              placeholderTextColor="rgba(255,255,255,0.2)"
              keyboardType="number-pad"
            />

            {withdrawError ? (
              <View style={styles.withdrawError}>
                <Text style={styles.withdrawErrorText}>{withdrawError}</Text>
              </View>
            ) : null}

            <TouchableOpacity
              style={[styles.withdrawConfirmBtn, (!upiId.trim() || !withdrawAmt || withdrawing) && { opacity: 0.5 }]}
              disabled={!upiId.trim() || !withdrawAmt || withdrawing}
              onPress={submitWithdraw}
            >
              {withdrawing
                ? <ActivityIndicator color="#FFF" size="small" />
                : <Text style={styles.withdrawConfirmBtnText}>Submit Payout Request</Text>}
            </TouchableOpacity>

            <Text style={styles.withdrawNote}>
              Payouts are reviewed and approved by the admin team. Funds are transferred to your UPI ID after approval.
            </Text>
          </View>
        </TouchableOpacity>
      </Modal>
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
  pendingBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12, backgroundColor: 'rgba(45,212,191,0.12)', borderWidth: 1, borderColor: 'rgba(45,212,191,0.25)', alignItems: 'center' },
  pendingBadgeLabel: { fontSize: 8, fontWeight: '700', color: 'rgba(255,255,255,0.4)', marginBottom: 1 },
  pendingBadgeValue: { fontSize: 11, fontWeight: '900', color: TEAL_LT },
  payoutBalanceCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderRadius: 18, marginBottom: 12, backgroundColor: 'rgba(13,148,136,0.18)', borderWidth: 1.5, borderColor: 'rgba(45,212,191,0.25)' },
  payoutBalanceLabel: { fontSize: 10, fontWeight: '700', color: 'rgba(255,255,255,0.4)', marginBottom: 4 },
  payoutBalanceValue: { fontSize: 28, fontWeight: '900', color: '#FFF', letterSpacing: -1 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', justifyContent: 'flex-end' },
  withdrawCard: { backgroundColor: '#0D1B2A', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, borderTopWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  withdrawCardTitle: { fontSize: 18, fontWeight: '900', color: '#FFF', marginBottom: 14 },
  withdrawAvailRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 12, borderRadius: 14, backgroundColor: 'rgba(45,212,191,0.08)', borderWidth: 1, borderColor: 'rgba(45,212,191,0.2)', marginBottom: 16 },
  withdrawAvailLabel: { fontSize: 11, fontWeight: '600', color: 'rgba(255,255,255,0.45)' },
  withdrawAvailValue: { fontSize: 20, fontWeight: '900', color: TEAL_LT },
  withdrawFieldLabel: { fontSize: 10, fontWeight: '700', color: 'rgba(255,255,255,0.4)', marginBottom: 6 },
  withdrawInput: { borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.12)', borderRadius: 14, padding: 12, fontSize: 14, color: '#FFF', backgroundColor: 'rgba(255,255,255,0.05)', marginBottom: 12 },
  withdrawError: { padding: 9, borderRadius: 12, backgroundColor: 'rgba(248,113,113,0.1)', borderWidth: 1, borderColor: 'rgba(248,113,113,0.25)', marginBottom: 12 },
  withdrawErrorText: { fontSize: 11, color: '#F87171', fontWeight: '600' },
  withdrawConfirmBtn: { height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: TEAL, marginBottom: 12 },
  withdrawConfirmBtnText: { fontSize: 14, fontWeight: '800', color: '#FFF' },
  withdrawNote: { fontSize: 10, color: 'rgba(255,255,255,0.3)', textAlign: 'center', lineHeight: 14 },
});
