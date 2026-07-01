// Three very different visual shapes:
// - Huffman Coding    → animated tree build (forest merging)
// - Activity Selection → animated interval/timeline chart
// - Job Scheduling    → animated Gantt-style slot assignment

// ---------- Huffman Coding ----------

export interface HuffStep {
    nodes: HuffNode[];
    merged?: [string, string]; // IDs of the two just-merged nodes
    caption: string;
}

export interface HuffNode {
    id: string;
    freq: number;
    char?: string;
    left?: string;
    right?: string;
}

export function huffmanSteps(): HuffStep[] {
    const freqs: [string, number][] = [
        ['a', 5], ['b', 9], ['c', 12], ['d', 13], ['e', 16], ['f', 45],
    ];
    let counter = 0;
    const idOf = () => `h${counter++}`;
    const steps: HuffStep[] = [];
    const nodes = new Map<string, HuffNode>();

    freqs.forEach(([ch, freq]) => {
        const id = idOf();
        nodes.set(id, { id, freq, char: ch });
    });

    const forest = [...nodes.keys()];
    steps.push({ nodes: snap(nodes), caption: `Initial forest: ${freqs.map(([c, f]) => `${c}(${f})`).join(', ')}` });

    while (forest.length > 1) {
        forest.sort((a, b) => nodes.get(a)!.freq - nodes.get(b)!.freq);
        const leftId = forest.shift()!;
        const rightId = forest.shift()!;
        const left = nodes.get(leftId)!;
        const right = nodes.get(rightId)!;
        const newId = idOf();
        const merged: HuffNode = { id: newId, freq: left.freq + right.freq, left: leftId, right: rightId };
        nodes.set(newId, merged);
        forest.push(newId);
        steps.push({
            nodes: snap(nodes),
            merged: [leftId, rightId],
            caption: `Merge ${nLabel(left)} (${left.freq}) + ${nLabel(right)} (${right.freq}) → internal node (${merged.freq})`,
        });
    }

    steps.push({ nodes: snap(nodes), caption: 'Huffman tree complete — left edges = 0, right edges = 1' });
    return steps;
}

function nLabel(n: HuffNode): string { return n.char ?? `(${n.freq})`; }
function snap(nodes: Map<string, HuffNode>): HuffNode[] { return [...nodes.values()].map((n) => ({ ...n })); }

const SVG_NS = 'http://www.w3.org/2000/svg';

export class HuffmanPlayer {
    private steps: HuffStep[] = [];
    private idx = 0;
    private timer: number | null = null;
    private speedMs = 900;

    constructor(
        private svg: SVGSVGElement,
        private captionEl: HTMLElement,
        private onStepChange?: (idx: number, total: number) => void,
    ) {}

    load(steps: HuffStep[]): void { this.pause(); this.steps = steps; this.idx = 0; this.render(); }

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
        while (this.svg.firstChild) this.svg.removeChild(this.svg.firstChild);

        const nodeMap = new Map(step.nodes.map((n) => [n.id, n]));
        const childIds = new Set(step.nodes.flatMap((n) => [n.left, n.right].filter(Boolean) as string[]));
        const roots = step.nodes.filter((n) => !childIds.has(n.id));

        interface Pos { x: number; y: number; }
        const positions = new Map<string, Pos>();
        let offsetX = 0;

        function treeWidth(id: string): number {
            const n = nodeMap.get(id)!;
            if (!n.left && !n.right) return 1;
            return (n.left ? treeWidth(n.left) : 0) + (n.right ? treeWidth(n.right) : 0);
        }

        function layout(id: string, depth: number, leafIdx: { v: number }): number {
            const n = nodeMap.get(id)!;
            let x: number;
            if (!n.left && !n.right) { x = leafIdx.v * 44; leafIdx.v++; }
            else {
                const xs: number[] = [];
                if (n.left) xs.push(layout(n.left, depth + 1, leafIdx));
                if (n.right) xs.push(layout(n.right, depth + 1, leafIdx));
                x = xs.reduce((a, b) => a + b, 0) / xs.length;
            }
            positions.set(id, { x: x + offsetX, y: depth * 52 });
            return x;
        }

        roots.forEach((r) => {
            const leafIdx = { v: 0 };
            layout(r.id, 0, leafIdx);
            offsetX += treeWidth(r.id) * 44 + 20;
        });

