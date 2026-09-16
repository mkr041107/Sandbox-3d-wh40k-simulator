import * as THREE from 'three'
import type { GreaterDaemonVariant } from './greaterDaemon'
import type { MiniatureSilhouette } from './miniatureSilhouette'

export const BASE_HEIGHT = 0.12

export function darken(hex: string, amount = 0.25): string {
  const c = new THREE.Color(hex)
  c.multiplyScalar(1 - amount)
  return `#${c.getHexString()}`
}

interface BodyProps {
  color: string
  accent: string
  scale: number
  hero?: boolean
}

export function MiniatureBase({ radius, rimColor, shape = 'round' }: { radius: number; rimColor: string; shape?: 'round' | 'oval' }) {
  if (shape === 'oval') {
    return (
      <group scale={[1.6, 1, 1.2]}>
        <mesh castShadow receiveShadow position={[0, BASE_HEIGHT / 2, 0]}>
          <cylinderGeometry args={[radius, radius * 1.04, BASE_HEIGHT, 24]} />
          <meshStandardMaterial color="#1a1a1a" metalness={0.25} roughness={0.9} />
        </mesh>
        <mesh position={[0, BASE_HEIGHT + 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[radius * 0.82, radius * 0.96, 24]} />
          <meshStandardMaterial color={rimColor} metalness={0.5} roughness={0.4} emissive={rimColor} emissiveIntensity={0.12} />
        </mesh>
      </group>
    )
  }
  return (
    <group>
      <mesh castShadow receiveShadow position={[0, BASE_HEIGHT / 2, 0]}>
        <cylinderGeometry args={[radius, radius * 1.05, BASE_HEIGHT, 24]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.2} roughness={0.85} />
      </mesh>
      <mesh position={[0, BASE_HEIGHT + 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[radius * 0.85, radius * 0.98, 24]} />
        <meshStandardMaterial color={rimColor} metalness={0.6} roughness={0.35} emissive={rimColor} emissiveIntensity={0.15} />
      </mesh>
    </group>
  )
}

/** Imperial Guard / Space Marine style upright soldier */
export function HumanoidBody({ color, accent, scale, hero }: BodyProps) {
  const s = scale * (hero ? 1.12 : 1)
  const y = BASE_HEIGHT
  return (
    <group scale={[s, s, s]}>
      <mesh castShadow position={[0, y + 0.24, 0]}>
        <boxGeometry args={[0.38, 0.48, 0.24]} />
        <meshStandardMaterial color={color} metalness={0.4} roughness={0.5} />
      </mesh>
      <mesh castShadow position={[0, y + 0.54, 0]}>
        <boxGeometry args={[0.22, 0.2, 0.22]} />
        <meshStandardMaterial color={darken(color, 0.1)} metalness={0.55} roughness={0.4} />
      </mesh>
      {hero && (
        <>
          <mesh castShadow position={[-0.24, y + 0.5, 0]}>
            <boxGeometry args={[0.14, 0.16, 0.2]} />
            <meshStandardMaterial color={accent} metalness={0.55} roughness={0.35} />
          </mesh>
          <mesh castShadow position={[0.24, y + 0.5, 0]}>
            <boxGeometry args={[0.14, 0.16, 0.2]} />
            <meshStandardMaterial color={accent} metalness={0.55} roughness={0.35} />
          </mesh>
          <mesh castShadow position={[0, y + 0.62, 0]}>
            <coneGeometry args={[0.06, 0.18, 4]} />
            <meshStandardMaterial color={accent} metalness={0.6} roughness={0.3} />
          </mesh>
        </>
      )}
      <mesh castShadow position={[0.3, y + 0.32, 0.14]} rotation={[0, 0, -0.25]}>
        <boxGeometry args={[0.5, 0.09, 0.09]} />
        <meshStandardMaterial color="#2a2a2a" metalness={0.65} roughness={0.3} />
      </mesh>
      <mesh castShadow position={[-0.1, y + 0.09, 0.04]}>
        <boxGeometry args={[0.15, 0.22, 0.17]} />
        <meshStandardMaterial color={darken(color, 0.2)} roughness={0.7} />
      </mesh>
      <mesh castShadow position={[0.1, y + 0.09, 0.04]}>
        <boxGeometry args={[0.15, 0.22, 0.17]} />
        <meshStandardMaterial color={darken(color, 0.2)} roughness={0.7} />
      </mesh>
    </group>
  )
}

/** Horns, hunch, warp glow — clearly not human */
export function DaemonBody({ color, accent, scale, hero }: BodyProps) {
  const s = scale * (hero ? 1.25 : 1.05)
  const y = BASE_HEIGHT
  const warp = accent || '#9b30ff'
  return (
    <group scale={[s, s, s]}>
      <mesh castShadow position={[0, y + 0.2, 0]} rotation={[0.25, 0, 0]}>
        <boxGeometry args={[0.42, 0.4, 0.28]} />
        <meshStandardMaterial color={color} emissive={warp} emissiveIntensity={0.25} roughness={0.6} />
      </mesh>
      <mesh castShadow position={[0, y + 0.48, 0.05]}>
        <sphereGeometry args={[0.16, 8, 8]} />
        <meshStandardMaterial color={darken(color, 0.3)} emissive={warp} emissiveIntensity={0.35} />
      </mesh>
      <mesh castShadow position={[-0.1, y + 0.58, 0.05]} rotation={[0, 0, 0.4]}>
        <coneGeometry args={[0.04, 0.22, 4]} />
        <meshStandardMaterial color="#1a001a" emissive={warp} emissiveIntensity={0.5} />
      </mesh>
      <mesh castShadow position={[0.1, y + 0.58, 0.05]} rotation={[0, 0, -0.4]}>
        <coneGeometry args={[0.04, 0.22, 4]} />
        <meshStandardMaterial color="#1a001a" emissive={warp} emissiveIntensity={0.5} />
      </mesh>
      {hero && (
        <>
          <mesh position={[-0.35, y + 0.45, -0.1]} rotation={[0.5, 0.3, 0.6]}>
            <boxGeometry args={[0.5, 0.06, 0.35]} />
            <meshStandardMaterial color={warp} transparent opacity={0.7} emissive={warp} emissiveIntensity={0.4} />
          </mesh>
          <mesh position={[0.35, y + 0.45, -0.1]} rotation={[0.5, -0.3, -0.6]}>
            <boxGeometry args={[0.5, 0.06, 0.35]} />
            <meshStandardMaterial color={warp} transparent opacity={0.7} emissive={warp} emissiveIntensity={0.4} />
          </mesh>
        </>
      )}
      <mesh castShadow position={[0.32, y + 0.28, 0.1]} rotation={[0.5, 0, -0.6]}>
        <boxGeometry args={[0.35, 0.1, 0.1]} />
        <meshStandardMaterial color="#2a1020" metalness={0.5} />
      </mesh>
      <mesh position={[0, y + 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.2, 0.35, 16]} />
        <meshBasicMaterial color={warp} transparent opacity={0.35} />
      </mesh>
    </group>
  )
}

export function TyranidBody({ color, accent, scale }: BodyProps) {
  const s = scale * 1.05
  const y = BASE_HEIGHT
  return (
    <group scale={[s, s, s]}>
      <mesh castShadow position={[0, y + 0.22, 0]} rotation={[0.2, 0, 0]}>
        <boxGeometry args={[0.4, 0.35, 0.5]} />
        <meshStandardMaterial color={color} roughness={0.85} />
      </mesh>
      <mesh castShadow position={[0, y + 0.48, 0.15]}>
        <coneGeometry args={[0.12, 0.35, 6]} />
        <meshStandardMaterial color={darken(color, 0.15)} roughness={0.8} />
      </mesh>
      <mesh castShadow position={[0.25, y + 0.35, -0.05]} rotation={[0, 0, -0.8]}>
        <coneGeometry args={[0.05, 0.3, 4]} />
        <meshStandardMaterial color={accent} roughness={0.7} />
      </mesh>
      <mesh castShadow position={[-0.25, y + 0.35, -0.05]} rotation={[0, 0, 0.8]}>
        <coneGeometry args={[0.05, 0.3, 4]} />
        <meshStandardMaterial color={accent} roughness={0.7} />
      </mesh>
      <mesh castShadow position={[0, y + 0.08, -0.25]}>
        <coneGeometry args={[0.06, 0.45, 4]} />
        <meshStandardMaterial color={darken(color, 0.25)} roughness={0.9} />
      </mesh>
      <mesh castShadow position={[-0.12, y + 0.1, 0.08]}>
        <boxGeometry args={[0.1, 0.18, 0.12]} />
        <meshStandardMaterial color={darken(color, 0.1)} roughness={0.85} />
      </mesh>
      <mesh castShadow position={[0.12, y + 0.1, 0.08]}>
        <boxGeometry args={[0.1, 0.18, 0.12]} />
        <meshStandardMaterial color={darken(color, 0.1)} roughness={0.85} />
      </mesh>
    </group>
  )
}

export function OrkBody({ color, accent, scale }: BodyProps) {
  const s = scale * 1.15
  const y = BASE_HEIGHT
  return (
    <group scale={[s, s, s]}>
      <mesh castShadow position={[0, y + 0.26, 0]}>
        <boxGeometry args={[0.55, 0.5, 0.35]} />
        <meshStandardMaterial color={color} roughness={0.75} />
      </mesh>
      <mesh castShadow position={[0, y + 0.55, 0.08]}>
        <boxGeometry args={[0.28, 0.22, 0.3]} />
        <meshStandardMaterial color={darken(color, 0.15)} roughness={0.8} />
      </mesh>
      <mesh castShadow position={[0, y + 0.52, 0.22]}>
        <boxGeometry args={[0.2, 0.08, 0.12]} />
        <meshStandardMaterial color={accent} roughness={0.7} />
      </mesh>
      <mesh castShadow position={[0.38, y + 0.3, 0.1]} rotation={[0, 0, -0.4]}>
        <boxGeometry args={[0.4, 0.14, 0.14]} />
        <meshStandardMaterial color="#3a2a1a" roughness={0.85} />
      </mesh>
      <mesh castShadow position={[-0.14, y + 0.08, 0.05]}>
        <boxGeometry args={[0.18, 0.2, 0.2]} />
        <meshStandardMaterial color={darken(color, 0.2)} />
      </mesh>
      <mesh castShadow position={[0.14, y + 0.08, 0.05]}>
        <boxGeometry args={[0.18, 0.2, 0.2]} />
        <meshStandardMaterial color={darken(color, 0.2)} />
      </mesh>
    </group>
  )
}

export function NecronBody({ color, scale }: BodyProps) {
  const s = scale * 1.02
  const y = BASE_HEIGHT
  const glow = '#00ff88'
  return (
    <group scale={[s, s, s]}>
      <mesh castShadow position={[0, y + 0.26, 0]}>
        <boxGeometry args={[0.32, 0.5, 0.18]} />
        <meshStandardMaterial color={color} metalness={0.85} roughness={0.25} />
      </mesh>
      <mesh castShadow position={[0, y + 0.56, 0]}>
        <boxGeometry args={[0.2, 0.18, 0.16]} />
        <meshStandardMaterial color={darken(color, 0.1)} metalness={0.9} roughness={0.2} />
      </mesh>
      <mesh position={[-0.06, y + 0.58, 0.09]}>
        <boxGeometry args={[0.04, 0.04, 0.02]} />
        <meshStandardMaterial color={glow} emissive={glow} emissiveIntensity={1.2} />
      </mesh>
      <mesh position={[0.06, y + 0.58, 0.09]}>
        <boxGeometry args={[0.04, 0.04, 0.02]} />
        <meshStandardMaterial color={glow} emissive={glow} emissiveIntensity={1.2} />
      </mesh>
      <mesh castShadow position={[0.28, y + 0.32, 0.05]} rotation={[0, 0, -0.15]}>
        <boxGeometry args={[0.55, 0.06, 0.06]} />
        <meshStandardMaterial color={darken(color, 0.2)} metalness={0.9} roughness={0.2} />
      </mesh>
      <mesh castShadow position={[-0.1, y + 0.08, 0]}>
        <boxGeometry args={[0.1, 0.22, 0.1]} />
        <meshStandardMaterial color={color} metalness={0.85} roughness={0.25} />
      </mesh>
      <mesh castShadow position={[0.1, y + 0.08, 0]}>
        <boxGeometry args={[0.1, 0.22, 0.1]} />
        <meshStandardMaterial color={color} metalness={0.85} roughness={0.25} />
      </mesh>
    </group>
  )
}

export function AeldariBody({ color, accent, scale, hero }: BodyProps) {
  const s = scale * (hero ? 1.08 : 0.95)
  const y = BASE_HEIGHT
  return (
    <group scale={[s, s, s]}>
      <mesh castShadow position={[0, y + 0.3, 0]}>
        <boxGeometry args={[0.28, 0.55, 0.16]} />
        <meshStandardMaterial color={color} metalness={0.45} roughness={0.45} />
      </mesh>
      <mesh castShadow position={[0, y + 0.6, 0]}>
        <sphereGeometry args={[0.11, 8, 8]} />
        <meshStandardMaterial color={accent} metalness={0.5} roughness={0.4} />
      </mesh>
      <mesh castShadow position={[0.22, y + 0.35, 0.08]} rotation={[0, 0, -0.5]}>
        <boxGeometry args={[0.55, 0.05, 0.05]} />
        <meshStandardMaterial color={accent} metalness={0.6} emissive={accent} emissiveIntensity={0.15} />
      </mesh>
      <mesh castShadow position={[-0.08, y + 0.1, 0]}>
        <boxGeometry args={[0.1, 0.28, 0.1]} />
        <meshStandardMaterial color={color} metalness={0.4} />
      </mesh>
      <mesh castShadow position={[0.08, y + 0.1, 0]}>
        <boxGeometry args={[0.1, 0.28, 0.1]} />
        <meshStandardMaterial color={color} metalness={0.4} />
      </mesh>
    </group>
  )
}

export function MachineBody({ color, accent, scale }: BodyProps) {
  const y = BASE_HEIGHT
  return (
    <group scale={[scale, scale, scale]}>
      <mesh castShadow position={[0, y + 0.28, 0]}>
        <boxGeometry args={[0.36, 0.44, 0.28]} />
        <meshStandardMaterial color={color} metalness={0.7} roughness={0.35} />
      </mesh>
      <mesh castShadow position={[0, y + 0.55, 0]}>
        <cylinderGeometry args={[0.12, 0.14, 0.15, 6]} />
        <meshStandardMaterial color={accent} metalness={0.8} roughness={0.3} emissive={accent} emissiveIntensity={0.1} />
      </mesh>
      <mesh position={[0, y + 0.62, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 0.2, 4]} />
        <meshStandardMaterial color="#c41e3a" emissive="#ff0000" emissiveIntensity={0.8} />
      </mesh>
      <mesh castShadow position={[0.3, y + 0.3, 0.1]}>
        <boxGeometry args={[0.4, 0.08, 0.08]} />
        <meshStandardMaterial color="#444" metalness={0.85} />
      </mesh>
    </group>
  )
}

export function CultBody({ color, accent, scale }: BodyProps) {
  const y = BASE_HEIGHT
  return (
    <group scale={[scale, scale, scale]}>
      <mesh castShadow position={[0, y + 0.22, 0]}>
        <boxGeometry args={[0.34, 0.42, 0.22]} />
        <meshStandardMaterial color={color} roughness={0.65} />
      </mesh>
      <mesh castShadow position={[0, y + 0.5, 0]}>
        <boxGeometry args={[0.18, 0.16, 0.18]} />
        <meshStandardMaterial color={accent} roughness={0.7} />
      </mesh>
      <mesh castShadow position={[0, y + 0.55, 0.05]} rotation={[0.3, 0, 0]}>
        <coneGeometry args={[0.05, 0.2, 4]} />
        <meshStandardMaterial color="#6b2d5b" emissive="#9b4d8b" emissiveIntensity={0.3} />
      </mesh>
      <mesh castShadow position={[0.28, y + 0.28, 0.1]}>
        <boxGeometry args={[0.35, 0.07, 0.07]} />
        <meshStandardMaterial color="#333" />
      </mesh>
    </group>
  )
}

export function TankBody({ color, accent, scale }: BodyProps) {
  const s = scale * 1.85
  return (
    <group scale={[s, s, s]}>
      {/* Treads — key differentiator from humanoids */}
      <mesh castShadow receiveShadow position={[-0.55, 0.22, 0]}>
        <boxGeometry args={[0.35, 0.44, 1.7]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.3} roughness={0.85} />
      </mesh>
      <mesh castShadow receiveShadow position={[0.55, 0.22, 0]}>
        <boxGeometry args={[0.35, 0.44, 1.7]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.3} roughness={0.85} />
      </mesh>
      {[ -0.5, 0, 0.5 ].map((z) => (
        <mesh key={z} position={[-0.55, 0.22, z]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.2, 0.2, 0.32, 8]} />
          <meshStandardMaterial color="#111" metalness={0.4} roughness={0.8} />
        </mesh>
      ))}
      <mesh castShadow receiveShadow position={[0, 0.42, 0]}>
        <boxGeometry args={[1.15, 0.32, 1.75]} />
        <meshStandardMaterial color={color} metalness={0.55} roughness={0.45} />
      </mesh>
      <mesh castShadow position={[0, 0.62, -0.15]}>
        <boxGeometry args={[0.65, 0.28, 0.6]} />
        <meshStandardMaterial color={darken(color, 0.12)} metalness={0.6} roughness={0.4} />
      </mesh>
      <mesh castShadow position={[0, 0.65, 0.65]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.07, 0.08, 1.05, 8]} />
        <meshStandardMaterial color="#0a0a0a" metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[0.5, 0.44, 0.55]}>
        <boxGeometry args={[0.1, 0.14, 0.4]} />
        <meshStandardMaterial color={accent} metalness={0.45} />
      </mesh>
    </group>
  )
}

