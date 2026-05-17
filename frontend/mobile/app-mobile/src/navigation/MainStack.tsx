// src/navigation/MainStack.tsx

import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import BottomNav from "./BottomNav";
import WeatherScreen from "../screens/WeatherScreen";
import ProfileScreen from "../screens/auth/profile/ProfileScreen";
import EditProfileScreen from "../screens/auth/profile/EditProfileScreen";
import ChangePasswordScreen from "../screens/auth/profile/ChangePasswordScreen";
import NotificationsScreen from "../screens/NotificationsScreen";
import DetailCorpScreen from "../screens/crops/DetailCorpScreen";
import NewCorpScreen from "../screens/crops/NewCorpScreen";
import NewTask from "../screens/crops/NewTask";
import ProductDetailScreen from "../screens/product/ProductDetailScreen";
import PublishProductScreen from "../screens/product/PublishProductScreen";
import MyListingsScreen from "../screens/auth/profile/MyListingsScreen";
import ChatScreen from "../screens/chat/ChatScreen";
import MarketPlaceScreen from "../screens/product/MarketplaceScreen";

const Stack = createNativeStackNavigator();

const MainStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="BottomNav" component={BottomNav} />
      <Stack.Screen name="WeatherScreen" component={WeatherScreen} />
      <Stack.Screen name="ProfileScreen" component={ProfileScreen} />
      <Stack.Screen name="EditProfileScreen" component={EditProfileScreen} />
      <Stack.Screen name="ChangePasswordScreen" component={ChangePasswordScreen} />
      <Stack.Screen name="NotificationsScreen" component={NotificationsScreen} />
      <Stack.Screen name="DetailCorpScreen" component={DetailCorpScreen} />
      <Stack.Screen name="NewCorpScreen" component={NewCorpScreen} />
      <Stack.Screen name="NewTask" component={NewTask} />
      <Stack.Screen name="ProductDetailScreen" component={ProductDetailScreen} />
      <Stack.Screen name="PublishProductScreen" component={PublishProductScreen} />
      <Stack.Screen name="MyListingsScreen" component={MyListingsScreen} />
      <Stack.Screen name="ChatScreen" component={ChatScreen} />
      <Stack.Screen name="MarketPlaceScreen" component={MarketPlaceScreen} />
    </Stack.Navigator>
  );
};

export default MainStack;