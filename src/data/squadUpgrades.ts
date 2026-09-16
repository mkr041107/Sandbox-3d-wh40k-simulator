import type { SquadUpgrade, SquadUpgradeCategory, WeaponProfile } from '../types/game'

const plasmaGun: WeaponProfile = {
  name: 'Plasma Gun', range: 24, attacks: 1, skill: 3, strength: 7, ap: -2, damage: 1, type: 'ranged',
  description: 'High-strength plasma. Overcharged shots are deadly but risky in the full rules.',
}
const meltagun: WeaponProfile = {
  name: 'Meltagun', range: 12, attacks: 1, skill: 3, strength: 9, ap: -4, damage: 2, type: 'ranged',
  description: 'Short-range tank killer. Get within 12" of vehicles and melt them.',
}
const gravGun: WeaponProfile = {
  name: 'Grav Gun', range: 18, attacks: 2, skill: 3, strength: 5, ap: -1, damage: 1, type: 'ranged',
  description: 'Anti-heavy infantry weapon. Extra effective against tough targets.',
}
const flamer: WeaponProfile = {
  name: 'Flamer', range: 12, attacks: 3, skill: 3, strength: 4, ap: 0, damage: 1, type: 'ranged',
  description: 'Template-style flame weapon. Auto-hits at close range — great for clearing hordes.',
}
const grenadeLauncher: WeaponProfile = {
  name: 'Grenade Launcher', range: 24, attacks: 1, skill: 4, strength: 6, ap: 0, damage: 1, type: 'ranged',
  description: 'Versatile launcher — frag for infantry, krak for light vehicles.',
}
const missileLauncher: WeaponProfile = {
  name: 'Missile Launcher', range: 48, attacks: 1, skill: 4, strength: 8, ap: -2, damage: 2, type: 'ranged',
  description: 'Long-range heavy weapon. Can switch between anti-infantry and anti-tank profiles.',
}
const lascannon: WeaponProfile = {
  name: 'Lascannon', range: 48, attacks: 1, skill: 4, strength: 12, ap: -3, damage: 3, type: 'ranged',
  description: 'Classic anti-tank gun. One powerful shot that punches through armour.',
}
const powerWeapon: WeaponProfile = {
  name: 'Power Weapon', range: 0, attacks: 3, skill: 3, strength: 5, ap: -2, damage: 1, type: 'melee',
  description: 'Energised blade for the sergeant. Cuts through armour in melee.',
}
const thunderHammerUpgrade: WeaponProfile = {
  name: 'Thunder Hammer', range: 0, attacks: 2, skill: 4, strength: 8, ap: -2, damage: 3, type: 'melee',
  description: 'Sergeant thunder hammer. Few swings but each one can delete a character.',
}
const combiPlasma: WeaponProfile = {
  name: 'Combi-plasma', range: 24, attacks: 1, skill: 3, strength: 7, ap: -2, damage: 1, type: 'ranged',
  description: 'Bolter with an under-slung plasma gun. Extra punch at range for sergeants.',
}
const sniperRifle: WeaponProfile = {
  name: 'Sniper Rifle', range: 36, attacks: 1, skill: 3, strength: 4, ap: -2, damage: 2, type: 'ranged',
  description: 'Long-range precision shot. Targets characters and elite infantry.',
}
const plasmaPistol: WeaponProfile = {
  name: 'Plasma Pistol', range: 12, attacks: 1, skill: 3, strength: 7, ap: -2, damage: 1, type: 'ranged',
  description: 'Compact plasma for sergeants who fight in melee.',
}

function upgrade(
  id: string,
  name: string,
  category: SquadUpgradeCategory,
  points: number,
  description: string,
  opts: Partial<SquadUpgrade> = {},
): SquadUpgrade {
  return { id, name, category, points, description, maxPerSquad: 1, ...opts }
}

// ─── Shared upgrade kits ───────────────────────────────────────────

