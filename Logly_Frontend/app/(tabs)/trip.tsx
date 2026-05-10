import { useCallback } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useTripStore } from '@/src/store/tripStore';
import { TripItem } from '@/src/api/trip';

export default function TripScreen() {
  const router = useRouter();
  const { trips, isLoading, fetchTrips } = useTripStore();

  useFocusEffect(
    useCallback(() => {
      fetchTrips();
    }, [])
  );

  const renderTrip = ({ item }: { item: TripItem }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/trip/${item.id}` as any)}
      activeOpacity={0.85}
    >
      {item.coverImageUrl ? (
        <Image source={{ uri: item.coverImageUrl }} style={styles.cover} />
      ) : (
        <View style={[styles.cover, styles.coverPlaceholder]}>
          <Text style={styles.coverPlaceholderText}>📸</Text>
        </View>
      )}
      <View style={styles.cardBody}>
        <View style={styles.cardRow}>
          <Text style={styles.tripTitle} numberOfLines={1}>{item.title}</Text>
          {item.isActive && (
            <View style={styles.activeBadge}>
              <Text style={styles.activeBadgeText}>진행 중</Text>
            </View>
          )}
        </View>
        <View style={styles.metaRow}>
          {(item.startDate || item.endDate) && (
            <Text style={styles.metaText}>
              📅 {item.startDate ?? '?'} – {item.endDate ?? '?'}
            </Text>
          )}
          <Text style={styles.metaText}>📝 기록 {item.recordCount}개</Text>
          <Text style={styles.metaText}>✏️ 일기 {item.diaryCount}개</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>✈️ 여행 앨범</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push('/trip/create' as any)}
        >
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>

      {isLoading && trips.length === 0 ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#222" />
        </View>
      ) : trips.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyIcon}>✈️</Text>
          <Text style={styles.emptyTitle}>아직 여행이 없어요</Text>
          <Text style={styles.emptyDesc}>+ 버튼을 눌러 첫 여행을 만들어보세요</Text>
        </View>
      ) : (
        <FlatList
          data={trips}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderTrip}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          onRefresh={fetchTrips}
          refreshing={isLoading}
        />
      )}
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
    paddingHorizontal: 16,
    paddingTop: 56,
    paddingBottom: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#222',
  },
  addButton: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: '#222',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '300',
    lineHeight: 24,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 4,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
  },
  emptyDesc: {
    fontSize: 13,
    color: '#aaa',
  },
  listContent: {
    padding: 14,
    gap: 12,
    paddingBottom: 80,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  cover: {
    width: '100%',
    height: 110,
  },
  coverPlaceholder: {
    backgroundColor: '#e0e0e0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  coverPlaceholderText: {
    fontSize: 32,
  },
  cardBody: {
    padding: 12,
    gap: 6,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  tripTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: '#222',
  },
  activeBadge: {
    backgroundColor: '#e8ffe8',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  activeBadgeText: {
    fontSize: 10,
    color: '#228833',
    fontWeight: '600',
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  metaText: {
    fontSize: 11,
    color: '#aaa',
  },
});
