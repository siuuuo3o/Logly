# 🤖 CLAUDE.md — Claude Code 가이드

> 이 파일을 먼저 읽고 개발을 시작해주세요.
> 모든 코드는 아래 문서와 규칙을 기반으로 작성해야 해요.

---

## 📂 참고 문서 (개발 전 반드시 읽기)

| 문서 | 경로 | 설명 |
|------|------|------|
| 개발 가이드 | `docs/DEVELOPMENT_GUIDE.md` | 기술 스택, 기능 정의, API 명세, 컨벤션 |
| ERD | `docs/ERD.mermaid` | DB 테이블 설계 |
| 화면 흐름도 | `docs/SCREEN_FLOW.mermaid` | 화면 간 이동 흐름 |
| 개발 순서 | `docs/DEV_ORDER.md` | Phase별 개발 순서 |
| 와이어프레임 | `docs/wireframe.jsx` | 전체 화면 레이아웃 참고 |

---

## 🛠 기술 스택 요약

### Backend
- **Java 17** + **Spring Boot 3.x** + **Spring Data JPA** (엔티티 관리) + **MyBatis** (조회)
- **MySQL** / **AWS S3** / **JWT 인증**
- **OpenAI GPT-4o API** (AI 글쓰기 보조 — 선택적 기능)

### Frontend
- **React Native (Expo)** + **TypeScript**
- **Zustand** (상태 관리) / **Axios** (HTTP) / **React Navigation**
- **React Native Maps** (Google Maps API)
- **OpenWeatherMap API** (날씨 자동 저장)

---

## 📁 폴더 구조

### Backend
```
src/main/java/com/app/
├── domain/
│   ├── auth/          # 인증 (회원가입, 로그인, JWT)
│   │   ├── controller/
│   │   ├── service/
│   │   ├── repository/ # JPA - 저장/수정/삭제
│   │   ├── mapper/     # MyBatis - 조회
│   │   └── dto/
│   ├── record/        # 기록 (일상 + 여행 통합)
│   ├── trip/          # 여행 앨범
│   ├── place/         # 장소 태그
│   ├── share/         # 공유 그룹 (커플/친구)
│   └── ai/            # AI 글쓰기 보조 ⚠️ 독립 모듈
├── global/
│   ├── config/        # S3, Security, OpenAI, MyBatis 설정
│   ├── exception/     # 공통 예외 처리
│   └── util/
└── Application.java
```

```
src/main/resources/
├── mapper/            # MyBatis XML
│   ├── record/
│   ├── trip/
│   ├── auth/
│   └── ...
└── application.yml
```

### Frontend
```
src/
├── components/
│   ├── common/        # Button, Input, Card 등 공통 컴포넌트
│   ├── record/        # 기록 관련 컴포넌트
│   ├── map/           # 지도 관련 컴포넌트
│   ├── trip/          # 여행 앨범 컴포넌트
│   └── ai/            # AiWritingAssistant ⚠️ 독립 모듈
├── screens/
│   ├── auth/          # 로그인, 회원가입, 온보딩
│   ├── home/          # 홈 타임라인
│   ├── record/        # 기록하기 ①②
│   ├── map/           # 지도
│   ├── trip/          # 여행 앨범 목록, 상세, 일기 작성
│   └── mypage/        # 마이페이지
├── store/             # Zustand 상태 관리
├── api/               # API 호출 모듈
├── navigation/        # React Navigation 설정
└── utils/
```

---

## 📐 코드 규칙

### 공통
- 커밋 메시지: `feat:` `fix:` `docs:` `refactor:` `chore:`
- 브랜치: `feature/기능명`, `fix/버그명`

### Backend
- 패키지 구조: `domain별` 분리 (controller / service / repository / dto / mapper)
- 공통 응답: 반드시 `ApiResponse<T>` 사용
- 예외 처리: `GlobalExceptionHandler`에서 통합 처리
- **Lombok** 사용 (`@RequiredArgsConstructor`, `@Builder`)
- 엔티티에 `BaseTimeEntity` 상속 (`created_at`, `updated_at` 자동화)

#### MyBatis 사용 규칙
- **저장 / 수정 / 삭제**: JPA (`JpaRepository`) 사용
- **조회**: 반드시 **MyBatis** (`@Mapper`) 사용
- MyBatis XML은 `src/main/resources/mapper/도메인명/` 에 위치
- Mapper 인터페이스는 각 도메인 패키지 내 `mapper/` 폴더에 위치

