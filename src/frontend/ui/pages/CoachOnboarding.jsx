import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import CoachOnboarding from '../components/CoachOnboarding'

export default function CoachOnboardingPage() {
  const [wrestler, setWrestler] = useState(null)
  const [loaded, setLoaded] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { navigate('/auth', { replace: true }); return }
      const { data } = await supabase
        .from('wrestlers')
        .select('weight_class, coach_profile')
        .eq('id', session.user.id)
        .single()
      if (data?.coach_profile) { navigate('/dashboard', { replace: true }); return }
      setWrestler(data)
      setLoaded(true)
    }
    load()
  }, [navigate])

  if (!loaded) {
    return (
      <div className="min-h-screen bg-[#0c0c0c] flex items-center justify-center">
        <div className="font-mono text-[#888] text-xs tracking-[0.3em]">LOADING...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0c0c0c] flex items-center justify-center px-4 py-8">
      <CoachOnboarding
        wrestler={wrestler}
        onComplete={() => navigate('/dashboard', { replace: true })}
      />
    </div>
  )
}
