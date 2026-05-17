// src/navigation/AppNavigator.tsx

<<<<<<< HEAD
import React from "react";
import { useAuth } from "../features/auth/hooks/useAuth";
import AuthStack from "./AuthStack";
import MainStack from "./MainStack";
import { View, ActivityIndicator } from "react-native";
=======
import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen";
import BottomNav from "../navigation/BottomNav";
import { ActivityIndicator, View } from "react-native";
import NewCorpScreen from "../screens/NewCorpScreen";
import CropsScreen from "../screens/CropsScreen";
import DetailCorpScreen from "../screens/DetailCorpScreen";
import NewTaskScreen from "../screens/NewTask";
import ChatListScreen from "../screens/ChatListScreen";
import WeatherScreen from "../screens/WeatherScreen";
import ProductDetailScreen from "../screens/ProductDetailScreen";
import PublishProductScreen from "../screens/PublishProductScreen";
import ChatScreen from "../screens/WeatherScreen";
import MarketPlaceScreen from "../screens/MarketplaceScreen";
import EditProfileScreen from "../screens/EditProfileScreen";
import MyListingsScreen from "../screens/MyListingsScreen";
import NotificationsScreen from "../screens/NotificationsScreen";
import ChangePasswordScreen from "../screens/ChangePasswordScreen";
import ProfileScreen from "../screens/ProfileScreen";
>>>>>>> bde9bfa08138ad909d6680ffafd4d5a2bbf04f20

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

<<<<<<< HEAD
  // Switch automático
  return user ? <MainStack /> : <AuthStack />;
};

export default AppNavigator;
=======
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {token ? (
        <>
          <Stack.Screen name="Main" component={BottomNav} />
          <Stack.Screen name="ProfileScreen" component={ProfileScreen} />
          <Stack.Screen name="NewCorpScreen" component={NewCorpScreen} />
          <Stack.Screen name="CropsScreen" component={CropsScreen} />
          <Stack.Screen name="DetailCorpScreen" component={DetailCorpScreen} />
          <Stack.Screen name="NewTask" component={NewTaskScreen} />
          <Stack.Screen name="ChatListScreen" component={ChatListScreen} />
          <Stack.Screen name="WeatherScreen" component={WeatherScreen} />
          <Stack.Screen
            name="ProductDetailScreen"
            component={ProductDetailScreen}
          />
          <Stack.Screen
            name="PublishProductScreen"
            component={PublishProductScreen}
          />
          <Stack.Screen name="ChatScreen" component={ChatScreen} />
          <Stack.Screen
            name="MarketplaceScreen"
            component={MarketPlaceScreen}
          />
          <Stack.Screen
            name="EditProfileScreen"
            component={EditProfileScreen}
          />
          <Stack.Screen name="MyListingsScreen" component={MyListingsScreen} />
          <Stack.Screen
            name="NotificationsScreen"
            component={NotificationsScreen}
          />
          <Stack.Screen
            name="ChangePasswordScreen"
            component={ChangePasswordScreen}
          />
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
>>>>>>> bde9bfa08138ad909d6680ffafd4d5a2bbf04f20
