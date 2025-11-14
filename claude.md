# Style Rank - VSCode Extension 프로젝트

## 🚀 프로젝트 개요

**Style Rank**는 AST(Abstract Syntax Tree) 기반 코드 복잡도 분석 및 랭크 측정 VSCode 확장 프로그램입니다.

| 구분 | 내용 |
|------|------|
| **프로젝트명** | style-rank (코드 랭크 분석 확장 프로그램) |
| **핵심 목표** | TypeScript/React 코드의 순환 복잡도(Cyclomatic Complexity)를 측정하고 시각적 랭크(S, A, B, C, D, F)를 부여 |
| **주요 기능** | 파일 저장 시 자동 분석 + VS Code 하단 상태바에 랭크 표시 |
| **사용 기술** | VS Code API, TypeScript, Babel (파싱/순회), esbuild (번들러) |
| **분석 대상** | `if`, `for`, `while`, `&&`, `||`, `switch case`, `ternary operator`, `catch` 등 |

### 핵심 목표
1. **자동 코드 분석**: 파일 저장 시 자동으로 순환 복잡도(CC) 측정
2. **직관적인 랭크 표시**: S/A/B/C/D/F 등급을 VS Code 상태바에 실시간 표시
3. **개발자 피드백**: 코드 복잡도를 즉각적으로 인지하여 리팩토링 유도

## 기술 스택

### 핵심 라이브러리
- **@babel/parser**: JavaScript/TypeScript 코드를 AST로 파싱
- **@babel/traverse**: AST 트리 탐색 및 조작
- **@babel/types**: AST 노드 타입 정의 및 유틸리티
- **VSCode Extension API**: VSCode 확장 프로그램 개발

### 개발 환경
- TypeScript 5.9.3
- ESBuild (번들링)
- ESLint (코드 린팅)
- VSCode API 1.105.0

## 프로젝트 구조

```
style-rank/
├── src/
│   ├── extension.ts       # VSCode 확장 진입점
│   ├── analyzer.ts        # AST 파싱 로직
│   └── test/
│       └── extension.test.ts
├── package.json
├── tsconfig.json
└── esbuild.js
```

## 주요 파일 설명

### [src/analyzer.ts](src/analyzer.ts)
AST 파싱 핵심 로직을 담당하는 모듈입니다.

```typescript
export function parseCodeToAST(code: string): File
```

**기능:**
- JavaScript/TypeScript 코드 문자열을 입력받아 AST 객체로 변환
- JSX 및 TypeScript 문법 지원
- ESM 모듈 형식 지원
- 파싱 실패 시 에러 처리 및 메시지 제공

**파서 설정:**
- `sourceType: 'module'` - ES 모듈 형식으로 파싱
- `plugins: ['jsx', 'typescript']` - JSX와 TypeScript 문법 플러그인 활성화

### [src/extension.ts](src/extension.ts)
VSCode 확장 프로그램의 진입점입니다.

**주요 기능:**
1. **activate 함수**: 확장이 활성화될 때 실행
2. **명령어 등록**: `style-rank.helloWorld` 커맨드 구현
3. **테스트 코드 파싱**: React 컴포넌트 예제를 AST로 파싱하여 검증

**현재 구현된 테스트 시나리오:**
```typescript
// React TypeScript 컴포넌트
const MyComponent = (props: { count: number }) => {
  if (props.count > 10) {
    return <div>Too many!</div>;
  } else {
    return <div>OK</div>;
  }
};
```
- AST 파싱 성공 시: "AST 파싱 성공! 디버그 콘솔을 확인하세요." 메시지 표시
- 파싱 실패 시: 에러 메시지 표시

## 📊 순환 복잡도(Cyclomatic Complexity) 개념

### 정의
순환 복잡도는 코드의 논리적 경로(path)의 수를 측정하는 소프트웨어 메트릭입니다.

### 계산 방식
**기본 공식**: CC = 분기점의 개수 + 1

**분기점이 되는 AST 노드:**
- `IfStatement` - if 문
- `ConditionalExpression` - 삼항 연산자 (? :)
- `LogicalExpression` - 논리 연산자 (&& 또는 ||)
- `SwitchCase` - switch문의 각 case
- `ForStatement`, `ForInStatement`, `ForOfStatement` - 반복문
- `WhileStatement`, `DoWhileStatement` - while 반복문
- `CatchClause` - try-catch의 catch 블록

