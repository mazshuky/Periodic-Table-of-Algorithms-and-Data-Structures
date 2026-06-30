// ---------- Generic n-ary tree layout + renderer, shared by most tree structures ----------

export interface RawNode {
    id: string;
    label: string;
    color?: string;
    shape?: 'circle' | 'rect';
    state?: 'new' | 'active' | 'normal';
    children: RawNode[];
}

export interface LaidOutNode {
    id: string;
    label: string;
    x: number;
    y: number;
    color?: string;
    shape: 'circle' | 'rect';
    state: 'new' | 'active' | 'normal';
}

export interface TreeStep {
    nodes: LaidOutNode[];
    edges: [string, string][];
    caption?: string;
}

function layoutTree(root: RawNode, spacingX = 46, spacingY = 56): TreeStep {
    const nodes: LaidOutNode[] = [];
    const edges: [string, string][] = [];
    let leafIndex = 0;

    function visit(node: RawNode, depth: number): number {
        let x: number;
        if (node.children.length === 0) {
            x = leafIndex * spacingX;
            leafIndex++;
        } else {
            const childXs = node.children.map((c) => visit(c, depth + 1));
            node.children.forEach((c) => edges.push([node.id, c.id]));
            x = (childXs[0] + childXs[childXs.length - 1]) / 2;
        }
        nodes.push({
            id: node.id,
            label: node.label,
            x,
            y: depth * spacingY,
            color: node.color,
            shape: node.shape ?? 'circle',
            state: node.state ?? 'normal',
        });
        return x;
    }

    visit(root, 0);
    return { nodes, edges };
}

function toStep(root: RawNode | null, caption?: string): TreeStep {
    if (!root) return { nodes: [], edges: [], caption };
    const step = layoutTree(root);
    step.caption = caption;
    return step;
}

const SVG_NS = 'http://www.w3.org/2000/svg';

export class TreePlayer {
    private steps: TreeStep[] = [];
    private idx = 0;
    private timer: number | null = null;
    private speedMs = 750;

    constructor(
        private svg: SVGSVGElement,
        private captionEl: HTMLElement,
        private onStepChange?: (idx: number, total: number) => void,
    ) {}

    load(steps: TreeStep[]): void {
        this.pause();
        this.steps = steps;
        this.idx = 0;
        this.render();
    }

    play(): void {
        if (this.timer !== null) return;
        this.timer = window.setInterval(() => {
            if (this.idx >= this.steps.length - 1) { this.pause(); return; }
            this.idx++;
            this.render();
        }, this.speedMs);
    }

    pause(): void {
        if (this.timer !== null) { window.clearInterval(this.timer); this.timer = null; }
    }

    restart(): void {
        this.pause();
        this.idx = 0;
        this.render();
        this.play();
    }

