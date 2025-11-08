import { parse } from '@babel/parser';
import type { File } from '@babel/types';

export function parseCodeToAST(code: string): File {
  try {
    const ast = parse(code, {
      sourceType: 'module',
      plugins: ['jsx', 'typescript'],
    });
    return ast;
  } catch (error) {
    console.error('AST Error:', error);
    throw new Error('코드를 AST 객체로 파싱하는 데에 실패하였습니다.');
  }
}
