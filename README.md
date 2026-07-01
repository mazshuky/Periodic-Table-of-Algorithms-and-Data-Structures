# Periodic Table of Algorithms & Data Structures

An interactive periodic-table-style reference for 59 common algorithms and data
structures, built with **Vite + TypeScript** (no framework). Tiles are arranged
left-to-right, top-to-bottom in the classic 18-column periodic-table shape,
ordered by ascending time complexity starting from O(1).

Click any tile to open a detail modal with time/space complexity, a one-line
description, and an **animated step-by-step visualizer** specific to that
algorithm or structure.

![Screenshot 2026-07-01 141036.jpg](assets/Screenshot%202026-07-01%20141036.jpg)

🔗 **Live demo:** [HERE](https://mazshuky.github.io/Periodic-Table-of-Algorithms-and-Data-Structures/)

---

## Features

- **59 tiles** across 12 categories: Sorting, Searching, Graph, Tree, Dynamic
  Programming, Greedy, Linear Data Structures, Hash & Heap, Divide & Conquer,
  Backtracking, and String algorithms
- **Animated visualizers** for every tile whereby each category gets a visualization
  shape that fits the algorithm:
    - Sorting → animated bar chart (10 algorithms)
    - Searching → bar chart with active range dimming (5 algorithms)
    - Graph → animated SVG node/edge traversal (8 algorithms)
    - Floyd-Warshall → animated distance matrix
    - Tarjan's SCC → directed graph with cycle coloring
    - Trees → node-link SVG tree built insertion by insertion (BST, AVL, Red-Black,
      B-Tree, Trie, Segment Tree); Fenwick Tree shown as bar array with index hops
    - Dynamic Programming → animated table-filling grid (7 algorithms)
    - Greedy → Huffman: forest-merging SVG; Activity Selection: interval timeline;
      Job Scheduling: Gantt-style slot assignment
    - Linear Data Structures → box-row animation showing push/pop/enqueue/dequeue
    - Hash & Heap → Hash Table: bucket chain; Bloom Filter: bit array; LRU Cache:
      linked list with eviction; Binary Heap: SVG tree with heapify; Fibonacci Heap:
      forest of trees
    - Divide & Conquer → Karatsuba: indented call stack; Closest Pair: scatter plot
      with divide line
    - Backtracking → N-Queens: chess board with backtrack highlighting; Sudoku:
      9×9 grid filled step by step
    - String → KMP: text + sliding pattern with failure table; Rabin-Karp: sliding
      window with rolling hash; Suffix Array: animated lexicographic sort
- **Light / dark theme** toggle, respects OS preference, persists in `localStorage`
- Complexity ordering: tiles fill the periodic-table shape from O(1) at top-left
  to O(n!) at bottom-right

---

## Run locally

```bash
npm install
npm run dev
```

Then open the printed local URL (usually http://localhost:5173).

---

## Project structure
```
index.html                          entry HTML — modal markup and viz section containers
vite.config.ts                      Vite config (base path for GitHub Pages)
src/
  main.ts                           renders the table, wires all visualizer players
  data.ts                           all 59 algorithm/data-structure entries
  layout.ts                         complexity ranking + periodic-table grid slot builder
  types.ts                          shared TypeScript interfaces
  style.css                         all styling, light + dark theme variables
  visualizer/
    sortVisualizer.ts               step generators + SortPlayer (bar chart)
    searchVisualizer.ts             step generators + SearchPlayer (bar chart, range dimming)
    graphVisualizer.ts              step generators + GraphPlayer (SVG node/edge)
    matrixVisualizer.ts             FloydWarshall MatrixPlayer + Tarjan TarjanPlayer
    treeVisualizer.ts               BST/AVL/RBT/Trie/SegTree/BTree TreePlayer + FenwickPlayer
    dpVisualizer.ts                 7 DP step generators + DPPlayer (table grid)
    greedyVisualizer.ts             HuffmanPlayer + ActivityPlayer + JobSchedulingPlayer
    linearVisualizer.ts             Array/LinkedList/Stack/Queue/Deque + LinearPlayer
    hashHeapVisualizer.ts           HashTable/BloomFilter/LRU/BinaryHeap/FibHeap players
    divBackStringVisualizer.ts      Karatsuba/ClosestPair/NQueens/Sudoku/KMP/RabinKarp/SuffixArray
```

---

## License
MIT — see [LICENSE](LICENSE).
