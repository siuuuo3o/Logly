import { Redirect } from 'expo-router';

// 기록하기 탭을 누르면 step1으로 즉시 이동
export default function RecordTabRedirect() {
  return <Redirect href={'/record/step1' as any} />;
}
