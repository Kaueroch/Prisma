/** Metas mensais por categoria (local, preparo para as preferências do usuário). */

const STORAGE_KEY = 'prisma_goals_v1'

export interface Goal {
  value: number
  /** Motivo da meta, texto livre do usuário. */
  description: string
}

export type GoalsMap = Record<string, Goal>

function normalize(raw: unknown): GoalsMap {
  if (typeof raw !== 'object' || raw === null) return {}
  const out: GoalsMap = {}
  for (const [id, g] of Object.entries(raw as Record<string, unknown>)) {
    if (typeof g === 'number' && Number.isFinite(g) && g > 0) {
      out[id] = { value: g, description: '' }
    } else if (typeof g === 'object' && g !== null) {
      const value = (g as Goal).value
      if (Number.isFinite(value) && (value as number) > 0) {
        out[id] = { value: value as number, description: typeof (g as Goal).description === 'string' ? (g as Goal).description : '' }
      }
    }
  }
  return out
}

export function getGoals(): GoalsMap {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    return normalize(JSON.parse(raw))
  } catch {
    return {}
  }
}

export function setGoal(categoryId: string, value: number, description?: string): GoalsMap {
  const goals = getGoals()
  if (!Number.isFinite(value) || value <= 0) {
    delete goals[categoryId]
  } else {
    goals[categoryId] = {
      value: Math.round(value * 100) / 100,
      description: (description ?? goals[categoryId]?.description ?? '').trim().slice(0, 120),
    }
  }
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(goals))
  } catch {
    // ignore (private mode)
  }
  return goals
}
