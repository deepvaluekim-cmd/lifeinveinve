# LifeInve 실적 요약 마스터 프롬프트

## 0. 목적

- 단일 기업 실적발표 요약을 LifeInve 스타일로 작성하기 위한 통합 MD.
- 출력은 사용자가 지정한 고정 포맷을 유지.
- 문체는 반드시 음슴체.
- 숫자는 `{}` 슬롯으로만 채우고, 각 슬롯의 데이터 소스를 명확히 분리.
- 헤지펀드용 메모 기준으로 FACT와 VIEW를 구분.

## 1. 출력 샘플

> 아래 샘플은 포맷 예시임. 실제 발행 시 숫자/분기/일자는 반드시 원천 데이터로 재검증해야 함.

```markdown
📊 AVAV 실적발표 (FY2026 4분기)
일자: 2026-07-01 애프터마켓

주가 반응: +19.42% (After Hours)

📮 기업 개요
AeroVironment는 무인항공체계, 정밀타격·방어 시스템, 우주·사이버·지향성 에너지 솔루션을 개발·공급하는 방산 기술 기업임.

📊 핵심 실적 vs 컨센서스
- EPS (Non-GAAP): $0.64 (예상 $0.68, -5.88%)
- EPS (GAAP): 미공시
- 매출: $408.05M (예상 $475.54M, -14.19%, YoY N/A%)
* Based on SEC 8-K/10-Q data

🗣 경영진 핵심 메시지
경영진은 4분기와 연간 모두 사상 최고 수준의 실적을 기록했다고 강조함. BlueHalo 인수로 사업 포트폴리오와 기술 역량이 확장됐고, 로이터링 뮤니션·대드론·전술 무인기·지향성 에너지 분야에서 수주와 제품 출시가 이어지고 있다고 설명함. 향후 12~24개월 성장 가시성은 높아졌으나, 정부 셧다운·예산 지연·SCAR 계약 종료·생산능력 확대 관련 CapEx는 단기 변동성과 현금흐름 부담 요인으로 제시됨.

🔥 서프라이즈 포인트
- [수주잔고와 수요 가시성 강화]: 4분기 bookings 5.72억달러, 최근 12개월 book-to-bill 1.4배 기록. funded backlog 12억달러, unfunded backlog 15억달러로 향후 매출 기반 견조함.
- [BlueHalo 통합 효과]: counter-UAS, space, cyber, directed energy 역량 추가로 사업 다변화 확인됨.
- [신사업 모멘텀]: Titan, LOCUST, Freedom Eagle-1 등 신성장 제품군의 수주·개발 진전 확인됨.
- [주가 반응 원인]: 시간외 +19.42%는 기록적 매출·EBITDA, 강한 수주 모멘텀, FY2027 가이던스 제시가 복합적으로 반영된 것으로 해석 가능함. 단, 주가 반응 원인은 market data timestamp와 보도 출처 확인 필요함.

📝 특이사항 & 핵심 KPI
- 4분기 매출 6.42억달러, 전년동기 대비 31% 유기적 성장
- 4분기 조정 EBITDA 1.40억달러, 매출 대비 22%
- 4분기 bookings 5.72억달러, 최근 12개월 book-to-bill 1.4배
- 기말 funded backlog 12억달러, unfunded backlog 15억달러

🚀 가이던스
FY2027 매출 가이던스는 21.25억~22.25억달러, 조정 EBITDA는 3.05억~3.25억달러, Non-GAAP EPS는 3.02~3.34달러로 제시됨. 매출과 이익은 하반기 집중될 것으로 설명됐고, 정부 예산 집행 지연과 SCAR 제외 효과를 보수적으로 반영함. CapEx는 매출의 12~14% 수준으로 높아 FY2027 자유현금흐름은 플러스가 아닐 수 있음.
```

## 2. 재사용 출력 템플릿

