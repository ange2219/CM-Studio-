import React from 'react'

export function SkeletonStyles() {
  return (
    <style dangerouslySetInnerHTML={{__html: `
      @keyframes shimmer {
        0% { background-position: 200% 0; }
        100% { background-position: -200% 0; }
      }
    `}} />
  )
}

export function Skeleton({ 
  width, 
  height, 
  borderRadius = '8px', 
  style 
}: { 
  width?: string | number
  height?: string | number
  borderRadius?: string
  style?: React.CSSProperties 
}) {
  return (
    <>
      <SkeletonStyles />
      <div
        style={{
          width: width || '100%',
          height: height || '20px',
          borderRadius,
          background: 'linear-gradient(90deg, #1C1C24 25%, #252530 50%, #1C1C24 75%)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 1.8s infinite linear',
          ...style
        }}
      />
    </>
  )
}

export function HomeSkeleton() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px', padding: '1.5rem', width: '100%', maxWidth: '640px', margin: '0 auto' }}>
      {/* Welcome Banner Skeleton */}
      <Skeleton height="140px" borderRadius="16px" />
      
      {/* Popular Groups Skeleton (on top for mobile/tablet) */}
      <div style={{ display: 'flex', gap: '12px', overflow: 'hidden' }}>
        <Skeleton width="120px" height="32px" borderRadius="20px" />
        <Skeleton width="100px" height="32px" borderRadius="20px" />
        <Skeleton width="140px" height="32px" borderRadius="20px" />
      </div>

      {/* Posts Skeletons */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {[1, 2].map(i => (
          <div key={i} style={{ background: 'var(--card)', borderRadius: '16px', border: '1px solid var(--b1)', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Skeleton width="40px" height="40px" borderRadius="50%" />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
                <Skeleton width="120px" height="14px" />
                <Skeleton width="60px" height="10px" />
              </div>
            </div>
            <Skeleton height="14px" width="40%" />
            <Skeleton height="14px" width="90%" />
            <Skeleton height="260px" borderRadius="12px" />
            <div style={{ display: 'flex', gap: '16px', borderTop: '1px solid var(--b1)', paddingTop: '12px', marginTop: '8px' }}>
              <Skeleton width="60px" height="24px" borderRadius="6px" />
              <Skeleton width="60px" height="24px" borderRadius="6px" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function MessagesSkeleton() {
  return (
    <div style={{ display: 'flex', height: '100%', flex: 1, minHeight: 0, background: 'transparent', overflow: 'hidden' }}>
      {/* Sidebar List Skeleton */}
      <div style={{ width: '320px', borderRight: '1px solid var(--b1)', display: 'flex', flexDirection: 'column', gap: '16px', padding: '16px', flexShrink: 0 }}>
        <Skeleton height="36px" borderRadius="10px" />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {[1, 2, 3, 4].map(i => (
            <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <Skeleton width="40px" height="40px" borderRadius="50%" />
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Skeleton width="80px" height="12px" />
                  <Skeleton width="30px" height="8px" />
                </div>
                <Skeleton width="140px" height="10px" />
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Main Conversation Skeleton */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '24px', gap: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid var(--b1)', paddingBottom: '16px' }}>
          <Skeleton width="40px" height="40px" borderRadius="50%" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <Skeleton width="120px" height="14px" />
            <Skeleton width="60px" height="10px" />
          </div>
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', gap: '16px' }}>
          <div style={{ display: 'flex', gap: '12px', alignSelf: 'flex-start', alignItems: 'flex-end' }}>
            <Skeleton width="32px" height="32px" borderRadius="50%" />
            <Skeleton width="200px" height="40px" borderRadius="12px" />
          </div>
          <div style={{ display: 'flex', gap: '12px', alignSelf: 'flex-end', alignItems: 'flex-end' }}>
            <Skeleton width="250px" height="56px" borderRadius="12px" />
          </div>
          <div style={{ display: 'flex', gap: '12px', alignSelf: 'flex-start', alignItems: 'flex-end' }}>
            <Skeleton width="32px" height="32px" borderRadius="50%" />
            <Skeleton width="150px" height="40px" borderRadius="12px" />
          </div>
        </div>
        <Skeleton height="44px" borderRadius="14px" style={{ marginTop: '12px' }} />
      </div>
    </div>
  )
}

export function DashboardSkeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', padding: '1.5rem 2rem' }}>
      {/* Header Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
        {[1, 2, 3, 4].map(i => (
          <Skeleton key={i} height="100px" borderRadius="12px" />
        ))}
      </div>
      
      {/* Main Panel Skeleton */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', background: 'var(--card)', border: '1px solid var(--b1)', borderRadius: '16px', padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Skeleton width="150px" height="24px" />
          <div style={{ display: 'flex', gap: '8px' }}>
            <Skeleton width="80px" height="32px" borderRadius="8px" />
            <Skeleton width="120px" height="32px" borderRadius="8px" />
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '12px' }}>
          {[1, 2, 3].map(i => (
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
    </div>
  )
}
