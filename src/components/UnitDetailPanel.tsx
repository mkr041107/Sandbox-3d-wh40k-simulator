import type { UnitProfile } from '../types/game'
import { CATEGORY_GLOSSARY } from '../data/glossary'
import { applyUpgradesToProfile, calculateUpgradePoints, getUpgradeById } from '../data/squadUpgrades'
import { getEnrichedUnitProfile } from '../data/units'
import { UnitDatasheet } from './UnitDatasheet'

interface UnitDetailPanelProps {
  unit: UnitProfile
  selectedUpgrades?: string[]
  onClose?: () => void
  compact?: boolean
}

export function UnitDetailPanel({ unit, selectedUpgrades = [], onClose, compact = false }: UnitDetailPanelProps) {
  const base = getEnrichedUnitProfile(unit.id)
  const enriched = selectedUpgrades.length > 0
    ? applyUpgradesToProfile(base, selectedUpgrades)
    : base
  const upgradePts = calculateUpgradePoints(selectedUpgrades)
  const categoryInfo = CATEGORY_GLOSSARY[enriched.category]

  return (
    <div className={`unit-detail-panel ${compact ? 'compact' : ''}`}>
      {onClose && (
        <button className="detail-close btn btn-ghost btn-sm" onClick={onClose} aria-label="Close">
          ✕
        </button>
      )}

      <UnitDatasheet
        unit={enriched}
        pointsLabel={`${enriched.points + upgradePts} pts`}
        description={enriched.description}
        showModelsNote={!compact}
        metaLine={(
          <div className="datasheet-meta">
            <span className="detail-category" title={categoryInfo.explanation}>
              {categoryInfo.label}
            </span>
            {enriched.role && <span className="detail-role">{enriched.role}</span>}
          </div>
        )}
      />

      {selectedUpgrades.length > 0 && (
        <section className="detail-section">
          <p className="datasheet-section-title">Wargear Options</p>
          <div className="selected-upgrades-list">
            {selectedUpgrades.map((id) => {
              const upgrade = getUpgradeById(id)
              if (!upgrade) return null
              return (
                <div key={id} className="datasheet-rule-card">
                  <p className="ability-name">{upgrade.name} (+{upgrade.points} pts)</p>
                  <p className="ability-rule-entry">{upgrade.description}</p>
                  {upgrade.ability && <p className="upgrade-ability">{upgrade.ability}</p>}
                </div>
              )
            })}
          </div>
        </section>
      )}

      {!compact && (
        <section className="detail-section detail-tips">
          <p className="datasheet-section-title">New Player Tips</p>
          <ul>
            {getTipsForUnit(enriched).map((tip, i) => (
              <li key={i}>{tip}</li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}

function getTipsForUnit(unit: UnitProfile): string[] {
  const tips: string[] = []

  if (unit.category === 'hq') {
    tips.push('Keep your HQ near units that benefit from their leadership — but don\'t expose them to unnecessary fire.')
  }
  if (unit.category === 'troops') {
    tips.push('Troops are your objective holders. Move them onto points early and make the enemy come to you.')
  }
  if (unit.keywords.includes('Vehicle') || unit.keywords.includes('Tank')) {
    tips.push('Vehicles are tough but big targets. Use terrain for cover and focus fire on enemy anti-tank weapons first.')
  }
  if (unit.movement >= 10) {
    tips.push('This unit is fast — use that speed to grab side objectives or flank slower enemies.')
  }
  if (unit.toughness >= 8) {
    tips.push('Very tough — advance confidently, but remember concentrated fire can still bring you down.')
  }
  if (unit.save <= 3) {
    tips.push('Excellent armour save — this unit can shrug off most small arms fire. Push it into the mid-board.')
  }
  if (unit.weapons.some((w) => w.type === 'melee' && w.strength >= 8)) {
    tips.push('Powerful melee weapons — get this unit into combat. Charge during the Charge phase for maximum impact.')
  }
  if (unit.weapons.some((w) => w.type === 'ranged' && w.range >= 36)) {
    tips.push('Long-range guns — position at the back of your deployment and shoot every turn without advancing.')
  }

  if (tips.length === 0) {
    tips.push('Select this unit during battle to move, shoot, or fight. Read the phase indicator to know what actions are available.')
  }

  return tips.slice(0, 3)
}
