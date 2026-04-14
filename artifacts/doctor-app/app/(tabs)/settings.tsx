import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput, ViewStyle, Platform,
  ActivityIndicator, Modal, FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BG, TEAL, TEAL_LT } from '../../constants/theme';

import { useDoctor } from '../../contexts/DoctorContext';

const isWeb = Platform.OS === 'web';

type SettingsSection = 'main' | 'profile' | 'clinics' | 'schedule' | 'fees' | 'patientApp';

interface ClinicData {
  name: string; address: string; city: string; phone: string; maps: string; active: boolean;
}

// ── Time options: every 15 min from 06:00 to 22:45 ──────────────────
const TIME_OPTIONS: string[] = [];
for (let h = 6; h <= 22; h++) {
  for (const m of [0, 15, 30, 45]) {
    if (h === 22 && m > 0) break;
    TIME_OPTIONS.push(`${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`);
  }
}

function TimePicker({ value, onChange, label }: { value: string; onChange: (v: string) => void; label: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TouchableOpacity
        style={[styles.fieldInput, { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, marginBottom: 8 }]}
        onPress={() => setOpen(true)}
      >
        <Text style={{ color: value ? '#FFF' : 'rgba(255,255,255,0.25)', fontWeight: '700', fontSize: 14 }}>{value || 'Select time'}</Text>
        <Text style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12 }}>🕐</Text>
      </TouchableOpacity>
      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <TouchableOpacity style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' }} activeOpacity={1} onPress={() => setOpen(false)}>
          <View style={{ backgroundColor: '#0D1321', borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)', width: 200, maxHeight: 340, overflow: 'hidden' }}>
            <View style={{ padding: 14, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.07)' }}>
              <Text style={{ color: '#2DD4BF', fontWeight: '900', fontSize: 13, textTransform: 'uppercase', letterSpacing: 0.8 }}>{label}</Text>
            </View>
            <FlatList
              data={TIME_OPTIONS}
              keyExtractor={t => t}
              getItemLayout={(_, i) => ({ length: 44, offset: 44 * i, index: i })}
              initialScrollIndex={Math.max(0, TIME_OPTIONS.indexOf(value))}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => { onChange(item); setOpen(false); }}
                  style={{ height: 44, paddingHorizontal: 18, justifyContent: 'center', backgroundColor: item === value ? 'rgba(45,212,191,0.18)' : 'transparent' }}
                >
                  <Text style={{ color: item === value ? '#2DD4BF' : 'rgba(255,255,255,0.7)', fontWeight: item === value ? '800' : '500', fontSize: 15 }}>{item}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

interface ShiftSlot { startTime: string; endTime: string; maxTokens: number; clinicName: string; address: string; locationLink: string }
interface ShiftFormProps {
  shift: 'morning' | 'evening';
  accentColor: string;
  icon: string;
  label: string;
  data: ShiftSlot;
  clinics: ClinicData[];
  onChange: (patch: Partial<ShiftSlot>) => void;
}
function ShiftForm({ shift, accentColor, icon, label, data, clinics, onChange }: ShiftFormProps) {
  const activeClinics = clinics.filter(c => c.active && c.name);
  const selectedClinicIdx = activeClinics.findIndex(c => c.name === data.clinicName);
  return (
    <View style={[styles.shiftCard, { marginTop: 10, borderColor: `${accentColor}40` }]}>
      <Text style={[styles.shiftCardTitle, { color: accentColor, marginBottom: 10 }]}>{icon}  {label}</Text>

      {/* Clinic selector buttons */}
      {activeClinics.length > 0 && (
        <>
          <Text style={styles.fieldLabel}>SELECT CLINIC</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
            {activeClinics.map((c, i) => (
              <TouchableOpacity
                key={i}
                onPress={() => onChange({ clinicName: c.name, address: c.address, locationLink: c.maps })}
                style={{
                  paddingHorizontal: 12, paddingVertical: 7, borderRadius: 10,
                  borderWidth: 1.5,
                  borderColor: selectedClinicIdx === i ? accentColor : 'rgba(255,255,255,0.12)',
                  backgroundColor: selectedClinicIdx === i ? `${accentColor}20` : 'rgba(255,255,255,0.04)',
                }}
              >
                <Text style={{ fontSize: 12, fontWeight: '700', color: selectedClinicIdx === i ? accentColor : 'rgba(255,255,255,0.5)' }}>{c.name}</Text>
                {c.city ? <Text style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', fontWeight: '500' }}>{c.city}</Text> : null}
              </TouchableOpacity>
            ))}
          </View>
        </>
      )}
      {activeClinics.length === 0 && (
        <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginBottom: 10, fontStyle: 'italic' }}>Add clinics in Settings → Manage Clinics to enable quick selection</Text>
      )}

      {/* Time pickers */}
      <View style={styles.timeRow}>
        <View style={{ flex: 1 }}>
          <TimePicker label="START TIME" value={data.startTime} onChange={v => onChange({ startTime: v })} />
        </View>
        <View style={{ width: 16, alignItems: 'center', marginTop: 28 }}>
          <Text style={styles.timeDash}>–</Text>
        </View>
        <View style={{ flex: 1 }}>
          <TimePicker label="END TIME" value={data.endTime} onChange={v => onChange({ endTime: v })} />
        </View>
      </View>

      {/* Single max tokens field */}
      <Text style={styles.fieldLabel}>MAX TOKENS (Total)</Text>
      <TextInput
        style={[styles.fieldInput, { marginBottom: 10 }]}
        value={String(data.maxTokens)}
        onChangeText={v => onChange({ maxTokens: parseInt(v) || 0 })}
        keyboardType="number-pad"
        placeholderTextColor="rgba(255,255,255,0.2)"
        placeholder="30"
      />

    </View>
  );
}

function Toggle({ on, onChange, color = TEAL }: { on: boolean; onChange: () => void; color?: string }) {
  return (
    <TouchableOpacity
      onPress={onChange}
      style={[styles.toggle, { backgroundColor: on ? color : 'rgba(255,255,255,0.12)', borderColor: on ? color : 'rgba(255,255,255,0.15)' }]}
    >
      <View style={[styles.toggleThumb, on ? styles.toggleThumbOn : styles.toggleThumbOff]} />
    </TouchableOpacity>
  );
}

function Field({ label, value, onChange, multiline, keyboardType }: {
  label: string; value: string; onChange: (v: string) => void;
  multiline?: boolean; keyboardType?: 'default' | 'phone-pad' | 'numeric' | 'url';
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        style={[styles.fieldInput, multiline && { height: 72, paddingTop: 10 }]}
        value={value}
        onChangeText={onChange}
        multiline={multiline}
        keyboardType={keyboardType ?? 'default'}
        placeholderTextColor="rgba(255,255,255,0.2)"
        placeholder={`Enter ${label.toLowerCase()}`}
      />
    </View>
  );
}

