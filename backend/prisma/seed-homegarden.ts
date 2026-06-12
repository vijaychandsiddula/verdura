/**
 * seed-homegarden.ts
 * Adds 18 new plants perfectly suited for Indian metro home gardens —
 * balconies, terraces, grow bags, pots, and small lawns.
 *
 * Run: npx tsx prisma/seed-homegarden.ts
 */

import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

const U = (id: string) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=600&h=600&q=80`
const P = (id: number) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=600&h=600&fit=crop`

const newPlants = [
  // ─── FLOWERING / BALCONY ─────────────────────────────────────────────────
  {
    name: 'Marigold (Genda)',
    scientificName: 'Tagetes erecta',
    slug: 'marigold-genda',
    description: 'The quintessential Indian balcony flower. Marigolds bloom bright orange and yellow for months, repel pests naturally, and grow happily in any pot or grow bag. A must-have for every Indian home.',
    price: 49, comparePrice: 79, stock: 200,
    thumbnailUrl: P(3976258), images: [P(3976258)],
    categories: ['outdoor', 'flowering'],
    difficulty: 'beginner', tags: ['pest-repellent', 'fast-growing', 'pot-friendly'],
    isBestseller: true, isNewArrival: false,
    careWatering: 'Every 2–3 days', careSunlight: 'Full sun (5+ hours)', careHumidity: 'Low–moderate', careTemperature: '15–35°C',
    wateringIntervalDays: 2, fertiliserIntervalDays: 14, pruningIntervalDays: 21, repottingIntervalMonths: 12,
    careGuide: { create: [
      { title: 'Watering', icon: '💧', body: 'Water when the top layer of soil feels dry. Avoid waterlogging — marigolds hate wet feet. In summer, water daily in the morning. In cooler months, every 2–3 days.', order: 1 },
      { title: 'Sunlight', icon: '☀️', body: 'Needs at least 5–6 hours of direct sunlight. Perfect for south or west-facing balconies. Less sun means fewer blooms.', order: 2 },
      { title: 'Pinching & Deadheading', icon: '✂️', body: 'Pinch off the growing tip when seedlings have 3–4 sets of leaves to encourage bushiness. Remove dead flowers to keep new blooms coming.', order: 3 },
      { title: 'Fertilising', icon: '🧪', body: 'Use a bloom booster (high phosphorus) every 2 weeks once buds appear. Too much nitrogen gives lush leaves but fewer flowers.', order: 4 },
      { title: 'Pot & grow-bag tip', icon: '🪴', body: 'A 6–8 inch pot or a 5L grow bag per plant works perfectly. Use well-draining potting mix. Terracotta pots are ideal.', order: 5 },
    ]},
  },
  {
    name: 'Rose',
    scientificName: 'Rosa × hybrida',
    slug: 'rose-hybrid',
    description: 'Roses thrive in Indian balconies and small garden beds. The right variety — miniature or hybrid tea — flowers repeatedly through the year except peak summer. With a little love, nothing rewards more beautifully.',
    price: 149, comparePrice: 199, stock: 80,
    thumbnailUrl: P(931177), images: [P(931177)],
    categories: ['outdoor', 'flowering'],
    difficulty: 'intermediate', tags: ['fragrant', 'pot-friendly', 'gifting'],
    isBestseller: true, isNewArrival: false,
    careWatering: 'Every 2 days', careSunlight: 'Full sun (6+ hours)', careHumidity: '40–60%', careTemperature: '15–30°C',
    wateringIntervalDays: 2, fertiliserIntervalDays: 14, pruningIntervalDays: 30, repottingIntervalMonths: 18,
    careGuide: { create: [
      { title: 'Watering', icon: '💧', body: 'Water deeply at the base — never on the leaves (prevents fungal disease). Let the soil dry slightly between waterings. In Mumbai/Chennai summers, once daily is fine.', order: 1 },
      { title: 'Sunlight', icon: '☀️', body: 'Roses need 6+ hours of direct sun. South or west-facing balconies are perfect. Insufficient light leads to few flowers and weak stems.', order: 2 },
      { title: 'Pruning', icon: '✂️', body: 'Prune after each flush of blooms — cut just above an outward-facing leaf joint. In January (North India) or October (South India), give a harder pruning to rejuvenate the plant.', order: 3 },
      { title: 'Fertilising', icon: '🧪', body: 'Feed every 2 weeks with a rose-specific or NPK fertiliser. Add banana peel compost to the soil — potassium promotes strong stems and vivid blooms.', order: 4 },
      { title: 'Pot tip', icon: '🪴', body: 'Use a 10–12 inch deep pot with good drainage. Miniature roses work great in 6-inch pots for window boxes.', order: 5 },
    ]},
  },
  {
    name: 'Sunflower',
    scientificName: 'Helianthus annuus',
    slug: 'sunflower',
    description: 'Sunflowers are the easiest statement plant for any sunny balcony or terrace. Dwarf varieties (30–60 cm) grow beautifully in pots and produce a cheerful bloom in just 60–70 days from seed.',
    price: 39, comparePrice: 59, stock: 150,
    thumbnailUrl: P(1366630), images: [P(1366630)],
    categories: ['outdoor', 'flowering'],
    difficulty: 'beginner', tags: ['fast-growing', 'pot-friendly', 'seeds-edible'],
    isBestseller: false, isNewArrival: true,
    careWatering: 'Every 2–3 days', careSunlight: 'Full sun (6+ hours)', careHumidity: 'Low–moderate', careTemperature: '18–35°C',
    wateringIntervalDays: 2, fertiliserIntervalDays: 21, pruningIntervalDays: 60, repottingIntervalMonths: 6,
    careGuide: { create: [
      { title: 'Sowing', icon: '🌱', body: 'Sow seeds directly in the pot — 1 cm deep. Germination in 5–10 days. Dwarf varieties like "Big Smile" or "Teddy Bear" are best for pots.', order: 1 },
      { title: 'Sunlight', icon: '☀️', body: 'Needs full sun all day — literally follows the sun. Keep on your sunniest balcony or terrace. No direct sun = no blooms.', order: 2 },
      { title: 'Watering', icon: '💧', body: 'Water deeply but allow soil to dry between waterings. Sunflowers are drought-tolerant but young plants need consistent moisture.', order: 3 },
      { title: 'Pot size', icon: '🪴', body: 'Dwarf varieties do well in 8–10 inch pots. Tall varieties need 12+ inch pots with a stake for support.', order: 4 },
    ]},
  },
  {
    name: 'Adenium (Desert Rose)',
    scientificName: 'Adenium obesum',
    slug: 'adenium-desert-rose',
    description: 'A stunning succulent-like flowering plant with a swollen base and vivid pink or red blooms. One of the trendiest balcony plants in Indian cities — extremely drought-tolerant and long-lived.',
    price: 299, comparePrice: 449, stock: 40,
    thumbnailUrl: P(931177), images: [P(931177)],
    categories: ['outdoor', 'flowering', 'succulent'],
    difficulty: 'beginner', tags: ['drought-tolerant', 'pot-friendly', 'long-lived'],
    isBestseller: false, isNewArrival: true,
    careWatering: 'Every 5–7 days', careSunlight: 'Full sun (5+ hours)', careHumidity: 'Low', careTemperature: '20–40°C',
    wateringIntervalDays: 6, fertiliserIntervalDays: 21, pruningIntervalDays: 90, repottingIntervalMonths: 24,
    careGuide: { create: [
      { title: 'Watering', icon: '💧', body: 'Water only when the soil is bone dry — adeniums store water in their swollen trunk. Overwatering is the #1 killer. In winter, water once a month or less.', order: 1 },
      { title: 'Sunlight', icon: '☀️', body: 'Loves full, direct sun. The more sun, the more flowers. Perfect for west or south-facing balconies and terrace gardens.', order: 2 },
      { title: 'Soil & Pot', icon: '🪴', body: 'Use cactus mix or add 40% perlite to potting mix for excellent drainage. Never use soil that retains water. Terracotta pots are ideal.', order: 3 },
      { title: 'Fertilising', icon: '🧪', body: 'Feed with a bloom booster every 3 weeks during spring and summer. No fertiliser in winter.', order: 4 },
    ]},
  },
  {
    name: 'Chrysanthemum (Shevanti)',
    scientificName: 'Chrysanthemum morifolium',
    slug: 'chrysanthemum-shevanti',
    description: 'A beloved Indian garden flower that blooms in October–January, coinciding with Diwali and winter festivals. Available in white, yellow, pink, and red. Grows brilliantly in pots, grow bags, and garden beds.',
    price: 79, comparePrice: 119, stock: 100,
    thumbnailUrl: P(2293374), images: [P(2293374)],
    categories: ['outdoor', 'flowering'],
    difficulty: 'beginner', tags: ['winter-bloomer', 'festival-flower', 'pot-friendly', 'fragrant'],
    isBestseller: false, isNewArrival: false,
    careWatering: 'Every 2 days', careSunlight: 'Full sun (4+ hours)', careHumidity: '40–60%', careTemperature: '10–25°C',
    wateringIntervalDays: 2, fertiliserIntervalDays: 14, pruningIntervalDays: 30, repottingIntervalMonths: 12,
    careGuide: { create: [
      { title: 'Pinching for bushy growth', icon: '✂️', body: 'Pinch off growing tips every 2–3 weeks until August. This is the single most important step — it causes branching and many more blooms.', order: 1 },
      { title: 'Watering', icon: '💧', body: 'Keep soil consistently moist. Water at the base — wet leaves invite powdery mildew. Twice a day in dry Delhi winters.', order: 2 },
      { title: 'Sunlight', icon: '☀️', body: '4–6 hours of sun. Short day length triggers flowering — do not place near artificial lights at night after September.', order: 3 },
      { title: 'Fertilising', icon: '🧪', body: 'NPK 10:30:10 every 10 days from September until buds show. This pushes flowering hard.', order: 4 },
    ]},
  },

  // ─── VEGETABLES ──────────────────────────────────────────────────────────
  {
    name: 'Capsicum (Bell Pepper)',
    scientificName: 'Capsicum annuum',
    slug: 'capsicum-bell-pepper',
    description: 'One of the best vegetables for balcony and terrace gardens. Capsicums grow beautifully in 10L grow bags, produce continuously for months, and come in green, red, and yellow varieties.',
    price: 69, comparePrice: 99, stock: 120,
    thumbnailUrl: P(3735739), images: [P(3735739)],
    categories: ['outdoor', 'vegetable'],
    difficulty: 'beginner', tags: ['grow-bag', 'pot-friendly', 'high-yield'],
    isBestseller: true, isNewArrival: false,
    careWatering: 'Every 2 days', careSunlight: 'Full sun (5+ hours)', careHumidity: '50–70%', careTemperature: '20–32°C',
    wateringIntervalDays: 2, fertiliserIntervalDays: 14, pruningIntervalDays: 30, repottingIntervalMonths: 12,
    careGuide: { create: [
      { title: 'Sowing & transplanting', icon: '🌱', body: 'Start seeds in small cups, transplant to 10–15L grow bags or 12-inch pots when 4–5 inches tall. Best sown October–January or June–July.', order: 1 },
      { title: 'Watering', icon: '💧', body: 'Keep soil consistently moist — capsicums are sensitive to both drought and waterlogging. Mulch the surface to retain moisture.', order: 2 },
      { title: 'Support', icon: '🌿', body: 'Stake the plant when 30cm tall. Capsicums have brittle branches — support prevents breakage when fruit is heavy.', order: 3 },
      { title: 'Fertilising', icon: '🧪', body: 'Feed with NPK 19:19:19 every 2 weeks. Switch to a higher potassium fertiliser when flowers appear to set fruit well.', order: 4 },
      { title: 'Harvesting', icon: '✂️', body: 'Harvest green capsicums 70–75 days after transplanting. Leave on the plant longer for them to turn red or yellow. Snip with scissors — do not pull.', order: 5 },
    ]},
  },
  {
    name: 'Cucumber',
    scientificName: 'Cucumis sativus',
    slug: 'cucumber',
    description: 'Cucumbers are ideal for terrace and balcony gardens — they grow vertically, saving space, and produce abundantly in grow bags. A single plant gives 20–30 cucumbers over the season.',
    price: 49, comparePrice: 79, stock: 130,
    thumbnailUrl: P(2329440), images: [P(2329440)],
    categories: ['outdoor', 'vegetable'],
    difficulty: 'beginner', tags: ['grow-bag', 'vertical-grow', 'high-yield'],
    isBestseller: false, isNewArrival: true,
    careWatering: 'Every day', careSunlight: 'Full sun (5+ hours)', careHumidity: '60–70%', careTemperature: '25–35°C',
    wateringIntervalDays: 1, fertiliserIntervalDays: 10, pruningIntervalDays: 14, repottingIntervalMonths: 6,
    careGuide: { create: [
      { title: 'Setup', icon: '🪴', body: 'Use a 20–25L grow bag or a large pot. Install a simple net or bamboo trellis — cucumbers are climbers and will grow vertically, saving precious balcony space.', order: 1 },
      { title: 'Watering', icon: '💧', body: 'Cucumbers are mostly water — they need consistent daily watering. Inconsistent watering causes bitter fruits. Water at the base, not on leaves.', order: 2 },
      { title: 'Pollination', icon: '🌸', body: 'If you get only male flowers initially, be patient — female flowers (with a tiny cucumber at the base) appear 1–2 weeks later. Hand-pollinate by transferring pollen with a cotton bud on windy days when insects are scarce.', order: 3 },
      { title: 'Harvest', icon: '✂️', body: 'Harvest when 15–20 cm long and still firm. Leaving cucumbers too long on the vine signals the plant to stop producing.', order: 4 },
    ]},
  },
  {
    name: 'Bottle Gourd (Lauki)',
    scientificName: 'Lagenaria siceraria',
    slug: 'bottle-gourd-lauki',
    description: 'A top choice for terrace and rooftop gardens. Lauki is a fast-growing creeper that covers a pergola or net in weeks, provides shade, and yields nutritious gourds all season.',
    price: 49, comparePrice: 69, stock: 110,
    thumbnailUrl: P(3735773), images: [P(3735773)],
    categories: ['outdoor', 'vegetable'],
    difficulty: 'beginner', tags: ['fast-growing', 'terrace-garden', 'high-yield', 'nutritious'],
    isBestseller: false, isNewArrival: false,
    careWatering: 'Every day', careSunlight: 'Full sun (6+ hours)', careHumidity: '60–80%', careTemperature: '25–38°C',
    wateringIntervalDays: 1, fertiliserIntervalDays: 14, pruningIntervalDays: 21, repottingIntervalMonths: 6,
    careGuide: { create: [
      { title: 'Space & structure', icon: '🌿', body: 'Needs at least a 30L grow bag or 18-inch container. Set up a bamboo or metal trellis — lauki is a vigorous creeper that can cover 3–4 metres.', order: 1 },
      { title: 'Sowing', icon: '🌱', body: 'Soak seeds overnight before planting. Sow 1–2 seeds per bag, 2 cm deep. Germination in 5–7 days. Remove the weaker seedling after 10 days.', order: 2 },
      { title: 'Watering', icon: '💧', body: 'Water daily — lauki is a thirsty plant. In peak summer, water morning and evening. Never let the soil dry out completely.', order: 3 },
      { title: 'Hand pollination', icon: '🌸', body: 'Lauki flowers open at night and are pollinated by moths. In cities with few moths, hand-pollinate using a brush in the evening.', order: 4 },
      { title: 'Harvest', icon: '✂️', body: 'Harvest when 25–30 cm long and the skin is still tender (press with fingernail — it should dent easily). Overripe lauki becomes bitter and seedy.', order: 5 },
    ]},
  },
  {
    name: 'Drumstick (Moringa)',
    scientificName: 'Moringa oleifera',
    slug: 'drumstick-moringa',
    description: 'Possibly the most nutritious plant you can grow in a large pot. Moringa grows fast, every part is edible (leaves, pods, flowers), and one tree feeds a family. Thrives in Indian heat and sun.',
    price: 99, comparePrice: 149, stock: 75,
    thumbnailUrl: P(2286776), images: [P(2286776)],
    categories: ['outdoor', 'vegetable', 'herb'],
    difficulty: 'beginner', tags: ['superfood', 'drought-tolerant', 'fast-growing', 'edible-leaves'],
    isBestseller: false, isNewArrival: true,
    careWatering: 'Every 3–4 days', careSunlight: 'Full sun (5+ hours)', careHumidity: 'Low–moderate', careTemperature: '25–40°C',
    wateringIntervalDays: 3, fertiliserIntervalDays: 30, pruningIntervalDays: 30, repottingIntervalMonths: 12,
    careGuide: { create: [
      { title: 'Pot size', icon: '🪴', body: 'Plant in a 25–30L container or directly in the ground. Moringa has a taproot — deep pots produce better yields.', order: 1 },
      { title: 'Watering', icon: '💧', body: 'Moringa is extremely drought-tolerant. Water every 3–4 days in summer, once a week in cooler months. It handles Indian heat far better than most plants.', order: 2 },
      { title: 'Pruning for harvest', icon: '✂️', body: 'Cut back by 1/3 every 2 months to encourage dense, leafy branching rather than one tall stalk. This keeps it at a manageable height and produces more leaves.', order: 3 },
      { title: 'Leaves & pods', icon: '🌿', body: 'Harvest young leaves and tender pods. Leaves can be dried and powdered. Pods are edible when young; once they mature and harden, harvest seeds for re-planting.', order: 4 },
    ]},
  },
  {
    name: 'Radish (Mooli)',
    scientificName: 'Raphanus sativus',
    slug: 'radish-mooli',
    description: 'The fastest vegetable you can grow — radishes are ready in just 25–30 days! Perfect for beginners, kids, and anyone who wants quick results from a small balcony pot or grow bag.',
    price: 29, comparePrice: 49, stock: 180,
    thumbnailUrl: P(1435904), images: [P(1435904)],
    categories: ['outdoor', 'vegetable'],
    difficulty: 'beginner', tags: ['fast-growing', 'pot-friendly', 'beginner-friendly', 'quick-harvest'],
    isBestseller: false, isNewArrival: false,
    careWatering: 'Every 2 days', careSunlight: 'Partial to full sun (3–5 hours)', careHumidity: 'Moderate', careTemperature: '10–25°C',
    wateringIntervalDays: 2, fertiliserIntervalDays: 14, pruningIntervalDays: 30, repottingIntervalMonths: 3,
    careGuide: { create: [
      { title: 'Sowing', icon: '🌱', body: 'Sow seeds directly — radishes hate transplanting. 1 cm deep, 5 cm apart. A shallow pot (20 cm deep) or grow bag works perfectly. Best in October–February.', order: 1 },
      { title: 'Watering', icon: '💧', body: 'Consistent watering prevents roots from cracking. Do not let soil dry out. Every 2 days is ideal.', order: 2 },
      { title: 'Thinning', icon: '✂️', body: 'Thin to 8–10 cm spacing once seedlings are 5 cm tall. Crowded radishes grow poorly. Eat the thinnings as microgreens!', order: 3 },
      { title: 'Harvest', icon: '🌿', body: 'Ready in 25–30 days — pull one up to check. Harvest when 2–3 cm in diameter. Leaving too long makes them woody and pungent.', order: 4 },
    ]},
  },
  {
    name: 'Beans (French Beans)',
    scientificName: 'Phaseolus vulgaris',
    slug: 'french-beans',
    description: 'French beans are productive, nutritious, and easy to grow in any 12L grow bag or pot. Bush varieties need no support; climbing varieties use vertical space efficiently on a balcony trellis.',
    price: 49, comparePrice: 69, stock: 100,
    thumbnailUrl: P(1435904), images: [P(1435904)],
    categories: ['outdoor', 'vegetable'],
    difficulty: 'beginner', tags: ['grow-bag', 'high-yield', 'pot-friendly', 'nutritious'],
    isBestseller: false, isNewArrival: false,
    careWatering: 'Every 2 days', careSunlight: 'Full sun (5+ hours)', careHumidity: '50–70%', careTemperature: '18–28°C',
    wateringIntervalDays: 2, fertiliserIntervalDays: 14, pruningIntervalDays: 30, repottingIntervalMonths: 6,
    careGuide: { create: [
      { title: 'Sowing', icon: '🌱', body: 'Sow 2 cm deep directly in the grow bag. Do not overwater at germination — beans rot easily. Best season: September–November and January–March.', order: 1 },
      { title: 'Watering', icon: '💧', body: 'Water consistently but do not let the pot sit in water. Beans are sensitive to soggy soil. Once flowers appear, slightly increase watering frequency.', order: 2 },
      { title: 'Nitrogen fix', icon: '🌿', body: 'Beans fix their own nitrogen — no heavy nitrogen feeding needed. Use a phosphorus-rich fertiliser to promote pods.', order: 3 },
      { title: 'Harvest', icon: '✂️', body: 'Pick pods when 10–12 cm long and still snappy. Frequent harvesting prolongs the production period. Do not pull — use scissors to avoid uprooting the plant.', order: 4 },
    ]},
  },

  // ─── HERBS ───────────────────────────────────────────────────────────────
  {
    name: 'Lemongrass',
    scientificName: 'Cymbopogon citratus',
    slug: 'lemongrass',
    description: 'A fragrant, fast-growing grass that repels mosquitoes naturally — a must for every Indian balcony! Also used fresh in chai, Thai cooking, and herbal teas. Grows into a lush clump in any large pot.',
    price: 79, comparePrice: 119, stock: 90,
    thumbnailUrl: P(3076899), images: [P(3076899)],
    categories: ['outdoor', 'herb'],
    difficulty: 'beginner', tags: ['mosquito-repellent', 'fragrant', 'fast-growing', 'culinary'],
    isBestseller: true, isNewArrival: false,
    careWatering: 'Every 3 days', careSunlight: 'Full sun (5+ hours)', careHumidity: 'Moderate', careTemperature: '20–38°C',
    wateringIntervalDays: 3, fertiliserIntervalDays: 30, pruningIntervalDays: 30, repottingIntervalMonths: 18,
    careGuide: { create: [
      { title: 'Planting', icon: '🌱', body: 'Plant a division from a mature clump or start from stalks bought at a vegetable market. Place the bottom 3 cm in water for 2 weeks until roots appear, then pot up.', order: 1 },
      { title: 'Pot size', icon: '🪴', body: 'A 12-inch pot or 15L grow bag per clump is ideal. Lemongrass grows into a large, bushy plant — do not crowd with other plants.', order: 2 },
      { title: 'Harvest', icon: '✂️', body: 'Cut stalks close to the base once 30 cm tall. Use the tender lower white part for cooking; add leafy tops to chai or dry for herbal tea.', order: 3 },
      { title: 'Mosquito control', icon: '🦟', body: 'Rub a few leaves between your palms and place near open windows or the balcony edge. The citronella scent deters mosquitoes effectively.', order: 4 },
    ]},
  },
  {
    name: 'Ajwain (Carom)',
    scientificName: 'Trachyspermum ammi',
    slug: 'ajwain-carom',
    description: 'A highly useful Indian kitchen herb that grows effortlessly in a small pot. The leaves and seeds are used in cooking, and the plant has strong medicinal properties. One of the easiest herbs for a beginner.',
    price: 49, comparePrice: 79, stock: 120,
    thumbnailUrl: P(4033471), images: [P(4033471)],
    categories: ['outdoor', 'herb'],
    difficulty: 'beginner', tags: ['medicinal', 'culinary', 'pot-friendly', 'low-maintenance'],
    isBestseller: false, isNewArrival: false,
    careWatering: 'Every 3–4 days', careSunlight: 'Partial to full sun (3–5 hours)', careHumidity: 'Low–moderate', careTemperature: '18–35°C',
    wateringIntervalDays: 3, fertiliserIntervalDays: 30, pruningIntervalDays: 21, repottingIntervalMonths: 12,
    careGuide: { create: [
      { title: 'Planting', icon: '🌱', body: 'Grows easily from stem cuttings. Place a 10 cm cutting in moist soil or water until roots appear. A 6-inch pot with well-draining soil is sufficient.', order: 1 },
      { title: 'Watering', icon: '💧', body: 'Let the top layer of soil dry between waterings. Ajwain handles some neglect well. Overwatering causes root rot.', order: 2 },
      { title: 'Harvest', icon: '✂️', body: 'Pinch off leaves as needed — this also keeps the plant compact. The fresh leaves have a strong thyme-like aroma. Let some stalks go to seed to harvest carom seeds.', order: 3 },
      { title: 'Medicinal uses', icon: '🌿', body: 'Crush fresh leaves and apply on insect bites. Chew a few leaves or make a tea with seeds for digestive discomfort.', order: 4 },
    ]},
  },
  {
    name: 'Stevia (Natural Sweetener)',
    scientificName: 'Stevia rebaudiana',
    slug: 'stevia',
    description: 'Grow your own zero-calorie natural sweetener on the balcony! Stevia leaves are 200–300× sweeter than sugar. Diabetes-friendly and easy to grow in small pots.',
    price: 89, comparePrice: 129, stock: 60,
    thumbnailUrl: P(3076899), images: [P(3076899)],
    categories: ['outdoor', 'herb'],
    difficulty: 'beginner', tags: ['diabetic-friendly', 'natural-sweetener', 'pot-friendly', 'medicinal'],
    isBestseller: false, isNewArrival: true,
    careWatering: 'Every 2–3 days', careSunlight: 'Partial to full sun (4–6 hours)', careHumidity: 'Moderate', careTemperature: '15–30°C',
    wateringIntervalDays: 2, fertiliserIntervalDays: 30, pruningIntervalDays: 21, repottingIntervalMonths: 12,
    careGuide: { create: [
      { title: 'Planting', icon: '🌱', body: 'Grows well from cuttings or seedlings. Use a 6–8 inch pot with well-draining potting mix. Stevia dislikes sitting in wet soil.', order: 1 },
      { title: 'Harvest', icon: '✂️', body: 'Harvest leaves before the plant flowers (flowering makes leaves more bitter). Pinch the growing tips regularly to keep it bushy and productive.', order: 2 },
      { title: 'Use', icon: '🌿', body: 'Add 2–3 fresh leaves to tea, lemonade, or smoothies instead of sugar. Dry leaves for an even more concentrated sweetness. Dried leaves can be powdered.', order: 3 },
      { title: 'Indian summer care', icon: '🌡️', body: 'Move to partial shade in peak summer (above 38°C). Stevia can handle heat but needs protection from harsh afternoon sun in Delhi/Rajasthan summers.', order: 4 },
    ]},
  },

  // ─── FRUITS ──────────────────────────────────────────────────────────────
  {
    name: 'Strawberry',
    scientificName: 'Fragaria × ananassa',
    slug: 'strawberry',
    description: 'Growing strawberries at home is surprisingly easy — hanging baskets, window boxes, or small pots on a balcony all work beautifully. The season is November–February, perfect for Indian winters.',
    price: 129, comparePrice: 179, stock: 80,
    thumbnailUrl: P(1435904), images: [P(1435904)],
    categories: ['outdoor', 'fruit'],
    difficulty: 'intermediate', tags: ['hanging-basket', 'winter-fruit', 'kids-favourite'],
    isBestseller: false, isNewArrival: true,
    careWatering: 'Every 2 days', careSunlight: 'Full sun (5–6 hours)', careHumidity: '60–70%', careTemperature: '15–26°C',
    wateringIntervalDays: 2, fertiliserIntervalDays: 14, pruningIntervalDays: 30, repottingIntervalMonths: 6,
    careGuide: { create: [
      { title: 'Best season', icon: '📅', body: 'Plant runners October–November for a January–February harvest. Strawberries need cool temperatures to fruit well. Not suitable for peak Indian summer.', order: 1 },
      { title: 'Container', icon: '🪴', body: 'Hanging baskets, strawberry towers, or any shallow 6-inch pot works. Use a mix of potting soil and coco peat for good moisture retention.', order: 2 },
      { title: 'Watering', icon: '💧', body: 'Keep soil moist but never waterlogged. Mulch around plants with dry leaves to retain moisture and keep fruits off the soil.', order: 3 },
      { title: 'Fertilising', icon: '🧪', body: 'Feed every 10 days with NPK 10:26:26 once flowers appear. This boosts fruit size and sweetness significantly.', order: 4 },
      { title: 'Runners', icon: '🌿', body: 'Remove runners (long stems with baby plants) during fruiting to channel energy into berries. After harvest, let runners root to get free plants for next season.', order: 5 },
    ]},
  },
  {
    name: 'Papaya',
    scientificName: 'Carica papaya',
    slug: 'papaya',
    description: 'A fast-growing tropical fruit tree that can be grown in large containers on terraces and lawns. Dwarf varieties fruit in just 10–12 months. One of the highest-nutrition fruits you can grow at home.',
    price: 149, comparePrice: 199, stock: 50,
    thumbnailUrl: P(3014019), images: [P(3014019)],
    categories: ['outdoor', 'fruit', 'tropical'],
    difficulty: 'intermediate', tags: ['fast-fruiting', 'terrace-garden', 'tropical', 'nutritious'],
    isBestseller: false, isNewArrival: false,
    careWatering: 'Every 3 days', careSunlight: 'Full sun (6+ hours)', careHumidity: '60–80%', careTemperature: '22–38°C',
    wateringIntervalDays: 3, fertiliserIntervalDays: 21, pruningIntervalDays: 90, repottingIntervalMonths: 18,
    careGuide: { create: [
      { title: 'Container', icon: '🪴', body: 'Grow in a 30–40L container or directly in the ground. Dwarf red-fleshed varieties are best for containers. Needs full sun all day — ideal for terrace gardens.', order: 1 },
      { title: 'Watering', icon: '💧', body: 'Water 3 times a week, ensuring good drainage. Papaya hates waterlogged roots — elevated pots or raised beds prevent this.', order: 2 },
      { title: 'Pollination', icon: '🌸', body: 'For container growing, grow 2–3 plants from seed and keep the female (has flowers with a tiny fruit at the base) plus one male. Or buy a hermaphrodite variety like "Taiwan 786" for single-plant fruiting.', order: 3 },
      { title: 'Fertilising', icon: '🧪', body: 'Heavy feeder — fertilise every 3 weeks with a balanced fertiliser. Add plenty of vermicompost at planting and top-dress monthly.', order: 4 },
    ]},
  },

  // ─── INDOOR + BALCONY ────────────────────────────────────────────────────
  {
    name: 'Spider Plant',
    scientificName: 'Chlorophytum comosum',
    slug: 'spider-plant',
    description: 'One of India\'s most popular and forgiving indoor plants. Spider plants thrive in balconies, windows, and any bright corner — producing dozens of baby plantlets you can share with friends.',
    price: 89, comparePrice: 129, stock: 110,
    thumbnailUrl: P(4503273), images: [P(4503273)],
    categories: ['indoor', 'air_purifying'],
    difficulty: 'beginner', tags: ['air-purifier', 'propagates-easily', 'low-light', 'pet-safe'],
    isBestseller: false, isNewArrival: false,
    careWatering: 'Every 7 days', careSunlight: 'Bright indirect (2–4 hours)', careHumidity: '40–60%', careTemperature: '15–30°C',
    wateringIntervalDays: 7, fertiliserIntervalDays: 30, pruningIntervalDays: 60, repottingIntervalMonths: 18,
    careGuide: { create: [
      { title: 'Watering', icon: '💧', body: 'Water when the top 2 cm of soil is dry. Spider plants tolerate occasional neglect. Use water left overnight — they are sensitive to fluoride in tap water, causing brown tips.', order: 1 },
      { title: 'Light', icon: '☀️', body: 'Thrives in bright indirect light. Can tolerate lower light but variegated leaves (green and white) will lose their white stripes. Avoid direct harsh sun.', order: 2 },
      { title: 'Propagation', icon: '🌱', body: 'The long stems produce "spiderettes" — tiny plants hanging down. Pin them into soil in a separate pot while still attached. Once rooted (2–3 weeks), cut the connecting stem.', order: 3 },
      { title: 'Brown tips', icon: '⚠️', body: 'Brown leaf tips are common and caused by: fluoride in water, low humidity, or under-watering. Use filtered water or let tap water stand overnight before using.', order: 4 },
    ]},
  },
  {
    name: 'Jade Plant',
    scientificName: 'Crassula ovata',
    slug: 'jade-plant',
    description: 'A beloved succulent that lives for decades with minimal care — sometimes called the "money plant" in South India. Its thick, glossy leaves store water, making it perfect for busy city dwellers.',
    price: 119, comparePrice: 179, stock: 85,
    thumbnailUrl: P(1999268), images: [P(1999268)],
    categories: ['indoor', 'succulent'],
    difficulty: 'beginner', tags: ['succulent', 'long-lived', 'drought-tolerant', 'lucky-plant'],
    isBestseller: false, isNewArrival: false,
    careWatering: 'Every 10–14 days', careSunlight: 'Bright indirect to direct (3–5 hours)', careHumidity: 'Low', careTemperature: '15–30°C',
    wateringIntervalDays: 12, fertiliserIntervalDays: 30, pruningIntervalDays: 60, repottingIntervalMonths: 24,
    careGuide: { create: [
      { title: 'Watering', icon: '💧', body: 'Water deeply but infrequently — only when the soil is completely dry. The leaves plump up when well-watered and wrinkle when thirsty. Root rot from overwatering is the only real threat.', order: 1 },
      { title: 'Light', icon: '☀️', body: 'Prefers 3–4 hours of direct morning sun or bright indirect light all day. A windowsill or balcony ledge is ideal. More sun = richer green colour and compact growth.', order: 2 },
      { title: 'Soil & pot', icon: '🪴', body: 'Use cactus mix or add perlite to regular potting mix. A terracotta pot helps excess moisture evaporate quickly. Do not use a pot much larger than the root ball.', order: 3 },
      { title: 'Shaping', icon: '✂️', body: 'Pinch or cut any branch to shape the plant — it will branch from the cut point. Over many years, jade plants develop a beautiful bonsai-like trunk naturally.', order: 4 },
    ]},
  },
]

async function main() {
  console.log(`🌱 Adding ${newPlants.length} new metro home-garden plants...`)
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
  console.log(`📊 Total plants in catalog: ${total}`)
}

main().catch(console.error).finally(() => prisma.$disconnect())