export function VehicleBody({ color, scale }: { color: string; scale: number }) {
  const s = scale * 1.5
  return (
    <group scale={[s, s, s]}>
      <mesh castShadow receiveShadow position={[-0.45, 0.2, 0]}>
        <boxGeometry args={[0.28, 0.38, 1.3]} />
        <meshStandardMaterial color="#151515" metalness={0.35} roughness={0.85} />
      </mesh>
      <mesh castShadow receiveShadow position={[0.45, 0.2, 0]}>
        <boxGeometry args={[0.28, 0.38, 1.3]} />
        <meshStandardMaterial color="#151515" metalness={0.35} roughness={0.85} />
      </mesh>
      <mesh castShadow receiveShadow position={[0, 0.4, 0]}>
        <boxGeometry args={[0.95, 0.42, 1.4]} />
        <meshStandardMaterial color={color} metalness={0.5} roughness={0.5} />
      </mesh>
      <mesh castShadow position={[0, 0.58, -0.2]}>
        <boxGeometry args={[0.55, 0.18, 0.5]} />
        <meshStandardMaterial color="#222" metalness={0.4} />
      </mesh>
    </group>
  )
}

export function WalkerBody({ color, accent, scale, silhouette }: BodyProps & { silhouette: MiniatureSilhouette }) {
  const s = scale * 1.35
  const isDaemon = silhouette === 'daemon'
  return (
    <group scale={[s, s, s]}>
      <mesh castShadow position={[-0.38, 0.5, 0]}>
        <boxGeometry args={[0.22, 0.85, 0.22]} />
        <meshStandardMaterial color={darken(color, 0.2)} metalness={0.55} roughness={0.45} />
      </mesh>
      <mesh castShadow position={[0.38, 0.5, 0]}>
        <boxGeometry args={[0.22, 0.85, 0.22]} />
        <meshStandardMaterial color={darken(color, 0.2)} metalness={0.55} roughness={0.45} />
      </mesh>
      <mesh castShadow position={[0, 0.85, 0]}>
        <boxGeometry args={[0.8, 0.6, 0.55]} />
        <meshStandardMaterial color={color} metalness={0.5} emissive={isDaemon ? accent : '#000'} emissiveIntensity={isDaemon ? 0.2 : 0} />
      </mesh>
      <mesh castShadow position={[0.5, 0.92, 0.15]} rotation={[0, 0, -0.5]}>
        <boxGeometry args={[0.6, 0.14, 0.14]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.7} />
      </mesh>
    </group>
  )
}

