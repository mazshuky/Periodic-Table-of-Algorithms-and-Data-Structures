// ---------- Karatsuba Multiplication ----------

export interface KaraStep {
    level: number;
    label: string;
    x: number;
    y: number;
    result?: number;
    caption: string;
}

export function karatsubaSteps(): KaraStep[] {
    const steps: KaraStep[] = [];

    function karatsuba(x: number, y: number, level: number): number {
        const label = `${x} × ${y}`;
        steps.push({ level, label, x, y, caption: `Level ${level}: multiply ${x} × ${y}` });

        if (x < 10 || y < 10) {
            const result = x * y;
            steps.push({ level, label, x, y, result, caption: `Base case: ${x} × ${y} = ${result}` });
            return result;
        }

        const m = Math.floor(Math.max(String(x).length, String(y).length) / 2);
        const p = Math.pow(10, m);
        const [a, b] = [Math.floor(x / p), x % p];
        const [c, d] = [Math.floor(y / p), y % p];

        steps.push({ level, label, x, y, caption: `Split: ${x}=(${a},${b}), ${y}=(${c},${d}), m=${m}` });

        const ac = karatsuba(a, c, level + 1);
        const bd = karatsuba(b, d, level + 1);
        const abcd = karatsuba(a + b, c + d, level + 1);
        const middle = abcd - ac - bd;
        const result = ac * Math.pow(10, 2 * m) + middle * p + bd;

        steps.push({ level, label, x, y, result, caption: `Combine: ac=${ac}, bd=${bd}, middle=${middle} → ${x}×${y} = ${result}` });
        return result;
    }

    karatsuba(1234, 5678, 0);
    return steps;
}

export class KaratsubaPlayer {
    private steps: KaraStep[] = [];
    private idx = 0;
    private timer: number | null = null;
    private speedMs = 800;

    constructor(
        private container: HTMLElement,
        private captionEl: HTMLElement,
        private onStepChange?: (idx: number, total: number) => void,
    ) {}

    load(steps: KaraStep[]): void { this.pause(); this.steps = steps; this.idx = 0; this.render(); }
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

        // Show all steps up to current as a call stack trace
        const visible = this.steps.slice(0, this.idx + 1);
        const scroll = document.createElement('div');
        scroll.style.cssText = 'max-height:160px; overflow-y:auto; display:flex; flex-direction:column; gap:3px;';

        visible.forEach((s, i) => {
            const row = document.createElement('div');
            const isCurrent = i === this.idx;
            const indent = s.level * 16;
            row.style.cssText = `padding:4px 8px; padding-left:${indent + 8}px; border-radius:4px; font-size:10px; background:${isCurrent ? 'var(--dac-dim)' : 'transparent'}; border:${isCurrent ? '1px solid var(--dac)' : '1px solid transparent'}; color:${s.result !== undefined ? 'var(--dac)' : 'var(--text)'};`;
            row.textContent = s.result !== undefined ? `${s.label} = ${s.result}` : s.label;
            scroll.appendChild(row);
        });

        this.container.appendChild(scroll);
        this.captionEl.textContent = step.caption;
        this.onStepChange?.(this.idx, this.steps.length - 1);
    }
}

// ---------- N-Queens ----------

export interface QueensStep {
    board: number[];   // board[row] = col of queen (-1 if empty)
    n: number;
    activeRow: number;
    activeCol: number;
    backtrack: boolean;
    caption: string;
}

