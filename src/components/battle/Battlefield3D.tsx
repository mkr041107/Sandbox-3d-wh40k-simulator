import { useMemo, useRef, useState } from 'react'
import { Canvas, type ThreeEvent } from '@react-three/fiber'
import { ContactShadows, Grid, OrbitControls, Sky, Stars, Text } from '@react-three/drei'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'
import type { BattleState, Position } from '../../types/game'
import { getValidShootTargets } from '../../engine/battle'
import { getBattleUnitProfile } from '../../data/battleProfile'
import { UnitToken } from './UnitToken'
import { BattlefieldTerrain } from './BattlefieldTerrain'
import { MovementRangeRing } from './MovementRangeRing'
import { BattlefieldCameraControls, type CameraPreset } from './BattlefieldCameraControls'

interface Battlefield3DProps {
  battleState: BattleState
  onSelectUnit: (unitId: string | null) => void
  onMoveUnit: (position: Position) => void
  battlefieldWidth: number
  battlefieldHeight: number
}

function BattlefieldScene({
  battleState,
  onSelectUnit,
  onMoveUnit,
  battlefieldWidth,
  battlefieldHeight,
  cameraPreset,
  controlsRef,
}: Battlefield3DProps & {
  cameraPreset: CameraPreset
  controlsRef: React.RefObject<OrbitControlsImpl | null>
}) {
  const [hoverPos, setHoverPos] = useState<Position | null>(null)
  const cx = battlefieldWidth / 2
  const cz = battlefieldHeight / 2

  const selectedUnit = battleState.selectedUnitId
    ? [...battleState.playerUnits, ...battleState.aiUnits].find((u) => u.id === battleState.selectedUnitId)
    : null

  const selectedProfile = selectedUnit ? getBattleUnitProfile(selectedUnit) : null

  const shootTargetIds = useMemo(() => {
    if (!selectedUnit || battleState.phase !== 'shooting') return new Set<string>()
    return new Set(getValidShootTargets(battleState, selectedUnit.id).map((u) => u.id))
  }, [battleState, selectedUnit])

  const handleGroundClick = (e: ThreeEvent<MouseEvent>) => {
    if (battleState.activePlayer !== 'player' || battleState.phase !== 'movement') return
    if (!selectedUnit) return
    onMoveUnit({ x: e.point.x, y: e.point.z })
  }

  return (
    <>
      <color attach="background" args={['#0c1018']} />
      <fog attach="fog" args={['#0c1018', 45, 120]} />

      <Sky distance={450000} sunPosition={[80, 40, 60]} inclination={0.52} azimuth={0.22} />
      <Stars radius={120} depth={60} count={1200} factor={3} saturation={0} fade speed={0.4} />

      <ambientLight intensity={0.35} />
      <directionalLight
        position={[40, 60, 30]}
        intensity={1.4}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-40}
        shadow-camera-right={40}
        shadow-camera-top={40}
        shadow-camera-bottom={-40}
      />
      <directionalLight position={[-30, 25, -20]} intensity={0.25} color="#6688cc" />
      <hemisphereLight args={['#88aacc', '#2a2018', 0.4]} />

      {/* Battle mat — 1 grid square ≈ 1" */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[cx, 0, cz]}
        receiveShadow
        onClick={handleGroundClick}
        onPointerMove={(e) => {
          if (selectedUnit && battleState.phase === 'movement') {
            setHoverPos({ x: e.point.x, y: e.point.z })
          }
        }}
        onPointerLeave={() => setHoverPos(null)}
      >
        <planeGeometry args={[battlefieldWidth, battlefieldHeight]} />
        <meshStandardMaterial color="#2d3a2e" roughness={0.95} metalness={0.02} />
      </mesh>

      <Grid
        position={[cx, 0.01, cz]}
        args={[battlefieldWidth, battlefieldHeight]}
        cellSize={1}
        cellThickness={0.4}
        cellColor="#3d4f3d"
        sectionSize={6}
        sectionThickness={0.9}
        sectionColor="#5a6e5a"
        fadeDistance={90}
        infiniteGrid={false}
      />

      {/* Deployment zones */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[cx, 0.02, 6]}>
        <planeGeometry args={[battlefieldWidth - 4, 9]} />
        <meshBasicMaterial color="#1a4a7a" transparent opacity={0.12} />
      </mesh>
      <Text position={[cx, 0.15, 3]} fontSize={0.7} color="#4488cc" anchorX="center">
        YOUR DEPLOYMENT
      </Text>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[cx, 0.02, battlefieldHeight - 6]}>
        <planeGeometry args={[battlefieldWidth - 4, 9]} />
        <meshBasicMaterial color="#7a1a1a" transparent opacity={0.12} />
      </mesh>
      <Text position={[cx, 0.15, battlefieldHeight - 3]} fontSize={0.7} color="#cc4444" anchorX="center">
        ENEMY DEPLOYMENT
      </Text>

      <BattlefieldTerrain width={battlefieldWidth} height={battlefieldHeight} />

      {/* Primary objective */}
      <group position={[cx, 0, cz]}>
        <mesh position={[0, 0.35, 0]}>
          <cylinderGeometry args={[1.6, 1.8, 0.7, 6]} />
          <meshStandardMaterial color="#c9a227" metalness={0.85} roughness={0.25} emissive="#c9a227" emissiveIntensity={0.25} />
        </mesh>
        <mesh position={[0, 0.75, 0]}>
          <octahedronGeometry args={[0.45, 0]} />
          <meshStandardMaterial color="#ffd700" metalness={0.9} roughness={0.2} emissive="#ffaa00" emissiveIntensity={0.4} />
        </mesh>
        <Text position={[0, 1.5, 0]} fontSize={0.55} color="#ffd700" anchorX="center">
          OBJECTIVE
        </Text>
      </group>

      <ContactShadows position={[0, 0.02, 0]} opacity={0.45} scale={80} blur={2.5} far={30} color="#000000" />

      {selectedUnit && selectedProfile && battleState.phase === 'movement' && battleState.activePlayer === 'player' && (
        <MovementRangeRing
          x={selectedUnit.position.x}
          z={selectedUnit.position.y}
          radius={selectedProfile.movement}
        />
      )}

      {hoverPos && selectedUnit && battleState.phase === 'movement' && (
        <mesh position={[hoverPos.x, 0.05, hoverPos.y]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.4, 0.55, 32]} />
          <meshBasicMaterial color="#00ffaa" transparent opacity={0.75} />
        </mesh>
      )}

      {battleState.playerUnits.map((unit) => (
        <UnitToken
          key={unit.id}
          unit={unit}
          selected={unit.id === battleState.selectedUnitId}
          isShootTarget={shootTargetIds.has(unit.id)}
          onClick={() => onSelectUnit(unit.id)}
        />
      ))}
      {battleState.aiUnits.map((unit) => (
        <UnitToken
          key={unit.id}
          unit={unit}
          selected={unit.id === battleState.selectedUnitId}
          isShootTarget={shootTargetIds.has(unit.id)}
          onClick={() => onSelectUnit(unit.id)}
        />
      ))}

      <BattlefieldCameraControls
        preset={cameraPreset}
        target={[cx, 0, cz]}
        controlsRef={controlsRef}
      />

      <OrbitControls
        ref={controlsRef}
        makeDefault
        enablePan
        enableZoom
        minPolarAngle={0.1}
        maxPolarAngle={Math.PI / 2.5}
        target={[cx, 0, cz]}
        maxDistance={90}
        minDistance={12}
      />
    </>
  )
}