function WarpAura({ y, radius, color }: { y: number; radius: number; color: string }) {
  return (
    <group position={[0, y, 0]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[radius * 0.7, radius, 24]} />
        <meshBasicMaterial color={color} transparent opacity={0.28} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[radius * 0.35, radius * 0.5, 16]} />
        <meshBasicMaterial color={color} transparent opacity={0.18} />
      </mesh>
    </group>
  )
}

function wingMaterial(color: string) {
  return <meshStandardMaterial color={color} transparent opacity={0.55} emissive={color} emissiveIntensity={0.35} side={THREE.DoubleSide} />
}

function DaemonWings({ color, y, span, tilt = 0.35 }: { color: string; y: number; span: number; tilt?: number }) {
  return (
    <>
      <group position={[-0.35, y, -0.1]} rotation={[tilt, 0.15, 0.55]}>
        <mesh castShadow position={[-span * 0.35, 0, 0]}>
          <boxGeometry args={[span, 0.06, span * 0.55]} />
          {wingMaterial(color)}
        </mesh>
        <mesh position={[-span * 0.55, -0.08, span * 0.1]} rotation={[0, 0, 0.25]}>
          <boxGeometry args={[span * 0.65, 0.04, span * 0.35]} />
          {wingMaterial(color)}
        </mesh>
      </group>
      <group position={[0.35, y, -0.1]} rotation={[tilt, -0.15, -0.55]}>
        <mesh castShadow position={[span * 0.35, 0, 0]}>
          <boxGeometry args={[span, 0.06, span * 0.55]} />
          {wingMaterial(color)}
        </mesh>
        <mesh position={[span * 0.55, -0.08, span * 0.1]} rotation={[0, 0, -0.25]}>
          <boxGeometry args={[span * 0.65, 0.04, span * 0.35]} />
          {wingMaterial(color)}
        </mesh>
      </group>
    </>
  )
}

