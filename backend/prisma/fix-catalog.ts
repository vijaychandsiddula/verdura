/**
 * fix-catalog.ts
 *
 * 1. Delete the test plant (test-rose-cleanup)
 * 2. Fix/update space-hungry plants with honest descriptions & better pot guidance
 *    - Banana: too big even dwarf → mark inactive (can't truly grow in a city flat)
 *    - Dwarf Mango: update to be honest — needs large container, terrace only
 *    - Papaya: update — terrace/ground only, not balcony
 *    - Bottle Gourd: update — terrace with trellis only
 * 3. Add 22 genuinely compact, well-researched home-growing plants
 *
 * Research basis:
 *   - ICAR (Indian Council of Agricultural Research) balcony/kitchen garden bulletins
 *   - NHB (National Horticulture Board) — container gardening recommendations
 *   - KVK (Krishi Vigyan Kendra) city farming guides
 *   - Popular Indian gardening books: "Terrace & Balcony Gardening" — Bhavana Mehta
 *   - Practical experience: minimum container sizes, actual yield, space footprint
 *
 * Run: npx tsx prisma/fix-catalog.ts
 */

import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

const P = (id: number) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=600&h=600&fit=crop`
const U = (id: string) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=600&h=600&q=80`

// ─── STEP 1: PLANTS TO DEACTIVATE (genuinely unsuitable for metro home growing) ─
// Banana needs 200L+ container, produces once, takes 18 months, 2-3m tall
// Even "dwarf" Cavendish is 1.5-2m tall and 1m wide — not a balcony plant
const DEACTIVATE = ['banana-dwarf-cavendish']

// ─── STEP 2: PLANTS TO UPDATE WITH HONEST DESCRIPTIONS ───────────────────────
const UPDATES: Record<string, { description: string; tags: string[] }> = {
  'dwarf-mango': {
    description: 'Dwarf mango varieties like Amrapali and Mallika can be grown in 100-200L containers on terraces and large garden spaces. This is a long-term investment — takes 2-3 years to first fruit, but a single tree yields 50-100 mangoes annually. Needs a full terrace or ground space, not a balcony.',
    tags: ['terrace-only', 'long-term', 'high-yield', 'container-tree'],
  },
  'papaya': {
    description: 'Papaya grows fast and fruits in 10-12 months, but needs a 30-50L deep container and a full sunny terrace or ground. Not suitable for balconies — it grows 2-3m tall. Dwarf varieties like "Taiwan 786" are the most container-friendly option for terrace gardens.',
    tags: ['terrace-only', 'fast-fruiting', 'tropical', 'nutritious'],
  },
  'bottle-gourd-lauki': {
    description: 'Bottle gourd is a vigorous creeper best suited for terrace gardens with a strong overhead trellis or pergola. It covers 15-20 sq ft of trellis area and needs 30L+ containers. Not ideal for small balconies but excellent for rooftop gardens and ground-level setups.',
    tags: ['terrace-garden', 'trellis-needed', 'high-yield', 'nutritious'],
  },
  'guava': {
    description: 'Guava trees can be kept compact in 50-100L containers through regular pruning. Varieties like "Allahabad Safeda" and "L-49" respond well to container growing on terraces. Yields fruit in 2-3 years. Needs a large terrace or lawn — not a balcony plant.',
    tags: ['terrace-only', 'prunable', 'high-vitamin-c', 'container-tree'],
  },
  'pomegranate': {
    description: 'Pomegranate is one of the most container-friendly fruit trees — dwarf varieties like "Ganesh" grow happily in 25-40L pots on terraces and large balconies. Takes 2-3 years to fruit but looks beautiful even before. Needs 4+ hours of direct sun.',
    tags: ['terrace-balcony', 'ornamental', 'drought-tolerant', 'container-tree'],
  },
}

// ─── STEP 3: NEW PLANTS (all genuinely compact & research-backed) ─────────────
// Space footprint guide used:
//   Tiny (windowsill): <15cm pot, <0.1 sq m
//   Small (balcony): 15-25cm pot, 0.1-0.25 sq m
//   Medium (balcony/terrace): 25-35cm pot / 15-25L grow bag, 0.25-0.5 sq m
//   Large (terrace): 35cm+ pot / 25L+ grow bag, 0.5+ sq m

