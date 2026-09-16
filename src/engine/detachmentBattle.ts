import { v4 as uuidv4 } from 'uuid'
import type {
  BattleDetachmentState,
  BattleEffect,
  BattlePhase,
  BattleState,
  BattleUnit,
  CombatDoctrine,
  CombatModifiers,
  PlayerId,
} from '../types/game'
import {
  getDetachmentRuleConfig,
  getFocusCombatModifiers,
  mergeCombatModifiers,
  parseStratagemModifiers,
  phaseMatches,
} from '../data/detachmentEffects'
import { getDetachment } from '../data/detachments'
import { distance, getEnemyUnits, getProfile, getUnit, getUnitsForPlayer } from './battleQueries'

const STARTING_CP = 6
const MAX_CP = 10
const CP_PER_COMMAND_PHASE = 1

export function createBattleDetachmentState(detachmentId: string | null): BattleDetachmentState {
  const detachment = getDetachment(detachmentId)
  const ruleConfig = getDetachmentRuleConfig(detachmentId)
  return {
    detachmentId: detachment?.id ?? null,
    detachmentName: detachment?.name ?? 'Unbound',
    armyRuleName: detachment?.armyRule.name ?? 'None',
    commandPoints: STARTING_CP,
    maxCommandPoints: MAX_CP,
    usedStratagemNames: [],
    activeEffects: [],
    doctrine: null,
    oathTargetId: null,
    waaaghTurnsRemaining: ruleConfig.waaaghTurns ?? 0,
  }
}

export function getDetachmentState(state: BattleState, player: PlayerId): BattleDetachmentState {
  return player === 'player' ? state.playerDetachment : state.aiDetachment
}

function updateDetachmentState(
  state: BattleState,
  player: PlayerId,
  detachment: BattleDetachmentState,
): BattleState {
  return player === 'player'
    ? { ...state, playerDetachment: detachment }
    : { ...state, aiDetachment: detachment }
}

function addLog(state: BattleState, message: string, player: PlayerId | 'system'): BattleState {
  return {
    ...state,
    log: [...state.log, {
      turn: state.turn,
      phase: state.phase,
      message,
      player,
    }],
  }
}

function pruneExpiredEffects(
  detachment: BattleDetachmentState,
  turn: number,
  phase: BattlePhase,
): BattleDetachmentState {
  return {
    ...detachment,
    activeEffects: detachment.activeEffects.filter((effect) => {
      if (turn > effect.expiresTurn) return false
      if (turn === effect.expiresTurn && !effect.validPhases.includes(phase)) return false
      return true
    }),
  }
}

export function beginCommandPhase(state: BattleState): BattleState {
  const player = state.activePlayer
  let detachment = getDetachmentState(state, player)
  detachment = pruneExpiredEffects(detachment, state.turn, state.phase)
  detachment = {
    ...detachment,
    commandPoints: Math.min(detachment.maxCommandPoints, detachment.commandPoints + CP_PER_COMMAND_PHASE),
  }

  const ruleConfig = getDetachmentRuleConfig(detachment.detachmentId)
  if (ruleConfig.montkaTurns && state.turn <= ruleConfig.montkaTurns) {
    detachment = { ...detachment, doctrine: 'montka' }
  }

  let newState = updateDetachmentState(state, player, detachment)
  newState = addLog(
    newState,
    `${capitalize(player)} Command phase — ${detachment.commandPoints} CP (${detachment.detachmentName}: ${detachment.armyRuleName}).`,
    player,
  )
  return newState
}

export function setDoctrine(state: BattleState, player: PlayerId, doctrine: CombatDoctrine): BattleState {
  if (state.activePlayer !== player || state.phase !== 'command') return state
  const detachment = getDetachmentState(state, player)
  let newState = updateDetachmentState(state, player, { ...detachment, doctrine })
  newState = addLog(newState, `${capitalize(player)} selects ${doctrine} doctrine.`, player)
  return newState
}

export function setOathTarget(state: BattleState, player: PlayerId, targetId: string): BattleState {
  if (state.activePlayer !== player) return state
  const detachment = getDetachmentState(state, player)
  const target = getUnit(state, targetId)
  if (!target || target.owner === player) return state
  let newState = updateDetachmentState(state, player, { ...detachment, oathTargetId: targetId })
  newState = addLog(newState, `${capitalize(player)} marks ${getProfile(target).name} with Oath of Moment.`, player)
  return newState
}

