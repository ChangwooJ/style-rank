import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { parseCodeToAST } from './analyzer';
import { calculateRefinedComplexityScore } from './complexity';
import { assignRefinedRank, getRankDescription } from './ranking';
import { checkCleanCodeRules, formatViolations } from './cleanCodeRules';
import { StatusBarManager } from './statusBar';

export function activate(context: vscode.ExtensionContext) {
  const statusBarManager = new StatusBarManager();
  context.subscriptions.push(statusBarManager);

  const analyzeCode = (code: string, fileName: string) => {
    try {
      const ast = parseCodeToAST(code);

      const complexityResult = calculateRefinedComplexityScore(ast);
      const { ccs, cognitiveComplexity, lengthPenalty, maxNestingDepth } = complexityResult;

      const cleanCodeResult = checkCleanCodeRules(ast);
      const { violations, violationCount } = cleanCodeResult;

      const rank = assignRefinedRank(ccs, violationCount);
      const rankDescription = getRankDescription(rank);

      console.log('==================================================');
      console.log('📊 Style Rank Analysis Result');
      console.log('==================================================');
      console.log('📁 File:', fileName);
      console.log('--------------------------------------------------');
      console.log('🔢 Complexity Metrics:');
      console.log(`   - CCS (Refined): ${ccs.toFixed(1)}`);
      console.log(`   - Cognitive Complexity: ${cognitiveComplexity}`);
      console.log(`   - Max Nesting Depth: ${maxNestingDepth}`);
      console.log(`   - Length Penalty: ${lengthPenalty}`);
      console.log('--------------------------------------------------');
      console.log('🧹 Clean Code Violations:', violationCount);
      if (violationCount > 0) {
        console.log(formatViolations(violations));
      }
      console.log('--------------------------------------------------');
      console.log(`🏆 Final Rank: ${rank}`);
      console.log(`📝 ${rankDescription}`);
      console.log('==================================================\n');

      const detailedTooltip = [
        `종합 복잡도 점수: ${ccs.toFixed(1)}`,
        `인지 복잡도: ${cognitiveComplexity}`,
        `최대 중첩 깊이: ${maxNestingDepth}`,
        `클린 코드 위반: ${violationCount}건`,
        '',
        rankDescription,
      ].join('\n');

      statusBarManager.updateRank(rank, Math.round(ccs), detailedTooltip);

      return {
        ccs,
        cognitiveComplexity,
        lengthPenalty,
        maxNestingDepth,
        violationCount,
        violations,
        rank,
        rankDescription,
      };
    } catch (e) {
      console.error('Error analyzing code:', e);
      statusBarManager.hide();
      throw e;
    }
  };

  const saveListener = vscode.workspace.onDidSaveTextDocument((document) => {
    console.log('File saved:', document.fileName);
    console.log('Language ID:', document.languageId);

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

        const message = [
          `🏆 Rank: ${result.rank}`,
          `📊 CCS: ${result.ccs.toFixed(1)}`,
          `🧹 Violations: ${result.violationCount}건`,
          ``,
          result.rankDescription,
        ].join('\n');

        vscode.window.showInformationMessage(message);
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
