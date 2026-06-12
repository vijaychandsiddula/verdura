import { useState, useEffect, useCallback, useRef, memo } from 'react'
import { View, Text, FlatList, TouchableOpacity, StyleSheet, TextInput, RefreshControl, Animated, ScrollView } from 'react-native'
import { Image } from 'expo-image'
import { SafeAreaView } from 'react-native-safe-area-context'
import { C } from '../../constants/colors'
import { seedsApi, type ApiSeed } from '../../lib/api'
import { useCart } from '../../store/cart'

const CATS = [
  { id: '', label: 'All', emoji: '🌱' },
  { id: 'vegetable', label: 'Vegetables', emoji: '🥦' },
  { id: 'herb', label: 'Herbs', emoji: '🌿' },
  { id: 'flowering', label: 'Flowering', emoji: '🌸' },
  { id: 'fruit', label: 'Fruits', emoji: '🍋' },
  { id: 'indoor', label: 'Indoor', emoji: '🏠' },
  { id: 'outdoor', label: 'Outdoor', emoji: '🌳' },
  { id: 'succulent', label: 'Succulents', emoji: '🌵' },
]

function difficultyBg(d: string) {
  if (d === 'beginner') return { bg: '#eaf3de', color: '#27500a' }
  if (d === 'intermediate') return { bg: '#fdf5e6', color: '#854f0b' }
  return { bg: '#fde8e8', color: '#8b0000' }
}

