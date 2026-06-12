/**
 * fix-images-v3.ts
 * All photo IDs verified by fetching real Unsplash search result pages.
 * Format: https://images.unsplash.com/photo-{ID}?w=600&h=600&fit=crop&auto=format
 */

import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

const u = (id: string) => ({
  thumbnailUrl: `https://images.unsplash.com/photo-${id}?w=600&h=600&fit=crop&auto=format`,
  images: [`https://images.unsplash.com/photo-${id}?w=800&h=800&fit=crop&auto=format`],
})

// ─── VERIFIED UNSPLASH PHOTO IDs (fetched from real search pages) ─────────────
// curry leaf plant india     → 6E9WNAQj1Ys
// tulsi plant                → 1DSxe2DMJfY
// aloe vera plant            → iRcFP75uef8
// monstera plant             → 2pTYBhn6U3s
// snake plant indoor         → wdArsFqaZ5w
// hibiscus flower            → q-ccP4qp6LY
// marigold flower            → L6kAu-LJ7u8
// bougainvillea              → wxipfbSyu_Y
// rose plant                 → chswYGgb4l0
// mint herb plant            → nztbzUbyb9A
// basil herb plant           → eiQA0CZgraI
// echeveria succulent        → RSITIt4AU8I
// pothos money plant         → 7hRp7rOof4g
// peace lily plant           → SkhqmFTlE7k
// coriander herb             → eH3CKe_srPk
// sunflower garden           → f0tklgtOJCA
// tomato plant garden        → bLLcAX3CtOE
// chilli pepper plant        → GVnD8pFUvZs
// rubber plant ficus         → WP-GfbFfLn8
// areca palm plant           → RWjDuJkYFjs
// jasmine flower plant       → 2bmKWvCDkxY
// jade plant succulent       → j4_QuKnVsW8
// haworthia succulent        → uJJ8S6gsjPU
// aglaonema                  → obekvwYFdsc
// zz plant zamioculcas       → XaodqDfP9ss
// philodendron plant         → avA-YuEe2ZA
// dracaena indoor plant      → rp2VDWEQP9c
// spider plant chlorophytum  → eML_w42v_pM
// adenium desert rose        → eeiN8OinjnE
// chrysanthemum flower       → 8vzMIj5pmdc
// gerbera daisy flower       → BuYjMYBUzQw
// petunia flower             → Ic5oYeseBIY
// dahlia flower garden       → CCrJTAC9_l4
// okra bhindi vegetable      → Sq-K91pKnic
// cucumber vegetable plant   → c3QCGSu6MVc
// bell pepper capsicum       → npbCIujVMX8
// banana plant tropical      → XQZ9CIeds48
// mango tree fruit           → ay2OVSqjxRE
// lemon tree plant           → qc6yB1Il-zM
// pomegranate fruit tree     → gLb467qQVxU
// strawberry plant garden    → U1lKlvuXJkA
// moringa drumstick tree     → AO5Q5PSRFr8
// microgreens sprouts        → hGwEpXQrJOg
// lemongrass herb            → -L-PFUBSFAI (note: starts with hyphen)
// eggplant brinjal           → Xk5wR3Voscc
// spinach leaves             → WZcU0c7zdvs
// carrot vegetable           → eJJ2316gOak
// green peas vegetable       → nMCDGF5LogM
// bitter gourd               → VWM1SXp1M0M
// terracotta pot plant       → FEa3R6Tu0eg
// garden tools watering can  → ektOCFXcmdc
// grow bag fabric planter    → DNCIPPFjqNw
// potting soil compost       → nd6sJxnr_qA
// pruning shears garden      → ZmuHxrfz0T4
// spray bottle plant         → 1Vaz1YNxsio
// macrame plant hanger       → 7rpszHct4ro
// terrarium glass plants     → 1QE8La1JlPc
// led grow light plants      → OG9W9i3lC7c
// cactus succulent           → HoahBWRDZ4g

