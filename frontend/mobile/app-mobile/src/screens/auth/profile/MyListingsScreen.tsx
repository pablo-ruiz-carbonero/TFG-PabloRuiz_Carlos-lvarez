// src/screens/product/MyListingsScreen.tsx

import React, { useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  FlatList,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  useNavigation,
  NavigationProp,
  useFocusEffect,
} from "@react-navigation/native";
import {
  colors,
  shared,
  spacing,
  font,
  radius,
} from "../../../styles/Globaltheme";
import { RootStackParamList } from "../../../types/navigation";
import { Product } from "../../../features/products/types/products.types";
import { useProducts } from "../../../features/products/hooks/useProducts";

type Nav = NavigationProp<RootStackParamList>;

const CATEGORY_EMOJI: Record<string, string> = {
  Semillas: "🌱",
  Fertilizantes: "🧪",
  Maquinaria: "🚜",
  Fitosanitarios: "🛡️",
  Otros: "📦",
};

function ListingCard({
  item,
  onPress,
  onDelete,
}: {
  item: Product;
  onPress: () => void;
  onDelete: () => void;
}) {
  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && { opacity: 0.85 }]}
      onPress={onPress}
    >
      <View style={styles.cardLeft}>
        <View style={styles.imgBox}>
          <Text style={styles.imgEmoji}>
            {CATEGORY_EMOJI[item.category] ?? "📦"}
          </Text>
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.cardName} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={styles.cardCategory}>{item.category}</Text>
          <Text style={styles.cardPrice}>
            {item.price.toFixed(2)} {item.unit}
          </Text>
        </View>
      </View>

      <View style={styles.cardRight}>
        <View
          style={[
            styles.stockBadge,
            item.stock === 0 && styles.stockBadgeEmpty,
          ]}
        >
          <Text
            style={[
              styles.stockText,
              item.stock === 0 && styles.stockTextEmpty,
            ]}
          >
            {item.stock === 0 ? "Sin stock" : `${item.stock} uds`}
          </Text>
        </View>
        <Pressable onPress={onDelete} hitSlop={8} style={styles.deleteBtn}>
          <Text style={styles.deleteBtnText}>🗑</Text>
        </Pressable>
      </View>
    </Pressable>
  );
}

export default function MyListingsScreen() {
  const navigation = useNavigation<Nav>();
  const { myProducts, loading, error, fetchMyProducts, deleteProduct } =
    useProducts();

  useFocusEffect(
    useCallback(() => {
      fetchMyProducts();
    }, []),
  );

  const handleDelete = (item: Product) => {
    Alert.alert(
      "Eliminar anuncio",
      `¿Quieres eliminar "${item.name}" del mercado?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteProduct(item.id);
            } catch {
              Alert.alert("Error", "No se pudo eliminar el producto.");
            }
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView style={shared.screen}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
          <Text style={styles.backButton}>← Volver</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Mis anuncios</Text>
        <Pressable
          style={({ pressed }) => [styles.btnNew, pressed && { opacity: 0.8 }]}
          onPress={() => navigation.navigate("PublishProductScreen")}
        >
          <Text style={styles.btnNewText}>+ Nuevo</Text>
        </Pressable>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>{error}</Text>
          <Pressable style={shared.btnPrimary} onPress={fetchMyProducts}>
            <Text style={shared.btnPrimaryText}>Reintentar</Text>
          </Pressable>
        </View>
      ) : myProducts.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyIcon}>📦</Text>
          <Text style={styles.emptyTitle}>Sin anuncios publicados</Text>
          <Text style={styles.emptySubtitle}>
            Publica tu primer producto y llega a otros agricultores
          </Text>
          <Pressable
            style={styles.btnCreate}
            onPress={() => navigation.navigate("PublishProductScreen")}
          >
            <Text style={styles.btnCreateText}>Publicar producto</Text>
          </Pressable>
        </View>
      ) : (
        <>
          <Text style={styles.count}>
            {myProducts.length} anuncio{myProducts.length !== 1 ? "s" : ""}{" "}
            publicado{myProducts.length !== 1 ? "s" : ""}
          </Text>
          <FlatList
            data={myProducts}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <ListingCard
                item={item}
                onPress={() =>
                  navigation.navigate("ProductDetailScreen", {
                    productId: item.id,
                  })
                }
                onDelete={() => handleDelete(item)}
              />
            )}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    color: colors.primary,
    fontSize: font.md,
    fontWeight: "600",
    width: 60,
  },
  headerTitle: {
    fontSize: font.lg,
    fontWeight: "800",
    color: colors.textPrimary,
  },
  btnNew: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
  },
  btnNewText: { color: colors.white, fontWeight: "700", fontSize: font.sm },
  count: {
    fontSize: font.xs,
    color: colors.textMuted,
    fontWeight: "600",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  listContent: { paddingBottom: spacing.xxxl },
  card: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
  },
  cardLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    flex: 1,
  },
  imgBox: {
    width: 52,
    height: 52,
    borderRadius: radius.md,
    backgroundColor: colors.primaryDim,
    alignItems: "center",
    justifyContent: "center",
  },
  imgEmoji: { fontSize: 24 },
  cardInfo: { flex: 1 },
  cardName: { fontSize: font.md, fontWeight: "700", color: colors.textPrimary },
  cardCategory: { fontSize: font.xs, color: colors.textMuted, marginTop: 2 },
  cardPrice: {
    fontSize: font.sm,
    fontWeight: "700",
    color: colors.primary,
    marginTop: 4,
  },
  cardRight: { alignItems: "flex-end", gap: spacing.sm },
  stockBadge: {
    backgroundColor: colors.primaryDim,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
  },
  stockBadgeEmpty: { backgroundColor: colors.errorDim },
  stockText: { fontSize: font.xs, color: colors.primary, fontWeight: "600" },
  stockTextEmpty: { color: colors.error },
  deleteBtn: { padding: spacing.xs },
  deleteBtnText: { fontSize: 16 },
  separator: { height: 1, backgroundColor: colors.border },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.md,
  },
  errorText: { fontSize: font.md, color: colors.error },
  emptyIcon: { fontSize: 48 },
  emptyTitle: {
    fontSize: font.lg,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  emptySubtitle: {
    fontSize: font.sm,
    color: colors.textSecond,
    textAlign: "center",
    paddingHorizontal: spacing.xxl,
  },
  btnCreate: {
    backgroundColor: colors.primary,
    marginTop: spacing.sm,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
  },
  btnCreateText: { color: colors.white, fontWeight: "700", fontSize: font.md },
});