export function nQueensSteps(n = 6): QueensStep[] {
    const steps: QueensStep[] = [];
    const board = new Array(n).fill(-1);

    function snap(activeRow: number, activeCol: number, backtrack = false, caption = ''): QueensStep {
        return { board: [...board], n, activeRow, activeCol, backtrack, caption };
    }

    function isSafe(row: number, col: number): boolean {
        for (let r = 0; r < row; r++) {
            if (board[r] === col || Math.abs(board[r] - col) === Math.abs(r - row)) return false;
        }
        return true;
    }

    let found = false;
    function solve(row: number): boolean {
        if (found) return true;
        if (row === n) { found = true; steps.push(snap(row - 1, board[row - 1], false, `Solution found! All ${n} queens placed with no conflicts`)); return true; }
        for (let col = 0; col < n; col++) {
            steps.push(snap(row, col, false, `Try queen at row ${row}, col ${col}`));
            if (isSafe(row, col)) {
                board[row] = col;
                steps.push(snap(row, col, false, `Place queen at (${row}, ${col}) — safe`));
                if (solve(row + 1)) return true;
                if (!found) {
                    steps.push(snap(row, col, true, `Backtrack from row ${row}, col ${col} — no valid placement in next row`));
                    board[row] = -1;
                }
            }
        }
        return false;
    }

    steps.push(snap(0, 0, false, `N-Queens (n=${n}): place ${n} queens so no two share a row, column, or diagonal`));
    solve(0);
    return steps;
}

export class NQueensPlayer {
    private steps: QueensStep[] = [];
    private idx = 0;
    private timer: number | null = null;
    private speedMs = 300;

    constructor(
        private container: HTMLElement,
        private captionEl: HTMLElement,
        private onStepChange?: (idx: number, total: number) => void,
    ) {}

    load(steps: QueensStep[]): void { this.pause(); this.steps = steps; this.idx = 0; this.render(); }
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
        const n = step.n;
        const cellSize = Math.min(36, Math.floor(340 / n));

        const grid = document.createElement('div');
        grid.style.cssText = `display:grid; grid-template-columns:repeat(${n}, ${cellSize}px); gap:2px; width:fit-content;`;

        for (let r = 0; r < n; r++) {
            for (let c = 0; c < n; c++) {
                const cell = document.createElement('div');
                const isLight = (r + c) % 2 === 0;
                const hasQueen = step.board[r] === c;
                const isActive = r === step.activeRow && c === step.activeCol;
                const bg = hasQueen
                    ? (step.backtrack && r === step.activeRow ? 'var(--back-dim)' : 'var(--search-dim)')
                    : isActive
                        ? (step.backtrack ? 'var(--back-dim)' : 'var(--greedy-dim)')
                        : isLight ? 'var(--panel)' : 'var(--bg)';
                const border = hasQueen
                    ? (step.backtrack && r === step.activeRow ? 'var(--back)' : 'var(--search)')
                    : isActive ? (step.backtrack ? 'var(--back)' : 'var(--greedy)') : 'var(--grid-line)';

                cell.style.cssText = `width:${cellSize}px; height:${cellSize}px; border:1px solid ${border}; background:${bg}; display:flex; align-items:center; justify-content:center; font-size:${cellSize * 0.5}px; border-radius:2px;`;
                cell.textContent = hasQueen ? '♛' : '';
                grid.appendChild(cell);
            }
        }

        this.container.appendChild(grid);
        this.captionEl.textContent = step.caption;
        this.onStepChange?.(this.idx, this.steps.length - 1);
    }
}

// ---------- KMP (Knuth-Morris-Pratt) ----------

export interface KMPStep {
    text: string;
    pattern: string;
    textIdx: number;
    patIdx: number;
    failure: number[];
    matches: number[];
    phase: 'build' | 'search';
    caption: string;
}

