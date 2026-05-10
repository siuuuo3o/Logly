import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Button from '@/src/components/common/Button';
import Input from '@/src/components/common/Input';
import { useAuthStore } from '@/src/store/authStore';

export default function SignupScreen() {
  const router = useRouter();
  const { signup } = useAuthStore();

  const [nickname, setNickname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [loading, setLoading] = useState(false);

  const [errors, setErrors] = useState({
    nickname: '',
    email: '',
    password: '',
    passwordConfirm: '',
  });

  const validate = () => {
    const newErrors = { nickname: '', email: '', password: '', passwordConfirm: '' };
    let valid = true;

    if (!nickname || nickname.length < 2) {
      newErrors.nickname = '닉네임은 2자 이상이어야 합니다.';
      valid = false;
    }
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = '올바른 이메일 형식이 아닙니다.';
      valid = false;
    }
    if (!password || password.length < 8) {
      newErrors.password = '비밀번호는 8자 이상이어야 합니다.';
      valid = false;
    }
    if (password !== passwordConfirm) {
      newErrors.passwordConfirm = '비밀번호가 일치하지 않습니다.';
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleSignup = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await signup({ email, password, nickname });
    } catch (e: any) {
      console.log('signup error:', JSON.stringify(e?.response?.data), e?.message, e?.code);
      const message = e?.response?.data?.message ?? `회원가입에 실패했습니다. (${e?.message ?? e?.code})`;
      Alert.alert('회원가입 실패', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Text style={styles.backText}>← 뒤로</Text>
      </TouchableOpacity>

      <Text style={styles.title}>회원가입</Text>

      <View style={styles.form}>
        <Input
          label="닉네임"
          placeholder="2~20자 사이로 입력해주세요"
          value={nickname}
          onChangeText={setNickname}
          errorMessage={errors.nickname}
        />
        <Input
          label="이메일"
          placeholder="email@example.com"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
          errorMessage={errors.email}
        />
        <Input
          label="비밀번호"
          placeholder="8자 이상 입력해주세요"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          errorMessage={errors.password}
        />
        <Input
          label="비밀번호 확인"
          placeholder="비밀번호를 다시 입력해주세요"
          secureTextEntry
          value={passwordConfirm}
          onChangeText={setPasswordConfirm}
          errorMessage={errors.passwordConfirm}
        />
        <Button label="회원가입" onPress={handleSignup} loading={loading} style={styles.submitButton} />
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>이미 계정이 있으신가요? </Text>
        <TouchableOpacity onPress={() => router.replace('/(auth)/login')}>
          <Text style={styles.footerLink}>로그인</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 56,
    paddingHorizontal: 20,
  },
  backButton: {
    marginBottom: 16,
  },
  backText: {
    fontSize: 15,
    color: '#555',
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
  submitButton: {
    marginTop: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
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
