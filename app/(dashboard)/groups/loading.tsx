import { CommunitySkeleton } from '@/components/ui/Skeleton'

export default function GroupsLoading() {
  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '1rem 0' }}>
      <header style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--t1)', marginBottom: '.5rem' }}>Espaces de Groupes</h1>
        <p style={{ color: 'var(--t2)', fontSize: '.95rem' }}>
          Chargez vos groupes de discussion exclusifs...
        </p>
      </header>
      <CommunitySkeleton />
    </div>
  )
}
