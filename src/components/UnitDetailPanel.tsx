import type { UnitProfile } from '../types/game'
import { CATEGORY_GLOSSARY, KEYWORD_GLOSSARY, STAT_GLOSSARY } from '../data/glossary'
import { applyUpgradesToProfile, calculateUpgradePoints, getUpgradeById } from '../data/squadUpgrades'
import { getEnrichedUnitProfile } from '../data/units'

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

      <div className="detail-header">
        <span className="detail-category" title={categoryInfo.explanation}>
          {categoryInfo.label}
        </span>
        {enriched.role && <span className="detail-role">{enriched.role}</span>}
        <span className="detail-points" title={STAT_GLOSSARY.points.explanation}>
          {enriched.points + upgradePts} pts
        </span>
      </div>

      <h3 className="detail-name">{enriched.name}</h3>

      {enriched.description && (
        <p className="detail-description">{enriched.description}</p>
      )}

      <section className="detail-section">
        <h4>Unit Stats</h4>
        <div className="stat-grid">
          <StatCell stat="movement" value={`${enriched.movement}"`} />
          <StatCell stat="toughness" value={enriched.toughness} />
          <StatCell stat="save" value={`${enriched.save}+`} />
          <StatCell stat="wounds" value={enriched.wounds} />
          <StatCell stat="leadership" value={enriched.leadership} />
          <StatCell stat="objectiveControl" value={enriched.objectiveControl} />
        </div>
        <p className="stat-note">
          <strong>{enriched.models} models</strong> in this unit — multiply attacks by models remaining in battle.
        </p>
      </section>

      {enriched.abilities && enriched.abilities.length > 0 && (
        <section className="detail-section">
          <h4>Abilities &amp; Rules</h4>
          <p className="stat-note">Named like official datasheets (New Recruit / Wahapedia style) with plain-language tips.</p>
          <div className="ability-list">
            {enriched.abilities.map((ability, i) => (
              <div key={i} className="ability-card">
                <strong className="ability-name">{ability.name}</strong>
                <p className="ability-desc">{ability.description}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="detail-section">
        <h4>Weapons</h4>
        {enriched.weapons.length === 0 ? (
          <p className="stat-note">No weapons listed.</p>
        ) : (
          <div className="weapon-list">
            {enriched.weapons.map((weapon, i) => (
              <div key={i} className="weapon-card">
                <div className="weapon-header">
                  <span className="weapon-name">{weapon.name}</span>
                  <span className={`weapon-type ${weapon.type}`}>
                    {weapon.type === 'ranged' ? 'Ranged' : 'Melee'}
                  </span>
                </div>
                {weapon.description && (
                  <p className="weapon-desc">{weapon.description}</p>
                )}
                <div className="weapon-stats">
                  {weapon.type === 'ranged' && (
                    <span title={STAT_GLOSSARY.range.explanation}>R: {weapon.range}"</span>
                  )}
                  <span title={STAT_GLOSSARY.attacks.explanation}>A: {weapon.attacks}</span>
                  <span title={STAT_GLOSSARY.skill.explanation}>
                    {weapon.type === 'ranged' ? 'BS' : 'WS'}: {weapon.skill}+
                  </span>
                  <span title={STAT_GLOSSARY.strength.explanation}>S: {weapon.strength}</span>
                  <span title={STAT_GLOSSARY.ap.explanation}>AP: {weapon.ap}</span>
                  <span title={STAT_GLOSSARY.damage.explanation}>D: {weapon.damage}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {selectedUpgrades.length > 0 && (
        <section className="detail-section">
          <h4>Selected Upgrades</h4>
          <div className="selected-upgrades-list">
            {selectedUpgrades.map((id) => {
              const u = getUpgradeById(id)
              if (!u) return null
              return (
                <div key={id} className="selected-upgrade-item">
                  <strong>{u.name}</strong> (+{u.points} pts)
                  <p>{u.description}</p>
                  {u.ability && <p className="upgrade-ability">{u.ability}</p>}
                </div>
              )
            })}
          </div>
        </section>
      )}

      {enriched.keywords.length > 0 && (
        <section className="detail-section">
          <h4>Keywords</h4>
          <div className="keyword-list">
            {enriched.keywords.map((kw) => (
              <span key={kw} className="keyword-tag" title={KEYWORD_GLOSSARY[kw] ?? kw}>
                {kw}
              </span>
            ))}
          </div>
        </section>
      )}

      {!compact && (
        <section className="detail-section detail-tips">
          <h4>New Player Tips</h4>
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

function StatCell({ stat, value }: { stat: string; value: string | number }) {
  const info = STAT_GLOSSARY[stat]
  return (
    <div className="stat-cell" title={info?.explanation}>
      <span className="stat-label">{info?.label ?? stat}</span>
      <span className="stat-value">{value}</span>
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