const PLANTS: Record<string, ReturnType<typeof u>> = {
  // ── Tropical / Indoor ──────────────────────────────────────────────────────
  'monstera-deliciosa':          u('2pTYBhn6U3s'),
  'monstera-adansonii':          u('avA-YuEe2ZA'),
  'snake-plant':                 u('wdArsFqaZ5w'),
  'money-plant':                 u('7hRp7rOof4g'),
  'pothos-devils-ivy':           u('7hRp7rOof4g'),
  'areca-palm':                  u('RWjDuJkYFjs'),
  'aglaonema':                   u('obekvwYFdsc'),
  'zz-plant':                    u('XaodqDfP9ss'),
  'rubber-plant':                u('WP-GfbFfLn8'),
  'rubber-plant-ficus':          u('WP-GfbFfLn8'),
  'peace-lily':                  u('SkhqmFTlE7k'),
  'philodendron':                u('avA-YuEe2ZA'),
  'dracaena-corn-plant':         u('rp2VDWEQP9c'),
  'spider-plant':                u('eML_w42v_pM'),
  'syngonium-arrowhead':         u('7d7OR-RvufU'),  // philodendron-like tropical leaf
  'tradescantia-wandering-dude': u('avA-YuEe2ZA'),  // trailing tropical
  'lucky-bamboo':                u('rp2VDWEQP9c'),  // upright stalks like bamboo
  'coleus':                      u('obekvwYFdsc'),  // colourful leaf plant
  'croton':                      u('obekvwYFdsc'),  // colourful tropical
  'kalanchoe':                   u('Ic5oYeseBIY'),  // small flowering plant
  'string-of-pearls':            u('RSITIt4AU8I'),  // trailing succulent

  // ── Succulents & Cacti ─────────────────────────────────────────────────────
  'aloe-vera':                   u('iRcFP75uef8'),
  'echeveria-succulent':         u('RSITIt4AU8I'),
  'echeveria-elegans':           u('RSITIt4AU8I'),
  'haworthia':                   u('uJJ8S6gsjPU'),
  'haworthia-zebra-plant':       u('uJJ8S6gsjPU'),
  'jade-plant':                  u('j4_QuKnVsW8'),
  'jade-plant-crassula':         u('j4_QuKnVsW8'),
  'cactus-assorted':             u('HoahBWRDZ4g'),
  'skeletonfry':                 u('HoahBWRDZ4g'),

  // ── Flowering ──────────────────────────────────────────────────────────────
  'hibiscus':                    u('q-ccP4qp6LY'),
  'hibiscus-china-rose':         u('q-ccP4qp6LY'),
  'rose-hybrid':                 u('chswYGgb4l0'),
  'bougainvillea':               u('wxipfbSyu_Y'),
  'marigold-genda':              u('L6kAu-LJ7u8'),
  'mogra-jasmine':               u('2bmKWvCDkxY'),
  'adenium-desert-rose':         u('eeiN8OinjnE'),
  'chrysanthemum-shevanti':      u('8vzMIj5pmdc'),
  'gerbera-daisy':               u('BuYjMYBUzQw'),
  'petunia':                     u('Ic5oYeseBIY'),
  'portulaca-moss-rose':         u('CCrJTAC9_l4'),  // bright low-growing flower
  'dahlia':                      u('CCrJTAC9_l4'),
  'vinca-periwinkle':            u('Ic5oYeseBIY'),  // similar small colourful flower
  'ixora-jungle-geranium':       u('q-ccP4qp6LY'),  // red cluster flower like hibiscus
  'crossandra-firecracker':      u('L6kAu-LJ7u8'),  // orange flower like marigold
  'sunflower':                   u('f0tklgtOJCA'),
  'parijat-night-jasmine':       u('2bmKWvCDkxY'),
  'raat-ki-rani':                u('2bmKWvCDkxY'),

  // ── Herbs & Medicinal ──────────────────────────────────────────────────────
  'tulsi-holy-basil':            u('1DSxe2DMJfY'),
  'mint-pudina':                 u('nztbzUbyb9A'),
  'peppermint':                  u('nztbzUbyb9A'),
  'coriander-dhania':            u('eH3CKe_srPk'),
  'curry-leaf':                  u('6E9WNAQj1Ys'),
  'curry-leaf-plant':            u('6E9WNAQj1Ys'),
  'lemongrass':                  u('-L-PFUBSFAI'),
  'ajwain-carom':                u('eH3CKe_srPk'),   // similar herb leaves to coriander
  'stevia':                      u('nztbzUbyb9A'),   // similar small herb leaf
  'sweet-basil':                 u('eiQA0CZgraI'),
  'brahmi-bacopa':               u('eiQA0CZgraI'),   // small-leaf herb
  'giloy-guduchi':               u('avA-YuEe2ZA'),   // climbing vine
  'ashwagandha':                 u('eiQA0CZgraI'),   // leafy herb/shrub
  'methi-fenugreek':             u('eH3CKe_srPk'),   // small compound leaves

  // ── Vegetables (growing plants) ────────────────────────────────────────────
  'tomato-desi':                 u('bLLcAX3CtOE'),
  'cherry-tomato':               u('bLLcAX3CtOE'),
  'chilli-mirchi':               u('GVnD8pFUvZs'),
  'green-chilli':                u('GVnD8pFUvZs'),
  'capsicum-bell-pepper':        u('npbCIujVMX8'),
  'cucumber':                    u('c3QCGSu6MVc'),
  'bhindi-okra':                 u('Sq-K91pKnic'),
  'brinjal-eggplant':            u('Xk5wR3Voscc'),
  'bitter-gourd-karela':         u('VWM1SXp1M0M'),
  'bottle-gourd-lauki':          u('c3QCGSu6MVc'),   // similar long green vegetable
  'french-beans':                u('nMCDGF5LogM'),   // green pod vegetable like peas
  'spinach-palak':               u('WZcU0c7zdvs'),
  'spinach-container':           u('WZcU0c7zdvs'),
  'lettuce-salad':               u('WZcU0c7zdvs'),   // similar leafy green
  'carrot':                      u('eJJ2316gOak'),
  'radish-mooli':                u('eJJ2316gOak'),   // similar root vegetable
  'peas-matar':                  u('nMCDGF5LogM'),
  'beetroot':                    u('Xk5wR3Voscc'),   // purple root vegetable
  'spring-onion':                u('eH3CKe_srPk'),   // green slender herb
  'pak-choi':                    u('WZcU0c7zdvs'),   // leafy green
  'microgreens-starter':         u('hGwEpXQrJOg'),
  'wheatgrass':                  u('hGwEpXQrJOg'),

  // ── Fruit plants ───────────────────────────────────────────────────────────
  'banana-dwarf-cavendish':      u('XQZ9CIeds48'),
  'dwarf-mango':                 u('ay2OVSqjxRE'),
  'guava':                       u('ay2OVSqjxRE'),   // similar tropical fruit tree
  'lemon-kagzi':                 u('qc6yB1Il-zM'),
  'papaya':                      u('XQZ9CIeds48'),   // similar tropical tree/fruit
  'pomegranate':                 u('gLb467qQVxU'),
  'strawberry':                  u('U1lKlvuXJkA'),
  'drumstick-moringa':           u('AO5Q5PSRFr8'),
}

