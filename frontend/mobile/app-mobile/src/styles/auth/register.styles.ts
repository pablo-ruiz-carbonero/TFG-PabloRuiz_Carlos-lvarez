import { StyleSheet } from "react-native";
import { colors, font, radius, spacing } from "../Globaltheme";


export const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
    backgroundColor: "rgba(255, 255, 255, 0.12)",
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    padding: spacing.xl,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
  },
  bottomText: {
    textAlign: "center",
    color: colors.textSecond,
    fontSize: font.sm,
  },
  linkText: {
    color: colors.primary,
    fontWeight: "700",
  },
});