const SM_TROOP_UPGRADES: SquadUpgrade[] = [
  upgrade('apothecary', 'Apothecary', 'specialist', 50,
    'A battlefield medic who tends the wounded. Replaces one Marine in the squad.',
    {
      ability: 'Once per battle, restore D3 lost wounds to a model in this unit (or resurrect one destroyed model at 1 wound). Keeps your squad fighting longer.',
      weapons: [{ name: 'Absolvor Bolt Pistol', range: 18, attacks: 1, skill: 3, strength: 5, ap: -1, damage: 1, type: 'ranged', description: 'Apothecary sidearm for self-defence.' }],
    }),
  upgrade('company-ancient', 'Company Ancient', 'specialist', 45,
    'A banner-bearing veteran who inspires the squad. Replaces one Marine.',
    {
      ability: 'The squad gains +1 Leadership and can re-roll one failed Morale test per battle. Ancient\'s banner keeps Marines fighting when others would flee.',
    }),
  upgrade('sergeant-power-weapon', 'Sergeant w/ Power Weapon', 'sergeant', 10,
    'Upgrade the squad sergeant with a power sword or fist for better melee.',
    { weapons: [powerWeapon], maxPerSquad: 1 }),
  upgrade('sergeant-thunder-hammer', 'Sergeant w/ Thunder Hammer', 'sergeant', 20,
    'Arm the sergeant with a thunder hammer for maximum melee destruction.',
    { weapons: [thunderHammerUpgrade], exclusiveWith: ['sergeant-power-weapon'] }),
  upgrade('sergeant-combi-plasma', 'Sergeant w/ Combi-plasma', 'sergeant', 15,
    'Bolter-combi-plasma gives the sergeant extra anti-armour shooting.',
    { weapons: [combiPlasma] }),
  upgrade('plasma-gun', 'Plasma Gun', 'special-weapon', 10,
    'One Marine exchanges their bolter for a plasma gun. Replaces one model\'s weapon.',
    { weapons: [plasmaGun], maxPerSquad: 2 }),
  upgrade('meltagun', 'Meltagun', 'special-weapon', 10,
    'One Marine carries a meltagun for tank hunting at close range.',
    { weapons: [meltagun], maxPerSquad: 2 }),
  upgrade('grav-gun', 'Grav Gun', 'special-weapon', 15,
    'One Marine carries a grav-gun, devastating against Terminators and monsters.',
    { weapons: [gravGun], maxPerSquad: 1 }),
  upgrade('heavy-bolter', 'Heavy Bolter Marine', 'heavy-weapon', 10,
    'One Marine mans a heavy bolter — more range and damage than a bolter.',
    {
      weapons: [{ name: 'Heavy Bolter', range: 36, attacks: 3, skill: 4, strength: 5, ap: -1, damage: 2, type: 'ranged', description: 'Sustained heavy fire at long range.' }],
      maxPerSquad: 1,
    }),
]

const SM_ASSAULT_UPGRADES: SquadUpgrade[] = [
  upgrade('assault-sergeant-power', 'Sergeant w/ Power Fist', 'sergeant', 15,
    'Power fist sergeant for crushing armour in the assault.',
    { weapons: [{ name: 'Power Fist', range: 0, attacks: 2, skill: 4, strength: 8, ap: -2, damage: 2, type: 'melee', description: 'Devastating anti-armour melee.' }] }),
  upgrade('assault-plasma-pistol', 'Sergeant w/ Plasma Pistol', 'sergeant', 5,
    'Plasma pistol for the sergeant before they charge into melee.',
    { weapons: [plasmaPistol] }),
  upgrade('assault-apothecary', 'Apothecary', 'specialist', 50,
    'Medic attached to the assault squad — keeps your chargers alive longer.',
    { ability: 'Once per battle, restore D3 wounds or revive one model at 1 wound.' }),
]

const SM_TERMINATOR_UPGRADES: SquadUpgrade[] = [
  upgrade('term-sergeant-hammer', 'Sergeant w/ Thunder Hammer', 'sergeant', 10,
    'Thunder hammer and storm shield sergeant for maximum melee output.',
    { weapons: [thunderHammerUpgrade] }),
  upgrade('term-assault-cannon', 'Assault Cannon Terminator', 'heavy-weapon', 15,
    'One Terminator carries an assault cannon for shredding infantry.',
    {
      weapons: [{ name: 'Assault Cannon', range: 24, attacks: 6, skill: 4, strength: 6, ap: 0, damage: 1, type: 'ranged', description: 'Rotary cannon — floods the target with shots.' }],
      maxPerSquad: 1,
    }),
  upgrade('term-cyclone', 'Cyclone Missile Launcher', 'heavy-weapon', 20,
    'Back-mounted missile launcher for long-range fire support.',
    { weapons: [missileLauncher], maxPerSquad: 1 }),
]

