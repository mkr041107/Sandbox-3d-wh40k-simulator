import type { FactionId, UnitProfile } from '../../../types/game'
import type { MiniatureArchetype } from './miniatureArchetype'

/** Biological / structural look — separate from archetype (tank vs infantry). */
export type MiniatureSilhouette =
  | 'human'
  | 'daemon'
  | 'tyranid'
  | 'ork'
  | 'necron'
  | 'aeldari'
  | 'machine'
  | 'tau'
  | 'cult'
  | 'knight'

const DAEMON_FACTIONS: FactionId[] = ['chaos-daemons']
const ORK_FACTIONS: FactionId[] = ['orks']
const NECRON_FACTIONS: FactionId[] = ['necrons']
const AELDARI_FACTIONS: FactionId[] = ['aeldari', 'drukhari', 'harlequins', 'ynnari']
const TAU_FACTIONS: FactionId[] = ['tau-empire']
const MACHINE_FACTIONS: FactionId[] = ['adeptus-mechanicus', 'leagues-of-votann']
const KNIGHT_FACTIONS: FactionId[] = ['imperial-knights', 'chaos-knights']

export function getMiniatureSilhouette(profile: UnitProfile, archetype: MiniatureArchetype): MiniatureSilhouette {
  const n = profile.name.toLowerCase()
  const f = profile.factionId

  if (archetype === 'titanic' && (KNIGHT_FACTIONS.includes(f) || /\b(knight|armiger|war dog|wraithknight)\b/.test(n))) {
    return 'knight'
  }
  if (KNIGHT_FACTIONS.includes(f) && archetype !== 'infantry' && archetype !== 'character') return 'knight'

  if (DAEMON_FACTIONS.includes(f) || /\b(daemon|bloodletter|plaguebearer|daemonette|horror|bloodthirster|great unclean|lord of change|keeper of secrets|be'?lakor|skarbrand|shalaxi)\b/.test(n)) {
    return 'daemon'
  }
  if (f === 'genestealer-cults' || /\b(genestealer|purestrain|patriarch|aberrant|metamorph)\b/.test(n)) return 'cult'
  if (f === 'tyranids' || /\b(tyranid|gaunt|termagant|hormagaunt|lictor|carnifex|trygon|mawloc|haruspex|exocrine|tyrannofex|hive tyrant|swarmlord|broodlord|zoanthrope|gargoyle|ripper)\b/.test(n)) {
    return 'tyranid'
  }
  if (ORK_FACTIONS.includes(f) || /\b(ork|boyz|nob|gretchin|squig|meganob)\b/.test(n)) return 'ork'
  if (NECRON_FACTIONS.includes(f) || /\b(necron|canoptek|flayed|immortal|warrior|scarab|wraith|destroyer|overlord|cryptek)\b/.test(n)) return 'necron'
  if (AELDARI_FACTIONS.includes(f)) return 'aeldari'
  if (TAU_FACTIONS.includes(f)) return 'tau'
  if (MACHINE_FACTIONS.includes(f) || (profile.keywords.includes('Walker') && /\b(kastelan|kataphron|servitor|robot|cybernetica)\b/.test(n))) {
    return 'machine'
  }
  if (/\b(plague marine|poxwalker|death guard|nurgle)\b/.test(n) && archetype !== 'vehicle' && archetype !== 'tank') {
    return 'daemon' // rot-daemonsque infantry
  }

  return 'human'
}

export function silhouetteLabel(silhouette: MiniatureSilhouette): string {
  const labels: Record<MiniatureSilhouette, string> = {
    human: 'Infantry',
    daemon: 'Daemon',
    tyranid: 'Tyranid',
    ork: 'Ork',
    necron: 'Necron',
    aeldari: 'Aeldari',
    machine: 'Machine',
    tau: "T'au",
    cult: 'Cult',
    knight: 'Knight',
  }
  return labels[silhouette]
}

export function isMechanicalArchetype(archetype: MiniatureArchetype): boolean {
  return archetype === 'tank' || archetype === 'vehicle' || archetype === 'walker' || archetype === 'flyer'
}
