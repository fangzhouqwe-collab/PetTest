-- PetConnect-AI Supabase 数据库架构
-- 在 Supabase SQL Editor 中执行此脚本

-- ========================================
-- 如果需要重置数据库，取消下面注释执行
-- ========================================
-- DROP TABLE IF EXISTS public.messages CASCADE;
-- DROP TABLE IF EXISTS public.message_threads CASCADE;
-- DROP TABLE IF EXISTS public.likes CASCADE;
-- DROP TABLE IF EXISTS public.comments CASCADE;
-- DROP TABLE IF EXISTS public.market_items CASCADE;
-- DROP TABLE IF EXISTS public.posts CASCADE;
-- DROP TABLE IF EXISTS public.pets CASCADE;
-- DROP TABLE IF EXISTS public.profiles CASCADE;

-- ========================================
-- 用户表 (可独立于 auth.users 使用，便于测试)
-- ========================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY,
    name VARCHAR(100) NOT NULL DEFAULT '用户',
    bio TEXT DEFAULT '',
    avatar_url TEXT,
    bg_image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- 宠物表
-- ========================================
CREATE TABLE IF NOT EXISTS public.pets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    breed VARCHAR(100) NOT NULL,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- 帖子表
-- ========================================
CREATE TABLE IF NOT EXISTS public.posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    image_url TEXT,
    breed VARCHAR(100) DEFAULT '我家宠宝',
    location VARCHAR(200),
    likes_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- 点赞表
-- ========================================
CREATE TABLE IF NOT EXISTS public.likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(post_id, user_id)
);

-- ========================================
-- 评论表
-- ========================================
CREATE TABLE IF NOT EXISTS public.comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- 市场商品表
-- ========================================
CREATE TABLE IF NOT EXISTS public.market_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    image_url TEXT,
    price DECIMAL(10, 2) NOT NULL DEFAULT 0,
    category VARCHAR(50) NOT NULL DEFAULT '其他',
    age VARCHAR(50),
    gender VARCHAR(20),
    location VARCHAR(200),
    description TEXT,
    verified BOOLEAN DEFAULT FALSE,
    vaccines BOOLEAN DEFAULT FALSE,
    dewormed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- 消息会话表
-- ========================================
CREATE TABLE IF NOT EXISTS public.message_threads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user1_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    user2_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    last_message TEXT,
    last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user1_id, user2_id)
);

-- ========================================
-- 消息表
-- ========================================
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    thread_id UUID NOT NULL REFERENCES public.message_threads(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    text TEXT,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- 索引优化
-- ========================================
CREATE INDEX IF NOT EXISTS idx_posts_user_id ON public.posts(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON public.posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comments_post_id ON public.comments(post_id);
CREATE INDEX IF NOT EXISTS idx_likes_post_id ON public.likes(post_id);
CREATE INDEX IF NOT EXISTS idx_market_items_category ON public.market_items(category);
CREATE INDEX IF NOT EXISTS idx_market_items_created_at ON public.market_items(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_thread_id ON public.messages(thread_id);
CREATE INDEX IF NOT EXISTS idx_pets_user_id ON public.pets(user_id);

-- ========================================
-- Row Level Security (RLS) 策略
-- ========================================

-- 启用 RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.market_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Profiles: 所有人可查看，仅自己可编辑
CREATE POLICY "Profiles are viewable by everyone" ON public.profiles
    FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Pets: 所有人可查看，仅自己可管理
CREATE POLICY "Pets are viewable by everyone" ON public.pets
    FOR SELECT USING (true);

CREATE POLICY "Users can manage own pets" ON public.pets
    FOR ALL USING (auth.uid() = user_id);

-- Posts: 所有人可查看，仅作者可管理
CREATE POLICY "Posts are viewable by everyone" ON public.posts
    FOR SELECT USING (true);

CREATE POLICY "Users can create posts" ON public.posts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own posts" ON public.posts
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own posts" ON public.posts
    FOR DELETE USING (auth.uid() = user_id);

-- Likes: 所有人可查看，可点赞
CREATE POLICY "Likes are viewable by everyone" ON public.likes
    FOR SELECT USING (true);

CREATE POLICY "Users can manage own likes" ON public.likes
    FOR ALL USING (auth.uid() = user_id);

-- Comments: 所有人可查看和评论
CREATE POLICY "Comments are viewable by everyone" ON public.comments
    FOR SELECT USING (true);

CREATE POLICY "Users can create comments" ON public.comments
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own comments" ON public.comments
    FOR DELETE USING (auth.uid() = user_id);

-- Market Items: 所有人可查看，仅发布者可管理
CREATE POLICY "Market items are viewable by everyone" ON public.market_items
    FOR SELECT USING (true);

CREATE POLICY "Users can manage own market items" ON public.market_items
    FOR ALL USING (auth.uid() = user_id);

-- Message Threads: 仅参与者可访问
CREATE POLICY "Users can view own threads" ON public.message_threads
    FOR SELECT USING (auth.uid() = user1_id OR auth.uid() = user2_id);

CREATE POLICY "Users can create threads" ON public.message_threads
    FOR INSERT WITH CHECK (auth.uid() = user1_id OR auth.uid() = user2_id);

-- Messages: 仅会话参与者可访问
CREATE POLICY "Users can view messages in their threads" ON public.messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.message_threads
            WHERE id = thread_id
            AND (user1_id = auth.uid() OR user2_id = auth.uid())
        )
    );

CREATE POLICY "Users can send messages" ON public.messages
    FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- ========================================
-- 触发器函数：更新帖子点赞/评论计数
-- ========================================
CREATE OR REPLACE FUNCTION update_post_likes_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.posts SET likes_count = likes_count + 1 WHERE id = NEW.post_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.posts SET likes_count = likes_count - 1 WHERE id = OLD.post_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION update_post_comments_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.posts SET comments_count = comments_count + 1 WHERE id = NEW.post_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.posts SET comments_count = comments_count - 1 WHERE id = OLD.post_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 创建触发器
DROP TRIGGER IF EXISTS on_like_change ON public.likes;
CREATE TRIGGER on_like_change
    AFTER INSERT OR DELETE ON public.likes
    FOR EACH ROW EXECUTE FUNCTION update_post_likes_count();

DROP TRIGGER IF EXISTS on_comment_change ON public.comments;
CREATE TRIGGER on_comment_change
    AFTER INSERT OR DELETE ON public.comments
    FOR EACH ROW EXECUTE FUNCTION update_post_comments_count();

-- ========================================
-- 触发器：用户注册时自动创建 profile
-- ========================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, name, avatar_url)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'name', '新用户'),
        COALESCE(NEW.raw_user_meta_data->>'avatar_url', 'https://picsum.photos/seed/' || NEW.id || '/200/200')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
