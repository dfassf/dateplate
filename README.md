# Hoesikplate

**팀/회사 기반 회식 아카이빙 플랫폼**

> "LG 직원들이 가장 많이 방문한 마곡 회식 맛집은 어디일까?"

영수증/사진으로 검증된 데이터 기반의 직장인형 회식 커뮤니티.
외부 리뷰가 아닌, **우리 팀이 진짜 가본 곳**만 기록하고 공유합니다.

---

## 핵심 기능

- **팀 구성** - 초대 코드로 팀원 연결
- **회식 기록** - 날짜, 장소, 금액, 인원, 메모
- **리뷰 & 별점** - 팀 내부 솔직 후기
- **우리 팀 맛집 지도** - 등록한 장소만 핀으로 표시
- **히스토리 피드** - 날짜순 회식 기록 조회

## 기술 스택

| 영역 | 스택 |
|---|---|
| Frontend | React 19, Vite 7, Tailwind CSS 4, Zustand, TanStack Query |
| Backend | NestJS 11, Prisma 7, SQLite (LibSQL) |
| Auth | JWT + argon2 |
| 구조 | pnpm workspaces 모노레포 |

## 프로젝트 구조

```
hoesikplate/
├── apps/
│   ├── api/          # NestJS 백엔드 (localhost:3001)
│   └── web/          # React 프론트엔드 (localhost:5173)
├── packages/
│   └── shared/       # 공유 타입, 상수
├── DRAFT.md          # 기획 문서
└── PRISMA7_NOTES.md  # Prisma 7 설정 메모
```

## 시작하기

```bash
# 의존성 설치
pnpm install

# 환경 변수 설정
cp apps/api/.env.example apps/api/.env
# JWT_SECRET 값 수정

# DB 생성 + Prisma Client 생성
cd apps/api && npx prisma db push && cd ../..

# 백엔드 실행
pnpm --filter @hoesikplate/api dev

# 프론트엔드 실행 (별도 터미널)
pnpm --filter @hoesikplate/web dev
```

## API 엔드포인트

| 모듈 | 엔드포인트 |
|---|---|
| Auth | `POST /auth/register`, `POST /auth/login` |
| Users | `GET /users/me`, `PATCH /users/me` |
| Teams | CRUD + `POST /:id/invite`, `POST /join` |
| Dinners | CRUD + `GET ?teamId=` |
| Restaurants | `POST`, `GET ?search=`, `GET /:id` |
| Reviews | CRUD + `GET ?teamId=` |

## 로드맵

- **Phase 1 (MVP):** 팀 구성, 회식 기록, 리뷰, 히스토리 피드
- **Phase 2:** 이상형 월드컵, 룰렛, 태그 시스템
- **Phase 3:** 커뮤니티 공유, 타 팀 인증 장소 조회
- **Phase 4:** 게이미피케이션 (티켓, 배지, 미션)
- **Phase 5:** OCR 자동 인식, 통계 대시보드
