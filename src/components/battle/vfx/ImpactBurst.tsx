import { Text } from '@react-three/drei'

interface ImpactBurstProps {
  x: number
  z: number
  wounds: number
  modelsLost: number
  heavy?: boolean
  progress: number
}

export function ImpactBurst({ x, z, wounds, modelsLost, heavy = false, progress }: ImpactBurstProps) {
  const hit = wounds > 0
  const scale = heavy ? 1.4 : 1
  const burst = Math.min(1, progress / 0.35)
  const fade = progress > 0.5 ? 1 - (progress - 0.5) / 0.5 : 1
  const ringRadius = (0.4 + burst * 1.6) * scale

  if (progress <= 0) return null

  const label = hit
    ? modelsLost > 0
      ? `${wounds}W · ${modelsLost} killed`
      : `${wounds} wound${wounds === 1 ? '' : 's'}`
    : 'MISS'

  return (
    <group position={[x, 0.5, z]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[ringRadius * 0.55, ringRadius, 24]} />
        <meshBasicMaterial
          color={hit ? (heavy ? '#ffaa22' : '#ff5533') : '#8899aa'}
          transparent
          opacity={0.75 * fade}
        />
      </mesh>
      <mesh>
        <sphereGeometry args={[0.25 + burst * 0.55 * scale, 12, 12]} />
        <meshBasicMaterial
          color={hit ? '#ffcc44' : '#cccccc'}
          transparent
          opacity={0.55 * fade}
        />
      </mesh>
      <pointLight
        color={hit ? '#ff8844' : '#aaaaaa'}
        intensity={4 * fade * burst}
        distance={8}
      />
      <Text
        position={[0, 1.1 + burst * 0.4, 0]}
        fontSize={0.42}
        color={hit ? '#ff6644' : '#99aabb'}
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.025}
        outlineColor="#000000"
        fillOpacity={fade}
      >
        {label}
      </Text>
    </group>
  )
}
