import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'
import CoachOnboarding from '../components/CoachOnboarding'

const API_URL = import.meta.env.VITE_API_URL
const MAX_MESSAGE_LENGTH = 750
const DAILY_MESSAGE_LIMIT = 45

// ─── Status bar at top of chat ───────────────────────────────────────────────
function StatusBar({ wrestler, nextEvent }) {
  const rawCut =
    wrestler?.current_weight != null && wrestler?.weight_class != null
      ? wrestler.current_weight - wrestler.weight_class
      : null
  const lbsToCut = rawCut !== null ? Math.max(0, rawCut) : null
  const onWeight = rawCut !== null && rawCut <= 0

  let daysOut = null
  if (nextEvent?.starts_at) {
    const diff = Math.ceil(
      (new Date(nextEvent.starts_at) - new Date()) / 86_400_000
    )
    daysOut = Math.max(0, diff)
  }

  return (
    <div className="flex items-center gap-4 px-4 py-2 border-b border-[#1f1f1f] bg-[#111] shrink-0 overflow-x-auto">
      {wrestler?.current_weight != null && (
        <Chip label="CURRENT" value={`${wrestler.current_weight} LBS`} />
      )}
      {lbsToCut !== null && (
        <Chip
          label="TO CUT"
          value={onWeight ? 'ON WEIGHT' : `${lbsToCut.toFixed(1)} LBS`}
          highlight={!onWeight && lbsToCut > 0}
          green={onWeight}
        />
      )}
      {daysOut !== null && (
        <Chip
          label="NEXT EVENT"
          value={daysOut === 0 ? 'TODAY' : `${daysOut}D`}
          highlight={daysOut <= 3 && daysOut > 0}
        />
      )}
    </div>
  )
}

function Chip({ label, value, highlight, green }) {
  return (
    <div className="shrink-0">
      <div className="text-[8px] font-display tracking-[0.18em] text-[#555]">{label}</div>
      <div
        className={`font-mono text-[11px] font-bold ${
          green ? 'text-[#22c55e]' : highlight ? 'text-[#e8712a]' : 'text-[#aaa]'
        }`}
      >
        {value}
      </div>
    </div>
  )
}

// Renders **bold** spans while preserving newlines. Splits on ** markers and
// treats every odd-indexed segment as bold text.
function renderMarkdown(text) {
  return text.split('\n').map((line, li) => (
    <span key={li}>
      {li > 0 && <br />}
      {line.split('**').map((seg, si) =>
        si % 2 === 1
          ? <strong key={si} className="text-[#f0f0f0] font-bold">{seg}</strong>
          : seg
      )}
    </span>
  ))
}

