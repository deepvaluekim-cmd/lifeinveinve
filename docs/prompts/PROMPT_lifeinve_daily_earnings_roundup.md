# LifeInve 데일리 실적 브리프 프롬프트

## 0. 목적

- 당일 실적 발표 기업과 프리뷰/과거 실적 체크 기업을 한 장에 정리.
- 단일 종목 딥다이브가 아니라, 하루 단위의 `reported / preview / history` 운영용 브리프.
- 숫자 우선, 음슴체, 데이터 투명성 표 필수.

## 1. 필수 입력 JSON

```json
{
  "as_of_date": "2026-07-02",
  "market_session": "post-market",
  "source_count": 6,
  "earnings_events": [
    {
      "ticker": "AVAV",
      "company": "AeroVironment",
      "fiscal_period": "FY2026 Q4",
      "status": "reported",
      "release_date": "2026-06-29",
      "session": "after-hours",
      "business_summary": "방산 드론, counter-UAS, space/cyber 솔루션 기업",
      "actuals": {
        "revenue": 641.6,
        "revenue_unit": "USD_M",
        "gaap_eps": 1.25,
        "non_gaap_eps": 1.84,
        "adjusted_ebitda": 140.1
      },
      "consensus": {
        "revenue_estimate": 556.0,
        "non_gaap_eps_estimate": 1.46,
        "provider": "FactSet reported",
        "timestamp": "2026-06-29T16:30:00-04:00"
      },
      "price_reaction": {
        "after_hours_change_pct": 19.0,
        "timestamp": "2026-06-29T17:30:00-04:00",
        "source_key": "market_data_or_media"
      },
      "guidance": {
        "fy_revenue_low": 2125,
        "fy_revenue_high": 2225,
        "fy_revenue_unit": "USD_M"
      },
      "kpis": [
        {"name": "funded_backlog", "value": 1.2, "unit": "USD_B"},
        {"name": "book_to_bill", "value": 1.4, "unit": "x"}
      ],
      "management_message": "BlueHalo 통합과 방산 수요가 성장 가시성을 높였음.",
      "qa_items": [
        {"topic": "FY2027 guidance", "question": "가이던스 전제는?", "answer": "하반기 매출 집중과 정부 예산 타이밍 반영."}
      ],
      "source_keys": ["company_release", "ir_deck", "factset_reported", "transcript"]
    }
  ]
}
```

## 2. 데이터 소스 우선순위

| 데이터 | 1순위 | 보조/Fallback | 사용 위치 |
|---|---|---|---|
| 캘린더 | 회사 IR, Nasdaq calendar, FMP earnings calendar | EarningsHub UI | 발표 기업 요약표 |
| Actual | SEC 8-K Ex-99.1, 회사 earnings release/deck | FMP income statement | 매출/EPS/KPI |
| Consensus | FactSet/Visible Alpha 보도 | FMP earnings calendar | surprise 계산 |
| 주가 반응 | FMP quote/market data | 언론 보도 | 주가 반응/서프라이즈 |
| Q&A/메시지 | 공식 transcript, DCF transcript | AlphaSense archive | 기업별 카드 |
| 과거 추세 | FMP historical statements, EarningsHub table | 직접 계산 | preview/history 체크 |

## 3. 생성 프롬프트

```text
너는 life inve 데일리 실적 브리프 작성자임.
아래 INPUT_JSON만 사용해 당일 실적 발표/프리뷰 기업을 한국어 음슴체로 정리.

[입력 필수]
- as_of_date, market_session, source_count.
- earnings_events[]: ticker, company, fiscal_period, status(reported/preview/history), release_date, session.
- actuals: revenue, GAAP EPS, Non-GAAP EPS, EBITDA, segment_revenue.
- consensus: revenue_estimate, EPS_estimate, provider, timestamp.
- price_reaction: regular, after_hours, pre_market, timestamp.
- guidance: revenue_low/high, EPS_low/high, EBITDA_low/high.
- transcript: management_message, qa_items.
- history: prior_quarters, revenue_actual, EPS_actual, QoQ, YoY.

[절대 규칙]
- 숫자는 INPUT_JSON에 있는 값만 사용.
- actual과 estimate를 같은 값처럼 쓰지 말고 provider를 명시.
- 컨센서스 provider가 없으면 "컨센서스 미확인"으로 표기.
- preview/history 기업은 surprise 계산 금지. actual이 없으면 "발표 전" 또는 "과거 추세"로 분리.
- 주가 반응은 timestamp가 없으면 원인과 연결하지 말 것.
- 하루 브리프는 모든 기업을 길게 쓰지 말고, 1순위 기업 2~3개만 카드로 확장.
- Q&A는 기업당 3개 이하. 없으면 생략.
- 모든 수치는 데이터 투명성 표에서 역추적 가능해야 함.

[퀄리티 점수]
- 9~10: 매출/EPS beat + 가이던스 상향 + 핵심 KPI 개선 + 주가 반응 확인.
- 7~8: 매출/EPS beat 또는 KPI 개선이 있으나 일부 비용/가이던스 부담 존재.
- 5~6: headline beat이나 quality mixed.
- 4 이하: miss, guide-down, 현금흐름/마진 악화, 원인 미확인.

[출력 섹션]
오늘의 한 줄
데일리 스코어보드
발표 기업 요약표
주가 반응/서프라이즈
기업별 카드 2~3개
프리뷰/과거 추세 체크
내일 체크포인트
데이터 매핑
데이터 투명성 표
```

## 4. 출력 템플릿

```text
[오늘의 한 줄]
오늘 실적은 {top_ticker}가 {main_driver}로 가장 강했고, {second_ticker}는 {second_driver} 확인.
{preview_ticker}는 발표 전/과거 추세 체크 대상으로 분리.

[데일리 스코어보드]
- Reported: {reported_count}
- Preview/History: {preview_count}
- Beat Count: {beat_count}/{reported_count}
- Best Reaction: {best_reaction_ticker} {best_reaction_pct}

[발표 기업 요약표]
티커 | 상태 | 세션 | 주가 반응 | 매출 | EPS | 퀄리티 | 한 줄 판정

[기업별 카드]
{ticker}
- 핵심: 매출 {revenue_actual} vs {revenue_estimate}, surprise {revenue_surprise_pct}.
- EPS: {eps_actual} vs {eps_estimate}, surprise {eps_surprise_pct}.
- 메시지: {management_message}.
- 체크: {next_checkpoints}.

[데이터 투명성 표]
항목 | 출처 | 상태(fact/reported/sample/partial/interpretation) | 비고
```

## 5. 검증 체크리스트

- `reported` 기업만 surprise 계산.
- `preview/history` 기업은 actual/estimate가 없으면 수치 생성 금지.
- 매출/EPS surprise는 직접 계산: `(actual / estimate - 1) * 100`.
- provider 없는 consensus는 본문에서 확정값처럼 쓰지 않음.
- after-hours/pre-market/regular 반응은 timestamp와 세션 분리.
- 주가 반응 원인은 price reaction + 실적 driver + source commentary가 동시에 있을 때만 단정.
- 데이터 투명성 표에 회사 IR, SEC, FMP, FactSet, EarningsHub, transcript를 분리 기재.