        const allX = [...positions.values()].map((p) => p.x);
        const allY = [...positions.values()].map((p) => p.y);
        const minX = Math.min(...allX) - 24;
        const maxX = Math.max(...allX) + 24;
        const maxY = Math.max(...allY) + 32;
        this.svg.setAttribute('viewBox', `${minX} -20 ${maxX - minX} ${maxY + 40}`);

        // Edges
        step.nodes.forEach((n) => {
            [n.left, n.right].filter(Boolean).forEach((childId, side) => {
                const pa = positions.get(n.id);
                const pb = positions.get(childId!);
                if (!pa || !pb) return;
                const line = document.createElementNS(SVG_NS, 'line');
                line.setAttribute('x1', String(pa.x)); line.setAttribute('y1', String(pa.y));
                line.setAttribute('x2', String(pb.x)); line.setAttribute('y2', String(pb.y));
                line.setAttribute('stroke', 'var(--grid-line)'); line.setAttribute('stroke-width', '1.5');
                this.svg.appendChild(line);
                const mx = (pa.x + pb.x) / 2 + (side === 0 ? -8 : 8);
                const my = (pa.y + pb.y) / 2;
                const edgeTxt = document.createElementNS(SVG_NS, 'text');
                edgeTxt.setAttribute('x', String(mx)); edgeTxt.setAttribute('y', String(my));
                edgeTxt.setAttribute('font-size', '9'); edgeTxt.setAttribute('fill', 'var(--muted)');
                edgeTxt.setAttribute('text-anchor', 'middle'); edgeTxt.textContent = String(side);
                this.svg.appendChild(edgeTxt);
            });
        });

        // Nodes
        step.nodes.forEach((n) => {
            const pos = positions.get(n.id);
            if (!pos) return;
            const isMerged = step.merged && (n.id === step.merged[0] || n.id === step.merged[1]);
            const circle = document.createElementNS(SVG_NS, 'circle');
            circle.setAttribute('cx', String(pos.x)); circle.setAttribute('cy', String(pos.y));
            circle.setAttribute('r', '16');
            circle.setAttribute('fill', n.char ? 'var(--greedy-dim)' : 'var(--panel)');
            circle.setAttribute('stroke', isMerged ? 'var(--greedy)' : 'var(--grid-line)');
            circle.setAttribute('stroke-width', isMerged ? '2.5' : '1.5');
            this.svg.appendChild(circle);

            const label = n.char ? `${n.char}:${n.freq}` : String(n.freq);
            const txt = document.createElementNS(SVG_NS, 'text');
            txt.setAttribute('x', String(pos.x)); txt.setAttribute('y', String(pos.y + 4));
            txt.setAttribute('font-size', '9'); txt.setAttribute('font-weight', '700');
            txt.setAttribute('text-anchor', 'middle'); txt.setAttribute('fill', 'var(--text)');
            txt.textContent = label;
            this.svg.appendChild(txt);
        });

        this.captionEl.textContent = step.caption;
        this.onStepChange?.(this.idx, this.steps.length - 1);
    }
}

// ---------- Activity Selection ----------

export interface ActivityStep {
    activities: Activity[];
    selected: number[];
    current: number;
    rejected: number[];
    caption: string;
}

export interface Activity { start: number; end: number; label: string; }

export function activitySelectionSteps(): ActivityStep[] {
    const activities: Activity[] = [
        { start: 1, end: 4, label: 'A' },
        { start: 3, end: 5, label: 'B' },
        { start: 0, end: 6, label: 'C' },
        { start: 5, end: 7, label: 'D' },
        { start: 3, end: 9, label: 'E' },
        { start: 5, end: 9, label: 'F' },
        { start: 6, end: 10, label: 'G' },
        { start: 8, end: 11, label: 'H' },
        { start: 8, end: 12, label: 'I' },
        { start: 2, end: 14, label: 'J' },
        { start: 12, end: 16, label: 'K' },
    ];

    const sorted = [...activities].sort((a, b) => a.end - b.end);
    const steps: ActivityStep[] = [];
    const selected: number[] = [];
    const rejected: number[] = [];

    steps.push({ activities: sorted, selected: [], current: -1, rejected: [], caption: 'Sort activities by earliest finish time' });

    let lastEnd = -Infinity;
    sorted.forEach((act, i) => {
        steps.push({ activities: sorted, selected: [...selected], current: i, rejected: [...rejected], caption: `Examine ${act.label}: start=${act.start}, end=${act.end}. Last end = ${lastEnd === -Infinity ? '—' : lastEnd}` });
        if (act.start >= lastEnd) {
            selected.push(i);
            lastEnd = act.end;
            steps.push({ activities: sorted, selected: [...selected], current: i, rejected: [...rejected], caption: `✓ Select ${act.label} — no overlap. Last end → ${act.end}` });
        } else {
            rejected.push(i);
            steps.push({ activities: sorted, selected: [...selected], current: -1, rejected: [...rejected], caption: `✗ Skip ${act.label} — start ${act.start} < last end ${lastEnd}` });
        }
    });

    steps.push({ activities: sorted, selected: [...selected], current: -1, rejected: [...rejected], caption: `Done — ${selected.length} activities selected: ${selected.map((i) => sorted[i].label).join(', ')}` });
    return steps;
}

