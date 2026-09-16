import type { FactionId } from '../types/game'
import { getFaction } from './factions'

export type ArmyFactionRole = 'primary' | 'ally' | 'codex'

export interface ArmyBuilderFaction {
  factionId: FactionId
  role: ArmyFactionRole
  label: string
}

/** Chapters that may include generic Codex Space Marine units not duplicated on their roster. */
export const MARINE_CHAPTER_FACTIONS: FactionId[] = [
  'ultramarines', 'blood-angels', 'dark-angels', 'space-wolves', 'black-templars',
  'deathwatch', 'raven-guard', 'salamanders', 'imperial-fists', 'iron-hands', 'white-scars',
]

/** Grey Knights use their own roster only — no Codex merge. */
const NO_CODEX_MERGE_CHAPTERS: FactionId[] = ['grey-knights']

/** Extra faction datasheets that may appear alongside the primary army. */
const FACTION_ALLY_FACTIONS: Partial<Record<FactionId, FactionId[]>> = {
  ynnari: ['aeldari', 'drukhari', 'harlequins'],
  aeldari: ['harlequins'],
  'genestealer-cults': ['astra-militarum'],
  'chaos-space-marines': ['chaos-daemons'],
  'death-guard': ['chaos-daemons'],
  'thousand-sons': ['chaos-daemons'],
  'world-eaters': ['chaos-daemons'],
  'emperors-children': ['chaos-daemons'],
}

export function isMarineChapter(factionId: FactionId): boolean {
  return MARINE_CHAPTER_FACTIONS.includes(factionId)
}

export function usesCodexMarines(factionId: FactionId): boolean {
  return isMarineChapter(factionId) && !NO_CODEX_MERGE_CHAPTERS.includes(factionId)
}

export function getAllyFactionIds(primaryFactionId: FactionId): FactionId[] {
  return FACTION_ALLY_FACTIONS[primaryFactionId] ?? []
}

export function getArmyBuilderFactions(primaryFactionId: FactionId): ArmyBuilderFaction[] {
  const primary = getFaction(primaryFactionId)
  const factions: ArmyBuilderFaction[] = [
    { factionId: primaryFactionId, role: 'primary', label: primary.name },
  ]

  if (usesCodexMarines(primaryFactionId)) {
    factions.push({
      factionId: 'space-marines',
      role: 'codex',
      label: 'Codex Space Marines',
    })
  }

  for (const allyId of getAllyFactionIds(primaryFactionId)) {
    factions.push({
      factionId: allyId,
      role: 'ally',
      label: getFaction(allyId).name,
    })
  }

  return factions
}

export function getAllowedFactionIds(primaryFactionId: FactionId): FactionId[] {
  return getArmyBuilderFactions(primaryFactionId).map((f) => f.factionId)
}

export function isFactionAllowedInArmy(
  primaryFactionId: FactionId,
  unitFactionId: FactionId,
): boolean {
  return getAllowedFactionIds(primaryFactionId).includes(unitFactionId)
}

export function getArmyBuilderFactionMap(primaryFactionId: FactionId): Map<FactionId, ArmyBuilderFaction> {
  return new Map(getArmyBuilderFactions(primaryFactionId).map((f) => [f.factionId, f]))
}

export function describeArmyAllies(primaryFactionId: FactionId): string {
  const extras = getArmyBuilderFactions(primaryFactionId).filter((f) => f.role !== 'primary')
  if (extras.length === 0) {
    return 'This army lists only units from its own faction.'
  }
  return `Allied rosters: ${extras.map((f) => f.label).join(', ')}.`
}
