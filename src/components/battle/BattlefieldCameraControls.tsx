import { useEffect } from 'react'
import { useThree } from '@react-three/fiber'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'

export type CameraPreset = 'table' | 'tactical' | 'cinematic'

interface BattlefieldCameraControlsProps {
  preset: CameraPreset
  target: [number, number, number]
  controlsRef: React.RefObject<OrbitControlsImpl | null>
}

export function BattlefieldCameraControls({ preset, target, controlsRef }: BattlefieldCameraControlsProps) {
  const { camera } = useThree()
  const [tx, ty, tz] = target

  useEffect(() => {
    const controls = controlsRef.current
    if (!controls) return

    controls.target.set(tx, ty, tz)

    if (preset === 'tactical') {
      camera.position.set(tx, 55, tz)
      controls.minPolarAngle = 0
      controls.maxPolarAngle = 0.15
    } else if (preset === 'cinematic') {
      camera.position.set(tx - 25, 28, tz + 35)
      controls.minPolarAngle = 0.2
      controls.maxPolarAngle = Math.PI / 2.2
    } else {
      camera.position.set(tx, 35, tz + 25)
      controls.minPolarAngle = 0.1
      controls.maxPolarAngle = Math.PI / 2.5
    }

    controls.update()
  }, [preset, tx, ty, tz, camera, controlsRef])

  return null
}
