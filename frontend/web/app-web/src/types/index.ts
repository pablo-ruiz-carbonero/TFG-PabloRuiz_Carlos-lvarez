export type UserRole = 'farmer' | 'distributor' | 'supplier' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  token?: string;
}

export type CropStatus = 'growing' | 'harvested' | 'failed';

export type ActivityType = 'irrigation' | 'fertilization' | 'harvest' | 'pest';

export interface Activity {
  id: string;
  cropId: string;
  type: ActivityType;
  date: string;
  details: string;
  quantity?: number;
  unit?: string;
}

export interface Crop {
  id: string;
  name: string;
  variety: string;
  soilType: string;
  area: number; // in hectares
  plantingDate: string;
  status: CropStatus;
  farmerId: string;
  activities: Activity[];
}

export type ProductCategory = 'seeds' | 'machinery' | 'crops' | 'inputs';

export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  category: ProductCategory;
  image?: string;
  images?: string[];
  stock: number;
  unit: string; // e.g., "kg", "unidades", "sacos", "toneladas"
  location: string;
  sellerId: string;
  sellerName: string;
  sellerRole: UserRole;
  createdAt: string;
}

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  receiverId: string;
  receiverName: string;
  content: string;
  timestamp: string;
  read: boolean;
}

export interface Chat {
  id: string;
  participantId: string;
  participantName: string;
  participantRole: UserRole;
  messages: Message[];
  lastMessage?: Message;
}

export interface WeatherData {
  temp: number;
  tempMin: number;
  tempMax: number;
  humidity: number;
  windSpeed: number;
  description: string;
  icon: string;
  condition: string;
  forecast: {
    date: string;
    temp: number;
    description: string;
    icon: string;
  }[];
}