    private render(): void {
        const step = this.steps[this.idx];
        if (!step) return;
        while (this.svg.firstChild) this.svg.removeChild(this.svg.firstChild);

        const pad = 30;
        const xs = step.nodes.map((n) => n.x);
        const ys = step.nodes.map((n) => n.y);
        const minX = xs.length ? Math.min(...xs) - pad : 0;
        const maxX = xs.length ? Math.max(...xs) + pad : 100;
        const maxY = ys.length ? Math.max(...ys) + pad : 100;
        this.svg.setAttribute('viewBox', `${minX} ${-pad} ${maxX - minX} ${maxY + pad}`);

        const posOf = (id: string) => step.nodes.find((n) => n.id === id);

        step.edges.forEach(([a, b]) => {
            const pa = posOf(a);
            const pb = posOf(b);
            if (!pa || !pb) return;
            const line = document.createElementNS(SVG_NS, 'line');
            line.setAttribute('x1', String(pa.x));
            line.setAttribute('y1', String(pa.y));
            line.setAttribute('x2', String(pb.x));
            line.setAttribute('y2', String(pb.y));
            line.setAttribute('stroke', 'var(--grid-line)');
            line.setAttribute('stroke-width', '1.5');
            this.svg.appendChild(line);
        });

        step.nodes.forEach((n) => {
            const stroke = n.state === 'new' ? 'var(--greedy)' : n.state === 'active' ? 'var(--search)' : 'var(--grid-line)';
            const fill = n.color ?? (n.state === 'normal' ? 'var(--panel)' : 'var(--tree-dim)');

            if (n.shape === 'rect') {
                const w = Math.max(28, n.label.length * 9 + 12);
                const rect = document.createElementNS(SVG_NS, 'rect');
                rect.setAttribute('x', String(n.x - w / 2));
                rect.setAttribute('y', String(n.y - 12));
                rect.setAttribute('width', String(w));
                rect.setAttribute('height', '24');
                rect.setAttribute('rx', '4');
                rect.setAttribute('fill', fill);
                rect.setAttribute('stroke', stroke);
                rect.setAttribute('stroke-width', n.state === 'normal' ? '1.5' : '2.5');
                this.svg.appendChild(rect);
            } else {
                const circle = document.createElementNS(SVG_NS, 'circle');
                circle.setAttribute('cx', String(n.x));
                circle.setAttribute('cy', String(n.y));
                circle.setAttribute('r', '13');
                circle.setAttribute('fill', fill);
                circle.setAttribute('stroke', stroke);
                circle.setAttribute('stroke-width', n.state === 'normal' ? '1.5' : '2.5');
                this.svg.appendChild(circle);
            }

            const text = document.createElementNS(SVG_NS, 'text');
            text.setAttribute('x', String(n.x));
            text.setAttribute('y', String(n.y + 4));
            text.setAttribute('font-size', '10');
            text.setAttribute('font-weight', '700');
            text.setAttribute('text-anchor', 'middle');
            text.setAttribute('fill', n.color ? 'var(--bg)' : 'var(--text)');
            text.textContent = n.label;
            this.svg.appendChild(text);
        });

        this.captionEl.textContent = step.caption ?? '';
        this.onStepChange?.(this.idx, this.steps.length - 1);
    }
}

// ---------- Binary Search Tree ----------

interface BNode { id: string; value: number; left: BNode | null; right: BNode | null; }

function bstInsert(node: BNode | null, value: number, ctx: { counter: number; newId: string }): BNode {
    if (!node) {
        const id = `bst${ctx.counter++}`;
        ctx.newId = id;
        return { id, value, left: null, right: null };
    }
    if (value < node.value) node.left = bstInsert(node.left, value, ctx);
    else node.right = bstInsert(node.right, value, ctx);
    return node;
}

function toRawBinary(node: BNode | null, newId: string, colorOf?: (n: BNode) => string | undefined): RawNode | null {
    if (!node) return null;
    const children = [node.left, node.right]
        .map((c) => toRawBinary(c, newId, colorOf))
        .filter((c): c is RawNode => c !== null);
    return {
        id: node.id,
        label: String(node.value),
        state: node.id === newId ? 'new' : 'normal',
        color: colorOf?.(node),
        children,
    };
}

export function bstSteps(values: number[] = [8, 3, 10, 1, 6, 14, 4, 7, 13]): TreeStep[] {
    let root: BNode | null = null;
    const ctx = { counter: 0, newId: '' };
    const steps: TreeStep[] = [];
    for (const v of values) {
        ctx.newId = '';
        root = bstInsert(root, v, ctx);
        steps.push(toStep(toRawBinary(root, ctx.newId), `Insert ${v}`));
    }
    return steps;
}

// ---------- AVL Tree (self-balancing BST) ----------

interface ANode { id: string; value: number; left: ANode | null; right: ANode | null; height: number; }

function aHeight(n: ANode | null): number { return n ? n.height : 0; }
function aBalance(n: ANode): number { return aHeight(n.left) - aHeight(n.right); }
function aUpdate(n: ANode): void { n.height = 1 + Math.max(aHeight(n.left), aHeight(n.right)); }

