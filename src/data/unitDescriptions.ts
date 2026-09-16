export interface UnitInfo {
  role: string
  description: string
}

export const UNIT_DESCRIPTIONS: Record<string, UnitInfo> = {
  // Space Marines
  'sm-captain': { role: 'Army Leader', description: 'Your battlefield commander. The Captain boosts nearby units and fights well in both shooting and melee. Keep him near your main force to lead charges or hold a key objective.' },
  'sm-intercessor': { role: 'Objective Holder', description: 'The backbone of any Space Marine army. Tough, accurate bolt rifles at 24" range. Park them on objectives and shoot anything that approaches — they won\'t win fights alone but are hard to shift.' },
  'sm-assault': { role: 'Melee Shock Troops', description: 'Close-combat specialists with pistols and chainswords. Move them up quickly and charge weak enemy units. They trade shooting power for devastating melee on the charge.' },
  'sm-terminator': { role: 'Elite Heavy Infantry', description: 'Heavily armoured veterans in Terminator plate. Slow but nearly unkillable with a 2+ save. Deep strike them near enemy lines or walk them up the board as an unstoppable wall.' },
  'sm-dreadnought': { role: 'Walking Tank', description: 'A fallen hero encased in a war machine. Combines a heavy bolter for shooting with a dread fist for melee. Tough enough to lead an advance and punish anything that gets close.' },
  'sm-outrider': { role: 'Fast Flanker', description: 'Bikers that move 12" — twice as fast as infantry. Race around the flank, grab side objectives, or charge isolated enemy shooters before they can react.' },

  // Ultramarines
  'ultramarines-captain': { role: 'Codex Commander', description: 'A disciplined Ultramarines leader exemplifying Codex tactics. Strong in combat and an excellent anchor for your battle line. Pair with Intercessors for a balanced, reliable force.' },
  'ultramarines-intercessor': { role: 'Battle Line Infantry', description: 'Disciplined bolter troops forming the Ultramarines core. Hold the center of the board, shoot accurately, and score objectives. The textbook "good at everything" infantry squad.' },

  // Blood Angels
  'blood-angels-captain': { role: 'Aggressive Leader', description: 'A ferocious Blood Angels hero built for the charge. Leads assaults with above-average melee power. Use him to spearhead attacks — the Red Thirst demands blood.' },
  'blood-angels-assault': { role: 'Suicide Assault', description: 'Cursed warriors who fight to the death. Fragile but deadly in melee with many attacks. Rush them into combat — they won\'t survive long but will tear through enemies first.' },

  // Dark Angels
  'dark-angels-interrogator': { role: 'Zealous Chaplain', description: 'A Dark Angels chaplain who inspires nearby troops and crushes foes in melee. Cheaper than a Captain but still a strong melee character. Lead your infantry into battle.' },
  'dark-angels-terminator': { role: 'Deathwing Elite', description: 'The Dark Angels\' finest in Terminator armour with thunder hammers. Extremely durable and devastating in melee. A premium unit — protect them and aim them at the enemy\'s best troops.' },

  // Black Templars
  'bt-marshal': { role: 'Crusade Leader', description: 'A zealous Black Templars commander who excels in close combat. Cheaper than most HQs and deadly with a power sword. Lead your crusaders into the enemy.' },
  'bt-crusader': { role: 'Melee Horde', description: 'Ten zealous warriors with chainswords. Individually weak (1 wound each) but numerous and fierce in melee. Flood the enemy with bodies and overwhelm through weight of attacks.' },

  // Space Wolves
  'sw-hq': { role: 'Feral Warlord', description: 'A ferocious Wolf Lord wielding a thunder hammer. Hits like a truck in melee. More expensive but one of the hardest-hitting Space Marine characters.' },
  'sw-grey-hunter': { role: 'Flexible Troops', description: 'Space Wolves battle brothers with bolters and chainswords. Slightly more expensive than Intercessors but fight better in melee. Good all-rounders for aggressive play.' },

  // Raven Guard
  'rg-captain': { role: 'Stealth Commander', description: 'A shadowy Raven Guard captain skilled in covert warfare. Strong leader who pairs well with infiltration tactics. Use him to strike where the enemy is weakest.' },
  'rg-infiltrator': { role: 'Forward Deploy', description: 'Scouts who deploy ahead of your army. Get early board presence and shoot from positions other units can\'t reach on turn one. Control the board before the enemy moves up.' },

  // Salamanders
  'sal-captain': { role: 'Flame Warlord', description: 'Adrax Agnatone — a Salamanders hero with a thunder hammer. Devastating melee and thematic flame warfare. Lead your Intercessors and burn the heretic.' },
  'sal-intercessor': { role: 'Resilient Infantry', description: 'Salamanders battle brothers. Same reliable Intercessor stats — hold objectives and provide steady bolter fire. Salamanders favour flame weapons in the full rules; here they\'re solid all-rounders.' },

  // Imperial Fists
  'if-captain': { role: 'Siege Master', description: 'Lysander — one of the toughest Space Marine characters with a 2+ save and thunder hammer. A walking fortress who leads from the front. Point him at the enemy\'s strongest unit.' },
  'if-intercessor': { role: 'Defensive Infantry', description: 'Imperial Fists Intercessors. Reliable objective holders with good saves. Imperial Fists excel at siege warfare — here, they\'re durable troops that won\'t break easily.' },

  // Iron Hands
  'ih-captain': { role: 'Techmarine Leader', description: 'An Iron Father with a 2+ save and power axe. Tougher than most captains and deadly in melee. Iron Hands favour durability — this character embodies that.' },
  'ih-intercessor': { role: 'Armoured Infantry', description: 'Iron Hands battle brothers. Standard Intercessor profile — the Iron Hands\' bionics and resilience are reflected in their faction\'s overall durability focus.' },

  // White Scars
  'ws-khan': { role: 'Lightning Commander', description: 'Kor\'sarro Khan on a bike — Movement 12! The fastest Space Marine HQ. Race across the board, hunt enemy characters, and hit flanks before anyone can respond.' },
  'ws-outrider': { role: 'Hit & Run Cavalry', description: 'Fast bikers with 12" movement. Perfect for grabbing distant objectives, harassing enemy back lines, and charging weak targets. Don\'t get caught in prolonged fights.' },

  // Grey Knights
  'gk-grand-master': { role: 'Daemon Hunter', description: 'The supreme Grey Knight with a 2+ save and nemesis force weapon. A psychic warrior-king who dominates melee. One of the strongest infantry characters in the game.' },
  'gk-strike': { role: 'Psychic Elite', description: 'Grey Knight warriors with storm bolters and force weapons. Expensive but with a 2+ save and psychic powers. Elite troops that punch well above their weight.' },

  // Deathwatch
  'dw-watch-master': { role: 'Xenos Hunter', description: 'Leader of the Deathwatch with a 2+ save. Specialises in killing aliens and monsters. A premium HQ who makes your Kill Team even deadlier.' },
  'dw-kill-team': { role: 'Specialist Squad', description: 'Elite marksmen drawn from every chapter, armed with mixed special weapons. More expensive than regular troops but with better saves and power swords for melee.' },

  // Astra Militarum
  'am-lord': { role: 'Cheap Commander', description: 'A Guard officer who orders your army. Cheap and cheerful — won\'t win fights alone but buffs your troops. Every Guard army needs an HQ; this one leaves points for more bodies.' },
  'am-cadian': { role: 'Cannon Fodder / Volume Fire', description: 'Ten Guardsmen with lasguns. Individually pathetic but ten models means ten shots. Flood the board with cheap bodies, hold objectives, and overwhelm through sheer numbers.' },
  'am-kasrkin': { role: 'Elite Infantry', description: 'Cadia\'s finest with hellguns (AP-2). Ten models of accurate, armour-piercing fire. Delete enemy infantry and light vehicles. More expensive than Cadians but far deadlier.' },
  'am-leman-russ': { role: 'Main Battle Tank', description: 'The iconic Imperial battle tank. A battle cannon that reaches across the board and deletes targets. Slow but extremely tough — anchor your gunline behind this beast.' },
  'am-bullgryn': { role: 'Tanky Brawler', description: 'Ogryn bodyguards with melta bombs. Tough (T6) and surprisingly hard to kill. Charge enemy vehicles or tie up dangerous melee units while your guns shoot.' },

  // Adepta Sororitas
  'sororitas-canoness': { role: 'Faith Leader', description: 'The Canoness leads the Sisters with faith and fury. Cheap HQ with a devastating eviscerator. Inspire your Battle Sisters and charge the unfaithful.' },
  'sororitas-battle': { role: 'Faithful Infantry', description: 'Ten Battle Sisters with bolters and a 3+ save — better armour than most infantry. Hold objectives with faith and firepower. Tougher than Guard, cheaper than Marines.' },
  'sororitas-celestian': { role: 'Elite Bodyguard', description: 'Armoured elite Sisters with 2+ saves and power maces. A small squad of five but extremely durable. Protect your Canoness or hold a vital objective against assault.' },

  // Adeptus Custodes
  'custodes-captain': { role: 'Golden Commander', description: 'A Shield-Captain — among the finest warriors in the galaxy. 2+ save, T6, and a guardian spear. Expensive but nearly unkillable. The Emperor\'s personal guard don\'t fall easily.' },
  'custodes-guard': { role: 'Super-Elite Infantry', description: 'Four Custodians with 2+ saves and guardian spears. Each model is worth several normal soldiers. Small squad but devastating in both shooting and melee.' },
  'custodes-terminator': { role: 'Heavy Elite', description: 'Allarus Custodians in Terminator armour. T7 with a 2+ save — one of the toughest infantry units. Only two models but each is a monster in melee.' },

  // Adeptus Mechanicus
  'admech-marshal': { role: 'Skitarii Commander', description: 'The cheapest HQ in the game. Orders your Skitarii legions and shoots a galvanic rifle. Spend the saved points on more troops or robots.' },
  'admech-ranger': { role: 'Long-Range Skirmishers', description: 'Skitarii with 30" range galvanic rifles. Shoot from beyond enemy reach. Ten cheap models that chip away at targets from safety — classic AdMech gunline play.' },
  'admech-vanguard': { role: 'Close-Range Irradiators', description: 'Skitarii with radium carbines. More shots at shorter range — advance them into mid-board and drown targets in radioactive fire.' },
  'admech-kastelan': { role: 'Robot Gun Platform', description: 'Massive Kastelan robots with phosphor blasters. T8, 2+ save, 7 wounds each. Walking gun batteries that anchor your battle line. Point them at the enemy and let them shoot.' },

  // Imperial Knights
  'ik-knight': { role: 'Titanic War Machine', description: 'A Knight Paladin — a towering war engine. Battle cannon for shooting, chainsword for melee. Dominates the battlefield but costs nearly half your army. Win or lose, the Knight makes an impact.' },
  'ik-armiger': { role: 'Light Walker', description: 'A smaller Knight with a thermal spear. Faster (M12) and cheaper than a full Knight. Flank enemy tanks and melt them at close range.' },

  // Agents of the Imperium
  'agents-inquisitor': { role: 'Independent Operative', description: 'An Inquisitor who works alone or with specialists. Cheap character who won\'t win fights but adds flavour and leadership. Pair with Scions for a small elite force.' },
  'agents-tempestus': { role: 'Elite Drop Troops', description: 'Tempestus Scions with hellguns. Five models of AP-2 shooting — delete enemy infantry. Deploy them where they\'re needed most.' },

  // Chaos Space Marines
  'csm-lord': { role: 'Traitor Commander', description: 'A Chaos Lord leading the fallen Astartes. Similar to a loyalist Captain — strong in melee, leads charges. The dark mirror of Imperial leadership.' },
  'csm-legionary': { role: 'Traitor Infantry', description: 'Chaos Space Marines with boltguns. Slightly more expensive than loyalist Intercessors but just as tough. The core of any Chaos army — hold ground and shoot.' },
  'csm-terminator': { role: 'Chaos Elite', description: 'Traitor Terminators in heavy armour. 2+ save, combi-bolters, and power fists. Walk through enemy fire and tear things apart in melee.' },
  'csm-helbrute': { role: 'Chaos Walker', description: 'A maddened Dreadnought twisted by Chaos. Twin lascannons for tank hunting plus a dread fist. Unpredictable but dangerous — a budget heavy support option.' },

  // Death Guard
  'dg-lord': { role: 'Plague Commander', description: 'A Lord of Contagion wading through battle. T6, 2+ save, and a manreaper. Incredibly tough melee leader who spreads Nurgle\'s gifts. Hard to kill, deadly up close.' },
  'dg-plague': { role: 'Durable Troops', description: 'Plague Marines — T6 infantry with a 3+ save. Extremely hard to kill for their cost. Slow (M5) but walk up the board absorbing fire and holding objectives.' },
  'dg-poxwalker': { role: 'Cheap Screen', description: 'Ten shambling zombies with a 7+ save but T4. Dirt cheap and numerous — use them to screen your Plague Marines, hold objectives, or tie up enemy charges.' },
  'dg-terminator': { role: 'Plague Elite', description: 'Blightlord Terminators — slow, tough, and deadly. Only three models but T6 with 2+ saves. Walk into the enemy and don\'t stop.' },

  // Thousand Sons
  'ts-sorcerer': { role: 'Psychic Commander', description: 'A Thousand Sons Sorcerer with inferno boltgun and force stave. Casts psychic powers and fights in melee. The brain of your army — position carefully.' },
  'ts-rubric': { role: 'Enchanted Infantry', description: 'Rubric Marines bound in enchanted armour. Inferno boltguns with AP-1. Solid mid-range troops that hold objectives and shoot accurately.' },
  'ts-scarab': { role: 'Psychic Terminators', description: 'Scarab Occult Terminators — Terminators who are also psykers. Expensive but with 2+ saves and force weapons. Elite hammer unit for deleting important targets.' },

  // World Eaters
  'we-lord': { role: 'Berzerker Warlord', description: 'Lord Invocatus on a mount — fast and furious. Leads World Eaters charges with devastating chainaxes. Built for one thing: getting into melee as fast as possible.' },
  'we-berzerker': { role: 'Melee Horde', description: 'Eight Khorne Berzerkers with chainaxes and chainswords. Fragile (1 wound) but fast and deadly in melee. Rush the enemy and let Khorne sort the rest out.' },
  'we-eightbound': { role: 'Daemon Elite', description: 'Possessed warriors with daemonic chainblades. T6, fast (M8), and devastating in melee. Three models that can wreck an entire squad.' },

  // Chaos Daemons
  'cd-bloodthirster': { role: 'Greater Daemon', description: 'A Bloodthirster of Khorne — a winged engine of destruction. M12, T11, 18 wounds. The ultimate melee monster. Expensive but can single-handedly win a flank.' },
  'cd-bloodletter': { role: 'Daemon Infantry', description: 'Ten Bloodletters with hellblades. Fast (M8) and numerous. Cheap daemon troops that charge into melee and overwhelm through numbers.' },
  'cd-plaguebearer': { role: 'Daemon Screen', description: 'Ten slow but numerous Nurgle daemons. T4, 7+ save — terrible individually but there are ten of them. Hold objectives and absorb fire.' },

  // Chaos Knights
  'ck-knight': { role: 'Corrupted Titan', description: 'A Knight Desecrator twisted by Chaos. Reaper autocannon and chainsword. The Chaos equivalent of an Imperial Knight — equally devastating, equally expensive.' },

  // Necrons
  'necron-overlord': { role: 'Dynasty Leader', description: 'A Necron Overlord with a tachyon arrow — a gun that can one-shot almost anything. Ld10 means they never run. Lead your dynasty with cold, calculating precision.' },
  'necron-warrior': { role: 'Relentless Infantry', description: 'Ten Necron Warriors with gauss flayers. Ld10 (they don\'t flee) and AP-1 guns. They always get back up in the full rules — here, they\'re durable objective holders.' },
  'necron-immortal': { role: 'Heavy Infantry', description: 'Five Immortals with gauss reapers. Tougher than Warriors (T5, 3+ save, 2 wounds). Fewer models but each is significantly more dangerous.' },
  'necron-wraith': { role: 'Fast Flanker', description: 'Canoptek Wraiths that fly and move 10". Three models that hit hard in melee with whip coils. Flank the enemy and strike where they\'re weakest.' },
  'necron-doomsday': { role: 'Super-Heavy Tank', description: 'A Doomsday Ark with a doomsday cannon. If it hits, it kills. T11, 14 wounds — one of the toughest vehicles. Anchor your gunline and delete priority targets.' },

  // Orks
  'ork-warboss': { role: 'War Leader', description: 'The biggest, meanest Ork leading the Waaagh! Tough (T5, 6 wounds) and deadly with choppa and shoota. Inspires Boyz and smashes heads.' },
  'ork-boyz': { role: 'Green Tide', description: 'Ten Ork Boyz — the classic horde unit. T5 makes them surprisingly durable, 6+ save means they rely on volume. Rush the enemy in a green wave.' },
  'ork-nobz': { role: 'Ork Elite', description: 'Five bigger, tougher Orks. Better save (4+) and 2 wounds each. The Nobz lead the charge and absorb hits that would kill Boyz.' },
  'ork-deffdread': { role: 'Ork Walker', description: 'A cobbled-together Deff Dread with a killsaw. T8 walker that charges into melee and tears things apart. Orky, brutal, effective.' },

  // T'au Empire
  'tau-commander': { role: 'Battlesuit Leader', description: 'A T\'au Commander in a battlesuit. M10, can fly, and carries burst cannon plus fusion blaster. Mobile gun platform that leads from the front.' },
  'tau-strike': { role: 'Gunline Infantry', description: 'Ten Fire Warriors with pulse rifles. 30" range and S5 — outshoot most enemy infantry. Stand at max range and let the Greater Good rain fire.' },
  'tau-breacher': { role: 'Close-Range Specialist', description: 'Ten Breachers with pulse carbines. Shorter range but want to get closer. Advance into 18" and drown targets in pulse fire.' },
  'tau-crisis': { role: 'Elite Battlesuits', description: 'Three Crisis Battlesuits — M10, flying, with burst cannons and fusion blasters. Extremely mobile and versatile. Drop them where the enemy is weakest.' },
  'tau-hammerhead': { role: 'Tank Hunter', description: 'A Hammerhead with a railgun. S20 AP-5 — if this hits, the target dies. The ultimate tank killer. Protect it and point it at the enemy\'s biggest model.' },

  // Aeldari
  'aeldari-farseer': { role: 'Psychic Seer', description: 'An Aeldari Farseer who reads the strands of fate. Casts psychic powers and fights with a witchblade. Fragile (T3) but essential for Aeldari strategy.' },
  'aeldari-guardian': { role: 'Militia Troops', description: 'Ten Guardian Defenders with shuriken catapults. Citizen-soldiers who hold the line. AP-1 shuriken shreds light infantry. Cheap objective holders.' },
  'aeldari-dire': { role: 'Aspect Warriors', description: 'Five Dire Avengers — dedicated shuriken troops. More focused than Guardians. Accurate AP-1 fire that deletes enemy infantry.' },
  'aeldari-wraithguard': { role: 'Ghost Warriors', description: 'Five Wraithguard with D-cannons. T6, short-range distortion guns that delete anything. Walk them into range and vaporise the priority target.' },
  'aeldari-falcon': { role: 'Gunship', description: 'A Falcon grav-tank with shuriken catapult and bright lance. Fast, flying, and armed for both infantry and tanks. Flexible heavy support.' },

  // Drukhari
  'drukhari-archon': { role: 'Raid Leader', description: 'An Archon leading the raid from the front. Fast (M7) and deadly with huskblade. Drukhari are fragile but hit first and hit hard.' },
  'drukhari-kabalite': { role: 'Raider Infantry', description: 'Ten Kabalite Warriors with splinter rifles. Fast, numerous, and accurate. Shoot from range then charge when the enemy is weakened.' },
  'drukhari-wych': { role: 'Melee Dancers', description: 'Ten Wyches with hypex needles. T3 but 6+ save in melee — hard to hit. Fast assault troops that overwhelm in close combat.' },
  'drukhari-raider': { role: 'Fast Transport', description: 'A Raider transport — M14 and can fly. Carry warriors across the board at lightning speed. Shoots a disintegrator cannon while delivering its cargo.' },

  // Harlequins
  'harlequin-troupe': { role: 'Dance of Death', description: 'Five Harlequins who move 8" with 6+ saves. Incredibly fast and hard to hit. Strike from nowhere, kill, and disappear. Hit-and-run specialists.' },
  'harlequin-solitaire': { role: 'Ultimate Duelist', description: 'The Solitaire — the deadliest Harlequin. M10, 6+ save, 4 wounds. A single model that can assassinate enemy characters. Fragile but lethal.' },

  // Ynnari
  'ynnari-archon': { role: 'Death Cult Leader', description: 'An Archon serving Ynnead, god of the dead. Leads Ynnari forces with speed and precision. Same profile as Drukhari Archon — fast melee leader.' },
  'ynnari-kabalite': { role: 'Reborn Warriors', description: 'Kabalite Warriors reborn through Ynnead. Standard Kabalite profile — fast shooting troops that fuel the Ynnari resurrection mechanic in full rules.' },
  'ynnari-wraithblade': { role: 'Ghost Elite', description: 'Five Wraithblades with ghost swords. T6 ghost warriors who hit hard in melee. Tough elite infantry that anchors the Ynnari battle line.' },

  // Tyranids
  'tyranid-hive-tyrant': { role: 'Hive Commander', description: 'A Hive Tyrant — the brain of the swarm. T10, 12 wounds, flies, and carries heavy venom cannon plus monstrous talons. A monster HQ that dominates the board.' },
  'tyranid-termagant': { role: 'Ranged Swarm', description: 'Ten Termagants with fleshborers. The cheapest Tyranid troops. Numerous, expendable, and chip away with bio-fire. Screen for bigger creatures.' },
  'tyranid-hormagaunt': { role: 'Melee Swarm', description: 'Ten Hormagaunts with scything talons. M10 — incredibly fast. Rush the enemy and tie them up in melee while monsters advance behind.' },
  'tyranid-warrior': { role: 'Synapse Node', description: 'Three Tyranid Warriors — T5, 3 wounds each. Mid-tier creatures that lead lesser Tyranids. Versatile with both shooting and melee.' },
  'tyranid-carnifex': { role: 'Heavy Monster', description: 'A Carnifex — a living battering ram. T9, 8 wounds, deathspitters and scything talons. Walk into the enemy lines and cause devastation.' },

  // Genestealer Cults
  'gsc-patriarch': { role: 'Cult Master', description: 'The Genestealer Patriarch — the cult\'s biological father. T5, 6 wounds, rending claws. A deadly melee monster who buffs nearby cultists.' },
  'gsc-neophyte': { role: 'Cult Infantry', description: 'Ten Neophyte Hybrids with autoguns. Cheap, numerous, and expendable. Hold objectives and provide a screen for your Aberrants and Patriarch.' },
  'gsc-acolyte': { role: 'Close Assault', description: 'Five Acolyte Hybrids with autopistols and knives. T4 and slightly tougher than Neophytes. Rush into melee and ambush the enemy.' },
  'gsc-aberrant': { role: 'Heavy Brawler', description: 'Five Aberrants with heavy picks. T6 brutes who smash through lines. Slow but nearly impossible to kill with small arms fire.' },

  // Leagues of Votann
  'votann-kahl': { role: 'Kindred Leader', description: 'A Kâhl leading the Kindred. Balanced leader with autocannon and liberator. The Kin fight smart — this commander exemplifies tactical efficiency.' },
  'votann-hearthkyn': { role: 'Kin Warriors', description: 'Ten Hearthkyn Warriors with autocannons and liberators. Solid all-round infantry with good range and melee. Hold objectives with ancestral wisdom.' },
  'votann-einhyr': { role: 'Elite Guard', description: 'Five Einhyr Hearthguard with 2+ saves. Elite Kin warriors who excel in both shooting and melee. Small but extremely effective.' },
  'votann-hekaton': { role: 'Land Fortress', description: 'A Hekaton Land Fortress — a massive transport with a hekaton land cannon. T11, 16 wounds, carries troops. The Kin\'s answer to a Land Raider.' },
}
