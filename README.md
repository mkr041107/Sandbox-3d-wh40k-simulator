# NOTICE
The github contributors listed are bugged and a problem with git, it should be fixed when github updates the cache!

---

# WH40K Battle Sandbox

[![⚔️ Deploy to the Front — Play Live](https://img.shields.io/badge/⚔️_DEPLOY_TO_THE_FRONT-PLAY_LIVE-8b0000?style=for-the-badge&labelColor=1a1a2e)](https://mkr041107.github.io/Sandbox-3d-wh40k-simulator/)

A browser-based **Warhammer 40,000** army builder and tactical battle simulator with a 3D top-down battlefield, detachment rules, terrain-aware shooting, combat VFX, and AI opponent — including an optional **LLM-powered** opponent that uses a real language model via your own API key.

> **This project was made with AI.** The codebase, unit data pipeline, UI, battle logic, 3D miniatures, LLM integration, and documentation were created and iterated on with the assistance of AI coding tools (including Cursor). Human direction shaped the goals and features; AI generated and refined most of the implementation.

---

## Disclaimer

This is an **unofficial fan project**. Warhammer 40,000, faction names, unit names, and related imagery are © **Games Workshop Limited**. This project is not endorsed by, affiliated with, or approved by Games Workshop. Unit points and stats are derived from publicly available Munitorum Field Manual data for personal/educational use in this sandbox only.

---

## Features

### Detachments & Army Building

- **Detachment setup flow** — pick faction → choose detachment → build list (Home → **Build Army**)
- **Faction-specific detachments** — each army has multiple detachments with an army rule, focus, and stratagems (Space Marines, Astra Militarum, Necrons, Orks, T'au, Chaos, Tyranids, and more)
- **Army rules in battle** — detachment rules apply during combat (e.g. Gladius doctrines, Waaagh!, Oath of Moment, Mont'ka/Kauyon, Born Soldiers, Artillery Support)
- **Command Points & stratagems** — spend CP in battle for phase-specific buffs parsed from detachment data
- **Faction allies** — Codex Space Marines merge for most chapters; Ynnari access Aeldari/Drukhari/Harlequins; Genestealer Cults can take Guard; Chaos legions can ally Daemons
- **36 official factions** — Imperium, Chaos, and Xenos armies from Adepta Sororitas to Tyranids, including Space Marine chapters, Chaos legions, and Emperor's Children
- **~1,985 units** parsed from the Munitorum Field Manual (v2.3) with points, stats, weapons, and keywords
- **Search and filter** by unit name and datasheet category (HQ, Troops, Elites, Fast Attack, Heavy Support, Lord of War)
- **Squad upgrades** — wargear and loadout options for many core units (weapons, sergeant gear, squad size, etc.)
- **Points tracking** — army list totals with configurable limits (500 / 1000 / 1500 / 2000 pts)
- **Beginner-friendly unit info** — role labels, tactical descriptions, inferred abilities, and weapon explanations
- **Unit data quality tools** — `scripts/generate-units.mjs` builds `units.json`; `scripts/audit-units.mjs` scans for coherency and misclassification issues

### Unit Detail Panel

- Full datasheet stats (M, T, Sv, W, Ld, OC)
- **Abilities & rules** inferred from keywords and unit type (e.g. Deep Strike, Stealth, Deadly Demise, Ion Shield)
- **Weapon keyword glossary** — Blast, Indirect Fire, Twin-linked, Torrent, Melta, Rapid Fire, Pistol, Ignores Cover, Anti-armour
- **Playstyle blurbs** — how each unit is meant to be used on the table
- **Weapon descriptions** — what each gun does in plain language

### Deployment

Interactive deployment phase before turn 1:

- **Deployment zone** — place units in your blue deployment band
- **Infiltrators** — deploy anywhere more than 9" from the enemy deployment zone
- **Scouts** — deploy up to 12" beyond your normal zone (still on your half)
- **Deep Strike reserves** — hold units off-board; arrive turn 2+ during Movement (>9" from enemies)
- **Coherency & spacing** — multi-model squads must stay coherent and avoid overlapping bases
- **Reposition** — adjust placed units before finishing deployment

### 3D Battlefield

- **React Three Fiber** top-down tactical view with orbit camera
- **Camera presets** — Table, Top Down, Cinematic
- Sky, stars, fog, contact shadows, **gameplay terrain** (ruins, barricades, rock, scatter), deployment zones, and objective marker
- **Line of sight** — ruins and terrain block shooting unless indirect fire / spotters apply
- **Cover** — units in or near terrain (or with Stealth) gain +1 save vs ranged; Ignores Cover and stratagems can negate it
- **Movement range ring** when moving units in the movement phase
- **Per-model movement** — multi-model squads can move individual models while staying in coherency
- **Shoot target highlights** — valid enemies show a red ring during shooting
- **Click-to-shoot** — select your shooter, then click a highlighted enemy on the board (or use HUD buttons)
- **Combat VFX** — tracers, beams, missiles, artillery arcs, flamer cones, impact bursts, and floating wound/kill labels
- **Distance ruler** — toggle **Ruler** on the camera bar; click two points on the mat to measure in inches (live preview while placing the second point)
- Click the battlefield to move units; select units to shoot, charge, or fight via the HUD

### Combat Visual Effects

When a shot resolves (player or AI), the board shows weapon-appropriate feedback:

| Style | Weapons |
| --- | --- |
| **Bolt tracers** | Boltguns, lasguns, stubbers |
| **Energy beams** | Plasma, lascannon, melta, fusion |
| **Missiles** | Krak, frag, rocket launchers |
| **Artillery** | Basilisks, mortars, indirect fire (with **INCOMING** warning) |
| **Flamer cones** | Flamers, torrent/incendiary weapons |

Impacts show an explosion burst plus text such as `3 wounds`, `2W · 1 killed`, or `MISS`.

### Procedural Miniatures

Units are rendered as distinct procedural 3D silhouettes (no external model files required):

| Layer | Examples |
| --- | --- |
| **Archetype** | Infantry, Character, Tank, Vehicle, Walker, Monster, Flyer, Titanic |
| **Silhouette** | Human, Daemon, Tyranid, Ork, Necron, Aeldari, Machine, T'au, Cult, Knight |
| **Greater Daemons** | God-specific bodies — Khorne (winged + axe), Nurgle (bloated), Tzeentch (bird + staff), Slaanesh (multi-armed) |

Tanks use treads and rectangular footprints; infantry use round bases; Greater Daemons use large oval bases and warp auras. Each token shows a **type badge** (e.g. TANK, GREATER DAEMON, INFANTRY).

Optional GLB models can be dropped in `public/models/` (`infantry.glb`, `tank.glb`, etc.) for future replacement of procedural meshes.

### Battle Engine

Simplified Warhammer 40k-style turn structure:

1. **Deployment** — place army (or Deep Strike to reserves)
2. **Command** — gain CP; set doctrines / Oath targets where supported
3. **Movement** — move units or individual models within Movement; Deep Strike arrivals turn 2+
4. **Shooting** — ranged attacks with BS, saves, terrain, and weapon rules
5. **Charge**
6. **Fight** — melee with WS and saves
7. **Morale**

**Shooting & battlefield rules (implemented):**

- **Line of sight** — blocked by ruins/terrain unless shooting indirectly
- **Indirect Fire** — fire without LoS if the weapon has the keyword and a friendly **spotter** sees the target (−1 to hit; waived for Guard *Artillery Support* with a spotter)
- **Benefit of Cover / Stealth** — +1 save vs ranged
- **Pistol** — can shoot while engaged (within 1")
- **Blast** — bonus attacks vs units with 6+ models
- **Rapid Fire** — double attacks at half range
- **Melta** — +1 to wound at half range
- **Torrent** — auto-hits
- **Twin-linked** — re-roll wounds
- **Ignores Cover** — flamers and some weapons bypass cover

**Unit abilities in combat:**

- **Feel No Pain** (e.g. Plague Marines)
- **Ion Shield** — 4+ invulnerable vs ranged (Knights)
- **Deadly Demise** — mortals to nearby units when a vehicle is destroyed
- **Fights First** — AI resolves these units earlier in the Fight phase

**Detachment modifiers:**

- Combat doctrines (Devastator / Tactical / Assault)
- Army focus bonuses (Aggressive, Shooting, Artillery, Defensive, etc.)
- Stratagem effects (+hit, +wound, cover, Feel No Pain, fight again, etc.)
- Faction rules (Waaagh!, Oath of Moment, Mont'ka, Kauyon, Born Soldiers, …)

**Core systems:**

- Dice-based hit / wound / save resolution with re-rolls where rules allow
- Victory points tracking
- Battle log of actions
- Unit health bars and model counts on tokens
- Squad coherency and base spacing for movement, charges, and deployment

### How to shoot

1. Advance to the **Shooting** phase (**End Movement** in the HUD).
2. **Click your unit** on the 3D board.
3. Valid targets are highlighted with a **red ring** (crosshair cursor on hover).
4. **Click the enemy** on the board or use the **Shoot at** buttons in the sidebar.
5. Watch the **combat VFX** and check the battle log for wound results.
6. Repeat for other units, then **End Shooting**.

### AI Opponent (two modes)

#### Classic AI (default)

Built-in **video game-style heuristic AI** — not an LLM. It scores targets, samples move positions, and uses difficulty knobs (aggression, target priority, dice modifiers). No API key required. Runs entirely in the browser.

| Difficulty | Behavior |
| --- | --- |
| **Recruit** | Slow, poor target selection, low aggression |
| **Battle Brother** | Solid fundamentals, focuses weak targets |
| **Veteran** | Strong tactics, punishes mistakes |
| **Chapter Master** | Near-optimal target priority and aggression |

#### LLM Opponent (optional)

Enable in **Battle Setup** to replace the classic AI with a **real language model** that reads the battlefield state and returns tactical actions each phase.

- Supports **OpenAI-compatible** APIs: OpenAI, OpenRouter, Groq, nano-gpt, LM Studio, Ollama (OpenAI shim), etc.
- Battle snapshot (units, positions, legal moves/shots/charges) sent to the model each AI phase
- Model returns structured JSON actions (move, shoot, charge, fight, next phase)
- **Automatic fallback** to classic AI if the API fails or returns invalid JSON
- HUD shows an **LLM** badge and "LLM is planning…" during opponent turns

Two ways to configure credentials:

| Mode | Label in UI | Where settings live |
| --- | --- | --- |
| **Manual** | Manual | Enter provider, API key, URL, and model in the browser (saved to `localStorage`) |
| **Custom** | Custom | Load API key, URL, and model from your local `.env` file (not stored in `localStorage`) |

---

## LLM setup guide

### Quick start (browser only — no `.env`)

1. Run the app (`npm run dev`) and go to **Battle Setup**
2. Under **LLM Opponent**, check **Use LLM opponent instead of classic AI**
3. Leave **Configuration** on **Manual**
4. Pick a provider (OpenAI, OpenRouter, Groq, or Local server)
5. Paste your API key, base URL, and model
6. Click **Test connection**, then **Start Battle**

Your key is saved in this browser's `localStorage` under `wh40k-llm-settings`.

### Self-hosted setup (`.env` file)

Use this when you host the app yourself and don't want to re-enter your API key every session or browser.

#### Step 1 — Create your `.env` file

```bash
cp .env.example .env
```

Edit `.env` with your values. **Never commit `.env`** — it is gitignored. Only `.env.example` goes to GitHub.

#### Step 2 — Fill in the variables

| Variable | Required? | Description |
| --- | --- | --- |
| `VITE_LLM_API_KEY` | **Yes** (for Custom profile) | Your API key |
| `VITE_LLM_ENABLED` | Optional | `true` to check "Use LLM opponent" by default |
| `VITE_LLM_PROVIDER` | Optional | `openai`, `openrouter`, `groq`, or `custom`. Any other value is treated as `custom` |
| `VITE_LLM_BASE_URL` | Recommended | API base URL (e.g. `https://api.openai.com/v1`) |
| `VITE_LLM_MODEL` | Recommended | Model name (e.g. `gpt-4o-mini`) |

If `VITE_LLM_BASE_URL` or `VITE_LLM_MODEL` are omitted, built-in defaults for the provider are used. For third-party APIs (nano-gpt, etc.), set all three: key, URL, and model.

#### Step 3 — Example configs

**OpenAI:**

```env
VITE_LLM_ENABLED=true
VITE_LLM_PROVIDER=openai
VITE_LLM_API_KEY=sk-your-key-here
VITE_LLM_BASE_URL=https://api.openai.com/v1
VITE_LLM_MODEL=gpt-4o-mini
```

**nano-gpt (or any custom OpenAI-compatible API):**

```env
VITE_LLM_ENABLED=true
VITE_LLM_PROVIDER=custom
VITE_LLM_API_KEY=sk-your-nano-gpt-key
VITE_LLM_BASE_URL=https://nano-gpt.com/api/v1
VITE_LLM_MODEL=deepseek/deepseek-v4-flash
```

**Groq:**

```env
VITE_LLM_ENABLED=true
VITE_LLM_PROVIDER=groq
VITE_LLM_API_KEY=gsk_your-key-here
VITE_LLM_BASE_URL=https://api.groq.com/openai/v1
VITE_LLM_MODEL=llama-3.3-70b-versatile
```

#### Step 4 — Restart the dev server

Vite only reads `.env` at startup:

```bash
npm run dev
```

#### Step 5 — Select Custom in the UI

1. Go to **Battle Setup → LLM Opponent**
2. Check **Use LLM opponent instead of classic AI**
3. Under **Configuration**, click **Custom**
4. Confirm the read-only profile shows your masked API key, base URL, and model
5. Click **Test connection**, then **Start Battle**

Only your **enabled/disabled toggle** and **Manual vs Custom choice** are saved in `localStorage`. Secrets stay in `.env`.

#### Production / private server build

```bash
npm run build
npm run preview   # or serve dist/ on your own server
```

`VITE_` variables are **baked into the JS bundle at build time**. Run `npm run build` on a machine that has your `.env` file present.

> **Do not** add API keys to the public GitHub Pages workflow. The live demo at the badge link above uses Manual mode only (no baked-in secrets).

### LLM troubleshooting

| Problem | Fix |
| --- | --- |
| **Custom is greyed out** | Set `VITE_LLM_API_KEY` in `.env` and restart `npm run dev` |
| **Custom shows wrong URL/model** | Uncomment `VITE_LLM_BASE_URL` and `VITE_LLM_MODEL` in `.env` |
| **Changes to `.env` not applied** | Stop and restart the dev server — Vite does not hot-reload env files |
| **Test connection fails** | Check provider URL, model name, and that your key is valid for that API |
| **LLM fails mid-battle** | Classic AI takes over automatically for that phase; check the HUD warning banner |
| **Keys on GitHub Pages** | Not supported — use Manual mode in the browser, or self-host with `.env` |

### App Flow

1. **Home** — Build Army or Quick Battle
2. **Detachment Setup** — pick faction and detachment (army rule + stratagems)
3. **Army Builder** — add units, configure upgrades, track points
4. **Battle Setup** — points limit, AI faction, difficulty, optional LLM config
5. **Battle** — deploy on the 3D field, then play through phases with HUD + VFX

---

## Tech Stack

| Layer | Technology |
| --- | --- |
| UI | React 19, TypeScript |
| Build | Vite 8 |
| State | Zustand |
| 3D | Three.js, @react-three/fiber, @react-three/drei |
| Classic AI | Heuristic scoring (`src/ai/opponent.ts`) |
| LLM AI | OpenAI-compatible chat completions (`src/ai/llmClient.ts`) |
| IDs | uuid |

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 18+ (LTS recommended)
- npm
- (Optional) API key for LLM opponent — only if you enable that mode

### Install and run

```bash
npm install
cp .env.example .env   # optional — for self-hosted LLM API keys
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

### Audit unit data

Scan generated units for deployment coherency failures and likely misclassifications (e.g. infantry matched to vehicle stats):

```bash
node scripts/audit-units.mjs
```

### Deploy to GitHub Pages

GitHub Pages can host this as a static site. For a project site at `https://<user>.github.io/<repo>/`, set the Vite `base` path in `vite.config.ts`:

```ts
export default defineConfig({
  base: '/your-repo-name/',
  plugins: [react()],
})
```

Then build and deploy the `dist/` folder (GitHub Actions or manual `gh-pages` branch).

---

## Project Structure

```text
├── public/models/              # Optional GLB miniature models
├── scripts/
│   ├── generate-units.mjs      # Munitorum Field Manual parser
│   ├── audit-units.mjs         # Coherency / misclassification scanner
│   └── munitorum-source.txt
├── src/
│   ├── ai/
│   │   ├── opponent.ts         # Classic heuristic AI
│   │   ├── llmSettings.ts      # LLM config (.env + localStorage)
│   │   ├── llmClient.ts        # OpenAI-compatible API client
│   │   └── llmOpponent.ts      # Battle snapshot + LLM prompt/parse
│   ├── components/
│   │   ├── battle/             # 3D battlefield, HUD, VFX, miniatures
│   │   │   └── vfx/            # Shot tracers, impacts, combat VFX layer
│   │   ├── ArmyBuilder.tsx
│   │   ├── DetachmentSetup.tsx
│   │   ├── BattleSetup.tsx
│   │   ├── LlmSettingsPanel.tsx
│   │   ├── Home.tsx
│   │   └── UnitDetailPanel.tsx
│   ├── data/
│   │   ├── generated/          # units.json (~1985 units)
│   │   ├── detachments.ts      # Detachment rules & stratagems
│   │   ├── detachmentEffects.ts
│   │   ├── battlefieldTerrain.ts
│   │   ├── factionAllies.ts
│   │   ├── abilityRules.ts     # Weapon keyword glossary
│   │   ├── factions.ts
│   │   ├── units.ts
│   │   ├── squadUpgrades.ts
│   │   ├── unitAbilities.ts
│   │   ├── unitPlaystyles.ts
│   │   ├── weaponDescriptions.ts
│   │   └── glossary.ts
│   ├── engine/
│   │   ├── battle.ts           # Turn flow, shoot/charge/fight
│   │   ├── battlefieldRules.ts # LoS, cover, indirect fire, weapon rules
│   │   ├── combatVfx.ts        # VFX kind inference from weapons
│   │   ├── deploymentRules.ts  # Infiltrate, Scouts, Deep Strike
│   │   ├── detachmentBattle.ts # CP, stratagems, army rules
│   │   ├── modelSquad.ts       # Formations, coherency, per-model moves
│   │   └── dice.ts
│   ├── store/                  # Zustand game state
│   └── types/                  # TypeScript types
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

- Single Army Faction per list (limited ally pooling — see Faction allies above)
- Simplified phases and morale; not every 10th Edition rule is implemented
- **Squad formation spacing** — default grid spacing can fail coherency checks for some multi-model squads on small bases (known engine/data tension)
- Terrain is simplified 2D footprints aligned to 3D visuals; LoS/cover are approximations
- Weapon keywords are inferred from weapon names/stats when not explicitly tagged
- Classic AI uses heuristics, not full game-tree search
- LLM opponent quality depends on the model; responses may be slow or occasionally invalid (fallback AI handles failures)
- **Manual** mode stores API keys in `localStorage`; **Custom** mode bakes them into the build via `.env` — neither is as secure as a backend proxy; use keys with usage limits
- The public GitHub Pages deploy does not include your `.env` — LLM via Custom profile requires self-hosting
- Weapon data from the Munitorum parser may be incomplete for some units
- Procedural miniatures are abstract placeholders, not licensed model representations
- Combat VFX are cosmetic feedback; damage is resolved by the engine before the animation plays

---

## Support

This project was built with AI coding tools, which aren't free to run. If you enjoy the sandbox and feel like chipping in toward those costs, you can optionally leave a tip on [Ko-fi](https://ko-fi.com/mkr041107) — totally voluntary, no perks or pressure.

---

## License

This repository is provided as-is for personal and educational use. Games Workshop intellectual property remains with Games Workshop. Do not use this project commercially or imply official affiliation with GW.

---

*Built with AI-assisted development. For the Emperor — or the Dark Gods, if that's your list.*
