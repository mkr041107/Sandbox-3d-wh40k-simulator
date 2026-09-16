import { create } from 'zustand'
import { v4 as uuidv4 } from 'uuid'
import type {
  AIDifficulty,
  AppScreen,
  ArmyList,
  BattleState,
  FactionId,
  GameSettings,
} from '../types/game'
import { generateAIArmy, initBattle } from '../engine/battle'
import { upgradesKey } from '../data/units'

interface GameStore {
  screen: AppScreen
  playerArmy: ArmyList
  battleState: BattleState | null
  settings: GameSettings

  setScreen: (screen: AppScreen) => void
  setFaction: (factionId: FactionId) => void
  setArmyName: (name: string) => void
  addUnit: (profileId: string, upgrades?: string[]) => void
  removeUnit: (entryId: string) => void
  clearArmy: () => void
  setPointsLimit: (limit: number) => void
  setAIDifficulty: (difficulty: AIDifficulty) => void
  setAIFaction: (factionId: FactionId) => void
  startBattle: () => void
  setBattleState: (state: BattleState) => void
  resetGame: () => void
}

const defaultArmy: ArmyList = {
  name: 'My Army',
  factionId: 'space-marines',
  pointsLimit: 1000,
  entries: [],
}

const defaultSettings: GameSettings = {
  pointsLimit: 1000,
  aiDifficulty: 'battle-brother',
  aiFactionId: 'chaos-space-marines',
  battlefieldWidth: 60,
  battlefieldHeight: 44,
}

export const useGameStore = create<GameStore>((set, get) => ({
  screen: 'home',
  playerArmy: defaultArmy,
  battleState: null,
  settings: defaultSettings,

  setScreen: (screen) => set({ screen }),

  setFaction: (factionId) =>
    set((s) => ({
      playerArmy: { ...s.playerArmy, factionId, entries: [] },
    })),

  setArmyName: (name) =>
    set((s) => ({ playerArmy: { ...s.playerArmy, name } })),

  addUnit: (profileId, upgrades = []) =>
    set((s) => {
      const key = upgradesKey(upgrades)
      const existing = s.playerArmy.entries.find(
        (e) => e.profileId === profileId && upgradesKey(e.upgrades) === key,
      )
      const entries = existing
        ? s.playerArmy.entries.map((e) =>
            e.entryId === existing.entryId ? { ...e, count: e.count + 1 } : e,
          )
        : [...s.playerArmy.entries, { entryId: uuidv4(), profileId, count: 1, upgrades }]
      return { playerArmy: { ...s.playerArmy, entries } }
    }),

  removeUnit: (entryId) =>
    set((s) => {
      const existing = s.playerArmy.entries.find((e) => e.entryId === entryId)
      if (!existing) return s
      const entries = existing.count <= 1
        ? s.playerArmy.entries.filter((e) => e.entryId !== entryId)
        : s.playerArmy.entries.map((e) =>
            e.entryId === entryId ? { ...e, count: e.count - 1 } : e,
          )
      return { playerArmy: { ...s.playerArmy, entries } }
    }),

  clearArmy: () =>
    set((s) => ({ playerArmy: { ...s.playerArmy, entries: [] } })),

  setPointsLimit: (limit) =>
    set((s) => ({
      settings: { ...s.settings, pointsLimit: limit },
      playerArmy: { ...s.playerArmy, pointsLimit: limit },
    })),

  setAIDifficulty: (difficulty) =>
    set((s) => ({ settings: { ...s.settings, aiDifficulty: difficulty } })),

  setAIFaction: (factionId) =>
    set((s) => ({ settings: { ...s.settings, aiFactionId: factionId } })),

  startBattle: () => {
    const { playerArmy, settings } = get()
    const aiArmy = generateAIArmy(settings.aiFactionId, settings.pointsLimit)
    const battleState = initBattle(
      playerArmy,
      aiArmy,
      settings.battlefieldWidth,
      settings.battlefieldHeight,
    )
    set({ battleState, screen: 'battle' })
  },

  setBattleState: (state) => set({ battleState: state }),

  resetGame: () =>
    set({
      screen: 'home',
      battleState: null,
      playerArmy: defaultArmy,
      settings: defaultSettings,
    }),
}))
