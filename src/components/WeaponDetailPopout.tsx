import type { WeaponProfile } from '../types/game'
import { getWeaponRuleEntries } from '../data/abilityRules'
import { WeaponStatsTable } from './WeaponStatsTable'

interface WeaponDetailPopoutProps {
  weapon: WeaponProfile
  onClose: () => void
}

export function WeaponDetailPopout({ weapon, onClose }: WeaponDetailPopoutProps) {
  const title = weapon.type === 'ranged' ? 'Ranged Weapons' : 'Melee Weapons'
  const rules = getWeaponRuleEntries(weapon)

  return (
    <div className="weapon-detail-overlay" onClick={onClose}>
      <div className="weapon-detail-popout app-panel-elevated" onClick={(e) => e.stopPropagation()}>
        <div className="weapon-detail-header">
          <h4>{weapon.name}</h4>
          <button type="button" className="btn btn-ghost btn-sm" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        <WeaponStatsTable title={title} weapons={[weapon]} showViewButton={false} />

        {rules.length > 0 && (
          <div className="ability-rules">
            <p className="datasheet-section-title">Rules</p>
            {rules.map((entry) => (
              <div key={entry.name} className="ability-rule-entry">
                <strong>{entry.name}:</strong> {entry.text}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