const GUARD_INFANTRY_UPGRADES: SquadUpgrade[] = [
  upgrade('guard-sergeant-power', 'Sergeant w/ Power Sword', 'sergeant', 10,
    'Veteran sergeant with a power sword for melee emergencies.',
    { weapons: [powerWeapon] }),
  upgrade('guard-commissar', 'Commissar (attached)', 'specialist', 30,
    'Political officer who enforces discipline. Replaces the squad sergeant.',
    {
      ability: 'Squad gains +1 Leadership. Once per battle, the Commissar can execute a model to automatically pass a Morale test — brutal but effective.',
      weapons: [{ name: 'Bolt Pistol', range: 12, attacks: 1, skill: 3, strength: 4, ap: 0, damage: 1, type: 'ranged' }, powerWeapon],
    }),
  upgrade('guard-grenade-launcher', 'Grenade Launcher', 'special-weapon', 5,
    'One Guardsman carries a grenade launcher for flexible fire support.',
    { weapons: [grenadeLauncher], maxPerSquad: 2 }),
  upgrade('guard-plasma-gun', 'Plasma Gun', 'special-weapon', 10,
    'Special weapons trooper with a plasma gun.',
    { weapons: [plasmaGun], maxPerSquad: 2 }),
  upgrade('guard-meltagun', 'Meltagun', 'special-weapon', 10,
    'Special weapons trooper with a meltagun for anti-tank duty.',
    { weapons: [meltagun], maxPerSquad: 2 }),
  upgrade('guard-heavy-bolter', 'Heavy Weapons Team — Heavy Bolter', 'heavy-weapon', 15,
    'Two-man heavy bolter team. Stays at the back and pours fire downrange.',
    {
      weapons: [{ name: 'Heavy Bolter', range: 36, attacks: 3, skill: 4, strength: 5, ap: -1, damage: 2, type: 'ranged' }],
      maxPerSquad: 1,
    }),
  upgrade('guard-lascannon', 'Heavy Weapons Team — Lascannon', 'heavy-weapon', 20,
    'Two-man lascannon team for dedicated anti-tank fire.',
    { weapons: [lascannon], maxPerSquad: 1 }),
  upgrade('guard-missile-launcher', 'Heavy Weapons Team — Missile Launcher', 'heavy-weapon', 20,
    'Flexible missile launcher team — krak for tanks, frag for infantry.',
    { weapons: [missileLauncher], maxPerSquad: 1 }),
]

const SORORITAS_UPGRADES: SquadUpgrade[] = [
  upgrade('sororitas-imagifier', 'Imagifier', 'specialist', 40,
    'A Sister who carries a sacred banner. Replaces one Battle Sister.',
    { ability: 'Grants the squad +1 to hit in melee and +1 Leadership. The banner inspires faith-driven fury.' }),
  upgrade('sororitas-dialogus', 'Dialogus', 'specialist', 35,
    'A Sister who leads hymns of war. Replaces one Battle Sister.',
    { ability: 'Once per battle, grant the squad +1 to wound rolls for one phase. Litanies turn faith into lethality.' }),
  upgrade('sororitas-plasma', 'Sister w/ Plasma Gun', 'special-weapon', 10,
    'One Sister exchanges her bolter for a plasma gun.',
    { weapons: [plasmaGun], maxPerSquad: 2 }),
  upgrade('sororitas-melta', 'Sister w/ Meltagun', 'special-weapon', 10,
    'One Sister carries a meltagun for anti-armour work.',
    { weapons: [meltagun], maxPerSquad: 2 }),
  upgrade('sororitas-flamer', 'Sister w/ Flamer', 'special-weapon', 5,
    'One Sister carries a flamer for clearing trenches and hordes.',
    { weapons: [flamer], maxPerSquad: 2 }),
  upgrade('sororitas-sergeant-power', 'Sister Superior w/ Power Weapon', 'sergeant', 10,
    'Arm the squad leader with a power weapon or mace.',
    { weapons: [powerWeapon] }),
]

const CSM_UPGRADES: SquadUpgrade[] = [
  upgrade('csm-apothecary', 'Chaos Apothecary', 'specialist', 50,
    'Dark medic who harvests gene-seed from the fallen. Keeps Legionaries in the fight.',
    { ability: 'Once per battle, restore D3 wounds or revive one model at 1 wound.' }),
  upgrade('csm-icon', 'Icon of Chaos', 'wargear', 20,
    'A blasphemous icon carried into battle.',
    { ability: 'Squad gains +1 Leadership and re-rolls one failed Morale test per battle.' }),
  upgrade('csm-sergeant-power', 'Aspiring Champion w/ Power Weapon', 'sergeant', 10,
    'Champion armed with a power weapon for dueling enemy leaders.',
    { weapons: [powerWeapon] }),
  upgrade('csm-plasma', 'Plasma Gun', 'special-weapon', 10,
    'One Legionary with a plasma gun.', { weapons: [plasmaGun], maxPerSquad: 2 }),
  upgrade('csm-melta', 'Meltagun', 'special-weapon', 10,
    'One Legionary with a meltagun.', { weapons: [meltagun], maxPerSquad: 2 }),
  upgrade('csm-reaper', 'Reaper Chaincannon', 'heavy-weapon', 15,
    'One Legionary mans a reaper chaincannon.',
    {
      weapons: [{ name: 'Reaper Chaincannon', range: 24, attacks: 8, skill: 4, strength: 5, ap: -1, damage: 1, type: 'ranged', description: 'Chaos rotary cannon — shreds infantry.' }],
      maxPerSquad: 1,
    }),
]

