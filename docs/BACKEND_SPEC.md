# life inve — 백엔드 구현 스펙 (개발자용)

> 대상: 이 데모(https://deepvaluekim-cmd.github.io/lifeinveinve/)의 프론트를 실데이터로 구동할 백엔드.
> 현재 프론트 = 정적 SPA(단일 index.html, Tailwind CDN + Pretendard) + 자기완결 HTML 페이지들(earnings/·youtube/·substack/·dashboards/). 모든 데이터가 지금은 프론트 목업(genSeries 등). **백엔드는 아래 API를 제공하고, 프론트는 목업 → fetch로 교체한다.**
> 관련 문서: 요약 포맷=`docs/DEV_HANDOFF_요약생성.md`, 생성기 프롬프트=`docs/prompts/`, 검증룰=`earnings-note-spec.md`.

---

## 0. 아키텍처 개요

```
[수집 잡(cron)] → [정규화/검증] → [DB] → [REST API] → [프론트 SPA + 생성 HTML]
                                         ↘ [요약 생성기(LLM)] → 정적 HTML 커밋 → GitHub Pages
```

- **권장 스택**: Node/TypeScript(or Python FastAPI) + Postgres(Supabase 이미 프론트 문구에 등장) + 오브젝트 스토리지(생성 HTML) + 크론(수집·생성). 캐시 Redis 선택.
- **인증**: 내부 툴 → 세션/JWT. 읽기 API는 사내 전용.
- **정적 산출물**: 생성기가 만든 HTML은 `lifeinveinve` 레포 `earnings/`·`youtube/`·`substack/`·`dashboards/`에 커밋→Pages 자동배포(현행 유지). 또는 별도 정적 호스팅.

---

## 1. 데이터 소스 (수집 잡별) ★구체

| 소스 | 엔드포인트/방법 | 수집 대상 | 주기 | 비고 |
|---|---|---|---|---|
| **FMP quote** | `/stable/quote?symbol=` | 현재가·등락·시총·52주범위 | 1~15분 | 종목/ETF 시세 |
| **FMP profile** | `/profile?symbol=` | 기업개요·섹터·CEO·상장정보 | 일 | 종목 메타 |
| **FMP secFilings** | `/sec-filings-search/symbol?symbol=&from=&to=` | 8-K/10-Q finalLink | 발표일 트리거 | ⚠️ from/to 필수. 현 플랜 가용 |
| **SEC 8-K Ex-99.1** | secFilings finalLink fetch | 확정 매출·EPS·세그먼트·가이던스 | 발표 직후 | **T1 · 무료·결정론적** |
| **FMP analyst/estimates** | `/analyst/financial-estimates` | 컨센 EPS·매출 | 실적 전 | ⚠️ 상위플랜 필요(현재 막힘) |
| **FMP earnings calendar** | `/earnings-calendar` | 발표일·예상 EPS·실제 | 일 | ⚠️ 상위플랜 |
| **FMP transcript** | `/earning-call-transcript` | 컨콜 본문·Q&A | 발표 직후 | ⚠️ 상위플랜. 대체=Quartr/discountingcashflows |
| **YouTube RSS** | `youtube.com/feeds/videos.xml?channel_id=UC…` | 신규 영상(videoId·title·published) | 30~60분 | **API키 불필요** |
| **YouTube 자막** | timedtext / youtube-transcript | 자막 텍스트 | 신규감지 시 | 실패 시 설명·자동자막 |
| **대만 월매출(MOPS)** | TWSE/MOPS 월매출 공시 | 대만 반도체 9사 월매출 | 월초(10일경) | 대시보드 원천 |
| **AlphaSense** | 로그인 세션(mkim@investlife.com) | 전문가콜·브로커리서치 | 일 | ⚠️ 인증 필요 · 비번은 secret store, 코드/레포 금지 |
| **Substack** | 로그인 세션(lifeglobalresearch@) | 유료 뉴스레터 | 일 | ⚠️ 인증 필요 |

> ⚠️ **비밀번호는 절대 코드/레포/DB 평문 금지.** Vault/secret manager에 저장, 세션 토큰만 사용.
> FMP 플랜 갭: 컨센서스·재무제표·트랜스크립트 본문이 현 플랜에서 막힘 → (a) FMP 한 티어 업 또는 (b) AlphaSense/Quartr로 대체.

---

## 2. 숫자 검증 규칙 (전 모듈 필수)

모든 저장 수치에 `source`, `tier`, `status`(fact|partial|estimate), `as_of` 부여.
- Tier: **T1** SEC 8-K/10-Q(100%) > **T2** IR 가이던스(80%) > **T4** 웹 컨센(80%) > **T3** 트랜스크립트·자막(70%) > **E** 자체산정(≤75%).
- 검증 파이프: ①세그먼트 합=총매출(±0.5%) ②YoY/QoQ 원값 재계산(GAAP↔Non-GAAP·FQ↔CQ 혼용 금지) ③beat=(실제−컨센)/컨센 ④가이던스 미드=(low+high)/2.
- 무출처 수치는 저장/렌더 금지. 생성 노트 말미 "데이터 투명성 표" 자동 생성.

---

## 3. DB 스키마 (Postgres 기준, 핵심 테이블)

```sql
-- 종목/ETF 유니버스
company(ticker PK, name, exchange, country, sector, is_etf bool, is_coverage bool,
        cik, ceo, description, updated_at)
-- 시세 스냅샷
quote(ticker FK, price, change_pct, market_cap, week52_high, week52_low, as_of, PRIMARY KEY(ticker,as_of))
-- 일봉 캔들
candle(ticker FK, d date, o,h,l,c, v, PRIMARY KEY(ticker,d))
-- ETF 구성
etf_holding(etf_ticker FK, holding_ticker, weight, PRIMARY KEY(etf_ticker,holding_ticker))
-- 실적 이벤트
earnings(id PK, ticker FK, fiscal_period, report_date, when_ text, -- '장전'|'장후'
         eps_consensus, eps_actual, rev_consensus, rev_actual, surprise_pct,
         status text, -- '예정'|'발표'
         guidance jsonb, segments jsonb, summary text, note_html_path, updated_at)
-- 수치 출처(검증)
metric_source(id PK, entity_type, entity_id, metric_key, value, source, tier, status, as_of)
-- 데일리 리서치(시황/익스퍼트/섭스택)
daily_report(id PK, d date, kind text, -- 'market'|'expert'|'substack'|'youtube'
             payload jsonb, author, created_at)
-- 종목 코멘트/마크
comment(id PK, ticker FK, body, kind, -- '첫 콜'|'실적'|'코멘트'
        author, d date, created_at)
-- 유튜브 트래킹
yt_channel(channel_id PK, name, handle, tier int, topic)
yt_video(video_id PK, channel_id FK, title, published_at, transcript text, summary text, seen bool)
-- 대시보드 허브
dashboard(id PK, title, category, description, url, page_path, is_sample bool, author, created_at)
-- 대만 월매출
tw_revenue(ticker, name, month date, revenue_ntd numeric, mom_pct, yoy_pct, ytd_yoy_pct,
           PRIMARY KEY(ticker,month))
-- 데이터 수집 상태
ingest_status(source PK, last_run, ok_count, total_count, state text)
```

---

## 4. REST API (프론트가 목업 대신 호출) ★구체

모두 `GET /api/v1/...`, JSON. (쓰기=코멘트/대시보드 등록만 POST)

### 4.1 종목/시세 (뷰: 종목·신고가 트래커)
```
GET /stocks?country=US|KR|TW|JP&coverage=true|false&q=&limit=
    → [{ticker,name,sector,country,coverage,price,changePct,week52High,week52Low}]
GET /stocks/{ticker}
    → {…meta, quote, candles:[{d,o,h,l,c,v}], comments:[{body,kind,author,d}], marks:[…]}
GET /stocks/{ticker}/candles?period=1D|1W|1M|6M|52W
    → [{d,o,h,l,c,v}]   # 신고가 트래커 기간창 계산용(윈도우=1/5/21/126/252 거래일)
```
**신고가 트래커** 백엔드 계산(성능):
```
GET /highs?country=&period=1D|1W|1M|6M|52W&limit=12
    → [{ticker,name,country,last, windowHigh, pct:(last/windowHigh-1)*100, status:'신고가'|'임박'|''}]
    # windowHigh = 기간 내 max(high). pct>=-0.3→'신고가', >=-2→'임박'
    # 프론트 국가탭=country, 기간탭=period 그대로 매핑(현 프론트 ctryOf/HIPER와 동일 규칙)
```

### 4.2 실적/컨콜 (뷰: 실적/컨콜 요약)
```
GET /earnings?from=&to=&coverage=       → [earnings 레코드]  # 캘린더+리스트
GET /earnings/{id}                      → {…, guidance, segments, transparency[]}
POST /earnings/{id}/summarize           → 생성기 트리거 → {note_html_path}
GET /earnings/{id}/note                 → 생성된 HTML(또는 정적경로 리다이렉트)
```

### 4.3 데일리 (시황/익스퍼트/섭스택/유튜브)
```
GET /daily?kind=market|expert|substack|youtube&date=  → daily_report.payload
POST /daily/{kind}/generate?date=                     → 생성기 트리거 → {html_path}
# payload 스키마(현 프론트 목업과 1:1):
#  market  {summary, idx:[[name,val,chg]], movers:{up:[[t,pct]],down:[…]}, wl:[[t,pct,note]], issues:[]}
#  expert  [{ticker,src,sum,detail:[]}]
#  substack[{author,title,sum,tags:[],detail:[]}]
#  youtube [{channel,title,videoId,url,summary,timestamps:[],quote}]
```

### 4.4 유튜브 트래킹 (뷰: 데일리 유튜브 + ＋링크추가 버튼)
```
GET  /yt/channels                 → [{channelId,name,handle,tier,topic}]
POST /yt/channels {url|channelId,name,topic,tier}  → 등록(핸들→channelId resolve)
DELETE /yt/channels/{channelId}
GET  /yt/videos?since=            → 신규 영상(state 대조)
# 프론트 ＋유튜브 링크추가 버튼 = POST /yt/channels 로 연결(현재 localStorage → API 교체)
```

### 4.5 대시보드 허브 + 대만 월매출
```
GET  /dashboards                  → [{id,title,category,description,url|pagePath,isSample,author,date}]
POST /dashboards {…}              → 등록(현 hubAdd 프롬프트 → 폼)
GET  /tw-revenue?months=12        → [{ticker,name,series:[{month,revenue,mom,yoy,ytdYoy}]}]
# 대만 반도체 월매출 대시보드(dashboards/taiwan-semi-monthly-revenue.html)의 실데이터화
```

### 4.6 산업(ETF)/섹터/수집상태/검색
```
GET /etfs / GET /etfs/{ticker}    → ETF + holdings
GET /sectors                      → 섹터 히트맵 데이터
GET /ingest-status                → [{source,lastRun,ok,total,state}]  # '데이터 수집 상태' 뷰
GET /search?q=                    → {stocks:[],etfs:[],themes:[],earnings:[],views:[]}  # 전역검색(⌘K)
```

---

## 5. 요약 생성기 (백엔드 잡 3종) — LLM 파이프라인

공통: 소스 수집 → 검증(§2) → LLM 요약 → 브랜드 HTML 렌더 → 커밋/업로드. 슬러그 `YYMMDD-lifeinve-{earnings|youtube|substack}-{hash6}.html`. 상세 포맷=`docs/DEV_HANDOFF_요약생성.md` + `docs/prompts/`.

- **실적(A)**: secFilings→8-K Ex-99.1 파싱→컨센 조인→트랜스크립트→고정 11섹션+SVG차트+데이터투명성표. 레퍼런스 산출=`earnings/SMTC_FQ1FY27.html`.
- **유튜브(B)**: `yt_channel` RSS 신규감지→자막→영상별 요약→"오늘의 한 방"+번호형 아이템. 레퍼런스=`youtube/2026-07-01-lifeinve-youtube-daily.html`(16영상). 프롬프트=`PROMPT_lifeinve_youtube.md`.
- **섭스택(C)**: URL 묶음→요약. 레퍼런스=`substack/2026-07-01-lifeinve-substack-demo.html`. 프롬프트=`PROMPT_lifeinve_charts.md`.

브랜드킷(HTML 렌더): --life-green `#608C34`, accent `#8FB85D`, ink `#070203`, 배경 화이트. 폰트 Noto Sans KR + Open Sans. 개별 실적 딥다이브만 다크 분석테마 허용.

---

## 6. 수집 잡 스케줄(cron 예시)
```
*/10 * * * *  quote 갱신(커버리지 우선)
0 */1 * * *   YouTube RSS 신규감지 → 신규 시 자막·요약
0 6 * * 1-5   데일리 시황/익스퍼트/섭스택 생성(장전)
발표일 트리거  실적: 8-K 감지 → 파싱 → 요약 생성
0 12 10 * *   대만 월매출(MOPS) 월간 수집
0 3 * * *     profile/estimates/calendar 일배치
```

---

## 7. 프론트 연동 포인트(교체 지점)
현 index.html 목업 → API로 교체할 함수: `genSeries/stocks[]`→`/stocks`,`/candles`; `renderHub`의 `_hi`→`/highs`; `earnings[]`→`/earnings`; `renderDaily`의 `reports`→`/daily`; `ytItems`(localStorage)→`/yt/*`; `DASHBOARDS[]`→`/dashboards`; 전역검색 인덱스→`/search`. 신고가 트래커 기간/국가 규칙(HIPER 윈도우, ctryOf 접미사 .KS/.KQ=KR·.TW=TW·.T=JP)은 백엔드 `/highs`가 동일하게 구현.

## 8. 배포
정적 산출물(HTML)은 `deepvaluekim-cmd/lifeinveinve` 레포 커밋 → GitHub Pages(main /) 자동 빌드. 생성기는 파일 커밋까지 자동화(봇 커밋). API 서버는 별도 호스팅(내부망).
