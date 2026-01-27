-- PetConnect-AI 数据库重置脚本
-- 警告：此脚本会删除所有现有数据！
-- 在 Supabase SQL Editor 中执行

-- ========================================
-- 第一步：删除所有旧表
-- ========================================
DROP TABLE IF EXISTS public.messages CASCADE;
DROP TABLE IF EXISTS public.message_threads CASCADE;
DROP TABLE IF EXISTS public.likes CASCADE;
DROP TABLE IF EXISTS public.comments CASCADE;
DROP TABLE IF EXISTS public.market_items CASCADE;
DROP TABLE IF EXISTS public.posts CASCADE;
DROP TABLE IF EXISTS public.pets CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- 删除触发器和函数
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_like_change ON public.likes;
DROP TRIGGER IF EXISTS on_comment_change ON public.comments;
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS update_post_likes_count();
DROP FUNCTION IF EXISTS update_post_comments_count();

SELECT '✅ 第一步完成：旧表已删除。请继续执行 schema.sql 然后执行 seed.sql' as status;
