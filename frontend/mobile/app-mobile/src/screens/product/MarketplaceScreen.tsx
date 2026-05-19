// src/screens/product/MarketplaceScreen.tsx

import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  FlatList,
  ActivityIndicator,
  ScrollView,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  useNavigation,
  NavigationProp,
  useFocusEffect,
} from "@react-navigation/native";
import { MaterialIcons, MaterialCommunityIcons } from "@expo/vector-icons";
import {
  colors,
  shared,
  spacing,
  font,
  radius,
} from "../../styles/Globaltheme";
import { RootStackParamList } from "../../types/navigation";
import {
  Product,
  ProductCategory,
} from "../../features/products/types/products.types";
import { useProducts } from "../../features/products/hooks/useProducts";

type Nav = NavigationProp<RootStackParamList>;

type CategoryIconDef =
  | {
      lib: "community";
      name: React.ComponentProps<typeof MaterialCommunityIcons>["name"];
    }
  | {
      lib: "material";
      name: React.ComponentProps<typeof MaterialIcons>["name"];
    };

const CATEGORY_ICON: Record<string, CategoryIconDef> = {
  Semillas: { lib: "community", name: "sprout" },
  Fertilizantes: { lib: "material", name: "science" },
  Maquinaria: { lib: "community", name: "tractor" },
  Fitosanitarios: { lib: "material", name: "shield" },
  Otros: { lib: "material", name: "category" },
};

function CategoryIcon({
  category,
  size = 32,
  color,
}: {
  category: string;
  size?: number;
  color: string;
}) {
  const def = CATEGORY_ICON[category] ?? {
    lib: "material",
    name: "category" as const,
  };
  if (def.lib === "community") {
    return (
      <MaterialCommunityIcons
        name={def.name as any}
        size={size}
        color={color}
      />
    );
  }
  return <MaterialIcons name={def.name as any} size={size} color={color} />;
}

const CATEGORIES: {
  label: string;
  value: ProductCategory | "Todos";
  iconName?: string;
  iconLib?: "material" | "community";
}[] = [
  { label: "Todos", value: "Todos" },
  {
    label: "Semillas",
    value: "Semillas",
    iconLib: "community",
    iconName: "sprout",
  },
  {
    label: "Fertilizantes",
    value: "Fertilizantes",
    iconLib: "material",
    iconName: "science",
  },
  {
    label: "Maquinaria",
    value: "Maquinaria",
    iconLib: "community",
    iconName: "tractor",
  },
  {
    label: "Fitosanitarios",
    value: "Fitosanitarios",
    iconLib: "material",
    iconName: "shield",
  },
  { label: "Otros", value: "Otros", iconLib: "material", iconName: "category" },
];

function ProductCard({
  item,
  onPress,
}: {
  item: Product;
  onPress: () => void;
}) {
  const firstImage =
    item.images && item.images.length > 0 ? item.images[0] : null;

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && { opacity: 0.85 }]}
      onPress={onPress}
    >
      <View style={styles.imgBox}>
        {firstImage ? (
          <Image
            source={{ uri: firstImage }}
            style={styles.imgPhoto}
            resizeMode="cover"
          />
        ) : (
          <CategoryIcon
            category={item.category}
            size={36}
            color={colors.primary}
          />
        )}
      </View>
      <View style={styles.cardBody}>
        <Text style={styles.cardName} numberOfLines={2}>
          {item.name}
        </Text>
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
  const { loading, error, fetchProducts, filterByCategory } = useProducts();

  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<
    ProductCategory | "Todos"
  >("Todos");

  useFocusEffect(
    useCallback(() => {
      fetchProducts();
    }, []),
  );

  const byCategory = filterByCategory(activeCategory);
  const filtered = query.trim()
    ? byCategory.filter((p) => {
        const q = query.toLowerCase();
        return (
          p.name.toLowerCase().includes(q) ||
          p.location.toLowerCase().includes(q) ||
          p.seller.name.toLowerCase().includes(q)
        );
      })
    : byCategory;

  return (
    <SafeAreaView style={shared.screen}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mercado</Text>
        <Pressable
          style={({ pressed }) => [
            styles.btnPublish,
            pressed && { opacity: 0.85 },
          ]}
          onPress={() => navigation.navigate("PublishProductScreen")}
        >
          <MaterialIcons name="add" size={16} color={colors.white} />
          <Text style={styles.btnPublishText}> Publicar</Text>
        </Pressable>
      </View>

      {/* Buscador */}
      <View style={styles.searchContainer}>
        <View style={styles.searchWrapper}>
          <MaterialIcons
            name="search"
            size={18}
            color={colors.textMuted}
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar productos..."
            placeholderTextColor={colors.textMuted}
            value={query}
            onChangeText={setQuery}
            returnKeyType="search"
          />
        </View>
      </View>

      {/* Filtros categoría */}
      <View style={styles.filtersWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersContent}
        >
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat.value;
            return (
              <Pressable
                key={cat.value}
                style={[styles.filterChip, isActive && styles.filterChipActive]}
                onPress={() => setActiveCategory(cat.value)}
              >
                {cat.iconName && cat.iconLib === "community" && (
                  <MaterialCommunityIcons
                    name={cat.iconName as any}
                    size={13}
                    color={isActive ? colors.white : colors.textSecond}
                  />
                )}
                {cat.iconName && cat.iconLib === "material" && (
                  <MaterialIcons
                    name={cat.iconName as any}
                    size={13}
                    color={isActive ? colors.white : colors.textSecond}
                  />
                )}
                <Text
                  style={[
                    styles.filterChipText,
                    isActive && styles.filterChipTextActive,
                  ]}
                >
                  {cat.iconName ? " " : ""}
                  {cat.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* Contador */}
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
      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>{error}</Text>
          <Pressable style={styles.btnEmpty} onPress={fetchProducts}>
            <Text style={styles.btnEmptyText}>Reintentar</Text>
          </Pressable>
        </View>
      ) : filtered.length === 0 ? (
        <View style={styles.center}>
          <MaterialIcons name="store" size={48} color={colors.textMuted} />
          <Text style={styles.emptyText}>No hay productos disponibles</Text>
          <Pressable
            style={styles.btnEmpty}
            onPress={() => navigation.navigate("PublishProductScreen")}
          >
            <Text style={styles.btnEmptyText}>Publicar el primero</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ProductCard
              item={item}
              onPress={() =>
                navigation.navigate("ProductDetailScreen", {
                  productId: item.id,
                })
              }
            />
          )}
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
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
  },
  btnPublishText: { color: colors.white, fontWeight: "700", fontSize: font.sm },
  searchContainer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  searchWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
  },
  searchIcon: { marginRight: spacing.xs },
  searchInput: {
    flex: 1,
    paddingVertical: spacing.md,
    fontSize: font.md,
    color: colors.textPrimary,
  },
  filtersWrapper: { marginBottom: spacing.sm },
  filtersContent: { paddingHorizontal: spacing.lg, gap: spacing.sm },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
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
  filterChipTextActive: { color: colors.white },
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
  listContent: { paddingBottom: spacing.xxxl },
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
    overflow: "hidden",
  },
  imgPhoto: { width: "100%", height: "100%" },
  cardBody: { padding: spacing.md },
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
  cardSeller: { fontSize: font.xs, color: colors.textMuted },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.lg,
  },
  errorText: { fontSize: font.md, color: colors.error },
  emptyText: { fontSize: font.md, color: colors.textSecond },
  btnEmpty: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
  },
  btnEmptyText: { color: colors.white, fontWeight: "700", fontSize: font.md },
});
