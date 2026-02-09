# Hoesikplate Netlify 배포 가이드

## Netlify 무료 플랜 제한
- **사이트 개수**: 무제한 ✅
- 빌드 시간: 월 300분
- 대역폭: 100GB/월

## 배포 방법

### 1. Netlify 웹사이트에서 배포

1. [Netlify](https://www.netlify.com/) 접속 및 로그인
2. "Add new site" → "Import an existing project" 클릭
3. GitHub 저장소 연결:
   - "GitHub" 선택
   - `dfassf/hoesikplate` 저장소 선택
   - 브랜치 선택 (예: `main` 또는 `master`)
4. 빌드 설정:
   - **Build command**: `cd apps/web && pnpm install && pnpm run build`
   - **Publish directory**: `apps/web/dist`
   - **Base directory**: `.` (루트)
5. 환경 변수 설정:
   - "Site settings" → "Environment variables" 클릭
   - 다음 변수 추가:
     - `VITE_KAKAO_MAP_API_KEY`: 카카오맵 API 키
     - 기타 필요한 환경 변수들
6. Node.js 버전 설정:
   - "Site settings" → "Build & deploy" → "Environment"
   - Node version: `20` (또는 프로젝트에서 요구하는 버전)
   - pnpm 버전: `8.15.0` (package.json의 packageManager에 명시됨)
7. "Deploy site" 클릭

### 2. pnpm 설치 설정

Netlify는 기본적으로 npm을 사용하므로, pnpm을 사용하려면:

1. Netlify 대시보드 → "Site settings" → "Build & deploy" → "Build environment variables"
2. 다음 변수 추가:
   - `NPM_FLAGS`: `--prefix=apps/web`
   - 또는 빌드 명령어에 `npm install -g pnpm` 추가

또는 `netlify.toml`에 다음 추가:
```toml
[build.environment]
  NPM_FLAGS = "--prefix=apps/web"
```

### 3. 빌드 명령어 (대안)

만약 pnpm이 제대로 작동하지 않으면:

```bash
npm install -g pnpm
cd apps/web
pnpm install
pnpm run build
```

또는 npm으로 변환:
```bash
cd apps/web
npm install
npm run build
```

## 주의사항

- 이 프로젝트는 모노레포 구조입니다
- `apps/web` 디렉토리의 프론트엔드만 배포됩니다
- API 서버(`apps/api`)는 별도로 배포해야 합니다 (Netlify Functions 또는 다른 서비스 사용)

## 환경 변수

필요한 환경 변수:
- `VITE_KAKAO_MAP_API_KEY`: 카카오맵 API 키 (필수)

## 트러블슈팅

### pnpm 설치 실패 시
- Netlify는 기본적으로 npm을 사용합니다
- 빌드 명령어에 `npm install -g pnpm` 추가
- 또는 npm으로 의존성 설치 후 pnpm 사용

### 빌드 경로 오류 시
- `base` 디렉토리가 올바른지 확인
- `publish` 경로가 `apps/web/dist`인지 확인