function SectionLabel({ label }: { label: string }) {
  return <Text style={styles.sectionLabel}>{label}</Text>;
}

function SettingRow({
  icon, iconBg, iconColor, label, sub, right, danger = false, last = false, onPress,
}: {
  icon: string; iconBg: string; iconColor: string;
  label: string; sub?: string; right?: React.ReactNode;
  danger?: boolean; last?: boolean; onPress?: () => void;
}) {
  const Wrapper = onPress ? TouchableOpacity : View;
  return (
    <Wrapper onPress={onPress} style={[styles.settingRow, !last && styles.settingRowBorder]}>
      <View style={[styles.settingIcon, { backgroundColor: iconBg, borderColor: `${iconColor}33` }]}>
        <Text style={{ fontSize: 16, color: iconColor }}>{icon}</Text>
      </View>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={[styles.settingLabel, danger && { color: '#F87171' }]}>{label}</Text>
        {sub && <Text style={styles.settingSub}>{sub}</Text>}
      </View>
      {right ?? <Text style={styles.chevron}>›</Text>}
    </Wrapper>
  );
}

function BackHeader({ title, onBack }: { title: string; onBack: () => void }) {
  return (
    <View style={styles.subHeader}>
      <TouchableOpacity onPress={onBack} style={styles.backBtn}>
        <Text style={styles.backBtnText}>←</Text>
      </TouchableOpacity>
      <Text style={styles.subHeaderTitle}>{title}</Text>
    </View>
  );
}

