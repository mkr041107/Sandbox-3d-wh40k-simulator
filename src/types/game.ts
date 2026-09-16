export type FactionId =
  | 'adepta-sororitas'
  | 'adeptus-custodes'
  | 'adeptus-mechanicus'
  | 'aeldari'
  | 'agents-of-the-imperium'
  | 'astra-militarum'
  | 'black-templars'
  | 'blood-angels'
  | 'chaos-daemons'
  | 'chaos-knights'
  | 'chaos-space-marines'
  | 'dark-angels'
  | 'death-guard'
  | 'deathwatch'
  | 'drukhari'
  | 'emperors-children'
  | 'genestealer-cults'
  | 'grey-knights'
  | 'harlequins'
  | 'imperial-fists'
  | 'imperial-knights'
  | 'iron-hands'
  | 'leagues-of-votann'
  | 'necrons'
  | 'orks'
  | 'raven-guard'
  | 'salamanders'
  | 'space-marines'
  | 'space-wolves'
  | 'tau-empire'
  | 'thousand-sons'
  | 'tyranids'
  | 'ultramarines'
  | 'white-scars'
  | 'world-eaters'
  | 'ynnari'

export type UnitCategory =
  | 'hq'
  | 'troops'
  | 'elites'
  | 'fast-attack'
  | 'heavy-support'
  | 'flyer'
  | 'dedicated-transport'
  | 'lord-of-war'

export type WeaponType = 'ranged' | 'melee'

export interface WeaponProfile {
  name: string
  range: number
  attacks: number
  skill: number
  strength: number
  ap: number
  damage: number
  type: WeaponType
  description?: string
}

export type UnitAbilityKind = 'weapon' | 'rule'

export interface UnitAbility {
  name: string
  description: string
  kind?: UnitAbilityKind
  weapon?: WeaponProfile
  keywords?: string[]
}

export interface UnitProfile {
  id: string
  name: string
  factionId: FactionId
  category: UnitCategory
  points: number
  models: number
  movement: number
  toughness: number
  save: number
  wounds: number
  leadership: number
  objectiveControl: number
  weapons: WeaponProfile[]
  keywords: string[]
  baseSize: number
  description?: string
  role?: string
  abilities?: UnitAbility[]
}

export interface Faction {
  id: FactionId
  name: string
  allegiance: 'imperium' | 'chaos' | 'xenos'
  primaryColor: string
  secondaryColor: string
  description: string
}

export type SquadUpgradeCategory =
  | 'sergeant'
  | 'specialist'
  | 'special-weapon'
  | 'heavy-weapon'
  | 'wargear'

export interface SquadUpgrade {
  id: string
  name: string
  category: SquadUpgradeCategory
  points: number
  description: string
  maxPerSquad: number
  exclusiveWith?: string[]
  weapons?: WeaponProfile[]
  ability?: string
}

export interface ArmyListEntry {
  entryId: string
  profileId: string
  count: number
  upgrades: string[]
}

export interface ArmyList {
  name: string
  factionId: FactionId
  pointsLimit: number
  entries: ArmyListEntry[]
}

export interface Position {
  x: number
  y: number
}

export type BattlePhase = 'command' | 'movement' | 'shooting' | 'charge' | 'fight' | 'morale'

export type PlayerId = 'player' | 'ai'

export interface BattleUnit {
  id: string
  profileId: string
  upgrades: string[]
  owner: PlayerId
  position: Position
  rotation: number
  currentWounds: number
  modelsRemaining: number
  hasMoved: boolean
  hasShot: boolean
  hasCharged: boolean
  hasFought: boolean
  isEngaged: boolean
}

export interface BattleState {
  id: string
  turn: number
  activePlayer: PlayerId
  phase: BattlePhase
  playerUnits: BattleUnit[]
  aiUnits: BattleUnit[]
  selectedUnitId: string | null
  log: BattleLogEntry[]
  playerVp: number
  aiVp: number
  isOver: boolean
  winner: PlayerId | null
}

export interface BattleLogEntry {
  turn: number
  phase: BattlePhase
  message: string
  player: PlayerId | 'system'
}

export type AIDifficulty = 'recruit' | 'battle-brother' | 'veteran' | 'chapter-master'

export interface GameSettings {
  pointsLimit: number
  aiDifficulty: AIDifficulty
  aiFactionId: FactionId
  battlefieldWidth: number
  battlefieldHeight: number
}

export type AppScreen = 'home' | 'army-builder' | 'battle-setup' | 'battle'
