import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { CategoryItem } from '@/src/api/category';
import { useCategoryStore } from '@/src/store/categoryStore';

const COLOR_PRESETS = [
  '#B07A5C', '#E07A5F', '#6BAA5E', '#4A9EED',
  '#7B6CDB', '#D26FAB', '#E8B14B', '#3FA8A0',
  '#666666', '#222222',
];

const ICON_PRESETS = ['', '☕', '🍽️', '🌿', '🏔️', '🏖️', '✈️', '🛍️', '📚', '🎨', '🎵', '🎬', '⚽', '🍷', '📍'];

interface EditState {
  mode: 'create' | 'edit';
  category?: CategoryItem;
  name: string;
  color: string;
  icon: string;
}

export default function CategoriesScreen() {
  const router = useRouter();
  const { categories, fetchCategories, createCategory, updateCategory, deleteCategory } = useCategoryStore();

  const [edit, setEdit] = useState<EditState | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchCategories(true);
  }, []);

  const openCreate = () => {
    setEdit({
      mode: 'create',
      name: '',
      color: COLOR_PRESETS[0],
      icon: '',
    });
  };

  const openEdit = (category: CategoryItem) => {
    setEdit({
      mode: 'edit',
      category,
      name: category.name,
      color: category.color,
      icon: category.icon ?? '',
    });
  };

  const handleSave = async () => {
    if (!edit) return;
    if (!edit.name.trim()) {
      Alert.alert('이름 입력 필요', '카테고리 이름을 입력해주세요.');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name: edit.name.trim(),
        color: edit.color,
        icon: edit.icon || undefined,
      };
      if (edit.mode === 'create') {
        await createCategory(payload);
      } else if (edit.category) {
        await updateCategory(edit.category.id, payload);
      }
      setEdit(null);
    } catch (e: any) {
      const msg = e?.response?.data?.message ?? '저장 중 오류가 발생했습니다.';
      Alert.alert('저장 실패', msg);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (category: CategoryItem) => {
    if (category.isDefault) {
      Alert.alert('삭제 불가', '기본 카테고리는 삭제할 수 없습니다.\n색상이나 이름은 수정할 수 있어요.');
      return;
    }
    Alert.alert(
      '카테고리 삭제',
      `'${category.name}' 카테고리를 삭제하시겠어요?\n이 카테고리에 연결된 기록은 카테고리가 비워집니다.`,
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteCategory(category.id);
            } catch (e: any) {
              const msg = e?.response?.data?.message ?? '삭제 중 오류가 발생했습니다.';
              Alert.alert('삭제 실패', msg);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
          <Text style={styles.headerBtnText}>{'←'}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>카테고리</Text>
        <TouchableOpacity onPress={openCreate} style={styles.headerBtn}>
          <Text style={styles.headerBtnText}>＋</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.list}>
        {categories.length === 0 ? (
          <View style={styles.empty}>
            <ActivityIndicator color="#888" />
          </View>
        ) : (
          categories.map((cat) => (
            <View key={cat.id} style={styles.row}>
              <View style={[styles.colorDot, { backgroundColor: cat.color }]}>
                {cat.icon ? <Text style={styles.iconText}>{cat.icon}</Text> : null}
              </View>
              <View style={styles.rowInfo}>
                <Text style={styles.rowName}>{cat.name}</Text>
                <Text style={styles.rowMeta}>
                  {cat.isDefault ? '기본' : '사용자 정의'} · {cat.color}
                </Text>
              </View>
              <TouchableOpacity onPress={() => openEdit(cat)} style={styles.rowAction}>
                <Text style={styles.rowActionText}>편집</Text>
              </TouchableOpacity>
              {!cat.isDefault && (
                <TouchableOpacity onPress={() => handleDelete(cat)} style={styles.rowAction}>
                  <Text style={[styles.rowActionText, styles.rowActionDanger]}>삭제</Text>
                </TouchableOpacity>
              )}
            </View>
          ))
        )}
        <Text style={styles.hint}>
          기본 카테고리는 삭제할 수 없지만 이름 / 색상 / 아이콘은 자유롭게 변경할 수 있어요.
        </Text>
      </ScrollView>

      {/* Edit / Create Modal */}
      <Modal
        visible={edit !== null}
        animationType="slide"
        transparent
        onRequestClose={() => setEdit(null)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalOverlay}
        >
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setEdit(null)} />
          <View style={styles.sheet}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>
                {edit?.mode === 'create' ? '카테고리 추가' : '카테고리 편집'}
              </Text>
              <TouchableOpacity onPress={() => setEdit(null)}>
                <Text style={styles.sheetClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 480 }}>
              <View style={styles.field}>
                <Text style={styles.fieldLabel}>이름</Text>
                <TextInput
                  style={styles.input}
                  value={edit?.name ?? ''}
                  onChangeText={(t) => setEdit((s) => (s ? { ...s, name: t } : s))}
                  placeholder="예: 산책, 데이트, 출장…"
                  maxLength={30}
                  autoFocus
                />
              </View>

              <View style={styles.field}>
                <Text style={styles.fieldLabel}>색상</Text>
                <View style={styles.colorGrid}>
                  {COLOR_PRESETS.map((color) => {
                    const active = edit?.color === color;
                    return (
                      <TouchableOpacity
                        key={color}
                        style={[
                          styles.colorSwatch,
                          { backgroundColor: color },
                          active && styles.colorSwatchActive,
                        ]}
                        onPress={() => setEdit((s) => (s ? { ...s, color } : s))}
                      >
                        {active && <Text style={styles.colorCheck}>✓</Text>}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              <View style={styles.field}>
                <Text style={styles.fieldLabel}>아이콘 <Text style={styles.fieldHint}>(선택)</Text></Text>
                <View style={styles.iconGrid}>
                  {ICON_PRESETS.map((icon) => {
                    const active = (edit?.icon ?? '') === icon;
                    return (
                      <TouchableOpacity
                        key={icon || 'none'}
                        style={[styles.iconChip, active && styles.iconChipActive]}
                        onPress={() => setEdit((s) => (s ? { ...s, icon } : s))}
                      >
                        <Text style={styles.iconChipText}>{icon || '없음'}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* 미리보기 */}
              {edit && (
                <View style={styles.preview}>
                  <Text style={styles.previewLabel}>미리보기</Text>
                  <View
                    style={[
                      styles.previewChip,
                      { backgroundColor: edit.color, borderColor: edit.color },
                    ]}
                  >
                    {edit.icon ? <Text style={styles.previewIcon}>{edit.icon}</Text> : null}
                    <Text style={styles.previewText}>{edit.name || '카테고리 이름'}</Text>
                  </View>
                </View>
              )}
            </ScrollView>

            <TouchableOpacity
              style={[styles.saveBtn, saving && { opacity: 0.6 }]}
              onPress={handleSave}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.saveBtnText}>저장</Text>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafafa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 56,
    paddingBottom: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerBtnText: {
    fontSize: 22,
    color: '#222',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#222',
  },
  list: {
    padding: 16,
    gap: 8,
  },
  empty: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: '#eee',
  },
  colorDot: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    fontSize: 16,
  },
  rowInfo: {
    flex: 1,
  },
  rowName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#222',
  },
  rowMeta: {
    fontSize: 11,
    color: '#999',
    marginTop: 2,
  },
  rowAction: {
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  rowActionText: {
    fontSize: 13,
    color: '#555',
    fontWeight: '500',
  },
  rowActionDanger: {
    color: '#e44',
  },
  hint: {
    fontSize: 12,
    color: '#aaa',
    textAlign: 'center',
    marginTop: 16,
    paddingHorizontal: 12,
    lineHeight: 18,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 24,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  sheetTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#222',
  },
  sheetClose: {
    fontSize: 18,
    color: '#888',
    padding: 4,
  },
  field: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    gap: 8,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#444',
  },
  fieldHint: {
    fontWeight: '400',
    color: '#aaa',
    fontSize: 11,
  },
  input: {
    backgroundColor: '#fafafa',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 14,
    color: '#222',
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  colorSwatch: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorSwatchActive: {
    borderWidth: 3,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 3,
  },
  colorCheck: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  iconChip: {
    minWidth: 44,
    height: 36,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconChipActive: {
    backgroundColor: '#222',
    borderColor: '#222',
  },
  iconChipText: {
    fontSize: 14,
    color: '#555',
  },
  preview: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 8,
    alignItems: 'flex-start',
  },
  previewLabel: {
    fontSize: 11,
    color: '#aaa',
  },
  previewChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  previewIcon: {
    fontSize: 14,
  },
  previewText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 13,
  },
  saveBtn: {
    marginHorizontal: 20,
    marginTop: 12,
    backgroundColor: '#222',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  saveBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
});
