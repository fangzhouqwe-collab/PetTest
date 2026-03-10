-- 添加 video_url 字段到 messages 表
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS video_url TEXT;

-- 确保 posts 表也有 video_url (如果之前没加)
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS video_url TEXT;

-- 添加 email 和 phone 字段到 profiles 表，用于在后台直观看到用户注册信息
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email VARCHAR(255);
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone VARCHAR(50);

-- 更新用户新建时的触发器，将 email 和 phone 顺带写入
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, name, avatar_url, email, phone)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'name', '新用户'),
        COALESCE(NEW.raw_user_meta_data->>'avatar_url', 'https://picsum.photos/seed/' || NEW.id || '/200/200'),
        NEW.email,
        NEW.phone
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 添加新版本萌宠模块细化的 5 个增强字段
ALTER TABLE public.pets ADD COLUMN IF NOT EXISTS gender VARCHAR(20);
ALTER TABLE public.pets ADD COLUMN IF NOT EXISTS birthday DATE;
ALTER TABLE public.pets ADD COLUMN IF NOT EXISTS weight VARCHAR(50);
ALTER TABLE public.pets ADD COLUMN IF NOT EXISTS vaccine_status BOOLEAN DEFAULT FALSE;
ALTER TABLE public.pets ADD COLUMN IF NOT EXISTS dewormed BOOLEAN DEFAULT FALSE;

-- 添加 breed 字段到 market_items 表支持品种筛选
ALTER TABLE public.market_items ADD COLUMN IF NOT EXISTS breed TEXT;

-- 修复数值溢出错误：扩大价格字段的精度
ALTER TABLE public.market_items ALTER COLUMN price TYPE NUMERIC(20, 2);
ALTER TABLE public.products ALTER COLUMN price TYPE NUMERIC(20, 2);
ALTER TABLE public.orders ALTER COLUMN total_amount TYPE NUMERIC(20, 2);

-- 废弃原先的 service_requests (可以在清理数据库时手动 drop，这里直接注释或覆盖建新表)
-- DROP TABLE IF EXISTS public.service_requests CASCADE;

-- 1. 兼职服务者入驻表 (简历卡片)
CREATE TABLE IF NOT EXISTS public.service_workers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    worker_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
    real_name VARCHAR(100),
    photos TEXT[] DEFAULT '{}',
    title TEXT NOT NULL,
    skills TEXT[] DEFAULT '{}',
    base_price NUMERIC(10, 2) NOT NULL,
    service_area TEXT NOT NULL,
    bio_description TEXT NOT NULL,
    is_verified BOOLEAN DEFAULT FALSE,
    rating NUMERIC(3, 1) DEFAULT 5.0,
    order_count INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 若您之前已建好了该表，可通过以下按需执行的方式热更新字段：
-- ALTER TABLE public.service_workers ADD COLUMN IF NOT EXISTS real_name VARCHAR(100);
-- ALTER TABLE public.service_workers ADD COLUMN IF NOT EXISTS photos TEXT[] DEFAULT '{}';


-- 配置 RLS
ALTER TABLE public.service_workers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view worker profiles" 
    ON public.service_workers FOR SELECT 
    USING (true);

CREATE POLICY "Users can create their own worker profile" 
    ON public.service_workers FOR INSERT 
    WITH CHECK (auth.uid() = worker_id);

CREATE POLICY "Workers can update their own profile" 
    ON public.service_workers FOR UPDATE 
    USING (auth.uid() = worker_id);

-- 2. 雇主向兼职者的定向邀约/订单表
CREATE TABLE IF NOT EXISTS public.service_orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    worker_profile_id UUID REFERENCES public.service_workers(id) ON DELETE CASCADE NOT NULL,
    employer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    pet_id UUID REFERENCES public.pets(id) ON DELETE SET NULL,
    service_type VARCHAR(50) NOT NULL,
    service_time TIMESTAMPTZ NOT NULL,
    location TEXT NOT NULL,
    offer_price NUMERIC(10, 2) NOT NULL,
    status VARCHAR(20) DEFAULT 'PENDING', -- PENDING(待确认), ACCEPTED(已接单), REJECTED(已拒绝), COMPLETED(已完成), CANCELLED(已取消)
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 配置 RLS
ALTER TABLE public.service_orders ENABLE ROW LEVEL SECURITY;

-- 雇主可以查自己的发单，兼职者可以查发给自己的邀约
CREATE POLICY "Users can view relevant orders" 
    ON public.service_orders FOR SELECT 
    USING (
        auth.uid() = employer_id OR 
        auth.uid() IN (SELECT worker_id FROM public.service_workers WHERE id = worker_profile_id)
    );

-- 雇主可发起邀约
CREATE POLICY "Employers can create orders" 
    ON public.service_orders FOR INSERT 
    WITH CHECK (auth.uid() = employer_id);

-- 状态更新：雇主可取消(PENDING下)，兼职者可接单/拒单/完成订单
CREATE POLICY "Users can update their relevant orders" 
    ON public.service_orders FOR UPDATE 
    USING (
        auth.uid() = employer_id OR 
        auth.uid() IN (SELECT worker_id FROM public.service_workers WHERE id = worker_profile_id)
    );

