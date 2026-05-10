import { useState } from 'react';
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useAuthStore } from '@/src/store/authStore';

export default function ProfileEditScreen() {
  const router = useRouter();
  const { nickname, profileImageUrl, updateProfile } = useAuthStore();

  const [newNickname, setNewNickname] = useState(nickname ?? '');
  const [selectedImage, setSelectedImage] = useState<{ uri: string; name: string; type: string } | null>(null);
  const [previewUri, setPreviewUri] = useState<string | null>(profileImageUrl ?? null);
  const [saving, setSaving] = useState(false);

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      const name = asset.uri.split('/').pop() ?? 'profile.jpg';
      const type = asset.mimeType ?? 'image/jpeg';
      setSelectedImage({ uri: asset.uri, name, type });
      setPreviewUri(asset.uri);
    }
  };

  const handleSave = async () => {
    if (!newNickname.trim()) {
      Alert.alert('오류', '닉네임을 입력해주세요.');
      return;
    }
    try {
      setSaving(true);
      await updateProfile(
        newNickname !== nickname ? newNickname : undefined,
        selectedImage ?? undefined,
      );
      router.back();
    } catch {
      Alert.alert('오류', '프로필 저장에 실패했어요.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.headerCancel}>취소</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>프로필 수정</Text>
        <TouchableOpacity onPress={handleSave} disabled={saving}>
          <Text style={[styles.headerSave, saving && styles.disabled]}>저장</Text>
        </TouchableOpacity>
      </View>

      {/* 프로필 이미지 */}
      <View style={styles.avatarSection}>
        <TouchableOpacity onPress={handlePickImage}>
          {previewUri ? (
            <Image source={{ uri: previewUri }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarFallback} />
          )}
          <View style={styles.avatarEditBadge}>
            <Text style={styles.avatarEditIcon}>📷</Text>
          </View>
        </TouchableOpacity>
        <Text style={styles.avatarHint}>사진 변경</Text>
      </View>

      {/* 닉네임 */}
      <View style={styles.field}>
        <Text style={styles.fieldLabel}>닉네임</Text>
        <TextInput
          style={styles.input}
          value={newNickname}
          onChangeText={setNewNickname}
          placeholder="닉네임을 입력하세요"
          maxLength={20}
        />
        <Text style={styles.inputCount}>{newNickname.length} / 20</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafafa',
  },
  content: {
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#222',
  },
  headerCancel: {
    fontSize: 14,
    color: '#888',
  },
  headerSave: {
    fontSize: 14,
    fontWeight: '700',
    color: '#222',
  },
  disabled: {
    opacity: 0.4,
  },
  avatarSection: {
    alignItems: 'center',
    paddingVertical: 32,
    backgroundColor: '#fff',
    marginBottom: 8,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
  },
  avatarFallback: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#d0d0d0',
  },
  avatarEditBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#222',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarEditIcon: {
    fontSize: 14,
  },
  avatarHint: {
    marginTop: 10,
    fontSize: 12,
    color: '#aaa',
  },
  field: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 8,
  },
  fieldLabel: {
    fontSize: 12,
    color: '#888',
    marginBottom: 8,
  },
  input: {
    fontSize: 16,
    color: '#222',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingVertical: 8,
  },
  inputCount: {
    fontSize: 11,
    color: '#bbb',
    textAlign: 'right',
    marginTop: 4,
  },
});
