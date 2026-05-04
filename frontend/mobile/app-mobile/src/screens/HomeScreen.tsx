import React, { useEffect, useState, useRef } from "react";
import { View, Text, Pressable, StyleSheet, ScrollView, Animated } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import PerfilMenu from "../components/PerfilMenu";
import WeatherCard from "../components/WeatherCard";
import { colors, shared, spacing, font, radius } from "../styles/theme";

const resumenCultivos = [
  { value: 3, label: "Cultivos" },
  { value: 2, label: "Tareas hoy" },
  { value: 1, label: "Alertas" },
];

const actividadReciente = [
  { title: "Riego", subtitle: "Parcela A1 · hace 2h" },
  { title: "Siembra", subtitle: "Tomate · ayer" },
];

export default function HomeScreen({ navigation }: any) {
  const [fecha, setFecha] = useState(new Date());
  const [username, setUsername] = useState("");
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(18)).current;

  const user = {
    username,
    photoURL: null,
  };

  useEffect(() => {
    const timer = setInterval(() => setFecha(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const obtenerUsuario = async () => {
      setUsername("Carlos");
    };
    obtenerUsuario();
  }, []);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  const partes = fecha
    .toLocaleDateString("es-ES", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    })
    .replace(" de ", " ")
    .replace(" de ", " ");

  const formato = partes.charAt(0).toUpperCase() + partes.slice(1);

  return (
    <SafeAreaView style={shared.screen}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hola, {username}</Text>
          <Text style={styles.date}>{formato}</Text>
        </View>
        <PerfilMenu user={user} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Animated.View style={[shared.card, styles.welcomeCard, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>           
          <Text style={shared.title}>Resumen rápido</Text>
          <Text style={shared.subtitle}>Controla tus cultivos y clima desde un solo lugar.</Text>
          <WeatherCard navigation={navigation} />
        </Animated.View>

        <Animated.View style={[shared.card, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>          
          <Text style={shared.sectionTitle}>Resumen cultivos</Text>
          <View style={styles.summaryRow}>
            {resumenCultivos.map((item, index) => (
              <View
                key={item.label}
                style={[
                  styles.summaryBox,
                  index < resumenCultivos.length - 1 && styles.summaryBoxSpacing,
                ]}
              >
                <Text style={styles.summaryValue}>{item.value}</Text>
                <Text style={styles.summaryLabel}>{item.label}</Text>
              </View>
            ))}
          </View>
        </Animated.View>

        <Animated.View style={[shared.card, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>          
          <Text style={shared.sectionTitle}>Actividad reciente</Text>
          {actividadReciente.map((item) => (
            <Pressable key={item.title} style={styles.activityItem}>
              <View style={styles.activityBadge} />
              <View>
                <Text style={styles.activityTitle}>{item.title}</Text>
                <Text style={styles.activitySubtitle}>{item.subtitle}</Text>
              </View>
            </Pressable>
          ))}
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
  },
  greeting: {
    fontSize: font.xxxl,
    fontWeight: "800",
    color: colors.textPrimary,
  },
  date: {
    marginTop: spacing.xs,
    color: colors.textSecond,
    fontSize: font.sm,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  welcomeCard: {
    paddingBottom: spacing.lg,
  },
  summaryRow: {
    flexDirection: "row",
  },
  summaryBox: {
    flex: 1,
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.md,
    padding: spacing.lg,
    alignItems: "center",
  },
  summaryBoxSpacing: {
    marginRight: spacing.sm,
  },
  summaryValue: {
    color: colors.textPrimary,
    fontSize: font.xxxl,
    fontWeight: "800",
  },
  summaryLabel: {
    color: colors.textSecond,
    marginTop: spacing.xs,
    textAlign: "center",
  },
  activityItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  activityBadge: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.primaryLight,
    marginRight: spacing.md,
  },
  activityTitle: {
    color: colors.textPrimary,
    fontSize: font.md,
    fontWeight: "700",
  },
  activitySubtitle: {
    color: colors.textSecond,
    marginTop: spacing.xs,
    fontSize: font.sm,
  },
});
