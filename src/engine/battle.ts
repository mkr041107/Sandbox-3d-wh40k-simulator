import type {
  ArmyList,
  BattleLogEntry,
  BattleModel,
  BattlePhase,
  BattleState,
  BattleUnit,
  DeployMode,
  PendingDeployUnit,
  PlayerId,
  Position,
  UnitProfile,
} from '../types/game'
import { DEPLOY_ZONE_DEPTH } from '../data/battlefield'
import {
  canArriveFromReserves,
  getDefaultDeployMode,
  getDeployModeLabel,
  getUnitDeployModes,
  isDeepStrikeArrivalPosition,
  isInNormalDeployZone,
  isOnBattlefield,
  isValidDeployPosition,
  pickAiDeployMode,
  findDeployPosition,
} from './deploymentRules'
import { getDetachmentsForFaction } from '../data/detachments'
import {
  beginCommandPhase,
  createBattleDetachmentState,
  getCombatModifiers,
  pickAIDetachmentId,
  tickTurnEnd,
  unitHasFightsTwice,
} from './detachmentBattle'
import { getBuildableUnits, getUnitProfile } from '../data/units'
import { getUpgradesForUnit } from '../data/squadUpgrades'
import { v4 as uuidv4 } from 'uuid'
import { rollDice } from './dice'
import {
  formatCombatResolution,
  pickAttackMods,
  pickDefenseMods,
  resolveCombatAttack,
} from './combatRolls'
import {
  distance,
  closestModelDistance,
  getEnemyUnits,
  getModel,
  getProfile,
  getUnit,
  getUnitsForPlayer,
} from './battleQueries'
import {
  buildFormation,
  getUnitCentroid,
  isUnitCoherent,
  resetModelActions,
  squadMarkerFromId,
  squadTintFromId,
  translateFormation,
  trimModelsToCount,
  formationFitsSpacing,
  getAllDeployedUnits,
} from './modelSquad'
import {
  applyDeadlyDemise,
  buildMeleeModifiers,
  buildShootingModifiers,
  describeShootLegality,
  evaluateShootLegality,
  findBestShootLegality,
  findIndirectFireSpotter,
  getWeaponAttackCount,
} from './battlefieldRules'
import { inferShotVfxKind, type ShootAtTargetResult } from './combatVfx'

const PHASES: BattlePhase[] = ['command', 'movement', 'shooting', 'charge', 'fight', 'morale']

export {
  distance,
  closestModelDistance,
  getEnemyUnits,
  getModel,
  getProfile,
  getUnit,
  getUnitAnchor,
  getUnitsForPlayer,
} from './battleQueries'

export { COHERENCY_DISTANCE } from './modelSquad'

