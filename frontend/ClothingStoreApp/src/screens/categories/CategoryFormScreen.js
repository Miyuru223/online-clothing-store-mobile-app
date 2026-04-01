import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, ActivityIndicator, ScrollView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import Toast from 'react-native-toast-message';
import { createCategory, updateCategory } from '../../api';

const GENDERS = ['Men', 'Women', 'Kids', 'Unisex'];

export default function CategoryFormScreen({ route, navigation }) {
  const existing = route.params?.category;
  const [name, setName] = useState(existing?.name || '');
  const [description, setDescription] = useState(existing?.description || '');
  const [gender, setGender] = useState(existing?.gender || '');
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.7 });
    if (!result.canceled) setImage(result.assets[0].uri);
  };

  const handleSubmit = async () => {
    if (!name || !gender) return Toast.show({ type: 'error', text1: 'Name and gender are required' });
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('description', description);
      formData.append('gender', gender);
      if (image) formData.append('image', { uri: image, name: 'category.jpg', type: 'image/jpeg' });

      if (existing) await updateCategory(existing._id, formData);
      else await createCategory(formData);

      Toast.show({ type: 'success', text1: existing ? 'Category updated!' : 'Category created!' });
      navigation.goBack();
    } catch (err) {
      Toast.show({ type: 'error', text1: err.response?.data?.message || 'Failed to save category' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <Text style={styles.label}>Category Name *</Text>
      <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="e.g. T-Shirts" />

      <Text style={styles.label}>Description</Text>
      <TextInput style={[styles.input, { height: 80 }]} value={description} onChangeText={setDescription} multiline placeholder="Short description..." />

      <Text style={styles.label}>Gender *</Text>
      <View style={styles.genderRow}>
        {GENDERS.map(g => (
          <TouchableOpacity key={g} style={[styles.chip, gender === g && styles.chipActive]} onPress={() => setGender(g)}>
            <Text style={[styles.chipTxt, gender === g && styles.chipTxtActive]}>{g}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Category Image</Text>
      <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
        <Text style={styles.imagePickerTxt}>📷 Pick Image</Text>
      </TouchableOpacity>
      {image && <Image source={{ uri: image }} style={styles.preview} />}

      <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitTxt}>{existing ? 'Update Category' : 'Create Category'}</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  label: { fontSize: 13, fontWeight: '600', color: '#555', marginBottom: 6, marginTop: 14 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 10, padding: 12, fontSize: 15, backgroundColor: '#fafafa' },
  genderRow: { flexDirection: 'row', gap: 10, flexWrap: 'wrap', marginBottom: 8 },
  chip: { borderWidth: 1, borderColor: '#ddd', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8 },
  chipActive: { backgroundColor: '#6C63FF', borderColor: '#6C63FF' },
  chipTxt: { fontSize: 14, color: '#555' },
  chipTxtActive: { color: '#fff' },
  imagePicker: { borderWidth: 1.5, borderColor: '#6C63FF', borderRadius: 10, borderStyle: 'dashed', padding: 14, alignItems: 'center', marginBottom: 10 },
  imagePickerTxt: { color: '#6C63FF', fontWeight: '600' },
  preview: { width: '100%', height: 180, borderRadius: 10, marginBottom: 16 },
  submitBtn: { backgroundColor: '#6C63FF', padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 10 },
  submitTxt: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
