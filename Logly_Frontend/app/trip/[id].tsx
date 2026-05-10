import { useCallback, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;
const IMAGE_SIZE = (SCREEN_WIDTH - 6) / 3;
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { useTripStore } from '@/src/store/tripStore';
import { RecordItem } from '@/src/api/record';

type TabKey = '사진' | '일기' | '코스';
const TABS: TabKey[] = ['사진', '일기', '코스'];

function PhotoGrid({ records }: { records: RecordItem[] }) {
  const allImages = records.flatMap((r) => r.images ?? []);
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);
  const flatListRef = useRef<FlatList>(null);

  if (allImages.length === 0) {
    return (
      <View style={styles.emptyTab}>
        <Text style={styles.emptyTabText}>아직 사진이 없어요</Text>
      </View>
    );
  }

  const current = viewerIndex ?? 0;

  return (
    <>
      <FlatList
        data={allImages}
        keyExtractor={(img) => String(img.id)}
        numColumns={3}
        renderItem={({ item, index }) => (
          <TouchableOpacity onPress={() => setViewerIndex(index)}>
            <Image source={{ uri: item.imageUrl }} style={styles.gridImage} />
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.photoGrid}
        showsVerticalScrollIndicator={false}
      />

      <Modal
        visible={viewerIndex !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setViewerIndex(null)}
      >
        <View style={styles.viewerOverlay}>
          {/* 닫기 */}
          <TouchableOpacity style={styles.viewerClose} onPress={() => setViewerIndex(null)}>
            <Text style={styles.viewerCloseText}>✕</Text>
          </TouchableOpacity>

          {/* 카운터 */}
          <Text style={styles.viewerCounter}>{current + 1} / {allImages.length}</Text>

          {/* 이미지 */}
          <FlatList
            ref={flatListRef}
            data={allImages}
            keyExtractor={(img) => String(img.id)}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            initialScrollIndex={current}
            getItemLayout={(_, index) => ({ length: SCREEN_WIDTH, offset: SCREEN_WIDTH * index, index })}
            onMomentumScrollEnd={(e) => {
              const index = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
              setViewerIndex(index);
            }}
            renderItem={({ item }) => (
              <View style={styles.viewerImageContainer}>
                <Image
                  source={{ uri: item.imageUrl }}
                  style={styles.viewerImage}
                  resizeMode="contain"
                />
              </View>
            )}
          />

          {/* 이전 / 다음 버튼 */}
          {current > 0 && (
            <TouchableOpacity
              style={[styles.viewerNav, styles.viewerNavLeft]}
              onPress={() => {
                flatListRef.current?.scrollToIndex({ index: current - 1, animated: true });
                setViewerIndex(current - 1);
              }}
            >
              <Text style={styles.viewerNavText}>‹</Text>
            </TouchableOpacity>
          )}
          {current < allImages.length - 1 && (
            <TouchableOpacity
              style={[styles.viewerNav, styles.viewerNavRight]}
              onPress={() => {
                flatListRef.current?.scrollToIndex({ index: current + 1, animated: true });
                setViewerIndex(current + 1);
              }}
            >
              <Text style={styles.viewerNavText}>›</Text>
            </TouchableOpacity>
          )}
        </View>
      </Modal>
    </>
  );
}

function DiaryList({ records, onWrite, tripId }: { records: RecordItem[]; onWrite: () => void; tripId: number }) {
  const router = useRouter();
  const diaryRecords = records.filter((r) => r.content);

  return (
    <View style={styles.diaryContainer}>
      <View style={styles.diaryHeader}>
        <Text style={styles.diaryHeaderTitle}>✏️ 여행 일기</Text>
        <TouchableOpacity style={styles.writeButton} onPress={onWrite}>
          <Text style={styles.writeButtonText}>+ 작성</Text>
        </TouchableOpacity>
      </View>
      {diaryRecords.length === 0 ? (
        <View style={styles.emptyTab}>
          <Text style={styles.emptyTabText}>아직 일기가 없어요</Text>
          <TouchableOpacity style={styles.writeButtonLarge} onPress={onWrite}>
            <Text style={styles.writeButtonLargeText}>첫 일기 작성하기</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          {diaryRecords.map((r) => (
            <TouchableOpacity
              key={r.id}
              style={styles.diaryCard}
              onPress={() => router.push(`/record/${r.id}` as any)}
            >
              <Text style={styles.diaryIcon}>📝</Text>
              <View style={styles.diaryCardBody}>
                <Text style={styles.diaryCardTitle} numberOfLines={1}>
                  {r.diaryTitle || r.place?.name || r.recordedAt}
                </Text>
                <Text style={styles.diaryCardDate}>
                  {r.recordedAt}
                  {r.place?.name ? ` · ${r.place.name}` : ''}
                </Text>
                <Text style={styles.diaryCardContent} numberOfLines={2}>{r.content}</Text>
              </View>
              {r.images[0] && (
                <Image source={{ uri: r.images[0].imageUrl }} style={styles.diaryThumb} />
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

function CourseList({ records }: { records: RecordItem[] }) {
  if (records.length === 0) {
    return (
      <View style={styles.emptyTab}>
        <Text style={styles.emptyTabText}>기록이 없어요</Text>
      </View>
    );
  }

  const sorted = [...records].sort((a, b) =>
    a.recordedAt.localeCompare(b.recordedAt)
  );

  return (
    <ScrollView style={styles.courseContainer} showsVerticalScrollIndicator={false}>
      {sorted.map((r, index) => (
        <View key={r.id} style={styles.courseItem}>
          <View style={styles.courseLineContainer}>
            <View style={[styles.courseDot, index === 0 && styles.courseDotFirst]} />
            {index < sorted.length - 1 && <View style={styles.courseLine} />}
          </View>
          <View style={styles.courseContent}>
            <Text style={styles.courseDate}>{r.recordedAt}</Text>
            <Text style={styles.coursePlaceName}>{r.place?.name ?? '장소 없음'}</Text>
            {r.images[0] && (
              <Image source={{ uri: r.images[0].imageUrl }} style={styles.courseImage} />
            )}
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

export default function TripDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { currentTrip, isLoading, fetchTripDetail, deleteTrip, clearCurrentTrip } = useTripStore();
  const [activeTab, setActiveTab] = useState<TabKey>('사진');

  useFocusEffect(
    useCallback(() => {
      if (id) fetchTripDetail(Number(id));
      return () => clearCurrentTrip();
    }, [id])
  );

  const handleDelete = () => {
    Alert.alert('여행 삭제', '이 여행을 삭제하면 기록 연결이 해제됩니다. 계속할까요?', [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteTrip(Number(id));
            router.back();
          } catch {
            Alert.alert('오류', '삭제 중 문제가 발생했습니다.');
          }
        },
      },
    ]);
  };

  if (isLoading || !currentTrip) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#222" />
      </View>
    );
  }

  const trip = currentTrip;

  return (
    <View style={styles.container}>
      {/* 커버 영역 */}
      <View style={styles.coverSection}>
        {trip.coverImageUrl ? (
          <Image source={{ uri: trip.coverImageUrl }} style={styles.coverImage} />
        ) : (
          <View style={[styles.coverImage, styles.coverPlaceholder]} />
        )}
        <View style={styles.coverOverlay} />
        <View style={styles.coverInfo}>
          <Text style={styles.coverTitle} numberOfLines={1}>{trip.title}</Text>
          <Text style={styles.coverMeta}>
            {trip.startDate ?? '?'} – {trip.endDate ?? '?'} · 기록 {trip.recordCount}개 · 일기 {trip.diaryCount}개
          </Text>
        </View>
        {/* 뒤로가기 */}
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>←</Text>
        </TouchableOpacity>
        {/* 삭제 버튼 */}
        <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
          <Text style={styles.deleteBtnText}>🗑</Text>
        </TouchableOpacity>
      </View>

      {/* 탭 */}
      <View style={styles.tabBar}>
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* 탭 컨텐츠 */}
      <View style={styles.tabContent}>
        {activeTab === '사진' && <PhotoGrid records={trip.records} />}
        {activeTab === '일기' && (
          <DiaryList
            records={trip.records}
            tripId={trip.id}
            onWrite={() => router.push(`/trip/${trip.id}/diary` as any)}
          />
        )}
        {activeTab === '코스' && <CourseList records={trip.records} />}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafafa',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  coverSection: {
    position: 'relative',
    height: 180,
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  coverPlaceholder: {
    backgroundColor: '#ccc',
  },
  coverOverlay: {
    position: 'absolute',
    inset: 0,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  coverInfo: {
    position: 'absolute',
    bottom: 14,
    left: 16,
    right: 60,
    gap: 4,
  },
  coverTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  coverMeta: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.8)',
  },
  backBtn: {
    position: 'absolute',
    top: 50,
    left: 14,
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backBtnText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  deleteBtn: {
    position: 'absolute',
    top: 50,
    right: 14,
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteBtnText: {
    fontSize: 16,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: '#222',
  },
  tabText: {
    fontSize: 13,
    color: '#aaa',
    fontWeight: '500',
  },
  tabTextActive: {
    color: '#222',
    fontWeight: '700',
  },
  tabContent: {
    flex: 1,
  },
  // 사진 탭
  photoGrid: {
    padding: 2,
    paddingBottom: 80,
  },
  gridImage: {
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
    margin: 1,
    borderRadius: 2,
  },
  // 일기 탭
  diaryContainer: {
    flex: 1,
    padding: 14,
  },
  diaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  diaryHeaderTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333',
  },
  writeButton: {
    backgroundColor: '#222',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  writeButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  diaryCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  diaryIcon: {
    fontSize: 18,
    marginTop: 2,
  },
  diaryCardBody: {
    flex: 1,
    gap: 3,
  },
  diaryCardTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#222',
  },
  diaryCardDate: {
    fontSize: 11,
    color: '#aaa',
  },
  diaryCardContent: {
    fontSize: 12,
    color: '#666',
    lineHeight: 17,
  },
  diaryThumb: {
    width: 52,
    height: 52,
    borderRadius: 6,
  },
  writeButtonLarge: {
    backgroundColor: '#222',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
    marginTop: 12,
  },
  writeButtonLargeText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  // 코스 탭
  courseContainer: {
    flex: 1,
    padding: 16,
    paddingBottom: 80,
  },
  courseItem: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 4,
  },
  courseLineContainer: {
    alignItems: 'center',
    width: 20,
  },
  courseDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#ffaa44',
    marginTop: 3,
  },
  courseDotFirst: {
    backgroundColor: '#222',
  },
  courseLine: {
    flex: 1,
    width: 2,
    backgroundColor: '#ddd',
    marginVertical: 4,
    minHeight: 32,
  },
  courseContent: {
    flex: 1,
    paddingBottom: 16,
    gap: 4,
  },
  courseDate: {
    fontSize: 11,
    color: '#aaa',
  },
  coursePlaceName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#222',
  },
  courseImage: {
    width: '100%',
    height: 100,
    borderRadius: 8,
    marginTop: 4,
  },
  // 공통 empty
  emptyTab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingTop: 60,
  },
  emptyTabText: {
    fontSize: 14,
    color: '#aaa',
  },
  // 사진 뷰어
  viewerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.95)',
    justifyContent: 'center',
  },
  viewerClose: {
    position: 'absolute',
    top: 54,
    right: 20,
    zIndex: 10,
    padding: 8,
  },
  viewerCloseText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '300',
  },
  viewerCounter: {
    position: 'absolute',
    top: 60,
    alignSelf: 'center',
    color: '#fff',
    fontSize: 14,
    zIndex: 10,
  },
  viewerImageContainer: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewerImage: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT * 0.8,
  },
  viewerNav: {
    position: 'absolute',
    top: '50%',
    marginTop: -28,
    width: 48,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 8,
  },
  viewerNavLeft: {
    left: 12,
  },
  viewerNavRight: {
    right: 12,
  },
  viewerNavText: {
    color: '#fff',
    fontSize: 36,
    fontWeight: '300',
    lineHeight: 40,
  },
});
