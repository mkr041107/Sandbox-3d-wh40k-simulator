import type { FactionId } from '../types/game'
import { getFaction } from './factions'

export interface DetachmentStratagem {
  name: string
  cp: number
  phase: string
  effect: string
}

export interface Detachment {
  id: string
  name: string
  focus: string
  description: string
  armyRule: { name: string; text: string }
  stratagems: DetachmentStratagem[]
}

const MARINE_CHAPTER_FACTIONS: FactionId[] = [
  'ultramarines', 'blood-angels', 'dark-angels', 'space-wolves', 'black-templars',
  'deathwatch', 'grey-knights', 'raven-guard', 'salamanders', 'imperial-fists',
  'iron-hands', 'white-scars',
]

function d(
  id: string,
  name: string,
  focus: string,
  description: string,
  ruleName: string,
  ruleText: string,
  stratagems: DetachmentStratagem[],
): Detachment {
  return {
    id,
    name,
    focus,
    description,
    armyRule: { name: ruleName, text: ruleText },
    stratagems,
  }
}

const CODEX_MARINE_DETACHMENTS: Detachment[] = [
  d(
    'gladius-task-force',
    'Gladius Task Force',
    'Balanced',
    'The classic Codex layout — battleline troops hold objectives while elites and characters lead the push.',
    'Combat Doctrines',
    'At the start of your Command phase, select an doctrine: Devastator (+1 to hit ranged if stationary), Tactical (+1 OC), Assault (+1" charge). Lasts until your next Command phase.',
    [
      { name: 'Only In Death Does Duty End', cp: 1, phase: 'Fight', effect: 'One unit fights again at the end of the phase.' },
      { name: 'Honour the Chapter', cp: 1, phase: 'Fight', effect: 'One unit gains +1 to wound in melee this phase.' },
    ],
  ),
  d(
    'ironstorm-spearhead',
    'Ironstorm Spearhead',
    'Armoured',
    'Tanks and heavy support dominate — infantry screens the gunline while armour breaks the line.',
    'Armoured Reserves',
    'Vehicle units from Reserves can arrive turn 1 if you control a home objective. Vehicles gain +1 to save against ranged attacks while on an objective.',
    [
      { name: 'Tank Shock', cp: 1, phase: 'Charge', effect: 'One Vehicle unit can charge after Advancing this turn.' },
      { name: 'Armoured Fist', cp: 2, phase: 'Shooting', effect: 'One Vehicle unit gains +1 to hit until end of phase.' },
    ],
  ),
  d(
    'spearhead-task-force',
    'Spearhead Task Force',
    'Elite',
    'Elites and fast attack spearhead the assault while characters buff the strike force.',
    'Oath of Moment',
    'At the start of your Shooting or Fight phase, select one enemy unit. Until end of phase, each time a friendly unit targets it, you can re-roll one hit or wound roll.',
    [
      { name: 'Fire Discipline', cp: 1, phase: 'Shooting', effect: 'One Infantry unit gains +1 to hit until end of phase.' },
      { name: 'Go to Ground', cp: 1, phase: 'Shooting', effect: 'One Infantry unit gains Benefit of Cover until end of turn.' },
    ],
  ),
]

