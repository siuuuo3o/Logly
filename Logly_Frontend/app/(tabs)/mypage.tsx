import { useEffect } from 'react';
import {
  Alert,
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/src/store/authStore';
import { useShareStore } from '@/src/store/shareStore';

export default function MypageScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { nickname, email, profileImageUrl, stats, logout, fetchProfile, fetchStats } = useAuthStore();
  const { group, fetchMyGroup } = useShareStore();

  useEffect(() => {
    fetchProfile();
    fetchStats();
    fetchMyGroup();
  }, []);

  const handleLogout = () => {
    Alert.alert('로그아웃', '로그아웃 하시겠어요?', [
      { text: '취소', style: 'cancel' },
      { text: '로그아웃', style: 'destructive', onPress: logout },
    ]);
  };

  const menuItems = [
    { label: '카테고리 관리', onPress: () => router.push('/mypage/categories' as any) },
    { label: '알림 설정', onPress: () => router.push('/mypage/notifications' as any) },
    { label: 'AI 도우미 설정', onPress: () => router.push('/mypage/ai-settings' as any) },
    { label: '데이터 내보내기', onPress: () => router.push('/mypage/export' as any) },
    { label: '공지사항', onPress: () => router.push('/mypage/notices' as any) },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={[styles.content, { paddingTop: insets.top }]}>
      {/* 프로필 */}
      <View style={styles.profileCard}>
        <TouchableOpacity
          style={styles.avatarWrapper}
          onPress={() => router.push('/mypage/profile-edit' as any)}
        >
          {profileImageUrl ? (
            <Image source={{ uri: profileImageUrl }} style={styles.avatarImage} />
          ) : (
            <View style={styles.avatar} />
          )}
          <View style={styles.editBadge}>
            <Text style={styles.editBadgeIcon}>✏️</Text>
          </View>
        </TouchableOpacity>
        <Text style={styles.nickname}>{nickname ?? '사용자'}</Text>
        {email && <Text style={styles.email}>{email}</Text>}

        {/* 통계 */}
        <View style={styles.statsRow}>
          {[
            { label: '기록', value: stats?.recordCount ?? '-' },
            { label: '여행', value: stats?.tripCount ?? '-' },
            { label: '일기', value: stats?.diaryCount ?? '-' },
          ].map((item) => (
            <View key={item.label} style={styles.statItem}>
              <Text style={styles.statValue}>{item.value}</Text>
              <Text style={styles.statLabel}>{item.label}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* 공유 멤버 섹션 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>👫 공유 멤버</Text>

        {group ? (
          <>
            <FlatList
              horizontal
              data={group.members}
              keyExtractor={(item) => String(item.userId)}
              contentContainerStyle={styles.memberList}
              scrollEnabled={false}
              renderItem={({ item }) => (
                <View style={styles.memberItem}>
                  {item.profileImageUrl ? (
                    <Image source={{ uri: item.profileImageUrl }} style={styles.memberAvatar} />
                  ) : (
                    <View style={[styles.memberAvatar, styles.memberAvatarFallback]} />
                  )}
                  <Text style={styles.memberName} numberOfLines={1}>
                    {item.nickname}
                  </Text>
                  {item.role === 'OWNER' && <Text style={styles.ownerBadge}>👑</Text>}
                </View>
              )}
              ListFooterComponent={
                <TouchableOpacity
                  style={styles.addMemberBtn}
                  onPress={() => router.push('/share/invite' as any)}
                >
                  <Text style={styles.addMemberIcon}>+</Text>
                </TouchableOpacity>
              }
            />
            <TouchableOpacity
              style={styles.manageBtn}
              onPress={() => router.push('/share/members' as any)}
            >
              <Text style={styles.manageBtnText}>멤버 관리</Text>
            </TouchableOpacity>
          </>
        ) : (
          <View style={styles.shareEmpty}>
            <Text style={styles.shareEmptyText}>아직 공유 그룹이 없어요</Text>
            <View style={styles.shareActions}>
              <TouchableOpacity
                style={styles.shareBtn}
                onPress={() => router.push('/share/invite' as any)}
              >
                <Text style={styles.shareBtnText}>그룹 만들기</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.shareBtn, styles.shareBtnOutline]}
                onPress={() => router.push('/share/join' as any)}
              >
                <Text style={[styles.shareBtnText, styles.shareBtnOutlineText]}>코드 입력</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>

      {/* 메뉴 */}
      <View style={[styles.section, styles.menuSection]}>
        {menuItems.map((item, idx) => (
          <TouchableOpacity key={idx} style={styles.menuRow} onPress={item.onPress}>
            <Text style={styles.menuLabel}>{item.label}</Text>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity style={[styles.menuRow, styles.menuRowLast]} onPress={handleLogout}>
          <Text style={[styles.menuLabel, styles.menuLabelDanger]}>로그아웃</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafafa',
  },
  content: {
    paddingBottom: 80,
  },
  profileCard: {
    backgroundColor: '#fff',
    alignItems: 'center',
    paddingVertical: 28,
    marginBottom: 8,
    gap: 6,
  },
  avatarWrapper: {
    marginBottom: 4,
    position: 'relative',
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#d0d0d0',
  },
  avatarImage: {
    width: 72,
    height: 72,
    borderRadius: 36,
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  editBadgeIcon: {
    fontSize: 11,
  },
  nickname: {
    fontSize: 18,
    fontWeight: '700',
    color: '#222',
  },
  email: {
    fontSize: 12,
    color: '#aaa',
    marginBottom: 4,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 32,
    marginTop: 8,
  },
  statItem: {
    alignItems: 'center',
    gap: 2,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#222',
  },
  statLabel: {
    fontSize: 11,
    color: '#aaa',
  },
  section: {
    backgroundColor: '#fff',
    marginBottom: 8,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#555',
    marginBottom: 14,
  },
  memberList: {
    gap: 16,
    paddingBottom: 12,
    alignItems: 'center',
  },
  memberItem: {
    alignItems: 'center',
    gap: 4,
    width: 56,
  },
  memberAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  memberAvatarFallback: {
    backgroundColor: '#d0d0d0',
  },
  memberName: {
    fontSize: 10,
    color: '#555',
    textAlign: 'center',
    width: 56,
  },
  ownerBadge: {
    fontSize: 10,
  },
  addMemberBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addMemberIcon: {
    fontSize: 22,
    color: '#888',
    lineHeight: 26,
  },
  manageBtn: {
    alignSelf: 'flex-end',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  manageBtnText: {
    fontSize: 12,
    color: '#555',
  },
  shareEmpty: {
    gap: 12,
  },
  shareEmptyText: {
    fontSize: 13,
    color: '#aaa',
  },
  shareActions: {
    flexDirection: 'row',
    gap: 10,
  },
  shareBtn: {
    flex: 1,
    backgroundColor: '#222',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  shareBtnOutline: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  shareBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#fff',
  },
  shareBtnOutlineText: {
    color: '#555',
  },
  menuRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuRowLast: {
    borderBottomWidth: 0,
  },
  menuLabel: {
    fontSize: 14,
    color: '#333',
  },
  menuLabelDanger: {
    color: '#ff4444',
  },
  menuArrow: {
    fontSize: 18,
    color: '#bbb',
  },
  menuSection: {
    marginTop: 40,
  },
});
