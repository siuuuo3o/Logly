import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useRecordStore } from '@/src/store/recordStore';
import { useTripStore } from '@/src/store/tripStore';
import { recordApi } from '@/src/api/record';
import { placeApi } from '@/src/api/place';
import AiWritingAssistant from '@/src/components/ai/AiWritingAssistant';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function RecordStep2Screen() {
  const router = useRouter();
  const { draft, resetDraft, fetchTimeline } = useRecordStore();
  const { trips, fetchTrips } = useTripStore();

  const [diaryTitle, setDiaryTitle] = useState('');
  const [content, setContent] = useState('');
  const [visibility, setVisibility] = useState<'PRIVATE' | 'SHARED'>('PRIVATE');
  const [selectedTripId, setSelectedTripId] = useState<number | null>(null);
  const [tripModalVisible, setTripModalVisible] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [aiEnabled, setAiEnabled] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem('logly_ai_settings').then((v) => {
      if (v) setAiEnabled(JSON.parse(v).enabled ?? true);
    });
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchTrips();
    }, [])
  );

  const handleSave = async () => {
    if (isSaving) return;
    setIsSaving(true);

    try {
      // 1. 장소 생성
      const placeRes = await placeApi.createPlace({
        name: draft.placeName,
        address: draft.placeAddress || draft.placeName,
        latitude: draft.latitude ?? 37.5665,
        longitude: draft.longitude ?? 126.978,
      });
      const placeId = placeRes.data.data.id;

      // 2. 기록 생성
      const recordRes = await recordApi.createRecord({
        placeId,
        categoryId: draft.categoryId ?? undefined,
        type: draft.type,
        content: content.trim() || undefined,
        diaryTitle: diaryTitle.trim() || undefined,
        weather: draft.weather ?? undefined,
        temperature: draft.temperature ?? undefined,
        visibility,
        recordedAt: draft.recordedAt,
        tripId: selectedTripId ?? undefined,
      });
      const recordId = recordRes.data.data.id;

      // 3. 이미지 업로드 (있을 경우)
      if (draft.images.length > 0) {
        const formData = new FormData();
        draft.images.forEach((uri, index) => {
          const fileName = uri.split('/').pop() ?? `image_${index}.jpg`;
          const fileType = fileName.endsWith('.png') ? 'image/png' : 'image/jpeg';
          formData.append('files', {
            uri,
            name: fileName,
            type: fileType,
          } as any);
        });
        await recordApi.uploadImages(recordId, formData);
      }

      // 4. 성공 처리
      resetDraft();
      await fetchTimeline(true);
      router.replace('/(tabs)/' as any);
    } catch (error) {
      console.error('기록 저장 실패:', error);
      Alert.alert('저장 실패', '기록을 저장하는 중 오류가 발생했습니다.\n다시 시도해주세요.');
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
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>{'←'}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>기록하기 ②</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* 미리보기 정보 */}
        <View style={styles.previewCard}>
          <Text style={styles.previewPlace}>📍 {draft.placeName || '장소 미설정'}</Text>
          <View style={styles.previewMeta}>
            <Text style={styles.previewMetaText}>{draft.recordedAt}</Text>
            <Text style={styles.previewMetaText}>
              {draft.type === 'DAILY' ? '일상' : '여행'}
            </Text>
            {draft.weather && (
              <Text style={styles.previewMetaText}>
                {draft.weather} {draft.temperature != null ? `${draft.temperature}°C` : ''}
              </Text>
            )}
            {draft.images.length > 0 && (
              <Text style={styles.previewMetaText}>사진 {draft.images.length}장</Text>
            )}
          </View>
        </View>

        {/* 일기 제목 */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>제목 <Text style={styles.optional}>(선택)</Text></Text>
          <TextInput
            style={styles.input}
            value={diaryTitle}
            onChangeText={setDiaryTitle}
            placeholder="오늘의 기록 제목"
            maxLength={100}
            returnKeyType="next"
          />
        </View>

        {/* 일기 내용 */}
        <View style={styles.section}>
          <View style={styles.sectionRow}>
            <Text style={styles.sectionLabel}>일기 <Text style={styles.optional}>(선택)</Text></Text>
            <Text style={styles.charCount}>{content.length}/1000</Text>
          </View>
          <TextInput
            style={styles.textArea}
            value={content}
            onChangeText={setContent}
            placeholder="오늘의 기록을 남겨보세요..."
            multiline
            maxLength={1000}
            textAlignVertical="top"
          />
        </View>

        {/* AI 글쓰기 도우미 */}
        {aiEnabled && (
          <AiWritingAssistant
            params={{
              placeName: draft.placeName,
              recordedAt: draft.recordedAt,
              weather: draft.weather ?? undefined,
              temperature: draft.temperature ?? undefined,
              type: draft.type,
              content,
            }}
            onInsertContent={(text) => setContent((prev) => prev ? prev + '\n' + text : text)}
            onInsertTitle={(t) => setDiaryTitle(t)}
          />
        )}

        {/* 공개 설정 */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>공개 설정</Text>
          <View style={styles.toggleRow}>
            {(['PRIVATE', 'SHARED'] as const).map((v) => (
              <TouchableOpacity
                key={v}
                style={[styles.toggleButton, visibility === v && styles.toggleButtonActive]}
                onPress={() => setVisibility(v)}
              >
                <Text style={[styles.toggleButtonText, visibility === v && styles.toggleButtonTextActive]}>
                  {v === 'PRIVATE' ? '🔒 나만 보기' : '👥 공유하기'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.visibilityHint}>
            {visibility === 'SHARED'
              ? '공유 그룹(커플/친구)에게 공개됩니다.'
              : '나만 볼 수 있는 기록입니다.'}
          </Text>
        </View>

        {/* 여행 앨범 연결 */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>여행 앨범 연결 <Text style={styles.optional}>(선택)</Text></Text>
          <TouchableOpacity
            style={styles.tripSelector}
            onPress={() => setTripModalVisible(true)}
          >
            {selectedTripId ? (
              <Text style={styles.tripSelectorText}>
                ✈️ {trips.find((t) => t.id === selectedTripId)?.title ?? '여행 선택'}
              </Text>
            ) : (
              <Text style={styles.tripSelectorPlaceholder}>여행을 선택하세요</Text>
            )}
            <Text style={styles.tripSelectorArrow}>›</Text>
          </TouchableOpacity>
          {selectedTripId && (
            <TouchableOpacity onPress={() => setSelectedTripId(null)}>
              <Text style={styles.tripClearText}>연결 해제</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      {/* 여행 선택 모달 */}
      <Modal
        visible={tripModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setTripModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>여행 앨범 선택</Text>
              <TouchableOpacity onPress={() => setTripModalVisible(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>
            {trips.length === 0 ? (
              <View style={styles.modalEmpty}>
                <Text style={styles.modalEmptyText}>아직 여행이 없어요</Text>
              </View>
            ) : (
              <ScrollView style={styles.modalList}>
                {trips.map((trip) => (
                  <TouchableOpacity
                    key={trip.id}
                    style={[
                      styles.modalItem,
                      selectedTripId === trip.id && styles.modalItemSelected,
                    ]}
                    onPress={() => {
                      setSelectedTripId(trip.id);
                      setTripModalVisible(false);
                    }}
                  >
                    <Text style={styles.modalItemTitle}>{trip.title}</Text>
                    {(trip.startDate || trip.endDate) && (
                      <Text style={styles.modalItemDate}>
                        {trip.startDate} – {trip.endDate}
                      </Text>
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* 저장 버튼 */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={isSaving}
        >
          {isSaving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveButtonText}>저장하기</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafafa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 56,
    paddingBottom: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backText: {
    fontSize: 22,
    color: '#222',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 17,
    fontWeight: '700',
    color: '#222',
  },
  headerRight: {
    width: 36,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    gap: 24,
    paddingBottom: 40,
  },
  previewCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e8e8e8',
    gap: 6,
  },
  previewPlace: {
    fontSize: 15,
    fontWeight: '700',
    color: '#333',
  },
  previewMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  previewMetaText: {
    fontSize: 12,
    color: '#888',
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
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
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 14,
    color: '#222',
  },
  textArea: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: '#222',
    minHeight: 160,
    lineHeight: 22,
  },
  toggleRow: {
    flexDirection: 'row',
    gap: 10,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  toggleButtonActive: {
    backgroundColor: '#222',
    borderColor: '#222',
  },
  toggleButtonText: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  toggleButtonTextActive: {
    color: '#fff',
    fontWeight: '700',
  },
  visibilityHint: {
    fontSize: 12,
    color: '#aaa',
    marginTop: 2,
  },
  tripSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8f8f8',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  tripSelectorText: {
    fontSize: 14,
    color: '#222',
    fontWeight: '500',
  },
  tripSelectorPlaceholder: {
    fontSize: 14,
    color: '#bbb',
  },
  tripSelectorArrow: {
    fontSize: 18,
    color: '#bbb',
  },
  tripClearText: {
    fontSize: 12,
    color: '#ff6666',
    textAlign: 'right',
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 16,
    maxHeight: '60%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#222',
  },
  modalClose: {
    fontSize: 18,
    color: '#888',
    padding: 4,
  },
  modalEmpty: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  modalEmptyText: {
    fontSize: 14,
    color: '#aaa',
  },
  modalList: {
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  modalItem: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
    gap: 3,
  },
  modalItemSelected: {
    backgroundColor: '#f8f8f8',
    marginHorizontal: -8,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  modalItemTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#222',
  },
  modalItemDate: {
    fontSize: 12,
    color: '#aaa',
  },
  footer: {
    padding: 16,
    paddingBottom: 32,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  saveButton: {
    backgroundColor: '#222',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: '#888',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