const DEATH_GUARD_UPGRADES: SquadUpgrade[] = [
  upgrade('dg-plague-surgeon', 'Plague Surgeon', 'specialist', 50,
    'Nurgle\'s twisted medic. Replaces one Plague Marine.',
    { ability: 'Once per battle, restore D3 wounds to a model. Plague Surgeon keeps the slow advance going.' }),
  upgrade('dg-icon', 'Icon of Despair', 'wargear', 15,
    'Nurgle icon that unsettles enemies.',
    { ability: 'Enemy units in melee with this squad suffer -1 Leadership.' }),
  upgrade('dg-blight-launcher', 'Blight Launcher', 'special-weapon', 10,
    'Grenade launcher spewing plague grenades.',
    {
      weapons: [{ name: 'Blight Launcher', range: 24, attacks: 2, skill: 3, strength: 6, ap: -1, damage: 2, type: 'ranged', description: 'Plague grenades that spread disease and shrapnel.' }],
      maxPerSquad: 2,
    }),
  upgrade('dg-plague-belcher', 'Plague Belcher', 'special-weapon', 5,
    'Short-range plague flame weapon.',
    { weapons: [flamer], maxPerSquad: 2 }),
  upgrade('dg-melta', 'Plague Marine w/ Meltagun', 'special-weapon', 10,
    'Meltagun for cracking armour despite the slow advance.',
    { weapons: [meltagun], maxPerSquad: 1 }),
]

const TAU_UPGRADES: SquadUpgrade[] = [
  upgrade('tau-ethereal', 'Ethereal (attached)', 'specialist', 50,
    'Spiritual leader who joins the squad. Fragile but powerful support.',
    { ability: 'Squad gains +1 Leadership. Once per battle, grant re-rolls of 1s to hit for one shooting phase.' }),
  upgrade('tau-markerlight', 'Markerlight Drone', 'wargear', 15,
    'Drone that paints targets for the rest of the army.',
    { ability: 'Once per turn, designate an enemy unit — other T\'au units gain +1 to hit against it.' }),
  upgrade('tau-sergeant-marker', 'Shas\'ui w/ Markerlight', 'sergeant', 5,
    'Team leader with a markerlight for target designation.',
    { ability: 'Squad can designate one target per turn for +1 to hit.' }),
  upgrade('tau-plasma', 'Gun w/ Plasma Rifle', 'special-weapon', 10,
    'One Fire Warrior with a plasma rifle.',
    {
      weapons: [{ name: 'Plasma Rifle', range: 24, attacks: 1, skill: 4, strength: 8, ap: -3, damage: 2, type: 'ranged', description: 'T\'au plasma — accurate and armour-piercing.' }],
      maxPerSquad: 2,
    }),
  upgrade('tau-fusion', 'Gun w/ Fusion Blaster', 'special-weapon', 15,
    'One Fire Warrior with a fusion blaster for tank hunting.',
    {
      weapons: [{ name: 'Fusion Blaster', range: 12, attacks: 1, skill: 4, strength: 9, ap: -4, damage: 3, type: 'ranged' }],
      maxPerSquad: 1,
    }),
]

const NECRON_UPGRADES: SquadUpgrade[] = [
  upgrade('necron-plasmacyte', 'Plasmacyte', 'specialist', 15,
    'Small construct that supercharges weapons. Replaces one Warrior.',
    { ability: 'Once per battle, one shooting attack from this unit gains +1 Strength.' }),
  upgrade('necron-technomancer', 'Technomancer (attached)', 'specialist', 80,
    'Cryptek who repairs and buffs the squad.',
    { ability: 'Once per battle, return D3 destroyed models to the unit. Necrons rise again.' }),
  upgrade('necron-gloom-prism', 'Gloom Prism', 'wargear', 20,
    'Defensive field generator carried by the squad.',
    { ability: 'Squad gains a 5+ invulnerable save against ranged attacks (simplified).' }),
  upgrade('necron-guass-cannon', 'Warrior w/ Gauss Cannon', 'heavy-weapon', 20,
    'One Warrior upgraded to a heavier gauss cannon.',
    {
      weapons: [{ name: 'Gauss Cannon', range: 24, attacks: 3, skill: 4, strength: 8, ap: -2, damage: 2, type: 'ranged', description: 'Heavy gauss weapon for cracking armour.' }],
      maxPerSquad: 1,
    }),
]

const ORK_UPGRADES: SquadUpgrade[] = [
  upgrade('ork-nob', 'Nob', 'sergeant', 15,
    'Bigger, tougher Ork who leads the mob. Replaces one Boy.',
    {
      weapons: [choppa(), shoota()],
      ability: 'Squad re-rolls failed charge rolls. The Nob leads the Waaagh!',
    }),
  upgrade('ork-weirdboy', 'Weirdboy (attached)', 'specialist', 60,
    'Psyker who channels the Waaagh! into destructive power.',
    { ability: 'Once per battle, deal D3 mortal wounds to an enemy unit within 18".' }),
  upgrade('ork-big-shoota', 'Boy w/ Big Shoota', 'heavy-weapon', 5,
    'One Boy mans a big shoota for extra dakka.',
    {
      weapons: [{ name: 'Big Shoota', range: 36, attacks: 3, skill: 5, strength: 5, ap: 0, damage: 1, type: 'ranged', description: 'More dakka — bigger gun, more shots.' }],
      maxPerSquad: 2,
    }),
  upgrade('ork-rokkit', 'Boy w/ Rokkit Launcha', 'special-weapon', 10,
    'One Boy with a rokkit launcha for tank popping.',
    {
      weapons: [{ name: 'Rokkit Launcha', range: 24, attacks: 1, skill: 5, strength: 8, ap: -2, damage: 3, type: 'ranged', description: 'Orky rocket — inaccurate but hits hard.' }],
      maxPerSquad: 2,
    }),
]

