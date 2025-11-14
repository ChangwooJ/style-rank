# Style Rank

AST 기반 코드 복잡도 분석 및 랭크 측정 VSCode 확장 프로그램

## 기능

**Style Rank**는 JavaScript/TypeScript 코드의 순환 복잡도(Cyclomatic Complexity)를 자동으로 측정하고 S/A/B/C/D/F 등급으로 시각화합니다.

### 주요 기능
- 파일 저장 시 자동으로 코드 복잡도 분석
- VSCode 하단 상태바에 실시간 랭크 표시
- JavaScript, TypeScript, JSX, TSX 파일 지원
- AST 기반 정확한 분석

### 분석 대상
다음 구문들을 기준으로 순환 복잡도를 계산합니다:
- `if` 문
- `for`, `while` 반복문
- 삼항 연산자 (`? :`)
- 논리 연산자 (`&&`, `||`)
- `switch` 문의 각 `case`
- `try-catch`의 `catch` 블록

### 등급 기준
| 복잡도 | 등급 | 설명 |
|--------|------|------|
| 1-5 | S | 매우 우수 - 단순하고 이해하기 쉬운 코드 |
| 6-10 | A | 우수 - 적절한 복잡도 |
| 11-15 | B | 보통 - 약간 복잡, 리팩토링 고려 |
| 16-20 | C | 주의 - 복잡함, 리팩토링 권장 |
| 21-30 | D | 나쁨 - 매우 복잡, 즉시 리팩토링 필요 |
| 31+ | F | 위험 - 유지보수 불가능 수준 |

## 사용 방법

1. JavaScript, TypeScript, JSX, 또는 TSX 파일을 열기
2. 파일을 저장 (Ctrl+S 또는 Cmd+S)
3. VSCode 하단 우측 상태바에서 코드 랭크 확인

## 요구사항

- Visual Studio Code 1.105.0 이상

## 알려진 이슈

현재 파일 전체의 복잡도만 측정합니다. 함수별 개별 측정 기능은 향후 추가 예정입니다.

## 릴리즈 노트

### 0.0.1

초기 릴리즈
- AST 기반 순환 복잡도 계산
- S/A/B/C/D/F 랭킹 시스템
- 상태바 실시간 표시
- JavaScript/TypeScript/JSX/TSX 지원

---

**Enjoy!**
