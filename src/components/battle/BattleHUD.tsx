import type { BattleState, BattleUnit, CombatDoctrine, DeployMode } from '../../types/game'
import {
  canArriveFromReserves,
  DEPLOY_MODE_HINTS,
  getDeployModeLabel,
  COHERENCY_DISTANCE,
  getModel,
  getProfile,
  getReservesUnits,
  getUnit,
  getUnitDeployModes,
  getValidShootTargets,
  describeShootLegality,
} from '../../engine/battle'
import { getDetachmentRuleConfig } from '../../data/detachmentEffects'
import { getDetachment } from '../../data/detachments'
import { getUsableStratagems } from '../../engine/detachmentBattle'
import { getBattleUnitProfile } from '../../data/battleProfile'
import { getUnitProfile } from '../../data/units'
import { UnitDetailPanel } from '../UnitDetailPanel'

interface BattleHUDProps {
  battleState: BattleState
  selectedUnit: BattleUnit | null
  aiThinking?: boolean
  llmActive?: boolean
  llmFallbackMessage?: string | null
  onSelectDeployUnit: (deployId: string | null) => void
  onSelectDeployMode: (mode: DeployMode) => void
  onDeployToReserves: () => void
  onFinishDeployment: () => void
  onSelectUnit: (unitId: string | null) => void
  onSelectModel?: (unitId: string, modelId: string) => void
  onNextPhase: () => void
  onShoot: (targetId: string) => void
  onCharge: (targetId: string) => void
  onFight: (targetId: string) => void
  onUseStratagem: (name: string, unitId?: string) => void
  onSetDoctrine: (doctrine: CombatDoctrine) => void
  onSetOathTarget: (targetId: string) => void
  onEndTurn: () => void
  onQuit: () => void
}

