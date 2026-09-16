import { useMemo } from 'react'
import { Line, Text } from '@react-three/drei'
import type { Position } from '../../types/game'
import { distance } from '../../engine/battle'

interface BattlefieldRulerProps {
  start: Position | null
  end: Position | null
  hover: Position | null
}

function to3d(point: Position, y = 0.12): [number, number, number] {
  return [point.x, y, point.y]
}

export function measureDistance(a: Position, b: Position): number {
  return distance(a, b)
}

export function BattlefieldRuler({ start, end, hover }: BattlefieldRulerProps) {
  const activeEnd = end ?? hover

  const dist = useMemo(() => {
    if (!start || !activeEnd) return null
    return measureDistance(start, activeEnd)
  }, [start, activeEnd])

  if (!start) return null

  const start3 = to3d(start)
  const end3 = activeEnd ? to3d(activeEnd) : start3
  const mid3: [number, number, number] = [
    (start3[0] + end3[0]) / 2,
    0.35,
    (start3[2] + end3[2]) / 2,
  ]

  const lineColor = end ? '#66ddff' : '#ffcc44'
  const label = dist !== null ? `${dist.toFixed(1)}"` : ''

  return (
    <group>
      <Line
        points={[start3, end3]}
        color={lineColor}
        lineWidth={2.5}
        transparent
        opacity={end ? 0.95 : 0.7}
        dashed={!end}
        dashSize={0.6}
        gapSize={0.35}
      />

      <mesh position={start3}>
        <sphereGeometry args={[0.12, 10, 10]} />
        <meshBasicMaterial color="#66ddff" />
      </mesh>
      <mesh position={start3} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.18, 0.28, 24]} />
        <meshBasicMaterial color="#66ddff" transparent opacity={0.85} />
      </mesh>

      {activeEnd && (
        <>
          <mesh position={end3}>
            <sphereGeometry args={[0.1, 10, 10]} />
            <meshBasicMaterial color={end ? '#66ddff' : '#ffcc44'} />
          </mesh>
          <mesh position={end3} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.16, 0.24, 24]} />
            <meshBasicMaterial color={end ? '#66ddff' : '#ffcc44'} transparent opacity={0.8} />
          </mesh>
        </>
      )}

      {label && (
        <Text
          position={mid3}
          fontSize={0.45}
          color={end ? '#ffffff' : '#ffdd88'}
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.03}
          outlineColor="#000000"
        >
          {label}
        </Text>
      )}
    </group>
  )
}
