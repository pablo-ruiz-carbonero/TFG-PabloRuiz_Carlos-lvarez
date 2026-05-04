import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, NavigationProp, useFocusEffect } from "@react-navigation/native";
import { colors, shared, spacing, font, radius } from "../styles/theme";
import { RootStackParamList } from "../types/navigation";
import { Crop } from "../types/crops";
import { cropsService } from "../services/cropsService";

type NavigationProp_Crops = NavigationProp<RootStackParamList>;

export default function CropsScreen() {
  const navigation = useNavigation<NavigationProp_Crops>();
  const [crops, setCrops] = useState<Crop[]>([]);
  const [filteredCrops, setFilteredCrops] = useState<Crop[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  // Cargar cultivos cuando la pantalla se enfoca (actualizar si vuelvo de agregar cultivo)
  useFocusEffect(
    React.useCallback(() => {
      loadCrops();
    }, [])
  );

  const loadCrops = async () => {
    try {
      setLoading(true);
      const data = await cropsService.getAllCrops();
      setCrops(data);
      setFilteredCrops(data);
    } catch (error) {
      console.error("Error loading crops:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim() === "") {
      setFilteredCrops(crops);
    } else {
      const filtered = crops.filter(
        (crop) =>
          crop.name.toLowerCase().includes(query.toLowerCase()) ||
          crop.variety.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredCrops(filtered);
    }
  };

  const handleCropPress = (cropId: string) => {
    navigation.navigate("DetailCorpScreen", { cropId });
  };

  const renderCropCard = ({ item }: { item: Crop }) => {
    const daysOld = item.daysOld || 0;
    const seedDate = new Date(item.seedDate);
    const seedDateFormatted = seedDate.toLocaleDateString("es-ES", {
      day: "numeric",
      month: "short",
    });

    return (
      <Pressable
        style={({ pressed }) => [
          styles.cropCard,
          pressed && { opacity: 0.8 },
        ]}
        onPress={() => handleCropPress(item.id)}
      >
        <View style={styles.cropHeader}>
          <View>
            <Text style={styles.cropName}>{item.name}</Text>
            <Text style={styles.cropVariety}>{item.variety}</Text>
          </View>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{item.currentPhase}</Text>
          </View>
        </View>

        <View style={styles.cropInfo}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Siembra</Text>
            <Text style={styles.infoValue}>{seedDateFormatted}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Edad</Text>
            <Text style={styles.infoValue}>{daysOld}d</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Tareas</Text>
            <Text style={styles.infoValue}>{item.tasksCount}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Parcela</Text>
            <Text style={styles.infoValue}>{item.parcelName}</Text>
          </View>
        </View>

        <View style={styles.cropFooter}>
          <Text style={styles.detailText}>
            {item.surfaceArea} ha • {item.cropType}
          </Text>
          <Text style={styles.actionText}>Ver detalles →</Text>
        </View>
      </Pressable>
    );
  };

  return (
    <SafeAreaView style={shared.screen}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={shared.sectionTitle}>Mis Cultivos</Text>
        <Pressable
          style={({ pressed }) => [
            styles.btnNew,
            pressed && { opacity: 0.8 },
          ]}
          onPress={() => navigation.navigate("NewCorpScreen")}
        >
          <Text style={styles.btnNewText}>+ Nuevo</Text>
        </Pressable>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <TextInput
          placeholder="Buscar cultivo..."
          placeholderTextColor={colors.textMuted}
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={handleSearch}
        />
      </View>

      {/* Crops List */}
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : filteredCrops.length === 0 ? (
        <View style={styles.centerContainer}>
          <Text style={styles.emptyText}>
            {searchQuery ? "No se encontraron cultivos" : "No hay cultivos aún"}
          </Text>
          {!searchQuery && (
            <Pressable
              style={styles.btnCreateFirst}
              onPress={() => navigation.navigate("NewCorpScreen")}
            >
              <Text style={styles.btnCreateFirstText}>Crear primer cultivo</Text>
            </Pressable>
          )}
        </View>
      ) : (
        <FlatList
          data={filteredCrops}
          keyExtractor={(item) => item.id}
          renderItem={renderCropCard}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  btnNew: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
  },
  btnNewText: {
    color: colors.white,
    fontWeight: "700",
    fontSize: font.sm,
  },
  searchContainer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  searchInput: {
    ...shared.input,
    backgroundColor: colors.surface,
    color: colors.textPrimary,
  },
  cropCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    marginHorizontal: spacing.lg,
    marginVertical: spacing.sm,
    padding: spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  cropHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: spacing.md,
  },
  cropName: {
    fontSize: font.lg,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  cropVariety: {
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
  cropInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.md,
  },
  infoItem: {
    flex: 1,
  },
  infoLabel: {
    fontSize: font.xs,
    color: colors.textMuted,
    fontWeight: "600",
  },
  infoValue: {
    fontSize: font.md,
    color: colors.textPrimary,
    fontWeight: "700",
    marginTop: spacing.xs,
  },
  cropFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  detailText: {
    fontSize: font.xs,
    color: colors.textSecond,
  },
  actionText: {
    color: colors.primary,
    fontWeight: "600",
    fontSize: font.sm,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: font.md,
    color: colors.textSecond,
    marginBottom: spacing.lg,
  },
  btnCreateFirst: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
  },
  btnCreateFirstText: {
    color: colors.white,
    fontWeight: "700",
    fontSize: font.md,
  },
  listContent: {
    paddingBottom: spacing.xl,
  },
});

