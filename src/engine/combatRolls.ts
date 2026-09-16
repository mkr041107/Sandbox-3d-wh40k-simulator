import type { CombatModifiers } from '../types/game'
import { countSuccesses, rollDice } from './dice'

export type RollStepKind = 'hit' | 'wound' | 'save' | 'fnp' | 'mortal' | 'morale' | 'charge'

export interface DiceRollStep {
  step: RollStepKind
  label: string
  rolls: number[]
  rerolls?: number[]
  target: number
  successes: number
  failures: number
}

export interface CombatResolution {
  steps: DiceRollStep[]
  hits: number
  wounds: number
  unsavedWounds: number
}

export function pickAttackMods(mods: CombatModifiers): CombatModifiers {
  return {
    rangedHitBonus: mods.rangedHitBonus,
    rangedHitPenalty: mods.rangedHitPenalty,
    meleeHitBonus: mods.meleeHitBonus,
    woundBonus: mods.woundBonus,
    rerollHits: mods.rerollHits,
    rerollWounds: mods.rerollWounds,
    autoHit: mods.autoHit,
  }
}

export function pickDefenseMods(mods: CombatModifiers): CombatModifiers {
  return {
    saveBonus: mods.saveBonus,
    cover: mods.cover,
    invulnerableSave: mods.invulnerableSave,
    feelNoPain: mods.feelNoPain,
  }
}

function formatRolls(rolls: number[]): string {
  return rolls.length > 0 ? `[${rolls.join(', ')}]` : '[]'
}

export function formatRollStep(step: DiceRollStep): string {
  const rerollNote = step.rerolls && step.rerolls.length > 0
    ? ` reroll ${formatRolls(step.rerolls)}`
    : ''
  return `${step.label}: ${formatRolls(step.rolls)}${rerollNote} → need ${step.target}+ → ${step.successes} passed / ${step.failures} failed`
}

export function formatCombatResolution(
  header: string,
  resolution: CombatResolution,
  extras?: { damage?: number; modelsLost?: number },
): string {
  const lines = [header, ...resolution.steps.map(formatRollStep)]
  lines.push(`Result: ${resolution.hits} hits → ${resolution.wounds} wounds → ${resolution.unsavedWounds} unsaved`)
  if (extras?.damage !== undefined) {
    lines.push(`Damage: ${extras.damage} (${extras.modelsLost ?? 0} models removed)`)
  }
  return lines.join(' | ')
}

function resolveHitStep(
  attacks: number,
  skill: number,
  mods: CombatModifiers,
  attackType: 'ranged' | 'melee',
): { hits: number; step: DiceRollStep } {
  if (mods.autoHit) {
    return {
      hits: attacks,
      step: {
        step: 'hit',
        label: `Hit (${attacks} Torrent auto-hits)`,
        rolls: [],
        target: 0,
        successes: attacks,
        failures: 0,
      },
    }
  }

  const bonus = attackType === 'ranged'
    ? (mods.rangedHitBonus ?? 0) - (mods.rangedHitPenalty ?? 0)
    : (mods.meleeHitBonus ?? 0)
  const target = Math.max(2, skill - bonus)
  const rolls = rollDice(attacks)
  let finalRolls = rolls
  let rerolls: number[] | undefined

  if (mods.rerollHits) {
    rerolls = rolls.map((roll) => (roll >= target ? roll : rollDice(1)[0]))
    finalRolls = rerolls
  }

  const successes = countSuccesses(finalRolls, target)
  return {
    hits: successes,
    step: {
      step: 'hit',
      label: `Hit (${attacks}A @ ${target}+)`,
      rolls,
      rerolls,
      target,
      successes,
      failures: attacks - successes,
    },
  }
}

function resolveWoundStep(
  hits: number,
  strength: number,
  toughness: number,
  mods: CombatModifiers,
): { wounds: number; step: DiceRollStep } {
  if (hits <= 0) {
    return {
      wounds: 0,
      step: {
        step: 'wound',
        label: 'Wound (no hits)',
        rolls: [],
        target: 0,
        successes: 0,
        failures: 0,
      },
    }
  }

  let woundTarget = 4
  if (strength >= toughness * 2) woundTarget = 2
  else if (strength > toughness) woundTarget = 3
  else if (strength === toughness) woundTarget = 4
  else if (strength * 2 <= toughness) woundTarget = 6
  else woundTarget = 5

  woundTarget = Math.max(2, woundTarget - (mods.woundBonus ?? 0))
  const rolls = rollDice(hits)
  let finalRolls = rolls
  let rerolls: number[] | undefined

  if (mods.rerollWounds) {
    rerolls = rolls.map((roll) => (roll >= woundTarget ? roll : rollDice(1)[0]))
    finalRolls = rerolls
  }

  const successes = countSuccesses(finalRolls, woundTarget)
  return {
    wounds: successes,
    step: {
      step: 'wound',
      label: `Wound (${hits} hits @ ${woundTarget}+)`,
      rolls,
      rerolls,
      target: woundTarget,
      successes,
      failures: hits - successes,
    },
  }
}

