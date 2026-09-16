import type { UnitAbility, UnitProfile } from '../types/game'

export interface UnitPlaystyle {
  role: string
  description: string
  /** Named rules in the style of New Recruit / Wahapedia datasheets */
  ruleAbilities: UnitAbility[]
}

type PlaystyleMatcher = {
  test: (unit: UnitProfile) => boolean
  style: UnitPlaystyle | ((unit: UnitProfile) => UnitPlaystyle)
}

// ─── Reusable rule snippets (army-builder style: ability name + what it does) ───

const DEEP_STRIKE: UnitAbility = {
  name: 'Deep Strike',
  kind: 'rule',
  description: 'Arrives from reserves after deployment. Set up more than 9" from enemy models, then close the gap next turn. Use to hit weak flanks, backfield objectives, or isolated shooters.',
}

const INFILTRATORS: UnitAbility = {
  name: 'Infiltrators',
  kind: 'rule',
  description: 'Deploy anywhere on the board more than 9" from the enemy deployment zone. Perfect for early objective pressure, marking targets, or setting up alpha strikes.',
}

const STEALTH: UnitAbility = {
  name: 'Stealth',
  kind: 'rule',
  description: 'Gains the Benefit of Cover against ranged attacks. Hug terrain and advance into firing positions other units cannot reach on turn one.',
}

const SCOUTS: UnitAbility = {
  name: 'Scouts',
  kind: 'rule',
  description: 'Moves up before the first turn. Use to seize forward ground, block enemy deployment lanes, or set up charges turn two.',
}

const DEADLY_DEMISE: UnitAbility = {
  name: 'Deadly Demise D3',
  kind: 'rule',
  description: 'When destroyed, rolls mortal wounds on nearby units. Enemy infantry hugging your tank take damage when it blows — plan your final position accordingly.',
}

const FEEL_NO_PAIN: UnitAbility = {
  name: 'Feel No Pain 5+',
  kind: 'rule',
  description: 'Ignores wounds on a 5+. Stacks with a good save to make the unit deceptively hard to remove. Bring volume of fire or high-damage weapons to punch through.',
}

const BLAST: UnitAbility = {
  name: 'Blast',
  kind: 'rule',
  keywords: ['Blast'],
  description: 'Extra attacks against large units (6+ models). Artillery and demolisher cannons excel at wiping infantry blobs — aim at crowded objectives.',
}

const INDIRECT_FIRE: UnitAbility = {
  name: 'Indirect Fire',
  kind: 'rule',
  keywords: ['Indirect Fire'],
  description: 'Can shoot at targets not visible to the firing model (with penalties in full rules). Hide behind terrain and still contribute — classic Guard artillery play.',
}

const TWIN_LINKED: UnitAbility = {
  name: 'Twin-linked',
  kind: 'rule',
  keywords: ['Twin-linked'],
  description: 'Re-roll failed wound rolls (or to-hit in some cases). Makes anti-tank weapons far more reliable — point twin-linked guns at the enemy\'s biggest threat.',
}

const FIGHTS_FIRST: UnitAbility = {
  name: 'Fights First',
  kind: 'rule',
  description: 'Strikes before normal melee in the Fight phase. Critical for assassins, interceptors, and units that must kill before they die.',
}

// ─── Pattern matchers (most specific first) ───────────────────────────────────

