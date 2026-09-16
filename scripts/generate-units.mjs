/**
 * Parses Games Workshop Munitorum Field Manual v2.3 (March 2025)
 * and generates src/data/generated/units.json
 */
import { readFileSync, writeFileSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const source = readFileSync(join(__dirname, 'munitorum-source.txt'), 'utf8')

const FACTION_MAP = {
  'ADEPTA SORORITAS': 'adepta-sororitas',
  'ADEPTUS CUSTODES': 'adeptus-custodes',
  'ADEPTUS MECHANICUS': 'adeptus-mechanicus',
  'AELDARI': 'aeldari',
  'ASTRA MILITARUM': 'astra-militarum',
  'BLACK TEMPLARS': 'black-templars',
  'BLOOD ANGELS': 'blood-angels',
  'CHAOS DAEMONS': 'chaos-daemons',
  'CHAOS KNIGHTS': 'chaos-knights',
  'CHAOS SPACE MARINES': 'chaos-space-marines',
  'DARK ANGELS': 'dark-angels',
  'DEATH GUARD': 'death-guard',
  'DEATHWATCH': 'deathwatch',
  'DRUKHARI': 'drukhari',
  "EMPEROR'S CHILDREN": 'emperors-children',
  'EMPEROR\u2019S CHILDREN': 'emperors-children',
  'GENESTEALER CULTS': 'genestealer-cults',
  'GREY KNIGHTS': 'grey-knights',
  'IMPERIAL AGENTS': 'agents-of-the-imperium',
  'AGENTS OF THE IMPERIUM': 'agents-of-the-imperium',
  'IMPERIAL KNIGHTS': 'imperial-knights',
  'LEAGUES OF VOTANN': 'leagues-of-votann',
  'NECRONS': 'necrons',
  'ORKS': 'orks',
  'SPACE MARINES': 'space-marines',
  'SPACE WOLVES': 'space-wolves',
  "T'AU EMPIRE": 'tau-empire',
  'THOUSAND SONS': 'thousand-sons',
  'TYRANIDS': 'tyranids',
  'WORLD EATERS': 'world-eaters',
  'YNNARI': 'ynnari',
}

const HARLEQUIN_UNITS = new Set([
  'Solitaire', 'Starweaver', 'Troupe', 'Troupe Master', 'Voidweaver',
])

const SKIP_SECTIONS = [
  'DETACHMENT ENHANCEMENTS', 'FORGE WORLD POINTS', 'LEGIONS OF EXCESS',
  'ARMY OF FAITH', 'BRINGERS OF FLAME', 'CHAMPIONS OF FAITH',
]

function slugify(name) {
  return name
    .toLowerCase()
    .replace(/['']/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

const POINTS_BLOCK_RE = /(\d+)\s+models?\s*(?:\([^)]*\)\s*)?(\d+)\s*pts|1\s+model\s*(?:\([^)]*\)\s*)?(\d+)\s*pts/gi

function parseUnitsFromText(text) {
  const normalized = text.replace(/\s+/g, ' ').trim()
  if (!normalized || !/pts/i.test(normalized)) return []

  const results = []
  let lastName = ''
  let cursor = 0

  for (const match of normalized.matchAll(POINTS_BLOCK_RE)) {
    const raw = match[0]
    const models = raw.startsWith('1 model') ? 1 : +match[1]
    const points = +(match[2] ?? match[3])
    const before = normalized.slice(cursor, match.index).trim()
    cursor = match.index + raw.length

    let name = before
    if (!name) {
      name = lastName
    } else {
      name = name.replace(/^(?:\d+\s+models?\s*(?:\([^)]*\)\s*)?\d+\s*pts\s*)+/i, '').trim()
      lastName = name
    }

    if (name) results.push({ name, models, points })
  }

  return results
}

function isPointsOnlyLine(line) {
  return /^(?:\d+\s+models?|1\s+model)\s*(?:\([^)]*\)\s*)?\d+\s*pts\s*$/i.test(line)
}

const FACTION_KEYS = Object.keys(FACTION_MAP).sort((a, b) => b.length - a.length)

