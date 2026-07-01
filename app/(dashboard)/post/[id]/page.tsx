import { redirect } from 'next/navigation'

export default function SinglePostRedirectPage({ params }: { params: { id: string } }) {
  redirect('/home')
}
