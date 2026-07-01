# LifeInve 시황 멘트 생성 프롬프트 스펙

## 0. 목적

- 데일리 시황 HTML의 `시장 한 줄`, `3줄 요약`, `섹터 해석`, `상승/하락 종목 원인 라벨`, `내일 체크포인트`를 생성.
- 외부 코멘트를 그대로 요약하지 않음.
- 먼저 가격/섹터/히트맵/ETF/매크로 데이터로 driver를 계산하고, 코멘트 소스로 원인 후보를 검증한 뒤 음슴체로 압축.

## 1. 데이터 파이프라인

| 레이어 | 필수 필드 | 1순위 소스 | 사용 위치 |
|---|---|---|---|
| Index | Dow, S&P 500, Nasdaq, Russell close/change_pct | FMP quote / 공식 index provider | 시장 한 줄, 주요 지수 마감 |
| Sector | sector_name, korean_name, change_pct, rank, dispersion | FMP sector performance / S&P sector ETF proxy | 섹터 퍼포먼스 SVG, 섹터 해석 |
| Heatmap | symbol, sector, industry, market_cap, change_pct, dollar_volume | FMP batch quote + profile | 시장 히트맵, 대형주 영향 |
| ETF/Style | QQQ, IWM, RSP, TLT, HYG, XLK, XLC, XLU, SOXX, SMH | FMP ETF quote / ETF issuer | 성장/방어/반도체/채권 로테이션 |
| Macro | 10Y, 2Y, DXY, WTI, Gold, Copper, VIX | Treasury/FRED/CME/FMP | 매크로 연결, 내일 체크포인트 |
| News/Catalyst | source_title, source_url, timestamp, related_symbols, catalyst_type | Reuters, MarketWatch, Nasdaq, company IR, Must Charts/internal | 종목 원인 라벨 |

## 2. 코멘트 참조 소스

| 우선순위 | 사이트 | 확인할 것 | 문장 반영 방식 |
|---|---|---|---|
| C1 | S&P Dow Jones Indices Commentary | Daily Index Insights, 지수/섹터/자산군 관점 | 지수/섹터 driver 검증. 본문 장문 인용 금지 |
| C1 | S&P Global Market Intelligence News & Insights | 섹터별 뉴스, 시장 driver | 보이는 제목/요약만 사용 |
| C1 | Nasdaq Market Activity | 종목 이벤트, earnings calendar, after-hours | 종목 원인 라벨/체크포인트 보조 |
| C2 | Reuters Markets / Investing.com Reuters syndicated article | 장중/마감 원인 후보 | 가격 데이터와 맞을 때만 confirmed_driver |
| C2 | MarketWatch / Morningstar Markets | market wrap, 섹터/종목 headline | 보조 confirmation |
| C3 | Edward Jones / Schwab / BlackRock weekly commentary | 하우스 뷰, 주간 regime | 내일/다음 주 관전 포인트 |
| C0 내부 | Must Charts daily_sitwhang, Options Oracle, KEDM Lite, TMTB Morning Wrap | LifeInve 톤, 아이템 우선순위 | 내부 레퍼런스가 있으면 외부보다 먼저 반영 |

## 3. source_commentary 입력 스키마

```json
{
  "source_name": "S&P Dow Jones Indices Commentary",
  "source_url": "https://www.spglobal.com/spdji/en/research-insights/commentary/",
  "title": "Daily Index Insights 또는 확인 가능한 기사/코멘트 제목",
  "timestamp": "2026-07-01T16:30:00-04:00",
  "used_for": "index | sector | symbol | macro | checkpoint",
  "mentioned_drivers": ["semiconductor equipment", "AI data center power", "rates"],
  "related_symbols": ["SOXX", "SMH", "BE", "VRT"],
  "confidence": "high | medium | low",
  "quote_policy": "요약만 사용, 장문 인용 금지"
}
```

## 4. driver_score 계산

- 기본식: `driver_score = abs(change_pct) + market_cap_impact + dollar_volume_rank + sector_dispersion + news_match`
- `market_cap_impact`: 대형주/섹터 ETF 영향이 크면 가산.
- `dollar_volume_rank`: 거래대금 상위 종목이면 가산.
- `sector_dispersion`: 섹터 상하위 격차가 크면 가산.
- `news_match`: 가격 driver와 `source_commentary.mentioned_drivers`가 일치하면 가산.
- `confirmed_driver`: 가격 데이터와 source_commentary가 동시에 맞는 driver.
- `unconfirmed_driver`: 가격 데이터는 있으나 코멘트 근거가 부족한 driver.

## 5. 생성 프롬프트

