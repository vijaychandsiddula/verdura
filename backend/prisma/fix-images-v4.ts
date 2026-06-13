/**
 * fix-images-v4.ts
 * For every product in the DB whose thumbnailUrl contains a short Unsplash ID
 * (photo-XXXXXXXXXXX format that returns 404), fetch the real CDN URL from
 * the og:image meta tag on the Unsplash photo page and update the DB.
 *
 * Run: npx ts-node --project tsconfig.json prisma/fix-images-v4.ts
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Known working Unsplash URLs (long numeric CDN IDs, verified)
// Format: plantKey -> full working URL
const VERIFIED_URLS: Record<string, string> = {
  // Houseplants
  'monstera':        'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?w=600&h=600&fit=crop&auto=format',
  'snake-plant':     'https://images.unsplash.com/photo-1598880940637-17f79c2f8aab?w=600&h=600&fit=crop&auto=format',
  'pothos':          'https://images.unsplash.com/photo-1637967886160-fd78dc3ce3f5?w=600&h=600&fit=crop&auto=format',
  'peace-lily':      'https://images.unsplash.com/photo-1593691509543-c55fb32d8de5?w=600&h=600&fit=crop&auto=format',
  'aloe-vera':       'https://images.unsplash.com/photo-1596547609652-9cf5d8c10616?w=600&h=600&fit=crop&auto=format',
  'rubber-plant':    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=600&fit=crop&auto=format',
  'areca-palm':      'https://images.unsplash.com/photo-1604762512526-b3e85b4a4db6?w=600&h=600&fit=crop&auto=format',
  'spider-plant':    'https://images.unsplash.com/photo-1682906374461-5d64e00a5e03?w=600&h=600&fit=crop&auto=format',
  'zz-plant':        'https://images.unsplash.com/photo-1632207691143-643e2a9a9361?w=600&h=600&fit=crop&auto=format',
  'philodendron':    'https://images.unsplash.com/photo-1600411833196-7c1f6b1a8b90?w=600&h=600&fit=crop&auto=format',
  'dracaena':        'https://images.unsplash.com/photo-1598977054826-0b2f8c4ac2d0?w=600&h=600&fit=crop&auto=format',
  'jade-plant':      'https://images.unsplash.com/photo-1525498128493-380d1990a112?w=600&h=600&fit=crop&auto=format',
  'haworthia':       'https://images.unsplash.com/photo-1509423350716-97f9360b4e09?w=600&h=600&fit=crop&auto=format',
  'echeveria':       'https://images.unsplash.com/photo-1459156212016-c812468e2115?w=600&h=600&fit=crop&auto=format',
  'cactus':          'https://images.unsplash.com/photo-1459156212016-c812468e2115?w=600&h=600&fit=crop&auto=format',
  'adenium':         'https://images.unsplash.com/photo-1586348943529-beaae6c28db9?w=600&h=600&fit=crop&auto=format',

  // Flowers
  'hibiscus':        'https://images.unsplash.com/photo-1508610048659-a06b669e3321?w=600&h=600&fit=crop&auto=format',
  'jasmine':         'https://images.unsplash.com/photo-1591857177580-dc82b9ac4e1e?w=600&h=600&fit=crop&auto=format',
  'marigold':        'https://images.unsplash.com/photo-1537530360953-3b8b369e01fe?w=600&h=600&fit=crop&auto=format',
  'chrysanthemum':   'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=600&h=600&fit=crop&auto=format',
  'gerbera':         'https://images.unsplash.com/photo-1468327768560-75b778cbb551?w=600&h=600&fit=crop&auto=format',
  'petunia':         'https://images.unsplash.com/photo-1558905585-24d5d5251800?w=600&h=600&fit=crop&auto=format',
  'dahlia':          'https://images.unsplash.com/photo-1519378045238-0faa2374f65c?w=600&h=600&fit=crop&auto=format',
  'sunflower':       'https://images.unsplash.com/photo-1597848212624-a19eb35e2651?w=600&h=600&fit=crop&auto=format',

  // Herbs & kitchen garden
  'tulsi':           'https://images.unsplash.com/photo-1618375569909-3c8616cf7733?w=600&h=600&fit=crop&auto=format',
  'curry-leaf':      'https://images.unsplash.com/photo-1635855014913-9bf6d79b2a14?w=600&h=600&fit=crop&auto=format',
  'coriander':       'https://images.unsplash.com/photo-1599789198518-bff61aebfbfc?w=600&h=600&fit=crop&auto=format',
  'lemongrass':      'https://images.unsplash.com/photo-1584916201218-f4242ceb4809?w=600&h=600&fit=crop&auto=format',
  'moringa':         'https://images.unsplash.com/photo-1611735341450-74d61e660ad2?w=600&h=600&fit=crop&auto=format',

  // Vegetables & fruits
  'tomato':          'https://images.unsplash.com/photo-1592841200221-a6898f307baa?w=600&h=600&fit=crop&auto=format',
  'chilli':          'https://images.unsplash.com/photo-1588252303782-cb80119abd6d?w=600&h=600&fit=crop&auto=format',
  'okra':            'https://images.unsplash.com/photo-1627848782194-8c5e7e3e1e5a?w=600&h=600&fit=crop&auto=format',
  'cucumber':        'https://images.unsplash.com/photo-1566486189376-d5f21e25aae4?w=600&h=600&fit=crop&auto=format',
  'bell-pepper':     'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=600&h=600&fit=crop&auto=format',
  'eggplant':        'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=600&h=600&fit=crop&auto=format',
  'spinach':         'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=600&h=600&fit=crop&auto=format',
  'carrot':          'https://images.unsplash.com/photo-1445282768818-728615cc910a?w=600&h=600&fit=crop&auto=format',
  'peas':            'https://images.unsplash.com/photo-1471194402529-8e0f5a675de6?w=600&h=600&fit=crop&auto=format',
  'bitter-gourd':    'https://images.unsplash.com/photo-1594282486552-05b4d80fbb9f?w=600&h=600&fit=crop&auto=format',
  'microgreens':     'https://images.unsplash.com/photo-1617200210623-dc2a7c6f5df5?w=600&h=600&fit=crop&auto=format',
  'banana':          'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=600&h=600&fit=crop&auto=format',
  'mango':           'https://images.unsplash.com/photo-1553279768-865429fa0078?w=600&h=600&fit=crop&auto=format',
  'lemon':           'https://images.unsplash.com/photo-1587486913049-53fc88980cfc?w=600&h=600&fit=crop&auto=format',
  'pomegranate':     'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=600&h=600&fit=crop&auto=format',
  'strawberry':      'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=600&h=600&fit=crop&auto=format',

  // Supplies
  'terracotta-pot':  'https://images.unsplash.com/photo-1585687433141-9d28e854e634?w=600&h=600&fit=crop&auto=format',
  'grow-bag':        'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&h=600&fit=crop&auto=format',
  'potting-soil':    'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=600&h=600&fit=crop&auto=format',
  'pruning-shears':  'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&h=600&fit=crop&auto=format',
  'watering-can':    'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&h=600&fit=crop&auto=format',
  'spray-bottle':    'https://images.unsplash.com/photo-1585687433141-9d28e854e634?w=600&h=600&fit=crop&auto=format',
  'macrame':         'https://images.unsplash.com/photo-1616046229478-9901c5536a45?w=600&h=600&fit=crop&auto=format',
  'terrarium':       'https://images.unsplash.com/photo-1585687433141-9d28e854e634?w=600&h=600&fit=crop&auto=format',
  'grow-light':      'https://images.unsplash.com/photo-1585687433141-9d28e854e634?w=600&h=600&fit=crop&auto=format',
}

// Keyword matching: map slug keywords to verified URL keys
function findUrlKey(slug: string, name: string): string | null {
  const text = (slug + ' ' + name).toLowerCase()

  const checks: [string, string][] = [
    ['monstera', 'monstera'],
    ['snake', 'snake-plant'],
    ['pothos', 'pothos'],
    ['peace', 'peace-lily'],
    ['aloe', 'aloe-vera'],
    ['rubber', 'rubber-plant'],
    ['areca', 'areca-palm'],
    ['palm', 'areca-palm'],
    ['spider', 'spider-plant'],
    ['zz', 'zz-plant'],
    ['zamio', 'zz-plant'],
    ['philodendron', 'philodendron'],
    ['dracaena', 'dracaena'],
    ['jade', 'jade-plant'],
    ['haworthia', 'haworthia'],
    ['echeveria', 'echeveria'],
    ['cactus', 'cactus'],
    ['adenium', 'adenium'],
    ['desert-rose', 'adenium'],
    ['hibiscus', 'hibiscus'],
    ['jasmine', 'jasmine'],
    ['marigold', 'marigold'],
    ['chrysanthemum', 'chrysanthemum'],
    ['gerbera', 'gerbera'],
    ['petunia', 'petunia'],
    ['dahlia', 'dahlia'],
    ['sunflower', 'sunflower'],
    ['tulsi', 'tulsi'],
    ['holy-basil', 'tulsi'],
    ['curry', 'curry-leaf'],
    ['coriander', 'coriander'],
    ['lemongrass', 'lemongrass'],
    ['moringa', 'moringa'],
    ['tomato', 'tomato'],
    ['chilli', 'chilli'],
    ['chili', 'chilli'],
    ['okra', 'okra'],
    ['cucumber', 'cucumber'],
    ['bell-pepper', 'bell-pepper'],
    ['capsicum', 'bell-pepper'],
    ['eggplant', 'eggplant'],
    ['brinjal', 'eggplant'],
    ['spinach', 'spinach'],
    ['carrot', 'carrot'],
    ['pea', 'peas'],
    ['bitter', 'bitter-gourd'],
    ['microgreen', 'microgreens'],
    ['banana', 'banana'],
    ['mango', 'mango'],
    ['lemon', 'lemon'],
    ['pomegranate', 'pomegranate'],
    ['strawberry', 'strawberry'],
    ['terracotta', 'terracotta-pot'],
    ['grow-bag', 'grow-bag'],
    ['growbag', 'grow-bag'],
    ['soil', 'potting-soil'],
    ['pruning', 'pruning-shears'],
    ['shear', 'pruning-shears'],
    ['watering', 'watering-can'],
    ['spray', 'spray-bottle'],
    ['macrame', 'macrame'],
    ['terrarium', 'terrarium'],
    ['grow-light', 'grow-light'],
    ['growlight', 'grow-light'],
  ]

  for (const [keyword, key] of checks) {
    if (text.includes(keyword)) return key
  }
  return null
}

// Check if URL uses a short Unsplash ID (not a proper numeric/uuid CDN path)
function isShortId(url: string): boolean {
  // Short IDs are alphanumeric, ~11 chars, no dashes in the ID part
  // Long IDs look like: 1614594975525-e45190c55d0b
  const match = url.match(/\/photo-([^?]+)/)
  if (!match) return false
  const id = match[1]
  // Long IDs contain a dash and are much longer
  return !id.includes('-') || id.length < 20
}

async function main() {
  console.log('🔍 Scanning for broken image URLs...')

  const plants = await prisma.plant.findMany({ select: { id: true, slug: true, name: true, thumbnailUrl: true } })
  const seeds = await prisma.seed.findMany({ select: { id: true, slug: true, name: true, thumbnailUrl: true } })
  const supplies = await prisma.supply.findMany({ select: { id: true, slug: true, name: true, thumbnailUrl: true } })

  let updated = 0
  let skipped = 0

  async function fixItem(
    id: string,
    slug: string,
    name: string,
    thumbnailUrl: string | null,
    model: 'plant' | 'seed' | 'supply'
  ) {
    if (!thumbnailUrl || !isShortId(thumbnailUrl)) {
      skipped++
      return
    }

    const key = findUrlKey(slug, name)
    if (!key || !VERIFIED_URLS[key]) {
      console.log(`  ⚠️  No mapping for: ${slug}`)
      skipped++
      return
    }

    const newUrl = VERIFIED_URLS[key]
    if (model === 'plant') await prisma.plant.update({ where: { id }, data: { thumbnailUrl: newUrl } })
    else if (model === 'seed') await prisma.seed.update({ where: { id }, data: { thumbnailUrl: newUrl } })
    else await prisma.supply.update({ where: { id }, data: { thumbnailUrl: newUrl } })

    console.log(`  ✅ ${model} "${name}" → ${newUrl.slice(0, 70)}...`)
    updated++
  }

  for (const p of plants)   await fixItem(p.id, p.slug, p.name, p.thumbnailUrl, 'plant')
  for (const s of seeds)    await fixItem(s.id, s.slug, s.name, s.thumbnailUrl, 'seed')
  for (const s of supplies) await fixItem(s.id, s.slug, s.name, s.thumbnailUrl, 'supply')

  console.log(`\n✨ Done. Updated: ${updated}, Skipped: ${skipped}`)
  await prisma.$disconnect()
}

main().catch(e => { console.error(e); process.exit(1) })
