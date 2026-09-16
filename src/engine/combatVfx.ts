import type { BattleState, Position, WeaponProfile } from '../types/game'
import { inferWeaponKeywords } from '../data/abilityRules'

export type ShotVfxKind = 'bolt' | 'beam' | 'missile' | 'artillery' | 'flamer'

export interface ShotVisualPayload {
  from: Position
  to: Position
  weaponName: string
  kind: ShotVfxKind
  wounds: number
  modelsLost: number
  indirect: boolean
}

export interface ShootAtTargetResult {
  state: BattleState
  shot?: ShotVisualPayload
}

export function inferShotVfxKind(weapon: WeaponProfile, indirect: boolean): ShotVfxKind {
  const name = weapon.name.toLowerCase()
  const keywords = inferWeaponKeywords(weapon)

  if (keywords.includes('Torrent') || /flamer|incendiary|phosphor|burna/i.test(name)) {
    return 'flamer'
  }
  if (indirect || keywords.includes('Indirect Fire') || /mortar|basilisk|manticore|whirlwind|bombard|colossus|wyvern/i.test(name)) {
    return 'artillery'
  }
  if (/missile|rocket|launcher|krak|frag|seeker|tau missile|hunters/i.test(name)) {
    return 'missile'
  }
  if ((weapon.strength >= 9 && weapon.ap <= -2) || /lascannon|laser|plasma|melta|fusion|bright lance|doomsday/i.test(name)) {
    return 'beam'
  }
  return 'bolt'
}
