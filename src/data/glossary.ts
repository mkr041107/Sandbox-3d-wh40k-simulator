import type { UnitCategory } from '../types/game'

export const STAT_GLOSSARY: Record<string, { label: string; explanation: string }> = {
  movement: {
    label: 'Movement (M)',
    explanation: 'How many inches this unit can move during the Movement phase. Fast units can reach objectives or enemies sooner.',
  },
  toughness: {
    label: 'Toughness (T)',
    explanation: 'How hard the unit is to wound. When shot or hit, compare weapon Strength to this number — higher Toughness means enemies need better weapons to hurt you.',
  },
  save: {
    label: 'Save (Sv)',
    explanation: 'Armour save value on a D6. After a successful wound roll, the target rolls a D6 — meet or beat this number to block damage. Lower is better (3+ beats 5+).',
  },
  wounds: {
    label: 'Wounds (W)',
    explanation: 'Damage each model can take before being destroyed. A unit with 5 models at 2 Wounds each can absorb 10 total damage.',
  },
  leadership: {
    label: 'Leadership (Ld)',
    explanation: 'How steadfast the unit is during Morale tests. Higher is better — units with low Leadership may flee when they take casualties.',
  },
  objectiveControl: {
    label: 'Objective Control (OC)',
    explanation: 'How strongly this unit holds objectives. When contesting a point, compare total OC — the side with more OC controls it and scores Victory Points.',
  },
  attacks: {
    label: 'Attacks (A)',
    explanation: 'Number of hit rolls made per attack sequence. More attacks = more chances to hit, especially when multiplied by models in the unit.',
  },
  skill: {
    label: 'Ballistic/Weapon Skill (BS/WS)',
    explanation: 'The roll needed on a D6 to hit. Roll this number or higher to score a hit. Lower is better — 3+ hits more often than 5+.',
  },
  strength: {
    label: 'Strength (S)',
    explanation: 'Weapon power for wound rolls. Compare to target Toughness: higher Strength wounds more easily. S equal to T wounds on 4+, S double T wounds on 2+.',
  },
  ap: {
    label: 'Armour Penetration (AP)',
    explanation: 'Reduces the target\'s save. AP -1 turns a 3+ save into 4+. AP -3 is devastating against lightly armoured foes.',
  },
  damage: {
    label: 'Damage (D)',
    explanation: 'Wounds inflicted per failed save. Damage 1 chips away at models; Damage 3+ can destroy multi-wound targets quickly.',
  },
  range: {
    label: 'Range',
    explanation: 'Maximum distance in inches for ranged weapons. Melee weapons have Range 0 and can only be used in the Fight phase when engaged.',
  },
  points: {
    label: 'Points',
    explanation: 'Army building cost. Your total points cannot exceed the battle limit. Stronger units typically cost more.',
  },
}

export const CATEGORY_GLOSSARY: Record<UnitCategory, { label: string; explanation: string }> = {
  hq: {
    label: 'HQ (Headquarters)',
    explanation: 'Your commander. Usually a single powerful Character who leads the army and excels in one role — combat, support, or psychic powers.',
  },
  troops: {
    label: 'Troops',
    explanation: 'Core infantry squads that form the backbone of your army. Often required in lists and good at holding objectives.',
  },
  elites: {
    label: 'Elites',
    explanation: 'Specialist units — tougher, deadlier, or more skilled than regular troops. Higher points cost but often worth it.',
  },
  'fast-attack': {
    label: 'Fast Attack',
    explanation: 'Quick units that strike first or hit flanks. Use them to grab objectives, chase down shooters, or charge weak targets.',
  },
  'heavy-support': {
    label: 'Heavy Support',
    explanation: 'Big guns and heavy hitters. Tanks, monsters, and artillery that deal high damage but can be slow or expensive.',
  },
  flyer: {
    label: 'Flyer',
    explanation: 'Aircraft that can move over terrain and other units. Strong firepower with unique movement rules.',
  },
  'dedicated-transport': {
    label: 'Dedicated Transport',
    explanation: 'Vehicles that carry infantry across the battlefield quickly and protect them from enemy fire.',
  },
  'lord-of-war': {
    label: 'Lord of War',
    explanation: 'Massive units — Knights, Titans, Greater Daemons. Extremely powerful and expensive. Can dominate a battle but are prime targets.',
  },
}

export const KEYWORD_GLOSSARY: Record<string, string> = {
  Character: 'A single-model leader. Often has special abilities and is a priority target for enemies.',
  Infantry: 'Foot soldiers who move on the ground. Can enter buildings and benefit from many cover rules.',
  Battleline: 'Core troops required in most army lists. Reliable and usually good at holding objectives.',
  Terminator: 'Elite armoured infantry in heavy Terminator armour. Slow but extremely tough with excellent saves.',
  Vehicle: 'A machine of war — tanks, walkers, transports. Tough with many wounds but can be destroyed outright.',
  Walker: 'A bipedal war machine like a Dreadnought. Combines vehicle durability with melee power.',
  Tank: 'Tracked armoured vehicle. High Toughness and wounds, usually with powerful long-range guns.',
  Monster: 'A large creature. Often fast and deadly in melee with many wounds.',
  Fly: 'Can move over other models and terrain. Harder to block and excellent for flanking.',
  Psyker: 'A psychic warrior who can cast spells. Powerful but vulnerable to enemy Deny the Witch attempts.',
  Mounted: 'Rides a bike or mount. Much faster than infantry — great for rapid strikes.',
  Transport: 'Carries other units inside. Deploy infantry safely, then disembark them near objectives.',
  Titanic: 'Enormous war engine. Dominates the battlefield but costs a huge chunk of your army points.',
  Battlesuit: 'T\'au powered armour. Mobile gun platform with good firepower and armour.',
}
