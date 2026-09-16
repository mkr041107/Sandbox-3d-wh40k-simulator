import { useGameStore } from './store/gameStore'
import { Home } from './components/Home'
import { ArmyBuilder } from './components/ArmyBuilder'
import { BattleSetup } from './components/BattleSetup'
import { Battle } from './components/battle/Battle'

export default function App() {
  const screen = useGameStore((s) => s.screen)

  return (
    <div className="app">
      {screen === 'home' && <Home />}
      {screen === 'army-builder' && <ArmyBuilder />}
      {screen === 'battle-setup' && <BattleSetup />}
      {screen === 'battle' && <Battle />}
    </div>
  )
}
