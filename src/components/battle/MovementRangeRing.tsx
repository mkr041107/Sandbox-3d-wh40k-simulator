import { useMemo } from 'react'
import * as THREE from 'three'

interface MovementRangeRingProps {
  x: number
  z: number
  radius: number
  color?: string
}

export function MovementRangeRing({ x, z, radius, color = '#00ff88' }: MovementRangeRingProps) {
  const geometry = useMemo(() => {
    const shape = new THREE.Shape()
    shape.absarc(0, 0, radius, 0, Math.PI * 2, false)
    const hole = new THREE.Path()
    hole.absarc(0, 0, radius - 0.15, 0, Math.PI * 2, true)
    shape.holes.push(hole)
    return new THREE.ShapeGeometry(shape)
  }, [radius])

  return (
    <mesh position={[x, 0.04, z]} rotation={[-Math.PI / 2, 0, 0]} geometry={geometry}>
      <meshBasicMaterial color={color} transparent opacity={0.22} side={THREE.DoubleSide} />
    </mesh>
  )
}
