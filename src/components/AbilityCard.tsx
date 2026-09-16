import { useState } from 'react'
import type { UnitAbility } from '../types/game'
import { getAbilityRuleEntries } from '../data/abilityRules'
import { WeaponStatsTable } from './WeaponStatsTable'

interface AbilityCardProps {
  ability: UnitAbility
}

export function AbilityCard({ ability }: AbilityCardProps) {
  const [expanded, setExpanded] = useState(false)
  const isWeapon = ability.kind === 'weapon' && ability.weapon

  return (
    <div className={`ability-card ${expanded ? 'expanded' : ''}`}>
      <button
        type="button"
        className="ability-card-toggle"
        onClick={() => setExpanded((open) => !open)}
        aria-expanded={expanded}
      >
        <span className="ability-name">{ability.name}</span>
        <span className="ability-toggle-hint">{expanded ? 'Close' : 'View'}</span>
      </button>

      {expanded && (
        <div className="ability-detail">
          {isWeapon && ability.weapon && (
            <WeaponStatsTable
              title={ability.weapon.type === 'ranged' ? 'Ranged Weapons' : 'Melee Weapons'}
              weapons={[ability.weapon]}
            />
          )}

          <div className="ability-rules">
            <p className="datasheet-section-title">Rules</p>
            {getAbilityRuleEntries(ability).map((entry) => (
              <div key={entry.name} className="ability-rule-entry">
                <strong>{entry.name}:</strong> {entry.text}
              </div>
            ))}
          </div>
        </div>
      )}

      {!expanded && (
        <p className="ability-summary">{ability.description.slice(0, 120)}{ability.description.length > 120 ? '…' : ''}</p>
      )}
    </div>
  )
}
