import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { documentDirectory, writeAsStringAsync, EncodingType } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { recordApi } from '@/src/api/record';
import { tripApi } from '@/src/api/trip';

export default function ExportScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    setLoading(true);
    try {
      const [recordsRes, tripsRes] = await Promise.all([
        recordApi.getTimeline(0, 1000),
        tripApi.getMyTrips(),
      ]);

      const exportData = {
        exportedAt: new Date().toISOString(),
        records: recordsRes.data.data.records,
        trips: tripsRes.data.data ?? [],
      };

      const fileName = `logly_export_${Date.now()}.json`;
      const fileUri = documentDirectory + fileName;
      await writeAsStringAsync(fileUri, JSON.stringify(exportData, null, 2), {
        encoding: EncodingType.UTF8,
      });

      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'application/json',
          dialogTitle: 'Logly 데이터 내보내기',
        });
      } else {
        Alert.alert('완료', `파일이 저장되었어요.\n${fileUri}`);
      }
    } catch (e: any) {
      Alert.alert('내보내기 실패', e?.message ?? '오류가 발생했어요.');
    } finally {
      setLoading(false);
    }
  };

  const items = [
    { icon: '📝', label: '기록 데이터', desc: '모든 일상·여행 기록 (텍스트)' },
    { icon: '✈️', label: '여행 앨범', desc: '여행 제목, 날짜, 연결된 기록' },
    { icon: '📍', label: '장소 정보', desc: '기록에 태그된 장소 목록' },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 14 }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.headerBack}>‹ 뒤로</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>데이터 내보내기</Text>
        <View style={{ width: 48 }} />
      </View>

      <View style={styles.infoBox}>
        <Text style={styles.infoText}>
          내 데이터를 JSON 형식으로 내보낼 수 있어요.{'\n'}
          사진 파일은 포함되지 않아요.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>포함되는 데이터</Text>
        {items.map((item) => (
          <View key={item.label} style={styles.item}>
            <Text style={styles.itemIcon}>{item.icon}</Text>
            <View>
              <Text style={styles.itemLabel}>{item.label}</Text>
              <Text style={styles.itemDesc}>{item.desc}</Text>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.buttonWrap}>
        <TouchableOpacity
          style={[styles.exportBtn, loading && styles.exportBtnDisabled]}
          onPress={handleExport}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.exportBtnText}>JSON으로 내보내기</Text>
          )}
        </TouchableOpacity>
      </View>
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
  infoBox: {
    margin: 16,
    padding: 14,
    backgroundColor: '#fff8e1',
    borderRadius: 10,
  },
  infoText: {
    fontSize: 12,
    color: '#776',
    lineHeight: 18,
  },
  section: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 16,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#555',
    marginBottom: 4,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  itemIcon: {
    fontSize: 22,
    width: 32,
    textAlign: 'center',
  },
  itemLabel: {
    fontSize: 14,
    color: '#222',
    marginBottom: 2,
  },
  itemDesc: {
    fontSize: 12,
    color: '#aaa',
  },
  buttonWrap: {
    padding: 20,
  },
  exportBtn: {
    backgroundColor: '#222',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  exportBtnDisabled: {
    opacity: 0.5,
  },
  exportBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
});
