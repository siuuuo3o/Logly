import { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  Alert,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useShareStore } from '@/src/store/shareStore';
import { useAuthStore } from '@/src/store/authStore';
import { MemberItem } from '@/src/api/share';

export default function MembersScreen() {
  const router = useRouter();
  const { group, fetchMyGroup, removeMember, leaveGroup, isLoading } = useShareStore();
  const { userId } = useAuthStore();

  useEffect(() => {
    fetchMyGroup();
  }, []);

  const myRole = group?.members.find((m) => m.userId === userId)?.role;
  const isOwner = myRole === 'OWNER';

  const handleRemove = (member: MemberItem) => {
    Alert.alert('멤버 강퇴', `${member.nickname}님을 그룹에서 내보낼까요?`, [
      { text: '취소', style: 'cancel' },
      {
        text: '강퇴',
        style: 'destructive',
        onPress: async () => {
          try {
            await removeMember(group!.id, member.userId);
          } catch {
            Alert.alert('오류', '강퇴에 실패했어요.');
          }
        },
      },
    ]);
  };

  const handleLeave = () => {
    Alert.alert('그룹 탈퇴', '그룹에서 나가시겠어요?', [
      { text: '취소', style: 'cancel' },
      {
        text: '나가기',
        style: 'destructive',
        onPress: async () => {
          try {
            await leaveGroup();
            router.back();
          } catch {
            Alert.alert('오류', '탈퇴에 실패했어요.');
          }
        },
      },
    ]);
  };

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#222" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <Text style={styles.backText}>← 돌아가기</Text>
      </TouchableOpacity>

      <Text style={styles.title}>공유 멤버</Text>

      {group ? (
        <>
          <View style={styles.codeRow}>
            <Text style={styles.codeLabel}>초대 코드</Text>
            <Text style={styles.codeValue}>{group.inviteCode}</Text>
          </View>

          <FlatList
            data={group.members}
            keyExtractor={(item) => String(item.userId)}
            contentContainerStyle={{ gap: 12, paddingBottom: 24 }}
            renderItem={({ item }) => (
              <View style={styles.memberRow}>
                {item.profileImageUrl ? (
                  <Image source={{ uri: item.profileImageUrl }} style={styles.avatar} />
                ) : (
                  <View style={[styles.avatar, styles.avatarFallback]} />
                )}
                <View style={styles.memberInfo}>
                  <Text style={styles.memberName}>{item.nickname}</Text>
                  <Text style={styles.memberRole}>
                    {item.role === 'OWNER' ? '👑 방장' : '멤버'}
                  </Text>
                </View>
                {isOwner && item.userId !== userId && (
                  <TouchableOpacity style={styles.removeBtn} onPress={() => handleRemove(item)}>
                    <Text style={styles.removeBtnText}>강퇴</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          />

          <TouchableOpacity style={styles.leaveBtn} onPress={handleLeave}>
            <Text style={styles.leaveBtnText}>그룹 나가기</Text>
          </TouchableOpacity>
        </>
      ) : (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>참여 중인 그룹이 없어요</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 24,
    paddingTop: 60,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backBtn: {
    marginBottom: 24,
  },
  backText: {
    fontSize: 14,
    color: '#555',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#222',
    marginBottom: 16,
  },
  codeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    padding: 12,
    marginBottom: 24,
    gap: 10,
  },
  codeLabel: {
    fontSize: 12,
    color: '#888',
  },
  codeValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#222',
    letterSpacing: 3,
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  avatarFallback: {
    backgroundColor: '#d0d0d0',
  },
  memberInfo: {
    flex: 1,
    gap: 2,
  },
  memberName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#222',
  },
  memberRole: {
    fontSize: 11,
    color: '#aaa',
  },
  removeBtn: {
    backgroundColor: '#fff0f0',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  removeBtnText: {
    fontSize: 12,
    color: '#ff4444',
    fontWeight: '600',
  },
  leaveBtn: {
    borderWidth: 1,
    borderColor: '#ff4444',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  leaveBtnText: {
    fontSize: 14,
    color: '#ff4444',
    fontWeight: '600',
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#aaa',
  },
});