// ─── Memoised card ────────────────────────────────────────────────────────────
const SeedCard = memo(({ item, onAdd }: { item: ApiSeed; onAdd: (s: ApiSeed) => void }) => {
  const diff = difficultyBg(item.difficulty)
  return (
    <View style={s.card}>
      <View style={s.imgBox}>
        <Image source={{ uri: item.thumbnailUrl }} style={s.img} contentFit="cover" transition={150} />
        <View style={s.germBadge}>
          <Text style={s.germTxt}>🌱 {item.germinationDays}</Text>
        </View>
        {item.isBestseller && (
          <View style={s.badge}><Text style={s.badgeTxt}>Bestseller</Text></View>
        )}
        {item.isNewArrival && !item.isBestseller && (
          <View style={[s.badge, { backgroundColor: '#fdf5e6' }]}>
            <Text style={[s.badgeTxt, { color: '#854f0b' }]}>New</Text>
          </View>
        )}
      </View>
      <View style={s.info}>
        <Text style={s.name} numberOfLines={2}>{item.name}</Text>
        <Text style={s.sci} numberOfLines={1}>{item.scientificName}</Text>
        <View style={s.chips}>
          <View style={[s.chip, { backgroundColor: diff.bg }]}>
            <Text style={[s.chipTxt, { color: diff.color }]}>{item.difficulty}</Text>
          </View>
          {item.seedsPerPacket > 0 && (
            <View style={s.chip}><Text style={s.chipTxt}>📦 {item.seedsPerPacket} seeds</Text></View>
          )}
        </View>
        <Text style={s.season}>📅 Sow: {item.sowingSeason}</Text>
        {item.harvestDays && <Text style={s.harvest}>🌾 Harvest: {item.harvestDays}</Text>}
        <View style={s.priceRow}>
          <View>
            <Text style={s.price}>₹{item.price}</Text>
            {item.comparePrice && <Text style={s.compare}>₹{item.comparePrice}</Text>}
          </View>
          <TouchableOpacity
            style={[s.addBtn, item.stock === 0 && s.addBtnDis]}
            disabled={item.stock === 0}
            onPress={() => onAdd(item)}
          >
            <Text style={s.addTxt}>{item.stock > 0 ? '+' : '✕'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )
})

export default function Seeds() {
  const [cat, setCat] = useState('')
  const [query, setQuery] = useState('')
  const [seeds, setSeeds] = useState<ApiSeed[]>([])
  const [fetching, setFetching] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const add = useCart((x) => x.add)
  const barWidth = useRef(new Animated.Value(0)).current
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const fetch_ = useCallback(async (q?: string, c?: string) => {
    setFetching(true)
    barWidth.setValue(0)
    Animated.timing(barWidth, { toValue: 80, duration: 400, useNativeDriver: false }).start()
    try {
      const params: Record<string, string | number> = { limit: 50 }
      const activeQ = q ?? query
      const activeCat = c ?? cat
      if (activeCat) params.category = activeCat
      if (activeQ) params.search = activeQ
      const res = await seedsApi.list(params)
      Animated.timing(barWidth, { toValue: 100, duration: 150, useNativeDriver: false }).start(() => {
        setSeeds(res.data)
        setFetching(false)
      })
    } catch {
      setFetching(false)
    }
  }, [cat, query])

  useEffect(() => { fetch_() }, [])

  useEffect(() => {
    if (searchTimer.current) clearTimeout(searchTimer.current)
    searchTimer.current = setTimeout(() => fetch_(query, cat), 350)
    return () => { if (searchTimer.current) clearTimeout(searchTimer.current) }
  }, [query, cat])

  const onRefresh = async () => { setRefreshing(true); await fetch_(); setRefreshing(false) }

  const handleAdd = useCallback((seed: ApiSeed) => {
    add({ id: seed.id, name: seed.name, price: seed.price, emoji: '🌱' })
  }, [add])

  const barWidthPct = barWidth.interpolate({ inputRange: [0, 100], outputRange: ['0%', '100%'] })

  const ListHeader = (
    <>
      <View style={s.header}>
        <Text style={s.subtitle}><Text style={s.subtitleBold}>{seeds.length} varieties</Text> for home growing</Text>
      </View>
      <View style={s.searchRow}>
        <Text style={s.searchIcon}>🔍</Text>
        <TextInput
          style={s.searchInput}
          placeholder="Search seeds…"
          placeholderTextColor={C.ink4}
          value={query}
          onChangeText={setQuery}
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => setQuery('')}>
            <Text style={s.clearBtn}>✕</Text>
          </TouchableOpacity>
        )}
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.pillRow} contentContainerStyle={s.pillContent}>
        {CATS.map(c => (
          <TouchableOpacity key={c.id} style={[s.pill, cat === c.id && s.pillActive]} onPress={() => setCat(c.id)}>
            <Text style={[s.pillTxt, cat === c.id && s.pillTxtActive]}>{c.emoji} {c.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      {seeds.length === 0 && !fetching && (
        <View style={s.empty}>
          <Text style={s.emptyIcon}>🌱</Text>
          <Text style={s.emptyTxt}>No seeds found</Text>
        </View>
      )}
    </>
  )

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.progressTrack}>
        <Animated.View style={[s.progressBar, { width: barWidthPct, opacity: fetching ? 1 : 0 }]} />
      </View>
      <FlatList
        data={seeds}
        keyExtractor={(item) => item.id}
        numColumns={2}
        key="seeds-grid"
        renderItem={({ item }) => <SeedCard item={item} onAdd={handleAdd} />}
        ListHeaderComponent={ListHeader}
        ListFooterComponent={<View style={{ height: 100 }} />}
        columnWrapperStyle={s.row}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.green700} />}
        removeClippedSubviews
        initialNumToRender={8}
        maxToRenderPerBatch={8}
        windowSize={5}
      />
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  safe:          { flex: 1, backgroundColor: C.sand },
  progressTrack: { height: 2, backgroundColor: C.sand3 },
  progressBar:   { height: 2, backgroundColor: C.green700 },
  header:        { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 12 },
  subtitle:      { fontSize: 13, color: C.ink3, marginTop: 2 },
  subtitleBold:  { fontWeight: '700', color: C.ink1 },
  searchRow:     { flexDirection: 'row', alignItems: 'center', marginHorizontal: 20, marginBottom: 12, backgroundColor: 'white', borderRadius: 12, paddingHorizontal: 12, borderWidth: 1, borderColor: C.sand3 },
  searchIcon:    { fontSize: 16, marginRight: 6 },
  searchInput:   { flex: 1, height: 40, fontSize: 14, color: C.ink1 },
  clearBtn:      { fontSize: 14, color: C.ink4, paddingLeft: 8 },
  pillRow:       { marginBottom: 16 },
  pillContent:   { paddingHorizontal: 20, gap: 8, flexDirection: 'row' },
  pill:          { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 100, backgroundColor: 'white', borderWidth: 1, borderColor: C.sand3 },
  pillActive:    { backgroundColor: C.green700, borderColor: C.green700 },
  pillTxt:       { fontSize: 13, fontWeight: '500', color: C.ink3 },
  pillTxtActive: { color: 'white' },
  row:           { paddingHorizontal: 12, gap: 12, marginBottom: 12 },
  card:          { flex: 1, backgroundColor: 'white', borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: C.sand3 },
  imgBox:        { height: 140, backgroundColor: '#f0fde8', position: 'relative' },
  img:           { width: '100%', height: '100%' },
  germBadge:     { position: 'absolute', bottom: 6, right: 6, backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: 100, paddingHorizontal: 7, paddingVertical: 3 },
  germTxt:       { fontSize: 10, fontWeight: '600', color: C.green700 },
  badge:         { position: 'absolute', top: 8, left: 8, backgroundColor: '#eaf3de', borderRadius: 100, paddingHorizontal: 8, paddingVertical: 3 },
  badgeTxt:      { fontSize: 10, fontWeight: '600', color: '#27500a' },
  info:          { padding: 10 },
  name:          { fontSize: 13, fontWeight: '600', color: C.ink1, lineHeight: 18 },
  sci:           { fontSize: 11, color: C.ink4, fontStyle: 'italic', marginTop: 2, marginBottom: 6 },
  chips:         { flexDirection: 'row', gap: 4, flexWrap: 'wrap', marginBottom: 6 },
  chip:          { backgroundColor: C.sand2, borderRadius: 6, paddingHorizontal: 7, paddingVertical: 3 },
  chipTxt:       { fontSize: 10, color: C.ink3, fontWeight: '500' },
  season:        { fontSize: 11, color: C.ink4, marginBottom: 2 },
  harvest:       { fontSize: 11, color: C.ink4, marginBottom: 8 },
  priceRow:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 },
  price:         { fontSize: 16, fontWeight: '700', color: C.green700 },
  compare:       { fontSize: 11, color: C.ink4, textDecorationLine: 'line-through' },
  addBtn:        { width: 32, height: 32, backgroundColor: C.green700, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  addBtnDis:     { backgroundColor: C.ink4 },
  addTxt:        { color: 'white', fontSize: 20, lineHeight: 22, fontWeight: '700' },
  empty:         { alignItems: 'center', paddingTop: 80 },
  emptyIcon:     { fontSize: 60 },
  emptyTxt:      { fontSize: 16, color: C.ink4, marginTop: 12 },
})
