import type { UnitAbility, UnitProfile, WeaponProfile } from '../types/game'
import type { UnitPlaystyle } from './unitPlaystyles'

function mergeAbilities(...groups: UnitAbility[][]): UnitAbility[] {
  const seen = new Set<string>()
  const merged: UnitAbility[] = []
  for (const group of groups) {
    for (const ability of group) {
      if (seen.has(ability.name)) continue
      seen.add(ability.name)
      merged.push(ability)
    }
  }
  return merged
}

function describeGun(weapon: WeaponProfile): string {
  const { range, attacks, strength, ap, damage } = weapon
  const role = strength >= 12
    ? 'Dedicated anti-tank — one good hit can cripple a vehicle.'
    : strength >= 9
      ? 'Heavy firepower — excellent against vehicles and elite infantry.'
      : strength >= 6
        ? 'Solid mid-strength shooting — reliable against most targets.'
        : 'Anti-infantry fire — best used to clear chaff and hold objectives.'

  const apNote = ap <= -3
    ? 'AP is so high most armour saves are ignored.'
    : ap <= -1
      ? 'AP cuts through light and medium armour.'
      : 'Low AP — targets with good saves will shrug many hits.'

  const dmgNote = damage >= 3
    ? `Each wound deals ${damage} damage, so multi-wound models drop fast.`
    : damage >= 2
      ? 'Damage 2 — efficient against 2-wound models like Terminators.'
      : 'Damage 1 — needs volume of hits to remove tough targets.'

  return `${attacks} shot${attacks > 1 ? 's' : ''} at ${range}", Strength ${strength}, AP ${ap}, Damage ${damage}. ${role} ${apNote} ${dmgNote}`
}

function describeMelee(weapon: WeaponProfile): string {
  const { attacks, strength, ap, damage, skill } = weapon
  const role = strength >= 10
    ? 'Devastating melee — built to smash vehicles and monsters.'
    : strength >= 7
      ? 'Strong close combat — dangerous to armoured infantry and characters.'
      : 'Standard melee — relies on number of attacks to pile on wounds.'

  return `${attacks} attack${attacks > 1 ? 's' : ''} at WS ${skill}+, Strength ${strength}, AP ${ap}, Damage ${damage}. ${role} Get this model into combat during the Charge phase for full effect.`
}

function weaponAbility(weapon: WeaponProfile): UnitAbility {
  const isMainGun = weapon.type === 'ranged' && weapon.strength >= 8 && weapon.range >= 24
  const label = isMainGun ? `${weapon.name} (Main Gun)` : weapon.name
  return {
    name: label,
    description: weapon.type === 'ranged' ? describeGun(weapon) : describeMelee(weapon),
  }
}

