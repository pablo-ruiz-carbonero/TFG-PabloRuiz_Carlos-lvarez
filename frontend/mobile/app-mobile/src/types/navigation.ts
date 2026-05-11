// src/types/navigation.ts

export type RootStackParamList = {
  // ── Auth ──────────────────────────────────────────────────
  Login: undefined;
  Register: undefined;

  // ── BottomNav tabs ────────────────────────────────────────
  Home: undefined;
  CropsScreen: undefined;
  MarketplaceScreen: undefined;
  ChatListScreen: undefined;

  // ── Crops stack ───────────────────────────────────────────
  NewCorpScreen: undefined;
  DetailCorpScreen: { cropId: string };
  NewTask: { cropId: string };

  // ── Marketplace stack ─────────────────────────────────────
  ProductDetailScreen: { productId: string };
  PublishProductScreen: undefined;
  MyListingsScreen: undefined;

  // ── Chat stack ────────────────────────────────────────────
  ChatScreen: {
    conversationId: string;
    participantName: string;
    participantInitials: string;
    online: boolean;
  };

  // ── Perfil stack ──────────────────────────────────────────
  ProfileScreen: undefined;
  EditProfileScreen: undefined;
  NotificationsScreen: undefined;
  ChangePasswordScreen: undefined;

  // ── Otras ─────────────────────────────────────────────────
  WeatherScreen: undefined;
  ConfiguracionScreen: undefined;
};