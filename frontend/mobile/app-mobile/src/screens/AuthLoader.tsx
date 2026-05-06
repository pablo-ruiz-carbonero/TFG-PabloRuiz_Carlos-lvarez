import React, { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function AuthLoader({ navigation }: any) {

  const [checking, setChecking] = useState(true);

  useEffect(() => {

    const checkAuth = async () => {

      const token =
        await AsyncStorage.getItem("token");

      if (token) {
        navigation.reset({
          index: 0,
          routes: [{ name: "Home" }],
        });
      } else {
        navigation.reset({
          index: 0,
          routes: [{ name: "Login" }],
        });
      }

      setChecking(false);
    };

    checkAuth();

  }, []);

  if (!checking) return null;

  return (
    <SafeAreaView style={{
      flex: 1,
      justifyContent: "center",
      alignItems: "center"
    }}>
      <ActivityIndicator size="large" />
    </SafeAreaView>
  );
}