import type { BattleState, BattleUnit } from '../../types/game'
import { getProfile, getValidShootTargets } from '../../engine/battle'
import { getBattleUnitProfile } from '../../data/battleProfile'
import { UnitDetailPanel } from '../UnitDetailPanel'

interface BattleHUDProps {
  battleState: BattleState
  selectedUnit: BattleUnit | null
  onNextPhase: () => void
  onShoot: (targetId: string) => void
  onCharge: (targetId: string) => void
  onFight: (targetId: string) => void
  onEndTurn: () => void
  onQuit: () => void
}

export function BattleHUD({
  battleState,
  selectedUnit,
  onNextPhase,
  onShoot,
  onCharge,
  onFight,
  onEndTurn,
  onQuit,
}: BattleHUDProps) {
  const isPlayerTurn = battleState.activePlayer === 'player'
  const shootTargets = selectedUnit ? getValidShootTargets(battleState, selectedUnit.id) : []

  const phaseActions: Record<string, string> = {
    command: 'Skip Command',
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
            {isPlayerTurn ? 'Your Turn' : 'AI Turn'} — {battleState.phase}
          </span>
        </div>
        <div className="vp-display">
          <span className="vp-player">You: {battleState.playerVp} VP</span>
          <span className="vp-ai">AI: {battleState.aiVp} VP</span>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={onQuit}>Quit</button>
      </div>

      {battleState.isOver && (
        <div className={`battle-result ${battleState.winner === 'player' ? 'victory' : 'defeat'}`}>
          <h2>{battleState.winner === 'player' ? 'Victory!' : 'Defeat!'}</h2>
          <button className="btn btn-primary" onClick={onQuit}>Return Home</button>
        </div>
      )}

      {selectedUnit && isPlayerTurn && !battleState.isOver && (
        <div className="unit-panel">
          <UnitDetailPanel unit={getBattleUnitProfile(selectedUnit)} selectedUpgrades={selectedUnit.upgrades} compact />

          <div className="battle-status">
            <h4>Current Status</h4>
            <div className="unit-detail">
              <span>Models left: {selectedUnit.modelsRemaining}</span>
              <span>Wounds left: {selectedUnit.currentWounds}</span>
              <span>Moved: {selectedUnit.hasMoved ? 'Yes' : 'No'}</span>
              <span>Shot: {selectedUnit.hasShot ? 'Yes' : 'No'}</span>
            </div>
          </div>

          {battleState.phase === 'movement' && !selectedUnit.hasMoved && (
            <p className="action-hint">Click on the battlefield to move this unit (up to M{getBattleUnitProfile(selectedUnit).movement}")</p>
          )}

          {battleState.phase === 'shooting' && !selectedUnit.hasShot && shootTargets.length > 0 && (
            <div className="target-list">
              <p>Shoot at:</p>
              {shootTargets.map((target) => (
                <button key={target.id} className="btn btn-sm btn-danger" onClick={() => onShoot(target.id)}>
                  {getProfile(target).name}
                </button>
              ))}
            </div>
          )}

          {battleState.phase === 'shooting' && !selectedUnit.hasShot && shootTargets.length === 0 && (
            <p className="action-hint">No valid targets in range. End the Shooting phase or move closer next turn.</p>
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

      {isPlayerTurn && !battleState.isOver && (
        <div className="hud-bottom">
          <button className="btn btn-secondary" onClick={onNextPhase}>
            {phaseActions[battleState.phase] ?? 'Next Phase'}
          </button>
          <button className="btn btn-ghost" onClick={onEndTurn}>End Turn</button>
        </div>
      )}

      {!isPlayerTurn && !battleState.isOver && (
        <div className="ai-thinking">
          <div className="spinner" />
          <span>AI is thinking...</span>
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
