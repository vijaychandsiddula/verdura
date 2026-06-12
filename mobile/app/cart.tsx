import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { C } from '../constants/colors'
import { useCart } from '../store/cart'

export default function Cart() {
  const router = useRouter()
  const { items, remove, setQty, total, count, clear } = useCart()
  const sub = total()
  const ship = sub >= 499 ? 0 : 49

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.hdr}>
        <TouchableOpacity onPress={() => router.back()}><Text style={s.backTxt}>← Back</Text></TouchableOpacity>
        <Text style={s.title}>Cart ({count()})</Text>
        {items.length > 0 && <TouchableOpacity onPress={() => Alert.alert('Clear cart?', '', [{ text: 'Cancel', style: 'cancel' }, { text: 'Clear', style: 'destructive', onPress: clear }])}><Text style={s.clearTxt}>Clear</Text></TouchableOpacity>}
        {items.length === 0 && <View style={{ width: 40 }} />}
      </View>

      {items.length === 0 ? (
        <View style={s.empty}>
          <Text style={s.emptyEmoji}>🛒</Text>
          <Text style={s.emptyTitle}>Your cart is empty</Text>
          <TouchableOpacity style={s.browseBtn} onPress={() => router.push('/')}><Text style={s.browseTxt}>Browse plants →</Text></TouchableOpacity>
        </View>
      ) : (
        <>
          <ScrollView contentContainerStyle={s.scroll}>
            {items.map((item) => (
              <View key={item.id} style={s.item}>
                <Text style={s.itemEmoji}>{item.emoji}</Text>
                <View style={s.itemInfo}>
                  <Text style={s.itemName}>{item.name}</Text>
                  <Text style={s.itemPrice}>₹ {item.price} each</Text>
                </View>
                <View style={s.qty}>
                  <TouchableOpacity style={s.qtyBtn} onPress={() => setQty(item.id, item.qty - 1)}><Text style={s.qtyBtnTxt}>−</Text></TouchableOpacity>
                  <Text style={s.qtyNum}>{item.qty}</Text>
                  <TouchableOpacity style={s.qtyBtn} onPress={() => setQty(item.id, item.qty + 1)}><Text style={s.qtyBtnTxt}>+</Text></TouchableOpacity>
                </View>
                <TouchableOpacity onPress={() => remove(item.id)}><Text style={s.removeTxt}>✕</Text></TouchableOpacity>
              </View>
            ))}
            <View style={s.summary}>
              <View style={s.sumRow}><Text style={s.sumLbl}>Subtotal</Text><Text style={s.sumVal}>₹ {sub}</Text></View>
              <View style={s.sumRow}><Text style={s.sumLbl}>Shipping</Text><Text style={[s.sumVal, ship === 0 && { color: C.green700 }]}>{ship === 0 ? 'FREE 🎉' : `₹ ${ship}`}</Text></View>
              {ship > 0 && <Text style={s.freeNote}>Add ₹{499 - sub} more for free shipping</Text>}
              <View style={[s.sumRow, s.totalRow]}><Text style={s.totalLbl}>Total</Text><Text style={s.totalVal}>₹ {sub + ship}</Text></View>
            </View>
            <View style={{ height: 100 }} />
          </ScrollView>
          <View style={s.footer}>
            <TouchableOpacity style={s.checkoutBtn} onPress={() => Alert.alert('Checkout', 'Connect your Razorpay keys in backend/.env to activate payments.')}>
              <Text style={s.checkoutTxt}>Proceed to checkout →</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.sand },
  hdr: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 14 },
  backTxt: { fontSize: 14, color: C.ink3 },
  title: { fontSize: 17, fontWeight: '600', color: C.ink },
  clearTxt: { fontSize: 13, color: C.red },
  scroll: { paddingHorizontal: 20, gap: 10 },
  item: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.white, borderRadius: 14, padding: 14, gap: 12, borderWidth: 1, borderColor: C.sand2 },
  itemEmoji: { fontSize: 36 },
  itemInfo: { flex: 1 },
  itemName: { fontSize: 14, fontWeight: '500', color: C.ink },
  itemPrice: { fontSize: 12, color: C.ink3, marginTop: 2 },
  qty: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  qtyBtn: { width: 28, height: 28, borderRadius: 14, borderWidth: 1, borderColor: C.sand3, alignItems: 'center', justifyContent: 'center' },
  qtyBtnTxt: { fontSize: 16, color: C.ink, lineHeight: 20 },
  qtyNum: { fontSize: 14, fontWeight: '500', minWidth: 16, textAlign: 'center' },
  removeTxt: { fontSize: 16, color: C.ink4, padding: 4 },
  summary: { backgroundColor: C.white, borderRadius: 14, padding: 16, marginTop: 10, borderWidth: 1, borderColor: C.sand2 },
  sumRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  sumLbl: { fontSize: 14, color: C.ink3 },
  sumVal: { fontSize: 14, color: C.ink },
  freeNote: { fontSize: 12, color: C.amber, marginBottom: 8 },
  totalRow: { borderTopWidth: 1, borderTopColor: C.sand3, paddingTop: 12, marginBottom: 0 },
  totalLbl: { fontSize: 15, fontWeight: '600', color: C.ink },
  totalVal: { fontSize: 20, fontWeight: '700', color: C.green700 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  emptyEmoji: { fontSize: 56 },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: C.ink },
  browseBtn: { backgroundColor: C.green700, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 100, marginTop: 8 },
  browseTxt: { fontSize: 14, fontWeight: '600', color: C.white },
  footer: { padding: 20, paddingBottom: 36, borderTopWidth: 0.5, borderTopColor: C.sand3 },
  checkoutBtn: { backgroundColor: C.green700, borderRadius: 100, paddingVertical: 15, alignItems: 'center' },
  checkoutTxt: { fontSize: 15, fontWeight: '600', color: C.white },
})