function KhorneGreaterDaemon({ color, accent, scale }: BodyProps) {
  const s = scale * 2.1
  const glow = accent || '#ff2200'
  const y = BASE_HEIGHT
  return (
    <group scale={[s, s, s]}>
      <WarpAura y={0.04} radius={1.1} color={glow} />
      <DaemonWings color={glow} y={1.55} span={1.35} tilt={0.2} />
      {/* Legs */}
      <mesh castShadow position={[-0.28, y + 0.55, 0.05]}>
        <boxGeometry args={[0.32, 1.1, 0.38]} />
        <meshStandardMaterial color={darken(color, 0.25)} roughness={0.7} />
      </mesh>
      <mesh castShadow position={[0.28, y + 0.55, 0.05]}>
        <boxGeometry args={[0.32, 1.1, 0.38]} />
        <meshStandardMaterial color={darken(color, 0.25)} roughness={0.7} />
      </mesh>
      {/* Barrel chest */}
      <mesh castShadow position={[0, y + 1.25, 0]}>
        <boxGeometry args={[1.05, 0.95, 0.65]} />
        <meshStandardMaterial color={color} emissive={glow} emissiveIntensity={0.15} roughness={0.6} />
      </mesh>
      {/* Shoulder pauldrons */}
      <mesh castShadow position={[-0.62, y + 1.45, 0]}>
        <boxGeometry args={[0.28, 0.35, 0.45]} />
        <meshStandardMaterial color={darken(color, 0.1)} metalness={0.35} roughness={0.5} />
      </mesh>
      <mesh castShadow position={[0.62, y + 1.45, 0]}>
        <boxGeometry args={[0.28, 0.35, 0.45]} />
        <meshStandardMaterial color={darken(color, 0.1)} metalness={0.35} roughness={0.5} />
      </mesh>
      {/* Head + horns */}
      <mesh castShadow position={[0, y + 1.85, 0.08]}>
        <boxGeometry args={[0.42, 0.38, 0.42]} />
        <meshStandardMaterial color={darken(color, 0.2)} roughness={0.65} />
      </mesh>
      <mesh castShadow position={[-0.14, y + 2.08, 0.08]} rotation={[0, 0, 0.45]}>
        <coneGeometry args={[0.07, 0.42, 4]} />
        <meshStandardMaterial color="#1a0505" emissive={glow} emissiveIntensity={0.5} />
      </mesh>
      <mesh castShadow position={[0.14, y + 2.08, 0.08]} rotation={[0, 0, -0.45]}>
        <coneGeometry args={[0.07, 0.42, 4]} />
        <meshStandardMaterial color="#1a0505" emissive={glow} emissiveIntensity={0.5} />
      </mesh>
      {/* Axe of Khorne */}
      <mesh castShadow position={[0.75, y + 1.35, 0.2]} rotation={[0, 0, -0.65]}>
        <boxGeometry args={[0.12, 0.9, 0.12]} />
        <meshStandardMaterial color="#2a1810" metalness={0.5} roughness={0.4} />
      </mesh>
      <mesh castShadow position={[1.05, y + 1.75, 0.2]} rotation={[0, 0, -0.35]}>
        <boxGeometry args={[0.65, 0.55, 0.08]} />
        <meshStandardMaterial color={glow} metalness={0.6} emissive={glow} emissiveIntensity={0.35} roughness={0.3} />
      </mesh>
      {/* Glowing eyes */}
      <mesh position={[-0.1, y + 1.88, 0.28]}>
        <sphereGeometry args={[0.05, 6, 6]} />
        <meshStandardMaterial color="#ffcc00" emissive="#ff4400" emissiveIntensity={1.5} />
      </mesh>
      <mesh position={[0.1, y + 1.88, 0.28]}>
        <sphereGeometry args={[0.05, 6, 6]} />
        <meshStandardMaterial color="#ffcc00" emissive="#ff4400" emissiveIntensity={1.5} />
      </mesh>
    </group>
  )
}

