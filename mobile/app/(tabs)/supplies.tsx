import { useState, useEffect, useCallback, useRef, memo } from 'react'
import { View, Text, FlatList, TouchableOpacity, StyleSheet, TextInput, RefreshControl, Animated, Alert, ScrollView } from 'react-native'
import { Image } from 'expo-image'
import { SafeAreaView } from 'react-native-safe-area-context'
import { C } from '../../constants/colors'
import { suppliesApi, type ApiSupply } from '../../lib/api'
import { useCart } from '../../store/cart'

const CATS = [
  { id: '', label: 'All', emoji: '🛒' },
  { id: 'pots', label: 'Pots', emoji: '🪴' },
  { id: 'soil', label: 'Soil', emoji: '🌍' },
  { id: 'fertiliser', label: 'Fertilisers', emoji: '🧪' },
  { id: 'tools', label: 'Tools', emoji: '✂️' },
  { id: 'accessories', label: 'Accessories', emoji: '🎀' },
]

// ─── Memoised card ────────────────────────────────────────────────────────────
const SupplyCard = memo(({ item, onAdd }: { item: ApiSupply; onAdd: (s: ApiSupply) => void }) => (
  <View style={s.card}>
    <View style={s.imgBox}>
      {item.thumbnailUrl ? (
        <Image source={{ uri: item.thumbnailUrl }} style={s.img} contentFit="cover" transition={150} />
      ) : (
        <View style={s.imgPlaceholder}><Text style={{ fontSize: 40 }}>📦</Text></View>
      )}
      {item.isBestseller && (
        <View style={s.badge}><Text style={s.badgeTxt}>Bestseller</Text></View>
      )}
    </View>
    <View style={s.info}>
      <Text style={s.name} numberOfLines={2}>{item.name}</Text>
      <Text style={s.desc} numberOfLines={2}>{item.description}</Text>
      {item.badges?.length > 0 && (
        <View style={s.chips}>
          {item.badges.slice(0, 2).map(b => (
            <View key={b} style={s.chip}><Text style={s.chipTxt}>{b}</Text></View>
          ))}
        </View>
      )}
      <View style={s.priceRow}>
        <View>
          <Text style={s.price}>₹{item.price}</Text>
          {item.comparePrice && item.comparePrice > item.price && (
            <Text style={s.compare}>₹{item.comparePrice}</Text>
          )}
        </View>
        <TouchableOpacity
          style={[s.addBtn, item.stock === 0 && s.addBtnDis]}
          disabled={item.stock === 0}
          onPress={() => onAdd(item)}
        >
          <Text style={s.addTxt}>{item.stock === 0 ? '✕' : '+'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  </View>
))

export default function Supplies() {
  const [cat, setCat] = useState('')
  const [query, setQuery] = useState('')
  const [supplies, setSupplies] = useState<ApiSupply[]>([])
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
      const res = await suppliesApi.list(params)
      Animated.timing(barWidth, { toValue: 100, duration: 150, useNativeDriver: false }).start(() => {
        setSupplies(res.data)
        setFetching(false)
      })
    } catch {
      setFetching(false)
    } finally {
      setRefreshing(false)
    }
  }, [cat, query])

  useEffect(() => { fetch_() }, [])

  useEffect(() => {
    if (searchTimer.current) clearTimeout(searchTimer.current)
    searchTimer.current = setTimeout(() => fetch_(query, cat), 350)
    return () => { if (searchTimer.current) clearTimeout(searchTimer.current) }
  }, [query, cat])

  const onRefresh = async () => { setRefreshing(true); await fetch_() }

  const handleAdd = useCallback((item: ApiSupply) => {
    add({ id: item.id, name: item.name, price: item.price, emoji: '📦' })
    Alert.alert('Added!', item.name + ' added to cart')
  }, [add])

  const barWidthPct = barWidth.interpolate({ inputRange: [0, 100], outputRange: ['0%', '100%'] })

  const ListHeader = (
    <>
      <View style={s.header}>
        <Text style={s.subtitle}><Text style={s.subtitleBold}>{supplies.length} products</Text> for your garden</Text>
      </View>
      <View style={s.searchRow}>
        <Text style={s.searchIcon}>🔍</Text>
        <TextInput
          style={s.searchInput}
          placeholder="Search supplies…"
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
      {supplies.length === 0 && !fetching && (
        <View style={s.empty}>
          <Text style={s.emptyIcon}>📦</Text>
          <Text style={s.emptyTxt}>No supplies found</Text>
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
        data={supplies}
        keyExtractor={(item) => item.id}
        numColumns={2}
        key="supplies-grid"
        renderItem={({ item }) => <SupplyCard item={item} onAdd={handleAdd} />}
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
  imgPlaceholder:{ width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' },
  badge:         { position: 'absolute', top: 8, left: 8, backgroundColor: '#eaf3de', borderRadius: 100, paddingHorizontal: 8, paddingVertical: 3 },
  badgeTxt:      { fontSize: 10, fontWeight: '600', color: '#27500a' },
  info:          { padding: 10 },
  name:          { fontSize: 13, fontWeight: '600', color: C.ink1, lineHeight: 18 },
  desc:          { fontSize: 11, color: C.ink4, fontStyle: 'italic', marginTop: 2, marginBottom: 6 },
  chips:         { flexDirection: 'row', gap: 4, flexWrap: 'wrap', marginBottom: 6 },
  chip:          { backgroundColor: C.sand2, borderRadius: 6, paddingHorizontal: 7, paddingVertical: 3 },
  chipTxt:       { fontSize: 10, color: C.ink3, fontWeight: '500' },
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
