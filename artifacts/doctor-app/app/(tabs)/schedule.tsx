import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput,
  ViewStyle, Platform,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BG, TEAL, TEAL_LT } from '../../constants/theme';

const isWeb = Platform.OS === 'web';

type ShiftType = 'Morning' | 'Evening' | 'Both' | 'Off';
type ClinicKey = 'sharma' | 'city';

const CLINICS: Record<ClinicKey, string> = {
  sharma: 'Sharma Heart Clinic',
  city:   'City Cardiac Centre',
};

const DAYS_ABBR = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];

interface DayConfig {
  shift: ShiftType;
  clinic: ClinicKey;
  morningMax: number;
  eveningMax: number;
  notes: string;
}

const DEFAULT_CONFIG: DayConfig = {
  shift: 'Morning',
  clinic: 'sharma',
  morningMax: 20,
  eveningMax: 15,
  notes: '',
};

const SHIFT_COLORS: Record<ShiftType, string> = {
  Morning: '#FCD34D',
  Evening: '#A5B4FC',
  Both:    '#2DD4BF',
  Off:     '#374151',
};

function buildMonth(year: number, month: number) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = Array(firstDay).fill(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

function Stepper({ value, min, max, onChange }: {
  value: number; min: number; max: number; onChange: (v: number) => void;
}) {
  return (
    <View style={styles.stepper}>
      <TouchableOpacity
        style={styles.stepBtn}
        onPress={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
      >
        <Text style={[styles.stepBtnText, value <= min && styles.stepBtnDisabled]}>−</Text>
      </TouchableOpacity>
      <Text style={styles.stepValue}>{value}</Text>
      <TouchableOpacity
        style={styles.stepBtn}
        onPress={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
      >
        <Text style={[styles.stepBtnText, value >= max && styles.stepBtnDisabled]}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function ScheduleScreen() {
  const now = new Date();
  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth());
  const [selectedDay, setSelectedDay] = useState<number>(now.getDate());
  const [configs, setConfigs] = useState<Record<string, DayConfig>>({});
  const [copiedMsg, setCopiedMsg] = useState('');

  const cells = buildMonth(viewYear, viewMonth);
  const today = now.getDate();
  const isCurrentMonth = viewYear === now.getFullYear() && viewMonth === now.getMonth();

  const getKey = (d: number) => `${viewYear}-${viewMonth}-${d}`;
  const selectedKey = getKey(selectedDay);
  const selectedConfig = configs[selectedKey] ?? { ...DEFAULT_CONFIG };

  const updateConfig = (patch: Partial<DayConfig>) => {
    setConfigs(prev => ({
      ...prev,
      [selectedKey]: { ...selectedConfig, ...patch },
    }));
  };

  const prevMonth = () => {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0); }
    else setViewMonth(m => m + 1);
  };

  const copyToAllSameDay = () => {
    const dow = new Date(viewYear, viewMonth, selectedDay).getDay();
    const dayName = DAYS_ABBR[dow];
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const updates: Record<string, DayConfig> = { ...configs };
    for (let d = 1; d <= daysInMonth; d++) {
      if (new Date(viewYear, viewMonth, d).getDay() === dow) {
        updates[getKey(d)] = { ...selectedConfig };
      }
    }
    setConfigs(updates);
    setCopiedMsg(`Copied to all ${DAYS_ABBR[dow]}s!`);
    setTimeout(() => setCopiedMsg(''), 2000);
  };

  const getShiftForDay = (d: number): ShiftType => {
    const k = `${viewYear}-${viewMonth}-${d}`;
    return configs[k]?.shift ?? 'Off';
  };

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const summary = { morning: 0, evening: 0, both: 0, off: 0, working: 0 };
  for (let d = 1; d <= daysInMonth; d++) {
    const s = getShiftForDay(d);
    if (s === 'Morning') { summary.morning++; summary.working++; }
    else if (s === 'Evening') { summary.evening++; summary.working++; }
    else if (s === 'Both') { summary.both++; summary.working++; }
    else summary.off++;
  }

  const upcoming7: { d: number; shift: ShiftType }[] = [];
  for (let i = 0; i < 7; i++) {
    const dt = new Date(now.getTime() + i * 86400000);
    if (dt.getMonth() === viewMonth && dt.getFullYear() === viewYear) {
      upcoming7.push({ d: dt.getDate(), shift: getShiftForDay(dt.getDate()) });
    }
  }

  const isSelected = (d: number) => d === selectedDay;
  const isToday = (d: number) => d === today && isCurrentMonth;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.container}>
        <View style={styles.glowTop} />
        <View style={styles.glowRight} />

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Schedule</Text>
          <Text style={styles.headerSub}>Manage your availability & shifts</Text>
        </View>

        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Calendar Card */}
          <View style={styles.calCard}>
            {/* Month nav */}
            <View style={styles.calNav}>
              <TouchableOpacity onPress={prevMonth} style={styles.navBtn}>
                <Text style={styles.navBtnText}>‹</Text>
              </TouchableOpacity>
              <Text style={styles.calMonthTitle}>{MONTHS[viewMonth]} {viewYear}</Text>
              <TouchableOpacity onPress={nextMonth} style={styles.navBtn}>
                <Text style={styles.navBtnText}>›</Text>
              </TouchableOpacity>
            </View>

            {/* Day headers */}
            <View style={styles.dayRow}>
              {DAYS_ABBR.map(d => (
                <Text key={d} style={styles.dayHeader}>{d}</Text>
              ))}
            </View>

            {/* Calendar grid */}
            <View style={styles.calGrid}>
              {cells.map((cell, idx) => {
                if (cell == null) {
                  return <View key={`empty-${idx}`} style={styles.calCell} />;
                }
                const shift = getShiftForDay(cell);
                const shiftColor = SHIFT_COLORS[shift];
                const todayStyle: ViewStyle = isToday(cell) ? { borderColor: TEAL_LT, borderWidth: 1.5 } : {};
                const selectedStyle: ViewStyle = isSelected(cell)
                  ? { backgroundColor: TEAL, borderColor: TEAL }
                  : {};
                return (
                  <TouchableOpacity
                    key={`day-${cell}`}
                    style={[styles.calCell, todayStyle, selectedStyle]}
                    onPress={() => setSelectedDay(cell)}
                  >
                    <Text style={[styles.calDayNum, isSelected(cell) && styles.calDayNumSelected]}>
                      {cell}
                    </Text>
                    {shift !== 'Off' && (
                      <View style={[styles.shiftDot, { backgroundColor: shiftColor }]} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Legend */}
            <View style={styles.legend}>
              {(['Morning','Evening','Both','Off'] as ShiftType[]).map(s => (
                <View key={s} style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: SHIFT_COLORS[s] }]} />
                  <Text style={styles.legendText}>{s}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Day editor */}
          <View style={styles.editorCard}>
            <View style={styles.editorHeader}>
              <Text style={styles.editorTitle}>
                {new Date(viewYear, viewMonth, selectedDay).toLocaleDateString('en-IN', {
                  weekday: 'long', day: 'numeric', month: 'short',
                })}
              </Text>
              <View style={[
                styles.shiftBadge,
                { backgroundColor: `${SHIFT_COLORS[selectedConfig.shift]}22` },
              ]}>
                <Text style={[styles.shiftBadgeText, { color: SHIFT_COLORS[selectedConfig.shift] }]}>
                  {selectedConfig.shift}
                </Text>
              </View>
            </View>

            {/* Working / Leave toggle */}
            <View style={styles.workToggleRow}>
              <Text style={styles.fieldLabel}>STATUS</Text>
              <View style={styles.workToggle}>
                {(['Morning','Evening','Both','Off'] as ShiftType[]).map(s => {
                  const active = selectedConfig.shift === s;
                  return (
                    <TouchableOpacity
                      key={s}
                      onPress={() => updateConfig({ shift: s })}
                      style={[
                        styles.workToggleBtn,
                        active && { backgroundColor: `${SHIFT_COLORS[s]}33`, borderColor: SHIFT_COLORS[s] },
                      ]}
                    >
                      <Text style={[
                        styles.workToggleBtnText,
                        active && { color: SHIFT_COLORS[s] },
                      ]}>{s}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {selectedConfig.shift !== 'Off' && (
              <>
                {/* Clinic selector */}
                <Text style={[styles.fieldLabel, { marginTop: 12 }]}>CLINIC</Text>
                <View style={styles.clinicRow}>
                  {(Object.entries(CLINICS) as [ClinicKey, string][]).map(([key, name]) => (
                    <TouchableOpacity
                      key={key}
                      onPress={() => updateConfig({ clinic: key })}
                      style={[
                        styles.clinicBtn,
                        selectedConfig.clinic === key && styles.clinicBtnActive,
                      ]}
                    >
                      <Text style={styles.clinicIcon}>🏥</Text>
                      <Text style={[
                        styles.clinicBtnText,
                        selectedConfig.clinic === key && styles.clinicBtnTextActive,
                      ]}>{name}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Max tokens */}
                <Text style={[styles.fieldLabel, { marginTop: 12 }]}>MAX TOKENS</Text>
                <View style={styles.tokenRow}>
                  {(['Morning','Both'] as ShiftType[]).includes(selectedConfig.shift) && (
                    <View style={styles.tokenItem}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                        <Feather name="sun" size={11} color="rgba(255,255,255,0.6)" />
                        <Text style={styles.tokenItemLabel}>Morning</Text>
                      </View>
                      <Stepper
                        value={selectedConfig.morningMax}
                        min={1}
                        max={60}
                        onChange={v => updateConfig({ morningMax: v })}
                      />
                    </View>
                  )}
                  {(['Evening','Both'] as ShiftType[]).includes(selectedConfig.shift) && (
                    <View style={styles.tokenItem}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                        <Feather name="moon" size={11} color="rgba(255,255,255,0.6)" />
                        <Text style={styles.tokenItemLabel}>Evening</Text>
                      </View>
                      <Stepper
                        value={selectedConfig.eveningMax}
                        min={1}
                        max={60}
                        onChange={v => updateConfig({ eveningMax: v })}
                      />
                    </View>
                  )}
                </View>

                {/* Notes */}
                <Text style={[styles.fieldLabel, { marginTop: 12 }]}>NOTES</Text>
                <TextInput
                  style={styles.notesInput}
                  placeholder="e.g. Available for emergency calls only"
                  placeholderTextColor="rgba(255,255,255,0.2)"
                  value={selectedConfig.notes}
                  onChangeText={v => updateConfig({ notes: v })}
                  multiline
                />

                {/* Copy to all */}
                <TouchableOpacity onPress={copyToAllSameDay} style={styles.copyBtn}>
                  <Text style={styles.copyBtnText}>
                    {copiedMsg || `⎘ Copy to all ${DAYS_ABBR[new Date(viewYear, viewMonth, selectedDay).getDay()]}s this month`}
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>

          {/* 30-day summary */}
          <View style={styles.glassCard}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionDot}>📊</Text>
              <Text style={styles.sectionTitle}>30-Day Summary</Text>
            </View>
            <View style={styles.summaryGrid}>
              {[
                { label: 'Working',  value: summary.working,  color: TEAL_LT },
                { label: 'Morning',  value: summary.morning,  color: '#FCD34D' },
                { label: 'Evening',  value: summary.evening,  color: '#A5B4FC' },
                { label: 'Both',     value: summary.both,     color: '#2DD4BF' },
                { label: 'Off',      value: summary.off,      color: '#374151' },
              ].map(s => (
                <View key={s.label} style={styles.summaryItem}>
                  <Text style={[styles.summaryValue, { color: s.color }]}>{s.value}</Text>
                  <Text style={styles.summaryLabel}>{s.label}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Upcoming 7 days */}
          {upcoming7.length > 0 && (
            <View style={styles.glassCard}>
              <View style={styles.sectionHeader}>
                <Feather name="calendar" size={13} color={TEAL_LT} />
                <Text style={styles.sectionTitle}>Upcoming 7 Days</Text>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.upcomingRow}>
                  {upcoming7.map(({ d, shift }) => {
                    const dt = new Date(viewYear, viewMonth, d);
                    const isTd = d === today && isCurrentMonth;
                    return (
                      <TouchableOpacity
                        key={d}
                        onPress={() => setSelectedDay(d)}
                        style={[
                          styles.upcomingItem,
                          isSelected(d) && styles.upcomingItemSelected,
                        ]}
                      >
                        <Text style={[styles.upcomingDow, isSelected(d) && { color: '#FFF' }]}>
                          {DAYS_ABBR[dt.getDay()]}
                        </Text>
                        <Text style={[styles.upcomingDate, isSelected(d) && { color: '#FFF' }]}>
                          {d}
                        </Text>
                        <View style={[
                          styles.upcomingDot,
                          { backgroundColor: SHIFT_COLORS[shift] },
                          shift === 'Off' && { opacity: 0.25 },
                        ]} />
                        <Text style={[styles.upcomingShift, { color: SHIFT_COLORS[shift] }]}>
                          {shift === 'Morning' ? 'AM' : shift === 'Evening' ? 'PM' : shift === 'Both' ? 'AM+PM' : 'Off'}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </ScrollView>
            </View>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG, ...(isWeb && { paddingTop: 44 }) },
  container: { flex: 1, backgroundColor: BG },
  glowTop: { position: 'absolute', top: -60, left: -60, width: 240, height: 240, borderRadius: 120, backgroundColor: 'rgba(13,148,136,0.2)', opacity: 0.5 },
  glowRight: { position: 'absolute', top: 350, right: -80, width: 200, height: 200, borderRadius: 100, backgroundColor: 'rgba(99,102,241,0.12)', opacity: 0.45 },
  header: { padding: 16, paddingBottom: 8 },
  headerTitle: { fontSize: 18, fontWeight: '900', color: '#FFF', letterSpacing: -0.4 },
  headerSub: { fontSize: 11, color: 'rgba(255,255,255,0.3)', fontWeight: '500', marginTop: 2 },
  scroll: { flex: 1 },
  scrollContent: { padding: 14, paddingBottom: 100 },
  calCard: {
    borderRadius: 22, padding: 14, marginBottom: 12,
    backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.09)',
  },
  calNav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  navBtn: { width: 32, height: 32, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' },
  navBtnText: { fontSize: 18, color: 'rgba(255,255,255,0.6)', lineHeight: 22 },
  calMonthTitle: { fontSize: 14, fontWeight: '800', color: '#FFF' },
  dayRow: { flexDirection: 'row', marginBottom: 4 },
  dayHeader: { flex: 1, textAlign: 'center', fontSize: 10, fontWeight: '700', color: 'rgba(255,255,255,0.28)', textTransform: 'uppercase' },
  calGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  calCell: {
    width: '14.28%', aspectRatio: 1, alignItems: 'center', justifyContent: 'center',
    borderRadius: 9, borderWidth: 1, borderColor: 'transparent', padding: 2,
  },
  calDayNum: { fontSize: 11, fontWeight: '700', color: 'rgba(255,255,255,0.65)' },
  calDayNumSelected: { color: '#FFF', fontWeight: '900' },
  shiftDot: { width: 4, height: 4, borderRadius: 2, marginTop: 2 },
  legend: { flexDirection: 'row', justifyContent: 'center', gap: 12, marginTop: 10, flexWrap: 'wrap' },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendDot: { width: 7, height: 7, borderRadius: 3.5 },
  legendText: { fontSize: 9, color: 'rgba(255,255,255,0.4)', fontWeight: '600' },
  editorCard: {
    borderRadius: 20, padding: 14, marginBottom: 12,
    backgroundColor: 'rgba(13,148,136,0.12)', borderWidth: 1.5, borderColor: 'rgba(45,212,191,0.2)',
  },
  editorHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  editorTitle: { fontSize: 13, fontWeight: '800', color: '#FFF' },
  shiftBadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20 },
  shiftBadgeText: { fontSize: 10, fontWeight: '800' },
  fieldLabel: { fontSize: 9, fontWeight: '800', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 },
  workToggleRow: {},
  workToggle: { flexDirection: 'row', gap: 5 },
  workToggleBtn: {
    flex: 1, height: 36, borderRadius: 11, alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.08)',
  },
  workToggleBtnText: { fontSize: 10, fontWeight: '800', color: 'rgba(255,255,255,0.4)' },
  clinicRow: { gap: 6 },
  clinicBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8, padding: 9, borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
  },
  clinicBtnActive: { backgroundColor: 'rgba(13,148,136,0.18)', borderColor: 'rgba(45,212,191,0.35)' },
  clinicIcon: { fontSize: 15 },
  clinicBtnText: { fontSize: 12, fontWeight: '700', color: 'rgba(255,255,255,0.45)', flex: 1 },
  clinicBtnTextActive: { color: '#FFF' },
  tokenRow: { flexDirection: 'row', gap: 8 },
  tokenItem: { flex: 1, backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)', borderRadius: 12, padding: 9 },
  tokenItemLabel: { fontSize: 10, fontWeight: '700', color: 'rgba(255,255,255,0.4)', marginBottom: 8 },
  stepper: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  stepBtn: { width: 28, height: 28, borderRadius: 9, backgroundColor: 'rgba(255,255,255,0.08)', alignItems: 'center', justifyContent: 'center' },
  stepBtnText: { fontSize: 16, color: '#FFF', fontWeight: '700', lineHeight: 22 },
  stepBtnDisabled: { color: 'rgba(255,255,255,0.2)' },
  stepValue: { fontSize: 16, fontWeight: '900', color: '#FFF', minWidth: 30, textAlign: 'center' },
  notesInput: {
    borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(255,255,255,0.06)', color: '#FFF', fontSize: 12, fontWeight: '500',
    paddingHorizontal: 12, paddingVertical: 10, minHeight: 50,
  },
  copyBtn: {
    marginTop: 12, height: 38, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.07)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)', alignItems: 'center', justifyContent: 'center',
  },
  copyBtnText: { fontSize: 11, fontWeight: '700', color: 'rgba(255,255,255,0.55)' },
  glassCard: {
    borderRadius: 20, padding: 14, marginBottom: 12,
    backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.09)',
  },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 },
  sectionDot: { fontSize: 13, color: TEAL_LT },
  sectionTitle: { fontSize: 12, fontWeight: '800', color: '#FFF' },
  summaryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  summaryItem: { flex: 1, minWidth: 60, padding: 9, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.05)', alignItems: 'center' },
  summaryValue: { fontSize: 20, fontWeight: '900', lineHeight: 24 },
  summaryLabel: { fontSize: 9, fontWeight: '700', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', marginTop: 3 },
  upcomingRow: { flexDirection: 'row', gap: 7 },
  upcomingItem: {
    width: 54, borderRadius: 14, padding: 9, alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
  },
  upcomingItemSelected: { backgroundColor: 'rgba(13,148,136,0.3)', borderColor: 'rgba(45,212,191,0.5)' },
  upcomingDow: { fontSize: 9, fontWeight: '700', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: 0.5 },
  upcomingDate: { fontSize: 15, fontWeight: '900', color: '#FFF', marginVertical: 3 },
  upcomingDot: { width: 6, height: 6, borderRadius: 3, marginBottom: 3 },
  upcomingShift: { fontSize: 8, fontWeight: '800', letterSpacing: 0.3 },
});
