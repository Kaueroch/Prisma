/** Dias consecutivos com pelo menos 1 transação (terminando hoje ou ontem). */
export function calcStreak(dateStrs: string[]): number {
  const days = new Set(dateStrs.map((d) => d.slice(0, 10)))
  const key = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

  const cursor = new Date()
  if (!days.has(key(cursor))) {
    cursor.setDate(cursor.getDate() - 1)
    if (!days.has(key(cursor))) return 0
  }
  let streak = 0
  while (days.has(key(cursor))) {
    streak += 1
    cursor.setDate(cursor.getDate() - 1)
  }
  return streak
}
