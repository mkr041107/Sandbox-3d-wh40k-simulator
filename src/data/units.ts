import type { ArmyListEntry, FactionId, UnitProfile } from '../types/game'
import {
  getAllowedFactionIds,
  getAllyFactionIds,
  isMarineChapter,
  usesCodexMarines,
} from './factionAllies'
import { inferUnitAbilities } from './unitAbilities'
import { inferPlaystyle, lookupLegacyDescription } from './unitPlaystyles'
import { UNIT_DESCRIPTIONS } from './unitDescriptions'
import { describeWeapon } from './weaponDescriptions'
import { calculateUpgradePoints } from './squadUpgrades'
import generatedUnits from './generated/units.json'

export const UNIT_PROFILES: UnitProfile[] = generatedUnits as UnitProfile[]

function enrichProfile(profile: UnitProfile): UnitProfile {
  const playstyle = inferPlaystyle(profile)
  const byId = UNIT_DESCRIPTIONS[profile.id]
  const byName = lookupLegacyDescription(profile)
  const enriched: UnitProfile = {
    ...profile,
    role: byId?.role ?? byName?.role ?? playstyle.role,
    description: byId?.description ?? byName?.description ?? playstyle.description,
    weapons: profile.weapons.map((w) => ({
      ...w,
      description: w.description ?? describeWeapon(w),
    })),
    abilities: inferUnitAbilities(profile, playstyle),
  }
  return enriched
}

function dedupeUnitsByName(units: UnitProfile[]): UnitProfile[] {
  const seen = new Set<string>()
  const merged: UnitProfile[] = []
  for (const unit of units) {
    if (seen.has(unit.name)) continue
    seen.add(unit.name)
    merged.push(unit)
  }
  return merged
}

function collectFactionUnits(factionId: FactionId): UnitProfile[] {
  return UNIT_PROFILES.filter((u) => u.factionId === factionId)
}

/** Units legal in the army builder for a locked detachment faction (+ codex / allies). */
export function getBuildableUnits(primaryFactionId: FactionId): UnitProfile[] {
  const primaryUnits = collectFactionUnits(primaryFactionId)
  const merged: UnitProfile[] = [...primaryUnits]

  if (primaryFactionId === 'ynnari') {
    const ynnariNames = new Set(primaryUnits.map((u) => u.name))
    for (const allyId of getAllyFactionIds(primaryFactionId)) {
      const allyUnits = collectFactionUnits(allyId).filter(
        (u) => !u.name.startsWith('Ynnari ') && !ynnariNames.has(u.name),
      )
      merged.push(...allyUnits)
    }
    return dedupeUnitsByName(merged).map(enrichProfile)
  }

  if (usesCodexMarines(primaryFactionId)) {
    const chapterNames = new Set(primaryUnits.map((u) => u.name))
    const codexUnits = collectFactionUnits('space-marines').filter(
      (u) => !chapterNames.has(u.name),
    )
    merged.push(...codexUnits)
  }

  for (const allyId of getAllyFactionIds(primaryFactionId)) {
    if (allyId === 'space-marines' && usesCodexMarines(primaryFactionId)) continue
    merged.push(...collectFactionUnits(allyId))
  }

  return dedupeUnitsByName(merged).map(enrichProfile)
}

export function getUnitProfile(id: string): UnitProfile {
  const profile = UNIT_PROFILES.find((u) => u.id === id)
  if (!profile) throw new Error(`Unknown unit: ${id}`)
  return enrichProfile(profile)
}

export function getEnrichedUnitProfile(id: string): UnitProfile {
  return getUnitProfile(id)
}

/** Prefer getBuildableUnits when building from a detachment-locked list. */
export function getUnitsForFaction(factionId: FactionId): UnitProfile[] {
  return getBuildableUnits(factionId)
}

export function isUnitLegalForArmy(primaryFactionId: FactionId, profileId: string): boolean {
  return getBuildableUnits(primaryFactionId).some((u) => u.id === profileId)
}

export function getAllowedFactionIdsForArmy(primaryFactionId: FactionId): FactionId[] {
  return getAllowedFactionIds(primaryFactionId)
}

export function isMarineChapterFaction(factionId: FactionId): boolean {
  return isMarineChapter(factionId)
}

export function calculateEntryPoints(entry: ArmyListEntry): number {
  const profile = getUnitProfile(entry.profileId)
  const upgradePts = calculateUpgradePoints(entry.upgrades ?? [])
  return (profile.points + upgradePts) * entry.count
}

export function calculateArmyPoints(entries: ArmyListEntry[]): number {
  return entries.reduce((total, entry) => total + calculateEntryPoints(entry), 0)
}

export function upgradesKey(upgrades: string[]): string {
  return [...upgrades].sort().join(',')
}
