import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, Image,
  StyleSheet, ActivityIndicator, RefreshControl
} from 'react-native';
import Toast from 'react-native-toast-message';
import { getCategories, deleteCategory } from '../../api';
import { useAuth } from '../../context/AuthContext';

export default function CategoryListScreen({ navigation }) {
  const { user } = useAuth();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await getCategories();
      setCategories(res.data.categories);
    } catch {
      Toast.show({ type: 'error', text1: 'Failed to load categories' });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  const handleDelete = async (id) => {
    try {
      await deleteCategory(id);
      Toast.show({ type: 'success', text1: 'Category deleted' });
      fetchCategories();
    } catch {
      Toast.show({ type: 'error', text1: 'Delete failed' });
    }
  };

  const genderColor = {
    Men: '#3B82F6',
    Women: '#EC4899',
    Kids: '#F59E0B',
    Unisex: '#10B981'
  };

  const genderBg = {
    Men: '#EFF6FF',
    Women: '#FDF2F8',
    Kids: '#FFFBEB',
    Unisex: '#ECFDF5'
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('CategoryProducts', {
        categoryId: item._id,
        categoryName: item.name,
      })}
    >
      <Image
        source={{ uri: item.image || 'https://via.placeholder.com/80' }}
        style={styles.image}
      />
      <View style={[styles.overlay, { backgroundColor: genderBg[item.gender] + 'cc' }]} />
      <View style={styles.cardContent}>
        <Text style={styles.name}>{item.name}</Text>
        <View style={[styles.genderBadge, { backgroundColor: genderColor[item.gender] }]}>
          <Text style={styles.genderTxt}>{item.gender}</Text>
        </View>
        {item.description ? (
          <Text style={styles.desc} numberOfLines={1}>{item.description}</Text>
        ) : null}
        <Text style={styles.tapHint}>Tap to browse →</Text>
      </View>

      {user?.role === 'admin' && (
        <View style={styles.adminBtns}>
          <TouchableOpacity
            style={styles.editBtn}
            onPress={() => navigation.navigate('CategoryForm', { category: item })}
          >
            <Text style={styles.editBtnTxt}>✏️</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.deleteBtn}
            onPress={() => handleDelete(item._id)}
          >
            <Text style={styles.deleteBtnTxt}>🗑️</Text>
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );

  if (loading) return <ActivityIndicator style={{ flex: 1 }} size="large" color="#6C63FF" />;

  return (
    <View style={styles.container}>
      {user?.role === 'admin' && (
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => navigation.navigate('CategoryForm', {})}
        >
          <Text style={styles.addBtnText}>+ Add Category</Text>
        </TouchableOpacity>
      )}
      <FlatList
        data={categories}
        keyExtractor={item => item._id}
        renderItem={renderItem}
        numColumns={2}
        columnWrapperStyle={styles.row}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); fetchCategories(); }}
          />
        }
        ListEmptyComponent={
          <Text style={styles.empty}>No categories found</Text>
        }
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 12 },
  addBtn: { backgroundColor: '#6C63FF', padding: 12, borderRadius: 10, alignItems: 'center', marginBottom: 12 },
  addBtnText: { color: '#fff', fontWeight: '600' },
  row: { justifyContent: 'space-between', marginBottom: 12 },
  card: { width: '48%', height: 160, borderRadius: 14, overflow: 'hidden', backgroundColor: '#fff', elevation: 3 },
  image: { position: 'absolute', width: '100%', height: '100%' },
  overlay: { position: 'absolute', width: '100%', height: '100%' },
  cardContent: { flex: 1, padding: 12, justifyContent: 'flex-end' },
  name: { fontSize: 15, fontWeight: '700', color: '#222', marginBottom: 4 },
  genderBadge: { alignSelf: 'flex-start', borderRadius: 20, paddingHorizontal: 8, paddingVertical: 2, marginBottom: 4 },
  genderTxt: { fontSize: 10, fontWeight: '700', color: '#fff' },
  desc: { fontSize: 11, color: '#555', marginBottom: 4 },
  tapHint: { fontSize: 11, color: '#6C63FF', fontWeight: '600' },
  adminBtns: { position: 'absolute', top: 8, right: 8, gap: 4 },
  editBtn: { backgroundColor: '#fff', borderRadius: 6, padding: 4 },
  editBtnTxt: { fontSize: 14 },
  deleteBtn: { backgroundColor: '#fff', borderRadius: 6, padding: 4 },
  deleteBtnTxt: { fontSize: 14 },
  empty: { textAlign: 'center', color: '#999', marginTop: 40, fontSize: 15 },
});