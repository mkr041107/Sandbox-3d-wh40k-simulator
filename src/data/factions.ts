import type { Faction, FactionId } from '../types/game'

export const FACTIONS: Faction[] = [
  { id: 'adepta-sororitas', name: 'Adepta Sororitas', allegiance: 'imperium', primaryColor: '#c41e3a', secondaryColor: '#1a1a2e', description: 'Fanatical warriors of the Ecclesiarchy.' },
  { id: 'adeptus-custodes', name: 'Adeptus Custodes', allegiance: 'imperium', primaryColor: '#d4af37', secondaryColor: '#8b0000', description: 'The Emperor\'s personal bodyguard.' },
  { id: 'adeptus-mechanicus', name: 'Adeptus Mechanicus', allegiance: 'imperium', primaryColor: '#c41e3a', secondaryColor: '#2d2d2d', description: 'Tech-priests of Mars and their skitarii legions.' },
  { id: 'aeldari', name: 'Aeldari', allegiance: 'xenos', primaryColor: '#00bfff', secondaryColor: '#4b0082', description: 'Ancient star-faring race of psychic warriors.' },
  { id: 'agents-of-the-imperium', name: 'Agents of the Imperium', allegiance: 'imperium', primaryColor: '#2f4f4f', secondaryColor: '#8b0000', description: 'Inquisitors, assassins, and covert operatives.' },
  { id: 'astra-militarum', name: 'Astra Militarum', allegiance: 'imperium', primaryColor: '#556b2f', secondaryColor: '#8b7355', description: 'The Imperial Guard — humanity\'s hammer.' },
  { id: 'black-templars', name: 'Black Templars', allegiance: 'imperium', primaryColor: '#1a1a1a', secondaryColor: '#c0c0c0', description: 'Zealous crusading Space Marine chapter.' },
  { id: 'blood-angels', name: 'Blood Angels', allegiance: 'imperium', primaryColor: '#8b0000', secondaryColor: '#ffd700', description: 'Noble warriors cursed with the Red Thirst.' },
  { id: 'chaos-daemons', name: 'Chaos Daemons', allegiance: 'chaos', primaryColor: '#8b008b', secondaryColor: '#2d0a0a', description: 'Entities of the Warp given form.' },
  { id: 'chaos-knights', name: 'Chaos Knights', allegiance: 'chaos', primaryColor: '#4a0e0e', secondaryColor: '#1a1a1a', description: 'Corrupted war machines of the Dark Gods.' },
  { id: 'chaos-space-marines', name: 'Chaos Space Marines', allegiance: 'chaos', primaryColor: '#4a0e0e', secondaryColor: '#ffd700', description: 'Traitor legions who turned from the Emperor.' },
  { id: 'dark-angels', name: 'Dark Angels', allegiance: 'imperium', primaryColor: '#1a472a', secondaryColor: '#c0c0c0', description: 'Secretive First Legion with a dark past.' },
  { id: 'death-guard', name: 'Death Guard', allegiance: 'chaos', primaryColor: '#4a6741', secondaryColor: '#8b7355', description: 'Plague-ridden sons of Mortarion.' },
  { id: 'deathwatch', name: 'Deathwatch', allegiance: 'imperium', primaryColor: '#1a1a1a', secondaryColor: '#c0c0c0', description: 'Elite xenos-hunters drawn from all chapters.' },
  { id: 'drukhari', name: 'Drukhari', allegiance: 'xenos', primaryColor: '#4b0082', secondaryColor: '#00ff7f', description: 'Sadistic Dark Eldar raiders from Commorragh.' },
  { id: 'emperors-children', name: "Emperor's Children", allegiance: 'chaos', primaryColor: '#9b59b6', secondaryColor: '#ffd700', description: 'Perfection-obsessed devotees of Slaanesh.' },
  { id: 'genestealer-cults', name: 'Genestealer Cults', allegiance: 'xenos', primaryColor: '#6b4c9a', secondaryColor: '#8b7355', description: 'Insidious hybrids spreading the Patriarch\'s will.' },
  { id: 'grey-knights', name: 'Grey Knights', allegiance: 'imperium', primaryColor: '#708090', secondaryColor: '#c0c0c0', description: 'Daemon-hunting psychic Space Marines.' },
  { id: 'harlequins', name: 'Harlequins', allegiance: 'xenos', primaryColor: '#ff1493', secondaryColor: '#00ffff', description: 'Mysterious performers of the Laughing God.' },
  { id: 'imperial-fists', name: 'Imperial Fists', allegiance: 'imperium', primaryColor: '#ffd700', secondaryColor: '#1a1a1a', description: 'Siege masters and defenders of Terra.' },
  { id: 'imperial-knights', name: 'Imperial Knights', allegiance: 'imperium', primaryColor: '#1a472a', secondaryColor: '#c0c0c0', description: 'Noble houses piloting towering war machines.' },
  { id: 'iron-hands', name: 'Iron Hands', allegiance: 'imperium', primaryColor: '#2f4f4f', secondaryColor: '#c0c0c0', description: 'Cybernetically enhanced pragmatists.' },
  { id: 'leagues-of-votann', name: 'Leagues of Votann', allegiance: 'xenos', primaryColor: '#cd853f', secondaryColor: '#4169e1', description: 'Kin of the galactic core with ancestral wisdom.' },
  { id: 'necrons', name: 'Necrons', allegiance: 'xenos', primaryColor: '#00ff7f', secondaryColor: '#1a1a2e', description: 'Ancient undying machines seeking galactic dominion.' },
  { id: 'orks', name: 'Orks', allegiance: 'xenos', primaryColor: '#228b22', secondaryColor: '#8b4513', description: 'Savage greenskins who live for war.' },
  { id: 'raven-guard', name: 'Raven Guard', allegiance: 'imperium', primaryColor: '#1a1a1a', secondaryColor: '#4a4a4a', description: 'Masters of stealth and covert operations.' },
  { id: 'salamanders', name: 'Salamanders', allegiance: 'imperium', primaryColor: '#1a472a', secondaryColor: '#ff4500', description: 'Ferocious warriors who protect the innocent.' },
  { id: 'space-marines', name: 'Space Marines', allegiance: 'imperium', primaryColor: '#1e3a5f', secondaryColor: '#c0c0c0', description: 'The Adeptus Astartes — humanity\'s finest.' },
  { id: 'space-wolves', name: 'Space Wolves', allegiance: 'imperium', primaryColor: '#4682b4', secondaryColor: '#c0c0c0', description: 'Feral warriors of Fenris.' },
  { id: 'tau-empire', name: "T'au Empire", allegiance: 'xenos', primaryColor: '#4169e1', secondaryColor: '#ff8c00', description: 'Advanced aliens guided by the Greater Good.' },
  { id: 'thousand-sons', name: 'Thousand Sons', allegiance: 'chaos', primaryColor: '#4169e1', secondaryColor: '#ffd700', description: 'Sorcerous sons of Magnus the Red.' },
  { id: 'tyranids', name: 'Tyranids', allegiance: 'xenos', primaryColor: '#6b2d5b', secondaryColor: '#2d1b3d', description: 'Hive fleets devouring all biomass.' },
  { id: 'ultramarines', name: 'Ultramarines', allegiance: 'imperium', primaryColor: '#1e3a8a', secondaryColor: '#ffd700', description: 'Exemplars of the Codex Astartes.' },
  { id: 'white-scars', name: 'White Scars', allegiance: 'imperium', primaryColor: '#f5f5f5', secondaryColor: '#8b0000', description: 'Lightning-fast hunters of the steppes.' },
  { id: 'world-eaters', name: 'World Eaters', allegiance: 'chaos', primaryColor: '#8b0000', secondaryColor: '#1a1a1a', description: 'Berzerkers who worship the Blood God.' },
  { id: 'ynnari', name: 'Ynnari', allegiance: 'xenos', primaryColor: '#ff4500', secondaryColor: '#4b0082', description: 'Followers of Ynnead seeking to awaken the god of the dead.' },
]

