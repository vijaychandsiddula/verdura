import { useState, useEffect, useCallback, useRef } from 'react'
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  StyleSheet, RefreshControl, Animated, ActivityIndicator,
} from 'react-native'
import { Image } from 'expo-image'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { C } from '../../constants/colors'
import { plantsApi, type ApiPlant } from '../../lib/api'

// Same category taxonomy as plant shop
const CATS = [
  { id: '', label: 'All', emoji: '🌿' },
  { id: 'indoor', label: 'Indoor', emoji: '🏠' },
  { id: 'outdoor', label: 'Outdoor', emoji: '🌳' },
  { id: 'vegetable', label: 'Vegetables', emoji: '🥦' },
  { id: 'fruit', label: 'Fruits', emoji: '🍋' },
  { id: 'herb', label: 'Herbs', emoji: '🌿' },
  { id: 'flowering', label: 'Flowering', emoji: '🌸' },
  { id: 'air_purifying', label: 'Air-purifying', emoji: '💨' },
  { id: 'succulent', label: 'Succulents', emoji: '🌵' },
  { id: 'tropical', label: 'Tropical', emoji: '🌴' },
]

const DIFFICULTY = [
  { id: '', label: 'Any level' },
  { id: 'beginner', label: '🟢 Beginner' },
  { id: 'intermediate', label: '🟡 Intermediate' },
  { id: 'expert', label: '🔴 Expert' },
]

function diffStyle(d: string) {
  if (d === 'beginner')     return { bg: '#eaf3de', color: '#27500a', label: 'Beginner friendly' }
  if (d === 'intermediate') return { bg: '#fdf5e6', color: '#854f0b', label: 'Intermediate' }
  return                           { bg: '#fde8e8', color: '#8b0000', label: 'Advanced' }
}

