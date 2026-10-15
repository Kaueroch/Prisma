import { useEffect, useState } from 'react'

interface Piece {
  id: number
  left: number
  delay: number
  duration: number
  size: number
  color: string
  round: boolean
}

const COLORS = ['#3da56f', '#6fd3a0', '#d48a90', '#8fd6ae', '#d9b45f', '#f0f5f2']

function makePieces(n: number): Piece[] {
  return Array.from({ length: n }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 250,
    duration: 1100 + Math.random() * 900,
    size: 5 + Math.random() * 7,
    color: COLORS[i % COLORS.length],
    round: Math.random() > 0.6,
  }))
}

/**
 * Celebração discreta ao registrar uma transação.
 * Ouve o evento `prisma:celebrate` e solta uma chuva curta de confete.
 * Respeita `prefers-reduced-motion` via regra global no index.css.
 */
export function Celebrate() {
  const [pieces, setPieces] = useState<Piece[] | null>(null)

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined
    const onCelebrate = () => {
      setPieces(makePieces(36))
      clearTimeout(timer)
      timer = setTimeout(() => setPieces(null), 2200)
    }
    window.addEventListener('prisma:celebrate', onCelebrate)
    return () => {
      window.removeEventListener('prisma:celebrate', onCelebrate)
      clearTimeout(timer)
    }
  }, [])

  if (!pieces) return null

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[200] overflow-hidden">
      {pieces.map((p) => (
        <span
          key={p.id}
          className="confetti-piece"
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.round ? p.size : p.size * 0.55,
            borderRadius: p.round ? '50%' : 2,
            backgroundColor: p.color,
            animationDelay: `${p.delay}ms`,
            animationDuration: `${p.duration}ms`,
          }}
        />
      ))}
    </div>
  )
}
