import { supabase } from '@/lib/supabase'
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import Chat from '@/components/Chat'

export default async function Home() {
  const { data: { session } } = await supabase.auth.getSession()
  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
      {!session ? (
        <div className="w-96">
          <h1 className="text-6xl font-black text-center mb-10 bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text text-transparent">JoeTalk</h1>
          <Auth supabaseClient={supabase} appearance={{ theme: ThemeSupa }} theme="dark" providers={['google','github']} />
        </div>
      ) : <Chat session={session} />}
    </div>
  )
}