export function kmpSteps(): KMPStep[] {
    const text = 'ABABDABACDABABCABAB';
    const pattern = 'ABABCABAB';
    const steps: KMPStep[] = [];
    const failure = new Array(pattern.length).fill(0);
    const matches: number[] = [];

    // Build failure function
    steps.push({ text, pattern, textIdx: -1, patIdx: -1, failure: [...failure], matches: [], phase: 'build', caption: `Build failure (prefix) table for pattern "${pattern}"` });

    let len = 0;
    let i = 1;
    while (i < pattern.length) {
        if (pattern[i] === pattern[len]) {
            len++;
            failure[i] = len;
            steps.push({ text, pattern, textIdx: -1, patIdx: i, failure: [...failure], matches: [], phase: 'build', caption: `failure[${i}] = ${len}: prefix of length ${len} matches suffix at position ${i}` });
            i++;
        } else {
            if (len !== 0) { len = failure[len - 1]; }
            else { failure[i] = 0; i++; }
        }
    }

    steps.push({ text, pattern, textIdx: -1, patIdx: -1, failure: [...failure], matches: [], phase: 'search', caption: `Failure table: [${failure.join(', ')}]. Now search text using it` });

    // Search
    let ti = 0;
    let pi = 0;
    while (ti < text.length) {
        steps.push({ text, pattern, textIdx: ti, patIdx: pi, failure: [...failure], matches: [...matches], phase: 'search', caption: `Compare text[${ti}]="${text[ti]}" with pattern[${pi}]="${pattern[pi]}"` });
        if (text[ti] === pattern[pi]) {
            ti++; pi++;
            if (pi === pattern.length) {
                matches.push(ti - pi);
                steps.push({ text, pattern, textIdx: ti - 1, patIdx: pi - 1, failure: [...failure], matches: [...matches], phase: 'search', caption: `Match found at index ${ti - pi}! Shift pattern using failure[${pi - 1}]=${failure[pi - 1]}` });
                pi = failure[pi - 1];
            }
        } else {
            if (pi !== 0) {
                steps.push({ text, pattern, textIdx: ti, patIdx: pi, failure: [...failure], matches: [...matches], phase: 'search', caption: `Mismatch — use failure table: shift pattern to pi=${failure[pi - 1]}` });
                pi = failure[pi - 1];
            } else {
                ti++;
            }
        }
    }

    steps.push({ text, pattern, textIdx: -1, patIdx: -1, failure: [...failure], matches: [...matches], phase: 'search', caption: `Done — found ${matches.length} match(es) at index/indices: [${matches.join(', ')}]` });
    return steps;
}

export class KMPPlayer {
    private steps: KMPStep[] = [];
    private idx = 0;
    private timer: number | null = null;
    private speedMs = 500;

    constructor(
        private container: HTMLElement,
        private captionEl: HTMLElement,
        private onStepChange?: (idx: number, total: number) => void,
    ) {}

    load(steps: KMPStep[]): void { this.pause(); this.steps = steps; this.idx = 0; this.render(); }
    play(): void {
        if (this.timer !== null) return;
        this.timer = window.setInterval(() => {
            if (this.idx >= this.steps.length - 1) { this.pause(); return; }
            this.idx++; this.render();
        }, this.speedMs);
    }
    pause(): void { if (this.timer !== null) { window.clearInterval(this.timer); this.timer = null; } }
    restart(): void { this.pause(); this.idx = 0; this.render(); this.play(); }

    private charBox(char: string, state: 'normal' | 'active' | 'match' | 'muted', topLabel?: string, bottomLabel?: string): HTMLElement {
        const wrap = document.createElement('div');
        wrap.style.cssText = 'display:flex; flex-direction:column; align-items:center; gap:1px;';
        if (topLabel !== undefined) {
            const lbl = document.createElement('div');
            lbl.style.cssText = 'font-size:8px; color:var(--muted); height:10px;';
            lbl.textContent = topLabel;
            wrap.appendChild(lbl);
        }
        const box = document.createElement('div');
        const bg = state === 'match' ? 'var(--search-dim)' : state === 'active' ? 'var(--greedy-dim)' : 'var(--panel)';
        const border = state === 'match' ? 'var(--search)' : state === 'active' ? 'var(--greedy)' : 'var(--grid-line)';
        const color = state === 'muted' ? 'var(--muted)' : 'var(--text)';
        box.style.cssText = `width:18px; height:22px; border:1px solid ${border}; background:${bg}; display:flex; align-items:center; justify-content:center; font-size:10px; font-weight:700; color:${color}; border-radius:2px;`;
        box.textContent = char;
        wrap.appendChild(box);
        if (bottomLabel !== undefined) {
            const lbl = document.createElement('div');
            lbl.style.cssText = 'font-size:7px; color:var(--muted); height:10px;';
            lbl.textContent = bottomLabel;
            wrap.appendChild(lbl);
        }
        return wrap;
    }