```java
// ✅ 저장 - JPA 사용
recordRepository.save(record);

// ✅ 조회 - MyBatis 사용
@Mapper
public interface RecordMapper {
    List<RecordDto> findTimelineByUserId(@Param("userId") Long userId);
}
```

```xml
<!-- src/main/resources/mapper/record/RecordMapper.xml -->
<select id="findTimelineByUserId" resultType="RecordDto">
    SELECT * FROM record
    WHERE user_id = #{userId}
    ORDER BY recorded_at DESC
</select>
```

#### Controller RequestMapping 규칙
- 클래스 레벨: `@RequestMapping("api/도메인명")` — `/v1` 없이 도메인명만
- 메서드 레벨: 슬래시로 시작하는 경로 명시

```java
// ✅ 올바른 형식
@RestController
@RequestMapping("api/record")
public class RecordController {

    @GetMapping("/")           // 목록 조회
    @PostMapping("/")          // 생성
    @GetMapping("/{id}")       // 단건 조회
    @PatchMapping("/{id}")     // 수정
    @DeleteMapping("/{id}")    // 삭제
}

@RestController
@RequestMapping("api/auth")
public class AuthController {

    @PostMapping("/signup")
    @PostMapping("/login")
    @PostMapping("/reissue")
}
```

```java
// 공통 응답 포맷 예시
{
  "success": true,
  "data": {},
  "message": "요청이 성공적으로 처리되었습니다.",
  "code": "SUCCESS"
}
```

### Frontend
- **함수형 컴포넌트** + **Hooks** 만 사용
- 스타일: `StyleSheet.create()` 사용 (인라인 스타일 지양)
- API 호출: 반드시 `src/api/` 모듈 통해서 호출
- 타입: 모든 컴포넌트 props에 **TypeScript 타입** 명시
- 상태 관리: 서버 데이터는 **Zustand**, 로컬 UI 상태는 **useState**

---

## ⚠️ AI 글쓰기 보조 — 중요 규칙

AI 기능은 언제든 제거할 수 있도록 **완전히 독립적으로** 유지해야 해요.

```
Frontend: src/components/ai/AiWritingAssistant.tsx  ← 이 파일만 독립
Backend:  domain/ai/ 패키지 전체                   ← 이 패키지만 독립
API:      /api/v1/ai/**                            ← 이 라우트만 독립
DB:       ai_assist_log 테이블                     ← 이 테이블만 독립
```

**절대 금지**: AI 로직을 다른 도메인(record, trip 등)에 섞어 쓰지 말 것.
**제거 방법**: 위 4가지만 삭제하면 나머지 기능에 영향 없음.

---

## 🗓 현재 개발 Phase

> 여기를 업데이트하면서 진행 상황을 관리해요.

```
✅ Phase 1 - 기반 세팅
✅ Phase 2 - 인증
✅ Phase 3 - 기록 (핵심)
✅ Phase 4 - 지도
✅ Phase 5 - 여행 앨범
✅ Phase 6 - 공유
⬜ Phase 7 - AI 글쓰기 보조 (선택)
✅ Phase 8 - 마이페이지 + 마무리
⬜ Phase 9 - 배포
```

---

## 💬 Claude Code 프롬프트 예시

### Phase 시작할 때
```
docs/DEVELOPMENT_GUIDE.md, docs/ERD.mermaid 를 참고해서
Phase 3 - Record 도메인 개발해줘.
엔티티, 레포지토리, 서비스, 컨트롤러, DTO 전부 만들어줘.
공통 응답 포맷(ApiResponse)이랑 BaseTimeEntity 상속 잊지 말고.
```

### 화면 개발할 때
```
docs/wireframe.jsx 의 HomeScreen 컴포넌트를 참고해서
실제 React Native 화면으로 구현해줘.
WireBox는 실제 컴포넌트로 교체하고 StyleSheet 사용해줘.
API 호출은 src/api/record.ts 모듈 만들어서 분리해줘.
```

### 버그 고칠 때
```
[에러 메시지 붙여넣기]
관련 파일: [파일 경로]
DEVELOPMENT_GUIDE.md 컨벤션 지키면서 수정해줘.
```

---

*마지막 업데이트: 2026년 3월*
