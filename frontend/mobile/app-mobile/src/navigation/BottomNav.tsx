import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Text } from "react-native";
import HomeScreen from "../screens/HomeScreen";
import WeatherScreen from "../screens/WeatherScreen";
import { colors, shared, font } from "../styles/theme";
import CropsScreen from "../screens/CropsScreen";

const Tab = createBottomTabNavigator();

function TabLabel({ label, focused }: { label: string; focused: boolean }) {
  return (
    <Text style={[shared.tabLabel, focused && shared.tabLabelActive, { fontSize: font.xs }]}>
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
        options={{ tabBarLabel: ({ focused }) => <TabLabel label="Inicio" focused={focused} /> }}
      />
      <Tab.Screen
        name="Crops"
        component={CropsScreen}
        options={{ tabBarLabel: ({ focused }) => <TabLabel label="Cultivos" focused={focused} /> }}
      />
    </Tab.Navigator>
  );
}