function NurgleGreaterDaemon({ color, accent, scale }: BodyProps) {
  const s = scale * 2.15
  const rot = accent || '#6b8c3a'
  const y = BASE_HEIGHT
  return (
    <group scale={[s, s, s]}>
      <WarpAura y={0.04} radius={1.25} color={rot} />
      {/* Bloated belly — unmistakable Nurgle silhouette */}
      <mesh castShadow position={[0, y + 0.85, 0]}>
        <sphereGeometry args={[0.85, 12, 10]} />
        <meshStandardMaterial color={color} emissive={rot} emissiveIntensity={0.12} roughness={0.92} />
      </mesh>
      <mesh castShadow position={[0.35, y + 0.95, 0.25]}>
        <sphereGeometry args={[0.22, 8, 8]} />
        <meshStandardMaterial color={darken(color, 0.15)} roughness={0.95} />
      </mesh>
      <mesh castShadow position={[-0.4, y + 0.7, -0.2]}>
        <sphereGeometry args={[0.18, 8, 8]} />
        <meshStandardMaterial color={darken(rot, 0.1)} roughness={0.95} />
      </mesh>
      {/* Small sunken head */}
      <mesh castShadow position={[0, y + 1.35, 0.35]}>
        <sphereGeometry args={[0.22, 8, 8]} />
        <meshStandardMaterial color={darken(color, 0.2)} roughness={0.9} />
      </mesh>
      <mesh castShadow position={[-0.08, y + 1.48, 0.42]} rotation={[0.2, 0, 0.35]}>
        <coneGeometry args={[0.04, 0.18, 4]} />
        <meshStandardMaterial color={rot} emissive={rot} emissiveIntensity={0.3} />
      </mesh>
      <mesh castShadow position={[0.08, y + 1.48, 0.42]} rotation={[0.2, 0, -0.35]}>
        <coneGeometry args={[0.04, 0.18, 4]} />
        <meshStandardMaterial color={rot} emissive={rot} emissiveIntensity={0.3} />
      </mesh>
      {/* Stubby limbs */}
      <mesh castShadow position={[-0.7, y + 0.75, 0.1]} rotation={[0, 0, 0.5]}>
        <boxGeometry args={[0.55, 0.28, 0.28]} />
        <meshStandardMaterial color={darken(color, 0.15)} roughness={0.9} />
      </mesh>
      <mesh castShadow position={[0.7, y + 0.75, 0.1]} rotation={[0, 0, -0.5]}>
        <boxGeometry args={[0.55, 0.28, 0.28]} />
        <meshStandardMaterial color={darken(color, 0.15)} roughness={0.9} />
      </mesh>
      <mesh castShadow position={[-0.35, y + 0.2, 0.15]}>
        <boxGeometry args={[0.3, 0.45, 0.32]} />
        <meshStandardMaterial color={darken(color, 0.2)} roughness={0.9} />
      </mesh>
      <mesh castShadow position={[0.35, y + 0.2, 0.15]}>
        <boxGeometry args={[0.3, 0.45, 0.32]} />
        <meshStandardMaterial color={darken(color, 0.2)} roughness={0.9} />
      </mesh>
      {/* Rusted bell / plague icon */}
      <mesh castShadow position={[0, y + 1.1, -0.55]} rotation={[0.3, 0, 0]}>
        <cylinderGeometry args={[0.18, 0.22, 0.25, 8]} />
        <meshStandardMaterial color="#5a4a20" metalness={0.5} roughness={0.7} />
      </mesh>
      {/* Dripping bile puddles */}
      <mesh position={[0.5, y + 0.06, 0.4]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.15, 8]} />
        <meshBasicMaterial color={rot} transparent opacity={0.4} />
      </mesh>
    </group>
  )
}

