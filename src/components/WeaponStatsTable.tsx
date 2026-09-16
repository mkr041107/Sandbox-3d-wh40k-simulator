import { useState } from 'react'
import type { WeaponProfile } from '../types/game'
import { displayWeaponName, inferWeaponKeywords } from '../data/abilityRules'
import { STAT_GLOSSARY } from '../data/glossary'
import { WeaponDetailPopout } from './WeaponDetailPopout'

function formatRange(weapon: WeaponProfile): string {
  return weapon.type === 'melee' ? 'Melee' : `${weapon.range}"`
}

function formatSkill(weapon: WeaponProfile): string {
  return `${weapon.skill}+`
}

export function WeaponStatsTable({
  title,
  weapons,
  showViewButton = true,
}: {
  title: string
  weapons: WeaponProfile[]
  showViewButton?: boolean
}) {
  const [selectedWeapon, setSelectedWeapon] = useState<WeaponProfile | null>(null)

  if (weapons.length === 0) return null

  const isMelee = weapons[0]?.type === 'melee'

  return (
    <>
      <div className="bf-weapon-table-wrap">
        <p className="bf-weapon-table-title">{title}</p>
        <div className="bf-weapon-table-scroll">
          <table className="bf-weapon-table">
            <thead>
              <tr>
                <th scope="col">Weapon</th>
                <th scope="col" title={STAT_GLOSSARY.range.explanation}>
                  {isMelee ? 'RNG' : 'RANGE'}
                </th>
                <th scope="col" title={STAT_GLOSSARY.attacks.explanation}>A</th>
                <th scope="col" title={STAT_GLOSSARY.skill.explanation}>
                  {isMelee ? 'WS' : 'BS'}
                </th>
                <th scope="col" title={STAT_GLOSSARY.strength.explanation}>S</th>
                <th scope="col" title={STAT_GLOSSARY.ap.explanation}>AP</th>
                <th scope="col" title={STAT_GLOSSARY.damage.explanation}>D</th>
                {showViewButton && <th scope="col" />}
              </tr>
            </thead>
            <tbody>
              {weapons.map((weapon) => {
                const keywords = inferWeaponKeywords(weapon)
                return (
                  <tr key={`${weapon.name}-${weapon.type}`}>
                    <td className="bf-weapon-table-name">
                      <span>{displayWeaponName(weapon.name)}</span>
                      {keywords.length > 0 && (
                        <span className="bf-weapon-table-kw">{keywords.join(', ')}</span>
                      )}
                    </td>
                    <td>{formatRange(weapon)}</td>
                    <td>{weapon.attacks}</td>
                    <td>{formatSkill(weapon)}</td>
                    <td>{weapon.strength}</td>
                    <td>{weapon.ap}</td>
                    <td>{weapon.damage}</td>
                    {showViewButton && (
                      <td>
                        <button
                          type="button"
                          className="weapon-view-btn"
                          onClick={() => setSelectedWeapon(weapon)}
                          aria-label={`View ${weapon.name} rules`}
                        >
                          View
                        </button>
                      </td>
                    )}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {selectedWeapon && (
        <WeaponDetailPopout weapon={selectedWeapon} onClose={() => setSelectedWeapon(null)} />
      )}
    </>
  )
}

export function WeaponStatsSection({ weapons }: { weapons: WeaponProfile[] }) {
  const ranged = weapons.filter((w) => w.type === 'ranged')
  const melee = weapons.filter((w) => w.type === 'melee')

  return (
    <>
      {ranged.length > 0 && <WeaponStatsTable title="Ranged Weapons" weapons={ranged} />}
      {melee.length > 0 && <WeaponStatsTable title="Melee Weapons" weapons={melee} />}
    </>
  )
}
