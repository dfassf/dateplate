# 호식플레이트 (Hoesikplate)

**팀/회사 기반 회식 아카이빙 & 의사결정 플랫폼**

> "우리 팀이 가장 많이 방문한 회식 맛집은 어디일까?"

외부 리뷰가 아닌, **우리 팀이 진짜 가본 곳**만 기록하고 공유합니다.
메뉴 고르기 어려울 땐 이상형 월드컵이나 룰렛으로 결정하세요.

---

## 주요 기능

### 회식 관리
- **팀 구성** - 초대 코드로 팀원 연결, 팀장 권한 관리
- **회식 기록** - 날짜, 장소(Kakao Places 연동), 금액, 인원, 메모
- **리뷰 & 별점** - 1~5점 평점, 9종 태그, 공개범위 설정(비공개/커뮤니티/전체공개)
- **우리 팀 맛집 지도** - Kakao Maps에 팀 식당 핀 표시, 방문횟수/평점 InfoWindow

### 의사결정 도구
- **이상형 월드컵** - 토너먼트 방식 메뉴 선택 (홀수 옵션 부전승 지원)
- **룰렛** - Canvas 기반 회전 애니메이션, 가중치 기반 확률
- **결과 기록** - 완료된 세션 팀 상세에서 조회

### 커뮤니티
- **커뮤니티 피드** - 공개 리뷰 목록, 태그 필터, 페이지네이션
- **맛집 랭킹** - 평점순/방문순 정렬

### 게이미피케이션
- **티켓 시스템** - 월별 황금/블랙 티켓 익명 투표
- **업적** - 9개 배지 자동 해제 (첫 리뷰, 회식 5/10회 등)
- **미션** - 목표 기반 미션, 진행도 추적

### 통계 대시보드
- 월별 지출 추이(Bar), 카테고리 분포(Pie), 멤버 참여도
- 총 회식 수, 총 지출, 인당 평균, 평균 평점

---

## 기술 스택

| 영역 | 스택 |
|---|---|
| Frontend | React 19, Vite 7, Tailwind CSS 4, Zustand, Axios |
| Backend | NestJS 11, Prisma 7, PostgreSQL |
| Auth | JWT (Passport) + argon2 |
| 구조 | TypeScript 5.9, pnpm workspaces 모노레포 |

## 프로젝트 구조

```
hoesikplate/
├── apps/
│   ├── api/            # NestJS 백엔드 (localhost:3001)
│   │   ├── prisma/     #   Prisma 스키마 & 마이그레이션
│   │   └── src/
│   │       ├── auth/           # 인증 (JWT, Passport)
│   │       ├── users/          # 사용자 프로필
│   │       ├── teams/          # 팀 CRUD, 초대
│   │       ├── dinners/        # 회식 기록
│   │       ├── restaurants/    # 식당 검색, 랭킹
│   │       ├── reviews/        # 리뷰, 커뮤니티 피드
│   │       ├── sessions/       # 월드컵, 룰렛
│   │       ├── gamification/   # 티켓, 업적, 미션
│   │       ├── stats/          # 통계
│   │       └── common/         # 데코레이터, 인터셉터, 유틸
│   └── web/            # React 프론트엔드 (localhost:5173)
│       └── src/
│           ├── pages/          # 22개 페이지
│           ├── components/     # 공유 컴포넌트
│           ├── stores/         # Zustand 상태관리
│           └── lib/            # API 클라이언트
└── packages/
    └── shared/         # 공유 타입, 상수
```

## 시작하기

### 사전 요구사항

- Node.js >= 20
- pnpm >= 8.15
- PostgreSQL

### 설치 & 실행

```bash
# 의존성 설치
pnpm install

# 환경 변수 설정
cp apps/api/.env.example apps/api/.env
# DATABASE_URL, JWT_SECRET 수정

# DB 스키마 반영
pnpm --filter @hoesikplate/api exec prisma db push

# 전체 동시 실행
pnpm dev

# 또는 개별 실행
pnpm dev:api   # 백엔드
pnpm dev:web   # 프론트엔드
```

### 환경 변수

**API** (`apps/api/.env`)
```env
DATABASE_URL=postgresql://user@localhost:5432/hoesikplate
JWT_SECRET=your-secret-key
```

**Web** (`apps/web/.env.local`)
```env
VITE_API_BASE_URL=http://localhost:3001
VITE_KAKAO_MAP_KEY=your-kakao-javascript-key
```

## API 문서

- Base URL: `http://localhost:3001`
- 인증 방식: `Authorization: Bearer <JWT>`
- 현재 Swagger UI는 별도 제공하지 않으며, 주요 엔드포인트는 아래 표 기준으로 사용합니다.

### 주요 엔드포인트