// ─── Individual chat message ─────────────────────────────────────────────────
function Message({ role, content }) {
  const isUser = role === 'user'
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} px-4`}>
      <div
        className={`max-w-[82%] md:max-w-[70%] px-4 py-3 font-mono text-sm leading-relaxed ${
          isUser
            ? 'bg-[#111] border border-[#e8712a]/40 text-[#f0f0f0] rounded-sm'
            : 'bg-[#0d0d0d] border border-[#1f1f1f] text-[#ccc] rounded-sm'
        }`}
      >
        {!isUser && (
          <div className="text-[9px] font-display tracking-[0.2em] text-[#e8712a] mb-1.5">
            COACH
          </div>
        )}
        {isUser ? content : renderMarkdown(content)}
      </div>
    </div>
  )
}

// ─── Main component ──────────────────────────────────────────────────────────
export default function Coach() {
  const [wrestler, setWrestler] = useState(null)
  const [nextEvent, setNextEvent] = useState(null)
  const [coachProfile, setCoachProfile] = useState(undefined) // undefined = loading
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [sendError, setSendError] = useState(null)
  const [messagesRemaining, setMessagesRemaining] = useState(null)
  const [initialLoading, setInitialLoading] = useState(true)

  const bottomRef = useRef(null)
  const inputRef = useRef(null)

  // ── Initial data load ────────────────────────────────────────────────────
  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      const uid = session.user.id
      const now = new Date().toISOString()
      const todayStart = new Date()
      todayStart.setUTCHours(0, 0, 0, 0)

      const [
        { data: wrestlerData },
        { data: historyData },
        { data: eventData },
        { count: todayMessageCount },
      ] = await Promise.all([
        supabase
          .from('wrestlers')
          .select('name, current_weight, weight_class, coach_profile')
          .eq('id', uid)
          .single(),
        supabase
          .from('coach_messages')
          .select('role, content, created_at')
          .eq('wrestler_id', uid)
          .order('created_at', { ascending: true })
          .limit(40),
        supabase
          .from('schedules')
          .select('title, starts_at')
          .eq('wrestler_id', uid)
          .gt('starts_at', now)
          .order('starts_at', { ascending: true })
          .limit(1),
        supabase
          .from('coach_messages')
          .select('*', { count: 'exact', head: true })
          .eq('wrestler_id', uid)
          .eq('role', 'user')
          .gte('created_at', todayStart.toISOString()),
      ])

      setWrestler(wrestlerData)
      setCoachProfile(wrestlerData?.coach_profile ?? null)
      setMessages(historyData ?? [])
      setNextEvent(eventData?.[0] ?? null)
      setMessagesRemaining(Math.max(0, DAILY_MESSAGE_LIMIT - (todayMessageCount || 0)))
      setInitialLoading(false)
    }
    load()
  }, [])

  // Auto-scroll to bottom whenever messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // ── Shared fetch helper (auth + JSON) ────────────────────────────────────
  async function postCoach(payload) {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) throw new Error('Not authenticated')
    const res = await fetch(`${API_URL}/coach/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify(payload),
    })
    if (!res.ok) {
      const body = await res.json().catch(() => ({ detail: 'Request failed' }))
      const error = new Error(body.detail || 'Request failed')
      error.status = res.status
      throw error
    }
    return res.json()
  }

  // ── Onboarding complete (inline) ─────────────────────────────────────────
  async function handleOnboardingComplete(profile) {
    const welcomeContent = `Got it — I've got everything I need. You're cutting to ${profile.weight_class_confirm}, you typically start ${profile.cut_start_timing.toLowerCase()}, and your same-day cut is around ${profile.same_day_cut} lbs. I'll build your plan around that. What do you want to work on first?`
    setCoachProfile(profile)
    setMessages([{ role: 'assistant', content: welcomeContent }])
    const { data: { session } } = await supabase.auth.getSession()
    if (session) {
      supabase.from('coach_messages').insert({
        wrestler_id: session.user.id,
        role: 'assistant',
        content: welcomeContent,
      })
    }
  }

  // ── Chat: send message ────────────────────────────────────────────────────
  async function handleSend(e) {
    e.preventDefault()
    const text = input.trim()
    if (!text || sending || messagesRemaining === 0 || input.length > MAX_MESSAGE_LENGTH) return

    setInput('')
    setSendError(null)
    const userMsg = { role: 'user', content: text }
    setMessages(prev => [...prev, userMsg])
    setSending(true)

    try {
      let data
      try {
        data = await postCoach({ message: text })
      } catch (err) {
        // Only retry on network errors — not HTTP 4xx/5xx (those have .status set)
        if (err.status) throw err
        await new Promise(r => setTimeout(r, 3000))
        data = await postCoach({ message: text })
      }
      setMessagesRemaining(data.messages_remaining)
      setMessages(prev => [...prev, { role: 'assistant', content: data.response }])
    } catch (err) {
      if (err.status === 429) setMessagesRemaining(0)
      setSendError(err.message)
      setMessages(prev => prev.slice(0, -1))
    } finally {
      setSending(false)
      inputRef.current?.focus()
    }
  }

  // ── Render: loading ───────────────────────────────────────────────────────
  if (initialLoading) {
    return (
      <div className="font-mono text-[#888] text-xs tracking-[0.3em]">LOADING...</div>
    )
  }

  // ── Render: onboarding ────────────────────────────────────────────────────
  if (coachProfile === null) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 py-8">
        <CoachOnboarding wrestler={wrestler} onComplete={handleOnboardingComplete} />
      </div>
    )
  }

  // ── Render: chat ─────────────────────────────────────────────────────────
  return (
    // Offset the Layout's padding so the chat fills the full available height
    <div className="flex flex-col -mx-4 md:-mx-8 -mt-8 h-[calc(100vh-3rem)] md:h-screen">

      {/* Page title row */}
      <div className="px-4 md:px-8 pt-6 pb-3 shrink-0">
        <h1 className="font-display font-bold text-2xl tracking-[0.2em] text-[#f0f0f0]">
          COACH
        </h1>
        <p className="font-mono text-[10px] text-[#555] mt-0.5">
          AI weight cut coach — knows your logs, matches, and schedule
        </p>
      </div>

      {/* Status bar */}
      <StatusBar wrestler={wrestler} nextEvent={nextEvent} />

      {/* Message list */}
      <div className="flex-1 overflow-y-auto py-4 space-y-3">
        {messages.length === 0 && (
          <div className="px-4 font-mono text-xs text-[#333]">
            Ask anything about your cut, nutrition, or how to feel ready on match day.
          </div>
        )}
        {messages.map((msg, i) => (
          <Message key={i} role={msg.role} content={msg.content} />
        ))}
        {sending && (
          <div className="flex justify-start px-4">
            <div className="bg-[#0d0d0d] border border-[#1f1f1f] px-4 py-3 font-mono text-sm text-[#555] rounded-sm">
              <div className="text-[9px] font-display tracking-[0.2em] text-[#e8712a] mb-1.5">
                COACH
              </div>
              <span className="animate-pulse">thinking...</span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Error banner */}
      {sendError && (
        <div className="mx-4 mb-2 font-mono text-[11px] text-red-400 border border-red-900/50 bg-red-950/20 px-3 py-2 shrink-0">
          {sendError}
        </div>
      )}

      {/* Input bar */}
      <div className="shrink-0 px-4 md:px-8 py-3 border-t border-[#1f1f1f] bg-[#0d0d0d]">
        <form onSubmit={handleSend} className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={messagesRemaining === 0 ? 'Daily limit reached. Resets at midnight.' : 'Ask your coach…'}
            disabled={sending || messagesRemaining === 0}
            className="flex-1 bg-[#111] border border-[#1f1f1f] text-[#f0f0f0] font-mono text-sm px-4 py-2.5 outline-none focus:border-[#e8712a] transition-colors placeholder-[#333] disabled:opacity-50 min-h-[44px]"
          />
          <button
            type="submit"
            disabled={!input.trim() || sending || messagesRemaining === 0 || input.length > MAX_MESSAGE_LENGTH}
            className="px-5 py-2.5 bg-[#e8712a] text-[#0d0d0d] font-display font-bold text-[10px] tracking-[0.2em] hover:bg-[#d4621f] transition-colors disabled:opacity-40 shrink-0 min-h-[44px]"
          >
            SEND
          </button>
        </form>

        {/* Char counter + daily remaining */}
        <div className="flex justify-between items-center mt-1.5 min-h-[14px]">
          <span className={`font-mono text-[10px] transition-colors ${
            input.length > MAX_MESSAGE_LENGTH
              ? 'text-red-400'
              : input.length > MAX_MESSAGE_LENGTH - 50
              ? 'text-[#e8712a]'
              : 'text-[#555]'
          }`}>
            {input.length > MAX_MESSAGE_LENGTH
              ? `Message too long — keep it under ${MAX_MESSAGE_LENGTH} characters`
              : input.length > 0
              ? `${input.length} / ${MAX_MESSAGE_LENGTH}`
              : ''}
          </span>
          <span className="font-mono text-[10px] text-[#555]">
            {messagesRemaining === 0
              ? 'Daily limit reached'
              : messagesRemaining !== null
              ? `${messagesRemaining} messages remaining today`
              : ''}
          </span>
        </div>
      </div>
    </div>
  )
}
