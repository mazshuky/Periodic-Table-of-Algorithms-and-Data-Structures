export interface GNode {
    id: string;
    x: number;
    y: number;
}

export interface GEdge {
    from: string;
    to: string;
    weight: number;
}

export interface GraphStep {
    visited: string[];
    current?: string;
    activeEdges: [string, string][]; // edges being examined/relaxed this step
    includedEdges: [string, string][]; // finalized tree/path/MST edges so far
    labels?: Record<string, string>; // small text under each node (distance, order, etc.)
}

function snap(
    visited: string[],
    activeEdges: [string, string][] = [],
    includedEdges: [string, string][] = [],
    current?: string,
    labels?: Record<string, string>,
): GraphStep {
    return {
        visited: [...visited],
        current,
        activeEdges: [...activeEdges],
        includedEdges: includedEdges.map((e) => [...e] as [string, string]),
        labels: labels ? { ...labels } : undefined,
    };
}

// Shared sample graph. Node order (A..H) is also a valid topological order,
// since every edge below goes from an earlier letter to a later one.
export const NODES: GNode[] = [
    { id: 'A', x: 60, y: 40 },
    { id: 'B', x: 200, y: 25 },
    { id: 'C', x: 340, y: 45 },
    { id: 'D', x: 60, y: 150 },
    { id: 'E', x: 200, y: 150 },
    { id: 'F', x: 340, y: 150 },
    { id: 'G', x: 130, y: 235 },
    { id: 'H', x: 270, y: 235 },
];

export const EDGES: GEdge[] = [
    { from: 'A', to: 'B', weight: 4 },
    { from: 'A', to: 'D', weight: 2 },
    { from: 'B', to: 'C', weight: 5 },
    { from: 'B', to: 'E', weight: 3 },
    { from: 'C', to: 'F', weight: 6 },
    { from: 'D', to: 'E', weight: 4 },
    { from: 'D', to: 'G', weight: 7 },
    { from: 'E', to: 'F', weight: 2 },
    { from: 'E', to: 'H', weight: 5 },
    { from: 'E', to: 'G', weight: 6 },
    { from: 'F', to: 'H', weight: 3 },
    { from: 'G', to: 'H', weight: 4 },
];

function nodeMap(): Record<string, GNode> {
    return Object.fromEntries(NODES.map((n) => [n.id, n]));
}

function undirectedAdj(): Map<string, { to: string; weight: number }[]> {
    const adj = new Map<string, { to: string; weight: number }[]>();
    NODES.forEach((n) => adj.set(n.id, []));
    EDGES.forEach((e) => {
        adj.get(e.from)!.push({ to: e.to, weight: e.weight });
        adj.get(e.to)!.push({ to: e.from, weight: e.weight });
    });
    return adj;
}

function directedAdj(): Map<string, { to: string; weight: number }[]> {
    const adj = new Map<string, { to: string; weight: number }[]>();
    NODES.forEach((n) => adj.set(n.id, []));
    EDGES.forEach((e) => adj.get(e.from)!.push({ to: e.to, weight: e.weight }));
    return adj;
}

function edgeKey(a: string, b: string): string {
    return [a, b].sort().join('-');
}

export function bfsSteps(start = 'A'): GraphStep[] {
    const adj = undirectedAdj();
    const visited: string[] = [start];
    const steps: GraphStep[] = [snap(visited, [], [], start)];
    const queue = [start];
    const seen = new Set([start]);

    while (queue.length) {
        const node = queue.shift()!;
        for (const { to } of adj.get(node)!) {
            steps.push(snap(visited, [[node, to]], [], node));
            if (!seen.has(to)) {
                seen.add(to);
                visited.push(to);
                queue.push(to);
                steps.push(snap(visited, [[node, to]], [[node, to]], to));
            }
        }
    }
    steps.push(snap(visited, [], steps[steps.length - 1].includedEdges));
    return steps;
}

