import type { AIDifficulty, BattleState, BattleUnit, Position } from '../types/game'
import {
  chargeUnit,
  distance,
  fightCombat,
  getChargeTargets,
  getEnemyUnits,
  getMeleeWeapons,
  getProfile,
  getRangedWeapons,
  getUnit,
  getUnitsForPlayer,
  getValidShootTargets,
  moveUnit,
  nextPhase,
  shootAtTarget,
} from '../engine/battle'

export interface AIConfig {
  difficulty: AIDifficulty
  thinkDelayMs: number
  hitModifier: number
  targetPriority: 'weakest' | 'strongest' | 'nearest' | 'hq'
  aggression: number
  tacticalAwareness: number
}

export const AI_DIFFICULTY_CONFIG: Record<AIDifficulty, AIConfig> = {
  recruit: {
    difficulty: 'recruit',
    thinkDelayMs: 2000,
    hitModifier: -1,
    targetPriority: 'nearest',
    aggression: 0.3,
    tacticalAwareness: 0.2,
  },
  'battle-brother': {
    difficulty: 'battle-brother',
    thinkDelayMs: 1500,
    hitModifier: 0,
    targetPriority: 'weakest',
    aggression: 0.5,
    tacticalAwareness: 0.5,
  },
  veteran: {
    difficulty: 'veteran',
    thinkDelayMs: 1000,
    hitModifier: 1,
    targetPriority: 'strongest',
    aggression: 0.7,
    tacticalAwareness: 0.75,
  },
  'chapter-master': {
    difficulty: 'chapter-master',
    thinkDelayMs: 500,
    hitModifier: 2,
    targetPriority: 'hq',
    aggression: 0.9,
    tacticalAwareness: 0.95,
  },
}

export function selectTarget(
  _state: BattleState,
  attacker: BattleUnit,
  targets: BattleUnit[],
  config: AIConfig,
): BattleUnit | null {
  if (targets.length === 0) return null

  const scored = targets.map((target) => {
    const profile = getProfile(target)
    const dist = distance(attacker.position, target.position)
    let score = 0

    switch (config.targetPriority) {
      case 'weakest':
        score += (10 - profile.wounds) * 10 + (10 - target.currentWounds) * 5
        break
      case 'strongest':
        score += profile.points * 2 + profile.wounds * 5
        break
      case 'hq':
        score += profile.category === 'hq' ? 100 : 0
        score += profile.points
        break
      case 'nearest':
        score += 50 - dist
        break
    }

    if (target.currentWounds < profile.wounds * target.modelsRemaining * 0.5) {
      score += 30 * config.tacticalAwareness
    }

    score -= dist * 0.5
    score += Math.random() * (1 - config.tacticalAwareness) * 20

    return { target, score }
  })

  scored.sort((a, b) => b.score - a.score)
  return scored[0].target
}

function findBestMovePosition(
  unit: BattleUnit,
  state: BattleState,
  config: AIConfig,
): Position | null {
  const profile = getProfile(unit)
  const enemies = getEnemyUnits(state, unit.owner)
  if (enemies.length === 0) return null

  const rangedWeapons = getRangedWeapons(profile)
  const hasRanged = rangedWeapons.length > 0
  const maxRange = hasRanged ? Math.max(...rangedWeapons.map((w) => w.range)) : 0

  let bestPos: Position | null = null
  let bestScore = -Infinity

  const angles = 16
  for (let i = 0; i < angles; i++) {
    const angle = (i / angles) * Math.PI * 2
    const dist = profile.movement * (0.5 + config.aggression * 0.5)
    const candidate: Position = {
      x: unit.position.x + Math.cos(angle) * dist,
      y: unit.position.y + Math.sin(angle) * dist,
    }

    if (candidate.x < 2 || candidate.x > 58 || candidate.y < 2 || candidate.y > 42) continue

    let score = 0
    for (const enemy of enemies) {
      const d = distance(candidate, enemy.position)
      if (hasRanged) {
        if (d <= maxRange && d > 1) score += 20
        if (d < maxRange * 0.7) score -= 10
      } else {
        score += 30 - d
      }
    }

    if (Math.random() < (1 - config.tacticalAwareness) * 0.3) {
      score += Math.random() * 15
    }

    if (score > bestScore) {
      bestScore = score
      bestPos = candidate
    }
  }

  return bestPos
}

