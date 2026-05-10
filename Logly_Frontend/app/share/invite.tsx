import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Share,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useShareStore } from '@/src/store/shareStore';

export default function InviteScreen() {
  const router = useRouter();
  const { group, createGroup, isLoading } = useShareStore();
  const [inviteCode, setInviteCode] = useState<string | null>(null);

  useEffect(() => {
    initGroup();
  }, []);

  const initGroup = async () => {
    try {
      const g = group ?? (await createGroup());
      setInviteCode(g.inviteCode);
    } catch {
      Alert.alert('오류', '초대 코드를 불러오지 못했어요.');
    }
  };

  const handleShare = async () => {
    if (!inviteCode) return;
    await Share.share({
      message: `Logly 공유 그룹 초대 코드: ${inviteCode}`,
    });
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <Text style={styles.backText}>← 돌아가기</Text>
      </TouchableOpacity>

      <Text style={styles.title}>초대 코드</Text>
      <Text style={styles.sub}>아래 코드를 친구에게 공유해주세요</Text>

      {isLoading ? (
        <ActivityIndicator size="large" color="#222" style={{ marginTop: 40 }} />
      ) : (
        <View style={styles.codeBox}>
          <Text style={styles.code}>{inviteCode ?? '—'}</Text>
        </View>
      )}

      <TouchableOpacity style={styles.shareBtn} onPress={handleShare} disabled={!inviteCode}>
        <Text style={styles.shareBtnText}>공유하기</Text>
      </TouchableOpacity>

      <Text style={styles.hint}>
        상대방이 이 코드를 입력하면{'\n'}함께 기록을 볼 수 있어요.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 24,
    paddingTop: 60,
  },
  backBtn: {
    marginBottom: 32,
  },
  backText: {
    fontSize: 14,
    color: '#555',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#222',
    marginBottom: 8,
  },
  sub: {
    fontSize: 13,
    color: '#888',
    marginBottom: 40,
  },
  codeBox: {
    backgroundColor: '#f5f5f5',
    borderRadius: 16,
    paddingVertical: 32,
    alignItems: 'center',
    marginBottom: 24,
  },
  code: {
    fontSize: 32,
    fontWeight: '800',
    color: '#222',
    letterSpacing: 6,
  },
  shareBtn: {
    backgroundColor: '#222',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 20,
  },
  shareBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },
  hint: {
    fontSize: 12,
    color: '#aaa',
    textAlign: 'center',
    lineHeight: 20,
  },
});
