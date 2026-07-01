// ---------- Hash Table ----------

export interface HashStep {
    buckets: (HashEntry | null)[][];
    activeKey?: string;
    activeBucket?: number;
    caption: string;
}

export interface HashEntry { key: string; value: number; }

function simpleHash(key: string, size: number): number {
    let h = 0;
    for (const c of key) h = (h * 31 + c.charCodeAt(0)) % size;
    return h;
}

export function hashTableSteps(): HashStep[] {
    const SIZE = 8;
    const buckets: (HashEntry | null)[][] = Array.from({ length: SIZE }, () => []);
    const steps: HashStep[] = [];
    const entries: [string, number][] = [
        ['cat', 1], ['dog', 2], ['rat', 3], ['bat', 4], ['ant', 5], ['cow', 6],
    ];

    steps.push({ buckets: buckets.map((b) => [...b]), caption: `Hash table with ${SIZE} buckets, using chaining for collisions` });

    for (const [key, value] of entries) {
        const bucket = simpleHash(key, SIZE);
        steps.push({ buckets: buckets.map((b) => [...b]), activeKey: key, activeBucket: bucket, caption: `Insert "${key}": hash("${key}") = ${bucket}` });
        buckets[bucket].push({ key, value });
        steps.push({ buckets: buckets.map((b) => [...b]), activeKey: key, activeBucket: bucket, caption: `"${key}" placed in bucket ${bucket}${buckets[bucket].length > 1 ? ' (collision — chained)' : ''}` });
    }

    // Lookup
    const lookupKey = 'rat';
    const bucket = simpleHash(lookupKey, SIZE);
    steps.push({ buckets: buckets.map((b) => [...b]), activeKey: lookupKey, activeBucket: bucket, caption: `Lookup "${lookupKey}": hash = ${bucket}, scan chain in bucket ${bucket}` });
    steps.push({ buckets: buckets.map((b) => [...b]), activeKey: lookupKey, activeBucket: bucket, caption: `Found "${lookupKey}" → value ${buckets[bucket].find((e) => e?.key === lookupKey)?.value}. O(1) average` });

    return steps;
}

export class HashTablePlayer {
    private steps: HashStep[] = [];
    private idx = 0;
    private timer: number | null = null;
    private speedMs = 900;

    constructor(
        private container: HTMLElement,
        private captionEl: HTMLElement,
        private onStepChange?: (idx: number, total: number) => void,
    ) {}

    load(steps: HashStep[]): void { this.pause(); this.steps = steps; this.idx = 0; this.render(); }
    play(): void {
        if (this.timer !== null) return;
        this.timer = window.setInterval(() => {
            if (this.idx >= this.steps.length - 1) { this.pause(); return; }
            this.idx++; this.render();
        }, this.speedMs);
    }
    pause(): void { if (this.timer !== null) { window.clearInterval(this.timer); this.timer = null; } }
    restart(): void { this.pause(); this.idx = 0; this.render(); this.play(); }

