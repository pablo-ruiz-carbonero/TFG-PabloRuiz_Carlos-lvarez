// src/screens/product/ProductDetailScreen.tsx

import React, { useEffect, useState } from "react";
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
import { MaterialIcons, MaterialCommunityIcons } from "@expo/vector-icons";
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
import { useAuth } from "../../features/auth/hooks/useAuth";

type RouteP = RouteProp<RootStackParamList, "ProductDetailScreen">;
type Nav = NavigationProp<RootStackParamList>;

const SCREEN_WIDTH = Dimensions.get("window").width;
const GALLERY_HEIGHT = 260;

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
  size = 40,
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

// ─── Carrusel de fotos ────────────────────────────────────────────────────────
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
        <CategoryIcon category={category} size={64} color={colors.primary} />
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
  image: { width: SCREEN_WIDTH, height: GALLERY_HEIGHT },
  placeholder: {
    height: GALLERY_HEIGHT,
    backgroundColor: colors.primaryDim,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
  },
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
  dotActive: { backgroundColor: colors.white, width: 18, borderRadius: 3 },
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

// ─── Pantalla principal ───────────────────────────────────────────────────────
export default function ProductDetailScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<RouteP>();
  const { productId } = route.params;

  const { product, loading, error, loadProduct } = useProductDetail(productId);
  const { getOrCreateConversation } = useChat();
  const { user } = useAuth();

  const isOwnProduct =
    !!user &&
    !!product &&
    (String(user.id) === product.seller.id || product.seller.id === "me");

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
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
            <Text style={styles.backButton}>← Volver</Text>
          </Pressable>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {product.name}
          </Text>
          <View style={{ width: 60 }} />
        </View>

        {/* Carrusel */}
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
            <MaterialIcons
              name="inventory-2"
              size={13}
              color={colors.primary}
            />
            <Text style={styles.badgeText}> Stock: {product.stock}</Text>
          </View>
          <View style={styles.badge}>
            <MaterialIcons
              name="location-on"
              size={13}
              color={colors.primary}
            />
            <Text style={styles.badgeText}> {product.location}</Text>
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
          <View style={styles.sectionTitleRow}>
            <MaterialIcons
              name="location-on"
              size={16}
              color={colors.textPrimary}
            />
            <Text style={shared.sectionTitle}> Ubicación</Text>
          </View>
          <Text style={styles.locationText}>{product.province}</Text>
        </View>

        {/* Acciones */}
        <View style={styles.actionButtons}>
          {isOwnProduct ? (
            <Pressable
              style={({ pressed }) => [
                styles.btnMyListings,
                pressed && { opacity: 0.85 },
              ]}
              onPress={() => navigation.navigate("MyListingsScreen")}
            >
              <MaterialIcons name="list-alt" size={18} color={colors.primary} />
              <Text style={styles.btnMyListingsText}>
                {" "}
                Ver mis publicaciones
              </Text>
            </Pressable>
          ) : (
            <>
              <Pressable
                style={({ pressed }) => [
                  styles.btnContact,
                  pressed && { opacity: 0.85 },
                ]}
                onPress={handleContactSeller}
              >
                <MaterialIcons
                  name="chat-bubble-outline"
                  size={18}
                  color={colors.white}
                />
                <Text style={styles.btnContactText}> Contactar vendedor</Text>
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
                <MaterialIcons name="store" size={18} color={colors.primary} />
                <Text style={styles.btnMoreSellerText}>
                  {" "}
                  Ver más de este vendedor
                </Text>
              </Pressable>
            </>
          )}
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
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.primaryDim,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radius.full,
  },
  badgeText: { fontSize: font.xs, color: colors.primary, fontWeight: "600" },
  section: { marginHorizontal: spacing.lg, marginBottom: spacing.md },
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.xs,
  },
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary,
    paddingVertical: spacing.md + 2,
    borderRadius: radius.md,
  },
  btnContactText: { color: colors.white, fontWeight: "700", fontSize: font.md },
  btnMoreSeller: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
  },
  btnMoreSellerText: {
    color: colors.primary,
    fontWeight: "700",
    fontSize: font.md,
  },
  btnMyListings: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primaryDim,
    paddingVertical: spacing.md + 2,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  btnMyListingsText: {
    color: colors.primary,
    fontWeight: "700",
    fontSize: font.md,
  },
});
