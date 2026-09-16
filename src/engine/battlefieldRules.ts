import type {
  BattlePhase,
  BattleState,
  BattleUnit,
  CombatModifiers,
  Position,
  UnitProfile,
  WeaponProfile,
} from '../types/game'
import { inferWeaponKeywords } from '../data/abilityRules'
import { COVER_PROXIMITY, TERRAIN_CIRCLES, TERRAIN_RECTS } from '../data/battlefieldTerrain'
import { mergeCombatModifiers } from '../data/detachmentEffects'
import { getCombatModifiers, getDetachmentState } from './detachmentBattle'
import { closestModelDistance, distance, getProfile, getUnitsForPlayer } from './battleQueries'
import { rollDice } from './dice'
import { formatMortalSteps, resolveMortalWounds } from './combatRolls'
import { getUnitCentroid, trimModelsToCount } from './modelSquad'

export interface ShootLegality {
  valid: boolean
  reason?: string
  weaponIndex: number
  hasLineOfSight: boolean
  usesIndirectFire: boolean
  spotterUnitId?: string
}

function rotatePoint(x: number, y: number, cx: number, cy: number, angle: number): Position {
  const dx = x - cx
  const dy = y - cy
  const cos = Math.cos(angle)
  const sin = Math.sin(angle)
  return {
    x: cx + dx * cos - dy * sin,
    y: cy + dx * sin + dy * cos,
  }
}

function segmentIntersectsRect(
  a: Position,
  b: Position,
  rect: { x: number; y: number; width: number; depth: number; rotation?: number },
): boolean {
  const halfW = rect.width / 2
  const halfD = rect.depth / 2
  const rotation = rect.rotation ?? 0

  const localA = rotatePoint(a.x, a.y, rect.x, rect.y, -rotation)
  const localB = rotatePoint(b.x, b.y, rect.x, rect.y, -rotation)

  const left = rect.x - halfW
  const right = rect.x + halfW
  const top = rect.y - halfD
  const bottom = rect.y + halfD

  const minX = Math.min(localA.x, localB.x)
  const maxX = Math.max(localA.x, localB.x)
  const minY = Math.min(localA.y, localB.y)
  const maxY = Math.max(localA.y, localB.y)
  if (maxX < left || minX > right || maxY < top || minY > bottom) return false

  const inside = (p: Position) => p.x >= left && p.x <= right && p.y >= top && p.y <= bottom
  if (inside(localA) || inside(localB)) return true

  const edges: [Position, Position][] = [
    [{ x: left, y: top }, { x: right, y: top }],
    [{ x: right, y: top }, { x: right, y: bottom }],
    [{ x: right, y: bottom }, { x: left, y: bottom }],
    [{ x: left, y: bottom }, { x: left, y: top }],
  ]

  for (const [p1, p2] of edges) {
    if (segmentsIntersect(localA, localB, p1, p2)) return true
  }
  return false
}

function orientation(a: Position, b: Position, c: Position): number {
  return (b.y - a.y) * (c.x - b.x) - (b.x - a.x) * (c.y - b.y)
}

function onSegment(a: Position, b: Position, c: Position): boolean {
  return Math.min(a.x, b.x) <= c.x && c.x <= Math.max(a.x, b.x)
    && Math.min(a.y, b.y) <= c.y && c.y <= Math.max(a.y, b.y)
}

function segmentsIntersect(a: Position, b: Position, c: Position, d: Position): boolean {
  const o1 = orientation(a, b, c)
  const o2 = orientation(a, b, d)
  const o3 = orientation(c, d, a)
  const o4 = orientation(c, d, b)

  if (o1 !== o2 && o3 !== o4) return true
  if (o1 === 0 && onSegment(a, c, b)) return true
  if (o2 === 0 && onSegment(a, d, b)) return true
  if (o3 === 0 && onSegment(c, a, d)) return true
  if (o4 === 0 && onSegment(c, b, d)) return true
  return false
}

