import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform
} from 'react-native';
import Toast from 'react-native-toast-message';
import { placeOrder } from '../../api';

const PAYMENT_METHODS = [
  { id: 'cod',  label: 'Cash on Delivery', icon: '💵' },
  { id: 'card', label: 'Credit / Debit Card', icon: '💳' },
];

// Format card number with spaces: 1234 5678 9012 3456
const formatCardNumber = (val) => {
  const digits = val.replace(/\D/g, '').slice(0, 16);
  return digits.replace(/(.{4})/g, '$1 ').trim();
};

// Format expiry MM/YY
const formatExpiry = (val) => {
  const digits = val.replace(/\D/g, '').slice(0, 4);
  if (digits.length >= 3) return digits.slice(0, 2) + '/' + digits.slice(2);
  return digits;
};

// Detect card type from first digits
const detectCardType = (num) => {
  const n = num.replace(/\s/g, '');
  if (/^4/.test(n)) return { name: 'Visa', icon: '💳' };
  if (/^5[1-5]/.test(n)) return { name: 'Mastercard', icon: '💳' };
  if (/^3[47]/.test(n)) return { name: 'Amex', icon: '💳' };
  return null;
};

export default function CheckoutScreen({ route, navigation }) {
  const { totalPrice } = route.params;

  // Address
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('Sri Lanka');

  // Payment
  const [paymentMethod, setPaymentMethod] = useState('cod');

  // Card details
  const [cardHolder, setCardHolder] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardFlipped, setCardFlipped] = useState(false);

  const [loading, setLoading] = useState(false);

  // Validate card fields
  const validateCard = () => {
    if (!cardHolder.trim()) { Toast.show({ type: 'error', text1: 'Enter cardholder name' }); return false; }
    if (cardNumber.replace(/\s/g, '').length < 16) { Toast.show({ type: 'error', text1: 'Enter a valid 16-digit card number' }); return false; }
    if (expiry.length < 5) { Toast.show({ type: 'error', text1: 'Enter a valid expiry date (MM/YY)' }); return false; }
    // Check expiry not in past
    const [mm, yy] = expiry.split('/');
    const expDate = new Date(`20${yy}`, mm - 1);
    if (expDate < new Date()) { Toast.show({ type: 'error', text1: 'Card has expired' }); return false; }
    if (cvv.length < 3) { Toast.show({ type: 'error', text1: 'Enter a valid CVV' }); return false; }
    return true;
  };

  const handleOrder = async () => {
    if (!street || !city || !postalCode || !country)
      return Toast.show({ type: 'error', text1: 'All address fields are required' });

    if (paymentMethod === 'card' && !validateCard()) return;

    setLoading(true);
    try {
      const paymentLabel = paymentMethod === 'card'
        ? `Card (**** **** **** ${cardNumber.replace(/\s/g, '').slice(-4)})`
        : 'Cash on Delivery';

      await placeOrder({
        shippingAddress: { street, city, postalCode, country },
        paymentMethod: paymentLabel,
      });

      Toast.show({ type: 'success', text1: '🎉 Order placed successfully!' });
      navigation.reset({ index: 0, routes: [{ name: 'Cart' }] });
    } catch (err) {
      Toast.show({ type: 'error', text1: err.response?.data?.message || 'Failed to place order' });
    } finally {
      setLoading(false);
    }
  };

  const cardType = detectCardType(cardNumber);
  const maskedNumber = cardNumber || '**** **** **** ****';

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>

        {/* Shipping Address */}
        <Text style={styles.sectionTitle}>📍 Shipping Address</Text>
        <Text style={styles.label}>Street Address *</Text>
        <TextInput style={styles.input} value={street} onChangeText={setStreet} placeholder="No. 12, Main Street" />
        <Text style={styles.label}>City *</Text>
        <TextInput style={styles.input} value={city} onChangeText={setCity} placeholder="Colombo" />
        <Text style={styles.label}>Postal Code *</Text>
        <TextInput style={styles.input} value={postalCode} onChangeText={setPostalCode} placeholder="10100" keyboardType="numeric" />
        <Text style={styles.label}>Country *</Text>
        <TextInput style={styles.input} value={country} onChangeText={setCountry} placeholder="Sri Lanka" />

        {/* Payment Method */}
        <Text style={styles.sectionTitle}>💳 Payment Method</Text>
        <View style={styles.paymentOptions}>
          {PAYMENT_METHODS.map(m => (
            <TouchableOpacity
              key={m.id}
              style={[styles.paymentOption, paymentMethod === m.id && styles.paymentOptionActive]}
              onPress={() => setPaymentMethod(m.id)}
            >
              <Text style={styles.paymentIcon}>{m.icon}</Text>
              <Text style={[styles.paymentLabel, paymentMethod === m.id && styles.paymentLabelActive]}>
                {m.label}
              </Text>
              <View style={[styles.radio, paymentMethod === m.id && styles.radioActive]}>
                {paymentMethod === m.id && <View style={styles.radioDot} />}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Card Form */}
        {paymentMethod === 'card' && (
          <View style={styles.cardSection}>

            {/* Card Preview */}
            <View style={styles.cardPreview}>
              <View style={styles.cardTop}>
                <Text style={styles.cardChip}>▪▪▪</Text>
                <Text style={styles.cardTypeLabel}>{cardType?.name || ''}</Text>
              </View>
              <Text style={styles.cardNumberPreview}>
                {maskedNumber.padEnd(19, ' ')}
              </Text>
              <View style={styles.cardBottom}>
                <View>
                  <Text style={styles.cardSubLabel}>CARD HOLDER</Text>
                  <Text style={styles.cardHolderPreview}>
                    {cardHolder.toUpperCase() || 'YOUR NAME'}
                  </Text>
                </View>
                <View>
                  <Text style={styles.cardSubLabel}>EXPIRES</Text>
                  <Text style={styles.cardExpiryPreview}>{expiry || 'MM/YY'}</Text>
                </View>
              </View>
            </View>

            {/* Card Inputs */}
            <Text style={styles.label}>Cardholder Name *</Text>
            <TextInput
              style={styles.input}
              value={cardHolder}
              onChangeText={setCardHolder}
              placeholder="Name on card"
              autoCapitalize="words"
            />

            <Text style={styles.label}>Card Number *</Text>
            <TextInput
              style={styles.input}
              value={cardNumber}
              onChangeText={(v) => setCardNumber(formatCardNumber(v))}
              placeholder="1234 5678 9012 3456"
              keyboardType="numeric"
              maxLength={19}
            />

            <View style={styles.rowInputs}>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Expiry Date *</Text>
                <TextInput
                  style={styles.input}
                  value={expiry}
                  onChangeText={(v) => setExpiry(formatExpiry(v))}
                  placeholder="MM/YY"
                  keyboardType="numeric"
                  maxLength={5}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>CVV *</Text>
                <TextInput
                  style={styles.input}
                  value={cvv}
                  onChangeText={(v) => setCvv(v.replace(/\D/g, '').slice(0, 4))}
                  placeholder="•••"
                  keyboardType="numeric"
                  maxLength={4}
                  secureTextEntry
                  onFocus={() => setCardFlipped(true)}
                  onBlur={() => setCardFlipped(false)}
                />
              </View>
            </View>

            <View style={styles.secureNote}>
              <Text style={styles.secureIcon}>🔒</Text>
              <Text style={styles.secureTxt}>Your payment info is secure and encrypted</Text>
            </View>
          </View>
        )}

        {/* COD Info */}
        {paymentMethod === 'cod' && (
          <View style={styles.codBox}>
            <Text style={styles.codIcon}>💵</Text>
            <Text style={styles.codTitle}>Cash on Delivery</Text>
            <Text style={styles.codDesc}>Pay when your order arrives at your doorstep.</Text>
          </View>
        )}

        {/* Order Summary */}
        <View style={styles.summaryBox}>
          <Text style={styles.sectionTitle}>🧾 Order Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryVal}>LKR {Number(totalPrice).toFixed(2)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Shipping</Text>
            <Text style={[styles.summaryVal, { color: '#10B981' }]}>FREE</Text>
          </View>
          <View style={[styles.summaryRow, styles.summaryTotal]}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalPrice}>LKR {Number(totalPrice).toFixed(2)}</Text>
          </View>
        </View>

        {/* Place Order Button */}
        <TouchableOpacity style={styles.placeBtn} onPress={handleOrder} disabled={loading}>
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.placeTxt}>
                {paymentMethod === 'card' ? '💳 Pay & Place Order' : '🛍️ Place Order'}
              </Text>
          }
        </TouchableOpacity>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 16 },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: '#222', marginBottom: 12, marginTop: 20 },
  label: { fontSize: 13, fontWeight: '600', color: '#555', marginBottom: 6, marginTop: 10 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 10, padding: 12, fontSize: 15, backgroundColor: '#fff' },
  rowInputs: { flexDirection: 'row', gap: 12 },

  // Payment options
  paymentOptions: { gap: 10, marginBottom: 4 },
  paymentOption: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, padding: 14, borderWidth: 1.5, borderColor: '#eee', gap: 12 },
  paymentOptionActive: { borderColor: '#6C63FF', backgroundColor: '#f3f0ff' },
  paymentIcon: { fontSize: 24 },
  paymentLabel: { flex: 1, fontSize: 15, color: '#444', fontWeight: '500' },
  paymentLabelActive: { color: '#6C63FF', fontWeight: '700' },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: '#ddd', alignItems: 'center', justifyContent: 'center' },
  radioActive: { borderColor: '#6C63FF' },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#6C63FF' },

  // Card preview
  cardSection: { marginTop: 8 },
  cardPreview: { backgroundColor: '#6C63FF', borderRadius: 16, padding: 20, marginBottom: 16, elevation: 4 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  cardChip: { color: '#FFD700', fontSize: 18, letterSpacing: 2 },
  cardTypeLabel: { color: '#fff', fontWeight: '700', fontSize: 14 },
  cardNumberPreview: { color: '#fff', fontSize: 18, fontWeight: '700', letterSpacing: 3, marginBottom: 20, fontFamily: 'monospace' },
  cardBottom: { flexDirection: 'row', justifyContent: 'space-between' },
  cardSubLabel: { color: '#c4c0ff', fontSize: 9, letterSpacing: 1, marginBottom: 2 },
  cardHolderPreview: { color: '#fff', fontSize: 13, fontWeight: '600', letterSpacing: 1 },
  cardExpiryPreview: { color: '#fff', fontSize: 13, fontWeight: '600' },

  // Secure note
  secureNote: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#ecfdf5', borderRadius: 8, padding: 10, marginTop: 10 },
  secureIcon: { fontSize: 16 },
  secureTxt: { fontSize: 12, color: '#065f46', flex: 1 },

  // COD
  codBox: { backgroundColor: '#fff', borderRadius: 12, padding: 20, alignItems: 'center', marginTop: 8 },
  codIcon: { fontSize: 40, marginBottom: 8 },
  codTitle: { fontSize: 16, fontWeight: '700', color: '#222' },
  codDesc: { fontSize: 13, color: '#888', marginTop: 4, textAlign: 'center' },

  // Summary
  summaryBox: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginTop: 8 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  summaryTotal: { borderBottomWidth: 0, marginTop: 4 },
  summaryLabel: { fontSize: 14, color: '#888' },
  summaryVal: { fontSize: 14, color: '#222', fontWeight: '500' },
  totalLabel: { fontSize: 16, fontWeight: '700', color: '#333' },
  totalPrice: { fontSize: 18, fontWeight: '700', color: '#6C63FF' },

  // Place order
  placeBtn: { backgroundColor: '#6C63FF', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 20 },
  placeTxt: { color: '#fff', fontSize: 17, fontWeight: '700' },
});