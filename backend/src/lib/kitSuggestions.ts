/**
 * kitSuggestions.ts
 *
 * Given a plant's pot + soil data and categories, returns an ordered list of
 * supply items the customer needs to buy, with exact quantities calculated
 * from the pot volume and soil percentages.
 *
 * Rules:
 *  • Pot    → match closest available size from supply catalogue
 *  • Soil   → calculate kg/L needed from potVolumeLitres × each soil %
 *  • Fert   → choose by plant category (succulent vs herb vs fruiting etc.)
 *  • Always include at least: pot, coco peat, potting mix, and one fertiliser
 */

export interface KitItem {
  slug:          string
  name:          string
  role:          string          // e.g. "Pot", "Coco peat", "Fertiliser"
  qty:           number          // number of units to buy
  unit:          string          // "pack", "bag", "bottle" …
  exactNote:     string          // e.g. "1 block gives ~8 L when expanded"
  priority:      'essential' | 'recommended' | 'optional'
  price:         number
  thumbnailUrl?: string
}

interface PlantLike {
  categories:       string[]
  potSizeMinInch?:  number | null
  potSizeMaxInch?:  number | null
  potVolumeLitres?: number | null
  soilCocoPeatPct?: number | null
  soilGardenSoilPct?: number | null
  soilCompostPct?:  number | null
  soilExtrasPct?:   number | null
  soilExtrasNote?:  string | null
}

// ── Supply catalogue (subset we can recommend) ────────────────────────────────
// Each entry: slug → metadata. Prices/names must match what's in the DB.
const SUPPLY = {
  // Pots
  'terracotta-pot-6':             { name: 'Terracotta Pot 6"',              price: 89,  unit: 'pot'   },
  'terracotta-pot-10':            { name: 'Terracotta Pot 10"',             price: 169, unit: 'pot'   },
  'terracotta-pot-set-with-saucers': { name: 'Terracotta Pot Set (4"+6"+8")', price: 299, unit: 'set' },
  'ceramic-pot-with-saucer-6inch': { name: 'Ceramic Pot with Saucer 6"',   price: 349, unit: 'pot'   },
  'ceramic-pot-with-saucer-8inch': { name: 'Ceramic Pot with Saucer 8"',   price: 499, unit: 'pot'   },
  'grow-bag-15l':                  { name: 'Grow Bag 15 L',                 price: 129, unit: 'bag'   },
  'grow-bag-25l':                  { name: 'Grow Bag 25 L',                 price: 199, unit: 'bag'   },
  'fabric-grow-bags-5-gallon-pack-5': { name: 'Fabric Grow Bags 5 Gal (×5)', price: 249, unit: 'pack' },
  'fabric-grow-bag-10-gallon-3pack':  { name: 'Fabric Grow Bag 10 Gal (×3)', price: 299, unit: 'pack' },
  'self-watering-planter-8inch':  { name: 'Self-Watering Planter 8"',      price: 499, unit: 'pot'   },
  'self-watering-planter-12inch': { name: 'Self-Watering Planter 12"',     price: 699, unit: 'pot'   },
  // Soil
  'coco-peat-block-650g':         { name: 'Coco Peat Block 650 g',         price: 79,  unit: 'block' },
  'cocopeat-block-650g':          { name: 'Cocopeat Block 650 g',          price: 99,  unit: 'block' },
  'premium-potting-mix-5kg':      { name: 'Premium Potting Mix 5 kg',      price: 199, unit: 'bag'   },
  'veggie-fruit-potting-mix-5kg': { name: 'Veggie & Fruit Potting Mix 5 kg', price: 249, unit: 'bag' },
  'succulent-cactus-mix-2kg':     { name: 'Succulent & Cactus Mix 2 kg',   price: 179, unit: 'bag'   },
  'perlite-500g':                 { name: 'Perlite 500 g',                 price: 79,  unit: 'bag'   },
  // Fertilisers
  'vermicompost-2kg':             { name: 'Vermicompost 2 kg',             price: 149, unit: 'bag'   },
  'npk-liquid-fertiliser-500ml':  { name: 'NPK Liquid Fertiliser 500 ml', price: 159, unit: 'bottle'},
  'npk-19-19-19-500g':            { name: 'NPK 19-19-19 Fertilizer 500 g',price: 129, unit: 'bag'   },
  'bloom-booster-250ml':          { name: 'Bloom Booster 250 ml',         price: 199, unit: 'bottle'},
  'seaweed-booster-250ml':        { name: 'Seaweed Growth Booster 250 ml',price: 219, unit: 'bottle'},
  'seaweed-extract-liquid-250ml': { name: 'Seaweed Extract Liquid 250 ml',price: 199, unit: 'bottle'},
  'bone-meal-1kg':                { name: 'Bone Meal 1 kg',               price: 179, unit: 'bag'   },
  'banana-peel-fertilizer-500g':  { name: 'Banana Peel Fertilizer 500 g', price: 149, unit: 'bag'   },
  'neem-cake-powder-1kg':         { name: 'Neem Cake Powder 1 kg',        price: 199, unit: 'bag'   },
  'neem-oil-100ml':               { name: 'Neem Oil 100 ml',              price: 129, unit: 'bottle'},
} as const