function TzeentchGreaterDaemon({ color, accent, scale }: BodyProps) {
  const s = scale * 2.05
  const warp = accent || '#44aaff'
  const y = BASE_HEIGHT
  return (
    <group scale={[s, s, s]}>
      <WarpAura y={0.04} radius={1.15} color={warp} />
      <DaemonWings color={warp} y={1.75} span={1.5} tilt={0.15} />
      {/* Tall spindly body */}
      <mesh castShadow position={[0, y + 1.1, 0]}>
        <boxGeometry args={[0.45, 1.35, 0.35]} />
        <meshStandardMaterial color={color} emissive={warp} emissiveIntensity={0.2} roughness={0.55} />
      </mesh>
      {/* Long neck */}
      <mesh castShadow position={[0, y + 1.95, 0.1]} rotation={[0.15, 0, 0]}>
        <cylinderGeometry args={[0.1, 0.14, 0.65, 6]} />
        <meshStandardMaterial color={darken(color, 0.1)} emissive={warp} emissiveIntensity={0.15} />
      </mesh>
      {/* Bird head */}
      <mesh castShadow position={[0, y + 2.35, 0.25]}>
        <coneGeometry args={[0.14, 0.35, 6]} />
        <meshStandardMaterial color={warp} emissive={warp} emissiveIntensity={0.35} />
      </mesh>
      <mesh castShadow position={[0, y + 2.28, 0.42]} rotation={[0.8, 0, 0]}>
        <coneGeometry args={[0.05, 0.2, 4]} />
        <meshStandardMaterial color="#ffcc44" emissive="#ffaa00" emissiveIntensity={0.8} />
      </mesh>
      {/* Staff of change */}
      <mesh castShadow position={[-0.55, y + 1.2, 0.15]} rotation={[0.1, 0, 0.08]}>
        <cylinderGeometry args={[0.04, 0.05, 1.8, 6]} />
        <meshStandardMaterial color="#2a2040" metalness={0.4} />
      </mesh>
      <mesh position={[-0.58, y + 2.15, 0.2]}>
        <octahedronGeometry args={[0.14, 0]} />
        <meshStandardMaterial color={warp} emissive={warp} emissiveIntensity={0.9} transparent opacity={0.85} />
      </mesh>
      {/* Floating sorcery orbs */}
      {[0, 1, 2].map((i) => (
        <mesh
          key={i}
          position={[0.4 + i * 0.15, y + 1.5 + i * 0.2, 0.35 + i * 0.1]}
        >
          <sphereGeometry args={[0.08, 8, 8]} />
          <meshStandardMaterial color={['#ff44aa', '#44ffaa', '#aaaaff'][i]} emissive={['#ff44aa', '#44ffaa', '#aaaaff'][i]} emissiveIntensity={1} />
        </mesh>
      ))}
      {/* Thin legs */}
      <mesh castShadow position={[-0.18, y + 0.45, 0]}>
        <boxGeometry args={[0.14, 0.9, 0.14]} />
        <meshStandardMaterial color={color} roughness={0.6} />
      </mesh>
      <mesh castShadow position={[0.18, y + 0.45, 0]}>
        <boxGeometry args={[0.14, 0.9, 0.14]} />
        <meshStandardMaterial color={color} roughness={0.6} />
      </mesh>
    </group>
  )
}

function SlaaneshGreaterDaemon({ color, accent, scale }: BodyProps) {
  const s = scale * 2.1
  const glow = accent || '#cc66ff'
  const y = BASE_HEIGHT
  return (
    <group scale={[s, s, s]}>
      <WarpAura y={0.04} radius={1.1} color={glow} />
      {/* Elegant tall torso */}
      <mesh castShadow position={[0, y + 1.15, 0]}>
        <boxGeometry args={[0.5, 1.45, 0.32]} />
        <meshStandardMaterial color={color} emissive={glow} emissiveIntensity={0.18} metalness={0.3} roughness={0.45} />
      </mesh>
      {/* Serpentine lower body */}
      <mesh castShadow position={[0, y + 0.35, -0.15]} rotation={[0.25, 0, 0]}>
        <boxGeometry args={[0.38, 0.55, 0.7]} />
        <meshStandardMaterial color={darken(color, 0.1)} roughness={0.55} />
      </mesh>
      <mesh castShadow position={[0, y + 0.15, -0.45]} rotation={[0.45, 0, 0]}>
        <boxGeometry args={[0.32, 0.4, 0.55]} />
        <meshStandardMaterial color={darken(color, 0.15)} roughness={0.55} />
      </mesh>
      {/* Head with curved horns */}
      <mesh castShadow position={[0, y + 2.0, 0.05]}>
        <boxGeometry args={[0.28, 0.32, 0.28]} />
        <meshStandardMaterial color={accent} metalness={0.4} emissive={glow} emissiveIntensity={0.2} />
      </mesh>
      <mesh castShadow position={[-0.12, y + 2.2, 0]} rotation={[0, 0, 0.7]}>
        <coneGeometry args={[0.05, 0.5, 4]} />
        <meshStandardMaterial color={glow} emissive={glow} emissiveIntensity={0.45} />
      </mesh>
      <mesh castShadow position={[0.12, y + 2.2, 0]} rotation={[0, 0, -0.7]}>
        <coneGeometry args={[0.05, 0.5, 4]} />
        <meshStandardMaterial color={glow} emissive={glow} emissiveIntensity={0.45} />
      </mesh>
      {/* Four graceful arms */}
      {[
        [-0.55, 1.35, 0.1, 0, 0, 0.7],
        [0.55, 1.35, 0.1, 0, 0, -0.7],
        [-0.45, 1.05, -0.1, 0.3, 0, 0.9],
        [0.45, 1.05, -0.1, 0.3, 0, -0.9],
      ].map(([x, hy, z, rx, ry, rz], i) => (
        <mesh key={i} castShadow position={[x, y + hy, z]} rotation={[rx, ry, rz]}>
          <boxGeometry args={[0.45, 0.1, 0.1]} />
          <meshStandardMaterial color={darken(color, 0.05)} metalness={0.35} roughness={0.4} />
        </mesh>
      ))}
      {/* Whip-blade */}
      <mesh castShadow position={[0.65, y + 0.9, 0.25]} rotation={[0.5, 0, -0.8]}>
        <boxGeometry args={[0.06, 0.06, 0.9]} />
        <meshStandardMaterial color={glow} emissive={glow} emissiveIntensity={0.4} metalness={0.5} />
      </mesh>
    </group>
  )
}