```markdown
📊 {ticker} 실적발표 ({fiscal_period})
일자: {release_date} {release_session_kr}

주가 반응: {price_reaction_pct} ({price_reaction_session})

📮 기업 개요
{company_name}는 {business_summary_kr} 기업임.

📊 핵심 실적 vs 컨센서스
- EPS (Non-GAAP): {non_gaap_eps_actual} (예상 {non_gaap_eps_estimate}, {non_gaap_eps_surprise_pct})
- EPS (GAAP): {gaap_eps_actual_or_undisclosed}
- 매출: {revenue_actual} (예상 {revenue_estimate}, {revenue_surprise_pct}, YoY {revenue_yoy_pct})
* Based on {primary_filing_source}

🗣 경영진 핵심 메시지
{management_message_kr}

🔥 서프라이즈 포인트
- [{surprise_1_title}]: {surprise_1_fact}. {surprise_1_view}
- [{surprise_2_title}]: {surprise_2_fact}. {surprise_2_view}
- [{surprise_3_title}]: {surprise_3_fact}. {surprise_3_view}
- [주가 반응 원인]: {price_reaction_explanation_fact}. {price_reaction_explanation_view}

📝 특이사항 & 핵심 KPI
- {kpi_1_name} {kpi_1_value}, {kpi_1_context}
- {kpi_2_name} {kpi_2_value}, {kpi_2_context}
- {kpi_3_name} {kpi_3_value}, {kpi_3_context}
- {kpi_4_name} {kpi_4_value}, {kpi_4_context}

🚀 가이던스
{guidance_summary_kr}

📌 데이터 투명성
| 항목 | 값 | 출처 | 상태 | 비고 |
|---|---:|---|---|---|
| {transparency_item_1} | {transparency_value_1} | {transparency_source_1} | {transparency_status_1} | {transparency_note_1} |
| {transparency_item_2} | {transparency_value_2} | {transparency_source_2} | {transparency_status_2} | {transparency_note_2} |
```

## 3. `{}` 슬롯별 데이터 소스 정의

| 슬롯 | 정의 | 1순위 소스 | 보조 소스 | 상태값 |
|---|---|---|---|---|
| `{ticker}` | 기업 티커 | FMP profile / Nasdaq / 회사 IR | 거래소 페이지 | fact |
| `{company_name}` | 기업명 | 회사 IR / 10-K | FMP profile | fact |
| `{fiscal_period}` | 발표 회계기간 | 회사 earnings release 제목 / SEC 8-K | FMP earnings calendar | fact |
| `{release_date}` | 실적 발표일 | 회사 IR calendar / SEC filing date | FMP earnings calendar / Nasdaq calendar | fact |
| `{release_session_kr}` | 장전/장후/장중 | 회사 IR calendar | Nasdaq calendar / EarningsHub | fact |
| `{price_reaction_pct}` | 주가 반응률 | FMP quote / after-hours quote / Nasdaq market data | WSJ/Barron's/IBD 등 보도 | reported |
| `{price_reaction_session}` | 주가 반응 세션 | market data timestamp | 보도 세션 표기 | reported |
| `{business_summary_kr}` | 기업 개요 | 10-K Item 1 / 회사 IR profile | FMP profile | fact |
| `{revenue_actual}` | 발표 매출 | 회사 earnings release / SEC 8-K Ex-99.1 | FMP income statement | fact |
| `{revenue_estimate}` | 매출 컨센서스 | FactSet / Visible Alpha 보도 | FMP earnings calendar | estimate |
| `{revenue_surprise_pct}` | 매출 서프라이즈 | 직접 계산 | FMP surprise field | calculated |
| `{revenue_yoy_pct}` | 매출 YoY | 회사 release 표기 | 전년동기 매출 직접 계산 | calculated |
| `{non_gaap_eps_actual}` | Non-GAAP EPS 실제 | 회사 non-GAAP reconciliation / release | FMP earnings | fact |
| `{non_gaap_eps_estimate}` | Non-GAAP EPS 컨센서스 | FactSet / Visible Alpha 보도 | FMP earnings calendar | estimate |
| `{non_gaap_eps_surprise_pct}` | Non-GAAP EPS 서프라이즈 | 직접 계산 | FMP surprise field | calculated |
| `{gaap_eps_actual_or_undisclosed}` | GAAP EPS 실제/미공시 | 회사 GAAP diluted EPS | SEC 10-Q/10-K | fact |
| `{primary_filing_source}` | 기준 원천 | SEC 8-K/10-Q/10-K / 회사 release | IR deck | fact |
| `{management_message_kr}` | 경영진 메시지 | earnings call transcript / prepared remarks | AlphaSense / DCF transcript | fact + view |
| `{surprise_*_fact}` | 서프라이즈 근거 | release, IR deck, KPI table | transcript | fact |
| `{surprise_*_view}` | 서프라이즈 해석 | FACT 기반 내부 해석 | 애널리스트 메모 | view |
| `{price_reaction_explanation_fact}` | 주가 반응과 연결 가능한 FACT | 실적 beat/miss, 가이던스, KPI, timestamp | 보도 headline | fact/reported |
| `{price_reaction_explanation_view}` | 주가 반응 해석 | FACT 기반 내부 해석 | 시장 코멘트 | view |
| `{kpi_*}` | 핵심 KPI | IR deck / release KPI table | transcript | fact |
| `{guidance_summary_kr}` | 가이던스 요약 | 회사 outlook table / release | transcript | fact + view |

