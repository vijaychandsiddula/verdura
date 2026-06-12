import { useState, useEffect, useCallback } from 'react'
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, RefreshControl } from 'react-native'
import { Image } from 'expo-image'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { C } from '../../constants/colors'
import { gardenApi, type ApiGardenPlant } from '../../lib/api'
import { useAuthStore } from '../../store/auth'

export default function Garden() {
  const router = useRouter()
  const { user, hydrated } = useAuthStore()
  const [plants, setPlants] = useState<ApiGardenPlant[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const fetchGarden = useCallback(async () => {
    if (!user) { setLoading(false); setRefreshing(false); return }
    try {
      const res = await gardenApi.list()
      setPlants(res.data)
    } catch {
      // keep existing
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [user])

  useEffect(() => { if (hydrated) fetchGarden() }, [hydrated, fetchGarden])

  const onRefresh = () => { setRefreshing(true); fetchGarden() }

  const handleRemove = (gp: ApiGardenPlant) => {
    Alert.alert(`Remove ${gp.plant.name}?`, 'This will also delete its reminders.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: async () => {
        try {
          await gardenApi.remove(gp.id)
          setPlants((p) => p.filter((x) => x.id !== gp.id))
        } catch { Alert.alert('Error', 'Could not remove plant') }
      }},
    ])
  }

  if (!hydrated || loading) {
    return (
      <SafeAreaView style={s.safe}>
        <View style={s.hdr}><Text style={s.title}>My garden</Text></View>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color={C.green700} size="large" />
        </View>
      </SafeAreaView>
    )
  }

  if (!user) {
    return (
      <SafeAreaView style={s.safe}>
        <View style={s.hdr}><Text style={s.title}>My garden</Text></View>
        <View style={s.empty}>
          <Text style={s.emptyEmoji}>🔐</Text>
          <Text style={s.emptyTitle}>Sign in to see your garden</Text>
          <Text style={s.emptyBody}>Track your plants, set reminders, and monitor health — all in one place.</Text>
          <TouchableOpacity style={s.browseBtn} onPress={() => router.push('/(auth)/login')}>
            <Text style={s.browseBtnTxt}>Sign in</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.hdr}>
        <View>
          <Text style={s.title}>My garden</Text>
          <Text style={s.sub}>
            {plants.length > 0
              ? `${plants.length} plant${plants.length > 1 ? 's' : ''} in your collection`
              : 'Start your collection'}
          </Text>
        </View>
        <TouchableOpacity style={s.addBtn} onPress={() => router.push('/(tabs)')}>
          <Text style={s.addBtnTxt}>+ Add</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.green700} />}
      >
        {plants.length === 0 ? (
          <View style={s.empty}>
            <Text style={s.emptyEmoji}>🌱</Text>
            <Text style={s.emptyTitle}>Your garden is empty</Text>
            <Text style={s.emptyBody}>Tap any plant in the shop, open its detail, and press {'"'}+ My garden{'"'} to add it here.</Text>
            <TouchableOpacity style={s.browseBtn} onPress={() => router.push('/(tabs)')}>
              <Text style={s.browseBtnTxt}>Browse plants</Text>
            </TouchableOpacity>
          </View>
        ) : (
          plants.map((gp) => (
            <View key={gp.id} style={s.card}>
              {/* Plant image */}
              <View style={s.imgBox}>
                {gp.plant.thumbnailUrl ? (
                  <Image
                    source={{ uri: gp.plant.thumbnailUrl }}
                    style={s.img}
                    contentFit="cover"
                    transition={200}
                  />
                ) : (
                  <Text style={s.imgEmoji}>🌿</Text>
                )}
              </View>

              <View style={s.cardInfo}>
                <Text style={s.cardName}>{gp.nickname || gp.plant.name}</Text>
                <Text style={s.cardSci}>{gp.plant.scientificName}</Text>
                <View style={s.chips}>
                  <View style={s.chip}><Text style={s.chipTxt}>💧 {gp.plant.wateringIntervalDays}d</Text></View>
                  <View style={s.chip}><Text style={s.chipTxt}>🧪 {gp.plant.fertiliserIntervalDays}d</Text></View>
                </View>
              </View>

              <View style={s.right}>
                <View style={s.health}>
                  <Text style={s.healthNum}>{gp.healthScore}%</Text>
                  <Text style={s.healthLbl}>Health</Text>
                </View>
                <TouchableOpacity onPress={() => handleRemove(gp)}>
                  <Text style={s.removeTxt}>✕</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  safe:        { flex: 1, backgroundColor: C.sand },
  hdr:         { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 12 },
  title:       { fontSize: 22, fontWeight: '600', color: C.ink },
  sub:         { fontSize: 12, color: C.ink3, marginTop: 2 },
  addBtn:      { backgroundColor: C.green700, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 100 },
  addBtnTxt:   { fontSize: 13, fontWeight: '600', color: C.white },
  scroll:      { paddingHorizontal: 20, gap: 12 },
  card:        { flexDirection: 'row', alignItems: 'center', backgroundColor: C.white, borderRadius: 16, padding: 14, gap: 12, borderWidth: 1, borderColor: C.sand2 },
  imgBox:      { width: 56, height: 56, borderRadius: 12, backgroundColor: C.sand, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  img:         { width: 56, height: 56, borderRadius: 12 },
  imgEmoji:    { fontSize: 28 },
  cardInfo:    { flex: 1 },
  cardName:    { fontSize: 15, fontWeight: '500', color: C.ink },
  cardSci:     { fontSize: 12, color: C.ink4, fontStyle: 'italic', marginTop: 1 },
  chips:       { flexDirection: 'row', gap: 6, marginTop: 8, flexWrap: 'wrap' },
  chip:        { backgroundColor: C.green50, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 5 },
  chipTxt:     { fontSize: 11, color: C.green800 },
  right:       { alignItems: 'center', gap: 10 },
  health:      { backgroundColor: C.green50, width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: C.green200 },
  healthNum:   { fontSize: 13, fontWeight: '700', color: C.green700 },
  healthLbl:   { fontSize: 8, color: C.green600 },
  removeTxt:   { fontSize: 16, color: C.ink4, padding: 4 },
  empty:       { alignItems: 'center', paddingTop: 60, paddingHorizontal: 32 },
  emptyEmoji:  { fontSize: 64, marginBottom: 16 },
  emptyTitle:  { fontSize: 20, fontWeight: '600', color: C.ink, marginBottom: 8 },
  emptyBody:   { fontSize: 14, color: C.ink3, textAlign: 'center', lineHeight: 22, marginBottom: 24 },
  browseBtn:   { backgroundColor: C.green700, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 100 },
  browseBtnTxt:{ fontSize: 14, fontWeight: '600', color: C.white },
})
