import type { CleanCodeViolation } from './cleanCodeRules';
import type { Rank } from './ranking';
import type { LongFunction, ComplexityHotspot } from './complexity';

export interface AnalysisResult {
  ccs: number;
  cognitiveComplexity: number;
  lengthPenalty: number;
  maxNestingDepth: number;
  violationCount: number;
  violations: CleanCodeViolation[];
  rank: Rank;
  rankDescription: string;
  longFunctions: LongFunction[];
  complexityHotspots: ComplexityHotspot[];
  filePath?: string;
}

export function generateSuggestions(result: AnalysisResult): string[] {
  const suggestions: string[] = [];

  if (result.complexityHotspots.length > 0) {
    const topHotspots = result.complexityHotspots
      .sort((a, b) => b.nestingLevel - a.nestingLevel)
      .slice(0, 3);

    topHotspots.forEach(hotspot => {
      const funcInfo = hotspot.functionName ? ` (${hotspot.functionName} 함수)` : '';
      const location = result.filePath ? `${result.filePath}:${hotspot.line}` : `Line ${hotspot.line}`;

      suggestions.push(
        `깊은 중첩 발견${funcInfo}: ${hotspot.type} at ${location}\n` +
        `  → 중첩 레벨 ${hotspot.nestingLevel} - 깊은 중첩을 개선해주세요`
      );
    });
  } else if (result.maxNestingDepth >= 3) {
    suggestions.push(`최대 중첩 깊이: ${result.maxNestingDepth}\n  → 깊은 중첩을 개선해주세요`);
  }

  if (result.longFunctions.length > 0) {
    result.longFunctions.forEach(func => {
      const location = result.filePath
        ? `${result.filePath}:${func.startLine}-${func.endLine}`
        : `Line ${func.startLine}-${func.endLine}`;

      suggestions.push(
        `긴 함수 발견: ${func.name} (${func.length}줄) at ${location}\n` +
        `  → 함수를 작은 단위로 분리해주세요`
      );
    });
  }

  if (result.cognitiveComplexity > 10 && result.complexityHotspots.length === 0) {
    suggestions.push(
      `인지 복잡도: ${result.cognitiveComplexity}\n` +
      `  → 로직을 작은 함수로 분리하여 가독성을 높이세요`
    );
  }

  if (result.violations.length > 0) {
    const violationByRule = new Map<string, number>();
    result.violations.forEach(v => {
      violationByRule.set(v.rule, (violationByRule.get(v.rule) || 0) + 1);
    });

    violationByRule.forEach((count, rule) => {
      if (rule === 'no-loose-equality') {
        suggestions.push(`'==' 연산자 ${count}곳\n  → 모두 '==='로 변경해주세요`);
      } else if (rule === 'no-magic-number') {
        suggestions.push(`매직 넘버 ${count}개\n  → 의미 있는 상수명으로 선언해주세요`);
      } else if (rule === 'no-parameter-flag') {
        suggestions.push(`파라미터 플래그 ${count}개\n  → 함수 분리 또는 전략 패턴을 고려해주세요`);
      } else if (rule === 'max-parameters') {
        suggestions.push(`파라미터 과다 ${count}개 함수\n  → 객체로 그룹화해주세요`);
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