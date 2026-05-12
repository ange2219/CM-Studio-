import { createClient, createAdminClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { CommunityFeed } from '@/components/community/CommunityFeed'
import { StoriesSection } from '@/components/dashboard/StoriesSection'
import { NotificationsPanel } from '@/components/dashboard/NotificationsPanel'
import { PopularGroups } from '@/components/dashboard/PopularGroups'
import { AiAssistantPanel } from '@/components/dashboard/AiAssistantPanel'
import { AutoRefresh } from '@/components/dashboard/AutoRefresh'
import { WelcomeBanner } from '@/components/dashboard/WelcomeBanner'

export const revalidate = 0

export default async function DashboardPage() {
  const supabase = createClient()
  const { data: { user: authUser } } = await supabase.auth.getUser()
  if (!authUser) redirect('/login')

  const admin = createAdminClient()

  // Fetch data
  const [userRes, postsRes, likesRes] = await Promise.all([
    admin.from('users').select('full_name, plan').eq('id', authUser.id).single(),
    admin.from('vw_community_posts').select('*').order('created_at', { ascending: false }).limit(50),
    admin.from('community_likes').select('post_id').eq('user_id', authUser.id)
  ])

  const userData = userRes.data
  const posts = postsRes.data || []
  const likedPostIds = new Set((likesRes.data || []).map((l: any) => l.post_id))
  const firstName = userData?.full_name?.split(' ')[0] || authUser.email?.split('@')[0] || 'vous'

  return (
    <div style={{ display: 'flex', gap: '24px', maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
      <AutoRefresh />
      
      {/* Main Column: Feed */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '24px', minWidth: 0 }}>
        <WelcomeBanner firstName={firstName} />
        
        <div style={{ padding: '0 4px' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '16px', color: 'var(--t1)' }}>Stories</h2>
            <StoriesSection />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--b1)', paddingBottom: '12px' }}>
            <div style={{ display: 'flex', gap: '20px' }}>
                <button style={{ background: 'none', border: 'none', fontWeight: 700, fontSize: '0.9rem', color: 'var(--accent)', cursor: 'pointer', borderBottom: '2px solid var(--accent)', paddingBottom: '12px', marginBottom: '-14px' }}>Pour vous</button>
                <button style={{ background: 'none', border: 'none', fontWeight: 600, fontSize: '0.9rem', color: 'var(--t2)', cursor: 'pointer' }}>Communauté</button>
                <button style={{ background: 'none', border: 'none', fontWeight: 600, fontSize: '0.9rem', color: 'var(--t2)', cursor: 'pointer' }}>Groupes</button>
            </div>
            <button style={{ background: 'var(--s2)', border: '1px solid var(--b1)', borderRadius: '8px', padding: '6px 12px', fontSize: '0.8rem', color: 'var(--t2)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 21v-7m0-4V3m8 18v-9m0-4V3m8 18v-5m0-4V3M1 14h6m2-6h6m2 8h6"/></svg>
                Filtres
            </button>
        </div>

        <CommunityFeed 
          initialPosts={posts} 
          currentUserId={authUser.id} 
          initialLikedIds={Array.from(likedPostIds)} 
        />
      </div>

      {/* Right Column: Widgets (Fixed/Sticky) */}
      <div style={{ width: '340px', flexShrink: 0, position: 'sticky', top: '24px', height: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column', gap: '20px', overflowY: 'auto', paddingRight: '4px' }} className="hidden xl:flex">
        <NotificationsPanel />
        <PopularGroups />
        <AiAssistantPanel firstName={firstName} />
      </div>
    </div>
  )
}
