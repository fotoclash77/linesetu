import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput, ActivityIndicator, Modal, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { BG, TEAL, TEAL_LT } from '../../constants/theme';
import { FeatherIcon as Feather } from "../../components/FeatherIcon";
import { useDoctor } from '../../contexts/DoctorContext';

const BASE = () => `https://${process.env.EXPO_PUBLIC_DOMAIN}`;
const AMBER_LT = '#FCD34D';
const RED      = '#EF4444';

function dateISO(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}
function todayDate() {
  return dateISO(new Date());
}
function currentShift(): 'morning' | 'evening' {
  return new Date().getHours() < 13 ? 'morning' : 'evening';
}
function getNext30Days(): Date[] {
  return Array.from({ length: 30 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() + i); d.setHours(0,0,0,0); return d;
  });
}
function dayLabel(d: Date): string {
  const today = new Date(); today.setHours(0,0,0,0);
  const tomorrow = new Date(today); tomorrow.setDate(today.getDate()+1);
  if (d.getTime() === today.getTime())    return 'Today';
  if (d.getTime() === tomorrow.getTime()) return 'Tmrw';
  return d.toLocaleDateString('en-IN', { weekday: 'short' });
}
function relTime(bookedAt: any): string {
  let ms: number;
  if (bookedAt && typeof bookedAt === 'object' && bookedAt.seconds) {
    ms = bookedAt.seconds * 1000;
  } else if (typeof bookedAt === 'number') {
    ms = bookedAt;
  } else { return ''; }
  const diff = Date.now() - ms;
  const m = Math.floor(diff / 60000);
  const h = Math.floor(diff / 3600000);
  if (m < 1)  return 'Just now';
  if (m < 60) return `${m}m ago`;
  return `${h}h ago`;
}
function fmtDateDisplay(iso: string): string {
  const d = new Date(iso + 'T00:00:00');
  const today = new Date(); today.setHours(0,0,0,0);
  if (d.getTime() === today.getTime()) return 'Today';
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', weekday: 'short' });
}

interface TokenRow {
  id: string; tokenNumber: number; patientName: string;
  type: string; source: string; status: string; bookedAt: any; shift: string;
  visitType?: string;
}