export function autoConfigureCommandPhase(state: BattleState, player: PlayerId): BattleState {
  let current = state
  if (current.activePlayer !== player || current.phase !== 'command') return current

  const detachment = getDetachmentState(current, player)
  const ruleConfig = getDetachmentRuleConfig(detachment.detachmentId)

  if (ruleConfig.doctrineCycle && !detachment.doctrine) {
    const units = getUnitsForPlayer(current, player)
    const rangedCount = units.filter((u) => getProfile(u).weapons.some((w) => w.type === 'ranged')).length
    const meleeCount = units.filter((u) => getProfile(u).weapons.some((w) => w.type === 'melee')).length
    const doctrine: CombatDoctrine = rangedCount >= meleeCount ? 'devastator' : 'assault'
    current = setDoctrine(current, player, doctrine)
  } else if (ruleConfig.kauyon) {
    current = setDoctrine(current, player, 'kauyon')
  } else if (detachment.waaaghTurnsRemaining > 0) {
    current = addLog(current, `${capitalize(player)} Waaagh! is active this turn.`, player)
  }

  if (ruleConfig.oathOfMoment && !getDetachmentState(current, player).oathTargetId) {
    const enemies = getEnemyUnits(current, player)
    if (enemies.length > 0) {
      const target = enemies.sort((a, b) => getProfile(b).points - getProfile(a).points)[0]
      current = setOathTarget(current, player, target.id)
    }
  }

  const refreshed = getDetachmentState(current, player)
  const usable = getUsableStratagems(current, player, 'command')
  for (const stratagem of usable) {
    if (refreshed.commandPoints < stratagem.cp) break
    if (stratagem.effect.toLowerCase().includes('0cp')) {
      current = useStratagem(current, player, stratagem.name)
    }
  }

  return current
}

export function getUsableStratagems(state: BattleState, player: PlayerId, phase?: BattlePhase) {
  const detachment = getDetachmentState(state, player)
  const data = getDetachment(detachment.detachmentId)
  if (!data) return []

  const currentPhase = phase ?? state.phase
  return data.stratagems.filter((stratagem) => {
    if (detachment.usedStratagemNames.includes(stratagem.name)) return false
    if (detachment.commandPoints < stratagem.cp) return false
    return phaseMatches(stratagem.phase, currentPhase)
  })
}

export function useStratagem(
  state: BattleState,
  player: PlayerId,
  stratagemName: string,
  unitId?: string,
): BattleState {
  if (state.activePlayer !== player) return state

  const detachment = getDetachmentState(state, player)
  const data = getDetachment(detachment.detachmentId)
  const stratagem = data?.stratagems.find((s) => s.name === stratagemName)
  if (!stratagem) return state
  if (detachment.usedStratagemNames.includes(stratagemName)) return state
  if (detachment.commandPoints < stratagem.cp) return state
  if (!phaseMatches(stratagem.phase, state.phase) && stratagem.phase.toLowerCase() !== 'any') return state

  if (unitId) {
    const unit = getUnit(state, unitId)
    if (!unit || unit.owner !== player) return state
  }

  const modifiers = parseStratagemModifiers(stratagem)
  const effect: BattleEffect = {
    id: uuidv4(),
    name: stratagem.name,
    source: 'stratagem',
    owner: player,
    scope: unitId ? 'unit' : 'army',
    unitId,
    createdTurn: state.turn,
    expiresTurn: state.turn,
    validPhases: stratagem.phase.toLowerCase() === 'any'
      ? ['command', 'movement', 'shooting', 'charge', 'fight', 'morale']
      : [state.phase],
    modifiers,
  }

  const updatedDetachment: BattleDetachmentState = {
    ...detachment,
    commandPoints: detachment.commandPoints - stratagem.cp,
    usedStratagemNames: [...detachment.usedStratagemNames, stratagem.name],
    activeEffects: [...detachment.activeEffects, effect],
  }

  let newState = updateDetachmentState(state, player, updatedDetachment)
  const unitLabel = unitId ? ` on ${getProfile(getUnit(state, unitId)!).name}` : ''
  newState = addLog(
    newState,
    `${capitalize(player)} uses ${stratagem.name} (-${stratagem.cp} CP)${unitLabel}.`,
    player,
  )
  return newState
}

