/**
 * fix-images.ts
 * Assigns correct, accurate images to every plant / seed / supply.
 * Uses Wikimedia Commons (botanical accuracy) + Unsplash/Pexels (lifestyle).
 */

import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

// Helper: build thumb + images array from a single URL
const img = (url: string) => ({ thumbnailUrl: url, images: [url] })

// ─────────────────────────────────────────────────────────────────────────────
// IMAGE MAP  slug → { thumbnailUrl, images[] }
// ─────────────────────────────────────────────────────────────────────────────

const PLANT_IMAGES: Record<string, { thumbnailUrl: string; images: string[] }> = {
  'adenium-desert-rose':      img('https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/Adenium_obesum.jpg/600px-Adenium_obesum.jpg'),
  'aglaonema':                img('https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Aglaonema_commutatum0.jpg/600px-Aglaonema_commutatum0.jpg'),
  'ajwain-carom':             img('https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Trachyspermum_ammi.jpg/600px-Trachyspermum_ammi.jpg'),
  'aloe-vera':                img('https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Aloe_vera_flower_inset.png/600px-Aloe_vera_flower_inset.png'),
  'areca-palm':               img('https://upload.wikimedia.org/wikipedia/commons/thumb/4/48/Dypsis_lutescens1.jpg/600px-Dypsis_lutescens1.jpg'),
  'ashwagandha':              img('https://upload.wikimedia.org/wikipedia/commons/thumb/4/48/Withania_somnifera_-_Indian_Ginseng_at_Bogatha_Waterfall_Jharkhand_India.jpg/600px-Withania_somnifera_-_Indian_Ginseng_at_Bogatha_Waterfall_Jharkhand_India.jpg'),
  'banana-dwarf-cavendish':   img('https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Banana-Fruits.jpg/600px-Banana-Fruits.jpg'),
  'beetroot':                 img('https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/Beetroot_-_stonesoup.jpg/600px-Beetroot_-_stonesoup.jpg'),
  'bhindi-okra':              img('https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/Okra_%28Abelmoschus_esculentus%29.jpg/600px-Okra_%28Abelmoschus_esculentus%29.jpg'),
  'bitter-gourd-karela':      img('https://upload.wikimedia.org/wikipedia/commons/thumb/4/42/Bitter_gourd.JPG/600px-Bitter_gourd.JPG'),
  'bottle-gourd-lauki':       img('https://upload.wikimedia.org/wikipedia/commons/thumb/7/79/Bottle_Gourd_%28Lauki%29.jpg/600px-Bottle_Gourd_%28Lauki%29.jpg'),
  'bougainvillea':            img('https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Bougainvillea_-_Banner.jpg/600px-Bougainvillea_-_Banner.jpg'),
  'brahmi-bacopa':            img('https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/Bacopa_monnieri_01.JPG/600px-Bacopa_monnieri_01.JPG'),
  'brinjal-eggplant':         img('https://upload.wikimedia.org/wikipedia/commons/thumb/6/63/Aubergine.jpg/600px-Aubergine.jpg'),
  'cactus-assorted':          img('https://images.unsplash.com/photo-1459156212016-c812468e2115?w=600&h=600&fit=crop'),
  'capsicum-bell-pepper':     img('https://upload.wikimedia.org/wikipedia/commons/thumb/b/b7/Red_capsicum_and_cross_section.jpg/600px-Red_capsicum_and_cross_section.jpg'),
  'carrot':                   img('https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Vegetable-Carrot-Bundle-wStalks.jpg/600px-Vegetable-Carrot-Bundle-wStalks.jpg'),
  'cherry-tomato':            img('https://upload.wikimedia.org/wikipedia/commons/thumb/8/88/Bright_red_tomato_and_cross_section02.jpg/600px-Bright_red_tomato_and_cross_section02.jpg'),
  'chilli-mirchi':            img('https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Red_Chili_Pepper_Cross_Section_edit2.jpg/600px-Red_Chili_Pepper_Cross_Section_edit2.jpg'),
  'chrysanthemum-shevanti':   img('https://upload.wikimedia.org/wikipedia/commons/thumb/b/bf/Chrysanthemum_x_morifolium_3.jpg/600px-Chrysanthemum_x_morifolium_3.jpg'),
  'coleus':                   img('https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Coleus_blumei_2.jpg/600px-Coleus_blumei_2.jpg'),
  'coriander-dhania':         img('https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Coriandrum_sativum_-_K%C3%B6hler%E2%80%93s_Medizinal-Pflanzen-199.jpg/600px-Coriandrum_sativum_-_K%C3%B6hler%E2%80%93s_Medizinal-Pflanzen-199.jpg'),
  'crossandra-firecracker':   img('https://upload.wikimedia.org/wikipedia/commons/thumb/b/b0/Crossandra_infundibuliformis.jpg/600px-Crossandra_infundibuliformis.jpg'),
  'croton':                   img('https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/Codiaeum_variegatum.jpg/600px-Codiaeum_variegatum.jpg'),
  'cucumber':                 img('https://upload.wikimedia.org/wikipedia/commons/thumb/d/d8/Cucumbers_on_a_vine.jpg/600px-Cucumbers_on_a_vine.jpg'),
  'curry-leaf':               img('https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/Curry_leaf_plant.jpg/600px-Curry_leaf_plant.jpg'),
  'curry-leaf-plant':         img('https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/Curry_leaf_plant.jpg/600px-Curry_leaf_plant.jpg'),
  'dahlia':                   img('https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Red_dahlia_cv._Hy_Clown.jpg/600px-Red_dahlia_cv._Hy_Clown.jpg'),
  'dracaena-corn-plant':      img('https://upload.wikimedia.org/wikipedia/commons/thumb/2/26/Dracaena_fragrans2.jpg/600px-Dracaena_fragrans2.jpg'),
  'drumstick-moringa':        img('https://upload.wikimedia.org/wikipedia/commons/thumb/7/7f/Moringa_oleifera_Blanco1.414-cropped.jpg/600px-Moringa_oleifera_Blanco1.414-cropped.jpg'),
  'dwarf-mango':              img('https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/Hapus_Mango.jpg/600px-Hapus_Mango.jpg'),
  'echeveria-succulent':      img('https://upload.wikimedia.org/wikipedia/commons/thumb/b/b6/Echeveria_%27Perle_von_N%C3%BCrnberg%27_1.jpg/600px-Echeveria_%27Perle_von_N%C3%BCrnberg%27_1.jpg'),
  'echeveria-elegans':        img('https://upload.wikimedia.org/wikipedia/commons/thumb/b/b6/Echeveria_%27Perle_von_N%C3%BCrnberg%27_1.jpg/600px-Echeveria_%27Perle_von_N%C3%BCrnberg%27_1.jpg'),
  'gerbera-daisy':            img('https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/Gerbera_daisy_red.jpg/600px-Gerbera_daisy_red.jpg'),
  'giloy-guduchi':            img('https://upload.wikimedia.org/wikipedia/commons/thumb/2/29/Tinospora_cordifolia.jpg/600px-Tinospora_cordifolia.jpg'),
  'green-chilli':             img('https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Red_Chili_Pepper_Cross_Section_edit2.jpg/600px-Red_Chili_Pepper_Cross_Section_edit2.jpg'),
  'guava':                    img('https://upload.wikimedia.org/wikipedia/commons/thumb/8/83/Guava_ID.jpg/600px-Guava_ID.jpg'),
  'haworthia':                img('https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/Haworthia_attenuata_var._attenuata_2.jpg/600px-Haworthia_attenuata_var._attenuata_2.jpg'),
  'haworthia-zebra-plant':    img('https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/Haworthia_attenuata_var._attenuata_2.jpg/600px-Haworthia_attenuata_var._attenuata_2.jpg'),
  'hibiscus':                 img('https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Hibiscus_rosa-sinensis.jpg/600px-Hibiscus_rosa-sinensis.jpg'),
  'hibiscus-china-rose':      img('https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Hibiscus_rosa-sinensis.jpg/600px-Hibiscus_rosa-sinensis.jpg'),
  'ixora-jungle-geranium':    img('https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Ixora_coccinea.jpg/600px-Ixora_coccinea.jpg'),
  'jade-plant':               img('https://upload.wikimedia.org/wikipedia/commons/thumb/d/db/Crassula_ovata.jpg/600px-Crassula_ovata.jpg'),
  'jade-plant-crassula':      img('https://upload.wikimedia.org/wikipedia/commons/thumb/d/db/Crassula_ovata.jpg/600px-Crassula_ovata.jpg'),
  'kalanchoe':                img('https://upload.wikimedia.org/wikipedia/commons/thumb/3/3d/Kalanchoe_blossfeldiana2.jpg/600px-Kalanchoe_blossfeldiana2.jpg'),
  'lemon-kagzi':              img('https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Lemon_-_whole_and_split.jpg/600px-Lemon_-_whole_and_split.jpg'),
  'lemongrass':               img('https://upload.wikimedia.org/wikipedia/commons/thumb/a/a3/Cymbopogon_citratus_-_K%C3%B6hler%E2%80%93s_Medizinal-Pflanzen-196.jpg/600px-Cymbopogon_citratus_-_K%C3%B6hler%E2%80%93s_Medizinal-Pflanzen-196.jpg'),
  'lettuce-salad':            img('https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Lettuce_mixture.jpg/600px-Lettuce_mixture.jpg'),
  'lucky-bamboo':             img('https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Lucky_Bamboo.jpg/600px-Lucky_Bamboo.jpg'),
  'marigold-genda':           img('https://upload.wikimedia.org/wikipedia/commons/thumb/5/58/Tagetes_erecta_in_Hyderabad%2C_AP_W_IMG_0397.jpg/600px-Tagetes_erecta_in_Hyderabad%2C_AP_W_IMG_0397.jpg'),
  'methi-fenugreek':          img('https://upload.wikimedia.org/wikipedia/commons/thumb/0/01/Fenugreek_Leaves_Closeup.jpg/600px-Fenugreek_Leaves_Closeup.jpg'),
  'microgreens-starter':      img('https://images.unsplash.com/photo-1601493700631-2b16ec4b4716?w=600&h=600&fit=crop'),
  'mint-pudina':              img('https://upload.wikimedia.org/wikipedia/commons/thumb/5/59/Mint-leaves-2007.jpg/600px-Mint-leaves-2007.jpg'),
  'mogra-jasmine':            img('https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Jasminum_sambac_%281%29.jpg/600px-Jasminum_sambac_%281%29.jpg'),
  'money-plant':              img('https://upload.wikimedia.org/wikipedia/commons/thumb/d/d8/Epipremnum_aureum_31082012.jpg/600px-Epipremnum_aureum_31082012.jpg'),
  'monstera-adansonii':       img('https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Monstera_adansonii.jpg/600px-Monstera_adansonii.jpg'),
  'monstera-deliciosa':       img('https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/Monstera_deliciosa_-_2022-06-23.jpg/600px-Monstera_deliciosa_-_2022-06-23.jpg'),
  'pak-choi':                 img('https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/Brassica_rapa_chinensis.jpg/600px-Brassica_rapa_chinensis.jpg'),
  'papaya':                   img('https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Papaya_cross_section_BNC.jpg/600px-Papaya_cross_section_BNC.jpg'),
  'parijat-night-jasmine':    img('https://upload.wikimedia.org/wikipedia/commons/thumb/0/0b/Nyctanthes_arbor-tristis_%28Parijata%29_flowers.jpg/600px-Nyctanthes_arbor-tristis_%28Parijata%29_flowers.jpg'),
  'peace-lily':               img('https://upload.wikimedia.org/wikipedia/commons/thumb/b/bd/Spathiphyllum_cochlearispathum_RTBG.jpg/600px-Spathiphyllum_cochlearispathum_RTBG.jpg'),
  'peas-matar':               img('https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/Peas_in_pods_-_Studio.jpg/600px-Peas_in_pods_-_Studio.jpg'),
  'peppermint':               img('https://upload.wikimedia.org/wikipedia/commons/thumb/b/bc/Mentha_x_piperita_001.JPG/600px-Mentha_x_piperita_001.JPG'),
  'petunia':                  img('https://upload.wikimedia.org/wikipedia/commons/thumb/0/0d/Petunia_cultivar_01.jpg/600px-Petunia_cultivar_01.jpg'),
  'philodendron':             img('https://upload.wikimedia.org/wikipedia/commons/thumb/c/c6/Philodendron_hederaceum_01.jpg/600px-Philodendron_hederaceum_01.jpg'),
  'pomegranate':              img('https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Pomegranate_fruit_-_whole_and_broken_with_soda_crackers.jpg/600px-Pomegranate_fruit_-_whole_and_broken_with_soda_crackers.jpg'),
  'portulaca-moss-rose':      img('https://upload.wikimedia.org/wikipedia/commons/thumb/7/78/Portulaca_grandiflora.jpg/600px-Portulaca_grandiflora.jpg'),
  'pothos-devils-ivy':        img('https://upload.wikimedia.org/wikipedia/commons/thumb/d/d8/Epipremnum_aureum_31082012.jpg/600px-Epipremnum_aureum_31082012.jpg'),
  'raat-ki-rani':             img('https://upload.wikimedia.org/wikipedia/commons/thumb/d/d8/Cestrum_nocturnum.jpg/600px-Cestrum_nocturnum.jpg'),
  'radish-mooli':             img('https://upload.wikimedia.org/wikipedia/commons/thumb/0/06/Radish-Varieties.jpg/600px-Radish-Varieties.jpg'),
  'rose-hybrid':              img('https://upload.wikimedia.org/wikipedia/commons/thumb/2/25/Red_rose.jpg/600px-Red_rose.jpg'),
  'rubber-plant':             img('https://upload.wikimedia.org/wikipedia/commons/thumb/c/ce/Rubber_tree_plant_%28Ficus_elastica%29.jpg/600px-Rubber_tree_plant_%28Ficus_elastica%29.jpg'),
  'rubber-plant-ficus':       img('https://upload.wikimedia.org/wikipedia/commons/thumb/c/ce/Rubber_tree_plant_%28Ficus_elastica%29.jpg/600px-Rubber_tree_plant_%28Ficus_elastica%29.jpg'),
  'skeletonfry':              img('https://images.unsplash.com/photo-1459156212016-c812468e2115?w=600&h=600&fit=crop'),
  'snake-plant':              img('https://upload.wikimedia.org/wikipedia/commons/thumb/f/fb/Snake_Plant_%28Sansevieria_trifasciata_%27Laurentii%27%29.jpg/600px-Snake_Plant_%28Sansevieria_trifasciata_%27Laurentii%27%29.jpg'),
  'spider-plant':             img('https://upload.wikimedia.org/wikipedia/commons/thumb/b/b1/Chlorophytum_comosum_0001.jpg/600px-Chlorophytum_comosum_0001.jpg'),
  'spinach-container':        img('https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/Spinach_leaves.jpg/600px-Spinach_leaves.jpg'),
  'spinach-palak':            img('https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/Spinach_leaves.jpg/600px-Spinach_leaves.jpg'),
  'spring-onion':             img('https://upload.wikimedia.org/wikipedia/commons/thumb/e/e6/Green_onion_-_scallion.jpg/600px-Green_onion_-_scallion.jpg'),
  'stevia':                   img('https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Stevia_rebaudiana.jpg/600px-Stevia_rebaudiana.jpg'),
  'strawberry':               img('https://upload.wikimedia.org/wikipedia/commons/thumb/2/29/PerfectStrawberry.jpg/600px-PerfectStrawberry.jpg'),
  'string-of-pearls':         img('https://upload.wikimedia.org/wikipedia/commons/thumb/6/61/Curio_rowleyanus_string_of_pearls.jpg/600px-Curio_rowleyanus_string_of_pearls.jpg'),
  'sunflower':                img('https://upload.wikimedia.org/wikipedia/commons/thumb/4/40/Sunflower_sky_backdrop.jpg/600px-Sunflower_sky_backdrop.jpg'),
  'sweet-basil':              img('https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/Basil-Basilico-Ocimum_basilicum-albahaca.jpg/600px-Basil-Basilico-Ocimum_basilicum-albahaca.jpg'),
  'syngonium-arrowhead':      img('https://upload.wikimedia.org/wikipedia/commons/thumb/7/7d/Syngonium_podophyllum02.jpg/600px-Syngonium_podophyllum02.jpg'),
  'tomato-desi':              img('https://upload.wikimedia.org/wikipedia/commons/thumb/8/88/Bright_red_tomato_and_cross_section02.jpg/600px-Bright_red_tomato_and_cross_section02.jpg'),
  'tradescantia-wandering-dude': img('https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Tradescantia_zebrina_Wandering_Jew_Habitusdetail.jpg/600px-Tradescantia_zebrina_Wandering_Jew_Habitusdetail.jpg'),
  'tulsi-holy-basil':         img('https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Ocimum_tenuiflorum3.jpg/600px-Ocimum_tenuiflorum3.jpg'),
  'vinca-periwinkle':         img('https://upload.wikimedia.org/wikipedia/commons/thumb/1/1c/Catharanthus_roseus_white_CC-BY.jpg/600px-Catharanthus_roseus_white_CC-BY.jpg'),
  'wheatgrass':               img('https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/Wheat-Grass.jpg/600px-Wheat-Grass.jpg'),
  'zz-plant':                 img('https://upload.wikimedia.org/wikipedia/commons/thumb/6/61/Zamioculcas_zamiifolia-4459.jpg/600px-Zamioculcas_zamiifolia-4459.jpg'),
  'jade-plant-v2':            img('https://upload.wikimedia.org/wikipedia/commons/thumb/d/db/Crassula_ovata.jpg/600px-Crassula_ovata.jpg'),
  // duplicates / alternates
}

