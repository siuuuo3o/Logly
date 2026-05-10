import { useEffect, useState } from 'react';
import {
  Alert,
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
import * as Notifications from 'expo-notifications';

const NOTIF_KEY = 'logly_notifications';
const REMINDER_ID_KEY = 'logly_reminder_id';

interface NotifSettings {
  pushEnabled: boolean;
  shareActivity: boolean;
  reminderEnabled: boolean;
}

const defaultSettings: NotifSettings = {
  pushEnabled: true,
  shareActivity: true,
  reminderEnabled: false,
};

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

async function requestPermission(): Promise<boolean> {
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

async function scheduleReminder() {
  await Notifications.cancelAllScheduledNotificationsAsync();
  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: '오늘 하루는 어떠셨나요? 📝',
      body: 'Logly에 오늘의 기록을 남겨보세요.',
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: 19,
      minute: 0,
    },
  });
  await AsyncStorage.setItem(REMINDER_ID_KEY, id);
}

async function cancelReminder() {
  const id = await AsyncStorage.getItem(REMINDER_ID_KEY);
  if (id) {
    await Notifications.cancelScheduledNotificationAsync(id);
    await AsyncStorage.removeItem(REMINDER_ID_KEY);
  }
}

export default function NotificationsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [settings, setSettings] = useState<NotifSettings>(defaultSettings);

  useEffect(() => {
    AsyncStorage.getItem(NOTIF_KEY).then((value) => {
      if (value) setSettings(JSON.parse(value));
    });
  }, []);

  const toggle = async (key: keyof NotifSettings) => {
    if (key === 'pushEnabled' || key === 'shareActivity') {
      const granted = await requestPermission();
      if (!granted) {
        Alert.alert('알림 권한 필요', '설정 앱에서 Logly 알림을 허용해주세요.');
        return;
      }
    }

    if (key === 'reminderEnabled') {
      const granted = await requestPermission();
      if (!granted) {
        Alert.alert('알림 권한 필요', '설정 앱에서 Logly 알림을 허용해주세요.');
        return;
      }
      if (!settings.reminderEnabled) {
        await scheduleReminder();
        Alert.alert('리마인더 설정 완료', '매일 저녁 7시에 알림을 드릴게요.');
      } else {
        await cancelReminder();
      }
    }

    const next = { ...settings, [key]: !settings[key] };
    setSettings(next);
    await AsyncStorage.setItem(NOTIF_KEY, JSON.stringify(next));
  };

  const rows: { key: keyof NotifSettings; label: string; desc: string }[] = [
    { key: 'pushEnabled', label: '푸시 알림', desc: '앱 알림을 허용합니다' },
    { key: 'shareActivity', label: '공유 활동 알림', desc: '공유 멤버가 새 기록을 남기면 알려줘요' },
    { key: 'reminderEnabled', label: '기록 리마인더', desc: '매일 저녁 7시에 기록 알림을 보내요' },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 14 }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.headerBack}>‹ 뒤로</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>알림 설정</Text>
        <View style={{ width: 48 }} />
      </View>

      <View style={styles.section}>
        {rows.map((row, idx) => (
          <View key={row.key}>
            <View style={styles.row}>
              <View style={styles.rowText}>
                <Text style={styles.rowLabel}>{row.label}</Text>
                <Text style={styles.rowDesc}>{row.desc}</Text>
              </View>
              <Switch
                value={settings[row.key]}
                onValueChange={() => toggle(row.key)}
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
  container: { flex: 1, backgroundColor: '#fafafa' },
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
  headerBack: { fontSize: 16, color: '#555' },
  headerTitle: { fontSize: 16, fontWeight: '700', color: '#222' },
  section: { backgroundColor: '#fff', marginTop: 16, paddingHorizontal: 16 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
  },
  rowText: { flex: 1, marginRight: 12 },
  rowLabel: { fontSize: 15, color: '#222', marginBottom: 2 },
  rowDesc: { fontSize: 12, color: '#aaa' },
  divider: { height: 1, backgroundColor: '#f0f0f0' },
});