const FACTION_DETACHMENTS: Partial<Record<FactionId, Detachment[]>> = {
  'space-marines': CODEX_MARINE_DETACHMENTS,
  'astra-militarum': [
    d(
      'dawn-of-war',
      'Dawn of War',
      'Balanced',
      'Combined arms Guard — infantry hold the line, tanks and artillery delete priority targets.',
      'Born Soldiers',
      'Each time an Officer issues an Order, the receiving unit can re-roll one hit roll when shooting this phase.',
      [
        { name: 'Fix Bayonets!', cp: 1, phase: 'Fight', effect: 'One Infantry unit gains +1 to hit in melee this phase.' },
        { name: 'Take Cover!', cp: 1, phase: 'Shooting', effect: 'One Infantry unit gains Benefit of Cover until end of turn.' },
      ],
    ),
    d(
      'bridgehead-strike',
      'Bridgehead Strike',
      'Aggressive',
      'Mechanised push — transports deliver troops deep, then armour exploits the breach.',
      'Mechanised Assault',
      'Transport units can disembark after Advancing. Units that disembarked this turn count as Remained Stationary for shooting.',
      [
        { name: 'First Rank, Fire!', cp: 1, phase: 'Shooting', effect: 'One Infantry unit gains +1 to hit when shooting Rapid Fire weapons.' },
        { name: 'Get Back in the Fight', cp: 2, phase: 'Command', effect: 'One destroyed Infantry unit returns with half models (once per battle).' },
      ],
    ),
    d(
      'guard-and-storm',
      'Guard and Storm',
      'Artillery',
      'Basilisks and Manticores pound the mid-board while infantry dig in on objectives.',
      'Artillery Support',
      'Indirect Fire weapons ignore the penalty for not having line of sight if a friendly unit can see the target.',
      [
        { name: 'Smokescreen', cp: 1, phase: 'Shooting', effect: 'One Vehicle unit gains -1 to be hit until end of turn.' },
        { name: 'Bring it Down', cp: 1, phase: 'Shooting', effect: 'One unit gains +1 to wound against Monster or Vehicle targets.' },
      ],
    ),
  ],
  necrons: [
    d(
      'awakening-the-dynasty',
      'Awakening the Dynasty',
      'Balanced',
      'Core warriors and support units reanimate while characters buff the phalanx.',
      'Reanimation Protocols',
      'At end of your Command phase, roll one D6 for each Necrons unit below Starting Strength: on 5+ return one destroyed model (or D3 for Character).',
      [
        { name: 'Nanoscarab Reanimation', cp: 1, phase: 'Fight', effect: 'One unit gains 5+ Feel No Pain until end of phase.' },
        { name: 'Solar Pulse', cp: 1, phase: 'Shooting', effect: 'One enemy unit cannot use Cover saves this phase.' },
      ],
    ),
    d(
      'hypercrypt-legion',
      'Hypercrypt Legion',
      'Aggressive',
      'Fast destroyer cults and wraiths strike weak points before the main line engages.',
      'Hypercrypt Legion',
      'Destroyer Cult and Flayed Ones units can charge after Advancing. Each time they destroy an enemy unit, gain 1CP.',
      [
        { name: 'Chrono-shift', cp: 1, phase: 'Movement', effect: 'One unit can make a Normal move of up to 6" in the Command phase.' },
        { name: 'Cosmic Insanity', cp: 2, phase: 'Fight', effect: 'One unit fights twice this phase.' },
      ],
    ),
    d(
      'starshatter-arsenal',
      'Starshatter Arsenal',
      'Shooting',
      'Doomsday arks and destroyers saturate the board with high-volume fire.',
      'Relentless Onslaught',
      'Each time a Necrons Vehicle shoots, you can re-roll one hit roll for each weapon fired.',
      [
        { name: 'Quantum Deflection', cp: 1, phase: 'Shooting', effect: 'One Vehicle unit gains 4+ invulnerable save against ranged until end of phase.' },
        { name: 'Harbingers of Destruction', cp: 1, phase: 'Shooting', effect: 'One unit gains +1 to wound against units on objectives.' },
      ],
    ),
  ],
  tyranids: [
    d(
      'invasion-fleet',
      'Invasion Fleet',
      'Horde',
      'Swarms of gaunts flood objectives while synapse keeps the brood coordinated.',
      'Synaptic Imperative',
      'Synapse units within 6" of a Battleline unit grant it Ld 6+ and prevent Battle-shock on 5+.',
      [
        { name: 'Adrenal Surge', cp: 1, phase: 'Fight', effect: 'One unit gains +1 to hit and +1 to wound in melee this phase.' },
        { name: 'Spore Clouds', cp: 1, phase: 'Shooting', effect: 'One unit gains -1 to be hit until end of turn.' },
      ],
    ),
    d(
      'crusher-stampede',
      'Crusher Stampede',
      'Monsters',
      'Carnifexes and monsters smash through the centre while smaller creatures pick off stragglers.',
      'Raging Ferocity',
      'Monster units add +1 to charge rolls and +1 to hit in the Fight phase on the turn they charged.',
      [
        { name: 'Monstrous Musculature', cp: 1, phase: 'Fight', effect: 'One Monster unit fights first this phase.' },
        { name: 'Overwhelming Force', cp: 2, phase: 'Charge', effect: 'One unit can charge after Advancing.' },
      ],
    ),
    d(
      'assimilation-swarm',
      'Assimilation Swarm',
      'Elite',
      'Warriors and tyrants anchor the line with lethal bioweapons and psychic pressure.',
      'Feed the Swarm',
      'When an enemy unit is destroyed within 6" of your units, one friendly unit regains D3 lost models (max once per phase).',
      [
        { name: 'Predatory Imperative', cp: 1, phase: 'Shooting', effect: 'One unit re-rolls hit rolls until end of phase.' },
        { name: 'Synaptic Lynchpin', cp: 1, phase: 'Command', effect: 'One Synapse unit\'s aura extends to 9" until end of turn.' },
      ],
    ),
  ],
  orks: [
    d(
      'war-horde',
      'War Horde',
      'Horde',
      'Boyz and grots in massive blocks — quantity has a quality all its own.',
      'Waaagh!',
      'Once per battle at start of your Command phase, call a Waaagh! — Orks units gain +1 to hit and +1" move until your next Command phase.',
      [
        { name: 'Unstoppable Waaagh!', cp: 1, phase: 'Fight', effect: 'One unit fights twice this phase.' },
        { name: 'Fightin\' Dirty', cp: 1, phase: 'Fight', effect: 'One unit gains +1 to wound in melee.' },
      ],
    ),
    d(
      'dread-waaagh',
      'Dread Waaagh!',
      'Mechanised',
      'Trukks and battlewagons deliver nobz and Meganobz into the thick of it.',
      'Mob Rule',
      'Each time an Orks Vehicle is destroyed, roll D6: on 4+ it explodes (3" mortal wounds) and one nearby Orks unit can charge this turn.',
      [
        { name: 'Grot Shields', cp: 1, phase: 'Shooting', effect: 'One Vehicle unit gains 5+ invulnerable save until end of phase.' },
        { name: 'Tellyporta Strike', cp: 2, phase: 'Movement', effect: 'One Infantry unit teleports 9" from a battlefield edge.' },
      ],
    ),
    d(
      'kult-of-speed',
      'Kult of Speed',
      'Fast',
      'Bikes and vehicles race around the flanks, grabbing objectives and harassing the rear.',
      'Speed Freeks',
      'Orks Mounted units add +2" to Advance and Charge rolls. They can shoot after Advancing without penalty.',
      [
        { name: 'Squig Hide', cp: 1, phase: 'Shooting', effect: 'One Mounted unit gains -1 to be hit until end of turn.' },
        { name: 'Ramming Speed', cp: 1, phase: 'Charge', effect: 'One Vehicle unit deals mortal wounds on successful charge.' },
      ],
    ),
  ],
  'chaos-space-marines': [
    d(
      'destruction-cult',
      'Cult of Destruction',
      'Aggressive',
      'Berzerkers and melee specialists tear through the enemy centre.',
      'Dark Zealotry',
      'Each time a unit destroys an enemy unit in Fight, roll D6: on 4+ gain 1CP (max 1 per phase).',
      [
        { name: 'For the Dark Gods', cp: 1, phase: 'Fight', effect: 'One unit gains +1 to hit in melee this phase.' },
        { name: 'Warp Surge', cp: 2, phase: 'Movement', effect: 'One unit can make a Normal move in the Command phase.' },
      ],
    ),
    d(
      'pactbound-zealots',
      'Pactbound Zealots',
      'Shooting',
      'Legionnaires and havocs provide fire support while characters mark prey.',
      'Marks of Chaos',
      'At start of Shooting phase, mark one enemy unit — friendly units gain +1 to wound against it until end of phase.',
      [
        { name: 'Let the Galaxy Burn', cp: 1, phase: 'Shooting', effect: 'One unit gains +1 to hit until end of phase.' },
        { name: 'Dark Discipline', cp: 1, phase: 'Any', effect: 'Use a stratagem from this detachment for 0CP once per battle.' },
      ],
    ),
    d(
      'creations-of-bile',
      'Creations of Bile',
      'Elite',
      'Mutated elites and possessed marines with enhanced durability.',
      'Bile\'s Grisly Gifts',
      'Core and Elite units gain 6+ Feel No Pain. Characters can re-roll failed saves once per phase.',
      [
        { name: 'Surgical Precision', cp: 1, phase: 'Shooting', effect: 'One unit gains Precision on all attacks this phase.' },
        { name: 'Unholy Resilience', cp: 1, phase: 'Fight', effect: 'One unit gains 5+ Feel No Pain until end of phase.' },
      ],
    ),
  ],
  'death-guard': [
    d(
      'plague-company',
      'Plague Company',
      'Balanced',
      'Slow, inexorable advance — poxwalkers screen while plague marines hold ground.',
      'Nurgle\'s Gift',
      'Enemy units within 3" of your units subtract 1 from wound rolls (Contagion aura).',
      [
        { name: 'Cloud of Flies', cp: 1, phase: 'Shooting', effect: 'One unit cannot be targeted unless closest this phase.' },
        { name: 'Rotten Constitution', cp: 1, phase: 'Fight', effect: 'One unit gains 5+ Feel No Pain until end of phase.' },
      ],
    ),
    d(
      'flyblown-host',
      'Flyblown Host',
      'Fast',
      'Plague drones and foetid bloat-drones zip between objectives spreading contagion.',
      'Inexorable Advance',
      'Infantry can shoot after Advancing without penalty. All units ignore Battle-shock on 4+.',
      [
        { name: 'Plague Surge', cp: 1, phase: 'Movement', effect: 'One unit can Advance and charge this turn.' },
        { name: 'Foul Blightspawn', cp: 2, phase: 'Shooting', effect: 'One unit\'s Torrent weapons gain +1 to wound.' },
      ],
    ),
  ],
  aeldari: [
    d(
      'war-host',
      'War Host',
      'Balanced',
      'Craftworld guardians and aspect warriors in a flexible battle plan.',
      'Strands of Fate',
      'Once per phase, re-roll one hit, wound, save, Advance, charge, or Battle-shock test.',
      [
        { name: 'Lightning-fast Reactions', cp: 1, phase: 'Shooting', effect: 'One unit can shoot after Falling Back.' },
        { name: 'Feigned Retreat', cp: 1, phase: 'Movement', effect: 'One unit can Fall Back and still shoot/charge.' },
      ],
    ),
    d(
      'spirit-conclave',
      'Spirit Conclave',
      'Psykers',
      'Warlocks and farseers dominate the psychic phase while wraith constructs hold the line.',
      'Runes of Battle',
      'Psyker units add +1 to cast and deny. Each successful cast deals D3 mortal wounds to one visible enemy unit on 4+.',
      [
        { name: 'Protect/Jinx', cp: 1, phase: 'Shooting', effect: 'One friendly unit gains +1 to save; one enemy loses 1 from save.' },
        { name: 'Will of Asuryan', cp: 2, phase: 'Any', effect: 'One Psyker automatically passes one psychic test this turn.' },
      ],
    ),
    d(
      'windrider-host',
      'Windrider Host',
      'Fast',
      'Jetbikes and fast units grab side objectives and pick off isolated units.',
      'Windrider Host',
      'Mounted units add +1" to move and charge. They gain Hit-and-Run — can Fall Back and still shoot.',
      [
        { name: 'Skilled Rider', cp: 1, phase: 'Shooting', effect: 'One Mounted unit gains -1 to be hit until end of turn.' },
        { name: 'Monofilament Wire', cp: 1, phase: 'Shooting', effect: 'One unit gains +1 to wound against Infantry.' },
      ],
    ),
  ],
  'adepta-sororitas': [
    d(
      'penitent-host',
      'Penitent Host',
      'Aggressive',
      'Penitent engines and flagellants crash into the enemy while battle sisters hold objectives.',
      'Righteous Rage',
      'Penitent units add +2" to charge and re-roll failed charge rolls. On the turn they charge, +1 to hit in melee.',
      [
        { name: 'Purity of Suffering', cp: 1, phase: 'Fight', effect: 'One Penitent unit fights twice this phase.' },
        { name: 'Divine Intervention', cp: 2, phase: 'Any', effect: 'One Character ignores one wound (once per battle).' },
      ],
    ),
    d(
      'hammer-of-wrath',
      'Hammer of Wrath',
      'Balanced',
      'Battle sisters with celestians and exorcists provide flexible mid-range dominance.',
      'Acts of Faith',
      'Once per phase, spend 1 Miracle dice to auto-succeed one hit, wound, or save of your choice.',
      [
        { name: 'Sacred Rites', cp: 1, phase: 'Shooting', effect: 'One unit gains +1 to hit until end of phase.' },
        { name: 'Spirit of the Martyr', cp: 1, phase: 'Fight', effect: 'One destroyed unit fights before being removed.' },
      ],
    ),
  ],
  'adeptus-custodes': [
    d(
      'shield-host',
      'Shield Host',
      'Elite',
      'Small numbers of the Emperor\'s finest — each model is a battlefield threat.',
      'Aegis of the Emperor',
      'Custodes units gain 4+ invulnerable save. Each time an enemy unit targets them, subtract 1 from hit rolls if they are on an objective.',
      [
        { name: 'Emperor\'s Executioners', cp: 1, phase: 'Fight', effect: 'One unit gains +1 to wound in melee.' },
        { name: 'Archeotech Weaponry', cp: 1, phase: 'Shooting', effect: 'One unit\'s Devastating Wounds activate on 5+ this phase.' },
      ],
    ),
    d(
      'solar-annihilation',
      'Solar Annihilation',
      'Fast',
      'Vertus praetors and fast units strike where the enemy is weakest.',
      'From Golden Light',
      'Once per turn, one unit can teleport 6" instead of making a Normal move.',
      [
        { name: 'Vigilance Eternal', cp: 1, phase: 'Shooting', effect: 'One unit can shoot at units that Fell Back this turn.' },
        { name: 'Auric Mortalis', cp: 2, phase: 'Fight', effect: 'One unit fights at the start of the Fight phase.' },
      ],
    ),
  ],
  'imperial-knights': [
    d(
      'questor-fiefdom',
      'Questor Fiefdom',
      'Titanic',
      'Knights dominate the centre — armigers screen and grab side objectives.',
      'Code Chivalric',
      'Knights add +1 to save when not targeted by the closest enemy unit. Armigers gain Objective Control +1.',
      [
        { name: 'Rotate Ion Shields', cp: 1, phase: 'Shooting', effect: 'One Knight gains 4+ invulnerable save until end of phase.' },
        { name: 'Thunderstomp', cp: 1, phase: 'Fight', effect: 'One Knight deals D3 mortal wounds after fighting.' },
      ],
    ),
    d(
      'valorous-lance',
      'Valorous Lance',
      'Aggressive',
      'House-specific lance formation focused on the charge.',
      'Exalted Court',
      'Character Knights issue orders to one Armiger within 12" — it can re-roll hit and wound rolls this phase.',
      [
        { name: 'Full Tilt', cp: 1, phase: 'Charge', effect: 'One Knight unit adds +2" to charge rolls.' },
        { name: 'Noble Sacrifice', cp: 2, phase: 'Any', effect: 'One Armiger explodes for 3" mortal wounds when destroyed.' },
      ],
    ),
  ],
  'tau-empire': [
    d(
      'kauyon',
      'Kauyon',
      'Defensive',
      'Patient hunter — strike only when the enemy overextends.',
      'Kauyon',
      'Units more than 12" from enemy gain Benefit of Cover and +1 to save against ranged. Once per battle, one unit can shoot then Fall Back.',
      [
        { name: 'Counter-offensive Fire', cp: 1, phase: 'Shooting', effect: 'One unit shoots twice at a unit that charged a friendly unit.' },
        { name: 'Wall of Mirrors', cp: 1, phase: 'Shooting', effect: 'One unit cannot be targeted unless closest.' },
      ],
    ),
    d(
      'montka',
      'Mont\'ka',
      'Aggressive',
      'Decisive strike — push forward and destroy key targets early.',
      'Mont\'ka',
      'On turn 1-3, add +1 to wound for units within 12" of enemy deployment. Battlesuits add +1" move.',
      [
        { name: 'Aggressive Mobility', cp: 1, phase: 'Movement', effect: 'One Battlesuit unit can Advance and shoot without penalty.' },
        { name: 'Focused Fire', cp: 1, phase: 'Shooting', effect: 'One unit re-rolls wound rolls against one target.' },
      ],
    ),
  ],
  'world-eaters': [
    d(
      'berserker-warband',
      'Berzerker Warband',
      'Melee',
      'Pure aggression — get into combat fast and never stop chopping.',
      'Martial Excellence',
      'World Eaters units add +1" to charge and re-roll charge rolls. On the turn they charge, +1 to hit in melee.',
      [
        { name: 'Skulls for the Skull Throne!', cp: 1, phase: 'Fight', effect: 'One unit fights twice this phase.' },
        { name: 'Blood Surge', cp: 1, phase: 'Charge', effect: 'One unit can charge after Advancing.' },
      ],
    ),
  ],
  'thousand-sons': [
    d(
      'cult-of-magic',
      'Cult of Magic',
      'Psykers',
      'Rubrics hold the line while sorcerers unleash devastating witchcraft.',
      'Ritual of the Damned',
      'Each Psychic phase, roll 2D6 for Ritual points. Spend on buffs: +1 to cast, mortal wounds, or +1 save.',
      [
        { name: 'Temporal Surge', cp: 1, phase: 'Movement', effect: 'One unit can make a Normal move in Command phase.' },
        { name: 'Empyric Guidance', cp: 1, phase: 'Shooting', effect: 'One unit gains +1 to hit until end of phase.' },
      ],
    ),
  ],
  'genestealer-cults': [
    d(
      'brood-brotherhood',
      'Brood Brotherhood',
      'Ambush',
      'Insidious infiltration — arrive from reserves and seize objectives.',
      'Cult Ambush',
      'Units arriving from Reserves can deploy anywhere more than 6" from enemies (instead of 9").',
      [
        { name: 'Lying in Wait', cp: 1, phase: 'Shooting', effect: 'One unit counts as in cover until end of turn.' },
        { name: 'Return to the Shadows', cp: 1, phase: 'Movement', effect: 'One unit can Fall Back and shoot/charge.' },
      ],
    ),
  ],
  drukhari: [
    d(
      'realspace-raiders',
      'Realspace Raiders',
      'Fast',
      'Hit-and-run raids — strike hard, grab objectives, disappear.',
      'Power from Pain',
      'Each time a unit destroys an enemy, it gains a pain token (+1 to hit or +1" move until end of battle, max 3).',
      [
        { name: 'Pounce on the Prey', cp: 1, phase: 'Fight', effect: 'One unit fights first this phase.' },
        { name: 'Brilliant Strategist', cp: 1, phase: 'Any', effect: 'Use one stratagem for 0CP this turn.' },
      ],
    ),
  ],
  harlequins: [
    d(
      'saedath',
      'Saedath',
      'Fast',
      'Lightning assaults — harlequins appear, kill, and vanish.',
      'Twilight Circuit',
      'Harlequins can charge after Advancing. Each time they destroy a unit, gain 1CP (max 1 per phase).',
      [
        { name: 'Deadly Dance', cp: 1, phase: 'Fight', effect: 'One unit fights twice this phase.' },
        { name: 'Misdirection', cp: 1, phase: 'Shooting', effect: 'One unit cannot be targeted until they shoot.' },
      ],
    ),
  ],
  ynnari: [
    d(
      'host-of-the-ynnead',
      'Host of the Ynnari',
      'Mixed',
      'Combined Aeldari forces united by the promise of Ynnead.',
      'Strength from Death',
      'Each time an enemy unit is destroyed, one Ynnari unit within 6" regains D3 lost models.',
      [
        { name: 'Emissary of Ynnead', cp: 1, phase: 'Fight', effect: 'One unit fights on death on 4+.' },
        { name: 'Word of the Prophet', cp: 1, phase: 'Shooting', effect: 'One unit re-rolls hit rolls this phase.' },
      ],
    ),
  ],
  'leagues-of-votann': [
    d(
      'hearthband',
      'Hearthband',
      'Elite',
      'Elite kin warriors with exceptional durability and precision fire.',
      'Eye of the Ancestors',
      'Once per phase, after rolling, change one hit, wound, or save to an unmodified 6.',
      [
        { name: 'Fortify Position', cp: 1, phase: 'Shooting', effect: 'One unit gains Benefit of Cover and +1 to save.' },
        { name: 'Ancestral Sentence', cp: 1, phase: 'Shooting', effect: 'One unit gains +1 to wound against one target.' },
      ],
    ),
  ],
  'adeptus-mechanicus': [
    d(
      'skitarii-maniple',
      'Skitarii Maniple',
      'Shooting',
      'Rad-saturated skitarii vanguard and rangers control the mid-board.',
      'Doctrina Imperatives',
      'At start of Command phase, choose Bulwark (+1 save) or Conqueror (+1 to hit) for Skitarii until next Command phase.',
      [
        { name: 'Enhanced Data-tether', cp: 1, phase: 'Shooting', effect: 'One Skitarii unit re-rolls hit rolls this phase.' },
        { name: 'Protector Imperative', cp: 1, phase: 'Shooting', effect: 'One unit gains 5+ invulnerable save until end of phase.' },
      ],
    ),
    d(
      'rad-zone-corps',
      'Rad-zone Corps',
      'Aggressive',
      'Ruststalkers and sicarians deliver lethal melee strikes.',
      'Rad-saturation',
      'Enemy units within 3" of your Skitarii subtract 1 from Toughness (min 3).',
      [
        { name: 'Chant of the Remorseless Fist', cp: 1, phase: 'Fight', effect: 'One unit gains +1 to wound in melee.' },
        { name: 'Machine Spirit Resurgent', cp: 2, phase: 'Command', effect: 'One destroyed Vehicle returns on D6 wounds (once per battle).' },
      ],
    ),
  ],
  'chaos-daemons': [
    d(
      'legion-of-excess',
      'Legion of Excess',
      'Fast',
      'Daemonettes and fast Slaanesh daemons overwhelm with speed.',
      'Thrilling Excess',
      'Each time a unit destroys an enemy in Fight, it can make a 6" Normal move.',
      [
        { name: 'Ecstatically Fast', cp: 1, phase: 'Charge', effect: 'One unit can charge after Advancing.' },
        { name: 'Contagion of Suffering', cp: 1, phase: 'Fight', effect: 'One unit fights twice this phase.' },
      ],
    ),
    d(
      'eternal-legions',
      'Eternal Legions',
      'Balanced',
      'Mixed daemon packs with flexible threat profiles.',
      'Daemonic Incursion',
      'Daemon units arriving from Reserves can charge the turn they arrive.',
      [
        { name: 'The Realm of Chaos', cp: 1, phase: 'Shooting', effect: 'One unit gains -1 to be hit until end of turn.' },
        { name: 'Deny the Witch', cp: 1, phase: 'Any', effect: 'Automatically deny one enemy psychic power.' },
      ],
    ),
  ],
  'chaos-knights': [
    d(
      'infernal-lance',
      'Infernal Lance',
      'Titanic',
      'Corrupted knights and war dogs dominate with dark pacts.',
      'Pact of Darkness',
      'Chaos Knights gain 5+ Feel No Pain. War Dogs gain +1" move when within 6" of a Knight.',
      [
        { name: 'Pterrorshades', cp: 1, phase: 'Shooting', effect: 'One Knight inflicts mortal wounds when shooting.' },
        { name: 'Knights of Shade', cp: 1, phase: 'Shooting', effect: 'One unit cannot be targeted unless closest.' },
      ],
    ),
  ],
  'agents-of-the-imperium': [
    d(
      'imperialis-task-force',
      'Imperialis Task Force',
      'Flexible',
      'Assassins, inquisitors, and operatives execute precision strikes.',
      'Authority of the Throne',
      'Character units issue orders to one friendly unit within 6" — it gains +1 to hit until end of phase.',
      [
        { name: 'Sanctioned Purges', cp: 1, phase: 'Shooting', effect: 'One unit gains Precision this phase.' },
        { name: 'Covert Operations', cp: 1, phase: 'Movement', effect: 'One Infantry unit can teleport 6".' },
      ],
    ),
  ],
  'emperors-children': [
    d(
      'coterie-of-the-condemned',
      'Coterie of the Condemned',
      'Melee',
      'Perfection through violence — noise marines and champions duel in the centre.',
      'Perfectionist Savagery',
      'Each time a unit destroys an enemy in Fight, roll D6: on 3+ it fights again at end of phase.',
      [
        { name: 'Capricious Agony', cp: 1, phase: 'Fight', effect: 'One unit fights first and fights twice.' },
        { name: 'Incessant Violence', cp: 1, phase: 'Charge', effect: 'One unit adds +2" to charge rolls.' },
      ],
    ),
  ],
}