function segmentIntersectsCircle(a: Position, b: Position, circle: { x: number; y: number; radius: number }): boolean {
  const dx = b.x - a.x
  const dy = b.y - a.y
  const fx = a.x - circle.x
  const fy = a.y - circle.y

  const aa = dx * dx + dy * dy
  if (aa === 0) {
    return Math.hypot(fx, fy) <= circle.radius
  }

  let t = -(fx * dx + fy * dy) / aa
  t = Math.max(0, Math.min(1, t))
  const px = a.x + t * dx
  const py = a.y + t * dy
  return Math.hypot(px - circle.x, py - circle.y) <= circle.radius
}

export function hasLineOfSight(a: Position, b: Position): boolean {
  for (const rect of TERRAIN_RECTS) {
    if (!rect.blocksLineOfSight) continue
    if (segmentIntersectsRect(a, b, rect)) return false
  }
  for (const circle of TERRAIN_CIRCLES) {
    if (!circle.blocksLineOfSight) continue
    if (segmentIntersectsCircle(a, b, circle)) return false
  }
  return true
}

export function unitsHaveLineOfSight(attacker: BattleUnit, target: BattleUnit): boolean {
  const attackerModels = attacker.models.length > 0 ? attacker.models : [{ position: attacker.position }]
  const targetModels = target.models.length > 0 ? target.models : [{ position: target.position }]

  for (const mine of attackerModels) {
    for (const theirs of targetModels) {
      if (hasLineOfSight(mine.position, theirs.position)) return true
    }
  }
  return false
}

export function findIndirectFireSpotter(
  state: BattleState,
  attacker: BattleUnit,
  target: BattleUnit,
): BattleUnit | undefined {
  return getUnitsForPlayer(state, attacker.owner).find((ally) => {
    if (ally.id === attacker.id || ally.inReserves || ally.modelsRemaining <= 0) return false
    return unitsHaveLineOfSight(ally, target)
  })
}

export function getWeaponKeywords(weapon: WeaponProfile): string[] {
  return inferWeaponKeywords(weapon)
}

export function weaponHasKeyword(weapon: WeaponProfile, keyword: string): boolean {
  return getWeaponKeywords(weapon).includes(keyword)
}

function unitHasNamedAbility(profile: UnitProfile, pattern: RegExp): boolean {
  return profile.abilities?.some((ability) => pattern.test(ability.name)) ?? false
}

export function unitHasStealth(profile: UnitProfile): boolean {
  return unitHasNamedAbility(profile, /stealth/i)
    || profile.keywords.some((kw) => /stealth/i.test(kw))
}

export function unitFightsFirst(profile: UnitProfile): boolean {
  return unitHasNamedAbility(profile, /fights first/i)
}

export function getUnitFeelNoPain(profile: UnitProfile): number | undefined {
  const ability = profile.abilities?.find((entry) => /feel no pain/i.test(entry.name))
  if (!ability) return undefined
  const match = ability.name.match(/(\d)\+/)
  return match ? Number(match[1]) : 5
}

export function getIonShieldSave(profile: UnitProfile): number | undefined {
  if (unitHasNamedAbility(profile, /ion shield/i)) return 4
  return undefined
}

export function unitHasDeadlyDemise(profile: UnitProfile): boolean {
  return unitHasNamedAbility(profile, /deadly demise/i)
    || profile.keywords.includes('Vehicle')
    || profile.keywords.includes('Titanic')
}

function pointNearCoverTerrain(point: Position): boolean {
  for (const rect of TERRAIN_RECTS) {
    if (!rect.grantsCover) continue
    const halfW = rect.width / 2 + COVER_PROXIMITY
    const halfD = rect.depth / 2 + COVER_PROXIMITY
    const local = rotatePoint(point.x, point.y, rect.x, rect.y, -(rect.rotation ?? 0))
    if (Math.abs(local.x - rect.x) <= halfW && Math.abs(local.y - rect.y) <= halfD) return true
  }
  for (const circle of TERRAIN_CIRCLES) {
    if (!circle.grantsCover) continue
    if (distance(point, { x: circle.x, y: circle.y }) <= circle.radius + COVER_PROXIMITY) return true
  }
  return false
}