## 4. 계산 규칙

```text
revenue_surprise_pct = (revenue_actual / revenue_estimate - 1) * 100
non_gaap_eps_surprise_pct = (non_gaap_eps_actual / non_gaap_eps_estimate - 1) * 100
revenue_yoy_pct = (revenue_actual / revenue_prior_year_same_quarter - 1) * 100
adjusted_ebitda_margin = adjusted_ebitda / revenue_actual * 100
book_to_bill = bookings / revenue
```

- 계산값은 소수점 1~2자리로 표기.
- estimate가 없으면 surprise 계산 금지.
- prior-year quarter가 없으면 YoY는 `N/A`로 표기.
- actual과 estimate 단위가 다르면 계산 전 단위 통일.

## 5. DATA_CONFLICT 게이트

아래 조건 중 하나라도 걸리면 본문 확정 문장 작성 금지. 먼저 `DATA_CONFLICT`로 표시.

| 체크 | 충돌 예시 | 처리 |
|---|---|---|
| 회계기간 충돌 | 제목은 Q1인데 본문은 Q4/FY 가이던스 | `{fiscal_period}` 확정 전 출력 금지 |
| 매출 숫자 충돌 | 핵심 실적 매출 $408.05M, KPI 매출 $641.6M | 서로 다른 quarter인지 확인 |
| EPS 방향 충돌 | EPS miss인데 “EPS 상회”라고 작성 | surprise 재계산 |
| 날짜 충돌 | release date와 after-hours reaction date 불일치 | timestamp 분리 |
| GAAP/Non-GAAP 혼동 | Non-GAAP EPS를 GAAP EPS처럼 표기 | line item 분리 |
| FY/CY 혼동 | FY2026 Q4를 2026년 1분기로 표기 | fiscal calendar 확인 |
| 주가 반응 원인 단정 | timestamp 없는 price reaction에 beat 원인 연결 | “해석 가능함/확인 필요”로 낮춤 |

## 6. FACT / VIEW 작성 규칙

### FACT

- 회사 release, SEC filing, IR deck, transcript, market data에 직접 있는 내용.
- 문장 예시:
  - `4분기 매출은 {revenue_actual}로 전년 대비 {revenue_yoy_pct} 증가함.`
  - `FY2027 매출 가이던스는 {guidance_revenue_low}~{guidance_revenue_high}로 제시됨.`

### VIEW

- FACT에서 도출한 해석.
- 반드시 “해석 가능함”, “확인 필요함”, “부담 요인임”, “긍정적 재료로 볼 수 있음”처럼 확률적 표현 사용.
- 문장 예시:
  - `강한 backlog와 book-to-bill은 향후 매출 가시성을 높이는 요인으로 해석 가능함.`
  - `CapEx 확대는 단기 FCF 부담 요인으로 확인 필요함.`

### 금지 표현

