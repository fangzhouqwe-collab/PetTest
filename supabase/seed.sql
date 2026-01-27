-- PetConnect-AI 测试数据
-- 在 Supabase SQL Editor 中执行此脚本以添加测试数据
-- 注意：请先执行 schema.sql 创建表结构

-- ========================================
-- 测试用户 (需要先通过 Supabase Auth 创建)
-- 这里我们直接插入 profiles，假设 auth.users 中已有对应用户
-- 如果你使用演示模式，可以先创建一些测试用户
-- ========================================

-- 插入测试用户资料
INSERT INTO public.profiles (id, name, bio, avatar_url, bg_image_url) VALUES
  ('00000000-0000-0000-0000-000000000001', '莎拉与爪爪', '金毛寻回犬狂热爱好者，专业遛狗达人 🐕', 'https://lh3.googleusercontent.com/aida-public/AB6AXuBacANpINvTclHf-deLtfLOYABw-4MZaeSj06sVjnEicrX7hNUIdifZ718DOHwOOsrwvY6wFUpay_xug4nl6En-rvkBZEiJURcnKtmyQ3RHUHkCWldOgu1o4krrqbmlB9WLCsHl0OYf7aWn8_-jhlgVE3-jadogLhwp3fJhEh-pKD5rS1TGfK6svoQE1QehzC38QYv76kQ08wMIAvcwGv9swPNKQwsuHMv8RZbxXjEvvC80PISRsB7sVkZkqzJlZa6vJF1QSlgcrIU', 'https://picsum.photos/seed/bg1/800/400'),
  ('00000000-0000-0000-0000-000000000002', '马库斯喵', '波斯猫铲屎官，猫咪摄影师 📷🐱', 'https://lh3.googleusercontent.com/aida-public/AB6AXuAItDmawV6z1hMnaU41hKJ2FJAKSSiNKTG0Zye3VKj1PNGsbeunTOCstMv9YI_qSJsLPWExIT-21Rdtf3vc3AydkIlWdPdYm3RO1aDSvXr1FyQ7tjj0iQhd2_m_A2DDp_GkXyoAhx9zbmieYhg_LayA4gE8SF6Nzu8mUy3KwhRTMp7AjbqpNojFCbB2DxMWJLrsVtLjREsgvrxC110kZ8YHhQaZGwEE-bfilsPgK4FaXhkeNrsI9Nf8KKleYjm6VBmsOESs7nTsWmg', 'https://picsum.photos/seed/bg2/800/400'),
  ('00000000-0000-0000-0000-000000000003', '小王子', '热爱所有毛茸茸的小动物 ❤️', 'https://picsum.photos/seed/user3/200/200', 'https://picsum.photos/seed/bg3/800/400'),
  ('00000000-0000-0000-0000-000000000004', '萌宠达人', '宠物店老板，提供专业养宠建议', 'https://picsum.photos/seed/user4/200/200', 'https://picsum.photos/seed/bg4/800/400'),
  ('00000000-0000-0000-0000-000000000005', '爱猫人士', '家有三只猫主子，每天被它们统治', 'https://picsum.photos/seed/user5/200/200', 'https://picsum.photos/seed/bg5/800/400')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  bio = EXCLUDED.bio,
  avatar_url = EXCLUDED.avatar_url,
  bg_image_url = EXCLUDED.bg_image_url;