const TYRANID_UPGRADES: SquadUpgrade[] = [
  upgrade('tyranid-venomthrope', 'Venomthrope (attached)', 'specialist', 40,
    'Toxic creature that shields the swarm with spores.',
    { ability: 'Friendly Tyranid units within 6" gain -1 to be hit by ranged attacks.' }),
  upgrade('tyranid-strangleweb', 'Strangleweb Gaunt', 'special-weapon', 5,
    'One gaunt with a short-range web weapon.',
    {
      weapons: [{ name: 'Strangleweb', range: 6, attacks: 1, skill: 4, strength: 4, ap: -1, damage: 1, type: 'ranged', description: 'Short-range web that entangles targets.' }],
      maxPerSquad: 1,
    }),
  upgrade('tyranid-devourer', 'Termagant w/ Devourer', 'special-weapon', 5,
    'Ranged gaunt with a devourer for more firepower.',
    {
      weapons: [{ name: 'Devourer', range: 18, attacks: 3, skill: 4, strength: 4, ap: 0, damage: 1, type: 'ranged', description: 'Bio-gun with multiple shots per gaunt.' }],
      maxPerSquad: 2,
    }),
]

const AELDARI_UPGRADES: SquadUpgrade[] = [
  upgrade('aeldari-warlock', 'Warlock (attached)', 'specialist', 45,
    'Psyker who joins the squad with protective runes.',
    { ability: 'Once per battle, cast Protect on the squad — gain a 4+ invulnerable save for one phase.' }),
  upgrade('aeldari-platform', 'Heavy Weapon Platform', 'heavy-weapon', 30,
    'Grav platform with a heavy weapon. Adds serious firepower.',
    {
      weapons: [{ name: 'Shuriken Cannon', range: 24, attacks: 3, skill: 3, strength: 6, ap: -1, damage: 2, type: 'ranged', description: 'Heavy shuriken weapon on a mobile platform.' }],
      maxPerSquad: 1,
    }),
  upgrade('aeldari-plasma', 'Guardian w/ Fusion Gun', 'special-weapon', 10,
    'One Guardian with a fusion gun for anti-tank.',
    {
      weapons: [{ name: 'Fusion Gun', range: 12, attacks: 1, skill: 4, strength: 9, ap: -4, damage: 3, type: 'ranged' }],
      maxPerSquad: 1,
    }),
]

const VOTANN_UPGRADES: SquadUpgrade[] = [
  upgrade('votann-bear', 'Theyn (Squad Leader)', 'sergeant', 10,
    'Experienced Kin warrior leading the squad with better wargear.',
    { weapons: [powerWeapon], ability: 'Squad gains +1 OC while the Theyn lives.' }),
  upgrade('votann-medipack', 'Medipack', 'wargear', 10,
    'Medical supplies for field repairs.',
    { ability: 'Once per battle, restore D3 wounds to one model in the squad.' }),
  upgrade('votann-comms', 'Comms Array', 'wargear', 15,
    'Communication gear linking to orbital support.',
    { ability: 'Once per battle, re-roll all failed hit rolls for one shooting attack.' }),
  upgrade('votann-ionic', 'Hearthkyn w/ Ion Blaster', 'special-weapon', 10,
    'One warrior with an ion blaster.',
    {
      weapons: [{ name: 'Ion Blaster', range: 24, attacks: 2, skill: 4, strength: 7, ap: -2, damage: 1, type: 'ranged', description: 'Kin ion weapon — strong and armour-piercing.' }],
      maxPerSquad: 2,
    }),
]

function choppa(): WeaponProfile {
  return { name: 'Choppa', range: 0, attacks: 3, skill: 4, strength: 5, ap: 0, damage: 1, type: 'melee' }
}
function shoota(): WeaponProfile {
  return { name: 'Shoota', range: 18, attacks: 2, skill: 5, strength: 5, ap: 0, damage: 1, type: 'ranged' }
}

// ─── Unit → upgrade mapping ────────────────────────────────────────

const INTERCESSOR_IDS = [
  'sm-intercessor', 'ultramarines-intercessor', 'sal-intercessor', 'if-intercessor',
  'ih-intercessor', 'rg-infiltrator',
]

