import { useMemo, useState } from 'react'
import { FACTIONS, getFactionUiColor } from '../data/factions'
import { calculateArmyPoints, calculateEntryPoints, getUnitsForFaction } from '../data/units'
import { calculateUpgradePoints, getUpgradesForUnit } from '../data/squadUpgrades'
import { useGameStore } from '../store/gameStore'
import type { UnitCategory, UnitProfile } from '../types/game'
import { UnitDetailPanel } from './UnitDetailPanel'
import { SquadUpgradeSelector, formatUpgradeList } from './SquadUpgradeSelector'
import { CATEGORY_GLOSSARY } from '../data/glossary'

const CATEGORIES: UnitCategory[] = [
  'hq', 'troops', 'elites', 'fast-attack', 'heavy-support', 'lord-of-war',
]

const CATEGORY_LABELS: Record<UnitCategory, string> = {
  hq: 'HQ',
  troops: 'Troops',
  elites: 'Elites',
  'fast-attack': 'Fast Attack',
  'heavy-support': 'Heavy Support',
  flyer: 'Flyer',
  'dedicated-transport': 'Dedicated Transport',
  'lord-of-war': 'Lord of War',
}

export function ArmyBuilder() {
  const {
    playerArmy,
    setScreen,
    setFaction,
    setArmyName,
    addUnit,
    removeUnit,
    clearArmy,
    setPointsLimit,
  } = useGameStore()

  const [filterCategory, setFilterCategory] = useState<UnitCategory | 'all'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedUnit, setSelectedUnit] = useState<UnitProfile | null>(null)
  const [pendingUpgrades, setPendingUpgrades] = useState<string[]>([])
  const [showGlossary, setShowGlossary] = useState(false)

  const faction = FACTIONS.find((f) => f.id === playerArmy.factionId)!
  const availableUnits = getUnitsForFaction(playerArmy.factionId)
  const totalPoints = calculateArmyPoints(playerArmy.entries)

  const filteredUnits = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    return availableUnits.filter((u) => {
      if (filterCategory !== 'all' && u.category !== filterCategory) return false
      if (!query) return true
      return u.name.toLowerCase().includes(query) || u.id.includes(query)
    })
  }, [availableUnits, filterCategory, searchQuery])

  const canDeploy = playerArmy.entries.length > 0 && totalPoints <= playerArmy.pointsLimit

  return (
    <div className="army-builder">
      <header className="page-header">
        <button className="btn btn-ghost" onClick={() => setScreen('home')}>← Back</button>
        <h2>Army Builder</h2>
        <button
          className="btn btn-primary"
          disabled={!canDeploy}
          onClick={() => setScreen('battle-setup')}
        >
          Deploy →
        </button>
      </header>

      <div className="builder-layout">
        <aside className="faction-panel">
          <h3>Faction</h3>
          <div className="faction-grid">
            {FACTIONS.map((f) => (
              <button
                key={f.id}
                className={`faction-btn ${f.id === playerArmy.factionId ? 'active' : ''}`}
                style={{ '--faction-color': f.primaryColor } as React.CSSProperties}
                onClick={() => setFaction(f.id)}
                title={f.description}
              >
                <span className="faction-dot" />
                {f.name}
              </button>
            ))}
          </div>
        </aside>

        <main className="unit-catalog">
          <div className="catalog-header">
            <div className="catalog-title-row">
              <h3 style={{ color: getFactionUiColor(faction) }}>
                {faction.name} Units ({filteredUnits.length}/{availableUnits.length})
              </h3>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowGlossary(!showGlossary)}>
                {showGlossary ? 'Hide' : '?'} Rules Guide
              </button>
            </div>
            {showGlossary && (
              <div className="rules-guide">
                <p><strong>New to Warhammer?</strong> Click any unit card to see its full description, weapons, and tips. Stats explained:</p>
                <div className="guide-stats">
                  <span title="Movement — how far the unit moves">M = Movement</span>
                  <span title="Toughness — how hard to wound">T = Toughness</span>
                  <span title="Armour save on D6">Sv = Save</span>
                  <span title="Wounds per model">W = Wounds</span>
                  <span title="Objective Control">OC = Objectives</span>
                </div>
              </div>
            )}
            <input
              className="unit-search"
              type="search"
              placeholder="Search units..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <div className="category-filters">
              <button
                className={`filter-btn ${filterCategory === 'all' ? 'active' : ''}`}
                onClick={() => setFilterCategory('all')}
              >
                All
              </button>
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  className={`filter-btn ${filterCategory === cat ? 'active' : ''}`}
                  onClick={() => setFilterCategory(cat)}
                >
                  {CATEGORY_LABELS[cat]}
                </button>
              ))}
            </div>
          </div>

          <div className="unit-grid">
            {filteredUnits.map((unit) => {
              const inArmy = playerArmy.entries.filter((e) => e.profileId === unit.id)
              const inArmyCount = inArmy.reduce((s, e) => s + e.count, 0)
              const hasUpgrades = getUpgradesForUnit(unit.id).length > 0
              const canAdd = totalPoints + unit.points <= playerArmy.pointsLimit
              return (
                <div
                  key={unit.id}
                  className={`unit-card ${selectedUnit?.id === unit.id ? 'selected' : ''}`}
                  onClick={() => {
                    setSelectedUnit(unit)
                    setPendingUpgrades([])
                  }}
                >
                  <div className="unit-card-header">
                    <span className="unit-category" title={CATEGORY_GLOSSARY[unit.category].explanation}>
                      {CATEGORY_LABELS[unit.category]}
                    </span>
                    <span className="unit-points">{unit.points} pts</span>
                  </div>
                  <h4>{unit.name}</h4>
                  {unit.role && <span className="unit-role">{unit.role}</span>}
                  <p className="unit-blurb">{unit.description?.slice(0, 100)}{(unit.description?.length ?? 0) > 100 ? '…' : ''}</p>
                  <div className="unit-stats">
                    <span title="Movement">M{unit.movement}</span>
                    <span title="Toughness">T{unit.toughness}</span>
                    <span title="Save">Sv{unit.save}+</span>
                    <span title="Wounds">W{unit.wounds}</span>
                    <span title="Models">{unit.models} models</span>
                  </div>
                  {hasUpgrades && (
                    <span className="unit-upgrade-badge">Customisable</span>
                  )}
                  <div className="unit-actions" onClick={(e) => e.stopPropagation()}>
                    {inArmyCount > 0 && <span className="unit-count">×{inArmyCount} in army</span>}
                    <button
                      className="btn btn-sm btn-primary"
                      disabled={!canAdd}
                      onClick={() => {
                        setSelectedUnit(unit)
                        setPendingUpgrades([])
                      }}
                    >
                      Configure
                    </button>
                  </div>
                </div>
              )
            })}
          </div>

          {selectedUnit && (
            <div className="unit-detail-overlay" onClick={() => setSelectedUnit(null)}>
              <div className="unit-detail-modal unit-detail-modal-wide app-panel-elevated" onClick={(e) => e.stopPropagation()}>
                <UnitDetailPanel
                  unit={selectedUnit}
                  selectedUpgrades={pendingUpgrades}
                  onClose={() => setSelectedUnit(null)}
                />
                <SquadUpgradeSelector
                  profileId={selectedUnit.id}
                  selected={pendingUpgrades}
                  onChange={setPendingUpgrades}
                />
                <div className="detail-modal-actions">
                  <span className="modal-points-preview">
                    {selectedUnit.points + calculateUpgradePoints(pendingUpgrades)} pts per squad
                  </span>
                  <button
                    className="btn btn-primary"
                    disabled={
                      totalPoints + selectedUnit.points + calculateUpgradePoints(pendingUpgrades)
                      > playerArmy.pointsLimit
                    }
                    onClick={() => {
                      addUnit(selectedUnit.id, pendingUpgrades)
                      setSelectedUnit(null)
                      setPendingUpgrades([])
                    }}
                  >
                    Add to Army
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>

        <aside className="army-roster">
          <h3>Your Army</h3>
          <input
            className="army-name-input"
            value={playerArmy.name}
            onChange={(e) => setArmyName(e.target.value)}
            placeholder="Army name"
          />
          <div className="points-selector">
            <label>Points Limit</label>
            <select
              value={playerArmy.pointsLimit}
              onChange={(e) => setPointsLimit(Number(e.target.value))}
            >
              <option value={500}>500</option>
              <option value={1000}>1000</option>
              <option value={1500}>1500</option>
              <option value={2000}>2000</option>
            </select>
          </div>
          <div className={`points-total ${totalPoints > playerArmy.pointsLimit ? 'over' : ''}`}>
            {totalPoints} / {playerArmy.pointsLimit} pts
          </div>

          <div className="roster-list">
            {playerArmy.entries.length === 0 && (
              <p className="empty-roster">Add units from the catalog</p>
            )}
            {playerArmy.entries.map((entry) => {
              const unit = availableUnits.find((u) => u.id === entry.profileId)!
              const upgradeLabel = entry.upgrades.length > 0
                ? formatUpgradeList(entry.upgrades, entry.profileId)
                : null
              return (
                <div key={entry.entryId} className="roster-entry-block">
                  <button
                    className="roster-entry roster-entry-btn"
                    onClick={() => {
                      setSelectedUnit(unit)
                      setPendingUpgrades(entry.upgrades)
                    }}
                    title={unit.description}
                  >
                    <span>{unit.name} ×{entry.count}</span>
                    <span>{calculateEntryPoints(entry)} pts</span>
                  </button>
                  {upgradeLabel && (
                    <p className="roster-upgrades">{upgradeLabel}</p>
                  )}
                  <button
                    className="btn btn-sm btn-danger roster-remove"
                    onClick={() => removeUnit(entry.entryId)}
                  >
                    Remove
                  </button>
                </div>
              )
            })}
          </div>

          {playerArmy.entries.length > 0 && (
            <button className="btn btn-ghost btn-full" onClick={clearArmy}>
              Clear Army
            </button>
          )}
        </aside>
      </div>
    </div>
  )
}