-- ========================================
-- 测试宠物
-- ========================================
INSERT INTO public.pets (id, user_id, name, breed, image_url) VALUES
  ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'Cooper', '金毛寻回犬', 'https://lh3.googleusercontent.com/aida-public/AB6AXuDzRzrQXxwdHvLW03x2pbHdM0rN-NBaBz0kA1eD_5C6goWPauGhM8DF4qXVCSOiZCWKuDWusAdLm_lpPe_EqKVrm83C98bpkZz1cmnZZbw7I4Rgne-VT7h1c-or_DpmjCCtkaolObc9kx3TlyRUDnK4S6ygnePww7TBq42AYLX8P2LFQYHbXKWt6F9CusUa2_y0jFhOwSRgaPT2MObVj0_1EHBb36bRvZ8OimWHf9Magexil6qYHTWEeK-I0Ejl_JAa5fINJwMC5rE'),
  ('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', '豆豆', '柯基犬', 'https://picsum.photos/seed/corgi/300/300'),
  ('10000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000002', 'Luna', '波斯猫', 'https://lh3.googleusercontent.com/aida-public/AB6AXuAwemHjkLSWoRHHqf5xbMjrC_Dq7MbGEG41pf9TABn3FNS0EJocgWSXqsnScekVRT9C5vlIMzYKJEjR7Dr2L-24UgjHuogbPTz5yfWy8UQlrzi9L1X0roozwyPX2_jlLiWjHndX6lxpfB8Ok18HYdcMnyxXdCL2XMitZRIhKhfqQ-WvwCkGOrRRtTJ3O8bpbF8ukfi6ZO2Cn9fOBzVdentcmrDMjwDQ2Mem74hI6qiv9liwis9YIoBBdot99cDbF4mwKZ2j-w7MQF4'),
  ('10000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000003', '球球', '布偶猫', 'https://picsum.photos/seed/ragdoll/300/300'),
  ('10000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000004', '大黄', '中华田园犬', 'https://picsum.photos/seed/dog1/300/300'),
  ('10000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000005', '咪咪', '橘猫', 'https://picsum.photos/seed/orange_cat/300/300'),
  ('10000000-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000005', '蛋黄', '橘猫', 'https://picsum.photos/seed/orange_cat2/300/300'),
  ('10000000-0000-0000-0000-000000000008', '00000000-0000-0000-0000-000000000005', '芒果', '英短蓝猫', 'https://picsum.photos/seed/british_cat/300/300')
ON CONFLICT (id) DO NOTHING;

-- ========================================
-- 测试帖子
-- ========================================
INSERT INTO public.posts (id, user_id, title, content, image_url, breed, location, likes_count, comments_count) VALUES
  ('20000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', '金毛 Cooper 的快乐一天', '在公园享受阳光明媚的一天！Cooper 终于学会了如何正确地玩接球。🎾 看它跑起来真的太帅了！', 'https://lh3.googleusercontent.com/aida-public/AB6AXuDzRzrQXxwdHvLW03x2pbHdM0rN-NBaBz0kA1eD_5C6goWPauGhM8DF4qXVCSOiZCWKuDWusAdLm_lpPe_EqKVrm83C98bpkZz1cmnZZbw7I4Rgne-VT7h1c-or_DpmjCCtkaolObc9kx3TlyRUDnK4S6ygnePww7TBq42AYLX8P2LFQYHbXKWt6F9CusUa2_y0jFhOwSRgaPT2MObVj0_1EHBb36bRvZ8OimWHf9Magexil6qYHTWEeK-I0Ejl_JAa5fINJwMC5rE', '金毛寻回犬', '上海 世纪公园', 1200, 3),
  ('20000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000002', '与 Luna 的懒散周日', 'Luna 已经连续睡了 16 个小时。我真希望我也能过上她的生活。☁️ 这就是当猫的快乐吧～', 'https://lh3.googleusercontent.com/aida-public/AB6AXuAwemHjkLSWoRHHqf5xbMjrC_Dq7MbGEG41pf9TABn3FNS0EJocgWSXqsnScekVRT9C5vlIMzYKJEjR7Dr2L-24UgjHuogbPTz5yfWy8UQlrzi9L1X0roozwyPX2_jlLiWjHndX6lxpfB8Ok18HYdcMnyxXdCL2XMitZRIhKhfqQ-WvwCkGOrRRtTJ3O8bpbF8ukfi6ZO2Cn9fOBzVdentcmrDMjwDQ2Mem74hI6qiv9liwis9YIoBBdot99cDbF4mwKZ2j-w7MQF4', '波斯猫', '北京 三里屯', 3421, 2),
  ('20000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000003', '球球今天又拆家了', '回家发现沙发被球球抓烂了...虽然很生气但是看它无辜的眼神又不忍心骂它 😅', 'https://picsum.photos/seed/post3/600/600', '布偶猫', '广州 天河区', 856, 5),
  ('20000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000004', '新到的猫粮开箱测评', '今天收到了新的进口猫粮，让我们来看看家里几只主子的反应如何～', 'https://picsum.photos/seed/catfood/600/600', '宠物用品', '深圳 南山区', 2134, 8),
  ('20000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000005', '三只猫的日常', '每天早上被三只猫叫醒要吃饭，这就是养猫人的宿命 🐱🐱🐱', 'https://picsum.photos/seed/threecats/600/600', '橘猫', '杭州 西湖区', 1567, 4),
  ('20000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000001', '豆豆的屁股真的太可爱了', '柯基的屁股就是治愈所有烦恼的良药 🍑', 'https://picsum.photos/seed/corgi_butt/600/600', '柯基犬', '上海 静安区', 4520, 12)
