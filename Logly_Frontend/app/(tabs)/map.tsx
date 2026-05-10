// 필수 설치: expo install react-native-webview
// 카카오 개발자 콘솔(developers.kakao.com)에서 앱 등록 후 JavaScript 앱 키를 발급받아
// .env에 EXPO_PUBLIC_KAKAO_MAPS_APP_KEY=발급받은키 형식으로 입력하세요.
// 도메인 등록: 카카오 콘솔 > 플랫폼 > Web > 사이트 도메인에 http://localhost 추가 필요

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { mapApi, ClusterPin } from '@/src/api/map';
import { useCategoryStore } from '@/src/store/categoryStore';

const KAKAO_APP_KEY = process.env.EXPO_PUBLIC_KAKAO_MAPS_APP_KEY ?? '';
const FALLBACK_PIN_COLOR = '#888888';

// ─── 카카오맵 HTML ────────────────────────────────────────────────────────────
function buildKakaoMapHtml(appKey: string): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
  <script type="text/javascript"
    src="https://dapi.kakao.com/v2/maps/sdk.js?appkey=${appKey}&libraries=services">
  </script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body { width: 100%; height: 100%; overflow: hidden; }
    #map { width: 100%; height: 100%; }
    .marker-wrap {
      display: flex; flex-direction: column; align-items: center; cursor: pointer;
      padding: 6px; margin: -6px;
    }
    .marker-badge {
      border-radius: 9px; min-width: 18px; height: 18px;
      display: flex; align-items: center; justify-content: center;
      font-size: 10px; font-weight: 700; color: #fff;
      padding: 0 4px; margin-bottom: 3px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.25);
      pointer-events: none;
    }
    .marker-pin {
      filter: drop-shadow(0 2px 4px rgba(0,0,0,0.35));
      pointer-events: none;
    }
    .marker-icon {
      position: absolute; top: 4px; left: 50%; transform: translateX(-50%);
      font-size: 10px; pointer-events: none;
    }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    var map = new kakao.maps.Map(document.getElementById('map'), {
      center: new kakao.maps.LatLng(37.5665, 126.9780),
      level: 7
    });

    var overlays = [];
    var polyline = null;
    var FALLBACK = '${FALLBACK_PIN_COLOR}';

    var ps = new kakao.maps.services.Places();
    function searchPlace(keyword) {
      if (!keyword || !keyword.trim()) return;
      ps.keywordSearch(keyword, function(data, status) {
        if (status === kakao.maps.services.Status.OK && data.length > 0) {
          var first = data[0];
          var lat = parseFloat(first.y);
          var lng = parseFloat(first.x);
          map.setCenter(new kakao.maps.LatLng(lat, lng));
          map.setLevel(4);
          postToRN({ type: 'searchResult', name: first.place_name, lat: lat, lng: lng });
        } else {
          postToRN({ type: 'searchEmpty' });
        }
      });
    }

    function handleMessage(raw) {
      try {
        var msg = JSON.parse(raw);
        if (msg.type === 'setPins')    updatePins(msg.pins, msg.filterCategoryId);
        if (msg.type === 'setCourse')  drawCourse(msg.records);
        if (msg.type === 'clearCourse') clearCourse();
        if (msg.type === 'moveTo')     map.setCenter(new kakao.maps.LatLng(msg.lat, msg.lng));
        if (msg.type === 'search')     searchPlace(msg.keyword);
      } catch(e) {}
    }
    window.addEventListener('message', function(e) { handleMessage(e.data); });
    document.addEventListener('message', function(e) { handleMessage(e.data); });

    function postToRN(obj) {
      if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(JSON.stringify(obj));
      }
    }

    function clearOverlays() {
      overlays.forEach(function(o) { o.setMap(null); });
      overlays = [];
    }

    function updatePins(pins, filterCategoryId) {
      clearOverlays();
      pins.forEach(function(pin) {
        // 카테고리 필터: filterCategoryId 가 null 이 아니면 해당 카테고리만
        // (단순화를 위해 클러스터 단위로 필터: ClusterDto 에 categoryId 가 없으니
        //  서버에서 zoom>=14 일 때 개별 핀, 카테고리 필터는 RN 에서 set 시 미리 거름)
        var color = pin.categoryColor || FALLBACK;

        var wrap = document.createElement('div');
        wrap.className = 'marker-wrap';

        if (pin.count > 1) {
          var badge = document.createElement('div');
          badge.className = 'marker-badge';
          badge.style.background = color;
          badge.textContent = pin.count;
          wrap.appendChild(badge);
        }

        var svgNS = 'http://www.w3.org/2000/svg';
        var svg = document.createElementNS(svgNS, 'svg');
        svg.setAttribute('class', 'marker-pin');
        svg.setAttribute('width', '28');
        svg.setAttribute('height', '36');
        svg.setAttribute('viewBox', '0 0 28 36');

        var path = document.createElementNS(svgNS, 'path');
        path.setAttribute('d', 'M14 0C6.27 0 0 6.27 0 14c0 9.33 14 22 14 22s14-12.67 14-22C28 6.27 21.73 0 14 0z');
        path.setAttribute('fill', color);

        var circle = document.createElementNS(svgNS, 'circle');
        circle.setAttribute('cx', '14');
        circle.setAttribute('cy', '13');
        circle.setAttribute('r', '5.5');
        circle.setAttribute('fill', 'rgba(255,255,255,0.95)');

        svg.appendChild(path);
        svg.appendChild(circle);

        var pinHolder = document.createElement('div');
        pinHolder.style.position = 'relative';
        pinHolder.appendChild(svg);

        if (pin.categoryIcon) {
          var iconDiv = document.createElement('div');
          iconDiv.className = 'marker-icon';
          iconDiv.textContent = pin.categoryIcon;
          pinHolder.appendChild(iconDiv);
        }

        wrap.appendChild(pinHolder);

        function handlePinTap(e) {
          e.stopPropagation();
          e.preventDefault();
          postToRN({ type: 'pinClick', pin: pin });
        }
        wrap.addEventListener('touchend', handlePinTap);
        wrap.addEventListener('click', handlePinTap);

        var overlay = new kakao.maps.CustomOverlay({
          position: new kakao.maps.LatLng(pin.latitude, pin.longitude),
          content: wrap,
          yAnchor: 1
        });
        overlay.setMap(map);
        overlays.push(overlay);
      });
    }

    function drawCourse(records) {
      clearCourse();
      if (records.length < 2) return;
      var path = records.map(function(r) {
        return new kakao.maps.LatLng(r.latitude, r.longitude);
      });
      polyline = new kakao.maps.Polyline({
        path: path,
        strokeWeight: 2,
        strokeColor: '#ffaa44',
        strokeOpacity: 0.85,
        strokeStyle: 'shortdash'
      });
      polyline.setMap(map);
    }

    function clearCourse() {
      if (polyline) { polyline.setMap(null); polyline = null; }
    }

    kakao.maps.event.addListener(map, 'click', function() {
      postToRN({ type: 'mapClick' });
    });

    postToRN({ type: 'mapReady' });
  </script>
