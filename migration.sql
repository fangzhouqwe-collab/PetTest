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
