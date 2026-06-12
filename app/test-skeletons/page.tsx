import { NotificationsSkeleton, CommunitySkeleton, ProfileSkeleton, AnalyticsSkeleton, DashboardSkeleton } from '@/components/ui/Skeleton'

export default function TestSkeletons() {
  return (
    <div style={{ padding: '2rem', background: 'var(--bg, #111116)', color: 'white', minHeight: '100vh' }}>
      <h1>Test Skeletons</h1>
      
      <h2>NotificationsSkeleton</h2>
      <div style={{ border: '1px solid red', margin: '1rem 0' }}>
        <NotificationsSkeleton />
      </div>

      <h2>CommunitySkeleton</h2>
      <div style={{ border: '1px solid green', margin: '1rem 0' }}>
        <CommunitySkeleton />
      </div>

      <h2>ProfileSkeleton</h2>
      <div style={{ border: '1px solid blue', margin: '1rem 0' }}>
        <ProfileSkeleton />
      </div>

      <h2>AnalyticsSkeleton</h2>
      <div style={{ border: '1px solid yellow', margin: '1rem 0' }}>
        <AnalyticsSkeleton />
      </div>

      <h2>DashboardSkeleton (Used in PostsDashboard)</h2>
      <div style={{ border: '1px solid purple', margin: '1rem 0' }}>
        <DashboardSkeleton />
      </div>
    </div>
  )
}