### 등급 기준 (예시)
| CC 범위 | 등급 | 평가 | 설명 |
|---------|------|------|------|
| 1-5 | **S** | 매우 우수 | 단순하고 이해하기 쉬운 코드 |
| 6-10 | **A** | 우수 | 적절한 복잡도 |
| 11-15 | **B** | 보통 | 약간 복잡, 리팩토링 고려 |
| 16-20 | **C** | 주의 | 복잡함, 리팩토링 권장 |
| 21-30 | **D** | 나쁨 | 매우 복잡, 즉시 리팩토링 필요 |
| 31+ | **F** | 위험 | 유지보수 불가능 수준 |

## ✅ 개발 진행 상황

### 완료된 작업
1. **✅ 개발 환경 설정 완료** (29b468a)
   - Yeoman `generator-code`를 사용한 VSCode 확장 프로그램 템플릿 생성
   - Webpack 대신 **esbuild** 사용으로 빠른 빌드 환경 구축
   - GitHub 리포지토리 초기화 및 버전 관리 시작

2. **✅ 디버깅 환경 구축 성공**
   - `tasks.json`과 `launch.json` 설정 완료
   - **F5 키**만으로 빌드 + Extension Development Host 실행 가능
   - 개발자 경험(DX) 최적화 완료

3. **✅ 핵심 라이브러리 설치**
   - `@babel/parser` - AST 파싱
   - `@babel/traverse` - AST 순회
   - `@babel/types` - AST 노드 타입 정의

4. **✅ AST 파싱 MVP 구현 및 테스트 성공** (8f1547b)
   - [src/analyzer.ts](src/analyzer.ts)에 `parseCodeToAST` 함수 구현
   - TSX/JSX 문법 파싱을 위한 `plugins: ["jsx", "typescript"]` 설정
   - React 컴포넌트 예제로 파싱 성공 검증 (콘솔에 `3` 출력 확인)
   - 에러 핸들링 로직 추가

### 🚧 다음 단계 (핵심 작업)

**현재 상태**: AST 파싱 완료 → **이제 AST 분석 엔진을 구축할 차례**

#### 1. **순환 복잡도 계산 엔진 구현** (최우선)
- [ ] `calculateCyclomaticComplexity(ast: File): number` 함수 구현
- [ ] `@babel/traverse`를 사용한 AST 노드 순회 로직
- [ ] 다음 노드 타입별 분기점 카운팅:
  - `IfStatement`
  - `LogicalExpression` (&& ||)
  - `ConditionalExpression` (삼항 연산자)
  - `SwitchCase`
  - `ForStatement`, `ForInStatement`, `ForOfStatement`
  - `WhileStatement`, `DoWhileStatement`
  - `CatchClause`

#### 2. **랭킹 시스템 구현**
- [ ] CC 점수 → 등급(S/A/B/C/D/F) 변환 함수 구현
- [ ] 등급별 임계값 정의 (설정 가능하도록 구현 권장)
- [ ] 타입 정의: `type Rank = 'S' | 'A' | 'B' | 'C' | 'D' | 'F'`

#### 3. **VS Code API 연동**
- [ ] `vscode.workspace.onDidSaveTextDocument` 이벤트 리스너 등록
- [ ] 파일 저장 시 자동 분석 파이프라인 구축:
  1. 파일 내용 읽기
  2. AST 파싱
  3. CC 계산
  4. 랭크 부여
- [ ] TypeScript/JavaScript/TSX/JSX 파일만 분석하도록 필터링

#### 4. **상태바 UI 구현**
- [ ] `vscode.window.createStatusBarItem()` 생성
- [ ] 랭크에 따른 색상 표시 (예: S=초록, A=파랑, B=노랑, C=주황, D/F=빨강)
- [ ] 클릭 시 상세 정보 표시 (옵션)
- [ ] 아이콘 추가 (예: `$(star)`, `$(warning)`)

#### 5. **추가 개선사항 (향후)**
- [ ] 함수/메서드별 개별 CC 측정
- [ ] 에디터 내 인라인 데코레이션 (복잡한 함수 하이라이팅)
- [ ] 워크스페이스 전체 분석 및 리포트 생성
- [ ] 사용자 설정 옵션 (`settings.json` 연동)
- [ ] 성능 최적화 (대용량 파일 처리)

## 실행 방법

### 개발 모드
```bash
npm run watch
```
- F5 키로 Extension Development Host 실행
- Ctrl+Shift+P → "Hello World" 명령 실행

### 빌드
```bash
npm run compile      # 개발 빌드
npm run package      # 프로덕션 빌드
```

### 테스트
```bash
npm test
```

## 의존성

### 프로덕션 의존성
- `@babel/parser` ^7.28.5 - 코드 파싱
- `@babel/traverse` ^7.28.5 - AST 순회
- `@babel/types` ^7.28.5 - AST 타입 정의

### 개발 의존성
- TypeScript, ESLint, ESBuild 등 (package.json 참조)

## 🏗️ 아키텍처 및 설계