    private render(): void {
        const step = this.steps[this.idx];
        if (!step) return;
        this.container.innerHTML = '';

        step.buckets.forEach((chain, i) => {
            const row = document.createElement('div');
            row.style.cssText = 'display:flex; align-items:center; gap:6px; margin-bottom:5px;';

            const idxBox = document.createElement('div');
            const isActive = i === step.activeBucket;
            idxBox.style.cssText = `width:22px; font-size:10px; color:${isActive ? 'var(--hash)' : 'var(--muted)'}; text-align:right; flex:none; font-weight:${isActive ? '700' : '400'};`;
            idxBox.textContent = String(i);
            row.appendChild(idxBox);

            const bucket = document.createElement('div');
            bucket.style.cssText = `min-width:36px; height:28px; border-radius:4px; border:1.5px solid ${isActive ? 'var(--hash)' : 'var(--grid-line)'}; background:${isActive ? 'var(--hash-dim)' : 'var(--panel)'}; display:flex; align-items:center; justify-content:center; font-size:9px; color:var(--muted); flex:none;`;
            bucket.textContent = chain.length === 0 ? '—' : '';
            row.appendChild(bucket);

            chain.forEach((entry) => {
                const arrow = document.createElement('div');
                arrow.style.cssText = 'font-size:10px; color:var(--muted);';
                arrow.textContent = '→';
                row.appendChild(arrow);

                const entryBox = document.createElement('div');
                const isEntry = entry?.key === step.activeKey;
                entryBox.style.cssText = `padding:4px 8px; border-radius:4px; border:1.5px solid ${isEntry ? 'var(--greedy)' : 'var(--hash)'}; background:${isEntry ? 'var(--greedy-dim)' : 'var(--hash-dim)'}; font-size:10px; font-weight:700; color:var(--text); white-space:nowrap;`;
                entryBox.textContent = `${entry?.key}: ${entry?.value}`;
                row.appendChild(entryBox);
            });

            this.container.appendChild(row);
        });

        this.captionEl.textContent = step.caption;
        this.onStepChange?.(this.idx, this.steps.length - 1);
    }
}

// ---------- Bloom Filter ----------

export interface BloomStep {
    bits: number[];          // bit array (0 or 1)
    activeIndices: number[]; // currently being set/checked
    caption: string;
    result?: 'maybe' | 'definitely-not';
}

function bloomHashes(key: string, size: number): number[] {
    const h1 = simpleHash(key, size);
    const h2 = simpleHash(key + 'salt1', size);
    const h3 = simpleHash(key + 'salt2', size);
    return [...new Set([h1, h2, h3])];
}

export function bloomFilterSteps(): BloomStep[] {
    const SIZE = 16;
    const bits = new Array(SIZE).fill(0);
    const steps: BloomStep[] = [];
    const items = ['apple', 'banana', 'cherry'];

    steps.push({ bits: [...bits], activeIndices: [], caption: `Bloom filter: ${SIZE}-bit array, 3 hash functions, probabilistic membership test` });

    for (const item of items) {
        const indices = bloomHashes(item, SIZE);
        steps.push({ bits: [...bits], activeIndices: indices, caption: `Insert "${item}": compute 3 hashes → positions [${indices.join(', ')}]` });
        indices.forEach((i) => { bits[i] = 1; });
        steps.push({ bits: [...bits], activeIndices: indices, caption: `Set bits [${indices.join(', ')}] to 1 for "${item}"` });
    }

    // Positive query (probably in set)
    const qPos = 'banana';
    const posIdx = bloomHashes(qPos, SIZE);
    steps.push({ bits: [...bits], activeIndices: posIdx, caption: `Query "${qPos}": check positions [${posIdx.join(', ')}]` });
    const allSet = posIdx.every((i) => bits[i] === 1);
    steps.push({ bits: [...bits], activeIndices: posIdx, result: allSet ? 'maybe' : 'definitely-not', caption: `All bits set → "${qPos}" is PROBABLY in the set (no false negatives, but false positives possible)` });

    // Negative query (definitely not in set)
    const qNeg = 'mango';
    const negIdx = bloomHashes(qNeg, SIZE);
    steps.push({ bits: [...bits], activeIndices: negIdx, caption: `Query "${qNeg}": check positions [${negIdx.join(', ')}]` });
    const negAllSet = negIdx.every((i) => bits[i] === 1);
    steps.push({ bits: [...bits], activeIndices: negIdx, result: negAllSet ? 'maybe' : 'definitely-not', caption: `A bit is 0 → "${qNeg}" is DEFINITELY NOT in the set` });

    return steps;
}

export class BloomFilterPlayer {
    private steps: BloomStep[] = [];
    private idx = 0;
    private timer: number | null = null;
    private speedMs = 900;

