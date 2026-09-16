import type { BattlePhase, BattleState, BattleUnit, Position } from '../types/game'
import {
  getChargeTargets,
  getEnemyUnits,
  getMeleeWeapons,
  getProfile,
  getUnitsForPlayer,
  getValidShootTargets,
} from '../engine/battle'
import type { AIAction } from './opponent'
import { AI_DIFFICULTY_CONFIG, planAITurn } from './opponent'
import type { AIDifficulty } from '../types/game'
import { requestChatCompletion, LlmClientError } from './llmClient'
import type { LlmSettings } from './llmSettings'

export const LLM_SYSTEM_PROMPT = `You are an expert Warhammer 40,000 10th Edition tactician controlling the AI opponent in a tactical battle sandbox.

You receive the current battle snapshot as JSON and must return ONLY valid JSON (no markdown) in this shape:
{
  "actions": [
    { "type": "move", "unitId": "...", "modelId": "...", "position": { "x": number, "y": number } },
    { "type": "shoot", "unitId": "...", "targetId": "..." },
    { "type": "charge", "unitId": "...", "targetId": "..." },
    { "type": "fight", "unitId": "...", "targetId": "..." },
    { "type": "nextPhase" }
  ]
}

RULES:
- Only use unit IDs from the snapshot.
- Only choose actions listed as legal for the current phase.
- For movement, move one model at a time. Each position must be within that model's Movement from its current position, preserve squad coherency (2"), and not overlap other baseplates.
- End the phase with exactly one { "type": "nextPhase" } action.
- If no useful actions exist this phase, return only [{ "type": "nextPhase" }].
- Focus fire wounded enemies, protect high-value units, advance toward objectives, and charge when melee is favorable.

TACTICAL PRIORITIES:
1. Score and contest objectives via positioning.
2. Eliminate high-value threats (HQ, heavy support) when possible.
3. Keep ranged units at effective range; push melee units into combat.
4. Do not waste shots on targets you cannot kill when better options exist.`

function summarizeUnit(unit: BattleUnit) {
  const profile = getProfile(unit)
  return {
    id: unit.id,
    name: profile.name,
    category: profile.category,
    points: profile.points,
    position: unit.position,
    movement: profile.movement,
    woundsRemaining: unit.currentWounds,
    woundsMax: profile.wounds * profile.models,
    modelsRemaining: unit.modelsRemaining,
    hasMoved: unit.hasMoved,
    hasShot: unit.hasShot,
    hasCharged: unit.hasCharged,
    hasFought: unit.hasFought,
    isEngaged: unit.isEngaged,
    rangedWeapons: profile.weapons.filter((w) => w.type === 'ranged').map((w) => ({
      name: w.name,
      range: w.range,
      attacks: w.attacks,
      skill: w.skill,
      strength: w.strength,
      ap: w.ap,
      damage: w.damage,
    })),
    meleeWeapons: profile.weapons.filter((w) => w.type === 'melee').map((w) => ({
      name: w.name,
      attacks: w.attacks,
      skill: w.skill,
      strength: w.strength,
      ap: w.ap,
      damage: w.damage,
    })),
  }
}

export function buildBattleSnapshot(state: BattleState, battlefieldWidth: number, battlefieldHeight: number) {
  const aiUnits = getUnitsForPlayer(state, 'ai')
  const playerUnits = getUnitsForPlayer(state, 'player')

  const legal: Record<string, unknown> = { phase: state.phase }

  if (state.phase === 'movement') {
    legal.moves = aiUnits
      .filter((u) => !u.isEngaged && !u.inReserves)
      .flatMap((u) => {
        const profile = getProfile(u)
        return u.models
          .filter((model) => !model.hasMoved)
          .map((model) => ({
            unitId: u.id,
            modelId: model.id,
            modelIndex: model.index,
            unitName: profile.name,
            from: model.position,
            maxDistance: profile.movement,
          }))
      })
  }

  if (state.phase === 'shooting') {
    legal.shots = aiUnits
      .filter((u) => !u.hasShot)
      .map((u) => ({
        unitId: u.id,
        name: getProfile(u).name,
        targets: getValidShootTargets(state, u.id).map((t) => ({
          targetId: t.id,
          name: getProfile(t).name,
          woundsRemaining: t.currentWounds,
          distance: Math.hypot(u.position.x - t.position.x, u.position.y - t.position.y),
        })),
      }))
      .filter((s) => s.targets.length > 0)
  }

  if (state.phase === 'charge') {
    legal.charges = aiUnits
      .filter((u) => !u.hasCharged && !u.isEngaged && getMeleeWeapons(getProfile(u)).length > 0)
      .map((u) => ({
        unitId: u.id,
        name: getProfile(u).name,
        targets: getChargeTargets(state, u.id).map((t) => ({
          targetId: t.id,
          name: getProfile(t).name,
        })),
      }))
      .filter((c) => c.targets.length > 0)
  }

  if (state.phase === 'fight') {
    legal.fights = aiUnits
      .filter((u) => u.isEngaged && !u.hasFought)
      .map((u) => ({
        unitId: u.id,
        name: getProfile(u).name,
        targets: getEnemyUnits(state, 'ai')
          .filter((e) => Math.hypot(u.position.x - e.position.x, u.position.y - e.position.y) < 3)
          .map((t) => ({
            targetId: t.id,
            name: getProfile(t).name,
            woundsRemaining: t.currentWounds,
          })),
      }))
      .filter((f) => f.targets.length > 0)
  }

  return {
    turn: state.turn,
    phase: state.phase,
    activePlayer: state.activePlayer,
    victoryPoints: { ai: state.aiVp, player: state.playerVp },
    battlefield: { width: battlefieldWidth, height: battlefieldHeight },
    yourUnits: aiUnits.map((u) => summarizeUnit(u)),
    enemyUnits: playerUnits.map((u) => summarizeUnit(u)),
    legalActions: legal,
  }
}

