import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { noticeApi, NoticeItem } from '@/src/api/notice';

export default function NoticesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [notices, setNotices] = useState<NoticeItem[]>([]);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    noticeApi.getAll()
      .then((res) => {
        setNotices(res.data.data);
        if (res.data.data.length > 0) setExpanded(res.data.data[0].id);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <ScrollView style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 14 }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.headerBack}>‹ 뒤로</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>공지사항</Text>
        <View style={{ width: 48 }} />
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} />
      ) : notices.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>공지사항이 없어요</Text>
        </View>
      ) : (
        <View style={styles.list}>
          {notices.map((notice) => (
            <TouchableOpacity
              key={notice.id}
              style={styles.item}
              onPress={() => setExpanded(expanded === notice.id ? null : notice.id)}
              activeOpacity={0.7}
            >
              <View style={styles.itemHeader}>
                <View style={styles.itemMeta}>
                  <View style={styles.itemTitleRow}>
                    {notice.important && (
                      <View style={styles.importantBadge}>
                        <Text style={styles.importantBadgeText}>중요</Text>
                      </View>
                    )}
                    <Text style={styles.itemTitle}>{notice.title}</Text>
                  </View>
                  <Text style={styles.itemDate}>{notice.createdAt}</Text>
                </View>
                <Text style={styles.itemArrow}>{expanded === notice.id ? '∧' : '∨'}</Text>
              </View>
              {expanded === notice.id && (
                <Text style={styles.itemContent}>{notice.content}</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafafa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 14,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerBack: {
    fontSize: 16,
    color: '#555',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#222',
  },
  empty: {
    marginTop: 80,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#aaa',
  },
  list: {
    backgroundColor: '#fff',
    marginTop: 16,
  },
  item: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemMeta: {
    flex: 1,
    gap: 3,
  },
  itemTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  importantBadge: {
    backgroundColor: '#ff4444',
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  importantBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#222',
  },
  itemDate: {
    fontSize: 11,
    color: '#aaa',
  },
  itemArrow: {
    fontSize: 12,
    color: '#bbb',
    paddingLeft: 12,
  },
  itemContent: {
    marginTop: 12,
    fontSize: 13,
    color: '#555',
    lineHeight: 20,
  },
});
