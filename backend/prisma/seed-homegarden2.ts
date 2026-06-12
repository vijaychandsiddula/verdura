/**
 * seed-homegarden2.ts — batch 2
 * 20 more plants for Indian metro home gardens.
 * Run: npx tsx prisma/seed-homegarden2.ts
 */

import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

const P = (id: number) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=600&h=600&fit=crop`
const U = (id: string) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=600&h=600&q=80`

const newPlants = [
  // ─── FLOWERING ───────────────────────────────────────────────────────────
  {
    name: 'Portulaca (Moss Rose)',
    scientificName: 'Portulaca grandiflora',
    slug: 'portulaca-moss-rose',
    description: 'Possibly the most low-maintenance balcony flowering plant in India. Portulaca thrives in blazing summer heat, requires almost no watering, and explodes in vivid pink, red, orange, yellow, and white blooms. Perfect for neglect-prone gardeners.',
    price: 39, comparePrice: 59, stock: 250,
    thumbnailUrl: P(2293374), images: [P(2293374)],
    categories: ['outdoor', 'flowering', 'succulent'],
    difficulty: 'beginner', tags: ['drought-tolerant', 'summer-bloomer', 'pot-friendly', 'fast-growing'],
    isBestseller: true, isNewArrival: false,
    careWatering: 'Every 4–5 days', careSunlight: 'Full sun (6+ hours)', careHumidity: 'Low', careTemperature: '25–42°C',
    wateringIntervalDays: 4, fertiliserIntervalDays: 21, pruningIntervalDays: 14, repottingIntervalMonths: 12,
    careGuide: { create: [
      { title: 'Watering', icon: '💧', body: 'Less is more — portulaca stores water in its succulent leaves. Water every 4–5 days and let the soil dry completely between waterings. In monsoon, barely water at all.', order: 1 },
      { title: 'Sunlight', icon: '☀️', body: 'Loves full, direct sun — the hotter the better. Blooms open in full sun and close at night. If it stops blooming, it needs more sun.', order: 2 },
      { title: 'Soil', icon: '🪴', body: 'Use the most free-draining soil you have — add 30% coarse sand or perlite. Portulaca rots in heavy, water-retaining soil. A shallow pot works fine.', order: 3 },
      { title: 'Propagation', icon: '🌱', body: 'Incredibly easy to propagate — snip a 5 cm stem cutting and push it into moist soil. Roots in 5–7 days. One plant becomes twenty in a season.', order: 4 },
    ]},
  },
  {
    name: 'Dahlia',
    scientificName: 'Dahlia pinnata',
    slug: 'dahlia',
    description: 'A showstopper for Indian winter gardens (October–February). Dahlias produce stunning, large flowers in almost every colour imaginable — from small pompon types to dinner-plate varieties. Grow beautifully in pots on balconies.',
    price: 99, comparePrice: 149, stock: 80,
    thumbnailUrl: P(931177), images: [P(931177)],
    categories: ['outdoor', 'flowering'],
    difficulty: 'intermediate', tags: ['winter-bloomer', 'pot-friendly', 'cut-flower', 'fragrant'],
    isBestseller: false, isNewArrival: true,
    careWatering: 'Every 2–3 days', careSunlight: 'Full sun (5–6 hours)', careHumidity: '50–60%', careTemperature: '10–25°C',
    wateringIntervalDays: 2, fertiliserIntervalDays: 14, pruningIntervalDays: 21, repottingIntervalMonths: 12,
    careGuide: { create: [
      { title: 'Planting tubers', icon: '🌱', body: 'Plant tubers in September–October (North India) or October–November (South India). Place 5–8 cm deep, eye facing up. Do not water until sprouts appear.', order: 1 },
      { title: 'Pinching', icon: '✂️', body: 'Pinch out the central growing tip when 20–25 cm tall. This forces 4–6 side branches and far more blooms than a single central stem.', order: 2 },
      { title: 'Watering', icon: '💧', body: 'Water when the top 3 cm of soil is dry. Dahlias hate waterlogged roots — ensure the pot drains freely. Stop watering when leaves yellow after blooming.', order: 3 },
      { title: 'Fertilising', icon: '🧪', body: 'Feed with a low-nitrogen, high-potassium fertiliser every 2 weeks once buds form. Too much nitrogen produces lush foliage but fewer flowers.', order: 4 },
      { title: 'After season', icon: '🌿', body: 'After flowering, let the plant die back naturally. Dig up tubers, dry for 2–3 days, and store in a cool, dry place until the next planting season.', order: 5 },
    ]},
  },
  {
    name: 'Petunia',
    scientificName: 'Petunia × hybrida',
    slug: 'petunia',
    description: 'One of the most popular balcony plants worldwide — and perfect for Indian winters. Petunias cascade beautifully from hanging baskets and window boxes, blooming in purple, pink, red, white, and bi-colours for months.',
    price: 59, comparePrice: 89, stock: 150,
    thumbnailUrl: P(2293374), images: [P(2293374)],
    categories: ['outdoor', 'flowering'],
    difficulty: 'beginner', tags: ['hanging-basket', 'winter-bloomer', 'pot-friendly', 'fragrant'],
    isBestseller: false, isNewArrival: false,
    careWatering: 'Every 2 days', careSunlight: 'Full sun (5+ hours)', careHumidity: '40–60%', careTemperature: '10–28°C',
    wateringIntervalDays: 2, fertiliserIntervalDays: 10, pruningIntervalDays: 14, repottingIntervalMonths: 12,
    careGuide: { create: [
      { title: 'Season', icon: '📅', body: 'Grow from October through March in most Indian cities. Petunias suffer in peak summer heat above 35°C and need to be replaced seasonally.', order: 1 },
      { title: 'Deadheading', icon: '✂️', body: 'Remove spent flowers every 2–3 days to keep new buds coming. This single habit extends the blooming period significantly.', order: 2 },
      { title: 'Watering', icon: '💧', body: 'Water at the base — wet petals cause grey mould. Allow the top layer to dry slightly. In hanging baskets, check moisture daily as they dry out faster.', order: 3 },
      { title: 'Fertilising', icon: '🧪', body: 'Feed with a balanced liquid fertiliser every 10 days. Petunias are heavy feeders — skipping fertiliser causes pale leaves and fewer flowers.', order: 4 },
    ]},
  },
  {
    name: 'Ixora (Jungle Geranium)',
    scientificName: 'Ixora coccinea',
    slug: 'ixora-jungle-geranium',
    description: 'A quintessentially Indian flowering shrub with dense clusters of bright red, orange, or pink flowers. Blooms year-round in warm climates, thrives in pots, and is one of the most low-maintenance flowering plants for Indian balconies.',
    price: 89, comparePrice: 129, stock: 90,
    thumbnailUrl: P(2293374), images: [P(2293374)],
    categories: ['outdoor', 'flowering', 'tropical'],
    difficulty: 'beginner', tags: ['year-round-bloomer', 'pot-friendly', 'tropical', 'fragrant'],
    isBestseller: false, isNewArrival: false,
    careWatering: 'Every 3 days', careSunlight: 'Full sun to partial shade (4–6 hours)', careHumidity: '60–80%', careTemperature: '18–35°C',
    wateringIntervalDays: 3, fertiliserIntervalDays: 21, pruningIntervalDays: 60, repottingIntervalMonths: 18,
    careGuide: { create: [
      { title: 'Watering', icon: '💧', body: 'Keep soil consistently moist but not waterlogged. Ixora likes slightly acidic, moist soil — mulch the surface to retain moisture and prevent pH from rising.', order: 1 },
      { title: 'Sunlight', icon: '☀️', body: 'Blooms best in full sun. Will tolerate partial shade but with fewer flowers. South or east-facing balconies are ideal.', order: 2 },
      { title: 'Soil pH', icon: '🧪', body: 'Ixora needs slightly acidic soil (pH 5–6). If leaves turn yellow between the veins (chlorosis), your soil is too alkaline — add garden sulphur or repot with an acidic mix.', order: 3 },
      { title: 'Pruning', icon: '✂️', body: 'Light pruning after each flush of flowers keeps the plant compact and encourages new blooming branches. Do not cut into old, woody stems aggressively.', order: 4 },
    ]},
  },
  {
    name: 'Coleus',
    scientificName: 'Plectranthus scutellarioides',
    slug: 'coleus',
    description: 'A foliage superstar for shaded balconies and north-facing windows. Coleus has spectacular multicoloured leaves — red, purple, green, yellow, pink — that provide colour where flowers cannot grow. Grows vigorously and propagates effortlessly.',
    price: 49, comparePrice: 79, stock: 130,
    thumbnailUrl: P(4503273), images: [P(4503273)],
    categories: ['indoor', 'outdoor'],
    difficulty: 'beginner', tags: ['shade-tolerant', 'colourful-foliage', 'pot-friendly', 'propagates-easily'],
    isBestseller: false, isNewArrival: true,
    careWatering: 'Every 2–3 days', careSunlight: 'Bright indirect to partial shade (2–4 hours)', careHumidity: '50–70%', careTemperature: '18–32°C',
    wateringIntervalDays: 2, fertiliserIntervalDays: 21, pruningIntervalDays: 14, repottingIntervalMonths: 12,
    careGuide: { create: [
      { title: 'Light & colour', icon: '☀️', body: 'Colour intensity depends on light: bright indirect light gives the most vivid colours. Deep shade turns leaves mostly green. Direct harsh afternoon sun scorches the leaves.', order: 1 },
      { title: 'Pinching', icon: '✂️', body: 'Pinch out flower spikes as soon as they appear — flowering reduces leaf colour and makes the plant leggy. Keep pinching growing tips to maintain a bushy, full plant.', order: 2 },
      { title: 'Watering', icon: '💧', body: 'Coleus wilts dramatically when thirsty but recovers quickly after watering — use wilting as a watering cue. Keep soil moist but not waterlogged.', order: 3 },
      { title: 'Propagation', icon: '🌱', body: 'Place any stem cutting in a glass of water — roots appear in 7–10 days. Transfer to soil once roots are 2–3 cm long. Share unlimited plants with friends.', order: 4 },
    ]},
  },

  // ─── HERBS & MEDICINAL ───────────────────────────────────────────────────
  {
    name: 'Sweet Basil',
    scientificName: 'Ocimum basilicum',
    slug: 'sweet-basil',
    description: 'The kitchen herb everyone should grow on their windowsill. Fresh basil leaves elevate pasta, pizzas, salads, and teas instantly. Grows quickly in any small pot and gives continuously harvested leaves for months.',
    price: 49, comparePrice: 69, stock: 160,
    thumbnailUrl: P(1072824), images: [P(1072824)],
    categories: ['outdoor', 'herb'],
    difficulty: 'beginner', tags: ['culinary', 'fast-growing', 'pot-friendly', 'fragrant'],
    isBestseller: true, isNewArrival: false,
    careWatering: 'Every 2 days', careSunlight: 'Full sun to bright indirect (4–6 hours)', careHumidity: '50–70%', careTemperature: '20–35°C',
    wateringIntervalDays: 2, fertiliserIntervalDays: 21, pruningIntervalDays: 7, repottingIntervalMonths: 6,
    careGuide: { create: [
      { title: 'Harvesting', icon: '✂️', body: 'Always harvest from the top — snip just above a leaf pair. Never strip an entire branch. Regular harvesting keeps the plant bushy and delays flowering.', order: 1 },
      { title: 'Pinch flowers', icon: '🌸', body: 'Remove flower buds as soon as they appear. Once basil flowers, the leaves become smaller and more bitter. Keep pinching to extend the harvest season.', order: 2 },
      { title: 'Watering', icon: '💧', body: 'Basil likes moist soil — check daily in summer. Water at the base, not on leaves. Wilting in the heat of the day is normal; check if it recovers in the evening before watering.', order: 3 },
      { title: 'Pot tip', icon: '🪴', body: 'A 6-inch pot works, but a 10-inch pot gives much better yield. Plant 2–3 seedlings together for a full, productive plant. Refresh with new plants every season.', order: 4 },
    ]},
  },
  {
    name: 'Brahmi (Bacopa)',
    scientificName: 'Bacopa monnieri',
    slug: 'brahmi-bacopa',
    description: 'A revered Ayurvedic medicinal herb known for enhancing memory and reducing stress. Brahmi thrives in moist conditions and even grows in shallow water trays — perfect for a windowsill or kitchen counter.',
    price: 69, comparePrice: 99, stock: 80,
    thumbnailUrl: P(3076899), images: [P(3076899)],
    categories: ['indoor', 'herb'],
    difficulty: 'beginner', tags: ['medicinal', 'ayurvedic', 'water-loving', 'low-light'],
    isBestseller: false, isNewArrival: true,
    careWatering: 'Keep consistently moist', careSunlight: 'Partial shade (2–4 hours)', careHumidity: 'High (60–80%)', careTemperature: '20–35°C',
    wateringIntervalDays: 1, fertiliserIntervalDays: 30, pruningIntervalDays: 14, repottingIntervalMonths: 12,
    careGuide: { create: [
      { title: 'Watering', icon: '💧', body: 'Brahmi loves water — it naturally grows in marshy areas. Keep the soil constantly moist. You can even place the pot in a shallow tray of water. This is one plant you cannot overwater.', order: 1 },
      { title: 'Light', icon: '☀️', body: 'Prefers bright indirect light or partial shade. Harsh direct sun in Indian summers can burn the delicate leaves. A north or east-facing windowsill is ideal.', order: 2 },
      { title: 'Harvesting', icon: '✂️', body: 'Harvest young leaves and stems regularly. Consume fresh — add to chutneys, juices, or salads. Dry and powder for use in health tonics.', order: 3 },
      { title: 'Medicinal use', icon: '🌿', body: 'Chew 5–10 fresh leaves daily or make brahmi tea. Traditionally used for memory, focus, anxiety, and as a nerve tonic. Consult an Ayurvedic practitioner for therapeutic doses.', order: 4 },
    ]},
  },
  {
    name: 'Ashwagandha',
    scientificName: 'Withania somnifera',
    slug: 'ashwagandha',
    description: 'India\'s most famous Ayurvedic adaptogen, grown in a pot. Ashwagandha is a hardy, drought-tolerant shrub — grow it on a sunny terrace and harvest the roots and leaves for health use.',
    price: 99, comparePrice: 149, stock: 60,
    thumbnailUrl: P(2286776), images: [P(2286776)],
    categories: ['outdoor', 'herb'],
    difficulty: 'beginner', tags: ['medicinal', 'ayurvedic', 'drought-tolerant', 'superfood'],
    isBestseller: false, isNewArrival: true,
    careWatering: 'Every 5–7 days', careSunlight: 'Full sun (5+ hours)', careHumidity: 'Low', careTemperature: '20–40°C',
    wateringIntervalDays: 6, fertiliserIntervalDays: 30, pruningIntervalDays: 60, repottingIntervalMonths: 12,
    careGuide: { create: [
      { title: 'Sowing', icon: '🌱', body: 'Sow seeds in March–April or August–September. Germination in 7–14 days. Thin to one plant per 12-inch pot once established. Ashwagandha is very forgiving.', order: 1 },
      { title: 'Watering', icon: '💧', body: 'Extremely drought-tolerant — water only when the soil is completely dry. Overwatering causes root rot. A deep, well-draining pot is essential.', order: 2 },
      { title: 'Harvest', icon: '✂️', body: 'Harvest roots after 6–8 months when the plant begins to dry out and berries turn red. Wash, slice, and dry the roots in shade. Powder for use in milk (ashwagandha latte).', order: 3 },
      { title: 'Medicinal use', icon: '🌿', body: 'Leaves can be used in poultice form. Root powder is the primary medicinal part — used for stress, energy, immunity, and sleep. Start with 1/4 tsp in warm milk at night.', order: 4 },
    ]},
  },
  {
    name: 'Giloy (Guduchi)',
    scientificName: 'Tinospora cordifolia',
    slug: 'giloy-guduchi',
    description: 'Giloy became a household name during COVID-19 for its powerful immune-boosting properties. This vigorous climber grows fast on a balcony trellis or on a host tree, requiring minimal care.',
    price: 79, comparePrice: 119, stock: 70,
    thumbnailUrl: P(2286776), images: [P(2286776)],
    categories: ['outdoor', 'herb'],
    difficulty: 'beginner', tags: ['immunity-booster', 'medicinal', 'climber', 'fast-growing'],
    isBestseller: true, isNewArrival: false,
    careWatering: 'Every 3 days', careSunlight: 'Partial to full sun (3–6 hours)', careHumidity: 'Moderate to high', careTemperature: '20–40°C',
    wateringIntervalDays: 3, fertiliserIntervalDays: 30, pruningIntervalDays: 30, repottingIntervalMonths: 18,
    careGuide: { create: [
      { title: 'Planting', icon: '🌱', body: 'Grows easily from 15–20 cm stem cuttings. Press the cutting into moist soil — it roots in 10–14 days. Giloy can also grow on/from a neem tree; growing with neem is said to enhance its medicinal properties.', order: 1 },
      { title: 'Support', icon: '🌿', body: 'Provide a trellis, bamboo support, or let it climb along a railing. It grows rapidly and produces aerial roots — a balcony grill works perfectly.', order: 2 },
      { title: 'Harvest', icon: '✂️', body: 'Harvest the stems (6–8 months after planting) and mature leaves. The stem is the main medicinal part — cut into 2-inch pieces for use.', order: 3 },
      { title: 'Medicinal use', icon: '🌿', body: 'Boil 3–4 stem pieces in 2 cups of water until reduced to half. Drink as kadha for immunity, fever, and inflammation. Can also be juiced fresh or dried and powdered.', order: 4 },
    ]},
  },

  // ─── VEGETABLES ──────────────────────────────────────────────────────────
  {
    name: 'Cherry Tomato',
    scientificName: 'Solanum lycopersicum var. cerasiforme',
    slug: 'cherry-tomato',
    description: 'The perfect pot tomato — compact plants produce hundreds of sweet bite-sized fruits. Cherry tomatoes are more heat-tolerant and disease-resistant than large tomatoes, making them the best choice for Indian home gardens.',
    price: 69, comparePrice: 99, stock: 140,
    thumbnailUrl: P(3735739), images: [P(3735739)],
    categories: ['outdoor', 'vegetable'],
    difficulty: 'beginner', tags: ['high-yield', 'pot-friendly', 'grow-bag', 'kids-favourite'],
    isBestseller: true, isNewArrival: false,
    careWatering: 'Every 2 days', careSunlight: 'Full sun (6+ hours)', careHumidity: '50–70%', careTemperature: '20–32°C',
    wateringIntervalDays: 2, fertiliserIntervalDays: 14, pruningIntervalDays: 14, repottingIntervalMonths: 6,
    careGuide: { create: [
      { title: 'Container', icon: '🪴', body: 'Use a 15L grow bag or a 12-inch deep pot. Indeterminate (vining) varieties need a stake or cage from early on. Bush/determinate varieties are more compact and pot-friendly.', order: 1 },
      { title: 'Watering', icon: '💧', body: 'Consistent watering is crucial — irregular watering causes blossom end rot and fruit cracking. Water daily in summer. Mulch the surface to retain moisture.', order: 2 },
      { title: 'Suckers', icon: '✂️', body: 'Remove "suckers" — the shoots growing in the V-junction between main stem and branch. This directs energy into fruit. Leave 2–3 main stems for better yield.', order: 3 },
      { title: 'Fertilising', icon: '🧪', body: 'Feed with NPK 19:19:19 every 2 weeks until flowering, then switch to a high-potassium feed (like NPK 13:0:45) for better fruit size and sweetness.', order: 4 },
      { title: 'Harvest', icon: '🍅', body: 'Harvest when fully coloured and slightly soft to touch. Cherry tomatoes continue ripening off the vine — pick clusters when most fruits are ripe.', order: 5 },
    ]},
  },
  {
    name: 'Beetroot',
    scientificName: 'Beta vulgaris',
    slug: 'beetroot',
    description: 'A nutrient powerhouse that grows surprisingly well in pots and grow bags. Beetroot is one of the few root vegetables perfectly suited to container gardening — the entire plant is edible, including the leaves.',
    price: 39, comparePrice: 59, stock: 120,
    thumbnailUrl: P(1435904), images: [P(1435904)],
    categories: ['outdoor', 'vegetable'],
    difficulty: 'beginner', tags: ['pot-friendly', 'nutritious', 'fast-growing', 'edible-leaves'],
    isBestseller: false, isNewArrival: true,
    careWatering: 'Every 2 days', careSunlight: 'Full sun to partial shade (3–5 hours)', careHumidity: 'Moderate', careTemperature: '10–25°C',
    wateringIntervalDays: 2, fertiliserIntervalDays: 14, pruningIntervalDays: 30, repottingIntervalMonths: 6,
    careGuide: { create: [
      { title: 'Sowing', icon: '🌱', body: 'Sow seeds directly — beetroot doesn\'t like transplanting. 1 cm deep, 5–8 cm apart. Best sown October–February. Each "seed" is actually a cluster of 2–3 seeds — thin to 1 seedling per cluster.', order: 1 },
      { title: 'Pot depth', icon: '🪴', body: 'Needs at least 25–30 cm deep pot or grow bag for roots to develop fully. Shallow containers produce only the greens, not the root.', order: 2 },
      { title: 'Watering', icon: '💧', body: 'Keep soil consistently moist. Dry spells cause woody, tough roots. Regular watering = tender, sweet beetroots.', order: 3 },
      { title: 'Harvest', icon: '✂️', body: 'Ready in 50–70 days when shoulders push above the soil. Pull a test beet — should be golf-ball to tennis-ball size. Leaves can be harvested continuously from 4 weeks onward.', order: 4 },
    ]},
  },
  {
    name: 'Carrot',
    scientificName: 'Daucus carota',
    slug: 'carrot',
    description: 'Crunchy, sweet, home-grown carrots taste nothing like store-bought. Miniature and round varieties like Chantenay and Parisian make container growing easy — even 25 cm deep pots work perfectly.',
    price: 39, comparePrice: 59, stock: 100,
    thumbnailUrl: P(1435904), images: [P(1435904)],
    categories: ['outdoor', 'vegetable'],
    difficulty: 'beginner', tags: ['pot-friendly', 'kids-favourite', 'fast-growing', 'nutritious'],
    isBestseller: false, isNewArrival: false,
    careWatering: 'Every 2 days', careSunlight: 'Full sun (4–6 hours)', careHumidity: 'Moderate', careTemperature: '10–25°C',
    wateringIntervalDays: 2, fertiliserIntervalDays: 21, pruningIntervalDays: 60, repottingIntervalMonths: 6,
    careGuide: { create: [
      { title: 'Variety selection', icon: '🌱', body: 'For pots, choose short varieties: Chantenay (15 cm), Little Finger (10 cm), or round "Paris Market" types. Long varieties need 40+ cm pots and are not pot-friendly.', order: 1 },
      { title: 'Soil prep', icon: '🪴', body: 'Carrots need loose, stone-free, deeply dug soil. Mix in coarse sand to lighten the soil. Hard or rocky soil produces forked, misshapen roots.', order: 2 },
      { title: 'Thinning', icon: '✂️', body: 'Thin to 5 cm spacing once 5 cm tall. Crowded carrots produce stunted roots. Eat the thinnings as microgreens — they taste like carrot tops.', order: 3 },
      { title: 'Harvest', icon: '🥕', body: 'Pull a test carrot at 60–70 days. Harvest when shoulders are 1–2 cm wide. Leaving too long makes them woody. Loosen soil around the root before pulling.', order: 4 },
    ]},
  },
  {
    name: 'Chilli (Mirchi)',
    scientificName: 'Capsicum annuum',
    slug: 'chilli-mirchi',
    description: 'The most essential plant in any Indian kitchen garden! Chilli plants produce prolifically in pots and grow bags, giving hundreds of fresh green and red chillies all year. Choose from mild, medium, or fiery hot varieties.',
    price: 49, comparePrice: 69, stock: 200,
    thumbnailUrl: P(1999268), images: [P(1999268)],
    categories: ['outdoor', 'vegetable', 'herb'],
    difficulty: 'beginner', tags: ['kitchen-essential', 'high-yield', 'pot-friendly', 'year-round'],
    isBestseller: true, isNewArrival: false,
    careWatering: 'Every 2 days', careSunlight: 'Full sun (5+ hours)', careHumidity: '50–70%', careTemperature: '20–35°C',
    wateringIntervalDays: 2, fertiliserIntervalDays: 14, pruningIntervalDays: 30, repottingIntervalMonths: 12,
    careGuide: { create: [
      { title: 'Varieties', icon: '🌶️', body: 'Choose based on heat preference: Jwala (fiery, thin), Bhavnagari (mild, fat), Byadagi (flavourful, South Indian), or Bird\'s Eye (tiny, extremely hot). Most grow equally well in pots.', order: 1 },
      { title: 'Watering', icon: '💧', body: 'Keep soil consistently moist — chillies that dry out drop flowers and fruits. Water daily in summer. Ensure excellent drainage; waterlogging causes root rot.', order: 2 },
      { title: 'Fertilising', icon: '🧪', body: 'Feed every 2 weeks. Use nitrogen-rich feed early for plant establishment, then switch to phosphorus-potassium when flowering begins.', order: 3 },
      { title: 'Harvest', icon: '✂️', body: 'Pick green chillies early and often — this encourages the plant to produce more. Leaving chillies to ripen red signals the plant to slow production.', order: 4 },
    ]},
  },
  {
    name: 'Peas (Matar)',
    scientificName: 'Pisum sativum',
    slug: 'peas-matar',
    description: 'Sweet, crunchy, fresh-from-the-pod peas are an unmatched winter delight. Pea plants climb a simple string trellis beautifully on a balcony and reward you with abundant pods in just 60–70 days.',
    price: 39, comparePrice: 59, stock: 130,
    thumbnailUrl: P(3735739), images: [P(3735739)],
    categories: ['outdoor', 'vegetable'],
    difficulty: 'beginner', tags: ['winter-crop', 'pot-friendly', 'fast-growing', 'vertical-grow'],
    isBestseller: false, isNewArrival: false,
    careWatering: 'Every 2–3 days', careSunlight: 'Full sun (4–6 hours)', careHumidity: '50–70%', careTemperature: '7–22°C',
    wateringIntervalDays: 2, fertiliserIntervalDays: 21, pruningIntervalDays: 30, repottingIntervalMonths: 6,
    careGuide: { create: [
      { title: 'Season', icon: '📅', body: 'Sow November–January. Peas need cool temperatures and stop producing once heat arrives. The cold Indian winter is perfect — an October sowing in hills, November in plains.', order: 1 },
      { title: 'Support', icon: '🌿', body: 'Peas climb via tendrils — run a few strings or use a small mesh trellis. Even 60 cm tall stakes work for dwarf varieties. Without support, plants sprawl and pods get dirty.', order: 2 },
      { title: 'Watering', icon: '💧', body: 'Water every 2–3 days. Peas like moist but not wet soil. Overwatering causes yellowing leaves and root rot in cool weather.', order: 3 },
      { title: 'Harvest', icon: '✂️', body: 'Pods are ready when swollen and bright green — usually 60–70 days from sowing. Taste one! Overripe peas become starchy. Harvest every 2–3 days to keep pods coming.', order: 4 },
    ]},
  },

  // ─── SUCCULENTS & INDOOR ─────────────────────────────────────────────────
  {
    name: 'Echeveria (Succulent)',
    scientificName: 'Echeveria spp.',
    slug: 'echeveria-succulent',
    description: 'The most popular succulent in India — rosette-shaped, pastel-coloured, and virtually indestructible. Echeverias look beautiful in terrariums, small pots, and windowsill arrangements. Perfect for beginners who tend to overwater.',
    price: 79, comparePrice: 129, stock: 150,
    thumbnailUrl: P(1999268), images: [P(1999268)],
    categories: ['indoor', 'succulent'],
    difficulty: 'beginner', tags: ['succulent', 'drought-tolerant', 'windowsill', 'low-maintenance'],
    isBestseller: true, isNewArrival: false,
    careWatering: 'Every 14 days', careSunlight: 'Bright indirect to direct (3–5 hours)', careHumidity: 'Low', careTemperature: '15–30°C',
    wateringIntervalDays: 14, fertiliserIntervalDays: 60, pruningIntervalDays: 90, repottingIntervalMonths: 24,
    careGuide: { create: [
      { title: 'Watering', icon: '💧', body: '"Soak and dry" method: water deeply until it drains from the bottom, then do not water again until the soil is completely bone-dry. In Indian winters, this may be once every 3 weeks.', order: 1 },
      { title: 'Light', icon: '☀️', body: '3–5 hours of bright light or direct morning sun. Insufficient light causes "etiolation" — the rosette stretches upward and loses its compact shape. Once stretched, it cannot be reversed.', order: 2 },
      { title: 'Soil', icon: '🪴', body: 'Use cactus mix or add 50% perlite to regular soil. The worst thing for echeveria is soil that holds moisture. A terracotta or unglazed ceramic pot wicks away moisture best.', order: 3 },
      { title: 'Propagation', icon: '🌱', body: 'Leaves propagate easily: twist a leaf cleanly off, let it dry for 2 days, then place on top of dry soil. Tiny rosettes emerge from the base in 2–3 weeks. One plant gives dozens of babies.', order: 4 },
    ]},
  },
  {
    name: 'Cactus (Assorted)',
    scientificName: 'Cactaceae family',
    slug: 'cactus-assorted',
    description: 'The ultimate zero-maintenance plant for busy city dwellers. Cacti can survive weeks without water, love Indian heat, and come in fascinating shapes — barrel, columnar, globular, and more. One watering every 2–3 weeks in summer.',
    price: 59, comparePrice: 99, stock: 200,
    thumbnailUrl: P(1999268), images: [P(1999268)],
    categories: ['indoor', 'outdoor', 'succulent'],
    difficulty: 'beginner', tags: ['drought-tolerant', 'low-maintenance', 'windowsill', 'long-lived'],
    isBestseller: false, isNewArrival: false,
    careWatering: 'Every 14–21 days', careSunlight: 'Full sun (4+ hours)', careHumidity: 'Low', careTemperature: '15–45°C',
    wateringIntervalDays: 17, fertiliserIntervalDays: 60, pruningIntervalDays: 180, repottingIntervalMonths: 36,
    careGuide: { create: [
      { title: 'Watering', icon: '💧', body: 'Water every 2–3 weeks in summer, once a month in winter, almost never in monsoon (unless indoors). The rule: when in doubt, do not water. Overwatering is always fatal; underwatering is almost never fatal.', order: 1 },
      { title: 'Light', icon: '☀️', body: 'Needs maximum light — south-facing windowsill or balcony. A cactus in low light will survive but slowly etiolate (stretch) and never bloom. Outdoors in direct Indian sun is ideal.', order: 2 },
      { title: 'Soil & pot', icon: '🪴', body: 'Use pure cactus mix or make your own: 1 part soil + 2 parts coarse sand + 1 part perlite. Never use heavy potting mix. A terracotta pot with a drainage hole is essential.', order: 3 },
      { title: 'Handling', icon: '⚠️', body: 'Use thick gloves or wrap a folded newspaper around the cactus when repotting. A long kitchen tong works well. Spine injuries are painful but rarely serious.', order: 4 },
    ]},
  },
  {
    name: 'Tradescantia (Wandering Dude)',
    scientificName: 'Tradescantia zebrina',
    slug: 'tradescantia-wandering-dude',
    description: 'A stunning trailing plant with iridescent purple and green striped leaves. Perfect for hanging baskets on balconies and shelves. Extremely forgiving, propagates in water, and grows so fast you\'ll be giving cuttings away.',
    price: 59, comparePrice: 89, stock: 110,
    thumbnailUrl: P(4503273), images: [P(4503273)],
    categories: ['indoor', 'outdoor'],
    difficulty: 'beginner', tags: ['trailing', 'hanging-basket', 'fast-growing', 'propagates-easily'],
    isBestseller: false, isNewArrival: true,
    careWatering: 'Every 5–7 days', careSunlight: 'Bright indirect (2–4 hours)', careHumidity: '40–60%', careTemperature: '15–32°C',
    wateringIntervalDays: 6, fertiliserIntervalDays: 30, pruningIntervalDays: 21, repottingIntervalMonths: 18,
    careGuide: { create: [
      { title: 'Light & colour', icon: '☀️', body: 'More light = more vivid purple stripes. In low light, the purple fades to mostly green. Bright indirect light from a south or west window maintains the best colour.', order: 1 },
      { title: 'Watering', icon: '💧', body: 'Water when the top 2 cm of soil is dry. Tolerates some neglect. Leaves curl slightly when very thirsty — a good visual cue.', order: 2 },
      { title: 'Pruning', icon: '✂️', body: 'Stems become leggy over time — pinch back regularly to encourage density. Use the cut pieces as cuttings; they root in 7–10 days in water.', order: 3 },
      { title: 'Propagation', icon: '🌱', body: 'Place 10 cm cuttings in a glass of water. Roots appear in 7–10 days. Transfer to soil once roots are 3 cm long. Possibly the easiest plant to propagate in water.', order: 4 },
    ]},
  },
  {
    name: 'Philodendron',
    scientificName: 'Philodendron hederaceum',
    slug: 'philodendron',
    description: 'A lush, heart-leaved climber that is one of the most popular indoor plants in Indian homes. Philodendrons trail beautifully from shelves, climb moss poles, and adapt to a wide range of light conditions — forgiving and fast-growing.',
    price: 129, comparePrice: 179, stock: 90,
    thumbnailUrl: P(4503273), images: [P(4503273)],
    categories: ['indoor', 'air_purifying'],
    difficulty: 'beginner', tags: ['air-purifier', 'trailing', 'low-light', 'fast-growing'],
    isBestseller: false, isNewArrival: false,
    careWatering: 'Every 7 days', careSunlight: 'Bright indirect (2–4 hours)', careHumidity: '50–70%', careTemperature: '18–30°C',
    wateringIntervalDays: 7, fertiliserIntervalDays: 30, pruningIntervalDays: 60, repottingIntervalMonths: 18,
    careGuide: { create: [
      { title: 'Watering', icon: '💧', body: 'Water when the top 3–4 cm of soil is dry. Yellow leaves usually mean overwatering; brown, crispy tips mean underwatering or low humidity.', order: 1 },
      { title: 'Light', icon: '☀️', body: 'Adaptable to low light, but grows fastest and has the largest leaves in bright indirect light. Direct sun scorches the leaves. A position 1–2 metres from a bright window is ideal.', order: 2 },
      { title: 'Climbing vs trailing', icon: '🌿', body: 'Provide a moss pole or coir stick for larger, more mature leaves (aerial roots attach to it). Or let it trail from a shelf for a cascading effect — both work well.', order: 3 },
      { title: 'Humidity', icon: '💨', body: 'Indian homes are humid enough for philodendrons to thrive without misting. In air-conditioned rooms, occasional misting or a pebble tray with water helps.', order: 4 },
    ]},
  },
]

async function main() {
  console.log(`🌱 Adding ${newPlants.length} more home-garden plants (batch 2)...`)
  let added = 0, skipped = 0

  for (const plant of newPlants) {
    const exists = await prisma.plant.findUnique({ where: { slug: plant.slug } })
    if (exists) { console.log(`  ⏭️  Already exists: ${plant.name}`); skipped++; continue }
    await prisma.plant.create({ data: plant as never })
    console.log(`  ✅ Added: ${plant.name}`)
    added++
  }

  console.log(`\n✅ Done — ${added} new plants added, ${skipped} already existed`)
  const total = await prisma.plant.count({ where: { isActive: true } })
  console.log(`📊 Total active plants in catalog: ${total}`)
}

main().catch(console.error).finally(() => prisma.$disconnect())
