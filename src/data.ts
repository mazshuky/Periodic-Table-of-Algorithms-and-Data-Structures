import type { Category, AlgoItem } from './types';

export const CATEGORIES: Category[] = [
    { id: 'sort', label: 'Sorting Algorithm' },
    { id: 'search', label: 'Search Algorithm' },
    { id: 'graph', label: 'Graph Algorithm' },
    { id: 'tree', label: 'Tree Structure' },
    { id: 'dp', label: 'Dynamic Programming' },
    { id: 'greedy', label: 'Greedy Algorithm' },
    { id: 'lds', label: 'Linear Data Structure' },
    { id: 'hash', label: 'Hash-Based Structure' },
    { id: 'heap', label: 'Heap / Priority Queue' },
    { id: 'dac', label: 'Divide & Conquer' },
    { id: 'back', label: 'Backtracking' },
    { id: 'string', label: 'String Algorithm' },
];

export const ITEMS: AlgoItem[] = [
    // Sorting
    { sym: 'Bub', name: 'Bubble Sort', cat: 'sort', time: 'O(n\u00B2)', space: 'O(1)', best: 'O(n)', average: 'O(n\u00B2)', worst: 'O(n\u00B2)', desc: 'Repeatedly swaps adjacent out-of-order elements until the list is sorted.' },
    { sym: 'Sel', name: 'Selection Sort', cat: 'sort', time: 'O(n\u00B2)', space: 'O(1)', best: 'O(n\u00B2)', average: 'O(n\u00B2)', worst: 'O(n\u00B2)', desc: 'Repeatedly selects the minimum remaining element and moves it into place.' },
    { sym: 'Ins', name: 'Insertion Sort', cat: 'sort', time: 'O(n\u00B2)', space: 'O(1)', best: 'O(n)', average: 'O(n\u00B2)', worst: 'O(n\u00B2)', desc: 'Builds a sorted prefix by inserting each new element into its correct position.' },
    { sym: 'Shl', name: 'Shell Sort', cat: 'sort', time: 'O(n log\u00B2n)', space: 'O(1)', best: 'O(n log n)', average: 'O(n log\u00B2n)', worst: 'O(n\u00B2)', desc: 'Generalizes insertion sort by comparing elements at decreasing gaps.' },
    { sym: 'Mrg', name: 'Merge Sort', cat: 'sort', time: 'O(n log n)', space: 'O(n)', best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n log n)', desc: 'Recursively splits the list, sorts each half, then merges the sorted halves.' },
    { sym: 'Qck', name: 'Quick Sort', cat: 'sort', time: 'O(n log n)', space: 'O(log n)', best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n\u00B2)', desc: 'Partitions around a pivot and recursively sorts each side.' },
    { sym: 'Heq', name: 'Heap Sort', cat: 'sort', time: 'O(n log n)', space: 'O(1)', best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n log n)', desc: 'Builds a max-heap then repeatedly extracts the maximum into place.' },
    { sym: 'Cnt', name: 'Counting Sort', cat: 'sort', time: 'O(n+k)', space: 'O(k)', best: 'O(n+k)', average: 'O(n+k)', worst: 'O(n+k)', desc: 'Counts occurrences of each value to sort integers in a known range.' },
    { sym: 'Rdx', name: 'Radix Sort', cat: 'sort', time: 'O(nk)', space: 'O(n+k)', best: 'O(nk)', average: 'O(nk)', worst: 'O(nk)', desc: 'Sorts numbers digit by digit, from least to most significant.' },
    { sym: 'Tim', name: 'TimSort', cat: 'sort', time: 'O(n log n)', space: 'O(n)', best: 'O(n)', average: 'O(n log n)', worst: 'O(n log n)', desc: 'Hybrid of merge and insertion sort, used by Python and Java for general sorting.' },

    // Searching
    { sym: 'Lin', name: 'Linear Search', cat: 'search', time: 'O(n)', space: 'O(1)', best: 'O(1)', average: 'O(n)', worst: 'O(n)', desc: 'Checks each element in sequence until a match is found.' },
    { sym: 'Bin', name: 'Binary Search', cat: 'search', time: 'O(log n)', space: 'O(1)', best: 'O(1)', average: 'O(log n)', worst: 'O(log n)', desc: 'Repeatedly halves a sorted search range to find a target.' },
    { sym: 'Jmp', name: 'Jump Search', cat: 'search', time: 'O(\u221An)', space: 'O(1)', best: 'O(1)', average: 'O(\u221An)', worst: 'O(\u221An)', desc: 'Jumps ahead in fixed blocks, then scans linearly within the right block.' },
    { sym: 'Ipl', name: 'Interpolation Search', cat: 'search', time: 'O(log log n)', space: 'O(1)', best: 'O(1)', average: 'O(log log n)', worst: 'O(n)', desc: 'Estimates a likely position using value distribution before probing, for uniform data.' },
    { sym: 'Ext', name: 'Exponential Search', cat: 'search', time: 'O(log n)', space: 'O(1)', best: 'O(1)', average: 'O(log n)', worst: 'O(log n)', desc: 'Finds a range by doubling bounds, then binary searches within it.' },

    // Graph
    { sym: 'Bfs', name: 'Breadth-First Search', cat: 'graph', time: 'O(V+E)', space: 'O(V)', best: 'O(1)', average: 'O(V+E)', worst: 'O(V+E)', desc: 'Explores a graph level by level using a queue.' },
    { sym: 'Dfs', name: 'Depth-First Search', cat: 'graph', time: 'O(V+E)', space: 'O(V)', best: 'O(1)', average: 'O(V+E)', worst: 'O(V+E)', desc: 'Explores as far as possible along each branch before backtracking.' },
    { sym: 'Dij', name: 'Dijkstra\u2019s', cat: 'graph', time: 'O(E log V)', space: 'O(V)', best: 'O(E log V)', average: 'O(E log V)', worst: 'O(E log V)', desc: 'Finds shortest paths from a source in graphs with non-negative weights.' },
    { sym: 'Bfd', name: 'Bellman-Ford', cat: 'graph', time: 'O(VE)', space: 'O(V)', best: 'O(E)', average: 'O(VE)', worst: 'O(VE)', desc: 'Finds shortest paths and detects negative cycles, handles negative weights.' },
    { sym: 'Fwl', name: 'Floyd-Warshall', cat: 'graph', time: 'O(V\u00B3)', space: 'O(V\u00B2)', best: 'O(V\u00B3)', average: 'O(V\u00B3)', worst: 'O(V\u00B3)', desc: 'Computes shortest paths between all pairs of vertices.' },
    { sym: 'Krk', name: 'Kruskal\u2019s', cat: 'graph', time: 'O(E log E)', space: 'O(V)', best: 'O(E log E)', average: 'O(E log E)', worst: 'O(E log E)', desc: 'Builds a minimum spanning tree by adding the cheapest edges that avoid cycles.' },
    { sym: 'Prm', name: 'Prim\u2019s', cat: 'graph', time: 'O(E log V)', space: 'O(V)', best: 'O(E log V)', average: 'O(E log V)', worst: 'O(E log V)', desc: 'Grows a minimum spanning tree one vertex at a time from a start node.' },
    { sym: 'Tpo', name: 'Topological Sort', cat: 'graph', time: 'O(V+E)', space: 'O(V)', best: 'O(V+E)', average: 'O(V+E)', worst: 'O(V+E)', desc: 'Orders nodes of a DAG so every edge points forward.' },
    { sym: 'Tar', name: 'Tarjan\u2019s SCC', cat: 'graph', time: 'O(V+E)', space: 'O(V)', best: 'O(V+E)', average: 'O(V+E)', worst: 'O(V+E)', desc: 'Finds strongly connected components in a single DFS pass.' },
    { sym: 'A*', name: 'A* Search', cat: 'graph', time: 'O(E)', space: 'O(V)', best: 'O(1)', average: 'O(E)', worst: 'O(V\u00B2)', desc: 'Pathfinding that combines actual cost with a heuristic estimate to the goal.' },

    // Trees
    { sym: 'Bst', name: 'Binary Search Tree', cat: 'tree', time: 'O(log n)*', space: 'O(n)', best: 'O(log n)', average: 'O(log n)', worst: 'O(n)', desc: 'Keeps left children smaller and right children larger for fast lookup.' },
    { sym: 'Avl', name: 'AVL Tree', cat: 'tree', time: 'O(log n)', space: 'O(n)', best: 'O(log n)', average: 'O(log n)', worst: 'O(log n)', desc: 'Self-balancing BST that rotates to keep subtree heights close.' },
    { sym: 'Rbt', name: 'Red-Black Tree', cat: 'tree', time: 'O(log n)', space: 'O(n)', best: 'O(log n)', average: 'O(log n)', worst: 'O(log n)', desc: 'Self-balancing BST using color rules to bound tree height.' },
    { sym: 'Bpt', name: 'B-Tree', cat: 'tree', time: 'O(log n)', space: 'O(n)', best: 'O(log n)', average: 'O(log n)', worst: 'O(log n)', desc: 'Balanced multi-way tree optimized for disk and database storage.' },
    { sym: 'Trc', name: 'Trie', cat: 'tree', time: 'O(L)', space: 'O(n\u00B7L)', best: 'O(1)', average: 'O(L)', worst: 'O(L)', desc: 'Tree of characters used for fast prefix lookup, as in autocomplete.' },
    { sym: 'Sgt', name: 'Segment Tree', cat: 'tree', time: 'O(log n)', space: 'O(n)', best: 'O(1)', average: 'O(log n)', worst: 'O(log n)', desc: 'Answers range queries (sum, min, max) and supports range updates.' },
    { sym: 'Fwt', name: 'Fenwick Tree', cat: 'tree', time: 'O(log n)', space: 'O(n)', best: 'O(1)', average: 'O(log n)', worst: 'O(log n)', desc: 'Compact structure for prefix sums with point updates, also called a BIT.' },

    // DP
    { sym: 'Fib', name: 'Fibonacci (memo)', cat: 'dp', time: 'O(n)', space: 'O(n)', best: 'O(n)', average: 'O(n)', worst: 'O(n)', desc: 'Caches subproblem results to avoid recomputing overlapping calls.' },
    { sym: 'Knp', name: '0/1 Knapsack', cat: 'dp', time: 'O(nW)', space: 'O(nW)', best: 'O(nW)', average: 'O(nW)', worst: 'O(nW)', desc: 'Chooses items under a weight limit to maximize value, no fractional picks.' },
    { sym: 'Lcs', name: 'Longest Common Subsequence', cat: 'dp', time: 'O(mn)', space: 'O(mn)', best: 'O(mn)', average: 'O(mn)', worst: 'O(mn)', desc: 'Finds the longest subsequence shared by two sequences.' },
    { sym: 'Lis', name: 'Longest Increasing Subsequence', cat: 'dp', time: 'O(n log n)', space: 'O(n)', best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n log n)', desc: 'Finds the longest strictly increasing subsequence of a sequence.' },
    { sym: 'Edt', name: 'Edit Distance', cat: 'dp', time: 'O(mn)', space: 'O(mn)', best: 'O(mn)', average: 'O(mn)', worst: 'O(mn)', desc: 'Minimum insertions, deletions, and substitutions to turn one string into another.' },
    { sym: 'Mcm', name: 'Matrix Chain Mult.', cat: 'dp', time: 'O(n\u00B3)', space: 'O(n\u00B2)', best: 'O(n\u00B3)', average: 'O(n\u00B3)', worst: 'O(n\u00B3)', desc: 'Finds the cheapest order to multiply a chain of matrices.' },
    { sym: 'Cch', name: 'Coin Change', cat: 'dp', time: 'O(n\u00B7amt)', space: 'O(amt)', best: 'O(n\u00B7amt)', average: 'O(n\u00B7amt)', worst: 'O(n\u00B7amt)', desc: 'Finds the minimum number of coins that sum to a target amount.' },

    // Greedy
    { sym: 'Huf', name: 'Huffman Coding', cat: 'greedy', time: 'O(n log n)', space: 'O(n)', best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n log n)', desc: 'Builds an optimal prefix code by repeatedly merging the lowest-frequency nodes.' },
    { sym: 'Act', name: 'Activity Selection', cat: 'greedy', time: 'O(n log n)', space: 'O(n)', best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n log n)', desc: 'Picks the maximum set of non-overlapping intervals by earliest finish time.' },
    { sym: 'Job', name: 'Job Scheduling', cat: 'greedy', time: 'O(n log n)', space: 'O(n)', best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n log n)', desc: 'Orders jobs by deadline or profit to maximize scheduled value.' },

    // Linear DS
    { sym: 'Arr', name: 'Array', cat: 'lds', time: 'O(1) access', space: 'O(n)', best: 'O(1)', average: 'O(1) access / O(n) search', worst: 'O(n)', desc: 'Fixed-size contiguous block offering constant-time indexed access.' },
    { sym: 'Lkl', name: 'Linked List', cat: 'lds', time: 'O(n) access', space: 'O(n)', best: 'O(1)', average: 'O(n)', worst: 'O(n)', desc: 'Chain of nodes linked by pointers, with cheap insertion and removal.' },
    { sym: 'Stk', name: 'Stack', cat: 'lds', time: 'O(1) push/pop', space: 'O(n)', best: 'O(1)', average: 'O(1)', worst: 'O(1)', desc: 'Last-in-first-out structure used for undo, recursion, and parsing.' },
    { sym: 'Que', name: 'Queue', cat: 'lds', time: 'O(1) enqueue/dequeue', space: 'O(n)', best: 'O(1)', average: 'O(1)', worst: 'O(1)', desc: 'First-in-first-out structure used for scheduling and BFS.' },
    { sym: 'Dql', name: 'Deque', cat: 'lds', time: 'O(1) both ends', space: 'O(n)', best: 'O(1)', average: 'O(1)', worst: 'O(1)', desc: 'Double-ended queue allowing fast insertion and removal at both ends.' },

    // Hash
    { sym: 'Has', name: 'Hash Table', cat: 'hash', time: 'O(1)*', space: 'O(n)', best: 'O(1)', average: 'O(1)', worst: 'O(n)', desc: 'Maps keys to buckets via a hash function for near-constant lookup.' },
    { sym: 'Blf', name: 'Bloom Filter', cat: 'hash', time: 'O(k)', space: 'O(m)', best: 'O(k)', average: 'O(k)', worst: 'O(k)', desc: 'Probabilistic structure that tests set membership with no false negatives.' },
    { sym: 'Lru', name: 'LRU Cache', cat: 'hash', time: 'O(1)', space: 'O(n)', best: 'O(1)', average: 'O(1)', worst: 'O(1)', desc: 'Hash map plus linked list that evicts the least recently used entry.' },

    // Heap
    { sym: 'Bhp', name: 'Binary Heap', cat: 'heap', time: 'O(log n)', space: 'O(n)', best: 'O(1)', average: 'O(log n)', worst: 'O(log n)', desc: 'Array-backed tree giving fast access to the min or max element.' },
    { sym: 'Fhp', name: 'Fibonacci Heap', cat: 'heap', time: 'O(1) amortized', space: 'O(n)', best: 'O(1)', average: 'O(1) amortized', worst: 'O(log n)', desc: 'Heap variant with very fast amortized decrease-key, used in advanced Dijkstra.' },

    // Divide & Conquer
    { sym: 'Kar', name: 'Karatsuba Mult.', cat: 'dac', time: 'O(n^1.58)', space: 'O(n)', best: 'O(n^1.58)', average: 'O(n^1.58)', worst: 'O(n^1.58)', desc: 'Multiplies large numbers faster than the grade-school method via recursion.' },
    { sym: 'Cls', name: 'Closest Pair of Points', cat: 'dac', time: 'O(n log n)', space: 'O(n)', best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n log n)', desc: 'Finds the nearest two points by recursively dividing the plane.' },

    // Backtracking
    { sym: 'Nqn', name: 'N-Queens', cat: 'back', time: 'O(n!)', space: 'O(n)', best: 'O(n!)', average: 'O(n!)', worst: 'O(n!)', desc: 'Places n queens on a board with none attacking another, via trial and backtrack.' },
    { sym: 'Sud', name: 'Sudoku Solver', cat: 'back', time: 'O(9^m)', space: 'O(1)', best: 'O(1)', average: 'O(9^m)', worst: 'O(9^m)', desc: 'Fills a grid by trying digits and backtracking on contradictions.' },

    // String
    { sym: 'Kmp', name: 'Knuth-Morris-Pratt', cat: 'string', time: 'O(n+m)', space: 'O(m)', best: 'O(n)', average: 'O(n+m)', worst: 'O(n+m)', desc: 'Finds a pattern in text in linear time using a precomputed prefix table.' },
    { sym: 'Rbk', name: 'Rabin-Karp', cat: 'string', time: 'O(n+m)', space: 'O(1)', best: 'O(n+m)', average: 'O(n+m)', worst: 'O(nm)', desc: 'Finds a pattern using rolling hashes for fast candidate matching.' },
    { sym: 'Sfx', name: 'Suffix Array', cat: 'string', time: 'O(n log n)', space: 'O(n)', best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n log n)', desc: 'Sorted array of all suffixes, enabling fast substring queries.' },
];