- `확실히 좋음`
- `무조건 긍정적`
- `매수/매도`
- `대박`
- `주가는 이 때문에 올랐다`
  단, price reaction timestamp + 실적 driver + 보도 출처가 동시에 있을 때만 제한적으로 가능.

## 7. 헤지펀드용 마스터 프롬프트

```text
너는 헤지펀드용 실적 요약 애널리스트임.
아래 INPUT_JSON과 지정 source_url만 사용해 한국어 음슴체 실적 요약을 작성.

[역할]
- 목적은 투자 판단 전 빠른 실적 triage.
- 숫자, 컨센서스, 가이던스, KPI, 주가 반응, 리스크를 한 번에 파악하게 작성.
- 독자는 PM/애널리스트이며, 과장보다 정확성을 선호함.

[절대 원칙]
1. 문체는 반드시 음슴체로 작성.
2. 숫자는 INPUT_JSON에 있는 값만 사용.
3. 모든 숫자는 source_key, provider, as_of가 있어야 본문에 사용 가능.
4. FACT와 VIEW를 분리.
   - FACT: 회사 공시, IR release, SEC filing, transcript, market data에 직접 있는 내용.
   - VIEW: 숫자와 FACT를 바탕으로 한 해석. "해석 가능함", "확인 필요함"처럼 표기.
5. 주가 반응 원인은 price_reaction timestamp와 실적 driver가 동시에 있을 때만 연결.
6. 분기/일자/숫자 충돌이 있으면 DATA_CONFLICT로 표시하고 확정 문장 작성 금지.
7. 컨센서스 provider가 없으면 "컨센서스 미확인"으로 표기.
8. Non-GAAP 수치는 회사 reconciliation 또는 명시 출처가 있을 때만 사용.
9. private transcript나 유료 원문은 장문 인용 금지. 요약만 허용.
10. 투자 의견, 매수/매도, 확실한 전망 표현 금지.

[DATA_CONFLICT 체크]
- {fiscal_period}와 source title의 fiscal period가 다르면 DATA_CONFLICT.
- {revenue_actual}이 본문 다른 위치 숫자와 다르면 DATA_CONFLICT.
- "beat"라고 쓰려면 actual > estimate가 확인돼야 함.
- EPS miss인데 "EPS 상회"라고 쓰면 DATA_CONFLICT.
- Q1/Q4, FY/CY가 섞이면 DATA_CONFLICT.

[출력 형식]
반드시 아래 순서와 헤더를 유지.

📊 {ticker} 실적발표 ({fiscal_period})
일자: {release_date} {release_session_kr}

주가 반응: {price_reaction_pct} ({price_reaction_session})

📮 기업 개요
{company_name}는 {business_summary_kr} 기업임.

📊 핵심 실적 vs 컨센서스
- EPS (Non-GAAP): {non_gaap_eps_actual} (예상 {non_gaap_eps_estimate}, {non_gaap_eps_surprise_pct})
- EPS (GAAP): {gaap_eps_actual_or_undisclosed}
- 매출: {revenue_actual} (예상 {revenue_estimate}, {revenue_surprise_pct}, YoY {revenue_yoy_pct})
* Based on {primary_filing_source}

🗣 경영진 핵심 메시지
{management_message_kr}

🔥 서프라이즈 포인트
- [{surprise_1_title}]: {surprise_1_fact}. {surprise_1_view}
- [{surprise_2_title}]: {surprise_2_fact}. {surprise_2_view}
- [{surprise_3_title}]: {surprise_3_fact}. {surprise_3_view}
- [주가 반응 원인]: {price_reaction_explanation_fact}. {price_reaction_explanation_view}

📝 특이사항 & 핵심 KPI
- {kpi_1_name} {kpi_1_value}, {kpi_1_context}
- {kpi_2_name} {kpi_2_value}, {kpi_2_context}
- {kpi_3_name} {kpi_3_value}, {kpi_3_context}
- {kpi_4_name} {kpi_4_value}, {kpi_4_context}

🚀 가이던스
{guidance_summary_kr}

📌 데이터 투명성
| 항목 | 값 | 출처 | 상태(fact/reported/estimate/calculated/view) | 비고 |
|---|---:|---|---|---|
| {transparency_item_1} | {transparency_value_1} | {transparency_source_1} | {transparency_status_1} | {transparency_note_1} |
| {transparency_item_2} | {transparency_value_2} | {transparency_source_2} | {transparency_status_2} | {transparency_note_2} |
```

