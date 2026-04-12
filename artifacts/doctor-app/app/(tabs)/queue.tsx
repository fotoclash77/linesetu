import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { BG, TEAL, TEAL_LT } from '../../constants/theme';

type QStatus = 'consulting' | 'next' | 'waiting' | 'done' | 'skipped';
type QType = 'Online' | 'Walk-in' | 'Emergency';

interface Patient {
  id: string; token: string; name: string; age: number; gender: 'M' | 'F';
  phone: string; addr: string; type: QType; status: QStatus; visitType: 'First Visit' | 'Follow-up';
}

const INIT_QUEUE: Patient[] = [
  { id:'p1', token:'#47', name:'Priya Mehta',  age:34, gender:'F', phone:'+91 98765 11111', addr:'Andheri West', type:'Online',  status:'consulting', visitType:'First Visit' },
  { id:'p2', token:'#48', name:'Rajan Gupta',  age:28, gender:'M', phone:'+91 97654 22222', addr:'Bandra East',  type:'Walk-in', status:'next',       visitType:'Follow-up' },
  { id:'p3', token:'#49', name:'Sunita Patel', age:52, gender:'F', phone:'+91 96543 33333', addr:'Juhu',         type:'Online',  status:'waiting',    visitType:'First Visit' },
  { id:'p4', token:'#50', name:'Arvind Kumar', age:41, gender:'M', phone:'+91 95432 44444', addr:'Goregaon',     type:'Walk-in', status:'waiting',    visitType:'Follow-up' },
  { id:'p5', token:'#51', name:'Meena Kaur',   age:45, gender:'F', phone:'+91 94321 55555', addr:'Malad West',   type:'Online',  status:'waiting',    visitType:'First Visit' },
  { id:'p6', token:'#45', name:'Rahul Sharma', age:32, gender:'M', phone:'+91 98765 43210', addr:'Andheri West', type:'Online',  status:'done',       visitType:'Follow-up' },
  { id:'p7', token:'#46', name:'Pooja Nair',   age:27, gender:'F', phone:'+91 93219 87654', addr:'Versova',      type:'Walk-in', status:'skipped',    visitType:'First Visit' },
];
const INIT_EMERGENCY: Patient[] = [
  { id:'e1', token:'E01', name:'Deepak Joshi', age:58, gender:'M', phone:'+91 93210 66666', addr:'Versova',     type:'Emergency', status:'waiting', visitType:'First Visit' },
  { id:'e2', token:'E02', name:'Anita Roy',    age:44, gender:'F', phone:'+91 92109 77777', addr:'Lokhandwala', type:'Emergency', status:'waiting', visitType:'First Visit' },
];

const STATUS_CFG = {
  consulting: { label: 'In Cabin',  color: '#2DD4BF', bg: 'rgba(13,148,136,0.22)',  border: 'rgba(45,212,191,0.5)' },
  next:       { label: 'Next',      color: '#FCD34D', bg: 'rgba(245,158,11,0.18)',  border: 'rgba(245,158,11,0.45)' },
  waiting:    { label: 'Waiting',   color: '#A5B4FC', bg: 'rgba(99,102,241,0.15)',  border: 'rgba(99,102,241,0.35)' },
  done:       { label: 'Consulted', color: '#4ADE80', bg: 'rgba(34,197,94,0.14)',   border: 'rgba(34,197,94,0.3)' },
  skipped:    { label: 'Not Shown', color: '#F59E0B', bg: 'rgba(245,158,11,0.14)',  border: 'rgba(245,158,11,0.3)' },
};
const TYPE_CFG = {
  Online:    { color: '#4ADE80', bg: 'rgba(34,197,94,0.15)',  icon: '📱' },
  'Walk-in': { color: '#67E8F9', bg: 'rgba(6,182,212,0.15)',  icon: '🚶' },
  Emergency: { color: '#F87171', bg: 'rgba(239,68,68,0.15)',  icon: '⚡' },
};

