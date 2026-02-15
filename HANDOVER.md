# Hoesikplate 인수인계 문서

## 📋 프로젝트 개요

**Hoesikplate**는 팀/회사 기반 회식 아카이빙 플랫폼입니다.
영수증/사진으로 검증된 데이터 기반의 직장인형 회식 커뮤니티로, 외부 리뷰가 아닌 **우리 팀이 진짜 가본 곳**만 기록하고 공유합니다.

---

## 🏗️ 기술 스택

### Frontend
- **React 19** - UI 라이브러리
- **Vite 7** - 빌드 도구
- **Tailwind CSS 4** - 스타일링
- **Zustand** - 상태 관리
- **TanStack Query** - 서버 상태 관리
- **Axios** - HTTP 클라이언트

### Backend
- **NestJS 11** - Node.js 프레임워크
- **Prisma 7** - ORM
- **SQLite (LibSQL)** - 데이터베이스
- **JWT + argon2** - 인증/암호화

### 구조
- **pnpm workspaces** - 모노레포 관리

---

## 📁 프로젝트 구조

```
hoesikplate/
├── apps/
│   ├── api/                    # NestJS 백엔드 (localhost:3001)
│   │   ├── src/
│   │   │   ├── auth/          # 인증 모듈
│   │   │   ├── users/         # 사용자 모듈
│   │   │   ├── teams/         # 팀 모듈
│   │   │   ├── dinners/       # 회식 기록 모듈
│   │   │   ├── restaurants/   # 식당 모듈
│   │   │   ├── reviews/       # 리뷰 모듈
│   │   │   ├── common/        # 공통 (guards, interceptors, decorators)
│   │   │   └── prisma/        # Prisma 서비스
│   │   ├── prisma/
│   │   │   ├── schema.prisma  # DB 스키마
│   │   │   └── dev.db         # SQLite DB 파일
│   │   └── .env               # 환경 변수
│   │
│   └── web/                    # React 프론트엔드 (localhost:3000)
│       ├── src/
│       │   ├── pages/         # 페이지 컴포넌트
│       │   ├── components/    # 재사용 컴포넌트
│       │   ├── lib/           # API 클라이언트, 유틸리티
│       │   └── App.tsx        # 라우터 설정
│       └── vite.config.ts     # Vite 설정 (프록시 포함)
│
├── packages/
│   └── shared/                 # 공유 타입, 상수
│       └── src/
│           ├── types/         # TypeScript 인터페이스
│           └── constants/     # 상수
│
├── DRAFT.md                    # 기획 문서
├── PRISMA7_NOTES.md           # Prisma 7 설정 메모
├── README.md                   # 프로젝트 소개
├── HANDOVER.md                 # 이 문서
└── package.json                # 루트 package.json
```

---

## 🚀 개발 환경 설정

### 1. 의존성 설치
```bash
pnpm install
```

### 2. 환경 변수 설정
```bash
# .env 파일 생성
cp apps/api/.env.example apps/api/.env

# JWT_SECRET 값을 임의의 긴 문자열로 수정
# 예: JWT_SECRET=your-super-secret-key-here-change-this-in-production
```

### 3. 데이터베이스 초기화
```bash
cd apps/api
npx prisma generate      # Prisma Client 생성
npx prisma db push       # DB 스키마 적용 (마이그레이션 없이)
# 또는
npx prisma migrate dev   # 마이그레이션 생성 및 적용
cd ../..
```

### 4. 서버 실행

**백엔드 (터미널 1)**
```bash
pnpm --filter @hoesikplate/api dev
# http://localhost:3001 에서 실행됨
```

**프론트엔드 (터미널 2)**
```bash
pnpm --filter @hoesikplate/web dev
# http://localhost:3000 에서 실행됨
```

---

## 🔌 API 구조

### 응답 형식 (중요!)

**모든 API 응답은 `ResponseInterceptor`를 통해 다음 형식으로 통일됩니다:**

