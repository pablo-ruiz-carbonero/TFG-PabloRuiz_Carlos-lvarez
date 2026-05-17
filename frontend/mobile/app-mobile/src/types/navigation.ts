// src/types/navigation.ts

// ─── BottomNav tabs ───────────────────────────────────────────────────────────
// Nombres exactos de los Tab.Screen en BottomNav.tsx
export type BottomTabParamList = {
  Home: undefined;
  Crops: undefined;
  MarketPlace: undefined;
  Chats: undefined;
};

// ─── MainStack ────────────────────────────────────────────────────────────────
// Incluye BottomNav como pantalla raíz con sus params anidados
export type RootStackParamList = {
<<<<<<< HEAD
  // ── Auth ────────────────────────────────────────────────────────────────────
  Login: undefined;
  Register: undefined;

  // ── Raíz (BottomNav) ────────────────────────────────────────────────────────
  BottomNav: {
    screen?: keyof BottomTabParamList;
  } | undefined;

  // ── Crops ────────────────────────────────────────────────────────────────────
=======
  // ── Auth ──────────────────────────────────────────────────
  Login: undefined;
  Register: undefined;

  // ── BottomNav tabs ────────────────────────────────────────
  Home: undefined;
  CropsScreen: undefined;
  MarketplaceScreen: undefined;
  ChatListScreen: undefined;

  // ── Crops stack ───────────────────────────────────────────
>>>>>>> bde9bfa08138ad909d6680ffafd4d5a2bbf04f20
  NewCorpScreen: undefined;
  DetailCorpScreen: { cropId: string };
  NewTask: { cropId: string };

<<<<<<< HEAD
  // ── Marketplace ──────────────────────────────────────────────────────────────
=======
  // ── Marketplace stack ─────────────────────────────────────
>>>>>>> bde9bfa08138ad909d6680ffafd4d5a2bbf04f20
  ProductDetailScreen: { productId: string };
  PublishProductScreen: undefined;
  MyListingsScreen: undefined;

<<<<<<< HEAD
  // ── Chat ─────────────────────────────────────────────────────────────────────
=======
  // ── Chat stack ────────────────────────────────────────────
>>>>>>> bde9bfa08138ad909d6680ffafd4d5a2bbf04f20
  ChatScreen: {
    conversationId: string;
    participantName: string;
    participantInitials: string;
    online: boolean;
  };

<<<<<<< HEAD
  // ── Perfil ───────────────────────────────────────────────────────────────────
=======
  // ── Perfil stack ──────────────────────────────────────────
>>>>>>> bde9bfa08138ad909d6680ffafd4d5a2bbf04f20
  ProfileScreen: undefined;
  EditProfileScreen: undefined;
  NotificationsScreen: undefined;
  ChangePasswordScreen: undefined;

<<<<<<< HEAD
  // ── Otras ────────────────────────────────────────────────────────────────────
=======
  // ── Otras ─────────────────────────────────────────────────
>>>>>>> bde9bfa08138ad909d6680ffafd4d5a2bbf04f20
  WeatherScreen: undefined;
  ConfiguracionScreen: undefined;
};