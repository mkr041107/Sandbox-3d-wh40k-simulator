# WH40K Battle Sandbox

[![⚔️ Deploy to the Front — Play Live](https://img.shields.io/badge/⚔️_DEPLOY_TO_THE_FRONT-PLAY_LIVE-8b0000?style=for-the-badge&labelColor=1a1a2e)](https://mkr041107.github.io/Sandbox-3d-wh40k-simulator/)

A browser-based **Warhammer 40,000** army builder and tactical battle simulator with a 3D top-down battlefield and AI opponent — including an optional **LLM-powered** opponent that uses a real language model via your own API key.

> **This project was made with AI.** The codebase, unit data pipeline, UI, battle logic, 3D miniatures, LLM integration, and documentation were created and iterated on with the assistance of AI coding tools (including Cursor). Human direction shaped the goals and features; AI generated and refined most of the implementation.

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
| --- | --- |
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
2. **Army Builder** — pick faction, add units, configure upgrades
3. **Battle Setup** — points limit, AI faction, difficulty, optional LLM config
4. **Battle** — 3D field + HUD

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
│   └── munitorum-source.txt
├── src/
│   ├── ai/
│   │   ├── opponent.ts         # Classic heuristic AI
│   │   ├── llmSettings.ts      # LLM config (.env + localStorage)
│   │   ├── llmClient.ts        # OpenAI-compatible API client
│   │   └── llmOpponent.ts      # Battle snapshot + LLM prompt/parse
│   ├── components/
│   │   ├── battle/             # 3D battlefield, HUD, miniatures
│   │   ├── ArmyBuilder.tsx
│   │   ├── BattleSetup.tsx
│   │   ├── LlmSettingsPanel.tsx
│   │   ├── Home.tsx
│   │   └── UnitDetailPanel.tsx
│   ├── data/
│   │   ├── generated/          # units.json (~1985 units)
│   │   ├── factions.ts
│   │   ├── units.ts
│   │   ├── squadUpgrades.ts
│   │   ├── unitAbilities.ts
│   │   ├── unitPlaystyles.ts
│   │   ├── weaponDescriptions.ts
│   │   └── glossary.ts
│   ├── engine/                 # Battle rules, dice
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

- Single Army Faction per list (no multi-faction allies except Ynnari pooling)
- Simplified phases and morale; not every 10th Edition rule is implemented
- Classic AI uses heuristics, not full game-tree search
- LLM opponent quality depends on the model; responses may be slow or occasionally invalid (fallback AI handles failures)
- **Manual** mode stores API keys in `localStorage`; **Custom** mode bakes them into the build via `.env` — neither is as secure as a backend proxy; use keys with usage limits
- The public GitHub Pages deploy does not include your `.env` — LLM via Custom profile requires self-hosting
- Weapon data from the Munitorum parser may be incomplete for some units
- Procedural miniatures are abstract placeholders, not licensed model representations

---

## License

This repository is provided as-is for personal and educational use. Games Workshop intellectual property remains with Games Workshop. Do not use this project commercially or imply official affiliation with GW.

---

*Built with AI-assisted development. For the Emperor — or the Dark Gods, if that's your list.*
