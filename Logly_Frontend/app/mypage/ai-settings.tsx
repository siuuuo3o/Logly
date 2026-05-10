import { useEffect, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AI_KEY = 'logly_ai_settings';

interface AiSettings {
  enabled: boolean;
  autoSuggest: boolean;
  toneWarm: boolean;
}

const defaultSettings: AiSettings = {
  enabled: true,
  autoSuggest: false,
  toneWarm: true,
};

export default function AiSettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [settings, setSettings] = useState<AiSettings>(defaultSettings);

  useEffect(() => {
    AsyncStorage.getItem(AI_KEY).then((value) => {
      if (value) setSettings(JSON.parse(value));
    });
  }, []);

  const toggle = async (key: keyof AiSettings) => {
    const next = { ...settings, [key]: !settings[key] };
    setSettings(next);
    await AsyncStorage.setItem(AI_KEY, JSON.stringify(next));
  };

  const rows: { key: keyof AiSettings; label: string; desc: string }[] = [
    { key: 'enabled', label: 'AI 도우미 사용', desc: '일기 작성 시 AI 글쓰기 보조를 활성화해요' },
    { key: 'autoSuggest', label: '자동 문장 제안', desc: '입력 중 자동으로 문장을 제안해요' },
    { key: 'toneWarm', label: '따뜻한 말투', desc: '감성적이고 따뜻한 문체로 보조해요' },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 14 }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.headerBack}>‹ 뒤로</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>AI 도우미 설정</Text>
        <View style={{ width: 48 }} />
      </View>

      <View style={styles.infoBox}>
        <Text style={styles.infoText}>
          AI 도우미는 Gemini를 기반으로 동작해요.{'\n'}
          작성한 내용은 학습에 사용되지 않아요.
        </Text>
      </View>

      <View style={styles.section}>
        {rows.map((row, idx) => (
          <View key={row.key}>
            <View style={[styles.row, !settings.enabled && row.key !== 'enabled' && styles.rowDisabled]}>
              <View style={styles.rowText}>
                <Text style={styles.rowLabel}>{row.label}</Text>
                <Text style={styles.rowDesc}>{row.desc}</Text>
              </View>
              <Switch
                value={settings[row.key]}
                onValueChange={() => toggle(row.key)}
                disabled={!settings.enabled && row.key !== 'enabled'}
                trackColor={{ false: '#e0e0e0', true: '#222' }}
                thumbColor="#fff"
              />
            </View>
            {idx < rows.length - 1 && <View style={styles.divider} />}
          </View>
        ))}
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
    backgroundColor: '#f0f4ff',
    borderRadius: 10,
  },
  infoText: {
    fontSize: 12,
    color: '#556',
    lineHeight: 18,
  },
  section: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
  },
  rowDisabled: {
    opacity: 0.4,
  },
  rowText: {
    flex: 1,
    marginRight: 12,
  },
  rowLabel: {
    fontSize: 15,
    color: '#222',
    marginBottom: 2,
  },
  rowDesc: {
    fontSize: 12,
    color: '#aaa',
  },
  divider: {
    height: 1,
    backgroundColor: '#f0f0f0',
  },
});
