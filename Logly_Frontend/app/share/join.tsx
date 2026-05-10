import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useShareStore } from '@/src/store/shareStore';

export default function JoinScreen() {
  const router = useRouter();
  const { joinGroup } = useShareStore();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleJoin = async () => {
    const trimmed = code.trim().toUpperCase();
    if (trimmed.length < 6) {
      Alert.alert('알림', '초대 코드를 입력해주세요.');
      return;
    }
    setLoading(true);
    try {
      await joinGroup(trimmed);
      Alert.alert('완료', '그룹에 참여했어요!', [
        { text: '확인', onPress: () => router.back() },
      ]);
    } catch (e: any) {
      const msg = e?.response?.data?.message ?? '참여에 실패했어요.';
      Alert.alert('오류', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <Text style={styles.backText}>← 돌아가기</Text>
      </TouchableOpacity>

      <Text style={styles.title}>코드로 참여하기</Text>
      <Text style={styles.sub}>친구에게 받은 초대 코드를 입력해주세요</Text>

      <TextInput
        style={styles.input}
        value={code}
        onChangeText={(v) => setCode(v.toUpperCase())}
        placeholder="초대 코드 입력"
        placeholderTextColor="#bbb"
        autoCapitalize="characters"
        maxLength={8}
      />

      <TouchableOpacity
        style={[styles.joinBtn, !code.trim() && styles.joinBtnDisabled]}
        onPress={handleJoin}
        disabled={loading || !code.trim()}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.joinBtnText}>참여하기</Text>
        )}
      </TouchableOpacity>
    </KeyboardAvoidingView>
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
  input: {
    borderWidth: 1.5,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 24,
    fontWeight: '700',
    color: '#222',
    letterSpacing: 4,
    textAlign: 'center',
    marginBottom: 24,
    backgroundColor: '#fafafa',
  },
  joinBtn: {
    backgroundColor: '#222',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  joinBtnDisabled: {
    backgroundColor: '#ccc',
  },
  joinBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },
});
