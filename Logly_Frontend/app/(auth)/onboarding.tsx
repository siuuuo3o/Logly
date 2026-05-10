import { useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import Button from '@/src/components/common/Button';

export default function OnboardingScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* 이미지 영역 */}
      <View style={styles.imageArea}>
        <View style={styles.illustrationCircle} />
        <Text style={styles.illustrationTitle}>일상과 여행을 함께</Text>
        <Text style={styles.illustrationDesc}>
          사진, 장소, 날씨를 한 번에 기록하고{'\n'}
          나만의 감성 다이어리를 완성해요
        </Text>
        {/* 페이지 인디케이터 */}
        <View style={styles.dotRow}>
          <View style={[styles.dot, styles.dotActive]} />
          <View style={styles.dot} />
          <View style={styles.dot} />
        </View>
      </View>

      {/* 버튼 영역 */}
      <View style={styles.bottomArea}>
        <Button
          label="시작하기"
          onPress={() => router.push('/(auth)/signup')}
          style={styles.button}
        />
        <Button
          label="로그인"
          variant="outline"
          onPress={() => router.push('/(auth)/login')}
          style={styles.button}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafafa',
  },
  imageArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0f0f0',
    gap: 12,
    paddingHorizontal: 32,
  },
  illustrationCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#d0d0d0',
    marginBottom: 8,
  },
  illustrationTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#222',
  },
  illustrationDesc: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    lineHeight: 22,
  },
  dotRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ccc',
  },
  dotActive: {
    width: 20,
    backgroundColor: '#333',
  },
  bottomArea: {
    padding: 24,
    paddingBottom: 40,
    gap: 10,
    backgroundColor: '#fafafa',
  },
  button: {
    borderRadius: 24,
  },
});
