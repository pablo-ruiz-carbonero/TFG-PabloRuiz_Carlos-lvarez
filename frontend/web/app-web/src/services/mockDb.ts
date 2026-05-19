import { User, Crop, Activity, Product, Message, Chat } from '../types';

const DB_KEY = 'agro_db';

interface DbState {
  users: (User & { passwordHash: string })[];
  crops: Crop[];
  products: Product[];
  messages: Message[];
}

const INITIAL_USERS = [
  {
    id: 'user_juan',
    name: 'Juan Pérez (Agricultor)',
    email: 'juan@agri.com',
    phone: '+34 600 111 222',
    role: 'farmer' as const,
    passwordHash: 'juan123',
  },
  {
    id: 'user_carlos',
    name: 'Carlos Gómez (Distribuidor Agrícola)',
    email: 'carlos@dist.com',
    phone: '+34 611 222 333',
    role: 'distributor' as const,
    passwordHash: 'carlos123',
  },
  {
    id: 'user_ana',
    name: 'Ana Martínez (Suministros del Valle)',
    email: 'ana@prov.com',
    phone: '+34 622 333 444',
    role: 'supplier' as const,
    passwordHash: 'ana123',
  },
  {
    id: 'user_admin',
    name: 'Administrador del Sistema',
    email: 'admin@agro.com',
    phone: '+34 633 444 555',
    role: 'admin' as const,
    passwordHash: 'admin123',
  },
];

const INITIAL_CROPS = [
  {
    id: 'crop_1',
    name: 'Tomate Raf',
    variety: 'Raf Seleccionado',
    soilType: 'Arcilloso-Limón',
    area: 2.5,
    plantingDate: '2026-03-01',
    status: 'growing' as const,
    farmerId: 'user_juan',
    activities: [
      { id: 'act_1', cropId: 'crop_1', type: 'irrigation' as const, date: '2026-03-02', details: 'Riego por goteo inicial', quantity: 2000, unit: 'L' },
      { id: 'act_2', cropId: 'crop_1', type: 'fertilization' as const, date: '2026-03-15', details: 'Aporte nitrógeno orgánico', quantity: 100, unit: 'kg' },
      { id: 'act_3', cropId: 'crop_1', type: 'irrigation' as const, date: '2026-04-01', details: 'Riego intermedio primavera', quantity: 2500, unit: 'L' },
      { id: 'act_4', cropId: 'crop_1', type: 'pest' as const, date: '2026-04-20', details: 'Tratamiento preventivo pulgón con jabón potásico' },
      { id: 'act_5', cropId: 'crop_1', type: 'irrigation' as const, date: '2026-05-10', details: 'Riego pre-cosecha', quantity: 3000, unit: 'L' },
    ],
  },
  {
    id: 'crop_2',
    name: 'Trigo Blando',
    variety: 'Artur Nick',
    soilType: 'Calizo',
    area: 10.0,
    plantingDate: '2025-11-15',
    status: 'harvested' as const,
    farmerId: 'user_juan',
    activities: [
      { id: 'act_6', cropId: 'crop_2', type: 'fertilization' as const, date: '2025-11-20', details: 'Abonado de fondo', quantity: 500, unit: 'kg' },
      { id: 'act_7', cropId: 'crop_2', type: 'irrigation' as const, date: '2026-02-10', details: 'Riego de apoyo por aspersión', quantity: 8000, unit: 'L' },
      { id: 'act_8', cropId: 'crop_2', type: 'harvest' as const, date: '2026-05-10', details: 'Cosecha con cosechadora John Deere', quantity: 12, unit: 'toneladas' },
    ],
  },
  {
    id: 'crop_3',
    name: 'Lechuga Romana',
    variety: 'Verde Romana',
    soilType: 'Arenoso',
    area: 1.2,
    plantingDate: '2026-04-10',
    status: 'growing' as const,
    farmerId: 'user_juan',
    activities: [
      { id: 'act_9', cropId: 'crop_3', type: 'irrigation' as const, date: '2026-04-11', details: 'Riego por aspersión fino', quantity: 1200, unit: 'L' },
      { id: 'act_10', cropId: 'crop_3', type: 'irrigation' as const, date: '2026-04-25', details: 'Riego periódico', quantity: 1500, unit: 'L' },
      { id: 'act_11', cropId: 'crop_3', type: 'fertilization' as const, date: '2026-05-02', details: 'Compost maduro superficial', quantity: 200, unit: 'kg' },
    ],
  },
];

