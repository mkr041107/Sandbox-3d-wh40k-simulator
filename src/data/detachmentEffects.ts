import type { BattlePhase, CombatModifiers, CombatDoctrine } from '../types/game'
import type { DetachmentStratagem } from './detachments'

const FOCUS_ARMY_MODIFIERS: Record<string, Partial<CombatModifiers>> = {
  Aggressive: { chargeBonus: 1, meleeHitBonus: 1 },
  Melee: { meleeHitBonus: 1, chargeBonus: 1 },
  Shooting: { rangedHitBonus: 1 },
  Artillery: { rangedHitBonus: 1, woundBonus: 1 },
  Fast: { chargeBonus: 1 },
  Defensive: { saveBonus: 1, cover: true },
  Balanced: {},
}

const DETACHMENT_ARMY_RULES: Record<string, {
  doctrineCycle?: CombatDoctrine[]
  waaaghTurns?: number
  montkaTurns?: number
  kauyon?: boolean
  oathOfMoment?: boolean
  bornSoldiers?: boolean
  focusFallback?: string
}> = {
  'gladius-task-force': { doctrineCycle: ['devastator', 'tactical', 'assault'] },
  'ironstorm-spearhead': { focusFallback: 'Armoured' },
  'spearhead-task-force': { oathOfMoment: true, focusFallback: 'Elite' },
  'dawn-of-war': { bornSoldiers: true },
  'bridgehead-strike': { focusFallback: 'Aggressive' },
  'guard-and-storm': { focusFallback: 'Artillery' },
  'war-horde': { waaaghTurns: 3 },
  'dread-waaagh': { waaaghTurns: 3, focusFallback: 'Mechanised' },
  'kult-of-speed': { focusFallback: 'Fast' },
  'montka': { montkaTurns: 3 },
  'kauyon': { kauyon: true },
  'berserker-warband': { waaaghTurns: 3, focusFallback: 'Melee' },
  'crusade-fleet': { focusFallback: 'Aggressive' },
  'imperial-combined-arms': { focusFallback: 'Balanced' },
  'chaos-warband': { focusFallback: 'Aggressive' },
  'xenos-strike-force': { focusFallback: 'Balanced' },
}

export function getDetachmentRuleConfig(detachmentId: string | null) {
  if (!detachmentId) return {}
  return DETACHMENT_ARMY_RULES[detachmentId] ?? {}
}

export function getFocusCombatModifiers(focus: string): CombatModifiers {
  return { ...(FOCUS_ARMY_MODIFIERS[focus] ?? {}) }
}

export function parseStratagemModifiers(stratagem: DetachmentStratagem): CombatModifiers {
  const effect = stratagem.effect.toLowerCase()
  const phase = stratagem.phase.toLowerCase()
  const mods: CombatModifiers = {}

  if (effect.includes('+1 to hit')) {
    if (phase === 'fight' || effect.includes('melee') || effect.includes('in melee')) {
      mods.meleeHitBonus = (mods.meleeHitBonus ?? 0) + 1
    } else {
      mods.rangedHitBonus = (mods.rangedHitBonus ?? 0) + 1
    }
  }

  if (effect.includes('+1 to wound')) {
    mods.woundBonus = (mods.woundBonus ?? 0) + 1
  }

  if (effect.includes('re-roll hit') || effect.includes('reroll hit')) {
    mods.rerollHits = true
  }

  if (effect.includes('re-roll wound') || effect.includes('reroll wound')) {
    mods.rerollWounds = true
  }

  if (effect.includes('fights twice') || effect.includes('fights again') || effect.includes('fight again')) {
    mods.fightsTwice = true
  }

  if (effect.includes('benefit of cover') || effect.includes('cover until')) {
    mods.cover = true
    mods.saveBonus = (mods.saveBonus ?? 0) + 1
  }

  if (effect.includes('cannot use cover')) {
    mods.denyCover = true
  }

  if (effect.includes('ignores cover')) {
    mods.ignoresCover = true
  }

  if (effect.includes('4+ invulnerable') || effect.includes('invulnerable save')) {
    mods.invulnerableSave = 4
  }

  if (effect.includes('5+ feel no pain') || effect.includes('feel no pain')) {
    mods.feelNoPain = 5
  }

  if (effect.includes('charge after advancing') || effect.includes('charge after advance')) {
    mods.chargeAfterAdvance = true
    mods.chargeBonus = (mods.chargeBonus ?? 0) + 1
  }

  if (effect.includes('adds +2" to charge') || effect.includes('+2" to charge')) {
    mods.chargeBonus = (mods.chargeBonus ?? 0) + 2
  }

  if (effect.includes('adds +1" to charge') || effect.includes('+1" to charge')) {
    mods.chargeBonus = (mods.chargeBonus ?? 0) + 1
  }

  if (effect.includes('fights first')) {
    mods.meleeHitBonus = (mods.meleeHitBonus ?? 0) + 1
  }

  if (Object.keys(mods).length === 0) {
    if (phase === 'fight') mods.meleeHitBonus = 1
    else if (phase === 'shooting') mods.rangedHitBonus = 1
    else if (phase === 'charge') mods.chargeBonus = 1
  }

  return mods
}

export function phaseMatches(stratagemPhase: string, battlePhase: BattlePhase): boolean {
  const normalized = stratagemPhase.toLowerCase()
  if (normalized === 'any') return true
  return normalized === battlePhase
}

export function mergeCombatModifiers(...groups: CombatModifiers[]): CombatModifiers {
  const merged: CombatModifiers = {}
  for (const mods of groups) {
    merged.rangedHitBonus = (merged.rangedHitBonus ?? 0) + (mods.rangedHitBonus ?? 0)
    merged.rangedHitPenalty = (merged.rangedHitPenalty ?? 0) + (mods.rangedHitPenalty ?? 0)
    merged.meleeHitBonus = (merged.meleeHitBonus ?? 0) + (mods.meleeHitBonus ?? 0)
    merged.woundBonus = (merged.woundBonus ?? 0) + (mods.woundBonus ?? 0)
    merged.saveBonus = (merged.saveBonus ?? 0) + (mods.saveBonus ?? 0)
    merged.chargeBonus = (merged.chargeBonus ?? 0) + (mods.chargeBonus ?? 0)
    merged.cover = merged.cover || mods.cover
    merged.rerollHits = merged.rerollHits || mods.rerollHits
    merged.rerollWounds = merged.rerollWounds || mods.rerollWounds
    merged.autoHit = merged.autoHit || mods.autoHit
    merged.ignoresCover = merged.ignoresCover || mods.ignoresCover
    merged.denyCover = merged.denyCover || mods.denyCover
    merged.fightsTwice = merged.fightsTwice || mods.fightsTwice
    merged.chargeAfterAdvance = merged.chargeAfterAdvance || mods.chargeAfterAdvance
    if (mods.invulnerableSave) {
      merged.invulnerableSave = merged.invulnerableSave
        ? Math.min(merged.invulnerableSave, mods.invulnerableSave)
        : mods.invulnerableSave
    }
    if (mods.feelNoPain) {
      merged.feelNoPain = merged.feelNoPain
        ? Math.min(merged.feelNoPain, mods.feelNoPain)
        : mods.feelNoPain
    }
  }
  return merged
}
