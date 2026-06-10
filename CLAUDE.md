# CLAUDE.md — US Stock Research App

## 프로젝트 개요

FMP(Financial Modeling Prep) API 기반 한국어 미국 주식 리서치 웹앱.
개인 투자자용. 로그인 없음.

**PRD 전문**: `PRD-us-stock-research-app.md`

---

## 기술 스택

| 항목 | 선택 |
|------|------|
| 프레임워크 | Next.js 14 (App Router) |
| 스타일 | Tailwind CSS + shadcn/ui |
| 차트 | Recharts |
| DB | SQLite via Prisma (`prisma/screener.db`) |
| 클라이언트 상태 | localStorage (관심종목, 스크리너 프리셋) |
| 데이터 API | FMP Stable API (`https://financialmodelingprep.com/stable`) |

---

## 페이지 구조

```
/               → 홈: 관심종목 요약 카드 + S&P 500
/screener       → 필터 패널 + 결과 테이블 (최대 50개) + 프리셋 저장
/screener/saved → DB에 저장된 스크리너 스냅샷 목록/상세
/stock/[ticker] → 종목 상세: 탭(손익·대차·현금흐름·지표) + Recharts 차트
/watchlist      → 관심종목 목록 (localStorage)
```

---

## API Routes

| Method | Path | 설명 |
|--------|------|------|
| GET | `/api/screener` | FMP 종목 스크리너. 402/403 시 DB 캐시 fallback |
| GET/POST | `/api/screener/saved` | 스크리너 스냅샷 목록 조회 / 저장 (중복 409) |
| GET/DELETE | `/api/screener/saved/[id]` | 스냅샷 상세 조회 / 삭제 |
| GET | `/api/stock/[ticker]/profile` | 종목 기본 정보 |
| GET | `/api/stock/[ticker]/quote` | 실시간 주가 |
| GET | `/api/stock/[ticker]/income-statement` | 손익계산서 (최근 5년) |
| GET | `/api/stock/[ticker]/balance-sheet` | 대차대조표 (최근 5년) |
| GET | `/api/stock/[ticker]/cash-flow` | 현금흐름표 (최근 5년) |
| GET | `/api/stock/[ticker]/ratios` | 투자 지표 (최근 5년) |
| GET | `/api/health` | 헬스체크 |

---

## 주요 파일

```
lib/fmp.ts              FMP API 호출 레이어 (fetchFmp 공통 함수)
lib/prisma.ts           Prisma 싱글톤 클라이언트
lib/watchlist.ts        관심종목 localStorage 유틸
lib/screener-presets.ts 스크리너 프리셋 localStorage 유틸
hooks/use-watchlist.ts  관심종목 React hook
hooks/use-screener-presets.ts 프리셋 React hook
prisma/schema.prisma    ScreenerSnapshot 모델 (SQLite)
```

---

## DB 스키마

```prisma
model ScreenerSnapshot {
  id          Int      @id @default(autoincrement())
  name        String   // "__cache__" = 내부 캐시, 그 외 = 유저 저장
  searchedAt  DateTime @default(now())
  filters     String   // JSON string (ScreenerFilters)
  results     String   // JSON string (ScreenerResult[])
  resultCount Int
}
```

`name = "__cache__"` 레코드는 FMP 402/403 fallback용 내부 캐시.
유저 저장 스냅샷과 구분해서 처리할 것.

---

## FMP API 주의사항

- Base URL: `https://financialmodelingprep.com/stable` (v3 아님, stable 엔드포인트)
- 환경변수: `FMP_API_KEY` (서버사이드 전용, 클라이언트 노출 금지)
- 스크리너(`/company-screener`)는 **유료 플랜 필요** — 무료 계정은 402/403 반환
- 모든 fetch는 `cache: "no-store"` (Next.js 캐시 미사용, Prisma DB로 캐시 처리)
- FMP 응답이 배열 또는 `{ value: [] }` 형태 두 가지 모두 가능 → `fetchFmp`에서 정규화

---

## 구현 이력 (커밋 순)

1. `scaffold` — Next.js 14 + shadcn/ui + Tailwind + Recharts 초기 설정
2. `feat(api)` — FMP API 통합 레이어 (`lib/fmp.ts`)
3. `feat(watchlist)` — 관심종목 localStorage CRUD + `/watchlist` 페이지
4. `feat(screener)` — 스크리너 필터 + 결과 테이블
5. `feat(stock): overview` — 종목 상세 개요 + 관심종목 토글
6. `feat(stock): tabs` — 재무제표 탭 + Recharts 차트
7. `feat(home)` — 홈 관심종목 요약 + S&P 500
8. `feat(screener): presets` — 필터 프리셋 저장/불러오기
9. FMP v3 → stable API 마이그레이션 (여러 fix 커밋)
10. 스크리너 스냅샷 저장/조회 기능 (Prisma SQLite)

---

## 로컬 개발

```bash
# 의존성 설치
npm install

# DB 마이그레이션
npx prisma db push

# 개발 서버
npm run dev
```

`.env` 파일에 `FMP_API_KEY=...` 필요.

---

## 미구현 (Out of Scope)

- 로그인/인증
- 실시간 주가 스트리밍
- 분기 재무 데이터 (연간만)
- 원화 환산
- 뉴스·공시
- 종목 간 비교
- 포트폴리오 손익 추적
- PER/PBR/ROE 등 스크리너 필터 (FMP 유료 필요)