const CHAPTER_DETACHMENTS: Partial<Record<FactionId, Detachment[]>> = {
  'blood-angels': [
    d(
      'armoured-fist',
      'Armoured Fist',
      'Aggressive',
      'Sanguinary guard and assault units lead a bloody charge.',
      'Red Thirst',
      'On the turn they charge, Blood Angels units add +1 to hit in melee and +1" to pile-in.',
      [
        { name: 'Upon Wings of Blood', cp: 1, phase: 'Charge', effect: 'One Jump Pack unit can charge after Advancing.' },
        { name: 'Gift of Forever', cp: 2, phase: 'Any', effect: 'One Character returns with D3 wounds (once per battle).' },
      ],
    ),
  ],
  'dark-angels': [
    d(
      'unforgiven-task-force',
      'Unforgiven Task Force',
      'Elite',
      'Deathwing and Ravenwing combine precision strikes.',
      'Grim Resolve',
      'Inner Circle and Ravenwing units gain +1 to hit when targeting the Oath of Moment target.',
      [
        { name: 'Intractable', cp: 1, phase: 'Shooting', effect: 'One Terminator unit gains 4+ invulnerable save.' },
        { name: 'Unforgiven Fury', cp: 1, phase: 'Fight', effect: 'One unit fights twice this phase.' },
      ],
    ),
  ],
  'space-wolves': [
    d(
      'champions-of-fenris',
      'Champions of Fenris',
      'Melee',
      'Wolf guard and thunderwolf cavalry hunt the enemy warlord.',
      'Saga of the Warrior Born',
      'Space Wolves units add +1 to charge rolls. Characters gain +1 attack in melee when they charge.',
      [
        { name: 'Counter-charge', cp: 1, phase: 'Charge', effect: 'One unit can counter-charge when an enemy charges a friendly unit within 6".' },
        { name: 'Relentless Assault', cp: 1, phase: 'Fight', effect: 'One unit fights again at end of phase.' },
      ],
    ),
  ],
  'black-templars': [
    d(
      'crusade-fleet',
      'Crusade Fleet',
      'Aggressive',
      'Relentless crusaders — always be charging.',
      'Templar Vows',
      'Black Templars units must charge if able. When they charge, re-roll failed hit rolls in Fight.',
      [
        { name: 'Crusade Before Dawn', cp: 1, phase: 'Charge', effect: 'One unit adds +3" to charge rolls.' },
        { name: 'Frenzied Devotion', cp: 1, phase: 'Fight', effect: 'One unit fights twice this phase.' },
      ],
    ),
  ],
  'deathwatch': [
    d(
      'black-spear-task-force',
      'Black Spear Task Force',
      'Elite',
      'Special issue ammunition and mixed chapter kill teams.',
      'Mission Tactics',
      'At start of battle, choose one Mission Tactic: Melee (+1 to hit Fight), Furor (+1 to hit Shooting), or Purity (+1 to wound).',
      [
        { name: 'Special Issue Ammunition', cp: 1, phase: 'Shooting', effect: 'One unit gains +1 to wound this phase.' },
        { name: 'Xenos Hunter', cp: 1, phase: 'Fight', effect: 'One unit fights first against non-Imperium targets.' },
      ],
    ),
  ],
  'grey-knights': [
    d(
      'brotherhood-strike',
      'Brotherhood Strike',
      'Psykers',
      'Purifiers and paladins purge daemons with psychic fury.',
      'Sanctic Purity',
      'Grey Knights are always Battle-ready. Psychic weapons deal +1 damage against Chaos and Daemon targets.',
      [
        { name: 'Purity of Purpose', cp: 1, phase: 'Fight', effect: 'One unit fights twice against Daemon targets.' },
        { name: 'Gate of Infinity', cp: 2, phase: 'Movement', effect: 'One unit teleports 6" anywhere more than 9" from enemies.' },
      ],
    ),
  ],
  ultramarines: [
    d(
      'blades-of-triumph',
      'Blades of Triumph',
      'Balanced',
      'Codex-perfect combined arms under Ultramar discipline.',
      'Master of Strategy',
      'Once per battle round, use a stratagem for 0CP. Intercessors gain OC +1 on objectives you control.',
      [
        { name: 'Know No Fear', cp: 1, phase: 'Any', effect: 'One unit auto-passes one Battle-shock test.' },
        { name: 'Spear of Macragge', cp: 1, phase: 'Shooting', effect: 'One unit re-rolls hit and wound vs. one target.' },
      ],
    ),
  ],
  salamanders: [
    d(
      'forgefather-s- seekers',
      'Forgefather\'s Seekers',
      'Flamer',
      'Master artisans — flamers and melta delete armour at close range.',
      'Promethean Cult',
      'Flamer and Melta weapons add +1 to wound. Ignores Cover for those weapons.',
      [
        { name: 'Immolation Protocol', cp: 1, phase: 'Shooting', effect: 'One unit\'s Torrent weapons gain +1 to wound.' },
        { name: 'No Mercy, No Respite', cp: 1, phase: 'Fight', effect: 'One unit fights twice this phase.' },
      ],
    ),
  ],
  'white-scars': [
    d(
      'stormlance-task-force',
      'Stormlance Task Force',
      'Fast',
      'Lightning attacks — outmanoeuvre and strike where least expected.',
      'Lightning Assault',
      'White Scars add +1" to Advance and Charge. Can Fall Back and still charge.',
      [
        { name: 'Born in the Saddle', cp: 1, phase: 'Shooting', effect: 'One Bike unit can shoot after Advancing.' },
        { name: 'Deeds not Words', cp: 1, phase: 'Charge', effect: 'One unit adds +2" to charge rolls.' },
      ],
    ),
  ],
  'raven-guard': [
    d(
      'shadow-marksmen',
      'Shadow Marksmen',
      'Stealth',
      'Elimination force — isolate and destroy high-value targets.',
      'Master of Ambush',
      'Infantry units can deploy anywhere more than 9" from enemy (once). First round, enemy subtract 1 from hit rolls against them.',
      [
        { name: 'Strike from the Shadows', cp: 1, phase: 'Shooting', effect: 'One unit gains Precision and Ignores Cover.' },
        { name: 'Ghost Walk', cp: 1, phase: 'Movement', effect: 'One unit can Fall Back through models.' },
      ],
    ),
  ],
  'iron-hands': [
    d(
      'iron-hands-s- ire',
      'Iron Hands\' Ire',
      'Shooting',
      'Methodical destruction — heavy weapons and techmarines grind the enemy down.',
      'The Flesh is Weak',
      'Iron Hands units gain 6+ Feel No Pain. Vehicles add +1 to hit when Remained Stationary.',
      [
        { name: 'Calculated Fury', cp: 1, phase: 'Shooting', effect: 'One unit re-rolls wound rolls this phase.' },
        { name: 'Machine Curse', cp: 1, phase: 'Shooting', effect: 'One enemy Vehicle suffers -1 to hit until end of turn.' },
      ],
    ),
  ],
  'imperial-fists': [
    d(
      'bolster-defences',
      'Bolster Defences',
      'Defensive',
      'Siege masters — hold ground and punish anyone who approaches.',
      'The Fist of Dorn',
      'While on an objective, Imperial Fists add +1 to save and +1 OC. Bolter weapons gain +1 to hit at half range.',
      [
        { name: 'Shield of Humanity', cp: 1, phase: 'Shooting', effect: 'One unit gains Benefit of Cover until end of turn.' },
        { name: 'Siege Masters', cp: 1, phase: 'Shooting', effect: 'One unit gains +1 to wound vs. units in cover.' },
      ],
    ),
  ],
}

