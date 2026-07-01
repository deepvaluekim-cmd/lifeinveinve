---
name: lifeinve_youtube
description: "라이프자산운용 브랜딩 데일리 유튜브 요약 페이지 생성기 (must-charts daily_youtube 파생). 트래킹 채널의 신규 영상을 매일 자동 요약. 모드 C."
metadata:
  node_type: prompt
  type: recurring-deliverable
  brand: 라이프자산운용 (LIFE Asset Management)
  parent_format: "[[must-charts-research-format]]"
  sibling: "[[lifeinve_charts]]"
---

# PROMPT — lifeinve_youtube 데일리 유튜브 요약 생성기 (모드 C)

> 목적: **우리가 트래킹하는 유튜브 채널 목록**에서 **지난 실행 이후 올라온 신규 영상**을 감지 →
> 각 영상의 자막(트랜스크립트)을 받아 요약 → 라이프자산운용 브랜드를 입힌 **자기완결형 HTML 1파일** 산출.
> 원본 포맷 = must-charts.pages.dev `daily_youtube_*`. 브랜드킷·문체·검증 규칙은 형제 프롬프트 [[lifeinve_charts]]의 §2·§3·§4·§5를 **그대로 상속**한다.
> 슬러그: `YYMMDD-lifeinve-youtube-{hash6}.html`. 섭스택/실적과 **완전 별도 페이지**.

---

## 0. 입력 (INPUT)

- `date` (YYYY-MM-DD, 기본 = 오늘)
- `channels[]` — 트래킹 채널 레지스트리 (아래 §1 파일에서 로드)
- `lookback` — 신규 판정 기준. 기본 = "마지막 실행 이후"(state 파일). state 없으면 최근 24h(주말이면 72h).
- `max_videos` — 하루 상한(기본 15). 초과 시 조회수·채널 우선순위로 컷하고 컷된 개수를 푸터에 `log`.

---

## 1. 채널 레지스트리 (트래킹 대상)

정본 파일: `C:\Users\kimfo\projects\lifeinve_charts\youtube_channels.yaml`
각 항목: `name`(표시명) · `handle`(@핸들 또는 URL) · `channel_id`(UC…, RSS용) · `tier`(1=필청/2=선별) · `topic`(태그).

```yaml
# 예시 — 실제 채널은 사용자가 추가/수정
- name: "채널명"
  handle: "@handle"
  channel_id: "UCxxxxxxxxxxxxxxxxxxxxxx"
  tier: 1
  topic: "매크로"
```

> `channel_id`를 모르면 채널 페이지 소스의 `"channelId":"UC…"` 또는 `<meta itemprop="identifier">`에서 추출. 핸들만 있으면 1회 resolve 후 캐시.

---

## 2. 파이프라인 (기업/채널 무관 자동화)

```
1) 레지스트리 로드 → 각 채널 RSS 페치:
   https://www.youtube.com/feeds/videos.xml?channel_id={UC…}
   (API 키 불필요. <entry>: videoId·title·published·author)
2) state 파일(youtube_state.json: {channel_id: last_seen_videoId/published})과 대조
   → published > last_seen 인 신규 영상만 선별
3) 신규 영상별 트랜스크립트 확보(우선순위):
   a. 자막 API(youtube-transcript) / timedtext
   b. 실패 시 영상 설명·자동자막·핀 댓글
   c. 전부 실패 시 → 제목·설명만으로 축약 요약 + `[자막없음]` 라벨
4) 요약 생성(§3 스켈레톤 + §4 문체) — 영상당 2~4문단 + 핵심 타임스탬프 + 풀인용 1개
5) §5 검증(인용 원문 대조·수치 출처·티커 표기)
6) §6 브랜드킷으로 HTML 렌더 → out/ 저장
7) state 파일 갱신(각 채널 last_seen = 이번 최신 videoId/published)
```

---

## 3. 베이스 구조 (must-charts `daily_youtube` 스켈레톤)

### ① 헤더 블록
- 매체명: **`라이프 인베 — 유튜브 데일리`**
- 타이틀: `라이프 인베 — 유튜브 데일리 · {YYYY-MM-DD}`
- 키커: `LIFE ASSET · YOUTUBE 리뷰 {date}`
- 태그라인(고정): `오늘 유튜브에선 무슨 얘기가 — 채널 한 면 요약`
- 메타 라인: `{요일} · {YYYY년 M월 D일} | 신규 {N}건 · 채널 {M}개 커버`

