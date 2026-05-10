import { useState } from "react";

const screens = [
  "splash", "onboarding", "login", "home", "record_1", "record_2",
  "map", "trip_list", "trip_detail", "diary_write", "mypage"
];

const screenLabels = {
  splash: "스플래시",
  onboarding: "온보딩",
  login: "로그인",
  home: "홈 (타임라인)",
  record_1: "기록하기 ①",
  record_2: "기록하기 ②",
  map: "지도",
  trip_list: "여행 앨범 목록",
  trip_detail: "여행 앨범 상세",
  diary_write: "여행 일기 작성",
  mypage: "마이페이지",
};

const WireBox = ({ w = "100%", h = 40, label, rounded = 4, bg = "#e8e8e8", border = false, children, style = {}, onClick }) => (
  <div onClick={onClick} style={{
    width: w, height: h, background: bg,
    borderRadius: rounded, display: "flex", alignItems: "center",
    justifyContent: "center", fontSize: 10, color: "#888", fontFamily: "monospace",
    border: border ? "1.5px dashed #bbb" : "none",
    flexShrink: 0, position: "relative", overflow: "hidden", cursor: onClick ? "pointer" : "default", ...style
  }}>
    {label && <span style={{ padding: "0 6px", textAlign: "center", lineHeight: 1.3 }}>{label}</span>}
    {children}
  </div>
);

const Tag = ({ label, color = "#dde8ff", text = "#4466cc" }) => (
  <div style={{ background: color, color: text, borderRadius: 20, padding: "2px 8px", fontSize: 9, fontFamily: "monospace", whiteSpace: "nowrap" }}>
    {label}
  </div>
);

const Row = ({ children, gap = 6, style = {} }) => (
  <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap, ...style }}>{children}</div>
);

const Col = ({ children, gap = 6, style = {} }) => (
  <div style={{ display: "flex", flexDirection: "column", gap, width: "100%", ...style }}>{children}</div>
);

const Divider = () => <div style={{ width: "100%", height: 1, background: "#e8e8e8" }} />;
const Avatar = ({ size = 28 }) => (
  <div style={{ width: size, height: size, borderRadius: "50%", background: "#d0d0d0", flexShrink: 0 }} />
);
const Icon = ({ size = 16 }) => (
  <div style={{ width: size, height: size, borderRadius: 3, background: "#ccc", flexShrink: 0 }} />
);
const MapPin = ({ color = "#ff7a7a" }) => (
  <div style={{ width: 20, height: 20, borderRadius: "50% 50% 50% 0", background: color, transform: "rotate(-45deg)", flexShrink: 0 }} />
);

const BottomNav = ({ active, onNavigate }) => {
  const tabs = [
    { key: "home", label: "홈" },
    { key: "map", label: "지도" },
    { key: "record_1", label: "기록" },
    { key: "trip_list", label: "앨범" },
    { key: "mypage", label: "MY" },
  ];
  return (
    <div style={{
      position: "absolute", bottom: 0, left: 0, right: 0,
      height: 52, background: "#fff", borderTop: "1px solid #eee",
      display: "flex", alignItems: "center", justifyContent: "space-around", padding: "0 4px"
    }}>
      {tabs.map(t => (
        <div key={t.key} onClick={() => onNavigate(t.key)}
          style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, cursor: "pointer" }}>
          <div style={{ width: 20, height: 20, borderRadius: 4, background: active === t.key ? "#222" : "#ddd" }} />
          <span style={{ fontSize: 8, color: active === t.key ? "#222" : "#aaa", fontFamily: "monospace" }}>{t.label}</span>
        </div>
      ))}
    </div>
  );
};

