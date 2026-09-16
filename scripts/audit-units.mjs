import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const units = JSON.parse(readFileSync(join(dirname(fileURLToPath(import.meta.url)), '../src/data/generated/units.json'), 'utf8'))

const COHERENCY_DISTANCE = 2

function modelSpacingInches(baseSize) {
  return (baseSize / 25.4) * 2 + 0.05
}

function distance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y)
}

function buildFormation(count, anchor, baseSize) {
  if (count <= 1) return [{ position: { ...anchor } }]
  const spacing = modelSpacingInches(baseSize)
  const cols = Math.ceil(Math.sqrt(count))
  const rows = Math.ceil(count / cols)
  const startX = anchor.x - ((cols - 1) * spacing) / 2
  const startY = anchor.y - ((rows - 1) * spacing) / 2
  const models = []
  for (let i = 0; i < count; i++) {
    const col = i % cols
    const row = Math.floor(i / cols)
    models.push({ position: { x: startX + col * spacing, y: startY + row * spacing } })
  }
  return models
}

function isUnitCoherent(models, baseSize) {
  if (models.length <= 1) return true
  const maxGap = COHERENCY_DISTANCE + modelSpacingInches(baseSize) * 0.15
  for (const model of models) {
    const hasNeighbor = models.some((other) => {
      if (other === model) return false
      return distance(model.position, other.position) <= maxGap
    })
    if (!hasNeighbor) return false
  }
  return true
}

const deployBlocked = []
const misclassifiedInfantry = []

for (const u of units) {
  const models = buildFormation(u.models, { x: 10, y: 10 }, u.baseSize)
  if (u.models > 1 && !isUnitCoherent(models, u.baseSize)) {
    deployBlocked.push({
      id: u.id,
      name: u.name,
      models: u.models,
      baseSize: u.baseSize,
      category: u.category,
      toughness: u.toughness,
    })
  }

  const kw = (u.keywords || []).map((k) => k.toLowerCase())
  const infantryLike = kw.includes('infantry') || kw.includes('battleline') || kw.includes('character')
  const vehicleLike = u.toughness >= 10 || u.baseSize >= 80
  const tankWeapon = (u.weapons || []).some((w) => w.name === 'Main cannon' || w.name === 'Knight main weapon')
  if (infantryLike && (vehicleLike || tankWeapon) && u.category !== 'lord-of-war') {
    misclassifiedInfantry.push({
      id: u.id,
      name: u.name,
      models: u.models,
      baseSize: u.baseSize,
      category: u.category,
      toughness: u.toughness,
      weapons: (u.weapons || []).slice(0, 2).map((w) => w.name),
    })
  }
}

console.log('=== DEPLOYMENT BLOCKED (coherency fail) ===')
console.log('Count:', deployBlocked.length)
for (const u of deployBlocked.sort((a, b) => a.name.localeCompare(b.name))) {
  console.log(`${u.name} | ${u.models} models | ${u.baseSize}mm | T${u.toughness} | ${u.category}`)
}

console.log('\n=== INFANTRY KEYWORDS + VEHICLE STATS ===')
console.log('Count:', misclassifiedInfantry.length)
for (const u of misclassifiedInfantry.sort((a, b) => a.name.localeCompare(b.name))) {
  console.log(`${u.name} | ${u.models} models | ${u.baseSize}mm | T${u.toughness} | ${u.category} | ${u.weapons.join(', ')}`)
}
