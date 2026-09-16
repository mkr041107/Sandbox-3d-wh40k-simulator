import { useMemo } from 'react'
import type { SquadUpgrade, SquadUpgradeCategory } from '../types/game'
import { UPGRADE_CATEGORY_LABELS, getUpgradesForUnit, validateUpgrades } from '../data/squadUpgrades'
import { getUnitProfile } from '../data/units'

interface SquadUpgradeSelectorProps {
  profileId: string
  selected: string[]
  onChange: (upgrades: string[]) => void
}

export function SquadUpgradeSelector({ profileId, selected, onChange }: SquadUpgradeSelectorProps) {
  const upgrades = getUpgradesForUnit(profileId)
  const profile = getUnitProfile(profileId)

  const grouped = useMemo(() => {
    const groups: Partial<Record<SquadUpgradeCategory, SquadUpgrade[]>> = {}
    for (const u of upgrades) {
      if (!groups[u.category]) groups[u.category] = []
      groups[u.category]!.push(u)
    }
    return groups
  }, [upgrades])

  const validationError = validateUpgrades(profileId, selected)
  const upgradePoints = selected.reduce((sum, id) => {
    const u = upgrades.find((x) => x.id === id)
    return sum + (u?.points ?? 0)
  }, 0)

  if (upgrades.length === 0) {
    return (
      <div className="squad-upgrades empty">
        <p className="stat-note">This unit has no squad upgrades available.</p>
      </div>
    )
  }

  const toggle = (upgrade: SquadUpgrade) => {
    const count = selected.filter((id) => id === upgrade.id).length
    if (count >= upgrade.maxPerSquad) {
      const idx = selected.lastIndexOf(upgrade.id)
      if (idx >= 0) {
        const next = [...selected]
        next.splice(idx, 1)
        onChange(next)
      }
      return
    }

    for (const ex of upgrade.exclusiveWith ?? []) {
      if (selected.includes(ex)) return
    }

    onChange([...selected, upgrade.id])
  }

  const isSelected = (id: string) => selected.includes(id)
  const isDisabled = (upgrade: SquadUpgrade) => {
    if (isSelected(upgrade.id) && selected.filter((s) => s === upgrade.id).length >= upgrade.maxPerSquad) {
      return false
    }
    if (selected.filter((s) => s === upgrade.id).length >= upgrade.maxPerSquad) return true
    return (upgrade.exclusiveWith ?? []).some((ex) => selected.includes(ex))
  }

  return (
    <div className="squad-upgrades">
      <div className="upgrades-header">
        <h4>Squad Upgrades</h4>
        <span className="upgrades-total">
          +{upgradePoints} pts → {profile.points + upgradePoints} pts/squad
        </span>
      </div>
      <p className="upgrades-intro">
        Customise your squad with specialists, weapons, and wargear. Click to add or remove upgrades.
      </p>

      {(Object.keys(grouped) as SquadUpgradeCategory[]).map((category) => (
        <div key={category} className="upgrade-group">
          <h5>{UPGRADE_CATEGORY_LABELS[category]}</h5>
          <div className="upgrade-options">
            {grouped[category]!.map((upgrade) => {
              const active = isSelected(upgrade.id)
              const disabled = !active && isDisabled(upgrade)
              const count = selected.filter((s) => s === upgrade.id).length
              return (
                <button
                  key={upgrade.id}
                  type="button"
                  className={`upgrade-option ${active ? 'active' : ''} ${disabled ? 'disabled' : ''}`}
                  onClick={() => !disabled && toggle(upgrade)}
                  disabled={disabled}
                  title={upgrade.description}
                >
                  <div className="upgrade-option-top">
                    <span className="upgrade-name">{upgrade.name}</span>
                    <span className="upgrade-pts">+{upgrade.points}</span>
                  </div>
                  <p className="upgrade-desc">{upgrade.description}</p>
                  {upgrade.ability && (
                    <p className="upgrade-ability">{upgrade.ability}</p>
                  )}
                  {upgrade.weapons && upgrade.weapons.length > 0 && (
                    <div className="upgrade-weapons">
                      {upgrade.weapons.map((w) => (
                        <span key={w.name} className="upgrade-weapon-tag">{w.name}</span>
                      ))}
                    </div>
                  )}
                  {count > 0 && upgrade.maxPerSquad > 1 && (
                    <span className="upgrade-count">{count}/{upgrade.maxPerSquad}</span>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      ))}

      {validationError && <p className="upgrade-error">{validationError}</p>}
    </div>
  )
}

export function formatUpgradeList(upgradeIds: string[], profileId: string): string {
  const available = getUpgradesForUnit(profileId)
  return upgradeIds
    .map((id) => available.find((u) => u.id === id)?.name ?? id)
    .join(', ')
}