function GenericGreaterDaemon({ color, accent, scale }: BodyProps) {
  const s = scale * 2.0
  const warp = accent || '#aa44ff'
  const y = BASE_HEIGHT
  return (
    <group scale={[s, s, s]}>
      <WarpAura y={0.04} radius={1.15} color={warp} />
      <DaemonWings color={warp} y={1.6} span={1.3} />
      <mesh castShadow position={[0, y + 1.0, 0]}>
        <boxGeometry args={[0.85, 1.1, 0.55]} />
        <meshStandardMaterial color={color} emissive={warp} emissiveIntensity={0.22} roughness={0.6} />
      </mesh>
      <mesh castShadow position={[0, y + 1.75, 0.1]}>
        <boxGeometry args={[0.38, 0.38, 0.38]} />
        <meshStandardMaterial color={darken(color, 0.15)} emissive={warp} emissiveIntensity={0.3} />
      </mesh>
      <mesh castShadow position={[-0.15, y + 1.95, 0.1]} rotation={[0, 0, 0.4]}>
        <coneGeometry args={[0.08, 0.45, 4]} />
        <meshStandardMaterial color="#1a001a" emissive={warp} emissiveIntensity={0.55} />
      </mesh>
      <mesh castShadow position={[0.15, y + 1.95, 0.1]} rotation={[0, 0, -0.4]}>
        <coneGeometry args={[0.08, 0.45, 4]} />
        <meshStandardMaterial color="#1a001a" emissive={warp} emissiveIntensity={0.55} />
      </mesh>
      <mesh castShadow position={[-0.3, y + 0.45, 0.05]}>
        <boxGeometry args={[0.28, 0.95, 0.3]} />
        <meshStandardMaterial color={darken(color, 0.2)} roughness={0.7} />
      </mesh>
      <mesh castShadow position={[0.3, y + 0.45, 0.05]}>
        <boxGeometry args={[0.28, 0.95, 0.3]} />
        <meshStandardMaterial color={darken(color, 0.2)} roughness={0.7} />
      </mesh>
      <mesh castShadow position={[0.7, y + 1.0, 0.2]} rotation={[0, 0, -0.55]}>
        <boxGeometry args={[0.7, 0.12, 0.12]} />
        <meshStandardMaterial color="#1a1020" metalness={0.55} />
      </mesh>
    </group>
  )
}

export function GreaterDaemonBody({ color, accent, scale, variant }: BodyProps & { variant: GreaterDaemonVariant }) {
  switch (variant) {
    case 'khorne': return <KhorneGreaterDaemon color={color} accent={accent} scale={scale} />
    case 'nurgle': return <NurgleGreaterDaemon color={color} accent={accent} scale={scale} />
    case 'tzeentch': return <TzeentchGreaterDaemon color={color} accent={accent} scale={scale} />
    case 'slaanesh': return <SlaaneshGreaterDaemon color={color} accent={accent} scale={scale} />
    default: return <GenericGreaterDaemon color={color} accent={accent} scale={scale} />
  }
}

/** Smaller daemon monsters (Daemon Prince, etc.) */
export function DaemonMonsterBody({ color, accent, scale }: BodyProps) {
  const s = scale * 1.55
  const warp = accent || '#aa00ff'
  const y = BASE_HEIGHT
  return (
    <group scale={[s, s, s]}>
      <WarpAura y={0.03} radius={0.55} color={warp} />
      <DaemonWings color={warp} y={1.15} span={0.75} tilt={0.3} />
      <mesh castShadow position={[0, y + 0.75, 0]}>
        <boxGeometry args={[0.7, 0.8, 0.45]} />
        <meshStandardMaterial color={color} emissive={warp} emissiveIntensity={0.25} roughness={0.65} />
      </mesh>
      <mesh castShadow position={[0, y + 1.2, 0.05]}>
        <boxGeometry args={[0.32, 0.32, 0.32]} />
        <meshStandardMaterial color={darken(color, 0.15)} emissive={warp} emissiveIntensity={0.35} />
      </mesh>
      <mesh castShadow position={[-0.12, y + 1.38, 0.05]} rotation={[0, 0, 0.45]}>
        <coneGeometry args={[0.06, 0.35, 4]} />
        <meshStandardMaterial color="#1a001a" emissive={warp} emissiveIntensity={0.6} />
      </mesh>
      <mesh castShadow position={[0.12, y + 1.38, 0.05]} rotation={[0, 0, -0.45]}>
        <coneGeometry args={[0.06, 0.35, 4]} />
        <meshStandardMaterial color="#1a001a" emissive={warp} emissiveIntensity={0.6} />
      </mesh>
      <mesh castShadow position={[-0.22, y + 0.35, 0.04]}>
        <boxGeometry args={[0.22, 0.75, 0.24]} />
        <meshStandardMaterial color={darken(color, 0.2)} roughness={0.7} />
      </mesh>
      <mesh castShadow position={[0.22, y + 0.35, 0.04]}>
        <boxGeometry args={[0.22, 0.75, 0.24]} />
        <meshStandardMaterial color={darken(color, 0.2)} roughness={0.7} />
      </mesh>
      <mesh castShadow position={[0.55, y + 0.7, 0.15]} rotation={[0, 0, -0.5]}>
        <boxGeometry args={[0.45, 0.1, 0.1]} />
        <meshStandardMaterial color="#2a1020" metalness={0.5} />
      </mesh>
    </group>
  )
}