export function BattleHUD({
  battleState,
  selectedUnit,
  aiThinking = false,
  llmActive = false,
  llmFallbackMessage = null,
  onSelectDeployUnit,
  onSelectDeployMode,
  onDeployToReserves,
  onFinishDeployment,
  onSelectUnit,
  onSelectModel,
  onNextPhase,
  onShoot,
  onCharge,
  onFight,
  onUseStratagem,
  onSetDoctrine,
  onSetOathTarget,
  onEndTurn,
  onQuit,
}: BattleHUDProps) {
  const isPlayerTurn = battleState.activePlayer === 'player'
  const shootTargets = selectedUnit ? getValidShootTargets(battleState, selectedUnit.id) : []
  const playerDetachment = battleState.playerDetachment
  const detachmentData = getDetachment(playerDetachment.detachmentId)
  const ruleConfig = getDetachmentRuleConfig(playerDetachment.detachmentId)
  const usableStratagems = isPlayerTurn
    ? getUsableStratagems(battleState, 'player', battleState.phase)
    : []

  const isDeployment = battleState.phase === 'deployment'
  const deploymentComplete = isDeployment && battleState.pendingDeployment.length === 0 && battleState.playerUnits.length > 0
  const selectedPending = battleState.selectedDeployId
    ? battleState.pendingDeployment.find((entry) => entry.deployId === battleState.selectedDeployId)
    : null
  const selectedPendingModes = selectedPending ? getUnitDeployModes(selectedPending.profileId) : []
  const playerReserves = getReservesUnits(battleState, 'player')
  const selectedModel = selectedUnit && battleState.selectedModelId
    ? getModel(selectedUnit, battleState.selectedModelId) ?? null
    : null
  const selectedReserve = selectedUnit?.inReserves ? selectedUnit : null

  const phaseActions: Record<string, string> = {
    command: 'Begin Movement',
    movement: 'End Movement',
    shooting: 'End Shooting',
    charge: 'End Charge',
    fight: 'End Fight',
    morale: 'End Morale',
  }

  return (
    <div className="battle-hud">
      <div className="hud-top">
        <div className="turn-info">
          <span className="turn-badge">Turn {battleState.turn}</span>
          <span className={`phase-badge ${isPlayerTurn ? 'player' : 'ai'}`}>
            {isDeployment
              ? 'Deploy Your Army'
              : `${isPlayerTurn ? 'Your Turn' : llmActive ? 'LLM Turn' : 'AI Turn'} — ${battleState.phase}`}
          </span>
          {llmActive && <span className="llm-badge">LLM</span>}
        </div>
        <button className="btn btn-ghost btn-sm" onClick={onQuit}>Quit</button>
      </div>

      <div className="game-score-totals">
        <p className="game-score-totals-vp game-score-totals-vp--p1">{battleState.playerVp}</p>
        <div className="game-score-totals-center">
          <p className="game-score-vs">VS</p>
          <p className="game-score-label">Victory Points</p>
        </div>
        <p className="game-score-totals-vp game-score-totals-vp--p2">{battleState.aiVp}</p>
      </div>

      {isPlayerTurn && !battleState.isOver && !isDeployment && (
        <section className="battle-detachment-panel app-panel">
          <div className="battle-detachment-header">
            <div>
              <p className="battle-detachment-label">Your Detachment</p>
              <strong>{playerDetachment.detachmentName}</strong>
            </div>
            <div className="battle-cp-badge">
              <span>{playerDetachment.commandPoints} CP</span>
            </div>
          </div>
          <p className="battle-army-rule">
            <strong>{playerDetachment.armyRuleName}</strong>
            {detachmentData && `: ${detachmentData.armyRule.text}`}
          </p>
          {playerDetachment.doctrine && (
            <p className="battle-doctrine-active">Active doctrine: {playerDetachment.doctrine}</p>
          )}
          {playerDetachment.oathTargetId && (() => {
            const oathTarget = getUnit(battleState, playerDetachment.oathTargetId!)
            return oathTarget ? (
              <p className="battle-doctrine-active">Oath target: {getProfile(oathTarget).name}</p>
            ) : null
          })()}
        </section>
      )}

      {isDeployment && isPlayerTurn && !battleState.isOver && (
        <section className="battle-deployment-panel app-panel">
          <p className="datasheet-section-title">Deployment</p>
          <p className="action-hint">
            {battleState.pendingDeployment.length > 0
              ? `${battleState.pendingDeployment.length} unit(s) left. Pick a unit, choose Infiltrators / Scouts / Deep Strike if available, then place or hold in reserves.`
              : 'All units assigned. Finish deployment to reveal the enemy and begin the battle.'}
          </p>

          {battleState.pendingDeployment.length > 0 && (
            <div className="deploy-unit-list">
              {battleState.pendingDeployment.map((pending) => {
                const profile = getUnitProfile(pending.profileId)
                const modes = getUnitDeployModes(pending.profileId)
                const special = modes.filter((mode) => mode !== 'normal')
                return (
                  <button
                    key={pending.deployId}
                    type="button"
                    className={`btn btn-sm ${battleState.selectedDeployId === pending.deployId ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => onSelectDeployUnit(pending.deployId)}
                  >
                    {profile.name}
                    {special.length > 0 && (
                      <span className="deploy-special-tag"> · {special.map(getDeployModeLabel).join(', ')}</span>
                    )}
                  </button>
                )
              })}
            </div>
          )}

          {selectedPending && selectedPendingModes.length > 1 && (
            <div className="deploy-mode-list">
              <p className="action-hint">Deployment rule:</p>
              {selectedPendingModes.map((mode) => (
                <button
                  key={mode}
                  type="button"
                  className={`btn btn-sm ${battleState.selectedDeployMode === mode ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => onSelectDeployMode(mode)}
                >
                  {getDeployModeLabel(mode)}
                </button>
              ))}
              {battleState.selectedDeployMode && (
                <p className="action-hint">{DEPLOY_MODE_HINTS[battleState.selectedDeployMode]}</p>
              )}
            </div>
          )}

          {selectedPending && selectedPendingModes.includes('reserves') && battleState.selectedDeployMode === 'reserves' && (
            <button type="button" className="btn btn-warning btn-sm" onClick={onDeployToReserves}>
              Hold in Deep Strike Reserves
            </button>
          )}

          {playerReserves.length > 0 && (
            <div className="deploy-reserves-list">
              <p className="action-hint">In reserves ({playerReserves.length}):</p>
              {playerReserves.map((unit) => (
                <span key={unit.id} className="deploy-reserve-chip">{getProfile(unit).name}</span>
              ))}
            </div>
          )}

          {battleState.playerUnits.filter((unit) => !unit.inReserves).length > 0 && (
            <p className="deploy-placed-count">
              {battleState.playerUnits.filter((unit) => !unit.inReserves).length} on the battlefield — click a token to reposition
            </p>
          )}

          <button
            type="button"
            className="btn btn-primary"
            disabled={!deploymentComplete}
            onClick={onFinishDeployment}
          >
            Finish Deployment
          </button>
        </section>
      )}

      {isPlayerTurn && !battleState.isOver && battleState.phase === 'command' && (
        <section className="battle-stratagem-panel app-panel">
          <p className="datasheet-section-title">Command Phase</p>
          {ruleConfig.doctrineCycle && (
            <div className="doctrine-buttons">
              <p className="action-hint">Select Combat Doctrine:</p>
              {(['devastator', 'tactical', 'assault'] as CombatDoctrine[]).map((doctrine) => (
                <button
                  key={doctrine}
                  className={`btn btn-sm ${playerDetachment.doctrine === doctrine ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => onSetDoctrine(doctrine)}
                >
                  {doctrine}
                </button>
              ))}
            </div>
          )}
          {ruleConfig.oathOfMoment && (
            <div className="target-list">
              <p className="action-hint">Mark Oath of Moment target:</p>
              {battleState.aiUnits.map((target) => (
                <button
                  key={target.id}
                  className={`btn btn-sm ${playerDetachment.oathTargetId === target.id ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => onSetOathTarget(target.id)}
                >
                  {getProfile(target).name}
                </button>
              ))}
            </div>
          )}
          {usableStratagems.length > 0 && (
            <div className="stratagem-list">
              <p className="action-hint">Stratagems:</p>
              {usableStratagems.map((strat) => (
                <button
                  key={strat.name}
                  className="btn btn-sm btn-secondary stratagem-btn"
                  onClick={() => onUseStratagem(strat.name, selectedUnit?.id)}
                >
                  {strat.name} ({strat.cp} CP)
                </button>
              ))}
            </div>
          )}
        </section>
      )}

      {isPlayerTurn && !battleState.isOver && battleState.phase !== 'command' && usableStratagems.length > 0 && (
        <section className="battle-stratagem-panel app-panel">
          <p className="datasheet-section-title">Stratagems</p>
          <div className="stratagem-list">
            {usableStratagems.map((strat) => (
              <button
                key={strat.name}
                className="btn btn-sm btn-secondary stratagem-btn"
                disabled={!selectedUnit && strat.phase.toLowerCase() !== 'any'}
                onClick={() => onUseStratagem(strat.name, selectedUnit?.id)}
              >
                {strat.name} ({strat.cp} CP)
              </button>
            ))}
          </div>
          {!selectedUnit && (
            <p className="action-hint">Select a unit to apply unit stratagems.</p>
          )}
        </section>
      )}

      {battleState.isOver && (
        <div className={`battle-result ${battleState.winner === 'player' ? 'victory' : 'defeat'}`}>
          <h2>{battleState.winner === 'player' ? 'Victory!' : 'Defeat!'}</h2>
          <button className="btn btn-primary" onClick={onQuit}>Return Home</button>
        </div>
      )}

      {selectedUnit && isPlayerTurn && !battleState.isOver && !isDeployment && (
        <div className="unit-panel app-panel-elevated">
          <UnitDetailPanel unit={getBattleUnitProfile(selectedUnit)} selectedUpgrades={selectedUnit.upgrades} compact />

          <div className="battle-status">
            <h4>Current Status · Squad #{selectedUnit.squadMarker}</h4>
            <div className="unit-detail">
              <span>Models left: {selectedUnit.modelsRemaining}</span>
              <span>Wounds left: {selectedUnit.currentWounds}</span>
              <span>Moved: {selectedUnit.hasMoved ? 'Yes' : 'No'}</span>
              <span>Shot: {selectedUnit.hasShot ? 'Yes' : 'No'}</span>
            </div>
          </div>

          {selectedUnit.models.length > 1 && battleState.phase === 'movement' && (
            <div className="model-picker">
              <p className="action-hint">Select a model to move individually (must stay within {COHERENCY_DISTANCE}" coherency):</p>
              <div className="deploy-unit-list">
                {selectedUnit.models.map((model) => (
                  <button
                    key={model.id}
                    type="button"
                    className={`btn btn-sm ${selectedModel?.id === model.id ? 'btn-primary' : 'btn-secondary'}`}
                    disabled={model.hasMoved}
                    onClick={() => onSelectModel?.(selectedUnit.id, model.id)}
                  >
                    Model {model.index}{model.hasMoved ? ' (moved)' : ''}
                  </button>
                ))}
              </div>
            </div>
          )}

          {battleState.phase === 'movement' && selectedModel && !selectedModel.hasMoved && !selectedUnit.inReserves && (
            <p className="action-hint">
              Move model {selectedModel.index} up to M{getBattleUnitProfile(selectedUnit).movement}" — stay within {COHERENCY_DISTANCE}" of another model in the squad.
            </p>
          )}

          {battleState.phase === 'movement' && !selectedModel && !selectedUnit.hasMoved && !selectedUnit.inReserves && selectedUnit.models.length === 1 && (
            <p className="action-hint">Click on the battlefield to move this unit (up to M{getBattleUnitProfile(selectedUnit).movement}")</p>
          )}

          {selectedReserve && battleState.phase === 'movement' && canArriveFromReserves(selectedReserve, battleState) && (
            <p className="action-hint">Deep Strike: click the battlefield more than 9" from enemy models to arrive.</p>
          )}

          {selectedReserve && battleState.phase === 'movement' && battleState.turn < 2 && (
            <p className="action-hint">Deep Strike units cannot arrive until turn 2.</p>
          )}

          {battleState.phase === 'shooting' && !selectedUnit.inReserves && !selectedUnit.hasShot && shootTargets.length > 0 && (
            <div className="target-list">
              <p>Shoot at (click highlighted enemy on the board or use buttons):</p>
              {shootTargets.map((target) => (
                <button key={target.id} className="btn btn-sm btn-danger" onClick={() => onShoot(target.id)}>
                  {selectedUnit ? describeShootLegality(battleState, selectedUnit, target) : getProfile(target).name}
                </button>
              ))}
            </div>
          )}

          {battleState.phase === 'shooting' && !selectedUnit.hasShot && shootTargets.length === 0 && (
            <p className="action-hint">No valid targets — check range, line of sight, and indirect-fire spotters. End the Shooting phase or reposition next turn.</p>
          )}

          {battleState.phase === 'charge' && !selectedUnit.hasCharged && (
            <div className="target-list">
              <p>Charge:</p>
              {[...battleState.aiUnits].filter((e) => {
                const dist = Math.hypot(
                  selectedUnit.position.x - e.position.x,
                  selectedUnit.position.y - e.position.y,
                )
                return dist <= getProfile(selectedUnit).movement + 12
              }).map((target) => (
                <button key={target.id} className="btn btn-sm btn-warning" onClick={() => onCharge(target.id)}>
                  {getProfile(target).name}
                </button>
              ))}
            </div>
          )}

          {battleState.phase === 'fight' && selectedUnit.isEngaged && !selectedUnit.hasFought && (
            <div className="target-list">
              <p>Fight:</p>
              {battleState.aiUnits.filter((e) => {
                const dist = Math.hypot(
                  selectedUnit.position.x - e.position.x,
                  selectedUnit.position.y - e.position.y,
                )
                return dist < 3
              }).map((target) => (
                <button key={target.id} className="btn btn-sm btn-danger" onClick={() => onFight(target.id)}>
                  {getProfile(target).name}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {isPlayerTurn && !battleState.isOver && !isDeployment && battleState.phase === 'movement' && battleState.turn >= 2 && playerReserves.some((unit) => canArriveFromReserves(unit, battleState)) && (
        <section className="battle-reserves-panel app-panel">
          <p className="datasheet-section-title">Deep Strike Arrivals</p>
          <div className="deploy-unit-list">
            {playerReserves.filter((unit) => canArriveFromReserves(unit, battleState)).map((unit) => (
              <button
                key={unit.id}
                type="button"
                className={`btn btn-sm ${selectedUnit?.id === unit.id ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => onSelectUnit(unit.id)}
              >
                {getProfile(unit).name}
              </button>
            ))}
          </div>
        </section>
      )}

      {isPlayerTurn && !battleState.isOver && !isDeployment && (
        <div className="hud-bottom">
          <button className="btn btn-secondary" onClick={onNextPhase}>
            {phaseActions[battleState.phase] ?? 'Next Phase'}
          </button>
          <button className="btn btn-ghost" onClick={onEndTurn}>End Turn</button>
        </div>
      )}

      {llmFallbackMessage && (
        <p className="llm-fallback-banner">{llmFallbackMessage}</p>
      )}

      {!isPlayerTurn && !battleState.isOver && (
        <div className="ai-thinking">
          <div className="spinner" />
          <span>{aiThinking && llmActive ? 'LLM is planning…' : 'AI is thinking…'}</span>
        </div>
      )}

      <div className="battle-log">
        <h4>Battle Log</h4>
        <div className="log-entries">
          {battleState.log.slice(-8).reverse().map((entry, i) => (
            <div key={i} className={`log-entry ${entry.player}`}>
              <span className="log-turn">T{entry.turn}</span>
              {entry.message}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
