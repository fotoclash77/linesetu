import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Platform, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useDoctor } from '../contexts/DoctorContext';

const isWeb = Platform.OS === 'web';
const BASE  = () => `https://${process.env.EXPO_PUBLIC_DOMAIN}`;

const BG      = '#0A0E1A';
const TEAL    = '#0D9488';
const TEAL_LT = '#2DD4BF';
const CYAN    = '#06B6D4';
const SUCCESS = '#22C55E';
const WARN    = '#F59E0B';
const ERROR   = '#EF4444';
const INDIGO  = '#818CF8';

type NotifType = 'token_booked' | 'token_cancelled' | 'system' | 'payment' | 'reminder' | 'promo';

interface Notif {
  id: string;
  type: NotifType;
  title: string;
  body: string;
  createdAt: number;
  read: boolean;
}

function typeCfg(type: NotifType) {
  switch (type) {
    case 'token_booked':    return { icon: 'calendar'    as const, color: TEAL_LT, bg: 'rgba(45,212,191,0.12)',  border: 'rgba(45,212,191,0.25)', label: '📅 Booking'   };
    case 'token_cancelled': return { icon: 'x-circle'    as const, color: ERROR,   bg: 'rgba(239,68,68,0.12)',   border: 'rgba(239,68,68,0.25)',  label: '✗ Skipped'    };
    case 'payment':         return { icon: 'dollar-sign' as const, color: SUCCESS,  bg: 'rgba(34,197,94,0.12)',   border: 'rgba(34,197,94,0.25)',  label: '↗ Payment'   };
    case 'reminder':        return { icon: 'clock'       as const, color: WARN,    bg: 'rgba(245,158,11,0.12)',  border: 'rgba(245,158,11,0.25)', label: '⏰ Reminder'   };
    case 'system':          return { icon: 'info'        as const, color: CYAN,    bg: 'rgba(6,182,212,0.12)',   border: 'rgba(6,182,212,0.25)',  label: 'ℹ System'    };
    case 'promo':           return { icon: 'zap'         as const, color: INDIGO,  bg: 'rgba(129,140,248,0.12)', border: 'rgba(129,140,248,0.25)',label: '⚡ Update'    };
    default:                return { icon: 'bell'        as const, color: TEAL_LT, bg: 'rgba(45,212,191,0.12)',  border: 'rgba(45,212,191,0.25)', label: '🔔 Notice'    };
  }
}

function relativeTime(ts: number): string {
  const diff = Date.now() - ts;
  const m = Math.floor(diff / 60000);
  const h = Math.floor(diff / 3600000);
  const d = Math.floor(diff / 86400000);
  if (m < 1)  return 'Just now';
  if (m < 60) return `${m} min ago`;
  if (h < 24) return `${h} hr ago`;
  if (d === 1) return 'Yesterday';
  return `${d} days ago`;
}

function groupLabel(ts: number): 'today' | 'yesterday' | 'earlier' {
  const now  = new Date();
  const date = new Date(ts);
  const diffDays = Math.floor((now.getTime() - date.getTime()) / 86400000);
  if (diffDays < 1)  return 'today';
  if (diffDays < 2)  return 'yesterday';
  return 'earlier';
}

const GROUP_LABELS = {
  today:     '📅 Today',
  yesterday: '🗓 Yesterday',
  earlier:   '🕐 Earlier',
} as const;

const POLL_MS = 30_000;

