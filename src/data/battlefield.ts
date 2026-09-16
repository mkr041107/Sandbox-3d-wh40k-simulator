/** Standard WH40k Strike Force board dimensions (inches). */
export const BATTLEFIELD_WIDTH = 60
export const BATTLEFIELD_HEIGHT = 44

/** Depth of each deployment zone band (inches). */
export const DEPLOY_ZONE_DEPTH = 9

/** Shrink miniatures slightly so large armies remain readable on the mat. */
export const MINIATURE_VISUAL_SCALE = 0.72

/** Convert mm base size to miniature mesh scale (1 grid square = 1"). */
export function getMiniatureScale(baseSize: number): number {
  return (baseSize / 32) * MINIATURE_VISUAL_SCALE
}
