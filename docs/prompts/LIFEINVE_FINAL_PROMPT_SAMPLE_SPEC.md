# life inve 문서별 최종 프롬프트 / 데이터 매핑 / 샘플 정리

작성일: 2026-07-02  
기준 레이아웃: `earnings/SMTC_FQ1FY27.html`  
공통 톤: 라이프자산운용 리서치, fact-first, 음슴체, 표/차트/데이터 투명성 표 필수

---

## 0. 공통 레이아웃 계약

모든 문서는 아래 구조를 기본으로 함.

1. 초록색 `life inve` 헤더
2. `capsule` 한 줄 요약
3. 3줄 요약 또는 핵심 실적 요약
4. 숫자 테이블
5. SVG 차트
6. 해석 불렛
7. Q&A 또는 Day-by-Day / Call Card
8. 데이터 투명성 표
9. footer: `Internal research note. Not investment advice.`

### 공통 데이터 투명성 상태값

| 상태 | 의미 |
| --- | --- |
| `fact` | 회사 IR, SEC, 공식 거래소, 확정 시장 데이터 |
| `reported` | FactSet/언론/외부 리서치 원문 보도값 |
| `partial` | 원문 일부 확인, 보조 데이터 또는 라벨링 |
| `estimate` | 입력값 기반 계산, 가이던스 산출, midpoint |
| `private` | AlphaSense/local archive 등 비공개 원문 |

### 공통 금지

- 입력 데이터에 없는 숫자 생성 금지
- 컨센서스 공급자 생략 금지
- private 원문 장문 인용 금지
- 주가 반응 원인 단정 금지
- Must/외부 브랜드 톤 그대로 복사 금지
- SVG 차트는 y축 0 기준. 과장 스케일 금지

---

## 1. 실적 요약 / 컨콜 요약

### 배포 샘플

- AVAV 샘플: https://deepvaluekim-cmd.github.io/lifeinveinve/earnings/AVAV_FQ4FY26.html
- 기준 레이아웃: https://deepvaluekim-cmd.github.io/lifeinveinve/earnings/SMTC_FQ1FY27.html

### 필요한 데이터

| 블록 | 필드 | 1순위 소스 | 2순위 / 보조 |
| --- | --- | --- | --- |
| 기업 개요 | ticker, company_name, business_summary, sector, industry | 회사 IR profile / 10-K | FMP profile |
| 실적 actual | revenue, GAAP EPS, Non-GAAP EPS, EBITDA, margin, segment revenue | SEC 8-K Ex-99.1 / IR release | FMP income statement |
| 컨센서스 | revenue_estimate, EPS_estimate, provider, timestamp | FactSet/Visible Alpha 보도 | FMP earnings calendar |
| 주가 반응 | regular, after-hours, pre-market, timestamp | FMP quote / aftermarket quote | 언론 보도 |
| 가이던스 | revenue low/high, EPS low/high, EBITDA low/high, KPI guide | 회사 release / IR deck | transcript |
| Q&A | question, answer, analyst, topic | 공식 transcript / DCF transcript | AlphaSense |
| 보조 시각자료 | EarningsHub screenshot, IR deck chart | EarningsHub capture / IR PDF | browser capture |

### 그래프 / 표 구성

| 위치 | 구성 | 예시 |
| --- | --- | --- |
| 핵심 실적 표 | 지표 / 실제 / 컨센서스 또는 전년 / 서프라이즈 / YoY | Revenue, GAAP EPS, Non-GAAP EPS, EBITDA |
| SVG 1 | 매출 실제 vs 컨센서스 | AVAV `$641.6M` vs `$556.0M` |
| SVG 2 | 세그먼트별 매출 | AxS `$492.4M`, SCDE `$149.2M` |
| SVG 3 | 가이던스 범위 또는 KPI 트래커 | FY27 revenue `$2.125B-$2.225B` |
| KPI 표 | 수주, backlog, margin, segment KPI | bookings, funded backlog, unfunded backlog |
| 데이터 투명성 표 | 지표 / 출처 / 상태 / 신뢰도 | IR release, FactSet, 계산값 |

### 문구 템플릿