export function TyranidMonsterBody({ color, accent, scale }: BodyProps) {
  const s = scale * 1.45
  return (
    <group scale={[s, s, s]}>
      <mesh castShadow position={[0, 0.65, 0]}>
        <boxGeometry args={[0.9, 0.7, 1.2]} />
        <meshStandardMaterial color={color} roughness={0.88} />
      </mesh>
      <mesh castShadow position={[0, 0.95, 0.45]}>
        <coneGeometry args={[0.2, 0.5, 6]} />
        <meshStandardMaterial color={darken(color, 0.15)} roughness={0.85} />
      </mesh>
      {[ -0.35, 0.35 ].map((x) => (
        <mesh key={x} castShadow position={[x, 0.5, -0.2]} rotation={[0.8, 0, x > 0 ? -0.6 : 0.6]}>
          <coneGeometry args={[0.08, 0.55, 4]} />
          <meshStandardMaterial color={accent} roughness={0.8} />
        </mesh>
      ))}
      <mesh castShadow position={[0, 0.25, -0.55]}>
        <coneGeometry args={[0.1, 0.7, 4]} />
        <meshStandardMaterial color={darken(color, 0.2)} roughness={0.9} />
      </mesh>
    </group>
  )
}

export function KnightBody({ color, accent, scale }: BodyProps) {
  const s = scale * 2
  return (
    <group scale={[s, s, s]}>
      <mesh castShadow receiveShadow position={[-0.5, 0.55, 0]}>
        <boxGeometry args={[0.3, 1.1, 0.3]} />
        <meshStandardMaterial color={darken(color, 0.15)} metalness={0.6} roughness={0.4} />
      </mesh>
      <mesh castShadow receiveShadow position={[0.5, 0.55, 0]}>
        <boxGeometry args={[0.3, 1.1, 0.3]} />
        <meshStandardMaterial color={darken(color, 0.15)} metalness={0.6} roughness={0.4} />
      </mesh>
      <mesh castShadow receiveShadow position={[0, 1.05, 0]}>
        <boxGeometry args={[1.1, 1.3, 0.75]} />
        <meshStandardMaterial color={color} metalness={0.65} roughness={0.35} />
      </mesh>
      <mesh castShadow position={[0, 1.85, 0.15]}>
        <boxGeometry args={[0.45, 0.35, 0.35]} />
        <meshStandardMaterial color={accent} metalness={0.7} emissive={accent} emissiveIntensity={0.12} />
      </mesh>
      <mesh castShadow position={[0, 1.15, 0.5]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.09, 0.11, 1.2, 8]} />
        <meshStandardMaterial color="#111" metalness={0.8} />
      </mesh>
    </group>
  )
}

export function FlyerBody({ color, accent, scale }: BodyProps) {
  const s = scale * 1.15
  return (
    <group scale={[s, s, s]} position={[0, 0.75, 0]}>
      <mesh castShadow>
        <boxGeometry args={[0.4, 0.16, 1.35]} />
        <meshStandardMaterial color={color} metalness={0.5} roughness={0.45} />
      </mesh>
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <boxGeometry args={[1.55, 0.05, 0.4]} />
        <meshStandardMaterial color={accent} metalness={0.4} />
      </mesh>
      <mesh position={[0, 0.06, -0.6]}>
        <boxGeometry args={[0.55, 0.14, 0.22]} />
        <meshStandardMaterial color={darken(color, 0.15)} metalness={0.45} />
      </mesh>
    </group>
  )
}

export function HumanoidMonsterBody({ color, accent, scale }: BodyProps) {
  const s = scale * 1.3
  return (
    <group scale={[s, s, s]}>
      <mesh castShadow position={[0, 0.6, 0]}>
        <boxGeometry args={[0.75, 0.85, 0.55]} />
        <meshStandardMaterial color={color} metalness={0.35} roughness={0.55} />
      </mesh>
      <mesh castShadow position={[0, 1.05, 0]}>
        <boxGeometry args={[0.35, 0.35, 0.35]} />
        <meshStandardMaterial color={accent} metalness={0.45} />
      </mesh>
      <mesh castShadow position={[0.45, 0.55, 0.15]} rotation={[0, 0, -0.5]}>
        <boxGeometry args={[0.5, 0.12, 0.12]} />
        <meshStandardMaterial color="#222" metalness={0.6} />
      </mesh>
    </group>
  )
}

export function renderHumanoid(
  silhouette: MiniatureSilhouette,
  props: BodyProps,
) {
  switch (silhouette) {
    case 'daemon': return <DaemonBody {...props} />
    case 'tyranid': return <TyranidBody {...props} />
    case 'ork': return <OrkBody {...props} />
    case 'necron': return <NecronBody {...props} />
    case 'aeldari': return <AeldariBody {...props} />
    case 'machine': return <MachineBody {...props} />
    case 'tau': return <HumanoidBody {...props} />
    case 'cult': return <CultBody {...props} />
    default: return <HumanoidBody {...props} />
  }
}
