import { Stack } from 'expo-router';

export default function MypageLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="profile-edit" />
      <Stack.Screen name="notifications" />
      <Stack.Screen name="ai-settings" />
      <Stack.Screen name="export" />
      <Stack.Screen name="notices" />
      <Stack.Screen name="categories" />
    </Stack>
  );
}