export default function NotificationsScreen() {
  const { doctor } = useDoctor();
  const [notifs, setNotifs]     = useState<Notif[]>([]);
  const [loading, setLoading]   = useState(true);
  const [marking, setMarking]   = useState(false);

  const fetchNotifs = useCallback(async () => {
    if (!doctor?.id) return;
    try {
      const res  = await fetch(`${BASE()}/api/notifications/${doctor.id}`);
      const data = await res.json();
      if (data.notifications) {
        setNotifs(data.notifications as Notif[]);
      }
    } catch (_) {}
    setLoading(false);
  }, [doctor?.id]);

  useEffect(() => {
    fetchNotifs();
    const interval = setInterval(fetchNotifs, POLL_MS);
    return () => clearInterval(interval);
  }, [fetchNotifs]);

  const markRead = async (id: string) => {
    setNotifs(p => p.map(n => n.id === id ? { ...n, read: true } : n));
    try {
      await fetch(`${BASE()}/api/notifications/${id}/read`, { method: 'PATCH' });
    } catch (_) {}
  };

  const markAllRead = async () => {
    if (!doctor?.id || marking) return;
    setMarking(true);
    setNotifs(p => p.map(n => ({ ...n, read: true })));
    try {
      await fetch(`${BASE()}/api/notifications/read-all`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ doctorId: doctor.id }),
      });
    } catch (_) {}
    setMarking(false);
  };

  const unreadCount = notifs.filter(n => !n.read).length;

  const groups: Array<'today' | 'yesterday' | 'earlier'> = ['today', 'yesterday', 'earlier'];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.glowTop} />
      <View style={styles.glowRight} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.8}>
          <Feather name="chevron-left" size={20} color="rgba(255,255,255,0.9)" />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerSub}>LINESETU</Text>
          <Text style={styles.headerTitle}>Notifications</Text>
        </View>
        <TouchableOpacity
          style={[styles.markAllBtn, (unreadCount === 0 || marking) && { opacity: 0.35 }]}
          onPress={markAllRead}
          disabled={unreadCount === 0 || marking}
          activeOpacity={0.8}
        >
          <Feather name="check-circle" size={13} color={TEAL_LT} />
          <Text style={styles.markAllTxt}>All read</Text>
        </TouchableOpacity>
      </View>

      {/* Unread summary pill */}
      {unreadCount > 0 && (
        <View style={styles.summaryCard}>
          <View style={styles.summaryLeft}>
            <View style={styles.summaryDot} />
            <Text style={styles.summaryTxt}>{unreadCount} unread notification{unreadCount > 1 ? 's' : ''}</Text>
          </View>
          <Text style={styles.summaryHint}>Tap to dismiss</Text>
        </View>
      )}

      {loading ? (
        <View style={styles.loadWrap}>
          <ActivityIndicator size="small" color={TEAL_LT} />
          <Text style={styles.loadTxt}>Loading notifications…</Text>
        </View>
      ) : notifs.length === 0 ? (
        <View style={styles.emptyWrap}>
          <View style={styles.emptyIconWrap}>
            <Text style={{ fontSize: 28 }}>🔔</Text>
          </View>
          <Text style={styles.emptyTitle}>All caught up!</Text>
          <Text style={styles.emptySub}>No notifications yet. They'll appear here when patients book tokens.</Text>
        </View>
      ) : (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={[styles.list, { paddingBottom: isWeb ? 34 : 20 }]}
          showsVerticalScrollIndicator={false}
        >
          {groups.map(group => {
            const items = notifs.filter(n => groupLabel(n.createdAt) === group);
            if (items.length === 0) return null;
            return (
              <View key={group}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionLabel}>{GROUP_LABELS[group]}</Text>
                </View>
                {items.map(n => {
                  const cfg = typeCfg(n.type);
                  return (
                    <TouchableOpacity
                      key={n.id}
                      activeOpacity={0.82}
                      style={[styles.card, !n.read && styles.cardUnread]}
                      onPress={() => markRead(n.id)}
                    >
                      {!n.read && <View style={styles.unreadBar} />}

                      <View style={[styles.iconWrap, { backgroundColor: cfg.bg, borderColor: cfg.border }]}>
                        <Feather name={cfg.icon} size={17} color={cfg.color} />
                      </View>

                      <View style={styles.cardBody}>
                        <View style={styles.cardRow}>
                          <Text style={[styles.cardTitle, !n.read && styles.cardTitleUnread]} numberOfLines={1}>
                            {n.title}
                          </Text>
                          {!n.read && <View style={styles.unreadDot} />}
                        </View>
                        <Text style={styles.cardMsg} numberOfLines={2}>{n.body}</Text>
                        <View style={styles.cardFooter}>
                          <View style={[styles.typePill, { backgroundColor: cfg.bg }]}>
                            <Text style={[styles.typePillTxt, { color: cfg.color }]}>{cfg.label}</Text>
                          </View>
                          <Text style={styles.cardTime}>{relativeTime(n.createdAt)}</Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            );
          })}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG, ...(isWeb && { paddingTop: 44 }) },

  glowTop: {
    position: 'absolute', top: -60, left: -50, width: 240, height: 240, borderRadius: 120,
    backgroundColor: 'rgba(13,148,136,0.2)', opacity: 0.55,
  },
  glowRight: {
    position: 'absolute', top: 320, right: -70, width: 200, height: 200, borderRadius: 100,
    backgroundColor: 'rgba(6,182,212,0.12)', opacity: 0.5,
  },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 18, paddingTop: 16, paddingBottom: 14,
  },
  backBtn: {
    width: 38, height: 38, borderRadius: 13,
    backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center', justifyContent: 'center',
  },
  headerSub:   { fontSize: 10, fontWeight: '600', color: TEAL_LT, letterSpacing: 0.5, marginBottom: 1 },
  headerTitle: { fontSize: 19, fontWeight: '900', color: '#FFF', letterSpacing: -0.4 },
  markAllBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 11, paddingVertical: 7, borderRadius: 12,
    backgroundColor: 'rgba(45,212,191,0.08)', borderWidth: 1, borderColor: 'rgba(45,212,191,0.22)',
  },
  markAllTxt: { fontSize: 11, fontWeight: '700', color: TEAL_LT },

  summaryCard: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginHorizontal: 18, marginBottom: 14, padding: 12, borderRadius: 16,
    backgroundColor: 'rgba(13,148,136,0.15)', borderWidth: 1.5, borderColor: 'rgba(45,212,191,0.28)',
  },
  summaryLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  summaryDot:  { width: 8, height: 8, borderRadius: 4, backgroundColor: TEAL_LT },
  summaryTxt:  { fontSize: 12, fontWeight: '700', color: TEAL_LT },
  summaryHint: { fontSize: 10, fontWeight: '600', color: 'rgba(45,212,191,0.5)' },

  loadWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  loadTxt:  { fontSize: 12, fontWeight: '600', color: 'rgba(255,255,255,0.35)' },

  list: { paddingHorizontal: 16, paddingTop: 2 },

  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, marginTop: 4 },
  sectionLabel:  { fontSize: 11, fontWeight: '800', color: 'rgba(255,255,255,0.4)', letterSpacing: 0.3 },

  card: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 11,
    backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)', borderRadius: 18,
    padding: 13, marginBottom: 9, overflow: 'hidden',
  },
  cardUnread: {
    backgroundColor: 'rgba(13,148,136,0.07)',
    borderColor: 'rgba(45,212,191,0.22)',
  },
  unreadBar: {
    position: 'absolute', left: 0, top: 0, bottom: 0,
    width: 3, borderRadius: 3, backgroundColor: TEAL,
  },
  iconWrap: {
    width: 42, height: 42, borderRadius: 13, borderWidth: 1,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  cardBody:         { flex: 1, gap: 3 },
  cardRow:          { flexDirection: 'row', alignItems: 'center', gap: 6 },
  cardTitle:        { fontSize: 13, fontWeight: '700', color: 'rgba(255,255,255,0.7)', flex: 1 },
  cardTitleUnread:  { fontWeight: '800', color: '#FFF' },
  unreadDot:        { width: 7, height: 7, borderRadius: 3.5, backgroundColor: TEAL_LT, flexShrink: 0 },
  cardMsg:          { fontSize: 12, color: 'rgba(255,255,255,0.5)', lineHeight: 17 },
  cardFooter:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 },
  typePill:         { borderRadius: 8, paddingHorizontal: 7, paddingVertical: 2 },
  typePillTxt:      { fontSize: 9, fontWeight: '800', letterSpacing: 0.2 },
  cardTime:         { fontSize: 10, fontWeight: '500', color: 'rgba(255,255,255,0.28)' },

  emptyWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, paddingHorizontal: 40 },
  emptyIconWrap: {
    width: 72, height: 72, borderRadius: 22,
    backgroundColor: 'rgba(45,212,191,0.08)', borderWidth: 1, borderColor: 'rgba(45,212,191,0.18)',
    alignItems: 'center', justifyContent: 'center', marginBottom: 4,
  },
  emptyTitle: { fontSize: 17, fontWeight: '800', color: 'rgba(255,255,255,0.5)', textAlign: 'center' },
  emptySub:   { fontSize: 12, fontWeight: '500', color: 'rgba(255,255,255,0.25)', textAlign: 'center', lineHeight: 18 },
});
