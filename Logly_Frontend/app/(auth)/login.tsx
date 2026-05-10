import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import Button from '@/src/components/common/Button';
import Input from '@/src/components/common/Input';
import { useAuthStore } from '@/src/store/authStore';

WebBrowser.maybeCompleteAuthSession();

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8080';

export default function LoginScreen() {
  const router = useRouter();
  const { login, setSession } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const validate = () => {
    let valid = true;
    setEmailError('');
    setPasswordError('');

    if (!email) {
      setEmailError('이메일을 입력해주세요.');
      valid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError('올바른 이메일 형식이 아닙니다.');
      valid = false;
    }
    if (!password) {
      setPasswordError('비밀번호를 입력해주세요.');
      valid = false;
    }
    return valid;
  };

  const handleGoogleLogin = async () => {
    try {
      const result = await WebBrowser.openAuthSessionAsync(
        `${API_BASE_URL}/oauth2/authorization/google`,
        'loglyfrontend://oauth'
      );
      if (result.type !== 'success') return;
      const url = new URL(result.url);
      const errorMsg = url.searchParams.get('error');
      if (errorMsg) {
        Alert.alert('구글 로그인 실패', decodeURIComponent(errorMsg));
        return;
      }
      const accessToken = url.searchParams.get('accessToken');
      const refreshToken = url.searchParams.get('refreshToken');
      const userId = url.searchParams.get('userId');
      const nickname = url.searchParams.get('nickname');
      if (!accessToken || !refreshToken || !userId || !nickname) {
        Alert.alert('구글 로그인 실패', '토큰을 받지 못했습니다.');
        return;
      }
      await setSession(accessToken, refreshToken, Number(userId), decodeURIComponent(nickname));
    } catch (e: any) {
      Alert.alert('구글 로그인 실패', '다시 시도해주세요.');
    }
  };

  const handleKakaoLogin = async () => {
    try {
      const result = await WebBrowser.openAuthSessionAsync(
        `${API_BASE_URL}/oauth2/authorization/kakao`,
        'loglyfrontend://oauth'
      );

      if (result.type !== 'success') return;

      const url = new URL(result.url);

      const errorMsg = url.searchParams.get('error');
      if (errorMsg) {
        Alert.alert('카카오 로그인 실패 (디버그)', decodeURIComponent(errorMsg));
        return;
      }

      const accessToken = url.searchParams.get('accessToken');
      const refreshToken = url.searchParams.get('refreshToken');
      const userId = url.searchParams.get('userId');
      const nickname = url.searchParams.get('nickname');

      if (!accessToken || !refreshToken || !userId || !nickname) {
        Alert.alert('카카오 로그인 실패', '토큰을 받지 못했습니다.');
        return;
      }

      await setSession(accessToken, refreshToken, Number(userId), decodeURIComponent(nickname));
    } catch (e: any) {
      Alert.alert('카카오 로그인 실패', '다시 시도해주세요.');
    }
  };

  const handleLogin = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await login({ email, password });
    } catch (e: any) {
      const message = e?.response?.data?.message ?? '로그인에 실패했습니다.';
      Alert.alert('로그인 실패', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>로그인</Text>

      <View style={styles.form}>
        <Input
          label="이메일"
          placeholder="email@example.com"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
          errorMessage={emailError}
        />
        <Input
          label="비밀번호"
          placeholder="비밀번호를 입력하세요"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          errorMessage={passwordError}
        />
        <Button label="로그인" onPress={handleLogin} loading={loading} />
      </View>

      <View style={styles.divider}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>또는</Text>
        <View style={styles.dividerLine} />
      </View>

      <View style={styles.socialButtons}>
        <Button label="🍎  Apple로 계속하기" variant="outline" onPress={() => {}} />
        <Button label="🔍  Google로 계속하기" variant="outline" onPress={handleGoogleLogin} />
        <Button label="💬  카카오로 계속하기" variant="outline" onPress={handleKakaoLogin}
          style={styles.kakaoButton}
        />
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>아직 계정이 없으신가요? </Text>
        <TouchableOpacity onPress={() => router.push('/(auth)/signup')}>
          <Text style={styles.footerLink}>회원가입</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#222',
    marginBottom: 28,
  },
  form: {
    gap: 16,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
    gap: 10,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e8e8e8',
  },
  dividerText: {
    fontSize: 13,
    color: '#aaa',
  },
  socialButtons: {
    gap: 10,
  },
  kakaoButton: {
    backgroundColor: '#FEE500',
    borderColor: '#FEE500',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 28,
  },
  footerText: {
    fontSize: 13,
    color: '#aaa',
  },
  footerLink: {
    fontSize: 13,
    color: '#222',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});