export function targetHasCover(
  target: BattleUnit,
  weapon?: WeaponProfile,
  options?: { ignoresCover?: boolean; denyCover?: boolean },
): boolean {
  if (options?.denyCover) return false
  if (options?.ignoresCover || (weapon && weaponHasKeyword(weapon, 'Ignores Cover'))) return false

  const profile = getProfile(target)
  if (unitHasStealth(profile)) return true

  const models = target.models.length > 0 ? target.models : [{ position: target.position }]
  return models.some((model) => pointNearCoverTerrain(model.position))
}

function getTargetDefenseModifiers(
  state: BattleState,
  target: BattleUnit,
  phase: BattlePhase,
  attackType: 'ranged' | 'melee',
): CombatModifiers {
  const detachment = getDetachmentState(state, target.owner)
  const mods: CombatModifiers[] = []

  for (const effect of detachment.activeEffects) {
    if (effect.owner !== target.owner) continue
    if (state.turn > effect.expiresTurn) continue
    if (!effect.validPhases.includes(phase)) continue
    if (effect.scope === 'unit' && effect.unitId !== target.id) continue
    mods.push(effect.modifiers)
  }

  const profile = getProfile(target)
  const fnp = getUnitFeelNoPain(profile)
  if (fnp) mods.push({ feelNoPain: fnp })

  if (attackType === 'ranged') {
    const ion = getIonShieldSave(profile)
    if (ion) mods.push({ invulnerableSave: ion })
  }

  return mergeCombatModifiers(...mods)
}

function getAttackerUnitModifiers(_profile: UnitProfile): CombatModifiers {
  return {}
}

function getIndirectFireHitPenalty(
  state: BattleState,
  attacker: BattleUnit,
  hasLineOfSight: boolean,
  spotter?: BattleUnit,
): number {
  if (hasLineOfSight) return 0
  if (!spotter) return 99
  const detachment = getDetachmentState(state, attacker.owner)
  if (detachment.detachmentId === 'guard-and-storm') return 0
  return 1
}

export function getWeaponAttackCount(
  weapon: WeaponProfile,
  attacker: BattleUnit,
  target: BattleUnit,
  distanceInches: number,
): number {
  let attacks = weapon.attacks

  if (weaponHasKeyword(weapon, 'Blast') && target.modelsRemaining >= 6) {
    attacks += Math.floor(target.modelsRemaining / 5)
  }

  if (weaponHasKeyword(weapon, 'Rapid Fire') && distanceInches <= weapon.range / 2) {
    attacks *= 2
  }

  return attacks * attacker.modelsRemaining
}

export function buildShootingModifiers(
  state: BattleState,
  attacker: BattleUnit,
  target: BattleUnit,
  weapon: WeaponProfile,
  distanceInches: number,
  hasLineOfSight: boolean,
  spotter?: BattleUnit,
): CombatModifiers {
  const attackerProfile = getProfile(attacker)
  const targetDefense = getTargetDefenseModifiers(state, target, 'shooting', 'ranged')
  const base = getCombatModifiers(state, attacker, 'shooting', 'ranged', target)
  const attackerUnit = getAttackerUnitModifiers(attackerProfile)

  const weaponMods: CombatModifiers = {}
  if (weaponHasKeyword(weapon, 'Twin-linked')) weaponMods.rerollWounds = true
  if (weaponHasKeyword(weapon, 'Torrent')) weaponMods.autoHit = true
  if (weaponHasKeyword(weapon, 'Ignores Cover')) weaponMods.ignoresCover = true
  if (weaponHasKeyword(weapon, 'Melta') && distanceInches <= weapon.range / 2) {
    weaponMods.woundBonus = (weaponMods.woundBonus ?? 0) + 1
  }

  const indirectPenalty = getIndirectFireHitPenalty(state, attacker, hasLineOfSight, spotter)
  if (indirectPenalty > 0 && indirectPenalty < 99) {
    weaponMods.rangedHitPenalty = indirectPenalty
  }

  const cover = targetHasCover(target, weapon, {
    ignoresCover: weaponMods.ignoresCover,
    denyCover: targetDefense.denyCover,
  })

  const merged = mergeCombatModifiers(base, attackerUnit, targetDefense, weaponMods)
  if (cover) merged.cover = true
  return merged
}

