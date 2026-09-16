import type { UnitProfile } from '../../../types/game'

export type GreaterDaemonVariant = 'khorne' | 'nurgle' | 'tzeentch' | 'slaanesh' | 'generic'

const GREATER_DAEMON_PATTERN =
  /\b(bloodthirster|great unclean one|lord of change|keeper of secrets|skarbrand|shalaxi|be'?lakor)\b/i

export function isGreaterDaemon(profile: UnitProfile): boolean {
  return GREATER_DAEMON_PATTERN.test(profile.name)
}

export function getGreaterDaemonVariant(profile: UnitProfile): GreaterDaemonVariant {
  const n = profile.name.toLowerCase()
  if (/\b(bloodthirster|skarbrand)\b/.test(n)) return 'khorne'
  if (/\b(great unclean|unclean one)\b/.test(n)) return 'nurgle'
  if (/\b(lord of change)\b/.test(n)) return 'tzeentch'
  if (/\b(keeper of secrets|shalaxi)\b/.test(n)) return 'slaanesh'
  if (/\bbe'?lakor\b/.test(n)) return 'generic'
  return 'generic'
}
