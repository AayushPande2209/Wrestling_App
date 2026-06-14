import { useState, useRef } from 'react'
import { supabase } from '../lib/supabase'
import PhoneMockup from '../components/PhoneMockup'
import {
  IconRobot,
  IconChartLine,
  IconApple,
  IconTrophy,
  IconDroplet,
  IconBell,
} from '@tabler/icons-react'

const FEATURES = [
  {
    Icon: IconRobot,
    title: 'AI WEIGHT COACH',
    desc: 'A personal coach that knows your weight history, cut style, and performance patterns. Ask it anything — it gives real answers, not generic advice.',
  },
  {
    Icon: IconChartLine,
    title: 'SMART CUT PLANNING',
    desc: 'Two-phase cut planning that matches how wrestlers actually cut — gradual lead-up and same-day water cut. Built around your body, not a formula.',
  },
  {
    Icon: IconApple,
    title: 'MEAL PLANS THAT FIT',
    desc: 'Specific meals and grocery lists based on your cut phase. Accounts for your school lunch, your schedule, and what you actually eat.',
  },
  {
    Icon: IconTrophy,
    title: 'PERFORMANCE TRACKING',
    desc: 'See how your weight on match day correlates with your results. Find your optimal cut range so you compete at your best every time.',
  },
  {
    Icon: IconDroplet,
    title: 'POST WEIGH-IN RECOVERY',
    desc: 'Step-by-step rehydration protocol after weigh-ins. Exactly what to drink, eat, and when — so you’re ready to compete, not depleted.',
  },
  {
    Icon: IconBell,
    title: 'DAILY CHECK-INS',
    desc: 'Morning breakdowns, mid-day check-ins, and weigh-in reminders. Your coach stays on top of your cut so you don’t have to think about it.',
  },
]

export default function Landing() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState(null) // null | 'loading' | 'success' | 'error' | 'duplicate'
  const formRef = useRef(null)

  function scrollToForm() {
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  async function handleSubmit(e) {
    e?.preventDefault()
    if (!email || !email.includes('@')) {
      setStatus('error')
      return
    }

    setStatus('loading')

    const { error } = await supabase
      .from('waitlist')
      .insert({ email: email.toLowerCase().trim() })

    if (error) {
      if (error.code === '23505') {
        // unique violation
        setStatus('duplicate')
      } else {
        setStatus('error')
      }
      return
    }

    setStatus('success')
    setEmail('')
  }

  const waitlistForm = (
    <div ref={formRef}>
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="you@email.com"
          className="flex-1 bg-[#060606] border border-[#222] text-[#fff] font-mono text-[13px] px-4 py-3 outline-none focus:border-[#e8712a] transition-colors placeholder-[#444] rounded"
        />
        <button
          type="submit"
          disabled={status === 'loading'}
          className="bg-[#e8712a] text-[#0a0a0a] font-mono font-bold text-[11px] tracking-[0.15em] px-6 py-3 rounded hover:bg-[#d4641f] transition-colors disabled:opacity-50 whitespace-nowrap"
        >
          {status === 'loading' ? '...' : 'JOIN WAITLIST'}
        </button>
      </form>

      {status === 'success' && (
        <p className="font-mono text-[11px] text-[#4ade80] mt-2.5">
          You&apos;re on the list. We&apos;ll be in touch.
        </p>
      )}
      {status === 'duplicate' && (
        <p className="font-mono text-[11px] text-[#e8712a] mt-2.5">
          You&apos;re already on the list.
        </p>
      )}
      {status === 'error' && (
        <p className="font-mono text-[11px] text-[#e24a4a] mt-2.5">
          Something went wrong. Try again.
        </p>
      )}
    </div>
  )

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* 1 — Nav */}
      <nav className="w-full flex justify-between items-center border-b border-[#1a1a1a] px-5 md:px-12 py-5">
        <div className="font-mono font-bold text-[18px] text-[#e8712a] tracking-[0.2em]">
          KILO
        </div>
        <button
          onClick={scrollToForm}
          className="hidden md:inline-block bg-[#e8712a] text-[#0a0a0a] font-mono text-[11px] tracking-[0.15em] px-4 py-2 rounded font-bold hover:bg-[#d4641f] transition-colors"
        >
          JOIN WAITLIST
        </button>
      </nav>

      {/* 2 — Hero */}
      <section className="max-w-6xl mx-auto px-5 md:px-12 py-10 md:py-20 grid md:grid-cols-2 gap-10 md:gap-16 items-center">
        {/* Left column */}
        <div>
          <div className="flex items-center gap-2 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-[#e8712a]" />
            <span className="font-mono text-[9px] text-[#e8712a] tracking-[0.25em]">
              AI-POWERED WRESTLING COACH
            </span>
          </div>

          <h1 className="font-mono font-bold text-[42px] leading-[1.1] mb-6">
            Cut smarter,
            <br />
            <span className="text-[#e8712a]">wrestle better.</span>
          </h1>

          <p className="font-sans text-[14px] text-[#888] leading-[1.6] mb-8 max-w-md">
            The AI weight cut coach that learns how your body cuts weight and
            builds a personalized plan — so you make weight without sacrificing
            performance.
          </p>

          {waitlistForm}

        </div>

        {/* Right column — iPhone mockup */}
        <div className="flex justify-center">
          <PhoneMockup />
        </div>
      </section>

      {/* 3 — Features */}
      <section className="max-w-6xl mx-auto px-5 md:px-12 py-12 md:py-16">
        <div className="font-mono text-[9px] text-[#e8712a] tracking-[0.25em] mb-8">
          WHAT KILO DOES
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          {FEATURES.map(({ Icon, title, desc }) => (
            <div
              key={title}
              className="bg-[#141414] border border-[#222] rounded-lg p-5"
            >
              <Icon size={22} stroke={1.5} className="text-[#e8712a] mb-4" />
              <h3 className="font-mono font-bold text-[12px] tracking-[0.1em] text-white mb-2">
                {title}
              </h3>
              <p className="font-sans text-[12px] text-[#888] leading-[1.6]">
                {desc}
              </p>
            </div>
          ))}
        </div>
      </section>


      {/* 6 — Footer */}
      <footer className="flex flex-col sm:flex-row justify-between items-center gap-3 border-t border-[#1a1a1a] px-5 md:px-12 py-5">
        <div className="font-mono font-bold text-[#e8712a] tracking-[0.2em] text-[14px]">
          KILO
        </div>
        <div className="font-mono text-[10px] text-[#333] tracking-[0.1em]">
          © 2026 KILO · BUILT FOR WRESTLERS
        </div>
      </footer>
    </div>
  )
}
