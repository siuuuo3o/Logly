import { Tabs } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

type TabIconProps = {
  label: string;
  focused: boolean;
};

function TabIcon({ label, focused }: TabIconProps) {
  return (
    <View style={styles.tabIconContainer}>
      <View style={[styles.iconBox, focused && styles.iconBoxActive]} />
      <Text style={[styles.tabLabel, focused && styles.tabLabelActive]}>{label}</Text>
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon label="홈" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="map"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon label="지도" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="record"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon label="기록" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="trip"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon label="앨범" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="mypage"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon label="MY" focused={focused} />,
        }}
      />
      {/* 기존 explore 탭 숨김 처리 */}
      <Tabs.Screen
        name="explore"
        options={{ href: null }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    height: 56,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: '#fff',
    paddingBottom: 0,
  },
  tabIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    paddingTop: 8,
  },
  iconBox: {
    width: 22,
    height: 22,
    borderRadius: 5,
    backgroundColor: '#ddd',
  },
  iconBoxActive: {
    backgroundColor: '#222',
  },
  tabLabel: {
    fontSize: 10,
    color: '#aaa',
  },
  tabLabelActive: {
    color: '#222',
    fontWeight: '600',
  },
});
