import { DEPLOY_ZONE_DEPTH } from '../data/battlefield'
import { inferPlaystyle } from '../data/unitPlaystyles'
import { getUnitProfile } from '../data/units'
import { buildFormation, formationFitsSpacing, isUnitCoherent } from './modelSquad'
import type { BattleState, BattleUnit, DeployMode, PlayerId, Position } from '../types/game'
import { distance, getEnemyUnits, getUnitsForPlayer } from './battleQueries'

const DEPLOY_EDGE_MARGIN = 2
const SCOUTS_EXTRA_DEPTH = 12
const INFILTRATE_BUFFER = 9
const DEEP_STRIKE_ARRIVAL_BUFFER = 9

export const DEPLOY_MODE_LABELS: Record<DeployMode, string> = {
  normal: 'Deployment Zone',
  infiltrate: 'Infiltrators',
  scouts: 'Scouts',
  reserves: 'Deep Strike',
}

export const DEPLOY_MODE_HINTS: Record<DeployMode, string> = {
  normal: 'Place in your blue deployment zone.',
  infiltrate: 'Place anywhere more than 9" from the enemy deployment zone.',
  scouts: 'Place up to 12" beyond your deployment zone (still on your side of the board).',
  reserves: 'Hold in reserves — arrive from Deep Strike turn 2+ during your Movement phase.',
}

export function getUnitDeployModes(profileId: string): DeployMode[] {
  const profile = getUnitProfile(profileId)
  const abilityNames = new Set(inferPlaystyle(profile).ruleAbilities.map((a) => a.name))
  const modes: DeployMode[] = ['normal']
  if (abilityNames.has('Infiltrators')) modes.push('infiltrate')
  if (abilityNames.has('Scouts')) modes.push('scouts')
  if (abilityNames.has('Deep Strike')) modes.push('reserves')
  return modes
}

export function getDefaultDeployMode(_profileId: string): DeployMode {
  return 'normal'
}

export function getDeployModeLabel(mode: DeployMode): string {
  return DEPLOY_MODE_LABELS[mode]
}

function boardBounds(battlefieldWidth: number, battlefieldHeight: number) {
  return {
    minX: DEPLOY_EDGE_MARGIN + 1,
    maxX: battlefieldWidth - DEPLOY_EDGE_MARGIN - 1,
    minY: DEPLOY_EDGE_MARGIN + 1,
    maxY: battlefieldHeight - DEPLOY_EDGE_MARGIN - 1,
  }
}

export function getNormalDeployBounds(
  owner: PlayerId,
  battlefieldWidth: number,
  battlefieldHeight: number,
) {
  const { minX, maxX } = boardBounds(battlefieldWidth, battlefieldHeight)

  if (owner === 'player') {
    const back = DEPLOY_EDGE_MARGIN + 1.5
    const front = back + DEPLOY_ZONE_DEPTH - 1
    return { minX, maxX, minY: back, maxY: front }
  }

  const back = battlefieldHeight - DEPLOY_EDGE_MARGIN - 1.5
  const front = back - DEPLOY_ZONE_DEPTH + 1
  return { minX, maxX, minY: front, maxY: back }
}

export function getEnemyDeployBounds(
  owner: PlayerId,
  battlefieldWidth: number,
  battlefieldHeight: number,
) {
  const enemy: PlayerId = owner === 'player' ? 'ai' : 'player'
  return getNormalDeployBounds(enemy, battlefieldWidth, battlefieldHeight)
}

export function isInNormalDeployZone(
  position: Position,
  owner: PlayerId,
  battlefieldWidth: number,
  battlefieldHeight: number,
): boolean {
  const { minX, maxX, minY, maxY } = getNormalDeployBounds(owner, battlefieldWidth, battlefieldHeight)
  return position.x >= minX && position.x <= maxX && position.y >= minY && position.y <= maxY
}

export function isInScoutsZone(
  position: Position,
  owner: PlayerId,
  battlefieldWidth: number,
  battlefieldHeight: number,
): boolean {
  const normal = getNormalDeployBounds(owner, battlefieldWidth, battlefieldHeight)
  const midline = battlefieldHeight / 2

  if (owner === 'player') {
    const maxY = Math.min(normal.maxY + SCOUTS_EXTRA_DEPTH, midline - 1)
    return position.x >= normal.minX
      && position.x <= normal.maxX
      && position.y >= normal.minY
      && position.y <= maxY
  }

  const minY = Math.max(normal.minY - SCOUTS_EXTRA_DEPTH, midline + 1)
  return position.x >= normal.minX
    && position.x <= normal.maxX
    && position.y >= minY
    && position.y <= normal.maxY
}