export default function AddWalkinScreen() {
  const { doctor } = useDoctor();
  const params = useLocalSearchParams<{ date?: string; shift?: string }>();

  // Selected schedule — initialized from params, changeable via picker
  const initDate  = (params.date  as string) || todayDate();
  const initShift = ((params.shift as string) === 'evening' ? 'evening' : 'morning') as 'morning' | 'evening';

  const [selectedDate,  setSelectedDate]  = useState<string>(initDate);
  const [selectedShift, setSelectedShift] = useState<'morning' | 'evening'>(initShift);

  // Schedule picker state
  const [showSchedule, setShowSchedule] = useState(false);
  const [pickDate,     setPickDate]     = useState<string>(initDate);
  const [pickShift,    setPickShift]    = useState<'morning' | 'evening'>(initShift);

  const [tokenType, setTokenType] = useState<'Normal' | 'Emergency'>('Normal');
  const [visitType, setVisitType] = useState<'first-visit' | 'follow-up'>('first-visit');
  const [gender, setGender] = useState<'M' | 'F'>('M');
  const [showSuccess, setShowSuccess] = useState(false);
  const [bookedName, setBookedName] = useState('');
  const [bookedToken, setBookedToken] = useState('');
  const [booking, setBooking] = useState(false);
  const [bookingError, setBookingError] = useState('');
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [area, setArea] = useState('');

  const [queue, setQueue]     = useState<TokenRow[]>([]);
  const [queueLoading, setQueueLoading] = useState(true);

  // Load tokens for selected date+shift via SSE / polling
  useEffect(() => {
    if (!doctor?.id) return;
    let active = true;

    const url = `${BASE()}/api/tokens/stream/${doctor.id}?date=${selectedDate}`;

    if (typeof EventSource !== 'undefined') {
      const es = new EventSource(url);
      es.onmessage = (e) => {
        try {
          const tokens: TokenRow[] = JSON.parse(e.data);
          const filtered = tokens.filter(t => t.shift === selectedShift);
          const sorted = [...filtered].sort((a, b) => {
            const ta = a.bookedAt?.seconds ?? 0;
            const tb = b.bookedAt?.seconds ?? 0;
            return tb - ta;
          });
          if (active) { setQueue(sorted); setQueueLoading(false); }
        } catch (_) {}
      };
      es.onerror = () => { if (active) setQueueLoading(false); };
      return () => { active = false; es.close(); };
    }

    // Polling fallback
    const poll = async () => {
      try {
        const res  = await fetch(`${BASE()}/api/tokens?doctorId=${doctor.id}&date=${selectedDate}`);
        const data = await res.json();
        if (data.tokens && active) {
          const filtered = data.tokens.filter((t: TokenRow) => t.shift === selectedShift);
          const sorted = [...filtered].sort((a: TokenRow, b: TokenRow) => {
            const ta = a.bookedAt?.seconds ?? 0;
            const tb = b.bookedAt?.seconds ?? 0;
            return tb - ta;
          });
          setQueue(sorted);
        }
      } catch (_) {}
      if (active) setQueueLoading(false);
    };
    poll();
    const iv = setInterval(poll, 8_000);
    return () => { active = false; clearInterval(iv); };
  }, [doctor?.id, selectedDate, selectedShift]);

  const isEmerg = tokenType === 'Emergency';
  const maxTokenInQueue = queue.reduce((m, t) => Math.max(m, t.tokenNumber ?? 0), 0);
  const nextTokenPreview = maxTokenInQueue + 1;

  // Calendar checks — holiday by default if no entry exists
  const calendarDay    = (doctor as any)?.calendar?.[selectedDate];
  const shiftCfg       = calendarDay?.[selectedShift];
  const isHoliday      = !calendarDay || calendarDay.off === true;
  const isShiftEnabled = !isHoliday && shiftCfg?.enabled === true;
  const isBlocked      = isHoliday || !isShiftEnabled;

  const maxTokens   = shiftCfg?.maxTokens ? parseInt(String(shiftCfg.maxTokens), 10) : null;
  const activeTokens = queue.filter(t => t.status !== 'cancelled').length;
  const isShiftFull  = !isBlocked && maxTokens !== null && activeTokens >= maxTokens;

  const handleBook = async () => {
    const trimmedName    = name.trim();
    const trimmedPhone   = phone.trim();
    const trimmedAge     = age.trim();
    const trimmedAddress = address.trim();
    const trimmedArea    = area.trim();

    if (!trimmedName)    { setBookingError('Patient name is required'); return; }
    if (!trimmedAge || isNaN(Number(trimmedAge)) || Number(trimmedAge) < 1 || Number(trimmedAge) > 99) {
      setBookingError('Valid age is required (1–99)'); return;
    }
    if (!trimmedPhone || trimmedPhone.length !== 10) {
      setBookingError('10-digit phone number is required'); return;
    }
    if (!trimmedAddress) { setBookingError('Address is required'); return; }
    if (!trimmedArea)    { setBookingError('Area / city is required'); return; }
    if (!doctor?.id)     { setBookingError('Doctor not loaded'); return; }
    if (isHoliday)       { setBookingError('Cannot book — this date is marked as a holiday'); return; }
    if (!isShiftEnabled) { setBookingError(`Cannot book — ${selectedShift} shift is not scheduled for this date`); return; }
    if (isShiftFull)     { setBookingError(`Shift is full (${maxTokens}/${maxTokens} tokens)`); return; }

    setBooking(true); setBookingError('');
    try {
      const res = await fetch(`${BASE()}/api/tokens`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          doctorId: doctor.id,
          patientId: null,
          patientName: trimmedName,
          patientPhone: trimmedPhone,
          type: tokenType.toLowerCase(),
          date: selectedDate,
          shift: selectedShift,
          source: 'walkin',
          age: trimmedAge,
          gender,
          address: trimmedAddress,
          area: trimmedArea,
          visitType,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        setBookingError(err.error || 'Booking failed');
        setBooking(false); return;
      }
      const data = await res.json();
      setBookedName(trimmedName);
      setBookedToken(`#${data.tokenNumber}`);
      setShowSuccess(true);
    } catch (e: any) {
      setBookingError(e.message || 'Network error');
    }
    setBooking(false);
  };

  const resetForm = () => {
    setName(''); setAge(''); setPhone('');
    setAddress(''); setArea('');
    setGender('M'); setTokenType('Normal'); setVisitType('first-visit');
    setBookingError(''); setShowSuccess(false);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.container}>
        <View style={[styles.glowTop, { backgroundColor: isEmerg ? 'rgba(239,68,68,0.18)' : 'rgba(13,148,136,0.18)' }]} />
        <View style={styles.glowBottom} />

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <Feather name="chevron-left" size={22} color="#FFF" />
            </TouchableOpacity>
            <View style={{ flex: 1 }}>
              <Text style={styles.headerTitle}>Book Walk-in Token</Text>
            </View>
            {/* Schedule pill — tap to change date/shift */}
            <TouchableOpacity
              style={styles.schedPill}
              onPress={() => { setPickDate(selectedDate); setPickShift(selectedShift); setShowSchedule(true); }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Feather name="calendar" size={12} color="rgba(255,255,255,0.8)" />
                <Text style={styles.schedPillTxt}>
                  {fmtDateDisplay(selectedDate)}  ·
                </Text>
                <Feather name={selectedShift === 'morning' ? 'sun' : 'moon'} size={12} color="rgba(255,255,255,0.8)" />
                <Text style={styles.schedPillTxt}>
                  {selectedShift === 'morning' ? 'Morning' : 'Evening'}
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Holiday / shift-blocked banner */}
          {isBlocked && (
            <View style={{
              marginBottom: 12, paddingVertical: 14, paddingHorizontal: 16,
              borderRadius: 14, backgroundColor: 'rgba(239,68,68,0.12)',
              borderWidth: 1, borderColor: 'rgba(239,68,68,0.35)',
              flexDirection: 'row', alignItems: 'center', gap: 10,
            }}>
              <Feather name="slash" size={22} color="#FCA5A5" />
              <View style={{ flex: 1 }}>
                <Text style={{ color: '#FCA5A5', fontSize: 14, fontWeight: '700' }}>
                  {isHoliday ? 'Holiday — Booking Not Allowed' : `${selectedShift === 'morning' ? 'Morning' : 'Evening'} Shift Not Scheduled`}
                </Text>
                <Text style={{ color: 'rgba(252,161,161,0.7)', fontSize: 12, marginTop: 3 }}>
                  {isHoliday
                    ? 'This date has no active shifts. Please pick a working day from the Schedule picker.'
                    : 'This shift is not enabled for the selected date. Please choose a different date or shift.'}
                </Text>
              </View>
            </View>
          )}

          {/* Next token info */}
          <View style={[styles.nextTokenCard, {
            backgroundColor: isBlocked ? 'rgba(239,68,68,0.08)' : isShiftFull ? 'rgba(239,68,68,0.13)' : isEmerg ? 'rgba(239,68,68,0.13)' : 'rgba(13,148,136,0.13)',
            borderColor:     isBlocked ? 'rgba(239,68,68,0.25)' : isShiftFull ? 'rgba(239,68,68,0.4)'  : isEmerg ? 'rgba(239,68,68,0.3)'  : 'rgba(13,148,136,0.3)',
          }]}>
            <View style={styles.nextTokenLeft}>
              <View style={[styles.nextTokenBox, {
                backgroundColor: isBlocked ? 'rgba(239,68,68,0.18)' : isShiftFull ? 'rgba(239,68,68,0.25)' : isEmerg ? 'rgba(239,68,68,0.25)' : 'rgba(13,148,136,0.25)',
                borderColor:     isBlocked ? 'rgba(239,68,68,0.35)' : isShiftFull ? 'rgba(239,68,68,0.4)'  : isEmerg ? 'rgba(239,68,68,0.4)'  : 'rgba(45,212,191,0.4)',
              }]}>
                <Text style={[styles.nextTokenLabel, { color: (isBlocked || isShiftFull) ? '#FCA5A5' : isEmerg ? '#FCA5A5' : TEAL_LT }]}>
                  {isBlocked ? 'Off' : isShiftFull ? 'Full' : 'Next'}
                </Text>
                <Text style={styles.nextTokenNum}>{isBlocked ? '—' : queueLoading ? '…' : isShiftFull ? 'X' : `#${nextTokenPreview}`}</Text>
              </View>
              <View>
                <Text style={styles.nextTokenTitle}>{isBlocked ? (isHoliday ? 'Holiday' : 'Shift Off') : isShiftFull ? 'Shift Full' : 'Next Token'}</Text>
                <Text style={styles.nextTokenValue}>
                  {isBlocked
                    ? (isHoliday ? 'No working shifts today' : `${selectedShift} not enabled`)
                    : isShiftFull ? `All ${maxTokens} slots taken`
                    : `${isEmerg ? 'Emergency' : 'Normal'} ${queueLoading ? '' : `#${nextTokenPreview}`}`}
                </Text>
                {!isBlocked && maxTokens !== null && !isShiftFull && (
                  <Text style={[styles.nextTokenTitle, { color: activeTokens / maxTokens >= 0.8 ? '#FCA5A5' : TEAL_LT, marginTop: 2 }]}>
                    {activeTokens}/{maxTokens} slots used
                  </Text>
                )}
              </View>
            </View>
          </View>

          {/* Token type toggle */}
          <Text style={styles.fieldGroupLabel}>TOKEN TYPE</Text>
          <View style={styles.tokenTypeToggle}>
            {(['Normal', 'Emergency'] as const).map(t => {
              const active = tokenType === t;
              const isE = t === 'Emergency';
              return (
                <TouchableOpacity
                  key={t} onPress={() => setTokenType(t)}
                  style={[styles.tokenTypeBtn, active && (isE ? styles.tokenTypeBtnEmergencyActive : styles.tokenTypeBtnNormalActive)]}
                >
                  <Feather name={isE ? 'zap' : 'check'} size={18} color={active ? (isE ? '#F87171' : TEAL_LT) : 'rgba(255,255,255,0.3)'} />
                  <Text style={[styles.tokenTypeBtnText, active && { color: '#FFF' }]}>{t}</Text>
                  <Text style={[styles.tokenTypeBtnFree, { color: active ? (isE ? '#FCA5A5' : TEAL_LT) : 'rgba(255,255,255,0.2)' }]}>FREE</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Visit type toggle */}
          <Text style={styles.fieldGroupLabel}>VISIT TYPE</Text>
          <View style={styles.tokenTypeToggle}>
            {([
              { key: 'first-visit', label: 'First Visit', iconName: 'activity' as const },
              { key: 'follow-up',   label: 'Follow-up',   iconName: 'repeat'   as const },
            ] as const).map(opt => {
              const active = visitType === opt.key;
              return (
                <TouchableOpacity
                  key={opt.key} onPress={() => setVisitType(opt.key)}
                  style={[styles.tokenTypeBtn, active && styles.tokenTypeBtnNormalActive]}
                >
                  <Feather name={opt.iconName} size={18} color={active ? TEAL_LT : 'rgba(255,255,255,0.3)'} />
                  <Text style={[styles.tokenTypeBtnText, active && { color: '#FFF' }]}>{opt.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Patient form */}
          <View style={styles.formCard}>
            <Text style={styles.formCardTitle}>PATIENT DETAILS</Text>

            <View style={styles.fieldWrap}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 6 }}>
                <Feather name="user" size={11} color="rgba(255,255,255,0.4)" />
                <Text style={styles.fieldLabel}>PATIENT NAME</Text>
              </View>
              <TextInput style={styles.input} placeholder="Enter full name" placeholderTextColor="rgba(255,255,255,0.2)" value={name} onChangeText={setName} />
            </View>

            <View style={styles.rowFields}>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 6 }}>
                  <Feather name="calendar" size={11} color="rgba(255,255,255,0.4)" />
                  <Text style={styles.fieldLabel}>AGE</Text>
                </View>
                <TextInput style={styles.input} placeholder="e.g. 35" placeholderTextColor="rgba(255,255,255,0.2)" keyboardType="number-pad" maxLength={2} value={age} onChangeText={t => setAge(t.replace(/\D/g, '').slice(0, 2))} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.fieldLabel}>GENDER</Text>
                <View style={styles.genderToggle}>
                  {(['M', 'F'] as const).map(g => (
                    <TouchableOpacity key={g} onPress={() => setGender(g)} style={[styles.genderBtn, gender === g && styles.genderBtnActive]}>
                      <Text style={[styles.genderBtnText, gender === g && styles.genderBtnTextActive]}>{g === 'M' ? 'Male' : 'Female'}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>

            <View style={styles.fieldWrap}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 6 }}>
                <Feather name="phone" size={11} color="rgba(255,255,255,0.4)" />
                <Text style={styles.fieldLabel}>PHONE NUMBER</Text>
              </View>
              <View style={styles.phoneRow}>
                <View style={styles.countryPrefix}><Text style={styles.countryPrefixText}>+91</Text></View>
                <TextInput style={[styles.input, { flex: 1 }]} placeholder="98765 43210" placeholderTextColor="rgba(255,255,255,0.2)" keyboardType="phone-pad" maxLength={10} value={phone} onChangeText={t => setPhone(t.replace(/\D/g, '').slice(0, 10))} />
              </View>
            </View>

            <View style={styles.fieldWrap}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 6 }}>
                <Feather name="map-pin" size={11} color="rgba(255,255,255,0.4)" />
                <Text style={styles.fieldLabel}>AREA</Text>
              </View>
              <TextInput style={styles.input} placeholder="Street / Area" placeholderTextColor="rgba(255,255,255,0.2)" value={address} onChangeText={setAddress} />
            </View>

            <View style={styles.fieldWrap}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 6 }}>
                <Feather name="map" size={11} color="rgba(255,255,255,0.4)" />
                <Text style={styles.fieldLabel}>ADDRESS</Text>
              </View>
              <TextInput style={styles.input} placeholder="Village / Colony / City / Pin Code" placeholderTextColor="rgba(255,255,255,0.2)" value={area} onChangeText={setArea} />
            </View>
          </View>

          {!!bookingError && (
            <View style={{ marginBottom: 10, paddingHorizontal: 4, paddingVertical: 8, borderRadius: 10, backgroundColor: 'rgba(239,68,68,0.12)', borderWidth: 1, borderColor: 'rgba(239,68,68,0.3)' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                <Feather name="alert-triangle" size={13} color="#FCA5A5" />
                <Text style={{ color: '#FCA5A5', fontSize: 13, fontWeight: '600' }}>{bookingError}</Text>
              </View>
            </View>
          )}

          <TouchableOpacity
            onPress={handleBook}
            disabled={booking || isShiftFull || isBlocked}
            style={[
              styles.bookBtn,
              isBlocked   ? styles.bookBtnFull :
              isShiftFull ? styles.bookBtnFull :
              isEmerg     ? styles.bookBtnEmergency :
                            styles.bookBtnNormal,
              (booking || isShiftFull || isBlocked) && { opacity: 0.55 },
            ]}
          >
            {booking
              ? <ActivityIndicator color="#FFF" size="small" />
              : <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Feather
                    name={isBlocked ? 'slash' : isShiftFull ? 'slash' : 'plus-circle'}
                    size={16}
                    color="#FFF"
                  />
                  <Text style={styles.bookBtnText}>
                    {isBlocked
                      ? (isHoliday ? 'Holiday — Cannot Book' : 'Shift Not Scheduled')
                      : isShiftFull
                      ? 'Shift Full — No More Tokens'
                      : `Book ${tokenType} Token — FREE`}
                  </Text>
                </View>}
          </TouchableOpacity>

          {/* Live queue for selected date+shift */}
          <View style={styles.recentSection}>
            <View style={styles.recentHeader}>
              <Feather name="list" size={16} color={TEAL_LT} />
              <Text style={styles.recentTitle}>
                {fmtDateDisplay(selectedDate).toUpperCase()} · {selectedShift === 'morning' ? 'MORNING' : 'EVENING'} QUEUE
              </Text>
              {!queueLoading && (
                <View style={styles.queueCount}><Text style={styles.queueCountTxt}>{queue.length}</Text></View>
              )}
            </View>

            {queueLoading ? (
              <View style={styles.loadingWrap}>
                <ActivityIndicator size="small" color={TEAL_LT} />
                <Text style={styles.loadingTxt}>Loading queue…</Text>
              </View>
            ) : queue.length === 0 ? (
              <View style={styles.emptyQueue}>
                <Text style={styles.emptyQueueTxt}>No tokens booked yet for this slot.</Text>
              </View>
            ) : (
              queue.map((t) => {
                const isE = t.type === 'emergency';
                const tokenDisp = isE
                  ? `E${String(t.tokenNumber).padStart(2, '0')}`
                  : `#${String(t.tokenNumber).padStart(2, '0')}`;

                // Status badge
                const STATUS_MAP: Record<string, { label: string; color: string; bg: string }> = {
                  waiting:    { label: 'Waiting',    color: '#FCD34D', bg: 'rgba(252,211,77,0.15)'  },
                  in_consult: { label: 'Consulting', color: TEAL_LT,   bg: 'rgba(45,212,191,0.15)' },
                  done:       { label: 'Consulted',  color: '#4ADE80', bg: 'rgba(74,222,128,0.15)'  },
                  cancelled:  { label: 'Cancelled',  color: '#F87171', bg: 'rgba(239,68,68,0.15)'   },
                };
                const st = STATUS_MAP[t.status] ?? { label: t.status, color: 'rgba(255,255,255,0.4)', bg: 'rgba(255,255,255,0.08)' };

                // Priority pill
                const priLabel = isE ? 'Emergency' : 'Normal';
                const priClr   = isE ? '#F87171' : '#4ADE80';
                const priBg    = isE ? 'rgba(239,68,68,0.12)'  : 'rgba(74,222,128,0.12)';
                const priBd    = isE ? 'rgba(239,68,68,0.28)'  : 'rgba(74,222,128,0.28)';

                // Source pill — read actual source field
                const isOnline  = t.source === 'online';
                const srcLabel  = isOnline ? 'E-Token' : 'Walk-In';
                const srcClr    = isOnline ? '#A5B4FC' : '#2DD4BF';
                const srcBg     = isOnline ? 'rgba(165,180,252,0.12)' : 'rgba(45,212,191,0.12)';
                const srcBd     = isOnline ? 'rgba(165,180,252,0.28)' : 'rgba(45,212,191,0.28)';

                return (
                  <View key={t.id} style={[styles.recentItem, isE && styles.recentItemEmerg]}>
                    {/* Token chip */}
                    <View style={[styles.recentToken, {
                      backgroundColor: isE ? 'rgba(239,68,68,0.2)'  : 'rgba(13,148,136,0.2)',
                      borderColor:     isE ? 'rgba(239,68,68,0.35)' : 'rgba(45,212,191,0.35)',
                    }]}>
                      <Text style={[styles.recentTokenText, { color: isE ? '#FCA5A5' : '#FFF' }]}>{tokenDisp}</Text>
                    </View>

                    {/* Info rows */}
                    <View style={{ flex: 1, gap: 4 }}>
                      {/* Row 1: name + status badge */}
                      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                        <Text style={styles.recentName} numberOfLines={1}>{t.patientName}</Text>
                        <View style={[styles.recentBadge, { backgroundColor: st.bg, borderColor: `${st.color}55` }]}>
                          <Text style={[styles.recentBadgeTxt, { color: st.color }]}>{st.label}</Text>
                        </View>
                      </View>
                      {/* Row 2: [Walk-in] · [Normal/Emergency] · [Visit Type] · time */}
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, flexWrap: 'wrap' }}>
                        <View style={[styles.recentPill, { backgroundColor: srcBg, borderColor: srcBd }]}>
                          <Text style={[styles.recentPillTxt, { color: srcClr }]}>{srcLabel}</Text>
                        </View>
                        <Text style={styles.recentDot}>·</Text>
                        <View style={[styles.recentPill, { backgroundColor: priBg, borderColor: priBd }]}>
                          <Text style={[styles.recentPillTxt, { color: priClr }]}>{priLabel}</Text>
                        </View>
                        {!!t.visitType && (() => {
                          const isFV = t.visitType === 'first-visit';
                          return (
                            <>
                              <Text style={styles.recentDot}>·</Text>
                              <View style={[styles.recentPill, {
                                backgroundColor: isFV ? 'rgba(99,102,241,0.12)' : 'rgba(16,185,129,0.12)',
                                borderColor: isFV ? 'rgba(129,140,248,0.30)' : 'rgba(52,211,153,0.30)',
                              }]}>
                                <Text style={[styles.recentPillTxt, { color: isFV ? '#A5B4FC' : '#6EE7B7' }]}>
                                  {isFV ? 'First Visit' : 'Follow-up'}
                                </Text>
                              </View>
                            </>
                          );
                        })()}
                        {!!relTime(t.bookedAt) && (
                          <>
                            <Text style={styles.recentDot}>·</Text>
                            <Text style={styles.recentTime}>{relTime(t.bookedAt)}</Text>
                          </>
                        )}
                      </View>
                    </View>
                  </View>
                );
              })
            )}
          </View>
        </ScrollView>
      </View>

      {/* ── SCHEDULE PICKER MODAL ─────────────────── */}
      <Modal visible={showSchedule} transparent animationType="slide" onRequestClose={() => setShowSchedule(false)}>
        <TouchableOpacity style={wStyles.modalOverlay} activeOpacity={1} onPress={() => setShowSchedule(false)}>
          <TouchableOpacity activeOpacity={1} onPress={() => {}}>
            <View style={wStyles.modalSheet}>
              <View style={wStyles.modalHandle} />
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <Feather name="calendar" size={18} color={TEAL_LT} />
                <Text style={wStyles.modalTitle}>Select Schedule</Text>
              </View>
              <Text style={wStyles.modalSub}>Dates & shifts from your configured calendar</Text>

              {/* Date strip — 30-day calendar */}
              <Text style={wStyles.modalSectionLabel}>DATE</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 18 }}>
                <View style={{ flexDirection: 'row', gap: 8, paddingVertical: 4 }}>
                  {getNext30Days().map(d => {
                    const iso = dateISO(d);
                    const cfg = (doctor as any)?.calendar?.[iso];
                    const hasMorning = cfg?.morning?.enabled === true;
                    const hasEvening = cfg?.evening?.enabled === true;
                    const hasAny = hasMorning || hasEvening;
                    // No entry OR explicitly off OR no enabled shift → holiday by default
                    const isOff = !cfg || cfg?.off === true || !hasAny;
                    const active = pickDate === iso;
                    return (
                      <TouchableOpacity
                        key={iso}
                        onPress={() => {
                          setPickDate(iso);
                          if (hasMorning && !hasEvening) setPickShift('morning');
                          else if (hasEvening && !hasMorning) setPickShift('evening');
                        }}
                        disabled={isOff}
                        style={[
                          wStyles.dateCell,
                          active && wStyles.dateCellActive,
                          isOff && { opacity: 0.22 },
                          !isOff && !active && { borderColor: 'rgba(45,212,191,0.2)' },
                        ]}
                      >
                        <Text style={[wStyles.dateDayLabel, active && { color: TEAL_LT }]}>{dayLabel(d)}</Text>
                        <Text style={[wStyles.dateDayNum,   active && { color: '#FFF'  }]}>{d.getDate()}</Text>
                        <Text style={[wStyles.dateMonth,    active && { color: TEAL_LT }]}>
                          {d.toLocaleDateString('en-IN', { month: 'short' })}
                        </Text>
                        <View style={{ flexDirection: 'row', gap: 3, marginTop: 2 }}>
                          {!isOff && hasMorning && <View style={{ width: 5, height: 5, borderRadius: 2.5, backgroundColor: AMBER_LT }} />}
                          {!isOff && hasEvening && <View style={{ width: 5, height: 5, borderRadius: 2.5, backgroundColor: '#A5B4FC' }} />}
                          {isOff && <Text style={{ fontSize: 9, color: '#F87171' }}>Off</Text>}
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </ScrollView>

              {/* Shift cards — real data from calendar[pickDate] */}
              <Text style={wStyles.modalSectionLabel}>SHIFT</Text>
              {(() => {
                const cal = (doctor as any)?.calendar ?? {};
                const dayCfg = cal[pickDate];
                const isDayOff = !dayCfg || dayCfg?.off === true
                  || !(dayCfg?.morning?.enabled === true || dayCfg?.evening?.enabled === true);
                if (isDayOff) {
                  return (
                    <View style={{ alignItems: 'center', paddingVertical: 20, marginBottom: 16 }}>
                      <Feather name="slash" size={28} color="#F87171" style={{ marginBottom: 8 }} />
                      <Text style={{ color: '#F87171', fontWeight: '700', fontSize: 13 }}>This day is marked as Holiday</Text>
                    </View>
                  );
                }
                return (
                  <View style={wStyles.shiftRow}>
                    {(['morning', 'evening'] as const).map(s => {
                      const shiftCfg = dayCfg?.[s];
                      const enabled = shiftCfg?.enabled === true;
                      const active  = pickShift === s;
                      const timeRange  = shiftCfg ? `${shiftCfg.startTime ?? ''} – ${shiftCfg.endTime ?? ''}` : '';
                      const clinicName = shiftCfg?.clinicName ?? '';
                      const maxTok     = shiftCfg?.maxTokens ? String(shiftCfg.maxTokens) : null;
                      return (
                        <TouchableOpacity
                          key={s}
                          onPress={() => enabled && setPickShift(s)}
                          disabled={!enabled}
                          style={[
                            wStyles.shiftOpt,
                            active && (s === 'morning' ? wStyles.shiftOptMorn : wStyles.shiftOptEve),
                            !enabled && { opacity: 0.25 },
                          ]}
                        >
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                            <Feather name={s === 'morning' ? 'sun' : 'moon'} size={16} color={active ? (s === 'morning' ? AMBER_LT : '#A5B4FC') : 'rgba(255,255,255,0.4)'} />
                            <Text style={[wStyles.shiftOptLabel, active && { color: '#FFF' }]}>
                              {s === 'morning' ? 'Morning' : 'Evening'}
                            </Text>
                            {!enabled && <Text style={{ fontSize: 9, fontWeight: '700', color: '#F87171', textTransform: 'uppercase' }}>Off</Text>}
                          </View>
                          {timeRange.trim() !== '–' && timeRange !== '' && (
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                              <Feather name="clock" size={10} color={active ? 'rgba(255,255,255,0.75)' : 'rgba(255,255,255,0.3)'} />
                              <Text style={{ fontSize: 11, color: active ? 'rgba(255,255,255,0.75)' : 'rgba(255,255,255,0.3)', fontWeight: '600' }}>{timeRange}</Text>
                            </View>
                          )}
                          {clinicName ? (
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 }}>
                              <Feather name="home" size={10} color={active ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.25)'} />
                              <Text style={{ fontSize: 10, color: active ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.25)', fontWeight: '500' }} numberOfLines={1}>{clinicName}</Text>
                            </View>
                          ) : null}
                          {maxTok ? (
                            <Text style={{ fontSize: 10, color: active ? TEAL_LT : 'rgba(255,255,255,0.3)', fontWeight: '700', marginTop: 3 }}>
                              Max: {maxTok} tokens
                            </Text>
                          ) : null}
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                );
              })()}

              <TouchableOpacity
                style={wStyles.confirmBtn}
                onPress={() => {
                  const cal = (doctor as any)?.calendar ?? {};
                  const dayCfg = cal[pickDate];
                  const isDayOff = !dayCfg || dayCfg?.off === true
                    || !(dayCfg?.morning?.enabled === true || dayCfg?.evening?.enabled === true);
                  const shiftEnabled = dayCfg?.[pickShift]?.enabled === true;
                  if (isDayOff || !shiftEnabled) {
                    Alert.alert(
                      'Select a Clinic',
                      'Please select a valid date and shift with a clinic assigned before applying.',
                      [{ text: 'OK' }]
                    );
                    return;
                  }
                  setSelectedDate(pickDate);
                  setSelectedShift(pickShift);
                  setShowSchedule(false);
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7 }}>
                  <Feather name="check" size={15} color="#FFF" />
                  <Text style={wStyles.confirmBtnTxt}>Set Schedule</Text>
                </View>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* Success overlay */}
      {showSuccess && (
        <View style={styles.overlay}>
          <View style={styles.successCard}>
            <View style={styles.successIconWrap}>
              <Feather name="check" size={32} color="#4ADE80" />
            </View>
            <Text style={styles.successTitle}>Token Booked!</Text>
            <Text style={styles.successSub}>
              Token <Text style={styles.successHighlight}>{bookedToken}</Text> assigned to{' '}
              <Text style={styles.successHighlight}>{bookedName}</Text>
            </Text>
            <Text style={styles.successNote}>
              {fmtDateDisplay(selectedDate)} · {selectedShift === 'morning' ? 'Morning' : 'Evening'} shift
            </Text>
            <View style={styles.successBtns}>
              <TouchableOpacity style={styles.btnNewToken} activeOpacity={0.8} onPress={resetForm}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Feather name="plus" size={14} color={TEAL_LT} />
                  <Text style={styles.btnNewTokenTxt}>Book New Token</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity style={styles.btnHome} activeOpacity={0.8}
                onPress={() => { setShowSuccess(false); router.navigate('/(tabs)/queue' as any); }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Feather name="clock" size={14} color="#FFF" />
                  <Text style={styles.btnHomeTxt}>View Queue</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  container: { flex: 1, backgroundColor: BG },
  glowTop: { position: 'absolute', top: -60, left: -60, width: 240, height: 240, borderRadius: 120, opacity: 0.5 },
  glowBottom: { position: 'absolute', bottom: 100, right: -60, width: 180, height: 180, borderRadius: 90, backgroundColor: 'rgba(99,102,241,0.1)', opacity: 0.5 },
  scroll: { padding: 16, paddingBottom: 100 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  backBtn: { width: 36, height: 36, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.09)', alignItems: 'center', justifyContent: 'center' },
  backIcon: { fontSize: 16, color: 'rgba(255,255,255,0.6)' },
  headerTitle: { fontSize: 18, fontWeight: '900', color: '#FFF', letterSpacing: -0.5 },
  headerSub: { fontSize: 12, color: TEAL_LT, fontWeight: '700', marginTop: 1 },
  nextTokenCard: { borderRadius: 16, padding: 10, marginBottom: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1 },
  nextTokenLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  nextTokenBox: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  nextTokenLabel: { fontSize: 9, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.4 },
  nextTokenNum: { fontSize: 14, fontWeight: '900', color: '#FFF' },
  nextTokenTitle: { fontSize: 10, fontWeight: '700', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: 0.6 },
  nextTokenValue: { fontSize: 13, fontWeight: '800', color: '#FFF' },
  fieldGroupLabel: { fontSize: 10, fontWeight: '800', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 7 },
  tokenTypeToggle: { flexDirection: 'row', gap: 5, padding: 4, borderRadius: 16, marginBottom: 14, backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.09)' },
  tokenTypeBtn: { flex: 1, height: 52, borderRadius: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  tokenTypeBtnNormalActive: { backgroundColor: 'rgba(13,148,136,0.28)', borderWidth: 1.5, borderColor: 'rgba(45,212,191,0.5)' },
  tokenTypeBtnEmergencyActive: { backgroundColor: 'rgba(239,68,68,0.25)', borderWidth: 1.5, borderColor: 'rgba(239,68,68,0.5)' },
  tokenTypeBtnText: { fontSize: 11, fontWeight: '800', color: 'rgba(255,255,255,0.38)' },
  tokenTypeBtnFree: { fontSize: 9, fontWeight: '700' },
  formCard: { borderRadius: 20, padding: 16, marginBottom: 14, backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.09)' },
  formCardTitle: { fontSize: 10, fontWeight: '800', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 },
  fieldWrap: { marginBottom: 10 },
  fieldLabel: { fontSize: 10, fontWeight: '700', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: 0.7, marginBottom: 5 },
  input: { width: '100%', height: 46, borderRadius: 13, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.06)', color: '#FFF', fontSize: 13, fontWeight: '500', paddingHorizontal: 14 },
  rowFields: { flexDirection: 'row', gap: 8, marginBottom: 10 },
  genderToggle: { flexDirection: 'row', gap: 5, height: 46 },
  genderBtn: { flex: 1, borderRadius: 13, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.06)', alignItems: 'center', justifyContent: 'center' },
  genderBtnActive: { backgroundColor: 'rgba(99,102,241,0.28)', borderWidth: 1.5, borderColor: 'rgba(99,102,241,0.5)' },
  genderBtnText: { fontSize: 12, fontWeight: '800', color: 'rgba(255,255,255,0.38)' },
  genderBtnTextActive: { color: '#A5B4FC' },
  phoneRow: { flexDirection: 'row', gap: 6 },
  countryPrefix: { width: 50, height: 46, borderRadius: 13, backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' },
  countryPrefixText: { fontSize: 12, fontWeight: '700', color: 'rgba(255,255,255,0.6)' },
  bookBtn: { height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 18 },
  bookBtnNormal: { backgroundColor: TEAL },
  bookBtnEmergency: { backgroundColor: '#DC2626' },
  bookBtnFull: { backgroundColor: 'rgba(239,68,68,0.2)', borderWidth: 1, borderColor: 'rgba(239,68,68,0.4)' },
  bookBtnText: { fontSize: 14, fontWeight: '900', color: '#FFF' },
  recentSection: {},
  recentHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 },
  recentIcon: { fontSize: 11, color: 'rgba(255,255,255,0.3)' },
  recentTitle: { fontSize: 10, fontWeight: '800', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: 1, flex: 1 },
  recentItem: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 12, paddingVertical: 11, borderRadius: 16, marginBottom: 6, backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.08)' },
  recentItemEmerg: { backgroundColor: 'rgba(239,68,68,0.07)', borderColor: 'rgba(239,68,68,0.28)' },
  recentToken: { width: 52, height: 52, borderRadius: 13, alignItems: 'center', justifyContent: 'center', flexShrink: 0, borderWidth: 1.5 },
  recentTokenText: { fontSize: 14, fontWeight: '900', color: '#FFF', letterSpacing: -0.3 },
  recentName: { fontSize: 13, fontWeight: '800', color: '#FFF', flex: 1, minWidth: 0 },
  recentBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20, borderWidth: 0.5 },
  recentBadgeTxt: { fontSize: 9, fontWeight: '800' },
  recentPill: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, borderWidth: 1 },
  recentPillTxt: { fontSize: 9, fontWeight: '800' },
  recentDot: { fontSize: 10, color: 'rgba(255,255,255,0.2)', fontWeight: '600' },
  recentTime: { fontSize: 10, color: 'rgba(255,255,255,0.25)', fontWeight: '600' },
  queueCount: { marginLeft: 'auto', backgroundColor: 'rgba(45,212,191,0.15)', borderRadius: 8, paddingHorizontal: 7, paddingVertical: 2, borderWidth: 1, borderColor: 'rgba(45,212,191,0.25)' },
  queueCountTxt: { fontSize: 11, fontWeight: '800', color: TEAL_LT },
  loadingWrap: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 20, justifyContent: 'center' },
  loadingTxt: { fontSize: 13, color: 'rgba(255,255,255,0.3)', fontWeight: '500' },
  emptyQueue: { paddingVertical: 24, alignItems: 'center' },
  emptyQueueTxt: { fontSize: 13, color: 'rgba(255,255,255,0.25)', fontWeight: '600' },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(7,11,20,0.93)', alignItems: 'center', justifyContent: 'center', padding: 20, zIndex: 999 },
  successCard: { width: '100%', backgroundColor: '#0D1321', borderRadius: 28, padding: 28, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(74,222,128,0.25)' },
  successIconWrap: { width: 72, height: 72, borderRadius: 36, backgroundColor: 'rgba(74,222,128,0.15)', borderWidth: 2, borderColor: 'rgba(74,222,128,0.4)', alignItems: 'center', justifyContent: 'center', marginBottom: 18 },
  successIcon: { fontSize: 32, color: '#4ADE80' },
  successTitle: { fontSize: 24, fontWeight: '900', color: '#FFF', marginBottom: 10 },
  successSub: { fontSize: 15, color: 'rgba(255,255,255,0.6)', textAlign: 'center', lineHeight: 22, marginBottom: 6 },
  successHighlight: { color: '#FFF', fontWeight: '800' },
  successNote: { fontSize: 12, color: TEAL_LT, fontWeight: '700', marginBottom: 24 },
  successBtns: { flexDirection: 'row', gap: 10, width: '100%' },
  btnNewToken: { flex: 1, height: 50, borderRadius: 16, backgroundColor: 'rgba(13,148,136,0.2)', borderWidth: 1, borderColor: 'rgba(45,212,191,0.35)', alignItems: 'center', justifyContent: 'center' },
  btnNewTokenTxt: { fontSize: 13, fontWeight: '800', color: TEAL_LT },
  btnHome: { flex: 1, height: 50, borderRadius: 16, backgroundColor: TEAL, alignItems: 'center', justifyContent: 'center' },
  btnHomeTxt: { fontSize: 13, fontWeight: '800', color: '#FFF' },
  schedPill: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20, borderWidth: 1, backgroundColor: 'rgba(13,148,136,0.18)', borderColor: 'rgba(45,212,191,0.4)' },
  schedPillTxt: { fontSize: 11, fontWeight: '800', color: TEAL_LT },
});

const wStyles = StyleSheet.create({
  modalOverlay:     { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalSheet:       { backgroundColor: '#0D1321', borderTopLeftRadius: 26, borderTopRightRadius: 26, padding: 22, paddingBottom: 36, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.08)' },
  modalHandle:      { width: 36, height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.15)', alignSelf: 'center', marginBottom: 18 },
  modalTitle:       { fontSize: 18, fontWeight: '900', color: '#FFF', marginBottom: 4 },
  modalSub:         { fontSize: 12, color: 'rgba(255,255,255,0.4)', fontWeight: '500', marginBottom: 16 },
  modalSectionLabel:{ fontSize: 10, fontWeight: '800', color: 'rgba(255,255,255,0.35)', letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 10 },
  dateCell:         { width: 60, height: 76, borderRadius: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', backgroundColor: 'rgba(255,255,255,0.04)', alignItems: 'center', justifyContent: 'center', gap: 2 },
  dateCellActive:   { backgroundColor: 'rgba(13,148,136,0.25)', borderColor: 'rgba(45,212,191,0.5)', borderWidth: 1.5 },
  dateDayLabel:     { fontSize: 10, fontWeight: '700', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' },
  dateDayNum:       { fontSize: 22, fontWeight: '900', color: 'rgba(255,255,255,0.7)', lineHeight: 26 },
  dateMonth:        { fontSize: 10, fontWeight: '600', color: 'rgba(255,255,255,0.35)' },
  shiftRow:         { flexDirection: 'row', gap: 10, marginBottom: 22 },
  shiftOpt:         { flex: 1, minHeight: 72, borderRadius: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.09)', backgroundColor: 'rgba(255,255,255,0.04)', padding: 12, gap: 2 },
  shiftOptMorn:     { backgroundColor: 'rgba(245,158,11,0.18)', borderColor: 'rgba(245,158,11,0.45)', borderWidth: 1.5 },
  shiftOptEve:      { backgroundColor: 'rgba(196,181,253,0.15)', borderColor: 'rgba(196,181,253,0.4)', borderWidth: 1.5 },
  shiftOptLabel:    { fontSize: 13, fontWeight: '800', color: 'rgba(255,255,255,0.5)' },
  confirmBtn:       { height: 52, borderRadius: 16, backgroundColor: TEAL, alignItems: 'center', justifyContent: 'center' },
  confirmBtnTxt:    { fontSize: 15, fontWeight: '900', color: '#FFF' },
});
