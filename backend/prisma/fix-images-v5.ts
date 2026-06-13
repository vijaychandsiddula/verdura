/**
 * fix-images-v5.ts  — definitive image fix
 *
 * ALL photo IDs below are 100% verified working (HTTP 200) against
 * images.unsplash.com/photo-{ID}?w=100 before being committed here.
 *
 * Strategy: replace EVERY thumbnailUrl in the DB with a freshly-verified URL.
 * We match each row by keywords in its slug or name.
 *
 * Run: npx ts-node --project tsconfig.json prisma/fix-images-v5.ts
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// ALL IDs verified 200 via curl -s -o /dev/null -w "%{http_code}"
const PID = (id: string) =>
  `https://images.unsplash.com/photo-${id}?w=600&h=600&fit=crop&auto=format`

const URLS: Record<string, string> = {
  // ── Houseplants ──────────────────────────────────────────────────────────
  'monstera':        PID('1614594975525-e45190c55d0b'),
  'snake-plant':     PID('1687552212914-03a30c82053c'),
  'pothos':          PID('1537039557108-4a42c334fd5e'),
  'peace-lily':      PID('1593691509543-c55fb32d8de5'),
  'aloe-vera':       PID('1509423350716-97f9360b4e09'),
  'rubber-plant':    PID('1477554193778-9562c28588c0'),
  'areca-palm':      PID('1733743366591-398701d23feb'),
  'spider-plant':    PID('1608161779298-f42256d2c58d'),
  'zz-plant':        PID('1632207691143-643e2a9a9361'),
  'philodendron':    PID('1598764557991-b9f211b73b81'),
  'dracaena':        PID('1533802167486-136cb359875e'),
  'jade-plant':      PID('1621552330975-f5f9c85dc9c9'),
  'haworthia':       PID('1509423350716-97f9360b4e09'),
  'echeveria':       PID('1611589739346-c297498f33d2'),
  'cactus':          PID('1594282486552-05b4d80fbb9f'),  // cactus-like
  'adenium':         PID('1635385881950-dcd7583f177f'),

  // ── Flowers ──────────────────────────────────────────────────────────────
  'hibiscus':        PID('1567990989224-6441e1483ac8'),
  'jasmine':         PID('1612380635121-411eda9ecbb9'),
  'marigold':        PID('1661142175513-a5f0871f1ad1'),
  'chrysanthemum':   PID('1508739773434-c26b3d09e071'),  // stays (was ok)
  'gerbera':         PID('1468327768560-75b778cbb551'),  // stays
  'petunia':         PID('1558905585-24d5d5251800'),     // stays
  'dahlia':          PID('1519378045238-0faa2374f65c'),  // stays
  'sunflower':       PID('1597848212624-a19eb35e2651'),  // stays

  // ── Herbs ────────────────────────────────────────────────────────────────
  'tulsi':           PID('1669131080043-f69be198e64f'),
  'curry-leaf':      PID('1485134532658-d720895a3b5e'),
  'coriander':       PID('1588879460618-9249e7d947d1'),
  'lemongrass':      PID('1629978237678-3e6a2004958f'),
  'moringa':         PID('1650494701391-daceb922ce9d'),

  // ── Vegetables & Fruits ──────────────────────────────────────────────────
  'tomato':          PID('1686278895718-26a2331d7297'),
  'chilli':          PID('1518006959466-0db0b6b4c1d0'),
  'okra':            PID('1759860002366-0d8dd828742c'),
  'cucumber':        PID('1566486189376-d5f21e25aae4'),  // stays
  'bell-pepper':     PID('1563565375-f3fdfdbefa83'),     // stays
  'eggplant':        PID('1615485290382-441e4d049cb5'),  // stays
  'spinach':         PID('1576045057995-568f588f82fb'),  // stays
  'carrot':          PID('1445282768818-728615cc910a'),  // stays
  'peas':            PID('1471194402529-8e0f5a675de6'),  // stays
  'bitter-gourd':    PID('1594282486552-05b4d80fbb9f'),
  'microgreens':     PID('1536630596251-b12ba0d9f7d4'),
  'banana':          PID('1571771894821-ce9b6c11b08e'),  // stays
  'mango':           PID('1553279768-865429fa0078'),     // stays
  'lemon':           PID('1587486913049-53fc88980cfc'),  // stays
  'pomegranate':     PID('1553279768-865429fa0078'),     // reuse mango (both fruit)
  'strawberry':      PID('1464965911861-746a04b4bca6'),  // stays

  // ── Supplies ─────────────────────────────────────────────────────────────
  'terracotta-pot':  PID('1620293106076-ad27d651efe3'),
  'grow-bag':        PID('1516765865430-ac8d320b9208'),
  'potting-soil':    PID('1597868165956-03a6827955b1'),
  'pruning-shears':  PID('1724556295028-d9088ab84d34'),
  'watering-can':    PID('1515150144380-bca9f1650ed9'),
  'spray-bottle':    PID('1620293106076-ad27d651efe3'),
  'macrame':         PID('1616046229478-9901c5536a45'),  // stays
  'terrarium':       PID('1620293106076-ad27d651efe3'),
  'grow-light':      PID('1620293106076-ad27d651efe3'),
  'cocopeat':        PID('1597868165956-03a6827955b1'),
}

// Keyword → URLS key
const KEYWORD_MAP: [string, string][] = [
  ['monstera',          'monstera'],
  ['adansonii',         'monstera'],
  ['snake',             'snake-plant'],
  ['sansevieria',       'snake-plant'],
  ['pothos',            'pothos'],
  ["devil's ivy",       'pothos'],
  ['peace',             'peace-lily'],
  ['spathiphyllum',     'peace-lily'],
  ['aloe',              'aloe-vera'],
  ['rubber',            'rubber-plant'],
  ['ficus',             'rubber-plant'],
  ['areca',             'areca-palm'],
  ['palm',              'areca-palm'],
  ['spider',            'spider-plant'],
  ['chlorophytum',      'spider-plant'],
  ['zz',                'zz-plant'],
  ['zamio',             'zz-plant'],
  ['philodendron',      'philodendron'],
  ['dracaena',          'dracaena'],
  ['jade',              'jade-plant'],
  ['crassula',          'jade-plant'],
  ['haworthia',         'haworthia'],
  ['echeveria',         'echeveria'],
  ['string of',         'echeveria'],
  ['cactus',            'cactus'],
  ['succulent',         'cactus'],
  ['adenium',           'adenium'],
  ['desert rose',       'adenium'],
  ['hibiscus',          'hibiscus'],
  ['china rose',        'hibiscus'],
  ['jasmine',           'jasmine'],
  ['mogra',             'jasmine'],
  ['parijat',           'jasmine'],
  ['raat ki rani',      'jasmine'],
  ['night bloom',       'jasmine'],
  ['marigold',          'marigold'],
  ['genda',             'marigold'],
  ['chrysanthemum',     'chrysanthemum'],
  ['shevanti',          'chrysanthemum'],
  ['gerbera',           'gerbera'],
  ['petunia',           'petunia'],
  ['dahlia',            'dahlia'],
  ['sunflower',         'sunflower'],
  ['tulsi',             'tulsi'],
  ['holy basil',        'tulsi'],
  ['basil',             'tulsi'],
  ['curry',             'curry-leaf'],
  ['kadi patta',        'curry-leaf'],
  ['coriander',         'coriander'],
  ['dhania',            'coriander'],
  ['dhaniya',           'coriander'],
  ['lemongrass',        'lemongrass'],
  ['moringa',           'moringa'],
  ['drumstick',         'moringa'],
  ['tomato',            'tomato'],
  ['chilli',            'chilli'],
  ['chili',             'chilli'],
  ['mirchi',            'chilli'],
  ['okra',              'okra'],
  ['bhindi',            'okra'],
  ['cucumber',          'cucumber'],
  ['bell pepper',       'bell-pepper'],
  ['capsicum',          'bell-pepper'],
  ['eggplant',          'eggplant'],
  ['brinjal',           'eggplant'],
  ['spinach',           'spinach'],
  ['palak',             'spinach'],
  ['carrot',            'carrot'],
  ['pea ',              'peas'],
  ['matar',             'peas'],
  ['bitter',            'bitter-gourd'],
  ['karela',            'bitter-gourd'],
  ['microgreen',        'microgreens'],
  ['banana',            'banana'],
  ['cavendish',         'banana'],
  ['mango',             'mango'],
  ['lemon',             'lemon'],
  ['nimbu',             'lemon'],
  ['pomegranate',       'pomegranate'],
  ['strawberry',        'strawberry'],
  ['terracotta',        'terracotta-pot'],
  ['grow bag',          'grow-bag'],
  ['growbag',           'grow-bag'],
  ['fabric bag',        'grow-bag'],
  ['fabric grow',       'grow-bag'],
  ['self-watering',     'grow-bag'],
  ['soil',              'potting-soil'],
  ['potting mix',       'potting-soil'],
  ['cocopeat',          'cocopeat'],
  ['coco peat',         'cocopeat'],
  ['perlite',           'cocopeat'],
  ['pruning',           'pruning-shears'],
  ['shear',             'pruning-shears'],
  ['bypass',            'pruning-shears'],
  ['watering can',      'watering-can'],
  ['spray bottle',      'spray-bottle'],
  ['mist spray',        'spray-bottle'],
  ['macrame',           'macrame'],
  ['macramé',           'macrame'],
  ['terrarium',         'terrarium'],
  ['grow light',        'grow-light'],
  ['growlight',         'grow-light'],
  ['usb light',         'grow-light'],
  // Extended fallbacks
  ['mint',              'lemongrass'],
  ['pudina',            'lemongrass'],
  ['peppermint',        'lemongrass'],
  ['methi',             'coriander'],
  ['fenugreek',         'coriander'],
  ['ajwain',            'coriander'],
  ['carom',             'coriander'],
  ['stevia',            'coriander'],
  ['spring onion',      'coriander'],
  ['scallion',          'coriander'],
  ['vinca',             'petunia'],
  ['portulaca',         'petunia'],
  ['zinnia',            'dahlia'],
  ['cosmos',            'dahlia'],
  ['lavender',          'dahlia'],
  ['lotus',             'peace-lily'],
  ['kalanchoe',         'adenium'],
  ['ixora',             'hibiscus'],
  ['crossandra',        'hibiscus'],
  ['bougainvillea',     'hibiscus'],
  ['rose',              'hibiscus'],
  ['money plant',       'pothos'],
  ['money-plant',       'pothos'],
  ['syngonium',         'pothos'],
  ['tradescantia',      'pothos'],
  ['aglaonema',         'pothos'],
  ['croton',            'rubber-plant'],
  ['coleus',            'rubber-plant'],
  ['lucky bamboo',      'dracaena'],
  ['bamboo',            'dracaena'],
  ['ashwagandha',       'moringa'],
  ['brahmi',            'lemongrass'],
  ['giloy',             'lemongrass'],
  ['guduchi',           'lemongrass'],
  ['wheatgrass',        'microgreens'],
  ['radish',            'carrot'],
  ['mooli',             'carrot'],
  ['beetroot',          'carrot'],
  ['beet',              'carrot'],
  ['french bean',       'peas'],
  ['beans',             'peas'],
  ['lettuce',           'spinach'],
  ['pak choi',          'spinach'],
  ['bok choy',          'spinach'],
  ['bottle gourd',      'cucumber'],
  ['lauki',             'cucumber'],
  ['ridge gourd',       'cucumber'],
  ['turai',             'cucumber'],
  ['watermelon',        'cucumber'],
  ['guava',             'mango'],
  ['papaya',            'mango'],
  ['vermicompost',      'potting-soil'],
  ['fertiliser',        'potting-soil'],
  ['fertilizer',        'potting-soil'],
  ['npk',               'potting-soil'],
  ['neem oil',          'potting-soil'],
  ['neem cake',         'potting-soil'],
  ['bone meal',         'potting-soil'],
  ['seaweed',           'potting-soil'],
  ['bloom booster',     'potting-soil'],
  ['ceramic pot',       'terracotta-pot'],
  ['moisture meter',    'pruning-shears'],
  ['garden tool',       'pruning-shears'],
  ['drip irrigation',   'watering-can'],
  ['coir moss',         'grow-bag'],
  ['moss stick',        'grow-bag'],
  ['skeletonfry',       'pothos'],   // test entry fallback
]

function resolveUrl(slug: string, name: string): string | null {
  const text = (slug + ' ' + name).toLowerCase()
  for (const [kw, key] of KEYWORD_MAP) {
    if (text.includes(kw)) return URLS[key] ?? null
  }
  return null
}

async function main() {
  console.log('🌱 fix-images-v5 — updating all product images...\n')

  const plants   = await prisma.plant.findMany({ select: { id: true, slug: true, name: true } })
  const seeds    = await prisma.seed.findMany({ select: { id: true, slug: true, name: true } })
  const supplies = await prisma.supply.findMany({ select: { id: true, slug: true, name: true } })

  let updated = 0
  let skipped = 0

  async function fix(
    id: string, slug: string, name: string,
    model: 'plant' | 'seed' | 'supply'
  ) {
    const url = resolveUrl(slug, name)
    if (!url) { console.log(`  ⚠️  no match: ${model} "${name}" (${slug})`); skipped++; return }

    if (model === 'plant')   await prisma.plant.update({ where: { id }, data: { thumbnailUrl: url } })
    if (model === 'seed')    await prisma.seed.update({ where: { id }, data: { thumbnailUrl: url } })
    if (model === 'supply')  await prisma.supply.update({ where: { id }, data: { thumbnailUrl: url } })

    console.log(`  ✅ ${model.padEnd(6)} "${name}"`)
    updated++
  }

  for (const p of plants)   await fix(p.id, p.slug, p.name, 'plant')
  for (const s of seeds)    await fix(s.id, s.slug, s.name, 'seed')
  for (const s of supplies) await fix(s.id, s.slug, s.name, 'supply')

  console.log(`\n✨ Done. Updated: ${updated}  Skipped (no keyword match): ${skipped}`)
  await prisma.$disconnect()
}

main().catch(e => { console.error(e); process.exit(1) })
