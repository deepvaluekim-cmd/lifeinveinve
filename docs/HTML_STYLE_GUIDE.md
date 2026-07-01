# life inve — HTML 스타일 가이드 & 생성 프롬프트

> 모든 life inve 데일리·실적·대시보드 HTML은 이 가이드를 따른다. (라이프자산운용 톤앤매너)
> 이 문서 자체가 **생성 프롬프트**로 쓰인다 — "이 가이드대로 [주제] 페이지를 만들어라".

---

## 1. 색상 (Color)
| 역할 | HEX | 용도 |
|---|---|---|
| **Primary (짙은 라이프그린)** | `#3F5C21` | 헤더 바·H2 언더라인·주요 버튼·로고·강조 텍스트 |
| Mid green | `#608C34` | 서브 강조·아이콘·보더 호버 |
| Accent (라이트그린) | `#8FB85D` | 하이라이트·호버·`화제` 배지 |
| Ink | `#070203` | 본문/제목 기본 텍스트 |
| Background | `#FFFFFF` | 배경(화이트·여백 중심) |
| Line/Muted | `#E7E6E6` / `#6b7280` | 보더·디바이더 / 보조 텍스트 |
| **Up(상승)** | `#e0392b` (빨강) | 지수·수치 상승 (한국식) |
| **Down(하락)** | `#1769d6` (파랑) | 지수·수치 하락 (한국식) |
| 긴급 배지 | `#C0392B` | `긴급` 태그(기능색) |

```css
:root{--green:#3F5C21;--green-mid:#608C34;--green-light:#8FB85D;--ink:#070203;
--bg:#FFFFFF;--line:#E7E6E6;--muted:#6b7280;--up:#e0392b;--down:#1769d6;}
```

## 2. 폰트 (Typography)
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;700;900&family=Open+Sans:wght@400;600;700&display=swap" rel="stylesheet">
```
- 한글 본문/제목: **`Noto Sans KR`**. 영문/숫자/티커: **`Open Sans`** + `font-variant-numeric:tabular-nums`.
- 스택: `"Noto Sans KR","Open Sans",-apple-system,"Segoe UI","Malgun Gothic",sans-serif`.
- 위계: 타이포 우선 + 그린 언더라인/배지로 약한 색 위계.

## 3. 문체 (Voice)
- **프로페셔널 · 압축 서술체**: 헤드라인·불릿은 음슴체/개조식("…마무리", "…밀림"), 본문은 완전문이되 군더더기 제거. 존댓말 금지.
- **fact 위주**: 투자의견·주관 점수 금지. 핵심 수치 **볼드** + 괄호 컨텍스트 `(YoY/QoQ, vs 컨센/가이드)`.
- 직접 인용은 따옴표 + 화자(소속) 귀속. 무출처 수치 금지.
- 데모/예시는 상단 배너 + 각 항목 `[데모]` 라벨.

## 4. 구성요소 (Components)
- **헤더 바**: `background:var(--green)` 풀블리드. 안에 `로고(Li) + life inve` / 키커(`LIFE ASSET · {SECTION}`) / H1 타이틀 / 태그라인 / 메타(요일·날짜·소스건수).
- **[데모] 배너**: 상단, 옅은 경고색. "예시 데이터·투자자문 아님".
- **H2 섹션 제목**: `color:var(--green)` + 하단 1px 그린/라인 언더라인.
- **카드**: 화이트 배경 + `--line` 보더 + radius 12 + hover 시 `--green-light` 보더/살짝 상승.
- **배지**: 초록 계열(`#eaf3df`/`var(--green)`), 데모=옅은 주황.
- **표**: 헤더행 그린틴트, 짝수행 옅은 배경. 등락 up=빨강/down=파랑.
- **차트(SVG 인라인)**: 외부 라이브러리 금지. **막대 Y축 0에서 시작**(왜곡 금지). 각 차트 하단 캡션 `출처:… · [fact/partial/estimate] · as of …`.
- **푸터/카비앗**: `life inve · {섹션} · 자동 생성` + `Internal research note. Not investment advice.`

## 5. 기술 규칙
- **자기완결 단일 HTML**: `<style>` 인라인, 이미지 없음(텍스트+CSS+인라인 SVG), 외부 JS 금지(웹폰트 CDN만).
- **반응형**: 모바일 1열(`@media(max-width:640px)`), max-width 900~1080.
- 파일명 슬러그: `YYMMDD-lifeinve-{kind}-{hash6}.html` (실적은 `{TICKER}_{FQ}.html` 허용).

## 6. 실적 노트 전용 골격 (모드 A)
0. `⏱️ 타임라인 요약`(맨 위 캡슐) 1.헤더(티커/분기/세션) 2.주가반응 3.기업개요 4.핵심실적 vs 컨센(표) 5.경영진 메시지 6.서프라이즈 포인트(+주가반응 원인) 7.특이사항·KPI 8.가이던스(+트래커 차트) 9.Q&A(3~5) 10.Transcript 링크 + **데이터 투명성 표**(지표|출처|상태|신뢰도). 소스 Tier T1 SEC>T2 IR>T4 컨센>T3 트랜스크립트>E 산정.

> 레퍼런스 구현: `earnings/SMTC_FQ1FY27.html`(LIFE 화이트/그린), 데일리 `daily/`·`substack/`·`youtube/`, 대시보드 `dashboards/taiwan-semi-monthly-revenue.html`.
