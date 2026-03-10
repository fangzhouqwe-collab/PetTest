
export enum AppTab {
  HOME = 'home',
  MARKET = 'market',
  PUBLISH = 'publish',
  MESSAGES = 'messages',
  PROFILE = 'profile',
  AI_CHAT = 'ai_chat',
  POST_DETAIL = 'post_detail',
  MARKET_DETAIL = 'market_detail',
  USER_CHAT = 'user_chat',
  NOTIFICATIONS = 'notifications',
  CART = 'cart',
  ORDERS = 'orders',
  ADDRESS = 'address',
  HISTORY = 'history',
  FAVORITES = 'favorites',
  WORKER_LOBBY = 'worker_lobby',
  BECOME_WORKER = 'become_worker',
  WORKER_DETAIL = 'worker_detail',
}

export interface Comment {
  id: string;
  author: string;
  avatar: string;
  text: string;
  time: string;
}

export interface Post {
  id: string;
  userId?: string;
  author: string;
  avatar: string;
  breed: string;
  time: string;
  image: string;
  images?: string[];
  video?: string;
  title: string;
  content: string;
  likes: number;
  comments: number;
  commentsList?: Comment[];
  liked?: boolean;
  location?: string;
  isMine?: boolean;
}

export interface MarketItem {
  id: string;
  userId?: string;
  image: string;
  price: number;
  name: string;
  category: '狗狗' | '猫咪' | '鸟类' | '爬宠' | '水族' | '仓鼠' | '兔子' | '豚鼠' | '龙猫' | '蜘蛛' | '蝎子' | '昆虫' | '马' | '猪' | '牛' | '羊' | '其他';
  verified: boolean;
  age: string;
  gender: '公' | '母' | '亚成体';
  location: string;
  distance?: number; // In km
  description?: string;
  vaccines?: boolean;
  dewormed?: boolean;
  breed?: string;
  isMine?: boolean;
}

export interface MessageThread {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  time: string;
  unread?: boolean;
  type?: 'ai' | 'system' | 'user';
  tag?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai' | 'other';
  text?: string;
  image?: string;
  video?: string;
  timestamp: Date;
  read?: boolean;
}

export interface Pet {
  id?: string;
  name: string;
  breed: string;
  img: string;
  gender?: '公' | '母' | '未知';
  birthday?: string; // YYYY-MM-DD
  weight?: string; // e.g. "3.5kg"
  vaccineStatus?: boolean; // 是否接种疫苗
  dewormed?: boolean; // 是否驱虫
}

export interface UserProfile {
  userId?: string;
  petConnectId?: string; // 唯一ID e.g. "pet_10086"
  name: string;
  bio: string;
  avatar: string;
  bgImage: string;
  pets: Pet[];
  following?: number;
  followers?: number;
  likesReceived?: number;
  isFollowing?: boolean;
}

// === 电商与交易扩展类型 ===
export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  sales?: string;
  tag?: string;
}

export interface CartItem {
  id: string; // 购物车条目ID
  productId: string;
  product: Product;
  quantity: number;
  selected: boolean;
}

export interface Address {
  id: string;
  receiver: string;
  phone: string;
  region: string; // e.g. "浙江省 杭州市 西湖区"
  detail: string; // e.g. "某某街道某某小区1-1-1"
  isDefault: boolean;
}

export interface Order {
  id: string;
  items: CartItem[]; // 购买的商品
  totalAmount: number;
  status: 'pending' | 'shipped' | 'completed' | 'cancelled';
  createdAt: string;
  address: Address;
}

// === 兼职服务者入驻简历扩展类型 ===
export interface ServiceWorker {
  id: string;
  workerId: string;
  realName?: string;
  photos?: string[];
  title: string;
  skills: string[];
  basePrice: number;
  serviceArea: string;
  bioDescription: string;
  isVerified: boolean;
  rating: number;
  orderCount: number;
  createdAt: string;
  updatedAt: string;

  // 连表附带信息
  workerProfile?: UserProfile;
}

// === 雇主发起的定向服务邀约/订单 ===
export interface ServiceOrder {
  id: string;
  workerProfileId: string;
  employerId: string;
  petId?: string;
  serviceType: 'WALKING' | 'FEEDING' | 'BATHING' | 'OTHER';
  serviceTime: string;
  location: string;
  offerPrice: number;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'COMPLETED' | 'CANCELLED';
  createdAt: string;
  updatedAt: string;

  // 连表查询附带信息
  employer?: UserProfile;
  worker?: ServiceWorker;
  pet?: Pet;
}
