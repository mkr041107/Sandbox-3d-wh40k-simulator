import { useMemo, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Line, Text } from '@react-three/drei'
import type { ShotVisualPayload, ShotVfxKind } from '../../../engine/combatVfx'
import { ImpactBurst } from './ImpactBurst'

interface ShotVisualProps {
  event: ShotVisualPayload
  onComplete: () => void
}

const DURATION: Record<ShotVfxKind, number> = {
  bolt: 0.55,
  beam: 0.45,
  missile: 0.85,
  artillery: 1.05,
  flamer: 0.65,
}

const IMPACT_AT: Record<ShotVfxKind, number> = {
  bolt: 0.55,
  beam: 0.12,
  missile: 0.72,
  artillery: 0.78,
  flamer: 0.45,
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t
}

function easeOutCubic(t: number): number {
  return 1 - (1 - t) ** 3
}

function projectileHeight(kind: ShotVfxKind, t: number, dist: number): number {
  if (kind === 'artillery') {
    const arc = Math.sin(t * Math.PI)
    return 0.8 + arc * Math.min(12, 4 + dist * 0.15)
  }
  if (kind === 'missile') return lerp(0.9, 0.7, t) + Math.sin(t * Math.PI) * 1.2
  return 0.75 + Math.sin(t * Math.PI) * 0.15
}

function kindColor(kind: ShotVfxKind): string {
  switch (kind) {
    case 'beam': return '#66ccff'
    case 'missile': return '#ffaa44'
    case 'artillery': return '#ff8844'
    case 'flamer': return '#ff6622'
    default: return '#ffdd66'
  }
}

export function ShotVisual({ event, onComplete }: ShotVisualProps) {
  const elapsed = useRef(0)
  const completed = useRef(false)
  const [progress, setProgress] = useState(0)
  const duration = DURATION[event.kind]
  const impactAt = IMPACT_AT[event.kind]
  const color = kindColor(event.kind)

  const from3 = useMemo(
    () => [event.from.x, 0.75, event.from.y] as [number, number, number],
    [event.from.x, event.from.y],
  )
  const to3 = useMemo(
    () => [event.to.x, 0.55, event.to.y] as [number, number, number],
    [event.to.x, event.to.y],
  )
  const dist = useMemo(
    () => Math.hypot(event.to.x - event.from.x, event.to.y - event.from.y),
    [event.from.x, event.from.y, event.to.x, event.to.y],
  )

  useFrame((_, delta) => {
    if (completed.current) return
    elapsed.current += delta
    const next = Math.min(1, elapsed.current / duration)
    setProgress(next)
    if (next >= 1) {
      completed.current = true
      onComplete()
    }
  })

  const travelT = easeOutCubic(Math.min(1, progress / impactAt))
  const projX = lerp(from3[0], to3[0], travelT)
  const projY = projectileHeight(event.kind, travelT, dist)
  const projZ = lerp(from3[2], to3[2], travelT)
  const impactProgress = progress > impactAt ? (progress - impactAt) / (1 - impactAt) : 0
  const showProjectile = progress < impactAt && event.kind !== 'beam' && event.kind !== 'flamer'

  return (
    <group>
      {event.kind === 'beam' && progress < 0.4 && (
        <Line
          points={[from3, to3]}
          color={color}
          lineWidth={3}
          transparent
          opacity={1 - progress / 0.4}
        />
      )}

      {event.kind === 'flamer' && progress < impactAt + 0.25 && (
        <>
          <Line points={[from3, to3]} color="#ff6622" lineWidth={4} transparent opacity={0.55} />
          <Line
            points={[
              [lerp(from3[0], to3[0], 0.45), 0.55, lerp(from3[2], to3[2], 0.45)],
              [to3[0] + 0.5, 0.45, to3[2] + 0.2],
              to3,
              [to3[0] - 0.5, 0.45, to3[2] - 0.2],
              [lerp(from3[0], to3[0], 0.45), 0.55, lerp(from3[2], to3[2], 0.45)],
            ]}
            color="#ff9933"
            lineWidth={2}
            transparent
            opacity={0.4}
          />
        </>
      )}

      {showProjectile && (
        <group position={[projX, projY, projZ]}>
          {event.kind === 'missile' && (
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <coneGeometry args={[0.12, 0.45, 8]} />
              <meshBasicMaterial color={color} />
            </mesh>
          )}
          {event.kind === 'artillery' && (
            <mesh>
              <sphereGeometry args={[0.18, 10, 10]} />
              <meshBasicMaterial color={color} />
            </mesh>
          )}
          {event.kind === 'bolt' && (
            <>
              <mesh>
                <sphereGeometry args={[0.08, 8, 8]} />
                <meshBasicMaterial color={color} />
              </mesh>
              <Line points={[[projX, projY, projZ], from3]} color={color} lineWidth={2} transparent opacity={0.5} />
            </>
          )}
        </group>
      )}

      {progress < 0.12 && event.kind !== 'artillery' && (
        <mesh position={from3}>
          <sphereGeometry args={[0.14, 8, 8]} />
          <meshBasicMaterial color="#ffffaa" transparent opacity={0.85 * (1 - progress / 0.12)} />
        </mesh>
      )}

      {event.indirect && event.kind === 'artillery' && progress < impactAt && (
        <Text
          position={[event.to.x, 2.4, event.to.y]}
          fontSize={0.35}
          color="#ffaa44"
          anchorX="center"
          fillOpacity={1 - progress / impactAt}
        >
          INCOMING
        </Text>
      )}

      <ImpactBurst
        x={event.to.x}
        z={event.to.y}
        wounds={event.wounds}
        modelsLost={event.modelsLost}
        heavy={event.kind === 'artillery' || event.kind === 'missile'}
        progress={impactProgress}
      />
    </group>
  )
}
