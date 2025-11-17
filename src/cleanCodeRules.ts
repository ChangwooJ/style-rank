import traverse, { NodePath } from '@babel/traverse';
import type { File, BinaryExpression, FunctionDeclaration, FunctionExpression, ArrowFunctionExpression, NumericLiteral } from '@babel/types';

export interface CleanCodeViolation {
  rule: string;
  message: string;
  line?: number;
}

export interface CleanCodeResult {
  violations: CleanCodeViolation[];
  violationCount: number;
}

export function checkCleanCodeRules(ast: File): CleanCodeResult {
  const violations: CleanCodeViolation[] = [];

  traverse(ast, {
    BinaryExpression(path: NodePath<BinaryExpression>) {
      if (path.node.operator === '==' || path.node.operator === '!=') {
        violations.push({
          rule: 'no-loose-equality',
          message: `'${path.node.operator}' 대신 '${path.node.operator === '==' ? '===' : '!=='}'를 사용하세요`,
          line: path.node.loc?.start.line,
        });
      }
    },
  });

  traverse(ast, {
    FunctionDeclaration(path) {
      checkParameterFlag(path);
    },
    FunctionExpression(path) {
      checkParameterFlag(path);
    },
    ArrowFunctionExpression(path) {
      checkParameterFlag(path);
    },
  });

  function checkParameterFlag(
    path: NodePath<FunctionDeclaration | FunctionExpression | ArrowFunctionExpression>
  ) {
    const params = path.node.params;
    const paramNames = new Set<string>();

    params.forEach((param) => {
      if (param.type === 'Identifier') {
        paramNames.add(param.name);
      }
    });

    path.traverse({
      IfStatement(ifPath) {
        if (ifPath.node.test.type === 'Identifier' && paramNames.has(ifPath.node.test.name)) {
          violations.push({
            rule: 'no-parameter-flag',
            message: `파라미터 '${ifPath.node.test.name}'를 조건문 플래그로 직접 사용하지 마세요`,
            line: ifPath.node.loc?.start.line,
          });
        }
      },
    });
  }

  const ALLOWED_NUMBERS = new Set([0, 1, -1]);
  traverse(ast, {
    NumericLiteral(path: NodePath<NumericLiteral>) {
      const value = path.node.value;

      if (ALLOWED_NUMBERS.has(value)) {
        return;
      }

      const parent = path.parent;
      if (
        parent.type === 'MemberExpression' ||
        parent.type === 'ObjectProperty' ||
        parent.type === 'ArrayExpression'
      ) {
        return;
      }

      violations.push({
        rule: 'no-magic-number',
        message: `매직 넘버 '${value}' 대신 상수를 사용하세요`,
        line: path.node.loc?.start.line,
      });
    },
  });

  const MAX_PARAMETERS = 5;
  traverse(ast, {
    FunctionDeclaration(path) {
      checkMaxParameters(path);
    },
    FunctionExpression(path) {
      checkMaxParameters(path);
    },
    ArrowFunctionExpression(path) {
      checkMaxParameters(path);
    },
  });

  function checkMaxParameters(
    path: NodePath<FunctionDeclaration | FunctionExpression | ArrowFunctionExpression>
  ) {
    const paramCount = path.node.params.length;

    if (paramCount > MAX_PARAMETERS) {
      const functionName =
        path.node.type === 'FunctionDeclaration' && path.node.id
          ? path.node.id.name
          : '익명 함수';

      violations.push({
        rule: 'max-parameters',
        message: `함수 '${functionName}'의 파라미터가 ${paramCount}개입니다 (최대 ${MAX_PARAMETERS}개)`,
        line: path.node.loc?.start.line,
      });
    }
  }

  return {
    violations,
    violationCount: violations.length,
  };
}

export function formatViolations(violations: CleanCodeViolation[]): string {
  if (violations.length === 0) {
    return '위반 사항 없음';
  }

  return violations
    .map((v, index) => {
      const lineInfo = v.line ? ` (Line ${v.line})` : '';
      return `${index + 1}. ${v.message}${lineInfo}`;
    })
    .join('\n');
}
