import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { parseCodeToAST } from './analyzer';
import { calculateComplexity } from './complexity';

export function activate(context: vscode.ExtensionContext) {
  const disposable = vscode.commands.registerCommand(
    'style-rank.helloWorld',
    async () => {
      try {
        const sampleFilePath = path.join(
          context.extensionPath,
          'test-samples',
          'sample1.js'
        );

        const testCode = fs.readFileSync(sampleFilePath, 'utf-8');
        const ast = parseCodeToAST(testCode);
        const complexity = calculateComplexity(ast);

        console.log('--- Analysis Result ---');
        console.log('File:', sampleFilePath);
        console.log('AST Body Length:', ast.program.body.length);
        console.log('Cyclomatic Complexity:', complexity);

        vscode.window.showInformationMessage(
          `순환 복잡도: ${complexity} (파일: sample1.js)`
        );
      } catch (e) {
        console.error('Error:', e);
        vscode.window.showErrorMessage(
          `분석 중 오류가 발생했습니다: ${e instanceof Error ? e.message : String(e)}`
        );
      }
    }
  );

  context.subscriptions.push(disposable);
}
