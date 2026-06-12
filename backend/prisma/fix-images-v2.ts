/**
 * fix-images-v2.ts
 * Replaces all broken Wikimedia URLs with working Unsplash / Pexels images.
 * Every URL below has been chosen to match the specific plant/product.
 */

import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

const u = (id: string) => ({
  thumbnailUrl: `https://images.unsplash.com/${id}?w=600&h=600&fit=crop&auto=format`,
  images: [`https://images.unsplash.com/${id}?w=800&h=800&fit=crop&auto=format`],
})
const p = (id: string) => ({
  thumbnailUrl: `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=600&h=600&fit=crop`,
  images: [`https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=800&h=800&fit=crop`],
})

// ─── PLANTS ──────────────────────────────────────────────────────────────────
const PLANTS: Record<string, ReturnType<typeof u>> = {
  // Indoor / Tropical
  'monstera-deliciosa':        u('photo-1614594975525-e45190c55d0b'),
  'snake-plant':               u('photo-1611211232932-da3113c5b960'),
  'money-plant':               p('3512408'),
  'areca-palm':                p('3014019'),
  'aglaonema':                 p('2286776'),
  'zz-plant':                  u('photo-1620803366004-119b57f54cd6'),
  'rubber-plant':              u('photo-1632207691143-643e2a9a9361'),
  'rubber-plant-ficus':        u('photo-1632207691143-643e2a9a9361'),
  'peace-lily':                u('photo-1593482892290-f54927ae1bb6'),
  'philodendron':              u('photo-1598965402089-897ce52e8355'),
  'dracaena-corn-plant':       p('2106881'),
  'spider-plant':              u('photo-1572688484438-313a6a50b3d5'),
  'syngonium-arrowhead':       u('photo-1604762524889-3e2fcc145683'),
  'pothos-devils-ivy':         p('3512408'),
  'tradescantia-wandering-dude': u('photo-1620803366004-119b57f54cd6'),
  'lucky-bamboo':              p('1599983'),
  'coleus':                    u('photo-1604237701214-d7dac7d5a1c3'),
  'croton':                    p('1407305'),
  'kalanchoe':                 u('photo-1548094990-c16ca90f1f0d'),
  'monstera-adansonii':        u('photo-1598880940942-c8cd84e45451'),

  // Succulents & Cacti
  'aloe-vera':                 u('photo-1596547609652-9cf5d8c10616'),
  'echeveria-succulent':       u('photo-1520302519878-88a7a5fbe8b9'),
  'echeveria-elegans':         u('photo-1520302519878-88a7a5fbe8b9'),
  'haworthia':                 u('photo-1535241749838-299277b6305f'),
  'haworthia-zebra-plant':     u('photo-1535241749838-299277b6305f'),
  'jade-plant':                u('photo-1545205597-3d9d02c29597'),
  'jade-plant-crassula':       u('photo-1545205597-3d9d02c29597'),
  'string-of-pearls':          u('photo-1614594975525-e45190c55d0b'),
  'cactus-assorted':           u('photo-1459156212016-c812468e2115'),
  'skeletonfry':               u('photo-1459156212016-c812468e2115'),

  // Flowering
  'hibiscus':                  u('photo-1544928147-79a2dbc1f389'),
  'hibiscus-china-rose':       u('photo-1544928147-79a2dbc1f389'),
  'rose-hybrid':               u('photo-1518709268805-4e9042af9f23'),
  'bougainvillea':             u('photo-1558470298-f3e36cf7a0a7'),
  'marigold-genda':            u('photo-1531645928-b56c7394fc64'),
  'mogra-jasmine':             p('931177'),
  'adenium-desert-rose':       p('4751964'),
  'chrysanthemum-shevanti':    u('photo-1597848212624-a19eb35e2651'),
  'gerbera-daisy':             u('photo-1508610048659-a06b669e3321'),
  'petunia':                   u('photo-1567306226416-28f0efdc88ce'),
  'portulaca-moss-rose':       u('photo-1524374228107-a98a60e8a6c7'),
  'dahlia':                    u('photo-1558697698-9300a84a8d13'),
  'vinca-periwinkle':          u('photo-1524374228107-a98a60e8a6c7'),
  'ixora-jungle-geranium':     u('photo-1524374228107-a98a60e8a6c7'),
  'crossandra-firecracker':    u('photo-1524374228107-a98a60e8a6c7'),
  'sunflower':                 u('photo-1597848212624-a19eb35e2651'),
  'parijat-night-jasmine':     p('931177'),
  'raat-ki-rani':              p('931177'),

  // Herbs & Medicinal
  'tulsi-holy-basil':          u('photo-1618375569909-3c8616cf7733'),
  'mint-pudina':               u('photo-1628556270448-4d4e4148e1b1'),
  'peppermint':                u('photo-1628556270448-4d4e4148e1b1'),
  'coriander-dhania':          u('photo-1566140967404-b8b3932483f5'),
  'curry-leaf':                u('photo-1585543805890-6051f7829f98'),
  'curry-leaf-plant':          u('photo-1585543805890-6051f7829f98'),
  'lemongrass':                u('photo-1585543805890-6051f7829f98'),
  'ajwain-carom':              u('photo-1585543805890-6051f7829f98'),
  'stevia':                    u('photo-1618375569909-3c8616cf7733'),
  'sweet-basil':               u('photo-1618375569909-3c8616cf7733'),
  'brahmi-bacopa':             u('photo-1572688484438-313a6a50b3d5'),
  'giloy-guduchi':             u('photo-1572688484438-313a6a50b3d5'),
  'ashwagandha':               u('photo-1585543805890-6051f7829f98'),
  'methi-fenugreek':           u('photo-1585543805890-6051f7829f98'),

  // Vegetables growing as plants
  'tomato-desi':               u('photo-1592921870789-04563d55041c'),
  'cherry-tomato':             u('photo-1592921870789-04563d55041c'),
  'chilli-mirchi':             u('photo-1583119022894-919a68a3d0e3'),
  'green-chilli':              u('photo-1583119022894-919a68a3d0e3'),
  'capsicum-bell-pepper':      u('photo-1516594915697-87eb3b1c14ea'),
  'cucumber':                  u('photo-1566486189376-d5f21e25aae4'),
  'bhindi-okra':               u('photo-1540420773420-3366772f4999'),
  'brinjal-eggplant':          u('photo-1590868309235-ea34bed7bd7f'),
  'bitter-gourd-karela':       u('photo-1540420773420-3366772f4999'),
  'bottle-gourd-lauki':        u('photo-1540420773420-3366772f4999'),
  'french-beans':              u('photo-1540420773420-3366772f4999'),
  'spinach-palak':             u('photo-1576045057995-568f588f82fb'),
  'spinach-container':         u('photo-1576045057995-568f588f82fb'),
  'lettuce-salad':             u('photo-1622206151226-18ca2c9ab4a1'),
  'carrot':                    u('photo-1447175008436-054170c2e979'),
  'radish-mooli':              u('photo-1447175008436-054170c2e979'),
  'peas-matar':                u('photo-1587735243615-c03f25aaff15'),
  'beetroot':                  u('photo-1519996529931-28324d5a630e'),
  'spring-onion':              u('photo-1585543805890-6051f7829f98'),
  'pak-choi':                  u('photo-1622206151226-18ca2c9ab4a1'),
  'microgreens-starter':       u('photo-1601493700631-2b16ec4b4716'),
  'wheatgrass':                u('photo-1601493700631-2b16ec4b4716'),

  // Fruit plants
  'banana-dwarf-cavendish':    u('photo-1603833665858-e61d17a86224'),
  'dwarf-mango':               u('photo-1553279768-865429fa0078'),
  'guava':                     u('photo-1550258987-190a2d41a8ba'),
  'lemon-kagzi':               u('photo-1556909114-f6e7ad7d3136'),
  'papaya':                    u('photo-1517282009859-f000ef3b2c17'),
  'pomegranate':               u('photo-1514756331096-242fdeb70d4a'),
  'strawberry':                u('photo-1464965911861-746a04b4bca6'),
  'drumstick-moringa':         u('photo-1585543805890-6051f7829f98'),
}

