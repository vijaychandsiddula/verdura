import { useState, useEffect, useCallback, useRef, memo } from 'react'
import { View, Text, FlatList, TouchableOpacity, TextInput, StyleSheet, Alert, Pressable, RefreshControl, ScrollView } from 'react-native'
import { Image } from 'expo-image'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { C } from '../../constants/colors'
import { plantsApi, type ApiPlant } from '../../lib/api'
import { useCart } from '../../store/cart'
import { useAuthStore } from '../../store/auth'

const FILTERS = [
  { label: 'All', cat: '' },
  { label: 'Indoor', cat: 'indoor' },
  { label: 'Outdoor', cat: 'outdoor' },
  { label: 'Succulents', cat: 'succulent' },
  { label: 'Air purifying', cat: 'air_purifying' },
  { label: 'Herbs', cat: 'herb' },
]

// ─── Memoised card so FlatList only re-renders changed items ─────────────────
const PlantCard = memo(({ item, onAdd, onPress }: {
  item: ApiPlant
  onAdd: (p: ApiPlant) => void
  onPress: (p: ApiPlant) => void
}) => (
  <Pressable style={s.card} onPress={() => onPress(item)}>
    <View style={[s.cardImg, { backgroundColor: '#e8f5e9' }]}>
      {item.thumbnailUrl ? (
        <Image source={{ uri: item.thumbnailUrl }} style={s.cardImage} contentFit="cover" transition={150} />
      ) : (
        <Text style={s.cardEmoji}>🌿</Text>
      )}
      {item.isBestseller && <View style={s.cardTag}><Text style={s.cardTagTxt}>Bestseller</Text></View>}
      {item.isNewArrival && !item.isBestseller && (
        <View style={[s.cardTag, { backgroundColor: '#e3f0ff' }]}>
          <Text style={[s.cardTagTxt, { color: '#1a5fa8' }]}>New</Text>
        </View>
      )}
    </View>
    <View style={s.cardBody}>
      <Text style={s.cardName} numberOfLines={1}>{item.name}</Text>
      <Text style={s.cardSci} numberOfLines={1}>{item.scientificName}</Text>
      <View style={{ flexDirection: 'row', gap: 4, marginTop: 6, marginBottom: 4 }}>
        <View style={s.chip}><Text style={s.chipTxt}>💧 {item.wateringIntervalDays}d</Text></View>
        <View style={s.chip}><Text style={s.chipTxt}>{item.difficulty}</Text></View>
      </View>
      <View style={s.cardFt}>
        <View>
          <Text style={s.cardPrice}>₹ {item.price}</Text>
          {item.comparePrice && item.comparePrice > item.price && (
            <Text style={s.cardOld}>₹ {item.comparePrice}</Text>
          )}
        </View>
        <TouchableOpacity
          style={[s.addBtn, item.stock === 0 && s.addBtnOff]}
          onPress={() => item.stock > 0 && onAdd(item)}
          disabled={item.stock === 0}
        >
          <Text style={s.addBtnTxt}>{item.stock === 0 ? 'x' : '+'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  </Pressable>
))

export default function Shop() {
  const router = useRouter()
  const { user } = useAuthStore()
  const [q, setQ] = useState('')
  const [filter, setFilter] = useState('')
  const [plants, setPlants] = useState<ApiPlant[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const firstLoad = useRef(true)
  const add = useCart((x) => x.add)
  const count = useCart((x) => x.count())

  const fetchPlants = useCallback(async () => {
    try {
      const params: Record<string, string | number> = { limit: 50 }
      if (filter) params.category = filter
      if (q) params.search = q
      const res = await plantsApi.list(params)
      setPlants(res.data)
    } catch {
      // keep existing list
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [filter, q])

  useEffect(() => {
    if (firstLoad.current) { setLoading(true); firstLoad.current = false }
    const t = setTimeout(fetchPlants, q ? 400 : 0)
    return () => clearTimeout(t)
  }, [fetchPlants, q, filter])

  const onRefresh = () => { setRefreshing(true); fetchPlants() }

  const handleAdd = useCallback((p: ApiPlant) => {
    add({ id: p.id, name: p.name, price: p.price, emoji: '🌿' })
    Alert.alert('', `🌿 ${p.name} added to cart!`)
  }, [add])

  const handlePress = useCallback((p: ApiPlant) => {
    router.push({ pathname: '/plant/[id]', params: { id: p.id } })
  }, [router])

  const ListHeader = (
    <>
      {/* Hero */}
      <View style={s.hero}>
        <View style={{ flex: 1 }}>
          <Text style={s.heroEye}>Premium plants · Free shipping</Text>
          <Text style={s.heroTitle}>Grow something{'\n'}beautiful 🌿</Text>
          {!user && (
            <TouchableOpacity style={s.heroBtn} onPress={() => router.push('/(auth)/login')}>
              <Text style={s.heroBtnTxt}>Sign in to track plants</Text>
            </TouchableOpacity>
          )}
        </View>
        <Text style={s.heroBg}>🌿</Text>
      </View>

      {/* Search */}
      <View style={s.search}>
        <Text>🔍  </Text>
        <TextInput style={s.searchIn} placeholder="Search plants..." placeholderTextColor={C.ink4} value={q} onChangeText={setQ} />
        {q.length > 0 && (
          <TouchableOpacity onPress={() => setQ('')}><Text style={{ color: C.ink4, fontSize: 16 }}>✕</Text></TouchableOpacity>
        )}
      </View>

      {/* Filter pills */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.filters}>
        {FILTERS.map((x) => (
          <TouchableOpacity key={x.cat} style={[s.pill, filter === x.cat && s.pillOn]} onPress={() => setFilter(x.cat)}>
            <Text style={[s.pillTxt, filter === x.cat && s.pillTxtOn]}>{x.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Progress bar */}
      {loading && (
        <View style={{ height: 3, backgroundColor: C.sand3, marginHorizontal: 16, borderRadius: 2, marginBottom: 8 }}>
          <View style={{ height: 3, backgroundColor: C.green700, borderRadius: 2, width: '60%' }} />
        </View>
      )}

      {/* Empty state */}
      {!loading && plants.length === 0 && (
        <View style={{ padding: 40, alignItems: 'center' }}>
          <Text style={{ fontSize: 40, marginBottom: 12 }}>🌵</Text>
          <Text style={{ fontSize: 16, fontWeight: '600', color: C.ink, marginBottom: 6 }}>No plants found</Text>
          <Text style={{ fontSize: 13, color: C.ink3, textAlign: 'center' }}>Try a different search or filter</Text>
        </View>
      )}
    </>
  )

  return (
    <SafeAreaView style={s.safe}>
      {/* Fixed top header */}
      <View style={s.hdr}>
        <View>
          <Text style={s.logo}>Verdura 🌿</Text>
          <Text style={s.sub}>{user ? `Hello, ${user.name.split(' ')[0]} ☀️` : 'Good morning ☀️'}</Text>
        </View>
        <TouchableOpacity style={s.cartWrap} onPress={() => router.push('/cart')}>
          <Text style={s.cartIcon}>🛒</Text>
          {count > 0 && <View style={s.cartBadge}><Text style={s.cartBadgeTxt}>{count}</Text></View>}
        </TouchableOpacity>
      </View>

      <FlatList
        data={plants}
        keyExtractor={(item) => item.id}
        numColumns={2}
        key="plants-grid"
        renderItem={({ item }) => <PlantCard item={item} onAdd={handleAdd} onPress={handlePress} />}
        ListHeaderComponent={ListHeader}
        ListFooterComponent={<View style={{ height: 32 }} />}
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
  safe:         { flex: 1, backgroundColor: C.sand },
  hdr:          { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 12 },
  logo:         { fontSize: 20, fontWeight: '600', color: C.ink },
  sub:          { fontSize: 12, color: C.ink3, marginTop: 1 },
  cartWrap:     { width: 40, height: 40, backgroundColor: C.white, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  cartIcon:     { fontSize: 18 },
  cartBadge:    { position: 'absolute', top: -2, right: -2, backgroundColor: C.red, borderRadius: 8, minWidth: 16, height: 16, alignItems: 'center', justifyContent: 'center' },
  cartBadgeTxt: { color: '#fff', fontSize: 9, fontWeight: '700' },
  hero:         { margin: 20, backgroundColor: C.green900, borderRadius: 20, padding: 22, flexDirection: 'row', alignItems: 'center', overflow: 'hidden' },
  heroEye:      { fontSize: 11, color: C.green200, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 },
  heroTitle:    { fontSize: 22, fontWeight: '600', color: C.white, lineHeight: 28, marginBottom: 14 },
  heroBtn:      { backgroundColor: C.white, paddingHorizontal: 18, paddingVertical: 9, borderRadius: 100, alignSelf: 'flex-start' },
  heroBtnTxt:   { fontSize: 13, fontWeight: '600', color: C.green800 },
  heroBg:       { fontSize: 72, opacity: 0.3, marginLeft: 8 },
  search:       { flexDirection: 'row', alignItems: 'center', marginHorizontal: 20, marginBottom: 14, backgroundColor: C.white, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 10, borderWidth: 1, borderColor: C.sand3 },
  searchIn:     { flex: 1, fontSize: 14, color: C.ink },
  filters:      { paddingHorizontal: 20, gap: 8, marginBottom: 16 },
  pill:         { backgroundColor: C.white, borderWidth: 1, borderColor: C.sand3, paddingHorizontal: 14, paddingVertical: 7, borderRadius: 100 },
  pillOn:       { backgroundColor: C.green700, borderColor: C.green700 },
  pillTxt:      { fontSize: 12, color: C.ink3 },
  pillTxtOn:    { color: C.white },
  row:          { paddingHorizontal: 14, gap: 12, marginBottom: 12 },
  card:         { flex: 1, backgroundColor: C.white, borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: C.sand2 },
  cardImg:      { height: 110, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  cardImage:    { width: '100%', height: '100%' },
  cardEmoji:    { fontSize: 52 },
  cardTag:      { position: 'absolute', top: 8, left: 8, backgroundColor: C.green50, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 100 },
  cardTagTxt:   { fontSize: 10, fontWeight: '500', color: C.green800 },
  cardBody:     { padding: 10 },
  cardName:     { fontSize: 14, fontWeight: '500', color: C.ink },
  cardSci:      { fontSize: 11, color: C.ink4, fontStyle: 'italic', marginTop: 1 },
  chip:         { backgroundColor: C.sand, paddingHorizontal: 7, paddingVertical: 3, borderRadius: 5 },
  chipTxt:      { fontSize: 10, color: C.ink3 },
  cardFt:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 },
  cardPrice:    { fontSize: 16, fontWeight: '600', color: C.green700 },
  cardOld:      { fontSize: 11, color: C.ink4, textDecorationLine: 'line-through' },
  addBtn:       { width: 30, height: 30, backgroundColor: C.green700, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  addBtnOff:    { backgroundColor: C.sand3 },
  addBtnTxt:    { fontSize: 20, color: C.white, lineHeight: 24 },
})