const IMPERIUM_FALLBACK: Detachment[] = [
  d(
    'imperial-combined-arms',
    'Combined Arms',
    'Balanced',
    'A flexible Imperial force built around holding objectives and focused fire.',
    'For the Emperor',
    'Once per battle round, one unit can re-roll one hit, wound, or save roll.',
    [
      { name: 'Coordinated Strike', cp: 1, phase: 'Shooting', effect: 'One unit gains +1 to hit until end of phase.' },
      { name: 'Hold the Line', cp: 1, phase: 'Shooting', effect: 'One unit on an objective gains Benefit of Cover.' },
    ],
  ),
]

const CHAOS_FALLBACK: Detachment[] = [
  d(
    'chaos-warband',
    'Chaos Warband',
    'Balanced',
    'A warband united by dark ambition — flexible threats across the board.',
    'Dark Pacts',
    'Once per phase when a unit destroys an enemy, roll D6: on 5+ gain 1CP.',
    [
      { name: 'Dark Zealotry', cp: 1, phase: 'Fight', effect: 'One unit gains +1 to hit in melee this phase.' },
      { name: 'Warp Surge', cp: 1, phase: 'Movement', effect: 'One unit can Advance and charge this turn.' },
    ],
  ),
]

const XENOS_FALLBACK: Detachment[] = [
  d(
    'xenos-strike-force',
    'Strike Force',
    'Balanced',
    'A versatile alien war host built to seize and hold key ground.',
    'Alien Cunning',
    'Once per battle round, one unit can Fall Back and still shoot or charge.',
    [
      { name: 'Focused Aggression', cp: 1, phase: 'Shooting', effect: 'One unit re-rolls one hit roll per attack.' },
      { name: 'Hit and Run', cp: 1, phase: 'Movement', effect: 'One unit can Fall Back and still shoot.' },
    ],
  ),
]

