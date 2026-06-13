/**
 * seed-pot-soil.ts
 * Populates potSizeMinInch, potSizeMaxInch, potVolumeLitres,
 * soilCocoPeatPct, soilGardenSoilPct, soilCompostPct,
 * soilExtrasPct, soilExtrasNote, potNotes
 * for every plant in the database.
 *
 * Run: npx ts-node --project tsconfig.json prisma/seed-pot-soil.ts
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// ─── Soil preset templates ────────────────────────────────────────────────────
const MIX = {
  succulent:   { soilCocoPeatPct: 30, soilGardenSoilPct: 40, soilCompostPct: 10, soilExtrasPct: 20, soilExtrasNote: 'perlite / coarse sand' },
  adenium:     { soilCocoPeatPct: 30, soilGardenSoilPct: 40, soilCompostPct: 10, soilExtrasPct: 20, soilExtrasNote: 'perlite' },
  tropical:    { soilCocoPeatPct: 40, soilGardenSoilPct: 30, soilCompostPct: 30, soilExtrasPct: null, soilExtrasNote: null },
  airPure:     { soilCocoPeatPct: 40, soilGardenSoilPct: 40, soilCompostPct: 20, soilExtrasPct: null, soilExtrasNote: null },
  foliage:     { soilCocoPeatPct: 35, soilGardenSoilPct: 40, soilCompostPct: 25, soilExtrasPct: null, soilExtrasNote: null },
  herb:        { soilCocoPeatPct: 30, soilGardenSoilPct: 40, soilCompostPct: 30, soilExtrasPct: null, soilExtrasNote: null },
  woodyHerb:   { soilCocoPeatPct: 30, soilGardenSoilPct: 45, soilCompostPct: 25, soilExtrasPct: null, soilExtrasNote: null },
  flowerAnn:   { soilCocoPeatPct: 35, soilGardenSoilPct: 35, soilCompostPct: 30, soilExtrasPct: null, soilExtrasNote: null },
  flowerPer:   { soilCocoPeatPct: 30, soilGardenSoilPct: 40, soilCompostPct: 30, soilExtrasPct: null, soilExtrasNote: null },
  vegFruit:    { soilCocoPeatPct: 40, soilGardenSoilPct: 30, soilCompostPct: 30, soilExtrasPct: null, soilExtrasNote: null },
  vegRoot:     { soilCocoPeatPct: 35, soilGardenSoilPct: 50, soilCompostPct: 15, soilExtrasPct: null, soilExtrasNote: 'loose sandy soil — avoid heavy compost' },
  vegLeafy:    { soilCocoPeatPct: 30, soilGardenSoilPct: 40, soilCompostPct: 30, soilExtrasPct: null, soilExtrasNote: null },
  fruit:       { soilCocoPeatPct: 25, soilGardenSoilPct: 50, soilCompostPct: 25, soilExtrasPct: null, soilExtrasNote: 'add neem cake for pest resistance' },
  strawberry:  { soilCocoPeatPct: 40, soilGardenSoilPct: 30, soilCompostPct: 30, soilExtrasPct: null, soilExtrasNote: null },
}

// ─── Plant data ───────────────────────────────────────────────────────────────
// Matched by slug substring (most specific first)
interface PlantData {
  potSizeMinInch: number
  potSizeMaxInch: number
  potVolumeLitres: number
  potNotes: string | null
  mix: keyof typeof MIX
}

const PLANT_DATA: { slugContains: string; data: PlantData }[] = [
  // ── Succulents & Cacti ──────────────────────────────────────────────────────
  { slugContains: 'haworthia',      data: { potSizeMinInch: 4,  potSizeMaxInch: 6,  potVolumeLitres: 1,  potNotes: 'Shallow roots — wide, shallow terracotta pot preferred', mix: 'succulent' } },
  { slugContains: 'echeveria',      data: { potSizeMinInch: 4,  potSizeMaxInch: 6,  potVolumeLitres: 1,  potNotes: 'Terracotta best; ensure drainage holes', mix: 'succulent' } },
  { slugContains: 'jade',           data: { potSizeMinInch: 6,  potSizeMaxInch: 8,  potVolumeLitres: 4,  potNotes: 'Wide base needed — plant gets top-heavy', mix: 'succulent' } },
  { slugContains: 'string-of',      data: { potSizeMinInch: 6,  potSizeMaxInch: 8,  potVolumeLitres: 3,  potNotes: 'Hanging basket ideal for trailing stems', mix: 'succulent' } },
  { slugContains: 'cactus',         data: { potSizeMinInch: 4,  potSizeMaxInch: 8,  potVolumeLitres: 2,  potNotes: 'Pot should be only 1–2 inches wider than cactus; terracotta preferred', mix: 'succulent' } },
  { slugContains: 'aloe',           data: { potSizeMinInch: 8,  potSizeMaxInch: 10, potVolumeLitres: 7,  potNotes: 'Wide shallow pot; must have drainage holes', mix: 'succulent' } },
  { slugContains: 'adenium',        data: { potSizeMinInch: 10, potSizeMaxInch: 12, potVolumeLitres: 10, potNotes: 'Wide flat bowl-shaped pot to display caudex (base)', mix: 'adenium' } },
  { slugContains: 'kalanchoe',      data: { potSizeMinInch: 6,  potSizeMaxInch: 8,  potVolumeLitres: 3,  potNotes: 'Small compact plant; do not oversize pot', mix: 'adenium' } },

  // ── Tropical Houseplants ────────────────────────────────────────────────────
  { slugContains: 'monstera',       data: { potSizeMinInch: 10, potSizeMaxInch: 14, potVolumeLitres: 12, potNotes: 'Repot every 2 years; provide moss pole for climbing varieties', mix: 'tropical' } },
  { slugContains: 'pothos',         data: { potSizeMinInch: 8,  potSizeMaxInch: 10, potVolumeLitres: 6,  potNotes: 'Hanging planter or shelf pot; trailing stems can reach 3 m', mix: 'tropical' } },
  { slugContains: 'philodendron',   data: { potSizeMinInch: 10, potSizeMaxInch: 12, potVolumeLitres: 10, potNotes: 'Ensure drainage holes; moss pole for climbing types', mix: 'tropical' } },
  { slugContains: 'peace-lily',     data: { potSizeMinInch: 8,  potSizeMaxInch: 10, potVolumeLitres: 6,  potNotes: 'Prefers slightly root-bound; repot only when roots fill pot', mix: 'tropical' } },
  { slugContains: 'syngonium',      data: { potSizeMinInch: 8,  potSizeMaxInch: 10, potVolumeLitres: 6,  potNotes: 'Compact; can trail or be trained to climb', mix: 'tropical' } },
  { slugContains: 'tradescantia',   data: { potSizeMinInch: 6,  potSizeMaxInch: 8,  potVolumeLitres: 3,  potNotes: 'Shallow roots; hanging basket works well', mix: 'tropical' } },
  { slugContains: 'money-plant',    data: { potSizeMinInch: 8,  potSizeMaxInch: 10, potVolumeLitres: 6,  potNotes: 'Provide support for climbing; also grows in water bottles', mix: 'tropical' } },
  { slugContains: 'lucky-bamboo',   data: { potSizeMinInch: 6,  potSizeMaxInch: 8,  potVolumeLitres: 3,  potNotes: 'Can grow in water (vase) or soil; change water weekly if in water', mix: 'tropical' } },

  // ── Air-Purifying Houseplants ───────────────────────────────────────────────
  { slugContains: 'snake-plant',    data: { potSizeMinInch: 8,  potSizeMaxInch: 10, potVolumeLitres: 6,  potNotes: 'Prefers snug fit — avoid oversizing pot; drought tolerant', mix: 'airPure' } },
  { slugContains: 'zz-plant',       data: { potSizeMinInch: 10, potSizeMaxInch: 12, potVolumeLitres: 10, potNotes: 'Wide pot for thick rhizomes; repot every 2–3 years', mix: 'airPure' } },
  { slugContains: 'spider-plant',   data: { potSizeMinInch: 8,  potSizeMaxInch: 10, potVolumeLitres: 6,  potNotes: 'Hanging basket shows off runners beautifully', mix: 'airPure' } },
  { slugContains: 'aglaonema',      data: { potSizeMinInch: 8,  potSizeMaxInch: 10, potVolumeLitres: 6,  potNotes: 'Keep pot snug; repot when roots escape drainage holes', mix: 'airPure' } },
  { slugContains: 'dracaena',       data: { potSizeMinInch: 10, potSizeMaxInch: 12, potVolumeLitres: 10, potNotes: '1–2 inches wider than root ball; heavy base for tall varieties', mix: 'airPure' } },

  // ── Foliage / Decorative ────────────────────────────────────────────────────
  { slugContains: 'rubber-plant',   data: { potSizeMinInch: 10, potSizeMaxInch: 14, potVolumeLitres: 12, potNotes: 'Gets tall — use weighted base or wide pot to prevent tipping', mix: 'foliage' } },
  { slugContains: 'areca-palm',     data: { potSizeMinInch: 12, potSizeMaxInch: 16, potVolumeLitres: 18, potNotes: 'Mature plant needs 16 inch pot; plant in clump (not solo) for bushy look', mix: 'foliage' } },
  { slugContains: 'croton',         data: { potSizeMinInch: 10, potSizeMaxInch: 12, potVolumeLitres: 10, potNotes: 'Wide base for stability; likes humidity', mix: 'foliage' } },
  { slugContains: 'coleus',         data: { potSizeMinInch: 8,  potSizeMaxInch: 10, potVolumeLitres: 6,  potNotes: 'Bushy; pinch tips for fullness', mix: 'foliage' } },

  // ── Herbs — Light / Annual ──────────────────────────────────────────────────
  { slugContains: 'tulsi',          data: { potSizeMinInch: 8,  potSizeMaxInch: 10, potVolumeLitres: 6,  potNotes: 'Single plant: 8 inch; cluster of 3: 10–12 inch', mix: 'herb' } },
  { slugContains: 'coriander',      data: { potSizeMinInch: 8,  potSizeMaxInch: 10, potVolumeLitres: 6,  potNotes: 'Sow succession every 3 weeks to avoid bolting; wide shallow pot ok', mix: 'herb' } },
  { slugContains: 'mint-pudina',    data: { potSizeMinInch: 10, potSizeMaxInch: 12, potVolumeLitres: 10, potNotes: 'Runners spread aggressively — contain in its own pot; wide preferred', mix: 'herb' } },
  { slugContains: 'peppermint',     data: { potSizeMinInch: 10, potSizeMaxInch: 12, potVolumeLitres: 10, potNotes: 'Same spreading habit as mint — keep separate from other herbs', mix: 'herb' } },
  { slugContains: 'basil',          data: { potSizeMinInch: 8,  potSizeMaxInch: 10, potVolumeLitres: 6,  potNotes: 'Pinch flowers to extend harvest; place in full sun', mix: 'herb' } },
  { slugContains: 'ajwain',         data: { potSizeMinInch: 8,  potSizeMaxInch: 10, potVolumeLitres: 6,  potNotes: 'Upright herb; ensure good drainage', mix: 'herb' } },
  { slugContains: 'methi',          data: { potSizeMinInch: 8,  potSizeMaxInch: 10, potVolumeLitres: 6,  potNotes: 'Fast crop (25–30 days); sow thickly; succession sow every 2 weeks', mix: 'herb' } },
  { slugContains: 'spring-onion',   data: { potSizeMinInch: 8,  potSizeMaxInch: 10, potVolumeLitres: 6,  potNotes: 'Plant 10–15 bulbs per 10 inch pot; harvest in 6–8 weeks', mix: 'herb' } },
  { slugContains: 'stevia',         data: { potSizeMinInch: 8,  potSizeMaxInch: 10, potVolumeLitres: 6,  potNotes: 'Small perennial; harvest before flowering for sweetest leaves', mix: 'herb' } },

  // ── Herbs — Woody / Perennial ───────────────────────────────────────────────
  { slugContains: 'curry-leaf',     data: { potSizeMinInch: 12, potSizeMaxInch: 14, potVolumeLitres: 15, potNotes: 'Eventually a small tree; start 10 inch and repot each year', mix: 'woodyHerb' } },
  { slugContains: 'lemongrass',     data: { potSizeMinInch: 12, potSizeMaxInch: 14, potVolumeLitres: 15, potNotes: 'Clump-forming — wide heavy pot; can reach 1 m height', mix: 'woodyHerb' } },
  { slugContains: 'ashwagandha',    data: { potSizeMinInch: 12, potSizeMaxInch: 14, potVolumeLitres: 15, potNotes: 'Deep taproot — choose a tall deep pot', mix: 'woodyHerb' } },
  { slugContains: 'brahmi',         data: { potSizeMinInch: 8,  potSizeMaxInch: 10, potVolumeLitres: 6,  potNotes: 'Semi-aquatic — wide shallow pot; keep soil consistently moist', mix: 'woodyHerb' } },
  { slugContains: 'giloy',          data: { potSizeMinInch: 12, potSizeMaxInch: 14, potVolumeLitres: 15, potNotes: 'Vigorous climber — provide trellis; wide base pot', mix: 'woodyHerb' } },

  // ── Flowering — Annual ──────────────────────────────────────────────────────
  { slugContains: 'marigold',       data: { potSizeMinInch: 8,  potSizeMaxInch: 10, potVolumeLitres: 6,  potNotes: 'Annual; deadhead regularly for continuous blooms', mix: 'flowerAnn' } },
  { slugContains: 'sunflower',      data: { potSizeMinInch: 12, potSizeMaxInch: 14, potVolumeLitres: 15, potNotes: 'Deep pot for taproot; stake when over 60 cm tall', mix: 'flowerAnn' } },
  { slugContains: 'petunia',        data: { potSizeMinInch: 8,  potSizeMaxInch: 10, potVolumeLitres: 6,  potNotes: 'Trailing varieties suit hanging baskets; deadhead for bushiness', mix: 'flowerAnn' } },
  { slugContains: 'vinca',          data: { potSizeMinInch: 8,  potSizeMaxInch: 10, potVolumeLitres: 6,  potNotes: 'Heat-tolerant annual; low maintenance', mix: 'flowerAnn' } },
  { slugContains: 'portulaca',      data: { potSizeMinInch: 6,  potSizeMaxInch: 8,  potVolumeLitres: 3,  potNotes: 'Shallow roots; excellent in terracotta window boxes', mix: 'flowerAnn' } },
  { slugContains: 'crossandra',     data: { potSizeMinInch: 8,  potSizeMaxInch: 10, potVolumeLitres: 6,  potNotes: 'Compact; heat-loving; keep moist', mix: 'flowerAnn' } },

  // ── Flowering — Perennial / Shrub ───────────────────────────────────────────
  { slugContains: 'hibiscus',       data: { potSizeMinInch: 12, potSizeMaxInch: 14, potVolumeLitres: 18, potNotes: 'Heavy feeder; repot annually; prune after flowering flush', mix: 'flowerPer' } },
  { slugContains: 'rose',           data: { potSizeMinInch: 12, potSizeMaxInch: 14, potVolumeLitres: 18, potNotes: 'Miniature rose: 8–10 inch. Hybrid tea/floribunda: 12–14 inch minimum', mix: 'flowerPer' } },
  { slugContains: 'dahlia',         data: { potSizeMinInch: 12, potSizeMaxInch: 14, potVolumeLitres: 15, potNotes: 'Tuberous roots need wide deep pot; stake tall varieties', mix: 'flowerPer' } },
  { slugContains: 'chrysanthemum',  data: { potSizeMinInch: 10, potSizeMaxInch: 12, potVolumeLitres: 10, potNotes: 'Seasonal; repot after bloom cycle; pinch in early growth for bushiness', mix: 'flowerPer' } },
  { slugContains: 'gerbera',        data: { potSizeMinInch: 10, potSizeMaxInch: 12, potVolumeLitres: 10, potNotes: 'Crown must stay ABOVE soil level to prevent crown rot', mix: 'flowerPer' } },
  { slugContains: 'bougainvillea',  data: { potSizeMinInch: 14, potSizeMaxInch: 16, potVolumeLitres: 22, potNotes: 'Deep taproot; terracotta preferred; stress-to-bloom: let soil dry between watering', mix: 'flowerPer' } },
  { slugContains: 'ixora',          data: { potSizeMinInch: 12, potSizeMaxInch: 14, potVolumeLitres: 15, potNotes: 'Slow-growing shrub; acid-loving — add some peat for pH 5.5–6.0', mix: 'flowerPer' } },
  { slugContains: 'mogra',          data: { potSizeMinInch: 10, potSizeMaxInch: 12, potVolumeLitres: 10, potNotes: 'Climber; provide trellis or wall support; full sun for maximum fragrance', mix: 'flowerPer' } },
  { slugContains: 'parijat',        data: { potSizeMinInch: 12, potSizeMaxInch: 16, potVolumeLitres: 18, potNotes: 'Small tree; start in 12 inch and upgrade yearly', mix: 'flowerPer' } },
  { slugContains: 'raat-ki-rani',   data: { potSizeMinInch: 12, potSizeMaxInch: 14, potVolumeLitres: 15, potNotes: 'Shrub/climber; needs trellis; strongly fragrant at night', mix: 'flowerPer' } },
  { slugContains: 'jasmine',        data: { potSizeMinInch: 10, potSizeMaxInch: 12, potVolumeLitres: 10, potNotes: 'Provide trellis; prune after bloom to encourage new flower buds', mix: 'flowerPer' } },

  // ── Vegetables — Fruiting ───────────────────────────────────────────────────
  { slugContains: 'tomato',         data: { potSizeMinInch: 12, potSizeMaxInch: 14, potVolumeLitres: 18, potNotes: 'Minimum 12 inch DEPTH essential; stake or cage; heavy feeder', mix: 'vegFruit' } },
  { slugContains: 'cherry-tomato',  data: { potSizeMinInch: 12, potSizeMaxInch: 14, potVolumeLitres: 15, potNotes: 'Same as regular tomato; cascading variety suits hanging basket', mix: 'vegFruit' } },
  { slugContains: 'chilli',         data: { potSizeMinInch: 10, potSizeMaxInch: 12, potVolumeLitres: 10, potNotes: 'Bushy plant; medium root system; stake tall varieties', mix: 'vegFruit' } },
  { slugContains: 'green-chilli',   data: { potSizeMinInch: 10, potSizeMaxInch: 12, potVolumeLitres: 10, potNotes: 'Same as chilli; compact bushy growth', mix: 'vegFruit' } },
  { slugContains: 'okra',           data: { potSizeMinInch: 12, potSizeMaxInch: 14, potVolumeLitres: 18, potNotes: 'Gets 1–1.5 m tall; deep pot essential; stake when tall', mix: 'vegFruit' } },
  { slugContains: 'bhindi',         data: { potSizeMinInch: 12, potSizeMaxInch: 14, potVolumeLitres: 18, potNotes: 'Same as okra; needs full sun (6+ hours)', mix: 'vegFruit' } },
  { slugContains: 'brinjal',        data: { potSizeMinInch: 12, potSizeMaxInch: 14, potVolumeLitres: 18, potNotes: 'Sprawling plant; use stake or cage; mulch surface to retain moisture', mix: 'vegFruit' } },
  { slugContains: 'capsicum',       data: { potSizeMinInch: 12, potSizeMaxInch: 14, potVolumeLitres: 18, potNotes: 'Heavy fruiter; stake when loaded; feed potassium after fruiting starts', mix: 'vegFruit' } },
  { slugContains: 'cucumber',       data: { potSizeMinInch: 14, potSizeMaxInch: 16, potVolumeLitres: 22, potNotes: '25 L grow bag preferred; must have trellis for vertical growth', mix: 'vegFruit' } },
  { slugContains: 'bitter-gourd',   data: { potSizeMinInch: 14, potSizeMaxInch: 16, potVolumeLitres: 22, potNotes: 'Grow bag preferred; strong trellis needed; bitter taste intensifies when small', mix: 'vegFruit' } },
  { slugContains: 'karela',         data: { potSizeMinInch: 14, potSizeMaxInch: 16, potVolumeLitres: 22, potNotes: 'Same as bitter gourd; tropical crop — needs 30°C+ for best yield', mix: 'vegFruit' } },
  { slugContains: 'bottle-gourd',   data: { potSizeMinInch: 16, potSizeMaxInch: 20, potVolumeLitres: 35, potNotes: 'Large grow bag essential (min 30 L); very vigorous climber', mix: 'vegFruit' } },
  { slugContains: 'beans',          data: { potSizeMinInch: 10, potSizeMaxInch: 12, potVolumeLitres: 10, potNotes: 'Bush type: 10 inch. Pole/climbing: 12 inch with trellis', mix: 'vegFruit' } },
  { slugContains: 'peas',           data: { potSizeMinInch: 10, potSizeMaxInch: 12, potVolumeLitres: 10, potNotes: 'Cool-season crop; trellis needed; sow Oct–Jan in India', mix: 'vegFruit' } },

  // ── Vegetables — Root Crops ─────────────────────────────────────────────────
  { slugContains: 'radish',         data: { potSizeMinInch: 10, potSizeMaxInch: 12, potVolumeLitres: 10, potNotes: 'DEPTH critical (min 12 inches); avoid stones/lumps that fork roots', mix: 'vegRoot' } },
  { slugContains: 'carrot',         data: { potSizeMinInch: 12, potSizeMaxInch: 14, potVolumeLitres: 15, potNotes: 'Minimum 12 inch depth; use loose sandy mix; water evenly', mix: 'vegRoot' } },
  { slugContains: 'beetroot',       data: { potSizeMinInch: 12, potSizeMaxInch: 14, potVolumeLitres: 15, potNotes: 'Needs 12+ inch depth; space 10 cm apart for full-size beets', mix: 'vegRoot' } },

  // ── Vegetables — Leafy ─────────────────────────────────────────────────────
  { slugContains: 'spinach',        data: { potSizeMinInch: 8,  potSizeMaxInch: 10, potVolumeLitres: 6,  potNotes: 'Shallow roots; wide tray or planter box works well', mix: 'vegLeafy' } },
  { slugContains: 'palak',          data: { potSizeMinInch: 8,  potSizeMaxInch: 10, potVolumeLitres: 6,  potNotes: 'Same as spinach; harvest outer leaves to extend crop', mix: 'vegLeafy' } },
  { slugContains: 'lettuce',        data: { potSizeMinInch: 8,  potSizeMaxInch: 10, potVolumeLitres: 6,  potNotes: 'Very shallow roots; window box or tray ideal; cool season only', mix: 'vegLeafy' } },
  { slugContains: 'pak-choi',       data: { potSizeMinInch: 8,  potSizeMaxInch: 10, potVolumeLitres: 6,  potNotes: '6-week harvest; cool season crop; keep soil moist', mix: 'vegLeafy' } },
  { slugContains: 'microgreen',     data: { potSizeMinInch: 6,  potSizeMaxInch: 8,  potVolumeLitres: 1,  potNotes: 'Shallow tray (5–6 cm deep); harvest at 7–14 days; no drainage tray needed if bottom-watered', mix: 'vegLeafy' } },
  { slugContains: 'wheatgrass',     data: { potSizeMinInch: 6,  potSizeMaxInch: 8,  potVolumeLitres: 1,  potNotes: 'Shallow tray; harvest at 7–10 days when 15–20 cm tall', mix: 'vegLeafy' } },

  // ── Fruits ──────────────────────────────────────────────────────────────────
  { slugContains: 'mango',          data: { potSizeMinInch: 18, potSizeMaxInch: 24, potVolumeLitres: 50, potNotes: 'Large barrel or 50 L grow bag; grafted dwarf variety fruits in 2–3 years; repot every 2 years', mix: 'fruit' } },
  { slugContains: 'lemon',          data: { potSizeMinInch: 14, potSizeMaxInch: 16, potVolumeLitres: 22, potNotes: 'Heavy when mature — ceramic/terracotta with wide base; repot every 2 years', mix: 'fruit' } },
  { slugContains: 'pomegranate',    data: { potSizeMinInch: 16, potSizeMaxInch: 18, potVolumeLitres: 30, potNotes: 'Dwarf variety works well in 16 inch pot; drought-tolerant once established', mix: 'fruit' } },
  { slugContains: 'guava',          data: { potSizeMinInch: 16, potSizeMaxInch: 18, potVolumeLitres: 30, potNotes: 'Dwarf variety preferred; prune to control height', mix: 'fruit' } },
  { slugContains: 'banana',         data: { potSizeMinInch: 18, potSizeMaxInch: 24, potVolumeLitres: 50, potNotes: 'Large grow bag or half-barrel; remove pups to keep manageable', mix: 'fruit' } },
  { slugContains: 'papaya',         data: { potSizeMinInch: 16, potSizeMaxInch: 18, potVolumeLitres: 30, potNotes: 'Fast growing; deep pot; protect from waterlogging (major killer)', mix: 'fruit' } },
  { slugContains: 'strawberry',     data: { potSizeMinInch: 6,  potSizeMaxInch: 8,  potVolumeLitres: 3,  potNotes: 'Strawberry tower, hanging basket, or individual 6 inch pots; runners produce new plants', mix: 'strawberry' } },

  // ── Medicinal ───────────────────────────────────────────────────────────────
  { slugContains: 'moringa',        data: { potSizeMinInch: 14, potSizeMaxInch: 16, potVolumeLitres: 22, potNotes: 'Deep pot for taproot; prune to 1 m for container growing; fast grower', mix: 'woodyHerb' } },

  // ── Fallback for unknown / skeletonfry ─────────────────────────────────────
  { slugContains: 'skeletonfry',    data: { potSizeMinInch: 8,  potSizeMaxInch: 10, potVolumeLitres: 6,  potNotes: null, mix: 'herb' } },
]

async function main() {
  console.log('🪴 Seeding pot size and soil composition data...\n')

  const plants = await prisma.plant.findMany({ select: { id: true, slug: true, name: true } })

  let updated = 0
  let skipped = 0

  for (const plant of plants) {
    // Find best match — most-specific slug substring match
    const match = PLANT_DATA.find(entry =>
      plant.slug.includes(entry.slugContains) ||
      plant.name.toLowerCase().includes(entry.slugContains.replace(/-/g, ' '))
    )

    if (!match) {
      console.log(`  ⚠️  no match: "${plant.name}" (${plant.slug})`)
      skipped++
      continue
    }

    const { data } = match
    const soilMix = MIX[data.mix]

    await prisma.plant.update({
      where: { id: plant.id },
      data: {
        potSizeMinInch:    data.potSizeMinInch,
        potSizeMaxInch:    data.potSizeMaxInch,
        potVolumeLitres:   data.potVolumeLitres,
        potNotes:          data.potNotes,
        soilCocoPeatPct:   soilMix.soilCocoPeatPct,
        soilGardenSoilPct: soilMix.soilGardenSoilPct,
        soilCompostPct:    soilMix.soilCompostPct,
        soilExtrasPct:     soilMix.soilExtrasPct ?? null,
        soilExtrasNote:    soilMix.soilExtrasNote ?? null,
      },
    })

    const size = `${data.potSizeMinInch}"–${data.potSizeMaxInch}"`
    const soil = `CP${soilMix.soilCocoPeatPct} GS${soilMix.soilGardenSoilPct} VC${soilMix.soilCompostPct}`
    console.log(`  ✅ "${plant.name}" → pot ${size}  |  soil ${soil}${soilMix.soilExtrasPct ? ` +${soilMix.soilExtrasPct}% ${soilMix.soilExtrasNote}` : ''}`)
    updated++
  }

  console.log(`\n✨ Done. Updated: ${updated}  Skipped: ${skipped}`)
  await prisma.$disconnect()
}

main().catch(e => { console.error(e); process.exit(1) })
