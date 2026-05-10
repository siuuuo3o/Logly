import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/src/store/authStore';
import { useRecordStore } from '@/src/store/recordStore';
import { useShareStore } from '@/src/store/shareStore';
import { RecordItem } from '@/src/api/record';

const TYPE_LABEL: Record<string, string> = {
  DAILY: '일상',
  TRAVEL: '여행',
};

const WEATHER_EMOJI: Record<string, string> = {
  Clear: '☀️',
  Clouds: '☁️',
  Rain: '🌧️',
  Snow: '❄️',
  Thunderstorm: '⛈️',
  Drizzle: '🌦️',
  Mist: '🌫️',
};

type RecordCardProps = {
  item: RecordItem;
  onPress: () => void;
  memberNickname?: string;
};

function RecordCard({ item, onPress, memberNickname }: RecordCardProps) {
  const thumbnails = item.images.slice(0, 3);
  const dateStr = item.recordedAt.slice(0, 10);
  const weatherEmoji = item.weather ? (WEATHER_EMOJI[item.weather] ?? '🌤️') : null;

  return (
    <Pressable style={({ pressed }) => [styles.card, pressed && styles.cardPressed]} onPress={onPress}>
      {thumbnails.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.imageScroll}
        >
          {thumbnails.map((img) => (
            <Image key={img.id} source={{ uri: img.imageUrl }} style={styles.thumbnail} />
          ))}
        </ScrollView>
      )}

      <View style={styles.cardBody}>
        {memberNickname && (
          <Text style={styles.memberNickname}>👤 {memberNickname}</Text>
        )}
        <View style={styles.cardMeta}>
          <View style={[styles.typeTag, item.type === 'TRAVEL' ? styles.typeTagTravel : styles.typeTagDaily]}>
            <Text style={styles.typeTagText}>{TYPE_LABEL[item.type]}</Text>
          </View>
          <Text style={styles.dateText}>{dateStr}</Text>
          {weatherEmoji && (
            <Text style={styles.weatherText}>{weatherEmoji} {item.temperature != null ? `${item.temperature}°` : ''}</Text>
          )}
        </View>

        {item.place && (
          <Text style={styles.placeName} numberOfLines={1}>
            📍 {item.place.name}
          </Text>
        )}

        {item.diaryTitle ? (
          <Text style={styles.diaryTitle} numberOfLines={1}>{item.diaryTitle}</Text>
        ) : null}

        {item.content ? (
          <Text style={styles.contentPreview} numberOfLines={2}>{item.content}</Text>
        ) : null}
      </View>
    </Pressable>
  );
}

function TravelBanner({ record }: { record: RecordItem }) {
  return (
    <View style={styles.travelBanner}>
      <Text style={styles.travelBannerEmoji}>✈️</Text>
      <View>
        <Text style={styles.travelBannerTitle}>여행 중</Text>
        <Text style={styles.travelBannerSub}>{record.place?.name ?? '장소 미등록'}</Text>
      </View>
    </View>
  );
}

function EmptyState() {
  return (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyEmoji}>📖</Text>
      <Text style={styles.emptyTitle}>아직 기록이 없어요</Text>
      <Text style={styles.emptySub}>우상단 버튼을 눌러 첫 기록을 남겨보세요!</Text>
    </View>
  );
}

