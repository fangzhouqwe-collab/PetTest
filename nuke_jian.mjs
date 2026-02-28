import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://zugjjfksinekpojeahdm.supabase.co'
const supabaseKey = 'sb_publishable_RB-hv2CqFNX6bVhKjc5hvg_JpyaRu2_'
const supabaseSecret = process.env.VITE_SUPABASE_ANON_KEY || supabaseKey; // 使用 anon key 可以读取 profiles

const supabase = createClient(supabaseUrl, supabaseSecret)

async function nukeJian() {
    console.log('Searching for User "Jian"...');

    // 1. Find the user Jian in profiles
    const { data: profiles, error: pErr } = await supabase
        .from('profiles')
        .select('*')
        .ilike('name', '%Jian%');

    if (pErr) {
        console.error('Error fetching profiles:', pErr);
        return;
    }

    if (!profiles || profiles.length === 0) {
        console.log('No user named Jian found in profiles.');
    } else {
        console.log('Found Jian profiles:', profiles);
        const jianIds = profiles.map(p => p.id);

        // 2. Delete posts by Jian
        const { data: postsDeleted, error: postErr } = await supabase
            .from('posts')
            .delete()
            .in('user_id', jianIds)
            .select();

        console.log(`Deleted ${postsDeleted?.length || 0} posts by Jian.`);

        // 3. Delete market items by Jian
        const { data: itemsDeleted, error: itemErr } = await supabase
            .from('market_items')
            .delete()
            .in('seller_id', jianIds)
            .select();

        console.log(`Deleted ${itemsDeleted?.length || 0} market items by Jian.`);
    }

    // 4. Also let's check what posts are left just in case Jian's name isn't in profile but hardcoded in the posts data somehow
    console.log('Checking recent posts headers just to be sure...');
    const { data: allPosts } = await supabase.from('posts').select('id, title, created_at, user_id').order('created_at', { ascending: false }).limit(20);
    console.log('Top 20 Recent Posts:', allPosts);
}

nukeJian();