export class ActivityPlayer {
    private steps: ActivityStep[] = [];
    private idx = 0;
    private timer: number | null = null;
    private speedMs = 900;

    constructor(
        private container: HTMLElement,
        private captionEl: HTMLElement,
        private onStepChange?: (idx: number, total: number) => void,
    ) {}

    load(steps: ActivityStep[]): void { this.pause(); this.steps = steps; this.idx = 0; this.render(); }

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

        const maxTime = Math.max(...step.activities.map((a) => a.end));
        const colW = 20;
        const rowH = 20;
        const labelW = 20;

        const header = document.createElement('div');
        header.style.cssText = `display:flex; margin-left:${labelW}px; margin-bottom:4px;`;
        for (let t = 0; t <= maxTime; t++) {
            const tick = document.createElement('div');
            tick.style.cssText = `width:${colW}px; flex:none; font-size:9px; color:var(--muted); text-align:center;`;
            tick.textContent = String(t);
            header.appendChild(tick);
        }
        this.container.appendChild(header);

        step.activities.forEach((act, i) => {
            const row = document.createElement('div');
            row.style.cssText = `display:flex; align-items:center; margin-bottom:3px; height:${rowH}px;`;

            const lbl = document.createElement('div');
            lbl.style.cssText = `width:${labelW}px; flex:none; font-size:10px; font-weight:700; color:var(--muted); text-align:right; padding-right:4px;`;
            lbl.textContent = act.label;
            row.appendChild(lbl);

            const track = document.createElement('div');
            track.style.cssText = `position:relative; width:${maxTime * colW}px; height:${rowH - 4}px; flex:none;`;

            const isSelected = step.selected.includes(i);
            const isRejected = step.rejected.includes(i);
            const isCurrent = step.current === i;
            const color = isSelected ? 'var(--search)' : isCurrent ? 'var(--greedy)' : 'var(--grid-line)';

            const bar = document.createElement('div');
            bar.style.cssText = `
        position:absolute;
        left:${act.start * colW}px;
        width:${(act.end - act.start) * colW - 2}px;
        height:100%;
        border-radius:3px;
        background:${isSelected ? 'var(--search-dim)' : isCurrent ? 'var(--greedy-dim)' : 'var(--panel)'};
        border:1.5px solid ${color};
        display:flex; align-items:center; justify-content:center;
        font-size:9px; font-weight:700; color:${color};
        opacity:${isRejected ? '0.35' : '1'};
      `;
            bar.textContent = `${act.start}–${act.end}`;
            track.appendChild(bar);
            row.appendChild(track);
            this.container.appendChild(row);
        });

        this.captionEl.textContent = step.caption;
        this.onStepChange?.(this.idx, this.steps.length - 1);
    }
}

// ---------- Job Scheduling (by deadline, maximize profit) ----------

export interface JobStep {
    jobs: Job[];
    slots: (string | null)[];
    current: number;
    scheduled: number[];
    caption: string;
}

export interface Job { label: string; deadline: number; profit: number; }

