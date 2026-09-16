import type { BattleModel, BattleState, BattleUnit, PlayerId, Position, UnitProfile } from '../types/game'
import { getBattleUnitProfile } from '../data/battleProfile'
import { getUnitCentroid } from './modelSquad'

export function distance(a: Position, b: Position): number {
  return Math.hypot(a.x - b.x, a.y - b.y)
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

export function getUnitAnchor(unit: BattleUnit): Position {
  if (unit.models.length > 0) {
    return getUnitCentroid(unit.models)
  }
  return unit.position
}

export function getModel(unit: BattleUnit, modelId: string): BattleModel | undefined {
  return unit.models.find((model) => model.id === modelId)
}

export function closestModelDistance(unit: BattleUnit, target: BattleUnit): number {
  if (unit.models.length === 0 || target.models.length === 0) {
    return distance(getUnitAnchor(unit), getUnitAnchor(target))
  }
  let min = Infinity
  for (const mine of unit.models) {
    for (const theirs of target.models) {
      min = Math.min(min, distance(mine.position, theirs.position))
    }
  }
  return min
}

export function getEnemyUnits(state: BattleState, player: PlayerId): BattleUnit[] {
  return player === 'player' ? state.aiUnits : state.playerUnits
}
