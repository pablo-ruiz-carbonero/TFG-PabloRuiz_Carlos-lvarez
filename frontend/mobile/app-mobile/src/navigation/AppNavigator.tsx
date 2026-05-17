// src/navigation/AppNavigator.tsx

import React from "react";
import { useAuth } from "../features/auth/hooks/useAuth";
import AuthStack from "./AuthStack";
import MainStack from "./MainStack";
import { View, ActivityIndicator } from "react-native";

const AppNavigator = () => {
  const { user, loading } = useAuth();

  // ⏳ Mientras carga sesión
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // Switch automático
  return user ? <MainStack /> : <AuthStack />;
};

export default AppNavigator;