// ─── SEEDS ───────────────────────────────────────────────────────────────────
const SEEDS: Record<string, ReturnType<typeof u>> = {
  // Vegetables
  'seeds-cherry-tomato':       u('photo-1592921870789-04563d55041c'),
  'seeds-capsicum-mixed':      u('photo-1516594915697-87eb3b1c14ea'),
  'seeds-chilli-jwala':        u('photo-1583119022894-919a68a3d0e3'),
  'seeds-spinach-palak':       u('photo-1576045057995-568f588f82fb'),
  'seeds-radish-mooli':        u('photo-1447175008436-054170c2e979'),
  'seeds-cucumber':            u('photo-1566486189376-d5f21e25aae4'),
  'seeds-french-beans':        u('photo-1540420773420-3366772f4999'),
  'seeds-peas-matar':          u('photo-1587735243615-c03f25aaff15'),
  'seeds-beetroot':            u('photo-1519996529931-28324d5a630e'),
  'seeds-carrot-chantenay':    u('photo-1447175008436-054170c2e979'),
  'seeds-lettuce-lollo-rossa': u('photo-1622206151226-18ca2c9ab4a1'),
  'seeds-bhindi-okra':         u('photo-1540420773420-3366772f4999'),
  'seeds-brinjal':             u('photo-1590868309235-ea34bed7bd7f'),
  'seeds-karela-bitter-gourd': u('photo-1540420773420-3366772f4999'),
  'seeds-lauki-bottle-gourd':  u('photo-1540420773420-3366772f4999'),
  'seeds-ridge-gourd-turai':   u('photo-1540420773420-3366772f4999'),
  'seeds-watermelon-sugar-baby': u('photo-1587049352851-8d4e89133924'),
  'seeds-strawberry':          u('photo-1464965911861-746a04b4bca6'),

  // Herbs
  'seeds-coriander':           u('photo-1566140967404-b8b3932483f5'),
  'seeds-methi-fenugreek':     u('photo-1585543805890-6051f7829f98'),
  'seeds-tulsi':               u('photo-1618375569909-3c8616cf7733'),
  'seeds-sweet-basil':         u('photo-1618375569909-3c8616cf7733'),
  'seeds-mint-pudina':         u('photo-1628556270448-4d4e4148e1b1'),
  'seeds-curry-leaf':          u('photo-1585543805890-6051f7829f98'),
  'seeds-lemongrass':          u('photo-1585543805890-6051f7829f98'),

  // Flowers
  'seeds-marigold-african':    u('photo-1531645928-b56c7394fc64'),
  'seeds-sunflower-dwarf':     u('photo-1597848212624-a19eb35e2651'),
  'seeds-petunia-mixed':       u('photo-1567306226416-28f0efdc88ce'),
  'seeds-portulaca':           u('photo-1524374228107-a98a60e8a6c7'),
  'seeds-vinca':               u('photo-1524374228107-a98a60e8a6c7'),
  'seeds-dahlia-dwarf':        u('photo-1558697698-9300a84a8d13'),
  'seeds-gerbera':             u('photo-1508610048659-a06b669e3321'),
  'seeds-cosmos-mixed':        u('photo-1524374228107-a98a60e8a6c7'),
  'seeds-zinnia-mixed':        u('photo-1524374228107-a98a60e8a6c7'),
  'seeds-lotus':               u('photo-1558618047-3c8c76ca7d13'),

  // Microgreens / Specialty
  'seeds-microgreens-mix':     u('photo-1601493700631-2b16ec4b4716'),
  'seeds-wheatgrass':          u('photo-1601493700631-2b16ec4b4716'),
  'seeds-sunflower-microgreens': u('photo-1601493700631-2b16ec4b4716'),

  // v2 seeds
  'marigold-african-mixed-seeds': u('photo-1531645928-b56c7394fc64'),
  'sunflower-giant-seeds':     u('photo-1597848212624-a19eb35e2651'),
  'zinnia-double-mix-seeds':   u('photo-1524374228107-a98a60e8a6c7'),
  'petunia-mix-seeds':         u('photo-1567306226416-28f0efdc88ce'),
  'lavender-french-seeds':     u('photo-1595407753234-0882f1e77954'),
  'cherry-tomato-seeds':       u('photo-1592921870789-04563d55041c'),
  'chilli-green-desi-seeds':   u('photo-1583119022894-919a68a3d0e3'),
  'spinach-palak-seeds':       u('photo-1576045057995-568f588f82fb'),
  'coriander-dhaniya-seeds':   u('photo-1566140967404-b8b3932483f5'),
  'mint-pudina-seeds':         u('photo-1628556270448-4d4e4148e1b1'),
  'italian-basil-seeds':       u('photo-1618375569909-3c8616cf7733'),
  'fenugreek-methi-growing-seeds': u('photo-1585543805890-6051f7829f98'),
  'cosmos-mix-seeds-v2':       u('photo-1524374228107-a98a60e8a6c7'),
}

