import React from 'react'



export function Skeleton({ width, height, borderRadius = '8px', style }: { 
  width?: string | number
  height?: string | number
  borderRadius?: string
  style?: React.CSSProperties 
}) {
  return (
    <div
      className="skeleton-box"
      style={{ width: width || '100%', height: height || '20px', borderRadius, ...style }}
    />
  )
}

// ─── Skeleton Page Accueil ────────────────────────────────────────────────────
export function HomeSkeleton() {
  return (
    <>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '32px', maxWidth: '1200px', margin: '0 auto', width: '100%', padding: '24px 0' }}>
        <div style={{ flex: 1, maxWidth: '680px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Stories */}
          <div style={{ display: 'flex', gap: '12px', overflow: 'hidden' }}>
            {[1,2,3,4].map(i => <Skeleton key={i} width="72px" height="72px" borderRadius="50%" />)}
          </div>
          {/* Posts */}
          {[1,2].map(i => (
            <div key={i} style={{ background: 'var(--card)', borderRadius: '16px', border: '1px solid var(--b1)', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Skeleton width="40px" height="40px" borderRadius="50%" />
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <Skeleton width="120px" height="14px" />
                  <Skeleton width="60px" height="10px" />
                </div>
              </div>
              <Skeleton height="14px" width="80%" />
              <Skeleton height="240px" borderRadius="12px" />
              <div style={{ display: 'flex', gap: '16px', borderTop: '1px solid var(--b1)', paddingTop: '12px' }}>
                <Skeleton width="60px" height="24px" borderRadius="6px" />
                <Skeleton width="60px" height="24px" borderRadius="6px" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}

// ─── Skeleton Messagerie ──────────────────────────────────────────────────────
export function MessagesSkeleton() {
  return (
    <>

      <div style={{ display: 'flex', height: '100%', flex: 1, minHeight: 0, overflow: 'hidden' }}>
        {/* Sidebar conversations */}
        <div style={{ width: '280px', borderRight: '1px solid var(--b1)', display: 'flex', flexDirection: 'column', gap: '0', flexShrink: 0, background: 'var(--sidebar-bg)' }}>
          <div style={{ padding: '12px' }}>
            <Skeleton height="36px" borderRadius="20px" />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {[1,2,3,4,5].map(i => (
              <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'center', padding: '10px 14px' }}>
                <Skeleton width="40px" height="40px" borderRadius="50%" style={{ flexShrink: 0 }} />
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <Skeleton width="100px" height="12px" />
                  <Skeleton width="140px" height="10px" />
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* Zone chat */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '20px', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid var(--b1)', paddingBottom: '14px' }}>
            <Skeleton width="34px" height="34px" borderRadius="50%" />
            <Skeleton width="120px" height="14px" />
          </div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', gap: '12px' }}>
            <div style={{ display: 'flex', gap: '8px', alignSelf: 'flex-start' }}>
              <Skeleton width="24px" height="24px" borderRadius="50%" />
              <Skeleton width="200px" height="38px" borderRadius="12px" />
            </div>
            <Skeleton width="240px" height="48px" borderRadius="12px" style={{ alignSelf: 'flex-end' }} />
            <div style={{ display: 'flex', gap: '8px', alignSelf: 'flex-start' }}>
              <Skeleton width="24px" height="24px" borderRadius="50%" />
              <Skeleton width="160px" height="38px" borderRadius="12px" />
            </div>
          </div>
          <Skeleton height="44px" borderRadius="14px" />
        </div>
      </div>
    </>
  )
}

// ─── Skeleton Dashboard Posts ─────────────────────────────────────────────────
export function DashboardSkeleton() {
  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', padding: '1.5rem 2rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
          {[1,2,3,4].map(i => <Skeleton key={i} height="100px" borderRadius="12px" />)}
        </div>
        <div style={{ background: 'var(--card)', border: '1px solid var(--b1)', borderRadius: '16px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Skeleton width="150px" height="24px" />
            <div style={{ display: 'flex', gap: '8px' }}>
              <Skeleton width="80px" height="32px" borderRadius="8px" />
              <Skeleton width="120px" height="32px" borderRadius="8px" />
            </div>
          </div>
          {[1,2,3].map(i => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', border: '1px solid var(--b1)', borderRadius: '10px' }}>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flex: 1 }}>
                <Skeleton width="48px" height="48px" borderRadius="8px" />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
                  <Skeleton width="40%" height="14px" />
                  <Skeleton width="20%" height="10px" />
                </div>
              </div>
              <Skeleton width="80px" height="28px" borderRadius="6px" />
            </div>
          ))}
        </div>
      </div>
    </>
  )
}

// ─── Skeleton Posts List (For PostsDashboard content area) ────────────────────
export function PostsListSkeleton() {
  return (
    <>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {[1,2,3,4].map(i => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: 'var(--card)', border: '1px solid var(--b1)', borderRadius: '12px' }}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flex: 1 }}>
              <Skeleton width="56px" height="56px" borderRadius="8px" />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
                <Skeleton width="50%" height="16px" />
                <Skeleton width="30%" height="12px" />
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
              <Skeleton width="70px" height="28px" borderRadius="6px" />
              <Skeleton width="50px" height="12px" />
            </div>
          </div>
        ))}
      </div>
    </>
  )
}

// ─── Skeleton Notifications ───────────────────────────────────────────────────
export function NotificationsSkeleton() {
  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {[1,2,3,4,5].map(i => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '1rem 1.25rem', background: 'var(--card)', borderRadius: '12px', border: '1px solid transparent' }}>
            <Skeleton width="6px" height="6px" borderRadius="50%" />
            <Skeleton width="40px" height="40px" borderRadius="50%" style={{ flexShrink: 0 }} />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <Skeleton width="40%" height="14px" />
              <Skeleton width="70%" height="12px" />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
              <Skeleton width="60px" height="20px" borderRadius="12px" />
              <Skeleton width="40px" height="10px" />
            </div>
          </div>
        ))}
      </div>
    </>
  )
}

