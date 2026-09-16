import type { AIDifficulty, BattleModel, BattleState, BattleUnit, CombatDoctrine, Position } from '../types/game'
import type { ShotVisualPayload } from '../engine/combatVfx'
import {
  autoConfigureCommandPhase,
  getUsableStratagems,
  useStratagem,
} from '../engine/detachmentBattle'
import {
  canMoveModelTo,
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
  setDoctrine,
  shootAtTarget,
} from '../engine/battle'
import { sortUnitsByFightPriority } from '../engine/battlefieldRules'
import { getDetachmentRuleConfig } from '../data/detachmentEffects'

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

function nearestEnemyModelDistance(from: Position, enemy: BattleUnit): number {
  if (enemy.models.length === 0) return distance(from, enemy.position)
  return Math.min(...enemy.models.map((model) => distance(from, model.position)))
}

function findBestModelMovePosition(
  unit: BattleUnit,
  model: BattleModel,
  state: BattleState,
  config: AIConfig,
): Position | null {
  const profile = getProfile(unit)
  const enemies = getEnemyUnits(state, unit.owner).filter((enemy) => !enemy.inReserves)
  if (enemies.length === 0) return null

  const rangedWeapons = getRangedWeapons(profile)
  const hasRanged = rangedWeapons.length > 0
  const maxRange = hasRanged ? Math.max(...rangedWeapons.map((w) => w.range)) : 0

  let bestPos: Position | null = null
  let bestScore = -Infinity

  const minX = 2
  const maxX = state.battlefieldWidth - 2
  const minY = 2
  const maxY = state.battlefieldHeight - 2
  const angles = 16
  const step = profile.movement * (0.45 + config.aggression * 0.5)

  for (let i = 0; i < angles; i++) {
    const angle = (i / angles) * Math.PI * 2
    const candidate: Position = {
      x: model.position.x + Math.cos(angle) * step,
      y: model.position.y + Math.sin(angle) * step,
    }

    if (candidate.x < minX || candidate.x > maxX || candidate.y < minY || candidate.y > maxY) continue
    if (!canMoveModelTo(unit, model, candidate, state)) continue

    let score = 0
    for (const enemy of enemies) {
      const d = nearestEnemyModelDistance(candidate, enemy)
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
  type: 'move' | 'shoot' | 'charge' | 'fight' | 'nextPhase' | 'wait' | 'stratagem' | 'doctrine'
  unitId?: string
  modelId?: string
  targetId?: string
  position?: Position
  stratagemName?: string
  doctrine?: CombatDoctrine
  delay: number
}

export function planAITurn(state: BattleState, config: AIConfig): AIAction[] {
  if (state.activePlayer !== 'ai' || state.isOver) return []

  const actions: AIAction[] = []
  const aiUnits = getUnitsForPlayer(state, 'ai')

  switch (state.phase) {
    case 'command': {
      const detachment = state.aiDetachment
      const ruleConfig = getDetachmentRuleConfig(detachment.detachmentId)
      if (ruleConfig.doctrineCycle && !detachment.doctrine) {
        const rangedCount = aiUnits.filter((u) => getRangedWeapons(getProfile(u)).length > 0).length
        const doctrine: CombatDoctrine = rangedCount >= aiUnits.length / 2 ? 'devastator' : 'assault'
        actions.push({ type: 'doctrine', doctrine, delay: 400 })
      } else if (ruleConfig.kauyon) {
        actions.push({ type: 'doctrine', doctrine: 'kauyon', delay: 400 })
      } else if (ruleConfig.montkaTurns) {
        actions.push({ type: 'doctrine', doctrine: 'montka', delay: 400 })
      }
      actions.push({ type: 'nextPhase', delay: config.thinkDelayMs })
      break
    }

    case 'movement':
      for (const unit of aiUnits) {
        if (unit.isEngaged || unit.inReserves) continue
        for (const model of unit.models) {
          if (model.hasMoved) continue
          const pos = findBestModelMovePosition(unit, model, state, config)
          if (pos) {
            actions.push({
              type: 'move',
              unitId: unit.id,
              modelId: model.id,
              position: pos,
              delay: config.thinkDelayMs,
            })
          }
        }
      }
      actions.push({ type: 'nextPhase', delay: config.thinkDelayMs })
      break

    case 'shooting':
      for (const unit of aiUnits) {
        if (unit.hasShot) continue
        const strats = getUsableStratagems(state, 'ai', 'shooting')
        if (strats.length > 0 && config.tacticalAwareness > 0.45) {
          actions.push({
            type: 'stratagem',
            unitId: unit.id,
            stratagemName: strats[0].name,
            delay: 300,
          })
        }
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
      for (const unit of sortUnitsByFightPriority(aiUnits)) {
        if (!unit.isEngaged || unit.hasFought) continue
        const strats = getUsableStratagems(state, 'ai', 'fight')
        if (strats.length > 0 && config.tacticalAwareness > 0.4) {
          actions.push({
            type: 'stratagem',
            unitId: unit.id,
            stratagemName: strats[0].name,
            delay: 300,
          })
        }
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

    case 'morale':
      actions.push({ type: 'nextPhase', delay: 500 })
      break
  }

  return actions
}

export interface AIActionOutcome {
  state: BattleState
  shot?: ShotVisualPayload
}

export function executeAIAction(state: BattleState, action: AIAction): AIActionOutcome {
  switch (action.type) {
    case 'doctrine':
      if (action.doctrine) {
        let newState = setDoctrine(state, 'ai', action.doctrine)
        newState = autoConfigureCommandPhase(newState, 'ai')
        return { state: newState }
      }
      return { state }
    case 'stratagem':
      if (action.stratagemName) {
        return { state: useStratagem(state, 'ai', action.stratagemName, action.unitId) }
      }
      return { state }
    case 'move':
      if (action.unitId && action.position) {
        return { state: moveUnit(state, action.unitId, action.position, action.modelId) }
      }
      return { state }
    case 'shoot':
      if (action.unitId && action.targetId) {
        const result = shootAtTarget(state, action.unitId, action.targetId)
        return { state: result.state, shot: result.shot }
      }
      return { state }
    case 'charge':
      if (action.unitId && action.targetId) {
        return { state: chargeUnit(state, action.unitId, action.targetId) }
      }
      return { state }
    case 'fight':
      if (action.unitId && action.targetId) {
        return { state: fightCombat(state, action.unitId, action.targetId) }
      }
      return { state }
    case 'nextPhase':
      if (state.phase === 'command' && state.activePlayer === 'ai') {
        return { state: nextPhase(autoConfigureCommandPhase(state, 'ai')) }
      }
      return { state: nextPhase(state) }
    default:
      return { state }
  }
}