export function createBattleUnit(
  profileId: string,
  owner: PlayerId,
  position: Position,
  upgrades: string[] = [],
  options?: { inReserves?: boolean; deployMode?: DeployMode },
): BattleUnit {
  const profile = getUnitProfile(profileId)
  const id = uuidv4()
  const rotation = owner === 'player' ? 0 : Math.PI
  const models = buildFormation(profile.models, position, profile.baseSize, rotation)
  return {
    id,
    profileId,
    upgrades,
    owner,
    position: getUnitCentroid(models),
    rotation,
    models,
    squadMarker: squadMarkerFromId(id),
    squadTint: squadTintFromId(id),
    currentWounds: profile.wounds * profile.models,
    modelsRemaining: profile.models,
    hasMoved: false,
    hasShot: false,
    hasCharged: false,
    hasFought: false,
    isEngaged: false,
    inReserves: options?.inReserves ?? false,
    deployMode: options?.deployMode ?? 'normal',
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

export function buildPendingDeployment(army: ArmyList): PendingDeployUnit[] {
  const pending: PendingDeployUnit[] = []
  for (const entry of army.entries) {
    for (let i = 0; i < entry.count; i++) {
      pending.push({
        deployId: uuidv4(),
        profileId: entry.profileId,
        upgrades: entry.upgrades ?? [],
      })
    }
  }
  return pending
}

export function isInDeployZone(
  position: Position,
  owner: PlayerId,
  battlefieldWidth: number,
  battlefieldHeight: number,
): boolean {
  return isInNormalDeployZone(position, owner, battlefieldWidth, battlefieldHeight)
}

export function canPlaceUnitAt(
  state: BattleState,
  profileId: string,
  position: Position,
  owner: PlayerId,
  excludeUnitId?: string,
  mode: DeployMode = 'normal',
): boolean {
  return isValidDeployPosition(state, profileId, position, owner, mode, excludeUnitId)
}

export function selectDeployUnit(state: BattleState, deployId: string | null): BattleState {
  if (!deployId) {
    return { ...state, selectedDeployId: null, selectedDeployMode: null, selectedUnitId: null }
  }
  const pending = state.pendingDeployment.find((entry) => entry.deployId === deployId)
  const mode = pending ? getDefaultDeployMode(pending.profileId) : null
  return { ...state, selectedDeployId: deployId, selectedDeployMode: mode, selectedUnitId: null }
}

export function selectDeployMode(state: BattleState, mode: DeployMode): BattleState {
  if (state.phase !== 'deployment' || !state.selectedDeployId) return state
  const pending = state.pendingDeployment.find((entry) => entry.deployId === state.selectedDeployId)
  if (!pending) return state
  if (!getUnitDeployModes(pending.profileId).includes(mode)) return state
  return { ...state, selectedDeployMode: mode, selectedUnitId: null }
}

export function deployUnitToReserves(state: BattleState, deployId: string): BattleState {
  if (state.phase !== 'deployment') return state

  const pending = state.pendingDeployment.find((entry) => entry.deployId === deployId)
  if (!pending) return state
  if (!getUnitDeployModes(pending.profileId).includes('reserves')) return state

  const profile = getUnitProfile(pending.profileId)
  const unit = createBattleUnit(
    pending.profileId,
    'player',
    { x: 0, y: 0 },
    pending.upgrades,
    { inReserves: true, deployMode: 'reserves' },
  )
  const remaining = state.pendingDeployment.filter((entry) => entry.deployId !== deployId)

  return {
    ...state,
    playerUnits: [...state.playerUnits, unit],
    pendingDeployment: remaining,
    selectedDeployId: remaining[0]?.deployId ?? null,
    selectedDeployMode: remaining[0] ? getDefaultDeployMode(remaining[0].profileId) : null,
    selectedUnitId: null,
    log: [...state.log, addLog(state, `${profile.name} held in Deep Strike reserves.`, 'player')],
  }
}

export function deployUnitAt(
  state: BattleState,
  deployId: string,
  position: Position,
): BattleState {
  if (state.phase !== 'deployment') return state

  const pending = state.pendingDeployment.find((entry) => entry.deployId === deployId)
  if (!pending) return state

  const mode = state.selectedDeployMode ?? getDefaultDeployMode(pending.profileId)
  if (mode === 'reserves') return state
  if (!canPlaceUnitAt(state, pending.profileId, position, 'player', undefined, mode)) return state

  const unit = createBattleUnit(pending.profileId, 'player', position, pending.upgrades, { deployMode: mode })
  const profile = getUnitProfile(pending.profileId)
  const remaining = state.pendingDeployment.filter((entry) => entry.deployId !== deployId)
  const modeLabel = getDeployModeLabel(mode)

  return {
    ...state,
    playerUnits: [...state.playerUnits, unit],
    pendingDeployment: remaining,
    selectedDeployId: remaining[0]?.deployId ?? null,
    selectedDeployMode: remaining[0] ? getDefaultDeployMode(remaining[0].profileId) : null,
    selectedUnitId: null,
    log: [...state.log, addLog(state, `${profile.name} deployed (${modeLabel}) at (${position.x.toFixed(1)}, ${position.y.toFixed(1)}).`, 'player')],
  }
}

export function repositionDeployedUnit(
  state: BattleState,
  unitId: string,
  position: Position,
): BattleState {
  if (state.phase !== 'deployment') return state

  const unit = getUnit(state, unitId)
  if (!unit || unit.owner !== 'player' || unit.inReserves) return state
  const mode = unit.deployMode ?? 'normal'
  if (!canPlaceUnitAt(state, unit.profileId, position, 'player', unitId, mode)) return state

  const profile = getProfile(unit)
  const rotation = unit.rotation
  const models = buildFormation(profile.models, position, profile.baseSize, rotation)
  const updated = updateUnit(state, unitId, {
    models,
    position: getUnitCentroid(models),
  })
  return {
    ...updated,
    log: [...updated.log, addLog(updated, `${profile.name} repositioned.`, 'player')],
  }
}

export function finishDeployment(state: BattleState): BattleState {
  if (state.phase !== 'deployment') return state
  if (state.pendingDeployment.length > 0) return state
  if (state.playerUnits.length === 0) return state

  const aiUnits = deployArmy(
    state.opponentArmy,
    'ai',
    state.battlefieldWidth,
    state.battlefieldHeight,
  )

  let newState: BattleState = {
    ...state,
    aiUnits,
    phase: 'command',
    selectedDeployId: null,
    selectedUnitId: null,
    selectedModelId: null,
    log: [...state.log, addLog(state, 'Deployment complete — enemy forces deployed. Command phase begins.', 'system')],
  }

  newState = beginCommandPhase(newState)
  return newState
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
      const preferredMode = pickAiDeployMode(entry.profileId)
      const modesToTry: DeployMode[] = preferredMode === 'normal'
        ? ['normal']
        : [preferredMode, 'normal']

      if (preferredMode === 'reserves') {
        units.push(createBattleUnit(
          entry.profileId,
          owner,
          { x: 0, y: 0 },
          entry.upgrades ?? [],
          { inReserves: true, deployMode: 'reserves' },
        ))
        continue
      }

      let placed = false
      for (const mode of modesToTry) {
        const position = findDeployPosition(
          units,
          entry.profileId,
          owner,
          mode,
          battlefieldWidth,
          battlefieldHeight,
        )
        if (position) {
          units.push(createBattleUnit(
            entry.profileId,
            owner,
            position,
            entry.upgrades ?? [],
            { deployMode: mode },
          ))
          placed = true
          break
        }
      }

      if (placed) continue

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
  const pendingDeployment = buildPendingDeployment(playerArmy)
  const playerDetachment = createBattleDetachmentState(playerArmy.detachmentId)
  const aiDetachment = createBattleDetachmentState(aiArmy.detachmentId)

  return {
    id: uuidv4(),
    turn: 1,
    activePlayer: 'player',
    phase: 'deployment',
    playerUnits: [],
    aiUnits: [],
    pendingDeployment,
    selectedDeployId: pendingDeployment[0]?.deployId ?? null,
    selectedDeployMode: pendingDeployment[0]
      ? getDefaultDeployMode(pendingDeployment[0].profileId)
      : null,
    opponentArmy: aiArmy,
    battlefieldWidth,
    battlefieldHeight,
    playerDetachment,
    aiDetachment,
    selectedUnitId: null,
    selectedModelId: null,
    log: [{
      turn: 1,
      phase: 'deployment',
      message: `Deploy your army (${pendingDeployment.length} units). Pick a unit, choose a deployment rule if available, then place it or hold in Deep Strike reserves.`,
      player: 'system',
    }],
    playerVp: 0,
    aiVp: 0,
    isOver: false,
    winner: null,
  }
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
  let newState = state
  const allUnits = [...state.playerUnits, ...state.aiUnits]
  const deadUnits = allUnits.filter((u) => u.modelsRemaining <= 0)

  for (const dead of deadUnits) {
    const result = applyDeadlyDemise(newState, dead)
    newState = result.state
    if (result.message) {
      newState = {
        ...newState,
        log: [...newState.log, addLog(newState, result.message, dead.owner)],
      }
    }
  }

  const filter = (units: BattleUnit[]) => units.filter((u) => u.modelsRemaining > 0)
  return {
    ...newState,
    playerUnits: filter(newState.playerUnits),
    aiUnits: filter(newState.aiUnits),
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

export function canMoveModel(unit: BattleUnit, model: BattleModel, state: BattleState): boolean {
  if (unit.inReserves) return false
  if (state.phase !== 'movement' || state.activePlayer !== unit.owner) return false
  if (unit.isEngaged) return false
  if (model.hasMoved) return false
  return true
}

export function canMove(unit: BattleUnit, state: BattleState): boolean {
  if (unit.inReserves) return canArriveFromReserves(unit, state)
  if (state.phase !== 'movement' || state.activePlayer !== unit.owner) return false
  if (unit.isEngaged) return false
  return unit.models.some((model) => !model.hasMoved)
}

function proposedModelsOnBoard(models: BattleModel[], state: BattleState): boolean {
  return models.every((model) =>
    isOnBattlefield(model.position, state.battlefieldWidth, state.battlefieldHeight),
  )
}

function interpolatePosition(from: Position, to: Position, t: number): Position {
  return {
    x: from.x + (to.x - from.x) * t,
    y: from.y + (to.y - from.y) * t,
  }
}

function findFarthestValidPosition(
  start: Position,
  target: Position,
  isValid: (position: Position) => boolean,
): Position | null {
  if (isValid(target)) return target

  let low = 0
  let high = 1
  let best: Position | null = null

  for (let i = 0; i < 24; i++) {
    const mid = (low + high) / 2
    const candidate = interpolatePosition(start, target, mid)
    if (isValid(candidate)) {
      best = candidate
      low = mid
    } else {
      high = mid
    }
  }

  if (!best || distance(start, best) < 0.05) return null
  return best
}

export function canMoveUnitTo(
  unit: BattleUnit,
  newPosition: Position,
  state: BattleState,
): boolean {
  if (!canMove(unit, state)) return false

  const profile = getProfile(unit)
  const delta = {
    x: newPosition.x - unit.position.x,
    y: newPosition.y - unit.position.y,
  }
  if (distance({ x: 0, y: 0 }, delta) > profile.movement) return false

  const models = translateFormation(unit.models, delta)
  if (!isUnitCoherent(models, profile.baseSize)) return false
  if (!proposedModelsOnBoard(models, state)) return false

  const others = getAllDeployedUnits(state).filter((entry) => entry.id !== unit.id)
  return formationFitsSpacing(models, profile, others)
}

export function findValidUnitMovePosition(
  unit: BattleUnit,
  target: Position,
  state: BattleState,
): Position | null {
  return findFarthestValidPosition(
    unit.position,
    target,
    (position) => canMoveUnitTo(unit, position, state),
  )
}

export function canMoveModelTo(
  unit: BattleUnit,
  model: BattleModel,
  newPosition: Position,
  state: BattleState,
): boolean {
  if (!canMoveModel(unit, model, state)) return false
  const profile = getProfile(unit)
  if (distance(model.position, newPosition) > profile.movement) return false

  const proposed = unit.models.map((entry) =>
    entry.id === model.id
      ? { ...entry, position: newPosition }
      : entry,
  )
  if (!isUnitCoherent(proposed, profile.baseSize)) return false
  if (!proposedModelsOnBoard(proposed, state)) return false

  const others = getAllDeployedUnits(state).filter((entry) => entry.id !== unit.id)
  return formationFitsSpacing(proposed, profile, others)
}

export function findValidModelMovePosition(
  unit: BattleUnit,
  model: BattleModel,
  target: Position,
  state: BattleState,
): Position | null {
  return findFarthestValidPosition(
    model.position,
    target,
    (position) => canMoveModelTo(unit, model, position, state),
  )
}

export function moveModel(
  state: BattleState,
  unitId: string,
  modelId: string,
  newPosition: Position,
): BattleState {
  const unit = getUnit(state, unitId)
  if (!unit) return state
  const model = getModel(unit, modelId)
  if (!model) return state

  const resolved = findValidModelMovePosition(unit, model, newPosition, state)
  if (!resolved) return state

  const profile = getProfile(unit)
  const models = unit.models.map((entry) =>
    entry.id === modelId
      ? { ...entry, position: resolved, hasMoved: true }
      : entry,
  )
  const moved = distance(model.position, resolved)

  let newState = updateUnit(state, unitId, {
    models,
    position: getUnitCentroid(models),
    hasMoved: true,
  })

  newState = {
    ...newState,
    log: [...newState.log, addLog(
      newState,
      `${profile.name} model ${model.index} moved ${moved.toFixed(1)}"`,
      unit.owner,
    )],
  }

  return newState
}

export function arriveFromReserves(
  state: BattleState,
  unitId: string,
  position: Position,
): BattleState {
  const unit = getUnit(state, unitId)
  if (!unit || !canArriveFromReserves(unit, state)) return state
  if (!isDeepStrikeArrivalPosition(state, position, unit.owner)) return state

  const profile = getProfile(unit)
  const models = buildFormation(profile.models, position, profile.baseSize, unit.rotation)

  for (const model of models) {
    if (!isDeepStrikeArrivalPosition(state, model.position, unit.owner)) return state
  }

  const others = getAllDeployedUnits(state).filter((entry) => entry.id !== unit.id)
  if (!formationFitsSpacing(models, profile, others)) return state

  const updated = updateUnit(state, unitId, {
    models,
    position: getUnitCentroid(models),
    inReserves: false,
    hasMoved: true,
  })

  return {
    ...updated,
    log: [...updated.log, addLog(updated, `${profile.name} arrived from Deep Strike at (${position.x.toFixed(1)}, ${position.y.toFixed(1)}).`, unit.owner)],
  }
}

export function moveUnit(
  state: BattleState,
  unitId: string,
  newPosition: Position,
  modelId?: string,
): BattleState {
  const unit = getUnit(state, unitId)
  if (!unit) return state

  if (unit.inReserves) {
    return arriveFromReserves(state, unitId, newPosition)
  }

  if (modelId) {
    return moveModel(state, unitId, modelId, newPosition)
  }

  if (!canMove(unit, state)) return state

  const resolved = findValidUnitMovePosition(unit, newPosition, state)
  if (!resolved) return state

  const profile = getProfile(unit)
  const delta = {
    x: resolved.x - unit.position.x,
    y: resolved.y - unit.position.y,
  }
  const models = translateFormation(unit.models, delta).map((model) => ({
    ...model,
    hasMoved: true,
  }))

  const others = getAllDeployedUnits(state).filter((entry) => entry.id !== unit.id)
  if (!formationFitsSpacing(models, profile, others)) return state

  let newState = updateUnit(state, unitId, {
    models,
    position: getUnitCentroid(models),
    hasMoved: true,
  })

  newState = {
    ...newState,
    log: [...newState.log, addLog(newState, `${profile.name} moved ${distance({ x: 0, y: 0 }, delta).toFixed(1)}"`, unit.owner)],
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
  _weaponIndex = 0,
): BattleUnit[] {
  const unit = getUnit(state, unitId)
  if (!unit) return []

  const profile = getProfile(unit)
  if (profile.weapons.every((w) => w.type !== 'ranged')) return []

  const enemies = getEnemyUnits(state, unit.owner)

  return enemies.filter((enemy) => {
    if (enemy.inReserves || unit.inReserves) return false
    return findBestShootLegality(state, unit, enemy) !== null
  })
}

function applyDamageToTarget(
  target: BattleUnit,
  targetProfile: UnitProfile,
  unsavedWounds: number,
  damagePerWound: number,
): {
  currentWounds: number
  modelsRemaining: number
  models: BattleModel[]
  modelsLost: number
  damageDealt: number
} {
  const damageDealt = unsavedWounds * damagePerWound
  let modelsLost = 0
  let remainingWounds = target.currentWounds - damageDealt
  while (remainingWounds <= 0 && modelsLost < target.modelsRemaining) {
    modelsLost++
    remainingWounds += targetProfile.wounds
  }

  const modelsRemaining = Math.max(0, target.modelsRemaining - modelsLost)
  const currentWounds = modelsRemaining > 0 ? Math.max(1, remainingWounds) : 0
  const models = trimModelsToCount(target.models, modelsRemaining)

  return { currentWounds, modelsRemaining, models, modelsLost, damageDealt }
}

function resolveMoralePhase(state: BattleState): BattleState {
  let newState = state
  const units = getUnitsForPlayer(state, state.activePlayer)
    .filter((unit) => unit.modelsRemaining > 0 && !unit.inReserves)

  for (const unit of units) {
    const profile = getProfile(unit)
    if (unit.modelsRemaining >= profile.models) continue
    if (unit.modelsRemaining > Math.ceil(profile.models / 2)) continue

    const rolls = rollDice(2)
    const total = rolls[0] + rolls[1]
    const passed = total <= profile.leadership
    const rollLine = `Morale ${profile.name}: 2D6 [${rolls.join(', ')}]=${total} vs Ld ${profile.leadership}+ → ${passed ? 'PASSED' : 'FAILED'}`

    if (passed) {
      newState = {
        ...newState,
        log: [...newState.log, addLog(newState, rollLine, unit.owner)],
      }
      continue
    }

    const modelsRemaining = Math.max(0, unit.modelsRemaining - 1)
    const trimmedModels = trimModelsToCount(unit.models, modelsRemaining)
    const currentWounds = modelsRemaining > 0
      ? Math.min(profile.wounds, unit.currentWounds)
      : 0

    newState = updateUnit(newState, unit.id, {
      modelsRemaining,
      currentWounds,
      models: trimmedModels,
      position: getUnitCentroid(trimmedModels),
    })

    newState = {
      ...newState,
      log: [...newState.log, addLog(
        newState,
        `${rollLine} — 1 model flees`,
        unit.owner,
      )],
    }
  }

  return removeDeadUnits(newState)
}

export { describeShootLegality }

export function shootAtTarget(
  state: BattleState,
  attackerId: string,
  targetId: string,
  weaponIndex?: number,
): ShootAtTargetResult {
  const attacker = getUnit(state, attackerId)
  const target = getUnit(state, targetId)
  if (!attacker || !target) return { state }
  if (state.phase !== 'shooting' || attacker.owner !== state.activePlayer) return { state }
  if (attacker.hasShot) return { state }

  const attackerProfile = getProfile(attacker)
  const targetProfile = getProfile(target)

  const legality = weaponIndex !== undefined
    ? (() => {
        const weapon = attackerProfile.weapons[weaponIndex]
        if (!weapon || weapon.type !== 'ranged') return null
        const result = evaluateShootLegality(state, attacker, target, weapon, weaponIndex)
        return result.valid ? result : null
      })()
    : findBestShootLegality(state, attacker, target)

  if (!legality) return { state }

  const weapon = attackerProfile.weapons[legality.weaponIndex]
  const dist = closestModelDistance(attacker, target)
  const spotter = legality.usesIndirectFire
    ? findIndirectFireSpotter(state, attacker, target)
    : undefined

  const shotFrom = { ...attacker.position }
  const shotTo = { ...target.position }

  const mods = buildShootingModifiers(
    state,
    attacker,
    target,
    weapon,
    dist,
    legality.hasLineOfSight,
    spotter,
  )
  const totalAttacks = getWeaponAttackCount(weapon, attacker, target, dist)
  const resolution = resolveCombatAttack({
    attacks: totalAttacks,
    skill: weapon.skill,
    strength: weapon.strength,
    toughness: targetProfile.toughness,
    ap: weapon.ap,
    armorSave: targetProfile.save,
    attackMods: pickAttackMods(mods),
    defenseMods: pickDefenseMods(mods),
    attackType: 'ranged',
  })
  const damage = applyDamageToTarget(target, targetProfile, resolution.unsavedWounds, weapon.damage)

  let newState = updateUnit(state, attackerId, { hasShot: true })
  newState = updateUnit(newState, targetId, {
    currentWounds: damage.currentWounds,
    modelsRemaining: damage.modelsRemaining,
    models: damage.models,
    position: getUnitCentroid(damage.models),
  })

  const indirectNote = legality.usesIndirectFire ? ' (indirect fire)' : ''
  const coverNote = mods.cover ? ' [cover]' : ''
  const logMessage = formatCombatResolution(
    `${attackerProfile.name} fired ${weapon.name} at ${targetProfile.name}${indirectNote}${coverNote}`,
    resolution,
    { damage: damage.damageDealt, modelsLost: damage.modelsLost },
  )

  newState = {
    ...newState,
    log: [...newState.log, addLog(newState, logMessage, attacker.owner)],
  }

  newState = removeDeadUnits(newState)
  return {
    state: checkBattleEnd(newState),
    shot: {
      from: shotFrom,
      to: shotTo,
      weaponName: weapon.name,
      kind: inferShotVfxKind(weapon, legality.usesIndirectFire),
      wounds: resolution.unsavedWounds,
      modelsLost: damage.modelsLost,
      indirect: legality.usesIndirectFire,
    },
  }
}

export function getChargeTargets(state: BattleState, unitId: string): BattleUnit[] {
  const unit = getUnit(state, unitId)
  if (!unit) return []

  const profile = getProfile(unit)
  const enemies = getEnemyUnits(state, unit.owner)

  return enemies.filter((enemy) => {
    if (enemy.inReserves || unit.inReserves) return false
    const dist = closestModelDistance(unit, enemy)
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
  const dist = closestModelDistance(charger, target)
  const chargeMods = getCombatModifiers(state, charger, 'charge', 'melee', target)

  const chargeDice = rollDice(2)
  const chargeBonus = chargeMods.chargeBonus ?? 0
  const chargeRoll = chargeDice[0] + chargeDice[1] + chargeBonus
  const chargeNeeded = Math.max(0, dist - 1)
  if (chargeRoll < chargeNeeded) {
    const bonusNote = chargeBonus > 0 ? ` + ${chargeBonus} bonus` : ''
    return {
      ...state,
      log: [...state.log, addLog(
        state,
        `${chargerProfile.name} failed charge: 2D6 [${chargeDice.join(', ')}]${bonusNote} = ${chargeRoll}" vs ${chargeNeeded.toFixed(1)}" needed`,
        charger.owner,
      )],
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
  const delta = {
    x: newPos.x - charger.position.x,
    y: newPos.y - charger.position.y,
  }
  const models = translateFormation(charger.models, delta).map((model) => ({
    ...model,
    hasMoved: true,
  }))

  if (!isUnitCoherent(models, chargerProfile.baseSize)) {
    return {
      ...state,
      log: [...state.log, addLog(state, `${chargerProfile.name} failed charge — squad would break coherency.`, charger.owner)],
    }
  }

  const others = getAllDeployedUnits(state).filter((entry) => entry.id !== charger.id)
  if (!formationFitsSpacing(models, chargerProfile, others)) {
    return {
      ...state,
      log: [...state.log, addLog(state, `${chargerProfile.name} failed charge — bases would overlap.`, charger.owner)],
    }
  }

  let newState = updateUnit(state, chargerId, {
    models,
    position: getUnitCentroid(models),
    hasCharged: true,
    hasMoved: true,
    isEngaged: true,
  })
  newState = updateUnit(newState, targetId, { isEngaged: true })

  newState = {
    ...newState,
    log: [...newState.log, addLog(
      newState,
      `${chargerProfile.name} charged ${getProfile(target).name}! 2D6 [${chargeDice.join(', ')}]${chargeBonus > 0 ? ` + ${chargeBonus}` : ''} = ${chargeRoll}" vs ${chargeNeeded.toFixed(1)}" needed`,
      charger.owner,
    )],
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

  let newState = state
  const rounds = unitHasFightsTwice(state, attacker, 'fight') ? 2 : 1

  for (let round = 0; round < rounds; round++) {
    newState = resolveFightAttack(newState, attackerId, targetId, round > 0, false)
    if (newState.isOver) break
    const refreshedTarget = getUnit(newState, targetId)
    if (!refreshedTarget || refreshedTarget.modelsRemaining <= 0) break
  }

  const counterAttacker = getUnit(newState, targetId)
  const counterTarget = getUnit(newState, attackerId)
  if (
    counterAttacker
    && counterTarget
    && counterAttacker.modelsRemaining > 0
    && counterTarget.modelsRemaining > 0
    && counterAttacker.isEngaged
  ) {
    newState = resolveFightAttack(newState, targetId, attackerId, false, true)
  }

  return updateUnit(newState, attackerId, { hasFought: true })
}

function resolveFightAttack(
  state: BattleState,
  attackerId: string,
  targetId: string,
  isExtraFight: boolean,
  isCounterAttack: boolean,
): BattleState {
  const attacker = getUnit(state, attackerId)
  const target = getUnit(state, targetId)
  if (!attacker || !target) return state

  const attackerProfile = getProfile(attacker)
  const targetProfile = getProfile(target)
  const weapons = getMeleeWeapons(attackerProfile)
  const weapon = weapons[0]
  if (!weapon) return state

  const mods = buildMeleeModifiers(state, attacker, target)
  const totalAttacks = weapon.attacks * attacker.modelsRemaining
  const resolution = resolveCombatAttack({
    attacks: totalAttacks,
    skill: weapon.skill,
    strength: weapon.strength,
    toughness: targetProfile.toughness,
    ap: weapon.ap,
    armorSave: targetProfile.save,
    attackMods: pickAttackMods(mods),
    defenseMods: pickDefenseMods(mods),
    attackType: 'melee',
  })
  const damage = applyDamageToTarget(target, targetProfile, resolution.unsavedWounds, weapon.damage)

  let newState = updateUnit(state, targetId, {
    currentWounds: damage.currentWounds,
    modelsRemaining: damage.modelsRemaining,
    models: damage.models,
    position: getUnitCentroid(damage.models),
  })

  const suffix = isCounterAttack
    ? ' (fight back)'
    : isExtraFight
      ? ' (fight again)'
      : ''
  const logMessage = formatCombatResolution(
    `${attackerProfile.name} fought ${targetProfile.name} with ${weapon.name}${suffix}`,
    resolution,
    { damage: damage.damageDealt, modelsLost: damage.modelsLost },
  )

  newState = {
    ...newState,
    log: [...newState.log, addLog(newState, logMessage, attacker.owner)],
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
    models: resetModelActions(u.models),
  }))
}

export function nextPhase(state: BattleState): BattleState {
  const currentIndex = PHASES.indexOf(state.phase)
  if (currentIndex < PHASES.length - 1) {
    const nextPhaseName = PHASES[currentIndex + 1]
    let newState: BattleState = {
      ...state,
      phase: nextPhaseName,
      log: [...state.log, addLog(state, `${capitalize(state.activePlayer)} — ${capitalize(nextPhaseName)} phase.`)],
    }
    if (nextPhaseName === 'command') {
      newState = beginCommandPhase(newState)
    }
    if (nextPhaseName === 'morale') {
      newState = resolveMoralePhase(newState)
    }
    return newState
  }

  const nextPlayer: PlayerId = state.activePlayer === 'player' ? 'ai' : 'player'
  const newTurn = nextPlayer === 'player' ? state.turn + 1 : state.turn

  let newState: BattleState = {
    ...state,
    turn: newTurn,
    activePlayer: nextPlayer,
    phase: 'command',
    playerUnits: nextPlayer === 'player' ? resetUnitActions(state.playerUnits) : state.playerUnits,
    aiUnits: nextPlayer === 'ai' ? resetUnitActions(state.aiUnits) : state.aiUnits,
    selectedUnitId: null,
    selectedModelId: null,
    log: [...state.log, addLog(state, `Turn ${newTurn} — ${capitalize(nextPlayer)} command phase.`)],
  }

  if (nextPlayer === 'player') {
    newState = tickTurnEnd(newState)
  }
  newState = beginCommandPhase(newState)
  return newState
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

export {
  canArriveFromReserves,
  DEPLOY_MODE_HINTS,
  DEPLOY_MODE_LABELS,
  getDeployModeLabel,
  getNormalDeployBounds,
  getReservesUnits,
  getUnitDeployModes,
  isDeepStrikeArrivalPosition,
} from './deploymentRules'

function defaultMovementModelId(unit: BattleUnit): string | null {
  if (unit.models.length <= 1) return null
  return unit.models.find((model) => !model.hasMoved)?.id ?? unit.models[0]?.id ?? null
}

export function selectUnit(state: BattleState, unitId: string | null): BattleState {
  if (!unitId) {
    return {
      ...state,
      selectedUnitId: null,
      selectedModelId: null,
      selectedDeployId: state.selectedDeployId,
    }
  }

  const unit = getUnit(state, unitId)
  const sameUnit = state.selectedUnitId === unitId
  let selectedModelId: string | null = null

  if (sameUnit && state.selectedModelId && unit?.models.some((model) => model.id === state.selectedModelId)) {
    selectedModelId = state.selectedModelId
  } else if (unit && state.phase === 'movement' && unit.models.length > 1) {
    selectedModelId = defaultMovementModelId(unit)
  }

  return {
    ...state,
    selectedUnitId: unitId,
    selectedModelId,
    selectedDeployId: null,
  }
}

export function selectModel(state: BattleState, unitId: string, modelId: string | null): BattleState {
  return {
    ...state,
    selectedUnitId: unitId,
    selectedModelId: modelId,
    selectedDeployId: null,
  }
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
  const units = getBuildableUnits(factionId)
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

  const detachments = getDetachmentsForFaction(factionId)
  const detachmentId = pickAIDetachmentId(
    factionId,
    detachments.map((d) => d.id),
  )

  return {
    name: 'AI Army',
    factionId,
    detachmentId,
    pointsLimit,
    entries,
  }
}

export {
  autoConfigureCommandPhase,
  getDetachmentState,
  getUsableStratagems,
  setDoctrine,
  setOathTarget,
  useStratagem,
} from './detachmentBattle'