interface RawLlmAction {
  type?: string
  unitId?: string
  modelId?: string
  targetId?: string
  position?: Position
}

function parseLlmActions(raw: string): AIAction[] {
  const trimmed = raw.trim()
  const jsonText = trimmed.startsWith('{')
    ? trimmed
    : trimmed.match(/```(?:json)?\s*([\s\S]*?)```/)?.[1]?.trim() ?? trimmed

  const parsed = JSON.parse(jsonText) as { actions?: RawLlmAction[] }
  if (!Array.isArray(parsed.actions)) {
    throw new Error('LLM response missing actions array')
  }

  const actions: AIAction[] = []
  for (const action of parsed.actions) {
    switch (action.type) {
      case 'move':
        if (action.unitId && action.position) {
          actions.push({
            type: 'move',
            unitId: action.unitId,
            modelId: action.modelId,
            position: { x: Number(action.position.x), y: Number(action.position.y) },
            delay: 800,
          })
        }
        break
      case 'shoot':
        if (action.unitId && action.targetId) {
          actions.push({ type: 'shoot', unitId: action.unitId, targetId: action.targetId, delay: 800 })
        }
        break
      case 'charge':
        if (action.unitId && action.targetId) {
          actions.push({ type: 'charge', unitId: action.unitId, targetId: action.targetId, delay: 800 })
        }
        break
      case 'fight':
        if (action.unitId && action.targetId) {
          actions.push({ type: 'fight', unitId: action.unitId, targetId: action.targetId, delay: 800 })
        }
        break
      case 'nextPhase':
        actions.push({ type: 'nextPhase', delay: 500 })
        break
      default:
        break
    }
  }

  if (!actions.some((a) => a.type === 'nextPhase')) {
    actions.push({ type: 'nextPhase', delay: 500 })
  }

  return actions
}

export async function planLLMPhase(
  state: BattleState,
  settings: LlmSettings,
  battlefieldWidth: number,
  battlefieldHeight: number,
): Promise<AIAction[]> {
  if (state.activePlayer !== 'ai' || state.isOver) return []

  const snapshot = buildBattleSnapshot(state, battlefieldWidth, battlefieldHeight)
  const userPrompt = `Current battle snapshot:\n${JSON.stringify(snapshot, null, 2)}\n\nReturn your actions for the ${state.phase} phase as JSON.`

  const content = await requestChatCompletion(settings, [
    { role: 'system', content: LLM_SYSTEM_PROMPT },
    { role: 'user', content: userPrompt },
  ])

  return parseLlmActions(content)
}

export async function planAITurnWithLlm(
  state: BattleState,
  settings: LlmSettings,
  difficulty: AIDifficulty,
  battlefieldWidth: number,
  battlefieldHeight: number,
): Promise<{ actions: AIAction[]; usedFallback: boolean; error?: string }> {
  try {
    const actions = await planLLMPhase(state, settings, battlefieldWidth, battlefieldHeight)
    return { actions, usedFallback: false }
  } catch (err) {
    const message = err instanceof LlmClientError || err instanceof Error
      ? err.message
      : 'Unknown LLM error'
    const config = AI_DIFFICULTY_CONFIG[difficulty]
    return {
      actions: planAITurn(state, config),
      usedFallback: true,
      error: message,
    }
  }
}

export function phaseLabel(phase: BattlePhase): string {
  const labels: Record<BattlePhase, string> = {
    deployment: 'Deployment',
    command: 'Command',
    movement: 'Movement',
    shooting: 'Shooting',
    charge: 'Charge',
    fight: 'Fight',
    morale: 'Morale',
  }
  return labels[phase]
}