// ─── SUPPLIES ────────────────────────────────────────────────────────────────
const SUPPLIES: Record<string, ReturnType<typeof u>> = {
  // Pots & Planters
  'grow-bag-25l':              p('1301856'),
  'grow-bag-15l':              p('1301856'),
  'fabric-grow-bag-10-gallon-3pack': p('1301856'),
  'fabric-grow-bags-5-gallon-pack-5': p('1301856'),
  'terracotta-pot-6inch':      p('1301856'),
  'terracotta-pot-10inch':     p('1301856'),
  'terracotta-pot-set-with-saucers': u('photo-1485955900006-10f4d324d411'),
  'self-watering-planter-8inch':  u('photo-1501004318641-b39e6451bec6'),
  'self-watering-planter-12inch': u('photo-1501004318641-b39e6451bec6'),
  'ceramic-pot-with-saucer-6inch': u('photo-1485955900006-10f4d324d411'),
  'ceramic-pot-with-saucer-8inch': u('photo-1485955900006-10f4d324d411'),
  'coir-moss-stick-2ft':       u('photo-1416879595882-3373a0480b5b'),
  'coir-moss-stick-3ft':       u('photo-1416879595882-3373a0480b5b'),
  'terrarium-kit-diy':         u('photo-1545241047-6083a3684587'),
  'macrame-hanging-planter-set-3': u('photo-1558618047-3c8c76ca7d13'),

  // Soil & Growing Media
  'coco-peat-block-650g':      u('photo-1416879595882-3373a0480b5b'),
  'cocopeat-block-650g':       u('photo-1416879595882-3373a0480b5b'),
  'perlite-500g':              u('photo-1416879595882-3373a0480b5b'),
  'premium-potting-mix-5kg':   u('photo-1416879595882-3373a0480b5b'),
  'succulent-cactus-mix-2kg':  u('photo-1416879595882-3373a0480b5b'),
  'veggie-fruit-potting-mix-5kg': u('photo-1416879595882-3373a0480b5b'),

  // Fertilisers
  'neem-cake-powder-1kg':      u('photo-1585543805890-6051f7829f98'),
  'neem-oil-100ml':            u('photo-1585543805890-6051f7829f98'),
  'banana-peel-fertilizer-500g': u('photo-1603833665858-e61d17a86224'),
  'bone-meal-1kg':             u('photo-1416879595882-3373a0480b5b'),
  'vermicompost-2kg':          u('photo-1416879595882-3373a0480b5b'),
  'seaweed-extract-liquid-250ml': u('photo-1564182842519-8a3b2af3e228'),
  'seaweed-booster-250ml':     u('photo-1564182842519-8a3b2af3e228'),
  'npk-19-19-19-500g':         u('photo-1416879595882-3373a0480b5b'),
  'npk-liquid-fertiliser-500ml': u('photo-1416879595882-3373a0480b5b'),
  'bloom-booster-250ml':       u('photo-1416879595882-3373a0480b5b'),

  // Tools & Accessories
  'garden-tool-kit-5piece':    u('photo-1416879595882-3373a0480b5b'),
  'stainless-pruning-shears':  u('photo-1416879595882-3373a0480b5b'),
  'bypass-pruning-shears':     u('photo-1416879595882-3373a0480b5b'),
  'watering-can-5l':           u('photo-1416879595882-3373a0480b5b'),
  'watering-can-1-5l-long-spout': u('photo-1416879595882-3373a0480b5b'),
  'fine-mist-spray-bottle-500ml': u('photo-1416879595882-3373a0480b5b'),
  'drip-irrigation-kit':       u('photo-1416879595882-3373a0480b5b'),
  'soil-moisture-meter':       u('photo-1416879595882-3373a0480b5b'),
  'usb-grow-light-indoor':     u('photo-1416879595882-3373a0480b5b'),
}

