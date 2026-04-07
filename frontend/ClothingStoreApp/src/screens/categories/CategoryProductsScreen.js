import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, Image,
  StyleSheet, ActivityIndicator, RefreshControl, TextInput
} from 'react-native';
import Toast from 'react-native-toast-message';
import { getProducts, deleteProduct } from '../../api';
import { useAuth } from '../../context/AuthContext';

export default function CategoryProductsScreen({ route, navigation }) {
  const { categoryId, categoryName } = route.params;
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');

  const fetchProducts = useCallback(async () => {
    try {
      const params = { category: categoryId };
      if (search) params.search = search;
      const res = await getProducts(params);
      setProducts(res.data.products);
    } catch {
      Toast.show({ type: 'error', text1: 'Failed to load products' });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [categoryId, search]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const handleDelete = async (id) => {
    try {
      await deleteProduct(id);
      Toast.show({ type: 'success', text1: 'Product deleted' });
      fetchProducts();
    } catch {
      Toast.show({ type: 'error', text1: 'Delete failed' });
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('ProductDetail', { id: item._id })}
    >
      <Image
        source={{ uri: item.images[0] || 'https://via.placeholder.com/150' }}
        style={styles.image}
      />
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
        {item.brand ? <Text style={styles.brand}>{item.brand}</Text> : null}
        <Text style={styles.price}>LKR {item.price.toFixed(2)}</Text>
        <View style={styles.ratingRow}>
          <Text style={styles.rating}>⭐ {item.averageRating.toFixed(1)}</Text>
          <Text style={styles.reviews}>({item.numReviews})</Text>
        </View>
        {/* Sizes available */}
        <View style={styles.sizesRow}>
          {item.sizes.filter(s => s.stock > 0).slice(0, 4).map(s => (
            <View key={s.size} style={styles.sizeChip}>
              <Text style={styles.sizeChipTxt}>{s.size}</Text>
            </View>
          ))}
          {item.sizes.filter(s => s.stock > 0).length === 0 && (
            <Text style={styles.outOfStock}>Out of stock</Text>
          )}
        </View>
      </View>
      {user?.role === 'admin' && (
        <View style={styles.adminBtns}>
          <TouchableOpacity onPress={() => navigation.navigate('ProductForm', { product: item })}>
            <Text style={{ fontSize: 18 }}>✏️</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleDelete(item._id)}>
            <Text style={{ fontSize: 18 }}>🗑️</Text>
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{categoryName}</Text>
        <Text style={styles.headerCount}>{products.length} items</Text>
      </View>

      {/* Search */}
      <TextInput
        style={styles.search}
        placeholder={`🔍 Search in ${categoryName}...`}
        value={search}
        onChangeText={setSearch}
        onSubmitEditing={fetchProducts}
      />

      {loading ? (
        <ActivityIndicator style={{ flex: 1 }} size="large" color="#6C63FF" />
      ) : (
        <FlatList
          data={products}
          keyExtractor={item => item._id}
          renderItem={renderItem}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => { setRefreshing(true); fetchProducts(); }}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Text style={styles.emptyIcon}>👕</Text>
              <Text style={styles.empty}>No products in {categoryName} yet</Text>
              {user?.role === 'admin' && (
                <TouchableOpacity
                  style={styles.addProductBtn}
                  onPress={() => navigation.navigate('ProductForm', {})}
                >
                  <Text style={styles.addProductBtnTxt}>+ Add Product</Text>
                </TouchableOpacity>
              )}
            </View>
          }
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { backgroundColor: '#6C63FF', padding: 16, paddingTop: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#fff' },
  headerCount: { fontSize: 13, color: '#e0dfff' },
  search: { backgroundColor: '#fff', margin: 12, borderRadius: 10, padding: 12, fontSize: 14, borderWidth: 1, borderColor: '#eee' },
  card: { flexDirection: 'row', backgroundColor: '#fff', marginHorizontal: 12, marginBottom: 10, borderRadius: 12, overflow: 'hidden', elevation: 2 },
  image: { width: 110, height: 120 },
  info: { flex: 1, padding: 10 },
  name: { fontSize: 15, fontWeight: '600', color: '#222' },
  brand: { fontSize: 11, color: '#888', marginTop: 1 },
  price: { fontSize: 16, color: '#6C63FF', fontWeight: '700', marginTop: 4 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 3 },
  rating: { fontSize: 12, color: '#F59E0B' },
  reviews: { fontSize: 11, color: '#aaa' },
  sizesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: 6 },
  sizeChip: { backgroundColor: '#f3f0ff', borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2 },
  sizeChipTxt: { fontSize: 10, color: '#6C63FF', fontWeight: '600' },
  outOfStock: { fontSize: 11, color: '#EF4444', fontWeight: '600' },
  adminBtns: { justifyContent: 'center', paddingRight: 10, gap: 10 },
  emptyBox: { alignItems: 'center', marginTop: 60 },
  emptyIcon: { fontSize: 60 },
  empty: { color: '#999', fontSize: 15, marginTop: 12, textAlign: 'center' },
  addProductBtn: { backgroundColor: '#6C63FF', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10, marginTop: 16 },
  addProductBtnTxt: { color: '#fff', fontWeight: '600' },
});