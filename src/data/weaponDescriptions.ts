import type { WeaponProfile } from '../types/game'

export const WEAPON_DESCRIPTIONS: Record<string, string> = {
  'Boltgun': 'Standard Space Marine rifle. Reliable mid-range firepower — 24" range, rapid fire with 2 shots per model.',
  'Bolt Pistol': 'Compact bolt weapon for close work. Short range but pairs well with melee weapons when charging.',
  'Chainsword': 'Ripping blade weapon. No armour penetration but makes many attacks — deadly when combined with charge bonuses.',
  'Power Fist': 'Energised gauntlet that crushes armour. Slow to swing but S8 and AP-2 punch through anything.',
  'Power Sword': 'Energised blade. Good balance of attacks, strength, and AP — a versatile melee weapon for leaders.',
  'Power Weapon': 'Generic energised melee weapon. AP-2 cuts through most infantry armour — standard kit for sergeants and officers.',
  'Close Combat Weapon': 'Heavy walker or vehicle melee arm. Few attacks but high strength and damage — dreadnoughts and walkers use this to finish what their guns started.',
  'Lasgun': 'Standard Imperial Guard rifle. Weak individually but cheap — a full squad puts out many shots.',
  'Laspistol': 'Sidearm laser weapon. Short range, used by officers who fight in melee.',
  'Gauss Flayer': 'Necron living metal rifle. AP-1 cuts through light armour — Warriors are surprisingly deadly in volume.',
  'Gauss Reaper': 'Heavy gauss weapon for Immortals. Shorter range but stronger and better AP than a Flayer.',
  'Shoota': 'Ork automatic weapon. Decent strength but Orks are poor shots — volume of fire compensates.',
  'Choppa': 'Ork melee weapon. Simple but effective with Ork strength behind it.',
  'Pulse Rifle': 'T\'au standard rifle. Long 30" range and S5 — one of the best basic infantry guns in the game.',
  'Pulse Carbine': 'Shorter T\'au weapon with more mobility. Good for Breachers who advance into close range.',
  'Shuriken Catapult': 'Aeldari shuriken launcher. AP-1 shreds light infantry — Aeldari excel at killing chaff.',
  'Splinter Rifle': 'Drukhari poisoned weapon. Low strength but many shots and good accuracy.',
  'Fleshborer': 'Tyranid bio-weapon that fires living parasites. Short range but each gaunt adds to the swarm.',
  'Scything Talons': 'Tyranid bladed limbs. Many attacks at close range — Hormagaunts rely on speed to reach melee.',
  'Plague Knife': 'Nurgle-infected blade. Won\'t punch through tanks but Plague Marines are tough enough to get close.',
  'Inferno Boltgun': 'Thousand Sons enchanted bolter. AP-1 makes it better against armoured targets than a normal bolter.',
  'Hellgun': 'Hot-shot lasgun for elite Guard. AP-2 ignores most infantry saves — Kasrkin delete light targets.',
  'Heavy Bolter': 'Heavy machine gun. Long range, high strength, and Damage 2 — excellent for picking off multi-wound models.',
  'Battle Cannon': 'Main tank cannon. 48" range, S10 AP-2, Damage 3 — the classic Imperial tank killer. Fire at the biggest enemy threat each turn.',
  'Dread Cannon': 'Walkers\' melee smash attack. Treats vehicles and monsters as melee targets with devastating power.',
  'Thunder Hammer': 'Massive powered hammer. Few attacks but S8, AP-2, and Damage 3 — can one-shot characters.',
  'Nemesis Force Weapon': 'Grey Knight psychic blade. Strong, armour-piercing, and lethal against daemons.',
  'Eviscerator': 'Giant chainsword wielded by Sisters of Battle. Brutal strength for a faith-driven charge.',
  'Radium Carbine': 'Irradiated Skitarii weapon. Many shots at close range — Vanguard want to get in close.',
  'Burst Cannon': 'T\'au rotary cannon. High volume of fire — excellent for clearing infantry.',
  'Harlequin\'s Caress': 'Harlequin monofilament weapon. Fast, accurate, and AP-1 — dancers strike before you react.',
  'Cultist Knife': 'Basic hybrid blade. Weak but numerous — Genestealer Cults win through numbers and ambush.',
  'Autogun': 'Cheap solid-slug rifle. Weak but the Cult fields many of them.',
  'Liberator': 'Leagues of Votann melee weapon. Strong and armour-piercing — Hearthkyn are no pushover in combat.',
  'Hekaton Land Cannon': 'Massive Kin artillery. One of the strongest guns in the game — deletes tanks at range.',
  'Storm Bolter': 'Twin-linked bolter. Double the shots of a boltgun — Terminators and vehicles lay down impressive bolter fire.',
  'Combi-bolter': 'Chaos twin bolter. Same idea as Storm Bolter — rapid bolter fire at range.',
  'Power Mace': 'Dark Angels chaplain weapon. Heavy melee hit with high damage.',
  'Guardian Spear': 'Custodes signature weapon. Excellent all-round melee weapon with great stats.',
  'Castellan Axe': 'Allarus Custodian axe. Slower but hits incredibly hard — S8 AP-3.',
  'Galvanic Rifle': 'Skitarii long-range rifle. Outranges most infantry guns — Rangers shoot from safety.',
  'Twin Phosphor Blaster': 'Kastelan robot cannon. High rate of fire with AP-1 — a walking gun platform.',
  'Reaper Chainsword': 'Knight melee weapon. Enormous blade that can carve through any target.',
  'Thermal Spear': 'Armiger heat lance. Short range but AP-4 — melts tanks at close range.',
  'Melta Bomb': 'One-use explosive. Bullgryns carry these to suicide into enemy vehicles.',
  'Mace of the Righteous': 'Sororitas power mace. Strong melee for elite Sisters.',
  'Manreaper': 'Death Guard scythe. Deadly in the hands of a Lord of Contagion.',
  'Bubotic Axe': 'Nurgle plague axe. Reliable Terminator melee weapon.',
  'Force Stave': 'Thousand Sons psychic staff. Channels warp energy into melee strikes.',
  'Inferno Combi-bolter': 'Terminator sorcerer bolter. Combines bolter fire with psychic melee.',
  'Force Weapon': 'Psychic melee weapon. Strong against all targets.',
  'Chainaxe': 'World Eaters signature weapon. Many attacks with AP-1 — built for slaughter.',
  'Chainblades': 'Possessed berzerker blades. Extremely high attack count.',
  'Axe of Khorne': 'Bloodthirster daemon weapon. Absurd attack count and strength — a Lord of War melee monster.',
  'Hellblade': 'Bloodletter daemon sword. Accurate and armour-piercing for its cost.',
  'Plaguesword': 'Nurgle daemon blade. Reliable but not spectacular — Plaguebearers endure instead.',
  'Reaper Autocannon': 'Chaos Knight autocannon. Rapid anti-tank fire at long range.',
  'Twin Lascannon': 'Double lascannon mount. Two S12 AP-3 shots — dedicated tank hunting.',
  'Tachyon Arrow': 'Necron Overlord superweapon. Extreme range and damage — can delete a target in one shot.',
  'Whip Coils': 'Wraith melee tendrils. Fast and numerous attacks.',
  'Doomsday Cannon': 'Necron doomsday weapon. Low rate of fire but devastating when it hits.',
  'Killsaw': 'Ork Dread melee weapon. Brutal saw that tears through armour.',
  'Fusion Blaster': 'T\'au melta weapon. Short range, AP-4 — melts heavy targets.',
  'Railgun': 'T\'au superweapon. S20 AP-5 — if it hits, almost nothing survives.',
  'Shuriken Pistol': 'Compact shuriken gun. Pairs with witchblades for close combat.',
  'Witchblade': 'Farseer psychic sword. Accurate but modest damage — Farseers rely on psychic powers.',
  'D-Cannon': 'Wraithguard distortion cannon. Short range but deletes anything it wounds.',
  'Bright Lance': 'Aeldari lascannon equivalent. Reliable anti-tank at range.',
  'Splinter Pistol': 'Drukhari sidearm. Accurate poisoned pistol.',
  'Huskblade': 'Drukhari soul-drinking sword. Fast and accurate melee.',
  'Hypex Needle': 'Wych poisoned blade. Wyches rely on speed and numbers.',
  'Disintegrator Cannon': 'Drukhari energy cannon. Strong anti-infantry and anti-light vehicle fire.',
  'Ghostsvord': 'Wraithblade ghost sword. Strong melee for ghost warriors.',
  'Heavy Venom Cannon': 'Tyranid bio-cannon. Long-range monster hunting weapon.',
  'Monstrous Scything Talons': 'Large Tyranid claws. Many high-strength attacks.',
  'Deathspitter': 'Tyranid bio-plasma shooter. Good all-round gun for mid-sized creatures.',
  'Rending Claws': 'Genestealer/Patriarch claws. Fast and AP-1 — deadly on the charge.',
  'Autopistol': 'Cult sidearm. Short range backup weapon.',
  'Heavy Pick': 'Aberrant mining tool turned weapon. Slow but hits like a truck.',
  'Autocannon': 'Kin heavy gun. Long range anti-armour fire.',
  'Volkanite Disintegrator': 'Hearthguard energy weapon. Short range but accurate.',
  'Power Axe': 'Iron Hands power weapon. Strong single-target melee.',
}