const INITIAL_PRODUCTS = [
  {
    id: 'prod_1',
    title: 'Semillas de Alfalfa Certificadas',
    description: 'Semillas de alfalfa de alta germinación, variedad Aragón. Certificadas y listas para la siembra en secano o regadío. Alta resistencia a plagas y excelente rendimiento forrajero.',
    price: 45.0,
    category: 'seeds' as const,
    image: 'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?auto=format&fit=crop&q=80&w=400',
    stock: 150,
    unit: 'saco 25kg',
    location: 'Zaragoza, Aragón',
    sellerId: 'user_ana',
    sellerName: 'Ana Martínez (Suministros del Valle)',
    sellerRole: 'supplier' as const,
    createdAt: '2026-05-10T10:00:00Z',
  },
  {
    id: 'prod_2',
    title: 'Alquiler de Tractor John Deere 6120M',
    description: 'Alquiler de tractor moderno John Deere 6120M (120 CV). Equipado con guiado GPS, cabina Premium y tripuntal delantero. Mantenimiento y seguro a todo riesgo incluidos. Se requiere fianza.',
    price: 120.0,
    category: 'machinery' as const,
    image: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&q=80&w=400',
    stock: 2,
    unit: 'día',
    location: 'Lérida, Cataluña',
    sellerId: 'user_ana',
    sellerName: 'Ana Martínez (Suministros del Valle)',
    sellerRole: 'supplier' as const,
    createdAt: '2026-05-12T14:30:00Z',
  },
  {
    id: 'prod_3',
    title: 'Cosecha de Trigo Limpio de Invierno',
    description: 'Cosecha propia de trigo de invierno variedad Artur Nick. Excelente peso específico, seleccionado y ensilado en condiciones óptimas de humedad (12%). Apto para panificación o pienso.',
    price: 280.0,
    category: 'crops' as const,
    image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&q=80&w=400',
    stock: 12,
    unit: 'tonelada',
    location: 'Sevilla, Andalucía',
    sellerId: 'user_juan',
    sellerName: 'Juan Pérez (Agricultor)',
    sellerRole: 'farmer' as const,
    createdAt: '2026-05-11T09:15:00Z',
  },
  {
    id: 'prod_4',
    title: 'Fertilizante Ecológico NPK Líquido',
    description: 'Abono NPK de origen orgánico certificado para agricultura ecológica. Estimula el enraizamiento y la floración de forma natural. Apto para fertirrigación o aplicación foliar.',
    price: 35.0,
    category: 'inputs' as const,
    image: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&q=80&w=400',
    stock: 80,
    unit: 'garrafa 20L',
    location: 'Zaragoza, Aragón',
    sellerId: 'user_ana',
    sellerName: 'Ana Martínez (Suministros del Valle)',
    sellerRole: 'supplier' as const,
    createdAt: '2026-05-09T08:00:00Z',
  },
];