    constructor(
        private container: HTMLElement,
        private captionEl: HTMLElement,
        private onStepChange?: (idx: number, total: number) => void,
    ) {}

    load(steps: BloomStep[]): void { this.pause(); this.steps = steps; this.idx = 0; this.render(); }
    play(): void {
        if (this.timer !== null) return;
        this.timer = window.setInterval(() => {
            if (this.idx >= this.steps.length - 1) { this.pause(); return; }
            this.idx++; this.render();
        }, this.speedMs);
    }
    pause(): void { if (this.timer !== null) { window.clearInterval(this.timer); this.timer = null; } }
    restart(): void { this.pause(); this.idx = 0; this.render(); this.play(); }

    private render(): void {
        const step = this.steps[this.idx];
        if (!step) return;
        this.container.innerHTML = '';

        // Bit array
        const bitRow = document.createElement('div');
        bitRow.style.cssText = 'display:flex; gap:3px; flex-wrap:wrap; margin-bottom:8px;';
        step.bits.forEach((bit, i) => {
            const isActive = step.activeIndices.includes(i);
            const box = document.createElement('div');
            box.style.cssText = `width:24px; height:28px; border-radius:3px; border:1.5px solid ${isActive ? 'var(--greedy)' : bit ? 'var(--hash)' : 'var(--grid-line)'}; background:${isActive ? 'var(--greedy-dim)' : bit ? 'var(--hash-dim)' : 'var(--panel)'}; display:flex; flex-direction:column; align-items:center; justify-content:center; font-size:10px; font-weight:700; color:${bit || isActive ? 'var(--text)' : 'var(--muted)'};`;
            box.textContent = String(bit);
            bitRow.appendChild(box);
        });
        this.container.appendChild(bitRow);

        // Index labels
        const idxRow = document.createElement('div');
        idxRow.style.cssText = 'display:flex; gap:3px; flex-wrap:wrap; margin-bottom:8px;';
        step.bits.forEach((_, i) => {
            const lbl = document.createElement('div');
            lbl.style.cssText = `width:24px; font-size:7px; color:var(--muted); text-align:center;`;
            lbl.textContent = String(i);
            idxRow.appendChild(lbl);
        });
        this.container.appendChild(idxRow);

        if (step.result) {
            const res = document.createElement('div');
            res.style.cssText = `padding:6px 12px; border-radius:6px; font-size:11px; font-weight:700; display:inline-block; background:${step.result === 'maybe' ? 'var(--greedy-dim)' : 'var(--search-dim)'}; color:${step.result === 'maybe' ? 'var(--greedy)' : 'var(--search)'};`;
            res.textContent = step.result === 'maybe' ? 'Result: PROBABLY IN SET' : 'Result: DEFINITELY NOT IN SET';
            this.container.appendChild(res);
        }

        this.captionEl.textContent = step.caption;
        this.onStepChange?.(this.idx, this.steps.length - 1);
    }
}

// ---------- LRU Cache ----------

export interface LRUStep {
    list: LRUEntry[];   // front = MRU, back = LRU
    map: string[];      // keys currently in cache
    activeKey?: string;
    evicted?: string;
    caption: string;
}

export interface LRUEntry { key: string; value: number; }

