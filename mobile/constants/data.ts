export interface Plant {
  id: string
  name: string
  sci: string
  price: number
  emoji: string
  bg: string
  tag: string
  cats: string[]
  chips: string[]
  care: { l: string; v: string }[]
  guide: { icon: string; title: string; body: string }[]
  waterDays: number
  fertDays: number
}

export interface Supply {
  id: string
  name: string
  desc: string
  price: number
  emoji: string
  cat: string
  badges: string[]
}

export const PLANTS: Plant[] = [
  {
    id: 'monstera', name: 'Monstera', sci: 'Monstera deliciosa',
    price: 349, emoji: '🌿', bg: '#eaf3de', tag: 'Bestseller',
    cats: ['indoor', 'tropical'],
    chips: ['💧 7 days', '☀️ Indirect', '🧪 Bi-weekly'],
    care: [
      { l: 'Watering', v: 'Every 7 days' }, { l: 'Light', v: 'Bright indirect' },
      { l: 'Humidity', v: '40–60%' }, { l: 'Temp', v: '18–30°C' },
    ],
    guide: [
      { icon: '💧', title: 'Watering', body: 'Water thoroughly when the top 2–3 cm of soil feels dry. Always ensure good drainage — root rot is the most common cause of death. Reduce to every 10–12 days in winter.' },
      { icon: '☀️', title: 'Light', body: 'Thrives in bright, indirect light. Avoid direct afternoon sun — it scorches the split leaves. A north or east-facing window is ideal indoors.' },
      { icon: '🧪', title: 'Fertilising', body: 'Feed every two weeks in spring and summer with balanced liquid fertiliser at half strength. Do not fertilise in winter.' },
      { icon: '🪴', title: 'Repotting', body: 'Repot every 1–2 years when roots circle the base. Move up just one pot size — too large leads to waterlogged soil.' },
      { icon: '🐛', title: 'Common problems', body: 'Yellow leaves = overwatering. Brown crispy tips = low humidity or direct sun. Leggy growth = insufficient light.' },
    ],
    waterDays: 7, fertDays: 14,
  },
  {
    id: 'snake', name: 'Snake plant', sci: 'Sansevieria trifasciata',
    price: 199, emoji: '🌱', bg: '#f0f8e8', tag: 'Low care',
    cats: ['indoor', 'air'],
    chips: ['💧 14 days', '☀️ Adaptable'],
    care: [
      { l: 'Watering', v: 'Every 14 days' }, { l: 'Light', v: 'Low to bright' },
      { l: 'Humidity', v: 'Any' }, { l: 'Temp', v: '15–35°C' },
    ],
    guide: [
      { icon: '💧', title: 'Watering', body: 'Let soil dry completely between waterings. In winter, once a month is often enough. Overwatering causes root rot.' },
      { icon: '☀️', title: 'Light', body: 'Tolerates low light but grows faster in indirect bright conditions. Avoid extended direct harsh sun.' },
      { icon: '🧪', title: 'Fertilising', body: 'Fertilise once each in spring and summer. Over-feeding causes pale, weak growth.' },
      { icon: '🐛', title: 'Common problems', body: 'Yellow leaves = overwatering. Mushy base = root rot. Remove affected section, let dry 48h, repot in fresh mix.' },
    ],
    waterDays: 14, fertDays: 30,
  },
  {
    id: 'peace', name: 'Peace lily', sci: 'Spathiphyllum wallisii',
    price: 279, emoji: '🌸', bg: '#f0f0ff', tag: 'Air purifier',
    cats: ['indoor', 'air', 'flowering'],
    chips: ['💧 5 days', '🌑 Low light', '🧪 Monthly'],
    care: [
      { l: 'Watering', v: 'Every 5 days' }, { l: 'Light', v: 'Low indirect' },
      { l: 'Humidity', v: '50%+' }, { l: 'Temp', v: '18–27°C' },
    ],
    guide: [
      { icon: '💧', title: 'Watering', body: 'Keep soil consistently moist. Peace lilies droop when thirsty — a useful cue. Mist leaves weekly for humidity.' },
      { icon: '☀️', title: 'Light', body: 'One of the best low-light plants. Direct sun causes brown crispy edges. Fluorescent lighting is sufficient.' },
      { icon: '🧪', title: 'Fertilising', body: 'Feed monthly in the growing season. Yellow leaves often signal a nutrient need.' },
      { icon: '⚠️', title: 'Toxicity', body: 'Mildly toxic to cats, dogs, and children if ingested. Keep away from pets and young children.' },
    ],
    waterDays: 5, fertDays: 30,
  },
  {
    id: 'aloe', name: 'Aloe vera', sci: 'Aloe barbadensis miller',
    price: 149, emoji: '🌵', bg: '#fdf5e6', tag: 'Medicinal',
    cats: ['succulent', 'herb'],
    chips: ['💧 21 days', '☀️ Direct sun'],
    care: [
      { l: 'Watering', v: 'Every 21 days' }, { l: 'Light', v: 'Bright to direct' },
      { l: 'Humidity', v: 'Low' }, { l: 'Temp', v: '13–27°C' },
    ],
    guide: [
      { icon: '💧', title: 'Watering', body: 'Water deeply but very infrequently. Aloe stores water in its leaves. Let soil dry completely between waterings.' },
      { icon: '☀️', title: 'Light', body: 'Loves bright light. South or west-facing window is ideal. Acclimatise gradually if moving outdoors.' },
      { icon: '🧪', title: 'Fertilising', body: 'Twice a year maximum — spring and summer only with diluted cactus fertiliser.' },
      { icon: '🌿', title: 'Harvesting', body: 'Snap a lower leaf at the base for the clear gel. Soothes burns and skin irritation.' },
    ],
    waterDays: 21, fertDays: 90,
  },
  {
    id: 'fern', name: 'Boston fern', sci: 'Nephrolepis exaltata',
    price: 299, emoji: '🌾', bg: '#e8f4f0', tag: 'Humidity lover',
    cats: ['indoor', 'air'],
    chips: ['💧 4 days', '💦 High humidity'],
    care: [
      { l: 'Watering', v: 'Every 4 days' }, { l: 'Light', v: 'Indirect' },
      { l: 'Humidity', v: '60%+' }, { l: 'Temp', v: '15–24°C' },
    ],
    guide: [
      { icon: '💧', title: 'Watering', body: 'Keep soil consistently moist — ferns drop fronds rapidly when dry.' },
      { icon: '💦', title: 'Humidity', body: 'Use a pebble tray with water or mist daily. Bathrooms and kitchens work well.' },
      { icon: '☀️', title: 'Light', body: 'Indirect light only. A north-facing window or set back from a bright one is ideal.' },
      { icon: '✂️', title: 'Pruning', body: 'Trim yellow fronds at the base every 6–8 weeks to encourage fresh growth.' },
    ],
    waterDays: 4, fertDays: 30,
  },
  {
    id: 'pothos', name: 'Pothos', sci: 'Epipremnum aureum',
    price: 129, emoji: '🍃', bg: '#fff0f5', tag: 'Trailing',
    cats: ['indoor'],
    chips: ['💧 9 days', '☀️ Adaptable'],
    care: [
      { l: 'Watering', v: 'Every 9 days' }, { l: 'Light', v: 'Low to bright' },
      { l: 'Humidity', v: 'Any' }, { l: 'Temp', v: '15–30°C' },
    ],
    guide: [
      { icon: '💧', title: 'Watering', body: 'Water when the top inch of soil is dry. Forgives missed waterings but dislikes sitting in wet soil.' },
      { icon: '☀️', title: 'Light', body: 'The most adaptable houseplant. Tolerates low light but grows fuller in indirect bright conditions.' },
      { icon: '🪴', title: 'Training', body: 'Trail from a shelf, climb a moss pole, or keep in a hanging basket. Pinch back vines for bushy growth.' },
      { icon: '✂️', title: 'Propagation', body: 'Cut below a node, place in water 2–3 weeks until roots appear, then pot into soil.' },
    ],
    waterDays: 9, fertDays: 30,
  },
]