const MATCHERS: PlaystyleMatcher[] = [
  // Artillery
  {
    test: (u) => /\b(basilisk|manticore|wyvern|deathstrike|colossus|bombard|earthshaker)\b/i.test(u.name),
    style: {
      role: 'Artillery / Indirect Fire',
      description: 'Backfield artillery that punishes units hiding behind terrain. Deploy behind your infantry screen, target crowded objectives, and let forward units spot. The backbone of combined-arms Guard lists.',
      ruleAbilities: [INDIRECT_FIRE, BLAST],
    },
  },
  // Super-heavies
  {
    test: (u) => /\b(baneblade|shadowsword|stormlord|banesword|banehammer|doomhammer|stormblade)\b/i.test(u.name),
    style: {
      role: 'Super-Heavy Tank',
      description: 'A Lord of War centrepiece with multiple massive guns. Dominates the mid-board but draws every enemy anti-tank shot. Pair with a cheap infantry screen — don\'t let it fight alone.',
      ruleAbilities: [DEADLY_DEMISE, BLAST],
    },
  },
  // Main battle tanks
  {
    test: (u) => /\b(leman russ|rogal dorn|macharius|hammerhead|predator|vindicator|laser destroyer|gladiator|repulsor executioner)\b/i.test(u.name),
    style: (u) => ({
      role: /\b(predator|laser destroyer)\b/i.test(u.name) ? 'Tank Hunter' : 'Main Battle Tank',
      description: /\b(predator|laser destroyer)\b/i.test(u.name)
        ? 'Dedicated anti-armour platform. Park with a clear lane, focus fire on enemy vehicles and monsters, and let infantry screen it from melee.'
        : 'Versatile armoured workhorse — holds the centre, shoots across the board, and absorbs fire meant for your infantry. Anchor your gunline behind it.',
      ruleAbilities: [DEADLY_DEMISE],
    }),
  },
  // Transports
  {
    test: (u) => /\b(rhino|chimera|razorback|impulsor|drop pod|trukk|battlewagon|raider|venom|dunerider|devilfish|ghost ark|goliath truck|land raider|corvus blackstar)\b/i.test(u.name),
    style: (u) => ({
      role: /\b(land raider|corvus blackstar)\b/i.test(u.name) ? 'Heavy Assault Transport' : 'Dedicated Transport',
      description: /\b(drop pod)\b/i.test(u.name)
        ? 'Delivers troops exactly where you need them — often with Deep Strike. Drop assault units in the enemy\'s face turn one.'
        : 'Moves infantry faster and safer than walking. Rush troops to mid-board objectives, disembark, shoot, and charge. Protect the transport until delivery.',
      ruleAbilities: /\b(drop pod)\b/i.test(u.name) ? [DEEP_STRIKE] : [],
    }),
  },
  // Deep strike infantry
  {
    test: (u) => /\b(terminator|inceptor|eradicator|scarab occult|blightlord|deathwing|allarus|crisis|stealth|scion|kasrkin|stormboy|rapier|jump pack)\b/i.test(u.name)
      || (u.keywords.includes('Terminator') && u.category !== 'hq'),
    style: (u) => ({
      role: /\b(terminator|deathwing|blightlord|allarus|scarab)\b/i.test(u.name) ? 'Deep Strike Hammer' : 'Deep Strike Assault',
      description: /\b(terminator|deathwing|blightlord|allarus|scarab)\b/i.test(u.name)
        ? 'Heavy infantry that arrives where the enemy is weakest. Drop on soft backfield units or contest late objectives — 2+ saves let them survive the turn they land.'
        : 'Mobile fire support or assault that bypasses the front line. Strike isolated units, clear home objectives, or force your opponent to turn around.',
      ruleAbilities: [DEEP_STRIKE],
    }),
  },
  // Infiltrators & scouts
  {
    test: (u) => /\b(infiltrator|incursor|scout|recon|pathfinder|kommando|stealth|ranger|shroud runner|atalan|jackal|scarab swarm)\b/i.test(u.name),
    style: (u) => ({
      role: /\b(ranger|pathfinder|recon)\b/i.test(u.name) ? 'Forward Marker / Sniper' : 'Infiltrator',
      description: /\b(ranger|pathfinder|recon)\b/i.test(u.name)
        ? 'Deploys ahead of the army to shoot from unexpected angles and mark priority targets. Control space early and chip wounds off key models.'
        : 'Forward-deployed specialists that seize ground before the main force moves. Block lanes, sit on side objectives, or set up turn-two charges.',
      ruleAbilities: [
        INFILTRATORS,
        ...( /\b(stealth|recon|incursor|infiltrator|shroud)\b/i.test(u.name) ? [STEALTH] : []),
        ...( /\b(scout)\b/i.test(u.name) ? [SCOUTS] : []),
      ],
    }),
  },
  // Fast attack
  {
    test: (u) => u.category === 'fast-attack' || /\b(outrider|bike|biker|land speeder|hellion|scourge|reaver|atv|pteraxii|serberys|wolf|thunderwolf|deffkopta|skyweaver|rough rider|death rider)\b/i.test(u.name),
    style: {
      role: 'Fast Attack / Flanker',
      description: 'Speed is the weapon. Grab side objectives, hunt isolated shooters, charge weak units, and get out before they shoot back. Don\'t trade them in fair fights — hit and run.',
      ruleAbilities: [],
    },
  },
  // Flyers
  {
    test: (u) => u.category === 'flyer' || u.keywords.includes('Fly'),
    style: {
      role: 'Flyer / Gunship',
      description: 'Ignores terrain below and brings heavy guns to where they\'re needed. Hunt enemy tanks, clear infantry on objectives, or provide air support — but expect dedicated anti-air to target you.',
      ruleAbilities: [],
    },
  },
  // Knights & Titanic
  {
    test: (u) => /\b(knight|armiger|war dog|wraithknight|bloodthirster|lord of change|great unclean|keeper of secrets|silent king|lord of skulls)\b/i.test(u.name) || u.category === 'lord-of-war',
    style: (u) => ({
      role: 'Lord of War / Titanic',
      description: 'Your army\'s centrepiece — extremely tough and destructive. Wins games when supported; loses them when isolated. Screen with cheap units and focus its fire on the enemy\'s biggest threat.',
      ruleAbilities: [
        ...( /\b(knight|armiger|war dog)\b/i.test(u.name)
          ? [{ name: 'Ion Shield', description: 'Projected energy field grants improved durability against ranged fire. Advance into the mid-board behind terrain, then dominate shooting and charges.' }]
          : []),
        DEADLY_DEMISE,
      ],
    }),
  },
  // Walkers & dreadnoughts
  {
    test: (u) => /\b(dreadnought|helbrute|deff dread|redemptor|ballistus|brutalis|invictor|warsuit|wraithlord|dunecrawler|onager|sentinel|killa kan|penitent engine|mortifier)\b/i.test(u.name),
    style: {
      role: 'Walker / Dreadnought',
      description: 'Bipedal gun platform that marches up the board. Tougher than infantry, more flexible than tanks. Lead an advance or hold a lane — pairs ranged fire with punishing melee.',
      ruleAbilities: [],
    },
  },
  // Elite Guard
  {
    test: (u) => /\b(scion|kasrkin|tempestus|krieg|catachan command|death korps|bullgryn|ogryn|ratling|sanctioned)\b/i.test(u.name),
    style: (u) => ({
      role: /\b(bullgryn|ogryn)\b/i.test(u.name) ? 'Tanky Brawler' : 'Elite Infantry',
      description: /\b(bullgryn|ogryn)\b/i.test(u.name)
        ? 'Absorbs charges and ties up dangerous melee units. Screen your tanks and artillery — Ogryn don\'t shoot well but they don\'t die easily either.'
        : /\b(kasrkin|scion|tempestus)\b/i.test(u.name)
          ? 'Precision strike infantry with AP weapons. Deep strike onto soft targets or delete infantry holding objectives. Expensive per model — make every shot count.'
          : 'Specialist troops that outperform line infantry. Use them where Guard need punch: clearing objectives, hunting elites, or reinforcing a crumbling flank.',
      ruleAbilities: /\b(scion|kasrkin|tempestus)\b/i.test(u.name) ? [DEEP_STRIKE] : [],
    }),
  },
  // Line infantry
  {
    test: (u) => u.category === 'troops' || u.keywords.includes('Battleline'),
    style: (u) => {
      const n = u.name.toLowerCase()
      if (/\b(poxwalker|cultist|gretchin|ripper|termagant|hormagaunt)\b/.test(n)) {
        return {
          role: 'Screen / Chaff',
          description: 'Cheap bodies that exist to die usefully. Hold objectives, absorb charges, block lanes, and waste enemy shots. Ten weak models can protect one expensive tank.',
          ruleAbilities: /\b(poxwalker|plague)\b/.test(n) ? [FEEL_NO_PAIN] : [],
        }
      }
      if (/\b(plague marine|death guard)\b/.test(n)) {
        return {
          role: 'Durable Battleline',
          description: 'Slow, tough objective holders that refuse to die. Walk onto a point and dare the enemy to shift you. Pair with poxwalker screens.',
          ruleAbilities: [FEEL_NO_PAIN],
        }
      }
      if (/\b(intercessor|tactical|legionary|sister|guardian|kabalite|warrior|immortal|boyz|strike team|breacher)\b/.test(n)) {
        return {
          role: 'Battleline / Objective Holder',
          description: 'The core of your army. Move onto objectives, shoot at approaching threats, and don\'t give up ground cheaply. Reliable, flexible, and essential in every list.',
          ruleAbilities: [],
        }
      }
      return {
        role: 'Troops',
        description: 'Core infantry that scores objectives and provides board presence. Flood the mid-board or anchor a defensive line depending on your faction\'s playstyle.',
        ruleAbilities: [],
      }
    },
  },
  // Melee elites
  {
    test: (u) => /\b(berzerker|chosen|possessed|incubi|wych|howling banshee|zephyrim|relic|bladeguard|vanguard veteran|honour guard|crusader|penitent|repentia|flayed one|harlequin|troupe)\b/i.test(u.name),
    style: {
      role: 'Melee Elite',
      description: 'Built to kill in the Fight phase. Advance or charge into combat and delete whatever they touch — but they\'re fragile if shot on the way in. Use transports, screens, or Deep Strike to deliver them safely.',
      ruleAbilities: [],
    },
  },
  // Shooting elites
  {
    test: (u) => /\b(sternguard|eradicator|hellblaster|dark reaper|fire dragon|pathfinder|destroyer|immortal|heavy intercessor|centurion|aggressor|exocrine|tyrannofex|broadside|devastator)\b/i.test(u.name),
    style: (u) => ({
      role: 'Fire Support Elite',
      description: 'Specialist shooters that delete specific targets. Position with clear lines of sight, focus fire on priority threats, and protect them from melee — they hit hard but fold if charged.',
      ruleAbilities: /\b(eradicator|melta|lascannon)\b/i.test(u.name) ? [TWIN_LINKED] : [],
    }),
  },
  // Monsters
  {
    test: (u) => u.keywords.includes('Monster') || /\b(carnifex|trygon|mawloc|haruspex|daemon prince|avatar|mutalith|maleceptor|hive tyrant|swarmlord|ctan)\b/i.test(u.name),
    style: {
      role: 'Monster / Beast',
      description: 'Large creature that dominates whichever phase it acts in. Shoot or fight with above-average stats — a flexible threat that forces your opponent to answer it immediately.',
      ruleAbilities: [],
    },
  },
  // T'au battlesuits
  {
    test: (u) => u.keywords.includes('Battlesuit') || /\b(crisis|broadside|ghostkeel|riptide|commander|stealth|battlesuit|enforcer|coldstar)\b/i.test(u.name),
    style: (u) => ({
      role: /\b(commander)\b/i.test(u.name) ? 'Battlesuit Commander' : 'Battlesuit Fire Support',
      description: /\b(stealth)\b/i.test(u.name)
        ? 'Infiltrating battlesuits with markerlights and burst cannons. Deploy forward, mark targets for the rest of the army, and disappear behind terrain.'
        : 'Mobile heavy weapons platform. Jump over terrain, shoot on the move, and focus fire with the rest of the T\'au gunline. Peak Greater Good combined arms.',
      ruleAbilities: /\b(stealth)\b/i.test(u.name) ? [INFILTRATORS, STEALTH] : [],
    }),
  },
  // Psykers
  {
    test: (u) => u.keywords.includes('Psyker') || /\b(librarian|farseer|warlock|sorcerer|brotherhood|neurothrope|zoanthrope|maleceptor)\b/i.test(u.name),
    style: {
      role: 'Psyker / Support',
      description: 'Casts psychic powers and buffs the army. Stay behind tougher units — snipers and assassins hunt Psykers. Delivers mortal wounds and debuffs that swing close games.',
      ruleAbilities: [],
    },
  },
  // Characters
  {
    test: (u) => u.category === 'hq' || u.keywords.includes('Character'),
    style: (u) => {
      const n = u.name.toLowerCase()
      if (/\b(apothecary|hospitaller|biologus|enginseer|techmarine|iron father)\b/.test(n)) {
        return {
          role: 'Support Character',
          description: 'Keeps key units alive or repairs vehicles. Not a front-line fighter — tuck behind your battle line and use their abilities every turn they survive.',
          ruleAbilities: [],
        }
      }
      if (/\b(assassin|callidus|culexus|vindicare|eversor)\b/.test(n)) {
        return {
          role: 'Assassin',
          description: 'Single-model killer deployed to delete one enemy character or elite. Fragile but lethal — pick the target that wins the game and commit.',
          ruleAbilities: [INFILTRATORS, FIGHTS_FIRST],
        }
      }
      return {
        role: 'Warlord / Character',
        description: 'Your leader on the battlefield. Buffs nearby units, fights above average troops, and is a priority target for the enemy. Never leave them exposed without an escort.',
        ruleAbilities: [],
      }
    },
  },
  // Heavy support fallback
  {
    test: (u) => u.category === 'heavy-support',
    style: {
      role: 'Heavy Support',
      description: 'Long-range firepower that shapes the board. Deploy at the back, shoot the enemy\'s biggest threat each turn, and let cheaper units absorb fire meant for you.',
      ruleAbilities: [],
    },
  },
]

