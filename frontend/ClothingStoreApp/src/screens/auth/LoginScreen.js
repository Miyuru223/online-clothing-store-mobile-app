import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import Toast from 'react-native-toast-message';
import { useAuth } from '../../context/AuthContext';

export default function LoginScreen({ navigation }) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) return Toast.show({ type: 'error', text1: 'Fill in all fields' });
    setLoading(true);
    try {
      await login(email.trim(), password);
    } catch (err) {
      Toast.show({ type: 'error', text1: err.response?.data?.message || 'Login failed' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Text style={styles.title}>Clothify</Text>
      <Text style={styles.subtitle}>Sign in to your account</Text>

      <TextInput style={styles.input} placeholder="Email" value={email}
        onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
      <TextInput style={styles.input} placeholder="Password" value={password}
        onChangeText={setPassword} secureTextEntry />

      <TouchableOpacity style={styles.btn} onPress={handleLogin} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Login</Text>}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Register')}>
        <Text style={styles.link}>Don't have an account? <Text style={styles.linkBold}>Register</Text></Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: '#fff' },
  title: { fontSize: 32, fontWeight: '700', textAlign: 'center', marginBottom: 6, color: '#6C63FF' },
  subtitle: { fontSize: 15, color: '#666', textAlign: 'center', marginBottom: 32 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 10, padding: 14, marginBottom: 14, fontSize: 15 },
  btn: { backgroundColor: '#6C63FF', padding: 15, borderRadius: 10, alignItems: 'center', marginBottom: 16 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  link: { textAlign: 'center', color: '#666', fontSize: 14 },
  linkBold: { color: '#6C63FF', fontWeight: '600' },
});
