// src/screens/product/ProductDetailScreen.tsx

import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  ActivityIndicator,
  Alert,
  Image,
  FlatList,
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  useNavigation,
  useRoute,
  RouteProp,
  NavigationProp,
} from "@react-navigation/native";
import {
  colors,
  shared,
  spacing,
  font,
  radius,
} from "../../styles/Globaltheme";
import { RootStackParamList } from "../../types/navigation";
import { useProductDetail } from "../../features/products/hooks/useProductsDetail";
import { useChat } from "../../features/chat/hooks/useChat";

type RouteP = RouteProp<RootStackParamList, "ProductDetailScreen">;
type Nav = NavigationProp<RootStackParamList>;

const SCREEN_WIDTH = Dimensions.get("window").width;
const GALLERY_HEIGHT = 260;

const CATEGORY_EMOJI: Record<string, string> = {
  Semillas: "🌱",
  Fertilizantes: "🧪",
  Maquinaria: "🚜",
  Fitosanitarios: "🛡️",
  Otros: "📦",
};

function Stars({ rating }: { rating: number }) {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5;
  return (
    <Text style={{ fontSize: 13, color: colors.warning }}>
      {"★".repeat(full)}
      {half ? "½" : ""}
      {"☆".repeat(5 - full - (half ? 1 : 0))}
    </Text>
  );
}

// ─── Carrusel de fotos ─────────────────────────────────────────────────────────
function ImageCarousel({
  images,
  category,
}: {
  images: string[];
  category: string;
}) {
  const [activeIdx, setActiveIdx] = useState(0);

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const idx = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
    setActiveIdx(idx);
  };

  if (!images || images.length === 0) {
    return (
      <View style={carouselStyles.placeholder}>
        <Text style={carouselStyles.placeholderEmoji}>
          {CATEGORY_EMOJI[category] ?? "📦"}
        </Text>
        <Text style={carouselStyles.placeholderText}>Sin fotos</Text>
      </View>
    );
  }

  return (
    <View style={carouselStyles.container}>
      <FlatList
        data={images}
        keyExtractor={(_, i) => String(i)}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        renderItem={({ item }) => (
          <Image
            source={{ uri: item }}
            style={carouselStyles.image}
            resizeMode="cover"
          />
        )}
      />
      {/* Indicadores de punto */}
      {images.length > 1 && (
        <View style={carouselStyles.dotsRow}>
          {images.map((_, i) => (
            <View
              key={i}
              style={[
                carouselStyles.dot,
                i === activeIdx && carouselStyles.dotActive,
              ]}
            />
          ))}
        </View>
      )}
      {/* Contador de fotos */}
      <View style={carouselStyles.counter}>
        <Text style={carouselStyles.counterText}>
          {activeIdx + 1}/{images.length}
        </Text>
      </View>
    </View>
  );
}

const carouselStyles = StyleSheet.create({
  container: {
    height: GALLERY_HEIGHT,
    position: "relative",
    backgroundColor: colors.primaryDim,
  },
  image: {
    width: SCREEN_WIDTH,
    height: GALLERY_HEIGHT,
  },
  placeholder: {
    height: GALLERY_HEIGHT,
    backgroundColor: colors.primaryDim,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
  },
  placeholderEmoji: { fontSize: 70 },
  placeholderText: {
    fontSize: font.sm,
    color: colors.textMuted,
    fontWeight: "600",
  },
  dotsRow: {
    position: "absolute",
    bottom: spacing.md,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    gap: spacing.xs,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(255,255,255,0.5)",
  },
  dotActive: {
    backgroundColor: colors.white,
    width: 18,
    borderRadius: 3,
  },
  counter: {
    position: "absolute",
    top: spacing.md,
    right: spacing.md,
    backgroundColor: "rgba(0,0,0,0.45)",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.md,
  },
  counterText: { color: colors.white, fontSize: font.xs, fontWeight: "700" },
});