function aRotateRight(y: ANode): ANode {
    const x = y.left!;
    y.left = x.right;
    x.right = y;
    aUpdate(y);
    aUpdate(x);
    return x;
}

function aRotateLeft(x: ANode): ANode {
    const y = x.right!;
    x.right = y.left;
    y.left = x;
    aUpdate(x);
    aUpdate(y);
    return y;
}

function avlInsert(node: ANode | null, value: number, ctx: { counter: number; newId: string; rotated: boolean }): ANode {
    if (!node) {
        const id = `avl${ctx.counter++}`;
        ctx.newId = id;
        return { id, value, left: null, right: null, height: 1 };
    }
    if (value < node.value) node.left = avlInsert(node.left, value, ctx);
    else node.right = avlInsert(node.right, value, ctx);
    aUpdate(node);

    const balance = aBalance(node);
    if (balance > 1 && node.left && value < node.left.value) { ctx.rotated = true; return aRotateRight(node); }
    if (balance < -1 && node.right && value >= node.right.value) { ctx.rotated = true; return aRotateLeft(node); }
    if (balance > 1 && node.left && value >= node.left.value) {
        ctx.rotated = true;
        node.left = aRotateLeft(node.left);
        return aRotateRight(node);
    }
    if (balance < -1 && node.right && value < node.right.value) {
        ctx.rotated = true;
        node.right = aRotateRight(node.right);
        return aRotateLeft(node);
    }
    return node;
}

function toRawAvl(node: ANode | null, newId: string): RawNode | null {
    if (!node) return null;
    const children = [node.left, node.right]
        .map((c) => toRawAvl(c, newId))
        .filter((c): c is RawNode => c !== null);
    return { id: node.id, label: String(node.value), state: node.id === newId ? 'new' : 'normal', children };
}

export function avlSteps(values: number[] = [10, 20, 30, 25, 5, 1, 15, 22]): TreeStep[] {
    let root: ANode | null = null;
    const ctx = { counter: 0, newId: '', rotated: false };
    const steps: TreeStep[] = [];
    for (const v of values) {
        ctx.newId = '';
        ctx.rotated = false;
        root = avlInsert(root, v, ctx);
        const caption = ctx.rotated ? `Insert ${v} \u2192 rebalanced with a rotation` : `Insert ${v}`;
        steps.push(toStep(toRawAvl(root, ctx.newId), caption));
    }
    return steps;
}

// ---------- Red-Black Tree ----------

type RColor = 'R' | 'B';
interface RNode { id: string; value: number; color: RColor; left: RNode | null; right: RNode | null; parent: RNode | null; }

function rbColorOf(n: RNode | null): RColor { return n ? n.color : 'B'; }

function rbLeftRotate(root: RNode, x: RNode): RNode {
    const y = x.right!;
    x.right = y.left;
    if (y.left) y.left.parent = x;
    y.parent = x.parent;
    let newRoot = root;
    if (!x.parent) newRoot = y;
    else if (x === x.parent.left) x.parent.left = y;
    else x.parent.right = y;
    y.left = x;
    x.parent = y;
    return newRoot;
}

function rbRightRotate(root: RNode, x: RNode): RNode {
    const y = x.left!;
    x.left = y.right;
    if (y.right) y.right.parent = x;
    y.parent = x.parent;
    let newRoot = root;
    if (!x.parent) newRoot = y;
    else if (x === x.parent.right) x.parent.right = y;
    else x.parent.left = y;
    y.right = x;
    x.parent = y;
    return newRoot;
}