export default function HomeScreen() {
  const router = useRouter();
  const { nickname, userId } = useAuthStore();
  const { timeline, isLoading: myLoading, hasNext: myHasNext, fetchTimeline } = useRecordStore();
  const {
    group,
    sharedTimeline,
    hasNext: sharedHasNext,
    isLoading: sharedLoading,
    fetchSharedTimeline,
  } = useShareStore();

  const [tab, setTab] = useState<'mine' | 'shared'>('mine');

  useEffect(() => {
    fetchTimeline(true);
  }, []);

  useEffect(() => {
    if (tab === 'shared' && group) {
      fetchSharedTimeline(true);
    }
  }, [tab]);

  const isLoading = tab === 'mine' ? myLoading : sharedLoading;
  const hasNext = tab === 'mine' ? myHasNext : sharedHasNext;
  const data = tab === 'mine' ? timeline : sharedTimeline;

  const handleLoadMore = useCallback(() => {
    if (hasNext && !isLoading) {
      tab === 'mine' ? fetchTimeline() : fetchSharedTimeline();
    }
  }, [hasNext, isLoading, tab]);

  const activeTravelRecord = timeline.find((r) => r.type === 'TRAVEL' && r.tripId != null) ?? null;

  const getMemberNickname = (item: RecordItem) => {
    if (tab !== 'shared' || !group) return undefined;
    if (item.userId === userId) return undefined; // 내 기록은 표시 안 함
    return group.members.find((m) => m.userId === item.userId)?.nickname;
  };

  const renderItem = useCallback(
    ({ item }: { item: RecordItem }) => (
      <RecordCard
        item={item}
        onPress={() => router.push(('/record/' + item.id) as any)}
        memberNickname={getMemberNickname(item)}
      />
    ),
    [router, tab, group, userId],
  );

  const renderFooter = () => {
    if (!isLoading) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color="#888" />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{nickname ? `${nickname}의 기록` : 'Logly'}</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push('/record/step1' as any)}
        >
          <Text style={styles.addButtonText}>+ 기록하기</Text>
        </TouchableOpacity>
      </View>

      {/* 탭 토글 */}
      {group && (
        <View style={styles.tabBar}>
          <TouchableOpacity
            style={[styles.tabItem, tab === 'mine' && styles.tabItemActive]}
            onPress={() => setTab('mine')}
          >
            <Text style={[styles.tabText, tab === 'mine' && styles.tabTextActive]}>내 기록</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabItem, tab === 'shared' && styles.tabItemActive]}
            onPress={() => setTab('shared')}
          >
            <Text style={[styles.tabText, tab === 'shared' && styles.tabTextActive]}>함께 보기</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* 여행 배너 (내 기록 탭만) */}
      {tab === 'mine' && activeTravelRecord && <TravelBanner record={activeTravelRecord} />}

      {/* 타임라인 */}
      <FlatList
        data={data}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.4}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={!isLoading ? <EmptyState /> : null}
        contentContainerStyle={data.length === 0 ? styles.flatListEmpty : styles.flatListContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
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
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#222',
  },
  addButton: {
    backgroundColor: '#222',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  tabItem: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabItemActive: {
    borderBottomColor: '#222',
  },
  tabText: {
    fontSize: 14,
    color: '#aaa',
    fontWeight: '500',
  },
  tabTextActive: {
    color: '#222',
    fontWeight: '700',
  },
  memberNickname: {
    fontSize: 11,
    color: '#888',
    marginBottom: 4,
  },
  travelBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#e8f4fd',
    marginHorizontal: 16,
    marginTop: 12,
    padding: 12,
    borderRadius: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#4a9eed',
  },
  travelBannerEmoji: {
    fontSize: 22,
  },
  travelBannerTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2a7fc3',
  },
  travelBannerSub: {
    fontSize: 12,
    color: '#555',
    marginTop: 2,
  },
  flatListContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 24,
    gap: 12,
  },
  flatListEmpty: {
    flex: 1,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 12,
  },
  cardPressed: {
    opacity: 0.85,
  },
  imageScroll: {
    backgroundColor: '#f5f5f5',
  },
  thumbnail: {
    width: 120,
    height: 120,
    marginRight: 2,
  },
  cardBody: {
    padding: 14,
    gap: 4,
  },
  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  typeTag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  typeTagDaily: {
    backgroundColor: '#eee',
  },
  typeTagTravel: {
    backgroundColor: '#d4edff',
  },
  typeTagText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#444',
  },
  dateText: {
    fontSize: 12,
    color: '#999',
  },
  weatherText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 'auto',
  },
  placeName: {
    fontSize: 13,
    color: '#555',
    fontWeight: '500',
  },
  diaryTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#222',
    marginTop: 2,
  },
  contentPreview: {
    fontSize: 13,
    color: '#666',
    lineHeight: 19,
    marginTop: 2,
  },
  footerLoader: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
    gap: 8,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#444',
  },
  emptySub: {
    fontSize: 13,
    color: '#aaa',
    textAlign: 'center',
  },
});