export function dfsSteps(start = 'A'): GraphStep[] {
    const adj = undirectedAdj();
    const visited: string[] = [];
    const steps: GraphStep[] = [];
    const seen = new Set<string>();
    const tree: [string, string][] = [];

    function visit(node: string, parent?: string): void {
        seen.add(node);
        visited.push(node);
        if (parent) tree.push([parent, node]);
        steps.push(snap(visited, parent ? [[parent, node]] : [], [...tree], node));
        for (const { to } of adj.get(node)!) {
            if (!seen.has(to)) {
                steps.push(snap(visited, [[node, to]], [...tree], node));
                visit(to, node);
            }
        }
    }

    visit(start);
    steps.push(snap(visited, [], tree));
    return steps;
}

export function dijkstraSteps(start = 'A'): GraphStep[] {
    const adj = undirectedAdj();
    const dist: Record<string, number> = Object.fromEntries(NODES.map((n) => [n.id, Infinity]));
    dist[start] = 0;
    const visited: string[] = [];
    const tree: [string, string][] = [];
    const steps: GraphStep[] = [];
    const labels = () => Object.fromEntries(Object.entries(dist).map(([k, v]) => [k, v === Infinity ? '\u221E' : String(v)]));
    const done = new Set<string>();

    while (done.size < NODES.length) {
        let u: string | null = null;
        let best = Infinity;
        for (const n of NODES) {
            if (!done.has(n.id) && dist[n.id] < best) { best = dist[n.id]; u = n.id; }
        }
        if (u === null) break;
        done.add(u);
        visited.push(u);
        steps.push(snap(visited, [], tree, u, labels()));
        for (const { to, weight } of adj.get(u)!) {
            steps.push(snap(visited, [[u, to]], tree, u, labels()));
            if (dist[u] + weight < dist[to]) {
                dist[to] = dist[u] + weight;
                tree.push([u, to]);
                steps.push(snap(visited, [[u, to]], tree, u, labels()));
            }
        }
    }
    steps.push(snap(visited, [], tree, undefined, labels()));
    return steps;
}

export function primSteps(start = 'A'): GraphStep[] {
    const adj = undirectedAdj();
    const inTree = new Set([start]);
    const visited: string[] = [start];
    const tree: [string, string][] = [];
    const steps: GraphStep[] = [snap(visited, [], [], start)];

    while (inTree.size < NODES.length) {
        let best: { from: string; to: string; weight: number } | null = null;
        for (const node of inTree) {
            for (const { to, weight } of adj.get(node)!) {
                if (!inTree.has(to)) {
                    steps.push(snap(visited, [[node, to]], tree, node));
                    if (!best || weight < best.weight) best = { from: node, to, weight };
                }
            }
        }
        if (!best) break;
        inTree.add(best.to);
        visited.push(best.to);
        tree.push([best.from, best.to]);
        steps.push(snap(visited, [[best.from, best.to]], tree, best.to));
    }
    steps.push(snap(visited, [], tree));
    return steps;
}

export function kruskalSteps(): GraphStep[] {
    const parent: Record<string, string> = Object.fromEntries(NODES.map((n) => [n.id, n.id]));
    function find(x: string): string { return parent[x] === x ? x : (parent[x] = find(parent[x])); }

    const sorted = [...EDGES].sort((a, b) => a.weight - b.weight);
    const tree: [string, string][] = [];
    const visited: string[] = [];
    const steps: GraphStep[] = [snap(visited, [], [])];

    for (const e of sorted) {
        steps.push(snap(visited, [[e.from, e.to]], tree));
        const ra = find(e.from);
        const rb = find(e.to);
        if (ra !== rb) {
            parent[ra] = rb;
            tree.push([e.from, e.to]);
            if (!visited.includes(e.from)) visited.push(e.from);
            if (!visited.includes(e.to)) visited.push(e.to);
            steps.push(snap(visited, [[e.from, e.to]], tree));
        }
    }
    steps.push(snap(visited, [], tree));
    return steps;
}

