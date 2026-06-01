import React from 'react'

// Styles globaux du shimmer — injectés une seule fois
function ShimmerStyles() {
  return (
    <style dangerouslySetInnerHTML={{__html: `
      @keyframes shimmer {
        0% { background-position: 200% 0; }
        100% { background-position: -200% 0; }
      }
      .skeleton-box {
        background: linear-gradient(90deg, var(--s2, #1C1C24) 25%, var(--b1, #252530) 50%, var(--s2, #1C1C24) 75%);
        background-size: 200% 100%;
        animation: shimmer 1.8s infinite linear;
        border-radius: 8px;
      }
    `}} />
  )
}

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
      <ShimmerStyles />
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
      <ShimmerStyles />
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
      <ShimmerStyles />
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