const UPGRADE_MAP: Record<string, SquadUpgrade[]> = {
  'sm-assault': SM_ASSAULT_UPGRADES,
  'sm-terminator': SM_TERMINATOR_UPGRADES,
  'am-cadian': GUARD_INFANTRY_UPGRADES,
  'am-kasrkin': [
    ...GUARD_INFANTRY_UPGRADES.filter((u) => !u.id.includes('commissar')),
    upgrade('kasrkin-demolitions', 'Demolitions Charge', 'wargear', 10,
      'Breaching charges for destroying fortifications and vehicles.',
      { ability: 'Once per battle, one melee attack deals +2 Damage against Vehicles.' }),
  ],
  'sororitas-battle': SORORITAS_UPGRADES,
  'csm-legionary': CSM_UPGRADES,
  'dg-plague': DEATH_GUARD_UPGRADES,
  'dg-poxwalker': [
    upgrade('dg-icon-pox', 'Icon of Seeping Decay', 'wargear', 10,
      'Nurgle icon that spreads fear.',
      { ability: 'Enemy units in melee suffer -1 Leadership.' }),
  ],
  'tau-strike': TAU_UPGRADES,
  'tau-breacher': [
    ...TAU_UPGRADES,
    upgrade('tau-breach-drone', 'Guardian Drone', 'wargear', 20,
      'Defensive drone that intercepts fire.',
      { ability: 'Squad gains a 5+ invulnerable save against ranged attacks (simplified).' }),
  ],
  'necron-warrior': NECRON_UPGRADES,
  'necron-immortal': [
    upgrade('necron-immortal-plasmacyte', 'Plasmacyte', 'specialist', 15,
      'Supercharges Immortal weapons.', { ability: 'Once per battle, +1 Strength on one shooting attack.' }),
    upgrade('necron-immortal-guass-cannon', 'Immortal w/ Gauss Cannon', 'heavy-weapon', 15,
      'One Immortal with a heavier weapon.',
      { weapons: [{ name: 'Gauss Cannon', range: 24, attacks: 3, skill: 4, strength: 8, ap: -2, damage: 2, type: 'ranged' }], maxPerSquad: 1 }),
  ],
  'ork-boyz': ORK_UPGRADES,
  'tyranid-termagant': TYRANID_UPGRADES,
  'tyranid-hormagaunt': [
    upgrade('tyranid-toxic-miasma', 'Adrenal Glands', 'wargear', 5,
      'Injected adrenaline boosts speed.',
      { ability: 'Squad gains +2" movement on the turn they charge.' }),
  ],
  'aeldari-guardian': AELDARI_UPGRADES,
  'aeldari-dire': [
    upgrade('aeldari-dire-sergeant', 'Dire Avenger Exarch', 'sergeant', 15,
      'Exarch with improved weapons and leadership.',
      { weapons: [shurikenCatapult()], ability: 'Squad re-rolls 1s to hit in shooting.' }),
    upgrade('aeldari-dire-plasma', 'Exarch w/ Plasma Grenade Launcher', 'special-weapon', 10,
      'Exarch with anti-armour grenades.',
      { weapons: [plasmaGun] }),
  ],
  'votann-hearthkyn': VOTANN_UPGRADES,
  'gsc-neophyte': [
    upgrade('gsc-cult-icon', 'Cult Icon', 'wargear', 10,
      'Icon of the cult that stirs fanaticism.',
      { ability: '+1 Leadership and re-roll one Morale test per battle.' }),
    upgrade('gsc-mining-laser', 'Neophyte w/ Mining Laser', 'heavy-weapon', 20,
      'Industrial laser repurposed for war.',
      { weapons: [lascannon], maxPerSquad: 1 }),
    upgrade('gsc-seismic', 'Seismic Detonator', 'special-weapon', 10,
      'Explosive device for demolition.',
      { ability: 'Once per battle, deal D3 mortal wounds to an enemy unit within 6".' }),
  ],
  'gsc-acolyte': [
    upgrade('gsc-acolyte-leader', 'Acolyte Leader w/ Demolition Charges', 'sergeant', 10,
      'Squad leader with explosives.',
      { ability: 'Melee attacks against Vehicles gain +1 Damage.' }),
  ],
  'bt-crusader': [
    ...SM_ASSAULT_UPGRADES.filter((u) => u.id !== 'assault-apothecary'),
    upgrade('bt-sword-brother', 'Sword Brother', 'sergeant', 15,
      'Veteran crusader with enhanced melee.',
      { weapons: [powerWeapon] }),
  ],
  'sw-grey-hunter': [
    ...SM_TROOP_UPGRADES.filter((u) => !u.id.includes('apothecary')),
    upgrade('sw-wolf-tail', 'Wolf Guard Pack Leader', 'sergeant', 15,
      'Veteran Space Wolf leading the pack.',
      { weapons: [powerWeapon, combiPlasma] }),
    upgrade('sw-wolf-priest', 'Wolf Priest (attached)', 'specialist', 70,
      'Fenrisian chaplain-medic who heals and inspires.',
      { ability: 'Once per battle, restore D3 wounds. Squad gains +1 to wound in melee on the charge.' }),
  ],
  'dw-kill-team': [
    upgrade('dw-black-shield', 'Black Shield', 'specialist', 20,
      'Mysterious veteran with no chapter colours.',
      { weapons: [powerWeapon], ability: 'Can re-roll one failed save per battle.' }),
    upgrade('dw-frag-cannon', 'Kill Team w/ Frag Cannon', 'heavy-weapon', 20,
      'One marine with a massive frag cannon.',
      { weapons: [{ name: 'Frag Cannon', range: 18, attacks: 2, skill: 4, strength: 7, ap: -1, damage: 2, type: 'ranged' }], maxPerSquad: 1 }),
    upgrade('dw-melta', 'Kill Team w/ Meltagun', 'special-weapon', 10,
      'Specialist with meltagun.', { weapons: [meltagun], maxPerSquad: 2 }),
  ],
  'we-berzerker': [
    upgrade('we-berzerker-champion', 'Exalted Champion', 'sergeant', 15,
      'Berzerker champion with chainaxes.',
      { weapons: [{ name: 'Chainaxe', range: 0, attacks: 4, skill: 3, strength: 6, ap: -1, damage: 1, type: 'melee' }] }),
    upgrade('we-berzerker-icon', 'Icon of Khorne', 'wargear', 20,
      'Blood-soaked icon of the Blood God.',
      { ability: 'Squad gains +1 attack in the Fight phase on the turn they charged.' }),
  ],
  'ts-rubric': [
    upgrade('ts-rubric-icon', 'Icon of Tzeentch', 'wargear', 20,
      'Arcane icon channeling warp energy.',
      { ability: 'Once per battle, re-roll all failed wound rolls for one shooting attack.' }),
    upgrade('ts-rubric-warpflamer', 'Rubric Marine w/ Warpflamer', 'special-weapon', 10,
      'Warp-touched flamer.', { weapons: [flamer], maxPerSquad: 2 }),
    upgrade('ts-rubric-sorc', 'Rubric Marine w/ Soulreaper Cannon', 'heavy-weapon', 15,
      'Heavy inferno weapon.',
      { weapons: [{ name: 'Soulreaper Cannon', range: 24, attacks: 6, skill: 3, strength: 5, ap: -2, damage: 1, type: 'ranged' }], maxPerSquad: 1 }),
  ],
  'drukhari-kabalite': [
    upgrade('drukhari-sybarite', 'Sybarite w/ Blast Pistol', 'sergeant', 10,
      'Kabalite leader with a blast pistol.',
      { weapons: [{ name: 'Blast Pistol', range: 6, attacks: 1, skill: 3, strength: 4, ap: -1, damage: 1, type: 'ranged' }, powerWeapon] }),
    upgrade('drukhari-dark-lance', 'Kabalite w/ Dark Lance', 'heavy-weapon', 20,
      'Heavy darklight weapon for tank hunting.',
      { weapons: [{ name: 'Dark Lance', range: 36, attacks: 1, skill: 4, strength: 12, ap: -3, damage: 3, type: 'ranged' }], maxPerSquad: 1 }),
    upgrade('drukhari-blast', 'Kabalite w/ Blaster', 'special-weapon', 10,
      'Short-range darklight blaster.', { weapons: [meltagun], maxPerSquad: 2 }),
  ],
  'admech-ranger': [
    upgrade('admech-ranger-alpha', 'Ranger Alpha w/ Arc Pistol', 'sergeant', 5,
      'Squad leader with an arc pistol.',
      { weapons: [{ name: 'Arc Pistol', range: 12, attacks: 1, skill: 4, strength: 6, ap: -1, damage: 1, type: 'ranged' }] }),
    upgrade('admech-ranger-plasma', 'Ranger w/ Plasma Caliver', 'special-weapon', 10,
      'Skitarii plasma weapon.', { weapons: [plasmaGun], maxPerSquad: 2 }),
    upgrade('admech-ranger-transuranic', 'Ranger w/ Transuranic Arquebus', 'special-weapon', 10,
      'Long-range sniper rifle.',
      { weapons: [sniperRifle], maxPerSquad: 2 }),
  ],
  'admech-vanguard': [
    upgrade('admech-vanguard-alpha', 'Vanguard Alpha', 'sergeant', 5,
      'Squad leader with enhanced radium carbine.',
      { ability: 'Squad gains +1 to hit on the turn they advance into range.' }),
    upgrade('admech-vanguard-plasma', 'Vanguard w/ Plasma Caliver', 'special-weapon', 10,
      'Close-range plasma for Vanguard.', { weapons: [plasmaGun], maxPerSquad: 2 }),
  ],
}

