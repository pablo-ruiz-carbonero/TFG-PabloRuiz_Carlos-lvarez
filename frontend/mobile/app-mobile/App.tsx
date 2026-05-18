// App.tsx

import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { View, ActivityIndicator } from "react-native";
import * as Font from "expo-font";
import { Ionicons } from "@expo/vector-icons";

import RootNavigator from "./src/navigation/AppNavigator";
import { AuthProvider } from "./src/features/auth/context/AuthContext";
import { CropsProvider } from "./src/features/crops/context/CropsContext";
import { ChatProvider } from "./src/features/chat/context/ChatContext";
import { ProductsProvider } from "./src/features/products/context/ProductsContext";
import { WeatherProvider } from "./src/features/weather/context/weatherContext";

export default function App() {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    Font.loadAsync(Ionicons.font).then(() => setFontsLoaded(true));
  }, []);

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <CropsProvider>
          <ChatProvider>
            <ProductsProvider>
              <WeatherProvider>
                <NavigationContainer>
                  <RootNavigator />
                </NavigationContainer>
              </WeatherProvider>
            </ProductsProvider>
          </ChatProvider>
        </CropsProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
