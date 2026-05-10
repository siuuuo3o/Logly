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
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import { useTripStore } from '@/src/store/tripStore';

function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export default function TripCreateScreen() {
  const router = useRouter();
  const { createTrip } = useTripStore();

  const [title, setTitle] = useState('');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [pickerTarget, setPickerTarget] = useState<'start' | 'end' | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handlePickerChange = (event: DateTimePickerEvent, selected?: Date) => {
    if (Platform.OS === 'android') {
      setPickerTarget(null);
    }
    if (event.type === 'dismissed' || !selected) return;

    if (pickerTarget === 'start') {
      setStartDate(selected);
      if (endDate && selected > endDate) setEndDate(null);
    } else if (pickerTarget === 'end') {
      if (startDate && selected < startDate) {
        Alert.alert('날짜 오류', '종료일은 시작일보다 이후여야 해요.');
        return;
      }
      setEndDate(selected);
    }

    if (Platform.OS === 'ios') {
      setPickerTarget(null);
    }
  };

  const handleCreate = async () => {
    if (!title.trim()) {
      Alert.alert('오류', '여행 제목을 입력해주세요.');
      return;
    }
    if (isSaving) return;
    setIsSaving(true);

    try {
      const trip = await createTrip(
        title.trim(),
        startDate ? formatDate(startDate) : undefined,
        endDate ? formatDate(endDate) : undefined,
      );
      router.replace(`/trip/${trip.id}` as any);
    } catch (error) {
      console.error('여행 생성 실패:', error);
      Alert.alert('오류', '여행을 생성하는 중 문제가 발생했습니다.');
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
          <Text style={styles.backText}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>새 여행 만들기</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* 제목 */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>여행 제목 <Text style={styles.required}>*</Text></Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="예: 제주도 여행, 부산 겨울 바다"
            maxLength={50}
            returnKeyType="done"
          />
        </View>

        {/* 날짜 선택 */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>여행 기간 <Text style={styles.optional}>(선택)</Text></Text>
          <View style={styles.dateRow}>
            {/* 시작일 */}
            <TouchableOpacity
              style={[styles.datePicker, pickerTarget === 'start' && styles.datePickerActive]}
              onPress={() => setPickerTarget(pickerTarget === 'start' ? null : 'start')}
            >
              <Text style={styles.datePickerIcon}>📅</Text>
              <View>
                <Text style={styles.datePickerSub}>시작일</Text>
                <Text style={[styles.datePickerValue, !startDate && styles.datePickerPlaceholder]}>
                  {startDate ? formatDate(startDate) : '날짜 선택'}
                </Text>
              </View>
            </TouchableOpacity>

            <Text style={styles.dateSeparator}>→</Text>

            {/* 종료일 */}
            <TouchableOpacity
              style={[styles.datePicker, pickerTarget === 'end' && styles.datePickerActive]}
              onPress={() => setPickerTarget(pickerTarget === 'end' ? null : 'end')}
            >
              <Text style={styles.datePickerIcon}>📅</Text>
              <View>
                <Text style={styles.datePickerSub}>종료일</Text>
                <Text style={[styles.datePickerValue, !endDate && styles.datePickerPlaceholder]}>
                  {endDate ? formatDate(endDate) : '날짜 선택'}
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* DateTimePicker */}
          {pickerTarget !== null && (
            Platform.OS === 'ios' ? (
              <View style={styles.calendarWrapper}>
                <DateTimePicker
                  value={
                    pickerTarget === 'start'
                      ? (startDate ?? new Date())
                      : (endDate ?? startDate ?? new Date())
                  }
                  mode="date"
                  display="spinner"
                  onChange={handlePickerChange}
                  minimumDate={pickerTarget === 'end' && startDate ? startDate : undefined}
                  locale="ko-KR"
                  textColor="#222222"
                  themeVariant="light"
                  style={styles.datePicker_component}
                />
              </View>
            ) : (
              <DateTimePicker
                value={
                  pickerTarget === 'start'
                    ? (startDate ?? new Date())
                    : (endDate ?? startDate ?? new Date())
                }
                mode="date"
                display="default"
                onChange={handlePickerChange}
                minimumDate={pickerTarget === 'end' && startDate ? startDate : undefined}
              />
            )
          )}
        </View>

        <Text style={styles.hint}>
          💡 여행 중 기록을 이 앨범에 연결하면 사진·일기를 한눈에 볼 수 있어요.
        </Text>
      </ScrollView>

      {/* 저장 버튼 */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.saveButton, (!title.trim() || isSaving) && styles.saveButtonDisabled]}
          onPress={handleCreate}
          disabled={!title.trim() || isSaving}
        >
          {isSaving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveButtonText}>여행 만들기</Text>
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
    fontSize: 20,
    color: '#555',
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
  section: {
    gap: 10,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333',
  },
  required: {
    color: '#ff4444',
  },
  optional: {
    fontSize: 12,
    fontWeight: '400',
    color: '#aaa',
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 15,
    color: '#222',
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  datePicker: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  datePickerActive: {
    borderColor: '#222',
    backgroundColor: '#f8f8f8',
  },
  datePickerIcon: {
    fontSize: 16,
  },
  datePickerSub: {
    fontSize: 10,
    color: '#aaa',
    marginBottom: 1,
  },
  datePickerValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#222',
  },
  datePickerPlaceholder: {
    color: '#bbb',
    fontWeight: '400',
  },
  dateSeparator: {
    fontSize: 16,
    color: '#bbb',
  },
  calendarWrapper: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e8e8e8',
    height: 180,
    overflow: 'hidden',
    justifyContent: 'center',
  },
  datePicker_component: {
    width: '100%',
    height: 180,
  },
  hint: {
    fontSize: 12,
    color: '#aaa',
    lineHeight: 18,
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
    backgroundColor: '#bbb',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