// Apply SM troop upgrades to all intercessor squads
for (const id of INTERCESSOR_IDS) {
  UPGRADE_MAP[id] = SM_TROOP_UPGRADES
}

function shurikenCatapult(): WeaponProfile {
  return { name: 'Shuriken Catapult', range: 18, attacks: 2, skill: 3, strength: 4, ap: -1, damage: 1, type: 'ranged' }
}

export const UPGRADE_CATEGORY_LABELS: Record<SquadUpgradeCategory, string> = {
  sergeant: 'Sergeant / Leader',
  specialist: 'Specialist',
  'special-weapon': 'Special Weapon',
  'heavy-weapon': 'Heavy Weapon',
  wargear: 'Wargear',
}

const MARINE_CHAPTER_PREFIXES = [
  'space-marines', 'ultramarines', 'blood-angels', 'dark-angels', 'space-wolves',
  'black-templars', 'deathwatch', 'grey-knights', 'raven-guard', 'salamanders',
  'imperial-fists', 'iron-hands', 'white-scars',
]

const GENERATED_TO_LEGACY_UPGRADES: Record<string, string> = {
  'intercessor-squad': 'sm-intercessor',
  'assault-intercessor-squad': 'sm-assault',
  'assault-intercessors-with-jump-packs': 'sm-assault',
  'terminator-squad': 'sm-terminator',
  'legionaries': 'csm-legionary',
  'battle-sisters-squad': 'sororitas-battle',
  'plague-marines': 'dg-plague',
  'poxwalkers': 'dg-poxwalker',
  'strike-team': 'tau-strike',
  'breacher-team': 'tau-breacher',
  'necron-warriors': 'necron-warrior',
  'immortals': 'necron-immortal',
  'kabalite-warriors': 'drukhari-kabalite',
  'skitarii-rangers': 'admech-ranger',
  'skitarii-vanguards': 'admech-vanguard',
  'cadian-shock-troops': 'am-cadian',
  'kasrkin': 'am-kasrkin',
}

