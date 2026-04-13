import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';

const isWeb = Platform.OS === 'web';

const BG      = '#0A0E1A';
const INDIGO  = '#4F46E5';
const CYAN    = '#06B6D4';
const SUCCESS = '#22C55E';
const WARN    = '#F59E0B';
const ERROR   = '#EF4444';
const PURPLE  = '#8B5CF6';

interface Notif {
  id: string;
  type: 'token_booked' | 'token_cancelled' | 'system' | 'payment' | 'reminder' | 'promo';
  title: string;
  body: string;
  time: string;
  read: boolean;
}

const INITIAL_NOTIFS: Notif[] = [
  {
    id: '1',
    type: 'token_booked',
    title: 'New E-Token Booked',
    body: 'Rahul Sharma booked Token #52 for today at your Cardiology OPD.',
    time: '2 min ago',
    read: false,
  },
  {
    id: '2',
    type: 'token_booked',
    title: 'New E-Token Booked',
    body: 'Priya Nair booked Token #53 for today — Cardiology OPD.',
    time: '8 min ago',
    read: false,
  },
  {
    id: '3',
    type: 'token_cancelled',
    title: 'Token Cancelled',
    body: 'Amit Verma (Token #49) cancelled their appointment for today.',
    time: '22 min ago',
    read: false,
  },
  {
    id: '4',
    type: 'payment',
    title: 'Payment Received',
    body: 'Platform fee of ₹20 collected for Token #48 (Sunita Patel). Earnings updated.',
    time: '1 hr ago',
    read: true,
  },
  {
    id: '5',
    type: 'reminder',
    title: 'Shift Starting Soon',
    body: 'Your Morning Shift starts in 30 minutes at HeartCare Clinic, Andheri.',
    time: '2 hr ago',
    read: true,
  },
  {
    id: '6',
    type: 'system',
    title: 'LINESETU Update',
    body: 'Queue analytics are now live! View detailed patient insights on your Dashboard.',
    time: 'Yesterday',
    read: true,
  },
  {
    id: '7',
    type: 'token_booked',
    title: 'New E-Token Booked',
    body: 'Deepak Kumar booked Token #47 for yesterday — Cardiology OPD.',
    time: 'Yesterday',
    read: true,
  },
  {
    id: '8',
    type: 'payment',
    title: 'Weekly Earnings Summary',
    body: 'You earned ₹5,300 this week across 184 consultations. Tap to view breakdown.',
    time: '2 days ago',
    read: true,
  },
  {
    id: '9',
    type: 'promo',
    title: 'Feature Spotlight',
    body: 'Walk-in patients can now be added directly from your dashboard with one tap.',
    time: '3 days ago',
    read: true,
  },
  {
    id: '10',
    type: 'system',
    title: 'Profile Verified ✓',
    body: 'Your doctor profile has been verified by LINESETU. Patients can now find and book you.',
    time: '5 days ago',
    read: true,
  },
];

function typeConfig(type: Notif['type']) {
  switch (type) {
    case 'token_booked':   return { icon: 'calendar' as const, color: INDIGO,  bg: 'rgba(79,70,229,0.15)',  label: 'Booking' };
    case 'token_cancelled':return { icon: 'x-circle' as const, color: ERROR,   bg: 'rgba(239,68,68,0.12)',  label: 'Cancelled' };
    case 'payment':        return { icon: 'dollar-sign' as const, color: SUCCESS, bg: 'rgba(34,197,94,0.12)', label: 'Payment' };
    case 'reminder':       return { icon: 'clock' as const,    color: WARN,    bg: 'rgba(245,158,11,0.12)', label: 'Reminder' };
    case 'system':         return { icon: 'info' as const,     color: CYAN,    bg: 'rgba(6,182,212,0.12)',  label: 'System' };
    case 'promo':          return { icon: 'zap' as const,      color: PURPLE,  bg: 'rgba(139,92,246,0.12)', label: 'Update' };
  }
}