function QueueCard({ patient, onCall, onDone, onSkip, isEmergency }: {
  patient: Patient; onCall: () => void; onDone: () => void; onSkip: () => void; isEmergency?: boolean;
}) {
  const sc = STATUS_CFG[patient.status];
  const tc = TYPE_CFG[patient.type];
  const isCurrent = patient.status === 'consulting';
  const isPast = patient.status === 'done' || patient.status === 'skipped';
  const isNext = patient.status === 'next';

  return (
    <View style={[
      styles.qCard,
      isCurrent && styles.qCardCurrent,
      isEmergency && styles.qCardEmergency,
      isPast && { opacity: 0.6 },
    ]}>
      <View style={styles.qCardTop}>
        {/* Token */}
        <View style={[styles.tokenBox, isCurrent && styles.tokenBoxCurrent, isEmergency && styles.tokenBoxEmergency]}>
          <Text style={styles.tokenText}>{patient.token}</Text>
          {isCurrent && <Text style={{ fontSize: 10, color: TEAL_LT }}>●</Text>}
        </View>
        {/* Info */}
        <View style={{ flex: 1, minWidth: 0 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 3 }}>
            <Text style={[styles.patName, isPast && { color: 'rgba(255,255,255,0.45)' }]} numberOfLines={1}>
              {patient.name}
            </Text>
            <Text style={styles.patAge}>{patient.age}{patient.gender}</Text>
          </View>
          <View style={{ flexDirection: 'row', gap: 5, flexWrap: 'wrap' }}>
            <View style={[styles.typeBadge, { backgroundColor: tc.bg }]}>
              <Text style={{ fontSize: 9, color: tc.color, fontWeight: '800' }}>{tc.icon} {patient.type}</Text>
            </View>
            <View style={[styles.visitBadge, { backgroundColor: patient.visitType === 'First Visit' ? 'rgba(99,102,241,0.15)' : 'rgba(16,185,129,0.15)' }]}>
              <Text style={{ fontSize: 9, fontWeight: '700', color: patient.visitType === 'First Visit' ? '#A5B4FC' : '#6EE7B7' }}>
                {patient.visitType}
              </Text>
            </View>
          </View>
          <View style={{ flexDirection: 'row', gap: 10, marginTop: 5 }}>
            <Text style={styles.patDetail}>📞 {patient.phone}</Text>
            <Text style={styles.patDetail}>📍 {patient.addr}</Text>
          </View>
        </View>
        {/* Status badge */}
        {!isCurrent && (
          <View style={{ flexShrink: 0 }}>
            {(patient.type === 'Emergency' || patient.status === 'skipped') ? (
              <TouchableOpacity onPress={onCall} style={styles.sendNextBtn}>
                <Text style={styles.sendNextBtnText}>▶ Send Next</Text>
              </TouchableOpacity>
            ) : (
              <View style={[styles.statusBadge, { backgroundColor: sc.bg, borderColor: sc.border }]}>
                <Text style={[styles.statusBadgeText, { color: sc.color }]}>{sc.label}</Text>
              </View>
            )}
          </View>
        )}
      </View>

      {/* Alert for skipped */}
      {patient.status === 'skipped' && (
        <View style={{ paddingHorizontal: 13, paddingBottom: 11 }}>
          <TouchableOpacity onPress={onCall} style={styles.alertBtn}>
            <Text style={styles.alertBtnText}>✓ Send Alert</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Action buttons */}
      {!isPast && (
        <View style={styles.qActions}>
          {isCurrent ? (
            <>
              <TouchableOpacity onPress={onSkip} style={styles.notShownBtn}>
                <Text style={styles.notShownBtnText}>✗ Not Shown</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={onDone} style={styles.doneBtn}>
                <Text style={styles.doneBtnText}>✓ Done</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <TouchableOpacity onPress={onCall} style={styles.alertBtn2}>
                <Text style={styles.alertBtn2Text}>✓ Send Alert</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={onSkip} style={styles.notShownBtn}>
                <Text style={styles.notShownBtnText}>✗ Not Shown</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      )}
    </View>
  );
}

export default function QueueScreen() {
  const [tab, setTab] = useState<'queue' | 'emergency' | 'notshown' | 'done'>('queue');
  const [queue, setQueue] = useState<Patient[]>(INIT_QUEUE);
  const [emerg, setEmerg] = useState<Patient[]>(INIT_EMERGENCY);
  const [paused, setPaused] = useState(false);

  type QTab = 'queue' | 'emergency' | 'notshown' | 'done';
  type PatientSetter = React.Dispatch<React.SetStateAction<Patient[]>>;
  const updateStatus = (list: Patient[], setter: PatientSetter, id: string, status: QStatus) => {
    setter(list.map((p: Patient) => p.id === id ? { ...p, status } : p));
  };

  const callNext = () => {
    const nextIdx = queue.findIndex(p => p.status === 'next');
    if (nextIdx === -1) return;
    setQueue(prev => prev.map((p, i) => {
      if (p.status === 'consulting') return { ...p, status: 'done' as QStatus };
      if (i === nextIdx) return { ...p, status: 'consulting' as QStatus };
      if (i === nextIdx + 1 && p.status === 'waiting') return { ...p, status: 'next' as QStatus };
      return p;
    }));
  };

  const current = queue.find(p => p.status === 'consulting');
  const waiting = queue.filter(p => p.status === 'waiting' || p.status === 'next');
  const done = queue.filter(p => p.status === 'done').length;
  const skipped = queue.filter(p => p.status === 'skipped').length;
  const emergCount = emerg.filter(p => p.status === 'waiting').length;

  const visibleQueue = tab === 'queue' ? queue.filter(p => p.status !== 'done' && p.status !== 'skipped') :
    tab === 'done' ? queue.filter(p => p.status === 'done' || p.status === 'skipped') :
    tab === 'notshown' ? queue.filter(p => p.status === 'skipped') : [];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.container}>
        <View style={styles.glowTeal} />
        <View style={styles.glowRed} />

        {/* Header */}
        <View style={styles.header}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <View style={styles.liveDot} />
            <Text style={styles.headerTitle}>Master Queue</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Text style={{ fontSize: 13, color: TEAL_LT }}>⚕ Dr. Sharma</Text>
          </View>
        </View>

        {/* Currently Consulting Card */}
        {current && (
          <View style={styles.consultingCard}>
            <View style={styles.glowBlob} />
            <View style={styles.consultingTop}>
              <View style={styles.liveBadge}>
                <Text style={styles.liveDot2}>●</Text>
                <Text style={styles.liveBadgeText}>CURRENTLY CONSULTING</Text>
              </View>
              <View style={styles.timeBadge}>
                <Text style={styles.timeBadgeText}>⏱ 12 min</Text>
              </View>
            </View>
            <View style={styles.consultingHero}>
              <View style={styles.bigTokenBox}>
                <Text style={styles.bigTokenLabel}>Token</Text>
                <Text style={styles.bigTokenText}>{current.token}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.consultingName}>{current.name}</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 5 }}>
                  <View style={styles.ageBadge}><Text style={styles.ageBadgeText}>{current.age} yrs · {current.gender === 'M' ? 'Male' : 'Female'}</Text></View>
                  <View style={[styles.typeBadge2, { backgroundColor: TYPE_CFG[current.type].bg }]}>
                    <Text style={{ fontSize: 10, fontWeight: '800', color: TYPE_CFG[current.type].color }}>{current.type}</Text>
                  </View>
                  <View style={[styles.visitBadge2, { backgroundColor: current.visitType === 'First Visit' ? 'rgba(99,102,241,0.2)' : 'rgba(16,185,129,0.2)' }]}>
                    <Text style={{ fontSize: 10, fontWeight: '700', color: current.visitType === 'First Visit' ? '#A5B4FC' : '#6EE7B7' }}>{current.visitType}</Text>
                  </View>
                </View>
              </View>
            </View>
            {/* Details grid */}
            <View style={styles.detailsGrid}>
              <View style={styles.detailCell}>
                <Text style={styles.detailIcon}>📞</Text>
                <View>
                  <Text style={styles.detailFieldLabel}>PHONE</Text>
                  <Text style={styles.detailFieldValue}>{current.phone}</Text>
                </View>
              </View>
              <View style={styles.detailCell}>
                <Text style={styles.detailIcon}>📍</Text>
                <View>
                  <Text style={styles.detailFieldLabel}>ADDRESS</Text>
                  <Text style={styles.detailFieldValue}>{current.addr}</Text>
                </View>
              </View>
            </View>
            {/* Action buttons */}
            <View style={styles.consultingActions}>
              <TouchableOpacity
                onPress={() => callNext()}
                style={styles.callNextBtn}
              >
                <Text style={styles.callNextBtnText}>▶ Call Next</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => updateStatus(queue, setQueue, current.id, 'skipped')}
                style={styles.notShownBtn2}
              >
                <Text style={styles.notShownBtnText2}>✗ Not Shown</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => updateStatus(queue, setQueue, current.id, 'done')}
                style={styles.doneBtn2}
              >
                <Text style={styles.doneBtnText2}>✓ Done</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Stats row */}
        <View style={styles.statsRow}>
          {[
            { label: 'Waiting', value: waiting.length, color: '#A5B4FC' },
            { label: 'Done', value: done, color: '#4ADE80' },
            { label: 'Skipped', value: skipped, color: '#F59E0B' },
            { label: 'Emergency', value: emergCount, color: '#F87171' },
          ].map(s => (
            <View key={s.label} style={styles.statCard}>
              <Text style={[styles.statNum, { color: s.color }]}>{s.value}</Text>
              <Text style={styles.statName}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Tab bar */}
        <View style={styles.tabBar}>
          {([
            { key: 'queue', label: 'Queue' },
            { key: 'emergency', label: `Emergency (${emergCount})` },
            { key: 'done', label: 'Done' },
          ] as { key: QTab; label: string }[]).map(t => (
            <TouchableOpacity
              key={t.key}
              onPress={() => setTab(t.key)}
              style={[styles.tabItem, tab === t.key && styles.tabItemActive]}
            >
              <Text style={[styles.tabText, tab === t.key && styles.tabTextActive]}>{t.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
          {tab === 'emergency' && emerg.map(p => (
            <QueueCard
              key={p.id}
              patient={p}
              isEmergency
              onCall={() => updateStatus(emerg, setEmerg, p.id, 'consulting')}
              onDone={() => updateStatus(emerg, setEmerg, p.id, 'done')}
              onSkip={() => updateStatus(emerg, setEmerg, p.id, 'skipped')}
            />
          ))}
          {tab !== 'emergency' && visibleQueue.map(p => (
            <QueueCard
              key={p.id}
              patient={p}
              onCall={() => updateStatus(queue, setQueue, p.id, p.status === 'next' ? 'consulting' : 'next')}
              onDone={() => updateStatus(queue, setQueue, p.id, 'done')}
              onSkip={() => updateStatus(queue, setQueue, p.id, 'skipped')}
            />
          ))}

          {/* Quick action shortcuts */}
          <View style={{ flexDirection: 'row', gap: 10, marginTop: 4 }}>
            <TouchableOpacity style={[styles.addWalkinBtn, { flex: 1 }]} onPress={() => router.push('/walkin')}>
              <Text style={styles.addWalkinBtnText}>✚ Add Walk-in</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.addWalkinBtn, { flex: 1, backgroundColor: 'rgba(99,102,241,0.15)', borderColor: 'rgba(99,102,241,0.3)' }]}
              onPress={() => router.push('/(tabs)/schedule')}
            >
              <Text style={[styles.addWalkinBtnText, { color: '#A5B4FC' }]}>📅 Schedule</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  container: { flex: 1, backgroundColor: BG },
  glowTeal: { position: 'absolute', top: -60, left: -60, width: 240, height: 240, borderRadius: 120, backgroundColor: 'rgba(13,148,136,0.2)', opacity: 0.5 },
  glowRed: { position: 'absolute', top: 300, right: -80, width: 200, height: 200, borderRadius: 100, backgroundColor: 'rgba(239,68,68,0.1)', opacity: 0.5 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, paddingBottom: 10 },
  headerTitle: { fontSize: 12, fontWeight: '800', color: '#FFF' },
  liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#4ADE80' },
  consultingCard: {
    margin: 16, marginBottom: 10, borderRadius: 22, padding: 16,
    backgroundColor: 'rgba(13,148,136,0.18)',
    borderWidth: 1.5, borderColor: 'rgba(45,212,191,0.38)',
    position: 'relative', overflow: 'hidden',
  },
  glowBlob: { position: 'absolute', top: -30, right: -30, width: 140, height: 140, borderRadius: 70, backgroundColor: 'rgba(45,212,191,0.2)', opacity: 0.4 },
  consultingTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  liveBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20, backgroundColor: 'rgba(74,222,128,0.12)', borderWidth: 1, borderColor: 'rgba(74,222,128,0.3)' },
  liveDot2: { fontSize: 6, color: '#4ADE80' },
  liveBadgeText: { fontSize: 9, fontWeight: '800', color: '#4ADE80', letterSpacing: 1 },
  timeBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 9, paddingVertical: 3, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.07)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  timeBadgeText: { fontSize: 9, fontWeight: '700', color: 'rgba(255,255,255,0.45)' },
  consultingHero: { flexDirection: 'row', gap: 14, marginBottom: 14 },
  bigTokenBox: {
    width: 64, height: 64, borderRadius: 18, alignItems: 'center', justifyContent: 'center', flexShrink: 0,
    backgroundColor: TEAL,
  },
  bigTokenLabel: { fontSize: 9, fontWeight: '700', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: 0.6 },
  bigTokenText: { fontSize: 28, fontWeight: '900', color: '#FFF', letterSpacing: -1.5 },
  consultingName: { fontSize: 20, fontWeight: '900', color: '#FFF', letterSpacing: -0.5, marginBottom: 5 },
  ageBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.08)' },
  ageBadgeText: { fontSize: 10, fontWeight: '700', color: 'rgba(255,255,255,0.5)' },
  typeBadge2: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  visitBadge2: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  detailsGrid: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  detailCell: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 7, padding: 8, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  detailIcon: { fontSize: 18 },
  detailFieldLabel: { fontSize: 8, fontWeight: '700', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: 0.6 },
  detailFieldValue: { fontSize: 10, fontWeight: '700', color: 'rgba(255,255,255,0.85)' },
  consultingActions: { flexDirection: 'row', gap: 8 },
  callNextBtn: { flex: 1, height: 38, borderRadius: 11, backgroundColor: TEAL, alignItems: 'center', justifyContent: 'center' },
  callNextBtnText: { fontSize: 11, fontWeight: '800', color: '#FFF' },
  notShownBtn2: { flex: 1, height: 38, borderRadius: 11, backgroundColor: 'rgba(245,158,11,0.18)', borderWidth: 1.5, borderColor: 'rgba(245,158,11,0.4)', alignItems: 'center', justifyContent: 'center' },
  notShownBtnText2: { fontSize: 11, fontWeight: '800', color: '#FCD34D' },
  doneBtn2: { flex: 1, height: 38, borderRadius: 11, backgroundColor: '#16A34A', alignItems: 'center', justifyContent: 'center' },
  doneBtnText2: { fontSize: 11, fontWeight: '800', color: '#FFF' },
  statsRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, marginBottom: 10 },
  statCard: { flex: 1, padding: 8, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)', alignItems: 'center' },
  statNum: { fontSize: 20, fontWeight: '900', lineHeight: 24 },
  statName: { fontSize: 9, fontWeight: '700', color: 'rgba(255,255,255,0.32)', textTransform: 'uppercase', marginTop: 2 },
  tabBar: { flexDirection: 'row', marginHorizontal: 16, marginBottom: 8, gap: 6 },
  tabItem: { flex: 1, height: 34, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)', alignItems: 'center', justifyContent: 'center' },
  tabItemActive: { backgroundColor: `${TEAL}33`, borderColor: `${TEAL}88` },
  tabText: { fontSize: 10, fontWeight: '700', color: 'rgba(255,255,255,0.4)' },
  tabTextActive: { color: TEAL_LT },
  qCard: {
    borderRadius: 20, marginBottom: 8, overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.07)',
  },
  qCardCurrent: { backgroundColor: 'rgba(13,148,136,0.18)', borderColor: 'rgba(45,212,191,0.4)' },
  qCardEmergency: { backgroundColor: 'rgba(239,68,68,0.1)', borderColor: 'rgba(239,68,68,0.3)' },
  qCardTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, padding: 11 },
  tokenBox: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center', flexShrink: 0, backgroundColor: 'rgba(255,255,255,0.07)', borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.1)' },
  tokenBoxCurrent: { backgroundColor: TEAL },
  tokenBoxEmergency: { backgroundColor: 'rgba(239,68,68,0.25)', borderColor: 'rgba(239,68,68,0.4)' },
  tokenText: { fontSize: 14, fontWeight: '900', color: '#FFF', letterSpacing: -0.5 },
  patName: { fontSize: 13, fontWeight: '800', color: '#FFF' },
  patAge: { fontSize: 9, color: 'rgba(255,255,255,0.3)' },
  typeBadge: { flexDirection: 'row', alignItems: 'center', gap: 3, paddingHorizontal: 7, paddingVertical: 2, borderRadius: 20 },
  visitBadge: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 20 },
  patDetail: { fontSize: 10, color: 'rgba(255,255,255,0.38)', fontWeight: '500' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, borderWidth: 1 },
  statusBadgeText: { fontSize: 9, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5 },
  sendNextBtn: { height: 30, paddingHorizontal: 10, borderRadius: 10, backgroundColor: TEAL, alignItems: 'center', justifyContent: 'center' },
  sendNextBtnText: { fontSize: 10, fontWeight: '800', color: '#FFF' },
  alertBtn: { height: 36, borderRadius: 11, backgroundColor: 'rgba(99,102,241,0.2)', borderWidth: 1.5, borderColor: 'rgba(99,102,241,0.4)', alignItems: 'center', justifyContent: 'center' },
  alertBtnText: { fontSize: 11, fontWeight: '800', color: '#A5B4FC' },
  alertBtn2: { flex: 1, height: 38, borderRadius: 11, backgroundColor: 'rgba(99,102,241,0.2)', borderWidth: 1.5, borderColor: 'rgba(99,102,241,0.4)', alignItems: 'center', justifyContent: 'center' },
  alertBtn2Text: { fontSize: 10, fontWeight: '800', color: '#A5B4FC' },
  notShownBtn: { flex: 1, height: 38, borderRadius: 11, backgroundColor: 'rgba(245,158,11,0.18)', borderWidth: 1.5, borderColor: 'rgba(245,158,11,0.4)', alignItems: 'center', justifyContent: 'center' },
  notShownBtnText: { fontSize: 11, fontWeight: '800', color: '#FCD34D' },
  doneBtn: { flex: 1, height: 38, borderRadius: 11, backgroundColor: '#16A34A', alignItems: 'center', justifyContent: 'center' },
  doneBtnText: { fontSize: 11, fontWeight: '800', color: '#FFF' },
  qActions: { flexDirection: 'row', gap: 6, paddingHorizontal: 13, paddingBottom: 11 },
  addWalkinBtn: {
    height: 52, borderRadius: 16, backgroundColor: TEAL, alignItems: 'center', justifyContent: 'center', marginTop: 8,
  },
  addWalkinBtnText: { fontSize: 14, fontWeight: '900', color: '#FFF' },
});