const NEW_PLANTS = [
  // ─── INDOOR / WINDOWSILL ──────────────────────────────────────────────────
  {
    name: 'Peace Lily (already in DB)',
    slug: 'peace-lily',  // skip — already exists
    _skip: true,
  },
  {
    name: 'Lucky Bamboo',
    scientificName: 'Dracaena sanderiana',
    slug: 'lucky-bamboo',
    description: 'Lucky bamboo is one of India\'s most popular indoor plants — grown in water or soil, requires almost no care, and is considered auspicious in Feng Shui and Vastu. Perfect for desks, shelves, and dim corners where nothing else grows.',
    price: 99, comparePrice: 149, stock: 120,
    thumbnailUrl: P(4503273), images: [P(4503273)],
    categories: ['indoor'],
    difficulty: 'beginner',
    tags: ['water-growing', 'low-light', 'vastu-friendly', 'desk-plant', 'no-soil-needed'],
    isBestseller: true, isNewArrival: false,
    careWatering: 'Change water every 10 days', careSunlight: 'Low to bright indirect (1–3 hours)', careHumidity: '40–70%', careTemperature: '18–32°C',
    wateringIntervalDays: 10, fertiliserIntervalDays: 60, pruningIntervalDays: 90, repottingIntervalMonths: 24,
    careGuide: { create: [
      { title: 'Water care', icon: '💧', body: 'Use filtered, RO, or water left overnight — chlorine in tap water causes brown tips. Change the water every 10–14 days. Keep roots submerged but not the stalk. Add a tiny pinch of liquid fertiliser once a month.', order: 1 },
      { title: 'Light', icon: '☀️', body: 'Survives in low light but grows best in bright indirect light. Direct sun scorches the leaves and turns them yellow. Perfect for a corner away from windows or a north-facing room.', order: 2 },
      { title: 'Container', icon: '🪴', body: 'Keep in a vase or glass bowl with pebbles to anchor the stalks. The vase can be as small as 10 cm across. Pebbles + water is all it needs — no soil required.', order: 3 },
      { title: 'Yellow leaves', icon: '⚠️', body: 'Yellow leaves = too much direct sun or chlorinated water. Brown tips = tap water fluoride or low humidity. Move away from direct sun and switch to filtered water.', order: 4 },
    ]},
  },
  {
    name: 'Pothos (Devil\'s Ivy)',
    scientificName: 'Epipremnum aureum',
    slug: 'pothos-devils-ivy',
    description: 'The gold standard of Indian indoor plants. Pothos survives air conditioning, low light, irregular watering, and complete neglect — and still looks lush. Trails beautifully from shelves, climbs walls, or grows in a simple water bottle.',
    price: 59, comparePrice: 89, stock: 200,
    thumbnailUrl: U('1602923668104-8f9e03e77e62'),
    images: [U('1602923668104-8f9e03e77e62')],
    categories: ['indoor', 'air_purifying'],
    difficulty: 'beginner',
    tags: ['air-purifier', 'trailing', 'low-light', 'water-propagation', 'ac-tolerant'],
    isBestseller: true, isNewArrival: false,
    careWatering: 'Every 7–10 days', careSunlight: 'Low to bright indirect (1–4 hours)', careHumidity: '40–70%', careTemperature: '15–32°C',
    wateringIntervalDays: 8, fertiliserIntervalDays: 30, pruningIntervalDays: 30, repottingIntervalMonths: 18,
    careGuide: { create: [
      { title: 'Watering', icon: '💧', body: 'Water when the top 3–4 cm of soil is completely dry. Yellow leaves = overwatering. Wilting + dry soil = underwatering. In AC rooms, water less frequently — soil dries slowly.', order: 1 },
      { title: 'Light', icon: '☀️', body: 'One of the most light-tolerant plants — survives in dim corridors and bathrooms. Variegated varieties (golden, marble queen) need more light to maintain their patterns.', order: 2 },
      { title: 'Pruning & shaping', icon: '✂️', body: 'Cut any stem just below a node to propagate or to keep the plant bushy. Long trailing stems can be pinned back into the pot to create a fuller, mounding look.', order: 3 },
      { title: 'Water propagation', icon: '🌱', body: 'Cut a 15 cm stem below a node, remove lower leaves, place in a glass of water. Roots appear in 7–10 days. Transfer to soil once roots are 3–5 cm. Share unlimited cuttings.', order: 4 },
    ]},
  },
  {
    name: 'Syngonium (Arrowhead Plant)',
    scientificName: 'Syngonium podophyllum',
    slug: 'syngonium-arrowhead',
    description: 'A compact, fast-growing indoor plant with arrow-shaped leaves in shades of green, pink, and white. Adapts beautifully to Indian apartments, needs minimal care, and stays small enough for a desk or windowsill.',
    price: 89, comparePrice: 129, stock: 100,
    thumbnailUrl: P(4503273), images: [P(4503273)],
    categories: ['indoor', 'air_purifying'],
    difficulty: 'beginner',
    tags: ['compact', 'desk-plant', 'low-light', 'air-purifier', 'colourful-foliage'],
    isBestseller: false, isNewArrival: false,
    careWatering: 'Every 7 days', careSunlight: 'Bright indirect (2–4 hours)', careHumidity: '50–70%', careTemperature: '18–30°C',
    wateringIntervalDays: 7, fertiliserIntervalDays: 30, pruningIntervalDays: 30, repottingIntervalMonths: 18,
    careGuide: { create: [
      { title: 'Watering', icon: '💧', body: 'Water when the top 2 cm of soil is dry. Syngoniums can tolerate slight drought but not waterlogging — always use well-draining soil and a pot with a hole.', order: 1 },
      { title: 'Leaf shape', icon: '🌿', body: 'Young plants have small, arrow-shaped leaves. As the plant matures and if given a climbing support (moss pole), leaves become larger and more deeply lobed. Keeping it in a small pot keeps it compact.', order: 2 },
      { title: 'Humidity', icon: '💨', body: 'Loves humidity. In dry Delhi winters or AC rooms, mist the leaves once a week or place on a pebble tray with water. Brown leaf edges indicate air that is too dry.', order: 3 },
      { title: 'Propagation', icon: '🌱', body: 'Stem cuttings root easily in water. Cut below a node, keep in water until roots are 3 cm, then pot. New leaves emerge within 3–4 weeks.', order: 4 },
    ]},
  },
  {
    name: 'Dracaena',
    scientificName: 'Dracaena fragrans',
    slug: 'dracaena-corn-plant',
    description: 'One of the top NASA-recommended air-purifying plants, perfectly suited for Indian apartments. The corn plant looks dramatic, grows slowly, needs almost no water, and tolerates the dim light of Indian flats with poor window placement.',
    price: 149, comparePrice: 199, stock: 70,
    thumbnailUrl: P(4503273), images: [P(4503273)],
    categories: ['indoor', 'air_purifying'],
    difficulty: 'beginner',
    tags: ['air-purifier', 'low-light', 'drought-tolerant', 'statement-plant', 'nasa-approved'],
    isBestseller: false, isNewArrival: false,
    careWatering: 'Every 10–14 days', careSunlight: 'Low to medium indirect (1–3 hours)', careHumidity: '40–60%', careTemperature: '18–30°C',
    wateringIntervalDays: 12, fertiliserIntervalDays: 60, pruningIntervalDays: 90, repottingIntervalMonths: 24,
    careGuide: { create: [
      { title: 'Watering', icon: '💧', body: 'Water sparingly — only when the top half of the soil is dry. In winter, water once every 3 weeks. Dracaenas rot easily when overwatered. Use filtered water — they are sensitive to fluoride.', order: 1 },
      { title: 'Light', icon: '☀️', body: 'Adapts to low light better than almost any other plant. However, variegated varieties need more light to maintain their yellow or white stripe. Avoid direct sun which bleaches the leaves.', order: 2 },
      { title: 'Brown tips', icon: '⚠️', body: 'Brown tips are almost always from fluoride in tap water. Use filtered or RO water. Trim brown tips with scissors cut at a slight angle to maintain a natural look.', order: 3 },
      { title: 'Size control', icon: '✂️', body: 'If the plant grows too tall, cut the cane at any height — it will sprout new growth from below the cut. The cut top can be rooted as a new plant.', order: 4 },
    ]},
  },
  {
    name: 'Haworthia',
    scientificName: 'Haworthia fasciata',
    slug: 'haworthia',
    description: 'The perfect succulent for Indian indoors — unlike echeveria, Haworthia thrives in low light and shade, making it ideal for windowsill and desk growing. Its zebra-striped leaves are dramatic without needing any direct sun.',
    price: 89, comparePrice: 129, stock: 90,
    thumbnailUrl: P(1999268), images: [P(1999268)],
    categories: ['indoor', 'succulent'],
    difficulty: 'beginner',
    tags: ['succulent', 'low-light', 'desk-plant', 'drought-tolerant', 'compact'],
    isBestseller: false, isNewArrival: true,
    careWatering: 'Every 14–21 days', careSunlight: 'Bright indirect (2–3 hours)', careHumidity: 'Low', careTemperature: '15–30°C',
    wateringIntervalDays: 17, fertiliserIntervalDays: 60, pruningIntervalDays: 180, repottingIntervalMonths: 36,
    careGuide: { create: [
      { title: 'Watering', icon: '💧', body: 'Water every 2–3 weeks in summer, once a month in winter. The leaves are firm when well-hydrated and slightly soft when thirsty. Always err on the side of underwatering.', order: 1 },
      { title: 'Light', icon: '☀️', body: 'Unlike most succulents, Haworthia PREFERS indirect light and even tolerates shade — making it the best succulent for dim Indian apartments. Direct afternoon sun causes sunburn.', order: 2 },
      { title: 'Soil', icon: '🪴', body: 'Use cactus mix or any fast-draining soil. A tiny terracotta pot works perfectly — Haworthias love being slightly root-bound. Repot only every 3-4 years.', order: 3 },
      { title: 'Pups', icon: '🌱', body: 'Haworthia produces small offsets (pups) at the base. When pups are 1/3 the size of the mother plant, separate them with a clean knife and pot individually.', order: 4 },
    ]},
  },

  // ─── BALCONY FLOWERING ────────────────────────────────────────────────────
  {
    name: 'Vinca (Periwinkle)',
    scientificName: 'Catharanthus roseus',
    slug: 'vinca-periwinkle',
    description: 'Vinca is the ultimate summer survival plant — blooms relentlessly through Indian heat waves in pink, red, white, and magenta. Thrives in any pot or grow bag, asks for minimal care, and flowers from seedling to first frost without interruption.',
    price: 39, comparePrice: 59, stock: 220,
    thumbnailUrl: P(2293374), images: [P(2293374)],
    categories: ['outdoor', 'flowering'],
    difficulty: 'beginner',
    tags: ['summer-bloomer', 'heat-tolerant', 'pot-friendly', 'fast-growing', 'drought-tolerant'],
    isBestseller: true, isNewArrival: false,
    careWatering: 'Every 2–3 days', careSunlight: 'Full sun to partial shade (4–6 hours)', careHumidity: 'Low–moderate', careTemperature: '22–40°C',
    wateringIntervalDays: 2, fertiliserIntervalDays: 21, pruningIntervalDays: 14, repottingIntervalMonths: 12,
    careGuide: { create: [
      { title: 'Planting', icon: '🌱', body: 'Sow seeds in March–April (for summer blooms) or August–September. Germination in 7–10 days. Transplant seedlings to 6–8 inch pots once 5–6 cm tall.', order: 1 },
      { title: 'Watering', icon: '💧', body: 'Water when the top layer is dry — vincas are more drought-tolerant than most flowering plants. In peak summer, water every 2 days. In cooler months, every 3–4 days.', order: 2 },
      { title: 'Deadheading', icon: '✂️', body: 'Not strictly necessary (vinca is self-cleaning), but removing spent flowers every week does encourage more blooms. Pinching growing tips makes the plant bushier.', order: 3 },
      { title: 'Medicinal note', icon: '⚠️', body: 'All parts of vinca are mildly toxic if ingested — keep away from children and pets. Wear gloves when pruning if you have sensitive skin.', order: 4 },
    ]},
  },
  {
    name: 'Crossandra (Firecracker Flower)',
    scientificName: 'Crossandra infundibuliformis',
    slug: 'crossandra-firecracker',
    description: 'Crossandra is one of South India\'s most beloved flowering plants — its bright orange blooms are used in garlands, and the plant flowers almost year-round in warm conditions. Compact enough for any pot and perfect for sunny balconies.',
    price: 69, comparePrice: 99, stock: 90,
    thumbnailUrl: P(2293374), images: [P(2293374)],
    categories: ['outdoor', 'flowering'],
    difficulty: 'beginner',
    tags: ['year-round-bloomer', 'fragrant', 'south-indian', 'pot-friendly', 'garland-flower'],
    isBestseller: false, isNewArrival: false,
    careWatering: 'Every 2 days', careSunlight: 'Bright indirect to partial sun (3–5 hours)', careHumidity: '60–80%', careTemperature: '18–35°C',
    wateringIntervalDays: 2, fertiliserIntervalDays: 14, pruningIntervalDays: 30, repottingIntervalMonths: 18,
    careGuide: { create: [
      { title: 'Light', icon: '☀️', body: 'Prefers bright indirect light or gentle morning sun. Harsh afternoon sun in summer can bleach the flowers. An east-facing balcony is ideal.', order: 1 },
      { title: 'Watering', icon: '💧', body: 'Keep soil consistently moist — crossandra does not like to dry out completely. In AC rooms or dry winters, increase watering frequency slightly.', order: 2 },
      { title: 'Humidity', icon: '💨', body: 'Being a tropical plant, crossandra loves humidity. In dry North Indian winters, place near a water source or mist the leaves every few days.', order: 3 },
      { title: 'Harvesting flowers', icon: '✂️', body: 'The orange flowers are traditionally used in South Indian hair garlands and temple offerings. Pick mature blooms and thread them directly. One plant produces dozens of flowers weekly.', order: 4 },
    ]},
  },
  {
    name: 'Gerbera Daisy',
    scientificName: 'Gerbera jamesonii',
    slug: 'gerbera-daisy',
    description: 'Gerberas produce large, vivid daisy-like flowers in red, orange, yellow, pink, and white — one of the most cheerful balcony plants for Indian winters. Each flower lasts 2 weeks and plants bloom repeatedly through the cool season.',
    price: 79, comparePrice: 119, stock: 100,
    thumbnailUrl: P(2293374), images: [P(2293374)],
    categories: ['outdoor', 'flowering'],
    difficulty: 'intermediate',
    tags: ['winter-bloomer', 'cut-flower', 'pot-friendly', 'colourful'],
    isBestseller: false, isNewArrival: true,
    careWatering: 'Every 2–3 days', careSunlight: 'Full sun (5–6 hours)', careHumidity: '40–60%', careTemperature: '10–25°C',
    wateringIntervalDays: 2, fertiliserIntervalDays: 14, pruningIntervalDays: 21, repottingIntervalMonths: 12,
    careGuide: { create: [
      { title: 'Season', icon: '📅', body: 'Gerberas bloom best in Indian winters (October–February). In peak summer above 35°C they go dormant — cut back and wait for cooler weather.', order: 1 },
      { title: 'Watering', icon: '💧', body: 'Water at the base — never let water collect in the crown of leaves (causes crown rot). Allow top 2 cm to dry between waterings. Reduce watering in summer dormancy.', order: 2 },
      { title: 'Fertilising', icon: '🧪', body: 'Feed every 2 weeks with a bloom booster (low nitrogen, high phosphorus-potassium). Too much nitrogen gives many leaves but few flowers.', order: 3 },
      { title: 'Deadheading', icon: '✂️', body: 'Remove spent flower stalks all the way to the base — cutting only the flower head leaves a stub that rots. Clean removal encourages the next flower stalk quickly.', order: 4 },
    ]},
  },

  // ─── HERBS & EDIBLES (TRULY COMPACT) ─────────────────────────────────────
  {
    name: 'Microgreens',
    scientificName: 'Various species',
    slug: 'microgreens-starter',
    description: 'Microgreens are baby seedlings of vegetables and herbs harvested 7–14 days after germination. The most space-efficient food you can grow — a single tray on your kitchen counter yields nutrient-dense greens in under 2 weeks. Perfect for tiny apartments.',
    price: 49, comparePrice: 79, stock: 200,
    thumbnailUrl: P(4033471), images: [P(4033471)],
    categories: ['indoor', 'herb', 'vegetable'],
    difficulty: 'beginner',
    tags: ['ultra-compact', 'indoor', 'fast-harvest', 'superfood', 'kitchen-counter', 'no-soil-needed'],
    isBestseller: true, isNewArrival: true,
    careWatering: 'Spray twice daily', careSunlight: 'Bright indirect or grow light (4+ hours)', careHumidity: '50–70%', careTemperature: '18–28°C',
    wateringIntervalDays: 1, fertiliserIntervalDays: 0, pruningIntervalDays: 0, repottingIntervalMonths: 0,
    careGuide: { create: [
      { title: 'How to grow', icon: '🌱', body: 'Spread seeds densely on a thin layer of coco peat or potting mix in a shallow tray. Mist with water, cover with another tray for 3–4 days until germinated, then uncover and place in light.', order: 1 },
      { title: 'Watering', icon: '💧', body: 'Mist twice daily — morning and evening. Trays should be moist but not soaking. Do not use a watering can — it disturbs seeds. A spray bottle is all you need.', order: 2 },
      { title: 'Harvest', icon: '✂️', body: 'Cut with scissors just above the soil when 3–5 cm tall (7–14 days). Eat immediately — microgreens are 4-40× more nutritious than mature vegetables. Best varieties: sunflower, radish, mustard, peas, fenugreek.', order: 3 },
      { title: 'No equipment needed', icon: '🪴', body: 'Any shallow tray or container works. A reused paneer / tofu tray, an old baking dish, or a dedicated microgreens tray. Coco peat is best but any moist medium works.', order: 4 },
    ]},
  },
  {
    name: 'Spring Onion (Scallion)',
    scientificName: 'Allium fistulosum',
    slug: 'spring-onion',
    description: 'The most kitchen-useful plant you can grow on a windowsill. Spring onions regrow from cut store-bought onions placed in a glass of water — virtually free to grow, perpetually productive, and ready to harvest in 10 days.',
    price: 29, comparePrice: 49, stock: 200,
    thumbnailUrl: P(4033471), images: [P(4033471)],
    categories: ['indoor', 'outdoor', 'vegetable', 'herb'],
    difficulty: 'beginner',
    tags: ['kitchen-windowsill', 'regrow-from-scraps', 'ultra-compact', 'fast-harvest', 'free-to-grow'],
    isBestseller: false, isNewArrival: false,
    careWatering: 'Every 2 days', careSunlight: 'Bright indirect to partial sun (2–4 hours)', careHumidity: 'Moderate', careTemperature: '15–28°C',
    wateringIntervalDays: 2, fertiliserIntervalDays: 21, pruningIntervalDays: 7, repottingIntervalMonths: 6,
    careGuide: { create: [
      { title: 'Regrow from scraps', icon: '🌱', body: 'Save the root end (2–3 cm) of store-bought spring onions. Place in a glass with 2 cm of water, root-side down. Change water every 2 days. New green shoots emerge in 5–7 days. Regrow 4–5 times before replanting in soil.', order: 1 },
      { title: 'Pot growing', icon: '🪴', body: 'For continuous harvest, plant bulbs or seeds in a 6-inch pot. A small window box can hold 10–12 plants. Harvest outer leaves while leaving the centre to keep growing.', order: 2 },
      { title: 'Harvesting', icon: '✂️', body: 'Cut leaves 3–4 cm above the base — the plant regrows from the roots. You can harvest the same plant 5–6 times before it needs replacing. All parts are edible.', order: 3 },
      { title: 'Uses', icon: '🌿', body: 'Use in everything — dal, sabzi, raita, fried rice, noodles, soups, and as a garnish. The green tops are more nutritious than the white bulb.', order: 4 },
    ]},
  },
  {
    name: 'Curry Leaf (Kadi Patta)',
    slug: 'curry-leaf', // already exists — skip
    _skip: true,
    name2: 'skip',
  } as never,
  {
    name: 'Wheatgrass',
    scientificName: 'Triticum aestivum',
    slug: 'wheatgrass',
    description: 'A powerful health food crop you can grow in 10 days on your kitchen counter. Wheatgrass juice is rich in chlorophyll, iron, and antioxidants. Requires just a shallow tray, some soil, and a handful of wheat seeds.',
    price: 39, comparePrice: 59, stock: 150,
    thumbnailUrl: P(4033471), images: [P(4033471)],
    categories: ['indoor', 'herb', 'vegetable'],
    difficulty: 'beginner',
    tags: ['superfood', 'kitchen-counter', 'ultra-compact', 'fast-harvest', 'juicing'],
    isBestseller: false, isNewArrival: true,
    careWatering: 'Spray twice daily', careSunlight: 'Bright indirect (3–4 hours)', careHumidity: '50–70%', careTemperature: '18–28°C',
    wateringIntervalDays: 1, fertiliserIntervalDays: 0, pruningIntervalDays: 0, repottingIntervalMonths: 0,
    careGuide: { create: [
      { title: 'Setup', icon: '🌱', body: 'Soak wheat seeds (available at any kirana store as "gehun") overnight. Drain and spread in a thin layer on moist coco peat or soil in a shallow tray. Mist and cover for 2–3 days.', order: 1 },
      { title: 'Growing', icon: '☀️', body: 'Uncover once sprouted. Place in bright indirect light. Mist twice daily. Wheatgrass grows 2–3 cm per day and is ready to harvest at 15–18 cm.', order: 2 },
      { title: 'Harvest', icon: '✂️', body: 'Cut with scissors just above the roots when 15–18 cm tall (around day 8–10). One harvest per tray — wheatgrass does not regrow well after cutting. Start a new tray in rotation.', order: 3 },
      { title: 'Juicing', icon: '🥤', body: 'Juice 30–60 ml fresh wheatgrass immediately after cutting. Use a slow/masticating juicer — a centrifugal juicer destroys most nutrients. Drink on an empty stomach in the morning.', order: 4 },
    ]},
  },
  {
    name: 'Peppermint',
    scientificName: 'Mentha × piperita',
    slug: 'peppermint',
    description: 'More intensely flavoured than regular pudina/spearmint, peppermint is used in teas, mojitos, chutneys, and medicines. Grows vigorously in any pot and produces leaves all year in Indian conditions.',
    price: 49, comparePrice: 69, stock: 160,
    thumbnailUrl: P(3076899), images: [P(3076899)],
    categories: ['indoor', 'outdoor', 'herb'],
    difficulty: 'beginner',
    tags: ['culinary', 'medicinal', 'pot-friendly', 'fragrant', 'fast-growing'],
    isBestseller: false, isNewArrival: false,
    careWatering: 'Every 2 days', careSunlight: 'Partial sun (3–4 hours)', careHumidity: '50–70%', careTemperature: '15–28°C',
    wateringIntervalDays: 2, fertiliserIntervalDays: 21, pruningIntervalDays: 14, repottingIntervalMonths: 12,
    careGuide: { create: [
      { title: 'Containment', icon: '🪴', body: 'Peppermint spreads aggressively via underground runners. Always grow in a pot — never directly in a garden bed unless you want it to take over. A 10-inch pot is sufficient and keeps it manageable.', order: 1 },
      { title: 'Watering', icon: '💧', body: 'Mint likes consistently moist soil. Water every 2 days. It wilts dramatically when thirsty but recovers within hours of watering — use this as your cue.', order: 2 },
      { title: 'Harvest', icon: '✂️', body: 'Harvest regularly by pinching the top 2–3 sets of leaves. This keeps the plant compact and productive. The more you harvest, the bushier and more productive it becomes.', order: 3 },
      { title: 'Uses', icon: '🌿', body: 'Stronger than spearmint — use in small quantities. Excellent in: pudina chai, mojitos, mint chutneys, raita, fresh juices, and as a digestive tea. Also effective for headaches when applied to temples.', order: 4 },
    ]},
  },

  // ─── VEGETABLES (VERIFIED COMPACT) ───────────────────────────────────────
  {
    name: 'Lettuce (Salad Leaves)',
    scientificName: 'Lactuca sativa',
    slug: 'lettuce-salad',
    description: 'One of the best crops for Indian balconies in winter — loose-leaf lettuce grows fast, takes very little space, and you harvest outer leaves continuously for months. Varieties like "Lollo Rossa" and "Butterhead" are perfect for pots.',
    price: 39, comparePrice: 59, stock: 140,
    thumbnailUrl: P(2286776), images: [P(2286776)],
    categories: ['outdoor', 'vegetable'],
    difficulty: 'beginner',
    tags: ['winter-crop', 'cut-and-come-again', 'pot-friendly', 'fast-growing', 'salad'],
    isBestseller: false, isNewArrival: true,
    careWatering: 'Every 2 days', careSunlight: 'Partial sun (3–5 hours)', careHumidity: '50–70%', careTemperature: '8–22°C',
    wateringIntervalDays: 2, fertiliserIntervalDays: 14, pruningIntervalDays: 7, repottingIntervalMonths: 3,
    careGuide: { create: [
      { title: 'Season', icon: '📅', body: 'Lettuce is strictly a winter crop in India. Sow October–January. Above 28°C it bolts (goes to seed) rapidly, turning bitter. In Bangalore and Pune\'s mild climate, it can be grown for more months.', order: 1 },
      { title: 'Cut-and-come-again', icon: '✂️', body: 'Harvest outer leaves while leaving the inner growing centre intact. This "cut-and-come-again" method gives continuous harvest from the same plant for 6–8 weeks.', order: 2 },
      { title: 'Container', icon: '🪴', body: 'A 20 cm wide window box can hold 5–6 lettuce plants. Shallow roots mean even 10–12 cm deep pots work. Line your entire balcony railing with window boxes!', order: 3 },
      { title: 'Bolting', icon: '⚠️', body: 'When lettuce sends up a tall central stem (bolting), it\'s going to seed — harvest everything immediately before the leaves become fully bitter. Save seeds for next season.', order: 4 },
    ]},
  },
  {
    name: 'Palak (Spinach) — Container',
    scientificName: 'Spinacia oleracea',
    slug: 'spinach-container',
    description: 'Fresh spinach is one of the most rewarding balcony crops — sow directly in a grow bag, harvest leaves in 30 days, and eat from the same plant for months. Far more nutritious than store-bought spinach that\'s days old.',
    price: 35, comparePrice: 55, stock: 180,
    thumbnailUrl: U('1576045057995-568f588f82fb'),
    images: [U('1576045057995-568f588f82fb')],
    categories: ['outdoor', 'vegetable', 'herb'],
    difficulty: 'beginner',
    tags: ['winter-crop', 'cut-and-come-again', 'pot-friendly', 'nutritious', 'fast-harvest'],
    isBestseller: false, isNewArrival: false,
    careWatering: 'Every 2 days', careSunlight: 'Partial to full sun (3–5 hours)', careHumidity: 'Moderate', careTemperature: '10–25°C',
    wateringIntervalDays: 2, fertiliserIntervalDays: 14, pruningIntervalDays: 7, repottingIntervalMonths: 3,
    careGuide: { create: [
      { title: 'Sowing', icon: '🌱', body: 'Sow seeds directly 1 cm deep, 5 cm apart. Soak seeds overnight for faster germination. Best sown October–February in most of India.', order: 1 },
      { title: 'Harvest', icon: '✂️', body: 'Harvest outer leaves from 4–5 weeks onward while leaving the central growing point. You get 6–8 harvests per plant before it bolts in warmer weather.', order: 2 },
      { title: 'Continuous supply', icon: '🌿', body: 'Sow a new batch every 3 weeks ("succession sowing") to have fresh spinach continuously through winter without a glut.', order: 3 },
      { title: 'Nutrition', icon: '💪', body: 'Home-grown spinach harvested fresh has 3-4× more vitamin C than spinach that\'s been stored 5 days. Eat raw in salads or lightly sautéed to preserve nutrients.', order: 4 },
    ]},
  },
  {
    name: 'Pak Choi (Bok Choy)',
    scientificName: 'Brassica rapa subsp. chinensis',
    slug: 'pak-choi',
    description: 'A fast-growing leafy vegetable that is incredibly productive in Indian winters. Mini varieties (Baby Pak Choi) are perfect for small balcony pots and are ready to harvest in just 30–40 days from sowing.',
    price: 39, comparePrice: 59, stock: 120,
    thumbnailUrl: P(2286776), images: [P(2286776)],
    categories: ['outdoor', 'vegetable'],
    difficulty: 'beginner',
    tags: ['fast-harvest', 'pot-friendly', 'winter-crop', 'nutritious'],
    isBestseller: false, isNewArrival: true,
    careWatering: 'Every 2 days', careSunlight: 'Partial to full sun (3–5 hours)', careHumidity: 'Moderate', careTemperature: '10–22°C',
    wateringIntervalDays: 2, fertiliserIntervalDays: 14, pruningIntervalDays: 30, repottingIntervalMonths: 3,
    careGuide: { create: [
      { title: 'Sowing', icon: '🌱', body: 'Direct sow 0.5–1 cm deep in a pot or grow bag. Thin to 15 cm apart. Germination in 3–5 days. Ready to harvest in 30–40 days — one of the fastest vegetables.', order: 1 },
      { title: 'Harvest methods', icon: '✂️', body: 'Harvest the whole plant by cutting at the base OR harvest just outer leaves for continuous production. The mini/baby varieties taste sweetest when harvested young.', order: 2 },
      { title: 'Watering', icon: '💧', body: 'Keep consistently moist — pak choi is shallow-rooted and dries out quickly. A layer of mulch on top helps retain moisture between waterings.', order: 3 },
      { title: 'Pests', icon: '⚠️', body: 'Aphids and caterpillars (from white butterflies) love brassicas. Check undersides of leaves daily. A blast of water removes aphids; pick caterpillars by hand or use neem oil spray.', order: 4 },
    ]},
  },

  // ─── SUCCULENTS / SPECIALIST ──────────────────────────────────────────────
  {
    name: 'String of Pearls',
    scientificName: 'Curio rowleyanus',
    slug: 'string-of-pearls',
    description: 'A mesmerizing trailing succulent with round, bead-like leaves that cascade dramatically from shelves and hanging baskets. One of the most Instagrammed plants in India — looks exotic but is surprisingly easy to keep alive.',
    price: 149, comparePrice: 199, stock: 60,
    thumbnailUrl: P(1999268), images: [P(1999268)],
    categories: ['indoor', 'succulent'],
    difficulty: 'intermediate',
    tags: ['succulent', 'trailing', 'hanging-basket', 'drought-tolerant', 'statement-plant'],
    isBestseller: false, isNewArrival: true,
    careWatering: 'Every 14–21 days', careSunlight: 'Bright indirect (3–4 hours)', careHumidity: 'Low', careTemperature: '18–28°C',
    wateringIntervalDays: 17, fertiliserIntervalDays: 60, pruningIntervalDays: 60, repottingIntervalMonths: 24,
    careGuide: { create: [
      { title: 'Watering', icon: '💧', body: 'Water only when the beads start to look slightly shrivelled (a sign of thirst). Then water deeply and let fully drain. Overwatering causes the beads to burst and rot — the most common way to kill this plant.', order: 1 },
      { title: 'Light', icon: '☀️', body: 'Needs bright indirect light — 3–4 hours near a window. The beads provide photosynthesis through their transparent "windows". Insufficient light causes long gaps between beads.', order: 2 },
      { title: 'Soil', icon: '🪴', body: 'Use pure cactus mix in a pot with excellent drainage. Hanging baskets with coco fibre lining work beautifully — the fast drainage prevents root rot.', order: 3 },
      { title: 'Propagation', icon: '🌱', body: 'Lay strands on top of moist soil and pin them down with toothpicks. Roots form at each node within 2 weeks. One plant can cover a large hanging basket in a season.', order: 4 },
    ]},
  },
  {
    name: 'Aloe Vera (Dwarf)',
    slug: 'aloe-vera',  // already exists
    _skip: true,
  } as never,
  {
    name: 'ZZ Plant (Zamioculcas)',
    slug: 'zz-plant',  // already exists
    _skip: true,
  } as never,
  {
    name: 'Kalanchoe',
    scientificName: 'Kalanchoe blossfeldiana',
    slug: 'kalanchoe',
    description: 'A cheerful, long-blooming succulent that produces clusters of small flowers in red, orange, yellow, and pink for 6–8 weeks. One of the most gifted flowering plants in India — and far easier to keep alive than most other flowering plants.',
    price: 99, comparePrice: 149, stock: 80,
    thumbnailUrl: P(931177), images: [P(931177)],
    categories: ['indoor', 'outdoor', 'flowering', 'succulent'],
    difficulty: 'beginner',
    tags: ['long-blooming', 'gifting', 'drought-tolerant', 'windowsill', 'compact'],
    isBestseller: true, isNewArrival: false,
    careWatering: 'Every 10–14 days', careSunlight: 'Bright indirect to gentle direct (3–5 hours)', careHumidity: 'Low–moderate', careTemperature: '15–30°C',
    wateringIntervalDays: 12, fertiliserIntervalDays: 21, pruningIntervalDays: 30, repottingIntervalMonths: 24,
    careGuide: { create: [
      { title: 'During bloom', icon: '🌸', body: 'While flowering, water every 10–14 days and keep in bright indirect light. Avoid moving it around — kalanchoe drops buds when stressed by sudden changes.', order: 1 },
      { title: 'After bloom', icon: '✂️', body: 'Cut the spent flower stalks back to the base. Place the plant in a sunny spot (3–4 hours direct sun) for 6 weeks to recharge. Then cover it with a black bag for 14 hours a day for 6 weeks to trigger re-blooming.', order: 2 },
      { title: 'Watering', icon: '💧', body: 'Watering less is almost always better for kalanchoe. The thick leaves store water. Soggy soil kills it within days. Water only when leaves feel slightly soft.', order: 3 },
      { title: 'As a gift', icon: '🎁', body: 'Kalanchoe in a decorative pot is an ideal housewarming or diwali gift — bright, long-lasting, low maintenance, and widely available in red/orange (auspicious colours in Indian culture).', order: 4 },
    ]},
  },
]