```text
{TICKER} {PERIOD} 매출은 {revenue_actual}로 {consensus_provider} 기준 컨센서스 {revenue_estimate} 대비 {revenue_surprise_pct}% {상회/하회}했음.
Non-GAAP EPS는 {eps_actual}로 컨센서스 {eps_estimate} 대비 {eps_surprise_pct}% {상회/하회}했음.
{main_kpi_name}는 {main_kpi_value}로 전년 또는 전분기 대비 {main_kpi_change}를 기록했음.
주가 반응은 {session} {price_reaction_pct}로 확인되나, 기준 시각과 가격 출처가 확인된 경우에만 원인 문장에 연결함.
가이던스는 {guide_metric} {guide_low}-{guide_high}로 제시됐고, 확인 포인트는 {check_item_1}, {check_item_2}, {check_item_3}임.
```

### 최종 프롬프트

```text
너는 life inve 실적/컨콜 요약 작성자임.
아래 INPUT_JSON만 사용해 한국어 음슴체 리서치 노트를 작성.

[절대 규칙]
- 숫자는 INPUT_JSON에 있는 값만 사용.
- actual, estimate, source_key를 분리.
- 컨센서스는 provider가 없으면 "컨센서스 미확인"으로 표기.
- 주가 반응은 timestamp가 없으면 본문 해석에 연결하지 말 것.
- Q&A는 3~5개만 작성.
- 모든 주요 수치는 데이터 투명성 표에 역추적 가능해야 함.

[출력 섹션]
1. capsule 한 줄 요약
2. 주가 반응
3. 기업 개요
4. 핵심 실적 vs 컨센서스
5. SVG 차트 2~3개 설명
6. 경영진 핵심 메시지
7. 서프라이즈 포인트
8. 특이사항 & 핵심 KPI
9. 가이던스
10. Q&A 요약
11. 데이터 투명성 표

[INPUT_JSON]
[[INPUT_JSON]]
```

---

## 2. 데일리 시황

### 배포 샘플

- https://deepvaluekim-cmd.github.io/lifeinveinve/daily/2026-07-01-lifeinve-market-brief-v2.html

### 필요한 데이터

| 블록 | 필드 | 1순위 소스 | 보조 |
| --- | --- | --- | --- |
| 주요 지수 | Dow, S&P 500, Nasdaq, Russell close/change_pct | FMP batch-index-quotes | index official pages |
| 선물 | YM, ES, NQ, RTY price/change_pct/timestamp | CME / FMP quote fallback | Yahoo futures |
| 원자재 | Gold, Silver, WTI, NatGas, Copper price/change_pct | FMP batch-commodity-quotes | CME/COMEX/NYMEX |
| ETF Top/Bottom | symbol, theme, change_pct, volume | FMP batch-etf-quotes | ETF issuer |
| 섹터/산업 | sector, industry, change_pct, leaders | FMP sector/industry performance | SSGA sector tracker |
| 상승/하락 종목 | symbol, change_pct, dollar_volume, reason_label | FMP gainers/losers + news | exchange quote bulk |
| 신고가/신저가 | symbol, sector, is_52w_high/low, dollar_volume | FMP EOD bulk + 252D rolling | 내부 계산 |
| 시장 한 줄 | top drivers 2~3개 | 데이터 + Reuters/AP/MarketWatch | WSJ/Bloomberg 보도 |

### 그래프 / 표 구성

| 위치 | 구성 |
| --- | --- |
| 주요 지수 표 | 지수 / 등락률 / 톤 / 핵심 한 줄 |
| SVG 1 | ETF Top 5 bar chart |
| SVG 2 | ETF Bottom 5 bar chart |
| 선물/원자재 표 | 구분 / 티커 / 가격 / 등락률 / 메모 |
| 상승/하락 종목 표 | 티커 / 등락률 / 분류 / 원인 라벨 |
| 데이터 투명성 표 | 지표 / 출처 / 상태 / 신뢰도 |

### 문구 템플릿

```text
S&P 500 {spx_pct}, Nasdaq {nasdaq_pct}. {top_theme}가 강세를 주도했고, {weak_asset}는 약세였음.
ETF에서는 {top_etf_1} {top_etf_1_pct}, {top_etf_2} {top_etf_2_pct}가 상위권.
하락은 {bottom_etf_1} {bottom_etf_1_pct}, {bottom_etf_2} {bottom_etf_2_pct}.
선물은 {futures_direction}였고, 원자재에서는 {commodity_leader}가 {commodity_leader_pct}, {commodity_lagger}가 {commodity_lagger_pct}.
상승 종목 {gainer_symbol}는 {gainer_pct}. 원인 라벨은 {reason_label}.
```