export interface AIAction {
  type: 'move' | 'shoot' | 'charge' | 'fight' | 'nextPhase' | 'wait'
  unitId?: string
  targetId?: string
  position?: Position
  delay: number
}

export function planAITurn(state: BattleState, config: AIConfig): AIAction[] {
  if (state.activePlayer !== 'ai' || state.isOver) return []

  const actions: AIAction[] = []
  const aiUnits = getUnitsForPlayer(state, 'ai')

  switch (state.phase) {
    case 'movement':
      for (const unit of aiUnits) {
        if (unit.hasMoved || unit.isEngaged) continue
        const pos = findBestMovePosition(unit, state, config)
        if (pos) {
          actions.push({ type: 'move', unitId: unit.id, position: pos, delay: config.thinkDelayMs })
        }
      }
      actions.push({ type: 'nextPhase', delay: config.thinkDelayMs })
      break

    case 'shooting':
      for (const unit of aiUnits) {
        if (unit.hasShot) continue
        const targets = getValidShootTargets(state, unit.id)
        const target = selectTarget(state, unit, targets, config)
        if (target) {
          actions.push({ type: 'shoot', unitId: unit.id, targetId: target.id, delay: config.thinkDelayMs })
        }
      }
      actions.push({ type: 'nextPhase', delay: config.thinkDelayMs })
      break

    case 'charge':
      for (const unit of aiUnits) {
        if (unit.hasCharged || unit.isEngaged) continue
        const meleeWeapons = getMeleeWeapons(getProfile(unit))
        if (meleeWeapons.length === 0) continue

        const targets = getChargeTargets(state, unit.id)
        const target = selectTarget(state, unit, targets, config)
        if (target && Math.random() < config.aggression) {
          actions.push({ type: 'charge', unitId: unit.id, targetId: target.id, delay: config.thinkDelayMs })
        }
      }
      actions.push({ type: 'nextPhase', delay: config.thinkDelayMs })
      break

    case 'fight':
      for (const unit of aiUnits) {
        if (!unit.isEngaged || unit.hasFought) continue
        const enemies = getEnemyUnits(state, 'ai').filter((e) => {
          const u = getUnit(state, unit.id)
          return u && distance(u.position, e.position) < 3
        })
        const target = selectTarget(state, unit, enemies, config)
        if (target) {
          actions.push({ type: 'fight', unitId: unit.id, targetId: target.id, delay: config.thinkDelayMs })
        }
      }
      actions.push({ type: 'nextPhase', delay: config.thinkDelayMs })
      break

    case 'command':
    case 'morale':
      actions.push({ type: 'nextPhase', delay: 500 })
      break
  }

  return actions
}

export function executeAIAction(state: BattleState, action: AIAction): BattleState {
  switch (action.type) {
    case 'move':
      if (action.unitId && action.position) {
        return moveUnit(state, action.unitId, action.position)
      }
      return state
    case 'shoot':
      if (action.unitId && action.targetId) {
        return shootAtTarget(state, action.unitId, action.targetId)
      }
      return state
    case 'charge':
      if (action.unitId && action.targetId) {
        return chargeUnit(state, action.unitId, action.targetId)
      }
      return state
    case 'fight':
      if (action.unitId && action.targetId) {
        return fightCombat(state, action.unitId, action.targetId)
      }
      return state
    case 'nextPhase':
      return nextPhase(state)
    default:
      return state
  }
}