export function lruCacheSteps(capacity = 3): LRUStep[] {
    const list: LRUEntry[] = [];
    const map = new Map<string, number>();
    const steps: LRUStep[] = [];
    const ops: ['get' | 'put', string, number?][] = [
        ['put', 'A', 1], ['put', 'B', 2], ['put', 'C', 3],
        ['get', 'A'], ['put', 'D', 4], ['get', 'B'], ['put', 'E', 5],
    ];

    const snap = (activeKey?: string, evicted?: string, caption = ''): LRUStep => ({
        list: list.map((e) => ({ ...e })),
        map: [...map.keys()],
        activeKey, evicted, caption,
    });

    steps.push(snap(undefined, undefined, `LRU Cache — capacity ${capacity}: hash map for O(1) lookup + doubly linked list for O(1) eviction of least recently used`));

    for (const [op, key, value] of ops) {
        if (op === 'put' && value !== undefined) {
            if (map.has(key)) {
                list.splice(list.findIndex((e) => e.key === key), 1);
            }
            let evicted: string | undefined;
            if (!map.has(key) && list.length >= capacity) {
                const lru = list[list.length - 1];
                evicted = lru.key;
                map.delete(lru.key);
                list.pop();
            }
            list.unshift({ key, value });
            map.set(key, value);
            steps.push(snap(key, evicted, evicted ? `Put (${key},${value}): cache full → evict LRU "${evicted}", insert "${key}" at front` : `Put (${key},${value}): insert at front (MRU position)`));
        } else if (op === 'get') {
            if (map.has(key)) {
                const idx = list.findIndex((e) => e.key === key);
                const entry = list.splice(idx, 1)[0];
                list.unshift(entry);
                steps.push(snap(key, undefined, `Get "${key}": found (value ${entry.value}), move to front as most recently used`));
            } else {
                steps.push(snap(key, undefined, `Get "${key}": MISS — not in cache`));
            }
        }
    }

    return steps;
}

export class LRUCachePlayer {
    private steps: LRUStep[] = [];
    private idx = 0;
    private timer: number | null = null;
    private speedMs = 900;

    constructor(
        private container: HTMLElement,
        private captionEl: HTMLElement,
        private onStepChange?: (idx: number, total: number) => void,
    ) {}

    load(steps: LRUStep[]): void { this.pause(); this.steps = steps; this.idx = 0; this.render(); }
    play(): void {
        if (this.timer !== null) return;
        this.timer = window.setInterval(() => {
            if (this.idx >= this.steps.length - 1) { this.pause(); return; }
            this.idx++; this.render();
        }, this.speedMs);
    }
    pause(): void { if (this.timer !== null) { window.clearInterval(this.timer); this.timer = null; } }
    restart(): void { this.pause(); this.idx = 0; this.render(); this.play(); }

    private render(): void {
        const step = this.steps[this.idx];
        if (!step) return;
        this.container.innerHTML = '';

        const lbl = document.createElement('div');
        lbl.style.cssText = 'font-size:10px; color:var(--muted); margin-bottom:6px;';
        lbl.textContent = 'MRU (front) → LRU (back):';
        this.container.appendChild(lbl);

        const row = document.createElement('div');
        row.style.cssText = 'display:flex; gap:6px; align-items:center; flex-wrap:wrap;';

        step.list.forEach((entry, i) => {
            const isActive = entry.key === step.activeKey;
            const isEvicted = entry.key === step.evicted;
            const box = document.createElement('div');
            box.style.cssText = `
        padding:8px 12px; border-radius:6px; text-align:center;
        border:1.5px solid ${isEvicted ? 'var(--back)' : isActive ? 'var(--hash)' : 'var(--grid-line)'};
        background:${isEvicted ? 'var(--back-dim)' : isActive ? 'var(--hash-dim)' : 'var(--panel)'};
        font-size:11px; font-weight:700; color:var(--text);
      `;
            box.innerHTML = `${entry.key}<br><span style="font-size:9px;font-weight:400;color:var(--muted)">${entry.value}</span>`;
            row.appendChild(box);

            if (i < step.list.length - 1) {
                const arr = document.createElement('div');
                arr.style.cssText = 'font-size:12px; color:var(--muted);';
                arr.textContent = '←';
                row.appendChild(arr);
            }
        });

        if (step.evicted) {
            const evLbl = document.createElement('div');
            evLbl.style.cssText = 'font-size:10px; color:var(--back); margin-left:8px;';
            evLbl.textContent = `✗ evicted: ${step.evicted}`;
            row.appendChild(evLbl);
        }

        this.container.appendChild(row);
        this.captionEl.textContent = step.caption;
        this.onStepChange?.(this.idx, this.steps.length - 1);
    }
}