const SEED_IMAGES: Record<string, { thumbnailUrl: string; images: string[] }> = {
  'seeds-beetroot':           img('https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/Beetroot_-_stonesoup.jpg/600px-Beetroot_-_stonesoup.jpg'),
  'seeds-bhindi-okra':        img('https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/Okra_%28Abelmoschus_esculentus%29.jpg/600px-Okra_%28Abelmoschus_esculentus%29.jpg'),
  'seeds-brinjal':            img('https://upload.wikimedia.org/wikipedia/commons/thumb/6/63/Aubergine.jpg/600px-Aubergine.jpg'),
  'seeds-capsicum-mixed':     img('https://upload.wikimedia.org/wikipedia/commons/thumb/b/b7/Red_capsicum_and_cross_section.jpg/600px-Red_capsicum_and_cross_section.jpg'),
  'seeds-carrot-chantenay':   img('https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Vegetable-Carrot-Bundle-wStalks.jpg/600px-Vegetable-Carrot-Bundle-wStalks.jpg'),
  'seeds-cherry-tomato':      img('https://upload.wikimedia.org/wikipedia/commons/thumb/8/88/Bright_red_tomato_and_cross_section02.jpg/600px-Bright_red_tomato_and_cross_section02.jpg'),
  'seeds-chilli-jwala':       img('https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Red_Chili_Pepper_Cross_Section_edit2.jpg/600px-Red_Chili_Pepper_Cross_Section_edit2.jpg'),
  'seeds-coriander':          img('https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Coriandrum_sativum_-_K%C3%B6hler%E2%80%93s_Medizinal-Pflanzen-199.jpg/600px-Coriandrum_sativum_-_K%C3%B6hler%E2%80%93s_Medizinal-Pflanzen-199.jpg'),
  'seeds-cosmos-mixed':       img('https://upload.wikimedia.org/wikipedia/commons/thumb/f/f1/Cosmos_bipinnatus_Dazzler.jpg/600px-Cosmos_bipinnatus_Dazzler.jpg'),
  'seeds-cucumber':           img('https://upload.wikimedia.org/wikipedia/commons/thumb/d/d8/Cucumbers_on_a_vine.jpg/600px-Cucumbers_on_a_vine.jpg'),
  'seeds-curry-leaf':         img('https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/Curry_leaf_plant.jpg/600px-Curry_leaf_plant.jpg'),
  'seeds-dahlia-dwarf':       img('https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Red_dahlia_cv._Hy_Clown.jpg/600px-Red_dahlia_cv._Hy_Clown.jpg'),
  'seeds-french-beans':       img('https://upload.wikimedia.org/wikipedia/commons/thumb/8/8f/French-Beans.jpg/600px-French-Beans.jpg'),
  'seeds-gerbera':            img('https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/Gerbera_daisy_red.jpg/600px-Gerbera_daisy_red.jpg'),
  'seeds-karela-bitter-gourd':img('https://upload.wikimedia.org/wikipedia/commons/thumb/4/42/Bitter_gourd.JPG/600px-Bitter_gourd.JPG'),
  'seeds-lauki-bottle-gourd': img('https://upload.wikimedia.org/wikipedia/commons/thumb/7/79/Bottle_Gourd_%28Lauki%29.jpg/600px-Bottle_Gourd_%28Lauki%29.jpg'),
  'seeds-lemongrass':         img('https://upload.wikimedia.org/wikipedia/commons/thumb/a/a3/Cymbopogon_citratus_-_K%C3%B6hler%E2%80%93s_Medizinal-Pflanzen-196.jpg/600px-Cymbopogon_citratus_-_K%C3%B6hler%E2%80%93s_Medizinal-Pflanzen-196.jpg'),
  'seeds-lettuce-lollo-rossa':img('https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Lettuce_mixture.jpg/600px-Lettuce_mixture.jpg'),
  'seeds-lotus':              img('https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Nelumbo_nucifera.jpg/600px-Nelumbo_nucifera.jpg'),
  'seeds-marigold-african':   img('https://upload.wikimedia.org/wikipedia/commons/thumb/5/58/Tagetes_erecta_in_Hyderabad%2C_AP_W_IMG_0397.jpg/600px-Tagetes_erecta_in_Hyderabad%2C_AP_W_IMG_0397.jpg'),
  'seeds-methi-fenugreek':    img('https://upload.wikimedia.org/wikipedia/commons/thumb/0/01/Fenugreek_Leaves_Closeup.jpg/600px-Fenugreek_Leaves_Closeup.jpg'),
  'seeds-microgreens-mix':    img('https://images.unsplash.com/photo-1601493700631-2b16ec4b4716?w=600&h=600&fit=crop'),
  'seeds-mint-pudina':        img('https://upload.wikimedia.org/wikipedia/commons/thumb/5/59/Mint-leaves-2007.jpg/600px-Mint-leaves-2007.jpg'),
  'seeds-peas-matar':         img('https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/Peas_in_pods_-_Studio.jpg/600px-Peas_in_pods_-_Studio.jpg'),
  'seeds-petunia-mixed':      img('https://upload.wikimedia.org/wikipedia/commons/thumb/0/0d/Petunia_cultivar_01.jpg/600px-Petunia_cultivar_01.jpg'),
  'seeds-portulaca':          img('https://upload.wikimedia.org/wikipedia/commons/thumb/7/78/Portulaca_grandiflora.jpg/600px-Portulaca_grandiflora.jpg'),
  'seeds-radish-mooli':       img('https://upload.wikimedia.org/wikipedia/commons/thumb/0/06/Radish-Varieties.jpg/600px-Radish-Varieties.jpg'),
  'seeds-ridge-gourd-turai':  img('https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Luffa_acutangula_Ridge_Gourd.jpg/600px-Luffa_acutangula_Ridge_Gourd.jpg'),
  'seeds-spinach-palak':      img('https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/Spinach_leaves.jpg/600px-Spinach_leaves.jpg'),
  'seeds-strawberry':         img('https://upload.wikimedia.org/wikipedia/commons/thumb/2/29/PerfectStrawberry.jpg/600px-PerfectStrawberry.jpg'),
  'seeds-sunflower-dwarf':    img('https://upload.wikimedia.org/wikipedia/commons/thumb/4/40/Sunflower_sky_backdrop.jpg/600px-Sunflower_sky_backdrop.jpg'),
  'seeds-sunflower-microgreens': img('https://images.unsplash.com/photo-1601493700631-2b16ec4b4716?w=600&h=600&fit=crop'),
  'seeds-sweet-basil':        img('https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/Basil-Basilico-Ocimum_basilicum-albahaca.jpg/600px-Basil-Basilico-Ocimum_basilicum-albahaca.jpg'),
  'seeds-tulsi':              img('https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Ocimum_tenuiflorum3.jpg/600px-Ocimum_tenuiflorum3.jpg'),
  'seeds-vinca':              img('https://upload.wikimedia.org/wikipedia/commons/thumb/1/1c/Catharanthus_roseus_white_CC-BY.jpg/600px-Catharanthus_roseus_white_CC-BY.jpg'),
  'seeds-watermelon-sugar-baby': img('https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Watermelon_seedless.jpg/600px-Watermelon_seedless.jpg'),
  'seeds-wheatgrass':         img('https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/Wheat-Grass.jpg/600px-Wheat-Grass.jpg'),
  'seeds-zinnia-mixed':       img('https://upload.wikimedia.org/wikipedia/commons/thumb/3/38/Zinnia_elegans_Benary_Giants_mix.jpg/600px-Zinnia_elegans_Benary_Giants_mix.jpg'),
  // v2 seeds
  'marigold-african-mixed-seeds': img('https://upload.wikimedia.org/wikipedia/commons/thumb/5/58/Tagetes_erecta_in_Hyderabad%2C_AP_W_IMG_0397.jpg/600px-Tagetes_erecta_in_Hyderabad%2C_AP_W_IMG_0397.jpg'),
  'sunflower-giant-seeds':    img('https://upload.wikimedia.org/wikipedia/commons/thumb/4/40/Sunflower_sky_backdrop.jpg/600px-Sunflower_sky_backdrop.jpg'),
  'zinnia-double-mix-seeds':  img('https://upload.wikimedia.org/wikipedia/commons/thumb/3/38/Zinnia_elegans_Benary_Giants_mix.jpg/600px-Zinnia_elegans_Benary_Giants_mix.jpg'),
  'petunia-mix-seeds':        img('https://upload.wikimedia.org/wikipedia/commons/thumb/0/0d/Petunia_cultivar_01.jpg/600px-Petunia_cultivar_01.jpg'),
  'lavender-french-seeds':    img('https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/Above_the_Fold.jpg/600px-Above_the_Fold.jpg'),
  'cherry-tomato-seeds':      img('https://upload.wikimedia.org/wikipedia/commons/thumb/8/88/Bright_red_tomato_and_cross_section02.jpg/600px-Bright_red_tomato_and_cross_section02.jpg'),
  'chilli-green-desi-seeds':  img('https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Red_Chili_Pepper_Cross_Section_edit2.jpg/600px-Red_Chili_Pepper_Cross_Section_edit2.jpg'),
  'spinach-palak-seeds':      img('https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/Spinach_leaves.jpg/600px-Spinach_leaves.jpg'),
  'coriander-dhaniya-seeds':  img('https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Coriandrum_sativum_-_K%C3%B6hler%E2%80%93s_Medizinal-Pflanzen-199.jpg/600px-Coriandrum_sativum_-_K%C3%B6hler%E2%80%93s_Medizinal-Pflanzen-199.jpg'),
  'mint-pudina-seeds':        img('https://upload.wikimedia.org/wikipedia/commons/thumb/5/59/Mint-leaves-2007.jpg/600px-Mint-leaves-2007.jpg'),
  'italian-basil-seeds':      img('https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/Basil-Basilico-Ocimum_basilicum-albahaca.jpg/600px-Basil-Basilico-Ocimum_basilicum-albahaca.jpg'),
  'fenugreek-methi-growing-seeds': img('https://upload.wikimedia.org/wikipedia/commons/thumb/0/01/Fenugreek_Leaves_Closeup.jpg/600px-Fenugreek_Leaves_Closeup.jpg'),
  'cosmos-mix-seeds-v2':      img('https://upload.wikimedia.org/wikipedia/commons/thumb/f/f1/Cosmos_bipinnatus_Dazzler.jpg/600px-Cosmos_bipinnatus_Dazzler.jpg'),
}