export function inferUnitAbilities(unit: UnitProfile, playstyle?: UnitPlaystyle): UnitAbility[] {
  const abilities: UnitAbility[] = []
  const n = unit.name.toLowerCase()
  const kw = unit.keywords

  const ranged = unit.weapons.filter((w) => w.type === 'ranged')
  const melee = unit.weapons.filter((w) => w.type === 'melee')
  const mainGun = ranged.find((w) => w.strength >= 8 && w.range >= 24)
    ?? ranged.find((w) => w.strength >= 7)
    ?? ranged[0]

  if (kw.includes('Tank') || /\b(baneblade|leman russ|predator|hammerhead|rogal dorn|land raider|repulsor|vindicator|basilisk|manticore|shadowsword|stormlord|banesword|banehammer|doomhammer)\b/.test(n)) {
    abilities.push({
      name: 'Armoured Hull',
      description: `Toughness ${unit.toughness} with a ${unit.save}+ save and ${unit.wounds} Wounds. Tanks absorb huge amounts of fire — enemy anti-tank weapons are your main threat. Position behind ruins for cover saves.`,
    })
    if (mainGun) abilities.push(weaponAbility(mainGun))
    const secondary = ranged.filter((w) => w !== mainGun)
    if (secondary.length > 0) {
      abilities.push({
        name: 'Secondary Weapons',
        description: secondary.map((w) => `${w.name} (${w.attacks}× S${w.strength} AP${w.ap})`).join('; ')
          + '. Use these to finish off damaged targets or clear infantry while the main gun focuses on big threats.',
      })
    }
    if (!playstyle?.ruleAbilities.some((a) => a.name.startsWith('Deadly Demise'))) {
      abilities.push({
        name: 'Deadly Demise',
        description: 'When this vehicle is destroyed, it may explode and damage nearby units. Keep your own infantry at a safe distance when the tank is close to being wrecked.',
      })
    }
    if (/\b(baneblade|shadowsword|stormlord|banesword|banehammer|doomhammer)\b/.test(n)) {
      abilities.push({
        name: 'Super-Heavy Firepower',
        description: 'Lord of War tanks bring multiple massive guns. In the real game they dominate the board but draw every enemy anti-tank shot — expect to be the centre of attention.',
      })
    }
  } else if (kw.includes('Vehicle') && !kw.includes('Transport')) {
    abilities.push({
      name: 'Vehicle',
      description: `Moves ${unit.movement}" and soaks damage with T${unit.toughness}, ${unit.save}+ save, ${unit.wounds} Wounds. Vehicles shoot in the Shooting phase and can charge, but often fight with reduced melee skill.`,
    })
    if (mainGun) abilities.push(weaponAbility(mainGun))
    if (melee.length > 0) {
      abilities.push({
        name: 'Melee Armament',
        description: describeMelee(melee[0]),
      })
    }
  } else if (kw.includes('Walker') || /\b(dreadnought|helbrute|deff dread|invictor|warsuit|kastelan|wraithlord|sentinel|dunecrawler|onager)\b/.test(n)) {
    abilities.push({
      name: 'Walker',
      description: `A bipedal war machine — T${unit.toughness}, ${unit.save}+ save, ${unit.wounds} Wounds. Walkers combine gunfire and melee. Slower than tanks but often more flexible in terrain.`,
    })
    for (const weapon of unit.weapons.slice(0, 2)) {
      abilities.push(weaponAbility(weapon))
    }
  } else if (kw.includes('Titanic') || kw.includes('Knight') || /\b(knight|wraithknight|bloodthirster|lord of change|great unclean|keeper of secrets|silent king|magnus|angron|fulgrim)\b/.test(n)) {
    abilities.push({
      name: 'Titanic / Lord of War',
      description: `Enormous model with T${unit.toughness}, ${unit.save}+ save, and ${unit.wounds} Wounds. Dominates the battlefield but is a priority target for the entire enemy army. Extremely expensive in points.`,
    })
    for (const weapon of unit.weapons.slice(0, 3)) {
      abilities.push(weaponAbility(weapon))
    }
    if (/\b(knight|armiger|war dog)\b/.test(n)) {
      abilities.push({
        name: 'Ion Shield (simplified)',
        description: 'Knights project a protective field. In full rules this grants a ranged invulnerable save — here, treat Knights as especially durable when not focused by anti-tank fire.',
      })
    }
  } else if (kw.includes('Fly') || kw.includes('Flyer') || /\b(stormraven|stormtalon|dakkajet|harpy|crone|doom scythe|hemlock|nightwing|phoenix|razorwing)\b/.test(n)) {
    abilities.push({
      name: 'Flyer',
      description: `Moves ${unit.movement}" and can pass over terrain and models. Flyers excel at long-range shooting. In matched play they often have restrictions on what they can target — use them to hunt enemy vehicles and monsters.`,
    })
    if (mainGun) abilities.push(weaponAbility(mainGun))
  } else if (kw.includes('Transport') || /\b(rhino|chimera|raider|venom|devilfish|dunerider|trukk|drop pod|impulsor|ghost ark|goliath truck|land raider)\b/.test(n)) {
    abilities.push({
      name: 'Transport',
      description: 'Carries infantry across the battlefield safely. Deploy troops close to objectives, then disembark them to shoot and charge. Destroying the transport strands passengers — protect it until drop-off.',
    })
    if (ranged[0]) abilities.push(weaponAbility(ranged[0]))
  } else if (kw.includes('Battlesuit') || /\b(crisis|broadside|ghostkeel|riptide|commander|stealth|battlesuit)\b/.test(n)) {
    abilities.push({
      name: 'Battlesuit',
      description: `Jump-pack battlesuit with ${unit.movement}" movement. T${unit.toughness} and ${unit.wounds} Wounds per suit. Battlesuits shoot on the move and can fly over terrain — peak T\'au fire support.`,
    })
    for (const weapon of unit.weapons) {
      abilities.push(weaponAbility(weapon))
    }
  } else if (kw.includes('Psyker') || /\b(librarian|farseer|warlock|sorcerer|brotherhood|smite|psychic)\b/.test(n)) {
    abilities.push({
      name: 'Psyker',
      description: 'Can manifest psychic powers in addition to normal attacks. Psykers are fragile but swing games with mortal wounds and buffs. Keep them behind tougher units — enemy snipers love targeting Psykers.',
    })
    if (mainGun) abilities.push(weaponAbility(mainGun))
    if (melee[0]) abilities.push(weaponAbility(melee[0]))
  } else if (kw.includes('Character') || unit.category === 'hq') {
    abilities.push({
      name: 'Character',
      description: 'Your army leader or elite hero. Characters often buff nearby units and are high-value targets. Enemies gain extra rewards for killing them — don\'t leave them exposed on the front line.',
    })
    for (const weapon of unit.weapons) {
      abilities.push(weaponAbility(weapon))
    }
  } else if (kw.includes('Terminator')) {
    abilities.push({
      name: 'Terminator Armour',
      description: `2+ armour save and ${unit.wounds} Wounds per model. Slow (${unit.movement}" move) but extremely durable. Deep Strike capable in full rules — arrive where the enemy is weakest and tear them apart.`,
    })
    for (const weapon of unit.weapons) {
      abilities.push(weaponAbility(weapon))
    }
  } else if (kw.includes('Monster') || /\b(carnifex|trygon|mawloc|haruspex|exocrine|tyrannofex|daemon prince|avatar|mutalith)\b/.test(n)) {
    abilities.push({
      name: 'Monster',
      description: `Large creature — T${unit.toughness}, ${unit.save}+ save, ${unit.wounds} Wounds. Monsters fight in melee with high impact and often have strong ranged bio-weapons too.`,
    })
    for (const weapon of unit.weapons) {
      abilities.push(weaponAbility(weapon))
    }
  } else if (unit.category === 'troops' || kw.includes('Battleline')) {
    abilities.push({
      name: 'Battleline Troops',
      description: `Core infantry — ${unit.models} models with Objective Control ${unit.objectiveControl}. Your army's backbone: hold objectives, provide volume of fire, and screen tougher units from charges.`,
    })
    if (mainGun) abilities.push(weaponAbility(mainGun))
    else if (unit.weapons[0]) abilities.push(weaponAbility(unit.weapons[0]))
  } else if (unit.category === 'fast-attack' || kw.includes('Mounted')) {
    abilities.push({
      name: 'Fast Attack',
      description: `${unit.movement}" movement — use speed to grab side objectives, hunt isolated shooters, or threaten enemy backfield. Fragile if caught in sustained fire.`,
    })
    for (const weapon of unit.weapons) {
      abilities.push(weaponAbility(weapon))
    }
  } else if (unit.category === 'heavy-support') {
    abilities.push({
      name: 'Heavy Support',
      description: 'Long-range firepower specialist. Deploy at the back with clear lines of sight and focus on enemy vehicles, monsters, and elite infantry.',
    })
    for (const weapon of unit.weapons) {
      abilities.push(weaponAbility(weapon))
    }
  } else {
    for (const weapon of unit.weapons) {
      abilities.push(weaponAbility(weapon))
    }
  }

  if (abilities.length === 0 && unit.weapons.length > 0) {
    abilities.push(weaponAbility(unit.weapons[0]))
  }

  return mergeAbilities(playstyle?.ruleAbilities ?? [], abilities)
}