export default function Guides() {
  const router = useRouter()
  const [q, setQ] = useState('')
  const [cat, setCat] = useState('')
  const [diff, setDiff] = useState('')
  const [plants, setPlants] = useState<ApiPlant[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const barWidth = useRef(new Animated.Value(0)).current
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Fetch one page — replaces or appends based on `append`
  const fetchPage = useCallback(async (pg: number, search: string, category: string, append = false) => {
    if (!append) {
      barWidth.setValue(0)
      Animated.timing(barWidth, { toValue: 80, duration: 350, useNativeDriver: false }).start()
    }
    try {
      const params: Record<string, string | number> = { page: pg, limit: 20 }
      if (search) params.search = search
      if (category) params.category = category
      const res = await plantsApi.list(params)
      const pages = res.pagination?.totalPages ?? 1
      setTotalPages(pages)
      Animated.timing(barWidth, { toValue: 100, duration: 120, useNativeDriver: false }).start(() => {
        setPlants(prev => append ? [...prev, ...res.data] : res.data)
        setLoading(false)
        setLoadingMore(false)
        setRefreshing(false)
      })
    } catch {
      setLoading(false); setLoadingMore(false); setRefreshing(false)
    }
  }, [])

  // Initial load
  useEffect(() => { fetchPage(1, '', '') }, [])

  // Search / category change — debounced, resets to page 1
  useEffect(() => {
    if (searchTimer.current) clearTimeout(searchTimer.current)
    searchTimer.current = setTimeout(() => {
      setPage(1)
      setLoading(true)
      fetchPage(1, q, cat)
    }, 350)
    return () => { if (searchTimer.current) clearTimeout(searchTimer.current) }
  }, [q, cat])

  const onRefresh = () => { setRefreshing(true); setPage(1); fetchPage(1, q, cat) }

  const loadMore = () => {
    if (page >= totalPages || loadingMore) return
    const next = page + 1
    setPage(next)
    setLoadingMore(true)
    fetchPage(next, q, cat, true)
  }

  // Client-side difficulty filter (lightweight — data already fetched)
  const filtered = diff ? plants.filter(p => p.difficulty === diff) : plants

  const barWidthPct = barWidth.interpolate({ inputRange: [0, 100], outputRange: ['0%', '100%'] })

  return (
    <SafeAreaView style={s.safe}>
      {/* Progress bar */}
      <View style={s.progressTrack}>
        <Animated.View style={[s.progressBar, { width: barWidthPct, opacity: loading || loadingMore ? 1 : 0 }]} />
      </View>

      <ScrollView
        style={s.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.green700} />}
        onScroll={({ nativeEvent }) => {
          const { layoutMeasurement, contentOffset, contentSize } = nativeEvent
          const nearBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - 200
          if (nearBottom) loadMore()
        }}
        scrollEventThrottle={200}
      >
        {/* Header */}
        <View style={s.hdr}>
          <Text style={s.sub}><Text style={s.subBold}>Detailed care info for all plants</Text> — tap any card to read the full guide.</Text>
        </View>

        {/* ── Search bar ── */}
        <View style={s.searchRow}>
          <Text style={s.searchIcon}>🔍</Text>
          <TextInput
            style={s.searchInput}
            placeholder="Search by name, type, or tag…"
            placeholderTextColor={C.ink4}
            value={q}
            onChangeText={setQ}
            returnKeyType="search"
          />
          {q.length > 0 && (
            <TouchableOpacity onPress={() => setQ('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Text style={s.clearBtn}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* ── Category pills ── */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.pillRow} contentContainerStyle={s.pillContent}>
          {CATS.map(c => (
            <TouchableOpacity key={c.id} style={[s.pill, cat === c.id && s.pillActive]} onPress={() => setCat(c.id)}>
              <Text style={[s.pillTxt, cat === c.id && s.pillTxtActive]}>{c.emoji} {c.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* ── Difficulty pills ── */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }} contentContainerStyle={s.pillContent}>
          {DIFFICULTY.map(d => (
            <TouchableOpacity key={d.id} style={[s.pill, diff === d.id && s.pillActive]} onPress={() => setDiff(d.id)}>
              <Text style={[s.pillTxt, diff === d.id && s.pillTxtActive]}>{d.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Result count */}
        {!loading && (
          <Text style={s.countTxt}>
            {filtered.length === 0 ? 'No plants found' : `${filtered.length} plant${filtered.length === 1 ? '' : 's'} found`}
            {(q || cat || diff) ? ' · ' : ''}
            {(q || cat || diff) && (
              <Text style={{ color: C.green700 }} onPress={() => { setQ(''); setCat(''); setDiff('') }}>
                Clear filters
              </Text>
            )}
          </Text>
        )}

        {/* ── Plant list ── */}
        {loading ? (
          <View style={s.loader}>
            <ActivityIndicator size="large" color={C.green700} />
            <Text style={s.loaderTxt}>Loading all plants…</Text>
          </View>
        ) : filtered.length === 0 ? (
          <View style={s.empty}>
            <Text style={s.emptyIcon}>🌿</Text>
            <Text style={s.emptyTxt}>No plants match your search</Text>
            <TouchableOpacity onPress={() => { setQ(''); setCat(''); setDiff('') }} style={s.clearAll}>
              <Text style={s.clearAllTxt}>Show all plants</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={s.list}>
            {filtered.map(p => {
              const d = diffStyle(p.difficulty)
              return (
                <TouchableOpacity
                  key={p.id}
                  style={s.card}
                  activeOpacity={0.75}
                  onPress={() => router.push({ pathname: '/plant/[id]', params: { id: p.id } })}
                >
                  {/* Header row */}
                  <View style={s.cardHdr}>
                    <View style={s.imgBox}>
                      {p.thumbnailUrl ? (
                        <Image source={{ uri: p.thumbnailUrl }} style={s.img} contentFit="cover" transition={150} />
                      ) : (
                        <Text style={s.imgFallback}>🌿</Text>
                      )}
                    </View>
                    <View style={{ flex: 1, minWidth: 0 }}>
                      <Text style={s.cardName} numberOfLines={1}>{p.name}</Text>
                      <Text style={s.cardSci} numberOfLines={1}>{p.scientificName}</Text>
                    </View>
                    <Text style={s.arrow}>›</Text>
                  </View>

                  {/* Quick-facts chips */}
                  <View style={s.chipRow}>
                    <View style={s.chip}><Text style={s.chipTxt}>💧 {p.wateringIntervalDays}d</Text></View>
                    <View style={s.chip}><Text style={s.chipTxt}>🧪 {p.fertiliserIntervalDays}d</Text></View>
                    {(p.categories || []).slice(0, 2).map((c: string) => (
                      <View key={c} style={[s.chip, { backgroundColor: '#eaf3de' }]}>
                        <Text style={[s.chipTxt, { color: '#27500a' }]}>{c}</Text>
                      </View>
                    ))}
                  </View>

                  {/* Difficulty + CTA */}
                  <View style={s.cardFooter}>
                    <View style={[s.diffBadge, { backgroundColor: d.bg }]}>
                      <Text style={[s.diffTxt, { color: d.color }]}>{d.label}</Text>
                    </View>
                    <Text style={s.cta}>Read care guide →</Text>
                  </View>
                </TouchableOpacity>
              )
            })}

            {/* Load more indicator */}
            {loadingMore && (
              <View style={{ alignItems: 'center', paddingVertical: 20 }}>
                <ActivityIndicator size="small" color={C.green700} />
                <Text style={{ color: C.ink4, fontSize: 12, marginTop: 6 }}>Loading more…</Text>
              </View>
            )}

            {!loadingMore && page < totalPages && (
              <TouchableOpacity style={s.loadMoreBtn} onPress={loadMore}>
                <Text style={s.loadMoreTxt}>Load more plants</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  safe:          { flex: 1, backgroundColor: C.sand },
  scroll:        { flex: 1 },
  progressTrack: { height: 2, backgroundColor: C.sand3 },
  progressBar:   { height: 2, backgroundColor: C.green700 },
  hdr:           { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 8 },
  title:         { fontSize: 26, fontWeight: '700', color: C.ink1, fontFamily: 'Georgia' },
  sub:           { fontSize: 13, color: C.ink3, marginTop: 2, marginBottom: 4 },
  subBold:       { fontWeight: '700', color: C.ink1 },

  // Search
  searchRow:     { flexDirection: 'row', alignItems: 'center', marginHorizontal: 20, marginBottom: 12, backgroundColor: 'white', borderRadius: 14, paddingHorizontal: 14, paddingVertical: 10, borderWidth: 1.5, borderColor: C.sand3, gap: 8 },
  searchIcon:    { fontSize: 16 },
  searchInput:   { flex: 1, fontSize: 15, color: C.ink1, paddingVertical: 0 },
  clearBtn:      { fontSize: 15, color: C.ink4, paddingLeft: 4 },

  // Pills
  pillRow:       { marginBottom: 8 },
  pillContent:   { paddingHorizontal: 20, gap: 8, flexDirection: 'row' },
  pill:          { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 100, backgroundColor: 'white', borderWidth: 1, borderColor: C.sand3 },
  pillActive:    { backgroundColor: C.green700, borderColor: C.green700 },
  pillTxt:       { fontSize: 13, fontWeight: '500', color: C.ink3 },
  pillTxtActive: { color: 'white' },

  countTxt:      { fontSize: 12, color: C.ink4, paddingHorizontal: 20, marginBottom: 12 },

  // Cards
  list:          { paddingHorizontal: 20, gap: 10 },
  card:          { backgroundColor: 'white', borderRadius: 18, padding: 16, borderWidth: 1, borderColor: C.sand2 },
  cardHdr:       { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 },
  imgBox:        { width: 56, height: 56, borderRadius: 12, backgroundColor: C.sand, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  img:           { width: 56, height: 56 },
  imgFallback:   { fontSize: 28 },
  cardName:      { fontSize: 16, fontWeight: '600', color: C.ink1 },
  cardSci:       { fontSize: 12, color: C.ink4, fontStyle: 'italic', marginTop: 2 },
  arrow:         { fontSize: 22, color: C.ink4 },
  chipRow:       { flexDirection: 'row', gap: 6, flexWrap: 'wrap', marginBottom: 10 },
  chip:          { backgroundColor: C.sand2, paddingHorizontal: 9, paddingVertical: 4, borderRadius: 6 },
  chipTxt:       { fontSize: 12, color: C.ink2 },
  cardFooter:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  diffBadge:     { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  diffTxt:       { fontSize: 12, fontWeight: '500' },
  cta:           { fontSize: 13, fontWeight: '500', color: C.green700 },

  // States
  loader:        { alignItems: 'center', paddingTop: 80 },
  loaderTxt:     { color: C.ink4, marginTop: 12, fontSize: 14 },
  empty:         { alignItems: 'center', paddingTop: 60, paddingHorizontal: 40 },
  emptyIcon:     { fontSize: 52, marginBottom: 12 },
  emptyTxt:      { fontSize: 15, color: C.ink3, textAlign: 'center' },
  clearAll:      { marginTop: 20, paddingHorizontal: 24, paddingVertical: 10, backgroundColor: C.green700, borderRadius: 100 },
  clearAllTxt:   { color: 'white', fontSize: 14, fontWeight: '600' },
  loadMoreBtn:   { alignSelf: 'center', marginTop: 16, paddingHorizontal: 28, paddingVertical: 10, borderRadius: 100, borderWidth: 1, borderColor: C.green700 },
  loadMoreTxt:   { color: C.green700, fontSize: 14, fontWeight: '500' },
})