export default function NotificationsScreen() {
  const [notifs, setNotifs] = useState<Notif[]>(INITIAL_NOTIFS);

  const unreadCount = notifs.filter(n => !n.read).length;

  const markAllRead = () => setNotifs(prev => prev.map(n => ({ ...n, read: true })));
  const markRead = (id: string) => setNotifs(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));

  const topPad = isWeb ? 44 : 0;

  return (
    <SafeAreaView style={[styles.container, isWeb && { paddingTop: topPad }]} edges={['top']}>
      <View style={styles.orb1} />
      <View style={styles.orb2} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Feather name="chevron-left" size={20} color="rgba(255,255,255,0.9)" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Notifications</Text>
          {unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadBadgeTxt}>{unreadCount} new</Text>
            </View>
          )}
        </View>
        {unreadCount > 0 ? (
          <TouchableOpacity style={styles.markAllBtn} onPress={markAllRead}>
            <Text style={styles.markAllTxt}>Mark all read</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ width: 80 }} />
        )}
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      >
        {notifs.length === 0 ? (
          <View style={styles.emptyWrap}>
            <View style={styles.emptyIcon}>
              <Feather name="bell-off" size={30} color="rgba(255,255,255,0.2)" />
            </View>
            <Text style={styles.emptyTitle}>All caught up!</Text>
            <Text style={styles.emptySub}>No notifications yet.</Text>
          </View>
        ) : (
          notifs.map((n, i) => {
            const cfg = typeConfig(n.type);
            return (
              <TouchableOpacity
                key={n.id}
                activeOpacity={0.82}
                style={[styles.card, !n.read && styles.cardUnread]}
                onPress={() => markRead(n.id)}
              >
                {/* Unread indicator */}
                {!n.read && <View style={styles.unreadDot} />}

                <View style={[styles.iconWrap, { backgroundColor: cfg.bg }]}>
                  <Feather name={cfg.icon} size={18} color={cfg.color} />
                </View>

                <View style={styles.cardBody}>
                  <View style={styles.cardTop}>
                    <Text style={styles.cardTitle} numberOfLines={1}>{n.title}</Text>
                    <Text style={styles.cardTime}>{n.time}</Text>
                  </View>
                  <Text style={styles.cardMsg} numberOfLines={2}>{n.body}</Text>
                  <View style={[styles.typePill, { backgroundColor: cfg.bg }]}>
                    <Text style={[styles.typePillTxt, { color: cfg.color }]}>{cfg.label}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })
        )}
        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  orb1: { position: 'absolute', top: -40, left: -40, width: 200, height: 200, borderRadius: 100, backgroundColor: 'rgba(79,70,229,0.15)' },
  orb2: { position: 'absolute', top: 300, right: -60, width: 160, height: 160, borderRadius: 80, backgroundColor: 'rgba(6,182,212,0.1)' },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.07)',
  },
  backBtn: {
    width: 38, height: 38, borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.09)',
    alignItems: 'center', justifyContent: 'center',
  },
  headerCenter: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerTitle: { fontSize: 17, fontWeight: '800', color: '#FFF', letterSpacing: -0.3 },
  unreadBadge: { backgroundColor: ERROR, borderRadius: 10, paddingHorizontal: 7, paddingVertical: 2 },
  unreadBadgeTxt: { fontSize: 10, fontWeight: '700', color: '#FFF' },
  markAllBtn: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10, backgroundColor: 'rgba(79,70,229,0.12)', borderWidth: 1, borderColor: 'rgba(79,70,229,0.3)' },
  markAllTxt: { fontSize: 11, fontWeight: '700', color: '#818CF8' },

  list: { paddingHorizontal: 16, paddingTop: 14 },

  card: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 12,
    backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)', borderRadius: 18,
    padding: 14, marginBottom: 10, position: 'relative',
  },
  cardUnread: {
    backgroundColor: 'rgba(79,70,229,0.07)',
    borderColor: 'rgba(79,70,229,0.2)',
  },
  unreadDot: {
    position: 'absolute', top: 14, right: 14,
    width: 8, height: 8, borderRadius: 4, backgroundColor: INDIGO,
  },
  iconWrap: {
    width: 44, height: 44, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  cardBody: { flex: 1 },
  cardTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  cardTitle: { fontSize: 13, fontWeight: '800', color: '#FFF', flex: 1, marginRight: 8 },
  cardTime: { fontSize: 10, fontWeight: '500', color: 'rgba(255,255,255,0.3)' },
  cardMsg: { fontSize: 12, color: 'rgba(255,255,255,0.6)', lineHeight: 18, marginBottom: 8 },
  typePill: { alignSelf: 'flex-start', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  typePillTxt: { fontSize: 10, fontWeight: '700' },

  emptyWrap: { alignItems: 'center', paddingTop: 80, gap: 12 },
  emptyIcon: { width: 72, height: 72, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.05)', alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  emptyTitle: { fontSize: 17, fontWeight: '700', color: 'rgba(255,255,255,0.45)' },
  emptySub: { fontSize: 13, color: 'rgba(255,255,255,0.25)' },
});
