import { FACTIONS } from '../data/factions'
import { calculateArmyPoints, calculateEntryPoints, getUnitProfile } from '../data/units'
import { formatUpgradeList } from './SquadUpgradeSelector'
import { LlmSettingsPanel } from './LlmSettingsPanel'
import { useGameStore } from '../store/gameStore'
import type { AIDifficulty } from '../types/game'

const DIFFICULTIES: { id: AIDifficulty; label: string; description: string }[] = [
  { id: 'recruit', label: 'Recruit', description: 'Slow reactions, poor target selection, hesitant aggression' },
  { id: 'battle-brother', label: 'Battle Brother', description: 'Solid fundamentals, focus fire on weak targets' },
  { id: 'veteran', label: 'Veteran', description: 'Strong tactics, good positioning, punishes mistakes' },
  { id: 'chapter-master', label: 'Chapter Master', description: 'Near-optimal play, perfect target priority' },
]

export function BattleSetup() {
  const {
    playerArmy,
    settings,
    setScreen,
    setAIDifficulty,
    setAIFaction,
    setPointsLimit,
    startBattle,
  } = useGameStore()

  const totalPoints = calculateArmyPoints(playerArmy.entries)
  const playerFaction = FACTIONS.find((f) => f.id === playerArmy.factionId)!
  const aiFaction = FACTIONS.find((f) => f.id === settings.aiFactionId)!
  const canStart = playerArmy.entries.length > 0 && totalPoints <= playerArmy.pointsLimit

  return (
    <div className="battle-setup">
      <header className="page-header">
        <button className="btn btn-ghost" onClick={() => setScreen('army-builder')}>← Army Builder</button>
        <h2>Battle Setup</h2>
        <button className="btn btn-primary" disabled={!canStart} onClick={startBattle}>
          Start Battle
        </button>
      </header>

      <div className="setup-layout">
        <section className="setup-card">
          <h3>Your Army</h3>
          <div className="army-preview" style={{ borderColor: playerFaction.primaryColor }}>
            <h4 style={{ color: playerFaction.primaryColor }}>{playerArmy.name}</h4>
            <p>{playerFaction.name} — {totalPoints} pts</p>
            <ul className="army-preview-list">
              {playerArmy.entries.map((e) => {
                const unit = getUnitProfile(e.profileId)
                const upgrades = e.upgrades.length > 0
                  ? formatUpgradeList(e.upgrades, e.profileId)
                  : null
                return (
                  <li key={e.entryId}>
                    <strong>{unit.name}</strong> ×{e.count} ({calculateEntryPoints(e)} pts)
                    {upgrades && <span className="preview-upgrades"> — {upgrades}</span>}
                  </li>
                )
              })}
            </ul>
            {playerArmy.entries.length === 0 && (
              <p className="warning">No units in army! <button className="link-btn" onClick={() => setScreen('army-builder')}>Build one</button></p>
            )}
          </div>
        </section>

        <section className="setup-card">
          <h3>Battle Settings</h3>
          <div className="form-group">
            <label>Points Limit</label>
            <select value={settings.pointsLimit} onChange={(e) => setPointsLimit(Number(e.target.value))}>
              <option value={500}>500 pts</option>
              <option value={1000}>1000 pts</option>
              <option value={1500}>1500 pts</option>
              <option value={2000}>2000 pts</option>
            </select>
          </div>
        </section>

        <section className="setup-card">
          <h3>AI Opponent</h3>
          <div className="form-group">
            <label>Enemy Faction</label>
            <select value={settings.aiFactionId} onChange={(e) => setAIFaction(e.target.value as typeof settings.aiFactionId)}>
              {FACTIONS.map((f) => (
                <option key={f.id} value={f.id}>{f.name}</option>
              ))}
            </select>
          </div>
          <div className="ai-faction-preview" style={{ borderColor: aiFaction.primaryColor }}>
            <span style={{ color: aiFaction.primaryColor }}>{aiFaction.name}</span>
            <p>{aiFaction.description}</p>
          </div>

          <div className="form-group">
            <label>Difficulty</label>
            <div className="difficulty-grid">
              {DIFFICULTIES.map((d) => (
                <button
                  key={d.id}
                  className={`difficulty-btn ${settings.aiDifficulty === d.id ? 'active' : ''}`}
                  onClick={() => setAIDifficulty(d.id)}
                >
                  <strong>{d.label}</strong>
                  <span>{d.description}</span>
                </button>
              ))}
            </div>
          </div>
        </section>

        <LlmSettingsPanel />
      </div>
    </div>
  )
}
