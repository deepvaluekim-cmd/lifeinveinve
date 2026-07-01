# 개발자 전달 스펙 — life inve 데일리 자동 요약 생성기

> 목적: 트래킹 소스(실적·유튜브·섭스택)에서 **매일 신규 콘텐츠를 자동 감지 → 요약 → life inve 브랜드 HTML 1파일 산출 → GitHub Pages 배포**하는 파이프라인을 구현한다.
> 배포 대상: `deepvaluekim-cmd/lifeinveinve` (GitHub Pages · https://deepvaluekim-cmd.github.io/lifeinveinve/)
> 이 문서 하나로 요약 포맷·데이터 소스·검증 규칙·사이트 연동을 모두 커버한다.

---

## 0. 전체 그림

3개 **데일리 생성기(모드)**가 같은 브랜드킷·검증 규칙을 공유하되 **완전 별도 페이지**로 산출된다.

| 모드 | 입력 | 산출물 slug | 사이트 연동 위치 |
|---|---|---|---|
| **A. 실적/컨콜** | 티커+분기 이벤트 | `YYMMDD-lifeinve-earnings-*.html` | 사이드바 `실적/컨콜 요약` |
| **B. 유튜브** | 트래킹 채널 신규영상 | `YYMMDD-lifeinve-youtube-*.html` | 사이드바 `데일리 유튜브` |
| **C. 섭스택** | 섭스택/뉴스레터 URL 묶음 | `YYMMDD-lifeinve-substack-*.html` | 사이드바 `데일리 서브스택` |

공통: 자기완결 HTML(외부 의존=웹폰트 CDN만), 반응형, 무출처 수치 금지.

---

## 1. 데이터 소스 & 숫자 검증 (전 모드 공통) ★필수

### 1-1. 소스 Tier (모든 수치에 부여)
| Tier | 소스 | 대상 | 신뢰도 | 상태 라벨 |
|---|---|---|---|---|
| **T1** | SEC 8-K Ex-99.1 / 10-Q / 10-K | 확정 매출·EPS·세그먼트·마진 | 100% | `fact` |
| **T2** | 회사 IR·MD&A·가이던스 | 차기 가이던스·KPI | 80% | `fact(가이던스)` |
| **T3** | 컨콜 트랜스크립트 / 유튜브 자막 | 발언·정성 코멘트 | 70% | `partial` |
| **T4** | 웹 집계 컨센서스 | 컨센 EPS·매출·TP | 80% | `partial` |
| **E** | 자체 산정 파생지표 | EV/MW, P×Q 등 | ≤75% | `estimate` |

신뢰 우선순위 **T1 > T2 > T4 > T3 > E**. 상충 시 T1 채택 + 각주.

### 1-2. 데이터 파이프라인 (실적 기준, 기업 무관)
```
1) SEC 공시 링크 획득: FMP secFilings/search-by-symbol (symbol + from/to 날짜)
   → 해당 분기 8-K/10-Q finalLink 확보                                   [T1]
2) 8-K Exhibit 99.1(실적 보도자료) fetch → 매출·EPS·세그먼트·가이던스 파싱  [T1/T2]
3) 컨센서스: FMP analyst/financial-estimates (상위플랜) 또는 웹 집계        [T4]
4) 트랜스크립트: FMP earningsTranscript(상위플랜) 또는 discountingcashflows/Quartr [T3]
5) 검증 로직 실행(1-3) → 통과 값만 차트화
```
> ⚠️ 현재 사용자 FMP 플랜: `company/profile`·`secFilings`(날짜 필수)·`earningsTranscript/transcripts-dates`만 가능. `statements`·`analyst/estimates`·`transcript 본문`은 상위플랜 필요. **확정 실적은 SEC 8-K로 무료·결정론적 확보 가능**(컨센서스만 유료 갭).

### 1-3. 검증 로직 (차트에 찍기 전 자동 실행)
1. 모든 값에 `{value, source, tier, status, asOfDate}` 태깅. 출처 없으면 차트 제외(날조 금지).
2. **교차합**: 세그먼트 합 = 총매출(±0.5%). 불일치 플래그.
3. **성장률 재계산**: YoY/QoQ를 원값에서 직접 계산해 공시와 대조. **GAAP↔Non-GAAP, 회계분기(FQ)↔역년(CQ) 혼용 금지**.
4. **Beat/Miss = (실제−컨센)/컨센 ×100**. 실제=T1, 컨센=T4. 둘 다 없으면 미표기.
5. **가이던스 미드포인트 = (low+high)/2**, 레인지는 error-bar, 같은 basis끼리만 비교.

### 1-4. 차트 렌더링 룰
- **막대 Y축 0에서 시작**(truncation 과장 금지). 색: 실적=파랑·가이던스=점선회색·beat=녹색·miss=적색·컨센=보라.
- 차트 하단 **캡션 필수**: `출처: [소스] · [fact/partial/estimate] · as of [날짜]`.
- 본문 수치 텍스트 = 차트 값 라벨 **일치 검증**.

### 1-5. 노트 말미 필수 — "데이터 투명성 표"
`지표 | 출처 | 상태(fact/partial/estimate) | 신뢰도%` 전 항목 나열. 독자가 모든 차트 숫자를 1:1 역추적 가능해야 함.

---

## 2. 모드 A — 실적/컨콜 요약 (고정 골격)

**섹션 순서·헤더 고정, 깊이만 가변.** (레퍼런스 구현: `earnings/SMTC_FQ1FY27.html`)

0. `⏱️ 타임라인 요약` — 맨 위 한 줄 캡슐: 티커·분기·세션·매출/EPS beat%·가이던스방향·주가±%·한줄결론
1. `📊 [TICKER] 실적발표 (YYYY년 N분기)` + `세션: 장전/장후`
2. `주가 반응: ±X% (After Hours / Reg. Close)`
3. `📮 기업 개요` (1~2문장)
4. `📊 핵심 실적 vs 컨센서스` — EPS(Non-GAAP)/EPS(GAAP)/매출: `실제 (예상 $X, +Y%, YoY Z%)` + 출처각주
5. `🗣 경영진 핵심 메시지` (줄글)
6. `🔥 서프라이즈 포인트` — `[라벨]:` 불릿 3개 + 마지막 `주가 반응 원인:` 불릿
7. `📝 특이사항 & 핵심 KPI` (불릿/표)
8. `🚀 가이던스` (줄글 + 트래커 차트)
9. `📞 Q&A 요약 (3~5개)` — `QN: 주제 / 질문 / 답변`
10. `📎 Transcript Link`
+ **시각화**(§1-4): 매출 vs 컨센 비트 바 · 세그먼트 바 · 데이터센터/핵심지표 Q→Q 트래커
+ **데이터 투명성 표**(§1-5)

문체: 국문 평서체(~했다/밝혔다), fact 위주(점수·투자의견 금지), 핵심수치 볼드+괄호 컨텍스트, 직접인용 따옴표.
멀티분기 노트: beat-and-raise 매트릭스 + 가이던스 상향 워크플로우 + 접이식 트랜스크립트.

---

## 3. 모드 B — 데일리 유튜브 요약

**신규 감지 → 자막 요약.** (상세: `projects/lifeinve_charts/PROMPT_lifeinve_youtube.md`)

- **채널 레지스트리**: `youtube_channels.yaml` (name·handle·channel_id·tier·topic). 사용자가 채널 추가.
- **신규 감지**: 채널 RSS `https://www.youtube.com/feeds/videos.xml?channel_id=UC…` (API키 불필요) → `<entry>` videoId·published를 state(`youtube_state.json`)와 대조해 신규만.
- **요약 소스**: 자막(youtube-transcript/timedtext) → 실패 시 설명·자동자막 → 전부 실패 시 제목·설명만 + `[자막없음]`.
- **페이지 골격**: 헤더 → `오늘의 한 방`(3~5불릿) → 번호형 영상 아이템(번호+티커/주제·긴급도배지·볼드헤드라인·서브·`출처:`채널/시각·`영상→`링크·본문 2~4문단+`[12:34]`타임스탬프·풀인용1) → `그 외 오늘` → `채널별 인덱스` → 푸터/카비앗.
- **검증**: state 대조(과거영상 재요약 금지), 인용 자막 원문 대조(오인식 시 `[추정]`), videoId·업로드시각 RSS 일치.
- **사이트 UI**: index.html `데일리 유튜브` 섹션에 트래킹 링크 리스트 + `＋ 유튜브 링크 추가` 버튼(현재 localStorage 데모; 백엔드 붙일 때 레지스트리에 연동).

---

## 4. 모드 C — 데일리 섭스택 요약

상세: `projects/lifeinve_charts/PROMPT_lifeinve_charts.md`(모드 A/C 정본). 골격: 헤더 → `오늘의 한 방` → 번호형 메인아이템(티커+긴급도+볼드헤드라인+`출처:`+본문+풀인용) → 매크로/그외/채팅방 → 푸터+소스리스트+카비앗. 헤드=음슴체, 본문=완전문.

---

## 5. 브랜드킷 (허브·데일리 페이지)

| 역할 | HEX |
|---|---|
| Primary 라이프그린 | `#608C34` |
| Accent 라이트그린 | `#8FB85D` |
| Ink 텍스트 | `#070203` |
| 배경 | `#FFFFFF` |
| 긴급 배지(기능색) | `#C0392B` |

폰트: 한글 `Noto Sans KR`, 영문/숫자 `Open Sans`(Google Fonts, OFL). 티커·숫자 `tabular-nums`.
> 개별 실적 딥다이브 노트는 다크 분석테마(가독성) 허용, 허브·데일리는 LIFE 화이트/그린.

---

## 6. 사이트 연동 (index.html)

- SPA 허브(Tailwind CDN + Pretendard). 섹션 = `<section id="g-{id}" class="gview">`, `showSection(id)`로 토글.
- 데일리 나비: `openDaily('earn'|'substack'|...)`, 유튜브 `openYoutube()`.
- **실적 연동 예**: `earnings[]` 배열 항목에 `link:'earnings/파일.html'` 추가 → `renderEarn()`가 `📄 리포트` 링크 렌더 → 클릭 시 해당 HTML 오픈. (구현 완료: SMTC)
- 신규 데일리 파일은 `earnings/` `youtube/` `substack/` 경로에 커밋 → 해당 섹션 배열/리스트에 링크 추가.
- 배포: `git push origin main` → GitHub Pages 자동 빌드(legacy, main /).

---

## 7. 파일 인벤토리 (전달물)

**레포 내(배포됨)**
- `index.html` — 허브 SPA (실적 리스트 + 유튜브 섹션 + 링크추가 버튼)
- `earnings/SMTC_FQ1FY27.html` — 실적 요약 레퍼런스 구현(모드 A 예시)
- `docs/DEV_HANDOFF_요약생성.md` — 본 문서
- `docs/SPEC.md` — 사이트 데모 사양

**생성기 프롬프트/설정(사내, `C:\Users\kimfo\projects\lifeinve_charts\`)**
- `PROMPT_lifeinve_charts.md` — 모드 A(실적)/C(섭스택) 정본
- `PROMPT_lifeinve_youtube.md` — 모드 B(유튜브) 정본
- `youtube_channels.yaml` — 트래킹 채널 레지스트리
- (런타임) `youtube_state.json` — 신규감지 state

**어닝 포맷 상세 스펙(사내)**
- `C:\Users\kimfo\earnings-note-spec.md` — PART 1~5(소스·톤·레이아웃·프롬프트·검증룰)

---

## 8. 개발 우선순위 (제안)
1. 모드 A 실적 파이프라인(SEC 8-K 파싱 + 검증 + 차트 렌더) — 데이터 신뢰도 최우선
2. 모드 B 유튜브(RSS 신규감지 + 자막 요약) — 링크추가 버튼 백엔드 연동
3. 모드 C 섭스택 + 배포 자동화(생성→커밋→Pages)
