import * as vscode from 'vscode';
import type { AnalysisResult } from './suggestions';

export class OutputChannelManager {
  private outputChannel: vscode.OutputChannel;

  constructor() {
    this.outputChannel = vscode.window.createOutputChannel('Style Rank');
  }

  showAnalysisResult(result: AnalysisResult): void {
    this.outputChannel.clear();
    this.outputChannel.appendLine('==================================================');
    this.outputChannel.appendLine('📊 Style Rank Analysis Result');
    this.outputChannel.appendLine('==================================================');
    this.outputChannel.appendLine('');

    const rankEmoji = {
      S: '🏆',
      A: '⭐',
      B: '👍',
      C: '⚠️',
      D: '❌',
      F: '🚨',
    }[result.rank];

    this.outputChannel.appendLine(`${rankEmoji} 등급: ${result.rank} (${result.rankDescription})`);
    this.outputChannel.appendLine('');
    this.outputChannel.appendLine('📈 복잡도 분석');
    this.outputChannel.appendLine(`  • CCS: ${result.ccs.toFixed(1)}`);
    this.outputChannel.appendLine(`  • 인지 복잡도: ${result.cognitiveComplexity}`);
    this.outputChannel.appendLine(`  • 최대 중첩 깊이: ${result.maxNestingDepth}`);
    this.outputChannel.appendLine(`  • 길이 페널티: ${result.lengthPenalty}`);
    this.outputChannel.appendLine('');

    if (result.complexityHotspots.length > 0) {
      this.outputChannel.appendLine('🔥 복잡도 핫스팟');
      const topHotspots = result.complexityHotspots
        .sort((a, b) => b.nestingLevel - a.nestingLevel)
        .slice(0, 5);

      topHotspots.forEach((hotspot, index) => {
        const funcInfo = hotspot.functionName ? ` (${hotspot.functionName} 함수)` : '';
        this.outputChannel.appendLine(`  ${index + 1}. ${hotspot.type}${funcInfo} - 중첩 레벨 ${hotspot.nestingLevel}`);
        if (result.filePath) {
          this.outputChannel.appendLine(`     at ${result.filePath}:${hotspot.line}:1`);
        }
      });
      this.outputChannel.appendLine('');
    }

    if (result.longFunctions.length > 0) {
      this.outputChannel.appendLine('📏 긴 함수');
      result.longFunctions.forEach((func, index) => {
        this.outputChannel.appendLine(`  ${index + 1}. ${func.name} (${func.length}줄)`);
        if (result.filePath) {
          this.outputChannel.appendLine(`at ${result.filePath}:${func.startLine}:1`);
        }
      });
      this.outputChannel.appendLine('');
    }

    if (result.violationCount > 0) {
      this.outputChannel.appendLine(`🧹 클린 코드 위반 (${result.violationCount}건)`);
      result.violations.slice(0, 10).forEach((v, index) => {
        this.outputChannel.appendLine(`  ${index + 1}. ${v.message}`);
        if (result.filePath && v.line) {
          this.outputChannel.appendLine(`at ${result.filePath}:${v.line}:1`);
        }
      });
      if (result.violations.length > 10) {
        this.outputChannel.appendLine(`  ... 외 ${result.violations.length - 10}건`);
      }
      this.outputChannel.appendLine('');
    }

    this.outputChannel.appendLine('💡 개선 제안');
    this.appendSuggestions(result);

    this.outputChannel.appendLine('');
    this.outputChannel.appendLine('==================================================');

    this.outputChannel.show(true);
  }

  private appendSuggestions(result: AnalysisResult): void {
    if (result.complexityHotspots.length > 0) {
      this.outputChannel.appendLine('  • 깊은 중첩을 Early return 패턴이나 Guard Clause로 개선하세요');
    }

    if (result.longFunctions.length > 0) {
      this.outputChannel.appendLine('  • 긴 함수를 30줄 이하의 작은 단위로 분리하세요');
    }

    if (result.cognitiveComplexity > 10) {
      this.outputChannel.appendLine('  • 로직을 작은 함수로 분리하여 가독성을 높이세요');
    }

    if (result.violations.length > 0) {
      const violationByRule = new Map<string, number>();
      result.violations.forEach(v => {
        violationByRule.set(v.rule, (violationByRule.get(v.rule) || 0) + 1);
      });

      violationByRule.forEach((count, rule) => {
        if (rule === 'no-loose-equality') {
          this.outputChannel.appendLine(`  • '==' 연산자를 '==='로 변경하세요 (${count}곳)`);
        } else if (rule === 'no-magic-number') {
          this.outputChannel.appendLine(`  • 매직 넘버를 상수로 선언하세요 (${count}개)`);
        } else if (rule === 'no-parameter-flag') {
          this.outputChannel.appendLine(`  • 파라미터 플래그를 제거하고 함수를 분리하세요 (${count}개)`);
        } else if (rule === 'max-parameters') {
          this.outputChannel.appendLine(`  • 많은 파라미터를 객체로 그룹화하세요 (${count}개 함수)`);
        }
      });
    }

    if (result.rank === 'S' || result.rank === 'A') {
      this.outputChannel.appendLine('  • 코드가 깔끔합니다! 현재 상태를 유지하세요.');
    }
  }

  dispose(): void {
    this.outputChannel.dispose();
  }
}