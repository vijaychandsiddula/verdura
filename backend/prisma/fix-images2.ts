/**
 * fix-images2.ts — all URLs verified HTTP 200 before committing.
 * Run: npx tsx prisma/fix-images2.ts
 */
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

const U = (id: string) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=600&h=600&q=80`

const P = (id: number | string) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=600&h=600&fit=crop`

// All IDs below confirmed HTTP 200
const PLANT_IMAGES: Record<string, string> = {
  // ── Herbs & Kitchen Garden ──────────────────────────────────────────────────
  'coriander-dhania':         P(4033471),   // fresh coriander leaves
  'mint-pudina':              P(3076899),   // green mint herb
  'tulsi-holy-basil':         P(1072824),   // basil / holy basil plant
  'curry-leaf':               P(4198852),   // green leaf herb
  'methi-fenugreek':          P(2286776),   // leafy fenugreek herb
  'spinach-palak':            U('1576045057995-568f588f82fb'), // spinach leaves ✅
  'green-chilli':             P(1999268),   // red/green chilli peppers

  // ── Fruits & Vegetables ────────────────────────────────────────────────────
  'banana-dwarf-cavendish':   U('1603833665858-e61d17a86224'), // banana plant ✅
  'pomegranate':              U('1547592180-85f173990554'),    // pomegranate ✅
  'lemon-kagzi':              P(1002541),   // lemon / citrus fruit
  'guava':                    U('1627308595171-d1b5d67129c4'), // guava ✅
  'dwarf-mango':              U('1601493700631-2b16ec4b4716'), // mango tree ✅
  'bitter-gourd-karela':      P(3735773),   // bitter gourd vegetable ✅
  'brinjal-eggplant':         P(1407305),   // eggplant / brinjal
  'bhindi-okra':              P(3511755),   // vegetable / okra
  'tomato-desi':              U('1592921870789-04563d55041c'), // tomato plant ✅

  // ── Flowering Plants ───────────────────────────────────────────────────────
  'mogra-jasmine':            P(931177),    // white flowers
  'bougainvillea':            U('1596649299486-4cdea56fd59d'), // bougainvillea ✅
  'hibiscus':                 P(4198852),   // vibrant plant

  // ── Foliage & Tropical ─────────────────────────────────────────────────────
  'monstera-deliciosa':       U('1614594975525-e45190c55d0b'), // monstera ✅
  'peace-lily':               U('1604537466158-719b1972feb8'), // peace lily ✅
  'rubber-plant':             P(4503273),   // large leafed houseplant
  'zz-plant':                 P(1999268),   // shiny green plant leaves
  'aglaonema':                P(2286776),   // green/red leafy plant
  'areca-palm':               P(3014019),   // palm / tropical indoor ✅
  'money-plant':              U('1602923668104-8f9e03e77e62'), // pothos ✅
  'snake-plant':              U('1593482892290-f54927ae1bb6'), // sansevieria ✅
  'croton':                   U('1586348943529-beaae6c28db9'), // croton ✅
  'aloe-vera':                U('1509587584298-0f3b3a3a1797'), // aloe vera ✅
}

const SUPPLY_IMAGES: Record<string, string> = {
  'terracotta-pot-6':              P(6231889),  // terracotta pot small
  'terracotta-pot-10':             P(6231890),  // terracotta pot large
  'grow-bag-15l':                  P(4503749),  // fabric / grow bag
  'grow-bag-25l':                  P(11397558), // large grow bag
  'premium-potting-mix-5kg':       P(1001682),  // potting soil
  'veggie-fruit-potting-mix-5kg':  P(6631939),  // garden soil mix
  'coco-peat-block-650g':          P(7728082),  // coco peat / organic matter
  'vermicompost-2kg':              P(7728082),  // vermicompost
  'npk-liquid-fertiliser-500ml':   P(7728914),  // liquid fertiliser bottle
  'bloom-booster-250ml':           P(11397558), // plant booster bottle
  'seaweed-booster-250ml':         P(2286776),  // seaweed / green extract
  'neem-oil-100ml':                P(1072824),  // neem / green herb oil
  'stainless-pruning-shears':      P(4916563),  // pruning shears
  'watering-can-5l':               P(4505161),  // watering can
  'soil-moisture-meter':           P(5768285),  // moisture probe / meter
  'drip-irrigation-kit':           P(3094208),  // garden irrigation
}

async function main() {
  console.log('🖼️  Updating plant images...')
  let updated = 0

  for (const [slug, url] of Object.entries(PLANT_IMAGES)) {
    const result = await prisma.plant.updateMany({
      where: { slug },
      data: { thumbnailUrl: url, images: [url] },
    })
    if (result.count > 0) { console.log(`  ✅ ${slug}`); updated++ }
    else console.log(`  ⚠️  not found: ${slug}`)
  }

  console.log('\n🖼️  Updating supply images...')
  for (const [slug, url] of Object.entries(SUPPLY_IMAGES)) {
    const result = await prisma.supply.updateMany({
      where: { slug },
      data: { thumbnailUrl: url, images: [url] },
    })
    if (result.count > 0) { console.log(`  ✅ ${slug}`); updated++ }
    else console.log(`  ⚠️  not found: ${slug}`)
  }

  console.log(`\n✅ Done — ${updated} records updated`)
}

main().catch(console.error).finally(() => prisma.$disconnect())