function rbInsert(root: RNode | null, value: number, ctx: { counter: number; newId: string }): RNode {
    const id = `rbt${ctx.counter++}`;
    ctx.newId = id;
    const z: RNode = { id, value, color: 'R', left: null, right: null, parent: null };

    let y: RNode | null = null;
    let x = root;
    while (x) {
        y = x;
        x = value < x.value ? x.left : x.right;
    }
    z.parent = y;
    if (!y) root = z;
    else if (value < y.value) y.left = z;
    else y.right = z;

    let cur = z;
    let r = root!;
    while (cur.parent && cur.parent.color === 'R') {
        const parent = cur.parent;
        const grandparent = parent.parent;
        if (!grandparent) break;
        if (parent === grandparent.left) {
            const uncle = grandparent.right;
            if (rbColorOf(uncle) === 'R') {
                parent.color = 'B';
                uncle!.color = 'B';
                grandparent.color = 'R';
                cur = grandparent;
            } else {
                if (cur === parent.right) { cur = parent; r = rbLeftRotate(r, cur); }
                cur.parent!.color = 'B';
                cur.parent!.parent!.color = 'R';
                r = rbRightRotate(r, cur.parent!.parent!);
            }
        } else {
            const uncle = grandparent.left;
            if (rbColorOf(uncle) === 'R') {
                parent.color = 'B';
                uncle!.color = 'B';
                grandparent.color = 'R';
                cur = grandparent;
            } else {
                if (cur === parent.left) { cur = parent; r = rbRightRotate(r, cur); }
                cur.parent!.color = 'B';
                cur.parent!.parent!.color = 'R';
                r = rbLeftRotate(r, cur.parent!.parent!);
            }
        }
    }
    r.color = 'B';
    return r;
}

function toRawRbt(node: RNode | null, newId: string): RawNode | null {
    if (!node) return null;
    const children = [node.left, node.right]
        .map((c) => toRawRbt(c, newId))
        .filter((c): c is RawNode => c !== null);
    return {
        id: node.id,
        label: String(node.value),
        color: node.color === 'R' ? 'var(--tree)' : 'var(--text)',
        state: node.id === newId ? 'new' : 'normal',
        children,
    };
}

export function rbtSteps(values: number[] = [10, 20, 30, 15, 25, 5, 1, 22]): TreeStep[] {
    let root: RNode | null = null;
    const ctx = { counter: 0, newId: '' };
    const steps: TreeStep[] = [];
    for (const v of values) {
        root = rbInsert(root, v, ctx);
        steps.push(toStep(toRawRbt(root, ctx.newId), `Insert ${v}`));
    }
    return steps;
}

// ---------- Trie ----------

interface TrNode { id: string; char: string; children: Map<string, TrNode>; isWord: boolean; }

export function trieSteps(words: string[] = ['cat', 'car', 'card', 'dog', 'do']): TreeStep[] {
    const root: TrNode = { id: 'root', char: '\u2022', children: new Map(), isWord: false };
    let counter = 0;
    const steps: TreeStep[] = [];

    function toRaw(node: TrNode, newId: string): RawNode {
        return {
            id: node.id,
            label: node.char,
            state: node.id === newId ? 'new' : 'normal',
            color: node.isWord ? 'var(--tree)' : undefined,
            children: Array.from(node.children.values()).map((c) => toRaw(c, newId)),
        };
    }

    for (const word of words) {
        let node = root;
        let lastNewId = '';
        for (const ch of word) {
            if (!node.children.has(ch)) {
                const id = `trie${counter++}`;
                node.children.set(ch, { id, char: ch, children: new Map(), isWord: false });
                lastNewId = id;
            }
            node = node.children.get(ch)!;
        }
        node.isWord = true;
        steps.push(toStep(toRaw(root, lastNewId), `Insert "${word}"`));
    }
    return steps;
}

// ---------- Segment Tree (range sum) ----------