export function buildMeleeModifiers(
  state: BattleState,
  attacker: BattleUnit,
  target: BattleUnit,
): CombatModifiers {
  const attackerProfile = getProfile(attacker)
  const base = getCombatModifiers(state, attacker, 'fight', 'melee', target)
  const attackerUnit = getAttackerUnitModifiers(attackerProfile)
  const targetDefense = getTargetDefenseModifiers(state, target, 'fight', 'melee')
  return mergeCombatModifiers(base, attackerUnit, targetDefense)
}

function isEngagedWithEnemy(state: BattleState, unit: BattleUnit): boolean {
  if (unit.isEngaged) return true
  return getUnitsForPlayer(state, unit.owner === 'player' ? 'ai' : 'player').some((enemy) => {
    if (enemy.inReserves || enemy.modelsRemaining <= 0) return false
    return closestModelDistance(unit, enemy) <= 1
  })
}

export function evaluateShootLegality(
  state: BattleState,
  attacker: BattleUnit,
  target: BattleUnit,
  weapon: WeaponProfile,
  weaponIndex: number,
): ShootLegality {
  if (attacker.inReserves || target.inReserves) {
    return { valid: false, reason: 'Unit is in reserves', weaponIndex, hasLineOfSight: false, usesIndirectFire: false }
  }

  const dist = closestModelDistance(attacker, target)
  const engaged = isEngagedWithEnemy(state, attacker)
  const isPistol = weaponHasKeyword(weapon, 'Pistol')

  if (engaged) {
    if (!isPistol) {
      return { valid: false, reason: 'Only Pistol weapons can fire while engaged', weaponIndex, hasLineOfSight: false, usesIndirectFire: false }
    }
    if (dist > weapon.range || dist > 1) {
      return { valid: false, reason: 'Pistol targets must be within 1"', weaponIndex, hasLineOfSight: false, usesIndirectFire: false }
    }
  } else if (dist <= 1 || dist > weapon.range) {
    return { valid: false, reason: dist <= 1 ? 'Target too close (use Pistols if engaged)' : 'Out of range', weaponIndex, hasLineOfSight: false, usesIndirectFire: false }
  }

  const hasLoS = unitsHaveLineOfSight(attacker, target)
  if (hasLoS) {
    return { valid: true, weaponIndex, hasLineOfSight: true, usesIndirectFire: false }
  }

  if (!weaponHasKeyword(weapon, 'Indirect Fire')) {
    return { valid: false, reason: 'No line of sight', weaponIndex, hasLineOfSight: false, usesIndirectFire: false }
  }

  const spotter = findIndirectFireSpotter(state, attacker, target)
  if (!spotter) {
    return { valid: false, reason: 'No spotter with line of sight', weaponIndex, hasLineOfSight: false, usesIndirectFire: true }
  }

  return {
    valid: true,
    weaponIndex,
    hasLineOfSight: false,
    usesIndirectFire: true,
    spotterUnitId: spotter.id,
  }
}

export function getValidWeaponIndices(profile: UnitProfile): number[] {
  return profile.weapons
    .map((weapon, index) => (weapon.type === 'ranged' ? index : -1))
    .filter((index) => index >= 0)
}

