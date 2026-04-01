import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import Toast from 'react-native-toast-message';
import { getProductReviews, deleteReview } from '../../api';
import { useAuth } from '../../context/AuthContext';

const Stars = ({ rating }) => '⭐'.repeat(rating);

export default function ReviewScreen({ route, navigation }) {
  const { productId, productName } = route.params;
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchReviews = useCallback(async () => {
    try {
      const res = await getProductReviews(productId);
      setReviews(res.data.reviews);
    } catch {
      Toast.show({ type: 'error', text1: 'Failed to load reviews' });
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => { fetchReviews(); }, [fetchReviews]);

  const handleDelete = async (id) => {
    try {
      await deleteReview(id);
      Toast.show({ type: 'success', text1: 'Review deleted' });
      fetchReviews();
    } catch {
      Toast.show({ type: 'error', text1: 'Delete failed' });
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View>
          <Text style={styles.userName}>{item.user?.name}</Text>
          <Text style={styles.stars}><Stars rating={item.rating} /></Text>
        </View>
        <Text style={styles.date}>{new Date(item.createdAt).toLocaleDateString()}</Text>
      </View>
      <Text style={styles.comment}>{item.comment}</Text>
      {(user?._id === item.user?._id || user?.role === 'admin') && (
        <View style={styles.actions}>
          {user?._id === item.user?._id && (
            <TouchableOpacity onPress={() => navigation.navigate('AddReview', { productId, review: item })}>
              <Text style={styles.editTxt}>Edit</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={() => handleDelete(item._id)}>
            <Text style={styles.deleteTxt}>Delete</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  if (loading) return <ActivityIndicator style={{ flex: 1 }} size="large" color="#6C63FF" />;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Reviews for {productName}</Text>
      <TouchableOpacity style={styles.addBtn} onPress={() => navigation.navigate('AddReview', { productId })}>
        <Text style={styles.addBtnTxt}>+ Write a Review</Text>
      </TouchableOpacity>
      <FlatList
        data={reviews}
        keyExtractor={item => item._id}
        renderItem={renderItem}
        ListEmptyComponent={<Text style={styles.empty}>No reviews yet. Be the first!</Text>}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 12 },
  title: { fontSize: 15, fontWeight: '600', color: '#333', marginBottom: 10 },
  addBtn: { backgroundColor: '#6C63FF', padding: 12, borderRadius: 10, alignItems: 'center', marginBottom: 12 },
  addBtnTxt: { color: '#fff', fontWeight: '600' },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 10, elevation: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  userName: { fontSize: 14, fontWeight: '700', color: '#222' },
  stars: { fontSize: 13, marginTop: 2 },
  date: { fontSize: 11, color: '#aaa' },
  comment: { fontSize: 14, color: '#555', lineHeight: 20 },
  actions: { flexDirection: 'row', gap: 16, marginTop: 10 },
  editTxt: { color: '#6C63FF', fontWeight: '600', fontSize: 13 },
  deleteTxt: { color: '#EF4444', fontWeight: '600', fontSize: 13 },
  empty: { textAlign: 'center', color: '#999', marginTop: 40, fontSize: 15 },
});
