import { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Alert, KeyboardAvoidingView, Platform } from 'react-native'
import { useRouter, Link } from 'expo-router'
import { useAuthStore } from '../../store/auth'

export default function RegisterScreen() {
  const router = useRouter()
  const { register, loading } = useAuthStore()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')

  const handleRegister = async () => {
    if (!name || !email || !password) { Alert.alert('Error', 'Name, email and password are required'); return }
    try {
      await register(name.trim(), email.trim().toLowerCase(), password, phone.trim() || undefined)
      router.replace('/(tabs)')
    } catch (err) {
      Alert.alert('Registration failed', err instanceof Error ? err.message : 'Something went wrong')
    }
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.logo}>
          <Text style={styles.logoText}>🌿</Text>
          <Text style={styles.brand}>Verdura</Text>
          <Text style={styles.tagline}>Join the plant community</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.title}>Create account</Text>

          <Text style={styles.label}>Full name *</Text>
          <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Priya Sharma" placeholderTextColor="#a8a89e" autoCapitalize="words" />

          <Text style={styles.label}>Email *</Text>
          <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="you@example.com" placeholderTextColor="#a8a89e" keyboardType="email-address" autoCapitalize="none" autoCorrect={false} />

          <Text style={styles.label}>Phone (optional)</Text>
          <TextInput style={styles.input} value={phone} onChangeText={setPhone} placeholder="+91 98765 43210" placeholderTextColor="#a8a89e" keyboardType="phone-pad" />

          <Text style={styles.label}>Password *</Text>
          <TextInput style={styles.input} value={password} onChangeText={setPassword} placeholder="Min. 8 characters" placeholderTextColor="#a8a89e" secureTextEntry />

          <TouchableOpacity style={[styles.btn, loading && styles.btnDisabled]} onPress={handleRegister} disabled={loading}>
            {loading ? <ActivityIndicator color="white" /> : <Text style={styles.btnText}>Create account</Text>}
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <Link href="/(auth)/login" asChild>
              <TouchableOpacity><Text style={styles.link}>Sign in</Text></TouchableOpacity>
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: '#f5f0e8', justifyContent: 'center', padding: 24 },
  logo: { alignItems: 'center', marginBottom: 32 },
  logoText: { fontSize: 48 },
  brand: { fontSize: 28, fontWeight: '700', color: '#1a1a18', marginTop: 8 },
  tagline: { fontSize: 14, color: '#6b6b64', marginTop: 4 },
  card: { backgroundColor: 'white', borderRadius: 20, padding: 28, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 4 },
  title: { fontSize: 22, fontWeight: '700', color: '#1a1a18', marginBottom: 24 },
  label: { fontSize: 13, fontWeight: '600', color: '#1a1a18', marginBottom: 6 },
  input: { borderWidth: 1, borderColor: '#e8e0d0', borderRadius: 12, padding: 14, fontSize: 15, color: '#1a1a18', marginBottom: 16, backgroundColor: '#fafaf8' },
  btn: { backgroundColor: '#3b6d11', borderRadius: 100, padding: 16, alignItems: 'center', marginTop: 8 },
  btnDisabled: { opacity: 0.6 },
  btnText: { color: 'white', fontSize: 15, fontWeight: '600' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 20 },
  footerText: { color: '#6b6b64', fontSize: 14 },
  link: { color: '#3b6d11', fontSize: 14, fontWeight: '600' },
})