```text
너는 life inve 데일리 시황 멘트 작성자임.
아래 INPUT_JSON과 source_commentary 목록만 사용해 한국어 음슴체 시황 멘트를 작성.

[입력 필수]
- market_snapshot.indices: Dow, S&P 500, Nasdaq, Russell close/change_pct.
- market_snapshot.sectors: sector_name, korean_name, change_pct, rank.
- market_snapshot.heatmap: symbol, sector, market_cap, change_pct, dollar_volume.
- market_snapshot.macro: 10Y, 2Y, DXY, WTI, Gold, Copper, VIX.
- market_snapshot.etfs: QQQ, IWM, RSP, TLT, HYG, XLU, XLK, XLC, SOXX, SMH 등.
- source_commentary: source_name, source_url, title, timestamp, used_for, mentioned_drivers, related_symbols, confidence, quote_policy.

[절대 규칙]
- 숫자는 INPUT_JSON에 있는 값만 사용.
- 시장 한 줄은 최소 2개 이상 데이터 driver가 있을 때만 작성.
- 왜 올랐는지/왜 내렸는지는 가격 데이터와 source_commentary가 동시에 맞을 때만 단정.
- 코멘트 소스가 없으면 "데이터상 관찰"과 "원인 미확인"을 분리.
- source_commentary의 used_for가 맞지 않는 소스는 해당 문장에 쓰지 말 것.
- S&P/Nasdaq/Reuters/MarketWatch/Must Charts 원문은 장문 인용하지 않고 요약만 사용.
- 지수 상승과 모든 종목 상승을 혼동하지 말 것.
- breadth/sector dispersion이 없으면 "광범위한 랠리" 금지.
- 내일 체크포인트는 실제 calendar/event/price level이 있을 때만 작성.

[출력 섹션]
시장 한 줄
3줄 요약
주요 지수 마감
섹터 퍼포먼스 해석
시장 히트맵 해석
상승/하락 종목 원인 라벨
내일 체크포인트
데이터 투명성 표

[데이터 투명성 표]
지표 | 값/필드 | 출처 | 상태(fact/reported/partial/private/interpretation) | 비고
```

## 6. 문장 템플릿

```text
[시장 한 줄]
S&P 500 {spx_change}%, Nasdaq {nasdaq_change}%.
{top_sector_kr} {top_sector_change}%가 {leader_symbols} 중심으로 지수 {주도/방어}했고,
{bottom_sector_kr} {bottom_sector_change}%는 {laggard_symbols} 영향으로 약세였음.

[섹터 로테이션]
상승 상위는 {sector_top_1}/{sector_top_2}/{sector_top_3}, 하락 상위는 {sector_bottom_1}/{sector_bottom_2}/{sector_bottom_3}.
섹터 간 스프레드가 {sector_spread}p로 확대돼 단순 지수 상승보다 내부 로테이션이 더 컸음.

[원인 라벨]
{symbol} {change_pct}%: {source_title}에서 확인된 {catalyst_type}. 가격 반응은 확인됐으나 실적/가이던스 영향은 추가 확인 필요.
```

## 7. 검증 게이트

| 체크 | 통과 기준 | 실패 시 문구 |
|---|---|---|
| 인과 단정 | 가격 driver와 코멘트 소스가 모두 일치 | 원인 후보 / 데이터상 관찰 |
| 광범위한 랠리 | sector positive count, advance/decline, equal-weight index 확인 | 지수는 상승했으나 내부 확산은 미확인 |
| 섹터 해석 | sector change_pct + 해당 섹터 대형주 heatmap 일치 | 섹터 수치만 쓰고 원인 설명 생략 |
| 종목 원인 | source_url/source_title/timestamp 존재 | 원인 미확인 |
| 매크로 연결 | 금리/달러/유가/원자재 변화와 스타일 ETF 방향성 일치 | 매크로 문장 삭제 |

## 8. 참조 링크

- S&P Dow Jones Indices Commentary: https://www.spglobal.com/spdji/en/research-insights/commentary/
- S&P Global Market Intelligence News & Insights: https://www.spglobal.com/market-intelligence/en/news-insights
- Nasdaq Market Activity: https://www.nasdaq.com/market-activity
- Reuters Markets: https://www.reuters.com/markets/
- MarketWatch: https://www.marketwatch.com/
- Morningstar Markets: https://www.morningstar.com/markets
- Edward Jones Daily Market Recap: https://www.edwardjones.com/us-en/market-news-insights/stock-market-news/daily-market-recap
- Schwab Market Commentary: https://www.schwab.com/learn/market-commentary
- BlackRock Weekly Commentary: https://www.blackrock.com/us/individual/insights/blackrock-investment-institute/weekly-commentary
