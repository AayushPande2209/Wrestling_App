import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { IconRobot } from '@tabler/icons-react'

const QUESTIONS = [
  {
    id: 'weight_class_confirm',
    question: 'What weight class are you cutting to this season?',
    type: 'number',
    placeholder: '120',
    prefill: 'weight_class',
    suffix: 'lbs',
  },
  {
    id: 'season_start_weight',
    question: 'What do you usually weigh at the start of the season?',
    type: 'number',
    placeholder: '128',
    suffix: 'lbs',
  },
  {
    id: 'cut_start_timing',
    question: 'How far out do you usually start your cut?',
    type: 'select',
    options: ['Day of weigh-ins', '2-3 days out', '4-5 days out', 'A week or more'],
  },
  {
    id: 'cut_methods',
    question: 'How do you cut weight?',
    type: 'multiselect',
    options: [
      'Diet / eating clean',
      'Sweating at practice',
      'Hot bath / sauna',
      'Water loading then restricting',
      'Combination of all',
    ],
  },
  {
    id: 'same_day_cut',
    question: 'How many lbs do you usually cut same-day on weigh-in day?',
    type: 'number',
    placeholder: '3',
    suffix: 'lbs',
  },
  {
    id: 'school_lunch',
    question: "What's your school lunch situation? What's usually available?",
    type: 'textarea',
    placeholder: 'e.g. pizza, chicken sandwiches, salad bar...',
  },
  {
    id: 'extra_notes',
    question: 'Anything else your coach should know about how your body cuts weight?',
    type: 'textarea',
    placeholder: 'e.g. I hold water easily, I cramp up if I restrict too much...',
    optional: true,
    skipLabel: 'Skip this one',
  },
]

