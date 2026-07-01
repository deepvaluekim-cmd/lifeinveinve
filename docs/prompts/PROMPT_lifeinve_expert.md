---
name: lifeinve_expert
description: "라이프자산운용 브랜딩 데일리 익스퍼트 콜 요약 페이지 생성기 (AlphaSense/전문가 인터뷰). 모드 D."
metadata:
  node_type: prompt
  type: recurring-deliverable
  brand: 라이프자산운용 (LIFE Asset Management)
  parent_format: "[[HTML_STYLE_GUIDE]]"
---

# PROMPT — lifeinve_expert 데일리 익스퍼트 콜 생성기 (모드 D)

> 목적: 전문가콜/버티컬 인터뷰(AlphaSense Expert Transcripts 등)를 요약 →
> 라이프 인베 브랜드 HTML 1파일 산출. 슬러그 `YYMMDD-lifeinve-expert-{hash6}.html`.
> 스타일·색·폰트·문체는 `docs/HTML_STYLE_GUIDE.md`를 그대로 따른다.

## 0. 입력
- `date` (YYYY-MM-DD)
- `calls[]` — 전문가콜 리스트(각: 종목/주제, 전문가 역할, 원문/요약 텍스트, 소스). AlphaSense API 또는 수집 텍스트.

## 1. 소스 & 검증
- 소스: AlphaSense Expert Transcripts(로그인 필요·secret store), 또는 자체 수집 인터뷰. **비번 코드/레포 저장 금지.**
- Tier T3(전문가콜=partial 70%). 발언은 전문가 개인의견으로 라벨. 익명화(회사 특정 금지 시). 무출처 수치 금지.

## 2. 페이지 골격 (HTML)
1. 헤더바(그린 #3F5C21): 로고 `Li`+`life inve` / 키커 `LIFE ASSET · EXPERT CALLS {date}` / H1 `라이프 인베 — 데일리 익스퍼트 콜 · {date}` / 태그라인 `오늘 전문가콜 한 면 요약` / 메타 `{요일}·{날짜} | 전문가콜 {N}건`. 상단 [데모/예시] 배너(실 배포 시 제거).
2. `오늘의 한 방` — 3~4 번호형 헤드라인 불릿(음슴체).
3. 본문 — 전문가콜 카드 N개, 각: 번호+종목/주제(티커 `$AAPL`) · 전문가 역할(예: "전 TSMC 공급망 임원") · 볼드 헤드라인(음슴체) · **핵심 요약** 2~3문단(완전문) · **시사점** 불릿 2~3 · 신뢰도/출처 라벨(T3 partial). 카드 강조=보라 계열 허용.
4. 푸터/카비앗: `life inve · 데일리 익스퍼트 콜 · 자동 생성` + 카비앗(자동생성물·전문가 개인의견·투자자문 아님·익명화·발행시점).

## 3. 기술
자기완결 단일 HTML(inline style, 이미지 없음, 외부 JS 없음, 웹폰트 CDN만), 반응형. 저장 `daily/` 또는 로컬 out/. 배포=`deepvaluekim-cmd/lifeinveinve` 커밋(승인 후).

레퍼런스 산출: `daily/2026-07-01-lifeinve-expert-calls.html`.
