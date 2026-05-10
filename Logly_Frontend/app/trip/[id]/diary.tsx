import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { placeApi } from '@/src/api/place';
import { recordApi } from '@/src/api/record';
import { useTripStore } from '@/src/store/tripStore';

export default function TripDiaryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { fetchTripDetail } = useTripStore();

  const [diaryTitle, setDiaryTitle] = useState('');
  const [content, setContent] = useState('');
  const [placeName, setPlaceName] = useState('');
  const [recordedAt, setRecordedAt] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!content.trim()) {
      Alert.alert('오류', '일기 내용을 입력해주세요.');
      return;
    }
    if (isSaving) return;
    setIsSaving(true);

    try {
      // 장소 생성 (이름만 입력한 경우 간단 처리)
      const placeRes = await placeApi.createPlace({
        name: placeName.trim() || '여행지',
        address: placeName.trim() || '여행지',
        latitude: 37.5665,
        longitude: 126.978,
      });
      const placeId = placeRes.data.data.id;

      // 기록 생성 (여행 연결 포함)
      await recordApi.createRecord({
        placeId,
        type: 'TRAVEL',
        content: content.trim(),
        diaryTitle: diaryTitle.trim() || undefined,
        visibility: 'PRIVATE',
        recordedAt,
        tripId: Number(id),
      });

      // 여행 상세 갱신
      await fetchTripDetail(Number(id));

      router.back();
    } catch (error) {
      console.error('일기 저장 실패:', error);
      Alert.alert('오류', '일기를 저장하는 중 문제가 발생했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => router.back()}
        >
          <Text style={styles.cancelText}>취소</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>✏️ 여행 일기</Text>
        <TouchableOpacity
          style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={isSaving}
        >
          {isSaving ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.saveButtonText}>저장</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* 날짜 + 장소 */}
        <View style={styles.metaRow}>
          <TextInput
            style={[styles.metaInput, styles.dateInput]}
            value={recordedAt}
            onChangeText={setRecordedAt}
            placeholder="날짜 (YYYY-MM-DD)"
            maxLength={10}
          />
          <TextInput
            style={[styles.metaInput, { flex: 1 }]}
            value={placeName}
            onChangeText={setPlaceName}
            placeholder="📍 장소"
            maxLength={50}
          />
        </View>

        {/* 제목 */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>제목 <Text style={styles.optional}>(선택)</Text></Text>
          <TextInput
            style={styles.input}
            value={diaryTitle}
            onChangeText={setDiaryTitle}
            placeholder="일기 제목을 입력하세요"
            maxLength={100}
            returnKeyType="next"
          />
        </View>

        {/* 본문 */}
        <View style={styles.section}>
          <View style={styles.sectionRow}>
            <Text style={styles.sectionLabel}>본문</Text>
            <Text style={styles.charCount}>{content.length}/2000</Text>
          </View>
          <TextInput
            style={styles.textArea}
            value={content}
            onChangeText={setContent}
            placeholder="오늘의 이야기를 자유롭게 써보세요..."
            multiline
            maxLength={2000}
            textAlignVertical="top"
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 56,
    paddingBottom: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  cancelButton: {
    paddingHorizontal: 4,
    paddingVertical: 6,
  },
  cancelText: {
    fontSize: 15,
    color: '#666',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#222',
  },
  saveButton: {
    backgroundColor: '#222',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 8,
    minWidth: 52,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: '#888',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    gap: 24,
    paddingBottom: 40,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 10,
  },
  metaInput: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 13,
    color: '#333',
  },
  dateInput: {
    width: 130,
  },
  section: {
    gap: 8,
  },
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333',
  },
  optional: {
    fontSize: 12,
    fontWeight: '400',
    color: '#aaa',
  },
  charCount: {
    fontSize: 12,
    color: '#aaa',
  },
  input: {
    backgroundColor: '#fafafa',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 15,
    color: '#222',
  },
  textArea: {
    backgroundColor: '#fafafa',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#222',
    minHeight: 260,
    lineHeight: 24,
  },
});
