import { useCallback, useEffect, useRef, useState } from 'react'
import { useGameStore } from '../../store/gameStore'
import {
  chargeUnit,
  fightCombat,
  getUnit,
  moveUnit,
  nextPhase,
  selectUnit,
  shootAtTarget,
} from '../../engine/battle'
import { AI_DIFFICULTY_CONFIG, executeAIAction, planAITurn } from '../../ai/opponent'
import { isLlmConfigured, loadLlmSettings, resolveLlmSettings } from '../../ai/llmSettings'
import { planAITurnWithLlm } from '../../ai/llmOpponent'
import { Battlefield3D } from './Battlefield3D'
import { BattleHUD } from './BattleHUD'

export function Battle() {
  const { battleState, settings, setBattleState, setScreen, resetGame } = useGameStore()
  const aiProcessing = useRef(false)
  const [aiThinking, setAiThinking] = useState(false)
  const [llmFallbackMessage, setLlmFallbackMessage] = useState<string | null>(null)

  const runAITurn = useCallback(async (state: typeof battleState) => {
    if (!state || state.activePlayer !== 'ai' || state.isOver || aiProcessing.current) return

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
      currentState = executeAIAction(currentState, action)
      setBattleState(currentState)

      if (currentState.isOver) break
    }

    if (currentState.activePlayer === 'ai' && !currentState.isOver) {
      currentState = nextPhase(currentState)
      setBattleState(currentState)
    }

    aiProcessing.current = false
  }, [settings.aiDifficulty, settings.battlefieldWidth, settings.battlefieldHeight, setBattleState])

  useEffect(() => {
    if (battleState?.activePlayer === 'ai' && !battleState.isOver) {
      runAITurn(battleState)
    }
  }, [battleState?.activePlayer, battleState?.phase, battleState?.turn, battleState?.isOver, runAITurn])

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
    const unit = unitId ? getUnit(battleState, unitId) : null
    if (unit && unit.owner !== 'player') return
    setBattleState(selectUnit(battleState, unitId))
  }

  const handleMove = (position: { x: number; y: number }) => {
    if (!battleState.selectedUnitId) return
    setBattleState(moveUnit(battleState, battleState.selectedUnitId, position))
  }

  const handleShoot = (targetId: string) => {
    if (!battleState.selectedUnitId) return
    setBattleState(shootAtTarget(battleState, battleState.selectedUnitId, targetId))
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
        onSelectUnit={handleSelectUnit}
        onMoveUnit={handleMove}
        battlefieldWidth={settings.battlefieldWidth}
        battlefieldHeight={settings.battlefieldHeight}
      />
      <BattleHUD
        battleState={battleState}
        selectedUnit={selectedUnit}
        aiThinking={aiThinking}
        llmActive={llmActive}
        llmFallbackMessage={llmFallbackMessage}
        onNextPhase={handleNextPhase}
        onShoot={handleShoot}
        onCharge={handleCharge}
        onFight={handleFight}
        onEndTurn={handleEndTurn}
        onQuit={handleQuit}
      />
    </div>
  )
}