function matchFactionInText(text) {
  const upper = text.toUpperCase()
  for (const key of FACTION_KEYS) {
    const idx = upper.indexOf(key)
    if (idx === -1) continue
    const before = upper.slice(0, idx).trim()
    const after = text.slice(idx + key.length).trim()
    if (before && !/^(CODEX|INDEX|#{1,4}\s*INDEX|#{1,4}\s*CODEX|CODEX SUPPLEMENT:?)$/i.test(before)) continue
    return { key, id: FACTION_MAP[key], rest: after }
  }
  return null
}

function detectFactionHeader(line) {
  if (line.match(/^####\s*YNNARI/i)) return { id: 'ynnari', rest: '' }
  const armyFaction = line.match(/^#{1,4}\s*ARMY FACTION:\s*(.*)$/i)
  if (armyFaction) {
    const matched = matchFactionInText(armyFaction[1])
    if (matched) return { id: matched.id, rest: matched.rest }
  }
  const header = line.match(/^(?:#{1,4}\s*)?(?:CODEX(?:\s+SUPPLEMENT)?:|INDEX:)\s*(.*)$/i)
  if (!header) return null
  const matched = matchFactionInText(header[1])
  if (!matched) return null
  return { id: matched.id, rest: matched.rest }
}

function inferCategory(name) {
  const n = name.toLowerCase()
  if (/\b(titan|knight castellan|knight tyrant|knight crusader|baneblade|banehammer|banesword|stormlord|shadowsword|warlord|reaver|warhound|phantom|revenant|greater daemon|bloodthirster|great unclean|lord of change|keeper of secrets|skarbrand|be'?lakor|shalaxi|fulgrim|magnus|angron|khorne lord of skulls|silent king|void dragon|nightbringer|hive tyrant|wraithknight)\b/.test(n)) return 'lord-of-war'
  if (/\b(rhino|raider|venom|devilfish|chimera|dunerider|truck|rockgrinder|drop pod|impulsor|repulsor|land raider|ghost ark|wave serpent|falcon|dedicated transport|battlewagon|goliath)\b/.test(n) && !/squad|team|kill/i.test(n)) {
    if (/\b(transport|rhino|raider|venom|devilfish|chimera|dunerider|truck|drop pod|impulsor|ghost ark|wave serpent)\b/.test(n)) return 'dedicated-transport'
  }
  if (/\b(flyer|gunship|bomber|interceptor|crone|harpy|doom scythe|stormraven|stormtalon|stormhawk|thunderhawk|dakkajet|blitza|burna-bomber|hemlock|nightwing|crimson hunter|phoenix|razorwing|voidraven|archaeopter)\b/.test(n)) return 'flyer'
  if (/\b(captain|lieutenant|lord|hq|character|warboss|warlord|autarch|farseer|warlock|cryptek|chronomancer|technomancer|plasmancer|skorpekh|overlord|necron lord|canoptek|canoness|marshal|inquisitor|commissar|ethereal|commander|archon|succubus|haemonculus|patriarch|magus|primus|sorcerer|daemon prince|master of|hq|ancient|chaplain|librarian|apothecary|tech-priest|techmarine|iron father|judiciar|ancient|shield-captain|blade champion|traitor|grimaldus|dante|azrael|mephiston|calgar|grimnar|tyrion|shadowsun|farsight|szarekh|trajann|cawl|yvraine|yncarne|eisenhorn|greyfax|coteaz|assassin|callidus|culexus|vindicare|eversor)\b/.test(n) && !/squad|team|mob|boyz|warriors|guard|sisters|marines|legionaries|squadron/i.test(n)) return 'hq'
  if (/\b(outrider|bike|biker|storm speeder|land speeder|invader|pteraxii|serberys|scarab|hellion|reaver|skyweaver|atv|rough rider|death rider|wolf|thunderwolf|warglaive|helverin|war dog|dreadwing|black knight|ravenwing|scourge|hellion|atalan|jackal|deffkopta|scourge)\b/.test(n)) return 'fast-attack'
  if (/\b(terminator|elite|chosen|sternguard|vanguard veteran|bladeguard|aggressor|centurion|eradicator|hellblaster|heavy intercessor|deathwing|allarus|custodian warden|sacresant|incubi|wych|wyches|scarab occult|blightlord|poxwalker|pox|flayed|wraithguard|wraithblade|lictor|warrior|tyranid warrior|zoanthrope|neurothrope|hybrid|metamorph|aberrant|kataphron|fulgurite|electro-priest|corpuscarii|sicarian|ruststalker|infiltrator|destroyer|flayed|immortal|deathmark|berzerker|eightbound|rubric|plague marine|kabalite|guardian|dire avenger|fire dragon|howling banshee|strik|breacher|kasrkin|scion|tempestus|ogryn|bullgryn|crisis|broadside|crisis|stealth|pathfinder|genestealer|purestrain|harlequin troupe|troupe)\b/.test(n) || /squad|squadron|team|mob/i.test(n) && /terminator|elite|chosen|veteran|guard|incubi|wych/i.test(n)) {
    if (/\b(troops|intercessor|legionary|boyz|gaunt|termagant|hormagaunt|guardian|kabalite|warrior|immortal|sister|shock|krieg|catachan|cadian|hybrid|neophyte|cultist|bloodletter|plaguebearer|daemonette|horror|poxwalker|gretchin|strike team|breacher|hearthkyn|ranger|vanguard|crusader|tactical|assault intercessor)\b/i.test(n)) return 'troops'
    return 'elites'
  }
  if (/\b(troops|intercessor|legionar|boyz|gaunt|termagant|hormagaunt|guardian|kabalite|warrior|immortal|sister|shock|krieg|catachan|cadian|hybrid|neophyte|cultist|bloodletter|plaguebearer|daemonette|horror|poxwalker|gretchin|strike team|breacher|hearthkyn|ranger|vanguard|crusader|tactical|assault intercessor|legionaries|jakhal|accursed cultist|poxwalker|necron warrior)\b/i.test(n)) return 'troops'
  if (/\b(dreadnought|predator|vindicator|land raider|repulsor|gladiator|hammerhead|leman russ|rhino|chimera|basilisk|manticore|wyvern|deathstrike|doomsday|annihilation|monolith|doomstalker|defiler|forgefiend|maulerfiend|heldrake|helbrute|deff dread|killa kan|trukk|battlewagon|falcon|fire prism|night spinner|wave serpent|devilfish|hammerhead|broadside|ghostkeel|riptide|stormsurge|exocrine|haruspex|carnifex|trygon|mawloc|tyrannofex|tesseract|doom scythe|doomsday|ghost ark|doomsday ark|onager|dunecrawler|skorpius|disintegrator|kastelan|armiger|knight|crusader|castellan|paladin|preceptor|errant|gallant|valiant|abominant|desecrator|despoiler|rampager|baneblade|rogal dorn|rogal|macharius|stormblade|shadowsword|stormlord|banehammer|banesword|doomhammer|hellhammer|stormlord|crusader|land raider|repulsor executioner|redemptor|ballistus|brutalis|invictor|warsuit|dreadknight|nemesis|wraithlord|wraithknight|falcon|fire prism|night spinner|scorpion|cobra|phantom|revenant|war walker|warwalker|war engine|sentinel|armoured sentinel|scout sentinel|basilisk|manticore|hydra|deathstrike|doomsday|monolith|annihilation|doomstalker|canoptek spider|spyder|tomb stalker|ctan|shard)\b/i.test(n)) return 'heavy-support'
  if (/\b(squad|team|mob|warriors|troops|intercessor|boyz|gaunts)\b/i.test(n)) return 'troops'
  if (/\b(character|captain|lord|hq)\b/i.test(n)) return 'hq'
  return 'elites'
}

function inferStats(name, category, models, points) {
  const n = name.toLowerCase()
  const isVehicle = /\b(tank|predator|rhino|chimera|land raider|repulsor|dreadnought|walker|knight|baneblade|battlewagon|falcon|hammerhead|devilfish|raider|venom|dunerider|onager|dunecrawler|defiler|helbrute|deff|maulerfiend|forgefiend|heldrake|monolith|ark|prism|spinner|crusader|castellan|armiger|war dog|sentinel|basilisk|manticore|vindicator|gladiator|impulsor|drop pod|wave serpent|ghost ark|doomsday|annihilation|skorpius|disintegrator|kastelan|trukk|goliath|rockgrinder|bunker|strongpoint)\b/.test(n)
  const isMonster = /\b(carnifex|trygon|mawloc|haruspex|exocrine|tyrannofex|hive tyrant|swarmlord|broodlord|daemon prince|bloodthirster|great unclean|lord of change|keeper|skarbrand|be'?lakor|mutalith|vortex beast|ctan|shard|avatar|wraithlord|wraithknight|greater|fulgrim|magnus|angron|mortarion|guilliman|calgar|grimnar|silent king|void dragon|nightbringer|deceiver|tyrant|prime|maleceptor|neurothrope|zoanthrope|biovore|hive guard|warrior prime)\b/.test(n)
  const isTerminator = /\bterminator\b/.test(n)
  const isFlyer = category === 'flyer'
  const isTitanic = category === 'lord-of-war' || /\b(titan|baneblade|knight castellan|knight tyrant|warlord|reaver|phantom|revenant|greater|lord of skulls)\b/.test(n)

  let movement = 6, toughness = 4, save = 3, wounds = 2, leadership = 6, oc = 2
  let baseSize = 32

  if (category === 'hq') {
    wounds = 4; leadership = 6; oc = 1
    if (isMonster) { movement = 8; toughness = 6; wounds = 8 }
  }
  if (category === 'troops') {
    wounds = 1; models = Math.max(models, 5); oc = 2
    if (/\b(ork|boyz|nob)\b/.test(n)) { toughness = 5; save = 6 }
    if (/\b(guard|cadian|krieg|catachan|hybrid|neophyte)\b/.test(n)) { toughness = 3; save = 5 }
    if (/\b(plaguebearer|bloodletter|daemonette)\b/.test(n)) { save = 7 }
    if (/\b(gaunt|termagant|hormagaunt)\b/.test(n)) { movement = n.includes('horma') ? 10 : 6; toughness = 3; save = 5 }
    if (/\b(necron warrior)\b/.test(n)) { leadership = 10 }
  }
  if (isTerminator) { movement = 5; toughness = 5; save = 2; wounds = 3; baseSize = 40 }
  if (isVehicle) {
    movement = 10; toughness = 10; save = 3; wounds = 12; oc = 3; baseSize = 80
    if (/\b(rhino|chimera|raider|venom|trukk|dunerider)\b/.test(n)) { toughness = 6; wounds = 10; movement = 12 }
    if (/\b(dreadnought|helbrute|deff|invictor|warsuit|ballistus|brutalis|redemptor)\b/.test(n)) { movement = 6; toughness = 9; wounds = 8; baseSize = 60 }
    if (/\b(armiger|war dog)\b/.test(n)) { movement = 12; toughness = 8; wounds = 12 }
    if (/\b(knight|crusader|castellan|paladin|preceptor|errant|gallant|valiant|abominant|desecrator)\b/.test(n)) { movement = 10; toughness = 11; wounds = 24; oc = 5; baseSize = 120 }
  }
  if (isMonster) {
    movement = 8; toughness = 8; save = 3; wounds = 8; baseSize = 80
    if (isTitanic) { movement = 10; toughness = 11; wounds = 18; oc = 5; baseSize = 120 }
    if (/\b(gaunt|small)\b/.test(n)) { movement = 10; toughness = 3; wounds = 1 }
  }
  if (isFlyer) { movement = 20; toughness = 9; save = 3; wounds = 12; baseSize = 100 }
  if (/\b(bike|outrider|scourge|reaver|hellion|atv|land speeder)\b/.test(n)) { movement = 12; baseSize = 75 }
  if (/\b(custodian|custodes)\b/.test(n)) { toughness = 6; save = 2; wounds = 3 }
  if (/\b(gravis|aggressor|eradicator|heavy intercessor)\b/.test(n)) { movement = 5; toughness = 6; save = 3; wounds = 3 }
  if (/\b(plague|death guard)\b/.test(n) && !isVehicle) { toughness = 6; save = 3; movement = 5 }
  if (/\b(tau|battlesuit|crisis|broadside|ghostkeel|riptide|commander)\b/.test(n)) { movement = 10; toughness = 5; save = 3; wounds = 4; baseSize = 50 }
  if (/\b(eldar|aeldari|guardian|aspect)\b/.test(n) && category === 'troops') { movement = 7; toughness = 3; save = 4 }
  if (/\b(drukhari|kabalite|wych|incubi)\b/.test(n)) { movement = 7; save = 6 }
  if (/\b(ork)\b/.test(n)) { toughness = 5 }
  if (/\b(necron)\b/.test(n)) { leadership = 10 }
  if (/\b(sororitas|sister)\b/.test(n)) { save = 3 }

  return { movement, toughness, save, wounds, leadership, objectiveControl: oc, models, baseSize }
}

function gun(name, range, attacks, skill, strength, ap, damage, type = 'ranged', description) {
  const w = { name, range, attacks, skill, strength, ap, damage, type }
  if (description) w.description = description
  return w
}

function melee(name, attacks, skill, strength, ap, damage, description) {
  return gun(name, 0, attacks, skill, strength, ap, damage, 'melee', description)
}

function hullWeapons(includeFlamer = false) {
  const weapons = [
    gun('Heavy bolter', 36, 3, 4, 5, -1, 2),
    gun('Hunter-killer missile', 48, 1, 4, 14, -3, 3),
  ]
  if (includeFlamer) {
    weapons.splice(1, 0, gun('Heavy flamer', 12, 6, 4, 5, -1, 1, 'ranged', 'Torrent · Ignores Cover'))
  }
  return weapons
}

function transportLoadout(n) {
  if (/\brhino\b/.test(n)) {
    return [
      gun('Storm bolter', 24, 2, 3, 4, 0, 1),
      gun('Hunter-killer missile', 48, 1, 4, 14, -3, 3),
    ]
  }
  if (/\bchimera\b/.test(n)) {
    return [
      gun('Multi-laser', 36, 4, 4, 6, 0, 1),
      gun('Heavy bolter', 36, 3, 4, 5, -1, 2),
      gun('Hunter-killer missile', 48, 1, 4, 14, -3, 3),
    ]
  }
  if (/\bdrop pod\b/.test(n)) return [gun('Storm bolter', 24, 2, 3, 4, 0, 1)]
  if (/\bimpulsor\b/.test(n)) {
    return [
      gun('Heavy on-board cannon', 24, 3, 3, 5, -1, 2),
      gun('Fragstorm grenade launcher', 18, 3, 3, 4, 0, 1),
    ]
  }
  if (/\btrukk\b/.test(n)) return [gun('Big shoota', 36, 3, 5, 5, 0, 1)]
  if (/\b(raider|venom|dunerider|devilfish|ghost ark|wave serpent)\b/.test(n)) {
    return [
      gun('Primary turret weapon', 24, 3, 4, 5, 0, 1),
      gun('Defensive weapon', 18, 2, 4, 4, 0, 1),
    ]
  }
  return hullWeapons()
}

function vehicleLoadout(n) {
  if (/\bbasilisk\b/.test(n)) {
    return [
      gun('Earthshaker cannon', 240, 1, 4, 7, -1, 2, 'ranged', 'Indirect Fire · Blast'),
      ...hullWeapons(true),
    ]
  }
  if (/\bmanticore\b/.test(n)) {
    return [
      gun('Manticore multi-missile launcher', 48, 4, 4, 8, -2, 2, 'ranged', 'Blast · Indirect Fire'),
      ...hullWeapons(),
    ]
  }
  if (/\bwyvern\b/.test(n)) {
    return [
      gun('Wyvern twin-linked mortar', 48, 6, 4, 6, -1, 1, 'ranged', 'Blast · Indirect Fire · Twin-linked'),
      ...hullWeapons(),
    ]
  }
  if (/\bdeathstrike\b/.test(n)) {
    return [
      gun('Deathstrike missile', 72, 1, 4, 10, -2, 3, 'ranged', 'Blast · One-shot'),
      ...hullWeapons(),
    ]
  }
  if (/\bhydra\b/.test(n)) {
    return [
      gun('Hydra autocannon', 36, 3, 4, 7, -1, 2, 'ranged', 'Anti-Fly'),
      ...hullWeapons(),
    ]
  }
  if (/\bartillery team\b/.test(n)) {
    return [gun('Heavy mortar', 48, 3, 4, 6, -1, 1, 'ranged', 'Indirect Fire · Blast')]
  }
  if (/\b(leman russ demolisher|demolisher leman)\b/.test(n) || /\bleman russ demolisher\b/.test(n)) {
    return [gun('Demolisher cannon', 24, 1, 4, 11, -3, 3), ...hullWeapons(true)]
  }
  if (/\bleman russ (punisher|eradicator|executioner|exterminator|vanquisher)\b/.test(n)) {
    if (/punisher/.test(n)) return [gun('Punisher gatling cannon', 36, 20, 4, 6, 0, 1), ...hullWeapons()]
    if (/eradicator/.test(n)) return [gun('Eradicator nova cannon', 36, 1, 4, 9, -2, 3), ...hullWeapons()]
    if (/executioner/.test(n)) return [gun('Plasma destroyer', 36, 2, 4, 8, -3, 2), ...hullWeapons()]
    if (/exterminator/.test(n)) return [gun('Exterminator autocannon', 48, 4, 4, 7, -1, 2), ...hullWeapons()]
    if (/vanquisher/.test(n)) return [gun('Vanquisher battle cannon', 48, 1, 4, 12, -3, 3), ...hullWeapons()]
  }
  if (/\bleman russ\b/.test(n) || /\brogal dorn\b/.test(n) || /\bmacharius\b/.test(n)) {
    return [gun('Battle cannon', 48, 2, 4, 10, -2, 3), ...hullWeapons(true)]
  }
  if (/\b(baneblade|banehammer|banesword|stormlord|shadowsword|stormblade|doomhammer|hellhammer)\b/.test(n)) {
    return [
      gun('Baneblade cannon', 48, 2, 4, 10, -2, 3),
      gun('Demolisher cannon', 24, 1, 4, 11, -3, 3),
      gun('Twin heavy bolter', 36, 3, 4, 5, -1, 2, 'ranged', 'Twin-linked'),
      gun('Heavy bolter', 36, 3, 4, 5, -1, 2),
      gun('Hunter-killer missile', 48, 1, 4, 14, -3, 3),
    ]
  }
  if (/\bpredator annihilator\b/.test(n)) {
    return [gun('Lascannon', 48, 2, 4, 12, -3, 3), ...hullWeapons()]
  }
  if (/\bpredator\b/.test(n)) {
    return [gun('Predator autocannon', 48, 2, 4, 9, -1, 3), ...hullWeapons()]
  }
  if (/\bvindicator\b/.test(n)) {
    return [gun('Demolisher cannon', 24, 1, 4, 11, -3, 3), ...hullWeapons()]
  }
  if (/\bgladiator lancer\b/.test(n)) {
    return [gun('Lancer laser destroyer', 72, 1, 4, 14, -4, 3), ...hullWeapons()]
  }
  if (/\bgladiator reaper\b/.test(n)) {
    return [gun('Reaper autocannon', 48, 4, 4, 7, -1, 2), ...hullWeapons()]
  }
  if (/\bgladiator valiant\b/.test(n)) {
    return [gun('Multi-melta', 18, 2, 4, 9, -4, 3), ...hullWeapons()]
  }
  if (/\brepulsor executioner\b/.test(n)) {
    return [
      gun('Executioner laser destroyer', 72, 2, 4, 14, -4, 3),
      gun('Heavy on-board cannon', 24, 3, 3, 5, -1, 2),
      gun('Twin heavy bolter', 36, 3, 4, 5, -1, 2, 'ranged', 'Twin-linked'),
    ]
  }
  if (/\brepulsor\b/.test(n)) {
    return [
      gun('Heavy on-board cannon', 24, 3, 3, 5, -1, 2),
      gun('Twin heavy bolter', 36, 3, 4, 5, -1, 2, 'ranged', 'Twin-linked'),
      gun('Hunter-killer missile', 48, 1, 4, 14, -3, 3),
    ]
  }
  if (/\bland raider\b/.test(n)) {
    return [
      gun('Twin heavy bolter', 36, 3, 4, 5, -1, 2, 'ranged', 'Twin-linked'),
      gun('Hunter-killer missile', 48, 1, 4, 14, -3, 3),
    ]
  }
  if (/\bhammerhead\b/.test(n)) {
    return [gun('Railgun', 72, 1, 4, 14, -4, 3), ...hullWeapons()]
  }
  if (/\b(sentinel|armoured sentinel|scout sentinel)\b/.test(n)) {
    return [gun('Multi-laser', 36, 4, 4, 6, 0, 1), gun('Heavy flamer', 12, 6, 4, 5, -1, 1)]
  }
  if (/\bdefiler\b/.test(n)) {
    return [
      gun('Battle cannon', 48, 2, 4, 10, -2, 3),
      gun('Reaper autocannon', 48, 4, 4, 7, -1, 2),
      melee('Defiler claws', 5, 4, 12, -2, 3),
    ]
  }
  if (/\bforgefiend\b/.test(n)) {
    return [gun('Hades autocannon', 48, 4, 4, 8, -1, 2), gun('Hades autocannon', 48, 4, 4, 8, -1, 2)]
  }
  if (/\bmaulerfiend\b/.test(n)) {
    return [melee('Magma cutter', 2, 4, 9, -4, 3), melee('Magma cutter', 2, 4, 9, -4, 3)]
  }
  if (/\bheldrake\b/.test(n)) {
    return [gun('Baleflamer', 12, 6, 4, 6, -1, 2, 'ranged', 'Torrent · Ignores Cover')]
  }
  if (/\bmonolith\b/.test(n)) {
    return [gun('Particle whip', 24, 3, 4, 8, -2, 2), gun('Gauss flux arc', 24, 5, 4, 5, 0, 1)]
  }
  if (/\b(onager|dunecrawler)\b/.test(n)) {
    return [gun('Eradicator nova cannon', 36, 1, 4, 9, -2, 3), gun('Heavy phosphor blaster', 24, 3, 4, 6, -1, 1)]
  }
  if (/\b(skorpius|disintegrator)\b/.test(n)) {
    return [gun('Disintegrator cannon', 36, 3, 4, 8, -2, 2), ...hullWeapons()]
  }
  if (/\bbattlewagon\b/.test(n)) {
    return [gun('Killkannon', 36, 1, 5, 9, -2, 3), gun('Big shoota', 36, 3, 5, 5, 0, 1)]
  }
  if (/\b(annihilation|doomsday)\b/.test(n)) {
    return [gun('Doomsday cannon', 72, 1, 4, 14, -4, 3), gun('Gauss flux arc', 24, 5, 4, 5, 0, 1)]
  }
  if (/\b(armiger|war dog)\b/.test(n)
    || /\bknight (crusader|castellan|paladin|preceptor|errant|gallant|valiant|warden|dominus|desecrator|rampager|abominant)\b/.test(n)
    || /\b(imperial knight|chaos knight)\b/.test(n)) {
    return [
      gun('Knight main weapon', 48, 2, 4, 12, -3, 3),
      gun('Heavy stubber', 36, 3, 4, 4, 0, 1),
      melee('Knight melee weapon', 4, 4, 14, -3, 3),
    ]
  }
  if (/\b(dreadnought|helbrute|deff dread|redemptor|ballistus|brutalis|invictor|warsuit|kastelan)\b/.test(n)) {
    return [
      gun('Heavy bolter', 36, 3, 4, 5, -1, 2),
      melee('Close combat weapon', 4, 4, 10, -2, 3),
    ]
  }
  if (/\b(falcon|fire prism|night spinner|razorwing|stormraven|stormtalon|dakkajet|doom scythe|crimson hunter|phoenix)\b/.test(n)) {
    return [gun('Primary aircraft weapon', 48, 2, 4, 8, -2, 2), gun('Defensive weapon', 24, 2, 4, 5, 0, 1)]
  }
  if (/\b(exocrine|haruspex|carnifex|trygon|mawloc|tyrannofex|broadside|ghostkeel|riptide|stormsurge)\b/.test(n)) {
    return [gun('Bio-cannon', 36, 2, 4, 9, -2, 3), melee('Monstrous scything talons', 4, 4, 9, -2, 2)]
  }
  return null
}

function isVehicleUnit(n, category) {
  if (category === 'dedicated-transport' || category === 'flyer') return true
  if (/\b(squad|team|mob|boyz|warriors|troops|intercessor|legionaries|gaunt|guard)\b/.test(n)
    && !/\b(weapon|artillery|sentinel)\b/.test(n)) return false
  return /\b(tank|predator|vindicator|rhino|chimera|leman russ|hammerhead|basilisk|manticore|wyvern|deathstrike|hydra|sentinel|baneblade|repulsor|gladiator|land raider|dreadnought|helbrute|deff dread|defiler|forgefiend|maulerfiend|heldrake|monolith|onager|dunecrawler|skorpius|disintegrator|battlewagon|trukk|falcon|devilfish|wave serpent|ghost ark|dunerider|rogal dorn|macharius|annihilation|doomsday|crusader|castellan|armiger|war dog|invictor|warsuit|redemptor|ballistus|brutalis|kastelan|broadside|riptide|ghostkeel|stormsurge|exocrine|haruspex|carnifex|trygon|mawloc|tyrannofex|doom scythe|razorwing|stormraven|dakkajet|artillery|knight|wraithknight|contemptor)\b/.test(n)
    || (category === 'heavy-support' && /\b(vehicle|walker|platform|engine|drone|suit)\b/.test(n) === false
      && /\b(support|tank|artillery|cannon|platform|engine|sentinel|suit|walker|dread|knight|crisis|broadside|riptide|carnifex|trygon|monolith|defiler|predator|vindicator|basilisk|manticore|hammerhead|leman|baneblade|repulsor|gladiator|heldrake|forgefiend|maulerfiend|exocrine|haruspex|tyrannofex|stormsurge|ghostkeel|doomsday|annihilation|disintegrator|skorpius|onager|dunecrawler|battlewagon|trukk|falcon|prism|spinner)\b/.test(n))
}

function defaultWeapons(name, category) {
  const n = name.toLowerCase()

  const vehicle = vehicleLoadout(n)
  if (vehicle) return vehicle

  if (category === 'dedicated-transport' || /\b(transport|rhino|chimera|trukk|raider|venom|impulsor|drop pod)\b/.test(n)) {
    return transportLoadout(n)
  }

  if (isVehicleUnit(n, category)) {
    return [gun('Main cannon', 48, 2, 4, 10, -2, 3), ...hullWeapons()]
  }

  if (/\b(tank|battle cannon)\b/.test(n)) {
    return [gun('Battle cannon', 48, 2, 4, 10, -2, 3), ...hullWeapons()]
  }
  if (/\b(terminator)\b/.test(n)) {
    return [
      { name: 'Storm Bolter', range: 24, attacks: 2, skill: 3, strength: 4, ap: 0, damage: 1, type: 'ranged' },
      { name: 'Power Fist', range: 0, attacks: 2, skill: 4, strength: 8, ap: -2, damage: 2, type: 'melee' },
    ]
  }
  if (category === 'hq' || /\b(captain|lord|warboss|autarch|farseer|overlord)\b/.test(n)) {
    return [
      { name: 'Bolt Pistol', range: 12, attacks: 1, skill: 3, strength: 4, ap: 0, damage: 1, type: 'ranged' },
      { name: 'Power Weapon', range: 0, attacks: 3, skill: 3, strength: 5, ap: -2, damage: 1, type: 'melee' },
    ]
  }
  if (/\b(ork|boyz|nob|warboss)\b/.test(n)) {
    return [
      { name: 'Shoota', range: 18, attacks: 2, skill: 5, strength: 5, ap: 0, damage: 1, type: 'ranged' },
      { name: 'Choppa', range: 0, attacks: 3, skill: 4, strength: 5, ap: 0, damage: 1, type: 'melee' },
    ]
  }
  if (/\b(tau|fire warrior|strike|breacher|pulse)\b/.test(n)) {
    return [{ name: 'Pulse Rifle', range: 30, attacks: 2, skill: 4, strength: 5, ap: 0, damage: 1, type: 'ranged' }]
  }
  if (/\b(necron|gauss|warrior|immortal)\b/.test(n)) {
    return [{ name: 'Gauss Flayer', range: 24, attacks: 2, skill: 4, strength: 4, ap: -1, damage: 1, type: 'ranged' }]
  }
  if (/\b(eldar|aeldari|shuriken|guardian|dire)\b/.test(n)) {
    return [{ name: 'Shuriken Catapult', range: 18, attacks: 2, skill: 3, strength: 4, ap: -1, damage: 1, type: 'ranged' }]
  }
  if (/\b(drukhari|kabalite|splinter)\b/.test(n)) {
    return [{ name: 'Splinter Rifle', range: 24, attacks: 2, skill: 3, strength: 2, ap: 0, damage: 1, type: 'ranged' }]
  }
  if (/\b(tyranid|gaunt|fleshborer|talons)\b/.test(n)) {
    return [{ name: 'Fleshborer', range: 18, attacks: 1, skill: 4, strength: 5, ap: 0, damage: 1, type: 'ranged' }]
  }
  if (/\b(guard|lasgun|cadian|krieg|catachan)\b/.test(n)) {
    return [{ name: 'Lasgun', range: 24, attacks: 1, skill: 4, strength: 3, ap: 0, damage: 1, type: 'ranged' }]
  }
  if (/\b(chaos|legionary|heretic)\b/.test(n)) {
    return [{ name: 'Boltgun', range: 24, attacks: 2, skill: 3, strength: 4, ap: 0, damage: 1, type: 'ranged' }]
  }
  if (/\b(sororitas|sister|bolter)\b/.test(n)) {
    return [{ name: 'Boltgun', range: 24, attacks: 2, skill: 3, strength: 4, ap: 0, damage: 1, type: 'ranged' }]
  }
  if (/\b(custodian|custodes|guardian spear)\b/.test(n)) {
    return [{ name: 'Guardian Spear', range: 0, attacks: 4, skill: 2, strength: 6, ap: -2, damage: 2, type: 'melee' }]
  }
  if (/\b(mechanicus|skitarii|ranger|vanguard|galvanic)\b/.test(n)) {
    return [{ name: 'Galvanic Rifle', range: 30, attacks: 2, skill: 4, strength: 4, ap: 0, damage: 1, type: 'ranged' }]
  }
  if (/\b(votann|kin|hearthkyn|autocannon)\b/.test(n)) {
    return [
      { name: 'Autocannon', range: 48, attacks: 2, skill: 4, strength: 9, ap: -1, damage: 3, type: 'ranged' },
      { name: 'Liberator', range: 0, attacks: 2, skill: 4, strength: 6, ap: -2, damage: 2, type: 'melee' },
    ]
  }
  if (/\b(genestealer|cult|autogun|hybrid)\b/.test(n)) {
    return [{ name: 'Autogun', range: 24, attacks: 1, skill: 4, strength: 3, ap: 0, damage: 1, type: 'ranged' }]
  }
  if (/\b(daemon|bloodletter|plaguebearer|daemonette|horror)\b/.test(n)) {
    return [{ name: 'Hellblade', range: 0, attacks: 2, skill: 3, strength: 5, ap: -2, damage: 1, type: 'melee' }]
  }
  if (category === 'melee' || /\b(berzerker|assault|chainsword|crusader)\b/.test(n)) {
    return [
      { name: 'Bolt Pistol', range: 12, attacks: 1, skill: 3, strength: 4, ap: 0, damage: 1, type: 'ranged' },
      { name: 'Chainsword', range: 0, attacks: 3, skill: 3, strength: 4, ap: 0, damage: 1, type: 'melee' },
    ]
  }
  return [{ name: 'Boltgun', range: 24, attacks: 2, skill: 3, strength: 4, ap: 0, damage: 1, type: 'ranged' }]
}

function inferKeywords(name, category) {
  const kw = []
  const n = name.toLowerCase()
  if (category === 'hq' || /\b(captain|lord|character|warboss|autarch|farseer|inquisitor|canoness|overlord|archon|patriarch|sorcerer|daemon prince|ancient|chaplain|librarian)\b/.test(n)) kw.push('Character')
  if (category === 'troops' || /\b(squad|boyz|warriors|mob|team|intercessor|legionaries|gaunts)\b/.test(n)) { kw.push('Infantry'); if (category === 'troops') kw.push('Battleline') }
  if (/\bterminator\b/.test(n)) kw.push('Terminator')
  if (/\b(vehicle|tank|rhino|chimera|predator|repulsor|land raider|hammerhead|devilfish|raider|venom|dunerider|battlewagon|trukk|falcon|wave serpent|ghost ark|onager|dunecrawler|defiler|heldrake|baneblade|basilisk|manticore|wyvern|hydra|deathstrike|sentinel|rockgrinder|goliath)\b/.test(n)) kw.push('Vehicle')
  if (/\b(dreadnought|helbrute|deff dread|walker|warsuit|invictor|kastelan|armiger|war dog|sentinel|war walker|wraithlord)\b/.test(n)) kw.push('Walker')
  if (/\b(tank|predator|leman russ|hammerhead|baneblade|rogal dorn|basilisk|manticore|wyvern|hydra|deathstrike)\b/.test(n)) kw.push('Tank')
  if (/\b(flyer|gunship|bomber|interceptor|crone|harpy|doom scythe|stormraven|dakkajet)\b/.test(n)) kw.push('Fly')
  if (/\b(monster|carnifex|trygon|mawloc|haruspex|exocrine|tyrannofex|daemon prince|bloodthirster|greater|ctan|avatar|wraithknight|mutalith)\b/.test(n)) kw.push('Monster')
  if (/\b(psyker|librarian|farseer|warlock|sorcerer|grey knight|brotherhood)\b/.test(n)) kw.push('Psyker')
  if (/\b(bike|outrider|land speeder|scourge|hellion|deffkopta|atv)\b/.test(n)) kw.push('Mounted')
  if (/\b(transport|rhino|raider|venom|devilfish|chimera|dunerider|drop pod|impulsor|ghost ark|goliath truck)\b/.test(n)) kw.push('Transport')
  if (/\b(knight|titan|baneblade|lord of war|warlord|reaver|phantom|wraithknight)\b/.test(n) || category === 'lord-of-war') kw.push('Titanic')
  if (/\b(battlesuit|crisis|broadside|ghostkeel|riptide|commander|stealth)\b/.test(n)) kw.push('Battlesuit')
  if (kw.length === 0) kw.push('Infantry')
  return [...new Set(kw)]
}

function generateDescription(name, category, factionId) {
  const roles = {
    hq: 'Leader', troops: 'Battleline', elites: 'Elite', 'fast-attack': 'Fast Attack',
    'heavy-support': 'Heavy Support', flyer: 'Flyer', 'dedicated-transport': 'Transport', 'lord-of-war': 'Lord of War',
  }
  const role = roles[category] ?? 'Specialist'
  const factionNames = {
    'adepta-sororitas': 'the Adepta Sororitas', 'adeptus-custodes': 'the Adeptus Custodes',
    'adeptus-mechanicus': 'the Adeptus Mechanicus', 'aeldari': 'the Aeldari craftworlds',
    'agents-of-the-imperium': 'the Imperium\'s covert agents', 'astra-militarum': 'the Astra Militarum',
    'black-templars': 'the Black Templars', 'blood-angels': 'the Blood Angels',
    'chaos-daemons': 'the Chaos Daemons', 'chaos-knights': 'Chaos Knights',
    'chaos-space-marines': 'the Chaos Space Marines', 'dark-angels': 'the Dark Angels',
    'death-guard': 'the Death Guard', 'deathwatch': 'the Deathwatch',
    'drukhari': 'the Drukhari', 'emperors-children': 'the Emperor\'s Children',
    'genestealer-cults': 'the Genestealer Cults', 'grey-knights': 'the Grey Knights',
    'harlequins': 'the Harlequins', 'imperial-knights': 'Imperial Knights',
    'iron-hands': 'the Iron Hands', 'leagues-of-votann': 'the Leagues of Votann',
    'necrons': 'the Necrons', 'orks': 'the Orks', 'space-marines': 'the Space Marines',
    'space-wolves': 'the Space Wolves', 'tau-empire': 'the T\'au Empire',
    'thousand-sons': 'the Thousand Sons', 'tyranids': 'the Tyranids',
    'world-eaters': 'the World Eaters', 'ynnari': 'the Ynnari',
    'imperial-fists': 'the Imperial Fists', 'iron-hands': 'the Iron Hands',
    'raven-guard': 'the Raven Guard', 'salamanders': 'the Salamanders',
    'ultramarines': 'the Ultramarines', 'white-scars': 'the White Scars',
  }
  const faction = factionNames[factionId] ?? factionId
  return `Official ${role} unit for ${faction}. ${name} is a current Warhammer 40,000 10th Edition datasheet with points from the Munitorum Field Manual.`
}

// ─── Parse source ───────────────────────────────────────────────────

const units = new Map()
let currentFaction = null
let pendingName = ''
let lastUnitName = ''
let inSkipSection = false

const lines = source.split('\n')

for (let i = 0; i < lines.length; i++) {
  let line = lines[i].trim()
  if (!line) continue

  // Skip enhancement sections
  if (line.startsWith('####') && SKIP_SECTIONS.some((s) => line.toUpperCase().includes(s))) {
    inSkipSection = true
    continue
  }

  const factionHeader = detectFactionHeader(line)
  if (factionHeader) {
    currentFaction = factionHeader.id
    inSkipSection = false
    pendingName = ''
    lastUnitName = ''
    if (factionHeader.rest) {
      for (const u of parseUnitsFromText(factionHeader.rest)) {
        addUnit(u.name, u.models, u.points)
        lastUnitName = u.name
      }
    }
    continue
  }

  // Supplement blocks: "### CODEX SUPPLEMENT:" then next line "BLOOD ANGELS Unit..."
  if (/^#{0,4}\s*CODEX SUPPLEMENT:?\s*$/i.test(line)) {
    inSkipSection = false
    pendingName = ''
    lastUnitName = ''
    continue
  }

  if (inSkipSection) continue
  if (line.match(/^\d+\s*pts$/)) continue
  if (/^[A-Z][a-z].*\d+\s*pts\s*$/.test(line) && line.length < 40 && !line.includes('model')) continue

  // Standalone faction line (e.g. "BLOOD ANGELS Astorath 1 model...")
  const factionInLine = matchFactionInText(line)
  if (
    factionInLine
    && !/^(CODEX|INDEX)/i.test(line)
    && line.toUpperCase().startsWith(factionInLine.key)
    && /pts/i.test(factionInLine.rest)
  ) {
    currentFaction = factionInLine.id
    inSkipSection = false
    for (const u of parseUnitsFromText(factionInLine.rest)) {
      addUnit(u.name, u.models, u.points)
      lastUnitName = u.name
    }
    pendingName = ''
    continue
  }

  if (!currentFaction) continue
  if (line.startsWith('NOTICE')) continue
  if (line.match(/^PRODUCED BY/)) continue
  if (line.match(/^If your Army Faction/)) continue
  if (line.match(/^The points below/)) continue
  if (line.match(/^CONTENTS/)) continue
  if (line.match(/^MUNITORUM/)) continue
  if (line.match(/^Increases and Decreases/)) continue
  if (line.match(/^Crusade/)) continue

  // Burna Boyz special format
  if (line.match(/Spanner and \d+ Burna Boyz/i)) {
    const m = line.match(/(\d+)\s+Spanners? and (\d+)\s+Burna Boyz\s+(\d+)\s*pts/i)
    if (m) addUnit(`${m[1]} Spanner and ${m[2]} Burna Boyz`, +m[1] + +m[2], +m[3])
    continue
  }

  if (isPointsOnlyLine(line) && (pendingName || lastUnitName)) {
    const text = `${pendingName || lastUnitName} ${line}`
    for (const u of parseUnitsFromText(text)) {
      addUnit(u.name, u.models, u.points)
      lastUnitName = u.name
    }
    pendingName = ''
    continue
  }

  if (/pts/i.test(line)) {
    const text = pendingName ? `${pendingName} ${line}` : line
    for (const u of parseUnitsFromText(text)) {
      addUnit(u.name, u.models, u.points)
      lastUnitName = u.name
    }
    pendingName = ''
    continue
  }

  if (!line.match(/^\d/) && line.length < 80) {
    pendingName = line
  }
}

function addUnit(name, models, points) {
  if (!currentFaction || !name) return
  name = name.replace(/\s+/g, ' ').trim()
  if (name.length < 2 || name.length > 80) return
  if (/^\d/.test(name)) return
  if (/pts$|enhancement|relic|warlord|detachment/i.test(name)) return
  if (/^[\d\s()+]+$/.test(name)) return
  if (name.match(/^(Army of|Bringers|Champions|Hallowed|Penitent|Company of|Inner Circle|Lion|Unforgiven|Angelic|Liberator|Lost|Carnival|Coterie|Mercurial|Peerless|Rapid|Slaanesh|Guiding|Aspect|Devoted|Ghosts|Guardian|Seer|Spirit|Warhost|Windrider|Auric|Lions|Null Maiden|Shield Host|Solar|Talons|Cohort|Explorator|Halos|Rad|Servitor|Skorpius|Data|Control|Enclave|Kauyon|Mont)/i)) return

  let factionId = currentFaction
  if (HARLEQUIN_UNITS.has(name)) factionId = 'harlequins'

  const id = `${factionId}-${slugify(name)}`
  const category = inferCategory(name)
  const stats = inferStats(name, category, models, points)
  const existing = units.get(id)
  // Keep cheapest standard configuration
  if (existing && existing.points <= points) return

  units.set(id, {
    id,
    name,
    factionId,
    category,
    points,
    models: stats.models,
    movement: stats.movement,
    toughness: stats.toughness,
    save: stats.save,
    wounds: stats.wounds,
    leadership: stats.leadership,
    objectiveControl: stats.objectiveControl,
    weapons: defaultWeapons(name, category),
    keywords: inferKeywords(name, category),
    baseSize: stats.baseSize,
    description: generateDescription(name, category, factionId),
    role: inferCategory(name).replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
  })
}

// Chapter character assignments → also tag for chapters
const CHAPTER_CHARS = {
  'space-marines-adrax-agatone': 'salamanders',
  'space-marines-darnath-lysander': 'imperial-fists',
  'space-marines-iron-father-feirros': 'iron-hands',
  'space-marines-kayvaan-shrike': 'raven-guard',
  'space-marines-korsarro-khan': 'white-scars',
  'space-marines-marneus-calgar': 'ultramarines',
  'space-marines-captain-sicarius': 'ultramarines',
  'space-marines-chief-librarian-tigurius': 'ultramarines',
  'space-marines-pedro-kantor': 'imperial-fists',
  'space-marines-lieutenant-titus': 'ultramarines',
}

const CHAPTER_FACTIONS = [
  'ultramarines', 'blood-angels', 'dark-angels', 'space-wolves', 'black-templars',
  'deathwatch', 'grey-knights', 'raven-guard', 'salamanders', 'imperial-fists',
  'iron-hands', 'white-scars',
]

// Duplicate SM units to chapter factions
const allUnits = [...units.values()]
for (const u of allUnits) {
  if (u.factionId !== 'space-marines') continue
  for (const chapter of CHAPTER_FACTIONS) {
    const chapterChar = Object.entries(CHAPTER_CHARS).find(([, c]) => c === chapter)?.[0]
    const isChapterChar = chapterChar === u.id
    const id = `${chapter}-${slugify(u.name)}`
    if (units.has(id)) continue
    units.set(id, {
      ...u,
      id,
      factionId: chapter,
      description: u.description.replace('Space Marines', chapter.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())),
    })
  }
}

// Ynnari gets subset of aeldari/drukhari units (tagged in aeldari section)
// Harlequins from aeldari section already handled

const output = [...units.values()].sort((a, b) => {
  if (a.factionId !== b.factionId) return a.factionId.localeCompare(b.factionId)
  return a.points - b.points
})

const outPath = join(__dirname, '../src/data/generated/units.json')
writeFileSync(outPath, JSON.stringify(output, null, 2))
console.log(`Generated ${output.length} units → ${outPath}`)
console.log('By faction:', Object.fromEntries(
  [...new Set(output.map((u) => u.factionId))].map((f) => [f, output.filter((u) => u.factionId === f).length])
))
