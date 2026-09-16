import { useMemo } from 'react'
import * as THREE from 'three'

interface RuinProps {
  position: [number, number, number]
  size: [number, number, number]
  rotation?: number
}

function RuinWall({ position, size, rotation = 0 }: RuinProps) {
  const color = useMemo(() => new THREE.Color('#3d3830'), [])
  return (
    <mesh position={position} rotation={[0, rotation, 0]} castShadow receiveShadow>
      <boxGeometry args={size} />
      <meshStandardMaterial color={color} roughness={0.95} metalness={0.05} />
    </mesh>
  )
}

function Crater({ position, radius }: { position: [number, number, number]; radius: number }) {
  return (
    <mesh position={position} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <ringGeometry args={[radius * 0.3, radius, 16]} />
      <meshStandardMaterial color="#1f1a15" roughness={1} />
    </mesh>
  )
}

function BarrelPile({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh castShadow position={[0, 0.25, 0]}>
        <cylinderGeometry args={[0.2, 0.22, 0.5, 10]} />
        <meshStandardMaterial color="#4a3a2a" roughness={0.85} />
      </mesh>
      <mesh castShadow position={[0.25, 0.15, 0.15]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.18, 0.2, 0.45, 10]} />
        <meshStandardMaterial color="#3a2a1a" roughness={0.9} />
      </mesh>
    </group>
  )
}

/** Industrial ruins + scatter — inspired by GRIMSWARM terrain layering. */
export function BattlefieldTerrain({ width, height }: { width: number; height: number }) {
  const cx = width / 2
  const cz = height / 2

  return (
    <group>
      {/* Ruined hab-block — left flank */}
      <RuinWall position={[12, 1.2, 20]} size={[1.2, 2.4, 5]} />
      <RuinWall position={[14.5, 0.8, 22]} size={[0.8, 1.6, 3.5]} rotation={0.3} />
      <RuinWall position={[10, 0.5, 23]} size={[2, 1, 0.4]} rotation={-0.2} />

      {/* Central ruin cluster */}
      <RuinWall position={[cx - 8, 1, cz + 4]} size={[4, 2, 1]} />
      <RuinWall position={[cx - 6, 0.6, cz + 6]} size={[1, 1.2, 3]} rotation={Math.PI / 4} />
      <RuinWall position={[cx + 10, 0.9, cz - 2]} size={[3, 1.8, 1.2]} rotation={-0.4} />

      {/* Rock / promontory */}
      <mesh position={[40, 0.5, 18]} castShadow receiveShadow>
        <cylinderGeometry args={[2.8, 3.5, 1, 10]} />
        <meshStandardMaterial color="#4a4a3a" roughness={0.92} />
      </mesh>
      <mesh position={[40, 1.2, 18]} castShadow>
        <dodecahedronGeometry args={[1.2, 0]} />
        <meshStandardMaterial color="#5a5a48" roughness={0.9} />
      </mesh>

      {/* Barricade line */}
      <RuinWall position={[15, 0.35, 35]} size={[6, 0.7, 0.5]} />
      <RuinWall position={[22, 0.35, 35.5]} size={[4, 0.7, 0.5]} rotation={0.15} />

      {/* Scatter */}
      <BarrelPile position={[cx + 5, 0, cz - 8]} />
      <BarrelPile position={[8, 0, height - 14]} />
      <Crater position={[cx + 14, 0.02, cz + 10]} radius={1.8} />
      <Crater position={[20, 0.02, height - 18]} radius={1.2} />

      {/* Second objective marker — minor */}
      <mesh position={[cx - 18, 0.2, cz - 12]}>
        <cylinderGeometry args={[1, 1, 0.4, 6]} />
        <meshStandardMaterial color="#8b7355" metalness={0.5} roughness={0.5} emissive="#4a3a2a" emissiveIntensity={0.1} />
      </mesh>
    </group>
  )
}