const INITIAL_MESSAGES = [
  {
    id: 'msg_1',
    senderId: 'user_carlos',
    senderName: 'Carlos Gómez (Distribuidor Agrícola)',
    receiverId: 'user_juan',
    receiverName: 'Juan Pérez (Agricultor)',
    content: 'Hola Juan, estoy interesado en tu cosecha de trigo. ¿Haces envíos a la provincia de Badajoz?',
    timestamp: '2026-05-18T16:20:00Z',
    read: true,
  },
  {
    id: 'msg_2',
    senderId: 'user_juan',
    senderName: 'Juan Pérez (Agricultor)',
    receiverId: 'user_carlos',
    receiverName: 'Carlos Gómez (Distribuidor Agrícola)',
    content: 'Hola Carlos, sí, podemos organizar el transporte si compras un mínimo de 5 toneladas. Tengo tarifas de transporte bastante competitivas.',
    timestamp: '2026-05-18T16:45:00Z',
    read: true,
  },
  {
    id: 'msg_3',
    senderId: 'user_carlos',
    senderName: 'Carlos Gómez (Distribuidor Agrícola)',
    receiverId: 'user_juan',
    receiverName: 'Juan Pérez (Agricultor)',
    content: 'Perfecto, me interesa comprar 8 toneladas. ¿Podríamos coordinar la fecha para la semana que viene? ¿Qué precio final me dejarías con transporte incluido?',
    timestamp: '2026-05-18T17:02:00Z',
    read: false,
  },
  {
    id: 'msg_4',
    senderId: 'user_juan',
    senderName: 'Juan Pérez (Agricultor)',
    receiverId: 'user_ana',
    receiverName: 'Ana Martínez (Suministros del Valle)',
    content: 'Hola Ana, ¿tenéis stock del fertilizante NPK ecológico en Zaragoza para retirar mañana?',
    timestamp: '2026-05-19T09:30:00Z',
    read: true,
  },
  {
    id: 'msg_5',
    senderId: 'user_ana',
    senderName: 'Ana Martínez (Suministros del Valle)',
    receiverId: 'user_juan',
    receiverName: 'Juan Pérez (Agricultor)',
    content: 'Hola Juan, sí, nos quedan unas 80 garrafas en el almacén de Zaragoza. Te reservo las que necesites. ¿Cuántas te apunto?',
    timestamp: '2026-05-19T10:15:00Z',
    read: true,
  },
];

export const initDb = (): DbState => {
  const existing = localStorage.getItem(DB_KEY);
  if (existing) {
    try {
      return JSON.parse(existing);
    } catch (e) {
      console.error('Error reading DB', e);
    }
  }

  const newState = {
    users: INITIAL_USERS,
    crops: INITIAL_CROPS,
    products: INITIAL_PRODUCTS,
    messages: INITIAL_MESSAGES,
  };
  localStorage.setItem(DB_KEY, JSON.stringify(newState));
  return newState;
};

export const getDb = (): DbState => {
  return initDb();
};

export const saveDb = (state: DbState): void => {
  localStorage.setItem(DB_KEY, JSON.stringify(state));
};

// --- API SIMULATOR HELPERS ---