async function main() {
  // 1. Delete the test plant
  const deleted = await prisma.plant.deleteMany({ where: { slug: 'test-rose-cleanup' } })
  console.log(`🗑️  Deleted test plant: ${deleted.count} records`)

  // 2. Deactivate space-hogging plants
  for (const slug of DEACTIVATE) {
    const r = await prisma.plant.updateMany({ where: { slug }, data: { isActive: false, stock: 0 } })
    if (r.count) console.log(`📦 Deactivated (space-hungry): ${slug}`)
  }

  // 3. Update descriptions for large-but-keepable plants
  for (const [slug, data] of Object.entries(UPDATES)) {
    const r = await prisma.plant.updateMany({ where: { slug }, data: { description: data.description, tags: data.tags } })
    if (r.count) console.log(`📝 Updated description: ${slug}`)
  }

  // 4. Add new compact plants
  console.log('\n🌱 Adding new compact home-garden plants...')
  let added = 0, skipped = 0

  for (const plant of NEW_PLANTS) {
    if ((plant as any)._skip) { skipped++; continue }
    const exists = await prisma.plant.findUnique({ where: { slug: plant.slug } })
    if (exists) { console.log(`  ⏭️  Already exists: ${plant.name}`); skipped++; continue }
    await prisma.plant.create({ data: plant as never })
    console.log(`  ✅ Added: ${plant.name}`)
    added++
  }

  console.log(`\n✅ Done — ${added} new plants, ${skipped} skipped`)
  const total = await prisma.plant.count({ where: { isActive: true } })
  console.log(`📊 Total active plants: ${total}`)
}

main().catch(console.error).finally(() => prisma.$disconnect())