export function topoSortSteps(): GraphStep[] {
    const adj = directedAdj();
    const visited: string[] = [];
    const order: string[] = [];
    const seen = new Set<string>();
    const steps: GraphStep[] = [];

    function visit(node: string): void {
        seen.add(node);
        visited.push(node);
        steps.push(snap(visited, [], [], node, Object.fromEntries(order.map((id, i) => [id, String(i + 1)]))));
        for (const { to } of adj.get(node)!) {
            if (!seen.has(to)) {
                steps.push(snap(visited, [[node, to]], [], node, Object.fromEntries(order.map((id, i) => [id, String(i + 1)]))));
                visit(to);
            }
        }
        order.push(node);
        steps.push(snap(visited, [], [], node, Object.fromEntries(order.map((id, i) => [id, String(i + 1)]))));
    }

    for (const n of NODES) if (!seen.has(n.id)) visit(n.id);
    return steps;
}

export function bellmanFordSteps(start = 'A'): GraphStep[] {
    const adj = directedAdj();
    const dist: Record<string, number> = Object.fromEntries(NODES.map((n) => [n.id, Infinity]));
    dist[start] = 0;
    const steps: GraphStep[] = [];
    const labels = () => Object.fromEntries(Object.entries(dist).map(([k, v]) => [k, v === Infinity ? '\u221E' : String(v)]));
    const relaxed: [string, string][] = [];
    const visited = NODES.map((n) => n.id).filter((id) => dist[id] !== Infinity || id === start);

    steps.push(snap(visited, [], [], start, labels()));
    for (let i = 0; i < NODES.length - 1; i++) {
        for (const e of EDGES) {
            const { from, to } = e;
            for (const { to: target, weight: w } of adj.get(from) ?? []) {
                if (target !== to) continue;
                steps.push(snap(Object.keys(dist).filter((k) => dist[k] !== Infinity), [[from, to]], relaxed, from, labels()));
                if (dist[from] + w < dist[to]) {
                    dist[to] = dist[from] + w;
                    if (!relaxed.some(([a, b]) => a === from && b === to)) relaxed.push([from, to]);
                    steps.push(snap(Object.keys(dist).filter((k) => dist[k] !== Infinity), [[from, to]], relaxed, to, labels()));
                }
            }
        }
    }
    steps.push(snap(Object.keys(dist).filter((k) => dist[k] !== Infinity), [], relaxed, undefined, labels()));
    return steps;
}

export function aStarSteps(start = 'A', goal = 'H'): GraphStep[] {
    const adj = undirectedAdj();
    const pos = nodeMap();
    const h = (id: string) => Math.hypot(pos[id].x - pos[goal].x, pos[id].y - pos[goal].y) / 20;

    const g: Record<string, number> = Object.fromEntries(NODES.map((n) => [n.id, Infinity]));
    g[start] = 0;
    const visited: string[] = [];
    const tree: [string, string][] = [];
    const done = new Set<string>();
    const steps: GraphStep[] = [];
    const labels = () => Object.fromEntries(Object.entries(g).map(([k, v]) => [k, v === Infinity ? '\u221E' : v.toFixed(1)]));

    while (done.size < NODES.length) {
        let u: string | null = null;
        let best = Infinity;
        for (const n of NODES) {
            if (!done.has(n.id) && g[n.id] !== Infinity) {
                const f = g[n.id] + h(n.id);
                if (f < best) { best = f; u = n.id; }
            }
        }
        if (u === null) break;
        done.add(u);
        visited.push(u);
        steps.push(snap(visited, [], tree, u, labels()));
        if (u === goal) break;
        for (const { to, weight } of adj.get(u)!) {
            steps.push(snap(visited, [[u, to]], tree, u, labels()));
            if (g[u] + weight < g[to]) {
                g[to] = g[u] + weight;
                tree.push([u, to]);
                steps.push(snap(visited, [[u, to]], tree, u, labels()));
            }
        }
    }
    steps.push(snap(visited, [], tree, undefined, labels()));
    return steps;
}