// ─── Pantalla principal ────────────────────────────────────────────────────────
export default function ProductDetailScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<RouteP>();
  const { productId } = route.params;

  const { product, loading, error, loadProduct } = useProductDetail(productId);
  const { getOrCreateConversation } = useChat();

  useEffect(() => {
    loadProduct();
  }, [productId]);

  const handleContactSeller = async () => {
    if (!product) return;
    try {
      const conv = await getOrCreateConversation({
        participantId: product.seller.id,
        participantName: product.seller.name,
        participantInitials: product.seller.initials,
      });
      navigation.navigate("ChatScreen", {
        conversationId: conv.id,
        participantName: conv.participantName,
        participantInitials: conv.participantInitials,
        online: conv.online,
      });
    } catch {
      Alert.alert("Error", "No se pudo iniciar el chat con el vendedor.");
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

  if (error || !product) {
    return (
      <SafeAreaView style={shared.screen}>
        <View style={styles.center}>
          <Text style={styles.errorText}>
            {error ?? "Producto no encontrado"}
          </Text>
          <Pressable
            style={shared.btnPrimary}
            onPress={() => navigation.goBack()}
          >
            <Text style={shared.btnPrimaryText}>Volver</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={shared.screen}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header flotante sobre el carrusel */}
        <View style={styles.header}>
          <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
            <Text style={styles.backButton}>← Volver</Text>
          </Pressable>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {product.name}
          </Text>
          <View style={{ width: 60 }} />
        </View>

        {/* Carrusel de fotos */}
        <ImageCarousel images={product.images} category={product.category} />

        {/* Título y precio */}
        <View style={styles.mainInfo}>
          <View style={{ flex: 1 }}>
            <Text style={styles.productName}>{product.name}</Text>
            <Text style={styles.categoryText}>{product.category}</Text>
          </View>
          <Text style={styles.priceText}>
            {product.price.toFixed(2)}
            {"\n"}
            {product.unit}
          </Text>
        </View>

        {/* Badges */}
        <View style={styles.badgeRow}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>📦 Stock: {product.stock}</Text>
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
              <Text style={styles.sellerAvatarText}>
                {product.seller.initials}
              </Text>
            </View>
            <View style={styles.sellerInfo}>
              <Text style={styles.sellerName}>{product.seller.name}</Text>
              <View style={styles.sellerMeta}>
                <Stars rating={product.seller.rating} />
                <Text style={styles.sellerSales}>
                  {" "}
                  {product.seller.rating.toFixed(1)} · {product.seller.sales}{" "}
                  ventas
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Descripción */}
        <View style={[shared.card, styles.section]}>
          <Text style={shared.sectionTitle}>Descripción</Text>
          <Text style={styles.descriptionText}>{product.description}</Text>
        </View>

        {/* Ubicación */}
        <View style={[shared.card, styles.section]}>
          <Text style={shared.sectionTitle}>📍 Ubicación</Text>
          <Text style={styles.locationText}>{product.province}</Text>
        </View>

        {/* Acciones */}
        <View style={styles.actionButtons}>
          <Pressable
            style={({ pressed }) => [
              styles.btnContact,
              pressed && { opacity: 0.85 },
            ]}
            onPress={handleContactSeller}
          >
            <Text style={styles.btnContactText}>Contactar vendedor</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.btnMoreSeller,
              pressed && { opacity: 0.85 },
            ]}
            onPress={() =>
              Alert.alert(
                "Próximamente",
                "Ver más productos de este vendedor estará disponible pronto.",
              )
            }
          >
            <Text style={styles.btnMoreSellerText}>
              Ver más de este vendedor
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scrollContent: { paddingBottom: spacing.xxxl },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.lg,
  },
  errorText: { fontSize: font.md, color: colors.error },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  backButton: {
    color: colors.primary,
    fontSize: font.md,
    fontWeight: "600",
    width: 60,
  },
  headerTitle: {
    fontSize: font.md,
    fontWeight: "700",
    color: colors.textPrimary,
    flex: 1,
    textAlign: "center",
  },
  mainInfo: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
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
  sellerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  sellerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primaryDim,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: colors.primaryLight,
  },
  sellerAvatarText: {
    color: colors.primary,
    fontWeight: "700",
    fontSize: font.sm,
  },
  sellerInfo: { flex: 1 },
  sellerName: {
    fontSize: font.md,
    fontWeight: "700",
    color: colors.textPrimary,
  },
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
  btnMoreSellerText: {
    color: colors.primary,
    fontWeight: "700",
    fontSize: font.md,
  },
});
