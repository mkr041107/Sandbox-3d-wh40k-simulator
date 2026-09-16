import { useGameStore } from '../store/gameStore'

export function Home() {
  const setScreen = useGameStore((s) => s.setScreen)

  return (
    <div className="home">
      <div className="home-hero">
        <h1 className="home-title">WH40K Battle Sandbox</h1>
        <p className="home-subtitle">
          Build your army. Test your tactics. Fight the machine.
        </p>
        <div className="home-actions">
          <button className="btn btn-primary btn-lg" onClick={() => setScreen('army-builder')}>
            Build Army
          </button>
          <button className="btn btn-secondary btn-lg" onClick={() => setScreen('battle-setup')}>
            Quick Battle
          </button>
        </div>
        <div className="home-features">
          <div className="feature-card app-panel">
            <h3>36 Official Factions</h3>
            <p>All current Warhammer 40,000 armies from Space Marines to Tyranids</p>
          </div>
          <div className="feature-card app-panel">
            <h3>3D Battlefield</h3>
            <p>Top-down tactical view with unit movement, shooting, and melee combat</p>
          </div>
          <div className="feature-card app-panel">
            <h3>AI Opponent</h3>
            <p>Four difficulty levels from Recruit to Chapter Master</p>
          </div>
        </div>
      </div>
    </div>
  )
}
