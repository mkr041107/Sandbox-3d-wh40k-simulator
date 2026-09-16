import type { UnitAbility, WeaponProfile } from '../types/game'

/** Reusable weapon keyword definitions — written once, referenced by tag. */
export const WEAPON_KEYWORD_GLOSSARY: Record<string, string> = {
  Blast: 'Extra attacks against large units (6+ models). Artillery and demolisher cannons excel at wiping infantry blobs — aim at crowded objectives.',
  'Indirect Fire': 'Can shoot at targets not visible to the firing model (with penalties in full rules). Hide behind terrain and still contribute — classic artillery play.',
  'Twin-linked': 'Re-roll failed wound rolls (or to-hit in some cases). Makes anti-tank weapons far more reliable — point twin-linked guns at the enemy\'s biggest threat.',
  Torrent: 'Automatically hits models in range (no to-hit roll in full rules). Flamers and incendiary weapons clear infantry in cover.',
  'Ignores Cover': 'Target units do not receive the Benefit of Cover against this weapon. Essential for flushing enemies out of ruins and woods.',
  Melta: 'Devastating at short range — extra damage and/or armour penetration when within half range. Advance into melta range, then delete a vehicle.',
  'Anti-armour': 'High Strength and AP suited to cracking vehicles, monsters, and Terminators. Focus fire on the toughest enemy target.',
  'Rapid Fire': 'Extra attacks at half range or when stationary. Hold your fire until the target is close for maximum output.',
  Pistol: 'Can be fired even when the bearer is engaged in melee. Useful for characters and pistols in close-quarters fights.',
}

/** Named special rules attached to units (stratagem-style abilities). */
export const RULE_GLOSSARY: Record<string, string> = {
  'Deep Strike': 'Arrives from reserves after deployment. Set up more than 9" from enemy models, then close the gap next turn. Use to hit weak flanks, backfield objectives, or isolated shooters.',
  Infiltrators: 'Deploy anywhere on the board more than 9" from the enemy deployment zone. Perfect for early objective pressure, marking targets, or setting up alpha strikes.',
  Stealth: 'Gains the Benefit of Cover against ranged attacks. Hug terrain and advance into firing positions other units cannot reach on turn one.',
  Scouts: 'Moves up before the first turn. Use to seize forward ground, block enemy deployment lanes, or set up charges turn two.',
  'Deadly Demise D3': 'When destroyed, rolls mortal wounds on nearby units. Enemy infantry hugging your tank take damage when it blows — plan your final position accordingly.',
  'Deadly Demise': 'When this vehicle is destroyed, it may explode and damage nearby units. Keep your own infantry at a safe distance when the tank is close to being wrecked.',
  'Feel No Pain 5+': 'Ignores wounds on a 5+. Stacks with a good save to make the unit deceptively hard to remove. Bring volume of fire or high-damage weapons to punch through.',
  'Fights First': 'Strikes before normal melee in the Fight phase. Critical for assassins, interceptors, and units that must kill before they die.',
  'Ion Shield (simplified)': 'Knights project a protective field. In full rules this grants a ranged invulnerable save — here, treat Knights as especially durable when not focused by anti-tank fire.',
  'Super-Heavy Firepower': 'Lord of War tanks bring multiple massive guns. In the real game they dominate the board but draw every enemy anti-tank shot — expect to be the centre of attention.',
}

export function inferWeaponKeywords(weapon: WeaponProfile): string[] {
  const keywords: string[] = []
  const name = weapon.name.toLowerCase()

  if (/twin|storm bolter|storm cannon|twin-linked/i.test(name)) keywords.push('Twin-linked')
  if (/flamer|incendiary|torrent|phosphor/i.test(name)) {
    keywords.push('Torrent')
    keywords.push('Ignores Cover')
  }
  if (/melta|fusion|multi-melta|lascannon|lascutter|heat ray/i.test(name) && weapon.ap <= -3) {
    keywords.push('Melta')
  }
  if (/blast|battle cannon|demolisher|earthshaker|bombard|baneblade|doomsday|volcano/i.test(name)) {
    keywords.push('Blast')
  }
  if (/indirect|mortar|basilisk|manticore|wyvern|colossus|whirlwind/i.test(name)) {
    keywords.push('Indirect Fire')
  }
  if (/pistol/i.test(name)) keywords.push('Pistol')
  if (/bolt rifle|boltgun|autogun|stubber/i.test(name) && weapon.range >= 18) keywords.push('Rapid Fire')
  if (weapon.type === 'melee' && weapon.strength >= 8) keywords.push('Anti-armour')
  if (weapon.type === 'ranged' && weapon.strength >= 10 && weapon.ap <= -2) keywords.push('Anti-armour')

  return [...new Set(keywords)]
}

export function getWeaponRuleEntries(weapon: WeaponProfile): { name: string; text: string }[] {
  const entries: { name: string; text: string }[] = []
  const keywords = inferWeaponKeywords(weapon)

  for (const keyword of keywords) {
    const text = WEAPON_KEYWORD_GLOSSARY[keyword]
    if (text) entries.push({ name: keyword, text })
  }

  if (weapon.description) {
    entries.push({ name: 'Profile', text: weapon.description })
  }

  return entries
}

export function getAbilityRuleEntries(ability: UnitAbility): { name: string; text: string }[] {
  const entries: { name: string; text: string }[] = []
  const seen = new Set<string>()

  for (const keyword of ability.keywords ?? []) {
    if (seen.has(keyword)) continue
    const text = WEAPON_KEYWORD_GLOSSARY[keyword] ?? RULE_GLOSSARY[keyword]
    if (text) {
      seen.add(keyword)
      entries.push({ name: keyword, text })
    }
  }

  const namedRule = RULE_GLOSSARY[ability.name]
  if (namedRule) {
    entries.push({ name: ability.name, text: namedRule })
    seen.add(ability.name)
  }

  const descriptionAlreadyShown = entries.some((entry) => entry.text === ability.description)
  if (!descriptionAlreadyShown) {
    entries.push({
      name: ability.kind === 'weapon' ? 'What it does' : ability.name,
      text: ability.description,
    })
  }

  return entries
}

export function formatWeaponAttacks(attacks: number): string {
  return String(attacks)
}

export function formatWeaponRange(weapon: WeaponProfile): string {
  return weapon.type === 'melee' ? 'Melee' : `${weapon.range}"`
}

export function formatWeaponSkill(weapon: WeaponProfile): string {
  return weapon.type === 'ranged' ? `${weapon.skill}+` : `${weapon.skill}+`
}

export function displayWeaponName(name: string): string {
  return name.replace(/^➤\s*/, '').trim()
}
