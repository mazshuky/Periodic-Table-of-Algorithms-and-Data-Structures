import type { AlgoItem, Slot } from './types';

// Rough ascending Big-O rank, starting from O(1). Used purely for layout order.
const COMPLEXITY_RANK: Record<string, number> = {
  Arr: 0, Stk: 0, Que: 0, Dql: 0, Has: 0, Lru: 0, Fhp: 0,
  Ipl: 1,
  Bin: 2, Ext: 2, Bst: 2, Avl: 2, Rbt: 2, Bpt: 2, Sgt: 2, Fwt: 2, Bhp: 2,
  Jmp: 3,
  Lin: 4, Bfs: 4, Dfs: 4, Tpo: 4, Tar: 4, 'A*': 4, Trc: 4, Fib: 4, Lkl: 4, Blf: 4, Kmp: 4, Rbk: 4, Cnt: 4,
  Mrg: 5, Qck: 5, Heq: 5, Tim: 5, Dij: 5, Krk: 5, Prm: 5, Lis: 5, Huf: 5, Act: 5, Job: 5, Cls: 5, Sfx: 5, Rdx: 5,
  Shl: 6, Kar: 6,
  Bub: 7, Sel: 7, Ins: 7, Bfd: 7, Knp: 7, Lcs: 7, Edt: 7, Cch: 7,
  Fwl: 8, Mcm: 8,
  Nqn: 9, Sud: 9,
};

export function sortByComplexity(items: AlgoItem[]): AlgoItem[] {
  return [...items].sort((a, b) => {
    const ra = COMPLEXITY_RANK[a.sym] ?? 99;
    const rb = COMPLEXITY_RANK[b.sym] ?? 99;
    return ra - rb;
  });
}

// Periodic-table shape: narrow top rows, full 18-wide middle rows,
// then a detached two-row block (like lanthanides/actinides) at the bottom.
export function buildSlots(): Slot[] {
  const pattern: number[][] = [];
  pattern.push([1, 18]); // row 1
  pattern.push([1, 2, 13, 14, 15, 16, 17, 18]); // row 2
  pattern.push([1, 2, 13, 14, 15, 16, 17, 18]); // row 3
  for (let i = 0; i < 4; i++) {
    pattern.push([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18]); // rows 4-7
  }
  pattern.push(Array.from({ length: 14 }, (_, i) => i + 3)); // detached row A
  pattern.push(Array.from({ length: 14 }, (_, i) => i + 3)); // detached row B

  const slots: Slot[] = [];
  pattern.forEach((cols, rowIdx) => {
    const rowNum = rowIdx + 1;
    // leave a visual gap row before the detached block, like the real table
    const gridRow = rowIdx >= 7 ? rowNum + 1 : rowNum;
    cols.forEach((col) => slots.push({ row: gridRow, col }));
  });
  return slots;
}