    private render(): void {
        const step = this.steps[this.idx];
        if (!step) return;
        this.container.innerHTML = '';

        // Text row
        const textRow = document.createElement('div');
        textRow.style.cssText = 'display:flex; gap:1px; flex-wrap:wrap; margin-bottom:8px;';
        [...step.text].forEach((ch, i) => {
            const inMatch = step.matches.some((m) => i >= m && i < m + step.pattern.length);
            const isActive = i === step.textIdx;
            textRow.appendChild(this.charBox(ch, inMatch ? 'match' : isActive ? 'active' : 'normal', String(i)));
        });
        this.container.appendChild(textRow);

        // Pattern row (aligned below active text position)
        if (step.phase === 'search' && step.textIdx >= 0) {
            const offset = step.textIdx - step.patIdx;
            const patRow = document.createElement('div');
            patRow.style.cssText = `display:flex; gap:1px; margin-left:${offset * 19}px; margin-bottom:8px;`;
            [...step.pattern].forEach((ch, i) => {
                const isActive = i === step.patIdx;
                patRow.appendChild(this.charBox(ch, isActive ? 'active' : i < step.patIdx ? 'match' : 'normal', undefined, step.failure[i] !== undefined ? String(step.failure[i]) : ''));
            });
            this.container.appendChild(patRow);
        }

        // Failure table (always shown)
        const fRow = document.createElement('div');
        fRow.style.cssText = 'display:flex; gap:1px; flex-wrap:wrap;';
        [...step.pattern].forEach((ch, i) => {
            const isActive = step.phase === 'build' && i === step.patIdx;
            const wrap = this.charBox(ch, isActive ? 'active' : 'muted', i === 0 ? 'pat' : '', String(step.failure[i]));
            fRow.appendChild(wrap);
        });
        this.container.appendChild(fRow);

        this.captionEl.textContent = step.caption;
        this.onStepChange?.(this.idx, this.steps.length - 1);
    }
}

// ---------- Rabin-Karp ----------

export interface RabinKarpStep {
    text: string;
    pattern: string;
    windowStart: number;
    windowEnd: number;
    patHash: number;
    winHash: number;
    matches: number[];
    isMatch: boolean;
    caption: string;
}

export function rabinKarpSteps(): RabinKarpStep[] {
    const text = 'ABCABDAABCABCD';
    const pattern = 'ABCABD';
    const BASE = 31;
    const MOD = 101;
    const m = pattern.length;
    const n = text.length;
    const steps: RabinKarpStep[] = [];
    const matches: number[] = [];

    function hash(s: string): number {
        let h = 0;
        for (const c of s) h = (h * BASE + c.charCodeAt(0)) % MOD;
        return h;
    }

    const patHash = hash(pattern);
    let winHash = hash(text.slice(0, m));
    const hm = Math.pow(BASE, m - 1) % MOD;

    steps.push({ text, pattern, windowStart: 0, windowEnd: m - 1, patHash, winHash, matches: [], isMatch: false, caption: `Rabin-Karp: pattern hash = ${patHash}. Slide a window of size ${m} across text using a rolling hash` });

    for (let i = 0; i <= n - m; i++) {
        const isHash = winHash === patHash;
        const isMatch = isHash && text.slice(i, i + m) === pattern;
        if (isMatch) matches.push(i);
        steps.push({ text, pattern, windowStart: i, windowEnd: i + m - 1, patHash, winHash, matches: [...matches], isMatch, caption: isMatch ? `Match at index ${i}! Hash matches AND chars verify` : isHash ? `Hash collision at ${i}: hash matches but chars differ — O(m) verify` : `Window [${i}..${i + m - 1}]: hash=${winHash} ≠ ${patHash} — skip` });

        if (i < n - m) {
            winHash = ((winHash - text.charCodeAt(i) * hm % MOD + MOD) * BASE + text.charCodeAt(i + m)) % MOD;
        }
    }

    steps.push({ text, pattern, windowStart: -1, windowEnd: -1, patHash, winHash, matches: [...matches], isMatch: false, caption: `Done — found ${matches.length} match(es) at index/indices: [${matches.join(', ')}]` });
    return steps;
}

