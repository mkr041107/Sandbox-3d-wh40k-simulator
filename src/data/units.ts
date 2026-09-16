import type { ArmyListEntry, FactionId, UnitProfile } from '../types/game'
import { inferUnitAbilities } from './unitAbilities'
import { inferPlaystyle, lookupLegacyDescription } from './unitPlaystyles'
import { UNIT_DESCRIPTIONS } from './unitDescriptions'
import { describeWeapon } from './weaponDescriptions'
import { calculateUpgradePoints } from './squadUpgrades'
import generatedUnits from './generated/units.json'

const MARINE_CHAPTER_FACTIONS: FactionId[] = [
  'space-marines', 'ultramarines', 'blood-angels', 'dark-angels', 'space-wolves',
  'black-templars', 'deathwatch', 'grey-knights', 'raven-guard', 'salamanders',
  'imperial-fists', 'iron-hands', 'white-scars',
]

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

export function getUnitProfile(id: string): UnitProfile {
  const profile = UNIT_PROFILES.find((u) => u.id === id)
  if (!profile) throw new Error(`Unknown unit: ${id}`)
  return enrichProfile(profile)
}

export function getEnrichedUnitProfile(id: string): UnitProfile {
  return getUnitProfile(id)
}

export function getUnitsForFaction(factionId: FactionId): UnitProfile[] {
  const units = UNIT_PROFILES.filter((u) => u.factionId === factionId)

  if (factionId === 'harlequins') {
    return units.map(enrichProfile)
  }

  if (factionId === 'ynnari') {
    const ynnariNames = new Set(units.map((u) => u.name))
    const allies = UNIT_PROFILES.filter((u) =>
      (u.factionId === 'aeldari' || u.factionId === 'drukhari' || u.factionId === 'harlequins')
      && !u.name.startsWith('Ynnari ')
      && !ynnariNames.has(u.name),
    )
    return [...units, ...allies].map(enrichProfile)
  }

  if (MARINE_CHAPTER_FACTIONS.includes(factionId) && factionId !== 'space-marines') {
    const chapterUnits = new Set(units.map((u) => u.name))
    const generic = UNIT_PROFILES.filter((u) =>
      u.factionId === 'space-marines' && !chapterUnits.has(u.name),
    )
    return [...units, ...generic].map(enrichProfile)
  }

  return units.map(enrichProfile)
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
