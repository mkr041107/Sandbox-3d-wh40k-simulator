import { useGameStore } from './store/gameStore'
import { DetachmentSetup } from './components/DetachmentSetup'
import { Home } from './components/Home'
import { ArmyBuilder } from './components/ArmyBuilder'
import { BattleSetup } from './components/BattleSetup'
import { Battle } from './components/battle/Battle'
import { DonationFooter } from './components/DonationFooter'

export default function App() {
  const screen = useGameStore((s) => s.screen)

  return (
    <div className="app app-bg">
      <main className="app-main">
        {screen === 'home' && <Home />}
        {screen === 'detachment-setup' && <DetachmentSetup />}
        {screen === 'army-builder' && <ArmyBuilder />}
        {screen === 'battle-setup' && <BattleSetup />}
        {screen === 'battle' && <Battle />}
      </main>
      <DonationFooter />
    </div>
  )
}