export function isInInfiltrateZone(
  position: Position,
  owner: PlayerId,
  battlefieldWidth: number,
  battlefieldHeight: number,
): boolean {
  const { minX, maxX, minY, maxY } = boardBounds(battlefieldWidth, battlefieldHeight)
  if (position.x < minX || position.x > maxX || position.y < minY || position.y > maxY) {
    return false
  }

  const enemyZone = getEnemyDeployBounds(owner, battlefieldWidth, battlefieldHeight)
  if (owner === 'player') {
    const nearestEnemyY = enemyZone.maxY
    return position.y <= nearestEnemyY - INFILTRATE_BUFFER
  }

  const nearestEnemyY = enemyZone.minY
  return position.y >= nearestEnemyY + INFILTRATE_BUFFER
}

export function isInDeployZoneForMode(
  position: Position,
  owner: PlayerId,
  mode: DeployMode,
  battlefieldWidth: number,
  battlefieldHeight: number,
): boolean {
  switch (mode) {
    case 'normal':
      return isInNormalDeployZone(position, owner, battlefieldWidth, battlefieldHeight)
    case 'scouts':
      return isInScoutsZone(position, owner, battlefieldWidth, battlefieldHeight)
    case 'infiltrate':
      return isInInfiltrateZone(position, owner, battlefieldWidth, battlefieldHeight)
    case 'reserves':
      return false
    default:
      return false
  }
}

export function getDeployedUnits(state: BattleState, owner: PlayerId): BattleUnit[] {
  return getUnitsForPlayer(state, owner).filter((unit) => !unit.inReserves)
}

export function getReservesUnits(state: BattleState, owner: PlayerId): BattleUnit[] {
  return getUnitsForPlayer(state, owner).filter((unit) => unit.inReserves)
}

export function isValidDeployPositionWithUnits(
  placedUnits: BattleUnit[],
  profileId: string,
  position: Position,
  owner: PlayerId,
  mode: DeployMode,
  battlefieldWidth: number,
  battlefieldHeight: number,
  excludeUnitId?: string,
): boolean {
  if (mode === 'reserves') return false

  const profile = getUnitProfile(profileId)
  const rotation = owner === 'player' ? 0 : Math.PI
  const proposed = buildFormation(profile.models, position, profile.baseSize, rotation)

  for (const model of proposed) {
    if (!isInDeployZoneForMode(model.position, owner, mode, battlefieldWidth, battlefieldHeight)) {
      return false
    }
  }

  if (!isUnitCoherent(proposed, profile.baseSize)) return false
  return formationFitsSpacing(proposed, profile, placedUnits, excludeUnitId)
}

export function isValidDeployPosition(
  state: BattleState,
  profileId: string,
  position: Position,
  owner: PlayerId,
  mode: DeployMode,
  excludeUnitId?: string,
): boolean {
  return isValidDeployPositionWithUnits(
    getUnitsForPlayer(state, owner),
    profileId,
    position,
    owner,
    mode,
    state.battlefieldWidth,
    state.battlefieldHeight,
    excludeUnitId,
  )
}

export function isDeepStrikeArrivalPosition(
  state: BattleState,
  position: Position,
  owner: PlayerId,
): boolean {
  const { minX, maxX, minY, maxY } = boardBounds(state.battlefieldWidth, state.battlefieldHeight)
  if (position.x < minX || position.x > maxX || position.y < minY || position.y > maxY) {
    return false
  }

  for (const enemy of getEnemyUnits(state, owner)) {
    if (enemy.inReserves) continue
    if (distance(enemy.position, position) < DEEP_STRIKE_ARRIVAL_BUFFER) return false
  }
  return true
}

export function canArriveFromReserves(unit: BattleUnit, state: BattleState): boolean {
  if (!unit.inReserves || unit.deployMode !== 'reserves') return false
  if (state.phase !== 'movement' || state.activePlayer !== unit.owner) return false
  if (state.turn < 2) return false
  if (unit.hasMoved) return false
  return true
}

export function pickAiDeployMode(profileId: string): DeployMode {
  const modes = getUnitDeployModes(profileId)
  if (modes.includes('reserves') && Math.random() < 0.45) return 'reserves'
  if (modes.includes('infiltrate') && Math.random() < 0.35) return 'infiltrate'
  if (modes.includes('scouts') && Math.random() < 0.3) return 'scouts'
  return 'normal'
}

export function findDeployPosition(
  placedUnits: BattleUnit[],
  profileId: string,
  owner: PlayerId,
  mode: DeployMode,
  battlefieldWidth: number,
  battlefieldHeight: number,
): Position | null {
  const { minX, maxX, minY, maxY } = boardBounds(battlefieldWidth, battlefieldHeight)

  for (let attempt = 0; attempt < 60; attempt++) {
    const position = {
      x: minX + Math.random() * (maxX - minX),
      y: minY + Math.random() * (maxY - minY),
    }
    if (isValidDeployPositionWithUnits(
      placedUnits,
      profileId,
      position,
      owner,
      mode,
      battlefieldWidth,
      battlefieldHeight,
    )) {
      return position
    }
  }
  return null
}
