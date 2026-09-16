import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Line, Text } from '@react-three/drei'
import { Group } from 'three'
import type { BattleModel, BattleUnit } from '../../types/game'
import { getBattleUnitProfile } from '../../data/battleProfile'
import { getFaction } from '../../data/factions'
import { getGreaterDaemonVariant, isGreaterDaemon } from './miniatures/greaterDaemon'
import { getMiniatureArchetype } from './miniatures/miniatureArchetype'
import { getMiniatureSilhouette, isMechanicalArchetype } from './miniatures/miniatureSilhouette'
import { getMiniatureScale } from '../../data/battlefield'
import { getCoherencyPairs, shiftColorHue } from '../../engine/modelSquad'
import { getMiniatureTypeLabel, ProceduralMiniature } from './miniatures/ProceduralMiniature'

interface UnitTokenProps {
  unit: BattleUnit
  selected: boolean
  selectedModelId?: string | null
  isShootTarget?: boolean
  disableInteraction?: boolean
  showCoherency?: boolean
  requireModelClick?: boolean
  onClick: () => void
  onModelClick?: (modelId: string) => void
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

function ModelMiniature({
  unit,
  model,
  selected,
  isModelSelected,
  isShootTarget,
  primaryColor,
  accentColor,
  scale,
  archetype,
  silhouette,
  greaterDaemonVariant,
  mechanical,
  disableInteraction,
  onModelClick,
}: {
  unit: BattleUnit
  model: BattleModel
  selected: boolean
  isModelSelected: boolean
  isShootTarget: boolean
  primaryColor: string
  accentColor: string
  scale: number
  archetype: ReturnType<typeof getMiniatureArchetype>
  silhouette: ReturnType<typeof getMiniatureSilhouette>
  greaterDaemonVariant: ReturnType<typeof getGreaterDaemonVariant> | undefined
  mechanical: boolean
  disableInteraction?: boolean
  onModelClick?: (modelId: string) => void
}) {
  const groupRef = useRef<Group>(null)
  const groundOffset = archetype === 'flyer' ? 0.2 : 0
  const highlight = isModelSelected || (selected && unit.models.length === 1)

  useFrame((state) => {
    if (!groupRef.current || !highlight) return
    groupRef.current.position.y = groundOffset + Math.sin(state.clock.elapsedTime * 3) * 0.04
  })

  return (
    <group
      ref={groupRef}
      position={[model.position.x, groundOffset, model.position.y]}
      rotation={[0, unit.rotation, 0]}
      onClick={(e) => {
        if (disableInteraction) return
        if (!onModelClick) return
        e.stopPropagation()
        onModelClick(model.id)
      }}
    >
      {(isShootTarget || isModelSelected) && (
        <mesh position={[0, 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[scale * (mechanical ? 1.4 : 0.9), scale * (mechanical ? 1.7 : 1.15), 32]} />
          <meshBasicMaterial
            color={isModelSelected ? '#44ffaa' : '#ff4444'}
            transparent
            opacity={0.7}
          />
        </mesh>
      )}

      <ProceduralMiniature
        archetype={archetype}
        silhouette={silhouette}
        greaterDaemonVariant={greaterDaemonVariant}
        primaryColor={primaryColor}
        accentColor={accentColor}
        scale={scale}
        selected={highlight}
      />

      {unit.models.length > 1 && !mechanical && (
        <Text
          position={[0, 0.08, scale * 0.55]}
          fontSize={0.18}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.015}
          outlineColor="#000000"
        >
          {model.index}
        </Text>
      )}
    </group>
  )
}

export function UnitToken({
  unit,
  selected,
  selectedModelId = null,
  isShootTarget = false,
  disableInteraction = false,
  showCoherency = false,
  requireModelClick = false,
  onClick,
  onModelClick,
}: UnitTokenProps) {
  const profile = getBattleUnitProfile(unit)
  const faction = getFaction(profile.factionId)
  const archetype = getMiniatureArchetype(profile)
  const silhouette = getMiniatureSilhouette(profile, archetype)
  const greaterDaemon = isGreaterDaemon(profile)
  const greaterDaemonVariant = greaterDaemon ? getGreaterDaemonVariant(profile) : undefined
  const mechanical = isMechanicalArchetype(archetype)
  const scale = getMiniatureScale(profile.baseSize)
  const healthPercent = unit.currentWounds / (profile.wounds * profile.models)
  const typeLabel = getMiniatureTypeLabel(archetype, silhouette, greaterDaemonVariant)

  const basePrimary = unit.owner === 'player' ? faction.primaryColor : '#6b2020'
  const baseAccent = unit.owner === 'player' ? faction.secondaryColor : '#3a1010'
  const primaryColor = shiftColorHue(basePrimary, unit.squadTint)
  const accentColor = shiftColorHue(baseAccent, unit.squadTint * 0.6)

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

  const coherencyPairs = showCoherency ? getCoherencyPairs(unit.models, profile.baseSize) : []
  const displayName = `${profile.name} · #${unit.squadMarker}`

  const showShootHint = isShootTarget && unit.owner === 'ai' && !disableInteraction

  return (
    <group
      onClick={(e) => {
        if (disableInteraction) return
        if (requireModelClick) return
        e.stopPropagation()
        onClick()
      }}
      onPointerOver={(e) => {
        if (!showShootHint) return
        e.stopPropagation()
        document.body.style.cursor = 'crosshair'
      }}
      onPointerOut={() => {
        if (!showShootHint) return
        document.body.style.cursor = ''
      }}
    >
      {coherencyPairs.map(([left, right]) => (
        <Line
          key={`${left.id}-${right.id}`}
          points={[
            [left.position.x, 0.08, left.position.y],
            [right.position.x, 0.08, right.position.y],
          ]}
          color="#66ccff"
          lineWidth={1.5}
          transparent
          opacity={0.55}
        />
      ))}

      {unit.models.map((model) => (
        <ModelMiniature
          key={model.id}
          unit={unit}
          model={model}
          selected={selected}
          isModelSelected={selectedModelId === model.id}
          isShootTarget={isShootTarget}
          primaryColor={primaryColor}
          accentColor={accentColor}
          scale={scale}
          archetype={archetype}
          silhouette={silhouette}
          greaterDaemonVariant={greaterDaemonVariant}
          mechanical={mechanical}
          disableInteraction={disableInteraction}
          onModelClick={onModelClick}
        />
      ))}

      <group position={[unit.position.x, 0.12, unit.position.y]}>
        <mesh position={[0, 0, scale * (mechanical ? 1.1 : 0.65)]}>
          <boxGeometry args={[0.55, 0.14, 0.02]} />
          <meshBasicMaterial color="#0a0a12" transparent opacity={0.75} />
        </mesh>
        <Text
          position={[0, 0, scale * (mechanical ? 1.1 : 0.65) + 0.02]}
          fontSize={0.12}
          color={badgeColor}
          anchorX="center"
          anchorY="middle"
        >
          {typeLabel.toUpperCase()}
        </Text>
      </group>

      <group position={[unit.position.x, labelHeight, unit.position.y]}>
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
          position={[unit.position.x, labelHeight + 0.35, unit.position.y]}
          fontSize={0.35}
          color="#ffffff"
          anchorX="center"
          anchorY="bottom"
          outlineWidth={0.02}
          outlineColor="#000000"
        >
          {displayName}
        </Text>
      )}
    </group>
  )
}