function collectEffectModifiers(
  detachment: BattleDetachmentState,
  state: BattleState,
  unit: BattleUnit,
  phase: BattlePhase,
): CombatModifiers[] {
  return detachment.activeEffects
    .filter((effect) => effect.owner === unit.owner)
    .filter((effect) => state.turn <= effect.expiresTurn)
    .filter((effect) => effect.validPhases.includes(phase))
    .filter((effect) => effect.scope === 'army' || effect.unitId === unit.id)
    .map((effect) => effect.modifiers)
}

export function getArmyRuleModifiers(
  state: BattleState,
  unit: BattleUnit,
  phase: BattlePhase,
  attackType: 'ranged' | 'melee',
  target?: BattleUnit,
): CombatModifiers {
  const detachment = getDetachmentState(state, unit.owner)
  const data = getDetachment(detachment.detachmentId)
  const ruleConfig = getDetachmentRuleConfig(detachment.detachmentId)
  const mods: CombatModifiers[] = []

  if (data?.focus) {
    const focusMods = getFocusCombatModifiers(data.focus)
    if (ruleConfig.focusFallback) {
      mods.push(getFocusCombatModifiers(ruleConfig.focusFallback))
    } else {
      mods.push(focusMods)
    }
  }

  if (detachment.doctrine === 'devastator' && attackType === 'ranged' && unit.hasMoved === false) {
    mods.push({ rangedHitBonus: 1 })
  }
  if (detachment.doctrine === 'assault' && phase === 'charge') {
    mods.push({ chargeBonus: 1 })
  }
  if (detachment.doctrine === 'montka' && attackType === 'ranged' && state.turn <= 3) {
    mods.push({ woundBonus: 1 })
  }
  if (detachment.doctrine === 'kauyon' && attackType === 'ranged') {
    const nearestEnemy = getEnemyUnits(state, unit.owner)
      .map((enemy) => distance(unit.position, enemy.position))
      .sort((a, b) => a - b)[0]
    if (nearestEnemy !== undefined && nearestEnemy > 12) {
      mods.push({ saveBonus: 1, cover: true })
    }
  }

  if (ruleConfig.bornSoldiers && attackType === 'ranged') {
    mods.push({ rerollHits: true })
  }

  if (ruleConfig.oathOfMoment && target && detachment.oathTargetId === target.id) {
    mods.push({ rerollHits: true, rerollWounds: true })
  }

  if (detachment.waaaghTurnsRemaining > 0) {
    if (attackType === 'melee') mods.push({ meleeHitBonus: 1 })
    if (phase === 'charge') mods.push({ chargeBonus: 1 })
  }

  if (unit.hasCharged && attackType === 'melee') {
    mods.push({ meleeHitBonus: 1 })
  }

  return mergeCombatModifiers(...mods)
}

export function getCombatModifiers(
  state: BattleState,
  attacker: BattleUnit,
  phase: BattlePhase,
  attackType: 'ranged' | 'melee',
  target?: BattleUnit,
): CombatModifiers {
  const detachment = getDetachmentState(state, attacker.owner)
  const effectMods = collectEffectModifiers(detachment, state, attacker, phase)
  const armyMods = getArmyRuleModifiers(state, attacker, phase, attackType, target)
  return mergeCombatModifiers(armyMods, ...effectMods)
}

export function unitHasFightsTwice(state: BattleState, unit: BattleUnit, phase: BattlePhase): boolean {
  const detachment = getDetachmentState(state, unit.owner)
  return detachment.activeEffects.some((effect) =>
    effect.unitId === unit.id
    && effect.validPhases.includes(phase)
    && effect.modifiers.fightsTwice,
  )
}

export function tickTurnEnd(state: BattleState): BattleState {
  let newState = state
  for (const player of ['player', 'ai'] as PlayerId[]) {
    let detachment = getDetachmentState(newState, player)
    if (detachment.waaaghTurnsRemaining > 0) {
      detachment = { ...detachment, waaaghTurnsRemaining: detachment.waaaghTurnsRemaining - 1 }
      newState = updateDetachmentState(newState, player, detachment)
    }
  }
  return newState
}

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1)
}

export function pickAIDetachmentId(_factionId: string, detachmentIds: string[]): string | null {
  if (detachmentIds.length === 0) return null
  const aggressive = detachmentIds.find((id) => getDetachment(id)?.focus === 'Aggressive')
  const shooting = detachmentIds.find((id) => getDetachment(id)?.focus === 'Shooting')
  const roll = Math.random()
  if (roll < 0.4 && aggressive) return aggressive
  if (roll < 0.7 && shooting) return shooting
  return detachmentIds[Math.floor(Math.random() * detachmentIds.length)] ?? null
}