const CAMERA_LABELS: Record<CameraPreset, string> = {
  table: 'Table',
  tactical: 'Top Down',
  cinematic: 'Cinematic',
}

export function Battlefield3D(props: Battlefield3DProps) {
  const { battlefieldWidth, battlefieldHeight } = props
  const [cameraPreset, setCameraPreset] = useState<CameraPreset>('table')
  const controlsRef = useRef<OrbitControlsImpl | null>(null)

  return (
    <div className="battlefield-3d">
      <div className="battlefield-camera-bar">
        {(Object.keys(CAMERA_LABELS) as CameraPreset[]).map((key) => (
          <button
            key={key}
            type="button"
            className={`camera-preset-btn ${cameraPreset === key ? 'active' : ''}`}
            onClick={() => setCameraPreset(key)}
          >
            {CAMERA_LABELS[key]}
          </button>
        ))}
        <span className="camera-hint">Scroll zoom · Drag rotate · Right-drag pan</span>
      </div>
      <Canvas
        shadows
        camera={{ position: [battlefieldWidth / 2, 35, battlefieldHeight / 2 + 25], fov: 48 }}
        gl={{ antialias: true, powerPreference: 'high-performance' }}
      >
        <BattlefieldScene
          {...props}
          cameraPreset={cameraPreset}
          controlsRef={controlsRef}
        />
      </Canvas>
    </div>
  )
}
