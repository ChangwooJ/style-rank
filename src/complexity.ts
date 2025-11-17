import traverse, { NodePath } from '@babel/traverse';
import type { File, LogicalExpression, SwitchCase, IfStatement } from '@babel/types';

export function calculateComplexity(ast: File): number {
  let complexity = 1;

  traverse(ast, {
    IfStatement() {
      complexity++;
    },
    ConditionalExpression() {
      complexity++;
    },
    LogicalExpression(path: NodePath<LogicalExpression>) {
      const operator = path.node.operator;
      if (operator === '&&' || operator === '||') {
        complexity++;
      }
    },
    SwitchCase(path: NodePath<SwitchCase>) {
      if (path.node.test !== null) {
        complexity++;
      }
    },
    ForStatement() {
      complexity++;
    },
    WhileStatement() {
      complexity++;
    },
    CatchClause() {
      complexity++;
    },
  });

  return complexity;
}

export function calculateCognitiveComplexity(ast: File): number {
  let cognitiveComplexity = 0;
  let nestingLevel = 0;
  let maxNestingDepth = 0;

  traverse(ast, {
    'FunctionDeclaration|FunctionExpression|ArrowFunctionExpression': {
      enter() {
        nestingLevel = 0;
      },
    },

    IfStatement: {
      enter(path: NodePath<IfStatement>) {
        const isEarlyReturn =
          path.node.consequent.type === 'BlockStatement' &&
          path.node.consequent.body.length === 1 &&
          path.node.consequent.body[0].type === 'ReturnStatement' &&
          !path.node.alternate;

        if (isEarlyReturn) {
          cognitiveComplexity += 1;
        } else {
          cognitiveComplexity += 1 + nestingLevel;
          nestingLevel++;
          maxNestingDepth = Math.max(maxNestingDepth, nestingLevel);
        }
      },
      exit(path: NodePath<IfStatement>) {
        const isEarlyReturn =
          path.node.consequent.type === 'BlockStatement' &&
          path.node.consequent.body.length === 1 &&
          path.node.consequent.body[0].type === 'ReturnStatement' &&
          !path.node.alternate;

        if (!isEarlyReturn) {
          nestingLevel--;
        }
      },
    },

    ConditionalExpression() {
      cognitiveComplexity += 1 + nestingLevel;
    },

    LogicalExpression(path: NodePath<LogicalExpression>) {
      const operator = path.node.operator;
      if (operator === '&&' || operator === '||') {
        cognitiveComplexity += 1;
      }
    },

    SwitchCase(path: NodePath<SwitchCase>) {
      if (path.node.test !== null) {
        cognitiveComplexity += 1 + nestingLevel;
      }
    },

    'ForStatement|WhileStatement|DoWhileStatement|ForInStatement|ForOfStatement': {
      enter() {
        cognitiveComplexity += 1 + nestingLevel;
        nestingLevel++;
        maxNestingDepth = Math.max(maxNestingDepth, nestingLevel);
      },
      exit() {
        nestingLevel--;
      },
    },

    CatchClause() {
      cognitiveComplexity += 1 + nestingLevel;
    },
  });

  return cognitiveComplexity;
}

export function calculateMaxNestingDepth(ast: File): number {
  let currentDepth = 0;
  let maxDepth = 0;

  traverse(ast, {
    'FunctionDeclaration|FunctionExpression|ArrowFunctionExpression': {
      enter() {
        currentDepth = 0;
      },
    },

    'IfStatement|ForStatement|WhileStatement|DoWhileStatement|ForInStatement|ForOfStatement': {
      enter() {
        currentDepth++;
        maxDepth = Math.max(maxDepth, currentDepth);
      },
      exit() {
        currentDepth--;
      },
    },
  });

  return maxDepth;
}

export function calculateLengthPenalty(ast: File): number {
  const MAX_RECOMMENDED_LENGTH = 30;
  let maxFunctionLength = 0;

  traverse(ast, {
    'FunctionDeclaration|FunctionExpression|ArrowFunctionExpression'(path) {
      const startLine = path.node.loc?.start.line || 0;
      const endLine = path.node.loc?.end.line || 0;
      const functionLength = endLine - startLine + 1;

      maxFunctionLength = Math.max(maxFunctionLength, functionLength);
    },
  });

  const totalLines = ast.loc?.end.line || 0;
  const effectiveLength = Math.max(maxFunctionLength, totalLines);

  if (effectiveLength <= MAX_RECOMMENDED_LENGTH) {
    return 0;
  }

  return Math.floor((effectiveLength - MAX_RECOMMENDED_LENGTH) / 10);
}

export function calculateRefinedComplexityScore(ast: File): {
  ccs: number;
  cognitiveComplexity: number;
  lengthPenalty: number;
  maxNestingDepth: number;
} {
  const cognitiveComplexity = calculateCognitiveComplexity(ast);
  const lengthPenalty = calculateLengthPenalty(ast);
  const maxNestingDepth = calculateMaxNestingDepth(ast);

  const ccs = 1.0 * cognitiveComplexity + 0.5 * lengthPenalty;

  return {
    ccs,
    cognitiveComplexity,
    lengthPenalty,
    maxNestingDepth,
  };
}