## 8. INPUT_JSON 권장 스키마

```json
{
  "ticker": "AVAV",
  "company_name": "AeroVironment",
  "fiscal_period": "FY2026 Q4",
  "release_date": "2026-07-01",
  "release_session_kr": "애프터마켓",
  "business_summary_kr": "무인항공체계, 정밀타격·방어 시스템, 우주·사이버·지향성 에너지 솔루션을 개발·공급하는 방산 기술",
  "price_reaction": {
    "pct": 19.42,
    "session": "After Hours",
    "timestamp": "2026-07-01T17:00:00-04:00",
    "source_key": "market_data_after_hours"
  },
  "actuals": {
    "revenue_actual": 408.05,
    "revenue_unit": "USD_M",
    "gaap_eps_actual": null,
    "gaap_eps_status": "undisclosed",
    "non_gaap_eps_actual": 0.64,
    "source_key": "sec_8k_or_ir_release"
  },
  "consensus": {
    "revenue_estimate": 475.54,
    "non_gaap_eps_estimate": 0.68,
    "provider": "FactSet_or_FMP",
    "as_of": "2026-07-01"
  },
  "kpis": [
    {"name": "bookings", "value": 572, "unit": "USD_M", "source_key": "ir_deck"},
    {"name": "book_to_bill", "value": 1.4, "unit": "x", "source_key": "ir_deck"},
    {"name": "funded_backlog", "value": 1.2, "unit": "USD_B", "source_key": "ir_deck"}
  ],
  "guidance": {
    "fy_revenue_low": 2125,
    "fy_revenue_high": 2225,
    "fy_adjusted_ebitda_low": 305,
    "fy_adjusted_ebitda_high": 325,
    "fy_non_gaap_eps_low": 3.02,
    "fy_non_gaap_eps_high": 3.34,
    "source_key": "company_outlook"
  },
  "management_message": {
    "prepared_remarks_summary": "BlueHalo 통합, counter-UAS, space/cyber, directed energy 역량 확대",
    "source_key": "transcript_or_prepared_remarks"
  }
}
```

## 9. 데이터 투명성 상태값

| 상태 | 의미 | 사용 예시 |
|---|---|---|
| `fact` | 회사 공시/IR/SEC/transcript 직접 확인 | 매출 actual, GAAP EPS, 가이던스 |
| `reported` | 언론/데이터벤더가 보도한 수치 | FactSet consensus, after-hours reaction |
| `estimate` | 컨센서스/예상치 | EPS estimate, revenue estimate |
| `calculated` | 입력값 기반 직접 계산 | surprise %, YoY %, margin |
| `view` | 내부 해석 | 주가 반응 원인, 성장 가시성 평가 |
| `partial` | 일부만 확인 | 캡처 기반 과거 실적, provider 미확정 |
| `conflict` | 숫자/분기/출처 충돌 | Q1/Q4 혼재, actual mismatch |

## 10. 최종 검수 체크리스트

- [ ] `{fiscal_period}`와 모든 본문 분기 표현 일치.
- [ ] `{release_date}`와 주가 반응 timestamp 일치 또는 분리 표기.
- [ ] 매출 actual이 본문/KPI/차트에서 동일.
- [ ] EPS actual과 estimate 방향이 surprise 문구와 일치.
- [ ] GAAP EPS와 Non-GAAP EPS 분리.
- [ ] 컨센서스 provider 명시.
- [ ] 모든 `VIEW` 문장은 FACT 뒤에 위치.
- [ ] 주가 반응 원인 단정 금지. 확인 부족 시 “해석 가능함/확인 필요함” 표기.
- [ ] 데이터 투명성 표 포함.
