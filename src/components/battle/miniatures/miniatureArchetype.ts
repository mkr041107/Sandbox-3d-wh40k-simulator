import type { UnitProfile } from '../../../types/game'

export type MiniatureArchetype =
  | 'infantry'
  | 'character'
  | 'vehicle'
  | 'tank'
  | 'walker'
  | 'monster'
  | 'flyer'
  | 'titanic'

/** Maps unit datasheets to a visual archetype (GRIMSWARM / VTT token pattern). */
export function getMiniatureArchetype(profile: UnitProfile): MiniatureArchetype {
  const n = profile.name.toLowerCase()

  if (profile.category === 'lord-of-war' || profile.keywords.includes('Titanic')) return 'titanic'
  if (profile.category === 'flyer' || profile.keywords.includes('Fly')) return 'flyer'
  if (profile.keywords.includes('Tank') || /\b(baneblade|leman russ|predator|hammerhead|rogal dorn|shadowsword|stormlord)\b/.test(n)) {
    return 'tank'
  }
  if (profile.keywords.includes('Walker') || /\b(dreadnought|helbrute|deff dread|wraithlord|sentinel|dunecrawler|onager|invictor|warsuit)\b/.test(n)) {
    return 'walker'
  }
  if (profile.keywords.includes('Vehicle') || profile.keywords.includes('Transport')) return 'vehicle'
  if (profile.keywords.includes('Monster') || /\b(carnifex|trygon|mawloc|haruspex|daemon prince|avatar|ctan|hive tyrant)\b/.test(n)) {
    return 'monster'
  }
  if (profile.category === 'hq' || profile.keywords.includes('Character')) return 'character'
  return 'infantry'
}

/** Optional GLB path under /public/models/ — drop CC0/low-poly models here to replace procedural meshes. */
export function getGlbPath(archetype: MiniatureArchetype): string {
  return `/models/${archetype}.glb`
}