// ---------- Binary Heap ----------

export interface HeapStep {
    heap: number[];
    active: number[];   // indices being compared/swapped
    caption: string;
}

export function binaryHeapSteps(): HeapStep[] {
    const heap: number[] = [];
    const steps: HeapStep[] = [];

    function snap(active: number[] = [], caption = ''): HeapStep {
        return { heap: [...heap], active: [...active], caption };
    }

    function heapifyUp(i: number): void {
        while (i > 0) {
            const parent = Math.floor((i - 1) / 2);
            steps.push(snap([i, parent], `Heapify up: compare index ${i} (${heap[i]}) with parent ${parent} (${heap[parent]})`));
            if (heap[i] > heap[parent]) {
                [heap[i], heap[parent]] = [heap[parent], heap[i]];
                steps.push(snap([i, parent], `Swap: ${heap[parent]} ↕ ${heap[i]}`));
                i = parent;
            } else {
                steps.push(snap([i], `No swap needed — heap property satisfied`));
                break;
            }
        }
    }

    steps.push(snap([], 'Binary max-heap: parent ≥ children. Stored as array where children of i are at 2i+1 and 2i+2'));

    for (const v of [10, 20, 15, 30, 25, 5, 40]) {
        heap.push(v);
        steps.push(snap([heap.length - 1], `Insert ${v} at end (index ${heap.length - 1})`));
        heapifyUp(heap.length - 1);
    }

    // Extract max
    steps.push(snap([0], `Extract max: root is ${heap[0]}`));
    const last = heap.pop()!;
    if (heap.length > 0) {
        heap[0] = last;
        steps.push(snap([0], `Move last element (${last}) to root, then heapify down`));

        let i = 0;
        while (true) {
            const left = 2 * i + 1;
            const right = 2 * i + 2;
            let largest = i;
            if (left < heap.length && heap[left] > heap[largest]) largest = left;
            if (right < heap.length && heap[right] > heap[largest]) largest = right;
            if (largest === i) {
                steps.push(snap([i], 'Heap property satisfied — done'));
                break;
            }
            steps.push(snap([i, largest], `Swap ${heap[i]} with larger child ${heap[largest]}`));
            [heap[i], heap[largest]] = [heap[largest], heap[i]];
            steps.push(snap([largest], `Swapped — continue heapify down from index ${largest}`));
            i = largest;
        }
    }

    return steps;
}

export class BinaryHeapPlayer {
    private steps: HeapStep[] = [];
    private idx = 0;
    private timer: number | null = null;
    private speedMs = 850;

    constructor(
        private container: HTMLElement,
        private captionEl: HTMLElement,
        private onStepChange?: (idx: number, total: number) => void,
    ) {}

    load(steps: HeapStep[]): void { this.pause(); this.steps = steps; this.idx = 0; this.render(); }
    play(): void {
        if (this.timer !== null) return;
        this.timer = window.setInterval(() => {
            if (this.idx >= this.steps.length - 1) { this.pause(); return; }
            this.idx++; this.render();
        }, this.speedMs);
    }
    pause(): void { if (this.timer !== null) { window.clearInterval(this.timer); this.timer = null; } }
    restart(): void { this.pause(); this.idx = 0; this.render(); this.play(); }

