import { redirect } from 'next/navigation'

// /posts redirige vers /workspace (ancienne URL)
export default function PostsRedirect() {
  redirect('/workspace')
}
