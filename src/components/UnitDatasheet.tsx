import type { ReactNode } from 'react'
import type { UnitAbility, UnitProfile } from '../types/game'
import { KEYWORD_GLOSSARY, STAT_GLOSSARY } from '../data/glossary'
import { AbilityCard } from './AbilityCard'
import { WeaponStatsSection } from './WeaponStatsTable'

const PROFILE_STATS: { label: string; stat: string; format: (u: UnitProfile) => string }[] = [
  { label: 'M', stat: 'movement', format: (u) => `${u.movement}"` },
  { label: 'T', stat: 'toughness', format: (u) => String(u.toughness) },
  { label: 'Sv', stat: 'save', format: (u) => `${u.save}+` },
  { label: 'W', stat: 'wounds', format: (u) => String(u.wounds) },
  { label: 'Ld', stat: 'leadership', format: (u) => `${u.leadership}+` },
  { label: 'OC', stat: 'objectiveControl', format: (u) => String(u.objectiveControl) },
]

interface UnitDatasheetProps {
  unit: UnitProfile
  pointsLabel?: string
  headerAction?: ReactNode
  metaLine?: ReactNode
  description?: string
  abilities?: UnitAbility[]
  showAbilities?: boolean
  showWeapons?: boolean
  showKeywords?: boolean
  showModelsNote?: boolean
  children?: ReactNode
}

export function UnitDatasheet({
  unit,
  pointsLabel,
  headerAction,
  metaLine,
  description,
  abilities = unit.abilities ?? [],
  showAbilities = true,
  showWeapons = true,
  showKeywords = true,
  showModelsNote = true,
  children,
}: UnitDatasheetProps) {
  const displayAbilities = showWeapons
    ? abilities.filter((a) => a.kind !== 'weapon')
    : abilities

  return (
    <div className="unit-datasheet">
      <div className="datasheet-header">
        <div>
          <h3 className="datasheet-name">{unit.name}</h3>
          <p className="datasheet-points" title={STAT_GLOSSARY.points.explanation}>
            {pointsLabel ?? `${unit.points} pts`}
          </p>
          {metaLine}
        </div>
        {headerAction}
      </div>

      {description && <p className="datasheet-description">{description}</p>}

      {showKeywords && unit.keywords.length > 0 && (
        <div className="datasheet-keywords">
          {unit.keywords.map((keyword) => (
            <span
              key={keyword}
              className="datasheet-keyword"
              title={KEYWORD_GLOSSARY[keyword] ?? keyword}
            >
              {keyword}
            </span>
          ))}
        </div>
      )}

      <div className="datasheet-stat-grid">
        {PROFILE_STATS.map(({ label, stat, format }) => (
          <div key={label} className="datasheet-stat-box" title={STAT_GLOSSARY[stat]?.explanation}>
            <div className="datasheet-stat-label">{label}</div>
            <div className="datasheet-stat-value">{format(unit)}</div>
          </div>
        ))}
      </div>

      {showModelsNote && unit.models > 1 && (
        <p className="datasheet-note">
          <strong>{unit.models} models</strong> in this unit — multiply attacks by models remaining in battle.
        </p>
      )}

      {children}

      {showWeapons && unit.weapons.length > 0 && (
        <section className="datasheet-section">
          <WeaponStatsSection weapons={unit.weapons} />
        </section>
      )}

      {showAbilities && displayAbilities.length > 0 && (
        <section className="datasheet-section">
          <p className="datasheet-section-title">Abilities</p>
          <div className="ability-list">
            {displayAbilities.map((ability, index) => (
              <AbilityCard key={`${ability.name}-${index}`} ability={ability} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
