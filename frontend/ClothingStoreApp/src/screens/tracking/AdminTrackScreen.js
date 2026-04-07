import React, { useState, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, ActivityIndicator, Modal, FlatList, Alert
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import api from '../../api';

const STATUS_COLOR = {
  Pending: '#F59E0B', Processing: '#3B82F6', Shipped: '#8B5CF6',
  'Out for Delivery': '#F97316', Delivered: '#10B981', Cancelled: '#EF4444',
};
const STATUS_ICON = {
  Pending: '🕐', Processing: '⚙️', Shipped: '📦',
  'Out for Delivery': '🚚', Delivered: '✅', Cancelled: '❌',
};
const ALL_STATUSES = ['Pending', 'Processing', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'];

export default function AdminTrackScreen() {
  const [orderId, setOrderId] = useState('');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);

  // Agent management
  const [agents, setAgents] = useState([]);
  const [agentModalVisible, setAgentModalVisible] = useState(false);
  const [addAgentModalVisible, setAddAgentModalVisible] = useState(false);
  const [assignModalVisible, setAssignModalVisible] = useState(false);
  const [availableAgents, setAvailableAgents] = useState([]);

  // Edit agent
  const [editingAgent, setEditingAgent] = useState(null);
  const [agentName, setAgentName] = useState('');
  const [agentIdField, setAgentIdField] = useState('');
  const [agentContact, setAgentContact] = useState('');
  const [savingAgent, setSavingAgent] = useState(false);

  const fetchAgents = async () => {
    try {
      const res = await api.get('/agents');
      setAgents(res.data.agents);
    } catch (err) {
      Toast.show({ type: 'error', text1: 'Failed to load agents' });
    }
  };

  useFocusEffect(useCallback(() => { fetchAgents(); }, []));

  const handleSearch = async () => {
    const trimmed = orderId.trim();
    if (!trimmed) return Toast.show({ type: 'error', text1: 'Please enter an Order ID' });
    setLoading(true);
    setOrder(null);
    try {
      const res = await api.get(`/orders/${trimmed}`);
      const o = res.data.order;
      if (o.deliveryAgent) {
        const agentRes = await api.get(`/agents`);
        const agent = agentRes.data.agents.find(a => a._id === (o.deliveryAgent._id || o.deliveryAgent));
        o.agentDetails = agent;
      }
      setOrder(o);
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
      const res = await api.get(`/orders/${order._id}`);
      setOrder(res.data.order);
    } catch (err) {
      Toast.show({ type: 'error', text1: err.response?.data?.message || 'Update failed' });
    } finally {
      setUpdating(false);
    }
  };

  const openAssignModal = async () => {
    try {
      const res = await api.get('/agents/available');
      setAvailableAgents(res.data.agents);
      setAssignModalVisible(true);
    } catch {
      Toast.show({ type: 'error', text1: 'Failed to load available agents' });
    }
  };

  const handleAssignAgent = async (agent) => {
    setUpdating(true);
    try {
      await api.post('/agents/assign', { agentId: agent._id, orderId: order._id });
      Toast.show({ type: 'success', text1: `${agent.name} assigned successfully!` });
      setAssignModalVisible(false);
      const res = await api.get(`/orders/${order._id}`);
      setOrder(res.data.order);
    } catch (err) {
      Toast.show({ type: 'error', text1: err.response?.data?.message || 'Assignment failed' });
    } finally {
      setUpdating(false);
    }
  };

  const openAddAgent = (agent = null) => {
    setEditingAgent(agent);
    setAgentName(agent?.name || '');
    setAgentIdField(agent?.agentId || '');
    setAgentContact(agent?.contactNo || '');
    setAddAgentModalVisible(true);
  };

  const handleSaveAgent = async () => {
    if (!agentName || !agentIdField || !agentContact)
      return Toast.show({ type: 'error', text1: 'All fields are required' });
    setSavingAgent(true);
    try {
      if (editingAgent) {
        await api.put(`/agents/${editingAgent._id}`, { name: agentName, agentId: agentIdField, contactNo: agentContact });
        Toast.show({ type: 'success', text1: 'Agent updated!' });
      } else {
        await api.post('/agents', { name: agentName, agentId: agentIdField, contactNo: agentContact });
        Toast.show({ type: 'success', text1: 'Agent added!' });
      }
      setAddAgentModalVisible(false);
      fetchAgents();
    } catch (err) {
      Toast.show({ type: 'error', text1: err.response?.data?.message || 'Failed to save agent' });
    } finally {
      setSavingAgent(false);
    }
  };

  const handleDeleteAgent = (agent) => {
    Alert.alert('Delete Agent', `Delete "${agent.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try {
          await api.delete(`/agents/${agent._id}`);
          Toast.show({ type: 'success', text1: 'Agent deleted' });
          fetchAgents();
        } catch (err) {
          Toast.show({ type: 'error', text1: 'Delete failed' });
        }
      }}
    ]);
  };

  const isOutForDelivery = order?.status === 'Out for Delivery';
  const isDelivered = order?.status === 'Delivered';
  const isCancelled = order?.status === 'Cancelled';

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>

      {/* Search Box */}
      <View style={styles.searchBox}>
        <Text style={styles.searchTitle}>📦 Order Tracking</Text>
        <Text style={styles.searchSub}>Search and manage order delivery</Text>
        <View style={styles.searchRow}>
          <TextInput style={styles.input} placeholder="Enter Order ID..." value={orderId}
            onChangeText={setOrderId} autoCapitalize="none" autoCorrect={false} />
          <TouchableOpacity style={styles.searchBtn} onPress={handleSearch} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" size="small" /> : <Text style={styles.searchBtnTxt}>Search</Text>}
          </TouchableOpacity>
        </View>

        {/* Manage Agents Button */}
        <TouchableOpacity style={styles.manageAgentsBtn} onPress={() => { fetchAgents(); setAgentModalVisible(true); }}>
          <Text style={styles.manageAgentsBtnTxt}>👷 Manage Delivery Agents</Text>
        </TouchableOpacity>
      </View>

      {/* Order Result */}
      {order && (
        <View style={styles.resultBox}>

          {/* Order Header */}
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
            <View style={styles.infoRow}><Text style={styles.infoLabel}>Total</Text><Text style={[styles.infoVal, { color: '#6C63FF', fontWeight: '700' }]}>LKR {order.totalPrice.toFixed(2)}</Text></View>
          </View>

          {/* Delivery Agent Info */}
          {order.deliveryAgent && (
            <View style={[styles.section, { borderLeftWidth: 4, borderLeftColor: '#F97316' }]}>
              <Text style={styles.sectionTitle}>🚚 Assigned Delivery Agent</Text>
              <View style={styles.agentCard}>
                <View style={styles.agentAvatar}>
                  <Text style={styles.agentAvatarTxt}>
                    {(order.deliveryAgent?.name || order.agentDetails?.name || 'A').charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.agentName}>{order.deliveryAgent?.name || order.agentDetails?.name || '—'}</Text>
                  <Text style={styles.agentInfo}>ID: {order.deliveryAgent?.agentId || order.agentDetails?.agentId || '—'}</Text>
                  <Text style={styles.agentInfo}>📞 {order.deliveryAgent?.contactNo || order.agentDetails?.contactNo || '—'}</Text>
                </View>
              </View>
            </View>
          )}

          {/* Update Status */}
          {!isCancelled && !isDelivered && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🔄 Update Status</Text>
              <View style={styles.statusBtns}>
                {ALL_STATUSES
                  .filter(s => s !== order.status && s !== 'Cancelled')
                  .map(s => (
                    <TouchableOpacity
                      key={s}
                      style={[styles.statusBtn, { borderColor: STATUS_COLOR[s], backgroundColor: STATUS_COLOR[s] + '11' }]}
                      onPress={() => handleUpdateStatus(s)}
                      disabled={updating}
                    >
                      <Text style={styles.statusBtnIcon}>{STATUS_ICON[s]}</Text>
                      <Text style={[styles.statusBtnTxt, { color: STATUS_COLOR[s] }]}>
                        {updating ? '...' : `Mark as ${s}`}
                      </Text>
                    </TouchableOpacity>
                  ))
                }
              </View>

              {/* Assign Agent Button - shown when Out for Delivery */}
              {order.status === 'Processing' || order.status === 'Shipped' || order.status === 'Out for Delivery' ? (
                <TouchableOpacity style={styles.assignBtn} onPress={openAssignModal}>
                  <Text style={styles.assignBtnTxt}>
                    {order.deliveryAgent ? '🔄 Reassign Delivery Agent' : '👷 Assign Delivery Agent'}
                  </Text>
                </TouchableOpacity>
              ) : null}

              <TouchableOpacity style={styles.cancelBtn} onPress={() => handleUpdateStatus('Cancelled')} disabled={updating}>
                <Text style={styles.cancelBtnTxt}>❌ Cancel Order</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Delivered */}
          {isDelivered && (
            <View style={[styles.section, { alignItems: 'center' }]}>
              <Text style={{ fontSize: 40 }}>✅</Text>
              <Text style={{ fontSize: 16, fontWeight: '700', color: '#10B981', marginTop: 8 }}>Order Delivered!</Text>
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

      {/* ── Manage Agents Modal ── */}
      <Modal visible={agentModalVisible} animationType="slide" onRequestClose={() => setAgentModalVisible(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>👷 Delivery Agents</Text>
            <TouchableOpacity onPress={() => setAgentModalVisible(false)}>
              <Text style={styles.closeBtn}>✕</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.addAgentBtn} onPress={() => { setAgentModalVisible(false); openAddAgent(); }}>
            <Text style={styles.addAgentBtnTxt}>+ Add New Agent</Text>
          </TouchableOpacity>

          {/* Summary */}
          <View style={styles.agentSummaryRow}>
            <View style={styles.agentSummaryCard}>
              <Text style={styles.agentSummaryNum}>{agents.length}</Text>
              <Text style={styles.agentSummaryLabel}>Total</Text>
            </View>
            <View style={[styles.agentSummaryCard, { borderTopColor: '#10B981', borderTopWidth: 3 }]}>
              <Text style={[styles.agentSummaryNum, { color: '#10B981' }]}>{agents.filter(a => a.isAvailable).length}</Text>
              <Text style={styles.agentSummaryLabel}>Available</Text>
            </View>
            <View style={[styles.agentSummaryCard, { borderTopColor: '#F97316', borderTopWidth: 3 }]}>
              <Text style={[styles.agentSummaryNum, { color: '#F97316' }]}>{agents.filter(a => !a.isAvailable).length}</Text>
              <Text style={styles.agentSummaryLabel}>On Duty</Text>
            </View>
          </View>

          <FlatList
            data={agents}
            keyExtractor={item => item._id}
            contentContainerStyle={{ paddingBottom: 20 }}
            ListEmptyComponent={<Text style={styles.emptyTxt}>No agents added yet</Text>}
            renderItem={({ item }) => (
              <View style={styles.agentListCard}>
                <View style={styles.agentAvatar}>
                  <Text style={styles.agentAvatarTxt}>{item.name.charAt(0).toUpperCase()}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.agentName}>{item.name}</Text>
                  <Text style={styles.agentInfo}>ID: {item.agentId}</Text>
                  <Text style={styles.agentInfo}>📞 {item.contactNo}</Text>
                </View>
                <View style={styles.agentRight}>
                  <View style={[styles.availBadge, { backgroundColor: item.isAvailable ? '#ECFDF5' : '#FFF7ED' }]}>
                    <Text style={[styles.availTxt, { color: item.isAvailable ? '#10B981' : '#F97316' }]}>
                      {item.isAvailable ? '✅ Available' : '🚚 On Duty'}
                    </Text>
                  </View>
                  <View style={styles.agentActions}>
                    <TouchableOpacity onPress={() => { setAgentModalVisible(false); openAddAgent(item); }}>
                      <Text style={styles.agentEditBtn}>✏️</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleDeleteAgent(item)}>
                      <Text style={styles.agentDeleteBtn}>🗑️</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}
          />
        </View>
      </Modal>

      {/* ── Add/Edit Agent Modal ── */}
      <Modal visible={addAgentModalVisible} animationType="slide" onRequestClose={() => setAddAgentModalVisible(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{editingAgent ? '✏️ Edit Agent' : '➕ Add Agent'}</Text>
            <TouchableOpacity onPress={() => setAddAgentModalVisible(false)}>
              <Text style={styles.closeBtn}>✕</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>Full Name *</Text>
          <TextInput style={styles.formInput} value={agentName} onChangeText={setAgentName} placeholder="e.g. Kamal Perera" />

          <Text style={styles.label}>Agent ID *</Text>
          <TextInput style={styles.formInput} value={agentIdField} onChangeText={setAgentIdField} placeholder="e.g. AGT-001" autoCapitalize="characters" />

          <Text style={styles.label}>Contact Number *</Text>
          <TextInput style={styles.formInput} value={agentContact} onChangeText={setAgentContact} placeholder="e.g. +94 77 123 4567" keyboardType="phone-pad" />

          <TouchableOpacity style={styles.saveAgentBtn} onPress={handleSaveAgent} disabled={savingAgent}>
            {savingAgent
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.saveAgentBtnTxt}>{editingAgent ? 'Update Agent' : 'Add Agent'}</Text>
            }
          </TouchableOpacity>
        </View>
      </Modal>

      {/* ── Assign Agent Modal ── */}
      <Modal visible={assignModalVisible} animationType="slide" onRequestClose={() => setAssignModalVisible(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>👷 Assign Delivery Agent</Text>
            <TouchableOpacity onPress={() => setAssignModalVisible(false)}>
              <Text style={styles.closeBtn}>✕</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.assignSubtitle}>Select an available agent for this order:</Text>

          {availableAgents.length === 0 ? (
            <View style={styles.noAgentsBox}>
              <Text style={styles.noAgentsIcon}>😔</Text>
              <Text style={styles.noAgentsTxt}>No available agents right now</Text>
              <Text style={styles.noAgentsDesc}>All agents are currently on duty. Please wait for one to become available.</Text>
            </View>
          ) : (
            <FlatList
              data={availableAgents}
              keyExtractor={item => item._id}
              contentContainerStyle={{ paddingBottom: 20 }}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.assignAgentCard} onPress={() => handleAssignAgent(item)} disabled={updating}>
                  <View style={styles.agentAvatar}>
                    <Text style={styles.agentAvatarTxt}>{item.name.charAt(0).toUpperCase()}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.agentName}>{item.name}</Text>
                    <Text style={styles.agentInfo}>ID: {item.agentId}</Text>
                    <Text style={styles.agentInfo}>📞 {item.contactNo}</Text>
                  </View>
                  <View style={styles.selectBadge}>
                    <Text style={styles.selectBadgeTxt}>{updating ? '...' : 'Assign →'}</Text>
                  </View>
                </TouchableOpacity>
              )}
            />
          )}
        </View>
      </Modal>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  searchBox: { backgroundColor: '#6C63FF', padding: 20, paddingTop: 30 },
  searchTitle: { fontSize: 22, fontWeight: '700', color: '#fff', marginBottom: 4 },
  searchSub: { fontSize: 13, color: '#e0dfff', marginBottom: 16 },
  searchRow: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  input: { flex: 1, backgroundColor: '#fff', borderRadius: 10, padding: 12, fontSize: 14 },
  searchBtn: { backgroundColor: '#4f46e5', borderRadius: 10, paddingHorizontal: 18, justifyContent: 'center' },
  searchBtnTxt: { color: '#fff', fontWeight: '700', fontSize: 14 },
  manageAgentsBtn: { backgroundColor: '#fff', borderRadius: 10, padding: 12, alignItems: 'center' },
  manageAgentsBtnTxt: { color: '#6C63FF', fontWeight: '700', fontSize: 14 },
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
  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#333', marginBottom: 12 },
  agentCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#FFF7ED', borderRadius: 10, padding: 12 },
  agentAvatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#F97316', alignItems: 'center', justifyContent: 'center' },
  agentAvatarTxt: { color: '#fff', fontSize: 18, fontWeight: '700' },
  agentName: { fontSize: 15, fontWeight: '700', color: '#222' },
  agentInfo: { fontSize: 12, color: '#666', marginTop: 2 },
  statusBtns: { gap: 10, marginBottom: 10 },
  statusBtn: { flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1.5, borderRadius: 10, padding: 12 },
  statusBtnIcon: { fontSize: 20 },
  statusBtnTxt: { fontSize: 14, fontWeight: '600' },
  assignBtn: { backgroundColor: '#F97316', borderRadius: 10, padding: 14, alignItems: 'center', marginBottom: 10 },
  assignBtnTxt: { color: '#fff', fontWeight: '700', fontSize: 14 },
  cancelBtn: { borderWidth: 1.5, borderColor: '#EF4444', borderRadius: 10, padding: 14, alignItems: 'center' },
  cancelBtnTxt: { color: '#EF4444', fontWeight: '600', fontSize: 15 },
  itemRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  itemName: { fontSize: 14, fontWeight: '600', color: '#222' },
  itemMeta: { fontSize: 12, color: '#888', marginTop: 2 },
  itemPrice: { fontSize: 14, fontWeight: '700', color: '#6C63FF' },
  addressTxt: { fontSize: 14, color: '#555', lineHeight: 22 },
  // Modal
  modalContainer: { flex: 1, backgroundColor: '#fff', padding: 16 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, paddingTop: 10 },
  modalTitle: { fontSize: 20, fontWeight: '700', color: '#222' },
  closeBtn: { fontSize: 20, color: '#888', padding: 4 },
  addAgentBtn: { backgroundColor: '#6C63FF', borderRadius: 10, padding: 13, alignItems: 'center', marginBottom: 14 },
  addAgentBtnTxt: { color: '#fff', fontWeight: '700', fontSize: 14 },
  agentSummaryRow: { flexDirection: 'row', gap: 10, marginBottom: 14 },
  agentSummaryCard: { flex: 1, backgroundColor: '#f9fafb', borderRadius: 10, padding: 12, alignItems: 'center', elevation: 1 },
  agentSummaryNum: { fontSize: 22, fontWeight: '700', color: '#6C63FF' },
  agentSummaryLabel: { fontSize: 11, color: '#888', marginTop: 2 },
  agentListCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#f9fafb', borderRadius: 12, padding: 12, marginBottom: 10 },
  agentRight: { alignItems: 'flex-end', gap: 8 },
  availBadge: { borderRadius: 20, paddingHorizontal: 8, paddingVertical: 3 },
  availTxt: { fontSize: 11, fontWeight: '600' },
  agentActions: { flexDirection: 'row', gap: 10 },
  agentEditBtn: { fontSize: 18 },
  agentDeleteBtn: { fontSize: 18 },
  emptyTxt: { textAlign: 'center', color: '#999', marginTop: 40, fontSize: 15 },
  label: { fontSize: 13, fontWeight: '600', color: '#555', marginBottom: 6, marginTop: 14 },
  formInput: { borderWidth: 1, borderColor: '#ddd', borderRadius: 10, padding: 12, fontSize: 15, backgroundColor: '#fafafa' },
  saveAgentBtn: { backgroundColor: '#6C63FF', padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 24 },
  saveAgentBtnTxt: { color: '#fff', fontSize: 16, fontWeight: '600' },
  assignSubtitle: { fontSize: 14, color: '#555', marginBottom: 14 },
  assignAgentCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#f9fafb', borderRadius: 12, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: '#e5e7eb' },
  selectBadge: { backgroundColor: '#6C63FF', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6 },
  selectBadgeTxt: { color: '#fff', fontWeight: '700', fontSize: 13 },
  noAgentsBox: { alignItems: 'center', marginTop: 60 },
  noAgentsIcon: { fontSize: 50 },
  noAgentsTxt: { fontSize: 16, fontWeight: '700', color: '#333', marginTop: 12 },
  noAgentsDesc: { fontSize: 13, color: '#888', textAlign: 'center', marginTop: 8, lineHeight: 20 },
});