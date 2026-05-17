// src/navigation/BottomNav.tsx

import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import HomeScreen from "../screens/HomeScreen";
import CropsScreen from "../screens/crops/CropsScreen";
import MarketplaceScreen from "../screens/product/MarketplaceScreen";
import ChatListScreen from "../screens/chat/ChatListScreen";

import { colors, shared, font } from "../styles/Globaltheme";

const Tab = createBottomTabNavigator();

type IoniconName = React.ComponentProps<typeof Ionicons>["name"];

const ICONS: Record<string, [IoniconName, IoniconName]> = {
  Home:        ["home-outline",       "home"],
  Crops:       ["leaf-outline",       "leaf"],
  MarketPlace: ["storefront-outline", "storefront"],
  Chats:       ["chatbubble-outline", "chatbubble"],
};

function TabLabel({ label, focused }: { label: string; focused: boolean }) {
  return (
    <Text
      style={[
        shared.tabLabel,
        focused && shared.tabLabelActive,
        { fontSize: font.xs },
      ]}
    >
      {label}
    </Text>
  );
}

export default function BottomNav() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: [shared.tabBar, { backgroundColor: colors.white }],
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarIcon: ({ focused, color, size }) => {
          const [outline, filled] = ICONS[route.name] ?? ["ellipse-outline", "ellipse"];
          return (
            <Ionicons
              name={focused ? filled : outline}
              size={size}
              color={color}
            />
          );
        },
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: ({ focused }) => <TabLabel label="Inicio" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Crops"
        component={CropsScreen}
        options={{
          tabBarLabel: ({ focused }) => <TabLabel label="Cultivos" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="MarketPlace"
        component={MarketplaceScreen}
        options={{
          tabBarLabel: ({ focused }) => <TabLabel label="Mercado" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Chats"
        component={ChatListScreen}
        options={{
          tabBarLabel: ({ focused }) => <TabLabel label="Mensajes" focused={focused} />,
        }}
      />
    </Tab.Navigator>
  );
}