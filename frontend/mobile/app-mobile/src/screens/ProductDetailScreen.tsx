// src/screens/ProductDetailScreen.tsx
import React, { useEffect, useState } from "react";
import {
  View, Text, StyleSheet, Pressable,
  ScrollView, ActivityIndicator, Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute, RouteProp, NavigationProp } from "@react-navigation/native";
import { colors, shared, spacing, font, radius } from "../styles/theme";
import { RootStackParamList } from "../types/navigation";
import { Product } from "../types/products";
import { productsService } from "../services/productsService";

type RouteP = RouteProp<RootStackParamList, "ProductDetailScreen">;
type Nav = NavigationProp<RootStackParamList>;

const CATEGORY_EMOJI: Record<string, string> = {
  Semillas: "🌱",
  Fertilizantes: "🧪",
  Maquinaria: "🚜",
  Fitosanitarios: "🛡️",
  Otros: "📦",
};

const Stars = ({ rating }: { rating: number }) => {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5;
  return (
    <Text style={{ fontSize: 13, color: colors.warning }}>
      {"★".repeat(full)}{half ? "½" : ""}{"☆".repeat(5 - full - (half ? 1 : 0))}
    </Text>
  );
};

export default function ProductDetailScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<RouteP>();
  const { productId } = route.params;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProduct();
  }, [productId]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      const data = await productsService.getProductById(productId);
      setProduct(data);
    } catch {
      Alert.alert("Error", "No se pudo cargar el producto");
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={shared.screen}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (!product) return null;

  return (
    <SafeAreaView style={shared.screen}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Header nav */}
        <View style={styles.header}>
          <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
            <Text style={styles.backButton}>← Volver</Text>
          </Pressable>
          <Text style={styles.headerTitle} numberOfLines={1}>{product.name}</Text>
          <View style={{ width: 60 }} />
        </View>

        {/* Galería placeholder */}
        <View style={styles.gallery}>
          <Text style={styles.galleryEmoji}>{CATEGORY_EMOJI[product.category] ?? "📦"}</Text>
          <View style={styles.galleryBadge}>
            <Text style={styles.galleryBadgeText}>Galería de fotos</Text>
          </View>
        </View>

        {/* Título y precio */}
        <View style={styles.mainInfo}>
          <View style={{ flex: 1 }}>
            <Text style={styles.productName}>{product.name}</Text>
            <Text style={styles.categoryText}>{product.category}</Text>
          </View>
          <Text style={styles.priceText}>
            {product.price.toFixed(2)}{"\n"}{product.unit}
          </Text>
        </View>

        {/* Badges stock y ciudad */}
        <View style={styles.badgeRow}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>📦 Stock {product.stock} kg</Text>
          </View>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>📍 {product.location}</Text>
          </View>
        </View>

        {/* Vendedor */}
        <View style={[shared.card, styles.section]}>
          <Text style={shared.sectionTitle}>Vendedor</Text>
          <View style={styles.sellerRow}>
            <View style={styles.sellerAvatar}>
              <Text style={styles.sellerAvatarText}>{product.seller.initials}</Text>
            </View>
            <View style={styles.sellerInfo}>
              <Text style={styles.sellerName}>{product.seller.name}</Text>
              <View style={styles.sellerMeta}>
                <Stars rating={product.seller.rating} />
                <Text style={styles.sellerSales}> {product.seller.rating.toFixed(1)} · {product.seller.sales} ventas</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Descripción */}
        <View style={[shared.card, styles.section]}>
          <Text style={shared.sectionTitle}>Descripción del producto</Text>
          <Text style={styles.descriptionText}>{product.description}</Text>
        </View>

        {/* Ubicación */}
        <View style={[shared.card, styles.section]}>
          <Text style={shared.sectionTitle}>📍 Ubicación</Text>
          <Text style={styles.locationText}>{product.province}</Text>
        </View>

        {/* Botones de acción */}
        <View style={styles.actionButtons}>
          <Pressable
            style={({ pressed }) => [
              styles.btnContact,
              pressed && { opacity: 0.85 },
            ]}
            onPress={() =>
              Alert.alert("Próximamente", "El chat con vendedor estará disponible pronto.")
            }
          >
            <Text style={styles.btnContactText}>Contactar vendedor</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.btnMoreSeller,
              pressed && { opacity: 0.85 },
            ]}
            onPress={() =>
              Alert.alert("Próximamente", "Ver más productos de este vendedor estará disponible pronto.")
            }
          >
            <Text style={styles.btnMoreSellerText}>Ver más de este vendedor</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scrollContent: { paddingBottom: spacing.xxxl },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  backButton: { color: colors.primary, fontSize: font.md, fontWeight: "600", width: 60 },
  headerTitle: { fontSize: font.md, fontWeight: "700", color: colors.textPrimary, flex: 1, textAlign: "center" },

  gallery: {
    height: 200,
    backgroundColor: colors.primaryDim,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: spacing.lg,
    borderRadius: radius.lg,
    marginBottom: spacing.lg,
    position: "relative",
  },
  galleryEmoji: { fontSize: 70 },
  galleryBadge: {
    position: "absolute",
    bottom: spacing.md,
    right: spacing.md,
    backgroundColor: "rgba(0,0,0,0.3)",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.md,
  },
  galleryBadgeText: { color: colors.white, fontSize: font.xs, fontWeight: "600" },

  mainInfo: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  productName: {
    fontSize: font.xxl,
    fontWeight: "800",
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  categoryText: { fontSize: font.sm, color: colors.textSecond },
  priceText: {
    fontSize: font.lg,
    fontWeight: "800",
    color: colors.primary,
    textAlign: "right",
    lineHeight: 22,
  },

  badgeRow: {
    flexDirection: "row",
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  badge: {
    backgroundColor: colors.primaryDim,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radius.full,
  },
  badgeText: { fontSize: font.xs, color: colors.primary, fontWeight: "600" },

  section: { marginHorizontal: spacing.lg, marginBottom: spacing.md },

  sellerRow: { flexDirection: "row", alignItems: "center", gap: spacing.md, marginTop: spacing.sm },
  sellerAvatar: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: colors.primaryDim,
    alignItems: "center", justifyContent: "center",
    borderWidth: 2, borderColor: colors.primaryLight,
  },
  sellerAvatarText: { color: colors.primary, fontWeight: "700", fontSize: font.sm },
  sellerInfo: { flex: 1 },
  sellerName: { fontSize: font.md, fontWeight: "700", color: colors.textPrimary },
  sellerMeta: { flexDirection: "row", alignItems: "center", marginTop: 2 },
  sellerSales: { fontSize: font.xs, color: colors.textMuted },

  descriptionText: {
    fontSize: font.md,
    color: colors.textSecond,
    lineHeight: 24,
    marginTop: spacing.sm,
  },
  locationText: {
    fontSize: font.lg,
    fontWeight: "600",
    color: colors.textPrimary,
    marginTop: spacing.sm,
  },

  actionButtons: {
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
    marginTop: spacing.md,
  },
  btnContact: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md + 2,
    borderRadius: radius.md,
    alignItems: "center",
  },
  btnContactText: { color: colors.white, fontWeight: "700", fontSize: font.md },
  btnMoreSeller: {
    borderWidth: 1.5,
    borderColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    alignItems: "center",
  },
  btnMoreSellerText: { color: colors.primary, fontWeight: "700", fontSize: font.md },
});