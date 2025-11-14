import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { parseCodeToAST } from './analyzer';
import { calculateComplexity } from './complexity';
import { assignRank, getRankDescription } from './ranking';
import { StatusBarManager } from './statusBar';

export function activate(context: vscode.ExtensionContext) {
  // 상태바 매니저 초기화
  const statusBarManager = new StatusBarManager();
  context.subscriptions.push(statusBarManager);

  // 코드 분석 함수
  const analyzeCode = (code: string, fileName: string) => {
    try {
      const ast = parseCodeToAST(code);
      const complexity = calculateComplexity(ast);
      const rank = assignRank(complexity);
      const rankDescription = getRankDescription(rank);

      console.log('--- Analysis Result ---');
      console.log('File:', fileName);
      console.log('Cyclomatic Complexity:', complexity);
      console.log('Rank:', rank);
      console.log('Description:', rankDescription);

      // 상태바 업데이트
      statusBarManager.updateRank(rank, complexity, rankDescription);

      return { complexity, rank, rankDescription };
    } catch (e) {
      console.error('Error analyzing code:', e);
      statusBarManager.hide();
      throw e;
    }
  };

  // 파일 저장 이벤트 리스너
  const saveListener = vscode.workspace.onDidSaveTextDocument((document) => {
    console.log('File saved:', document.fileName);
    console.log('Language ID:', document.languageId);

    // TypeScript/JavaScript 파일만 분석
    const supportedLanguages = ['typescript', 'javascript', 'typescriptreact', 'javascriptreact'];

    if (!supportedLanguages.includes(document.languageId)) {
      console.log('Skipping - not a supported language');
      return;
    }

    try {
      const code = document.getText();
      const fileName = path.basename(document.fileName);
      analyzeCode(code, fileName);
    } catch (e) {
      vscode.window.showErrorMessage(
        `코드 분석 중 오류가 발생했습니다: ${e instanceof Error ? e.message : String(e)}`
      );
    }
  });

  // 테스트 명령어
  const testCommand = vscode.commands.registerCommand(
    'style-rank.helloWorld',
    async () => {
      try {
        const sampleFilePath = path.join(
          context.extensionPath,
          'test-samples',
          'sample1.js'
        );

        const testCode = fs.readFileSync(sampleFilePath, 'utf-8');
        const result = analyzeCode(testCode, 'sample1.js');

        vscode.window.showInformationMessage(
          `[${result.rank}] 순환 복잡도: ${result.complexity} - ${result.rankDescription}`
        );
      } catch (e) {
        console.error('Error:', e);
        vscode.window.showErrorMessage(
          `분석 중 오류가 발생했습니다: ${e instanceof Error ? e.message : String(e)}`
        );
      }
    }
  );

  context.subscriptions.push(saveListener, testCommand);
}
