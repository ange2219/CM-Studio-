import { redirect } from 'next/navigation'

export default function CommunityPostsRedirectPage({ params }: { params: { id: string } }) {
  redirect('/home')
}
