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
  // ── Auth ────────────────────────────────────────────────────────────────────
  Login: undefined;
  Register: undefined;

  // ── Raíz (BottomNav) ────────────────────────────────────────────────────────
  BottomNav:
    | {
        screen?: keyof BottomTabParamList;
      }
    | undefined;

  // ── Crops ────────────────────────────────────────────────────────────────────
  NewCropScreen: undefined;
  DetailCropScreen: { cropId: string };
  NewTask: { cropId: string; preselect?: string };

  // ── Marketplace ──────────────────────────────────────────────────────────────
  ProductDetailScreen: { productId: string };
  PublishProductScreen: undefined;
  MyListingsScreen: undefined;

  // ── Chat ─────────────────────────────────────────────────────────────────────
  ChatScreen: {
    conversationId: string;
    participantName: string;
    participantInitials: string;
    online: boolean;
  };

  // ── Perfil ───────────────────────────────────────────────────────────────────
  ProfileScreen: undefined;
  EditProfileScreen: undefined;
  NotificationsScreen: undefined;
  ChangePasswordScreen: undefined;

  // ── Otras ────────────────────────────────────────────────────────────────────
  WeatherScreen: undefined;
  ConfiguracionScreen: undefined;
};