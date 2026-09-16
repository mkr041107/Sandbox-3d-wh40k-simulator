# WH40K Battle Sandbox

A browser-based **Warhammer 40,000** army builder and tactical battle simulator with a 3D top-down battlefield and AI opponent.

> **This project was made with AI.** The codebase, unit data pipeline, UI, battle logic, 3D miniatures, and documentation were created and iterated on with the assistance of AI coding tools (including Cursor). Human direction shaped the goals and features; AI generated and refined most of the implementation.

---

## Disclaimer

This is an **unofficial fan project**. Warhammer 40,000, faction names, unit names, and related imagery are © **Games Workshop Limited**. This project is not endorsed by, affiliated with, or approved by Games Workshop. Unit points and stats are derived from publicly available Munitorum Field Manual data for personal/educational use in this sandbox only.

---

## Features

### Army Builder

- **36 official factions** — Imperium, Chaos, and Xenos armies from Adepta Sororitas to Tyranids, including Space Marine chapters, Chaos legions, and Emperor's Children
- **~1,985 units** parsed from the Munitorum Field Manual (v2.3) with points, stats, weapons, and keywords
- **Search and filter** by unit name and datasheet category (HQ, Troops, Elites, Fast Attack, Heavy Support, Lord of War)
- **Squad upgrades** — wargear and loadout options for many core units (weapons, sergeant gear, squad size, etc.)
- **Points tracking** — army list totals with configurable limits (500 / 1000 / 1500 / 2000 pts)
- **Beginner-friendly unit info** — role labels, tactical descriptions, inferred abilities, and weapon explanations

### Unit Detail Panel

- Full datasheet stats (M, T, Sv, W, Ld, OC)
- **Abilities & rules** inferred from keywords and unit type (e.g. Deep Strike, Deadly Demise, Armoured Hull)
- **Playstyle blurbs** — how each unit is meant to be used on the table
- **Weapon descriptions** — what each gun does in plain language

### 3D Battlefield

- **React Three Fiber** top-down tactical view with orbit camera
- **Camera presets** — Table, Top Down, Cinematic
- Sky, stars, fog, contact shadows, terrain features, deployment zones, and objective marker
- **Movement range ring** when moving units in the movement phase
- **Shoot target highlights** on valid enemy units during shooting
- Click the battlefield to move units; select units to shoot, charge, or fight via the HUD

### Procedural Miniatures

Units are rendered as distinct procedural 3D silhouettes (no external model files required):

| Layer | Examples |
|-------|----------|
| **Archetype** | Infantry, Character, Tank, Vehicle, Walker, Monster, Flyer, Titanic |
| **Silhouette** | Human, Daemon, Tyranid, Ork, Necron, Aeldari, Machine, T'au, Cult, Knight |
| **Greater Daemons** | God-specific bodies — Khorne (winged + axe), Nurgle (bloated), Tzeentch (bird + staff), Slaanesh (multi-armed) |

Tanks use treads and rectangular footprints; infantry use round bases; Greater Daemons use large oval bases and warp auras. Each token shows a **type badge** (e.g. TANK, GREATER DAEMON, INFANTRY).

Optional GLB models can be dropped in `public/models/` (`infantry.glb`, `tank.glb`, etc.) for future replacement of procedural meshes.

### Battle Engine

Simplified Warhammer 40k-style turn structure:

1. **Command**
2. **Movement** — click to move within unit Movement characteristic
3. **Shooting** — ranged attacks with BS and save rolls
4. **Charge**
5. **Fight** — melee with WS and save rolls
6. **Morale**

- Dice-based hit/wound/save resolution
- Victory points tracking
- Battle log of actions
- Unit health bars and model counts on tokens

### AI Opponent

Four difficulty levels:

| Difficulty | Behavior |
|------------|----------|
| **Recruit** | Slow, poor target selection, low aggression |
| **Battle Brother** | Solid fundamentals, focuses weak targets |
| **Veteran** | Strong tactics, punishes mistakes |
| **Chapter Master** | Near-optimal target priority and aggression |

The AI moves, shoots, charges, and fights through each phase with configurable hit modifiers and think delays.

### App Flow

1. **Home** — Build Army or Quick Battle
2. **Army Builder** — pick faction, add units, configure upgrades
3. **Battle Setup** — points limit, AI faction, difficulty
4. **Battle** — 3D field + HUD

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| UI | React 19, TypeScript |
| Build | Vite 8 |
| State | Zustand |
| 3D | Three.js, @react-three/fiber, @react-three/drei |
| IDs | uuid |

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 18+ (LTS recommended)
- npm

### Install and run

```bash
npm install
npm run dev
```

Open the URL shown in the terminal (typically `http://localhost:5173`).

### Build for production

```bash
npm run build
npm run preview
```

### Regenerate unit data

Unit JSON is generated from the Munitorum source file:

```bash
npm run generate:units
```

This reads `scripts/munitorum-source.txt` and writes `src/data/generated/units.json`.

---

## Project Structure

```
├── public/models/          # Optional GLB miniature models
├── scripts/
│   ├── generate-units.mjs  # Munitorum Field Manual parser
│   └── munitorum-source.txt
├── src/
│   ├── ai/                 # AI opponent logic
│   ├── components/
│   │   ├── battle/         # 3D battlefield, HUD, miniatures
│   │   ├── ArmyBuilder.tsx
│   │   ├── BattleSetup.tsx
│   │   ├── Home.tsx
│   │   └── UnitDetailPanel.tsx
│   ├── data/
│   │   ├── generated/      # units.json (~1985 units)
│   │   ├── factions.ts
│   │   ├── units.ts
│   │   ├── squadUpgrades.ts
│   │   ├── unitAbilities.ts
│   │   ├── unitPlaystyles.ts
│   │   ├── weaponDescriptions.ts
│   │   └── glossary.ts
│   ├── engine/             # Battle rules, dice
│   ├── store/              # Zustand game state
│   └── types/              # TypeScript types
└── package.json
```

---

## Factions

All 36 factions in the army builder:

**Imperium:** Adepta Sororitas, Adeptus Custodes, Adeptus Mechanicus, Agents of the Imperium, Astra Militarum, Black Templars, Blood Angels, Dark Angels, Deathwatch, Grey Knights, Imperial Fists, Imperial Knights, Iron Hands, Raven Guard, Salamanders, Space Marines, Space Wolves, Ultramarines, White Scars

**Chaos:** Chaos Daemons, Chaos Knights, Chaos Space Marines, Death Guard, Emperor's Children, Thousand Sons, World Eaters

**Xenos:** Aeldari, Drukhari, Genestealer Cults, Harlequins, Leagues of Votann, Necrons, Orks, T'au Empire, Tyranids, Ynnari

Space Marine **chapters** share the generic Space Marines unit pool plus chapter-specific entries. **Ynnari** can access allied Aeldari, Drukhari, and Harlequin units.

---

## Known Limitations

This is a **sandbox**, not a full competitive rules engine:

- Single Army Faction per list (no multi-faction allies except Ynnari pooling)
- Simplified phases and morale; not every 10th Edition rule is implemented
- AI uses heuristics, not full game-tree search
- Weapon data from the Munitorum parser may be incomplete for some units
- Procedural miniatures are abstract placeholders, not licensed model representations

---

## License

This repository is provided as-is for personal and educational use. Games Workshop intellectual property remains with Games Workshop. Do not use this project commercially or imply official affiliation with GW.

---

*Built with AI-assisted development. For the Emperor — or the Dark Gods, if that's your list.*
