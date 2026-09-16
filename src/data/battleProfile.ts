import type { BattleUnit, UnitProfile } from '../types/game'
import { applyUpgradesToProfile } from './squadUpgrades'
import { getUnitProfile } from './units'

export function getBattleUnitProfile(unit: BattleUnit): UnitProfile {
  const base = getUnitProfile(unit.profileId)
  if (!unit.upgrades?.length) return base
  return applyUpgradesToProfile(base, unit.upgrades)
}
