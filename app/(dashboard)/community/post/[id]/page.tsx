import { redirect } from 'next/navigation'

export default function CommunityPostRedirectPage({ params }: { params: { id: string } }) {
  redirect('/home')
}
