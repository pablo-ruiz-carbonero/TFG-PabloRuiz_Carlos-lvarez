// src/components/CropCard.tsx
import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { colors, spacing, font, radius } from "../styles/theme";
import { Crop } from "../types/crops";

interface CropCardProps {
  crop: Crop;
  onPress: (cropId: string) => void;
}

export default function CropCard({ crop, onPress }: CropCardProps) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        pressed && { opacity: 0.8 },
      ]}
      onPress={() => onPress(crop.id)}
    >
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.cropName}>{crop.name}</Text>
          <Text style={styles.variety}>{crop.variety}</Text>
        </View>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{crop.currentPhase}</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.info}>
          {crop.daysOld}d • {crop.parcelName}
        </Text>
        <Text style={styles.tasksText}>{crop.tasksCount} tareas</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
    marginBottom: spacing.md,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: spacing.md,
  },
  titleContainer: {
    flex: 1,
  },
  cropName: {
    fontSize: font.lg,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  variety: {
    fontSize: font.sm,
    color: colors.textSecond,
    marginTop: spacing.xs,
  },
  badge: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
  },
  badgeText: {
    color: colors.primary,
    fontWeight: "600",
    fontSize: font.xs,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  info: {
    fontSize: font.xs,
    color: colors.textSecond,
  },
  tasksText: {
    color: colors.primary,
    fontWeight: "600",
    fontSize: font.xs,
  },
});