const DETACHMENT_INDEX = new Map<string, Detachment>()

function indexDetachments(lists: Detachment[][]) {
  for (const list of lists) {
    for (const det of list) {
      DETACHMENT_INDEX.set(det.id, det)
    }
  }
}

indexDetachments([
  CODEX_MARINE_DETACHMENTS,
  IMPERIUM_FALLBACK,
  CHAOS_FALLBACK,
  XENOS_FALLBACK,
  ...Object.values(FACTION_DETACHMENTS).filter(Boolean) as Detachment[][],
  ...Object.values(CHAPTER_DETACHMENTS).filter(Boolean) as Detachment[][],
])

export function getDetachmentsForFaction(factionId: FactionId): Detachment[] {
  const specific = FACTION_DETACHMENTS[factionId]
  if (specific) return specific

  if (MARINE_CHAPTER_FACTIONS.includes(factionId)) {
    const chapter = CHAPTER_DETACHMENTS[factionId] ?? []
    return [...CODEX_MARINE_DETACHMENTS, ...chapter]
  }

  const allegiance = getFaction(factionId).allegiance
  if (allegiance === 'imperium') return IMPERIUM_FALLBACK
  if (allegiance === 'chaos') return CHAOS_FALLBACK
  return XENOS_FALLBACK
}

export function getDetachment(id: string | null | undefined): Detachment | undefined {
  if (!id) return undefined
  return DETACHMENT_INDEX.get(id)
}

export function isDetachmentValidForFaction(detachmentId: string, factionId: FactionId): boolean {
  return getDetachmentsForFaction(factionId).some((d) => d.id === detachmentId)
}