function buildSaveLabel(
  ap: number,
  mods: CombatModifiers,
  saveTarget: number,
): string {
  const parts: string[] = []
  if (mods.invulnerableSave && mods.invulnerableSave <= saveTarget) {
    parts.push(`${mods.invulnerableSave}+ invuln`)
  } else {
    parts.push(`${saveTarget}+ armor`)
    if (mods.cover) parts.push('cover -1')
    if (ap > 0) parts.push(`AP-${ap}`)
  }
  return `Save (${parts.join(', ')})`
}

function resolveSaveSteps(
  wounds: number,
  ap: number,
  armorSave: number,
  mods: CombatModifiers,
): { unsavedWounds: number; steps: DiceRollStep[] } {
  if (wounds <= 0) {
    return {
      unsavedWounds: 0,
      steps: [{
        step: 'save',
        label: 'Save (no wounds)',
        rolls: [],
        target: 0,
        successes: 0,
        failures: 0,
      }],
    }
  }

  let armorTarget = Math.min(6, armorSave - ap - (mods.saveBonus ?? 0))
  if (mods.cover) armorTarget = Math.max(2, armorTarget - 1)
  const saveTarget = mods.invulnerableSave
    ? Math.min(armorTarget, mods.invulnerableSave)
    : armorTarget

  const rolls = rollDice(wounds)
  const saveSuccesses = countSuccesses(rolls, saveTarget)
  let failed = wounds - saveSuccesses
  const steps: DiceRollStep[] = [{
    step: 'save',
    label: buildSaveLabel(ap, mods, saveTarget),
    rolls,
    target: saveTarget,
    successes: saveSuccesses,
    failures: failed,
  }]

  if (mods.feelNoPain && failed > 0) {
    const fnpRolls = rollDice(failed)
    const fnpSuccesses = countSuccesses(fnpRolls, mods.feelNoPain)
    failed -= fnpSuccesses
    steps.push({
      step: 'fnp',
      label: `Feel No Pain (${failed + fnpSuccesses} wounds @ ${mods.feelNoPain}+)`,
      rolls: fnpRolls,
      target: mods.feelNoPain,
      successes: fnpSuccesses,
      failures: failed,
    })
  }

  return { unsavedWounds: Math.max(0, failed), steps }
}

export function resolveCombatAttack(params: {
  attacks: number
  skill: number
  strength: number
  toughness: number
  ap: number
  armorSave: number
  attackMods: CombatModifiers
  defenseMods: CombatModifiers
  attackType: 'ranged' | 'melee'
}): CombatResolution {
  const { hits, step: hitStep } = resolveHitStep(
    params.attacks,
    params.skill,
    params.attackMods,
    params.attackType,
  )
  const { wounds, step: woundStep } = resolveWoundStep(
    hits,
    params.strength,
    params.toughness,
    params.attackMods,
  )
  const { unsavedWounds, steps: saveSteps } = resolveSaveSteps(
    wounds,
    params.ap,
    params.armorSave,
    params.defenseMods,
  )

  return {
    steps: [hitStep, woundStep, ...saveSteps],
    hits,
    wounds,
    unsavedWounds,
  }
}

export function resolveMortalWounds(
  count: number,
  feelNoPain?: number,
): { unsaved: number; steps: DiceRollStep[] } {
  if (count <= 0) {
    return { unsaved: 0, steps: [] }
  }

  const steps: DiceRollStep[] = [{
    step: 'mortal',
    label: `Mortal wounds (${count}, no save)`,
    rolls: [],
    target: 0,
    successes: 0,
    failures: count,
  }]

  if (!feelNoPain) {
    return { unsaved: count, steps }
  }

  const fnpRolls = rollDice(count)
  const fnpSuccesses = countSuccesses(fnpRolls, feelNoPain)
  const unsaved = count - fnpSuccesses
  steps.push({
    step: 'fnp',
    label: `Feel No Pain vs mortals (${count} @ ${feelNoPain}+)`,
    rolls: fnpRolls,
    target: feelNoPain,
    successes: fnpSuccesses,
    failures: unsaved,
  })

  return { unsaved, steps }
}

export function formatMortalSteps(steps: DiceRollStep[]): string {
  return steps.map(formatRollStep).join(' | ')
}