```typescript
// 성공 응답
{
  "data": T,           // 실제 데이터
  "message"?: string   // 선택적 메시지
}

// 에러 응답
{
  "statusCode": number,
  "message": string | string[],
  "error": string
}
```

### Response Interceptor 위치
- 파일: `apps/api/src/common/interceptors/response.interceptor.ts`
- 등록: `apps/api/src/main.ts`에서 `app.useGlobalInterceptors(new ResponseInterceptor())`

### 타입 정의
- 공유 타입: `packages/shared/src/types/index.ts`
- `ApiResponse<T>` 인터페이스 사용

### API 엔드포인트

| 모듈 | 엔드포인트 | 메서드 | 인증 | 설명 |
|---|---|---|---|---|
| **Auth** | `/auth/register` | POST | ❌ | 회원가입 |
| | `/auth/login` | POST | ❌ | 로그인 |
| **Users** | `/users/me` | GET | ✅ | 내 정보 조회 |
| | `/users/me` | PATCH | ✅ | 내 정보 수정 |
| **Teams** | `/teams` | POST | ✅ | 팀 생성 |
| | `/teams` | GET | ✅ | 내 팀 목록 |
| | `/teams/:id` | GET | ✅ | 팀 상세 조회 |
| | `/teams/:id` | PATCH | ✅ | 팀 수정 (팀장만) |
| | `/teams/:id` | DELETE | ✅ | 팀 삭제 (팀장만) |
| | `/teams/:id/invite` | POST | ✅ | 초대 코드 생성 |
| | `/teams/join` | POST | ✅ | 초대 코드로 합류 |
| **Dinners** | `/dinners` | POST | ✅ | 회식 기록 생성 |
| | `/dinners?teamId=` | GET | ✅ | 팀별 회식 목록 |
| | `/dinners/:id` | GET | ✅ | 회식 상세 조회 |
| | `/dinners/:id` | PATCH | ✅ | 회식 수정 |
| | `/dinners/:id` | DELETE | ✅ | 회식 삭제 |
| **Restaurants** | `/restaurants` | POST | ✅ | 식당 생성 |
| | `/restaurants?search=` | GET | ✅ | 식당 검색 |
| | `/restaurants/:id` | GET | ✅ | 식당 상세 조회 |
| **Reviews** | `/reviews` | POST | ✅ | 리뷰 작성 |
| | `/reviews?teamId=` | GET | ✅ | 팀별 리뷰 목록 |
| | `/reviews/:id` | GET | ✅ | 리뷰 상세 조회 |
| | `/reviews/:id` | PATCH | ✅ | 리뷰 수정 |
| | `/reviews/:id` | DELETE | ✅ | 리뷰 삭제 |

---

## 🔐 인증 (Authentication)

### JWT 토큰 기반 인증

1. **로그인/회원가입** → `accessToken` 받음
2. **토큰 저장** → `localStorage.setItem('token', accessToken)`
3. **API 요청 시** → `Authorization: Bearer ${token}` 헤더 자동 추가
   - 위치: `apps/web/src/lib/api.ts`의 `axios interceptor`

### 보호된 라우트
- `JwtAuthGuard`를 사용하는 모든 엔드포인트는 인증 필요
- 프론트에서 토큰 없으면 로그인 페이지로 리다이렉트 (구현 필요)

---

## 🗄️ 데이터베이스

### Prisma Schema 주요 모델

```prisma
- User           # 사용자
- Team           # 팀
- TeamMember     # 팀 멤버 (N:M 관계 테이블)
- TeamInvite     # 팀 초대 코드
- Restaurant     # 식당
- DinnerRecord   # 회식 기록
- Review         # 리뷰
- ReviewImage    # 리뷰 이미지 (영수증/사진)
- ReviewTag      # 리뷰 태그
```

### 주요 관계
- `User` ↔ `TeamMember` ↔ `Team` (다대다)
- `Team` → `DinnerRecord` (일대다)
- `DinnerRecord` → `Restaurant` (다대일)
- `Review` → `DinnerRecord`, `Restaurant`, `Team` (다대일)

