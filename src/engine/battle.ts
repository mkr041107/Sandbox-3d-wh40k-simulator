import type {
  ArmyList,
  BattleLogEntry,
  BattlePhase,
  BattleState,
  BattleUnit,
  PlayerId,
  Position,
  UnitProfile,
} from '../types/game'
import { getBattleUnitProfile } from '../data/battleProfile'
import { DEPLOY_ZONE_DEPTH } from '../data/battlefield'
import { getUnitProfile, getUnitsForFaction } from '../data/units'
import { getUpgradesForUnit } from '../data/squadUpgrades'
import { v4 as uuidv4 } from 'uuid'
import { countSuccesses, rollDice } from './dice'

const PHASES: BattlePhase[] = ['command', 'movement', 'shooting', 'charge', 'fight', 'morale']

export function distance(a: Position, b: Position): number {
  return Math.hypot(a.x - b.x, a.y - b.y)
}

export function createBattleUnit(
  profileId: string,
  owner: PlayerId,
  position: Position,
  upgrades: string[] = [],
): BattleUnit {
  const profile = getUnitProfile(profileId)
  return {
    id: uuidv4(),
    profileId,
    upgrades,
    owner,
    position,
    rotation: owner === 'player' ? 0 : Math.PI,
    currentWounds: profile.wounds * profile.models,
    modelsRemaining: profile.models,
    hasMoved: false,
    hasShot: false,
    hasCharged: false,
    hasFought: false,
    isEngaged: false,
  }
}

const DEPLOY_EDGE_MARGIN = 2
const DEPLOY_ROW_SPACING = 3