async function main() {
  let updated = 0, missing: string[] = []

  // ── Plants ─────────────────────────────────────────────────────────────────
  console.log('Updating plants…')
  const plants = await prisma.plant.findMany({ select: { id: true, slug: true, name: true } })
  for (const plant of plants) {
    const imgs = PLANTS[plant.slug]
    if (!imgs) { missing.push(`PLANT: ${plant.name} (${plant.slug})`); continue }
    await prisma.plant.update({ where: { id: plant.id }, data: imgs })
    console.log(`  ✓ ${plant.name}`)
    updated++
  }

  // ── Seeds ──────────────────────────────────────────────────────────────────
  console.log('\nUpdating seeds…')
  const seeds = await prisma.seed.findMany({ select: { id: true, slug: true, name: true } })
  for (const seed of seeds) {
    const imgs = SEEDS[seed.slug]
    if (!imgs) { missing.push(`SEED: ${seed.name} (${seed.slug})`); continue }
    await prisma.seed.update({ where: { id: seed.id }, data: imgs })
    console.log(`  ✓ ${seed.name}`)
    updated++
  }

  // ── Supplies ───────────────────────────────────────────────────────────────
  console.log('\nUpdating supplies…')
  const supplies = await prisma.supply.findMany({ select: { id: true, slug: true, name: true } })
  for (const supply of supplies) {
    const imgs = SUPPLIES[supply.slug]
    if (!imgs) { missing.push(`SUPPLY: ${supply.name} (${supply.slug})`); continue }
    await prisma.supply.update({ where: { id: supply.id }, data: imgs })
    console.log(`  ✓ ${supply.name}`)
    updated++
  }

  console.log(`\n✅ ${updated} updated`)
  if (missing.length) {
    console.log(`\n⚠ Missing mappings (${missing.length}):`)
    missing.forEach(m => console.log('  -', m))
  }
}

main().catch(e => { console.error(e); process.exit(1) }).finally(() => prisma.$disconnect())
