import { useMemo, useState } from 'react'
import { FACTIONS, getFactionUiColor } from '../data/factions'
import { describeArmyAllies } from '../data/factionAllies'
import { getDetachmentsForFaction } from '../data/detachments'
import { useGameStore } from '../store/gameStore'
import type { FactionId } from '../types/game'

export function DetachmentSetup() {
  const {
    playerArmy,
    setScreen,
    setFaction,
    setDetachment,
  } = useGameStore()

  const [selectedDetachmentId, setSelectedDetachmentId] = useState<string | null>(
    playerArmy.detachmentId,
  )

  const faction = FACTIONS.find((f) => f.id === playerArmy.factionId)!
  const detachments = useMemo(
    () => getDetachmentsForFaction(playerArmy.factionId),
    [playerArmy.factionId],
  )
  const selectedDetachment = detachments.find((d) => d.id === selectedDetachmentId) ?? null
  const canContinue = selectedDetachmentId !== null

  function handleFactionChange(factionId: FactionId) {
    setFaction(factionId)
    setSelectedDetachmentId(null)
  }

  function handleContinue() {
    if (!selectedDetachmentId) return
    setDetachment(selectedDetachmentId)
    setScreen('army-builder')
  }

  return (
    <div className="detachment-setup">
      <header className="page-header">
        <button className="btn btn-ghost" onClick={() => setScreen('home')}>← Back</button>
        <h2>Choose Detachment</h2>
        <button
          className="btn btn-primary"
          disabled={!canContinue}
          onClick={handleContinue}
        >
          Build Army →
        </button>
      </header>

      <div className="detachment-layout">
        <aside className="faction-panel">
          <h3>Faction</h3>
          <p className="detachment-panel-hint">Pick your army, then choose how it fights.</p>
          <div className="faction-grid">
            {FACTIONS.map((f) => (
              <button
                key={f.id}
                className={`faction-btn ${f.id === playerArmy.factionId ? 'active' : ''}`}
                style={{ '--faction-color': f.primaryColor } as React.CSSProperties}
                onClick={() => handleFactionChange(f.id)}
                title={f.description}
              >
                <span className="faction-dot" />
                {f.name}
              </button>
            ))}
          </div>
        </aside>

        <main className="detachment-main">
          <div className="detachment-main-header">
            <h3 style={{ color: getFactionUiColor(faction) }}>{faction.name} Detachments</h3>
            <p className="detachment-panel-hint">
              Detachments set your army rule and stratagems. Pick one before building your list.
            </p>
            <p className="detachment-panel-hint detachment-ally-hint">
              {describeArmyAllies(playerArmy.factionId)}
            </p>
          </div>

          <div className="detachment-grid">
            {detachments.map((det) => {
              const selected = det.id === selectedDetachmentId
              return (
                <button
                  key={det.id}
                  type="button"
                  className={`detachment-card app-panel ${selected ? 'selected' : ''}`}
                  onClick={() => setSelectedDetachmentId(det.id)}
                  style={selected ? { borderColor: getFactionUiColor(faction) } : undefined}
                >
                  <div className="detachment-card-header">
                    <h4>{det.name}</h4>
                    <span className="detachment-focus">{det.focus}</span>
                  </div>
                  <p className="detachment-description">{det.description}</p>
                  <div className="detachment-rule-preview">
                    <strong>{det.armyRule.name}</strong>
                    <span>{det.armyRule.text.slice(0, 120)}{det.armyRule.text.length > 120 ? '…' : ''}</span>
                  </div>
                </button>
              )
            })}
          </div>
        </main>

        <aside className="detachment-detail-panel app-panel">
          <h3>Detachment Details</h3>
          {!selectedDetachment && (
            <p className="detachment-empty">Select a detachment to see its army rule and stratagems.</p>
          )}
          {selectedDetachment && (
            <>
              <div className="detachment-detail-header">
                <h4 style={{ color: getFactionUiColor(faction) }}>{selectedDetachment.name}</h4>
                <span className="detachment-focus">{selectedDetachment.focus}</span>
              </div>
              <p className="detachment-description">{selectedDetachment.description}</p>

              <section className="detachment-detail-section">
                <p className="datasheet-section-title">Army Rule</p>
                <div className="datasheet-rule-card">
                  <p className="ability-name">{selectedDetachment.armyRule.name}</p>
                  <p className="ability-rule-entry">{selectedDetachment.armyRule.text}</p>
                </div>
              </section>

              <section className="detachment-detail-section">
                <p className="datasheet-section-title">Stratagems</p>
                <div className="detachment-stratagem-list">
                  {selectedDetachment.stratagems.map((strat) => (
                    <div key={strat.name} className="datasheet-rule-card">
                      <p className="ability-name">
                        {strat.name}
                        <span className="stratagem-cp">{strat.cp} CP</span>
                      </p>
                      <p className="ability-meta">{strat.phase} phase</p>
                      <p className="ability-rule-entry">{strat.effect}</p>
                    </div>
                  ))}
                </div>
              </section>
            </>
          )}
        </aside>
      </div>
    </div>
  )
}
