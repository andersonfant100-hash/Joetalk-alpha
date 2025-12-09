'use client'
import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { Session } from '@supabase/supabase-js'

export default function Chat({ session }: { session: Session }) {
  const [messages, setMessages] = useState<any[]>([])
  const [msg, setMsg] = useState('')
  const bottom = useRef<HTMLDivElement>(null)

  useEffect(() => {
    supabase.from('messages').select('*').order('created_at', { ascending: true })
      .then(({ data }) => setMessages(data || []))
    const channel = supabase.channel('messages')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, p => {
        setMessages(m => [...m, p.new])
      })
      .subscribe()
    return () => { supabase.removeAllChannels() }
  }, [])

  useEffect(() => { bottom.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const send = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!msg.trim()) return
    await supabase.from('messages').insert({ content: msg, user_id: session.user.id })
    setMsg('')
  }

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">#general • JoeTalk</h1>
      <div className="bg-gray-800 rounded-xl shadow-2xl h-96 flex flex-col">
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map(m => (
            <div key={m.id} className="flex gap-4">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex-center font-bold">{m.user_id[7] || '?'}</div>
              <div className="pt-1">
                <div className="text-sm text-gray-400">{m.user_id.slice(0,8)}</div>
                <div>{m.content}</div>
              </div>
            </div>
          ))}
          <div ref={bottom} />
        </div>
        <form onSubmit={send} className="p-4 border-t border-gray-700">
          <input value={msg} onChange={e=>setMsg(e.target.value)} placeholder="Say something..." className="w-full px-6 py-4 bg-gray-700 rounded-full focus:outline-none focus:ring-4 focus:ring-purple-500" />
        </form>
      </div>
      <button onClick={()=>supabase.auth.signOut()} className="mt-6 text-red-400">← Logout</button>
    </div>
  )
}