const StatusBar = () => (
  <div style={{ height: 24, background: "transparent", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 14px" }}>
    <span style={{ fontSize: 9, fontFamily: "monospace", color: "#555" }}>9:41</span>
    <Row gap={4}>
      {[16, 12, 14].map((w, i) => <div key={i} style={{ width: w, height: 8, background: "#bbb", borderRadius: 2 }} />)}
    </Row>
  </div>
);

const TopBar = ({ title, right }) => (
  <div style={{ height: 40, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 14px", borderBottom: "1px solid #f0f0f0" }}>
    <span style={{ fontSize: 12, fontWeight: 700, fontFamily: "monospace", color: "#222" }}>{title}</span>
    {right}
  </div>
);

// ── 화면 컴포넌트들 ──────────────────────────

function SplashScreen() {
  return (
    <Col gap={0} style={{ height: "100%", background: "#1a1a1a", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: 64, height: 64, borderRadius: 16, background: "#fff", marginBottom: 16 }} />
      <div style={{ width: 80, height: 14, background: "#fff", borderRadius: 3, marginBottom: 8 }} />
      <div style={{ width: 120, height: 10, background: "#555", borderRadius: 3 }} />
    </Col>
  );
}

function OnboardingScreen({ onNavigate }) {
  return (
    <Col gap={0} style={{ height: "100%", background: "#fafafa", alignItems: "center" }}>
      <div style={{ flex: 1, width: "100%", background: "#e8e8e8", position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Col gap={8} style={{ alignItems: "center" }}>
          <div style={{ width: 80, height: 80, borderRadius: "50%", background: "#ccc" }} />
          <div style={{ width: 100, height: 10, background: "#bbb", borderRadius: 3 }} />
          <div style={{ width: 140, height: 8, background: "#ccc", borderRadius: 3 }} />
          <div style={{ width: 120, height: 8, background: "#ccc", borderRadius: 3 }} />
        </Col>
        <Row gap={6} style={{ position: "absolute", bottom: 16 }}>
          {[0, 1, 2].map(i => <div key={i} style={{ width: i === 0 ? 20 : 8, height: 8, borderRadius: 4, background: i === 0 ? "#333" : "#ccc" }} />)}
        </Row>
      </div>
      <Col gap={10} style={{ padding: "20px 20px 32px", alignItems: "center" }}>
        <div style={{ fontSize: 13, fontWeight: 700, fontFamily: "monospace", color: "#222" }}>일상과 여행을 하나로</div>
        <div style={{ fontSize: 9, fontFamily: "monospace", color: "#888", textAlign: "center", lineHeight: 1.6 }}>소중한 순간을 기록하고{"\n"}나만의 감성 일기로 완성해요</div>
        <WireBox h={36} label="시작하기" bg="#222" rounded={18} style={{ color: "#fff", width: "100%" }} onClick={() => onNavigate("login")} />
        <WireBox h={36} label="로그인" bg="#fff" border rounded={18} style={{ width: "100%" }} onClick={() => onNavigate("login")} />
      </Col>
    </Col>
  );
}

function LoginScreen({ onNavigate }) {
  return (
    <Col gap={0} style={{ height: "100%", background: "#fff" }}>
      <StatusBar />
      <Col gap={16} style={{ padding: "24px 20px", flex: 1 }}>
        <div style={{ fontSize: 16, fontWeight: 700, fontFamily: "monospace", color: "#222", marginBottom: 8 }}>로그인</div>
        <Col gap={8}>
          <div style={{ fontSize: 9, fontFamily: "monospace", color: "#555" }}>이메일</div>
          <WireBox h={38} border label="email@example.com" bg="#f8f8f8" rounded={8} />
        </Col>
        <Col gap={8}>
          <div style={{ fontSize: 9, fontFamily: "monospace", color: "#555" }}>비밀번호</div>
          <WireBox h={38} border label="••••••••" bg="#f8f8f8" rounded={8} />
        </Col>
        <WireBox h={40} label="로그인" bg="#222" rounded={10} style={{ color: "#fff", marginTop: 8 }} onClick={() => onNavigate("home")} />
        <Divider />
        <Col gap={8}>
          <WireBox h={38} border label="🍎  Apple로 계속하기" bg="#fff" rounded={10} onClick={() => onNavigate("home")} />
          <WireBox h={38} border label="🔍  Google로 계속하기" bg="#fff" rounded={10} onClick={() => onNavigate("home")} />
          <WireBox h={38} border label="💬  카카오로 계속하기" bg="#FEE500" rounded={10} onClick={() => onNavigate("home")} />
        </Col>
        <div style={{ fontSize: 9, fontFamily: "monospace", color: "#aaa", textAlign: "center" }}>
          아직 계정이 없으신가요? <span style={{ color: "#222", textDecoration: "underline" }}>회원가입</span>
        </div>
      </Col>
    </Col>
  );
}

function HomeScreen({ onNavigate }) {
  const records = [
    { date: "2026.03.10", place: "성수동 카페", tag: "일상", imgs: 2, hasDiary: true },
    { date: "2026.03.08", place: "북촌 한옥마을", tag: "여행", imgs: 4, hasDiary: false },
    { date: "2026.03.06", place: "한강 공원", tag: "일상", imgs: 3, hasDiary: true },
  ];
  return (
    <Col gap={0} style={{ height: "100%", background: "#fafafa" }}>
      <StatusBar />
      <TopBar title="📍 기록" right={
        <Row gap={8}><Icon size={18} /><Avatar size={24} /></Row>
      } />
      <div style={{ margin: "10px 14px 0", background: "#222", borderRadius: 12, padding: "12px 14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Col gap={3} style={{ width: "auto" }}>
          <div style={{ fontSize: 9, color: "#aaa", fontFamily: "monospace" }}>진행 중인 여행</div>
          <div style={{ fontSize: 11, color: "#fff", fontFamily: "monospace", fontWeight: 700 }}>🗾 제주도 여행</div>
          <div style={{ fontSize: 9, color: "#888", fontFamily: "monospace" }}>03.07 – 03.11 · 기록 8개</div>
        </Col>
        <WireBox w={56} h={28} label="보기 →" bg="#444" rounded={8} style={{ color: "#fff" }} onClick={() => onNavigate("trip_list")} />
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "10px 14px", paddingBottom: 60 }}>
        <Col gap={14}>
          {records.map((r, i) => (
            <Col key={i} gap={6} style={{ background: "#fff", borderRadius: 12, padding: 12, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
              <Row gap={8} style={{ justifyContent: "space-between" }}>
                <Row gap={6}>
                  <MapPin color={r.tag === "여행" ? "#ffaa44" : "#7ab8ff"} />
                  <Col gap={2} style={{ width: "auto" }}>
                    <div style={{ fontSize: 10, fontWeight: 700, fontFamily: "monospace", color: "#222" }}>{r.place}</div>
                    <div style={{ fontSize: 8, color: "#aaa", fontFamily: "monospace" }}>{r.date}</div>
                  </Col>
                </Row>
                <Tag label={r.tag} color={r.tag === "여행" ? "#fff0e0" : "#e8f4ff"} text={r.tag === "여행" ? "#cc6600" : "#2255aa"} />
              </Row>
              <Row gap={4}>
                {Array(Math.min(r.imgs, 3)).fill(0).map((_, j) => (
                  <WireBox key={j} w={j === 0 ? 72 : 48} h={j === 0 ? 72 : 48} rounded={8} bg="#e0e0e0" />
                ))}
              </Row>
              {r.hasDiary
                ? <Row gap={4} style={{ background: "#f8f8f8", borderRadius: 8, padding: "6px 8px" }}>
                    <div style={{ fontSize: 8, color: "#888", fontFamily: "monospace" }}>✏️</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ width: "90%", height: 7, background: "#e0e0e0", borderRadius: 3, marginBottom: 3 }} />
                      <div style={{ width: "70%", height: 7, background: "#e0e0e0", borderRadius: 3 }} />
                    </div>
                  </Row>
                : <WireBox h={26} border label="✏️ 일기 작성하기" bg="#fafafa" rounded={8} style={{ fontSize: 9, color: "#aaa" }} onClick={() => onNavigate("diary_write")} />
              }
              <Row gap={4}>
                <WireBox w={50} h={18} label="☀️ 12°C" bg="#fff9e0" rounded={10} style={{ fontSize: 8 }} />
                <WireBox w={50} h={18} label="💧 맑음" bg="#e8f0ff" rounded={10} style={{ fontSize: 8 }} />
              </Row>
            </Col>
          ))}
        </Col>
      </div>
      <BottomNav active="home" onNavigate={onNavigate} />
    </Col>
  );
}

function Record1Screen({ onNavigate }) {
  return (
    <Col gap={0} style={{ height: "100%", background: "#fff" }}>
      <StatusBar />
      <TopBar title="기록하기" right={<WireBox w={40} h={24} label="닫기" bg="#f0f0f0" rounded={6} />} />
      <Col gap={14} style={{ flex: 1, padding: "16px 14px", overflowY: "auto", paddingBottom: 20 }}>
        <WireBox w="100%" h={160} border label="📷 사진 추가 (최대 10장)" bg="#f5f5f5" rounded={12} />
        <Row gap={8}>
          {[0, 1, 2].map(i => <WireBox key={i} w={64} h={64} rounded={8} bg="#ddd" style={{ flexShrink: 0 }} />)}
          <WireBox w={64} h={64} rounded={8} bg="#f0f0f0" border label="+" />
        </Row>
        <Divider />
        <Row gap={8} style={{ justifyContent: "space-between" }}>
          <div style={{ fontSize: 10, fontFamily: "monospace", color: "#555" }}>📅 날짜</div>
          <WireBox w={100} h={28} label="2026.03.10" bg="#f5f5f5" rounded={6} />
        </Row>
        <Divider />
        <Col gap={6}>
          <div style={{ fontSize: 10, fontFamily: "monospace", color: "#555" }}>📍 장소 태그</div>
          <WireBox w="100%" h={38} border label="장소를 검색하세요" bg="#f8f8f8" rounded={8} />
        </Col>
        <Row gap={8} style={{ justifyContent: "space-between" }}>
          <div style={{ fontSize: 10, fontFamily: "monospace", color: "#555" }}>🌤️ 날씨 (자동)</div>
          <Row gap={6}>
            <WireBox w={50} h={24} label="맑음" bg="#fff9e0" rounded={10} />
            <WireBox w={40} h={24} label="12°C" bg="#e8f4ff" rounded={10} />
          </Row>
        </Row>
        <Divider />
        <Col gap={6}>
          <div style={{ fontSize: 10, fontFamily: "monospace", color: "#555" }}>구분</div>
          <Row gap={8}>
            <WireBox w={70} h={30} label="📌 일상" bg="#222" rounded={20} style={{ color: "#fff" }} />
            <WireBox w={70} h={30} label="✈️ 여행" bg="#f0f0f0" rounded={20} />
          </Row>
        </Col>
        <WireBox w="100%" h={44} label="다음 →" bg="#222" rounded={10} style={{ color: "#fff" }} onClick={() => onNavigate("record_2")} />
      </Col>
    </Col>
  );
}

function Record2Screen({ onNavigate }) {
  return (
    <Col gap={0} style={{ height: "100%", background: "#fff" }}>
      <StatusBar />
      <TopBar title="기록하기" right={<WireBox w={48} h={24} label="← 이전" bg="#f0f0f0" rounded={6} onClick={() => onNavigate("record_1")} />} />
      <Col gap={14} style={{ flex: 1, padding: "16px 14px", overflowY: "auto", paddingBottom: 20 }}>
        <Col gap={6}>
          <div style={{ fontSize: 10, fontFamily: "monospace", color: "#555" }}>✏️ 일기 작성 <span style={{ color: "#bbb" }}>(선택)</span></div>
          <WireBox w="100%" h={140} border bg="#fafafa" rounded={10} style={{ alignItems: "flex-start", justifyContent: "flex-start", padding: 10 }}>
            <div style={{ fontSize: 9, color: "#bbb", fontFamily: "monospace" }}>오늘의 이야기를 써보세요...</div>
          </WireBox>
          {/* AI 보조 툴바 */}
          <div style={{ background: "#f0f0f0", borderRadius: 8, padding: "6px 10px" }}>
            <div style={{ fontSize: 8, color: "#888", fontFamily: "monospace", marginBottom: 5 }}>✨ AI 글쓰기 도우미</div>
            <Row gap={6}>
              <WireBox w="auto" h={22} label="초안 제안" bg="#fff" rounded={6} style={{ padding: "0 8px", fontSize: 8, color: "#555", width: "auto" }} border />
              <WireBox w="auto" h={22} label="이어 쓰기" bg="#fff" rounded={6} style={{ padding: "0 8px", fontSize: 8, color: "#555", width: "auto" }} border />
              <WireBox w="auto" h={22} label="제목 추천" bg="#fff" rounded={6} style={{ padding: "0 8px", fontSize: 8, color: "#555", width: "auto" }} border />
            </Row>
            <div style={{ fontSize: 7, color: "#bbb", fontFamily: "monospace", marginTop: 4 }}>AI는 참고용이에요. 최종 내용은 직접 수정할 수 있어요.</div>
          </div>
          <div style={{ fontSize: 8, fontFamily: "monospace", color: "#bbb", textAlign: "right" }}>0 / 1000</div>
        </Col>
        <Divider />
        <Col gap={8}>
          <div style={{ fontSize: 10, fontFamily: "monospace", color: "#555" }}>👫 공유 설정</div>
          <Row gap={8}>
            <WireBox w={70} h={30} label="나만 보기" bg="#222" rounded={20} style={{ color: "#fff" }} />
            <WireBox w={70} h={30} label="함께 보기" bg="#f0f0f0" rounded={20} />
          </Row>
        </Col>
        <Divider />
        <Col gap={8}>
          <div style={{ fontSize: 10, fontFamily: "monospace", color: "#555" }}>✈️ 여행 앨범 연결</div>
          <WireBox w="100%" h={38} border label="여행을 선택하세요" bg="#f8f8f8" rounded={8} />
        </Col>
        <WireBox w="100%" h={44} label="✅ 기록 저장" bg="#222" rounded={10} style={{ color: "#fff" }} onClick={() => onNavigate("home")} />
      </Col>
    </Col>
  );
}

function MapScreen({ onNavigate }) {
  const pins = [
    { x: 60, y: 80, color: "#ffaa44" },
    { x: 120, y: 120, color: "#7ab8ff" },
    { x: 90, y: 160, color: "#ffaa44" },
    { x: 150, y: 90, color: "#7ab8ff" },
    { x: 40, y: 200, color: "#ffaa44" },
  ];
  return (
    <Col gap={0} style={{ height: "100%", background: "#fff" }}>
      <StatusBar />
      <TopBar title="지도" right={
        <Row gap={6}>
          <Tag label="여행" color="#fff0e0" text="#cc6600" />
          <Tag label="일상" color="#e8f4ff" text="#2255aa" />
        </Row>
      } />
      <div style={{ padding: "8px 14px" }}>
        <WireBox w="100%" h={34} border label="🔍 장소 검색" bg="#f8f8f8" rounded={20} />
      </div>
      <div style={{ flex: 1, background: "#e8ede8", position: "relative", margin: "0 0 52px" }}>
        {[...Array(6)].map((_, i) => (
          <div key={i} style={{ position: "absolute", left: 0, right: 0, top: i * 40, height: 1, background: "rgba(255,255,255,0.4)" }} />
        ))}
        {[...Array(5)].map((_, i) => (
          <div key={i} style={{ position: "absolute", top: 0, bottom: 0, left: i * 55, width: 1, background: "rgba(255,255,255,0.4)" }} />
        ))}
        <div style={{ position: "absolute", top: 100, left: 0, right: 0, height: 8, background: "rgba(255,255,255,0.6)", borderRadius: 4 }} />
        <div style={{ position: "absolute", left: 100, top: 0, bottom: 0, width: 8, background: "rgba(255,255,255,0.6)", borderRadius: 4 }} />
        {pins.map((p, i) => (
          <div key={i} style={{ position: "absolute", left: p.x, top: p.y }}>
            <div style={{ width: 16, height: 16, borderRadius: "50% 50% 50% 0", background: p.color, transform: "rotate(-45deg)", boxShadow: "0 1px 4px rgba(0,0,0,0.3)" }} />
          </div>
        ))}
        <svg style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", pointerEvents: "none" }}>
          <polyline points="68,88 98,168 48,208" stroke="#ffaa44" strokeWidth="2" strokeDasharray="4,3" fill="none" opacity="0.7" />
        </svg>
        <div style={{ position: "absolute", bottom: 12, left: 12, right: 12, background: "#fff", borderRadius: 12, padding: "10px 12px", boxShadow: "0 2px 12px rgba(0,0,0,0.15)" }}>
          <Row gap={8}>
            <WireBox w={48} h={48} rounded={8} bg="#ddd" />
            <Col gap={3} style={{ flex: 1, width: "auto" }}>
              <div style={{ fontSize: 10, fontWeight: 700, fontFamily: "monospace", color: "#222" }}>성수동 카페</div>
              <div style={{ fontSize: 8, color: "#aaa", fontFamily: "monospace" }}>2026.03.10 · 맑음 12°C</div>
              <div style={{ width: "80%", height: 7, background: "#eee", borderRadius: 3 }} />
            </Col>
            <Icon size={18} />
          </Row>
        </div>
      </div>
      <BottomNav active="map" onNavigate={onNavigate} />
    </Col>
  );
}

function TripListScreen({ onNavigate }) {
  const trips = [
    { name: "제주도 여행", date: "03.07 – 03.11", count: 8, diaryCount: 3, active: true },
    { name: "부산 겨울 바다", date: "02.14 – 02.16", count: 12, diaryCount: 5, active: false },
    { name: "강릉 커피 투어", date: "01.20 – 01.21", count: 6, diaryCount: 2, active: false },
  ];
  return (
    <Col gap={0} style={{ height: "100%", background: "#fafafa" }}>
      <StatusBar />
      <TopBar title="✈️ 여행 앨범" right={<WireBox w={28} h={28} label="+" bg="#222" rounded={8} style={{ color: "#fff" }} />} />
      <div style={{ flex: 1, overflowY: "auto", padding: "10px 14px", paddingBottom: 60 }}>
        <Col gap={10}>
          {trips.map((t, i) => (
            <div key={i} onClick={() => onNavigate("trip_detail")}
              style={{ background: "#fff", borderRadius: 14, overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", cursor: "pointer" }}>
              <WireBox w="100%" h={100} bg="#ddd" rounded={0} label="📸 커버 사진" />
              <Col gap={6} style={{ padding: "10px 12px" }}>
                <Row gap={6} style={{ justifyContent: "space-between" }}>
                  <div style={{ fontSize: 11, fontWeight: 700, fontFamily: "monospace", color: "#222" }}>{t.name}</div>
                  {t.active && <Tag label="진행 중" color="#e8ffe8" text="#228833" />}
                </Row>
                <Row gap={10}>
                  <div style={{ fontSize: 8, color: "#aaa", fontFamily: "monospace" }}>📅 {t.date}</div>
                  <div style={{ fontSize: 8, color: "#aaa", fontFamily: "monospace" }}>📝 기록 {t.count}개</div>
                  <div style={{ fontSize: 8, color: "#aaa", fontFamily: "monospace" }}>✏️ 일기 {t.diaryCount}개</div>
                </Row>
              </Col>
            </div>
          ))}
        </Col>
      </div>
      <BottomNav active="trip_list" onNavigate={onNavigate} />
    </Col>
  );
}

function TripDetailScreen({ onNavigate }) {
  return (
    <Col gap={0} style={{ height: "100%", background: "#fafafa" }}>
      <StatusBar />
      <div style={{ position: "relative" }}>
        <WireBox w="100%" h={140} bg="#ccc" rounded={0} label="📸 여행 커버 사진" />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(transparent 40%, rgba(0,0,0,0.6))" }} />
        <div style={{ position: "absolute", bottom: 12, left: 14 }}>
          <div style={{ fontSize: 14, fontWeight: 700, fontFamily: "monospace", color: "#fff" }}>제주도 여행 🗾</div>
          <div style={{ fontSize: 9, color: "rgba(255,255,255,0.7)", fontFamily: "monospace" }}>2026.03.07 – 03.11 · 기록 8개 · 일기 3개</div>
        </div>
        <div style={{ position: "absolute", top: 10, right: 12 }}>
          <WireBox w={32} h={32} label="←" bg="rgba(0,0,0,0.4)" rounded={8} style={{ color: "#fff" }} onClick={() => onNavigate("trip_list")} />
        </div>
      </div>
      {/* 탭 */}
      <Row gap={0} style={{ padding: "0 14px", borderBottom: "1px solid #eee", background: "#fff" }}>
        {["사진", "일기", "지도", "코스"].map((t, i) => (
          <div key={i} style={{ padding: "8px 12px", fontSize: 10, fontFamily: "monospace", color: i === 0 ? "#222" : "#aaa", borderBottom: i === 0 ? "2px solid #222" : "none" }}>
            {t}
          </div>
        ))}
      </Row>
      <div style={{ flex: 1, overflowY: "auto", padding: "10px 14px", paddingBottom: 60 }}>
        {/* 사진 그리드 */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 4, marginBottom: 12 }}>
          {Array(8).fill(0).map((_, i) => (
            <WireBox key={i} h={80} bg="#ddd" rounded={6} w="100%" />
          ))}
        </div>
        <Divider />
        {/* 일기 목록 미리보기 */}
        <div style={{ marginTop: 10 }}>
          <Row gap={6} style={{ justifyContent: "space-between", marginBottom: 8 }}>
            <div style={{ fontSize: 10, fontFamily: "monospace", color: "#555" }}>✏️ 여행 일기</div>
            <WireBox w={60} h={24} label="+ 작성" bg="#222" rounded={8} style={{ color: "#fff" }} onClick={() => onNavigate("diary_write")} />
          </Row>
          <Col gap={8}>
            {["03.08 · 성산일출봉", "03.09 · 애월 카페거리"].map((d, i) => (
              <Row key={i} gap={8} style={{ background: "#fff", borderRadius: 10, padding: "10px 12px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
                <div style={{ fontSize: 16 }}>📝</div>
                <Col gap={3} style={{ flex: 1, width: "auto" }}>
                  <div style={{ fontSize: 9, fontWeight: 700, fontFamily: "monospace", color: "#222" }}>{d}</div>
                  <div style={{ width: "90%", height: 7, background: "#eee", borderRadius: 3 }} />
                  <div style={{ width: "70%", height: 7, background: "#eee", borderRadius: 3 }} />
                </Col>
              </Row>
            ))}
          </Col>
        </div>
      </div>
      <BottomNav active="trip_list" onNavigate={onNavigate} />
    </Col>
  );
}

function DiaryWriteScreen({ onNavigate }) {
  const [aiOpen, setAiOpen] = useState(false);
  return (
    <Col gap={0} style={{ height: "100%", background: "#fff" }}>
      <StatusBar />
      <TopBar title="✏️ 여행 일기" right={
        <Row gap={6}>
          <WireBox w={40} h={26} label="취소" bg="#f0f0f0" rounded={6} onClick={() => onNavigate("trip_detail")} />
          <WireBox w={40} h={26} label="저장" bg="#222" rounded={6} style={{ color: "#fff" }} onClick={() => onNavigate("trip_detail")} />
        </Row>
      } />
      <Col gap={12} style={{ flex: 1, padding: "14px 14px", overflowY: "auto", paddingBottom: 20 }}>
        {/* 날짜 + 장소 */}
        <Row gap={8}>
          <WireBox w={80} h={26} label="📅 03.08" bg="#f5f5f5" rounded={6} />
          <WireBox w={100} h={26} label="📍 성산일출봉" bg="#f5f5f5" rounded={6} />
        </Row>
        {/* 대표 사진 */}
        <Row gap={6}>
          <WireBox w={80} h={80} bg="#ddd" rounded={8} label="대표 사진" />
          <Col gap={4} style={{ flex: 1 }}>
            <div style={{ fontSize: 9, color: "#aaa", fontFamily: "monospace" }}>대표 사진을 선택하세요</div>
            <Row gap={4}>
              {[0,1,2].map(i => <WireBox key={i} w={44} h={44} bg="#e8e8e8" rounded={6} />)}
            </Row>
          </Col>
        </Row>
        {/* 제목 */}
        <Col gap={4}>
          <div style={{ fontSize: 9, fontFamily: "monospace", color: "#555" }}>제목</div>
          <WireBox w="100%" h={36} border label="일기 제목을 입력하세요" bg="#fafafa" rounded={8} />
        </Col>
        {/* 본문 */}
        <Col gap={4}>
          <div style={{ fontSize: 9, fontFamily: "monospace", color: "#555" }}>본문</div>
          <WireBox w="100%" h={160} border bg="#fafafa" rounded={10}
            style={{ alignItems: "flex-start", justifyContent: "flex-start", padding: 10 }}>
            <div style={{ fontSize: 9, color: "#ccc", fontFamily: "monospace" }}>오늘의 이야기를 자유롭게 써보세요...</div>
          </WireBox>
          <div style={{ fontSize: 8, fontFamily: "monospace", color: "#ccc", textAlign: "right" }}>0 / 2000</div>
        </Col>

        {/* ✨ AI 보조 섹션 */}
        <div style={{ border: "1px solid #e8e8e8", borderRadius: 10, overflow: "hidden" }}>
          <Row gap={8} style={{ padding: "10px 12px", background: "#fafafa", justifyContent: "space-between" }}
            onClick={() => setAiOpen(!aiOpen)}>
            <Row gap={6}>
              <div style={{ fontSize: 12 }}>✨</div>
              <Col gap={1} style={{ width: "auto" }}>
                <div style={{ fontSize: 9, fontWeight: 700, fontFamily: "monospace", color: "#333" }}>AI 글쓰기 도우미</div>
                <div style={{ fontSize: 8, color: "#aaa", fontFamily: "monospace" }}>막힐 때 도움받아보세요</div>
              </Col>
            </Row>
            <div style={{ fontSize: 12, color: "#aaa" }}>{aiOpen ? "▲" : "▼"}</div>
          </Row>
          {aiOpen && (
            <Col gap={8} style={{ padding: "10px 12px", borderTop: "1px solid #eee" }}>
              <Row gap={6} style={{ flexWrap: "wrap" }}>
                {[
                  { label: "📝 초안 제안", desc: "사진·장소 기반으로 초안을 써줘요" },
                  { label: "✍️ 이어 쓰기", desc: "작성 중인 내용을 이어줘요" },
                  { label: "💡 제목 추천", desc: "내용에 맞는 제목 3개 추천" },
                ].map((a, i) => (
                  <div key={i} style={{ background: "#f5f5f5", borderRadius: 8, padding: "8px 10px", width: "100%" }}>
                    <div style={{ fontSize: 9, fontWeight: 700, fontFamily: "monospace", color: "#333", marginBottom: 2 }}>{a.label}</div>
                    <div style={{ fontSize: 8, color: "#888", fontFamily: "monospace" }}>{a.desc}</div>
                  </div>
                ))}
              </Row>
              <div style={{ background: "#fffbe8", borderRadius: 8, padding: "7px 10px" }}>
                <div style={{ fontSize: 8, color: "#886600", fontFamily: "monospace" }}>
                  💬 AI가 제안한 내용은 참고용이에요. 직접 수정하거나 그대로 사용할 수 있어요.
                </div>
              </div>
            </Col>
          )}
        </div>
      </Col>
    </Col>
  );
}

function MypageScreen({ onNavigate }) {
  return (
    <Col gap={0} style={{ height: "100%", background: "#fafafa" }}>
      <StatusBar />
      <TopBar title="마이페이지" right={<Icon size={18} />} />
      <div style={{ flex: 1, overflowY: "auto", paddingBottom: 60 }}>
        <Col gap={8} style={{ padding: "20px 14px", alignItems: "center", background: "#fff", marginBottom: 8 }}>
          <Avatar size={60} />
          <div style={{ fontSize: 12, fontWeight: 700, fontFamily: "monospace", color: "#222" }}>홍길동</div>
          <div style={{ fontSize: 9, color: "#aaa", fontFamily: "monospace" }}>user@example.com</div>
          <Row gap={16} style={{ marginTop: 4 }}>
            {[["기록", "42"], ["여행", "7"], ["일기", "18"]].map(([k, v]) => (
              <Col key={k} gap={2} style={{ alignItems: "center", width: "auto" }}>
                <div style={{ fontSize: 13, fontWeight: 700, fontFamily: "monospace", color: "#222" }}>{v}</div>
                <div style={{ fontSize: 8, color: "#aaa", fontFamily: "monospace" }}>{k}</div>
              </Col>
            ))}
          </Row>
        </Col>
        <Col gap={0} style={{ background: "#fff", marginBottom: 8 }}>
          <div style={{ padding: "12px 14px 6px", fontSize: 10, fontWeight: 700, fontFamily: "monospace", color: "#555" }}>👫 공유 멤버</div>
          <Row gap={10} style={{ padding: "6px 14px 12px" }}>
            <Col gap={4} style={{ alignItems: "center", width: "auto" }}>
              <Avatar size={40} />
              <div style={{ fontSize: 8, fontFamily: "monospace", color: "#555" }}>김철수</div>
            </Col>
            <WireBox w={40} h={40} label="+" bg="#f0f0f0" rounded={"50%"} border />
          </Row>
        </Col>
        <Col gap={0} style={{ background: "#fff" }}>
          {["알림 설정", "앱 테마", "AI 도우미 설정", "데이터 내보내기", "공지사항", "로그아웃"].map((item, i, arr) => (
            <div key={i}>
              <Row gap={0} style={{ padding: "13px 14px", justifyContent: "space-between" }}>
                <div style={{ fontSize: 10, fontFamily: "monospace", color: item === "로그아웃" ? "#ff4444" : "#333" }}>{item}</div>
                {item !== "로그아웃" && <div style={{ fontSize: 10, color: "#bbb" }}>›</div>}
              </Row>
              {i < arr.length - 1 && <Divider />}
            </div>
          ))}
        </Col>
      </div>
      <BottomNav active="mypage" onNavigate={onNavigate} />
    </Col>
  );
}

const screenComponents = {
  splash: SplashScreen,
  onboarding: OnboardingScreen,
  login: LoginScreen,
  home: HomeScreen,
  record_1: Record1Screen,
  record_2: Record2Screen,
  map: MapScreen,
  trip_list: TripListScreen,
  trip_detail: TripDetailScreen,
  diary_write: DiaryWriteScreen,
  mypage: MypageScreen,
};

export default function App() {
  const [current, setCurrent] = useState("splash");
  const Screen = screenComponents[current];

  return (
    <div style={{ display: "flex", height: "100vh", background: "#f0f0f0", fontFamily: "monospace" }}>
      {/* 사이드바 */}
      <div style={{ width: 160, background: "#1a1a1a", padding: "20px 0", overflowY: "auto", flexShrink: 0 }}>
        <div style={{ padding: "0 14px 16px", fontSize: 11, color: "#666", borderBottom: "1px solid #333", marginBottom: 10 }}>
          화면 목록
        </div>
        {screens.map(s => (
          <div key={s} onClick={() => setCurrent(s)}
            style={{
              padding: "9px 14px", fontSize: 10,
              color: current === s ? "#fff" : "#888",
              background: current === s ? "#333" : "transparent",
              cursor: "pointer",
              borderLeft: current === s ? "3px solid #fff" : "3px solid transparent"
            }}>
            {screenLabels[s]}
          </div>
        ))}
      </div>

      {/* 메인 */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24, gap: 16, overflowY: "auto" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: "#222", marginBottom: 4 }}>📱 앱 와이어프레임</div>
          <div style={{ fontSize: 11, color: "#888" }}>일상과 여행을 함께 기록하는 감성 다이어리</div>
        </div>

        {/* 폰 목업 */}
        <div style={{
          width: 280, height: 560,
          background: "#fff",
          borderRadius: 40,
          boxShadow: "0 20px 60px rgba(0,0,0,0.2), inset 0 0 0 2px #ddd",
          overflow: "hidden",
          position: "relative",
          border: "8px solid #222",
        }}>
          <div style={{
            position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)",
            width: 80, height: 22, background: "#222", borderRadius: "0 0 14px 14px", zIndex: 10
          }} />
          <div style={{ height: "100%", overflowY: "hidden", position: "relative" }}>
            <Screen onNavigate={setCurrent} />
          </div>
        </div>

        <div style={{ fontSize: 12, color: "#555", fontWeight: 600 }}>{screenLabels[current]}</div>

        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={() => {
            const idx = screens.indexOf(current);
            if (idx > 0) setCurrent(screens[idx - 1]);
          }} style={{ padding: "7px 18px", background: "#fff", border: "1px solid #ddd", borderRadius: 8, cursor: "pointer", fontSize: 11 }}>
            ← 이전
          </button>
          <div style={{ fontSize: 10, color: "#aaa", display: "flex", alignItems: "center" }}>
            {screens.indexOf(current) + 1} / {screens.length}
          </div>
          <button onClick={() => {
            const idx = screens.indexOf(current);
            if (idx < screens.length - 1) setCurrent(screens[idx + 1]);
          }} style={{ padding: "7px 18px", background: "#222", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 11 }}>
            다음 →
          </button>
        </div>
      </div>
    </div>
  );
}