const DEFAULT_STYLE: UnitPlaystyle = {
  role: 'Specialist',
  description: 'A flexible unit that fills a specific role in your army. Check its weapons and stats to see whether it wants to shoot, fight, or hold ground.',
  ruleAbilities: [],
}

export function inferPlaystyle(unit: UnitProfile): UnitPlaystyle {
  for (const { test, style } of MATCHERS) {
    if (test(unit)) {
      return typeof style === 'function' ? style(unit) : style
    }
  }
  return DEFAULT_STYLE
}

/** Hand-written descriptions keyed by unit name (works across generated faction IDs) */
const LEGACY_BY_NAME: Record<string, { role: string; description: string }> = {
  'Captain': { role: 'Army Leader', description: 'Your battlefield commander. The Captain boosts nearby units and fights well in both shooting and melee. Keep him near your main force to lead charges or hold a key objective.' },
  'Intercessor Squad': { role: 'Objective Holder', description: 'The backbone of any Space Marine army. Tough, accurate bolt rifles at 24" range. Park them on objectives and shoot anything that approaches — they won\'t win fights alone but are hard to shift.' },
  'Assault Intercessors': { role: 'Melee Shock Troops', description: 'Close-combat specialists with pistols and chainswords. Move them up quickly and charge weak enemy units. They trade shooting power for devastating melee on the charge.' },
  'Assault Intercessor Squad': { role: 'Melee Shock Troops', description: 'Close-combat specialists with pistols and chainswords. Move them up quickly and charge weak enemy units. They trade shooting power for devastating melee on the charge.' },
  'Terminator Squad': { role: 'Elite Heavy Infantry', description: 'Heavily armoured veterans in Terminator plate. Slow but nearly unkillable with a 2+ save. Deep strike them near enemy lines or walk them up the board as an unstoppable wall.' },
  'Outrider Squad': { role: 'Fast Flanker', description: 'Bikers that move 12" — twice as fast as infantry. Race around the flank, grab side objectives, or charge isolated enemy shooters before they can react.' },
  'Leman Russ Battle Tank': { role: 'Main Battle Tank', description: 'The iconic Imperial battle tank. A battle cannon that reaches across the board and deletes targets. Slow but extremely tough — anchor your gunline behind this beast.' },
  'Baneblade': { role: 'Super-Heavy Tank', description: 'Nine barrels of hell — a mobile fortress that dominates the centre. Every anti-tank gun on the table will aim at it. Screen it well and make every volley count.' },
  'Cadian Shock Troops': { role: 'Cannon Fodder / Volume Fire', description: 'Ten Guardsmen with lasguns. Individually weak but ten models means ten shots. Flood the board with cheap bodies, hold objectives, and overwhelm through sheer numbers.' },
  'Kasrkin': { role: 'Elite Infantry', description: 'Cadia\'s finest with hot-shot lasguns (AP-2). Accurate, armour-piercing fire that deletes infantry and light vehicles. Deploy where the enemy is softest.' },
  'Tempestus Scions': { role: 'Elite Drop Troops', description: 'Storm troopers with AP weapons and Deep Strike. Land on soft backfield units or contest objectives the enemy thought were safe. Re-roll wounds against targets on objectives.' },
  'Plague Marines': { role: 'Durable Troops', description: 'T6 infantry with a 3+ save and Feel No Pain. Slow but incredibly hard to shift off an objective. Walk forward and dare the enemy to move you.' },
  'Poxwalkers': { role: 'Cheap Screen', description: 'Shambling zombies — terrible saves but dirt cheap. Screen Plague Marines, hold objectives, and waste enemy shots that should kill something important.' },
  'Rubric Marines': { role: 'Enchanted Infantry', description: 'Bound in sorcerous armour with inferno boltguns (AP-1). Solid mid-range troops that hold objectives and shoot accurately while your Psykers do the real work.' },
  'Khorne Berzerkers': { role: 'Melee Horde', description: 'Eight chainaxe-wielding maniacs. Fragile individually but terrifying on the charge. Rush the nearest enemy and let the Blood God sort the rest.' },
  'Bloodthirster': { role: 'Greater Daemon', description: 'A winged engine of destruction — among the deadliest melee models in the game. Expensive but can single-handedly win a flank if delivered safely.' },
  'Knight Paladin': { role: 'Titanic War Machine', description: 'A towering Knight with a battle cannon and chainsword. Dominates the battlefield but costs a huge chunk of your army. Protect with screens and aim at their best unit.' },
  'Crisis Battlesuits': { role: 'Battlesuit Strike Team', description: 'Jump-pack heavy weapons that arrive where needed. Crisis teams are the Swiss army knife of T\'au — configure for anti-tank or anti-infantry and strike weak points.' },
  'Necron Warriors': { role: 'Relentless Battleline', description: 'Gauss flayers and reanimation protocols. Weak individually but they keep standing back up. Flood objectives and let Reanimation bring models back each turn.' },
  'Tyranid Warriors': { role: 'Synapse Anchor', description: 'Mid-tier synapse creatures that buff nearby gaunts and hold the line. Flexible shooters and fighters — the glue between your swarms and big monsters.' },
  'Hormagaunts': { role: 'Melee Swarm', description: 'Fast, cheap, and numerous. Rush the enemy to tie up guns, screen your monsters, or overwhelm a weak objective. They die easily — that\'s the point.' },
  'Genestealer Cults Neophyte Hybrids': { role: 'Insurgent Troops', description: 'Cheap hybrids with mining lasers and autoguns. Hold objectives in the open while your acolytes and aberrants do the real killing. Brood Brothers can ally Guard in full rules.' },
}

export function lookupLegacyDescription(unit: UnitProfile): { role: string; description: string } | undefined {
  return LEGACY_BY_NAME[unit.name]
}
