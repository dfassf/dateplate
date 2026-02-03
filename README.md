# Dateplate

커플 미식 아카이빙 플랫폼

## 프로젝트 구조

```
dateplate/
├── apps/
│   ├── api/          # NestJS 백엔드
│   └── web/          # React 프론트엔드
├── packages/
│   └── shared/       # 공유 타입/유틸
└── package.json
```

## 시작하기

```bash
# 의존성 설치
pnpm install

# 개발 서버 실행 (전체)
pnpm dev

# 개발 서버 실행 (개별)
pnpm dev:api   # API만
pnpm dev:web   # Web만
```

## 기술 스택

- **Frontend:** React, Vite, Tailwind CSS, Zustand, TanStack Query
- **Backend:** NestJS, Prisma, PostgreSQL
- **Infra:** pnpm workspaces
