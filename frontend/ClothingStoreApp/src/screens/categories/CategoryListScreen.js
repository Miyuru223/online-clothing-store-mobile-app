import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native';
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

  const genderColor = { Men: '#3B82F6', Women: '#EC4899', Kids: '#F59E0B', Unisex: '#10B981' };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Image source={{ uri: item.image || 'https://via.placeholder.com/80' }} style={styles.image} />
      <View style={styles.info}>
        <Text style={styles.name}>{item.name}</Text>
        <View style={[styles.genderBadge, { backgroundColor: genderColor[item.gender] + '22' }]}>
          <Text style={[styles.genderTxt, { color: genderColor[item.gender] }]}>{item.gender}</Text>
        </View>
        {item.description ? <Text style={styles.desc} numberOfLines={1}>{item.description}</Text> : null}
      </View>
      {user?.role === 'admin' && (
        <View style={styles.adminBtns}>
          <TouchableOpacity onPress={() => navigation.navigate('CategoryForm', { category: item })}>
            <Text style={{ fontSize: 20 }}>✏️</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleDelete(item._id)}>
            <Text style={{ fontSize: 20 }}>🗑️</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  if (loading) return <ActivityIndicator style={{ flex: 1 }} size="large" color="#6C63FF" />;

  return (
    <View style={styles.container}>
      {user?.role === 'admin' && (
        <TouchableOpacity style={styles.addBtn} onPress={() => navigation.navigate('CategoryForm', {})}>
          <Text style={styles.addBtnText}>+ Add Category</Text>
        </TouchableOpacity>
      )}
      <FlatList
        data={categories}
        keyExtractor={item => item._id}
        renderItem={renderItem}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchCategories(); }} />}
        ListEmptyComponent={<Text style={styles.empty}>No categories found</Text>}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 12 },
  addBtn: { backgroundColor: '#6C63FF', padding: 12, borderRadius: 10, alignItems: 'center', marginBottom: 10 },
  addBtnText: { color: '#fff', fontWeight: '600' },
  card: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 12, marginBottom: 10, padding: 12, alignItems: 'center', elevation: 2 },
  image: { width: 60, height: 60, borderRadius: 8, marginRight: 12 },
  info: { flex: 1 },
  name: { fontSize: 16, fontWeight: '600', color: '#222' },
  genderBadge: { alignSelf: 'flex-start', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3, marginTop: 4 },
  genderTxt: { fontSize: 12, fontWeight: '600' },
  desc: { fontSize: 12, color: '#888', marginTop: 4 },
  adminBtns: { gap: 8 },
  empty: { textAlign: 'center', color: '#999', marginTop: 40, fontSize: 15 },
});
