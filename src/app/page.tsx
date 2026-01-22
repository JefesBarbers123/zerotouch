import { getCurrentUser } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function Home() {
  let user = null
  try {
    user = await getCurrentUser()
  } catch (e) {
    console.warn("Home: DB Error during build or runtime", e)
  }

  if (user) {
    redirect('/dashboard')
  } else {
    redirect('/jobs')
  }
}