type SupplySlug = keyof typeof SUPPLY

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Litres one 650g coco-peat block expands to */
const COPEAT_BLOCK_LITRES = 8.5

/** Litres a 5kg potting mix bag contains */
const MIX_5KG_LITRES = 9

/** Litres a 2kg vermicompost bag contains */
const VERMI_2KG_LITRES = 3

function ceil1(n: number) { return Math.max(1, Math.ceil(n)) }

function potForSize(minInch: number, maxInch: number, cats: string[]): SupplySlug {
  const isShrub  = cats.includes('outdoor') && (cats.includes('flowering') || cats.includes('fruit'))
  const isVeg    = cats.includes('vegetable')
  const isLeafy  = cats.includes('herb')

  if (minInch <= 4)  return 'terracotta-pot-6'
  if (minInch <= 6)  return 'terracotta-pot-6'
  if (minInch <= 8)  {
    if (cats.includes('succulent')) return 'ceramic-pot-with-saucer-6inch'
    return 'terracotta-pot-10'
  }
  if (minInch <= 10) return 'terracotta-pot-10'
  if (minInch <= 12) {
    if (isVeg)    return 'grow-bag-15l'
    if (isLeafy)  return 'terracotta-pot-10'
    return 'ceramic-pot-with-saucer-8inch'
  }
  if (minInch <= 14) return isVeg || isShrub ? 'grow-bag-25l' : 'self-watering-planter-12inch'
  if (minInch <= 16) return 'grow-bag-25l'
  return 'fabric-grow-bag-10-gallon-3pack'   // 18"+ — large fruit/banana
}

// ── Main export ───────────────────────────────────────────────────────────────

