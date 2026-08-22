import { useState, useEffect } from 'react'

// ── SET YOUR LAUNCH DATE HERE ─────────────────────────────────
// Format: 'YYYY-MM-DDTHH:MM:SS+03:00' (Kenya UTC+3)
const LAUNCH_DATE = new Date('2026-09-09T08:00:00+03:00')
// ─────────────────────────────────────────────────────────────

interface TimeLeft {
  days: number
  hours: number
  minutes: number
  seconds: number
}

function pad(n: number): string {
  return String(Math.max(0, Math.floor(n))).padStart(2, '0')
}

function getTimeLeft(): TimeLeft {
  const diff = LAUNCH_DATE.getTime() - Date.now()
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 }
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff % 86400000) / 3600000),
    minutes: Math.floor((diff % 3600000) / 60000),
    seconds: Math.floor((diff % 60000) / 1000),
  }
}

function TimeBlock({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <span
        className="text-white font-bold tabular-nums"
        style={{
          // Increased font size clamp for a bolder hero presence
          fontSize: 'clamp(64px, 16vw, 120px)',
          letterSpacing: '-0.03em',
          lineHeight: 0.95,
        }}
      >
        {pad(value)}
      </span>
      {/* Pink underline */}
      <div className="w-full h-1 bg-[#F4A7B9] mt-3 mb-2.5 rounded-full" />
      <span
        className="text-xs uppercase tracking-widest text-[#888]"
        style={{ letterSpacing: '0.2em' }}
      >
        {label}
      </span>
    </div>
  )
}

export default function Launch() {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(getTimeLeft())
  const [launched, setLaunched] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      const t = getTimeLeft()
      setTimeLeft(t)
      if (t.days === 0 && t.hours === 0 && t.minutes === 0 && t.seconds === 0) {
        setLaunched(true)
        clearInterval(interval)
      }
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div
      className="min-h-screen w-full flex flex-col items-center justify-center px-6 text-center"
      style={{ backgroundColor: '#2C2C2C' }}
    >
      {/* Logo & Tagline */}
      <div className="mb-6">
        <div className="inline-flex items-center justify-center gap-2.5">
    <span
      className="text-white font-bold tracking-tight"
      style={{ fontSize: 'clamp(28px, 6vw, 44px)', lineHeight: 1 }}
    >
      TiniTrove
    </span>
    <img
      src="/bow.png"
      alt="TiniTrove Bow"
      className="object-contain inline-block"
      style={{
        width: 'clamp(28px, 6vw, 44px)',
        height: 'clamp(28px, 6vw, 44px)',
      }}
    />
  </div>
        <p className="text-xs italic mt-1.5 text-[#999]">
          Get it for them or …practice self love
        </p>
      </div>

      {/* Status Pill */}
      <div
        className="inline-flex items-center gap-2 text-xs uppercase px-4 py-2 rounded-full mb-10"
        style={{
          background: 'rgba(244,167,185,0.12)',
          border: '1px solid rgba(244,167,185,0.25)',
          color: '#F4A7B9',
          letterSpacing: '0.1em',
        }}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-[#F4A7B9] animate-pulse" />
        {launched ? 'We are live' : 'Dropping soon!!!!'}
      </div>

      {launched ? (
        <div className="space-y-3">
          <p
            className="text-white font-bold"
            style={{ fontSize: 'clamp(32px, 8vw, 56px)' }}
          >
            We're live! 
          </p>
          <p className="text-sm text-[#8A8A8A]">
            Redirecting you to the store…
          </p>
        </div>
      ) : (
        <>
          <p
            className="text-xs uppercase mb-10 text-[#777]"
            style={{ letterSpacing: '0.16em' }}
          >
            We launch in
          </p>

          {/* Countdown Clock */}
          <div className="flex items-start justify-center gap-3 sm:gap-5">
            <TimeBlock value={timeLeft.days} label="Days" />
            <span
              className="font-light text-[#F4A7B9]"
              style={{ fontSize: 'clamp(40px, 12vw, 68px)', lineHeight: 1, paddingTop: '4px' }}
            >
              :
            </span>
            <TimeBlock value={timeLeft.hours} label="Hrs" />
            <span
              className="font-light text-[#F4A7B9]"
              style={{ fontSize: 'clamp(40px, 12vw, 68px)', lineHeight: 1, paddingTop: '4px' }}
            >
              :
            </span>
            <TimeBlock value={timeLeft.minutes} label="Min" />
            <span
              className="font-light text-[#F4A7B9]"
              style={{ fontSize: 'clamp(40px, 12vw, 68px)', lineHeight: 1, paddingTop: '4px' }}
            >
              :
            </span>
            <TimeBlock value={timeLeft.seconds} label="Sec" />
          </div>

          {/* Footer Branding & Socials */}
          <div className="mt-14 flex flex-col items-center gap-2 text-xs text-[#777]">
            <p style={{ letterSpacing: '0.04em' }}>
              Curated gifts and cute aesthetic finds
            </p>
            <div className="flex items-center gap-4 mt-1">
              <a
                href="https://tinitrove.co.ke"
                className="text-[#999] hover:text-white transition-colors"
                style={{ textDecoration: 'none', letterSpacing: '0.04em' }}
              >
                tinitrove.co.ke
              </a>
              <span className="text-[#555]">·</span>
              <a
                href="https://www.instagram.com/tini_troveke/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#F4A7B9] hover:underline"
              >
                @tini_troveke
              </a>
            </div>
          </div>
        </>
      )}
    </div>
  )
}