</body>
</html>`;
}

// ─── FallbackMap ──────────────────────────────────────────────────────────────
function FallbackMap() {
  return (
    <View style={styles.fallback}>
      <Text style={styles.fallbackIcon}>🗺️</Text>
      <Text style={styles.fallbackTitle}>카카오맵 앱 키를 설정해주세요</Text>
      <View style={styles.fallbackCodeBox}>
        <Text style={styles.fallbackCode}>EXPO_PUBLIC_KAKAO_MAPS_APP_KEY=발급받은키</Text>
      </View>
      <Text style={styles.fallbackSub}>
        developers.kakao.com에서 앱을 등록하고{'\n'}JavaScript 앱 키를 .env에 입력하세요.
      </Text>
    </View>
  );
}

// ─── BottomPopup ──────────────────────────────────────────────────────────────
interface BottomPopupProps {
  pin: ClusterPin | null;
  slideAnim: Animated.Value;
  onClose: () => void;
  onViewDetail: (recordId: number) => void;
}

function BottomPopup({ pin, slideAnim, onClose, onViewDetail }: BottomPopupProps) {
  if (!pin) return null;

  const typeLabel = pin.type === 'TRAVEL' ? '여행' : pin.type === 'DAILY' ? '일상' : '혼합';
  const color = pin.categoryColor || FALLBACK_PIN_COLOR;
  const isSingle = pin.count === 1;

  return (
    <Animated.View style={[styles.popup, { transform: [{ translateY: slideAnim }] }]}>
      <View style={styles.popupHandle} />
      <View style={styles.popupRow}>
        <View style={[styles.popupThumb, { backgroundColor: color + '22' }]}>
          <Text style={styles.popupThumbIcon}>{pin.categoryIcon || '📍'}</Text>
        </View>
        <View style={styles.popupInfo}>
          <View style={styles.popupTitleRow}>
            {pin.categoryName ? (
              <View style={[styles.popupTypeBadge, { backgroundColor: color + '22' }]}>
                <Text style={[styles.popupTypeText, { color }]}>{pin.categoryName}</Text>
              </View>
            ) : null}
            <Text style={styles.popupCountText}>{typeLabel}</Text>
            {pin.count > 1 && (
              <Text style={styles.popupCountText}>· 기록 {pin.count}개</Text>
            )}
          </View>
          {pin.placeName ? (
            <Text style={styles.popupPlaceName} numberOfLines={1}>{pin.placeName}</Text>
          ) : null}
        </View>
        <Pressable style={styles.popupCloseBtn} onPress={onClose} hitSlop={8}>
          <Text style={styles.popupCloseBtnText}>✕</Text>
        </Pressable>
      </View>

      {isSingle && pin.recordIds.length > 0 && (
        <Pressable
          style={[styles.popupDetailBtn, { backgroundColor: color }]}
          onPress={() => onViewDetail(pin.recordIds[0])}
        >
          <Text style={styles.popupDetailBtnText}>상세 보기 →</Text>
        </Pressable>
      )}
      {!isSingle && (
        <Text style={styles.popupMultiHint}>지도를 확대하면 개별 기록을 확인할 수 있어요.</Text>
      )}
    </Animated.View>
  );
}

// ─── MapScreen ────────────────────────────────────────────────────────────────
export default function MapScreen() {
  const insets = useSafeAreaInsets();
  const webViewRef = useRef<WebView>(null);
  const { categories, fetchCategories } = useCategoryStore();

  const [pins, setPins] = useState<ClusterPin[]>([]);
  const [selectedPin, setSelectedPin] = useState<ClusterPin | null>(null);
  // null = 전체, number = 특정 카테고리
  const [filterCategoryName, setFilterCategoryName] = useState<string | null>(null);
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const [pinError, setPinError] = useState<string | null>(null);
  const [zoom] = useState(12);

  const slideAnim = useRef(new Animated.Value(200)).current;
  const htmlContent = buildKakaoMapHtml(KAKAO_APP_KEY);
  const hasKey = KAKAO_APP_KEY.length > 0;

  useEffect(() => {
    fetchCategories();
  }, []);

  const loadPins = useCallback(async () => {
    try {
      setLoading(true);
      setPinError(null);
      const res = await mapApi.getPins(zoom);
      const data = res.data.data ?? [];
      setPins(data);
    } catch (e: any) {
      console.log('[Map] pins error:', e?.response?.status, e?.message);
      setPinError('기록 핀을 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  }, [zoom]);

  useEffect(() => {
    loadPins();
  }, [loadPins]);

  // 필터링된 핀 (카테고리 단위)
  const filteredPins = useMemo(() => {
    if (!filterCategoryName) return pins;
    return pins.filter((p) => p.categoryName === filterCategoryName);
  }, [pins, filterCategoryName]);

  useEffect(() => {
    if (!mapReady) return;
    webViewRef.current?.injectJavaScript(`
      updatePins(${JSON.stringify(filteredPins)}, null); true;
    `);
  }, [mapReady, filteredPins]);

  const showPopup = useCallback((pin: ClusterPin) => {
    setSelectedPin(pin);
    Animated.spring(slideAnim, {
      toValue: 0,
      useNativeDriver: true,
      tension: 80,
      friction: 12,
    }).start();
  }, [slideAnim]);

  const hidePopup = useCallback(() => {
    Animated.spring(slideAnim, {
      toValue: 200,
      useNativeDriver: true,
      tension: 80,
      friction: 12,
    }).start(() => setSelectedPin(null));
  }, [slideAnim]);

  const handleSearch = useCallback(() => {
    if (!searchText.trim() || !mapReady) return;
    webViewRef.current?.injectJavaScript(`
      searchPlace(${JSON.stringify(searchText.trim())}); true;
    `);
  }, [searchText, mapReady]);

  const handleWebViewMessage = useCallback((event: any) => {
    try {
      const msg = JSON.parse(event.nativeEvent.data);
      if (msg.type === 'mapReady') {
        setMapReady(true);
      } else if (msg.type === 'pinClick') {
        showPopup(msg.pin as ClusterPin);
      } else if (msg.type === 'mapClick') {
        hidePopup();
      } else if (msg.type === 'searchEmpty') {
        setPinError('검색 결과가 없습니다.');
        setTimeout(() => setPinError(null), 2000);
      }
    } catch {}
  }, [showPopup, hidePopup]);

  const handleViewDetail = useCallback((recordId: number) => {
    hidePopup();
    router.push(`/record/${recordId}` as any);
  }, [hidePopup]);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* 상단 TopBar */}
      <View style={styles.topBar}>
        <Text style={styles.topBarTitle}>지도</Text>
      </View>

      {/* 카테고리 필터 (수평 스크롤) */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}
        style={styles.filterScroll}
      >
        <Pressable
          style={[styles.filterTag, !filterCategoryName && styles.filterTagActiveAll]}
          onPress={() => setFilterCategoryName(null)}
        >
          <Text style={[styles.filterTagText, !filterCategoryName && styles.filterTagTextActive]}>
            전체
          </Text>
        </Pressable>
        {categories.map((cat) => {
          const active = filterCategoryName === cat.name;
          return (
            <Pressable
              key={cat.id}
              style={[
                styles.filterTag,
                active && { backgroundColor: cat.color, borderColor: cat.color },
              ]}
              onPress={() => setFilterCategoryName(cat.name)}
            >
              {cat.icon ? (
                <Text style={styles.filterTagIcon}>{cat.icon}</Text>
              ) : (
                <View style={[styles.filterTagDot, { backgroundColor: cat.color }]} />
              )}
              <Text style={[styles.filterTagText, active && styles.filterTagTextActive]}>
                {cat.name}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* 검색바 */}
      <View style={styles.searchBarWrapper}>
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="장소 검색"
            placeholderTextColor="#aaa"
            value={searchText}
            onChangeText={setSearchText}
            returnKeyType="search"
            onSubmitEditing={handleSearch}
          />
        </View>
      </View>

      {/* 지도 영역 */}
      <View style={styles.mapContainer}>
        {hasKey ? (
          <WebView
            ref={webViewRef}
            style={StyleSheet.absoluteFillObject}
            source={{ html: htmlContent, baseUrl: 'https://localhost' }}
            originWhitelist={['*']}
            javaScriptEnabled
            domStorageEnabled
            onMessage={handleWebViewMessage}
            scrollEnabled={false}
            bounces={false}
          />
        ) : (
          <FallbackMap />
        )}

        {loading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="small" color="#ffaa44" />
          </View>
        )}
        {pinError && (
          <View style={styles.errorToast}>
            <Text style={styles.errorToastText}>{pinError}</Text>
          </View>
        )}
      </View>

      {/* 하단 팝업 */}
      <BottomPopup
        pin={selectedPin}
        slideAnim={slideAnim}
        onClose={hidePopup}
        onViewDetail={handleViewDetail}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  topBar: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    backgroundColor: '#fff',
  },
  topBarTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#222',
  },
  filterScroll: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  filterRow: {
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 14,
    paddingBottom: 8,
  },
  filterTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  filterTagActiveAll: {
    backgroundColor: '#222',
    borderColor: '#222',
  },
  filterTagIcon: {
    fontSize: 11,
  },
  filterTagDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  filterTagText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  filterTagTextActive: {
    color: '#fff',
    fontWeight: '700',
  },
  searchBarWrapper: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: '#fff',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    borderRadius: 20,
    paddingHorizontal: 14,
    height: 38,
    borderWidth: 1,
    borderColor: '#eee',
  },
  searchIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: '#333',
    padding: 0,
  },
  mapContainer: {
    flex: 1,
    backgroundColor: '#e8ede8',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 12,
    alignSelf: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 20,
    padding: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  popup: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 16,
    paddingBottom: 28,
    paddingTop: 12,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: -4 },
    elevation: 8,
  },
  popupHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#e0e0e0',
    alignSelf: 'center',
    marginBottom: 14,
  },
  popupRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  popupThumb: {
    width: 56,
    height: 56,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  popupThumbIcon: { fontSize: 24 },
  popupInfo: { flex: 1 },
  popupTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  popupTypeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  popupTypeText: { fontSize: 11, fontWeight: '600' },
  popupCountText: { fontSize: 11, color: '#888' },
  popupPlaceName: { fontSize: 12, color: '#666' },
  popupCloseBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  popupCloseBtnText: { fontSize: 12, color: '#888' },
  popupDetailBtn: {
    marginTop: 14,
    height: 42,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  popupDetailBtnText: { fontSize: 14, color: '#fff', fontWeight: '700' },
  popupMultiHint: {
    marginTop: 12,
    fontSize: 11,
    color: '#aaa',
    textAlign: 'center',
  },
  fallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 12,
    backgroundColor: '#f5f7f5',
  },
  fallbackIcon: { fontSize: 48, marginBottom: 8 },
  fallbackTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333',
    textAlign: 'center',
    lineHeight: 22,
  },
  fallbackCodeBox: {
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  fallbackCode: {
    fontSize: 11,
    color: '#7aff88',
    fontFamily: 'monospace',
  },
  fallbackSub: {
    fontSize: 12,
    color: '#888',
    textAlign: 'center',
    lineHeight: 18,
  },
  errorToast: {
    position: 'absolute',
    top: 12,
    alignSelf: 'center',
    backgroundColor: 'rgba(50,50,50,0.85)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  errorToastText: {
    fontSize: 13,
    color: '#fff',
  },
});
