// src/types/navigation.ts

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Home: undefined;
  ConfiguracionScreen: undefined;
  WeatherScreen: undefined;
  ProfileScreen: undefined;
  NewCorpScreen: undefined;
  CropsScreen: undefined;
  DetailCorpScreen: { cropId: string };
  NewTask: { cropId: string };
};