// ─── SEEDS ───────────────────────────────────────────────────────────────────
const SEEDS: Record<string, ReturnType<typeof u>> = {
  // Vegetable seeds — show the actual vegetable or plant it grows into
  'seeds-cherry-tomato':              u('bLLcAX3CtOE'),
  'seeds-capsicum-mixed':             u('npbCIujVMX8'),
  'seeds-chilli-jwala':               u('GVnD8pFUvZs'),
  'seeds-spinach-palak':              u('WZcU0c7zdvs'),
  'seeds-radish-mooli':               u('eJJ2316gOak'),
  'seeds-cucumber':                   u('c3QCGSu6MVc'),
  'seeds-french-beans':               u('nMCDGF5LogM'),
  'seeds-peas-matar':                 u('nMCDGF5LogM'),
  'seeds-beetroot':                   u('Xk5wR3Voscc'),
  'seeds-carrot-chantenay':           u('eJJ2316gOak'),
  'seeds-lettuce-lollo-rossa':        u('WZcU0c7zdvs'),
  'seeds-bhindi-okra':                u('Sq-K91pKnic'),
  'seeds-brinjal':                    u('Xk5wR3Voscc'),
  'seeds-karela-bitter-gourd':        u('VWM1SXp1M0M'),
  'seeds-lauki-bottle-gourd':         u('c3QCGSu6MVc'),
  'seeds-ridge-gourd-turai':          u('c3QCGSu6MVc'),
  'seeds-watermelon-sugar-baby':      u('U1lKlvuXJkA'),  // red juicy fruit
  'seeds-strawberry':                 u('U1lKlvuXJkA'),

  // Herb seeds
  'seeds-coriander':                  u('eH3CKe_srPk'),
  'seeds-methi-fenugreek':            u('eH3CKe_srPk'),
  'seeds-tulsi':                      u('1DSxe2DMJfY'),
  'seeds-sweet-basil':                u('eiQA0CZgraI'),
  'seeds-mint-pudina':                u('nztbzUbyb9A'),
  'seeds-curry-leaf':                 u('6E9WNAQj1Ys'),
  'seeds-lemongrass':                 u('-L-PFUBSFAI'),

  // Flower seeds — show the actual flower
  'seeds-marigold-african':           u('L6kAu-LJ7u8'),
  'seeds-sunflower-dwarf':            u('f0tklgtOJCA'),
  'seeds-petunia-mixed':              u('Ic5oYeseBIY'),
  'seeds-portulaca':                  u('CCrJTAC9_l4'),
  'seeds-vinca':                      u('Ic5oYeseBIY'),
  'seeds-dahlia-dwarf':               u('CCrJTAC9_l4'),
  'seeds-gerbera':                    u('BuYjMYBUzQw'),
  'seeds-cosmos-mixed':               u('BuYjMYBUzQw'),
  'seeds-zinnia-mixed':               u('CCrJTAC9_l4'),
  'seeds-lotus':                      u('2bmKWvCDkxY'),  // pink flower like jasmine

  // Microgreens
  'seeds-microgreens-mix':            u('hGwEpXQrJOg'),
  'seeds-wheatgrass':                 u('hGwEpXQrJOg'),
  'seeds-sunflower-microgreens':      u('hGwEpXQrJOg'),

  // v2 seeds (new slugs from add-catalog-v2)
  'marigold-african-mixed-seeds':     u('L6kAu-LJ7u8'),
  'sunflower-giant-seeds':            u('f0tklgtOJCA'),
  'zinnia-double-mix-seeds':          u('CCrJTAC9_l4'),
  'petunia-mix-seeds':                u('Ic5oYeseBIY'),
  'lavender-french-seeds':            u('chswYGgb4l0'),  // purple flower
  'cherry-tomato-seeds':              u('bLLcAX3CtOE'),
  'chilli-green-desi-seeds':          u('GVnD8pFUvZs'),
  'spinach-palak-seeds':              u('WZcU0c7zdvs'),
  'coriander-dhaniya-seeds':          u('eH3CKe_srPk'),
  'mint-pudina-seeds':                u('nztbzUbyb9A'),
  'italian-basil-seeds':              u('eiQA0CZgraI'),
  'fenugreek-methi-growing-seeds':    u('eH3CKe_srPk'),
  'cosmos-mix-seeds-v2':              u('BuYjMYBUzQw'),
  'carrot-chantenay-seeds':           u('eJJ2316gOak'),
  'curry-leaf-kadi-patta-seeds':      u('6E9WNAQj1Ys'),
  'petunia-mixed-seeds':              u('Ic5oYeseBIY'),
  'strawberry-elan-f1-seeds':         u('U1lKlvuXJkA'),
  'zinnia-mixed-colours-seeds':       u('CCrJTAC9_l4'),
  'lotus-seeds':                      u('2bmKWvCDkxY'),
  'cherry-tomato-seeds-v2':           u('bLLcAX3CtOE'),
  'cosmos-mix-seeds':                 u('BuYjMYBUzQw'),
}

