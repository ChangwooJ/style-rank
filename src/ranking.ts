export type Rank = 'S' | 'A' | 'B' | 'C' | 'D' | 'F';

export function assignRank(complexity: number): Rank {
  if (complexity <= 5) {
    return 'S';
  } else if (complexity <= 10) {
    return 'A';
  } else if (complexity <= 15) {
    return 'B';
  } else if (complexity <= 20) {
    return 'C';
  } else if (complexity <= 30) {
    return 'D';
  } else {
    return 'F';
  }
}

export function assignRefinedRank(ccs: number, violationCount: number): Rank {
  const violationPenalty = violationCount * 5;
  const finalScore = ccs + violationPenalty;

  if (finalScore <= 5 && violationCount === 0) {
    return 'S';
  } else if (finalScore <= 10 && violationCount <= 1) {
    return 'A';
  } else if (finalScore <= 20 && violationCount <= 3) {
    return 'B';
  } else if (finalScore <= 30 && violationCount <= 5) {
    return 'C';
  } else if (finalScore <= 40 || violationCount <= 8) {
    return 'D';
  } else {
    return 'F';
  }
}

export function getRankDescription(rank: Rank): string {
  const descriptions: Record<Rank, string> = {
    S: '완벽 - 클린하고 이해하기 쉬운 코드',
    A: '우수 - 가독성과 유지보수성이 높은 코드',
    B: '양호 - 약간의 개선 여지가 있는 코드',
    C: '주의 - 복잡도 또는 코드 스타일 개선 필요',
    D: '나쁨 - 즉시 리팩토링 권장',
    F: '위험 - 긴급 리팩토링 필수',
  };

  return descriptions[rank];
}
