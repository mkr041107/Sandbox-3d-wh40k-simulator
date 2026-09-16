import { useMemo } from 'react'
import type { GreaterDaemonVariant } from './greaterDaemon'
import type { MiniatureArchetype } from './miniatureArchetype'
import type { MiniatureSilhouette } from './miniatureSilhouette'
import { isMechanicalArchetype, silhouetteLabel } from './miniatureSilhouette'
import {
  DaemonMonsterBody,
  FlyerBody,
  GreaterDaemonBody,
  HumanoidMonsterBody,
  KnightBody,
  MiniatureBase,
  renderHumanoid,
  TankBody,
  TyranidMonsterBody,
  VehicleBody,
  WalkerBody,
} from './silhouetteBodies'

interface ProceduralMiniatureProps {
  archetype: MiniatureArchetype
  silhouette: MiniatureSilhouette
  greaterDaemonVariant?: GreaterDaemonVariant
  primaryColor: string
  accentColor: string
  scale: number
  selected: boolean
}

export function ProceduralMiniature({
  archetype,
  silhouette,
  greaterDaemonVariant,
  primaryColor,
  accentColor,
  scale,
  selected,
}: ProceduralMiniatureProps) {
  const mechanical = isMechanicalArchetype(archetype)
  const isGreaterDaemon = Boolean(greaterDaemonVariant)

  const baseRadius = useMemo(() => {
    if (mechanical) return scale * 0.9
    if (isGreaterDaemon) return scale * 0.85
    const mult = archetype === 'titanic' || silhouette === 'knight' ? 1.5 : 1
    return scale * 0.55 * mult
  }, [archetype, isGreaterDaemon, mechanical, scale, silhouette])

  const bodyProps = { color: primaryColor, accent: accentColor, scale }

  const selectionRing = mechanical ? (
    <mesh position={[0, 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[baseRadius * 2.2, baseRadius * 1.6]} />
      <meshBasicMaterial color="#ffd700" transparent opacity={0.35} />
    </mesh>
  ) : (
    <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[baseRadius * 1.12, baseRadius * 1.32, 32]} />
      <meshBasicMaterial color="#ffd700" transparent opacity={0.85} />
    </mesh>
  )

  function renderBody() {
    if (greaterDaemonVariant) {
      return <GreaterDaemonBody {...bodyProps} variant={greaterDaemonVariant} />
    }
    if (archetype === 'tank') return <TankBody {...bodyProps} />
    if (archetype === 'vehicle') return <VehicleBody color={primaryColor} scale={scale} />
    if (archetype === 'walker') return <WalkerBody {...bodyProps} silhouette={silhouette} />
    if (archetype === 'flyer') return <FlyerBody {...bodyProps} />
    if (archetype === 'titanic' || silhouette === 'knight') return <KnightBody {...bodyProps} />

    if (archetype === 'monster') {
      if (silhouette === 'daemon') return <DaemonMonsterBody {...bodyProps} />
      if (silhouette === 'tyranid') return <TyranidMonsterBody {...bodyProps} />
      return <HumanoidMonsterBody {...bodyProps} />
    }

    if (archetype === 'character') {
      return renderHumanoid(silhouette, { ...bodyProps, hero: true })
    }

    return renderHumanoid(silhouette, bodyProps)
  }

  const showRoundBase = !mechanical && !isGreaterDaemon && archetype !== 'titanic' && silhouette !== 'knight'
  const baseShape = isGreaterDaemon || silhouette === 'ork' ? 'oval' as const : 'round' as const

  return (
    <group>
      {selected && selectionRing}

      {(showRoundBase || isGreaterDaemon) && (
        <MiniatureBase radius={baseRadius} rimColor={primaryColor} shape={baseShape} />
      )}

      {mechanical && (
        <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[baseRadius * 2.4, baseRadius * 1.8]} />
          <meshStandardMaterial color="#0d0d0d" roughness={0.95} metalness={0.1} />
        </mesh>
      )}

      {renderBody()}
    </group>
  )
}

export function getMiniatureTypeLabel(
  archetype: MiniatureArchetype,
  silhouette: MiniatureSilhouette,
  greaterDaemonVariant?: GreaterDaemonVariant,
): string {
  if (greaterDaemonVariant) return 'Greater Daemon'
  if (archetype === 'tank') return 'Tank'
  if (archetype === 'vehicle') return 'Vehicle'
  if (archetype === 'walker') return 'Walker'
  if (archetype === 'flyer') return 'Flyer'
  if (archetype === 'titanic' || silhouette === 'knight') return 'Lord of War'
  if (archetype === 'monster') return silhouette === 'daemon' ? 'Daemon' : 'Monster'
  if (archetype === 'character') return `${silhouetteLabel(silhouette)} HQ`
  return silhouetteLabel(silhouette)
}