export const dbService = {
  // Auth
  login: (email: string, passwordHash: string): { user: User; token: string } | null => {
    const db = getDb();
    const found = db.users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.passwordHash === passwordHash);
    if (!found) return null;
    const { passwordHash: _, ...user } = found;
    return {
      user,
      token: `mock-jwt-token-for-${user.id}-${Date.now()}`,
    };
  },

  register: (name: string, email: string, passwordHash: string, phone: string, role: 'farmer' | 'distributor' | 'supplier' | 'admin'): { user: User; token: string } => {
    const db = getDb();
    const id = `user_${Date.now()}`;
    const newUser = { id, name, email, phone, role, passwordHash };
    db.users.push(newUser);
    saveDb(db);

    const { passwordHash: _, ...user } = newUser;
    return {
      user,
      token: `mock-jwt-token-for-${id}-${Date.now()}`,
    };
  },

  getUsers: (): User[] => {
    const db = getDb();
    return db.users.map(({ passwordHash: _, ...u }) => u);
  },

  // Crops
  getCrops: (farmerId: string): Crop[] => {
    const db = getDb();
    return db.crops.filter(c => c.farmerId === farmerId);
  },

  getAllCrops: (): Crop[] => {
    const db = getDb();
    return db.crops;
  },

  addCrop: (cropData: Omit<Crop, 'id' | 'activities'>): Crop => {
    const db = getDb();
    const newCrop: Crop = {
      ...cropData,
      id: `crop_${Date.now()}`,
      activities: [],
    };
    db.crops.push(newCrop);
    saveDb(db);
    return newCrop;
  },

  updateCrop: (cropId: string, updated: Partial<Crop>): Crop => {
    const db = getDb();
    const idx = db.crops.findIndex(c => c.id === cropId);
    if (idx === -1) throw new Error('Crop not found');
    db.crops[idx] = { ...db.crops[idx], ...updated } as Crop;
    saveDb(db);
    return db.crops[idx];
  },

  deleteCrop: (cropId: string): void => {
    const db = getDb();
    db.crops = db.crops.filter(c => c.id !== cropId);
    saveDb(db);
  },

  // Crop Activities
  addActivity: (cropId: string, activityData: Omit<Activity, 'id' | 'cropId'>): Activity => {
    const db = getDb();
    const cropIdx = db.crops.findIndex(c => c.id === cropId);
    if (cropIdx === -1) throw new Error('Crop not found');

    const newActivity: Activity = {
      ...activityData,
      id: `act_${Date.now()}`,
      cropId,
    };

    db.crops[cropIdx].activities.push(newActivity);
    saveDb(db);
    return newActivity;
  },

  deleteActivity: (cropId: string, activityId: string): void => {
    const db = getDb();
    const cropIdx = db.crops.findIndex(c => c.id === cropId);
    if (cropIdx === -1) return;
    db.crops[cropIdx].activities = db.crops[cropIdx].activities.filter(a => a.id !== activityId);
    saveDb(db);
  },

  // Products
  getProducts: (): Product[] => {
    const db = getDb();
    return db.products.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  addProduct: (productData: Omit<Product, 'id' | 'createdAt'>): Product => {
    const db = getDb();
    const newProduct: Product = {
      ...productData,
      id: `prod_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    db.products.push(newProduct);
    saveDb(db);
    return newProduct;
  },

  updateProduct: (productId: string, updated: Partial<Product>): Product => {
    const db = getDb();
    const idx = db.products.findIndex(p => p.id === productId);
    if (idx === -1) throw new Error('Product not found');
    db.products[idx] = { ...db.products[idx], ...updated } as Product;
    saveDb(db);
    return db.products[idx];
  },

  deleteProduct: (productId: string): void => {
    const db = getDb();
    db.products = db.products.filter(p => p.id !== productId);
    saveDb(db);
  },

  // Messaging / Chats
  getChats: (userId: string): Chat[] => {
    const db = getDb();
    const userMessages = db.messages.filter(m => m.senderId === userId || m.receiverId === userId);
    
    // Group by participant (the other user)
    const chatsMap = new Map<string, Message[]>();
    
    userMessages.forEach(msg => {
      const otherId = msg.senderId === userId ? msg.receiverId : msg.senderId;
      if (!chatsMap.has(otherId)) {
        chatsMap.set(otherId, []);
      }
      chatsMap.get(otherId)!.push(msg);
    });

    const chats: Chat[] = [];
    chatsMap.forEach((msgs, otherId) => {
      const sortedMsgs = msgs.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
      const otherUser = db.users.find(u => u.id === otherId);
      if (otherUser) {
        chats.push({
          id: `chat_${userId}_${otherId}`,
          participantId: otherId,
          participantName: otherUser.name,
          participantRole: otherUser.role,
          messages: sortedMsgs,
          lastMessage: sortedMsgs[sortedMsgs.length - 1],
        });
      }
    });

    return chats.sort((a, b) => {
      const aTime = a.lastMessage ? new Date(a.lastMessage.timestamp).getTime() : 0;
      const bTime = b.lastMessage ? new Date(b.lastMessage.timestamp).getTime() : 0;
      return bTime - aTime;
    });
  },

  sendMessage: (senderId: string, receiverId: string, content: string): Message => {
    const db = getDb();
    const sender = db.users.find(u => u.id === senderId);
    const receiver = db.users.find(u => u.id === receiverId);
    if (!sender || !receiver) throw new Error('Sender or receiver not found');

    const newMessage: Message = {
      id: `msg_${Date.now()}`,
      senderId,
      senderName: sender.name,
      receiverId,
      receiverName: receiver.name,
      content,
      timestamp: new Date().toISOString(),
      read: false,
    };

    db.messages.push(newMessage);
    saveDb(db);
    return newMessage;
  },

  markAsRead: (chatId: string, currentUserId: string): void => {
    const db = getDb();
    // Chat id format is chat_userA_userB. Find the other participant ID
    const parts = chatId.split('_');
    const otherId = parts[1] === currentUserId ? parts[2] : parts[1];

    db.messages = db.messages.map(m => {
      if (m.senderId === otherId && m.receiverId === currentUserId) {
        return { ...m, read: true };
      }
      return m;
    });
    saveDb(db);
  }
};

// Initialize DB immediately on load
initDb();