### ② "오늘의 한 방" (Top takeaways)
- 3~5개 번호형 헤드라인 불릿. 각 = `티커/주제 + 한 줄 핵심`. 그날 가장 큰 무브/논점 압축. (음슴체)

### ③ 본문 — 번호형 메인 아이템 (영상당 1개)
각 아이템 소구조(원본 per-item):
1. **번호 + 티커/주제** — 미국주 `$AAPL`, 한국주 `NNNNNN.KS`/`.KQ`, 매크로는 주제어
2. **긴급도 태그** — 🔴`긴급`(속보) / `화제`(트렌딩)
3. **볼드 헤드라인** — 평서/의문형 (음슴체 프래그먼트 허용)
4. **서브 헤드라인** — 맥락 앵글 한 줄
5. **출처 라인** — `출처:` + 채널명 · 업로더 · 업로드시각
6. **링크** — `영상 →`(watch URL) · (선택)`요약 전문 →`
7. **본문 2~4문단** — 요약·분석 (완전문). 핵심 구간은 `[12:34]` 타임스탬프 병기
8. **풀 인용(1개)** — 볼드 + 화자 귀속: `홍길동: "…"` (자막 원문 대조 필수)

### ④ 정렬 규칙
- 임팩트/긴급도 내림차순 → tier1 채널 우선 → 업로드 최신순.

### ⑤ 보조 섹션 (해당 시)
- `그 외 오늘` — 짧은 영상·중복 논점 **속사포 불릿**(영상당 1줄 + 링크)
- `채널별 인덱스` — 오늘 다룬 채널 → 영상 제목 리스트(접이식 가능)

### ⑥ 푸터 / 카비앗
- `라이프 인베 · 유튜브 데일리 · {커버 채널 수}개 채널 · 자동 생성`
- 커버 채널 전체 나열 + 컷된 영상 수(log)
- 카비앗: 자동 생성물 · 영상 요약이며 투자자문 아님 · 인용은 자막 기반, 오인식 가능 · 수치는 발행 시점

---

## 4. 브랜드킷·폰트·문체·검증
[[lifeinve_charts]] §2(라이프그린 #608C34 / #8FB85D / ink #070203 / 화이트),
§3(Noto Sans KR + Open Sans, 티커·숫자 tabular),
§4(헤드=음슴체 / 본문=완전문),
§5(무출처 수치 금지, 인용 원문 대조, 티커 표기 검증) 를 그대로 적용.

추가 유튜브 검증 체크리스트:
- [ ] 각 요약이 실제 신규 영상(state 대조 통과)인가 — 과거 영상 재요약 금지
- [ ] 인용문이 자막 원문과 일치(자동자막 오인식 시 `[자막없음]`/`[추정]` 라벨)
- [ ] videoId·업로드시각이 RSS와 일치, watch 링크 유효
- [ ] 영상에서 나온 수치/티커만 사용(외부 추가 사실은 `(웹 추가)` 표기)
- [ ] state 파일 갱신 완료(다음 실행 중복 방지)

---

## 5. 출력 / 배포
- 산출물: 자기완결 HTML 1파일. 저장 `C:\Users\kimfo\projects\lifeinve_charts\out\`.
- 슬러그: `YYMMDD-lifeinve-youtube-{hash6}.html`
- 배포(승인 후): GitHub Pages `deepvaluekim-cmd/lifeinveinve` 레포의 `youtube/` 경로에 커밋·푸시
  → 라이브 `https://deepvaluekim-cmd.github.io/lifeinveinve/youtube/{파일}`
  → 인덱스(`index.html`)의 "데일리" 항목에 링크 추가.

## 부록 — 실행 순서
1. 레지스트리·state 로드 → RSS 신규 감지
2. 트랜스크립트 확보 → 영상별 요약(§3·§4)
3. §4 검증 전수 통과 → §6 브랜드 HTML 렌더
4. state 갱신 → out/ 저장 → 사용자 보고 → (승인) 배포