export const GRAPH_GENERATORS: Record<string, () => GraphStep[]> = {
    Bfs: () => bfsSteps('A'),
    Dfs: () => dfsSteps('A'),
    Dij: () => dijkstraSteps('A'),
    Prm: () => primSteps('A'),
    Krk: () => kruskalSteps(),
    Tpo: () => topoSortSteps(),
    Bfd: () => bellmanFordSteps('A'),
    'A*': () => aStarSteps('A', 'H'),
};

const SVG_NS = 'http://www.w3.org/2000/svg';

export class GraphPlayer {
    private steps: GraphStep[] = [];
    private idx = 0;
    private timer: number | null = null;
    private speedMs = 650;

    constructor(
        private svg: SVGSVGElement,
        private onStepChange?: (idx: number, total: number) => void,
    ) {}

    load(steps: GraphStep[]): void {
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

        const pos = nodeMap();
        const isIncluded = (a: string, b: string) =>
            step.includedEdges.some(([x, y]) => edgeKey(x, y) === edgeKey(a, b));
        const isActive = (a: string, b: string) =>
            step.activeEdges.some(([x, y]) => edgeKey(x, y) === edgeKey(a, b));

        // edges
        EDGES.forEach((e) => {
            const line = document.createElementNS(SVG_NS, 'line');
            line.setAttribute('x1', String(pos[e.from].x));
            line.setAttribute('y1', String(pos[e.from].y));
            line.setAttribute('x2', String(pos[e.to].x));
            line.setAttribute('y2', String(pos[e.to].y));
            const included = isIncluded(e.from, e.to);
            const active = isActive(e.from, e.to);
            line.setAttribute('stroke', included ? 'var(--search)' : active ? 'var(--greedy)' : 'var(--grid-line)');
            line.setAttribute('stroke-width', included || active ? '3' : '1.5');
            this.svg.appendChild(line);

            const mx = (pos[e.from].x + pos[e.to].x) / 2;
            const my = (pos[e.from].y + pos[e.to].y) / 2;
            const wLabel = document.createElementNS(SVG_NS, 'text');
            wLabel.setAttribute('x', String(mx));
            wLabel.setAttribute('y', String(my - 4));
            wLabel.setAttribute('font-size', '9');
            wLabel.setAttribute('fill', 'var(--muted)');
            wLabel.setAttribute('text-anchor', 'middle');
            wLabel.textContent = String(e.weight);
            this.svg.appendChild(wLabel);
        });

        // nodes
        NODES.forEach((n) => {
            const visited = step.visited.includes(n.id);
            const current = step.current === n.id;
            const circle = document.createElementNS(SVG_NS, 'circle');
            circle.setAttribute('cx', String(n.x));
            circle.setAttribute('cy', String(n.y));
            circle.setAttribute('r', current ? '14' : '11');
            circle.setAttribute('fill', visited ? 'var(--graph-dim)' : 'var(--panel)');
            circle.setAttribute('stroke', current ? 'var(--greedy)' : visited ? 'var(--graph)' : 'var(--grid-line)');
            circle.setAttribute('stroke-width', current ? '3' : '2');
            this.svg.appendChild(circle);

            const text = document.createElementNS(SVG_NS, 'text');
            text.setAttribute('x', String(n.x));
            text.setAttribute('y', String(n.y + 4));
            text.setAttribute('font-size', '11');
            text.setAttribute('font-weight', '700');
            text.setAttribute('text-anchor', 'middle');
            text.setAttribute('fill', 'var(--text)');
            text.textContent = n.id;
            this.svg.appendChild(text);

            if (step.labels?.[n.id] !== undefined) {
                const label = document.createElementNS(SVG_NS, 'text');
                label.setAttribute('x', String(n.x));
                label.setAttribute('y', String(n.y + 24));
                label.setAttribute('font-size', '9');
                label.setAttribute('text-anchor', 'middle');
                label.setAttribute('fill', 'var(--muted)');
                label.textContent = step.labels[n.id];
                this.svg.appendChild(label);
            }
        });

        this.onStepChange?.(this.idx, this.steps.length - 1);
    }
}