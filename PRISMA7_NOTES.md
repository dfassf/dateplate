# Prisma 7 세팅 메모 (hoesikplate)

> 기존 dateplate 프로젝트에서 Prisma 7을 사용하며 겪은 설정/주의사항 기록.
> 프로젝트 리셋 후에도 동일 이슈가 발생할 수 있으므로 보존.

---

## 1. 버전 정보

```json
// apps/api/package.json
"@prisma/client": "7",
"@prisma/adapter-libsql": "^7.3.0",  // devDependencies가 아닌 dependencies
"prisma": "7"                         // devDependencies
```

## 2. Prisma 7 필수 변경사항 (vs Prisma 5/6)

### 2.1. prisma.config.ts 필수
Prisma 7부터 `prisma.config.ts`가 **프로젝트 루트(apps/api/)에 필수**.
기존처럼 `.env`의 `DATABASE_URL`만으로는 안 되고, `defineConfig`로 명시해야 함.

```ts
// apps/api/prisma.config.ts
import { defineConfig } from 'prisma/config';

export default defineConfig({
  schema: './prisma/schema.prisma',
  datasource: {
    url: 'file:./prisma/dev.db',  // 또는 환경변수
  },
});
```

### 2.2. engineType = "library" 명시
```prisma
generator client {
  provider   = "prisma-client-js"
  engineType = "library"          // Prisma 7에서 명시 권장
}
```

### 2.3. adapter 패턴 (SQLite/LibSQL 사용 시)
Prisma 7에서 SQLite 사용 시 `@prisma/adapter-libsql` 어댑터를 사용.
PrismaClient 생성자에 `{ adapter }` 를 넘겨야 함.

```ts
import { PrismaClient } from '@prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';

const adapter = new PrismaLibSql({
  url: 'file:./prisma/dev.db',
});

const prisma = new PrismaClient({ adapter });
```

### 2.4. generated 클라이언트 경로
Prisma 7에서는 generated 파일이 `node_modules/@prisma/client`가 아닌 별도 경로로 갈 수 있음.
`.gitignore`에 `/generated/prisma` 추가 필요.

```gitignore
# apps/api/.gitignore
/generated/prisma
```

### 2.5. datasource에 directUrl 제거
Prisma 7에서는 `datasource` 블록에 `directUrl`이 없어도 됨.
SQLite/LibSQL 사용 시 `provider = "sqlite"`만 지정.

```prisma
datasource db {
  provider = "sqlite"
  // url은 prisma.config.ts에서 관리
}
```

## 3. NestJS + Prisma 7 통합 패턴

### 3.1. PrismaService
```ts
@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    const adapter = new PrismaLibSql({
      url: 'file:./prisma/dev.db',
    });
    super({ adapter });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
```

### 3.2. PrismaModule (Global)
```ts
@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
```

## 4. tsconfig 주의사항

NestJS + Prisma 7 사용 시 `tsconfig.json`에서:
```json
{
  "compilerOptions": {
    "module": "nodenext",
    "moduleResolution": "nodenext",
    "resolvePackageJsonExports": true,
    "esModuleInterop": true,
    "target": "ES2023"
  }
}
```
- `module: "nodenext"` + `moduleResolution: "nodenext"` 조합 필수
- Prisma 7의 ESM 지원을 위해 `resolvePackageJsonExports: true`

## 5. 기존 프로젝트 기술 스택 참고

```
모노레포: pnpm workspaces
API: NestJS 11 + Prisma 7 + SQLite(LibSQL)
Web: React 19 + Vite 7 + TailwindCSS 4 + Zustand 5 + TanStack Query 5
Shared: TypeScript 공유 패키지 (@hoesikplate/shared)
테스트: Jest 30 (API) + Vitest 4 (Web)
인증: NestJS Passport + JWT
```