export class RabinKarpPlayer {
    private steps: RabinKarpStep[] = [];
    private idx = 0;
    private timer: number | null = null;
    private speedMs = 600;

    constructor(
        private container: HTMLElement,
        private captionEl: HTMLElement,
        private onStepChange?: (idx: number, total: number) => void,
    ) {}

    load(steps: RabinKarpStep[]): void { this.pause(); this.steps = steps; this.idx = 0; this.render(); }
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

        // Text row with window highlight
        const textRow = document.createElement('div');
        textRow.style.cssText = 'display:flex; gap:1px; flex-wrap:wrap; margin-bottom:8px;';
        [...step.text].forEach((ch, i) => {
            const inWindow = step.windowStart >= 0 && i >= step.windowStart && i <= step.windowEnd;
            const inMatch = step.matches.some((m) => i >= m && i < m + step.pattern.length);
            const box = document.createElement('div');
            const bg = inMatch ? 'var(--search-dim)' : inWindow ? (step.isMatch ? 'var(--search-dim)' : 'var(--greedy-dim)') : 'var(--panel)';
            const border = inMatch ? 'var(--search)' : inWindow ? (step.isMatch ? 'var(--search)' : 'var(--greedy)') : 'var(--grid-line)';
            box.style.cssText = `width:18px; height:26px; border:1px solid ${border}; background:${bg}; display:flex; flex-direction:column; align-items:center; justify-content:center; font-size:10px; font-weight:700; color:var(--text); border-radius:2px;`;
            box.textContent = ch;
            textRow.appendChild(box);
        });
        this.container.appendChild(textRow);

        // Hash display
        const hashRow = document.createElement('div');
        hashRow.style.cssText = 'display:flex; gap:16px; margin-top:8px; font-size:11px;';
        const patH = document.createElement('div');
        patH.style.cssText = 'color:var(--muted);';
        patH.textContent = `pattern hash: ${step.patHash}`;
        const winH = document.createElement('div');
        winH.style.cssText = `color:${step.winHash === step.patHash ? 'var(--greedy)' : 'var(--text)'};`;
        winH.textContent = `window hash: ${step.winHash}`;
        hashRow.appendChild(patH);
        hashRow.appendChild(winH);
        this.container.appendChild(hashRow);

        this.captionEl.textContent = step.caption;
        this.onStepChange?.(this.idx, this.steps.length - 1);
    }
}

// ---------- Suffix Array ----------

export interface SuffixStep {
    original: string;
    suffixes: { suffix: string; originalIdx: number }[];
    sorted: boolean;
    activePair?: [number, number];
    caption: string;
}

