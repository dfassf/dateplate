# Dateplate 디자인 가이드

## 색상 시스템

### Primary Colors
- **Pink 600**: `#db2777` - 메인 브랜드 색상, CTA 버튼
- **Pink 500**: `#ec4899` - 호버 상태
- **Pink 100**: `#fce7f3` - 뱃지, 태그 배경
- **Pink 50**: `#fdf2f8` - 연한 배경

### Secondary Colors
- **Rose 500**: `#f43f5e` - 그라데이션용
- **Orange 100**: `#ffedd5` - 아이콘 배경
- **Green 100**: `#dcfce7` - 성공/완료 아이콘 배경

### Neutral Colors
- **Gray 900**: `#111827` - 제목, 강조 텍스트
- **Gray 700**: `#374151` - 일반 텍스트
- **Gray 600**: `#4b5563` - 본문 텍스트
- **Gray 500**: `#6b7280` - 보조 텍스트
- **Gray 300**: `#d1d5db` - 보더, 구분선
- **Gray 100**: `#f3f4f6` - 호버 배경
- **Gray 50**: `#f9fafb` - 페이지 배경
- **White**: `#ffffff` - 카드 배경

### Status Colors
- **Red 700**: `#b91c1c` - 에러 텍스트
- **Red 200**: `#fecaca` - 에러 배경 보더
- **Red 50**: `#fef2f2` - 에러 배경

---

## 타이포그래피

### 제목
- **H1**: `text-4xl font-bold` (36px, 굵기 700) - 랜딩 페이지 타이틀
- **H2**: `text-3xl font-bold` (30px, 굵기 700) - 페이지 타이틀
- **H3**: `text-2xl font-bold` (24px, 굵기 700) - 섹션 타이틀
- **H4**: `text-lg font-semibold` (18px, 굵기 600) - 카드 타이틀

### 본문
- **Body Large**: `text-xl` (20px) - 강조 설명
- **Body**: `text-base` (16px) - 기본 본문
- **Body Small**: `text-sm` (14px) - 보조 텍스트
- **Caption**: `text-xs` (12px) - 캡션, 레이블

### 폰트 굵기
- **Regular**: `font-normal` (400) - 일반 텍스트
- **Medium**: `font-medium` (500) - 라벨
- **Semibold**: `font-semibold` (600) - 강조
- **Bold**: `font-bold` (700) - 제목

---

## 컴포넌트

### 버튼

#### Primary Button (핑크)
```
px-6 py-3 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition
```
- 높이: 48px (py-3)
- 모서리: 8px (rounded-lg)
- 용도: 주요 CTA

#### Secondary Button (흰색/보더)
```
px-6 py-3 bg-white text-pink-600 border-2 border-pink-600 rounded-lg hover:bg-pink-50 transition
```
- 용도: 보조 액션

#### Dark Button (그레이)
```
px-4 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition disabled:opacity-50
```
- 용도: 폼 제출

#### Text Button
```
px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900
```
- 용도: 네비게이션, 로그아웃

---

### 카드

#### 기본 카드
```
bg-white rounded-lg shadow-sm p-6
```
- 모서리: 8px
- 그림자: shadow-sm
- 패딩: 24px

#### 액션 카드 (호버)
```
bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition
```
- 모서리: 12px (rounded-xl)
- 호버 시 그림자 증가

#### 그라데이션 카드
```
bg-gradient-to-r from-pink-500 to-rose-500 rounded-2xl p-6 text-white
```
- 모서리: 16px (rounded-2xl)
- 용도: 커플 정보, 하이라이트

---

### 입력 필드

#### 기본 Input
```
w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent
```
- 높이: 40px
- 모서리: 8px
- 포커스: 핑크 링

#### 특수 Input (코드 입력)
```
font-mono text-center text-lg tracking-wider
```
- 용도: 초대 코드 입력

---

### 네비게이션

#### NavLink (활성화)
```
px-3 py-2 text-sm font-medium rounded-md text-pink-600 bg-pink-50
```

#### NavLink (비활성화)
```
px-3 py-2 text-sm font-medium rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100
```

---

### 뱃지/태그

```
px-2 py-1 text-xs bg-pink-100 text-pink-700 rounded-full
```
- 모서리: 완전 원형 (rounded-full)
- 용도: 카테고리 표시

---

### 아이콘 컨테이너

#### 작은 아이콘
```
w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center
```
- 크기: 40x40px
- 모서리: 8px

#### 중간 아이콘
```
w-12 h-12 bg-pink-100 rounded-xl flex items-center justify-center
```
- 크기: 48x48px
- 모서리: 12px

#### 큰 아이콘 (프로필)
```
w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center
```
- 크기: 64x64px
- 모서리: 원형

#### 초대 코드 아이콘
```
w-20 h-20 bg-pink-100 rounded-full flex items-center justify-center
```
- 크기: 80x80px

---

### 알림/에러 메시지

```
p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg
```

---

### 구분선

```html
<div className="relative">
  <div className="absolute inset-0 flex items-center">
    <div className="w-full border-t border-gray-300"></div>
  </div>
  <div className="relative flex justify-center text-sm">
    <span className="px-2 bg-gray-50 text-gray-500">또는</span>
  </div>
</div>
```

---

## 레이아웃

### 페이지 컨테이너
- 최대 너비: `max-w-7xl mx-auto`
- 패딩: `px-4 sm:px-6 lg:px-8 py-8`

### 폼 컨테이너
- 최대 너비: `max-w-md mx-auto`
- 용도: 로그인, 회원가입, 커플 연결

### 컨텐츠 컨테이너
- 최대 너비: `max-w-2xl mx-auto`
- 용도: 식당 목록, 데이트 기록

### 대시보드 컨테이너
- 최대 너비: `max-w-4xl mx-auto`

---

## 간격 시스템

### 기본 간격
- **1**: 4px
- **2**: 8px
- **3**: 12px
- **4**: 16px
- **6**: 24px
- **8**: 32px

### 섹션 간격
- 카드 사이: `space-y-6` (24px)
- 리스트 아이템: `space-y-3` (12px)
- 폼 필드: `space-y-4` (16px)

---

## 그리드

### 통계 카드
```
grid grid-cols-1 md:grid-cols-3 gap-4
```

### 액션 카드
```
grid grid-cols-1 md:grid-cols-2 gap-4
```

---

## 애니메이션

### 기본 트랜지션
```
transition
```
- 지속시간: 150ms (기본값)

### 호버 스케일
```
group-hover:scale-110 transition
```
- 용도: 아이콘 확대 효과

---

## 반응형 규칙

- **Mobile First**: 기본 스타일은 모바일 기준
- **md**: 768px 이상
- **lg**: 1024px 이상

---

## 접근성

- 터치 영역: 최소 44x44px
- 포커스 링: `focus:ring-2 focus:ring-pink-500`
- 색상 대비: WCAG AA 기준 준수
- disabled 상태: `disabled:opacity-50`

---

## 이모지 가이드

| 용도 | 이모지 |
|------|--------|
| 커플 | 💑 |
| 연결 안됨 | 💔 |
| 식당 | 🍽️ |
| 캘린더 | 📅 |
| 돈 | 💰 |
| 검색 | 🔍 |
| 작성 | ✏️ |
| 하트 | 💕 |
| 인사 | 👋 |
