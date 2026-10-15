/** Metas mensais por categoria (local, preparo para as preferências do usuário). */

const STORAGE_KEY = 'prisma_goals_v1'

export type GoalsMap = Record<string, number>

export function getGoals(): GoalsMap {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as GoalsMap
    return typeof parsed === 'object' && parsed !== null ? parsed : {}
  } catch {
    return {}
  }
}

export function setGoal(categoryId: string, value: number): GoalsMap {
  const goals = getGoals()
  if (!Number.isFinite(value) || value <= 0) {
    delete goals[categoryId]
  } else {
    goals[categoryId] = Math.round(value * 100) / 100
  }
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(goals))
  } catch {
    // ignore (private mode)
  }
  return goals
}
