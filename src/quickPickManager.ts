import * as vscode from 'vscode';
import type { AnalysisResult } from './suggestions';

interface NavigableItem extends vscode.QuickPickItem {
  filePath?: string;
  line?: number;
}

export class QuickPickManager {
  async showAnalysisResult(result: AnalysisResult): Promise<void> {
    const items: NavigableItem[] = [];

    const rankEmoji = {
      S: '🏆',
      A: '⭐',
      B: '👍',
      C: '⚠️',
      D: '❌',
      F: '🚨',
    }[result.rank];

    items.push({
      label: `${rankEmoji} 종합 등급`,
      description: `${result.rank} - ${result.rankDescription}`,
      detail: `CCS: ${result.ccs.toFixed(1)} | 인지 복잡도: ${result.cognitiveComplexity} | 중첩 깊이: ${result.maxNestingDepth} | 위반: ${result.violationCount}건`,
    });

    items.push({
      label: '',
      kind: vscode.QuickPickItemKind.Separator,
    });

    if (result.complexityHotspots.length > 0) {
      items.push({
        label: '🔥 복잡도 핫스팟',
        kind: vscode.QuickPickItemKind.Separator,
      });

      const topHotspots = result.complexityHotspots
        .sort((a, b) => b.nestingLevel - a.nestingLevel)
        .slice(0, 5);

      topHotspots.forEach((hotspot) => {
        const funcInfo = hotspot.functionName ? ` (${hotspot.functionName})` : '';
        items.push({
          label: `$(warning) ${hotspot.type}${funcInfo}`,
          description: `중첩 레벨 ${hotspot.nestingLevel}`,
          detail: `Line ${hotspot.line} - Early return 패턴을 사용하여 중첩을 줄이세요`,
          filePath: result.filePath,
          line: hotspot.line,
        });
      });
    }

    if (result.longFunctions.length > 0) {
      items.push({
        label: '',
        kind: vscode.QuickPickItemKind.Separator,
      });
      items.push({
        label: '📏 긴 함수',
        kind: vscode.QuickPickItemKind.Separator,
      });

      result.longFunctions.forEach((func) => {
        items.push({
          label: `$(symbol-method) ${func.name}`,
          description: `${func.length}줄`,
          detail: `Line ${func.startLine}-${func.endLine} - 함수를 30줄 이하로 분리하세요`,
          filePath: result.filePath,
          line: func.startLine,
        });
      });
    }

    if (result.violationCount > 0) {
      items.push({
        label: '',
        kind: vscode.QuickPickItemKind.Separator,
      });
      items.push({
        label: '🧹 클린 코드 위반',
        kind: vscode.QuickPickItemKind.Separator,
      });

      result.violations.slice(0, 10).forEach((v) => {
        items.push({
          label: `$(error) ${v.message}`,
          description: v.line ? `Line ${v.line}` : undefined,
          filePath: result.filePath,
          line: v.line,
        });
      });

      if (result.violations.length > 10) {
        items.push({
          label: `... 외 ${result.violations.length - 10}건`,
          description: '더 보기',
        });
      }
    }

    if (items.length === 1) {
      items.push({
        label: '$(check) 코드가 깔끔합니다!',
        description: '개선 사항이 없습니다',
      });
    }

    const selected = await vscode.window.showQuickPick(items, {
      title: `Style Rank - ${result.rank} 등급`,
      placeHolder: '개선이 필요한 항목을 선택하세요',
      matchOnDescription: true,
      matchOnDetail: true,
    });

    if (selected && selected.filePath && selected.line) {
      await this.navigateToLocation(selected.filePath, selected.line);
    }
  }

  private async navigateToLocation(filePath: string, line: number): Promise<void> {
    try {
      const document = await vscode.workspace.openTextDocument(filePath);
      const editor = await vscode.window.showTextDocument(document);

      const position = new vscode.Position(line - 1, 0);
      editor.selection = new vscode.Selection(position, position);
      editor.revealRange(
        new vscode.Range(position, position),
        vscode.TextEditorRevealType.InCenter
      );
    } catch (error) {
      vscode.window.showErrorMessage(`파일을 열 수 없습니다: ${error}`);
    }
  }
}