export default function SettingsScreen() {
  const { doctor, logout, updateDoctor } = useDoctor();
  const [section, setSection] = useState<SettingsSection>('main');

  // Profile state — seeded from Firebase via doctor context
  const [name, setName] = useState(() => (doctor as any)?.name ?? '');
  const [qualifications, setQualifications] = useState('MBBS, MD');
  const [specialisation, setSpecialisation] = useState(() => (doctor as any)?.specialization ?? '');
  const [experience, setExperience] = useState('10');
  const [patientsTotal, setPatientsTotal] = useState('12400');
  const [mobile, setMobile] = useState(() => {
    const p: string = (doctor as any)?.phone ?? '';
    return p.startsWith('+91') ? p.slice(3).trim() : p;
  });
  const [bio, setBio] = useState('');

  // Sync profile fields when doctor context loads (e.g. after async hydration)
  const profileSynced = React.useRef(false);
  React.useEffect(() => {
    if (!profileSynced.current && doctor) {
      profileSynced.current = true;
      setName((doctor as any).name ?? '');
      setSpecialisation((doctor as any).specialization ?? '');
      const p: string = (doctor as any).phone ?? '';
      setMobile(p.startsWith('+91') ? p.slice(3).trim() : p);
    }
  }, [doctor]);

  // Clinics state — seeded from Firebase via doctor.clinics
  const EMPTY_CLINIC: ClinicData = { name: '', address: '', city: '', phone: '', maps: '', active: false };
  const [activeClinic, setActiveClinic] = useState(0);
  const [clinics, setClinics] = useState<ClinicData[]>(() => {
    const saved = (doctor as any)?.clinics as ClinicData[] | undefined;
    if (saved && saved.length) return saved;
    return [EMPTY_CLINIC, EMPTY_CLINIC, EMPTY_CLINIC];
  });
  const [clinicSaving, setClinicSaving] = useState(false);
  const [clinicSaved, setClinicSaved] = useState(false);

  // Schedule state — seeded from doctor.shifts
  const [morningEnabled, setMorningEnabled] = useState(() => doctor?.shifts?.morning !== false);
  const [eveningEnabled, setEveningEnabled] = useState(() => doctor?.shifts?.evening !== false);
  const [morningStart, setMorningStart] = useState(() => doctor?.shifts?.morningStart ?? '09:00');
  const [morningEnd, setMorningEnd] = useState(() => doctor?.shifts?.morningEnd ?? '13:00');
  const [eveningStart, setEveningStart] = useState(() => doctor?.shifts?.eveningStart ?? '17:00');
  const [eveningEnd, setEveningEnd] = useState(() => doctor?.shifts?.eveningEnd ?? '20:00');
  const [morningMax, setMorningMax] = useState('20');
  const [eveningMax, setEveningMax] = useState('15');
  const [schedSaving, setSchedSaving] = useState(false);
  const [schedSaved, setSchedSaved] = useState(false);

  type ShiftCfg = { enabled: boolean; startTime: string; endTime: string; maxTokens: number; clinicName: string; address: string; locationLink: string };
  type DayCfg  = { off: boolean; morning: ShiftCfg; evening: ShiftCfg };
  type DayMode = 'morning' | 'evening' | 'both' | 'holiday';

  function makeShift(start: string, end: string, clinic?: ClinicData): ShiftCfg {
    return {
      enabled: true, startTime: start, endTime: end, maxTokens: 30,
      clinicName: clinic?.name ?? '', address: clinic?.address ?? '', locationLink: clinic?.maps ?? '',
    };
  }
  function blankDay(clinic?: ClinicData): DayCfg {
    return {
      off: false,
      morning: makeShift('09:00', '13:00', clinic),
      evening: makeShift('17:00', '20:00', clinic),
    };
  }
  function modeOf(cfg: DayCfg): DayMode {
    if (cfg.off) return 'holiday';
    const m = cfg.morning.enabled, e = cfg.evening.enabled;
    if (m && e) return 'both';
    if (m) return 'morning';
    if (e) return 'evening';
    return 'holiday';
  }
  function applyMode(mode: DayMode, prev: DayCfg): DayCfg {
    if (mode === 'holiday') return { ...prev, off: true, morning: { ...prev.morning, enabled: false }, evening: { ...prev.evening, enabled: false } };
    if (mode === 'morning') return { ...prev, off: false, morning: { ...prev.morning, enabled: true }, evening: { ...prev.evening, enabled: false } };
    if (mode === 'evening') return { ...prev, off: false, morning: { ...prev.morning, enabled: false }, evening: { ...prev.evening, enabled: true } };
    return { ...prev, off: false, morning: { ...prev.morning, enabled: true }, evening: { ...prev.evening, enabled: true } };
  }

  // Calendar overrides: { [isoDate]: DayCfg }
  const [calendarOverrides, setCalendarOverrides] = useState<Record<string, DayCfg>>(() => (doctor as any)?.calendar ?? {});
  const [selectedCalDate, setSelectedCalDate] = useState<string | null>(null);
  const [dayForm, setDayForm] = useState<DayCfg>(() => blankDay());
  const [dayMode, setDayModeState] = useState<DayMode>('both');
  const [calSaving, setCalSaving] = useState(false);
  const [calSaved, setCalSaved] = useState(false);

  function patchShift(shift: 'morning' | 'evening', patch: Partial<ShiftCfg>) {
    setDayForm(prev => ({ ...prev, [shift]: { ...prev[shift], ...patch } }));
  }
  function selectMode(mode: DayMode) {
    setDayModeState(mode);
    setDayForm(prev => applyMode(mode, prev));
  }

  // Re-seed when doctor loads (covers cold start)
  useEffect(() => {
    if (!doctor) return;
    if (doctor.shifts) {
      setMorningEnabled(doctor.shifts.morning !== false);
      setEveningEnabled(doctor.shifts.evening !== false);
      setMorningStart(doctor.shifts.morningStart ?? '09:00');
      setMorningEnd(doctor.shifts.morningEnd ?? '13:00');
      setEveningStart(doctor.shifts.eveningStart ?? '17:00');
      setEveningEnd(doctor.shifts.eveningEnd ?? '20:00');
    }
    if ((doctor as any).calendar) setCalendarOverrides((doctor as any).calendar);
    if ((doctor as any).clinics?.length) setClinics((doctor as any).clinics);
  }, [doctor?.id]);

  // Fee state
  const [consultFee, setConsultFee] = useState('500');
  const [emergencyFee, setEmergencyFee] = useState('1000');

  // Patient app state
  const [onlineBooking, setOnlineBooking] = useState(true);
  const [emergencyTokens, setEmergencyTokens] = useState(true);
  const [showWaitTime, setShowWaitTime] = useState(true);
  const [showPosition, setShowPosition] = useState(true);
  const [showDoctorName, setShowDoctorName] = useState(true);
  const [showFee, setShowFee] = useState(false);
  const [alertMessage, setAlertMessage] = useState('Your turn is coming soon. Please be ready at the clinic.');
  const [notifSound, setNotifSound] = useState(true);
  const [notifVibrate, setNotifVibrate] = useState(true);

  // Notification state
  const [notifBooking, setNotifBooking] = useState(true);
  const [notifEmergency, setNotifEmergency] = useState(true);
  const [notifPayout, setNotifPayout] = useState(true);

  const [showLogout, setShowLogout] = useState(false);

  const updateClinic = (idx: number, patch: Partial<ClinicData>) => {
    setClinics(prev => prev.map((c, i) => i === idx ? { ...c, ...patch } : c));
  };

  if (section === 'profile') {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.container}>
          <BackHeader title="Doctor Profile" onBack={() => setSection('main')} />
          <ScrollView contentContainerStyle={styles.formScroll} showsVerticalScrollIndicator={false}>
            {/* Avatar placeholder */}
            <View style={styles.avatarSection}>
              <View style={styles.avatarLarge}>
                <Text style={{ fontSize: 36, color: '#FFF' }}>⚕</Text>
              </View>
              <TouchableOpacity style={styles.photoChangeBtn}>
                <Text style={styles.photoBtnText}>📷 Change Photo</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.formCard}>
              <Field label="Full Name" value={name} onChange={setName} />
              <Field label="Qualifications" value={qualifications} onChange={setQualifications} />
              <Field label="Specialisation" value={specialisation} onChange={setSpecialisation} />
              <Field label="Years of Experience" value={experience} onChange={setExperience} keyboardType="numeric" />
              <Field label="Total Patients Consulted" value={patientsTotal} onChange={setPatientsTotal} keyboardType="numeric" />
              <View style={styles.field}>
                <Text style={styles.fieldLabel}>REGISTERED MOBILE</Text>
                <View style={styles.phoneRow}>
                  <View style={styles.phonePrefix}><Text style={styles.phonePrefixText}>+91</Text></View>
                  <TextInput
                    style={[styles.fieldInput, { flex: 1 }]}
                    value={mobile}
                    onChangeText={setMobile}
                    keyboardType="phone-pad"
                    placeholderTextColor="rgba(255,255,255,0.2)"
                    placeholder="98765 00001"
                  />
                </View>
              </View>
              <Field label="About / Bio" value={bio} onChange={setBio} multiline />
            </View>
            <TouchableOpacity style={styles.saveBtn} onPress={() => setSection('main')}>
              <Text style={styles.saveBtnText}>✓ Save Profile</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </SafeAreaView>
    );
  }

  if (section === 'clinics') {
    const clinic = clinics[activeClinic];
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.container}>
          <BackHeader title="Manage Clinics" onBack={() => setSection('main')} />
          <ScrollView contentContainerStyle={styles.formScroll} showsVerticalScrollIndicator={false}>
            {/* Clinic tabs */}
            <View style={styles.clinicTabs}>
              {clinics.map((c, i) => (
                <TouchableOpacity
                  key={i}
                  onPress={() => setActiveClinic(i)}
                  style={[styles.clinicTab, activeClinic === i && styles.clinicTabActive]}
                >
                  <Text style={[styles.clinicTabText, activeClinic === i && styles.clinicTabTextActive]}>
                    {c.name ? `Clinic ${i + 1}` : `+ Add`}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.formCard}>
              <View style={[styles.field, { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }]}>
                <Text style={styles.fieldLabel}>ACTIVE</Text>
                <Toggle on={clinic.active} onChange={() => updateClinic(activeClinic, { active: !clinic.active })} />
              </View>
              <Field label="Clinic Name" value={clinic.name} onChange={v => updateClinic(activeClinic, { name: v })} />
              <Field label="Address" value={clinic.address} onChange={v => updateClinic(activeClinic, { address: v })} />
              <Field label="City" value={clinic.city} onChange={v => updateClinic(activeClinic, { city: v })} />
              <Field label="Clinic Phone" value={clinic.phone} onChange={v => updateClinic(activeClinic, { phone: v })} keyboardType="phone-pad" />
              <Field label="Google Maps Link" value={clinic.maps} onChange={v => updateClinic(activeClinic, { maps: v })} keyboardType="url" />
            </View>
            <TouchableOpacity
              style={[styles.saveBtn, clinicSaving && { opacity: 0.7 }]}
              disabled={clinicSaving}
              onPress={async () => {
                setClinicSaving(true); setClinicSaved(false);
                try {
                  await updateDoctor({ clinics: clinics as any });
                  setClinicSaved(true);
                  setTimeout(() => { setClinicSaved(false); setSection('main'); }, 1200);
                } catch {}
                setClinicSaving(false);
              }}
            >
              {clinicSaving
                ? <ActivityIndicator color="#FFF" size="small" />
                : <Text style={styles.saveBtnText}>{clinicSaved ? '✓ Clinics Saved to Firebase!' : '💾 Save Clinics'}</Text>}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </SafeAreaView>
    );
  }

  if (section === 'schedule') {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.container}>
          <BackHeader title="Schedule & Shifts" onBack={() => setSection('main')} />
          <ScrollView contentContainerStyle={styles.formScroll} showsVerticalScrollIndicator={false}>
            {/* ── 30-DAY SCHEDULE EDITOR ────────────────────── */}
            {(() => {
              const today = new Date(); today.setHours(0,0,0,0);
              const dates30: Date[] = [];
              for (let i = 0; i < 30; i++) {
                const d = new Date(today); d.setDate(today.getDate() + i);
                dates30.push(d);
              }
              const startDow = today.getDay();
              const cells: (Date | null)[] = [...Array(startDow).fill(null), ...dates30];
              while (cells.length % 7 !== 0) cells.push(null);
              const rows: (Date | null)[][] = [];
              for (let i = 0; i < cells.length; i += 7) rows.push(cells.slice(i, i + 7));
              const DOW = ['Su','Mo','Tu','We','Th','Fr','Sa'];

              function isoOf(d: Date) {
                return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
              }
              function friendlyDate(iso: string) {
                const d = new Date(iso + 'T00:00:00');
                return d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
              }

              // Derive a dot color for each configured date
              function dotColor(cfg: DayCfg | undefined): string {
                if (!cfg) return '';
                if (cfg.off) return '#F87171';
                const m = cfg.morning.enabled, e = cfg.evening.enabled;
                if (m && e) return '#2DD4BF';
                if (m) return '#FCD34D';
                if (e) return '#A5B4FC';
                return '#F87171';
              }

              let prevMonth = -1;
              const monthLabels: { label: string; rowIdx: number }[] = [];
              rows.forEach((row, ri) => {
                const fd = row.find(c => c !== null);
                if (fd && fd.getMonth() !== prevMonth) {
                  prevMonth = fd.getMonth();
                  monthLabels.push({ label: fd.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }), rowIdx: ri });
                }
              });

              return (
                <View style={{ marginTop: 24 }}>
                  <Text style={styles.calTitle}>📅  30-DAY SCHEDULE  ·  Tap date to configure</Text>

                  {/* DOW header */}
                  <View style={[styles.calDowRow, { marginTop: 12 }]}>
                    {DOW.map(d => <Text key={d} style={styles.calDow}>{d}</Text>)}
                  </View>

                  {/* Calendar grid */}
                  {rows.map((row, ri) => {
                    const ml = monthLabels.find(m => m.rowIdx === ri);
                    return (
                      <View key={ri}>
                        {ml && <Text style={styles.calMonthLabel}>{ml.label}</Text>}
                        <View style={styles.calRow}>
                          {row.map((cell, ci) => {
                            if (!cell) return <View key={ci} style={styles.calCell} />;
                            const iso = isoOf(cell);
                            const cfg = calendarOverrides[iso];
                            const dot = dotColor(cfg);
                            const isSelected = selectedCalDate === iso;
                            const isToday = cell.getTime() === today.getTime();
                            return (
                              <TouchableOpacity
                                key={ci}
                                onPress={() => {
                                  const activeCli = clinics[activeClinic];
                                  const existing = calendarOverrides[iso];
                                  const form = existing ? JSON.parse(JSON.stringify(existing)) : blankDay(activeCli);
                                  setSelectedCalDate(iso);
                                  setDayForm(form);
                                  setDayModeState(existing ? modeOf(existing) : 'both');
                                }}
                                style={[
                                  styles.calCell,
                                  cfg?.off && { backgroundColor: 'rgba(239,68,68,0.15)', borderColor: 'rgba(239,68,68,0.4)' },
                                  cfg && !cfg.off && { backgroundColor: 'rgba(13,148,136,0.14)', borderColor: 'rgba(45,212,191,0.35)' },
                                  isSelected && { borderColor: '#FFF', borderWidth: 2, backgroundColor: 'rgba(255,255,255,0.1)' },
                                  isToday && !isSelected && { borderColor: '#2DD4BF', borderWidth: 1.5 },
                                ]}
                              >
                                <Text style={[
                                  styles.calCellDate,
                                  isToday && { color: '#2DD4BF', fontWeight: '900' },
                                  isSelected && { color: '#FFF' },
                                  cfg?.off && { textDecorationLine: 'line-through', color: '#F87171' },
                                ]}>{cell.getDate()}</Text>
                                {dot ? <View style={{ width: 5, height: 5, borderRadius: 2.5, backgroundColor: dot }} /> : null}
                              </TouchableOpacity>
                            );
                          })}
                        </View>
                      </View>
                    );
                  })}

                  {/* Legend */}
                  <View style={styles.calLegend}>
                    {[
                      { color: '#F87171', label: 'Off/Holiday' },
                      { color: '#FCD34D', label: 'Morning' },
                      { color: '#A5B4FC', label: 'Evening' },
                      { color: '#2DD4BF', label: 'Both open' },
                    ].map(item => (
                      <View key={item.label} style={styles.calLegendItem}>
                        <View style={[styles.calLegendDot, { backgroundColor: item.color }]} />
                        <Text style={styles.calLegendTxt}>{item.label}</Text>
                      </View>
                    ))}
                  </View>

                  {/* ── DAY EDITOR ─────────────────────────── */}
                  {selectedCalDate && (
                    <View style={styles.dayEditor}>
                      {/* Header */}
                      <View style={styles.dayEditorHeader}>
                        <Text style={styles.dayEditorDate}>✏  {friendlyDate(selectedCalDate)}</Text>
                        <TouchableOpacity onPress={() => setSelectedCalDate(null)} style={styles.dayEditorClose}>
                          <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14 }}>✕</Text>
                        </TouchableOpacity>
                      </View>

                      {/* ── 4 SHIFT BUTTONS ── */}
                      <View style={styles.shiftBtnRow}>
                        {([
                          { id: 'morning',  icon: '☀',  label: 'Morning',  bg: 'rgba(245,158,11,0.25)', border: '#F59E0B', txt: '#FCD34D' },
                          { id: 'evening',  icon: '☾',  label: 'Evening',  bg: 'rgba(139,92,246,0.25)', border: '#7C3AED', txt: '#A5B4FC' },
                          { id: 'both',     icon: '✓',  label: 'Both',     bg: 'rgba(13,148,136,0.25)', border: '#0D9488', txt: '#2DD4BF' },
                          { id: 'holiday',  icon: '✕',  label: 'Holiday',  bg: 'rgba(239,68,68,0.22)',  border: '#DC2626', txt: '#F87171' },
                        ] as { id: DayMode; icon: string; label: string; bg: string; border: string; txt: string }[]).map(btn => {
                          const active = dayMode === btn.id;
                          return (
                            <TouchableOpacity
                              key={btn.id}
                              onPress={() => selectMode(btn.id)}
                              style={[
                                styles.shiftModeBtn,
                                active && { backgroundColor: btn.bg, borderColor: btn.border },
                              ]}
                            >
                              <Text style={{ fontSize: 15, lineHeight: 18 }}>{btn.icon}</Text>
                              <Text style={[styles.shiftModeBtnTxt, active && { color: btn.txt }]}>{btn.label}</Text>
                            </TouchableOpacity>
                          );
                        })}
                      </View>

                      {/* Holiday: no further config needed */}
                      {dayMode === 'holiday' && (
                        <View style={{ alignItems: 'center', paddingVertical: 16 }}>
                          <Text style={{ fontSize: 26, marginBottom: 6 }}>🚫</Text>
                          <Text style={{ color: '#F87171', fontWeight: '700', fontSize: 13 }}>No appointments on this day</Text>
                        </View>
                      )}

                      {/* ── SHIFT FORMS ──────────────────────────────── */}
                      {(['morning', 'both'].includes(dayMode)) && (
                        <ShiftForm
                          shift="morning"
                          accentColor="#FCD34D"
                          icon="☀"
                          label="Morning Shift"
                          data={dayForm.morning}
                          clinics={clinics}
                          onChange={p => patchShift('morning', p)}
                        />
                      )}
                      {(['evening', 'both'].includes(dayMode)) && (
                        <ShiftForm
                          shift="evening"
                          accentColor="#A5B4FC"
                          icon="☾"
                          label="Evening Shift"
                          data={dayForm.evening}
                          clinics={clinics}
                          onChange={p => patchShift('evening', p)}
                        />
                      )}

                      {/* Apply Day button */}
                      <TouchableOpacity
                        style={styles.applyDayBtn}
                        onPress={() => {
                          setCalendarOverrides(prev => ({ ...prev, [selectedCalDate]: dayForm }));
                          setSelectedCalDate(null);
                        }}
                      >
                        <Text style={styles.applyDayBtnTxt}>✓  Apply to {friendlyDate(selectedCalDate)}</Text>
                      </TouchableOpacity>
                    </View>
                  )}

                  {/* Save all */}
                  <TouchableOpacity
                    style={[styles.saveBtn, { marginTop: 16 }, calSaving && { opacity: 0.7 }]}
                    disabled={calSaving}
                    onPress={async () => {
                      setCalSaving(true); setCalSaved(false);
                      try {
                        await updateDoctor({ calendar: calendarOverrides as any });
                        setCalSaved(true);
                        setTimeout(() => setCalSaved(false), 2000);
                      } catch {}
                      setCalSaving(false);
                    }}
                  >
                    {calSaving
                      ? <ActivityIndicator color="#FFF" size="small" />
                      : <Text style={styles.saveBtnText}>{calSaved ? '✓ Schedule Saved to Firebase!' : '💾 Save 30-Day Schedule'}</Text>}
                  </TouchableOpacity>
                </View>
              );
            })()}
          </ScrollView>
        </View>
      </SafeAreaView>
    );
  }

  if (section === 'fees') {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.container}>
          <BackHeader title="Fee Structure" onBack={() => setSection('main')} />
          <ScrollView contentContainerStyle={styles.formScroll} showsVerticalScrollIndicator={false}>
            <View style={styles.formCard}>
              <View style={styles.field}>
                <Text style={styles.fieldLabel}>CONSULTATION FEE (₹)</Text>
                <TextInput
                  style={styles.fieldInput}
                  value={consultFee}
                  onChangeText={setConsultFee}
                  keyboardType="numeric"
                  placeholderTextColor="rgba(255,255,255,0.2)"
                  placeholder="500"
                />
              </View>
              <View style={styles.field}>
                <Text style={styles.fieldLabel}>EMERGENCY / PRIORITY FEE (₹)</Text>
                <TextInput
                  style={styles.fieldInput}
                  value={emergencyFee}
                  onChangeText={setEmergencyFee}
                  keyboardType="numeric"
                  placeholderTextColor="rgba(255,255,255,0.2)"
                  placeholder="1000"
                />
              </View>
              <View style={styles.feeNote}>
                <Text style={styles.feeNoteText}>
                  ℹ Platform fee (₹10 Normal / ₹20 Emergency) is deducted from each token before settlement.
                </Text>
              </View>
            </View>
            <TouchableOpacity style={styles.saveBtn} onPress={() => setSection('main')}>
              <Text style={styles.saveBtnText}>✓ Save Fee Structure</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </SafeAreaView>
    );
  }

  if (section === 'patientApp') {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.container}>
          <BackHeader title="Patient App Settings" onBack={() => setSection('main')} />
          <ScrollView contentContainerStyle={styles.formScroll} showsVerticalScrollIndicator={false}>
            <View style={styles.formCard}>
              <Text style={styles.formCardTitle}>FEATURES</Text>
              {[
                { label: 'Online Booking', sub: 'Allow patients to book tokens online', val: onlineBooking, set: setOnlineBooking },
                { label: 'Emergency Tokens', sub: 'Allow emergency token requests', val: emergencyTokens, set: setEmergencyTokens },
                { label: 'Show Wait Time', sub: 'Display estimated wait time', val: showWaitTime, set: setShowWaitTime },
                { label: 'Show Queue Position', sub: 'Show patient\'s current position', val: showPosition, set: setShowPosition },
                { label: 'Show Doctor Name', sub: 'Display your name in the app', val: showDoctorName, set: setShowDoctorName },
                { label: 'Show Fee', sub: 'Display consultation fee', val: showFee, set: setShowFee },
              ].map((item, i) => (
                <View key={item.label} style={[styles.toggleRow, i > 0 && { borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)' }]}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.toggleRowLabel}>{item.label}</Text>
                    <Text style={styles.toggleRowSub}>{item.sub}</Text>
                  </View>
                  <Toggle on={item.val} onChange={() => item.set(p => !p)} />
                </View>
              ))}
            </View>
            <View style={styles.formCard}>
              <Text style={styles.formCardTitle}>PATIENT ALERT MESSAGE</Text>
              <TextInput
                style={[styles.fieldInput, { height: 80, paddingTop: 10 }]}
                value={alertMessage}
                onChangeText={setAlertMessage}
                multiline
                placeholderTextColor="rgba(255,255,255,0.2)"
                placeholder="Enter the alert message sent to patients..."
              />
            </View>
            <View style={styles.formCard}>
              <Text style={styles.formCardTitle}>NOTIFICATION PREFERENCES</Text>
              {[
                { label: 'Sound', val: notifSound, set: setNotifSound },
                { label: 'Vibrate', val: notifVibrate, set: setNotifVibrate },
              ].map((item, i) => (
                <View key={item.label} style={[styles.toggleRow, i > 0 && { borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)' }]}>
                  <Text style={styles.toggleRowLabel}>{item.label}</Text>
                  <Toggle on={item.val} onChange={() => item.set(p => !p)} />
                </View>
              ))}
            </View>
            <TouchableOpacity style={styles.saveBtn} onPress={() => setSection('main')}>
              <Text style={styles.saveBtnText}>✓ Save Patient App Settings</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </SafeAreaView>
    );
  }

  // Main settings menu
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.container}>
        <View style={styles.glowTop} />
        <View style={styles.glowBottom} />

        <View style={styles.header}>
          <Text style={styles.headerTitle}>Settings</Text>
          <Text style={styles.headerSub}>Account, clinic & preferences</Text>
        </View>

        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 14, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
          {/* Profile hero card */}
          <View style={styles.profileCard}>
            <View style={styles.profileRow}>
              <View style={styles.avatarWrap}>
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarEmoji}>⚕</Text>
                </View>
                <TouchableOpacity style={styles.cameraBtn} onPress={() => setSection('profile')}>
                  <Text style={{ fontSize: 11 }}>📷</Text>
                </TouchableOpacity>
              </View>
              <View style={{ flex: 1, minWidth: 0 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                  <Text style={styles.profileName}>{name}</Text>
                  <Text style={{ fontSize: 16, color: TEAL_LT }}>✓</Text>
                </View>
                <Text style={styles.profileSpec}>{specialisation} · {qualifications}</Text>
                <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap', marginTop: 4 }}>
                  <View style={styles.onlineBadge}><Text style={styles.onlineBadgeText}>● Online</Text></View>
                  <View style={styles.expBadge}><Text style={styles.expBadgeText}>{experience} yrs exp</Text></View>
                  <View style={styles.ratingBadge}><Text style={styles.ratingBadgeText}>★ 4.9</Text></View>
                </View>
              </View>
            </View>
            <View style={styles.profileStats}>
              {[
                { label: 'Patients', value: `${(parseInt(patientsTotal) / 1000).toFixed(1)}k` },
                { label: 'Clinics',  value: `${clinics.filter(c => c.active && c.name).length} Active` },
                { label: 'Rating',   value: '4.9 / 5' },
              ].map((s, i) => (
                <View key={i} style={[styles.profileStatItem, i < 2 && styles.profileStatBorder]}>
                  <Text style={styles.profileStatValue}>{s.value}</Text>
                  <Text style={styles.profileStatLabel}>{s.label}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Doctor Profile */}
          <SectionLabel label="Doctor Profile" />
          <View style={styles.settingsGroup}>
            <SettingRow icon="👤" iconBg="rgba(129,140,248,0.15)" iconColor="#818CF8" label="Manage Profile" sub="Name, qualifications, bio & photo" onPress={() => setSection('profile')} />
            <SettingRow icon="🔒" iconBg="rgba(251,191,36,0.12)" iconColor="#FCD34D" label="Change Password" sub="Update your login password" last />
          </View>

          {/* Practice */}
          <SectionLabel label="Practice" />
          <View style={styles.settingsGroup}>
            <SettingRow icon="🏥" iconBg="rgba(103,232,249,0.12)" iconColor="#67E8F9" label="Manage Clinics" sub={`${clinics.filter(c => c.active && c.name).length} clinics configured`} onPress={() => setSection('clinics')} />
            <SettingRow icon="📅" iconBg="rgba(45,212,191,0.12)" iconColor={TEAL_LT} label="Schedule & Shifts" sub="Shift timings, days off & max tokens" onPress={() => setSection('schedule')} />
            <SettingRow icon="₹" iconBg="rgba(251,191,36,0.12)" iconColor="#FCD34D" label="Fee Structure" sub={`Consult ₹${consultFee} · Emergency ₹${emergencyFee}`} onPress={() => setSection('fees')} last />
          </View>

          {/* Patient App */}
          <SectionLabel label="Patient App" />
          <View style={styles.settingsGroup}>
            <SettingRow icon="📱" iconBg="rgba(99,102,241,0.12)" iconColor="#818CF8" label="Patient App Settings" sub="Booking, display & notifications" onPress={() => setSection('patientApp')} last />
          </View>

          {/* Bank */}
          <SectionLabel label="Bank & Payments" />
          <View style={styles.settingsGroup}>
            <SettingRow icon="🏦" iconBg="rgba(45,212,191,0.12)" iconColor={TEAL_LT} label="Bank Account" sub="HDFC ••4782 — Settlement every Tuesday" />
            <SettingRow icon="💳" iconBg="rgba(129,140,248,0.12)" iconColor="#A5B4FC" label="Payout Settings" sub="Auto-settlement · Weekly cycle" last />
          </View>

          {/* Notifications */}
          <SectionLabel label="Notifications" />
          <View style={styles.settingsGroup}>
            <SettingRow icon="🔔" iconBg="rgba(45,212,191,0.12)" iconColor={TEAL_LT} label="New Booking Alerts" sub="Notify when a token is booked"
              right={<Toggle on={notifBooking} onChange={() => setNotifBooking(p => !p)} />} />
            <SettingRow icon="⚠" iconBg="rgba(239,68,68,0.12)" iconColor="#F87171" label="Emergency Alerts" sub="High-priority push notifications"
              right={<Toggle on={notifEmergency} onChange={() => setNotifEmergency(p => !p)} />} />
            <SettingRow icon="₹" iconBg="rgba(251,191,36,0.12)" iconColor="#FCD34D" label="Payout Notifications" sub="Settlement & transfer updates"
              right={<Toggle on={notifPayout} onChange={() => setNotifPayout(p => !p)} />} last />
          </View>

          {/* Support */}
          <SectionLabel label="Support & Legal" />
          <View style={styles.settingsGroup}>
            <SettingRow icon="❓" iconBg="rgba(103,232,249,0.12)" iconColor="#67E8F9" label="Help & Support" sub="Chat, call or raise a ticket" />
            <SettingRow icon="💬" iconBg="rgba(129,140,248,0.12)" iconColor="#818CF8" label="Send Feedback" sub="Help us improve LINESETU" />
            <SettingRow icon="★" iconBg="rgba(251,191,36,0.12)" iconColor="#FCD34D" label="Rate the App" sub="Love the app? Leave a review" />
            <SettingRow icon="📄" iconBg="rgba(255,255,255,0.07)" iconColor="rgba(255,255,255,0.4)" label="Terms & Privacy Policy" sub="v2.1.0 · Last updated Jan 2026" last />
          </View>

          {/* Account Actions */}
          <SectionLabel label="Account Actions" />
          <View style={styles.settingsGroup}>
            <SettingRow icon="→" iconBg="rgba(239,68,68,0.12)" iconColor="#F87171" label="Log Out" danger
              right={<Text style={{ color: '#F87171', fontSize: 18 }}>›</Text>} onPress={() => setShowLogout(true)} />
            <SettingRow icon="🗑" iconBg="rgba(239,68,68,0.08)" iconColor="rgba(239,68,68,0.55)" label="Delete Account" sub="Permanently remove your LINESETU account" danger
              right={<Text style={{ color: 'rgba(239,68,68,0.45)', fontSize: 18 }}>›</Text>} last />
          </View>

          <View style={{ alignItems: 'center', paddingVertical: 20 }}>
            <Text style={styles.versionText}>LINESETU Doctor · v2.1.0</Text>
            <Text style={styles.buildText}>Build 20260410 · © 2026 LINESETU</Text>
          </View>
        </ScrollView>

        {showLogout && (
          <View style={styles.logoutOverlay}>
            <View style={styles.logoutSheet}>
              <View style={styles.logoutHandle} />
              <View style={styles.logoutIconRow}>
                <View style={styles.logoutIcon}><Text style={{ fontSize: 20, color: '#F87171' }}>→</Text></View>
                <View>
                  <Text style={styles.logoutTitle}>Log Out?</Text>
                  <Text style={styles.logoutSub}>You'll need to sign in again to access your account.</Text>
                </View>
              </View>
              <TouchableOpacity style={styles.logoutConfirmBtn} onPress={() => { setShowLogout(false); logout(); }}>
                <Text style={styles.logoutConfirmBtnText}>Yes, Log Out</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setShowLogout(false)} style={styles.logoutCancelBtn}>
                <Text style={styles.logoutCancelBtnText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG, ...(isWeb && { paddingTop: 44 }) },
  container: { flex: 1, backgroundColor: BG },
  glowTop: { position: 'absolute', top: -60, right: -60, width: 220, height: 220, borderRadius: 110, backgroundColor: 'rgba(13,148,136,0.18)', opacity: 0.5 },
  glowBottom: { position: 'absolute', bottom: 100, left: -40, width: 160, height: 160, borderRadius: 80, backgroundColor: 'rgba(99,102,241,0.1)', opacity: 0.5 },
  header: { padding: 16, paddingBottom: 8 },
  headerTitle: { fontSize: 18, fontWeight: '900', color: '#FFF', letterSpacing: -0.5 },
  headerSub: { fontSize: 11, color: 'rgba(255,255,255,0.3)', fontWeight: '500', marginTop: 2 },
  subHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 16, paddingBottom: 8 },
  backBtn: { width: 36, height: 36, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' },
  backBtnText: { fontSize: 18, color: 'rgba(255,255,255,0.6)' },
  subHeaderTitle: { fontSize: 18, fontWeight: '900', color: '#FFF' },
  formScroll: { padding: 14, paddingBottom: 100 },
  formCard: {
    borderRadius: 20, padding: 14, marginBottom: 12,
    backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.09)',
  },
  formCardTitle: { fontSize: 9, fontWeight: '800', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 },
  avatarSection: { alignItems: 'center', marginBottom: 18 },
  avatarLarge: {
    width: 90, height: 90, borderRadius: 26, backgroundColor: TEAL, alignItems: 'center', justifyContent: 'center',
    borderWidth: 2.5, borderColor: 'rgba(45,212,191,0.4)', marginBottom: 10,
  },
  photoChangeBtn: { paddingHorizontal: 16, paddingVertical: 7, borderRadius: 20, backgroundColor: 'rgba(13,148,136,0.2)', borderWidth: 1.5, borderColor: 'rgba(13,148,136,0.4)' },
  photoBtnText: { fontSize: 12, fontWeight: '700', color: TEAL_LT },
  field: { marginBottom: 10 },
  fieldLabel: { fontSize: 9, fontWeight: '800', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 5 },
  fieldInput: {
    borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(255,255,255,0.06)', color: '#FFF', fontSize: 13, fontWeight: '500',
    paddingHorizontal: 12, height: 44,
  },
  phoneRow: { flexDirection: 'row', gap: 6 },
  phonePrefix: { width: 52, height: 44, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' },
  phonePrefixText: { fontSize: 12, fontWeight: '700', color: 'rgba(255,255,255,0.6)' },
  saveBtn: { height: 50, borderRadius: 16, backgroundColor: TEAL, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  saveBtnText: { fontSize: 14, fontWeight: '800', color: '#FFF' },
  clinicTabs: { flexDirection: 'row', gap: 6, marginBottom: 12 },
  clinicTab: { flex: 1, height: 34, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', alignItems: 'center', justifyContent: 'center' },
  clinicTabActive: { backgroundColor: `${TEAL}33`, borderColor: `${TEAL}88` },
  clinicTabText: { fontSize: 11, fontWeight: '700', color: 'rgba(255,255,255,0.4)' },
  clinicTabTextActive: { color: TEAL_LT },
  toggleRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10 },
  toggleRowLabel: { fontSize: 13, fontWeight: '700', color: '#FFF', flex: 1 },
  toggleRowSub: { fontSize: 10, color: 'rgba(255,255,255,0.3)', fontWeight: '500', marginTop: 1 },
  shiftCard: {
    borderRadius: 18, padding: 12, marginBottom: 10,
    backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.09)',
  },
  shiftCardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  shiftCardTitle: { fontSize: 13, fontWeight: '800', color: '#FFF' },
  timeRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, marginBottom: 6 },
  timeDash: { fontSize: 18, color: 'rgba(255,255,255,0.3)', marginBottom: 10 },
  feeNote: { padding: 10, borderRadius: 10, backgroundColor: 'rgba(13,148,136,0.08)', borderWidth: 1, borderColor: 'rgba(13,148,136,0.2)', marginTop: 6 },
  feeNoteText: { fontSize: 11, color: 'rgba(255,255,255,0.45)', lineHeight: 15 },
  profileCard: {
    borderRadius: 20, padding: 16, marginBottom: 8,
    backgroundColor: 'rgba(13,148,136,0.12)', borderWidth: 1, borderColor: 'rgba(45,212,191,0.2)',
  },
  profileRow: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 14 },
  avatarWrap: { position: 'relative', flexShrink: 0 },
  avatarPlaceholder: { width: 68, height: 68, borderRadius: 20, backgroundColor: TEAL, alignItems: 'center', justifyContent: 'center', borderWidth: 2.5, borderColor: 'rgba(45,212,191,0.45)' },
  avatarEmoji: { fontSize: 30, color: '#FFF' },
  cameraBtn: { position: 'absolute', bottom: -5, right: -5, width: 24, height: 24, borderRadius: 12, backgroundColor: TEAL, borderWidth: 2, borderColor: BG, alignItems: 'center', justifyContent: 'center' },
  profileName: { fontSize: 16, fontWeight: '900', color: '#FFF', letterSpacing: -0.3 },
  profileSpec: { fontSize: 11, color: TEAL_LT, fontWeight: '700' },
  onlineBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 20, backgroundColor: 'rgba(45,212,191,0.12)', borderWidth: 1, borderColor: 'rgba(45,212,191,0.25)' },
  onlineBadgeText: { fontSize: 9, fontWeight: '700', color: TEAL_LT },
  expBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 20, backgroundColor: 'rgba(129,140,248,0.12)', borderWidth: 1, borderColor: 'rgba(129,140,248,0.25)' },
  expBadgeText: { fontSize: 9, fontWeight: '700', color: '#A5B4FC' },
  ratingBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 20, backgroundColor: 'rgba(251,191,36,0.1)', borderWidth: 1, borderColor: 'rgba(251,191,36,0.25)' },
  ratingBadgeText: { fontSize: 9, fontWeight: '700', color: '#FCD34D' },
  profileStats: { flexDirection: 'row', paddingTop: 12, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.07)' },
  profileStatItem: { flex: 1, alignItems: 'center' },
  profileStatBorder: { borderRightWidth: 1, borderRightColor: 'rgba(255,255,255,0.07)' },
  profileStatValue: { fontSize: 14, fontWeight: '900', color: '#FFF' },
  profileStatLabel: { fontSize: 9, color: 'rgba(255,255,255,0.35)', fontWeight: '600', marginTop: 1 },
  sectionLabel: { fontSize: 9, fontWeight: '800', color: 'rgba(255,255,255,0.28)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6, marginTop: 18, paddingLeft: 2 },
  settingsGroup: { borderRadius: 18, overflow: 'hidden', backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.09)' },
  settingRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 11, paddingHorizontal: 14 },
  settingRowBorder: { borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.045)' },
  settingIcon: { width: 36, height: 36, borderRadius: 11, alignItems: 'center', justifyContent: 'center', flexShrink: 0, borderWidth: 1 },
  settingLabel: { fontSize: 13, fontWeight: '700', color: '#FFF', lineHeight: 18 },
  settingSub: { fontSize: 10, color: 'rgba(255,255,255,0.32)', fontWeight: '500', marginTop: 2 },
  chevron: { fontSize: 18, color: 'rgba(255,255,255,0.2)' },
  toggle: { width: 40, height: 22, borderRadius: 11, justifyContent: 'center', borderWidth: 1 },
  toggleThumb: { position: 'absolute', width: 16, height: 16, borderRadius: 8, backgroundColor: '#FFF' },
  toggleThumbOn: { right: 2 },
  toggleThumbOff: { left: 2 },
  versionText: { fontSize: 11, fontWeight: '700', color: 'rgba(255,255,255,0.15)' },
  buildText: { fontSize: 9, color: 'rgba(255,255,255,0.1)', marginTop: 3 },
  logoutOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end', zIndex: 50 } as ViewStyle,
  logoutSheet: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 32, backgroundColor: '#0A0F1E', borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.08)' },
  logoutHandle: { width: 36, height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.15)', alignSelf: 'center', marginBottom: 20 },
  logoutIconRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 18 },
  logoutIcon: { width: 44, height: 44, borderRadius: 14, backgroundColor: 'rgba(239,68,68,0.15)', borderWidth: 1, borderColor: 'rgba(239,68,68,0.3)', alignItems: 'center', justifyContent: 'center' },
  logoutTitle: { fontSize: 16, fontWeight: '800', color: '#FFF' },
  logoutSub: { fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 2 },
  logoutConfirmBtn: { height: 48, borderRadius: 14, backgroundColor: '#EF4444', alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  logoutConfirmBtnText: { fontSize: 14, fontWeight: '800', color: '#FFF' },
  logoutCancelBtn: { height: 44, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' },
  logoutCancelBtnText: { fontSize: 13, fontWeight: '700', color: 'rgba(255,255,255,0.6)' },

  // 30-day calendar
  calHeader:       { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  calTitle:        { fontSize: 11, fontWeight: '800', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: 1 },
  calSub:          { fontSize: 11, color: 'rgba(255,255,255,0.3)', fontWeight: '500', marginBottom: 12, lineHeight: 15 },
  calDowRow:       { flexDirection: 'row', marginBottom: 4 },
  calDow:          { flex: 1, textAlign: 'center', fontSize: 9, fontWeight: '800', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: 0.5 },
  calMonthLabel:   { fontSize: 10, fontWeight: '800', color: TEAL_LT, textTransform: 'uppercase', letterSpacing: 0.8, marginTop: 8, marginBottom: 2 },
  calRow:          { flexDirection: 'row', marginBottom: 4 },
  calCell:         { flex: 1, height: 44, borderRadius: 11, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'transparent', margin: 1.5 },
  calCellDate:     { fontSize: 13, fontWeight: '700', color: 'rgba(255,255,255,0.7)', lineHeight: 16 },
  calLegend:       { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 10, marginBottom: 4 },
  calLegendItem:   { flexDirection: 'row', alignItems: 'center', gap: 5 },
  calLegendDot:    { width: 8, height: 8, borderRadius: 4 },
  calLegendTxt:    { fontSize: 10, fontWeight: '700', color: 'rgba(255,255,255,0.45)' },
  calHint:         { fontSize: 10, color: 'rgba(255,255,255,0.2)', fontWeight: '500', marginBottom: 14, fontStyle: 'italic' },
  // Day editor
  dayEditor:       { marginTop: 14, borderRadius: 18, borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)', backgroundColor: 'rgba(255,255,255,0.04)', padding: 14 },
  dayEditorHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  dayEditorDate:   { fontSize: 14, fontWeight: '900', color: '#FFF' },
  dayEditorClose:  { width: 28, height: 28, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.07)', alignItems: 'center', justifyContent: 'center' },
  dayOffRow:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 12, borderRadius: 12, backgroundColor: 'rgba(239,68,68,0.08)', borderWidth: 1, borderColor: 'rgba(239,68,68,0.2)', marginBottom: 6 },
  dayOffLabel:     { fontSize: 13, fontWeight: '700', color: '#FFF' },
  dayOffSub:       { fontSize: 10, color: 'rgba(255,255,255,0.35)', marginTop: 2 },
  applyDayBtn:     { marginTop: 14, height: 46, borderRadius: 14, backgroundColor: 'rgba(45,212,191,0.25)', borderWidth: 1.5, borderColor: '#2DD4BF', alignItems: 'center', justifyContent: 'center' },
  applyDayBtnTxt:  { fontSize: 13, fontWeight: '900', color: '#2DD4BF' },
  // Shift-mode 4-button row
  shiftBtnRow:     { flexDirection: 'row', gap: 6, marginBottom: 10 },
  shiftModeBtn:    { flex: 1, paddingVertical: 10, borderRadius: 12, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.12)', backgroundColor: 'rgba(255,255,255,0.05)', alignItems: 'center', gap: 3 },
  shiftModeBtnTxt: { fontSize: 10, fontWeight: '800', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: 0.5 },
});
