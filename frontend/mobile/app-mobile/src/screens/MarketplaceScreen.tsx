// src/screens/MarketplaceScreen.tsx
import React, { useState, useCallback } from "react";
import {
  View, Text, StyleSheet, Pressable, TextInput,
  FlatList, ActivityIndicator, ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, NavigationProp, useFocusEffect } from "@react-navigation/native";
import { colors, shared, spacing, font, radius } from "../styles/theme";
import { RootStackParamList } from "../types/navigation";
import { Product, ProductCategory } from "../types/products";
import { productsService } from "../services/productsService";

type Nav = NavigationProp<RootStackParamList>;

const CATEGORIES: { label: string; value: ProductCategory | "Todos" }[] = [
  { label: "Todos", value: "Todos" },
  { label: "🌱 Semillas", value: "Semillas" },
  { label: "🧪 Fertilizantes", value: "Fertilizantes" },
  { label: "🚜 Maquinaria", value: "Maquinaria" },
  { label: "🛡️ Fitosanitarios", value: "Fitosanitarios" },
  { label: "📦 Otros", value: "Otros" },
];

const CATEGORY_EMOJI: Record<string, string> = {
  Semillas: "🌱",
  Fertilizantes: "🧪",
  Maquinaria: "🚜",
  Fitosanitarios: "🛡️",
  Otros: "📦",
};

function ProductCard({ item, onPress }: { item: Product; onPress: () => void }) {
  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && { opacity: 0.85 }]}
      onPress={onPress}
    >
      {/* Imagen placeholder */}
      <View style={styles.imgBox}>
        <Text style={styles.imgEmoji}>{CATEGORY_EMOJI[item.category] ?? "📦"}</Text>
      </View>

      <View style={styles.cardBody}>
        <Text style={styles.cardName} numberOfLines={2}>{item.name}</Text>
        <Text style={styles.cardPrice}>
          {item.price.toFixed(2)} {item.unit}
        </Text>
        <Text style={styles.cardSeller} numberOfLines={1}>
          {item.seller.name} · {item.location}
        </Text>
      </View>
    </Pressable>
  );
}

export default function MarketplaceScreen() {
  const navigation = useNavigation<Nav>();
  const [products, setProducts] = useState<Product[]>([]);
  const [filtered, setFiltered] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<ProductCategory | "Todos">("Todos");
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      loadProducts();
    }, [])
  );

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await productsService.getAllProducts();
      setProducts(data);
      applyFilters(data, searchQuery, activeCategory);
    } catch {
      // silencioso
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = (
    data: Product[],
    query: string,
    category: ProductCategory | "Todos"
  ) => {
    let result = [...data];
    if (category !== "Todos") result = result.filter((p) => p.category === category);
    if (query.trim()) {
      const q = query.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.location.toLowerCase().includes(q) ||
          p.seller.name.toLowerCase().includes(q)
      );
    }
    setFiltered(result);
  };

  const handleSearch = (q: string) => {
    setSearchQuery(q);
    applyFilters(products, q, activeCategory);
  };

  const handleCategory = (cat: ProductCategory | "Todos") => {
    setActiveCategory(cat);
    applyFilters(products, searchQuery, cat);
  };

  const renderProduct = ({ item }: { item: Product }) => (
    <ProductCard
      item={item}
      onPress={() => navigation.navigate("ProductDetailScreen", { productId: item.id })}
    />
  );

  return (
    <SafeAreaView style={shared.screen}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mercado</Text>
        <Pressable
          style={({ pressed }) => [styles.btnPublish, pressed && { opacity: 0.85 }]}
          // onPress={() => navigation.navigate("PublishProductScreen")}
        >
          <Text style={styles.btnPublishText}>+ Publicar</Text>
        </Pressable>
      </View>

      {/* Buscador */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar productos..."
          placeholderTextColor={colors.textMuted}
          value={searchQuery}
          onChangeText={handleSearch}
          returnKeyType="search"
        />
      </View>

      {/* Filtros de categoría */}
      <View style={styles.filtersWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersContent}
        >
          {CATEGORIES.map((cat) => (
            <Pressable
              key={cat.value}
              style={[
                styles.filterChip,
                activeCategory === cat.value && styles.filterChipActive,
              ]}
              onPress={() => handleCategory(cat.value)}
            >
              <Text
                style={[
                  styles.filterChipText,
                  activeCategory === cat.value && styles.filterChipTextActive,
                ]}
              >
                {cat.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {/* Contador de resultados */}
      {!loading && (
        <Text style={styles.resultsCount}>
          {filtered.length} producto{filtered.length !== 1 ? "s" : ""}
        </Text>
      )}

      {/* Lista */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : filtered.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyText}>No hay productos disponibles</Text>
          <Pressable
            style={styles.btnEmpty}
            // onPress={() => navigation.navigate("PublishProductScreen")}
          >
            <Text style={styles.btnEmptyText}>Publicar el primero</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={renderProduct}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const CARD_WIDTH = "48%";

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
  headerTitle: {
    fontSize: font.xl,
    fontWeight: "800",
    color: colors.textPrimary,
  },
  btnPublish: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
  },
  btnPublishText: {
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
  filtersWrapper: {
    marginBottom: spacing.sm,
  },
  filtersContent: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  filterChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterChipText: {
    fontSize: font.sm,
    fontWeight: "600",
    color: colors.textSecond,
  },
  filterChipTextActive: {
    color: colors.white,
  },
  resultsCount: {
    fontSize: font.xs,
    color: colors.textMuted,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    fontWeight: "600",
  },
  row: {
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  listContent: {
    paddingBottom: spacing.xxxl,
  },
  card: {
    width: CARD_WIDTH,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 3,
  },
  imgBox: {
    height: 100,
    backgroundColor: colors.primaryDim,
    alignItems: "center",
    justifyContent: "center",
  },
  imgEmoji: {
    fontSize: 40,
  },
  cardBody: {
    padding: spacing.md,
  },
  cardName: {
    fontSize: font.sm,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: spacing.xs,
    lineHeight: 18,
  },
  cardPrice: {
    fontSize: font.md,
    fontWeight: "800",
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  cardSeller: {
    fontSize: font.xs,
    color: colors.textMuted,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.lg,
  },
  emptyText: {
    fontSize: font.md,
    color: colors.textSecond,
  },
  btnEmpty: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
  },
  btnEmptyText: {
    color: colors.white,
    fontWeight: "700",
    fontSize: font.md,
  },
});