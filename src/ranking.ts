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

export function getRankDescription(rank: Rank): string {
  const descriptions: Record<Rank, string> = {
    S: '매우 우수 - 단순하고 이해하기 쉬운 코드',
    A: '우수 - 적절한 복잡도',
    B: '보통 - 약간 복잡, 리팩토링 고려',
    C: '주의 - 복잡함, 리팩토링 권장',
    D: '나쁨 - 매우 복잡, 즉시 리팩토링 필요',
    F: '위험 - 유지보수 불가능 수준',
  };

  return descriptions[rank];
}
