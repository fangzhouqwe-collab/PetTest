-- 添加 video_url 字段到 messages 表
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS video_url TEXT;

-- 确保 posts 表也有 video_url (如果之前没加)
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS video_url TEXT;
