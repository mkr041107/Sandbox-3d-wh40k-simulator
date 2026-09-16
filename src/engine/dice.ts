export function rollD6(): number {
  return Math.floor(Math.random() * 6) + 1
}

export function rollDice(count: number): number[] {
  return Array.from({ length: count }, () => rollD6())
}

export function countSuccesses(rolls: number[], target: number): number {
  return rolls.filter((r) => r >= target).length
}
