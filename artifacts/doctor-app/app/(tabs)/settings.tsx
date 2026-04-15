import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput, ViewStyle, Platform,
  ActivityIndicator, Modal, FlatList, Image, BackHandler, Linking, Alert,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import * as ImagePicker from 'expo-image-picker';
import { BG, TEAL, TEAL_LT } from '../../constants/theme';
import { Feather } from '@expo/vector-icons';

import { useDoctor } from '../../contexts/DoctorContext';
import { registerSettingsResetHandler } from './_settingsResetBridge';

const isWeb = Platform.OS === 'web';
const BASE = () => `https://${process.env.EXPO_PUBLIC_DOMAIN}`;

type SettingsSection = 'main' | 'profile' | 'clinics' | 'schedule' | 'fees' | 'patientApp' | 'bank' | 'payout' | 'help' | 'feedback' | 'terms';

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
        <Feather name="clock" size={14} color="rgba(255,255,255,0.3)" />
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
  iconName: React.ComponentProps<typeof Feather>['name'];
  label: string;
  data: ShiftSlot;
  clinics: ClinicData[];
  onChange: (patch: Partial<ShiftSlot>) => void;
}
function ShiftForm({ shift, accentColor, iconName, label, data, clinics, onChange }: ShiftFormProps) {
  const activeClinics = clinics.filter(c => c.active && c.name);
  const selectedClinicIdx = activeClinics.findIndex(c => c.name === data.clinicName);
  return (
    <View style={[styles.shiftCard, { marginTop: 10, borderColor: `${accentColor}40` }]}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <Feather name={iconName} size={16} color={accentColor} />
        <Text style={[styles.shiftCardTitle, { color: accentColor }]}>{label}</Text>
      </View>

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

function Field({ label, value, onChange, multiline, keyboardType, required, error }: {
  label: string; value: string; onChange: (v: string) => void;
  multiline?: boolean; keyboardType?: 'default' | 'phone-pad' | 'numeric' | 'url';
  required?: boolean; error?: boolean;
}) {
  const handleChange = (v: string) => {
    if (keyboardType === 'phone-pad') {
      onChange(v.replace(/\D/g, '').slice(0, 10));
      return;
    }
    onChange(v);
  };
  return (
    <View style={styles.field}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3, marginBottom: 5 }}>
        <Text style={styles.fieldLabel}>{label}</Text>
        {required && <Text style={{ fontSize: 9, color: '#F87171', fontWeight: '900' }}>*</Text>}
      </View>
      <TextInput
        style={[styles.fieldInput, multiline && { height: 72, paddingTop: 10 }, error && { borderColor: 'rgba(239,68,68,0.6)' }]}
        value={value}
        onChangeText={handleChange}
        multiline={multiline}
        keyboardType={keyboardType ?? 'default'}
        maxLength={keyboardType === 'phone-pad' ? 10 : undefined}
        placeholderTextColor="rgba(255,255,255,0.2)"
        placeholder={`Enter ${label.toLowerCase()}`}
      />
      {error && <Text style={{ fontSize: 9, color: '#F87171', fontWeight: '700', marginTop: 3 }}>Required</Text>}
    </View>
  );
}

const SPECIALIZATIONS = [
  'General Physician', 'Cardiologist', 'Dermatologist', 'Orthopedic Surgeon',
  'Gynecologist', 'Pediatrician', 'ENT Specialist', 'Neurologist',
  'Ophthalmologist', 'Dentist',
];

function SpecPicker({ value, onChange, error }: {
  value: string; onChange: (v: string) => void; error?: boolean;
}) {
  const [showInput, setShowInput] = useState(() => !SPECIALIZATIONS.includes(value));

  const pick = (spec: string) => { onChange(spec); setShowInput(false); };
  const pickOther = () => { setShowInput(true); if (SPECIALIZATIONS.includes(value)) onChange(''); };

  return (
    <View style={styles.field}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3, marginBottom: 8 }}>
        <Text style={styles.fieldLabel}>SPECIALISATION</Text>
        <Text style={{ fontSize: 9, color: '#F87171', fontWeight: '900' }}>*</Text>
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 7 }}>
        {SPECIALIZATIONS.map(spec => {
          const active = value === spec && !showInput;
          return (
            <TouchableOpacity
              key={spec}
              onPress={() => pick(spec)}
              style={[styles.specChip, active && styles.specChipActive]}
            >
              <Text style={[styles.specChipText, active && styles.specChipTextActive]}>{spec}</Text>
            </TouchableOpacity>
          );
        })}
        <TouchableOpacity
          onPress={pickOther}
          style={[styles.specChip, showInput && styles.specChipOther]}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Text style={[styles.specChipText, showInput && { color: '#FCD34D' }]}>Other</Text>
              <Feather name="edit-2" size={10} color={showInput ? '#FCD34D' : 'rgba(255,255,255,0.45)'} />
            </View>
        </TouchableOpacity>
      </View>
      {showInput && (
        <TextInput
          style={[styles.fieldInput, { marginTop: 10 }, error && !value.trim() && { borderColor: 'rgba(239,68,68,0.6)' }]}
          value={value}
          onChangeText={onChange}
          placeholder="Type your specialisation..."
          placeholderTextColor="rgba(255,255,255,0.2)"
          autoFocus
        />
      )}
      {error && !value.trim() && <Text style={{ fontSize: 9, color: '#F87171', fontWeight: '700', marginTop: 4 }}>Required</Text>}
    </View>
  );
}

function SectionLabel({ label }: { label: string }) {
  return <Text style={styles.sectionLabel}>{label}</Text>;
}

