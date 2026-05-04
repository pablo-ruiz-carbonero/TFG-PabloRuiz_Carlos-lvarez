import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React, { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen";
import BottomNav from "../navigation/BottomNav";
import { ActivityIndicator, View } from "react-native";
import { ProfileScreen } from "../screens/ProfileScreen";
import NewCorpScreen from "../screens/NewCorpScreen";
import CropsScreen from "../screens/CropsScreen";
import DetailCorpScreen from "../screens/DetailCorpScreen";
const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);

  const checkToken = async () => {
    const stored = await AsyncStorage.getItem("token");
    setToken(stored);
    setLoading(false);
  };

  useEffect(() => {
    checkToken();
  }, []);

  // 👇 CLAVE: volver a comprobar periódicamente
  useEffect(() => {
    const interval = setInterval(() => {
      checkToken();
    }, 800);

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {token ? (
        <>
          <Stack.Screen name="Main" component={BottomNav} />
          <Stack.Screen name="ProfileScreen" component={ProfileScreen} />
          <Stack.Screen name="NewCorpScreen" component={NewCorpScreen} />
          <Stack.Screen name="CropsScreen" component={CropsScreen} />
          <Stack.Screen name="DetailCorpScreen" component={DetailCorpScreen} />
        </>
      ) : (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}