ON CONFLICT (id) DO NOTHING;

-- ========================================
-- 测试评论
-- ========================================
INSERT INTO public.comments (id, post_id, user_id, text) VALUES
  ('30000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000003', '太可爱了！金毛真的是天使狗狗'),
  ('30000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000004', 'Cooper 好帅啊！请问是在哪里遛的？'),
  ('30000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000005', '我家金毛也是这样，每次去公园都玩不够'),
  ('30000000-0000-0000-0000-000000000004', '20000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', '哈哈猫咪的日常就是睡觉'),
  ('30000000-0000-0000-0000-000000000005', '20000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000003', 'Luna 好可爱！求摸头权限'),
  ('30000000-0000-0000-0000-000000000006', '20000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000002', '布偶就是这样，虽然拆家但是太漂亮了舍不得骂'),
  ('30000000-0000-0000-0000-000000000007', '20000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000004', '建议买猫抓板，可以减少抓沙发的频率'),
  ('30000000-0000-0000-0000-000000000008', '20000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000005', '这款猫粮我家猫也爱吃！'),
  ('30000000-0000-0000-0000-000000000009', '20000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000001', '三只猫太幸福了！羡慕'),
  ('30000000-0000-0000-0000-000000000010', '20000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000002', '柯基屁股天下第一可爱！')
ON CONFLICT (id) DO NOTHING;

-- ========================================
-- 测试点赞
-- ========================================
INSERT INTO public.likes (id, post_id, user_id) VALUES
  ('40000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002'),
  ('40000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000003'),
  ('40000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000004'),
  ('40000000-0000-0000-0000-000000000004', '20000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001'),
  ('40000000-0000-0000-0000-000000000005', '20000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000003'),
  ('40000000-0000-0000-0000-000000000006', '20000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001'),
  ('40000000-0000-0000-0000-000000000007', '20000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000002'),
  ('40000000-0000-0000-0000-000000000008', '20000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000004'),
  ('40000000-0000-0000-0000-000000000009', '20000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000003'),
  ('40000000-0000-0000-0000-000000000010', '20000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000005')
ON CONFLICT (id) DO NOTHING;

-- ========================================
-- 测试市场商品
-- ========================================
INSERT INTO public.market_items (id, user_id, name, image_url, price, category, age, gender, location, description, verified, vaccines, dewormed) VALUES
  ('50000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000004', '金毛寻回犬', 'https://lh3.googleusercontent.com/aida-public/AB6AXuC-JUUlCCFZwj2FhOi6ohwHJNRB1u4qfQk9APRwcD1RT7dQ2o2YOlPtYo49DyBV3lkHx6vmlddac-4fFowdv7HoTvdA5PYsx65Wi6hJlGE9kiyGfY39qo0rAFjK9AZcD2lcEQ2ODsepUnCNYXqUAcgcw3PWjGrON4yIlBdjt0d3ZyRgIT421OOCKDunQ_eMxrm1K7RCHbGTPjrYcY8PQYw1lzTcK_IFyu_mWqGa5YOji2POP2fvcXEvVJv5cPExJjSUlgKPhkLdbI4', 8500.00, '狗狗', '3个月', '公', '上海 浦东新区', '纯种金毛幼犬，性格温顺，已打疫苗驱虫，健康活泼，可上门看狗', true, true, true),
  ('50000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000004', '英国短毛猫', 'https://lh3.googleusercontent.com/aida-public/AB6AXuCisZzRdw6Mu6wtJNezaPgVjrFKV-AYmQhzbAYlRy91ZMjKYTnqqEDesSbIrKu16BTmwyodUAD9LW6vyZHd1Szr80fqN6J8GqrYOAn8T86jZ6GIeLJbfb1K2DIw24-aiWtblPck_XNiTR7P7Xwc0SyqSDf-MK4yVGrEO4vs2RrDoYN23BnjkKXJ4BvuZGsoMW6a6Pth6CtyU--mhQ50gwQdA_itYPsmAxv3vpftKYlfc0qb9SOf-bXAHpLWF8dOOOnhNxwaL3UCZVs', 5800.00, '猫咪', '2个月', '母', '上海 静安区', '蓝白英短，圆脸大眼，性格粘人，已完成第一针疫苗', false, true, true),
  ('50000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000005', '布偶猫', 'https://picsum.photos/seed/ragdoll_sale/400/400', 12000.00, '猫咪', '4个月', '母', '北京 朝阳区', '双色布偶，海豹色，血统纯正，可提供证书', true, true, true),
  ('50000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000003', '柯基犬', 'https://picsum.photos/seed/corgi_sale/400/400', 6500.00, '狗狗', '2个月', '公', '广州 天河区', '威尔士柯基，三色，屁股圆圆，性格活泼', true, true, true),
  ('50000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000001', '虎皮鹦鹉', 'https://picsum.photos/seed/parrot/400/400', 200.00, '鸟类', '6个月', '亚成体', '杭州 西湖区', '蓝色虎皮鹦鹉，已驯服，会说"你好"', false, false, false),
  ('50000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000002', '球蟒', 'https://picsum.photos/seed/python/400/400', 1500.00, '爬宠', '1岁', '公', '深圳 福田区', '白化球蟒，性格温顺，适合新手饲养', true, false, false),
  ('50000000-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000004', '边境牧羊犬', 'https://picsum.photos/seed/border_collie/400/400', 9800.00, '狗狗', '3个月', '母', '成都 武侯区', '智商第一的狗狗！非常聪明，已学会基本指令', true, true, true),
  ('50000000-0000-0000-0000-000000000008', '00000000-0000-0000-0000-000000000005', '橘猫', 'https://picsum.photos/seed/orange_sale/400/400', 0.00, '猫咪', '2个月', '公', '南京 鼓楼区', '免费领养！小橘猫找新家，健康可爱，只求善待', false, true, true)