export function buildKitSlugs(plant: PlantLike): {
  slug: SupplySlug
  qty: number
  role: string
  exactNote: string
  priority: 'essential' | 'recommended' | 'optional'
}[] {
  const cats = plant.categories ?? []
  const vol  = plant.potVolumeLitres ?? 8      // fallback 8 L
  const cpPct  = (plant.soilCocoPeatPct ?? 35) / 100
  const gsPct  = (plant.soilGardenSoilPct ?? 40) / 100
  const vcPct  = (plant.soilCompostPct ?? 25) / 100
  const exPct  = (plant.soilExtrasPct ?? 0) / 100
  const minIn  = plant.potSizeMinInch ?? 8
  const maxIn  = plant.potSizeMaxInch ?? 10

  const isSucculent = cats.includes('succulent')
  const isVeg       = cats.includes('vegetable')
  const isFruit     = cats.includes('fruit')
  const isFlower    = cats.includes('flowering')
  const isHerb      = cats.includes('herb')
  const isTropical  = cats.includes('tropical') || cats.includes('indoor')

  const items: ReturnType<typeof buildKitSlugs> = []

  // ── 1. POT ────────────────────────────────────────────────────────────────
  const potSlug = potForSize(minIn, maxIn, cats)
  items.push({
    slug:      potSlug,
    qty:       1,
    role:      'Pot',
    exactNote: `${minIn}"–${maxIn}" diameter, ${vol} L capacity — right size for this plant`,
    priority:  'essential',
  })

  // ── 2. COCO PEAT ─────────────────────────────────────────────────────────
  if (!isSucculent) {
    const cpLitres  = vol * cpPct
    const cpBlocks  = ceil1(cpLitres / COPEAT_BLOCK_LITRES)
    items.push({
      slug:      'coco-peat-block-650g',
      qty:       cpBlocks,
      role:      'Coco peat',
      exactNote: `Need ~${cpLitres.toFixed(1)} L — 1 block expands to ~8.5 L when soaked`,
      priority:  'essential',
    })
  }

  // ── 3. POTTING MIX / SOIL ─────────────────────────────────────────────────
  if (isSucculent) {
    // Succulents use a pre-made gritty mix
    const mixNeeded = vol
    const mixBags   = ceil1(mixNeeded / 4)   // 2kg bag ≈ 4L
    items.push({
      slug:      'succulent-cactus-mix-2kg',
      qty:       mixBags,
      role:      'Succulent & cactus mix',
      exactNote: `${mixNeeded.toFixed(0)} L of fast-draining mix needed — prevents root rot`,
      priority:  'essential',
    })
    if (exPct > 0) {
      items.push({
        slug:      'perlite-500g',
        qty:       1,
        role:      'Perlite',
        exactNote: `Add ${Math.round(vol * exPct)} L perlite for extra drainage`,
        priority:  'recommended',
      })
    }
  } else {
    const soilSlug: SupplySlug = (isVeg || isFruit) ? 'veggie-fruit-potting-mix-5kg' : 'premium-potting-mix-5kg'
    const gsLitres  = vol * gsPct
    const mixBags   = ceil1(gsLitres / MIX_5KG_LITRES)
    items.push({
      slug:      soilSlug,
      qty:       mixBags,
      role:      'Potting mix',
      exactNote: `Need ~${gsLitres.toFixed(1)} L — one 5 kg bag covers ~9 L`,
      priority:  'essential',
    })
  }

  // ── 4. COMPOST / VERMICOMPOST ─────────────────────────────────────────────
  if (!isSucculent) {
    const vcLitres = vol * vcPct
    const vcBags   = ceil1(vcLitres / VERMI_2KG_LITRES)
    items.push({
      slug:      'vermicompost-2kg',
      qty:       vcBags,
      role:      'Vermicompost',
      exactNote: `Mix in ~${vcLitres.toFixed(1)} L (${Math.round(vcPct * 100)}% of pot volume) as slow-release nutrition`,
      priority:  'essential',
    })
  }

  // ── 5. FERTILISER — category-specific ────────────────────────────────────
  if (isSucculent) {
    items.push({
      slug:      'neem-oil-100ml',
      qty:       1,
      role:      'Pest protection',
      exactNote: 'Dilute 5 ml per litre of water; spray monthly to prevent mealy bugs',
      priority:  'recommended',
    })
  } else if (isFlower) {
    items.push({
      slug:      'bloom-booster-250ml',
      qty:       1,
      role:      'Bloom booster',
      exactNote: 'Apply 5 ml per litre every 2 weeks during bud formation for denser blooms',
      priority:  'recommended',
    })
    items.push({
      slug:      'bone-meal-1kg',
      qty:       1,
      role:      'Phosphorus source',
      exactNote: `Sprinkle ${Math.round(vol * 15)}g into soil at planting — boosts root strength & flower set`,
      priority:  'recommended',
    })
  } else if (isVeg || isFruit) {
    items.push({
      slug:      'npk-liquid-fertiliser-500ml',
      qty:       1,
      role:      'NPK liquid fertiliser',
      exactNote: 'Apply 5 ml per litre every 10 days; switch to high-K formula when fruiting starts',
      priority:  'recommended',
    })
    items.push({
      slug:      'seaweed-booster-250ml',
      qty:       1,
      role:      'Seaweed growth booster',
      exactNote: 'Foliar spray 3 ml per litre every 3 weeks — boosts cell strength and yield',
      priority:  'optional',
    })
  } else if (isHerb) {
    items.push({
      slug:      'seaweed-extract-liquid-250ml',
      qty:       1,
      role:      'Seaweed extract',
      exactNote: 'Dilute 3 ml per litre; apply monthly — herbs respond well to gentle organic feed',
      priority:  'recommended',
    })
    items.push({
      slug:      'neem-cake-powder-1kg',
      qty:       1,
      role:      'Neem cake',
      exactNote: `Mix ${Math.round(vol * 10)}g into topsoil at potting; replenish every 60 days`,
      priority:  'optional',
    })
  } else if (isTropical) {
    items.push({
      slug:      'npk-liquid-fertiliser-500ml',
      qty:       1,
      role:      'NPK liquid fertiliser',
      exactNote: 'Feed 5 ml per litre every 2–3 weeks in growing season (Mar–Oct); skip in winter',
      priority:  'recommended',
    })
    items.push({
      slug:      'banana-peel-fertilizer-500g',
      qty:       1,
      role:      'Potassium supplement',
      exactNote: 'Sprinkle 1 tbsp on soil monthly; rich in K for lush foliage',
      priority:  'optional',
    })
  } else {
    // Generic fallback
    items.push({
      slug:      'npk-19-19-19-500g',
      qty:       1,
      role:      'Balanced NPK fertiliser',
      exactNote: `Dissolve ${Math.round(vol * 2)}g per litre of water; apply every 3–4 weeks`,
      priority:  'recommended',
    })
  }

  // ── 6. NEEM CAKE — pest prevention for vegs/fruits ───────────────────────
  if (isVeg || isFruit) {
    items.push({
      slug:      'neem-cake-powder-1kg',
      qty:       1,
      role:      'Soil pest defence',
      exactNote: `Mix ${Math.round(vol * 10)}g into potting mix before planting — repels soil pests`,
      priority:  'optional',
    })
  }

  return items
}