export function suffixArraySteps(): SuffixStep[] {
    const s = 'banana$';
    const steps: SuffixStep[] = [];
    const suffixes = [...s].map((_, i) => ({ suffix: s.slice(i), originalIdx: i }));

    steps.push({ original: s, suffixes: [...suffixes], sorted: false, caption: `String: "${s}". Generate all ${suffixes.length} suffixes` });

    for (let i = 0; i < suffixes.length; i++) {
        steps.push({ original: s, suffixes: [...suffixes], sorted: false, activePair: [i, i], caption: `Suffix ${i}: "${suffixes[i].suffix}" (starts at index ${suffixes[i].originalIdx})` });
    }

    // Animate sort (bubble-sort style for visibility)
    const arr = [...suffixes];
    for (let i = 0; i < arr.length - 1; i++) {
        for (let j = 0; j < arr.length - i - 1; j++) {
            steps.push({ original: s, suffixes: [...arr], sorted: false, activePair: [j, j + 1], caption: `Compare "${arr[j].suffix}" vs "${arr[j + 1].suffix}"` });
            if (arr[j].suffix > arr[j + 1].suffix) {
                [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
                steps.push({ original: s, suffixes: [...arr], sorted: false, activePair: [j, j + 1], caption: `Swap — "${arr[j].suffix}" < "${arr[j + 1].suffix}" lexicographically` });
            }
        }
    }

    steps.push({ original: s, suffixes: [...arr], sorted: true, caption: `Suffix array complete: [${arr.map((s) => s.originalIdx).join(', ')}]. Enables O(log n) substring search` });
    return steps;
}

export class SuffixArrayPlayer {
    private steps: SuffixStep[] = [];
    private idx = 0;
    private timer: number | null = null;
    private speedMs = 400;

    constructor(
        private container: HTMLElement,
        private captionEl: HTMLElement,
        private onStepChange?: (idx: number, total: number) => void,
    ) {}

    load(steps: SuffixStep[]): void { this.pause(); this.steps = steps; this.idx = 0; this.render(); }
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

        const list = document.createElement('div');
        list.style.cssText = 'display:flex; flex-direction:column; gap:3px; max-height:160px; overflow-y:auto;';

        step.suffixes.forEach((suf, i) => {
            const isActive = step.activePair && (step.activePair[0] === i || step.activePair[1] === i);
            const row = document.createElement('div');
            row.style.cssText = `display:flex; gap:8px; align-items:center; padding:3px 6px; border-radius:4px; background:${isActive ? 'var(--string-dim)' : step.sorted ? 'var(--panel)' : 'transparent'}; border:1px solid ${isActive ? 'var(--string)' : step.sorted ? 'var(--grid-line)' : 'transparent'};`;

            const idx = document.createElement('span');
            idx.style.cssText = 'font-size:9px; color:var(--muted); width:16px; text-align:right; flex:none;';
            idx.textContent = String(suf.originalIdx);

            const sufText = document.createElement('span');
            sufText.style.cssText = `font-size:11px; font-weight:700; color:${step.sorted ? 'var(--string)' : isActive ? 'var(--string)' : 'var(--text)'};`;
            sufText.textContent = suf.suffix;

            row.appendChild(idx);
            row.appendChild(sufText);
            list.appendChild(row);
        });

        this.container.appendChild(list);
        this.captionEl.textContent = step.caption;
        this.onStepChange?.(this.idx, this.steps.length - 1);
    }
}

// Closest Pair uses the graph SVG style (scatter of points + dividing line)
export interface ClosestPairStep {
    points: { x: number; y: number }[];
    divideX?: number;
    highlighted?: [number, number];
    bestPair?: [number, number];
    bestDist: number;
    caption: string;
}

export function closestPairSteps(): ClosestPairStep[] {
    const points = [
        { x: 2, y: 3 }, { x: 12, y: 30 }, { x: 40, y: 50 }, { x: 5, y: 1 },
        { x: 12, y: 10 }, { x: 3, y: 4 }, { x: 21, y: 18 }, { x: 35, y: 40 },
    ];
    const steps: ClosestPairStep[] = [];

    function dist(i: number, j: number): number {
        return Math.hypot(points[i].x - points[j].x, points[i].y - points[j].y);
    }

    steps.push({ points, bestDist: Infinity, caption: `Closest pair of points: ${points.length} points. Divide and conquer finds the nearest pair in O(n log n)` });

    // Sort by x
    const sorted = points.map((_p, i) => i).sort((a, b) => points[a].x - points[b].x);
    const mid = Math.floor(sorted.length / 2);
    const divideX = points[sorted[mid]].x;

    steps.push({ points, divideX, bestDist: Infinity, caption: `Divide: split at x = ${divideX}. Recursively find closest pair in each half` });

    // Brute force left half
    let best = Infinity;
    let bestPair: [number, number] = [0, 1];
    const left = sorted.slice(0, mid);
    for (let i = 0; i < left.length; i++) {
        for (let j = i + 1; j < left.length; j++) {
            const d = dist(left[i], left[j]);
            steps.push({ points, divideX, highlighted: [left[i], left[j]], bestDist: best, caption: `Left half: check pair (${left[i]},${left[j]}), dist=${d.toFixed(2)}` });
            if (d < best) { best = d; bestPair = [left[i], left[j]]; }
        }
    }

    // Brute force right half
    const right = sorted.slice(mid);
    for (let i = 0; i < right.length; i++) {
        for (let j = i + 1; j < right.length; j++) {
            const d = dist(right[i], right[j]);
            steps.push({ points, divideX, highlighted: [right[i], right[j]], bestDist: best, caption: `Right half: check pair (${right[i]},${right[j]}), dist=${d.toFixed(2)}` });
            if (d < best) { best = d; bestPair = [right[i], right[j]]; }
        }
    }

    steps.push({ points, divideX, bestPair, bestDist: best, caption: `Closest pair found: points ${bestPair[0]} and ${bestPair[1]}, distance = ${best.toFixed(2)}` });
    return steps;
}

