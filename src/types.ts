export type CategoryId =
  | 'sort' | 'search' | 'graph' | 'tree' | 'dp' | 'greedy'
  | 'lds' | 'hash' | 'heap' | 'dac' | 'back' | 'string';

export interface Category {
  id: CategoryId;
  label: string;
}

export interface AlgoItem {
  sym: string;
  name: string;
  cat: CategoryId;
  time: string;
  space: string;
  desc: string;
}

export interface Slot {
  row: number;
  col: number;
}
