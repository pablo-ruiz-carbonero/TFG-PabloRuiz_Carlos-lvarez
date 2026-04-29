// ─── AgroLink Design Tokens ───────────────────────────────────────────────────
// Consistent with LoginScreen / RegisterScreen aesthetic (white cards, green accent)

export const colors = {
  // Brand
  primary:       '#2E7D32',   // deep green — main CTA, titles
  primaryLight:  '#4CAF50',   // lighter green — badges, active states
  primaryDim:    '#E8F5E9',   // very light green — backgrounds, chips

  // Surfaces
  white:         '#FFFFFF',
  bg:            '#F4F6F4',   // off-white page background
  surface:       '#FFFFFF',   // card background
  surfaceAlt:    '#F9F9F9',   // input background

  // Text
  textPrimary:   '#1B2B1E',
  textSecond:    '#555F57',
  textMuted:     '#999FA0',
  textInverse:   '#FFFFFF',

  // Borders & dividers
  border:        '#E0E0E0',
  borderFocus:   '#2E7D32',

  // Semantic
  success:       '#2E7D32',
  warning:       '#F59E0B',
  warningDim:    '#FEF3C7',
  error:         '#DC2626',
  errorDim:      '#FEE2E2',
  info:          '#3B82F6',
  infoDim:       '#DBEAFE',

  // Status badges
  badgeGreen:    '#D1FAE5',
  badgeGreenText:'#065F46',
  badgeOrange:   '#FED7AA',
  badgeOrangeText:'#9A3412',
  badgeBlue:     '#DBEAFE',
  badgeBlueText: '#1E40AF',
  badgeGray:     '#F3F4F6',
  badgeGrayText: '#374151',
} as const;

export const spacing = {
  xs:  4,
  sm:  8,
  md:  12,
  lg:  16,
  xl:  20,
  xxl: 28,
  xxxl:40,
} as const;

export const radius = {
  sm:  8,
  md:  10,
  lg:  14,
  xl:  20,
  full:100,
} as const;

export const font = {
  xs:   11,
  sm:   13,
  md:   15,
  lg:   17,
  xl:   20,
  xxl:  24,
  xxxl: 28,
  huge: 34,
} as const;

// ─── Shared reusable StyleSheet fragments ─────────────────────────────────────

import { StyleSheet } from 'react-native';

export const shared = StyleSheet.create({
  // Card — white, rounded, shadow
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: spacing.md,
  },
  // Full-width input
  input: {
    height: 50,
    backgroundColor: colors.surfaceAlt,
    borderColor: colors.border,
    borderWidth: 1,
    marginBottom: spacing.md,
    width: '100%',
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    fontSize: font.md,
    color: colors.textPrimary,
  },
  // Primary green button
  btnPrimary: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md + 2,
    borderRadius: radius.md,
    width: '100%',
    alignItems: 'center',
  },
  btnPrimaryText: {
    color: colors.white,
    fontSize: font.md,
    fontWeight: '700',
  },
  // Outline button
  btnOutline: {
    borderWidth: 1.5,
    borderColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    width: '100%',
    alignItems: 'center',
  },
  btnOutlineText: {
    color: colors.primary,
    fontSize: font.md,
    fontWeight: '600',
  },
  // Section header
  sectionTitle: {
    fontSize: font.xs,
    fontWeight: '700',
    color: colors.textMuted,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: spacing.sm,
    marginTop: spacing.sm,
  },
  // Row with space-between
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  // Avatar circle
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.primaryDim,
    borderWidth: 2,
    borderColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: colors.primary,
    fontSize: font.sm,
    fontWeight: '700',
  },
  // Screen wrapper
  screen: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  // Pill badge
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.full,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontSize: font.xs,
    fontWeight: '600',
  },
  // Tab bar (shared across screens that manage it internally)
  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingBottom: 6,
    paddingTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 8,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 2,
  },
  tabIcon: {
    fontSize: 20,
  },
  tabLabel: {
    color: colors.textMuted,
    fontSize: 10,
    marginTop: 2,
    fontWeight: '500',
  },
  tabLabelActive: {
    color: colors.primary,
    fontWeight: '700',
  },
  // Back button header
  headerBack: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerBackText: {
    color: colors.primary,
    fontSize: font.md,
    fontWeight: '600',
    marginLeft: spacing.xs,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: font.md,
    fontWeight: '700',
    color: colors.textPrimary,
  },
});