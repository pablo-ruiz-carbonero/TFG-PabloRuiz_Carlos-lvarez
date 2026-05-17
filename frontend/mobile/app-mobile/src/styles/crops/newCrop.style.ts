import { StyleSheet } from "react-native";
import { colors, font, radius, spacing } from "../Globaltheme";

export const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: spacing.xl,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  subtitle: {
    color: colors.textSecond,
    fontSize: font.md,
    marginTop: spacing.xs,
  },
  card: {
    marginHorizontal: spacing.lg,
  },
  section: {
    marginBottom: spacing.lg,
  },
  label: {
    color: colors.textPrimary,
    fontSize: font.sm,
    fontWeight: "600",
    marginBottom: spacing.sm,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    overflow: "hidden",
    backgroundColor: colors.bg,
  },
  picker: {
    color: colors.textPrimary,
  },
  notesInput: {
    textAlignVertical: "top",
    minHeight: 100,
  },
  helperText: {
    color: colors.textMuted,
    fontSize: font.xs,
    marginTop: spacing.xs,
  },
  buttonContainer: {
    flexDirection: "row",
    gap: spacing.md,
    marginTop: spacing.xl,
  },
  btnCancel: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    borderRadius: radius.md,
    alignItems: "center",
  },
  btnCancelText: {
    color: colors.textPrimary,
    fontWeight: "600",
    fontSize: font.md,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