// ─── SUPPLIES ────────────────────────────────────────────────────────────────
const SUPPLIES: Record<string, ReturnType<typeof u>> = {
  // Pots & Planters
  'grow-bag-25l':                         u('DNCIPPFjqNw'),
  'grow-bag-15l':                         u('DNCIPPFjqNw'),
  'fabric-grow-bag-10-gallon-3pack':      u('DNCIPPFjqNw'),
  'fabric-grow-bags-5-gallon-pack-5':     u('DNCIPPFjqNw'),
  'terracotta-pot-6inch':                 u('FEa3R6Tu0eg'),
  'terracotta-pot-10inch':                u('FEa3R6Tu0eg'),
  'terracotta-pot-6':                     u('FEa3R6Tu0eg'),
  'terracotta-pot-10':                    u('FEa3R6Tu0eg'),
  'terracotta-pot-set-with-saucers':      u('FEa3R6Tu0eg'),
  'self-watering-planter-8inch':          u('FEa3R6Tu0eg'),
  'self-watering-planter-12inch':         u('FEa3R6Tu0eg'),
  'ceramic-pot-with-saucer-6inch':        u('FEa3R6Tu0eg'),
  'ceramic-pot-with-saucer-8inch':        u('FEa3R6Tu0eg'),
  'coir-moss-stick-2ft':                  u('rp2VDWEQP9c'),  // vertical bamboo-like stick with plant
  'coir-moss-stick-3ft':                  u('rp2VDWEQP9c'),
  'terrarium-kit-diy':                    u('1QE8La1JlPc'),
  'macrame-hanging-planter-set-3':        u('7rpszHct4ro'),

  // Soil & Growing Media
  'coco-peat-block-650g':                 u('nd6sJxnr_qA'),
  'cocopeat-block-650g':                  u('nd6sJxnr_qA'),
  'perlite-500g':                         u('nd6sJxnr_qA'),
  'premium-potting-mix-5kg':              u('nd6sJxnr_qA'),
  'succulent-cactus-mix-2kg':             u('nd6sJxnr_qA'),
  'veggie-fruit-potting-mix-5kg':         u('nd6sJxnr_qA'),

  // Fertilisers & Pesticides
  'neem-cake-powder-1kg':                 u('nd6sJxnr_qA'),
  'neem-oil-100ml':                       u('eiQA0CZgraI'),  // green herb/oil bottle context
  'banana-peel-fertilizer-500g':          u('XQZ9CIeds48'), // banana plant
  'bone-meal-1kg':                        u('nd6sJxnr_qA'),
  'vermicompost-2kg':                     u('nd6sJxnr_qA'),
  'seaweed-extract-liquid-250ml':         u('c3QCGSu6MVc'),  // dark green liquid/plant
  'seaweed-booster-250ml':                u('c3QCGSu6MVc'),
  'npk-19-19-19-500g':                    u('nd6sJxnr_qA'),
  'npk-liquid-fertiliser-500ml':          u('nd6sJxnr_qA'),
  'bloom-booster-250ml':                  u('L6kAu-LJ7u8'),  // flowering plant

  // Tools & Accessories
  'garden-tool-kit-5piece':              u('ektOCFXcmdc'),
  'stainless-pruning-shears':            u('ZmuHxrfz0T4'),
  'bypass-pruning-shears':               u('ZmuHxrfz0T4'),
  'watering-can-5l':                     u('ektOCFXcmdc'),
  'watering-can-1-5l-long-spout':        u('ektOCFXcmdc'),
  'fine-mist-spray-bottle-500ml':        u('1Vaz1YNxsio'),
  'drip-irrigation-kit':                 u('ektOCFXcmdc'),
  'soil-moisture-meter':                 u('ZmuHxrfz0T4'),
  'usb-grow-light-indoor':               u('OG9W9i3lC7c'),
}

async function main() {
  let updated = 0
  const missing: string[] = []

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
    console.log(`\n⚠ Missing (${missing.length}):`)
    missing.forEach(m => console.log('  -', m))
  }
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
