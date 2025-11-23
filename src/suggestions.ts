import type { CleanCodeViolation } from './cleanCodeRules';
import type { Rank } from './ranking';

export interface AnalysisResult {
  ccs: number;
  cognitiveComplexity: number;
  lengthPenalty: number;
  maxNestingDepth: number;
  violationCount: number;
  violations: CleanCodeViolation[];
  rank: Rank;
  rankDescription: string;
}

export function generateSuggestions(result: AnalysisResult): string[] {
  const suggestions: string[] = [];

  if (result.maxNestingDepth >= 3) {
    suggestions.push(`중첩 깊이가 ${result.maxNestingDepth}입니다.`);
  }

  if (result.lengthPenalty > 0) {
    const estimatedLength = 30 + result.lengthPenalty * 10;
    suggestions.push(`함수 길이가 약 ${estimatedLength}줄입니다.`);
  }

  if (result.cognitiveComplexity > 10) {
    suggestions.push(`인지 복잡도가 ${result.cognitiveComplexity}입니다. 로직을 작은 함수로 분리하여 가독성을 높여주세요.`);
  }

  if (result.violations.length > 0) {
    const violationByRule = new Map<string, number>();
    result.violations.forEach(v => {
      violationByRule.set(v.rule, (violationByRule.get(v.rule) || 0) + 1);
    });

    violationByRule.forEach((count, rule) => {
      if (rule === 'no-loose-equality') {
        suggestions.push(`'==' 연산자를 ${count}곳에서 사용 중입니다. 모두 '==='로 변경해주세요.`);
      } else if (rule === 'no-magic-number') {
        suggestions.push(`매직 넘버가 ${count}개 발견되었습니다. 의미 있는 상수명으로 선언해주세요.`);
      } else if (rule === 'no-parameter-flag') {
        suggestions.push(`${count}개 함수에서 파라미터 플래그를 사용 중입니다. 함수를 분리하거나 전략 패턴을 고려해주세요.`);
      } else if (rule === 'max-parameters') {
        suggestions.push(`${count}개 함수의 파라미터가 5개를 초과합니다. 객체로 그룹화 해주세요.`);
      }
    });
  }

  if (suggestions.length === 0) {
    suggestions.push('코드가 깔끔합니다!');
  }

  return suggestions;
}

export function formatDetailedReport(result: AnalysisResult): string {
  const rankEmoji = {
    S: '🏆',
    A: '⭐',
    B: '👍',
    C: '⚠️',
    D: '❌',
    F: '🚨',
  }[result.rank];

  const lines: string[] = [
    `${rankEmoji} 등급: ${result.rank} (${result.rankDescription})`,
  ];

  if (result.violationCount > 0) {
    lines.push('');
    lines.push(`🧹 위반 사항 (${result.violationCount}건)`);
    result.violations.slice(0, 5).forEach((v, i) => {
      const lineInfo = v.line ? ` (Line ${v.line})` : '';
      lines.push(`  ${i + 1}. ${v.message}${lineInfo}`);
    });
    if (result.violations.length > 5) {
      lines.push(`  ... 외 ${result.violations.length - 5}건`);
    }
  }

  const suggestions = generateSuggestions(result);
  if (suggestions.length > 0) {
    lines.push('');
    lines.push('💡 개선 제안\n');
    suggestions.forEach(s => lines.push(`  • ${s}`));
  }

  return lines.join('\n');
}