// ─── Skeleton Community ───────────────────────────────────────────────────────
export function CommunitySkeleton() {
  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {[1,2,3].map(i => (
          <div key={i} style={{ background: 'var(--card)', border: '1px solid var(--b1)', borderRadius: '16px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Skeleton width="44px" height="44px" borderRadius="50%" />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <Skeleton width="120px" height="14px" />
                  <Skeleton width="80px" height="10px" />
                </div>
              </div>
              <Skeleton width="80px" height="24px" borderRadius="12px" />
            </div>
            <Skeleton width="100%" height="14px" />
            <Skeleton width="90%" height="14px" />
            <Skeleton width="60%" height="14px" />
            <div style={{ display: 'flex', gap: '16px', borderTop: '1px solid var(--b1)', paddingTop: '16px', marginTop: '4px' }}>
              <Skeleton width="60px" height="24px" borderRadius="6px" />
              <Skeleton width="60px" height="24px" borderRadius="6px" />
            </div>
          </div>
        ))}
      </div>
    </>
  )
}

// ─── Skeleton Profile ─────────────────────────────────────────────────────────
export function ProfileSkeleton() {
  return (
    <>
      <div style={{ display: 'flex', gap: '2rem', height: '100%', alignItems: 'flex-start' }}>
        <div className="hidden md:flex" style={{ width: '260px', flexShrink: 0, flexDirection: 'column', gap: '1.5rem', position: 'sticky', top: '1.5rem' }}>
          <div style={{ padding: '0 1rem' }}>
            <Skeleton width="150px" height="24px" />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '.5rem' }}>
            {[1,2,3,4].map(i => <Skeleton key={i} height="40px" borderRadius="8px" />)}
          </div>
        </div>
        <div style={{ flex: 1, minWidth: 0, maxWidth: '680px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{ background: 'var(--card)', borderRadius: '16px', border: '1px solid var(--b1)', overflow: 'hidden' }}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--b1)' }}>
              <Skeleton width="200px" height="20px" />
              <Skeleton width="300px" height="14px" style={{ marginTop: '8px' }} />
            </div>
            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                <Skeleton width="80px" height="80px" borderRadius="50%" />
                <div style={{ flex: 1 }}>
                  <Skeleton width="150px" height="16px" style={{ marginBottom: '12px' }} />
                  <Skeleton width="120px" height="32px" borderRadius="8px" />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1.5rem' }}>
                <div style={{ flex: 1 }}><Skeleton height="40px" borderRadius="8px" /></div>
                <div style={{ flex: 1 }}><Skeleton height="40px" borderRadius="8px" /></div>
              </div>
              <Skeleton height="40px" borderRadius="8px" />
              <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '1rem', borderTop: '1px solid var(--b1)' }}>
                <Skeleton width="120px" height="36px" borderRadius="8px" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

// ─── Skeleton Analytics ───────────────────────────────────────────────────────
export function AnalyticsSkeleton() {
  return (
    <>
      <div style={{ padding: '2rem' }}>
        <div style={{ marginBottom: '2rem' }}>
          <Skeleton width="150px" height="24px" />
          <Skeleton width="200px" height="14px" style={{ marginTop: '6px' }} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          {[1,2,3,4,5].map(i => (
            <div key={i} style={{ background: 'var(--card)', border: '1px solid var(--b1)', borderRadius: '12px', padding: '1rem' }}>
              <Skeleton width="18px" height="18px" style={{ marginBottom: '8px' }} />
              <Skeleton width="60px" height="28px" style={{ marginBottom: '6px' }} />
              <Skeleton width="80px" height="12px" />
            </div>
          ))}
        </div>
        <div style={{ background: 'var(--card)', border: '1px solid var(--b1)', borderRadius: '12px', padding: '1.25rem', marginBottom: '1.5rem' }}>
          <Skeleton width="120px" height="18px" style={{ marginBottom: '1rem' }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '.75rem' }}>
            {[1,2,3,4].map(i => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <Skeleton width="130px" height="14px" style={{ flexShrink: 0 }} />
                <Skeleton height="6px" borderRadius="100px" style={{ flex: 1 }} />
                <Skeleton width="150px" height="14px" style={{ flexShrink: 0 }} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