export function findBestShootLegality(
  state: BattleState,
  attacker: BattleUnit,
  target: BattleUnit,
): ShootLegality | null {
  const profile = getProfile(attacker)
  let best: ShootLegality | null = null

  for (const weaponIndex of getValidWeaponIndices(profile)) {
    const weapon = profile.weapons[weaponIndex]
    const legality = evaluateShootLegality(state, attacker, target, weapon, weaponIndex)
    if (!legality.valid) continue
    if (!best) {
      best = legality
      continue
    }
    const bestWeapon = profile.weapons[best.weaponIndex]
    if (weapon.strength > bestWeapon.strength || weapon.attacks > bestWeapon.attacks) {
      best = legality
    }
  }

  return best
}

export function describeShootLegality(state: BattleState, attacker: BattleUnit, target: BattleUnit): string {
  const legality = findBestShootLegality(state, attacker, target)
  if (!legality) return getProfile(target).name

  const parts = [getProfile(target).name]
  if (legality.usesIndirectFire) parts.push('indirect')
  const profile = getProfile(attacker)
  const weapon = profile.weapons[legality.weaponIndex]
  if (targetHasCover(target, weapon)) parts.push('in cover')
  return parts.join(' · ')
}

const DEADLY_DEMISE_RADIUS = 3

export function applyDeadlyDemise(
  state: BattleState,
  destroyed: BattleUnit,
): { state: BattleState; message?: string } {
  const profile = getProfile(destroyed)
  if (!unitHasDeadlyDemise(profile)) return { state }

  const mortalRoll = rollDice(1)[0]
  const mortals = Math.min(3, Math.max(1, mortalRoll))
  const victims: string[] = []

  let newState = state
  for (const unit of [...state.playerUnits, ...state.aiUnits]) {
    if (unit.id === destroyed.id || unit.modelsRemaining <= 0) continue
    const dist = distance(destroyed.position, unit.position)
    if (dist > DEADLY_DEMISE_RADIUS) continue

    const unitProfile = getProfile(unit)
    const fnp = getUnitFeelNoPain(unitProfile)
    const { unsaved, steps } = resolveMortalWounds(mortals, fnp)
    if (unsaved <= 0) continue

    let remaining = unit.currentWounds - unsaved
    let modelsLost = 0
    while (remaining <= 0 && modelsLost < unit.modelsRemaining) {
      modelsLost++
      remaining += unitProfile.wounds
    }
    if (modelsLost === 0) continue

    const newModels = Math.max(0, unit.modelsRemaining - modelsLost)
    const newWounds = newModels > 0 ? Math.max(1, remaining) : 0
    const trimmedModels = trimModelsToCount(unit.models, newModels)
    victims.push(`${getProfile(unit).name} (${formatMortalSteps(steps)})`)

    const updateList = (units: BattleUnit[]) =>
      units.map((entry) => (entry.id === unit.id
        ? {
            ...entry,
            currentWounds: newWounds,
            modelsRemaining: newModels,
            models: trimmedModels,
            position: getUnitCentroid(trimmedModels),
          }
        : entry))

    newState = {
      ...newState,
      playerUnits: updateList(newState.playerUnits),
      aiUnits: updateList(newState.aiUnits),
    }
  }

  if (victims.length === 0) {
    return {
      state: newState,
      message: `${profile.name} exploded (Deadly Demise D6=[${mortalRoll}] → D${mortals}) but nothing nearby was harmed.`,
    }
  }

  return {
    state: newState,
    message: `${profile.name} exploded — Deadly Demise D6=[${mortalRoll}] → D${mortals} mortals: ${victims.join('; ')}.`,
  }
}

export function sortUnitsByFightPriority(units: BattleUnit[]): BattleUnit[] {
  return [...units].sort((a, b) => {
    const aFirst = unitFightsFirst(getProfile(a)) ? 0 : 1
    const bFirst = unitFightsFirst(getProfile(b)) ? 0 : 1
    return aFirst - bFirst
  })
}