export function getFaction(id: FactionId): Faction {
  const faction = FACTIONS.find((f) => f.id === id)
  if (!faction) throw new Error(`Unknown faction: ${id}`)
  return faction
}

export const FACTION_IDS = FACTIONS.map((f) => f.id)

const UI_BACKGROUND = '#0a0a12'
const MIN_UI_CONTRAST = 4.5
const UI_TEXT_FALLBACK = '#e8e8f0'
const UI_ACCENT_FALLBACK = '#c9a227'

function hexToRgb(hex: string): [number, number, number] | null {
  const normalized = hex.replace('#', '')
  if (normalized.length === 3) {
    return [
      Number.parseInt(normalized[0] + normalized[0], 16),
      Number.parseInt(normalized[1] + normalized[1], 16),
      Number.parseInt(normalized[2] + normalized[2], 16),
    ]
  }
  if (normalized.length !== 6) return null
  return [
    Number.parseInt(normalized.slice(0, 2), 16),
    Number.parseInt(normalized.slice(2, 4), 16),
    Number.parseInt(normalized.slice(4, 6), 16),
  ]
}

function relativeLuminance(hex: string): number {
  const rgb = hexToRgb(hex)
  if (!rgb) return 0
  const [r, g, b] = rgb.map((channel) => {
    const srgb = channel / 255
    return srgb <= 0.03928 ? srgb / 12.92 : ((srgb + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

function contrastRatio(foreground: string, background: string): number {
  const fg = relativeLuminance(foreground)
  const bg = relativeLuminance(background)
  const lighter = Math.max(fg, bg)
  const darker = Math.min(fg, bg)
  return (lighter + 0.05) / (darker + 0.05)
}

/** Pick a faction color that stays readable on the dark UI background. */
export function getFactionUiColor(
  faction: Faction,
  background: string = UI_BACKGROUND,
): string {
  const candidates = [
    faction.primaryColor,
    faction.secondaryColor,
    UI_ACCENT_FALLBACK,
    UI_TEXT_FALLBACK,
  ]

  for (const color of candidates) {
    if (contrastRatio(color, background) >= MIN_UI_CONTRAST) {
      return color
    }
  }

  return UI_TEXT_FALLBACK
}