export function jobSchedulingSteps(): JobStep[] {
    const jobs: Job[] = [
        { label: 'J1', deadline: 2, profit: 100 },
        { label: 'J2', deadline: 1, profit: 19 },
        { label: 'J3', deadline: 2, profit: 27 },
        { label: 'J4', deadline: 1, profit: 25 },
        { label: 'J5', deadline: 3, profit: 15 },
    ];

    const sorted = [...jobs].sort((a, b) => b.profit - a.profit);
    const maxDeadline = Math.max(...jobs.map((j) => j.deadline));
    const slots: (string | null)[] = new Array(maxDeadline).fill(null);
    const scheduled: number[] = [];
    const steps: JobStep[] = [];

    steps.push({ jobs: sorted, slots: [...slots], current: -1, scheduled: [], caption: 'Sort jobs by profit (descending). Assign each to the latest free slot ≤ its deadline.' });

    sorted.forEach((job, i) => {
        steps.push({ jobs: sorted, slots: [...slots], current: i, scheduled: [...scheduled], caption: `Examine ${job.label}: profit=${job.profit}, deadline=${job.deadline}. Find latest free slot ≤ ${job.deadline}.` });
        let placed = false;
        for (let s = job.deadline - 1; s >= 0; s--) {
            if (!slots[s]) {
                slots[s] = job.label;
                scheduled.push(i);
                placed = true;
                steps.push({ jobs: sorted, slots: [...slots], current: i, scheduled: [...scheduled], caption: `✓ Schedule ${job.label} in slot ${s + 1} (profit ${job.profit})` });
                break;
            }
        }
        if (!placed) {
            steps.push({ jobs: sorted, slots: [...slots], current: -1, scheduled: [...scheduled], caption: `✗ No free slot ≤ deadline ${job.deadline} for ${job.label} — skip` });
        }
    });

    const totalProfit = scheduled.reduce((sum, i) => sum + sorted[i].profit, 0);
    steps.push({ jobs: sorted, slots: [...slots], current: -1, scheduled: [...scheduled], caption: `Done — ${scheduled.length} jobs scheduled, total profit = ${totalProfit}` });
    return steps;
}

export class JobSchedulingPlayer {
    private steps: JobStep[] = [];
    private idx = 0;
    private timer: number | null = null;
    private speedMs = 900;

    constructor(
        private container: HTMLElement,
        private captionEl: HTMLElement,
        private onStepChange?: (idx: number, total: number) => void,
    ) {}

    load(steps: JobStep[]): void { this.pause(); this.steps = steps; this.idx = 0; this.render(); }

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

        const wrap = document.createElement('div');
        wrap.style.cssText = 'display:flex; gap:16px; align-items:flex-start;';

        // Job table
        const jobTable = document.createElement('table');
        jobTable.className = 'fw-table';
        jobTable.style.cssText = 'width:auto; font-size:10px; flex:none;';
        const thead = document.createElement('tr');
        ['Job', 'Profit', 'Deadline'].forEach((h) => {
            const th = document.createElement('th'); th.textContent = h; thead.appendChild(th);
        });
        jobTable.appendChild(thead);

        const scheduledLabels = new Set(step.scheduled.map((i) => step.jobs[i].label));
        step.jobs.forEach((job, i) => {
            const tr = document.createElement('tr');
            const isCurrent = step.current === i;
            const isScheduled = scheduledLabels.has(job.label);
            ['label', 'profit', 'deadline'].forEach((key) => {
                const td = document.createElement('td');
                td.textContent = String(job[key as keyof Job]);
                if (isCurrent) td.classList.add('fw-active');
                if (isScheduled) td.classList.add('fw-updated');
                tr.appendChild(td);
            });
            jobTable.appendChild(tr);
        });
        wrap.appendChild(jobTable);

        // Slot visualizer
        const gantt = document.createElement('div');
        gantt.style.cssText = 'flex:1;';
        const slotLabel = document.createElement('div');
        slotLabel.style.cssText = 'font-size:10px; color:var(--muted); margin-bottom:8px;';
        slotLabel.textContent = 'Time slots:';
        gantt.appendChild(slotLabel);

        const slotsRow = document.createElement('div');
        slotsRow.style.cssText = 'display:flex; gap:6px;';
        step.slots.forEach((label, s) => {
            const slot = document.createElement('div');
            slot.style.cssText = `
        width:54px; height:54px; border-radius:6px;
        display:flex; flex-direction:column; align-items:center; justify-content:center;
        font-size:11px; font-weight:700;
        background:${label ? 'var(--search-dim)' : 'var(--panel)'};
        border:1.5px solid ${label ? 'var(--search)' : 'var(--grid-line)'};
        color:${label ? 'var(--search)' : 'var(--muted)'};
      `;
            const slotNum = document.createElement('div');
            slotNum.style.cssText = 'font-size:8px; color:var(--muted); font-weight:400;';
            slotNum.textContent = `slot ${s + 1}`;
            slot.appendChild(slotNum);
            const jobLabel = document.createElement('div');
            jobLabel.textContent = label ?? '—';
            slot.appendChild(jobLabel);
            slotsRow.appendChild(slot);
        });
        gantt.appendChild(slotsRow);
        wrap.appendChild(gantt);
        this.container.appendChild(wrap);

        this.captionEl.textContent = step.caption;
        this.onStepChange?.(this.idx, this.steps.length - 1);
    }
}