/**
 * Enrich kit items with supply data fetched from DB.
 * Returns only items whose slugs exist in the DB.
 */
export async function getKitForPlant(
  plant: PlantLike,
  prisma: { supply: { findMany: (args: object) => Promise<{ id: string; slug: string; name: string; price: number; thumbnailUrl: string }[]> } }
) {
  const rawItems = buildKitSlugs(plant)
  const slugs    = [...new Set(rawItems.map(i => i.slug))]

  const supplies = await prisma.supply.findMany({
    where:  { slug: { in: slugs }, isActive: true },
    select: { id: true, slug: true, name: true, price: true, thumbnailUrl: true },
  })

  const supplyMap = new Map(supplies.map(s => [s.slug, s]))

  const kit: KitItem[] = rawItems
    .map(item => {
      const dbRow = supplyMap.get(item.slug)
      if (!dbRow) return null
      return {
        slug:        dbRow.slug,
        name:        dbRow.name,
        role:        item.role,
        qty:         item.qty,
        unit:        SUPPLY[item.slug as SupplySlug]?.unit ?? 'unit',
        exactNote:   item.exactNote,
        priority:    item.priority,
        price:       dbRow.price * item.qty,
        thumbnailUrl: dbRow.thumbnailUrl,
      } as KitItem
    })
    .filter((x): x is KitItem => x !== null)

  const kitTotal = kit.reduce((sum, i) => sum + i.price, 0)

  return { kit, kitTotal }
}