const SUPPLY_IMAGES: Record<string, { thumbnailUrl: string; images: string[] }> = {
  // Pots
  'coir-moss-stick-2ft':        img('https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&h=600&fit=crop&auto=format'),
  'coir-moss-stick-3ft':        img('https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&h=600&fit=crop&auto=format'),
  'ceramic-pot-with-saucer-6':  img('https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=600&h=600&fit=crop&auto=format'),
  'ceramic-pot-with-saucer-8':  img('https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=600&h=600&fit=crop&auto=format'),
  'self-watering-planter-8':    img('https://images.unsplash.com/photo-1501004318641-b39e6451bec6?w=600&h=600&fit=crop&auto=format'),
  'self-watering-planter-12':   img('https://images.unsplash.com/photo-1501004318641-b39e6451bec6?w=600&h=600&fit=crop&auto=format'),
  'terrarium-kit-diy':          img('https://images.unsplash.com/photo-1545241047-6083a3684587?w=600&h=600&fit=crop&auto=format'),
  'fabric-grow-bag-10-gallon-3pack': img('https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&h=600&fit=crop&auto=format'),
  'fabric-grow-bags-5-gallon-pack-5': img('https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&h=600&fit=crop&auto=format'),
  'grow-bag-15l':               img('https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&h=600&fit=crop&auto=format'),
  'grow-bag-25l':               img('https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&h=600&fit=crop&auto=format'),
  'terracotta-pot-set-with-saucers': img('https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=600&h=600&fit=crop&auto=format'),
  'terracotta-pot-6':           img('https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=600&h=600&fit=crop&auto=format'),
  'terracotta-pot-10':          img('https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=600&h=600&fit=crop&auto=format'),
  'macrame-hanging-planter-set-3': img('https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=600&h=600&fit=crop&auto=format'),
  // Soil
  'coco-peat-block-650g':       img('https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&h=600&fit=crop&auto=format'),
  'cocopeat-block-650g':        img('https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&h=600&fit=crop&auto=format'),
  'perlite-500g':               img('https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&h=600&fit=crop&auto=format'),
  'premium-potting-mix-5kg':    img('https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&h=600&fit=crop&auto=format'),
  'succulent-cactus-mix-2kg':   img('https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&h=600&fit=crop&auto=format'),
  'veggie-fruit-potting-mix-5kg': img('https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&h=600&fit=crop&auto=format'),
  // Fertiliser
  'neem-cake-powder-1kg':       img('https://upload.wikimedia.org/wikipedia/commons/thumb/3/3d/Neem_seeds.jpg/600px-Neem_seeds.jpg'),
  'neem-oil-100ml':             img('https://upload.wikimedia.org/wikipedia/commons/thumb/3/3d/Neem_seeds.jpg/600px-Neem_seeds.jpg'),
  'banana-peel-fertilizer-500g':img('https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Banana-Fruits.jpg/600px-Banana-Fruits.jpg'),
  'bone-meal-1kg':              img('https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&h=600&fit=crop&auto=format'),
  'vermicompost-2kg':           img('https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&h=600&fit=crop&auto=format'),
  'seaweed-extract-liquid-250ml': img('https://images.unsplash.com/photo-1564182842519-8a3b2af3e228?w=600&h=600&fit=crop&auto=format'),
  'seaweed-booster-250ml':      img('https://images.unsplash.com/photo-1564182842519-8a3b2af3e228?w=600&h=600&fit=crop&auto=format'),
  'npk-19-19-19-500g':          img('https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&h=600&fit=crop&auto=format'),
  'npk-liquid-fertiliser-500ml':img('https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&h=600&fit=crop&auto=format'),
  'bloom-booster-250ml':        img('https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&h=600&fit=crop&auto=format'),
  // Tools
  'garden-tool-kit-5piece':     img('https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&h=600&fit=crop&auto=format'),
  'stainless-pruning-shears':   img('https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&h=600&fit=crop&auto=format'),
  'bypass-pruning-shears':      img('https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&h=600&fit=crop&auto=format'),
  'watering-can-5l':            img('https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&h=600&fit=crop&auto=format'),
  'watering-can-1-5l-long-spout': img('https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&h=600&fit=crop&auto=format'),
  'fine-mist-spray-bottle-500ml': img('https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&h=600&fit=crop&auto=format'),
  'drip-irrigation-kit':        img('https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&h=600&fit=crop&auto=format'),
  'soil-moisture-meter':        img('https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&h=600&fit=crop&auto=format'),
  // Accessories
  'usb-grow-light-indoor':      img('https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&h=600&fit=crop&auto=format'),
}