function SettingRow({
  iconName, iconBg, iconColor, label, sub, right, danger = false, last = false, onPress,
}: {
  iconName: React.ComponentProps<typeof Feather>['name']; iconBg: string; iconColor: string;
  label: string; sub?: string; right?: React.ReactNode;
  danger?: boolean; last?: boolean; onPress?: () => void;
}) {
  const Wrapper = onPress ? TouchableOpacity : View;
  return (
    <Wrapper onPress={onPress} style={[styles.settingRow, !last && styles.settingRowBorder]}>
      <View style={[styles.settingIcon, { backgroundColor: iconBg, borderColor: `${iconColor}33` }]}>
        <Feather name={iconName} size={16} color={iconColor} />
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
        <Feather name="chevron-left" size={22} color="#FFF" />
      </TouchableOpacity>
      <Text style={styles.subHeaderTitle}>{title}</Text>
    </View>
  );
}

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const { doctor, logout, updateDoctor } = useDoctor();
  const [section, setSection] = useState<SettingsSection>('main');
  // Reset to main whenever the Settings tab button is tapped (even while already on settings)
  useEffect(() => {
    return registerSettingsResetHandler(() => setSection('main'));
  }, []);

  // Profile state — seeded from Firebase via doctor context
  const [name, setName] = useState(() => doctor?.name ?? '');
  const [qualifications, setQualifications] = useState(() => doctor?.qualifications ?? '');
  const [specialisation, setSpecialisation] = useState(() => (doctor as any)?.specialization ?? '');
  const [experience, setExperience] = useState(() => doctor?.experience ?? '');
  const [patientsTotal, setPatientsTotal] = useState(() => doctor?.totalPatients ?? '');
  const [mobile, setMobile] = useState(() => {
    const p: string = doctor?.phone ?? '';
    return p.startsWith('+91') ? p.slice(3).trim() : p;
  });
  const [bio, setBio] = useState(() => doctor?.bio ?? '');
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);
  const [profileError, setProfileError] = useState('');

  // Sync profile fields when doctor context loads (e.g. after async hydration)
  const profileSynced = React.useRef(false);
  React.useEffect(() => {
    if (!profileSynced.current && doctor) {
      profileSynced.current = true;
      setName(doctor.name ?? '');
      setQualifications(doctor.qualifications ?? '');
      setSpecialisation((doctor as any).specialization ?? '');
      setExperience(doctor.experience ?? '');
      setPatientsTotal(doctor.totalPatients ?? '');
      const p: string = doctor.phone ?? '';
      setMobile(p.startsWith('+91') ? p.slice(3).trim() : p);
      setBio(doctor.bio ?? '');
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
  const [clinicFieldErrors, setClinicFieldErrors] = useState<{ name?: boolean; address?: boolean; city?: boolean; phone?: boolean; maps?: boolean }>({});

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

  // Fee state — seeded from Firebase via doctor context
  const [consultFee, setConsultFee] = useState(() => String((doctor as any)?.consultFee ?? 10));
  const [emergencyFee, setEmergencyFee] = useState(() => String((doctor as any)?.emergencyFee ?? 20));
  const [walkinFee, setWalkinFee] = useState(() => String((doctor as any)?.walkinFee ?? 0));
  const [clinicConsultFee, setClinicConsultFee] = useState(() => String((doctor as any)?.clinicConsultFee ?? 0));
  const [clinicEmergencyFee, setClinicEmergencyFee] = useState(() => String((doctor as any)?.clinicEmergencyFee ?? 0));
  const [feeSaving, setFeeSaving] = useState(false);
  const [feeSaved, setFeeSaved] = useState(false);
  const feeSynced = React.useRef(false);
  React.useEffect(() => {
    if (!feeSynced.current && doctor) {
      feeSynced.current = true;
      setConsultFee(String((doctor as any).consultFee ?? 10));
      setEmergencyFee(String((doctor as any).emergencyFee ?? 20));
      setWalkinFee(String((doctor as any).walkinFee ?? 0));
      setClinicConsultFee(String((doctor as any).clinicConsultFee ?? 0));
      setClinicEmergencyFee(String((doctor as any).clinicEmergencyFee ?? 0));
    }
  }, [doctor]);

  // Patient app state
  const [onlineBooking, setOnlineBooking] = useState(true);
  const [emergencyTokens, setEmergencyTokens] = useState(true);
  const [showWaitTime, setShowWaitTime] = useState(true);
  const [showPosition, setShowPosition] = useState(true);
  const [showFee, setShowFee] = useState(false);
  const [alertMessage, setAlertMessage] = useState('Your turn is coming soon. Please be ready at the clinic.');
  const [patientAppSaving, setPatientAppSaving] = useState(false);
  const [patientAppSaved, setPatientAppSaved] = useState(false);
  const patientAppSynced = React.useRef(false);
  React.useEffect(() => {
    if (!patientAppSynced.current && doctor) {
      patientAppSynced.current = true;
      if ((doctor as any).onlineBooking !== undefined) setOnlineBooking((doctor as any).onlineBooking);
      if ((doctor as any).emergencyTokens !== undefined) setEmergencyTokens((doctor as any).emergencyTokens);
      if ((doctor as any).showWaitTime !== undefined) setShowWaitTime((doctor as any).showWaitTime);
      if ((doctor as any).showPosition !== undefined) setShowPosition((doctor as any).showPosition);
      if ((doctor as any).showFee !== undefined) setShowFee((doctor as any).showFee);
      if ((doctor as any).alertMessage) setAlertMessage((doctor as any).alertMessage);
    }
  }, [doctor]);

  const [payoutType, setPayoutType] = useState<'bank' | 'upi'>('bank');
  const [accountHolderName, setAccountHolderName] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [ifscCode, setIfscCode] = useState('');
  const [branch, setBranch] = useState('');
  const [upiId, setUpiId] = useState('');
  const [payoutDisplayName, setPayoutDisplayName] = useState('');
  const [payoutCycle, setPayoutCycle] = useState('Weekly');
  const [payoutEnabled, setPayoutEnabled] = useState(true);
  const [bankSaving, setBankSaving] = useState(false);
  const [bankSaved, setBankSaved] = useState(false);
  const [bankAttempted, setBankAttempted] = useState(false);
  const [payoutAttempted, setPayoutAttempted] = useState(false);
  const bankSynced = React.useRef(false);
  React.useEffect(() => {
    if (!bankSynced.current && doctor) {
      bankSynced.current = true;
      const bank = (doctor as any).bankAccount ?? {};
      setPayoutType(bank.accountType === 'upi' ? 'upi' : 'bank');
      setAccountHolderName(bank.accountHolderName ?? '');
      setBankName(bank.bankName ?? '');
      setAccountNumber(bank.accountNumber ?? '');
      setIfscCode(bank.ifscCode ?? '');
      setBranch(bank.branch ?? '');
      setUpiId(bank.upiId ?? '');
      setPayoutDisplayName(bank.payoutName ?? '');
      setPayoutCycle(bank.payoutCycle ?? 'Weekly');
      setPayoutEnabled(bank.payoutEnabled !== false);
    }
  }, [doctor]);

  // Notification state — synced from Firebase
  const [notifBooking, setNotifBooking] = useState(true);
  const [notifEmergency, setNotifEmergency] = useState(true);
  const [notifPayout, setNotifPayout] = useState(true);
  const notifSynced = React.useRef(false);
  React.useEffect(() => {
    if (!notifSynced.current && doctor) {
      notifSynced.current = true;
      const n = (doctor as any).notifications;
      if (n) {
        if (n.booking !== undefined) setNotifBooking(n.booking !== false);
        if (n.emergency !== undefined) setNotifEmergency(n.emergency !== false);
        if (n.payout !== undefined) setNotifPayout(n.payout !== false);
      }
    }
  }, [doctor]);

  // Feedback state
  const [feedbackCategory, setFeedbackCategory] = useState('Feature Request');
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackSubmitting, setFeedbackSubmitting] = useState(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  // Delete account state
  const [showDeleteAccount, setShowDeleteAccount] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [showLogout, setShowLogout] = useState(false);
  const [profilePhotoLoading, setProfilePhotoLoading] = useState(false);
  const [profilePhotoUrl, setProfilePhotoUrl] = useState<string | null>(doctor?.profilePhoto ?? null);
  const [profilePhotoLocal, setProfilePhotoLocal] = useState<string | null>(null);

  // Results / photo gallery state
  const [resultPhotos, setResultPhotos] = useState<string[]>([]);
  const [showResults, setShowResults] = useState(true);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [deletingPhotoUrl, setDeletingPhotoUrl] = useState<string | null>(null);
  const resultsSynced = React.useRef(false);
  React.useEffect(() => {
    if (!resultsSynced.current && doctor) {
      resultsSynced.current = true;
      if (Array.isArray((doctor as any).results)) setResultPhotos((doctor as any).results);
      if ((doctor as any).showResults !== undefined) setShowResults((doctor as any).showResults !== false);
    }
  }, [doctor]);

  React.useEffect(() => {
    setProfilePhotoUrl(doctor?.profilePhoto ?? null);
  }, [doctor?.profilePhoto]);

  const pickAndUploadPhoto = async () => {
    if (!doctor) return;
    setUploadingPhoto(true);
    setUploadError(null);
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      setUploadingPhoto(false);
      setUploadError('Permission denied — please allow photo access in your device settings.');
      return;
    }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 0.5,
        base64: true,
        allowsEditing: true,
        aspect: [16, 9],
        exif: false,
      });
    if (result.canceled || !result.assets[0]) {
      setUploadingPhoto(false);
      return;
    }
    const asset = result.assets[0];
    if (!asset.base64) {
      setUploadingPhoto(false);
      setUploadError('Could not read image data. Please try a different photo.');
      return;
    }
    try {
      const mimeType = asset.mimeType || 'image/jpeg';
      const res = await fetch(`${BASE()}/api/doctors/${doctor.id}/results`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ base64: asset.base64, mimeType }),
      });
      const data = await res.json();
      if (res.ok && data.url) {
        const newResults = [...resultPhotos, data.url];
        setResultPhotos(newResults);
        await updateDoctor({ results: newResults } as any);
      } else {
        setUploadError(data.error || 'Upload failed. Please try again.');
      }
    } catch (err: any) {
      setUploadError('Upload failed — check your internet connection and try again.');
    }
    setUploadingPhoto(false);
  };

  const pickProfilePhoto = async () => {
    if (!doctor) return;
    setProfilePhotoLoading(true);
    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) return;
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 0.7,
        base64: true,
        allowsEditing: true,
        aspect: [1, 1],
        exif: false,
      });
      if (result.canceled || !result.assets[0]?.base64) return;
      const asset = result.assets[0];
      const mimeType = asset.mimeType || 'image/jpeg';
      setProfilePhotoLocal(`data:${mimeType};base64,${asset.base64}`);
      const res = await fetch(`${BASE()}/api/doctors/${doctor.id}/profile-photo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ base64: asset.base64, mimeType }),
      });
      const data = await res.json();
      if (res.ok && data.url) {
        setProfilePhotoUrl(data.url);
        await updateDoctor({ profilePhoto: data.url } as any);
      } else {
        setProfilePhotoLocal(null);
      }
    } catch {}
    setProfilePhotoLoading(false);
  };

  const deletePhoto = async (url: string) => {
    if (!doctor) return;
    setDeletingPhotoUrl(url);
    try {
      await fetch(`${BASE()}/api/doctors/${doctor.id}/results`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      const updated = resultPhotos.filter(u => u !== url);
      setResultPhotos(updated);
      await updateDoctor({ results: updated } as any);
    } catch {}
    setDeletingPhotoUrl(null);
  };

  const toggleShowResults = async () => {
    const next = !showResults;
    setShowResults(next);
    try { await updateDoctor({ showResults: next } as any); } catch {}
  };

  const updateClinic = (idx: number, patch: Partial<ClinicData>) => {
    setClinics(prev => prev.map((c, i) => i === idx ? { ...c, ...patch } : c));
  };

  const profileFieldErrors = {
    name: profileSaving && !name.trim(),
    qualifications: profileSaving && !qualifications.trim(),
    specialisation: profileSaving && !specialisation.trim(),
    experience: profileSaving && !experience.trim(),
    patientsTotal: profileSaving && !patientsTotal.trim(),
    mobile: profileSaving && !mobile.trim(),
    bio: profileSaving && !bio.trim(),
  };

  const saveProfile = async () => {
    const required = [name, qualifications, specialisation, experience, patientsTotal, mobile, bio];
    if (required.some(v => !v.trim())) {
      setProfileSaving(true);
      setProfileError('Please fill in all required fields.');
      return;
    }
    setProfileSaving(true);
    setProfileError('');
    try {
      await updateDoctor({
        name: name.trim(),
        qualifications: qualifications.trim(),
        specialization: specialisation.trim(),
        experience: experience.trim(),
        totalPatients: patientsTotal.trim(),
        phone: mobile.startsWith('+91') ? mobile.trim() : `+91${mobile.trim()}`,
        bio: bio.trim(),
      });
      setProfileSaved(true);
      setTimeout(() => {
        setProfileSaved(false);
        setSection('main');
      }, 1200);
    } catch {
      setProfileError('Failed to save. Please try again.');
    } finally {
      setProfileSaving(false);
    }
  };

  // ── Device hardware back button: auto-save + navigate to main ──────────
  // Use ref so handler always closes over fresh state (no stale closure issue)
  const deviceBackHandlerRef = React.useRef<() => void>(() => {});
  deviceBackHandlerRef.current = () => {
    const go = () => setSection('main');
    if (section === 'profile') {
      const required = [name, qualifications, specialisation, experience, patientsTotal, mobile, bio];
      if (required.every(v => v.trim())) {
        updateDoctor({
          name: name.trim(),
          qualifications: qualifications.trim(),
          specialization: specialisation.trim(),
          experience: experience.trim(),
          totalPatients: patientsTotal.trim(),
          phone: mobile.startsWith('+91') ? mobile.trim() : `+91${mobile.trim()}`,
          bio: bio.trim(),
        }).catch(() => {});
      }
    } else if (section === 'clinics') {
      updateDoctor({ clinics: clinics as any }).catch(() => {});
    } else if (section === 'schedule') {
      updateDoctor({ calendar: calendarOverrides as any }).catch(() => {});
    } else if (section === 'fees') {
      updateDoctor({ consultFee: Number(consultFee) || 0, emergencyFee: Number(emergencyFee) || 0, walkinFee: Number(walkinFee) || 0, clinicConsultFee: Number(clinicConsultFee) || 0, clinicEmergencyFee: Number(clinicEmergencyFee) || 0 } as any).catch(() => {});
    } else if (section === 'patientApp') {
      updateDoctor({ onlineBooking, emergencyTokens, showWaitTime, showPosition, showFee, alertMessage } as any).catch(() => {});
    } else if (section === 'bank') {
      const valid = payoutType === 'bank'
        ? accountHolderName.trim() && bankName.trim() && accountNumber.trim() && ifscCode.trim() && branch.trim()
        : upiId.trim() && payoutDisplayName.trim();
      if (valid) {
        updateDoctor({
          bankAccount: { accountType: payoutType, accountHolderName, bankName, accountNumber, ifscCode, branch, upiId, payoutName: payoutDisplayName, payoutCycle, payoutEnabled },
        } as any).catch(() => {});
      }
      setBankAttempted(false);
    } else if (section === 'payout') {
      if (payoutDisplayName.trim()) {
        const bank = (doctor as any)?.bankAccount ?? {};
        updateDoctor({ bankAccount: { ...bank, accountType: payoutType, payoutName: payoutDisplayName, payoutCycle, payoutEnabled } } as any).catch(() => {});
      }
      setPayoutAttempted(false);
    }
    go();
  };

  // Register/unregister BackHandler whenever section changes
  useEffect(() => {
    if (section === 'main') return;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      deviceBackHandlerRef.current();
      return true;
    });
    return () => sub.remove();
  }, [section]);
  // ─────────────────────────────────────────────────────────────────────────

  if (section === 'profile') {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.container}>
          <BackHeader title="Doctor Profile" onBack={() => setSection('main')} />
          <ScrollView contentContainerStyle={styles.formScroll} showsVerticalScrollIndicator={false}>
            {/* Avatar */}
            <View style={styles.avatarSection}>
              <View style={styles.avatarLarge}>
                {profilePhotoLocal || profilePhotoUrl
                  ? <Image
                      key={profilePhotoLocal || profilePhotoUrl || 'avatar'}
                      source={{ uri: profilePhotoLocal || profilePhotoUrl || undefined }}
                      style={{ width: '100%', height: '100%', borderRadius: 26 }}
                      resizeMode="cover"
                    />
                  : <Feather name="activity" size={28} color="#FFF" />}
              </View>
              <TouchableOpacity style={styles.photoChangeBtn} onPress={pickProfilePhoto} disabled={profilePhotoLoading}>
                {profilePhotoLoading
                  ? <ActivityIndicator color="#FFF" size="small" />
                  : <Text style={styles.photoBtnText}>{profilePhotoUrl ? 'Change Photo' : 'Upload Photo'}</Text>}
              </TouchableOpacity>
            </View>

            {!!profileError && (
              <View style={{ marginBottom: 10, paddingHorizontal: 14, paddingVertical: 9, borderRadius: 10, borderWidth: 1, borderColor: 'rgba(239,68,68,0.35)', backgroundColor: 'rgba(239,68,68,0.08)' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                  <Feather name="alert-triangle" size={11} color="#F87171" />
                  <Text style={{ fontSize: 11, color: '#F87171', fontWeight: '700' }}>{profileError}</Text>
                </View>
              </View>
            )}

            <View style={styles.formCard}>
              <Field label="Full Name" value={name} onChange={setName} required error={profileFieldErrors.name} />
              <Field label="Qualifications" value={qualifications} onChange={setQualifications} required error={profileFieldErrors.qualifications} />
              <SpecPicker value={specialisation} onChange={setSpecialisation} error={profileFieldErrors.specialisation} />
              <Field label="Years of Experience" value={experience} onChange={setExperience} keyboardType="numeric" required error={profileFieldErrors.experience} />
              <Field label="Total Patients Consulted" value={patientsTotal} onChange={setPatientsTotal} keyboardType="numeric" required error={profileFieldErrors.patientsTotal} />
              <View style={styles.field}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3, marginBottom: 5 }}>
                  <Text style={styles.fieldLabel}>REGISTERED MOBILE</Text>
                  <Text style={{ fontSize: 9, color: '#F87171', fontWeight: '900' }}>*</Text>
                </View>
                <View style={styles.phoneRow}>
                  <View style={styles.phonePrefix}><Text style={styles.phonePrefixText}>+91</Text></View>
                  <TextInput
                    style={[styles.fieldInput, { flex: 1 }]}
                    value={mobile}
                    onChangeText={v => setMobile(v.replace(/\D/g, '').slice(0, 10))}
                    keyboardType="phone-pad"
                    maxLength={10}
                    placeholderTextColor="rgba(255,255,255,0.2)"
                    placeholder="98765 00001"
                  />
                </View>
                {profileFieldErrors.mobile && <Text style={{ fontSize: 9, color: '#F87171', fontWeight: '700', marginTop: 3 }}>Required</Text>}
              </View>
              <Field label="About / Bio" value={bio} onChange={setBio} multiline required error={profileFieldErrors.bio} />
            </View>

            <View style={{ paddingHorizontal: 6, marginBottom: 8 }}>
              <Text style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', fontWeight: '600' }}>* All fields are mandatory and will be visible to patients in the app.</Text>
            </View>

            <TouchableOpacity
              style={[styles.saveBtn, profileSaving && !profileError && { opacity: 0.7 }]}
              disabled={profileSaving && !profileError}
              onPress={saveProfile}
            >
              {profileSaving && !profileError
                ? <ActivityIndicator color="#FFF" size="small" />
                : <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                    <Feather name={profileSaved ? 'check' : 'save'} size={13} color="#FFF" />
                    <Text style={styles.saveBtnText}>{profileSaved ? 'Saved' : 'Save Profile'}</Text>
                  </View>}
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
                  onPress={() => { setActiveClinic(i); setClinicFieldErrors({}); }}
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
              <Field label="Clinic Name" value={clinic.name} onChange={v => { updateClinic(activeClinic, { name: v }); setClinicFieldErrors(e => ({ ...e, name: false })); }} required error={clinicFieldErrors.name} />
              <Field label="Address" value={clinic.address} onChange={v => { updateClinic(activeClinic, { address: v }); setClinicFieldErrors(e => ({ ...e, address: false })); }} required error={clinicFieldErrors.address} />
              <Field label="City" value={clinic.city} onChange={v => { updateClinic(activeClinic, { city: v }); setClinicFieldErrors(e => ({ ...e, city: false })); }} required error={clinicFieldErrors.city} />
              <View style={styles.field}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3, marginBottom: 5 }}>
                  <Text style={styles.fieldLabel}>CLINIC PHONE</Text>
                  <Text style={{ fontSize: 9, color: '#F87171', fontWeight: '900' }}>*</Text>
                </View>
                <View style={styles.phoneRow}>
                  <View style={styles.phonePrefix}><Text style={styles.phonePrefixText}>+91</Text></View>
                  <TextInput
                    style={[styles.fieldInput, { flex: 1 }, clinicFieldErrors.phone && { borderColor: 'rgba(239,68,68,0.6)' }]}
                    value={(clinic.phone ?? '').replace(/\D/g, '').slice(0, 10)}
                    onChangeText={v => { updateClinic(activeClinic, { phone: v.replace(/\D/g, '').slice(0, 10) }); setClinicFieldErrors(e => ({ ...e, phone: false })); }}
                    keyboardType="phone-pad"
                    maxLength={10}
                    placeholderTextColor="rgba(255,255,255,0.2)"
                    placeholder="98765 00001"
                  />
                </View>
                {clinicFieldErrors.phone && <Text style={{ fontSize: 9, color: '#F87171', fontWeight: '700', marginTop: 3 }}>Required</Text>}
              </View>
              <Field label="Google Maps Link" value={clinic.maps} onChange={v => { updateClinic(activeClinic, { maps: v }); setClinicFieldErrors(e => ({ ...e, maps: false })); }} keyboardType="url" required error={clinicFieldErrors.maps} />
            </View>
            <TouchableOpacity
              style={[styles.saveBtn, clinicSaving && { opacity: 0.7 }]}
              disabled={clinicSaving}
              onPress={async () => {
                const phone = (clinic.phone ?? '').replace(/\D/g, '');
                const errors = {
                  name: !clinic.name?.trim(),
                  address: !clinic.address?.trim(),
                  city: !clinic.city?.trim(),
                  phone: phone.length < 10,
                  maps: !clinic.maps?.trim(),
                };
                if (Object.values(errors).some(Boolean)) {
                  setClinicFieldErrors(errors);
                  return;
                }
                setClinicFieldErrors({});
                setClinicSaving(true); setClinicSaved(false);
                try {
                  await updateDoctor({ clinics: clinics as any });
                  setClinicSaved(true);
                  setTimeout(() => {
                    setClinicSaved(false);
                    setSection('main');
                  }, 1200);
                } catch {}
                setClinicSaving(false);
              }}
            >
              {clinicSaving
                ? <ActivityIndicator color="#FFF" size="small" />
                : <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                    <Feather name={clinicSaved ? 'check' : 'save'} size={13} color="#FFF" />
                    <Text style={styles.saveBtnText}>{clinicSaved ? 'Saved' : 'Save Clinics'}</Text>
                  </View>}
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
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7 }}>
                    <Feather name="calendar" size={13} color="rgba(255,255,255,0.5)" />
                    <Text style={styles.calTitle}>30-DAY SCHEDULE  ·  Tap date to configure</Text>
                  </View>

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
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                          <Feather name="edit-2" size={12} color="rgba(255,255,255,0.6)" />
                          <Text style={styles.dayEditorDate}>{friendlyDate(selectedCalDate)}</Text>
                        </View>
                        <TouchableOpacity onPress={() => setSelectedCalDate(null)} style={styles.dayEditorClose}>
                          <Feather name="x" size={14} color="rgba(255,255,255,0.4)" />
                        </TouchableOpacity>
                      </View>

                      {/* ── 4 SHIFT BUTTONS ── */}
                      <View style={styles.shiftBtnRow}>
                        {([
                          { id: 'morning',  iconName: 'sun'   as const, label: 'Morning',  bg: 'rgba(245,158,11,0.25)', border: '#F59E0B', txt: '#FCD34D' },
                          { id: 'evening',  iconName: 'moon'  as const, label: 'Evening',  bg: 'rgba(139,92,246,0.25)', border: '#7C3AED', txt: '#A5B4FC' },
                          { id: 'both',     iconName: 'check' as const, label: 'Both',     bg: 'rgba(13,148,136,0.25)', border: '#0D9488', txt: '#2DD4BF' },
                          { id: 'holiday',  iconName: 'x'     as const, label: 'Holiday',  bg: 'rgba(239,68,68,0.22)',  border: '#DC2626', txt: '#F87171' },
                        ] as { id: DayMode; iconName: React.ComponentProps<typeof Feather>['name']; label: string; bg: string; border: string; txt: string }[]).map(btn => {
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
                              <Feather name={btn.iconName} size={14} color={active ? btn.txt : 'rgba(255,255,255,0.4)'} />
                              <Text style={[styles.shiftModeBtnTxt, active && { color: btn.txt }]}>{btn.label}</Text>
                            </TouchableOpacity>
                          );
                        })}
                      </View>

                      {/* Holiday: no further config needed */}
                      {dayMode === 'holiday' && (
                        <View style={{ alignItems: 'center', paddingVertical: 16 }}>
                          <Feather name="slash" size={26} color="#F87171" style={{ marginBottom: 6 }} />
                          <Text style={{ color: '#F87171', fontWeight: '700', fontSize: 13 }}>No appointments on this day</Text>
                        </View>
                      )}

                      {/* ── SHIFT FORMS ──────────────────────────────── */}
                      {(['morning', 'both'].includes(dayMode)) && (
                        <ShiftForm
                          shift="morning"
                          accentColor="#FCD34D"
                          iconName="sun"
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
                          iconName="moon"
                          label="Evening Shift"
                          data={dayForm.evening}
                          clinics={clinics}
                          onChange={p => patchShift('evening', p)}
                        />
                      )}

                      {/* Apply Day button */}
                      {(() => {
                        const needsMorning = ['morning', 'both'].includes(dayMode);
                        const needsEvening = ['evening', 'both'].includes(dayMode);
                        const morningOk = !needsMorning || dayForm.morning.clinicName.trim() !== '';
                        const eveningOk = !needsEvening || dayForm.evening.clinicName.trim() !== '';
                        const canApply   = dayMode === 'holiday' || (morningOk && eveningOk);
                        return (
                          <TouchableOpacity
                            style={[styles.applyDayBtn, !canApply && { opacity: 0.38, borderColor: 'rgba(45,212,191,0.3)' }]}
                            activeOpacity={canApply ? 0.75 : 1}
                            onPress={() => {
                              if (!canApply) {
                                Alert.alert(
                                  'Select a Clinic',
                                  `Please select a clinic for the ${!morningOk && !eveningOk ? 'morning and evening shifts' : !morningOk ? 'morning shift' : 'evening shift'} before applying.`,
                                  [{ text: 'OK' }]
                                );
                                return;
                              }
                              setCalendarOverrides(prev => ({ ...prev, [selectedCalDate]: dayForm }));
                              setSelectedCalDate(null);
                            }}
                          >
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                              <Feather name="check" size={13} color={canApply ? TEAL_LT : 'rgba(45,212,191,0.5)'} />
                              <Text style={[styles.applyDayBtnTxt, !canApply && { color: 'rgba(45,212,191,0.5)' }]}>Apply to {friendlyDate(selectedCalDate)}</Text>
                            </View>
                          </TouchableOpacity>
                        );
                      })()}
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
                        setTimeout(() => {
                          setCalSaved(false);
                          setSection('main');
                        }, 1200);
                      } catch {}
                      setCalSaving(false);
                    }}
                  >
                    {calSaving
                      ? <ActivityIndicator color="#FFF" size="small" />
                      : <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                          <Feather name={calSaved ? 'check' : 'save'} size={13} color="#FFF" />
                          <Text style={styles.saveBtnText}>{calSaved ? 'Saved' : 'Save 30-Day Schedule'}</Text>
                        </View>}
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
              <Text style={styles.formCardTitle}>FEE STRUCTURE</Text>
              <View style={styles.feeNote}>
                <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 7 }}>
                  <Feather name="info" size={12} color="rgba(255,255,255,0.35)" style={{ marginTop: 2 }} />
                  <Text style={[styles.feeNoteText, { flex: 1 }]}>
                    Set your consultation rates. These drive your earnings rate card. Online payments use your E-Token rate + ₹10 platform fee. Walk-in and in-clinic payments are collected directly — no app payment is processed.
                  </Text>
                </View>
              </View>
              <View style={styles.field}>
                <Text style={styles.fieldLabel}>normal E-TOKEN FEE</Text>
                <TextInput
                  style={styles.fieldInput}
                  value={consultFee}
                  onChangeText={v => {
                    const n = parseInt(v.replace(/[^0-9]/g, '')) || 0;
                    setConsultFee(String(Math.min(2000, n)));
                  }}
                  keyboardType="numeric"
                  placeholderTextColor="rgba(255,255,255,0.2)"
                  placeholder="10"
                />
              </View>
              <View style={styles.field}>
                <Text style={styles.fieldLabel}>EMERGENCY E-TOKEN FEE</Text>
                <TextInput
                  style={styles.fieldInput}
                  value={emergencyFee}
                  onChangeText={v => {
                    const n = parseInt(v.replace(/[^0-9]/g, '')) || 0;
                    setEmergencyFee(String(Math.min(1000, n)));
                  }}
                  keyboardType="numeric"
                  placeholderTextColor="rgba(255,255,255,0.2)"
                  placeholder="20"
                />
              </View>
              <View style={styles.field}>
                <Text style={styles.fieldLabel}>WALK-IN FEE</Text>
                <TextInput
                  style={styles.fieldInput}
                  value={walkinFee}
                  onChangeText={v => {
                    const n = parseInt(v.replace(/[^0-9]/g, '')) || 0;
                    setWalkinFee(String(Math.min(1000, n)));
                  }}
                  keyboardType="numeric"
                  placeholderTextColor="rgba(255,255,255,0.2)"
                  placeholder="200"
                />
              </View>
              <View style={styles.field}>
                <Text style={styles.fieldLabel}>CONSULTATION AT CLINIC</Text>
                <TextInput
                  style={styles.fieldInput}
                  value={clinicConsultFee}
                  onChangeText={v => {
                    const n = parseInt(v.replace(/[^0-9]/g, '')) || 0;
                    setClinicConsultFee(String(n));
                  }}
                  keyboardType="numeric"
                  placeholderTextColor="rgba(255,255,255,0.2)"
                  placeholder="300"
                />
              </View>
              <View style={styles.field}>
                <Text style={styles.fieldLabel}>EMERGENCY CONSULTATION AT CLINIC</Text>
                <TextInput
                  style={styles.fieldInput}
                  value={clinicEmergencyFee}
                  onChangeText={v => {
                    const n = parseInt(v.replace(/[^0-9]/g, '')) || 0;
                    setClinicEmergencyFee(String(n));
                  }}
                  keyboardType="numeric"
                  placeholderTextColor="rgba(255,255,255,0.2)"
                  placeholder="500"
                />
              </View>
              <View style={[styles.feeNote, { backgroundColor: 'rgba(45,212,191,0.08)', borderColor: 'rgba(45,212,191,0.2)' }]}>
                <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 7 }}>
                  <Feather name="check-circle" size={12} color="rgba(45,212,191,0.8)" style={{ marginTop: 2 }} />
                  <Text style={[styles.feeNoteText, { color: 'rgba(45,212,191,0.8)', flex: 1 }]}>
                    Fees saved. Online tokens charge patients your E-Token rate + ₹10 platform fee. Walk-in and in-clinic payments are collected directly — no app payment required.
                  </Text>
                </View>
              </View>
            </View>
            <TouchableOpacity
              style={[styles.saveBtn, feeSaving && { opacity: 0.7 }]}
              disabled={feeSaving}
              onPress={async () => {
                setFeeSaving(true); setFeeSaved(false);
                try {
                  await updateDoctor({ consultFee: Number(consultFee) || 0, emergencyFee: Number(emergencyFee) || 0, walkinFee: Number(walkinFee) || 0, clinicConsultFee: Number(clinicConsultFee) || 0, clinicEmergencyFee: Number(clinicEmergencyFee) || 0 } as any);
                  setFeeSaved(true);
                  setTimeout(() => {
                    setFeeSaved(false);
                    setSection('main');
                  }, 1200);
                } catch {}
                setFeeSaving(false);
              }}
            >
              {feeSaving
                ? <ActivityIndicator color="#FFF" size="small" />
                : <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                    <Feather name={feeSaved ? 'check' : 'save'} size={13} color="#FFF" />
                    <Text style={styles.saveBtnText}>{feeSaved ? 'Saved' : 'Save Fee Structure'}</Text>
                  </View>}
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
            <TouchableOpacity
              style={[styles.saveBtn, patientAppSaving && { opacity: 0.7 }]}
              disabled={patientAppSaving}
              onPress={async () => {
                setPatientAppSaving(true); setPatientAppSaved(false);
                try {
                  await updateDoctor({ onlineBooking, emergencyTokens, showWaitTime, showPosition, showFee, alertMessage } as any);
                  setPatientAppSaved(true);
                  setTimeout(() => { setPatientAppSaved(false); setSection('main'); }, 1200);
                } catch {}
                setPatientAppSaving(false);
              }}
            >
              {patientAppSaving
                ? <ActivityIndicator color="#FFF" size="small" />
                : <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                    <Feather name={patientAppSaved ? 'check' : 'save'} size={13} color="#FFF" />
                    <Text style={styles.saveBtnText}>{patientAppSaved ? 'Settings Saved!' : 'Save Patient App Settings'}</Text>
                  </View>}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </SafeAreaView>
    );
  }

  if (section === 'bank') {
    const bankValid = payoutType === 'bank'
      ? accountHolderName.trim() && bankName.trim() && accountNumber.trim() && ifscCode.trim() && branch.trim()
      : upiId.trim() && payoutDisplayName.trim();

    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.container}>
          <BackHeader title="Bank Account" onBack={() => { setBankAttempted(false); setSection('main'); }} />
          <ScrollView contentContainerStyle={styles.formScroll} showsVerticalScrollIndicator={false}>
            <View style={styles.formCard}>
              <Text style={styles.formCardTitle}>PAYMENT METHOD</Text>
              <View style={styles.clinicTabs}>
                <TouchableOpacity style={[styles.clinicTab, payoutType === 'bank' && styles.clinicTabActive]} onPress={() => { setPayoutType('bank'); setBankAttempted(false); }}>
                  <Text style={[styles.clinicTabText, payoutType === 'bank' && styles.clinicTabTextActive]}>Bank Transfer</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.clinicTab, payoutType === 'upi' && styles.clinicTabActive]} onPress={() => { setPayoutType('upi'); setBankAttempted(false); }}>
                  <Text style={[styles.clinicTabText, payoutType === 'upi' && styles.clinicTabTextActive]}>UPI</Text>
                </TouchableOpacity>
              </View>
              {payoutType === 'bank' ? (
                <>
                  <Field label="Account Holder Name" value={accountHolderName} onChange={setAccountHolderName} required error={bankAttempted && !accountHolderName.trim()} />
                  <Field label="Bank Name" value={bankName} onChange={setBankName} required error={bankAttempted && !bankName.trim()} />
                  <Field label="Account Number" value={accountNumber} onChange={setAccountNumber} keyboardType="numeric" required error={bankAttempted && !accountNumber.trim()} />
                  <Field label="IFSC Code" value={ifscCode} onChange={setIfscCode} required error={bankAttempted && !ifscCode.trim()} />
                  <Field label="Branch" value={branch} onChange={setBranch} required error={bankAttempted && !branch.trim()} />
                </>
              ) : (
                <>
                  <Field label="UPI ID" value={upiId} onChange={setUpiId} required error={bankAttempted && !upiId.trim()} />
                  <Field label="Receiver Name" value={payoutDisplayName} onChange={setPayoutDisplayName} required error={bankAttempted && !payoutDisplayName.trim()} />
                </>
              )}
              {bankAttempted && !bankValid && (
                <View style={{ marginTop: 6, padding: 10, borderRadius: 10, backgroundColor: 'rgba(239,68,68,0.08)', borderWidth: 1, borderColor: 'rgba(239,68,68,0.25)' }}>
                  <Text style={{ fontSize: 11, color: '#F87171', fontWeight: '600' }}>Please fill in all required fields before saving.</Text>
                </View>
              )}
            </View>
            <TouchableOpacity
              style={[styles.saveBtn, bankSaving && { opacity: 0.7 }]}
              disabled={bankSaving}
              onPress={async () => {
                setBankAttempted(true);
                if (!bankValid) return;
                setBankSaving(true); setBankSaved(false);
                try {
                  await updateDoctor({
                    bankAccount: {
                      accountType: payoutType,
                      accountHolderName,
                      bankName,
                      accountNumber,
                      ifscCode,
                      branch,
                      upiId,
                      payoutName: payoutDisplayName,
                      payoutCycle,
                      payoutEnabled,
                    },
                  } as any);
                  setBankSaved(true);
                  setBankAttempted(false);
                  setTimeout(() => { setBankSaved(false); setSection('main'); }, 1200);
                } finally {
                  setBankSaving(false);
                }
              }}
            >
              {bankSaving
                ? <ActivityIndicator color="#FFF" size="small" />
                : <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                    <Feather name={bankSaved ? 'check' : 'save'} size={13} color="#FFF" />
                    <Text style={styles.saveBtnText}>{bankSaved ? 'Saved' : 'Save Bank Details'}</Text>
                  </View>}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </SafeAreaView>
    );
  }

  if (section === 'payout') {
    const cycles = ['Daily', 'Weekly', 'Bi-weekly', 'Monthly', 'Manual'];
    const linkedAccount = accountNumber
      ? `${bankName || 'Bank'} ••${accountNumber.slice(-4)}`
      : upiId
        ? `UPI · ${upiId}`
        : null;
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.container}>
          <BackHeader title="Payout Settings" onBack={() => { setPayoutAttempted(false); setSection('main'); }} />
          <ScrollView contentContainerStyle={styles.formScroll} showsVerticalScrollIndicator={false}>

            {/* Linked account summary */}
            {linkedAccount ? (
              <View style={[styles.formCard, { flexDirection: 'row', alignItems: 'center', gap: 12 }]}>
                <View style={{ width: 36, height: 36, borderRadius: 12, backgroundColor: 'rgba(45,212,191,0.15)', alignItems: 'center', justifyContent: 'center' }}>
                  <Feather name={accountNumber ? 'database' : 'credit-card'} size={18} color={TEAL_LT} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 13, fontWeight: '700', color: '#FFF' }}>{linkedAccount}</Text>
                  <Text style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', fontWeight: '500', marginTop: 1 }}>Linked payout account</Text>
                </View>
                <TouchableOpacity onPress={() => setSection('bank')} style={{ paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, borderWidth: 1, borderColor: 'rgba(45,212,191,0.3)', backgroundColor: 'rgba(45,212,191,0.08)' }}>
                  <Text style={{ fontSize: 11, color: TEAL_LT, fontWeight: '700' }}>Change</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity style={[styles.formCard, { flexDirection: 'row', alignItems: 'center', gap: 12, borderColor: 'rgba(251,191,36,0.25)', backgroundColor: 'rgba(251,191,36,0.05)' }]} onPress={() => setSection('bank')}>
                <Feather name="alert-triangle" size={20} color="#FCD34D" />
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 13, fontWeight: '700', color: '#FCD34D' }}>No account linked</Text>
                  <Text style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', fontWeight: '500', marginTop: 1 }}>Tap to add bank account or UPI</Text>
                </View>
                <Text style={{ color: 'rgba(255,255,255,0.3)', fontSize: 18 }}>›</Text>
              </TouchableOpacity>
            )}

            <View style={styles.formCard}>
              <Text style={styles.formCardTitle}>SETTLEMENT</Text>
              <View style={[styles.toggleRow, { borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)', paddingBottom: 12, marginBottom: 12 }]}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.toggleRowLabel}>Enable Payouts</Text>
                  <Text style={styles.toggleRowSub}>Allow settlement transfers to your account</Text>
                </View>
                <Toggle on={payoutEnabled} onChange={() => setPayoutEnabled(p => !p)} />
              </View>

              <Text style={styles.fieldLabel}>PAYOUT CYCLE</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginBottom: 14 }}>
                {cycles.map(cycle => (
                  <TouchableOpacity
                    key={cycle}
                    onPress={() => setPayoutCycle(cycle)}
                    style={{
                      paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1.5,
                      borderColor: payoutCycle === cycle ? TEAL : 'rgba(255,255,255,0.12)',
                      backgroundColor: payoutCycle === cycle ? 'rgba(45,212,191,0.18)' : 'rgba(255,255,255,0.04)',
                    }}
                  >
                    <Text style={{ fontSize: 12, fontWeight: '700', color: payoutCycle === cycle ? TEAL_LT : 'rgba(255,255,255,0.5)' }}>{cycle}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Field
                label="Payout Display Name"
                value={payoutDisplayName}
                onChange={setPayoutDisplayName}
                required
                error={payoutAttempted && !payoutDisplayName.trim()}
              />
              <View style={styles.feeNote}>
                <Text style={styles.feeNoteText}>Payout display name appears on your settlement receipts and payout notifications.</Text>
              </View>
              {payoutAttempted && !payoutDisplayName.trim() && (
                <View style={{ marginTop: 6, padding: 10, borderRadius: 10, backgroundColor: 'rgba(239,68,68,0.08)', borderWidth: 1, borderColor: 'rgba(239,68,68,0.25)' }}>
                  <Text style={{ fontSize: 11, color: '#F87171', fontWeight: '600' }}>Please fill in all required fields before saving.</Text>
                </View>
              )}
            </View>

            <TouchableOpacity
              style={[styles.saveBtn, bankSaving && { opacity: 0.7 }]}
              disabled={bankSaving}
              onPress={async () => {
                setPayoutAttempted(true);
                if (!payoutDisplayName.trim()) return;
                setBankSaving(true); setBankSaved(false);
                try {
                  const bank = (doctor as any)?.bankAccount ?? {};
                  await updateDoctor({
                    bankAccount: {
                      ...bank,
                      accountType: payoutType,
                      payoutName: payoutDisplayName,
                      payoutCycle,
                      payoutEnabled,
                    },
                  } as any);
                  setBankSaved(true);
                  setPayoutAttempted(false);
                  setTimeout(() => { setBankSaved(false); setSection('main'); }, 1200);
                } finally {
                  setBankSaving(false);
                }
              }}
            >
              {bankSaving ? <ActivityIndicator color="#FFF" size="small" /> : <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                  <Feather name={bankSaved ? 'check' : 'save'} size={13} color="#FFF" />
                  <Text style={styles.saveBtnText}>{bankSaved ? 'Saved' : 'Save Payout Settings'}</Text>
                </View>}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </SafeAreaView>
    );
  }

  // ── Help & Support ──────────────────────────────────────────────────────
  if (section === 'help') {
    const faqs = [
      { q: 'How do I add or edit a clinic?', a: 'Go to Settings → Manage Clinics. You can add up to 3 clinics, set their address, phone, and Google Maps link, and toggle each one active or inactive.' },
      { q: 'How do online tokens work?', a: 'Patients book via the LINESETU Patient App. They pay your configured E-Token fee plus a ₹10 platform fee. A sequential token number is assigned automatically and they can track their position in the queue in real time.' },
      { q: 'When do I receive my payouts?', a: 'Based on your Payout Cycle setting under Bank & Payout. Funds are settled to your linked bank account or UPI. You can view payout history in the Earnings tab.' },
      { q: 'How do I mark myself unavailable for a day?', a: 'Go to Settings → Schedule & Shifts. Tap the date on the 30-day calendar and select "Mark as Off / Holiday". Patients will be unable to book tokens for that day.' },
      { q: 'Can I set different shifts for different dates?', a: 'Yes. In Schedule & Shifts, tap any date to configure morning/evening slots, start/end times, and max tokens specifically for that day, overriding your default shift settings.' },
      { q: 'How do emergency tokens work?', a: 'Emergency tokens skip the regular queue and are assigned a priority number. They are controlled by the Emergency Tokens toggle in Patient App Settings. You can also set a separate fee for them in Fee Structure.' },
      { q: 'Why are patients not seeing my profile?', a: 'Ensure your profile is complete (name, qualifications, bio, specialization) and that you are set as Available on the Home screen. Incomplete profiles may not appear in patient searches.' },
    ];
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.container}>
          <BackHeader title="Help & Support" onBack={() => setSection('main')} />
          <ScrollView contentContainerStyle={styles.formScroll} showsVerticalScrollIndicator={false}>

            {/* Contact options */}
            <Text style={styles.sectionLabel}>CONTACT US</Text>
            <View style={styles.formCard}>
              <TouchableOpacity
                onPress={() => Linking.openURL('https://wa.me/919876000000?text=Hi%20LINESETU%2C%20I%20need%20support').catch(() => {})}
                style={[styles.helpContactRow, { borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)' }]}
              >
                <View style={[styles.helpContactIcon, { backgroundColor: 'rgba(74,222,128,0.12)' }]}>
                  <Feather name="message-circle" size={18} color="#4ADE80" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.helpContactLabel}>WhatsApp Support</Text>
                  <Text style={styles.helpContactSub}>+91 98760 00000 · Fastest response</Text>
                </View>
                <Text style={styles.chevron}>›</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => Linking.openURL('mailto:support@linesetu.com?subject=Doctor%20App%20Support%20Request').catch(() => {})}
                style={[styles.helpContactRow, { borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)' }]}
              >
                <View style={[styles.helpContactIcon, { backgroundColor: 'rgba(103,232,249,0.12)' }]}>
                  <Feather name="mail" size={18} color="#67E8F9" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.helpContactLabel}>Email Support</Text>
                  <Text style={styles.helpContactSub}>support@linesetu.com</Text>
                </View>
                <Text style={styles.chevron}>›</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => Linking.openURL('tel:+919876000000').catch(() => {})}
                style={styles.helpContactRow}
              >
                <View style={[styles.helpContactIcon, { backgroundColor: 'rgba(251,191,36,0.12)' }]}>
                  <Feather name="phone" size={18} color="#FBBF24" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.helpContactLabel}>Call Support</Text>
                  <Text style={styles.helpContactSub}>Mon – Sat · 9 AM – 9 PM IST</Text>
                </View>
                <Text style={styles.chevron}>›</Text>
              </TouchableOpacity>
            </View>

            <View style={{ marginBottom: 20, paddingHorizontal: 2, paddingVertical: 10, borderRadius: 10, backgroundColor: 'rgba(45,212,191,0.07)', borderWidth: 1, borderColor: 'rgba(45,212,191,0.15)', paddingLeft: 12 }}>
              <Text style={{ fontSize: 11, color: 'rgba(45,212,191,0.8)', fontWeight: '600', lineHeight: 17 }}>
                ⏱  We typically respond within 2–4 hours during business hours (Mon – Sat, 9 AM – 9 PM IST). Urgent issues via WhatsApp get the fastest response.
              </Text>
            </View>

            {/* FAQs */}
            <Text style={styles.sectionLabel}>FREQUENTLY ASKED QUESTIONS</Text>
            {faqs.map((faq, i) => (
              <View key={i} style={[styles.formCard, { marginBottom: 8 }]}>
                <Text style={{ fontSize: 13, fontWeight: '800', color: '#FFF', marginBottom: 6, lineHeight: 18 }}>Q. {faq.q}</Text>
                <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', lineHeight: 18, fontWeight: '500' }}>{faq.a}</Text>
              </View>
            ))}

            <View style={{ height: 20 }} />
          </ScrollView>
        </View>
      </SafeAreaView>
    );
  }

  // ── Send Feedback ────────────────────────────────────────────────────────
  if (section === 'feedback') {
    const categories = [
      { label: 'Bug Report', value: 'Bug Report' },
      { label: 'Feature Request', value: 'Feature Request' },
      { label: 'General', value: 'General' },
      { label: 'Compliment', value: 'Compliment' },
    ];
    const submitFeedback = async () => {
      if (!feedbackText.trim()) return;
      setFeedbackSubmitting(true);
      try {
        await fetch(`${BASE()}/api/feedback`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            doctorId: doctor?.id ?? null,
            category: feedbackCategory,
            message: feedbackText.trim(),
          }),
        });
        setFeedbackSubmitted(true);
        setTimeout(() => setSection('main'), 2200);
      } catch {}
      setFeedbackSubmitting(false);
    };
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.container}>
          <BackHeader title="Send Feedback" onBack={() => setSection('main')} />
          <ScrollView contentContainerStyle={styles.formScroll} showsVerticalScrollIndicator={false}>

            {feedbackSubmitted ? (
              <View style={{ alignItems: 'center', paddingTop: 60, paddingHorizontal: 24 }}>
                <Feather name="check-circle" size={48} color={TEAL_LT} style={{ marginBottom: 16 }} />
                <Text style={{ fontSize: 20, fontWeight: '900', color: TEAL_LT, marginBottom: 10 }}>Thank you!</Text>
                <Text style={{ fontSize: 14, color: 'rgba(255,255,255,0.55)', textAlign: 'center', lineHeight: 22 }}>
                  Your feedback has been received. We read every submission and use them to make LINESETU better for doctors and patients.
                </Text>
              </View>
            ) : (
              <>
                <Text style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', marginBottom: 16, lineHeight: 20, fontWeight: '500' }}>
                  Help us improve LINESETU. Whether it's a bug, a feature idea, or a general observation — we want to hear from you.
                </Text>

                {/* Category */}
                <Text style={styles.sectionLabel}>CATEGORY</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
                  {categories.map(cat => (
                    <TouchableOpacity
                      key={cat.value}
                      onPress={() => setFeedbackCategory(cat.value)}
                      style={{
                        paddingHorizontal: 14, paddingVertical: 9, borderRadius: 20,
                        borderWidth: 1.5,
                        borderColor: feedbackCategory === cat.value ? TEAL : 'rgba(255,255,255,0.12)',
                        backgroundColor: feedbackCategory === cat.value ? 'rgba(45,212,191,0.14)' : 'rgba(255,255,255,0.04)',
                      }}
                    >
                      <Text style={{ fontSize: 13, fontWeight: '700', color: feedbackCategory === cat.value ? TEAL_LT : 'rgba(255,255,255,0.5)' }}>
                        {cat.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Message */}
                <Text style={styles.sectionLabel}>YOUR MESSAGE</Text>
                <TextInput
                  style={[styles.fieldInput, {
                    height: 140, textAlignVertical: 'top', paddingTop: 12,
                    marginBottom: 6,
                    borderColor: feedbackText.trim() ? 'rgba(45,212,191,0.4)' : 'rgba(255,255,255,0.12)',
                  }]}
                  value={feedbackText}
                  onChangeText={setFeedbackText}
                  multiline
                  placeholder={`Describe your ${feedbackCategory.toLowerCase()}...`}
                  placeholderTextColor="rgba(255,255,255,0.2)"
                />
                {!feedbackText.trim() && (
                  <Text style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', marginBottom: 16, fontWeight: '600' }}>
                    Please describe your feedback in a few words.
                  </Text>
                )}

                <TouchableOpacity
                  style={[styles.saveBtn, { opacity: feedbackText.trim() ? 1 : 0.4 }]}
                  disabled={!feedbackText.trim() || feedbackSubmitting}
                  onPress={submitFeedback}
                >
                  {feedbackSubmitting
                    ? <ActivityIndicator color="#FFF" size="small" />
                    : <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Feather name="send" size={13} color="#FFF" />
                        <Text style={styles.saveBtnText}>Submit Feedback</Text>
                      </View>}
                </TouchableOpacity>

                <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', textAlign: 'center', marginTop: 12, fontWeight: '500', lineHeight: 17 }}>
                  By submitting, you agree that your feedback may be used to improve LINESETU products and services. We do not share your personal details with third parties.
                </Text>
              </>
            )}
            <View style={{ height: 20 }} />
          </ScrollView>
        </View>
      </SafeAreaView>
    );
  }

  // ── Terms & Privacy Policy ───────────────────────────────────────────────
  if (section === 'terms') {
    const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
      <View style={{ marginBottom: 20 }}>
        <Text style={{ fontSize: 12, fontWeight: '900', color: TEAL_LT, letterSpacing: 1, marginBottom: 8, textTransform: 'uppercase' }}>{title}</Text>
        {children}
      </View>
    );
    const Para = ({ text }: { text: string }) => (
      <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', lineHeight: 20, fontWeight: '500', marginBottom: 8 }}>{text}</Text>
    );
    const Bullet = ({ text }: { text: string }) => (
      <View style={{ flexDirection: 'row', marginBottom: 5 }}>
        <Text style={{ color: TEAL, fontWeight: '900', marginRight: 8, fontSize: 12 }}>·</Text>
        <Text style={{ flex: 1, fontSize: 12, color: 'rgba(255,255,255,0.55)', lineHeight: 20, fontWeight: '500' }}>{text}</Text>
      </View>
    );
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.container}>
          <BackHeader title="Terms & Privacy Policy" onBack={() => setSection('main')} />
          <ScrollView contentContainerStyle={styles.formScroll} showsVerticalScrollIndicator={false}>

            <View style={{ marginBottom: 16, paddingVertical: 10, paddingHorizontal: 12, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' }}>
              <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', fontWeight: '600' }}>LINESETU Doctor App  ·  v2.1.0</Text>
              <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', fontWeight: '500', marginTop: 2 }}>Last updated: January 2026  ·  Effective: January 1, 2026</Text>
            </View>

            <Section title="1. Terms of Service">
              <Para text="By accessing or using the LINESETU Doctor App, you agree to be bound by these Terms. If you disagree with any part, you may not use the App." />
              <Para text="LINESETU provides a smart queue and token management platform for registered medical practitioners in India. The platform facilitates real-time token booking and queue management between doctors and patients." />
              <Bullet text="You must be a licensed medical practitioner in India to register as a doctor on LINESETU." />
              <Bullet text="You are responsible for the accuracy of your profile information including qualifications, specialization, and clinic details." />
              <Bullet text="LINESETU reserves the right to suspend accounts found providing false credentials or violating patient trust." />
              <Bullet text="Fees and payout structures are subject to change with 30 days prior notice." />
            </Section>

            <Section title="2. Doctor Obligations">
              <Para text="As a registered doctor on LINESETU, you agree to:" />
              <Bullet text="Maintain accurate schedule, availability, and fee information visible to patients." />
              <Bullet text="Honor token bookings made by patients unless an emergency or system error occurs." />
              <Bullet text="Notify patients promptly via the app if significant delays or closures arise." />
              <Bullet text="Not misuse the platform to collect payments outside of the disclosed fee structure." />
              <Bullet text="Comply with all applicable laws, medical regulations, and the Indian Medical Council Act." />
            </Section>

            <Section title="3. Platform Fee & Payouts">
              <Para text="LINESETU charges a platform fee of ₹10 per online E-Token booking. This is collected from the patient in addition to your configured consultation fee. Your earnings are settled based on your selected payout cycle (Daily, Weekly, Bi-weekly, Monthly, or Manual)." />
              <Para text="Payout disputes must be raised within 7 days of the scheduled settlement date by contacting support@linesetu.com." />
            </Section>

            <Section title="4. Privacy Policy">
              <Para text="LINESETU is committed to protecting the privacy of doctors and patients. This Privacy Policy describes how we collect, use, and protect your information." />
              <Bullet text="Account data: Name, phone, qualifications, clinic details, and bank/UPI information collected at registration." />
              <Bullet text="Usage data: Schedule configurations, token data, queue activity, and session logs are stored for platform functionality." />
              <Bullet text="Patient data: We store only the minimum patient information required for token management. Doctors do not have access to patients' payment details." />
              <Bullet text="Data sharing: We do not sell or share your personal data with third parties for marketing. Payment data is processed securely via Razorpay and governed by Razorpay's own privacy policy." />
              <Bullet text="Data retention: Your account data is retained for 3 years after account closure for legal and financial compliance." />
            </Section>

            <Section title="5. Data Security">
              <Para text="All data is transmitted over HTTPS and stored in Google Firebase with industry-standard encryption. Bank account details and UPI IDs are encrypted at rest. We conduct periodic security reviews to ensure the safety of your information." />
              <Para text="You are responsible for maintaining the confidentiality of your login OTP and account access. Report any suspected unauthorized access immediately to support@linesetu.com." />
            </Section>

            <Section title="6. Intellectual Property">
              <Para text="The LINESETU name, logo, and all associated marks are the property of LINESETU Technologies Pvt. Ltd. The App and its content may not be reproduced, distributed, or used for commercial purposes without written permission." />
            </Section>

            <Section title="7. Limitation of Liability">
              <Para text="LINESETU is a technology platform and is not responsible for the medical services provided by doctors registered on the platform. In no event shall LINESETU be liable for indirect, incidental, or consequential damages arising from the use of the platform." />
              <Para text="Service availability is provided on a best-effort basis. Scheduled maintenance windows will be communicated in advance via in-app notifications." />
            </Section>

            <Section title="8. Governing Law">
              <Para text="These Terms are governed by the laws of India. Any disputes arising under these Terms shall be subject to the exclusive jurisdiction of the courts in Bengaluru, Karnataka, India." />
            </Section>

            <Section title="9. Contact">
              <Para text="For any questions regarding these Terms or our Privacy Policy, contact:" />
              <TouchableOpacity onPress={() => Linking.openURL('mailto:legal@linesetu.com').catch(() => {})}>
                <Text style={{ fontSize: 13, color: TEAL_LT, fontWeight: '700', marginBottom: 4 }}>legal@linesetu.com</Text>
              </TouchableOpacity>
              <Para text="LINESETU Technologies Pvt. Ltd., Bengaluru, Karnataka – 560001, India" />
            </Section>

            <View style={{ height: 20 }} />
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
                {profilePhotoUrl ? (
                  <Image key={profilePhotoUrl} source={{ uri: profilePhotoUrl }} style={styles.avatarPlaceholder} resizeMode="cover" />
                ) : (
                  <View style={styles.avatarPlaceholder}>
                    <Feather name="activity" size={28} color="rgba(255,255,255,0.5)" />
                  </View>
                )}
              </View>
              <View style={{ flex: 1, minWidth: 0 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                  <Text style={styles.profileName}>{name}</Text>
                  <Feather name="check-circle" size={14} color={TEAL_LT} />
                </View>
                <Text style={styles.profileSpec}>{specialisation} · {qualifications}</Text>
                <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap', marginTop: 4 }}>
                  {doctor?.isAvailable !== false ? (
                    <View style={[styles.onlineBadge, { flexDirection: 'row', alignItems: 'center', gap: 4 }]}>
                      <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#22C55E' }} />
                      <Text style={styles.onlineBadgeText}>Available</Text>
                    </View>
                  ) : (
                    <View style={[styles.unavailBadge, { flexDirection: 'row', alignItems: 'center', gap: 4 }]}>
                      <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#EF4444' }} />
                      <Text style={styles.unavailBadgeText}>Unavailable</Text>
                    </View>
                  )}
                  <View style={styles.expBadge}><Text style={styles.expBadgeText}>{experience} yrs exp</Text></View>
                </View>
              </View>
            </View>
            <View style={styles.profileStats}>
              {[
                { label: 'Patients', value: `${parseInt(patientsTotal) || 0}+` },
                { label: 'Clinics',  value: `${clinics.filter(c => c.active && c.name).length} Active` },
              ].map((s, i) => (
                <View key={i} style={[styles.profileStatItem, i < 1 && styles.profileStatBorder]}>
                  <Text style={styles.profileStatValue}>{s.value}</Text>
                  <Text style={styles.profileStatLabel}>{s.label}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* My Results / Photo Gallery */}
          <View style={styles.galleryCard}>
            <View style={styles.galleryHeader}>
              <View>
                <Text style={styles.galleryTitle}>My Results</Text>
                <Text style={styles.gallerySub}>Photos shown in your patient profile</Text>
              </View>
              <TouchableOpacity style={styles.galleryToggleBtn} onPress={toggleShowResults} activeOpacity={0.8}>
                <View style={[styles.galleryToggleTrack, showResults && styles.galleryToggleTrackOn]}>
                  <View style={[styles.galleryToggleThumb, showResults && styles.galleryToggleThumbOn]} />
                </View>
                <Text style={[styles.galleryToggleTxt, showResults && { color: TEAL_LT }]}>
                  {showResults ? 'Visible' : 'Hidden'}
                </Text>
              </TouchableOpacity>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.galleryScroll}>
              {resultPhotos.map((uri, i) => (
                <View key={i} style={styles.galleryThumbWrap}>
                  <Image source={{ uri }} style={styles.galleryThumb} resizeMode="cover" />
                  <TouchableOpacity
                    style={styles.galleryDeleteBtn}
                    onPress={() => deletePhoto(uri)}
                    disabled={deletingPhotoUrl === uri}
                  >
                    {deletingPhotoUrl === uri
                      ? <ActivityIndicator size={10} color="#FFF" />
                      : <Feather name="x" size={12} color="#FFF" />}
                  </TouchableOpacity>
                </View>
              ))}
              <TouchableOpacity style={styles.galleryAddBtn} onPress={pickAndUploadPhoto} disabled={uploadingPhoto}>
                {uploadingPhoto
                  ? <ActivityIndicator color={TEAL_LT} size="small" />
                  : <>
                      <Text style={styles.galleryAddIcon}>＋</Text>
                      <Text style={styles.galleryAddTxt}>Add Photo</Text>
                    </>}
              </TouchableOpacity>
            </ScrollView>
            {uploadingPhoto && (
              <View style={styles.galleryLoadingOverlay}>
                <ActivityIndicator color={TEAL_LT} size="small" />
                <Text style={styles.galleryLoadingText}>Uploading photo…</Text>
              </View>
            )}

            {uploadError && (
              <View style={styles.galleryErrorBanner}>
                <Text style={styles.galleryErrorText}>{uploadError}</Text>
                <TouchableOpacity onPress={() => setUploadError(null)}>
                  <Feather name="x" size={14} color="rgba(255,255,255,0.6)" />
                </TouchableOpacity>
              </View>
            )}

            {resultPhotos.length === 0 && !uploadingPhoto && !uploadError && (
              <Text style={styles.galleryEmpty}>No photos yet — tap Add Photo to upload</Text>
            )}
          </View>

          {/* Doctor Profile */}
          <SectionLabel label="Doctor Profile" />
          <View style={styles.settingsGroup}>
            <SettingRow iconName="user" iconBg="rgba(129,140,248,0.15)" iconColor="#818CF8" label="Manage Profile" sub="Name, qualifications, bio & photo" onPress={() => setSection('profile')} />
          </View>

          {/* Practice */}
          <SectionLabel label="Practice" />
          <View style={styles.settingsGroup}>
            <SettingRow iconName="home" iconBg="rgba(103,232,249,0.12)" iconColor="#67E8F9" label="Manage Clinics" sub={`${clinics.filter(c => c.active && c.name).length} clinics configured`} onPress={() => setSection('clinics')} />
            <SettingRow iconName="calendar" iconBg="rgba(45,212,191,0.12)" iconColor={TEAL_LT} label="Schedule & Shifts" sub="Shift timings, days off & max tokens" onPress={() => setSection('schedule')} />
            <SettingRow iconName="dollar-sign" iconBg="rgba(251,191,36,0.12)" iconColor="#FCD34D" label="Fee Structure" sub={`Consult ₹${consultFee} · Emergency ₹${emergencyFee}`} onPress={() => setSection('fees')} last />
          </View>

          {/* Patient App */}
          <SectionLabel label="Patient App" />
          <View style={styles.settingsGroup}>
            <SettingRow iconName="smartphone" iconBg="rgba(99,102,241,0.12)" iconColor="#818CF8" label="Patient App Settings" sub="Booking, display & notifications" onPress={() => setSection('patientApp')} last />
          </View>

          {/* Bank */}
          <SectionLabel label="Bank & Payments" />
          <View style={styles.settingsGroup}>
            <SettingRow
              iconName="credit-card" iconBg="rgba(45,212,191,0.12)" iconColor={TEAL_LT}
              label="Bank Account"
              sub={
                accountNumber
                  ? `${bankName || 'Bank'} ••${accountNumber.slice(-4)}`
                  : upiId
                    ? `UPI · ${upiId}`
                    : 'Add bank account or UPI'
              }
              onPress={() => setSection('bank')}
            />
            <SettingRow
              iconName="briefcase" iconBg="rgba(129,140,248,0.12)" iconColor="#A5B4FC"
              label="Payout Settings"
              sub={payoutEnabled ? `${payoutCycle} settlement · Active` : 'Payouts paused'}
              onPress={() => setSection('payout')}
              last
            />
          </View>

          {/* Notifications */}
          <SectionLabel label="Notifications" />
          <View style={styles.settingsGroup}>
            <SettingRow iconName="bell" iconBg="rgba(45,212,191,0.12)" iconColor={TEAL_LT} label="New Booking Alerts" sub="Notify when a token is booked"
              right={<Toggle on={notifBooking} onChange={() => {
                const next = !notifBooking;
                setNotifBooking(next);
                updateDoctor({ notifications: { booking: next, emergency: notifEmergency, payout: notifPayout } } as any).catch(() => {});
              }} />} />
            <SettingRow iconName="alert-triangle" iconBg="rgba(239,68,68,0.12)" iconColor="#F87171" label="Emergency Alerts" sub="High-priority push notifications"
              right={<Toggle on={notifEmergency} onChange={() => {
                const next = !notifEmergency;
                setNotifEmergency(next);
                updateDoctor({ notifications: { booking: notifBooking, emergency: next, payout: notifPayout } } as any).catch(() => {});
              }} />} />
            <SettingRow iconName="dollar-sign" iconBg="rgba(251,191,36,0.12)" iconColor="#FCD34D" label="Payout Notifications" sub="Settlement & transfer updates"
              right={<Toggle on={notifPayout} onChange={() => {
                const next = !notifPayout;
                setNotifPayout(next);
                updateDoctor({ notifications: { booking: notifBooking, emergency: notifEmergency, payout: next } } as any).catch(() => {});
              }} />} last />
          </View>

          {/* Support */}
          <SectionLabel label="Support & Legal" />
          <View style={styles.settingsGroup}>
            <SettingRow iconName="help-circle" iconBg="rgba(103,232,249,0.12)" iconColor="#67E8F9" label="Help & Support" sub="Chat, call or raise a ticket" onPress={() => setSection('help')} />
            <SettingRow iconName="message-square" iconBg="rgba(129,140,248,0.12)" iconColor="#818CF8" label="Send Feedback" sub="Help us improve LINESETU" onPress={() => { setFeedbackText(''); setFeedbackCategory('Feature Request'); setFeedbackSubmitted(false); setSection('feedback'); }} />
            <SettingRow iconName="star" iconBg="rgba(251,191,36,0.12)" iconColor="#FCD34D" label="Rate the App" sub="Love the app? Leave a review" onPress={() => Linking.openURL('https://play.google.com/store/apps/details?id=com.linesetu.doctor').catch(() => {})} />
            <SettingRow iconName="file-text" iconBg="rgba(255,255,255,0.07)" iconColor="rgba(255,255,255,0.4)" label="Terms & Privacy Policy" sub="v2.1.0 · Last updated Jan 2026" onPress={() => setSection('terms')} last />
          </View>

          {/* Account Actions */}
          <SectionLabel label="Account Actions" />
          <View style={styles.settingsGroup}>
            <SettingRow iconName="log-out" iconBg="rgba(239,68,68,0.12)" iconColor="#F87171" label="Log Out" danger
              right={<Text style={{ color: '#F87171', fontSize: 18 }}>›</Text>} onPress={() => setShowLogout(true)} />
            <SettingRow iconName="trash-2" iconBg="rgba(239,68,68,0.08)" iconColor="rgba(239,68,68,0.55)" label="Delete Account" sub="Permanently remove your LINESETU account" danger
              right={<Text style={{ color: 'rgba(239,68,68,0.45)', fontSize: 18 }}>›</Text>} last
              onPress={() => { setDeleteConfirmText(''); setShowDeleteAccount(true); }} />
          </View>

          <View style={{ alignItems: 'center', paddingVertical: 20 }}>
            <Text style={styles.versionText}>LINESETU Doctor · v2.1.0</Text>
            <Text style={styles.buildText}>Build 20260410 · © 2026 LINESETU</Text>
          </View>
        </ScrollView>

        {showLogout && (
          <View style={styles.logoutOverlay}>
            <View style={[styles.logoutSheet, { paddingBottom: 24 + 49 + insets.bottom }]}>
              <View style={styles.logoutHandle} />
              <View style={styles.logoutIconRow}>
                <View style={styles.logoutIcon}><Feather name="log-out" size={20} color="#F87171" /></View>
                <View>
                  <Text style={styles.logoutTitle}>Log Out?</Text>
                  <Text style={styles.logoutSub}>You'll need to sign in again to access your account.</Text>
                </View>
              </View>
              <View style={{ flexDirection: 'row', gap: 10 }}>
                <TouchableOpacity onPress={() => setShowLogout(false)} style={[styles.logoutCancelBtn, { flex: 1, marginBottom: 0 }]}>
                  <Text style={[styles.logoutCancelBtnText, { fontSize: 14, fontWeight: '800', color: '#FFF' }]}>No</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.logoutConfirmBtn, { flex: 1, marginBottom: 0 }]} onPress={async () => {
                  setShowLogout(false);
                  await logout();
                }}>
                  <Text style={styles.logoutConfirmBtnText}>Yes, Log Out</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {showDeleteAccount && (
          <View style={styles.logoutOverlay}>
            <View style={[styles.logoutSheet, { paddingBottom: 24 + 49 + insets.bottom }]}>
              <View style={styles.logoutHandle} />

              {/* Header */}
              <View style={styles.logoutIconRow}>
                <View style={[styles.logoutIcon, { backgroundColor: 'rgba(239,68,68,0.2)', borderColor: 'rgba(239,68,68,0.4)' }]}>
                  <Feather name="trash-2" size={20} color="#F87171" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.logoutTitle, { color: '#F87171' }]}>Delete Account</Text>
                  <Text style={styles.logoutSub}>This action cannot be undone.</Text>
                </View>
              </View>

              {/* Warning bullets */}
              <View style={{ backgroundColor: 'rgba(239,68,68,0.08)', borderRadius: 14, padding: 14, marginBottom: 18, borderWidth: 1, borderColor: 'rgba(239,68,68,0.18)' }}>
                {[
                  'Your doctor profile will be removed from the LINESETU Patient App immediately.',
                  'All scheduled tokens and pending payouts will be cancelled.',
                  'Your clinic, schedule, and fee data will be permanently erased.',
                  'This cannot be reversed. You will need to re-register to use LINESETU again.',
                ].map((line, i) => (
                  <View key={i} style={{ flexDirection: 'row', marginBottom: i < 3 ? 8 : 0 }}>
                    <Feather name="x" size={12} color="#F87171" style={{ marginRight: 8, marginTop: 1 }} />
                    <Text style={{ flex: 1, fontSize: 11, color: 'rgba(239,68,68,0.75)', lineHeight: 17, fontWeight: '500' }}>{line}</Text>
                  </View>
                ))}
              </View>

              {/* Typed confirmation */}
              <Text style={{ fontSize: 11, fontWeight: '700', color: 'rgba(255,255,255,0.4)', marginBottom: 8, letterSpacing: 0.5 }}>
                TYPE <Text style={{ color: '#F87171', fontWeight: '900' }}>DELETE</Text> TO CONFIRM
              </Text>
              <TextInput
                style={[
                  styles.fieldInput,
                  { marginBottom: 16, borderColor: deleteConfirmText === 'DELETE' ? 'rgba(239,68,68,0.7)' : 'rgba(255,255,255,0.1)', textTransform: 'uppercase', letterSpacing: 2, fontWeight: '800', color: '#F87171' },
                ]}
                value={deleteConfirmText}
                onChangeText={v => setDeleteConfirmText(v.toUpperCase())}
                placeholder="Type DELETE here"
                placeholderTextColor="rgba(255,255,255,0.15)"
                autoCapitalize="characters"
                autoCorrect={false}
              />

              {/* Confirm button */}
              <TouchableOpacity
                style={[
                  styles.logoutConfirmBtn,
                  { marginBottom: 10, opacity: deleteConfirmText === 'DELETE' && !deleteLoading ? 1 : 0.35 },
                ]}
                disabled={deleteConfirmText !== 'DELETE' || deleteLoading}
                onPress={async () => {
                  if (!doctor) return;
                  setDeleteLoading(true);
                  try {
                    await fetch(`${BASE()}/api/doctors/${doctor.id}`, { method: 'DELETE' });
                  } catch {}
                  setDeleteLoading(false);
                  setShowDeleteAccount(false);
                  await logout();
                }}
              >
                {deleteLoading
                  ? <ActivityIndicator color="#FFF" size="small" />
                  : <Text style={styles.logoutConfirmBtnText}>Delete My Account Permanently</Text>}
              </TouchableOpacity>

              <TouchableOpacity onPress={() => { setShowDeleteAccount(false); setDeleteConfirmText(''); }} style={styles.logoutCancelBtn}>
                <Text style={styles.logoutCancelBtnText}>Cancel — Keep My Account</Text>
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
  specChip: { paddingHorizontal: 11, paddingVertical: 6, borderRadius: 20, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.12)', backgroundColor: 'rgba(255,255,255,0.05)' },
  specChipActive: { backgroundColor: 'rgba(45,212,191,0.18)', borderColor: TEAL },
  specChipOther: { backgroundColor: 'rgba(251,191,36,0.1)', borderColor: 'rgba(251,191,36,0.4)' },
  specChipText: { fontSize: 11, fontWeight: '700', color: 'rgba(255,255,255,0.5)' },
  specChipTextActive: { color: TEAL_LT },
  photoNoteRow: { marginTop: 10, paddingHorizontal: 14, paddingVertical: 9, borderRadius: 10, borderWidth: 1, borderColor: 'rgba(251,191,36,0.3)', backgroundColor: 'rgba(251,191,36,0.07)', maxWidth: 300 },
  photoNoteText: { fontSize: 11, color: 'rgba(251,191,36,0.85)', fontWeight: '600', textAlign: 'center', lineHeight: 16 },
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
  avatarPlaceholder: { width: 82, height: 82, backgroundColor: 'rgba(255,255,255,0.06)', alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.12)', borderRadius: 14, overflow: 'hidden' },
  avatarEmoji: { fontSize: 30, color: 'rgba(255,255,255,0.4)' },
  changePhotoBar: { backgroundColor: 'rgba(0,0,0,0.55)', paddingVertical: 5, alignItems: 'center' },
  changePhotoBarText: { fontSize: 9, fontWeight: '700', color: '#FFF', letterSpacing: 0.3 },
  photoHintRow: { marginTop: 10, paddingHorizontal: 10, paddingVertical: 8, borderRadius: 10, borderWidth: 1, borderColor: 'rgba(251,191,36,0.3)', backgroundColor: 'rgba(251,191,36,0.06)' },
  photoHintText: { fontSize: 10, color: 'rgba(251,191,36,0.8)', fontWeight: '600' },
  cameraBtn: { position: 'absolute', bottom: -5, right: -5, width: 24, height: 24, borderRadius: 12, backgroundColor: TEAL, borderWidth: 2, borderColor: BG, alignItems: 'center', justifyContent: 'center' },
  profileName: { fontSize: 16, fontWeight: '900', color: '#FFF', letterSpacing: -0.3 },
  profileSpec: { fontSize: 11, color: TEAL_LT, fontWeight: '700' },
  onlineBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 20, backgroundColor: 'rgba(45,212,191,0.12)', borderWidth: 1, borderColor: 'rgba(45,212,191,0.25)' },
  onlineBadgeText: { fontSize: 9, fontWeight: '700', color: TEAL_LT },
  unavailBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 20, backgroundColor: 'rgba(239,68,68,0.12)', borderWidth: 1, borderColor: 'rgba(239,68,68,0.25)' },
  unavailBadgeText: { fontSize: 9, fontWeight: '700', color: '#F87171' },
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
  helpContactRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 2, gap: 12 },
  helpContactIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  helpContactLabel: { fontSize: 14, fontWeight: '700', color: '#FFF', marginBottom: 2 },
  helpContactSub: { fontSize: 11, color: 'rgba(255,255,255,0.4)', fontWeight: '500' },
  toggle: { width: 40, height: 22, borderRadius: 11, justifyContent: 'center', borderWidth: 1 },
  toggleThumb: { position: 'absolute', width: 16, height: 16, borderRadius: 8, backgroundColor: '#FFF' },
  toggleThumbOn: { right: 2 },
  toggleThumbOff: { left: 2 },
  galleryCard: { borderRadius: 20, padding: 16, marginBottom: 8, backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.09)' },
  galleryHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  galleryTitle: { fontSize: 13, fontWeight: '800', color: '#FFF', marginBottom: 2 },
  gallerySub: { fontSize: 10, color: 'rgba(255,255,255,0.35)', fontWeight: '500' },
  galleryToggleBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  galleryToggleTrack: { width: 38, height: 21, borderRadius: 11, backgroundColor: 'rgba(255,255,255,0.1)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)', justifyContent: 'center' },
  galleryToggleTrackOn: { backgroundColor: 'rgba(45,212,191,0.25)', borderColor: 'rgba(45,212,191,0.5)' },
  galleryToggleThumb: { position: 'absolute', left: 2, width: 15, height: 15, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.4)' },
  galleryToggleThumbOn: { left: undefined, right: 2, backgroundColor: TEAL_LT },
  galleryToggleTxt: { fontSize: 10, fontWeight: '700', color: 'rgba(255,255,255,0.35)' },
  galleryScroll: { gap: 10, paddingVertical: 2 },
  galleryThumbWrap: { width: 100, height: 80, borderRadius: 12, overflow: 'hidden', backgroundColor: 'rgba(255,255,255,0.06)', position: 'relative' },
  galleryThumb: { width: '100%', height: '100%' },
  galleryDeleteBtn: { position: 'absolute', top: 6, right: 6, width: 24, height: 24, borderRadius: 12, backgroundColor: 'rgba(15,15,20,0.72)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.18)', alignItems: 'center', justifyContent: 'center' },
  galleryDeleteX: { fontSize: 11, color: '#FFF', fontWeight: '800', lineHeight: 13 },
  galleryAddBtn: { width: 100, height: 80, borderRadius: 12, borderWidth: 1.5, borderColor: 'rgba(45,212,191,0.3)', borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center', gap: 4, backgroundColor: 'rgba(45,212,191,0.04)' },
  galleryAddIcon: { fontSize: 22, color: TEAL_LT, fontWeight: '300' },
  galleryAddTxt: { fontSize: 10, fontWeight: '700', color: TEAL_LT },
  galleryLoadingOverlay: { marginTop: 10, flexDirection: 'row', alignItems: 'center', gap: 8, alignSelf: 'center' },
  galleryLoadingText: { fontSize: 11, fontWeight: '600', color: 'rgba(255,255,255,0.45)' },
  galleryEmpty: { fontSize: 11, color: 'rgba(255,255,255,0.25)', fontWeight: '500', textAlign: 'center', paddingTop: 4, paddingBottom: 2 },
  galleryErrorBanner: { marginTop: 10, flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(239,68,68,0.18)', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, gap: 8 },
  galleryErrorText: { flex: 1, fontSize: 11, fontWeight: '600', color: '#FCA5A5' },
  galleryErrorDismiss: { fontSize: 14, color: '#FCA5A5', fontWeight: '700' },
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
