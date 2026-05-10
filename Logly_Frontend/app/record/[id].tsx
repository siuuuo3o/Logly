import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { recordApi, RecordItem } from '@/src/api/record';
import { useRecordStore } from '@/src/store/recordStore';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const TYPE_LABEL: Record<string, string> = {
  DAILY: '일상',
  TRAVEL: '여행',
};

const VISIBILITY_LABEL: Record<string, string> = {
  PRIVATE: '🔒 나만 보기',
  SHARED: '👥 공유',
};

export default function RecordDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { fetchTimeline } = useRecordStore();

  const [record, setRecord] = useState<RecordItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!id) return;
    loadRecord();
  }, [id]);

  const loadRecord = async () => {
    setIsLoading(true);
    try {
      const { data } = await recordApi.getRecord(Number(id));
      setRecord(data.data);
    } catch (error) {
      console.error('기록 조회 실패:', error);
      Alert.alert('오류', '기록을 불러올 수 없습니다.', [
        { text: '확인', onPress: () => router.back() },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert('기록 삭제', '이 기록을 삭제하시겠어요?\n삭제한 기록은 복구할 수 없습니다.', [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제',
        style: 'destructive',
        onPress: async () => {
          if (!record) return;
          setIsDeleting(true);
          try {
            await recordApi.deleteRecord(record.id);
            await fetchTimeline(true);
            router.back();
          } catch {
            Alert.alert('삭제 실패', '기록을 삭제하는 중 오류가 발생했습니다.');
          } finally {
            setIsDeleting(false);
          }
        },
      },
    ]);
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#888" />
      </View>
    );
  }

  if (!record) return null;

  return (
    <View style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>{'←'}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {record.diaryTitle ?? record.place?.name ?? '기록'}
        </Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <ActivityIndicator size="small" color="#e44" />
            ) : (
              <Text style={styles.deleteButtonText}>삭제</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* 이미지 슬라이드 */}
        {record.images.length > 0 && (
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            style={styles.imageSlider}
          >
            {record.images.map((img) => (
              <Image
                key={img.id}
                source={{ uri: img.imageUrl }}
                style={styles.sliderImage}
                resizeMode="cover"
              />
            ))}
          </ScrollView>
        )}

        <View style={styles.body}>
          {/* 메타 정보 */}
          <View style={styles.metaRow}>
            <View style={[styles.typeTag, record.type === 'TRAVEL' ? styles.typeTagTravel : styles.typeTagDaily]}>
              <Text style={styles.typeTagText}>{TYPE_LABEL[record.type]}</Text>
            </View>
            {record.category && (
              <View style={[styles.categoryTag, { backgroundColor: record.category.color + '22', borderColor: record.category.color }]}>
                {record.category.icon ? (
                  <Text style={styles.categoryTagIcon}>{record.category.icon}</Text>
                ) : (
                  <View style={[styles.categoryTagDot, { backgroundColor: record.category.color }]} />
                )}
                <Text style={[styles.categoryTagText, { color: record.category.color }]}>{record.category.name}</Text>
              </View>
            )}
            <Text style={styles.metaText}>{record.recordedAt.slice(0, 10)}</Text>
            <Text style={styles.metaText}>{VISIBILITY_LABEL[record.visibility]}</Text>
          </View>

          {/* 장소 */}
          {record.place && (
            <View style={styles.placeRow}>
              <Text style={styles.placeIcon}>📍</Text>
              <View>
                <Text style={styles.placeName}>{record.place.name}</Text>
                <Text style={styles.placeAddress}>{record.place.address}</Text>
              </View>
            </View>
          )}

          {/* 날씨 */}
          {record.weather && (
            <View style={styles.weatherRow}>
              <Text style={styles.weatherLabel}>날씨</Text>
              <Text style={styles.weatherValue}>
                {record.weather}
                {record.temperature != null ? `  ${record.temperature}°C` : ''}
              </Text>
            </View>
          )}

          {/* 구분선 */}
          <View style={styles.divider} />

          {/* 일기 제목 */}
          {record.diaryTitle ? (
            <Text style={styles.diaryTitle}>{record.diaryTitle}</Text>
          ) : null}

          {/* 일기 내용 */}
          {record.content ? (
            <Text style={styles.content}>{record.content}</Text>
          ) : (
            <Text style={styles.noContent}>작성된 내용이 없습니다.</Text>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafafa',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
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
    marginHorizontal: 8,
  },
  headerActions: {
    width: 36,
    alignItems: 'flex-end',
  },
  deleteButton: {
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
  deleteButtonText: {
    fontSize: 14,
    color: '#e44',
    fontWeight: '600',
  },
  scroll: {
    flex: 1,
  },
  imageSlider: {
    backgroundColor: '#111',
  },
  sliderImage: {
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH * 0.75,
  },
  body: {
    padding: 20,
    gap: 16,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  typeTag: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
  typeTagDaily: {
    backgroundColor: '#eee',
  },
  typeTagTravel: {
    backgroundColor: '#d4edff',
  },
  typeTagText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#444',
  },
  metaText: {
    fontSize: 13,
    color: '#888',
  },
  placeRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e8e8e8',
  },
  placeIcon: {
    fontSize: 18,
    marginTop: 1,
  },
  placeName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#222',
  },
  placeAddress: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  categoryTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
  },
  categoryTagIcon: {
    fontSize: 11,
  },
  categoryTagDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  categoryTagText: {
    fontSize: 12,
    fontWeight: '600',
  },
  weatherRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  weatherLabel: {
    fontSize: 13,
    color: '#999',
    fontWeight: '600',
  },
  weatherValue: {
    fontSize: 14,
    color: '#555',
  },
  divider: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginVertical: 4,
  },
  diaryTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111',
    lineHeight: 28,
  },
  content: {
    fontSize: 15,
    color: '#444',
    lineHeight: 24,
  },
  noContent: {
    fontSize: 14,
    color: '#bbb',
    textAlign: 'center',
    paddingVertical: 24,
  },
});