### DB 명령어
```bash
cd apps/api

# Prisma Studio (GUI)
npx prisma studio

# 스키마 변경 후 적용
npx prisma db push          # 개발 환경 (마이그레이션 없이)
npx prisma migrate dev      # 마이그레이션 생성

# 초기화
npx prisma migrate reset    # DB 초기화 + 시드
```

---

## 🎨 프론트엔드 구조

### API 클라이언트 (`apps/web/src/lib/api.ts`)

```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: '/api',  // Vite 프록시를 통해 localhost:3001로 전달
});

// 자동 토큰 추가
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// API 모듈들
export const authApi = { ... };
export const teamApi = { ... };
export const dinnerApi = { ... };
export const restaurantApi = { ... };
export const reviewApi = { ... };
```

### Vite 프록시 설정 (`apps/web/vite.config.ts`)

```typescript
server: {
  port: 3000,
  proxy: {
    '/api': {
      target: 'http://localhost:3001',
      changeOrigin: true,
      rewrite: (path) => path.replace(/^\/api/, ''),
    },
  },
}
```

- 프론트에서 `/api/*` 요청 → 백엔드 `http://localhost:3001/*`로 프록시
- CORS 문제 없이 개발 가능

---

## 🐛 알려진 이슈 및 해결 방법

### 1. ~~Dashboard에서 `Cannot read properties of undefined (reading 'length')` 에러~~
- **원인**: 백엔드가 직접 배열을 반환했는데 프론트에서 `res.data.data` 접근
- **해결**: `ResponseInterceptor` 추가로 모든 응답을 `{ data: T }` 형식으로 통일 ✅

### 2. Prisma 7.x 관련 이슈
- `PRISMA7_NOTES.md` 참고
- `prisma.config.ts` 파일 필수

### 3. TypeScript 빌드 오류
- `tsconfig.json`에서 `moduleResolution: "bundler"` 사용
- `.js` 확장자 명시 필요 (ESM)

---

## 📝 TODO / 향후 작업

### MVP 단계
- [x] 기본 인증 시스템
- [x] 팀 생성 및 초대 코드
- [x] 회식 기록 CRUD
- [x] 식당 등록 및 검색
- [x] 리뷰 작성
- [ ] 영수증/사진 업로드 (이미지 처리)
- [ ] 카카오맵 연동 (식당 검색)
- [ ] 팀 대시보드 UI 개선

### Phase 2
- [ ] 이상형 월드컵 (메뉴 선정)
- [ ] 룰렛 (랜덤 선정)
- [ ] 태그 시스템

### Phase 3
- [ ] 커뮤니티 기능 (타 팀 공유)
- [ ] 인증된 장소만 지도에 표시
- [ ] 통계 및 랭킹

### Phase 4
- [ ] 게이미피케이션 (티켓, 배지, 미션)

### Phase 5
- [ ] OCR 영수증 자동 인식
- [ ] 통계 대시보드

---

## 🔧 유지보수 가이드

### 새로운 API 추가 시

1. **백엔드**
   - Service에 비즈니스 로직 작성
   - Controller에서 Service 호출
   - DTO 정의 (`dto/` 폴더)
   - `ResponseInterceptor`가 자동으로 응답 포맷 통일

2. **공유 타입**
   - `packages/shared/src/types/index.ts`에 인터페이스 추가

3. **프론트엔드**
   - `apps/web/src/lib/api.ts`에 API 함수 추가
   - 페이지/컴포넌트에서 사용

### 환경 변수 추가 시
- 백엔드: `apps/api/.env`, `.env.example` 업데이트
- 프론트: 필요시 `apps/web/.env`, `vite.config.ts` 수정

---

## 📞 문의 및 참고사항

- **기획 문서**: `DRAFT.md` 참고
- **Prisma 설정**: `PRISMA7_NOTES.md` 참고
- **README**: `README.md`에 빠른 시작 가이드 있음

---

**작성일**: 2026-02-10
**작성자**: Claude (행님과 함께 작업)
**최종 수정**: 2026-02-10
