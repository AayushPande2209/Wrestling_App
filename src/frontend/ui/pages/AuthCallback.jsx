import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function AuthCallback() {
  const navigate = useNavigate()

  useEffect(() => {
    let done = false

    const routeSession = async (session, sub) => {
      if (done) return
      done = true
      sub.unsubscribe()

      const { data: wrestler } = await supabase
        .from('wrestlers')
        .select('id, name, coach_profile')
        .eq('id', session.user.id)
        .single()

      if (!wrestler) {
        await supabase.from('wrestlers').insert({
          id: session.user.id,
          email: session.user.email,
          name: session.user.user_metadata?.full_name || session.user.email,
        })
        navigate('/profile/setup', { replace: true })
        return
      }

      if (wrestler.name === session.user.email || !wrestler.coach_profile) {
        navigate('/profile/setup', { replace: true })
        return
      }

      navigate('/dashboard', { replace: true })
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (done) return
        if (session && (event === 'SIGNED_IN' || event === 'INITIAL_SESSION')) {
          routeSession(session, subscription)
        } else if (event === 'INITIAL_SESSION' && !session && !new URL(window.location.href).searchParams.has('code')) {
          // No code in URL means user navigated here directly — not an OAuth redirect.
          // If there IS a code, Supabase is still exchanging it; SIGNED_IN will fire when done.
          navigate('/auth', { replace: true })
        }
      }
    )

    return () => subscription.unsubscribe()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="min-h-screen bg-[#0d0d0d] flex items-center justify-center">
      <div className="font-mono text-[#e8712a] text-xs tracking-[0.15em]">
        SIGNING IN...
      </div>
    </div>
  )
}