export const SUPPLIES: Supply[] = [
  { id: 's1',  name: 'Terracotta pot 6"',       desc: 'Classic breathable clay with drainage',    price: 89,  emoji: '🪴', cat: 'pots',       badges: ['Drainage hole', '6 inch'] },
  { id: 's2',  name: 'Terracotta pot 8"',        desc: 'For established plants',                   price: 129, emoji: '🪴', cat: 'pots',       badges: ['Drainage hole', '8 inch'] },
  { id: 's3',  name: 'Glazed ceramic pot 8"',    desc: 'Matte white glaze with saucer',            price: 249, emoji: '🫙', cat: 'pots',       badges: ['With saucer', 'Handcrafted'] },
  { id: 's4',  name: 'Self-watering pot 6"',     desc: '10-day water reservoir',                   price: 399, emoji: '🏺', cat: 'pots',       badges: ['Self-watering', 'Travel-friendly'] },
  { id: 's5',  name: 'Premium potting mix 5kg',  desc: 'Balanced pH, rich in organic matter',      price: 199, emoji: '🌍', cat: 'soil',       badges: ['5 kg', 'pH 6.0–6.5'] },
  { id: 's6',  name: 'Coco peat block 650g',     desc: 'Compressed — expands to 8L',               price: 79,  emoji: '🥥', cat: 'soil',       badges: ['650g', 'Expands 10×'] },
  { id: 's7',  name: 'Perlite 2L',               desc: 'Improves drainage and aeration',           price: 129, emoji: '🪨', cat: 'soil',       badges: ['2 litre', 'Sterile'] },
  { id: 's8',  name: 'Cactus mix 3kg',           desc: 'Fast-draining mix for succulents',         price: 169, emoji: '🏜️', cat: 'soil',       badges: ['3 kg', 'Fast-draining'] },
  { id: 's9',  name: 'NPK liquid fertiliser',    desc: 'All-purpose 19:19:19 — 500ml',             price: 159, emoji: '🧪', cat: 'fertiliser', badges: ['500 ml', 'All-purpose'] },
  { id: 's10', name: 'Slow-release granules',    desc: '3-month controlled-release 300g',          price: 189, emoji: '🫘', cat: 'fertiliser', badges: ['300g', '3-month feed'] },
  { id: 's11', name: 'Seaweed booster 250ml',    desc: 'Organic — promotes root health',           price: 219, emoji: '🌿', cat: 'fertiliser', badges: ['Organic', '250 ml'] },
  { id: 's12', name: 'Pruning shears',           desc: 'Bypass action, spring-loaded',             price: 349, emoji: '✂️', cat: 'tools',      badges: ['Stainless', 'Ergonomic'] },
  { id: 's13', name: 'Trigger mister 1L',        desc: 'Fine mist for humidity lovers',            price: 199, emoji: '💦', cat: 'tools',      badges: ['1 litre', 'Fine mist'] },
  { id: 's14', name: 'Watering can 1.5L',        desc: 'Precise pour, drip-free spout',            price: 449, emoji: '🚿', cat: 'tools',      badges: ['1.5 litre', 'Drip-free'] },
  { id: 's15', name: 'Soil moisture meter',      desc: 'No-battery 3-in-1 probe',                  price: 249, emoji: '🌡️', cat: 'tools',      badges: ['No batteries', '3-in-1'] },
]
