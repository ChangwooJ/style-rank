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

export interface ComplexityHotspot {
  type: string;
  line: number;
  nestingLevel: number;
  functionName?: string;
}

export function calculateCognitiveComplexity(ast: File): {
  complexity: number;
  hotspots: ComplexityHotspot[];
} {
  let cognitiveComplexity = 0;
  let nestingLevel = 0;
  const hotspots: ComplexityHotspot[] = [];
  let currentFunctionName: string | undefined;

  traverse(ast, {
    'FunctionDeclaration|FunctionExpression|ArrowFunctionExpression': {
      enter(path) {
        nestingLevel = 0;
        if (path.node.type === 'FunctionDeclaration' && path.node.id) {
          currentFunctionName = path.node.id.name;
        } else {
          currentFunctionName = undefined;
        }
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
          const complexity = 1 + nestingLevel;
          cognitiveComplexity += complexity;

          if (nestingLevel >= 2) {
            hotspots.push({
              type: 'IfStatement',
              line: path.node.loc?.start.line || 0,
              nestingLevel,
              functionName: currentFunctionName,
            });
          }

          nestingLevel++;
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

    ConditionalExpression(path) {
      cognitiveComplexity += 1 + nestingLevel;

      if (nestingLevel >= 2) {
        hotspots.push({
          type: 'ConditionalExpression',
          line: path.node.loc?.start.line || 0,
          nestingLevel,
          functionName: currentFunctionName,
        });
      }
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

        if (nestingLevel >= 2) {
          hotspots.push({
            type: 'SwitchCase',
            line: path.node.loc?.start.line || 0,
            nestingLevel,
            functionName: currentFunctionName,
          });
        }
      }
    },

    'ForStatement|WhileStatement|DoWhileStatement|ForInStatement|ForOfStatement': {
      enter(path) {
        const complexity = 1 + nestingLevel;
        cognitiveComplexity += complexity;

        if (nestingLevel >= 2) {
          hotspots.push({
            type: path.node.type,
            line: path.node.loc?.start.line || 0,
            nestingLevel,
            functionName: currentFunctionName,
          });
        }

        nestingLevel++;
      },
      exit() {
        nestingLevel--;
      },
    },

    CatchClause(path) {
      cognitiveComplexity += 1 + nestingLevel;

      if (nestingLevel >= 2) {
        hotspots.push({
          type: 'CatchClause',
          line: path.node.loc?.start.line || 0,
          nestingLevel,
          functionName: currentFunctionName,
        });
      }
    },
  });

  return {
    complexity: cognitiveComplexity,
    hotspots,
  };
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

export interface LongFunction {
  name: string;
  startLine: number;
  endLine: number;
  length: number;
}

export function calculateLengthPenalty(ast: File): {
  penalty: number;
  longFunctions: LongFunction[];
} {
  const MAX_RECOMMENDED_LENGTH = 30;
  const longFunctions: LongFunction[] = [];

  traverse(ast, {
    'FunctionDeclaration|FunctionExpression|ArrowFunctionExpression'(path) {
      const startLine = path.node.loc?.start.line || 0;
      const endLine = path.node.loc?.end.line || 0;
      const functionLength = endLine - startLine + 1;

      let hasJSX = false;
      path.traverse({
        JSXElement() {
          hasJSX = true;
        },
        JSXFragment() {
          hasJSX = true;
        },
      });

      if (hasJSX) {
        return;
      }

      if (functionLength > MAX_RECOMMENDED_LENGTH) {
        const functionName =
          path.node.type === 'FunctionDeclaration' && path.node.id
            ? path.node.id.name
            : '익명 함수';

        longFunctions.push({
          name: functionName,
          startLine,
          endLine,
          length: functionLength,
        });
      }
    },
  });

  const maxPenalty = longFunctions.length > 0
    ? Math.max(...longFunctions.map(f => Math.floor((f.length - MAX_RECOMMENDED_LENGTH) / 10)))
    : 0;

  return {
    penalty: maxPenalty,
    longFunctions,
  };
}

export function calculateRefinedComplexityScore(ast: File): {
  ccs: number;
  cognitiveComplexity: number;
  lengthPenalty: number;
  maxNestingDepth: number;
  longFunctions: LongFunction[];
  complexityHotspots: ComplexityHotspot[];
} {
  const cognitiveResult = calculateCognitiveComplexity(ast);
  const lengthPenaltyResult = calculateLengthPenalty(ast);
  const maxNestingDepth = calculateMaxNestingDepth(ast);

  const ccs = 1.0 * cognitiveResult.complexity + 0.5 * lengthPenaltyResult.penalty;

  return {
    ccs,
    cognitiveComplexity: cognitiveResult.complexity,
    lengthPenalty: lengthPenaltyResult.penalty,
    maxNestingDepth,
    longFunctions: lengthPenaltyResult.longFunctions,
    complexityHotspots: cognitiveResult.hotspots,
  };
}
