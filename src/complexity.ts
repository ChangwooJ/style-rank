import traverse, { NodePath } from '@babel/traverse';
import type { File, LogicalExpression, SwitchCase } from '@babel/types';

export function calculateComplexity(ast: File): number {
  let complexity = 1;

  traverse(ast, {
    // if
    IfStatement() {
      complexity++;
    },

    // 삼항 연산자
    ConditionalExpression() {
      complexity++;
    },

    // and, or
    LogicalExpression(path: NodePath<LogicalExpression>) {
      const operator = path.node.operator;
      if (operator === '&&' || operator === '||') {
        complexity++;
      }
    },

    // switch
    SwitchCase(path: NodePath<SwitchCase>) {
      if (path.node.test !== null) {
        complexity++;
      }
    },

    // for
    ForStatement() {
      complexity++;
    },

    // while
    WhileStatement() {
      complexity++;
    },

    // try-catch의 catch
    CatchClause() {
      complexity++;
    },
  });

  return complexity;
}