function deploySpacing(profileId: string): number {
  const profile = getUnitProfile(profileId)
  const footprintInches = profile.baseSize / 25.4
  return Math.max(2.5, Math.ceil(footprintInches * 10) / 10 + 0.5)
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

export function deployArmy(
  army: ArmyList,
  owner: PlayerId,
  battlefieldWidth: number,
  battlefieldHeight: number,
): BattleUnit[] {
  const units: BattleUnit[] = []
  const minX = DEPLOY_EDGE_MARGIN + 1
  const maxX = battlefieldWidth - DEPLOY_EDGE_MARGIN - 1

  const playerBack = DEPLOY_EDGE_MARGIN + 1.5
  const playerFront = playerBack + DEPLOY_ZONE_DEPTH - 1
  const aiBack = battlefieldHeight - DEPLOY_EDGE_MARGIN - 1.5
  const aiFront = aiBack - DEPLOY_ZONE_DEPTH + 1

  const backY = owner === 'player' ? playerBack : aiBack
  const frontY = owner === 'player' ? playerFront : aiFront
  const rowStep = owner === 'player' ? DEPLOY_ROW_SPACING : -DEPLOY_ROW_SPACING
  const maxRows = Math.max(1, Math.floor(DEPLOY_ZONE_DEPTH / DEPLOY_ROW_SPACING))

  let row = 0
  let pass = 0
  let x = minX

  for (const entry of army.entries) {
    for (let i = 0; i < entry.count; i++) {
      const spacing = deploySpacing(entry.profileId)
      const stagger = pass % 2 === 1 ? spacing * 0.35 : 0
      const y = clamp(backY + row * rowStep, Math.min(backY, frontY), Math.max(backY, frontY))

      units.push(createBattleUnit(
        entry.profileId,
        owner,
        { x: clamp(x + stagger, minX, maxX), y },
        entry.upgrades ?? [],
      ))

      x += spacing
      if (x > maxX) {
        x = minX
        row += 1
        if (row >= maxRows) {
          row = 0
          pass += 1
        }
      }
    }
  }

  return units
}

export function initBattle(
  playerArmy: ArmyList,
  aiArmy: ArmyList,
  battlefieldWidth = 60,
  battlefieldHeight = 44,
): BattleState {
  const playerUnits = deployArmy(playerArmy, 'player', battlefieldWidth, battlefieldHeight)
  const aiUnits = deployArmy(aiArmy, 'ai', battlefieldWidth, battlefieldHeight)

  return {
    id: uuidv4(),
    turn: 1,
    activePlayer: 'player',
    phase: 'movement',
    playerUnits,
    aiUnits,
    selectedUnitId: null,
    log: [{
      turn: 1,
      phase: 'movement',
      message: 'Battle begins! Player turn — Movement phase.',
      player: 'system',
    }],
    playerVp: 0,
    aiVp: 0,
    isOver: false,
    winner: null,
  }
}

function getAllUnits(state: BattleState): BattleUnit[] {
  return [...state.playerUnits, ...state.aiUnits]
}

export function getUnit(state: BattleState, unitId: string): BattleUnit | undefined {
  return getAllUnits(state).find((u) => u.id === unitId)
}

export function getProfile(unit: BattleUnit): UnitProfile {
  return getBattleUnitProfile(unit)
}

export function getUnitsForPlayer(state: BattleState, player: PlayerId): BattleUnit[] {
  return player === 'player' ? state.playerUnits : state.aiUnits
}

export function getEnemyUnits(state: BattleState, player: PlayerId): BattleUnit[] {
  return player === 'player' ? state.aiUnits : state.playerUnits
}

function addLog(state: BattleState, message: string, player: PlayerId | 'system' = 'system'): BattleLogEntry {
  return { turn: state.turn, phase: state.phase, message, player }
}

function updateUnit(state: BattleState, unitId: string, updates: Partial<BattleUnit>): BattleState {
  const updateList = (units: BattleUnit[]) =>
    units.map((u) => (u.id === unitId ? { ...u, ...updates } : u))

  return {
    ...state,
    playerUnits: updateList(state.playerUnits),
    aiUnits: updateList(state.aiUnits),
  }
}

function removeDeadUnits(state: BattleState): BattleState {
  const filter = (units: BattleUnit[]) => units.filter((u) => u.modelsRemaining > 0)
  return {
    ...state,
    playerUnits: filter(state.playerUnits),
    aiUnits: filter(state.aiUnits),
  }
}

function checkBattleEnd(state: BattleState): BattleState {
  const playerAlive = state.playerUnits.length > 0
  const aiAlive = state.aiUnits.length > 0

  if (!playerAlive || !aiAlive) {
    return {
      ...state,
      isOver: true,
      winner: playerAlive ? 'player' : aiAlive ? 'ai' : null,
      log: [...state.log, addLog(state, playerAlive ? 'Victory! The enemy has been destroyed.' : 'Defeat! Your army has been annihilated.')],
    }
  }
  return state
}

export function canMove(unit: BattleUnit, state: BattleState): boolean {
  if (state.phase !== 'movement' || state.activePlayer !== unit.owner) return false
  if (unit.hasMoved || unit.isEngaged) return false
  return true
}

export function moveUnit(
  state: BattleState,
  unitId: string,
  newPosition: Position,
): BattleState {
  const unit = getUnit(state, unitId)
  if (!unit || !canMove(unit, state)) return state

  const profile = getProfile(unit)
  const dist = distance(unit.position, newPosition)
  if (dist > profile.movement) return state

  let newState = updateUnit(state, unitId, {
    position: newPosition,
    hasMoved: true,
  })

  newState = {
    ...newState,
    log: [...newState.log, addLog(newState, `${profile.name} moved ${dist.toFixed(1)}"`, unit.owner)],
  }

  return newState
}

export function getRangedWeapons(profile: UnitProfile) {
  return profile.weapons.filter((w) => w.type === 'ranged')
}

export function getMeleeWeapons(profile: UnitProfile) {
  return profile.weapons.filter((w) => w.type === 'melee')
}

export function getValidShootTargets(
  state: BattleState,
  unitId: string,
  weaponIndex = 0,
): BattleUnit[] {
  const unit = getUnit(state, unitId)
  if (!unit) return []

  const profile = getProfile(unit)
  const weapons = getRangedWeapons(profile)
  if (weapons.length === 0) return []

  const weapon = weapons[weaponIndex] ?? weapons[0]
  const enemies = getEnemyUnits(state, unit.owner)

  return enemies.filter((enemy) => {
    const dist = distance(unit.position, enemy.position)
    return dist <= weapon.range && dist > 1
  })
}

function resolveHits(
  attacks: number,
  skill: number,
  modifier = 0,
): { hits: number; rolls: number[] } {
  const rolls = rollDice(attacks)
  const hits = countSuccesses(rolls, Math.max(2, skill - modifier))
  return { hits, rolls }
}

function resolveWounds(hits: number, strength: number, toughness: number): number {
  let woundTarget = 4
  if (strength >= toughness * 2) woundTarget = 2
  else if (strength > toughness) woundTarget = 3
  else if (strength === toughness) woundTarget = 4
  else if (strength * 2 <= toughness) woundTarget = 6
  else woundTarget = 5

  const rolls = rollDice(hits)
  return countSuccesses(rolls, woundTarget)
}

function resolveSaves(wounds: number, ap: number, save: number): number {
  const saveTarget = Math.min(6, save - ap)
  const rolls = rollDice(wounds)
  return wounds - countSuccesses(rolls, saveTarget)
}

export function shootAtTarget(
  state: BattleState,
  attackerId: string,
  targetId: string,
  weaponIndex = 0,
): BattleState {
  const attacker = getUnit(state, attackerId)
  const target = getUnit(state, targetId)
  if (!attacker || !target) return state
  if (state.phase !== 'shooting' || attacker.owner !== state.activePlayer) return state
  if (attacker.hasShot) return state

  const attackerProfile = getProfile(attacker)
  const targetProfile = getProfile(target)
  const weapons = getRangedWeapons(attackerProfile)
  const weapon = weapons[weaponIndex] ?? weapons[0]
  if (!weapon) return state

  const dist = distance(attacker.position, target.position)
  if (dist > weapon.range || dist <= 1) return state

  const totalAttacks = weapon.attacks * attacker.modelsRemaining
  const { hits } = resolveHits(totalAttacks, weapon.skill)
  const wounds = resolveWounds(hits, weapon.strength, targetProfile.toughness)
  const failedSaves = resolveSaves(wounds, weapon.ap, targetProfile.save)
  const damageDealt = failedSaves * weapon.damage

  let modelsLost = 0
  let remainingWounds = target.currentWounds - damageDealt
  while (remainingWounds <= 0 && modelsLost < target.modelsRemaining) {
    modelsLost++
    remainingWounds += targetProfile.wounds
  }

  const newModels = Math.max(0, target.modelsRemaining - modelsLost)
  const newWounds = newModels > 0
    ? Math.max(1, remainingWounds)
    : 0

  let newState = updateUnit(state, attackerId, { hasShot: true })
  newState = updateUnit(newState, targetId, {
    currentWounds: newWounds,
    modelsRemaining: newModels,
  })

  newState = {
    ...newState,
    log: [...newState.log, addLog(
      newState,
      `${attackerProfile.name} fired ${weapon.name} at ${targetProfile.name}: ${failedSaves} wounds (${modelsLost} models lost)`,
      attacker.owner,
    )],
  }

  newState = removeDeadUnits(newState)
  return checkBattleEnd(newState)
}

export function getChargeTargets(state: BattleState, unitId: string): BattleUnit[] {
  const unit = getUnit(state, unitId)
  if (!unit) return []

  const profile = getProfile(unit)
  const enemies = getEnemyUnits(state, unit.owner)

  return enemies.filter((enemy) => {
    const dist = distance(unit.position, enemy.position)
    return dist <= profile.movement + 12 && dist > 1
  })
}

export function chargeUnit(
  state: BattleState,
  chargerId: string,
  targetId: string,
): BattleState {
  const charger = getUnit(state, chargerId)
  const target = getUnit(state, targetId)
  if (!charger || !target) return state
  if (state.phase !== 'charge' || charger.owner !== state.activePlayer) return state
  if (charger.hasCharged) return state

  const chargerProfile = getProfile(charger)
  const dist = distance(charger.position, target.position)

  const chargeRoll = rollDice(2).reduce((a, b) => a + b, 0)
  if (chargeRoll < dist - 1) {
    return {
      ...state,
      log: [...state.log, addLog(state, `${chargerProfile.name} failed charge (${chargeRoll}" vs ${dist.toFixed(1)}")`, charger.owner)],
    }
  }

  const angle = Math.atan2(
    target.position.y - charger.position.y,
    target.position.x - charger.position.x,
  )
  const newPos = {
    x: target.position.x - Math.cos(angle) * 1.5,
    y: target.position.y - Math.sin(angle) * 1.5,
  }

  let newState = updateUnit(state, chargerId, {
    position: newPos,
    hasCharged: true,
    isEngaged: true,
  })
  newState = updateUnit(newState, targetId, { isEngaged: true })

  newState = {
    ...newState,
    log: [...newState.log, addLog(newState, `${chargerProfile.name} charged ${getProfile(target).name}! (${chargeRoll}")`, charger.owner)],
  }

  return newState
}

export function fightCombat(
  state: BattleState,
  attackerId: string,
  targetId: string,
): BattleState {
  const attacker = getUnit(state, attackerId)
  const target = getUnit(state, targetId)
  if (!attacker || !target) return state
  if (state.phase !== 'fight') return state
  if (!attacker.isEngaged) return state

  const attackerProfile = getProfile(attacker)
  const targetProfile = getProfile(target)
  const weapons = getMeleeWeapons(attackerProfile)
  const weapon = weapons[0]
  if (!weapon) return state

  const totalAttacks = weapon.attacks * attacker.modelsRemaining
  const { hits } = resolveHits(totalAttacks, weapon.skill)
  const wounds = resolveWounds(hits, weapon.strength, targetProfile.toughness)
  const failedSaves = resolveSaves(wounds, weapon.ap, targetProfile.save)
  const damageDealt = failedSaves * weapon.damage

  let modelsLost = 0
  let remainingWounds = target.currentWounds - damageDealt
  while (remainingWounds <= 0 && modelsLost < target.modelsRemaining) {
    modelsLost++
    remainingWounds += targetProfile.wounds
  }

  const newModels = Math.max(0, target.modelsRemaining - modelsLost)
  const newWounds = newModels > 0 ? Math.max(1, remainingWounds) : 0

  let newState = updateUnit(state, attackerId, { hasFought: true })
  newState = updateUnit(newState, targetId, {
    currentWounds: newWounds,
    modelsRemaining: newModels,
  })

  newState = {
    ...newState,
    log: [...newState.log, addLog(
      newState,
      `${attackerProfile.name} fought ${targetProfile.name}: ${failedSaves} wounds (${modelsLost} models lost)`,
      attacker.owner,
    )],
  }

  newState = removeDeadUnits(newState)
  return checkBattleEnd(newState)
}

function resetUnitActions(units: BattleUnit[]): BattleUnit[] {
  return units.map((u) => ({
    ...u,
    hasMoved: false,
    hasShot: false,
    hasCharged: false,
    hasFought: false,
    isEngaged: false,
  }))
}

export function nextPhase(state: BattleState): BattleState {
  const currentIndex = PHASES.indexOf(state.phase)
  if (currentIndex < PHASES.length - 1) {
    const nextPhaseName = PHASES[currentIndex + 1]
    return {
      ...state,
      phase: nextPhaseName,
      log: [...state.log, addLog(state, `${capitalize(state.activePlayer)} — ${capitalize(nextPhaseName)} phase.`)],
    }
  }

  const nextPlayer: PlayerId = state.activePlayer === 'player' ? 'ai' : 'player'
  const newTurn = nextPlayer === 'player' ? state.turn + 1 : state.turn

  return {
    ...state,
    turn: newTurn,
    activePlayer: nextPlayer,
    phase: 'movement',
    playerUnits: nextPlayer === 'player' ? resetUnitActions(state.playerUnits) : state.playerUnits,
    aiUnits: nextPlayer === 'ai' ? resetUnitActions(state.aiUnits) : state.aiUnits,
    selectedUnitId: null,
    log: [...state.log, addLog(state, `Turn ${newTurn} — ${capitalize(nextPlayer)} movement phase.`)],
  }
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

export function selectUnit(state: BattleState, unitId: string | null): BattleState {
  return { ...state, selectedUnitId: unitId }
}

function pickAIUpgrades(profileId: string, budget: number): string[] {
  const available = getUpgradesForUnit(profileId)
  if (available.length === 0) return []

  const picked: string[] = []
  let spent = 0
  const shuffled = [...available].sort(() => Math.random() - 0.5)

  for (const u of shuffled) {
    if (spent + u.points > budget) continue
    const count = picked.filter((id) => id === u.id).length
    if (count >= u.maxPerSquad) continue
    if ((u.exclusiveWith ?? []).some((ex) => picked.includes(ex))) continue
    picked.push(u.id)
    spent += u.points
    if (Math.random() < 0.4) break
  }
  return picked
}

function addAIEntry(
  entries: ArmyList['entries'],
  profileId: string,
  remaining: number,
): number {
  const profile = getUnitProfile(profileId)
  const upgradeBudget = Math.min(80, Math.floor(remaining * 0.15))
  const upgrades = pickAIUpgrades(profileId, upgradeBudget)
  const upgradePts = upgrades.reduce((s, id) => s + (getUpgradesForUnit(profileId).find((u) => u.id === id)?.points ?? 0), 0)
  const total = profile.points + upgradePts
  if (total > remaining) {
    entries.push({ entryId: uuidv4(), profileId, count: 1, upgrades: [] })
    return remaining - profile.points
  }
  entries.push({ entryId: uuidv4(), profileId, count: 1, upgrades })
  return remaining - total
}

export function generateAIArmy(factionId: ArmyList['factionId'], pointsLimit: number): ArmyList {
  const units = getUnitsForFaction(factionId)
  const entries: ArmyList['entries'] = []
  let remaining = pointsLimit

  const hq = units.find((u) => u.category === 'hq')
  if (hq && hq.points <= remaining) {
    remaining = addAIEntry(entries, hq.id, remaining)
  }

  const troops = units.filter((u) => u.category === 'troops')
  while (remaining > 0 && troops.length > 0) {
    const affordable = troops.filter((t) => t.points <= remaining)
    if (affordable.length === 0) break
    const pick = affordable[Math.floor(Math.random() * affordable.length)]
    remaining = addAIEntry(entries, pick.id, remaining)
  }

  const elites = units.filter((u) => u.category === 'elites' || u.category === 'heavy-support')
  while (remaining > 50 && elites.length > 0) {
    const affordable = elites.filter((e) => e.points <= remaining)
    if (affordable.length === 0) break
    const pick = affordable.sort((a, b) => b.points - a.points)[0]
    remaining = addAIEntry(entries, pick.id, remaining)
  }

  return { name: 'AI Army', factionId, pointsLimit, entries }
}

