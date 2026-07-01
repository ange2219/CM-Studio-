import { redirect } from 'next/navigation'

export default function PostRedirectPage({ params }: { params: { id: string } }) {
  // Redirige vers la page d'accueil (ou espace de travail) 
  // car nous n'avons pas de page dédiée pour un post unique (ils sont affichés dans le feed)
  redirect('/home')
}
