// 自动生成的 Supabase 数据库类型定义
// 可通过 supabase gen types typescript 命令更新

export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            profiles: {
                Row: {
                    id: string
                    name: string
                    bio: string | null
                    avatar_url: string | null
                    bg_image_url: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id: string
                    name?: string
                    bio?: string | null
                    avatar_url?: string | null
                    bg_image_url?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    name?: string
                    bio?: string | null
                    avatar_url?: string | null
                    bg_image_url?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            pets: {
                Row: {
                    id: string
                    user_id: string
                    name: string
                    breed: string
                    image_url: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    name: string
                    breed: string
                    image_url?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    name?: string
                    breed?: string
                    image_url?: string | null
                    created_at?: string
                }
            }
            posts: {
                Row: {
                    id: string
                    user_id: string
                    title: string
                    content: string
                    image_url: string | null
                    breed: string | null
                    location: string | null
                    likes_count: number
                    comments_count: number
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    title: string
                    content: string
                    image_url?: string | null
                    breed?: string | null
                    location?: string | null
                    likes_count?: number
                    comments_count?: number
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    title?: string
                    content?: string
                    image_url?: string | null
                    breed?: string | null
                    location?: string | null
                    likes_count?: number
                    comments_count?: number
                    created_at?: string
                    updated_at?: string
                }
            }
            likes: {
                Row: {
                    id: string
                    post_id: string
                    user_id: string
                    created_at: string
                }
                Insert: {
                    id?: string
                    post_id: string
                    user_id: string
                    created_at?: string
                }
                Update: {
                    id?: string
                    post_id?: string
                    user_id?: string
                    created_at?: string
                }
            }
            comments: {
                Row: {
                    id: string
                    post_id: string
                    user_id: string
                    text: string
                    created_at: string
                }
                Insert: {
                    id?: string
                    post_id: string
                    user_id: string
                    text: string
                    created_at?: string
                }
                Update: {
                    id?: string
                    post_id?: string
                    user_id?: string
                    text?: string
                    created_at?: string
                }
            }
            market_items: {
                Row: {
                    id: string
                    user_id: string
                    name: string
                    image_url: string | null
                    price: number
                    category: string
                    age: string | null
                    gender: string | null
                    location: string | null
                    description: string | null
                    verified: boolean
                    vaccines: boolean
                    dewormed: boolean
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    name: string
                    image_url?: string | null
                    price?: number
                    category?: string
                    age?: string | null
                    gender?: string | null
                    location?: string | null
                    description?: string | null
                    verified?: boolean
                    vaccines?: boolean
                    dewormed?: boolean
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    name?: string
                    image_url?: string | null
                    price?: number
                    category?: string
                    age?: string | null
                    gender?: string | null
                    location?: string | null
                    description?: string | null
                    verified?: boolean
                    vaccines?: boolean
                    dewormed?: boolean
                    created_at?: string
                    updated_at?: string
                }
            }
            message_threads: {
                Row: {
                    id: string
                    user1_id: string
                    user2_id: string
                    last_message: string | null
                    last_message_at: string
                    created_at: string
                }
                Insert: {
                    id?: string
                    user1_id: string
                    user2_id: string
                    last_message?: string | null
                    last_message_at?: string
                    created_at?: string
                }
                Update: {
                    id?: string
                    user1_id?: string
                    user2_id?: string
                    last_message?: string | null
                    last_message_at?: string
                    created_at?: string
                }
            }
            messages: {
                Row: {
                    id: string
                    thread_id: string
                    sender_id: string
                    text: string | null
                    image_url: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    thread_id: string
                    sender_id: string
                    text?: string | null
                    image_url?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    thread_id?: string
                    sender_id?: string
                    text?: string | null
                    image_url?: string | null
                    created_at?: string
                }
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            [_ in never]: never
        }
        Enums: {
            [_ in never]: never
        }
    }
}

// 辅助类型导出
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Pet = Database['public']['Tables']['pets']['Row']
export type Post = Database['public']['Tables']['posts']['Row']
export type Like = Database['public']['Tables']['likes']['Row']
export type Comment = Database['public']['Tables']['comments']['Row']
export type MarketItem = Database['public']['Tables']['market_items']['Row']
export type MessageThread = Database['public']['Tables']['message_threads']['Row']
export type Message = Database['public']['Tables']['messages']['Row']
