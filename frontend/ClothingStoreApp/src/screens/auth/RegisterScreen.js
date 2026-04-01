import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import Toast from 'react-native-toast-message';
import { useAuth } from '../../context/AuthContext';

export default function RegisterScreen({ navigation }) {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!name || !email || !password) return Toast.show({ type: 'error', text1: 'Fill in all fields' });
    if (password.length < 6) return Toast.show({ type: 'error', text1: 'Password must be at least 6 characters' });
    setLoading(true);
    try {
      await register(name.trim(), email.trim(), password);
      Toast.show({ type: 'success', text1: 'Account created!' });
    } catch (err) {
      Toast.show({ type: 'error', text1: err.response?.data?.message || 'Registration failed' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Text style={styles.title}>Clothify</Text>
      <Text style={styles.subtitle}>Create your account</Text>

      <TextInput style={styles.input} placeholder="Full Name" value={name} onChangeText={setName} />
      <TextInput style={styles.input} placeholder="Email" value={email}
        onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
      <TextInput style={styles.input} placeholder="Password (min 6 chars)" value={password}
        onChangeText={setPassword} secureTextEntry />

      <TouchableOpacity style={styles.btn} onPress={handleRegister} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Register</Text>}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Login')}>
        <Text style={styles.link}>Already have an account? <Text style={styles.linkBold}>Login</Text></Text>
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