// Accepts wrestler (for weight_class prefill) and onComplete(profile) callback.
// Does not handle guard logic or navigate — those belong to the caller.
export default function CoachOnboarding({ wrestler, onComplete }) {
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState({})
  const [inputValue, setInputValue] = useState('')
  const [selectedOptions, setSelectedOptions] = useState([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const inputRef = useRef(null)

  // Prefill Q1 from wrestler's weight_class on mount
  useEffect(() => {
    const firstQ = QUESTIONS[0]
    if (firstQ.prefill && wrestler?.[firstQ.prefill]) {
      setInputValue(String(wrestler[firstQ.prefill]))
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Focus active input whenever step changes
  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 50)
  }, [step])

  const q = QUESTIONS[step]
  const isLast = step === QUESTIONS.length - 1

  function canAdvance() {
    if (q.optional) return true
    if (q.type === 'multiselect') return selectedOptions.length > 0
    return inputValue.trim().length > 0
  }

  function advance(skipCurrent = false) {
    const value = skipCurrent
      ? null
      : q.type === 'multiselect'
      ? selectedOptions
      : inputValue.trim()
    const newAnswers = { ...answers, [q.id]: value }
    setAnswers(newAnswers)
    setInputValue('')
    setSelectedOptions([])

    if (isLast) {
      doSubmit(newAnswers)
    } else {
      const nextQ = QUESTIONS[step + 1]
      if (nextQ.prefill && wrestler?.[nextQ.prefill]) {
        setInputValue(String(wrestler[nextQ.prefill]))
      }
      setStep(s => s + 1)
    }
  }

  async function doSubmit(finalAnswers) {
    setSaving(true)
    setError(null)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('Not authenticated')
      const profile = {
        weight_class_confirm: finalAnswers.weight_class_confirm,
        season_start_weight: finalAnswers.season_start_weight,
        cut_start_timing: finalAnswers.cut_start_timing,
        cut_methods: finalAnswers.cut_methods,
        same_day_cut: finalAnswers.same_day_cut,
        school_lunch: finalAnswers.school_lunch,
        extra_notes: finalAnswers.extra_notes || null,
        completed_at: new Date().toISOString(),
      }
      const { error: dbErr } = await supabase
        .from('wrestlers')
        .update({ coach_profile: profile })
        .eq('id', session.user.id)
      if (dbErr) throw dbErr
      onComplete(profile)
    } catch (err) {
      setError(err.message)
      setSaving(false)
    }
  }

  return (
    <div className="w-full max-w-md">

      {/* Agent header */}
      <div className="flex items-center gap-2 mb-6">
        <div className="w-7 h-7 border border-[#2a1a08] flex items-center justify-center shrink-0">
          <IconRobot size={14} stroke={1.5} className="text-[#e8712a]" />
        </div>
        <span className="font-display text-[9px] tracking-[0.25em] text-[#e8712a]">PURSUIT COACH</span>
      </div>

      {/* Progress */}
      <div className="flex gap-1 mb-2">
        {QUESTIONS.map((_, i) => (
          <div
            key={i}
            className={`h-0.5 flex-1 transition-colors ${i <= step ? 'bg-[#e8712a]' : 'bg-[#1f1f1f]'}`}
          />
        ))}
      </div>
      <p className="font-mono text-[10px] text-[#555] mb-8">{step + 1} of {QUESTIONS.length}</p>

      {/* Question card */}
      <div className="border border-[#1a1a1a] bg-[#0a0a0a] px-6 py-5 mb-6">
        <p className="font-display font-semibold text-xl text-[#f0f0f0] tracking-wide leading-snug">
          "{q.question}"
        </p>
      </div>

      {/* Inputs + submit */}
      <form
        onSubmit={e => { e.preventDefault(); if (canAdvance()) advance() }}
        className="space-y-3"
      >
        {q.type === 'number' && (
          <div className="flex items-center gap-3">
            <input
              ref={inputRef}
              type="number"
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              placeholder={q.placeholder}
              inputMode="numeric"
              className="flex-1 bg-[#060606] border border-[#1e1e1e] text-[#f0f0f0] font-mono text-2xl font-bold px-4 py-3 outline-none focus:border-[#e8712a] transition-colors placeholder-[#2a2a2a] min-h-[56px]"
            />
            {q.suffix && (
              <span className="font-mono text-[#555] text-sm shrink-0">{q.suffix}</span>
            )}
          </div>
        )}

        {q.type === 'textarea' && (
          <textarea
            ref={inputRef}
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            placeholder={q.placeholder}
            rows={3}
            className="w-full bg-[#060606] border border-[#1e1e1e] text-[#f0f0f0] font-mono text-sm px-4 py-3 outline-none focus:border-[#e8712a] transition-colors placeholder-[#2a2a2a] resize-none"
          />
        )}

        {q.type === 'select' && (
          <div className="space-y-2">
            {q.options.map(opt => (
              <button
                key={opt}
                type="button"
                onClick={() => setInputValue(opt)}
                className={`w-full px-4 py-3 text-left font-mono text-sm border transition-colors min-h-[44px] ${
                  inputValue === opt
                    ? 'border-[#e8712a] bg-[#2a1a08] text-[#f0f0f0]'
                    : 'border-[#1e1e1e] bg-[#060606] text-[#888] hover:border-[#333] hover:text-[#aaa]'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        )}

        {q.type === 'multiselect' && (
          <div className="space-y-2">
            {q.options.map(opt => {
              const checked = selectedOptions.includes(opt)
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() =>
                    setSelectedOptions(prev =>
                      checked ? prev.filter(o => o !== opt) : [...prev, opt]
                    )
                  }
                  className={`w-full px-4 py-3 text-left font-mono text-sm border transition-colors flex items-center gap-3 min-h-[44px] ${
                    checked
                      ? 'border-[#e8712a] bg-[#2a1a08] text-[#f0f0f0]'
                      : 'border-[#1e1e1e] bg-[#060606] text-[#888] hover:border-[#333] hover:text-[#aaa]'
                  }`}
                >
                  <span
                    className={`w-4 h-4 border shrink-0 flex items-center justify-center ${
                      checked ? 'border-[#e8712a] bg-[#e8712a]' : 'border-[#333]'
                    }`}
                  >
                    {checked && (
                      <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                        <path
                          d="M1 4L4 7L9 1"
                          stroke="#0d0d0d"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </span>
                  {opt}
                </button>
              )
            })}
          </div>
        )}

        {error && (
          <p className="font-mono text-[11px] text-red-400 border border-red-900/50 bg-red-950/20 px-3 py-2">
            {error}
          </p>
        )}

        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={saving || !canAdvance()}
            className="flex-1 py-3 bg-[#e8712a] text-[#0d0d0d] font-display font-bold text-[10px] tracking-[0.25em] hover:bg-[#d4621f] transition-colors disabled:opacity-40 min-h-[44px]"
          >
            {saving ? 'SETTING UP...' : isLast ? "LET'S GO" : 'NEXT →'}
          </button>
          {q.optional && !saving && (
            <button
              type="button"
              onClick={() => advance(true)}
              className="font-mono text-[10px] text-[#555] hover:text-[#888] tracking-[0.1em] transition-colors whitespace-nowrap"
            >
              {q.skipLabel ?? 'Skip'}
            </button>
          )}
        </div>
      </form>

    </div>
  )
}