export function segmentTreeSteps(arr: number[] = [2, 5, 1, 4, 9, 3, 6, 7]): TreeStep[] {
    let counter = 0;
    const steps: TreeStep[] = [];

    function build(lo: number, hi: number): RawNode {
        const id = `seg${counter++}`;
        if (lo === hi) {
            const node: RawNode = { id, label: String(arr[lo]), state: 'normal', children: [] };
            steps.push(toStep(cloneWithRoot(node), `Leaf [${lo}]: value ${arr[lo]}`));
            return node;
        }
        const mid = Math.floor((lo + hi) / 2);
        const left = build(lo, mid);
        const right = build(mid + 1, hi);
        const sum = sumRange(lo, hi);
        const node: RawNode = { id, label: `${sum}`, state: 'new', children: [left, right] };
        steps.push(toStep(cloneWithRoot(node, true), `Combine [${lo}..${hi}]: sum = ${sum}`));
        return node;
    }

    function sumRange(lo: number, hi: number): number {
        let s = 0;
        for (let i = lo; i <= hi; i++) s += arr[i];
        return s;
    }

    // We rebuild the same subtree object each time toStep is called, so capture a deep
    // clone that marks only the just-finished node as 'new' for that single step.
    function cloneWithRoot(node: RawNode, markRootNew = true): RawNode {
        function clone(n: RawNode, isRoot: boolean): RawNode {
            return {
                id: n.id,
                label: n.label,
                state: isRoot && markRootNew ? 'new' : 'normal',
                children: n.children.map((c) => clone(c, false)),
            };
        }
        return clone(node, true);
    }

    build(0, arr.length - 1);
    return steps;
}

// ---------- B-Tree (order t = 2, max 3 keys per node) ----------

interface BTreeNode { id: string; keys: number[]; children: BTreeNode[]; leaf: boolean; }

const BT_T = 2; // minimum degree; max keys = 2t - 1 = 3

function btSplitChild(parent: BTreeNode, i: number, idGen: () => string): void {
    const full = parent.children[i];
    const mid = full.keys[BT_T - 1];
    const right: BTreeNode = {
        id: idGen(),
        keys: full.keys.slice(BT_T),
        children: full.leaf ? [] : full.children.slice(BT_T),
        leaf: full.leaf,
    };
    full.keys = full.keys.slice(0, BT_T - 1);
    if (!full.leaf) full.children = full.children.slice(0, BT_T);
    parent.keys.splice(i, 0, mid);
    parent.children.splice(i + 1, 0, right);
}

function btInsertNonFull(node: BTreeNode, key: number, idGen: () => string): void {
    if (node.leaf) {
        let i = node.keys.length - 1;
        node.keys.push(0);
        while (i >= 0 && node.keys[i] > key) { node.keys[i + 1] = node.keys[i]; i--; }
        node.keys[i + 1] = key;
    } else {
        let i = node.keys.length - 1;
        while (i >= 0 && node.keys[i] > key) i--;
        i++;
        if (node.children[i].keys.length === 2 * BT_T - 1) {
            btSplitChild(node, i, idGen);
            if (node.keys[i] < key) i++;
        }
        btInsertNonFull(node.children[i], key, idGen);
    }
}

function toRawBTree(node: BTreeNode): RawNode {
    return {
        id: node.id,
        label: node.keys.join(' | '),
        shape: 'rect',
        children: node.children.map(toRawBTree),
    };
}

export function bTreeSteps(values: number[] = [10, 20, 5, 6, 12, 30, 7, 17, 3, 25]): TreeStep[] {
    let counter = 0;
    const idGen = () => `bt${counter++}`;
    let root: BTreeNode = { id: idGen(), keys: [], children: [], leaf: true };
    const steps: TreeStep[] = [];

    for (const key of values) {
        if (root.keys.length === 2 * BT_T - 1) {
            const newRoot: BTreeNode = { id: idGen(), keys: [], children: [root], leaf: false };
            btSplitChild(newRoot, 0, idGen);
            root = newRoot;
        }
        btInsertNonFull(root, key, idGen);
        steps.push(toStep(toRawBTree(root), `Insert ${key}`));
    }
    return steps;
}

export const TREE_GENERATORS: Record<string, () => TreeStep[]> = {
    Bst: () => bstSteps(),
    Avl: () => avlSteps(),
    Rbt: () => rbtSteps(),
    Trc: () => trieSteps(),
    Sgt: () => segmentTreeSteps(),
    Bpt: () => bTreeSteps(),
};

