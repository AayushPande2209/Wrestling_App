import { useState, useRef } from 'react'
import { supabase } from '../lib/supabase'
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

          <p className="font-mono text-[10px] text-[#444] tracking-[0.1em] mt-4">
            FREE DURING BETA · NO CREDIT CARD
          </p>
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

      {/* 4 — Social proof bar */}
      <section className="max-w-6xl mx-auto px-5 md:px-12 py-12 md:py-16">
        <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12 border-y border-[#1a1a1a] py-10">
          <div className="flex flex-col items-center md:items-start shrink-0">
            <span className="font-mono font-bold text-[40px] text-[#e8712a] leading-none">
              50+
            </span>
            <span className="font-mono text-[10px] text-[#888] tracking-[0.15em] mt-2">
              WRESTLERS IN BETA
            </span>
          </div>

          <div className="hidden md:block w-px self-stretch bg-[#1a1a1a]" />

          <div>
            <p className="font-sans italic text-[13px] text-[#888] leading-[1.6]">
              &ldquo;I used to just wing my cuts and hope for the best. Now I know
              exactly what I need to do every day and I&apos;m performing way
              better at weight.&rdquo;
            </p>
            <p className="font-mono text-[10px] text-[#555] tracking-[0.1em] mt-3">
              — WRESTLER, PURSUIT WRESTLING CLUB
            </p>
          </div>
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

function PhoneMockup() {
  return (
    <div
      className="bg-[#0a0a0a] overflow-hidden relative"
      style={{
        width: 220,
        borderRadius: 32,
        border: '5px solid #222',
      }}
    >
      {/* Notch */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 z-10 bg-[#222] rounded-b-xl w-20 h-5" />

      {/* Status bar */}
      <div className="flex justify-between items-center px-4 pt-2 pb-1">
        <span className="font-mono text-[9px] text-white">9:41</span>
        <div className="flex items-center gap-1">
          {/* signal */}
          <svg width="14" height="9" viewBox="0 0 14 9" fill="none">
            <rect x="0" y="6" width="2" height="3" rx="0.5" fill="#fff" />
            <rect x="3.5" y="4" width="2" height="5" rx="0.5" fill="#fff" />
            <rect x="7" y="2" width="2" height="7" rx="0.5" fill="#fff" />
            <rect x="10.5" y="0" width="2" height="9" rx="0.5" fill="#fff" />
          </svg>
          {/* battery */}
          <svg width="18" height="9" viewBox="0 0 18 9" fill="none">
            <rect x="0.5" y="0.5" width="14" height="8" rx="2" stroke="#fff" />
            <rect x="2" y="2" width="9" height="5" rx="1" fill="#fff" />
            <rect x="15.5" y="3" width="1.5" height="3" rx="0.75" fill="#fff" />
          </svg>
        </div>
      </div>

      {/* Header */}
      <div className="flex justify-between items-center px-4 py-2 border-b border-[#1a1a1a]">
        <span className="font-mono font-bold text-[11px] text-[#e8712a] tracking-[0.15em]">
          KILO
        </span>
        <span className="font-mono text-[8px] text-[#888]">J. RIVERA</span>
      </div>

      <div className="px-3 py-3 space-y-2.5">
        {/* Hero cut card */}
        <div className="bg-[#141414] border border-[#222] rounded-lg p-3 relative overflow-hidden">
          <span className="font-mono text-[7px] text-[#888] tracking-[0.15em]">
            TO CUT
          </span>
          <div className="font-mono font-bold text-[28px] text-[#e8712a] leading-none mt-1">
            5.0
          </div>
          <span className="font-mono text-[7px] text-[#888] tracking-[0.1em]">
            LBS TO 120 CLASS
          </span>
          {/* progress bar */}
          <div className="w-full h-1 bg-[#222] rounded-full mt-2 overflow-hidden">
            <div className="h-full bg-[#e8712a] rounded-full" style={{ width: '70%' }} />
          </div>
          <button className="w-full mt-2.5 bg-[#e8712a] text-[#0a0a0a] font-mono font-bold text-[8px] tracking-[0.1em] py-1.5 rounded">
            + LOG WEIGHT
          </button>

          {/* sparkline overlay */}
          <svg
            className="absolute bottom-0 left-0 w-full"
            height="28"
            viewBox="0 0 200 28"
            preserveAspectRatio="none"
          >
            <path
              d="M0,20 L30,16 L60,18 L90,10 L120,13 L150,6 L180,9 L200,4 L200,28 L0,28 Z"
              fill="#e8712a"
              opacity="0.08"
            />
            <path
              d="M0,20 L30,16 L60,18 L90,10 L120,13 L150,6 L180,9 L200,4"
              fill="none"
              stroke="#e8712a"
              strokeWidth="1.5"
              opacity="0.5"
            />
          </svg>
        </div>

        {/* 2 stat cards */}
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-[#141414] border border-[#222] rounded-lg p-2">
            <span className="font-mono text-[6px] text-[#888] tracking-[0.15em]">
              RECORD
            </span>
            <div className="font-mono font-bold text-[14px] text-white mt-0.5">
              12–3
            </div>
          </div>
          <div className="bg-[#141414] border border-[#222] rounded-lg p-2">
            <span className="font-mono text-[6px] text-[#888] tracking-[0.15em]">
              STREAK
            </span>
            <div className="font-mono font-bold text-[14px] text-[#e8712a] mt-0.5">
              7 DAYS
            </div>
          </div>
        </div>

        {/* Coach chat preview */}
        <div className="bg-[#141414] border border-[#222] rounded-lg p-2.5 space-y-1.5">
          <div className="bg-[#1c1c1c] rounded-lg rounded-tl-sm px-2 py-1 mr-6">
            <p className="font-sans text-[7px] text-[#ccc] leading-snug">
              Morning, Jordan. You&apos;re 1.2 lbs ahead of plan — nice work.
            </p>
          </div>
          <div className="bg-[#e8712a] rounded-lg rounded-tr-sm px-2 py-1 ml-6">
            <p className="font-sans text-[7px] text-[#0a0a0a] leading-snug">
              What should I eat before practice?
            </p>
          </div>
          <div className="bg-[#1c1c1c] rounded-lg rounded-tl-sm px-2 py-1 mr-6">
            <p className="font-sans text-[7px] text-[#ccc] leading-snug">
              Half a turkey wrap + water. Keeps you light but fueled.
            </p>
          </div>
        </div>
      </div>

      {/* Bottom tab bar */}
      <div className="flex justify-between items-center px-3 py-2 border-t border-[#1a1a1a]">
        {[
          { label: 'HOME', active: true },
          { label: 'COACH' },
          { label: 'WEIGHT' },
          { label: 'ACTIVITY' },
          { label: 'OTHER' },
        ].map(({ label, active }) => (
          <span
            key={label}
            className={`font-mono text-[6px] tracking-[0.05em] ${
              active ? 'text-[#e8712a]' : 'text-[#555]'
            }`}
          >
            {label}
          </span>
        ))}
      </div>
    </div>
  )
}
