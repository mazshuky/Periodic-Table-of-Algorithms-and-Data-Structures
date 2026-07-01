import type { GNode, GEdge, GraphStep } from './graphVisualizer.ts';

// ---------- Floyd-Warshall: animated distance matrix ----------

export interface MatrixStep {
    matrix: number[][];
    k: number; // intermediate node index this step is using (-1 before start)
    i: number; // row being updated
    j: number; // column being updated
    updated: boolean; // true if dist[i][j] just improved
}

const INF = Infinity;

// Small directed weighted graph, reusing the same node labels as the main graph
// but a simpler edge set so the 5x5 matrix stays readable.
export const FW_NODES = ['A', 'B', 'C', 'D', 'E'];
export const FW_EDGES: { from: string; to: string; weight: number }[] = [
    { from: 'A', to: 'B', weight: 3 },
    { from: 'A', to: 'C', weight: 8 },
    { from: 'B', to: 'D', weight: 1 },
    { from: 'C', to: 'B', weight: 4 },
    { from: 'D', to: 'C', weight: 2 },
    { from: 'D', to: 'E', weight: 6 },
    { from: 'E', to: 'A', weight: 7 },
];

export function floydWarshallSteps(): MatrixStep[] {
    const n = FW_NODES.length;
    const idx = Object.fromEntries(FW_NODES.map((id, i) => [id, i]));
    const dist: number[][] = Array.from({ length: n }, () => new Array(n).fill(INF));
    for (let i = 0; i < n; i++) dist[i][i] = 0;
    FW_EDGES.forEach((e) => { dist[idx[e.from]][idx[e.to]] = e.weight; });

    const steps: MatrixStep[] = [{ matrix: dist.map((r) => [...r]), k: -1, i: -1, j: -1, updated: false }];

    for (let k = 0; k < n; k++) {
        for (let i = 0; i < n; i++) {
            for (let j = 0; j < n; j++) {
                const through = dist[i][k] + dist[k][j];
                const updated = dist[i][k] !== INF && dist[k][j] !== INF && through < dist[i][j];
                if (updated) dist[i][j] = through;
                steps.push({ matrix: dist.map((r) => [...r]), k, i, j, updated });
            }
        }
    }
    return steps;
}

export class MatrixPlayer {
    private steps: MatrixStep[] = [];
    private idx = 0;
    private timer: number | null = null;
    private speedMs = 90;

    constructor(
        private container: HTMLElement,
        private onStepChange?: (idx: number, total: number) => void,
    ) {}

    load(steps: MatrixStep[]): void {
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
        const n = FW_NODES.length;
        this.container.innerHTML = '';

        const table = document.createElement('table');
        table.className = 'fw-table';

        const headRow = document.createElement('tr');
        headRow.appendChild(document.createElement('th'));
        FW_NODES.forEach((label, j) => {
            const th = document.createElement('th');
            th.textContent = label;
            if (j === step.k) th.classList.add('fw-k');
            headRow.appendChild(th);
        });
        table.appendChild(headRow);

        for (let i = 0; i < n; i++) {
            const row = document.createElement('tr');
            const rowHead = document.createElement('th');
            rowHead.textContent = FW_NODES[i];
            if (i === step.k) rowHead.classList.add('fw-k');
            row.appendChild(rowHead);

            for (let j = 0; j < n; j++) {
                const cell = document.createElement('td');
                const v = step.matrix[i][j];
                cell.textContent = v === INF ? '\u221E' : String(v);
                if (i === step.i && j === step.j) {
                    cell.classList.add(step.updated ? 'fw-updated' : 'fw-active');
                }
                row.appendChild(cell);
            }
            table.appendChild(row);
        }

        this.container.appendChild(table);

        const caption = document.createElement('div');
        caption.className = 'fw-caption';
        caption.textContent = step.k === -1
            ? 'Initial distances from direct edges'
            : `Trying path through ${FW_NODES[step.k]}: is ${FW_NODES[step.i]}\u2192${FW_NODES[step.j]} shorter via ${FW_NODES[step.k]}?`;
        this.container.appendChild(caption);

        this.onStepChange?.(this.idx, this.steps.length - 1);
    }
}

// ---------- Tarjan's SCC: small directed graph with a cycle, colored by group ----------

export const TARJAN_NODES: GNode[] = [
    { id: 'A', x: 60, y: 60 },
    { id: 'B', x: 200, y: 40 },
    { id: 'C', x: 340, y: 60 },
    { id: 'D', x: 60, y: 190 },
    { id: 'E', x: 200, y: 190 },
    { id: 'F', x: 340, y: 190 },
];

export const TARJAN_EDGES: GEdge[] = [
    { from: 'A', to: 'B', weight: 1 },
    { from: 'B', to: 'C', weight: 1 },
    { from: 'C', to: 'A', weight: 1 }, // cycle: A -> B -> C -> A
    { from: 'B', to: 'D', weight: 1 },
    { from: 'D', to: 'E', weight: 1 },
    { from: 'E', to: 'D', weight: 1 }, // cycle: D -> E -> D
    { from: 'E', to: 'F', weight: 1 },
];

export interface TarjanStep extends GraphStep {
    groups?: Record<string, number>; // node id -> SCC group index, once finalized
}

