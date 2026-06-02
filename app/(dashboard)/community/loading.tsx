import { CommunitySkeleton } from '@/components/ui/Skeleton'

export default function CommunityLoading() {
  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '1rem 0' }}>
      <header style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--t1)', marginBottom: '.5rem' }}>Mur d'entraide</h1>
        <p style={{ color: 'var(--t2)', fontSize: '.95rem' }}>
          Échangez des idées, posez vos questions et partagez vos meilleures astuces avec la communauté des créateurs.
        </p>
      </header>
      <CommunitySkeleton />
    </div>
  )
}
