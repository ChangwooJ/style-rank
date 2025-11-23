import * as vscode from 'vscode';
import type { Rank } from './ranking';

export class StatusBarManager {
  private statusBarItem: vscode.StatusBarItem;

  constructor(commandId: string) {
    this.statusBarItem = vscode.window.createStatusBarItem(
      vscode.StatusBarAlignment.Right,
      100
    );
    this.statusBarItem.command = commandId;
  }

  updateRank(rank: Rank, complexity: number, description: string): void {
    const icon = this.getRankIcon(rank);
    const color = this.getRankColor(rank);

    this.statusBarItem.text = `${icon} Rank: ${rank}`;
    this.statusBarItem.tooltip = `순환 복잡도: ${complexity}\n${description}\n\n클릭하여 상세 보기`;
    this.statusBarItem.backgroundColor = color;
    this.statusBarItem.show();
  }

  hide(): void {
    this.statusBarItem.hide();
  }

  dispose(): void {
    this.statusBarItem.dispose();
  }

  private getRankIcon(rank: Rank): string {
    const icons: Record<Rank, string> = {
      S: '$(star-full)',
      A: '$(star)',
      B: '$(check)',
      C: '$(warning)',
      D: '$(alert)',
      F: '$(error)',
    };
    return icons[rank];
  }

  private getRankColor(rank: Rank): vscode.ThemeColor | undefined {
    if (rank === 'D' || rank === 'F') {
      return new vscode.ThemeColor('statusBarItem.warningBackground');
    }
    return undefined;
  }
}
