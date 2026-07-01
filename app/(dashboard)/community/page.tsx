import { redirect } from 'next/navigation'

export default function CommunityRedirectPage({ searchParams }: { searchParams: { tab?: string } }) {
  if (searchParams.tab === 'groups') {
    redirect('/groups')
  }
  redirect('/home')
}
