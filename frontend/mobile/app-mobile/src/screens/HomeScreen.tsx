import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from 'react-native';

// ─── Types ────────────────────────────────────────────────────────────────────

type TabKey = 'cultivos' | 'mercado' | 'chat' | 'clima' | 'perfil';

interface TabItem {
  key: TabKey;
  label: string;
  icon: string;
}

interface ActivityItem {
  id: string;
  action: string;
  detail: string;
  time: string;
}

interface StatCardProps {
  value: string;
  label: string;
  accent?: boolean;
}

interface ActivityRowProps {
  item: ActivityItem;
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const TAB_ITEMS: TabItem[] = [
  { key: 'cultivos', label: 'Cultivos', icon: '🌱' },
  { key: 'mercado',  label: 'Mercado',  icon: '🛒' },
  { key: 'chat',     label: 'Chat',     icon: '💬' },
  { key: 'clima',    label: 'Clima',    icon: '🌤' },
  { key: 'perfil',   label: 'Perfil',   icon: '👤' },
];

const RECENT_ACTIVITY: ActivityItem[] = [
  { id: '1', action: 'Riego',    detail: 'Parcela A1', time: 'hace 2h' },
  { id: '2', action: 'Siembra',  detail: 'Tomate',     time: 'ayer'    },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

const StatCard: React.FC<StatCardProps> = ({ value, label, accent = false }) => (
  <View style={[styles.statCard, accent && styles.statCardAccent]}>
    <Text style={[styles.statValue, accent && styles.statValueAccent]}>
      {value}
    </Text>
    <Text style={[styles.statLabel, accent && styles.statLabelAccent]}>
      {label}
    </Text>
  </View>
);

const ActivityRow: React.FC<ActivityRowProps> = ({ item }) => (
  <View style={styles.activityCard}>
    <View style={styles.activityDot} />
    <Text style={styles.activityText}>
      <Text style={styles.activityAction}>{item.action}</Text>
      {' — '}
      <Text style={styles.activityDetail}>{item.detail}</Text>
    </Text>
    <Text style={styles.activityTime}>{item.time}</Text>
  </View>
);

// ─── Main screen ──────────────────────────────────────────────────────────────

const DashboardScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabKey>('cultivos');

  const today = new Date().toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
  const todayFormatted = today.charAt(0).toUpperCase() + today.slice(1);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={colors.bg} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Welcome row ──────────────────────────────────────── */}
        <View style={styles.welcomeRow}>
          <View>
            <Text style={styles.welcomeName}>Hola, Carlos 👋</Text>
            <Text style={styles.welcomeDate}>{todayFormatted}</Text>
          </View>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>CA</Text>
          </View>
        </View>

        {/* ── Weather card ─────────────────────────────────────── */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Clima actual</Text>
          <View style={styles.weatherRow}>
            <Text style={styles.temperature}>22°C</Text>
            <View style={styles.weatherBadge}>
              <Text style={styles.weatherBadgeText}>☀ Soleado</Text>
            </View>
          </View>
        </View>

        {/* ── Crops summary ────────────────────────────────────── */}
        <Text style={styles.sectionTitle}>Resumen cultivos</Text>
        <View style={styles.statsRow}>
          <StatCard value="3" label="Cultivos" />
          <StatCard value="2" label="Tareas hoy" />
          <StatCard value="1" label="Alertas" accent />
        </View>

        {/* ── Recent activity ──────────────────────────────────── */}
        <Text style={styles.sectionTitle}>Actividad reciente</Text>
        {RECENT_ACTIVITY.map((item) => (
          <ActivityRow key={item.id} item={item} />
        ))}
      </ScrollView>

      {/* ── Bottom navigation ────────────────────────────────────── */}
      <View style={styles.tabBar}>
        {TAB_ITEMS.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={styles.tabItem}
            onPress={() => setActiveTab(tab.key)}
            activeOpacity={0.7}
          >
            <Text style={styles.tabIcon}>{tab.icon}</Text>
            <Text
              style={[
                styles.tabLabel,
                activeTab === tab.key && styles.tabLabelActive,
              ]}
            >
              {tab.label}
            </Text>
            {activeTab === tab.key && <View style={styles.tabActiveBar} />}
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
};

export default DashboardScreen;

// ─── Design tokens ────────────────────────────────────────────────────────────

const colors = {
  bg:          '#111614',
  surface:     '#1A1F1D',
  surfaceHigh: '#222826',
  border:      '#2C3330',
  accent:      '#4ADE80',
  accentDim:   '#1A3028',
  alert:       '#F87171',
  alertDim:    '#3B1515',
  textPrimary: '#E8F0EC',
  textSecond:  '#7D9489',
  textMuted:   '#4A5C54',
} as const;

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bg,
  },

  // Header
  header: {
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.4,
  },

  // Scroll
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 16,
  },

  // Welcome
  welcomeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  welcomeName: {
    color: colors.textPrimary,
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  welcomeDate: {
    color: colors.textSecond,
    fontSize: 13,
    marginTop: 2,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.accentDim,
    borderWidth: 1.5,
    borderColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: colors.accent,
    fontSize: 13,
    fontWeight: '700',
  },

  // Card
  card: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 24,
  },
  cardLabel: {
    color: colors.textSecond,
    fontSize: 12,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  weatherRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  temperature: {
    color: colors.textPrimary,
    fontSize: 38,
    fontWeight: '700',
    letterSpacing: -1,
  },
  weatherBadge: {
    backgroundColor: colors.surfaceHigh,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: colors.border,
  },
  weatherBadgeText: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '500',
  },

  // Section title
  sectionTitle: {
    color: colors.textSecond,
    fontSize: 12,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginBottom: 12,
  },

  // Stats
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  statCardAccent: {
    backgroundColor: colors.alertDim,
    borderColor: colors.alert + '55',
  },
  statValue: {
    color: colors.textPrimary,
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  statValueAccent: {
    color: colors.alert,
  },
  statLabel: {
    color: colors.textSecond,
    fontSize: 11,
    marginTop: 4,
    textAlign: 'center',
  },
  statLabelAccent: {
    color: colors.alert + 'BB',
  },

  // Activity
  activityCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  activityDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.accent,
    marginRight: 12,
  },
  activityText: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: 14,
  },
  activityAction: {
    fontWeight: '600',
    color: colors.textPrimary,
  },
  activityDetail: {
    color: colors.textSecond,
  },
  activityTime: {
    color: colors.textMuted,
    fontSize: 12,
    marginLeft: 8,
  },

  // Tab bar
  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingBottom: 4,
    paddingTop: 8,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    position: 'relative',
  },
  tabIcon: {
    fontSize: 18,
  },
  tabLabel: {
    color: colors.textMuted,
    fontSize: 10,
    marginTop: 3,
    fontWeight: '500',
  },
  tabLabelActive: {
    color: colors.accent,
  },
  tabActiveBar: {
    position: 'absolute',
    top: -8,
    width: 20,
    height: 2,
    borderRadius: 1,
    backgroundColor: colors.accent,
  },
});