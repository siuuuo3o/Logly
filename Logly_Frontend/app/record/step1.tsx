// expo install expo-image-picker expo-location react-native-webview
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { WebView } from 'react-native-webview';
import { useRecordStore } from '@/src/store/recordStore';
import { useCategoryStore } from '@/src/store/categoryStore';
import { recordApi } from '@/src/api/record';

const KAKAO_APP_KEY = process.env.EXPO_PUBLIC_KAKAO_MAPS_APP_KEY ?? '';

// ─── 카카오 장소 검색 WebView HTML ──────────────────────────────────────────
function buildPlaceSearchHtml(appKey: string): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
  <script src="https://dapi.kakao.com/v2/maps/sdk.js?appkey=${appKey}&libraries=services"></script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; font-family: -apple-system, sans-serif; }
    body { background: #fff; }
    #searchBox {
      display: flex; align-items: center; gap: 8px;
      padding: 12px 14px; border-bottom: 1px solid #f0f0f0;
      position: sticky; top: 0; background: #fff; z-index: 10;
    }
    #searchInput {
      flex: 1; height: 38px; border: 1px solid #e0e0e0; border-radius: 8px;
      padding: 0 12px; font-size: 14px; outline: none;
    }
    #searchBtn {
      height: 38px; padding: 0 14px; background: #222; color: #fff;
      border: none; border-radius: 8px; font-size: 13px; cursor: pointer; white-space: nowrap;
    }
    #results { overflow-y: auto; }
    .result-item {
      padding: 14px 16px; border-bottom: 1px solid #f5f5f5; cursor: pointer;
    }
    .result-item:active { background: #f8f8f8; }
    .place-name { font-size: 14px; font-weight: 600; color: #222; margin-bottom: 4px; }
    .place-addr { font-size: 12px; color: #888; }
    .place-cat  { font-size: 11px; color: #aaa; margin-top: 2px; }
    #empty { text-align: center; padding: 40px 20px; color: #bbb; font-size: 13px; }
  </style>
</head>
<body>
  <div id="searchBox">
    <input id="searchInput" type="text" placeholder="장소명 또는 주소 검색" />
    <button id="searchBtn" onclick="doSearch()">검색</button>
  </div>
  <div id="results"></div>
  <script>
    var ps = new kakao.maps.services.Places();

    document.getElementById('searchInput').addEventListener('keydown', function(e) {
      if (e.key === 'Enter') doSearch();
    });

    function doSearch() {
      var keyword = document.getElementById('searchInput').value.trim();
      if (!keyword) return;
      ps.keywordSearch(keyword, function(data, status) {
        var results = document.getElementById('results');
        results.innerHTML = '';
        if (status === kakao.maps.services.Status.OK && data.length > 0) {
          data.forEach(function(place) {
            var item = document.createElement('div');
            item.className = 'result-item';
            item.innerHTML =
              '<div class="place-name">' + place.place_name + '</div>' +
              '<div class="place-addr">' + (place.road_address_name || place.address_name) + '</div>' +
              '<div class="place-cat">' + (place.category_group_name || '') + '</div>';
            item.addEventListener('click', function() {
              if (window.ReactNativeWebView) {
                window.ReactNativeWebView.postMessage(JSON.stringify({
                  name: place.place_name,
                  address: place.road_address_name || place.address_name,
                  latitude: parseFloat(place.y),
                  longitude: parseFloat(place.x),
                  categoryGroupCode: place.category_group_code
                }));
              }
            });
            results.appendChild(item);
          });
        } else {
          results.innerHTML = '<div id="empty">검색 결과가 없습니다.</div>';
        }
      });
    }
  </script>
</body>
</html>`;
}

// 카카오 카테고리 코드 → 기본 카테고리 이름 (자동 매칭용)
function mapKakaoCategoryName(code: string): string | null {
  if (code === 'CE7') return '카페';
  if (code === 'FD6') return '음식점';
  if (code === 'AT4') return '자연';
  return null;
}

export default function RecordStep1Screen() {
  const router = useRouter();
  const { draft, setDraft } = useRecordStore();
  const { categories, fetchCategories } = useCategoryStore();

  const [placeName, setPlaceName] = useState(draft.placeName);
  const [placeAddress, setPlaceAddress] = useState(draft.placeAddress);
  const [placeLatitude, setPlaceLatitude] = useState<number | null>(draft.latitude);
  const [placeLongitude, setPlaceLongitude] = useState<number | null>(draft.longitude);
  const [categoryId, setCategoryId] = useState<number | null>(draft.categoryId);
  const [type, setType] = useState<'DAILY' | 'TRAVEL'>(draft.type);
  const [recordedAt, setRecordedAt] = useState(draft.recordedAt);
  const [images, setImages] = useState<string[]>(draft.images);
  const [weather, setWeather] = useState<string | null>(draft.weather);
  const [temperature, setTemperature] = useState<number | null>(draft.temperature);
  const [isWeatherLoading, setIsWeatherLoading] = useState(false);
  const [showPlaceSearch, setShowPlaceSearch] = useState(false);

  const placeSearchHtml = buildPlaceSearchHtml(KAKAO_APP_KEY);

  useEffect(() => {
    fetchCategories();
  }, []);

  // 카테고리 로드 후 미선택 상태면 '기타' 기본값으로
  useEffect(() => {
    if (categoryId == null && categories.length > 0) {
      const fallback = categories.find((c) => c.name === '기타') ?? categories[0];
      setCategoryId(fallback.id);
    }
  }, [categories]);

  const handlePickImages = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('권한 필요', '사진 접근 권한이 필요합니다.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
      selectionLimit: 10,
    });

    if (!result.canceled) {
      const selected = result.assets.map((a) => a.uri);
      const combined = [...images, ...selected].slice(0, 10);
      setImages(combined);
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleGetWeather = async () => {
    setIsWeatherLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('권한 필요', '위치 접근 권한이 필요합니다.');
        return;
      }

      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const lat = loc.coords.latitude;
      const lon = loc.coords.longitude;

      const { data } = await recordApi.getWeather(lat, lon);
      setWeather(data.data.weather);
      setTemperature(data.data.temperature);
    } catch {
      Alert.alert('날씨 조회 실패', '날씨 정보를 가져올 수 없습니다.');
    } finally {
      setIsWeatherLoading(false);
    }
  };

  // 장소 검색 결과 수신
  const handlePlaceSelected = useCallback((event: any) => {
    try {
      const place = JSON.parse(event.nativeEvent.data);
      setPlaceName(place.name);
      setPlaceAddress(place.address);
      setPlaceLatitude(place.latitude);
      setPlaceLongitude(place.longitude);

      // 카카오 카테고리 코드 → 매칭되는 기본 카테고리 자동 선택
      const matchName = mapKakaoCategoryName(place.categoryGroupCode);
      if (matchName) {
        const matched = categories.find((c) => c.name === matchName);
        if (matched) setCategoryId(matched.id);
      }

      setShowPlaceSearch(false);
    } catch {}
  }, [categories]);

  const handleNext = async () => {
    if (!placeName.trim()) {
      Alert.alert('장소 입력 필요', '장소명을 입력해주세요.');
      return;
    }

    let latitude = placeLatitude;
    let longitude = placeLongitude;

    if (latitude == null || longitude == null) {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
          latitude = loc.coords.latitude;
          longitude = loc.coords.longitude;
        }
      } catch {
        latitude = 37.5665;
        longitude = 126.978;
      }
    }

    setDraft({
      placeName: placeName.trim(),
      placeAddress: placeAddress.trim() || placeName.trim(),
      categoryId,
      latitude: latitude ?? 37.5665,
      longitude: longitude ?? 126.978,
      type,
      recordedAt,
      weather,
      temperature,
      images,
    });

    router.push('/record/step2' as any);
  };

  return (
    <View style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.replace('/(tabs)/' as any)} style={styles.backButton}>
          <Text style={styles.backText}>{'←'}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>기록하기 ①</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* 사진 선택 */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>사진 <Text style={styles.sectionHint}>(최대 10장)</Text></Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageRow}>
            <TouchableOpacity style={styles.addImageButton} onPress={handlePickImages}>
              <Text style={styles.addImageIcon}>+</Text>
              <Text style={styles.addImageText}>{images.length}/10</Text>
            </TouchableOpacity>
            {images.map((uri, idx) => (
              <View key={uri + idx} style={styles.imageWrapper}>
                <Image source={{ uri }} style={styles.imageThumb} />
                <TouchableOpacity
                  style={styles.removeImageButton}
                  onPress={() => handleRemoveImage(idx)}
                >
                  <Text style={styles.removeImageText}>×</Text>
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* 날짜 */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>날짜</Text>
          <TextInput
            style={styles.input}
            value={recordedAt}
            onChangeText={setRecordedAt}
            placeholder="YYYY-MM-DD"
            maxLength={10}
          />
        </View>

        {/* 구분 */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>구분</Text>
          <View style={styles.toggleRow}>
            {(['DAILY', 'TRAVEL'] as const).map((t) => (
              <TouchableOpacity
                key={t}
                style={[styles.toggleButton, type === t && styles.toggleButtonActive]}
                onPress={() => setType(t)}
              >
                <Text style={[styles.toggleButtonText, type === t && styles.toggleButtonTextActive]}>
                  {t === 'DAILY' ? '일상' : '여행'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* 장소 */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>장소</Text>

          <TouchableOpacity style={styles.placeSearchBtn} onPress={() => setShowPlaceSearch(true)}>
            <Text style={styles.placeSearchIcon}>🔍</Text>
            <Text style={[styles.placeSearchText, placeName ? styles.placeSearchTextFilled : null]}>
              {placeName || '장소 검색하기'}
            </Text>
            {placeLatitude != null && (
              <Text style={styles.placeCoordBadge}>📍</Text>
            )}
          </TouchableOpacity>

          {placeAddress ? (
            <Text style={styles.placeAddressText}>{placeAddress}</Text>
          ) : null}

          <TextInput
            style={[styles.input, styles.inputMarginTop]}
            value={placeName}
            onChangeText={(v) => { setPlaceName(v); setPlaceLatitude(null); setPlaceLongitude(null); }}
            placeholder="또는 직접 입력"
            returnKeyType="next"
          />
        </View>

        {/* 카테고리 */}
        <View style={styles.section}>
          <View style={styles.sectionRow}>
            <Text style={styles.sectionLabel}>카테고리</Text>
            <TouchableOpacity onPress={() => router.push('/mypage/categories' as any)}>
              <Text style={styles.sectionAction}>편집 ›</Text>
            </TouchableOpacity>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryRow}
          >
            {categories.map((cat) => {
              const active = categoryId === cat.id;
              return (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.categoryChip,
                    active && {
                      backgroundColor: cat.color,
                      borderColor: cat.color,
                    },
                  ]}
                  onPress={() => setCategoryId(cat.id)}
                >
                  {cat.icon ? (
                    <Text style={styles.categoryChipIcon}>{cat.icon}</Text>
                  ) : (
                    <View style={[styles.categoryChipDot, { backgroundColor: cat.color }]} />
                  )}
                  <Text
                    style={[
                      styles.categoryChipText,
                      active && styles.categoryChipTextActive,
                    ]}
                  >
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* 날씨 */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>날씨</Text>
          <View style={styles.weatherRow}>
            {weather ? (
              <View style={styles.weatherDisplay}>
                <Text style={styles.weatherValue}>{weather}</Text>
                {temperature != null && (
                  <Text style={styles.tempValue}>{temperature}°C</Text>
                )}
              </View>
            ) : (
              <Text style={styles.weatherEmpty}>날씨 정보 없음</Text>
            )}
            <TouchableOpacity
              style={styles.weatherButton}
              onPress={handleGetWeather}
              disabled={isWeatherLoading}
            >
              {isWeatherLoading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.weatherButtonText}>현재 날씨 가져오기</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* 다음 버튼 */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.nextButtonText}>다음</Text>
        </TouchableOpacity>
      </View>

      {/* 장소 검색 모달 */}
      <Modal
        visible={showPlaceSearch}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowPlaceSearch(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>장소 검색</Text>
            <TouchableOpacity onPress={() => setShowPlaceSearch(false)} style={styles.modalCloseBtn}>
              <Text style={styles.modalCloseText}>닫기</Text>
            </TouchableOpacity>
          </View>
          <WebView
            source={{ html: placeSearchHtml, baseUrl: 'https://localhost' }}
            originWhitelist={['*']}
            javaScriptEnabled
            domStorageEnabled
            onMessage={handlePlaceSelected}
          />
        </View>
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
    paddingHorizontal: 16,
    paddingTop: 56,
    paddingBottom: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backText: {
    fontSize: 22,
    color: '#222',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 17,
    fontWeight: '700',
    color: '#222',
  },
  headerRight: {
    width: 36,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    gap: 24,
    paddingBottom: 40,
  },
  section: {
    gap: 8,
  },
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333',
  },
  sectionHint: {
    fontSize: 12,
    fontWeight: '400',
    color: '#aaa',
  },
  sectionAction: {
    fontSize: 12,
    color: '#888',
  },
  imageRow: {
    flexDirection: 'row',
  },
  addImageButton: {
    width: 80,
    height: 80,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#ddd',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    backgroundColor: '#f8f8f8',
  },
  addImageIcon: {
    fontSize: 22,
    color: '#bbb',
  },
  addImageText: {
    fontSize: 11,
    color: '#bbb',
    marginTop: 2,
  },
  imageWrapper: {
    position: 'relative',
    marginRight: 8,
  },
  imageThumb: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  removeImageButton: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#333',
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeImageText: {
    color: '#fff',
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '700',
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 14,
    color: '#222',
  },
  inputMarginTop: {
    marginTop: 4,
  },
  placeSearchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 11,
    gap: 8,
  },
  placeSearchIcon: {
    fontSize: 14,
  },
  placeSearchText: {
    flex: 1,
    fontSize: 14,
    color: '#aaa',
  },
  placeSearchTextFilled: {
    color: '#222',
    fontWeight: '500',
  },
  placeCoordBadge: {
    fontSize: 14,
  },
  placeAddressText: {
    fontSize: 12,
    color: '#888',
    paddingHorizontal: 2,
  },
  categoryRow: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 4,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
  },
  categoryChipIcon: {
    fontSize: 13,
  },
  categoryChipDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  categoryChipText: {
    fontSize: 13,
    color: '#666',
  },
  categoryChipTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  toggleRow: {
    flexDirection: 'row',
    gap: 10,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  toggleButtonActive: {
    backgroundColor: '#222',
    borderColor: '#222',
  },
  toggleButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  toggleButtonTextActive: {
    color: '#fff',
    fontWeight: '700',
  },
  weatherRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  weatherDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  weatherValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  tempValue: {
    fontSize: 14,
    color: '#666',
  },
  weatherEmpty: {
    fontSize: 13,
    color: '#bbb',
  },
  weatherButton: {
    backgroundColor: '#4a9eed',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 130,
    alignItems: 'center',
  },
  weatherButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  footer: {
    padding: 16,
    paddingBottom: 32,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  nextButton: {
    backgroundColor: '#222',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#222',
  },
  modalCloseBtn: {
    padding: 4,
  },
  modalCloseText: {
    fontSize: 14,
    color: '#888',
  },
});