function tsnap(
    visited: string[],
    activeEdges: [string, string][] = [],
    includedEdges: [string, string][] = [],
    current?: string,
    groups?: Record<string, number>,
): TarjanStep {
    return {
        visited: [...visited],
        current,
        activeEdges: [...activeEdges],
        includedEdges: includedEdges.map((e) => [...e] as [string, string]),
        groups: groups ? { ...groups } : undefined,
    };
}

export function tarjanSteps(): TarjanStep[] {
    const adj = new Map<string, string[]>();
    TARJAN_NODES.forEach((n) => adj.set(n.id, []));
    TARJAN_EDGES.forEach((e) => adj.get(e.from)!.push(e.to));

    let counter = 0;
    const disc: Record<string, number> = {};
    const low: Record<string, number> = {};
    const onStack = new Set<string>();
    const stack: string[] = [];
    const visited: string[] = [];
    const groups: Record<string, number> = {};
    let groupCount = 0;
    const steps: TarjanStep[] = [];

    function strongConnect(u: string): void {
        disc[u] = low[u] = counter++;
        stack.push(u);
        onStack.add(u);
        visited.push(u);
        steps.push(tsnap(visited, [], [], u, { ...groups }));

        for (const v of adj.get(u)!) {
            steps.push(tsnap(visited, [[u, v]], [], u, { ...groups }));
            if (disc[v] === undefined) {
                strongConnect(v);
                low[u] = Math.min(low[u], low[v]);
                steps.push(tsnap(visited, [[u, v]], [], u, { ...groups }));
            } else if (onStack.has(v)) {
                low[u] = Math.min(low[u], disc[v]);
                steps.push(tsnap(visited, [[u, v]], [], u, { ...groups }));
            }
        }

        if (low[u] === disc[u]) {
            const group = groupCount++;
            let w: string;
            do {
                w = stack.pop()!;
                onStack.delete(w);
                groups[w] = group;
            } while (w !== u);
            steps.push(tsnap(visited, [], [], u, { ...groups }));
        }
    }

    for (const n of TARJAN_NODES) {
        if (disc[n.id] === undefined) strongConnect(n.id);
    }

    steps.push(tsnap(visited, [], [], undefined, { ...groups }));
    return steps;
}

const SVG_NS = 'http://www.w3.org/2000/svg';
const GROUP_COLORS = ['var(--graph)', 'var(--search)', 'var(--tree)', 'var(--dp)', 'var(--greedy)', 'var(--hash)'];

export class TarjanPlayer {
    private steps: TarjanStep[] = [];
    private idx = 0;
    private timer: number | null = null;
    private speedMs = 700;

    constructor(
        private svg: SVGSVGElement,
        private onStepChange?: (idx: number, total: number) => void,
    ) {}

    load(steps: TarjanStep[]): void {
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

        const pos = Object.fromEntries(TARJAN_NODES.map((n) => [n.id, n]));
        const isActive = (a: string, b: string) =>
            step.activeEdges.some(([x, y]) => x === a && y === b);

        const defs = document.createElementNS(SVG_NS, 'defs');
        const marker = document.createElementNS(SVG_NS, 'marker');
        marker.setAttribute('id', 'tarjanArrow');
        marker.setAttribute('markerWidth', '8');
        marker.setAttribute('markerHeight', '8');
        marker.setAttribute('refX', '14');
        marker.setAttribute('refY', '4');
        marker.setAttribute('orient', 'auto');
        const arrowPath = document.createElementNS(SVG_NS, 'path');
        arrowPath.setAttribute('d', 'M0,0 L8,4 L0,8 Z');
        arrowPath.setAttribute('fill', 'var(--muted)');
        marker.appendChild(arrowPath);
        defs.appendChild(marker);
        this.svg.appendChild(defs);

        TARJAN_EDGES.forEach((e) => {
            const line = document.createElementNS(SVG_NS, 'line');
            line.setAttribute('x1', String(pos[e.from].x));
            line.setAttribute('y1', String(pos[e.from].y));
            line.setAttribute('x2', String(pos[e.to].x));
            line.setAttribute('y2', String(pos[e.to].y));
            const active = isActive(e.from, e.to);
            line.setAttribute('stroke', active ? 'var(--greedy)' : 'var(--grid-line)');
            line.setAttribute('stroke-width', active ? '3' : '1.5');
            line.setAttribute('marker-end', 'url(#tarjanArrow)');
            this.svg.appendChild(line);
        });

        TARJAN_NODES.forEach((n) => {
            const visited = step.visited.includes(n.id);
            const current = step.current === n.id;
            const group = step.groups?.[n.id];
            const groupColor = group !== undefined ? GROUP_COLORS[group % GROUP_COLORS.length] : undefined;

            const circle = document.createElementNS(SVG_NS, 'circle');
            circle.setAttribute('cx', String(n.x));
            circle.setAttribute('cy', String(n.y));
            circle.setAttribute('r', current ? '14' : '11');
            circle.setAttribute('fill', groupColor ? groupColor : visited ? 'var(--graph-dim)' : 'var(--panel)');
            circle.setAttribute('fill-opacity', groupColor ? '0.35' : '1');
            circle.setAttribute('stroke', current ? 'var(--greedy)' : groupColor ?? (visited ? 'var(--graph)' : 'var(--grid-line)'));
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
        });

        this.onStepChange?.(this.idx, this.steps.length - 1);
    }
}