// ---------- Fenwick Tree (Binary Indexed Tree) ----------
// Not drawn as a node-link tree; shown as the underlying 1-indexed array,
// animating the index hops (i += lowbit(i) / i -= lowbit(i)) that give the
// structure its "tree" behavior under the hood.

export interface FenwickStep {
    tree: number[]; // 1-indexed BIT array (index 0 unused)
    activeIndex: number; // -1 when nothing active
    caption: string;
}

function lowbit(x: number): number { return x & -x; }

export function fenwickSteps(): FenwickStep[] {
    const arr = [3, 2, 4, 5, 1, 1, 5, 3];
    const n = arr.length;
    const bit = new Array(n + 1).fill(0);
    const steps: FenwickStep[] = [];

    function rawUpdate(i: number, delta: number): void {
        while (i <= n) { bit[i] += delta; i += lowbit(i); }
    }
    for (let i = 0; i < n; i++) rawUpdate(i + 1, arr[i]);

    steps.push({ tree: [...bit], activeIndex: -1, caption: 'Initial Fenwick tree built from the array (1-indexed)' });

    let i = 4;
    const delta = 6;
    while (i <= n) {
        bit[i] += delta;
        steps.push({
            tree: [...bit],
            activeIndex: i,
            caption: `Update index ${i}: add ${delta} \u2192 next index = ${i} + lowbit(${i}) = ${i + lowbit(i)}`,
        });
        i += lowbit(i);
    }

    let q = 6;
    let sum = 0;
    while (q > 0) {
        sum += bit[q];
        steps.push({
            tree: [...bit],
            activeIndex: q,
            caption: `Query: add bit[${q}]=${bit[q]} \u2192 running sum=${sum}, next index = ${q} - lowbit(${q}) = ${q - lowbit(q)}`,
        });
        q -= lowbit(q);
    }
    steps.push({ tree: [...bit], activeIndex: -1, caption: `Prefix sum(1..6) = ${sum}` });

    return steps;
}

export class FenwickPlayer {
    private steps: FenwickStep[] = [];
    private idx = 0;
    private timer: number | null = null;
    private speedMs = 900;

    constructor(
        private container: HTMLElement,
        private captionEl: HTMLElement,
        private onStepChange?: (idx: number, total: number) => void,
    ) {}

    load(steps: FenwickStep[]): void {
        this.pause();
        this.steps = steps;
        this.idx = 0;
        this.render();
    }

    play(): void {
        if (this.timer !== null) return;
        this.timer = window.setInterval(() => {
            if (this.idx >= this.steps.length - 1) { this.pause(); return; }
            this.idx++;
            this.render();
        }, this.speedMs);
    }

    pause(): void {
        if (this.timer !== null) { window.clearInterval(this.timer); this.timer = null; }
    }

    restart(): void {
        this.pause();
        this.idx = 0;
        this.render();
        this.play();
    }

    private render(): void {
        const step = this.steps[this.idx];
        if (!step) return;
        const max = Math.max(...step.tree.slice(1), 1);
        this.container.innerHTML = '';

        step.tree.slice(1).forEach((value, i) => {
            const index = i + 1;
            const bar = document.createElement('div');
            bar.className = 'viz-bar';
            if (index === step.activeIndex) bar.classList.add('viz-active');
            bar.style.height = `${(value / max) * 100}%`;
            const label = document.createElement('span');
            label.textContent = `${value}`;
            bar.appendChild(label);
            const idxLabel = document.createElement('span');
            idxLabel.className = 'viz-bar-index';
            idxLabel.textContent = String(index);
            bar.appendChild(idxLabel);
            this.container.appendChild(bar);
        });

        this.captionEl.textContent = step.caption;
        this.onStepChange?.(this.idx, this.steps.length - 1);
    }
}