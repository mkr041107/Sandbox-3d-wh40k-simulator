/** Gameplay terrain aligned with `BattlefieldTerrain.tsx` (board x = 3D x, board y = 3D z). */

export interface TerrainRect {
  id: string
  x: number
  y: number
  width: number
  depth: number
  rotation?: number
  blocksLineOfSight: boolean
  grantsCover: boolean
}

export interface TerrainCircle {
  id: string
  x: number
  y: number
  radius: number
  blocksLineOfSight: boolean
  grantsCover: boolean
}

/** Axis-aligned or rotated footprint obstacles on the 60×44" mat. */
export const TERRAIN_RECTS: TerrainRect[] = [
  { id: 'ruin-left-1', x: 12, y: 20, width: 1.2, depth: 5, blocksLineOfSight: true, grantsCover: true },
  { id: 'ruin-left-2', x: 14.5, y: 22, width: 0.8, depth: 3.5, rotation: 0.3, blocksLineOfSight: true, grantsCover: true },
  { id: 'ruin-left-3', x: 10, y: 23, width: 2, depth: 0.4, rotation: -0.2, blocksLineOfSight: true, grantsCover: true },
  { id: 'ruin-center-1', x: 22, y: 26, width: 4, depth: 1, blocksLineOfSight: true, grantsCover: true },
  { id: 'ruin-center-2', x: 24, y: 28, width: 1, depth: 3, rotation: Math.PI / 4, blocksLineOfSight: true, grantsCover: true },
  { id: 'ruin-center-3', x: 40, y: 20, width: 3, depth: 1.2, rotation: -0.4, blocksLineOfSight: true, grantsCover: true },
  { id: 'barricade-1', x: 15, y: 35, width: 6, depth: 0.5, blocksLineOfSight: false, grantsCover: true },
  { id: 'barricade-2', x: 22, y: 35.5, width: 4, depth: 0.5, rotation: 0.15, blocksLineOfSight: false, grantsCover: true },
]

export const TERRAIN_CIRCLES: TerrainCircle[] = [
  { id: 'rock-promontory', x: 40, y: 18, radius: 3.5, blocksLineOfSight: true, grantsCover: true },
  { id: 'barrels-mid', x: 35, y: 14, radius: 0.9, blocksLineOfSight: false, grantsCover: true },
  { id: 'barrels-rear', x: 8, y: 30, radius: 0.9, blocksLineOfSight: false, grantsCover: true },
]

/** How close a model must be to terrain to claim Benefit of Cover. */
export const COVER_PROXIMITY = 1.5