function resolveUpgradeProfileId(profileId: string): string | undefined {
  if (UPGRADE_MAP[profileId]) return profileId

  for (const [slug, legacyId] of Object.entries(GENERATED_TO_LEGACY_UPGRADES)) {
    if (profileId.endsWith(`-${slug}`) && UPGRADE_MAP[legacyId]) return legacyId
  }

  for (const prefix of MARINE_CHAPTER_PREFIXES) {
    if (!profileId.startsWith(`${prefix}-`)) continue
    const slug = profileId.slice(prefix.length + 1)
    const legacyId = GENERATED_TO_LEGACY_UPGRADES[slug]
    if (legacyId && UPGRADE_MAP[legacyId]) return legacyId
  }

  return undefined
}

export function getUpgradesForUnit(profileId: string): SquadUpgrade[] {
  const resolved = resolveUpgradeProfileId(profileId)
  return resolved ? UPGRADE_MAP[resolved] : []
}

export function getUpgradeById(upgradeId: string): SquadUpgrade | undefined {
  for (const upgrades of Object.values(UPGRADE_MAP)) {
    const found = upgrades.find((u) => u.id === upgradeId)
    if (found) return found
  }
  return undefined
}

export function validateUpgrades(profileId: string, selectedIds: string[]): string | null {
  const available = getUpgradesForUnit(profileId)
  const counts: Record<string, number> = {}

  for (const id of selectedIds) {
    const upgradeDef = available.find((u) => u.id === id)
    if (!upgradeDef) return `Unknown upgrade: ${id}`
    counts[id] = (counts[id] ?? 0) + 1
    if (counts[id] > upgradeDef.maxPerSquad) {
      return `Too many ${upgradeDef.name} (max ${upgradeDef.maxPerSquad} per squad)`
    }
    for (const other of selectedIds) {
      if (other !== id && upgradeDef.exclusiveWith?.includes(other)) {
        const otherDef = available.find((u) => u.id === other)
        return `${upgradeDef.name} cannot be combined with ${otherDef?.name ?? other}`
      }
    }
  }
  return null
}

export function calculateUpgradePoints(upgradeIds: string[]): number {
  return upgradeIds.reduce((sum, id) => sum + (getUpgradeById(id)?.points ?? 0), 0)
}

export function applyUpgradesToProfile(
  profile: import('../types/game').UnitProfile,
  upgradeIds: string[],
): import('../types/game').UnitProfile {
  const extraWeapons = upgradeIds.flatMap((id) => getUpgradeById(id)?.weapons ?? [])
  const abilities = upgradeIds.map((id) => getUpgradeById(id)?.ability).filter(Boolean)

  return {
    ...profile,
    weapons: [...profile.weapons, ...extraWeapons],
    description: abilities.length > 0
      ? `${profile.description ?? ''}\n\nSquad upgrades: ${abilities.join(' ')}`
      : profile.description,
  }
}
