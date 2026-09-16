import { useCallback, useEffect, useRef, useState } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { useGameStore } from '../../store/gameStore'
import type { CombatDoctrine } from '../../types/game'
import type { ShotVisualPayload } from '../../engine/combatVfx'
import {
  chargeUnit,
  deployUnitAt,
  deployUnitToReserves,
  finishDeployment,
  fightCombat,
  getUnit,
  getValidShootTargets,
  moveModel,
  moveUnit,
  nextPhase,
  repositionDeployedUnit,
  selectDeployMode,
  selectDeployUnit,
  selectModel,
  selectUnit,
  setDoctrine,
  setOathTarget,
  shootAtTarget,
  useStratagem,
} from '../../engine/battle'
import type { DeployMode } from '../../types/game'
import { AI_DIFFICULTY_CONFIG, executeAIAction, planAITurn } from '../../ai/opponent'
import { isLlmConfigured, loadLlmSettings, resolveLlmSettings } from '../../ai/llmSettings'
import { planAITurnWithLlm } from '../../ai/llmOpponent'
import { Battlefield3D } from './Battlefield3D'
import { BattleHUD } from './BattleHUD'
import type { ActiveShotVfx } from './vfx/CombatVfxLayer'

export function Battle() {
  const { battleState, settings, setBattleState, setScreen, resetGame } = useGameStore()
  const aiProcessing = useRef(false)
  const [aiThinking, setAiThinking] = useState(false)
  const [llmFallbackMessage, setLlmFallbackMessage] = useState<string | null>(null)
  const [shotVfx, setShotVfx] = useState<ActiveShotVfx[]>([])

  const pushShotVfx = useCallback((shot: ShotVisualPayload) => {
    setShotVfx((prev) => [...prev, { ...shot, id: uuidv4() }])
  }, [])

  const removeShotVfx = useCallback((id: string) => {
    setShotVfx((prev) => prev.filter((entry) => entry.id !== id))
  }, [])

  const commitShoot = useCallback((attackerId: string, targetId: string) => {
    if (!battleState) return
    const result = shootAtTarget(battleState, attackerId, targetId)
    setBattleState(result.state)
    if (result.shot) pushShotVfx(result.shot)
  }, [battleState, pushShotVfx, setBattleState])

  const runAITurn = useCallback(async (state: typeof battleState) => {
    if (!state || state.phase === 'deployment' || state.activePlayer !== 'ai' || state.isOver || aiProcessing.current) return

    aiProcessing.current = true
    const config = AI_DIFFICULTY_CONFIG[settings.aiDifficulty]
    const llmSettings = resolveLlmSettings(loadLlmSettings())
    const useLlm = isLlmConfigured(loadLlmSettings())
    let currentState = state

    setAiThinking(useLlm)
    setLlmFallbackMessage(null)

    let actions
    if (useLlm) {
      const result = await planAITurnWithLlm(
        currentState,
        llmSettings,
        settings.aiDifficulty,
        settings.battlefieldWidth,
        settings.battlefieldHeight,
      )
      actions = result.actions
      if (result.usedFallback && result.error) {
        setLlmFallbackMessage(`LLM unavailable — using classic AI: ${result.error}`)
      }
    } else {
      actions = planAITurn(currentState, config)
    }

    setAiThinking(false)

    for (const action of actions) {
      await new Promise((r) => setTimeout(r, action.delay))
      const outcome = executeAIAction(currentState, action)
      currentState = outcome.state
      if (outcome.shot) pushShotVfx(outcome.shot)
      setBattleState(currentState)

      if (currentState.isOver) break
    }

    if (currentState.activePlayer === 'ai' && !currentState.isOver) {
      currentState = nextPhase(currentState)
      setBattleState(currentState)
    }

    aiProcessing.current = false
  }, [settings.aiDifficulty, settings.battlefieldWidth, settings.battlefieldHeight, setBattleState, pushShotVfx])

  useEffect(() => {
    if (battleState?.phase === 'deployment') return
    if (battleState?.activePlayer === 'ai' && !battleState.isOver) {
      runAITurn(battleState)
    }
  }, [battleState?.activePlayer, battleState?.phase, battleState?.turn, battleState?.isOver, runAITurn])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      if (!battleState) return
      if (battleState.activePlayer !== 'player' || battleState.isOver) return
      if (battleState.phase === 'deployment') {
        if (battleState.selectedDeployId || battleState.selectedUnitId) {
          setBattleState({
            ...battleState,
            selectedDeployId: null,
            selectedDeployMode: null,
            selectedUnitId: null,
            selectedModelId: null,
          })
        }
        return
      }
      if (!battleState.selectedUnitId) return
      setBattleState(selectUnit(battleState, null))
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [battleState, setBattleState])

  if (!battleState) {
    return (
      <div className="battle-error">
        <p>No battle in progress.</p>
        <button className="btn btn-primary" onClick={() => setScreen('home')}>Go Home</button>
      </div>
    )
  }

  const selectedUnit = battleState.selectedUnitId
    ? getUnit(battleState, battleState.selectedUnitId) ?? null
    : null

  const llmActive = isLlmConfigured(loadLlmSettings())

  const handleSelectUnit = (unitId: string | null) => {
    if (battleState.activePlayer !== 'player') return
    if (battleState.phase === 'deployment') {
      const unit = unitId ? getUnit(battleState, unitId) : null
      if (unit && unit.owner !== 'player') return
      setBattleState(selectUnit(battleState, unitId))
      return
    }

    const unit = unitId ? getUnit(battleState, unitId) : null
    if (!unit) {
      setBattleState(selectUnit(battleState, null))
      return
    }

    if (
      battleState.phase === 'shooting'
      && unit.owner === 'ai'
      && battleState.selectedUnitId
    ) {
      const shooter = getUnit(battleState, battleState.selectedUnitId)
      if (shooter?.owner === 'player' && !shooter.hasShot && !shooter.inReserves) {
        const canShoot = getValidShootTargets(battleState, shooter.id).some((target) => target.id === unit.id)
        if (canShoot) {
          commitShoot(shooter.id, unit.id)
          return
        }
      }
    }

    if (unit.owner !== 'player') return
    setBattleState(selectUnit(battleState, unitId))
  }

  const handleSelectModel = (unitId: string, modelId: string) => {
    if (battleState.activePlayer !== 'player') return
    const unit = getUnit(battleState, unitId)
    if (!unit || unit.owner !== 'player') return
    setBattleState(selectModel(battleState, unitId, modelId))
  }

  const handleSelectDeployUnit = (deployId: string | null) => {
    if (battleState.phase !== 'deployment') return
    setBattleState(selectDeployUnit(battleState, deployId))
  }

  const handleSelectDeployMode = (mode: DeployMode) => {
    if (battleState.phase !== 'deployment') return
    setBattleState(selectDeployMode(battleState, mode))
  }

  const handleDeployToReserves = () => {
    if (!battleState.selectedDeployId) return
    setBattleState(deployUnitToReserves(battleState, battleState.selectedDeployId))
  }

  const handleBoardPosition = (position: { x: number; y: number }) => {
    if (battleState.phase === 'deployment') {
      if (battleState.selectedDeployId) {
        setBattleState(deployUnitAt(battleState, battleState.selectedDeployId, position))
        return
      }
      if (battleState.selectedUnitId) {
        setBattleState(repositionDeployedUnit(battleState, battleState.selectedUnitId, position))
      }
      return
    }
    if (!battleState.selectedUnitId) return
    if (battleState.selectedModelId) {
      setBattleState(moveModel(battleState, battleState.selectedUnitId, battleState.selectedModelId, position))
      return
    }
    setBattleState(moveUnit(battleState, battleState.selectedUnitId, position))
  }

  const handleFinishDeployment = () => {
    setBattleState(finishDeployment(battleState))
  }

  const handleShoot = (targetId: string) => {
    if (!battleState.selectedUnitId) return
    commitShoot(battleState.selectedUnitId, targetId)
  }

  const handleCharge = (targetId: string) => {
    if (!battleState.selectedUnitId) return
    setBattleState(chargeUnit(battleState, battleState.selectedUnitId, targetId))
  }

  const handleFight = (targetId: string) => {
    if (!battleState.selectedUnitId) return
    setBattleState(fightCombat(battleState, battleState.selectedUnitId, targetId))
  }

  const handleNextPhase = () => {
    setBattleState(nextPhase(battleState))
  }

  const handleUseStratagem = (name: string, unitId?: string) => {
    setBattleState(useStratagem(battleState, 'player', name, unitId))
  }

  const handleSetDoctrine = (doctrine: CombatDoctrine) => {
    setBattleState(setDoctrine(battleState, 'player', doctrine))
  }

  const handleSetOathTarget = (targetId: string) => {
    setBattleState(setOathTarget(battleState, 'player', targetId))
  }

  const handleEndTurn = () => {
    let state = battleState
    while (state.activePlayer === 'player' && !state.isOver) {
      state = nextPhase(state)
    }
    setBattleState(state)
  }

  const handleQuit = () => {
    resetGame()
  }

  return (
    <div className="battle-container">
      <Battlefield3D
        battleState={battleState}
        shotVfx={shotVfx}
        onShotVfxComplete={removeShotVfx}
        onSelectUnit={handleSelectUnit}
        onSelectModel={handleSelectModel}
        onMoveUnit={handleBoardPosition}
        battlefieldWidth={settings.battlefieldWidth}
        battlefieldHeight={settings.battlefieldHeight}
      />
      <BattleHUD
        battleState={battleState}
        selectedUnit={selectedUnit}
        aiThinking={aiThinking}
        llmActive={llmActive}
        llmFallbackMessage={llmFallbackMessage}
        onSelectDeployUnit={handleSelectDeployUnit}
        onSelectDeployMode={handleSelectDeployMode}
        onDeployToReserves={handleDeployToReserves}
        onFinishDeployment={handleFinishDeployment}
        onSelectUnit={handleSelectUnit}
        onSelectModel={handleSelectModel}
        onNextPhase={handleNextPhase}
        onShoot={handleShoot}
        onCharge={handleCharge}
        onFight={handleFight}
        onUseStratagem={handleUseStratagem}
        onSetDoctrine={handleSetDoctrine}
        onSetOathTarget={handleSetOathTarget}
        onEndTurn={handleEndTurn}
        onQuit={handleQuit}
      />
    </div>
  )
}