ON CONFLICT (id) DO NOTHING;

-- ========================================
-- 测试消息会话
-- ========================================
INSERT INTO public.message_threads (id, user1_id, user2_id, last_message, last_message_at) VALUES
  ('60000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', '好的，明天见！', NOW() - INTERVAL '2 hours'),
  ('60000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000004', '请问那只金毛还在吗？', NOW() - INTERVAL '1 day'),
  ('60000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000005', '谢谢你的猫粮推荐！', NOW() - INTERVAL '3 hours')
ON CONFLICT (id) DO NOTHING;

-- ========================================
-- 测试消息
-- ========================================
INSERT INTO public.messages (id, thread_id, sender_id, text) VALUES
  ('70000000-0000-0000-0000-000000000001', '60000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', '你好！看到你发的 Luna 的照片了，好可爱啊'),
  ('70000000-0000-0000-0000-000000000002', '60000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', '谢谢！Luna 确实很粘人呢'),
  ('70000000-0000-0000-0000-000000000003', '60000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', '我们可以约个时间一起遛宠物吗？'),
  ('70000000-0000-0000-0000-000000000004', '60000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', '好的，明天见！'),
  ('70000000-0000-0000-0000-000000000005', '60000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', '你好，我对你们家的金毛很感兴趣'),
  ('70000000-0000-0000-0000-000000000006', '60000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000004', '您好！狗狗还在的，欢迎来看'),
  ('70000000-0000-0000-0000-000000000007', '60000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', '请问那只金毛还在吗？'),
  ('70000000-0000-0000-0000-000000000008', '60000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000003', '请问你家猫吃什么猫粮？'),
  ('70000000-0000-0000-0000-000000000009', '60000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000005', '我们吃的是渴望，你可以试试'),
  ('70000000-0000-0000-0000-000000000010', '60000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000003', '谢谢你的猫粮推荐！')
ON CONFLICT (id) DO NOTHING;

-- ========================================
-- 完成提示
-- ========================================
SELECT '✅ 测试数据插入完成！' as status, 
       (SELECT COUNT(*) FROM public.profiles) as profiles_count,
       (SELECT COUNT(*) FROM public.pets) as pets_count,
       (SELECT COUNT(*) FROM public.posts) as posts_count,
       (SELECT COUNT(*) FROM public.comments) as comments_count,
       (SELECT COUNT(*) FROM public.likes) as likes_count,
       (SELECT COUNT(*) FROM public.market_items) as market_items_count,
       (SELECT COUNT(*) FROM public.message_threads) as threads_count,
       (SELECT COUNT(*) FROM public.messages) as messages_count;
