import { useState, useEffect, useCallback } from 'react'
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, RefreshControl } from 'react-native'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { C } from '../../constants/colors'
import { remindersApi, type ApiReminder } from '../../lib/api'
import { useAuthStore } from '../../store/auth'

const ICON: Record<string, string> = { watering: '💧', fertilising: '🧪', pruning: '✂️', repotting: '🪴' }
const BG: Record<string, string>   = { watering: '#e6f1fb', fertilising: '#eaf3de', pruning: '#fdf5e6', repotting: '#f0e6fb' }

function dueLabel(dueAt: string): string {
  const diff = Math.round((new Date(dueAt).getTime() - Date.now()) / 86400000)
  if (diff <= 0) return 'Today'
  if (diff === 1) return 'Tomorrow'
  return `In ${diff} days`
}

export default function Reminders() {
  const router = useRouter()
  const { user, hydrated } = useAuthStore()
  const [today, setToday] = useState<ApiReminder[]>([])
  const [upcoming, setUpcoming] = useState<ApiReminder[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const fetchReminders = useCallback(async () => {
    if (!user) { setLoading(false); setRefreshing(false); return }
    try {
      const [todayRes, upcomingRes] = await Promise.all([
        remindersApi.getToday(),
        remindersApi.list('pending'),
      ])
      setToday(todayRes.data)
      setUpcoming(upcomingRes.data.filter((r) => {
        const diff = Math.round((new Date(r.dueAt).getTime() - Date.now()) / 86400000)
        return diff > 0
      }))
    } catch {
      // keep existing
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [user])

  useEffect(() => {
    if (hydrated) fetchReminders()
  }, [hydrated, fetchReminders])

  const onRefresh = () => { setRefreshing(true); fetchReminders() }

  const handleMarkDone = async (r: ApiReminder) => {
    try {
      await remindersApi.markDone(r.id)
      setToday((prev) => prev.filter((x) => x.id !== r.id))
    } catch { Alert.alert('Error', 'Could not mark as done') }
  }

  if (!hydrated || loading) {
    return (
      <SafeAreaView style={s.safe}>
        <View style={s.hdr}><Text style={s.title}>Reminders</Text></View>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color={C.green700} size="large" />
        </View>
      </SafeAreaView>
    )
  }

  if (!user) {
    return (
      <SafeAreaView style={s.safe}>
        <View style={s.hdr}><Text style={s.title}>Reminders</Text></View>
        <View style={s.empty}>
          <Text style={s.emptyEmoji}>🔔</Text>
          <Text style={s.emptyTitle}>Sign in to see reminders</Text>
          <Text style={s.emptyBody}>Watering and fertilising reminders are created automatically when you add plants to your garden.</Text>
          <TouchableOpacity style={s.loginBtn} onPress={() => router.push('/(auth)/login')}>
            <Text style={s.loginBtnTxt}>Sign in →</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    )
  }

  if (today.length === 0 && upcoming.length === 0) {
    return (
      <SafeAreaView style={s.safe}>
        <View style={s.hdr}>
          <Text style={s.title}>Reminders</Text>
          <Text style={s.sub}>All caught up ✓</Text>
        </View>
        <View style={s.empty}>
          <Text style={s.emptyEmoji}>🔔</Text>
          <Text style={s.emptyTitle}>No reminders</Text>
          <Text style={s.emptyBody}>Add plants to your garden and reminders will appear here automatically.</Text>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.hdr}>
        <Text style={s.title}>Reminders</Text>
        <Text style={s.sub}>{today.length > 0 ? `${today.length} due today` : 'All caught up ✓'}</Text>
      </View>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.green700} />}
      >
        {today.length > 0 && (
          <>
            <Text style={s.sec}>Today</Text>
            {today.map((r) => (
              <View key={r.id} style={s.card}>
                <View style={[s.icon, { backgroundColor: BG[r.type] || C.green50 }]}>
                  <Text style={s.iconTxt}>{ICON[r.type] || '🌿'}</Text>
                </View>
                <View style={s.info}>
                  <Text style={s.rTitle}>{r.title}</Text>
                  <Text style={s.rBody}>{r.body}</Text>
                  <Text style={s.rTime}>Due today</Text>
                </View>
                <TouchableOpacity style={s.doneBtn} onPress={() => handleMarkDone(r)}>
                  <Text style={s.doneTxt}>Done</Text>
                </TouchableOpacity>
              </View>
            ))}
          </>
        )}

        {upcoming.length > 0 && (
          <>
            <Text style={[s.sec, { marginTop: today.length > 0 ? 20 : 0 }]}>Coming up</Text>
            {upcoming.slice(0, 10).map((r) => (
              <View key={r.id} style={s.card}>
                <View style={[s.icon, { backgroundColor: BG[r.type] || C.green50 }]}>
                  <Text style={s.iconTxt}>{ICON[r.type] || '🌿'}</Text>
                </View>
                <View style={s.info}>
                  <Text style={s.rTitle}>{r.title}</Text>
                  <Text style={s.rBody}>{r.gardenPlant?.plant?.name}</Text>
                  <Text style={s.rTime}>{dueLabel(r.dueAt)}</Text>
                </View>
              </View>
            ))}
          </>
        )}
        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.sand },
  hdr: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 12 },
  title: { fontSize: 22, fontWeight: '600', color: C.ink },
  sub: { fontSize: 12, color: C.ink3, marginTop: 2 },
  scroll: { paddingHorizontal: 20 },
  sec: { fontSize: 13, fontWeight: '600', color: C.ink, marginBottom: 10 },
  card: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: C.white, borderRadius: 14, padding: 14, marginBottom: 10, gap: 12, borderWidth: 1, borderColor: C.sand2 },
  icon: { width: 42, height: 42, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  iconTxt: { fontSize: 20 },
  info: { flex: 1 },
  rTitle: { fontSize: 14, fontWeight: '500', color: C.ink },
  rBody: { fontSize: 12, color: C.ink3, marginTop: 2, lineHeight: 17 },
  rTime: { fontSize: 11, color: C.ink4, marginTop: 5 },
  doneBtn: { backgroundColor: C.green50, borderWidth: 1, borderColor: C.green200, borderRadius: 100, paddingHorizontal: 12, paddingVertical: 5 },
  doneTxt: { fontSize: 11, color: C.green800, fontWeight: '500' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32, paddingTop: 80 },
  emptyEmoji: { fontSize: 56, marginBottom: 16 },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: C.ink, marginBottom: 8 },
  emptyBody: { fontSize: 14, color: C.ink3, textAlign: 'center', lineHeight: 22 },
  loginBtn: { marginTop: 20, backgroundColor: C.green700, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 100 },
  loginBtnTxt: { fontSize: 14, fontWeight: '600', color: C.white },
})