| 메서드 | 경로 | 인증 | 설명 |
|---|---|---|---|
| `GET` | `/auth/check-email?email=` | 불필요 | 이메일 중복 확인 |
| `POST` | `/auth/register` | 불필요 | 회원가입 |
| `POST` | `/auth/login` | 불필요 | 로그인 및 JWT 발급 |
| `GET` | `/users/me` | 필요 | 내 프로필 조회 |
| `PATCH` | `/users/me` | 필요 | 내 프로필 수정 |
| `GET` | `/teams` | 필요 | 내 팀 목록 조회 |
| `POST` | `/teams` | 필요 | 팀 생성 |
| `GET` | `/teams/:id` | 필요 | 팀 상세 조회 |
| `PATCH` | `/teams/:id` | 필요 | 팀 정보 수정 (팀장) |
| `DELETE` | `/teams/:id` | 필요 | 팀 삭제 (팀장) |
| `DELETE` | `/teams/:id/members/:memberId` | 필요 | 팀원 제거/자진 탈퇴 |
| `POST` | `/teams/:id/invite` | 필요 | 팀 초대 코드 생성 |
| `POST` | `/teams/join` | 필요 | 초대 코드로 팀 합류 |
| `GET` | `/dinners?teamId=&page=&limit=` | 필요 | 팀 회식 기록 목록 |
| `POST` | `/dinners` | 필요 | 회식 기록 생성 |
| `GET` | `/dinners/recent` | 필요 | 내 최근 회식 및 이번달 횟수 |
| `GET` | `/dinners/:id` | 필요 | 회식 상세 조회 |
| `PATCH` | `/dinners/:id` | 필요 | 회식 기록 수정 (작성자) |
| `DELETE` | `/dinners/:id` | 필요 | 회식 기록 삭제 (작성자) |
| `GET` | `/restaurants?search=` | 필요 | 식당 검색 |
| `POST` | `/restaurants` | 필요 | 식당 등록/재사용 |
| `GET` | `/restaurants/team/:teamId?sort=` | 필요 | 팀 식당 목록/정렬 |
| `GET` | `/restaurants/rankings?sort=&category=` | 필요 | 공개 리뷰 기반 랭킹 |
| `GET` | `/reviews?teamId=&page=&limit=` | 필요 | 팀 리뷰 목록 |
| `POST` | `/reviews` | 필요 | 리뷰 작성 |
| `GET` | `/reviews/community?tag=&page=&limit=` | 필요 | 커뮤니티 리뷰 피드 |
| `GET` | `/reviews/:id` | 필요 | 리뷰 상세 조회 |
| `PATCH` | `/reviews/:id` | 필요 | 리뷰 수정 (작성자) |
| `DELETE` | `/reviews/:id` | 필요 | 리뷰 삭제 (작성자) |
| `GET` | `/sessions?teamId=&status=` | 필요 | 세션 목록 조회 |
| `POST` | `/sessions` | 필요 | 월드컵/룰렛 세션 생성 |
| `GET` | `/sessions/:id` | 필요 | 세션 상세 조회 |
| `POST` | `/sessions/:id/vote` | 필요 | 월드컵 라운드 투표 |
| `POST` | `/sessions/:id/spin` | 필요 | 룰렛 스핀 실행 |
| `POST` | `/sessions/:id/complete` | 필요 | 세션 수동 완료 |
| `POST` | `/gamification/tickets` | 필요 | 티켓 부여 |
| `GET` | `/gamification/tickets/:teamId?month=&year=` | 필요 | 월별 티켓 결과 |
| `GET` | `/gamification/achievements` | 필요 | 내 업적 조회 |
| `POST` | `/gamification/achievements/check` | 필요 | 업적 해금 체크 |
| `GET` | `/gamification/missions` | 필요 | 활성 미션/진행도 조회 |
| `GET` | `/stats/:teamId` | 필요 | 팀 통계 조회 |

## 페이지 구성

| 경로 | 설명 |
|---|---|
| `/` | 홈 |
| `/login`, `/register` | 로그인 / 회원가입 |
| `/dashboard` | 대시보드 (팀 목록, 최근 회식) |
| `/teams/:teamId` | 팀 상세 (멤버, 맛집, 히스토리, 최근 결정) |
| `/teams/:teamId/map` | 팀 맛집 지도 |
| `/teams/:teamId/dinners/create` | 회식 기록 |
| `/teams/:teamId/dinners/:id` | 회식 상세 & 리뷰 |
| `/teams/:teamId/tournament` | 이상형 월드컵 |
| `/teams/:teamId/roulette` | 룰렛 |
| `/teams/:teamId/stats` | 팀 통계 |
| `/teams/:teamId/tickets` | 팀원 평가 (티켓) |
| `/community` | 커뮤니티 리뷰 피드 |
| `/rankings` | 맛집 랭킹 |
| `/achievements` | 업적 |

## 스크립트

```bash
pnpm dev          # 전체 개발 서버
pnpm build        # 전체 빌드
pnpm lint         # 린트
pnpm format       # Prettier 포맷팅
pnpm clean        # node_modules 정리
```

## 구현 현황

- [x] Phase 1 - MVP: 팀, 회식, 리뷰, 식당, 대시보드
- [x] Phase 2 - 의사결정: 이상형 월드컵, 룰렛
- [x] Phase 3 - 커뮤니티: 피드, 랭킹, 팀 맛집 지도
- [x] Phase 4 - 게이미피케이션: 티켓, 업적, 미션
- [x] Phase 5 - 통계 대시보드
- [ ] Phase 6 - OCR 영수증 자동 인식, 이미지 업로드