export class ClosestPairPlayer {
    private steps: ClosestPairStep[] = [];
    private idx = 0;
    private timer: number | null = null;
    private speedMs = 500;

    constructor(
        private svg: SVGSVGElement,
        private captionEl: HTMLElement,
        private onStepChange?: (idx: number, total: number) => void,
    ) {}

    load(steps: ClosestPairStep[]): void { this.pause(); this.steps = steps; this.idx = 0; this.render(); }
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
        while (this.svg.firstChild) this.svg.removeChild(this.svg.firstChild);

        const W = 400; const H = 200;
        const pad = 20;
        const maxX = Math.max(...step.points.map((p) => p.x));
        const maxY = Math.max(...step.points.map((p) => p.y));
        const scaleX = (x: number) => pad + (x / maxX) * (W - 2 * pad);
        const scaleY = (y: number) => H - pad - (y / maxY) * (H - 2 * pad);

        this.svg.setAttribute('viewBox', `0 0 ${W} ${H}`);

        if (step.divideX !== undefined) {
            const line = document.createElementNS(SVG_NS, 'line');
            line.setAttribute('x1', String(scaleX(step.divideX))); line.setAttribute('y1', String(pad));
            line.setAttribute('x2', String(scaleX(step.divideX))); line.setAttribute('y2', String(H - pad));
            line.setAttribute('stroke', 'var(--muted)'); line.setAttribute('stroke-width', '1'); line.setAttribute('stroke-dasharray', '4,4');
            this.svg.appendChild(line);
        }

        if (step.bestPair) {
            const [a, b] = step.bestPair;
            const line = document.createElementNS(SVG_NS, 'line');
            line.setAttribute('x1', String(scaleX(step.points[a].x))); line.setAttribute('y1', String(scaleY(step.points[a].y)));
            line.setAttribute('x2', String(scaleX(step.points[b].x))); line.setAttribute('y2', String(scaleY(step.points[b].y)));
            line.setAttribute('stroke', 'var(--search)'); line.setAttribute('stroke-width', '2');
            this.svg.appendChild(line);
        }

        step.points.forEach((p, i) => {
            const isHighlighted = step.highlighted && step.highlighted.includes(i);
            const isBest = step.bestPair && step.bestPair.includes(i);
            const circle = document.createElementNS(SVG_NS, 'circle');
            circle.setAttribute('cx', String(scaleX(p.x))); circle.setAttribute('cy', String(scaleY(p.y)));
            circle.setAttribute('r', isBest ? '8' : isHighlighted ? '7' : '5');
            circle.setAttribute('fill', isBest ? 'var(--search)' : isHighlighted ? 'var(--greedy)' : 'var(--dac)');
            circle.setAttribute('fill-opacity', '0.8');
            this.svg.appendChild(circle);

            const txt = document.createElementNS(SVG_NS, 'text');
            txt.setAttribute('x', String(scaleX(p.x) + 6)); txt.setAttribute('y', String(scaleY(p.y) - 4));
            txt.setAttribute('font-size', '8'); txt.setAttribute('fill', 'var(--muted)');
            txt.textContent = String(i);
            this.svg.appendChild(txt);
        });

        this.captionEl.textContent = step.caption;
        this.onStepChange?.(this.idx, this.steps.length - 1);
    }
}

export const DIV_BACK_STRING_GENERATORS: Record<string, string> = {
    Kar: 'karatsuba', Cls: 'closestPair', Nqn: 'nqueens',
    Kmp: 'kmp', Rbk: 'rabinKarp', Sfx: 'suffixArray',
};