### 최종 프롬프트

```text
너는 life inve 데일리 시황 작성자임.
아래 INPUT_JSON만 사용해 fact-first 음슴체 시황을 작성.

[절대 규칙]
- 지수, ETF, 섹터, 종목 수치는 입력값만 사용.
- 뉴스 원인은 source_url 또는 source_title이 없으면 "원인 미확인"으로 표기.
- 상승/하락 종목은 change_pct만 쓰지 말고 dollar_volume 또는 market_cap 확인.
- 신고가/신저가는 252거래일 rolling high/low 계산값이 없으면 작성 금지.
- 시장 한 줄은 최소 2개 이상 데이터 driver가 있을 때만 작성.

[출력 섹션]
1. 시장 한 줄
2. 3줄 요약
3. 주요 지수 마감
4. ETF Top/Bottom SVG 설명
5. 지수 선물 / 원자재 체크
6. 상승 / 하락 종목
7. 내일 체크포인트
8. 데이터 투명성 표

[INPUT_JSON]
[[INPUT_JSON]]
```

---

## 3. 주간 시황 랩

### 배포 샘플

- https://deepvaluekim-cmd.github.io/lifeinveinve/daily/2026-06-22-26-lifeinve-weekly-market-wrap.html
- 참고 원형: https://must-charts.pages.dev/sitwhang_optionsoracle_weekly-market-wrap-june-22-june-26-49cebb

### 필요한 데이터

| 블록 | 필드 | 1순위 소스 | 보조 |
| --- | --- | --- | --- |
| 주간 지수 | weekly_return for S&P, Nasdaq, Dow, Russell, Equal Weight | FMP historical price / index official | weekly wrap source |
| 섹터 성과 | sector weekly change, best/worst | FMP sector historical performance | SSGA |
| ETF 성과 | ETF weekly change | FMP ETF quotes + historical | ETF issuer |
| 매크로 | WTI, 10Y yield, DXY, Gold weekly change | FMP / FRED / Treasury | Reuters/AP |
| 주요 종목 | symbol, daily move, weekly move, catalyst | FMP quote + news | source article |
| Day by Day | date, index move, top catalyst | market data + news | weekly commentary |

### 그래프 / 표 구성

| 위치 | 구성 |
| --- | --- |
| Weekly Scorecard | 항목 / 구분 / 등락 / 톤 / 핵심 한 줄 |
| SVG 1 | 주간 승자 bar chart |
| SVG 2 | 주간 압박 bar chart |
| Day by Day 표 | 요일 / 시장 흐름 / 핵심 종목·테마 |
| 다음 주 관전 포인트 | 4개 불렛 |
| 데이터 투명성 표 | 원문 수치 / 계산 / 해석 구분 |

### 문구 템플릿

```text
이번 주 핵심은 하락의 크기보다 하락의 분포였음.
{headline_index} {headline_index_pct}, {pressure_index} {pressure_index_pct}로 헤드라인은 약했지만, {breadth_index} {breadth_index_pct}로 시장 폭은 유지됐음.
자금은 {sold_theme}에서 {bought_sector_1}, {bought_sector_2}, {bought_sector_3}로 이동했음.
다음 주 분기점은 {watch_1}, {watch_2}, {watch_3}, {watch_4}임.
```

### 최종 프롬프트

```text
너는 life inve 주간 시황 랩 작성자임.
아래 INPUT_JSON과 원문 weekly commentary만 사용해 주간 로테이션을 정리.

[절대 규칙]
- 주간 수익률은 5거래일 기준을 명시.
- headline index와 breadth index를 분리.
- "시장 붕괴" 같은 표현은 breadth 데이터가 확인될 때만 사용.
- 원문 commentary는 요약만 하고 브랜드/문체는 life inve 톤으로 변환.
- Day by Day는 각 일자별로 지수 1개, 종목/테마 2개 이상 포함.

[출력 섹션]
1. 주간 한 줄
2. 3줄 요약
3. Weekly Scorecard
4. 주간 승자/압박 SVG 설명
5. 핵심 해석
6. Day by Day
7. 다음 주 관전 포인트
8. 데이터 투명성 표

[INPUT_JSON]
[[INPUT_JSON]]
```