    private render(): void {
        const step = this.steps[this.idx];
        if (!step) return;

        const SVG_NS = 'http://www.w3.org/2000/svg';
        this.container.innerHTML = '';

        // Render as tree using SVG
        const svg = document.createElementNS(SVG_NS, 'svg');
        svg.style.cssText = 'width:100%; height:160px;';

        const n = step.heap.length;
        if (n === 0) { this.container.appendChild(svg); return; }

        const W = 440; const H = 150;
        const levelH = 50;

        interface Pos { x: number; y: number; }
        const pos: Pos[] = [];

        // Calculate positions
        for (let i = 0; i < n; i++) {
            const level = Math.floor(Math.log2(i + 1));
            const levelStart = Math.pow(2, level) - 1;
            const levelEnd = Math.min(Math.pow(2, level + 1) - 2, n - 1);
            const levelCount = levelEnd - levelStart + 1;
            const posInLevel = i - levelStart;
            const xStep = W / (levelCount + 1);
            pos.push({ x: xStep * (posInLevel + 1), y: level * levelH + 20 });
        }

        svg.setAttribute('viewBox', `0 0 ${W} ${H}`);

        // Edges
        for (let i = 1; i < n; i++) {
            const parent = Math.floor((i - 1) / 2);
            const line = document.createElementNS(SVG_NS, 'line');
            line.setAttribute('x1', String(pos[parent].x)); line.setAttribute('y1', String(pos[parent].y));
            line.setAttribute('x2', String(pos[i].x)); line.setAttribute('y2', String(pos[i].y));
            line.setAttribute('stroke', 'var(--grid-line)'); line.setAttribute('stroke-width', '1.5');
            svg.appendChild(line);
        }

        // Nodes
        for (let i = 0; i < n; i++) {
            const isActive = step.active.includes(i);
            const circle = document.createElementNS(SVG_NS, 'circle');
            circle.setAttribute('cx', String(pos[i].x)); circle.setAttribute('cy', String(pos[i].y));
            circle.setAttribute('r', '14');
            circle.setAttribute('fill', isActive ? 'var(--heap-dim)' : 'var(--panel)');
            circle.setAttribute('stroke', isActive ? 'var(--heap)' : 'var(--grid-line)');
            circle.setAttribute('stroke-width', isActive ? '2.5' : '1.5');
            svg.appendChild(circle);

            const text = document.createElementNS(SVG_NS, 'text');
            text.setAttribute('x', String(pos[i].x)); text.setAttribute('y', String(pos[i].y + 4));
            text.setAttribute('font-size', '10'); text.setAttribute('font-weight', '700');
            text.setAttribute('text-anchor', 'middle'); text.setAttribute('fill', 'var(--text)');
            text.textContent = String(step.heap[i]);
            svg.appendChild(text);
        }

        this.container.appendChild(svg);
        this.captionEl.textContent = step.caption;
        this.onStepChange?.(this.idx, this.steps.length - 1);
    }
}

// ---------- Fibonacci Heap (structural overview) ----------

export interface FibHeapStep {
    trees: FibTree[];
    minIdx: number;
    operation: string;
    caption: string;
}

export interface FibTree { root: number; children: number[]; marked: boolean; }

export function fibHeapSteps(): FibHeapStep[] {
    const steps: FibHeapStep[] = [];

    function snap(trees: FibTree[], minIdx: number, operation: string, caption: string): FibHeapStep {
        return { trees: trees.map((t) => ({ ...t, children: [...t.children] })), minIdx, operation, caption };
    }

    let trees: FibTree[] = [];
    steps.push(snap([], -1, 'Initial', 'Fibonacci Heap: a forest of min-heap-ordered trees. Supports O(1) amortized insert and decrease-key.'));

    const vals = [3, 7, 1, 8, 5, 2];
    for (const v of vals) {
        trees.push({ root: v, children: [], marked: false });
        const minIdx = trees.reduce((best, t, i) => t.root < trees[best].root ? i : best, 0);
        steps.push(snap(trees, minIdx, 'Insert', `Insert ${v}: add single-node tree to forest. Min pointer → ${trees[minIdx].root}`));
    }

    // Extract min — consolidate
    const minTree = trees.reduce((best, t) => t.root < best.root ? t : best);
    steps.push(snap(trees, trees.indexOf(minTree), 'Extract-min', `Extract-min: remove root ${minTree.root}, add its children as new trees, then consolidate`));
    trees = trees.filter((t) => t !== minTree);
    trees.push({ root: 10, children: [], marked: false });
    steps.push(snap(trees, 0, 'Consolidate', 'After consolidation: trees with same degree are merged. Each degree appears at most once.'));

    // Decrease-key demo
    steps.push(snap(trees, 0, 'Decrease-key', 'Decrease-key: cut the node, add it as a new tree root. If parent was already marked, cascading cut propagates up. O(1) amortized.'));

    return steps;
}