export function describeWeapon(weapon: WeaponProfile): string {
  const known = WEAPON_DESCRIPTIONS[weapon.name]
  if (known) return known

  if (weapon.type === 'ranged') {
    if (weapon.strength >= 12) {
      return `Heavy anti-tank gun — ${weapon.range}" range, S${weapon.strength} AP${weapon.ap}, Damage ${weapon.damage}. Built to punch through the thickest armour.`
    }
    if (weapon.strength >= 8) {
      return `Heavy weapon — ${weapon.range}" range, ${weapon.attacks} shots, S${weapon.strength} AP${weapon.ap}. Reliable against vehicles and elite infantry.`
    }
    if (weapon.ap <= -2) {
      return `Armour-piercing fire — ${weapon.range}" range, AP${weapon.ap} ignores most saves. ${weapon.attacks} shot${weapon.attacks > 1 ? 's' : ''} per attack.`
    }
    return `Ranged weapon — ${weapon.range}" range, ${weapon.attacks} shot${weapon.attacks > 1 ? 's' : ''}, S${weapon.strength} AP${weapon.ap}, Damage ${weapon.damage}.`
  }

  if (weapon.strength >= 10) {
    return `Brutal melee — ${weapon.attacks} attacks, S${weapon.strength} AP${weapon.ap}, Damage ${weapon.damage}. Designed to tear apart vehicles and monsters.`
  }
  return `Melee weapon — ${weapon.attacks} attacks at WS ${weapon.skill}+, S${weapon.strength} AP${weapon.ap}, Damage ${weapon.damage}.`
}
