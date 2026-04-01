import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, ActivityIndicator
} from 'react-native';
import Toast from 'react-native-toast-message';
import api from '../../api';

const STEPS = ['Pending', 'Processing', 'Shipped', 'Delivered'];

const STATUS_COLOR = {
  Pending:    '#F59E0B',
  Processing: '#3B82F6',
  Shipped:    '#8B5CF6',
  Delivered:  '#10B981',
  Cancelled:  '#EF4444',
};

const STATUS_ICON = {
  Pending:    '🕐',
  Processing: '⚙️',
  Shipped:    '🚚',
  Delivered:  '✅',
  Cancelled:  '❌',
};

export default function AdminTrackScreen() {
  const [orderId, setOrderId] = useState('');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);

  const handleSearch = async () => {
    const trimmed = orderId.trim();
    if (!trimmed) return Toast.show({ type: 'error', text1: 'Please enter an Order ID' });
    setLoading(true);
    setOrder(null);
    try {
      const res = await api.get(`/orders/${trimmed}`);
      setOrder(res.data.order);
    } catch (err) {
      Toast.show({ type: 'error', text1: err.response?.data?.message || 'Order not found' });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (status) => {
    setUpdating(true);
    try {
      await api.put(`/orders/${order._id}/status`, { status });
      Toast.show({ type: 'success', text1: `Status updated to ${status}` });
      // Refresh order
      const res = await api.get(`/orders/${order._id}`);
      setOrder(res.data.order);
    } catch (err) {
      Toast.show({ type: 'error', text1: err.response?.data?.message || 'Update failed' });
    } finally {
      setUpdating(false);
    }
  };

  const currentStep = order ? STEPS.indexOf(order.status) : -1;
  const isCancelled = order?.status === 'Cancelled';
  const isDelivered = order?.status === 'Delivered';

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>

      {/* Search */}
      <View style={styles.searchBox}>
        <Text style={styles.searchTitle}>📦 Order Tracking</Text>
        <Text style={styles.searchSub}>Search order and update its status</Text>
        <View style={styles.searchRow}>
          <TextInput
            style={styles.input}
            placeholder="Enter Order ID..."
            value={orderId}
            onChangeText={setOrderId}
            autoCapitalize="none"
            autoCorrect={false}
          />
          <TouchableOpacity style={styles.searchBtn} onPress={handleSearch} disabled={loading}>
            {loading
              ? <ActivityIndicator color="#fff" size="small" />
              : <Text style={styles.searchBtnTxt}>Search</Text>
            }
          </TouchableOpacity>
        </View>
      </View>

      {order && (
        <View style={styles.resultBox}>

          {/* Order Info */}
          <View style={styles.section}>
            <View style={styles.rowBetween}>
              <View>
                <Text style={styles.orderId}>#{order._id.slice(-8).toUpperCase()}</Text>
                <Text style={styles.orderDate}>{new Date(order.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</Text>
              </View>
              <View style={[styles.badge, { backgroundColor: (STATUS_COLOR[order.status] || '#888') + '22' }]}>
                <Text style={[styles.badgeTxt, { color: STATUS_COLOR[order.status] || '#888' }]}>
                  {STATUS_ICON[order.status]} {order.status}
                </Text>
              </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}><Text style={styles.infoLabel}>Customer</Text><Text style={styles.infoVal}>{order.user?.name || '—'}</Text></View>
            <View style={styles.infoRow}><Text style={styles.infoLabel}>Email</Text><Text style={styles.infoVal}>{order.user?.email || '—'}</Text></View>
            <View style={styles.infoRow}><Text style={styles.infoLabel}>Items</Text><Text style={styles.infoVal}>{order.items.length}</Text></View>
            <View style={styles.infoRow}><Text style={styles.infoLabel}>Total</Text><Text style={[styles.infoVal, { color: '#6C63FF', fontWeight: '700' }]}>LKR {order.totalPrice.toFixed(2)}</Text></View>
          </View>

          {/* Progress */}
          {!isCancelled && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>📍 Current Progress</Text>
              <View style={styles.progressRow}>
                {STEPS.map((step, index) => {
                  const done = index <= currentStep;
                  const active = index === currentStep;
                  const color = done ? STATUS_COLOR[step] : '#ddd';
                  return (
                    <View key={step} style={styles.progressStep}>
                      <View style={[styles.progressCircle, { backgroundColor: color }]}>
                        <Text style={styles.progressIcon}>{done ? STATUS_ICON[step] : '○'}</Text>
                      </View>
                      {index < STEPS.length - 1 && (
                        <View style={[styles.progressLine, { backgroundColor: index < currentStep ? STATUS_COLOR[STEPS[index]] : '#eee' }]} />
                      )}
                      <Text style={[styles.progressLabel, { color: active ? '#222' : '#aaa', fontWeight: active ? '700' : '400' }]}>
                        {step}
                      </Text>
                    </View>
                  );
                })}
              </View>
            </View>
          )}

          {/* Update Status Buttons */}
          {!isCancelled && !isDelivered && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🔄 Update Status</Text>
              <View style={styles.statusBtns}>
                {STEPS.filter(s => s !== order.status).map(s => (
                  <TouchableOpacity
                    key={s}
                    style={[styles.statusBtn, { borderColor: STATUS_COLOR[s], backgroundColor: STATUS_COLOR[s] + '11' }]}
                    onPress={() => handleUpdateStatus(s)}
                    disabled={updating}
                  >
                    <Text style={styles.statusBtnIcon}>{STATUS_ICON[s]}</Text>
                    <Text style={[styles.statusBtnTxt, { color: STATUS_COLOR[s] }]}>
                      {updating ? 'Updating...' : `Mark as ${s}`}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => handleUpdateStatus('Cancelled')}
                disabled={updating}
              >
                <Text style={styles.cancelBtnTxt}>❌ Cancel Order</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Delivered */}
          {isDelivered && (
            <View style={[styles.section, { alignItems: 'center' }]}>
              <Text style={{ fontSize: 40 }}>✅</Text>
              <Text style={{ fontSize: 16, fontWeight: '700', color: '#10B981', marginTop: 8 }}>Order Delivered!</Text>
              <Text style={{ fontSize: 13, color: '#888', marginTop: 4 }}>This order has been completed.</Text>
            </View>
          )}

          {/* Cancelled */}
          {isCancelled && (
            <View style={[styles.section, { alignItems: 'center' }]}>
              <Text style={{ fontSize: 40 }}>❌</Text>
              <Text style={{ fontSize: 16, fontWeight: '700', color: '#EF4444', marginTop: 8 }}>Order Cancelled</Text>
            </View>
          )}

          {/* Items */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🛍️ Items</Text>
            {order.items.map((item, i) => (
              <View key={i} style={styles.itemRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemMeta}>Size: {item.size} · Qty: {item.quantity}</Text>
                </View>
                <Text style={styles.itemPrice}>LKR {(item.price * item.quantity).toFixed(2)}</Text>
              </View>
            ))}
          </View>

          {/* Shipping */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📍 Shipping Address</Text>
            <Text style={styles.addressTxt}>{order.shippingAddress.street}</Text>
            <Text style={styles.addressTxt}>{order.shippingAddress.city}, {order.shippingAddress.postalCode}</Text>
            <Text style={styles.addressTxt}>{order.shippingAddress.country}</Text>
          </View>

        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  searchBox: { backgroundColor: '#6C63FF', padding: 20, paddingTop: 30 },
  searchTitle: { fontSize: 22, fontWeight: '700', color: '#fff', marginBottom: 4 },
  searchSub: { fontSize: 13, color: '#e0dfff', marginBottom: 16 },
  searchRow: { flexDirection: 'row', gap: 10 },
  input: { flex: 1, backgroundColor: '#fff', borderRadius: 10, padding: 12, fontSize: 14 },
  searchBtn: { backgroundColor: '#4f46e5', borderRadius: 10, paddingHorizontal: 18, justifyContent: 'center' },
  searchBtnTxt: { color: '#fff', fontWeight: '700', fontSize: 14 },
  resultBox: { padding: 12 },
  section: { backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 12, elevation: 2 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  orderId: { fontSize: 17, fontWeight: '700', color: '#222' },
  orderDate: { fontSize: 12, color: '#888', marginTop: 3 },
  badge: { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5 },
  badgeTxt: { fontSize: 12, fontWeight: '700' },
  divider: { height: 1, backgroundColor: '#f0f0f0', marginVertical: 10 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: '#f5f5f5' },
  infoLabel: { fontSize: 13, color: '#888' },
  infoVal: { fontSize: 13, color: '#222', fontWeight: '500' },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#333', marginBottom: 14 },
  progressRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  progressStep: { flex: 1, alignItems: 'center', position: 'relative' },
  progressCircle: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
  progressIcon: { fontSize: 16 },
  progressLine: { position: 'absolute', top: 20, left: '50%', right: '-50%', height: 3, zIndex: -1 },
  progressLabel: { fontSize: 11, textAlign: 'center' },
  statusBtns: { gap: 10, marginBottom: 10 },
  statusBtn: { flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1.5, borderRadius: 10, padding: 14 },
  statusBtnIcon: { fontSize: 20 },
  statusBtnTxt: { fontSize: 15, fontWeight: '600' },
  cancelBtn: { borderWidth: 1.5, borderColor: '#EF4444', borderRadius: 10, padding: 14, alignItems: 'center', marginTop: 4 },
  cancelBtnTxt: { color: '#EF4444', fontWeight: '600', fontSize: 15 },
  itemRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  itemName: { fontSize: 14, fontWeight: '600', color: '#222' },
  itemMeta: { fontSize: 12, color: '#888', marginTop: 2 },
  itemPrice: { fontSize: 14, fontWeight: '700', color: '#6C63FF' },
  addressTxt: { fontSize: 14, color: '#555', lineHeight: 22 },
});