// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { parseCodeToAST } from './analyzer';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log('Congratulations, your extension "style-rank" is now active!');

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json
  const disposable = vscode.commands.registerCommand(
    'style-rank.helloWorld',
    () => {
      // The code you place here will be executed every time your command is executed
      // Display a message box to the user
      const testCode = `
				import React from 'react';

				const MyComponent = (props: { count: number }) => {
					if (props.count > 10) {
						return <div>Too many!</div>;
					} else {
						return <div>OK</div>;
					}
				};

				export default MyComponent;
    	`;

      try {
        const ast = parseCodeToAST(testCode);
        console.log('--- AST Parsed Successfully ---');
        console.log(ast.program.body.length);

        vscode.window.showInformationMessage(
          'AST 파싱 성공! 디버그 콘솔을 확인하세요.'
        );
      } catch (e) {
        vscode.window.showErrorMessage('AST 파싱 중 오류가 발생했습니다.');
      }
    }
  );

  context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}
