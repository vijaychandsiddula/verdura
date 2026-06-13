import { useState, useEffect } from 'react'
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native'
import { Image } from 'expo-image'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { C } from '../../constants/colors'
import { plantsApi, gardenApi, type ApiPlant } from '../../lib/api'
import { useCart } from '../../store/cart'
import { useAuthStore } from '../../store/auth'

export default function PlantDetail() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const { user } = useAuthStore()
  const [plant, setPlant] = useState<ApiPlant | null>(null)
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState<number | null>(0)
  const [inGarden, setInGarden] = useState(false)
  const [addingGarden, setAddingGarden] = useState(false)
  const add = useCart((x) => x.add)

  useEffect(() => {
    plantsApi.getById(id)
      .then((res) => setPlant(res.data))
      .catch(() => Alert.alert('Error', 'Could not load plant'))
      .finally(() => setLoading(false))
  }, [id])

  const handleAddToGarden = async () => {
    if (!user) { router.push('/(auth)/login'); return }
    if (inGarden || !plant) return
    setAddingGarden(true)
    try {
      await gardenApi.add(plant.id)
      setInGarden(true)
      Alert.alert('Added! 🌿', `${plant.name} added to your garden. Watering and fertilising reminders have been set.`)
    } catch (err) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Could not add to garden')
    } finally {
      setAddingGarden(false)
    }
  }

  if (loading) {
    return (
      <SafeAreaView style={s.safe}>
        <View style={s.topBar}>
          <TouchableOpacity style={s.back} onPress={() => router.back()}>
            <Text style={s.backTxt}>← Back</Text>
          </TouchableOpacity>
        </View>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color={C.green700} size="large" />
        </View>
      </SafeAreaView>
    )
  }

  if (!plant) {
    return (
      <SafeAreaView style={s.safe}>
        <View style={s.topBar}>
          <TouchableOpacity style={s.back} onPress={() => router.back()}><Text style={s.backTxt}>← Back</Text></TouchableOpacity>
        </View>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ fontSize: 40, marginBottom: 12 }}>🌵</Text>
          <Text style={{ fontSize: 16, color: C.ink }}>Plant not found</Text>
        </View>
      </SafeAreaView>
    )
  }

  const careAtGlance = [
    { l: 'Watering', v: plant.careWatering || `Every ${plant.wateringIntervalDays} days` },
    { l: 'Sunlight', v: plant.careSunlight || '-' },
    { l: 'Humidity', v: plant.careHumidity || '-' },
    { l: 'Temperature', v: plant.careTemperature || '-' },
  ]

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.topBar}>
        <TouchableOpacity style={s.back} onPress={() => router.back()}>
          <Text style={s.backTxt}>← Back</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.cartBtn} onPress={() => router.push('/cart')}>
          <Text>🛒</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={[s.hero, { backgroundColor: '#e8f5e9' }]}>
          {plant.thumbnailUrl ? (
            <Image source={{ uri: plant.thumbnailUrl }} style={s.heroImage} contentFit="cover" transition={200} />
          ) : (
            <Text style={s.heroEmoji}>🌿</Text>
          )}
          <Text style={s.heroName}>{plant.name}</Text>
          <Text style={s.heroSci}>{plant.scientificName}</Text>
          <Text style={s.heroPrice}>₹ {plant.price}</Text>
          {plant.isBestseller && <View style={s.badge}><Text style={s.badgeTxt}>⭐ Bestseller</Text></View>}
          {plant.stock === 0 && <View style={[s.badge, { backgroundColor: '#fde8e8' }]}><Text style={[s.badgeTxt, { color: '#8b0000' }]}>Out of stock</Text></View>}
        </View>

        <View style={s.body}>
          <Text style={s.secTitle}>Care at a glance</Text>
          <View style={s.careGrid}>
            {careAtGlance.map((c) => (
              <View key={c.l} style={s.careBox}>
                <Text style={s.careLabel}>{c.l}</Text>
                <Text style={s.careVal}>{c.v}</Text>
              </View>
            ))}
          </View>

          {plant.description ? (
            <>
              <Text style={[s.secTitle, { marginTop: 20 }]}>About this plant</Text>
              <Text style={s.desc}>{plant.description}</Text>
            </>
          ) : null}

          {/* Pot & Soil Guide */}
          {plant.potSizeMinInch ? (
            <>
              <Text style={[s.secTitle, { marginTop: 20 }]}>Pot &amp; soil guide</Text>

              {/* Pot size card */}
              <View style={s.potCard}>
                <Text style={s.potEmoji}>🪴</Text>
                <View style={{ flex: 1 }}>
                  <Text style={s.potLabel}>Recommended pot size</Text>
                  <Text style={s.potSize}>{plant.potSizeMinInch}"–{plant.potSizeMaxInch}" &nbsp;<Text style={s.potVol}>({plant.potVolumeLitres} L)</Text></Text>
                  {plant.potNotes ? <Text style={s.potNote}>💡 {plant.potNotes}</Text> : null}
                </View>
              </View>

              {/* Soil bars */}
              <View style={s.soilCard}>
                <Text style={s.potLabel}>Soil mix composition</Text>
                {[
                  { label: 'Coco Peat',              pct: plant.soilCocoPeatPct,   color: '#b8895a', emoji: '🟤' },
                  { label: 'Garden Soil',             pct: plant.soilGardenSoilPct, color: '#7a5c14', emoji: '🌍' },
                  { label: 'Compost / Vermicompost',  pct: plant.soilCompostPct,    color: '#3b6d11', emoji: '♻️' },
                  ...(plant.soilExtrasPct ? [{ label: plant.soilExtrasNote ?? 'Extras', pct: plant.soilExtrasPct, color: '#809aaa', emoji: '⚪' }] : []),
                ].map(item => item.pct ? (
                  <View key={item.label} style={{ marginTop: 10 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                      <Text style={{ fontSize: 13, color: '#1a1a18' }}>{item.emoji} {item.label}</Text>
                      <Text style={{ fontSize: 13, fontWeight: '600', color: item.color }}>{item.pct}%</Text>
                    </View>
                    <View style={{ height: 7, backgroundColor: '#e8e0d0', borderRadius: 4, overflow: 'hidden' }}>
                      <View style={{ width: `${item.pct}%` as `${number}%`, height: '100%', backgroundColor: item.color, borderRadius: 4 }} />
                    </View>
                  </View>
                ) : null)}
              </View>
            </>
          ) : null}

          {plant.careGuide && plant.careGuide.length > 0 && (
            <>
              <Text style={[s.secTitle, { marginTop: 20 }]}>Full care guide</Text>
              {plant.careGuide.sort((a, b) => a.order - b.order).map((g, i) => (
                <View key={g.id || i} style={s.acc}>
                  <TouchableOpacity style={s.accHdr} onPress={() => setOpen(open === i ? null : i)}>
                    <Text style={s.accTitle}>{g.icon}  {g.title}</Text>
                    <Text style={s.accChev}>{open === i ? '▾' : '›'}</Text>
                  </TouchableOpacity>
                  {open === i && <Text style={s.accBody}>{g.body}</Text>}
                </View>
              ))}
            </>
          )}
          <View style={{ height: 120 }} />
        </View>
      </ScrollView>

      <View style={s.actions}>
        <TouchableOpacity
          style={[s.gardenBtn, inGarden && s.gardenBtnOn]}
          onPress={handleAddToGarden}
          disabled={addingGarden || inGarden}
        >
          <Text style={[s.gardenTxt, inGarden && s.gardenTxtOn]}>
            {addingGarden ? '...' : inGarden ? '✓ In garden' : '+ My garden'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[s.buyBtn, plant.stock === 0 && s.buyBtnOff]}
          onPress={() => {
            if (plant.stock === 0) return
            add({ id: plant.id, name: plant.name, price: plant.price, emoji: '🌿' })
            Alert.alert('', `🌿 ${plant.name} added to cart!`)
          }}
          disabled={plant.stock === 0}
        >
          <Text style={s.buyTxt}>{plant.stock === 0 ? 'Out of stock' : `Add to cart  ₹ ${plant.price}`}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.sand },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 12 },
  back: { backgroundColor: C.white, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 100, borderWidth: 1, borderColor: C.sand3 },
  backTxt: { fontSize: 13, color: C.ink2 },
  cartBtn: { width: 38, height: 38, backgroundColor: C.white, borderRadius: 19, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: C.sand3 },
  hero: { marginHorizontal: 20, borderRadius: 20, padding: 24, alignItems: 'center', borderWidth: 1, borderColor: C.sand2 },
  heroImage: { width: 180, height: 180, borderRadius: 16, marginBottom: 16 },
  heroEmoji: { fontSize: 88, marginBottom: 10 },
  heroName: { fontSize: 24, fontWeight: '600', color: C.ink },
  heroSci: { fontSize: 14, color: C.ink3, fontStyle: 'italic', marginTop: 2 },
  heroPrice: { fontSize: 28, fontWeight: '600', color: C.green700, marginTop: 10 },
  badge: { marginTop: 8, backgroundColor: C.green50, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 100 },
  badgeTxt: { fontSize: 12, fontWeight: '500', color: C.green800 },
  body: { padding: 20 },
  secTitle: { fontSize: 12, fontWeight: '600', color: C.ink4, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 },
  careGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  careBox: { width: '47%', backgroundColor: C.white, borderRadius: 12, padding: 12, borderWidth: 1, borderColor: C.sand2 },
  careLabel: { fontSize: 11, color: C.ink4, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 4 },
  careVal: { fontSize: 14, fontWeight: '500', color: C.ink },
  desc: { fontSize: 14, color: C.ink2, lineHeight: 22 },
  potCard: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, backgroundColor: C.white, borderRadius: 14, padding: 16, borderWidth: 1, borderColor: C.sand2, marginBottom: 10 },
  potEmoji: { fontSize: 28 },
  potLabel: { fontSize: 11, color: C.ink4, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 4 },
  potSize: { fontSize: 20, fontWeight: '700', color: C.green700 },
  potVol: { fontSize: 13, fontWeight: '400', color: C.ink3 },
  potNote: { fontSize: 12, color: C.ink3, lineHeight: 18, marginTop: 8, backgroundColor: '#f9f7f2', borderRadius: 8, padding: 8 },
  soilCard: { backgroundColor: C.white, borderRadius: 14, padding: 16, borderWidth: 1, borderColor: C.sand2, marginBottom: 20 },
  acc: { backgroundColor: C.white, borderRadius: 12, marginBottom: 8, borderWidth: 1, borderColor: C.sand2, overflow: 'hidden' },
  accHdr: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 14 },
  accTitle: { fontSize: 14, fontWeight: '500', color: C.ink },
  accChev: { fontSize: 16, color: C.ink4 },
  accBody: { fontSize: 13, color: C.ink3, lineHeight: 20, paddingHorizontal: 14, paddingBottom: 14 },
  actions: { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', gap: 10, padding: 20, paddingBottom: 36, backgroundColor: C.sand, borderTopWidth: 0.5, borderTopColor: C.sand3 },
  gardenBtn: { flex: 1, backgroundColor: C.white, borderWidth: 1.5, borderColor: C.sand3, borderRadius: 100, paddingVertical: 13, alignItems: 'center' },
  gardenBtnOn: { backgroundColor: C.green50, borderColor: C.green200 },
  gardenTxt: { fontSize: 14, fontWeight: '500', color: C.ink2 },
  gardenTxtOn: { color: C.green800 },
  buyBtn: { flex: 2, backgroundColor: C.green700, borderRadius: 100, paddingVertical: 13, alignItems: 'center' },
  buyBtnOff: { backgroundColor: C.sand3 },
  buyTxt: { fontSize: 14, fontWeight: '600', color: C.white },
})
