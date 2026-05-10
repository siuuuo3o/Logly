import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { aiApi, AiAssistParams } from '@/src/api/ai';

interface Props {
  params: AiAssistParams;           // 장소·날짜·날씨·본문 등 컨텍스트
  onInsertContent: (text: string) => void;   // 본문에 삽입
  onInsertTitle?: (title: string) => void;   // 제목에 삽입 (선택)
}

type AssistType = 'draft' | 'continue' | 'title';

const BUTTONS: { type: AssistType; label: string; desc: string }[] = [
  { type: 'draft',    label: '📝 초안 제안', desc: '장소·날씨 기반으로 초안을 써줘요' },
  { type: 'continue', label: '✍️ 이어 쓰기', desc: '작성 중인 내용을 이어줘요' },
  { type: 'title',    label: '💡 제목 추천', desc: '내용에 맞는 제목 3개 추천' },
];

export default function AiWritingAssistant({ params, onInsertContent, onInsertTitle }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState<AssistType | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [resultType, setResultType] = useState<AssistType | null>(null);

  const handleAssist = async (type: AssistType) => {
    if (type === 'continue' && !params.content?.trim()) {
      Alert.alert('내용이 없어요', '이어쓰기는 작성 중인 내용이 있을 때 사용할 수 있어요.');
      return;
    }
    if (type === 'title' && !params.content?.trim()) {
      Alert.alert('내용이 없어요', '제목 추천은 본문 내용이 있을 때 사용할 수 있어요.');
      return;
    }

    setLoading(type);
    setResult(null);

    try {
      let res;
      if (type === 'draft')    res = await aiApi.draft(params);
      else if (type === 'continue') res = await aiApi.continueWriting(params);
      else                     res = await aiApi.title(params);

      setResult(res.data.data.result);
      setResultType(type);
    } catch {
      Alert.alert('오류', 'AI 요청 중 문제가 발생했어요. 잠시 후 다시 시도해주세요.');
    } finally {
      setLoading(null);
    }
  };

  const handleApply = () => {
    if (!result) return;
    if (resultType === 'title' && onInsertTitle) {
      onInsertTitle(result.split('\n')[0].trim());
    } else {
      onInsertContent(result);
    }
    setResult(null);
    setResultType(null);
  };

  return (
    <View style={styles.container}>
      {/* 헤더 (접기/펼치기) */}
      <TouchableOpacity style={styles.header} onPress={() => setIsOpen(!isOpen)} activeOpacity={0.7}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerIcon}>✨</Text>
          <View>
            <Text style={styles.headerTitle}>AI 글쓰기 도우미</Text>
            <Text style={styles.headerSub}>막힐 때 도움받아보세요</Text>
          </View>
        </View>
        <Text style={styles.chevron}>{isOpen ? '▲' : '▼'}</Text>
      </TouchableOpacity>

      {/* 펼쳐진 내용 */}
      {isOpen && (
        <View style={styles.body}>
          {/* 버튼 3개 */}
          <View style={styles.buttonList}>
            {BUTTONS.map(({ type, label, desc }) => (
              <TouchableOpacity
                key={type}
                style={styles.assistButton}
                onPress={() => handleAssist(type)}
                disabled={loading !== null}
                activeOpacity={0.7}
              >
                <View style={styles.assistButtonInner}>
                  <Text style={styles.assistLabel}>{label}</Text>
                  <Text style={styles.assistDesc}>{desc}</Text>
                </View>
                {loading === type && <ActivityIndicator size="small" color="#888" />}
              </TouchableOpacity>
            ))}
          </View>

          {/* AI 결과 */}
          {result && (
            <View style={styles.resultBox}>
              <Text style={styles.resultText}>{result}</Text>
              <View style={styles.resultActions}>
                <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
                  <Text style={styles.applyButtonText}>
                    {resultType === 'title' ? '첫 번째 제목 적용' : '본문에 적용'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setResult(null)}>
                  <Text style={styles.discardText}>닫기</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* 안내 문구 */}
          <View style={styles.notice}>
            <Text style={styles.noticeText}>
              💬 AI가 제안한 내용은 참고용이에요. 직접 수정하거나 그대로 사용할 수 있어요.
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderColor: '#e8e8e8',
    borderRadius: 10,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fafafa',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerIcon: {
    fontSize: 18,
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333',
  },
  headerSub: {
    fontSize: 11,
    color: '#aaa',
    marginTop: 1,
  },
  chevron: {
    fontSize: 12,
    color: '#aaa',
  },
  body: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 10,
  },
  buttonList: {
    gap: 8,
  },
  assistButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  assistButtonInner: {
    gap: 2,
  },
  assistLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#333',
  },
  assistDesc: {
    fontSize: 11,
    color: '#888',
  },
  resultBox: {
    backgroundColor: '#f8f8ff',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#dde8ff',
    gap: 10,
  },
  resultText: {
    fontSize: 13,
    color: '#333',
    lineHeight: 20,
  },
  resultActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  applyButton: {
    backgroundColor: '#222',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 6,
  },
  applyButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  discardText: {
    fontSize: 12,
    color: '#aaa',
  },
  notice: {
    backgroundColor: '#fffbe8',
    borderRadius: 8,
    padding: 10,
  },
  noticeText: {
    fontSize: 11,
    color: '#886600',
    lineHeight: 16,
  },
});