### 전체 워크플로우
```
[파일 저장]
    ↓
[onDidSaveTextDocument 이벤트 감지]
    ↓
[파일 내용 읽기 (vscode.workspace.fs.readFile)]
    ↓
[parseCodeToAST() - Babel Parser로 AST 생성]
    ↓
[calculateCyclomaticComplexity() - Babel Traverse로 CC 계산]
    ↓
[assignRank() - CC 점수를 S/A/B/C/D/F 등급으로 변환]
    ↓
[StatusBarItem.text 업데이트 - UI에 랭크 표시]
```

### 핵심 모듈 구조 (계획)
```
src/
├── extension.ts           # VSCode 확장 진입점 및 이벤트 리스너
├── analyzer.ts            # AST 파싱 로직
├── complexity.ts          # CC 계산 엔진 (신규 생성 예정)
├── ranking.ts             # 랭크 부여 로직 (신규 생성 예정)
└── statusBar.ts           # 상태바 UI 관리 (신규 생성 예정)
```

### AST 기반 분석의 장점
1. **정확성**: 단순 정규식이 아닌 구문 구조를 이해
2. **확장성**: 다양한 코드 패턴 분석 가능
3. **언어 지원**: JavaScript, TypeScript, JSX 모두 지원
4. **세밀한 제어**: 노드 레벨에서 코드 분석 가능

### Babel Parser 선택 이유
- JavaScript/TypeScript 생태계에서 검증된 파서
- 최신 문법 지원 (ES2024+, TypeScript, JSX)
- 풍부한 플러그인 시스템
- AST 표준 준수 (ESTree 호환)

### 개발 시 고려사항
1. **성능**: 파일 저장마다 실행되므로 파싱/순회 최적화 필요
2. **에러 핸들링**: 잘못된 문법의 코드에 대한 graceful fallback
3. **파일 타입 필터링**: `.ts`, `.tsx`, `.js`, `.jsx` 파일만 분석
4. **비동기 처리**: 대용량 파일 분석 시 UI 블로킹 방지
5. **설정 가능성**: 사용자가 등급 임계값을 커스터마이징할 수 있도록

## 참고사항

- VSCode Extension API 버전: 1.105.0
- Node 버전: 22.x
- 빌드 도구: ESBuild (빠른 번들링)
- 테스트 프레임워크: Mocha + VSCode Test Runner

## 📚 관련 문서 및 참고 자료

### VSCode Extension API
- [VSCode Extension Guidelines](https://code.visualstudio.com/api/references/extension-guidelines)
- [VSCode API - Status Bar](https://code.visualstudio.com/api/references/vscode-api#StatusBarItem)
- [VSCode API - Workspace Events](https://code.visualstudio.com/api/references/vscode-api#workspace)

### Babel 문서
- [Babel Parser Documentation](https://babeljs.io/docs/en/babel-parser)
- [Babel Traverse Documentation](https://babeljs.io/docs/en/babel-traverse)
- [Babel Types Documentation](https://babeljs.io/docs/en/babel-types)

### 개발 도구
- [AST Explorer](https://astexplorer.net/) - AST 구조 시각화 도구 (디버깅 필수!)
- [TypeScript AST Viewer](https://ts-ast-viewer.com/) - TypeScript 전용 AST 뷰어

### 순환 복잡도 참고 자료
- [Cyclomatic Complexity - Wikipedia](https://en.wikipedia.org/wiki/Cyclomatic_complexity)
- [Code Complexity Analysis Tools Comparison](https://github.com/escomplex/escomplex)

---

## 💡 개발 팁

### AST 디버깅 방법
1. [AST Explorer](https://astexplorer.net/)에서 코드를 입력
2. Parser를 `@babel/parser`로 설정
3. 분석하고자 하는 노드의 `type` 확인
4. 해당 노드를 `@babel/traverse`에서 방문(visit)

### Babel Traverse 사용 예시
```typescript
import traverse from '@babel/traverse';
import * as t from '@babel/types';

let complexity = 1;

traverse(ast, {
  IfStatement(path) {
    complexity++;
  },
  LogicalExpression(path) {
    if (path.node.operator === '&&' || path.node.operator === '||') {
      complexity++;
    }
  },
  // ... 기타 노드 타입
});
```

### 상태바 구현 예시
```typescript
const statusBarItem = vscode.window.createStatusBarItem(
  vscode.StatusBarAlignment.Right,
  100
);

statusBarItem.text = `$(star) Rank: S`;
statusBarItem.tooltip = 'Cyclomatic Complexity: 3';
statusBarItem.show();
```

---

**마지막 업데이트**: 2025-11-09
**다음 작업**: 순환 복잡도 계산 엔진 구현 시작
