
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
  NOTIFICATIONS = 'notifications'
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
  image: string;
  price: number;
  name: string;
  category: '狗狗' | '猫咪' | '鸟类' | '爬宠' | '其他';
  verified: boolean;
  age: string;
  gender: '公' | '母' | '亚成体';
  location: string;
  distance?: number; // In km
  description?: string;
  vaccines?: boolean;
  dewormed?: boolean;
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
  timestamp: Date;
}

export interface Pet {
  name: string;
  breed: string;
  img: string;
}

export interface UserProfile {
  userId?: string;
  name: string;
  bio: string;
  avatar: string;
  bgImage: string;
  pets: Pet[];
}