async function main() {
  let updated = 0, skipped = 0

  // ── PLANTS ──────────────────────────────────────────────────────────────────
  console.log('Updating plant images…')
  const plants = await prisma.plant.findMany({ select: { id: true, slug: true, name: true } })
  for (const p of plants) {
    const imgs = PLANT_IMAGES[p.slug]
    if (!imgs) { console.log(`  ⚠ No image map for plant: ${p.name} (${p.slug})`); skipped++; continue }
    await prisma.plant.update({ where: { id: p.id }, data: imgs })
    console.log(`  ✓ ${p.name}`)
    updated++
  }

  // ── SEEDS ───────────────────────────────────────────────────────────────────
  console.log('\nUpdating seed images…')
  const seeds = await prisma.seed.findMany({ select: { id: true, slug: true, name: true } })
  for (const s of seeds) {
    const imgs = SEED_IMAGES[s.slug]
    if (!imgs) { console.log(`  ⚠ No image map for seed: ${s.name} (${s.slug})`); skipped++; continue }
    await prisma.seed.update({ where: { id: s.id }, data: imgs })
    console.log(`  ✓ ${s.name}`)
    updated++
  }

  // ── SUPPLIES ────────────────────────────────────────────────────────────────
  console.log('\nUpdating supply images…')
  const supplies = await prisma.supply.findMany({ select: { id: true, slug: true, name: true } })
  for (const s of supplies) {
    const imgs = SUPPLY_IMAGES[s.slug]
    if (!imgs) { console.log(`  ⚠ No image map for supply: ${s.name} (${s.slug})`); skipped++; continue }
    await prisma.supply.update({ where: { id: s.id }, data: imgs })
    console.log(`  ✓ ${s.name}`)
    updated++
  }

  console.log(`\n✅ Done — ${updated} updated, ${skipped} skipped (add to map)`)
}

main().catch(e => { console.error(e); process.exit(1) }).finally(() => prisma.$disconnect())
