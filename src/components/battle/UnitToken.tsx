import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text } from '@react-three/drei'
import { Group } from 'three'
import type { BattleUnit } from '../../types/game'
import { getBattleUnitProfile } from '../../data/battleProfile'
import { getFaction } from '../../data/factions'
import { getGreaterDaemonVariant, isGreaterDaemon } from './miniatures/greaterDaemon'
import { getMiniatureArchetype } from './miniatures/miniatureArchetype'
import { getMiniatureSilhouette, isMechanicalArchetype } from './miniatures/miniatureSilhouette'
import { getMiniatureTypeLabel, ProceduralMiniature } from './miniatures/ProceduralMiniature'

interface UnitTokenProps {
  unit: BattleUnit
  selected: boolean
  isShootTarget?: boolean
  onClick: () => void
}

const TYPE_BADGE_COLORS: Record<string, string> = {
  Tank: '#8899aa',
  Vehicle: '#778899',
  Walker: '#99aabb',
  Flyer: '#aabbcc',
  'Lord of War': '#ffcc44',
  'Greater Daemon': '#cc44ff',
  Daemon: '#cc44ff',
  Tyranid: '#9b4d8b',
  Ork: '#44aa44',
  Necron: '#00cc88',
  Infantry: '#cccccc',
}

export function UnitToken({ unit, selected, isShootTarget = false, onClick }: UnitTokenProps) {
  const groupRef = useRef<Group>(null)
  const profile = getBattleUnitProfile(unit)
  const faction = getFaction(profile.factionId)
  const archetype = getMiniatureArchetype(profile)
  const silhouette = getMiniatureSilhouette(profile, archetype)
  const greaterDaemon = isGreaterDaemon(profile)
  const greaterDaemonVariant = greaterDaemon ? getGreaterDaemonVariant(profile) : undefined
  const mechanical = isMechanicalArchetype(archetype)
  const scale = profile.baseSize / 32
  const healthPercent = unit.currentWounds / (profile.wounds * profile.models)
  const typeLabel = getMiniatureTypeLabel(archetype, silhouette, greaterDaemonVariant)

  const primaryColor = unit.owner === 'player' ? faction.primaryColor : '#6b2020'
  const accentColor = unit.owner === 'player' ? faction.secondaryColor : '#3a1010'

  const groundOffset = archetype === 'flyer' ? 0.2 : 0

  useFrame((state) => {
    if (!groupRef.current || !selected) return
    groupRef.current.position.y = groundOffset + Math.sin(state.clock.elapsedTime * 3) * 0.04
  })

  const labelHeight = greaterDaemon ? 3.4
    : archetype === 'titanic' || silhouette === 'knight' ? 3.2
    : archetype === 'tank' ? 1.8
      : archetype === 'vehicle' || archetype === 'walker' ? 1.6
        : archetype === 'flyer' ? 1.7
          : archetype === 'monster' ? 1.8
            : 1.15

  const badgeColor = TYPE_BADGE_COLORS[typeLabel.split(' ')[0]]
    ?? TYPE_BADGE_COLORS[typeLabel]
    ?? '#aaaaaa'

  return (
    <group
      ref={groupRef}
      position={[unit.position.x, groundOffset, unit.position.y]}
      rotation={[0, unit.rotation, 0]}
      onClick={(e) => {
        e.stopPropagation()
        onClick()
      }}
    >
      {isShootTarget && (
        <mesh position={[0, 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[scale * (mechanical ? 1.4 : 0.9), scale * (mechanical ? 1.7 : 1.15), 32]} />
          <meshBasicMaterial color="#ff4444" transparent opacity={0.7} />
        </mesh>
      )}

      <ProceduralMiniature
        archetype={archetype}
        silhouette={silhouette}
        greaterDaemonVariant={greaterDaemonVariant}
        primaryColor={primaryColor}
        accentColor={accentColor}
        scale={scale}
        selected={selected}
      />

      {/* Type badge — helps tell tank vs infantry vs daemon at a glance */}
      <group position={[0, 0.12, scale * (mechanical ? 1.1 : 0.65)]}>
        <mesh>
          <boxGeometry args={[0.55, 0.14, 0.02]} />
          <meshBasicMaterial color="#0a0a12" transparent opacity={0.75} />
        </mesh>
        <Text
          position={[0, 0, 0.02]}
          fontSize={0.12}
          color={badgeColor}
          anchorX="center"
          anchorY="middle"
        >
          {typeLabel.toUpperCase()}
        </Text>
      </group>

      {profile.models > 1 && !mechanical && (
        <group position={[0, 0.08, scale * 0.55]}>
          {Array.from({ length: Math.min(unit.modelsRemaining, 5) }).map((_, i) => (
            <mesh key={i} position={[(i - 2) * 0.12, 0, 0]}>
              <sphereGeometry args={[0.05, 6, 6]} />
              <meshStandardMaterial color={primaryColor} emissive={primaryColor} emissiveIntensity={0.3} />
            </mesh>
          ))}
        </group>
      )}

      <group position={[0, labelHeight, 0]}>
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[scale * (mechanical ? 2 : 1.4), 0.06, 0.12]} />
          <meshBasicMaterial color="#111" transparent opacity={0.7} />
        </mesh>
        <mesh position={[-scale * (mechanical ? 1 : 0.7) * (1 - healthPercent), 0, 0]}>
          <boxGeometry args={[scale * (mechanical ? 2 : 1.4) * healthPercent, 0.08, 0.1]} />
          <meshBasicMaterial
            color={healthPercent > 0.5 ? '#22cc44' : healthPercent > 0.25 ? '#cc9922' : '#cc2222'}
          />
        </mesh>
      </group>

      {(selected || isShootTarget) && (
        <Text
          position={[0, labelHeight + 0.35, 0]}
          fontSize={0.35}
          color="#ffffff"
          anchorX="center"
          anchorY="bottom"
          outlineWidth={0.02}
          outlineColor="#000000"
        >
          {profile.name}
        </Text>
      )}
    </group>
  )
}
