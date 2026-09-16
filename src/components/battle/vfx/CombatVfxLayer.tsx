import type { ShotVisualPayload } from '../../../engine/combatVfx'
import { ShotVisual } from './ShotVisual'

export interface ActiveShotVfx extends ShotVisualPayload {
  id: string
}

interface CombatVfxLayerProps {
  shots: ActiveShotVfx[]
  onShotComplete: (id: string) => void
}

export function CombatVfxLayer({ shots, onShotComplete }: CombatVfxLayerProps) {
  return (
    <>
      {shots.map((shot) => (
        <ShotVisual key={shot.id} event={shot} onComplete={() => onShotComplete(shot.id)} />
      ))}
    </>
  )
}
