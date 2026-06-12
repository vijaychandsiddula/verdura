import { Tabs } from 'expo-router'
import { View, Text, StyleSheet, Platform } from 'react-native'
import { C } from '../../constants/colors'
import { useCart } from '../../store/cart'
import { useAuthStore } from '../../store/auth'

function Tab({ emoji, label, focused }: { emoji: string; label: string; focused: boolean }) {
  return (
    <View style={s.tab}>
      <Text style={s.emoji}>{emoji}</Text>
      <Text style={[s.label, focused && s.labelOn]} numberOfLines={1}>{label}</Text>
    </View>
  )
}

export default function Layout() {
  const count = useCart((x) => x.count())
  const { user } = useAuthStore()

  return (
    <Tabs screenOptions={{ headerShown: false, tabBarShowLabel: false, tabBarStyle: s.bar }}>
      <Tabs.Screen name="index"     options={{ tabBarIcon: ({ focused }) => <Tab emoji="🌿" label="Shop"      focused={focused} /> }} />
      <Tabs.Screen name="seeds"     options={{ tabBarIcon: ({ focused }) => <Tab emoji="🌱" label="Seeds"     focused={focused} /> }} />
      <Tabs.Screen name="supplies"  options={{ tabBarIcon: ({ focused }) => <Tab emoji="🪴" label="Supplies"  focused={focused} /> }} />
      <Tabs.Screen name="guides"    options={{ tabBarIcon: ({ focused }) => <Tab emoji="📖" label="Guides"    focused={focused} /> }} />
      <Tabs.Screen name="reminders" options={{ tabBarIcon: ({ focused }) => <Tab emoji="🔔" label="Reminders" focused={focused} /> }} />
      <Tabs.Screen name="garden"    options={{ tabBarIcon: ({ focused }) => <Tab emoji="🪻" label="Garden"    focused={focused} /> }} />
    </Tabs>
  )
}

const s = StyleSheet.create({
  bar:      { backgroundColor: C.sand, borderTopColor: C.sand3, borderTopWidth: 0.5, height: Platform.OS === 'ios' ? 84 : 64, paddingBottom: Platform.OS === 'ios' ? 24 : 8, paddingTop: 6 },
  tab:      { alignItems: 'center', gap: 1, width: 64 },
  emoji:    { fontSize: 20 },
  label:    { fontSize: 9, fontWeight: '500', color: C.ink4 },
  labelOn:  { color: C.green700 },
  badge:    { position: 'absolute', top: -2, right: -10, backgroundColor: C.red, borderRadius: 8, minWidth: 16, height: 16, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: C.sand },
  badgeTxt: { color: '#fff', fontSize: 9, fontWeight: '700', paddingHorizontal: 3 },
})
