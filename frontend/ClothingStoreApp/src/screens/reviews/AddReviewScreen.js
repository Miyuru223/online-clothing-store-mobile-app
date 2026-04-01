import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import Toast from 'react-native-toast-message';
import { addReview, updateReview } from '../../api';

export default function AddReviewScreen({ route, navigation }) {
  const { productId, review } = route.params;
  const [rating, setRating] = useState(review?.rating || 0);
  const [comment, setComment] = useState(review?.comment || '');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!rating) return Toast.show({ type: 'error', text1: 'Please select a star rating' });
    if (!comment.trim()) return Toast.show({ type: 'error', text1: 'Please write a comment' });
    setLoading(true);
    try {
      if (review) await updateReview(review._id, { rating, comment });
      else await addReview({ productId, rating, comment });
      Toast.show({ type: 'success', text1: review ? 'Review updated!' : 'Review submitted!' });
      navigation.goBack();
    } catch (err) {
      Toast.show({ type: 'error', text1: err.response?.data?.message || 'Failed to submit review' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Your Rating *</Text>
      <View style={styles.starsRow}>
        {[1, 2, 3, 4, 5].map(s => (
          <TouchableOpacity key={s} onPress={() => setRating(s)}>
            <Text style={[styles.star, s <= rating && styles.starActive]}>★</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Your Review *</Text>
      <TextInput
        style={styles.input}
        value={comment}
        onChangeText={setComment}
        multiline
        numberOfLines={5}
        placeholder="Share your experience with this product..."
      />

      <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitTxt}>{review ? 'Update Review' : 'Submit Review'}</Text>}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20 },
  label: { fontSize: 14, fontWeight: '600', color: '#555', marginBottom: 10, marginTop: 16 },
  starsRow: { flexDirection: 'row', gap: 8 },
  star: { fontSize: 40, color: '#ddd' },
  starActive: { color: '#F59E0B' },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 10, padding: 12, fontSize: 15, height: 130, textAlignVertical: 'top', backgroundColor: '#fafafa' },
  submitBtn: { backgroundColor: '#6C63FF', padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 24 },
  submitTxt: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
