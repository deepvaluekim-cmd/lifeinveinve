# life inve — 개발자 전달 패키지 (데일리 자동 요약)

> 개발자가 이 문서 하나로 **라이프 인베 데일리 요약 시스템** 전체를 파악·구현할 수 있게 정리.
> 라이브 데모: https://deepvaluekim-cmd.github.io/lifeinveinve/ · 샘플 모음: `/samples.html`
> 레포: `deepvaluekim-cmd/lifeinveinve` (GitHub Pages, main /).

---

## 0. 무엇을 만드나
소스(섭스택·유튜브·전문가콜·공시·시황)를 **매일 자동 요약 → 라이프 인베 브랜드 HTML 1파일 → 정적 배포**. 프론트(SPA 허브 `index.html`)는 이 산출물과 API를 소비. 현재 모든 데이터는 프론트 목업이며, 백엔드가 API를 제공하면 교체.

**5개 데일리 모드 (완전 별도 페이지):**
| 모드 | 사이드바 | 라이브 샘플 | 포맷 프롬프트/스펙 | 주 데이터 소스 |
|---|---|---|---|---|
| **시황** | 데일리 시황 | `daily/2026-06-29-lifeinve-market-brief.html` | `HTML_STYLE_GUIDE.md` + 리치 시황 골격(아래 §2) | 지수·ETF·뉴스 피드(FMP/뉴스) |
| **익스퍼트 콜** | 데일리 익스퍼트 콜 | `daily/2026-07-01-lifeinve-expert-calls.html` | `prompts/PROMPT_lifeinve_expert.md` | AlphaSense 전문가콜(로그인) |
| **섭스택** | 데일리 서브스택 | `substack/2026-07-01-lifeinve-substack-demo.html` | `prompts/PROMPT_lifeinve_charts.md` | 뉴스레터 URL 묶음 |
| **유튜브** | 데일리 유튜브 | `youtube/2026-07-01-lifeinve-youtube-daily.html` | `prompts/PROMPT_lifeinve_youtube.md` + `youtube_channels.yaml` | 채널 RSS + 자막 |
| **실적/컨콜** | 실적/컨콜 요약 | `earnings/SMTC_FQ1FY27.html` | `HTML_STYLE_GUIDE.md §6` + `earnings-note-spec.md` | SEC 8-K/10-Q + 컨센 + 트랜스크립트 |
| **(복붙)타임라인** | — | `daily/timeline/2026-06-30-life-timeline.md` | `daily/timeline/TEMPLATE_life-timeline.md` | 시황 요약(메신저 붙여넣기용 텍스트) |

---

## 1. 공통 규격 (반드시 준수)
- **브랜드/스타일**: `docs/HTML_STYLE_GUIDE.md` — 짙은 그린 `#3F5C21`(primary)/`#608C34`/`#8FB85D`, Ink `#070203`, 배경 화이트. 폰트 `Noto Sans KR`+`Open Sans`(숫자 tabular). 등락 상승=빨강`#e0392b`/하락=파랑`#1769d6`(한국식).
- **문체**: 프로페셔널 압축 서술체(헤드=음슴체, 본문=완전문), fact 위주, 무출처 수치 금지, 직접인용 따옴표.
- **산출물**: 자기완결 단일 HTML(inline `<style>`+인라인 SVG, 외부 JS 없음, 웹폰트 CDN만), 반응형. 슬러그 `YYMMDD-lifeinve-{mode}-{hash6}.html`.
- **숫자 검증(Tier)**: T1 SEC(100%)>T2 IR(80%)>T4 웹컨센(80%)>T3 트랜스크립트·자막·전문가콜(70%)>E 자체산정(≤75%). 각 값에 `{source,tier,status,as_of}` 태깅. 실적/시황은 말미 데이터 투명성 표.

## 2. 리치 데일리 시황 골격 (모드=시황)
⭐Market of the Day = ①주요 지수(값+등락 카드 + SVG 등락 막대) ②Trending Stocks(티커+등락%+사유) ③ETF Top&Bottom(상승10/하락10 SVG 수평막대 + 테마요약) → ⭐News of the Day(①② 번호형) → 📈신고가 달성주(섹터 집계 SVG + Top 리스트: 티커·섹터/국가·종가·등락%·시총) → 🛢️시장 스냅샷(지수선물·원자재·VIX). 이미지=인라인 SVG(외부 이미지 금지).

## 3. 백엔드 (API·수집·스키마)
전체 구현 스펙 = **`docs/BACKEND_SPEC.md`** (읽어야 할 핵심 문서). 요지:
- 수집 잡: FMP(quote/profile/secFilings), SEC 8-K Ex-99.1(무료 T1), YouTube RSS(`feeds/videos.xml?channel_id=UC…`, 키불필요)+자막, 대만 MOPS 월매출, AlphaSense/Substack(로그인·secret).
- REST API: `/stocks`·`/stocks/{t}`·`/highs`(신고가 트래커 기간/국가)·`/earnings`·`/daily?kind=market|expert|substack|youtube`·`/yt/*`(채널 CRUD·+링크추가 버튼 연동)·`/dashboards`·`/tw-revenue`·`/search`.
- DB: company/quote/candle/etf_holding/earnings/metric_source/daily_report/comment/yt_channel/yt_video/dashboard/tw_revenue/ingest_status.
- 생성기 3종(실적·유튜브·섭스택/익스퍼트) = LLM 파이프라인(수집→검증→요약→HTML 커밋).

## 4. 프론트 연동 포인트 (목업→API)
`index.html`: `genSeries/stocks[]`→`/stocks`, `renderHub`의 `_hi`→`/highs`, `earnings[]`→`/earnings`, `renderDaily`의 `reports`→`/daily`, `ytItems`→`/yt/*`, `DASHBOARDS[]`→`/dashboards`, 전역검색→`/search`. 코멘트 작성(컴포즈 모달: 제목·본문·종목/ETF연결·카테고리·태그·이미지첨부)→`POST /comment`(현재 프론트 in-memory).

## 5. 전달물 체크리스트 (개발자에게 함께 전달)
- [ ] `docs/DEV_PACKAGE.md` (본 문서 — 시작점)
- [ ] `docs/BACKEND_SPEC.md` (DB·API·수집·생성기)
- [ ] `docs/HTML_STYLE_GUIDE.md` (색·폰트·문체·구성요소)
- [ ] `docs/DEV_HANDOFF_요약생성.md` (요약 포맷 상세)
- [ ] `docs/prompts/PROMPT_lifeinve_charts.md` (섭스택/실적)
- [ ] `docs/prompts/PROMPT_lifeinve_expert.md` (익스퍼트 콜)
- [ ] `docs/prompts/PROMPT_lifeinve_youtube.md` (유튜브) + `youtube_channels.yaml`
- [ ] 라이브 샘플 5종 + `samples.html` (포맷·디자인 레퍼런스)
- [ ] `earnings-note-spec.md` (실적 검증룰 PART 1~5)

> ⚠️ 보안: AlphaSense/Substack 자격증명은 secret manager에만. 코드·레포·DB 평문 금지. 데모 페이지 콘텐츠는 `[데모]`.
