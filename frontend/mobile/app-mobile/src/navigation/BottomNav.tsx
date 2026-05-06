import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Text } from "react-native";
import HomeScreen from "../screens/HomeScreen";
import { colors, shared, font } from "../styles/theme";
import CropsScreen from "../screens/CropsScreen";
import MarketplaceScreen from "../screens/MarketplaceScreen";
import ChatListScreen from "../screens/ChatListScreen";

const Tab = createBottomTabNavigator();

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
      screenOptions={{
        headerShown: false,
        tabBarStyle: [shared.tabBar, { backgroundColor: colors.white }],
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: ({ focused }) => (
            <TabLabel label="Inicio" focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Crops"
        component={CropsScreen}
        options={{
          tabBarLabel: ({ focused }) => (
            <TabLabel label="Cultivos" focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="MarketPlace"
        component={MarketplaceScreen}
        options={{
          tabBarLabel: ({ focused }) => (
            <TabLabel label="Mercado" focused={focused} />
          ),
        }}
      />
            <Tab.Screen
        name="Chats"
        component={ChatListScreen}
        options={{
          tabBarLabel: ({ focused }) => (
            <TabLabel label="Mensajes" focused={focused} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
