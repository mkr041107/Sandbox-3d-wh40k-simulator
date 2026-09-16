import { v4 as uuidv4 } from 'uuid'
import type { BattleModel, BattleUnit, Position, UnitProfile } from '../types/game'
import { getBattleUnitProfile } from '../data/battleProfile'
import { distance } from './battleQueries'

/** WH40k coherency — each model must be within this many inches of another model in the unit. */
export const COHERENCY_DISTANCE = 2

/** Convert mm base size to radius in inches (1 grid square = 1"). */
export function baseRadiusInches(baseSizeMm: number): number {
  return baseSizeMm / 50.8
}

export function minCenterDistance(baseSizeA: number, baseSizeB: number): number {
  return baseRadiusInches(baseSizeA) + baseRadiusInches(baseSizeB)
}

export function modelSpacingInches(baseSize: number): number {
  return minCenterDistance(baseSize, baseSize) + 0.05
}

export function squadMarkerFromId(unitId: string): number {
  return (parseInt(unitId.replace(/-/g, '').slice(0, 8), 16) % 98) + 1
}

export function squadTintFromId(unitId: string): number {
  return (parseInt(unitId.replace(/-/g, '').slice(8, 16), 16) % 360) / 360
}

export function shiftColorHue(hex: string, hueShift: number): string {
  const normalized = hex.replace('#', '')
  if (normalized.length !== 6) return hex

  const r = parseInt(normalized.slice(0, 2), 16) / 255
  const g = parseInt(normalized.slice(2, 4), 16) / 255
  const b = parseInt(normalized.slice(4, 6), 16) / 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const delta = max - min
  let h = 0
  if (delta > 0) {
    if (max === r) h = ((g - b) / delta) % 6
    else if (max === g) h = (b - r) / delta + 2
    else h = (r - g) / delta + 4
    h *= 60
    if (h < 0) h += 360
  }
  const l = (max + min) / 2
  const s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1))

  const newHue = (h + hueShift * 360) % 360
  const c = (1 - Math.abs(2 * l - 1)) * s
  const x = c * (1 - Math.abs(((newHue / 60) % 2) - 1))
  const m = l - c / 2

  let r1 = 0
  let g1 = 0
  let b1 = 0
  if (newHue < 60) [r1, g1, b1] = [c, x, 0]
  else if (newHue < 120) [r1, g1, b1] = [x, c, 0]
  else if (newHue < 180) [r1, g1, b1] = [0, c, x]
  else if (newHue < 240) [r1, g1, b1] = [0, x, c]
  else if (newHue < 300) [r1, g1, b1] = [x, 0, c]
  else [r1, g1, b1] = [c, 0, x]

  const toHex = (value: number) => Math.round((value + m) * 255).toString(16).padStart(2, '0')
  return `#${toHex(r1)}${toHex(g1)}${toHex(b1)}`
}

export function buildFormation(
  count: number,
  anchor: Position,
  baseSize: number,
  rotation = 0,
): BattleModel[] {
  if (count <= 0) return []

  const spacing = modelSpacingInches(baseSize)
  const models: BattleModel[] = []

  if (count === 1) {
    models.push({
      id: uuidv4(),
      index: 1,
      position: { ...anchor },
      hasMoved: false,
    })
    return models
  }

  const cols = Math.ceil(Math.sqrt(count))
  const rows = Math.ceil(count / cols)
  const startX = anchor.x - ((cols - 1) * spacing) / 2
  const startY = anchor.y - ((rows - 1) * spacing) / 2
  const cos = Math.cos(rotation)
  const sin = Math.sin(rotation)

  for (let i = 0; i < count; i++) {
    const col = i % cols
    const row = Math.floor(i / cols)
    const localX = startX + col * spacing - anchor.x
    const localY = startY + row * spacing - anchor.y
    models.push({
      id: uuidv4(),
      index: i + 1,
      position: {
        x: anchor.x + localX * cos - localY * sin,
        y: anchor.y + localX * sin + localY * cos,
      },
      hasMoved: false,
    })
  }

  return models
}

export function getUnitCentroid(models: BattleModel[]): Position {
  if (models.length === 0) return { x: 0, y: 0 }
  const sum = models.reduce(
    (acc, model) => ({ x: acc.x + model.position.x, y: acc.y + model.position.y }),
    { x: 0, y: 0 },
  )
  return { x: sum.x / models.length, y: sum.y / models.length }
}

export function syncUnitPosition(unit: BattleUnit): BattleUnit {
  if (unit.models.length === 0) return unit
  return { ...unit, position: getUnitCentroid(unit.models) }
}

export function isUnitCoherent(models: BattleModel[], baseSize: number): boolean {
  if (models.length <= 1) return true

  const maxGap = COHERENCY_DISTANCE + modelSpacingInches(baseSize) * 0.15
  for (const model of models) {
    const hasNeighbor = models.some((other) => {
      if (other.id === model.id) return false
      return distance(model.position, other.position) <= maxGap
    })
    if (!hasNeighbor) return false
  }
  return true
}

export function translateFormation(models: BattleModel[], delta: Position): BattleModel[] {
  return models.map((model) => ({
    ...model,
    position: { x: model.position.x + delta.x, y: model.position.y + delta.y },
  }))
}

export function trimModelsToCount(models: BattleModel[], count: number): BattleModel[] {
  return models.slice(0, Math.max(0, count))
}

export function resetModelActions(models: BattleModel[]): BattleModel[] {
  return models.map((model) => ({ ...model, hasMoved: false }))
}

export function getModelById(unit: BattleUnit, modelId: string): BattleModel | undefined {
  return unit.models.find((model) => model.id === modelId)
}

export function modelsOverlap(
  a: Position,
  b: Position,
  baseSizeA: number,
  baseSizeB: number,
): boolean {
  return distance(a, b) < minCenterDistance(baseSizeA, baseSizeB)
}

export function formationHasInternalOverlaps(proposed: BattleModel[], baseSize: number): boolean {
  for (let i = 0; i < proposed.length; i++) {
    for (let j = i + 1; j < proposed.length; j++) {
      if (modelsOverlap(proposed[i].position, proposed[j].position, baseSize, baseSize)) {
        return true
      }
    }
  }
  return false
}

export function formationFitsSpacing(
  proposed: BattleModel[],
  profile: UnitProfile,
  others: BattleUnit[],
  excludeUnitId?: string,
): boolean {
  if (formationHasInternalOverlaps(proposed, profile.baseSize)) return false

  for (const other of others) {
    if (other.inReserves) continue
    if (other.id === excludeUnitId) continue
    const otherProfile = getBattleUnitProfile(other)
    for (const mine of proposed) {
      for (const theirs of other.models) {
        if (modelsOverlap(mine.position, theirs.position, profile.baseSize, otherProfile.baseSize)) {
          return false
        }
      }
    }
  }
  return true
}

export function getAllDeployedUnits(state: { playerUnits: BattleUnit[]; aiUnits: BattleUnit[] }): BattleUnit[] {
  return [...state.playerUnits, ...state.aiUnits].filter((unit) => !unit.inReserves)
}

export function getCoherencyPairs(models: BattleModel[], baseSize: number): [BattleModel, BattleModel][] {
  const maxGap = COHERENCY_DISTANCE + modelSpacingInches(baseSize) * 0.15
  const pairs: [BattleModel, BattleModel][] = []
  for (let i = 0; i < models.length; i++) {
    for (let j = i + 1; j < models.length; j++) {
      if (distance(models[i].position, models[j].position) <= maxGap) {
        pairs.push([models[i], models[j]])
      }
    }
  }
  return pairs
}