export class FibHeapPlayer {
    private steps: FibHeapStep[] = [];
    private idx = 0;
    private timer: number | null = null;
    private speedMs = 1200;

    constructor(
        private container: HTMLElement,
        private captionEl: HTMLElement,
        private onStepChange?: (idx: number, total: number) => void,
    ) {}

    load(steps: FibHeapStep[]): void { this.pause(); this.steps = steps; this.idx = 0; this.render(); }
    play(): void {
        if (this.timer !== null) return;
        this.timer = window.setInterval(() => {
            if (this.idx >= this.steps.length - 1) { this.pause(); return; }
            this.idx++; this.render();
        }, this.speedMs);
    }
    pause(): void { if (this.timer !== null) { window.clearInterval(this.timer); this.timer = null; } }
    restart(): void { this.pause(); this.idx = 0; this.render(); this.play(); }

    private render(): void {
        const step = this.steps[this.idx];
        if (!step) return;
        this.container.innerHTML = '';

        if (step.trees.length === 0) {
            const empty = document.createElement('div');
            empty.style.cssText = 'color:var(--muted); font-size:12px; padding:16px 0;';
            empty.textContent = '(empty heap)';
            this.container.appendChild(empty);
        } else {
            const row = document.createElement('div');
            row.style.cssText = 'display:flex; gap:12px; flex-wrap:wrap; align-items:flex-start;';

            step.trees.forEach((tree, i) => {
                const isMin = i === step.minIdx;
                const treeBox = document.createElement('div');
                treeBox.style.cssText = `border:1.5px solid ${isMin ? 'var(--heap)' : 'var(--grid-line)'}; border-radius:6px; padding:8px; background:${isMin ? 'var(--heap-dim)' : 'var(--panel)'};`;

                const root = document.createElement('div');
                root.style.cssText = `font-size:14px; font-weight:700; color:${isMin ? 'var(--heap)' : 'var(--text)'}; text-align:center;`;
                root.textContent = isMin ? `★ ${tree.root}` : String(tree.root);
                treeBox.appendChild(root);

                if (tree.children.length > 0) {
                    const kids = document.createElement('div');
                    kids.style.cssText = 'display:flex; gap:6px; margin-top:6px; justify-content:center;';
                    tree.children.forEach((c) => {
                        const kid = document.createElement('div');
                        kid.style.cssText = 'font-size:11px; font-weight:700; color:var(--muted); border:1px solid var(--grid-line); border-radius:4px; padding:2px 6px;';
                        kid.textContent = String(c);
                        kids.appendChild(kid);
                    });
                    treeBox.appendChild(kids);
                }

                row.appendChild(treeBox);
            });
            this.container.appendChild(row);
        }

        const opBadge = document.createElement('div');
        opBadge.style.cssText = 'margin-top:8px; font-size:10px; color:var(--heap); font-weight:700;';
        opBadge.textContent = `Operation: ${step.operation}`;
        this.container.appendChild(opBadge);

        this.captionEl.textContent = step.caption;
        this.onStepChange?.(this.idx, this.steps.length - 1);
    }
}

export const HASH_HEAP_GENERATORS: Record<string, () => unknown[]> = {
    Has: () => hashTableSteps() as unknown[],
    Blf: () => bloomFilterSteps() as unknown[],
    Lru: () => lruCacheSteps() as unknown[],
    Bhp: () => binaryHeapSteps() as unknown[],
    Fhp: () => fibHeapSteps() as unknown[],
};