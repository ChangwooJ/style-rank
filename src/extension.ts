import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { parseCodeToAST } from './analyzer';
import { calculateRefinedComplexityScore } from './complexity';
import { assignRefinedRank, getRankDescription } from './ranking';
import { checkCleanCodeRules, formatViolations } from './cleanCodeRules';
import { StatusBarManager } from './statusBar';
import { formatDetailedReport, type AnalysisResult } from './suggestions';

export function activate(context: vscode.ExtensionContext) {
  let lastAnalysisResult: AnalysisResult | null = null;

  const statusBarManager = new StatusBarManager('style-rank.showDetails');
  context.subscriptions.push(statusBarManager);

  const showDetailedReport = () => {
    if (!lastAnalysisResult) {
      vscode.window.showInformationMessage('분석 결과가 없습니다. 파일을 저장하여 분석을 시작하세요.');
      return;
    }

    const report = formatDetailedReport(lastAnalysisResult);
    vscode.window.showInformationMessage(report, { modal: false });
  };

  const analyzeCode = (code: string, fileName: string, showPopup: boolean = false) => {
    try {
      const ast = parseCodeToAST(code);

      const complexityResult = calculateRefinedComplexityScore(ast);
      const { ccs, cognitiveComplexity, lengthPenalty, maxNestingDepth } = complexityResult;

      const cleanCodeResult = checkCleanCodeRules(ast);
      const { violations, violationCount } = cleanCodeResult;

      const rank = assignRefinedRank(ccs, violationCount);
      const rankDescription = getRankDescription(rank);

      const detailedTooltip = [
        `종합 복잡도 점수: ${ccs.toFixed(1)}`,
        `인지 복잡도: ${cognitiveComplexity}`,
        `최대 중첩 깊이: ${maxNestingDepth}`,
        `클린 코드 위반: ${violationCount}건`,
        '',
        rankDescription,
      ].join('\n');

      statusBarManager.updateRank(rank, Math.round(ccs), detailedTooltip);

      lastAnalysisResult = {
        ccs,
        cognitiveComplexity,
        lengthPenalty,
        maxNestingDepth,
        violationCount,
        violations,
        rank,
        rankDescription,
      };

      if (showPopup) {
        showDetailedReport();
      }

      return lastAnalysisResult;
    } catch (e) {
      console.error('Error analyzing code:', e);
      statusBarManager.hide();
      throw e;
    }
  };

  const saveListener = vscode.workspace.onDidSaveTextDocument((document) => {
    const supportedLanguages = ['typescript', 'javascript', 'typescriptreact', 'javascriptreact'];

    if (!supportedLanguages.includes(document.languageId)) {
      console.log('지원하지 않는 언어입니다.');
      return;
    }

    try {
      const code = document.getText();
      const fileName = path.basename(document.fileName);
      analyzeCode(code, fileName, true);
    } catch (e) {
      vscode.window.showErrorMessage(
        `코드 분석 중 오류가 발생했습니다: ${e instanceof Error ? e.message : String(e)}`
      );
    }
  });

  const showDetailsCommand = vscode.commands.registerCommand('style-rank.showDetails', showDetailedReport);

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
        analyzeCode(testCode, 'sample1.js', true);
      } catch (e) {
        console.error('Error:', e);
        vscode.window.showErrorMessage(
          `분석 중 오류가 발생했습니다: ${e instanceof Error ? e.message : String(e)}`
        );
      }
    }
  );

  context.subscriptions.push(saveListener, showDetailsCommand, testCommand);
}