---

## 4. AlphaSense / 익스퍼트 콜 데일리

### 배포 샘플

- https://deepvaluekim-cmd.github.io/lifeinveinve/daily/alphasense_expert_call_daily_template.html

### 필요한 데이터

| 블록 | 필드 | 1순위 소스 | 보조 |
| --- | --- | --- | --- |
| 콜 원문 | title, date, source, speaker_role, transcript_text | AlphaSense local archive | research_memory.sqlite |
| ticker coverage | direct_ticker, read_through_ticker, doc_count | ticker parser + analyst override | manual map |
| 반복 주장 | claim_id, claim_text, first_seen, last_seen, doc_count | claim clustering | LLM extraction |
| 수치 근거 | metric, value, unit, source_span | numeric extraction | manual check |
| 투자 연결 | ticker, theme, read_through, risk, confidence | editor synthesis | local DB |
| 반대 증거 | risk_claim, conflicting_source, confidence | archive search | news/IR |

### 그래프 / 표 구성

| 위치 | 구성 |
| --- | --- |
| 오늘의 핵심 3개 | theme 중심 번호형 |
| Ticker Coverage 표 | 티커 / 노출 유형 / 콜 수 / 핵심 KPI / 판정 |
| 콜 카드 | role badge / 제목 / 근거 / 투자 연결 / 확인 필요 |
| 데이터 매핑 표 | 블록 / 필드 / 소스 / HTML 위치 |
| 작성 프롬프트 박스 | 실제 자동화 프롬프트 그대로 삽입 |
| 데이터 투명성 표 | private/partial/interpretation 구분 |

### 문구 템플릿

```text
{theme} 관련 콜은 {doc_count}건 확인됐고, 직접 언급 티커는 {direct_tickers}, read-through 티커는 {readthrough_tickers}임.
핵심 주장은 {claim_summary}. 반복 여부는 doc_count {doc_count}, first_seen {first_seen}, last_seen {last_seen} 기준으로 판단함.
투자 연결은 {investment_link}. 확인 필요 데이터는 {check_metric_1}, {check_metric_2}, {check_metric_3}.
반대 증거는 {risk_or_conflict}. 숫자 근거가 없으면 confidence는 medium 이하로 둠.
```

### 최종 프롬프트

```text
너는 life inve AlphaSense 익스퍼트 콜 요약 담당자임.
아래 INPUT_JSON만 사용해 음슴체로 작성.

[절대 규칙]
- private transcript 원문은 장문 인용하지 않음.
- direct ticker와 read-through ticker를 분리.
- 반복 주장은 doc_count 2 이상일 때만 "반복"으로 표기.
- claim에는 first_seen, last_seen, confidence를 붙임.
- 숫자 근거 없는 qualitative claim은 confidence medium 이하.
- 투자 연결과 반대 증거를 반드시 같이 작성.

[출력 섹션]
1. 오늘의 한 줄
2. 오늘의 핵심 3개
3. Ticker Coverage
4. 반복 주장
5. 콜 카드 2~5개
6. 데이터 매핑
7. 작성 프롬프트
8. 데이터 투명성 표

[INPUT_JSON]
[[INPUT_JSON]]
```

---

## 5. 최종 샘플 링크 모음

| 문서 | 샘플 URL | 상태 |
| --- | --- | --- |
| 실적 요약 - AVAV | https://deepvaluekim-cmd.github.io/lifeinveinve/earnings/AVAV_FQ4FY26.html | 배포 완료 |
| 실적 기준 레이아웃 - SMTC | https://deepvaluekim-cmd.github.io/lifeinveinve/earnings/SMTC_FQ1FY27.html | 기준 |
| 데일리 시황 | https://deepvaluekim-cmd.github.io/lifeinveinve/daily/2026-07-01-lifeinve-market-brief-v2.html | 배포 완료 |
| 주간 시황 | https://deepvaluekim-cmd.github.io/lifeinveinve/daily/2026-06-22-26-lifeinve-weekly-market-wrap.html | 배포 완료 |
| AlphaSense 익스퍼트 콜 | https://deepvaluekim-cmd.github.io/lifeinveinve/daily/alphasense_expert_call_daily_template.html | 배포 완료 |
| 샘플 허브 | https://deepvaluekim-cmd.github.io/lifeinveinve/samples.html | 배포 완료 |
