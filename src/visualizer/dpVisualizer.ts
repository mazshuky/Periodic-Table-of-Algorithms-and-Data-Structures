// Generic table-filling DP visualizer. Reuses the same visual language as the
// Floyd-Warshall matrix (fw-table CSS classes): cells flash yellow while being
// computed, green once just finalized.

export interface DPStep {
    table: (number | string)[][];
    rowLabels: string[];
    colLabels: string[];
    activeRow: number;
    activeCol: number;
    updated: boolean;
    caption: string;
}

function snap(
    table: (number | string)[][],
    rowLabels: string[],
    colLabels: string[],
    activeRow: number,
    activeCol: number,
    updated: boolean,
    caption: string,
): DPStep {
    return { table: table.map((r) => [...r]), rowLabels: [...rowLabels], colLabels: [...colLabels], activeRow, activeCol, updated, caption };
}

// ---------- Fibonacci (memoized, bottom-up) ----------

export function fibSteps(n = 10): DPStep[] {
    const dp: number[] = new Array(n + 1).fill(0);
    dp[1] = 1;
    const colLabels = Array.from({ length: n + 1 }, (_, i) => String(i));
    const steps: DPStep[] = [];
    steps.push(snap([dp], ['dp'], colLabels, -1, 0, false, 'Base cases: dp[0]=0, dp[1]=1'));
    steps.push(snap([dp], ['dp'], colLabels, -1, 1, false, 'Base cases: dp[0]=0, dp[1]=1'));
    for (let i = 2; i <= n; i++) {
        steps.push(snap([dp], ['dp'], colLabels, 0, i, false, `Compute dp[${i}] = dp[${i - 1}] + dp[${i - 2}]`));
        dp[i] = dp[i - 1] + dp[i - 2];
        steps.push(snap([dp], ['dp'], colLabels, 0, i, true, `dp[${i}] = ${dp[i - 1]} + ${dp[i - 2]} = ${dp[i]}`));
    }
    return steps;
}

// ---------- 0/1 Knapsack ----------

export function knapsackSteps(): DPStep[] {
    const weights = [2, 3, 4, 5];
    const values = [3, 4, 5, 6];
    const capacity = 8;
    const n = weights.length;
    const dp: number[][] = Array.from({ length: n + 1 }, () => new Array(capacity + 1).fill(0));
    const rowLabels = ['\u2205', ...weights.map((w, i) => `+item${i + 1}(w${w})`)];
    const colLabels = Array.from({ length: capacity + 1 }, (_, c) => String(c));
    const steps: DPStep[] = [snap(dp, rowLabels, colLabels, -1, -1, false, `Items (weight,value): ${weights.map((w, i) => `(${w},${values[i]})`).join(' ')}, capacity ${capacity}`)];

    for (let i = 1; i <= n; i++) {
        for (let w = 0; w <= capacity; w++) {
            steps.push(snap(dp, rowLabels, colLabels, i, w, false, `Item ${i} (w=${weights[i - 1]}, v=${values[i - 1]}) at capacity ${w}`));
            if (weights[i - 1] <= w) {
                dp[i][w] = Math.max(dp[i - 1][w], dp[i - 1][w - weights[i - 1]] + values[i - 1]);
            } else {
                dp[i][w] = dp[i - 1][w];
            }
            steps.push(snap(dp, rowLabels, colLabels, i, w, true, `dp[${i}][${w}] = ${dp[i][w]}`));
        }
    }
    steps.push(snap(dp, rowLabels, colLabels, -1, -1, false, `Max value with capacity ${capacity} = ${dp[n][capacity]}`));
    return steps;
}

// ---------- Longest Common Subsequence ----------

export function lcsSteps(): DPStep[] {
    const a = 'ABCBDAB';
    const b = 'BDCABA';
    const n = a.length;
    const m = b.length;
    const dp: number[][] = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));
    const rowLabels = ['\u2205', ...a.split('')];
    const colLabels = ['\u2205', ...b.split('')];
    const steps: DPStep[] = [snap(dp, rowLabels, colLabels, -1, -1, false, `LCS of "${a}" and "${b}"`)];

    for (let i = 1; i <= n; i++) {
        for (let j = 1; j <= m; j++) {
            const match = a[i - 1] === b[j - 1];
            steps.push(snap(dp, rowLabels, colLabels, i, j, false, `Compare ${a[i - 1]} vs ${b[j - 1]}: ${match ? 'match' : 'no match'}`));
            dp[i][j] = match ? dp[i - 1][j - 1] + 1 : Math.max(dp[i - 1][j], dp[i][j - 1]);
            steps.push(snap(dp, rowLabels, colLabels, i, j, true, `dp[${i}][${j}] = ${dp[i][j]}`));
        }
    }
    steps.push(snap(dp, rowLabels, colLabels, -1, -1, false, `LCS length = ${dp[n][m]}`));
    return steps;
}

// ---------- Longest Increasing Subsequence ----------

export function lisSteps(): DPStep[] {
    const arr = [3, 1, 4, 1, 5, 9, 2, 6];
    const n = arr.length;
    const dp: number[] = new Array(n).fill(1);
    const colLabels = arr.map((v) => String(v));
    const steps: DPStep[] = [snap([dp], ['LIS-len'], colLabels, -1, -1, false, `Array: [${arr.join(', ')}]`)];

    for (let i = 1; i < n; i++) {
        for (let j = 0; j < i; j++) {
            steps.push(snap([dp], ['LIS-len'], colLabels, 0, i, false, `dp[${i}]: check j=${j} (${arr[j]} < ${arr[i]}? ${arr[j] < arr[i]})`));
            if (arr[j] < arr[i] && dp[j] + 1 > dp[i]) {
                dp[i] = dp[j] + 1;
                steps.push(snap([dp], ['LIS-len'], colLabels, 0, i, true, `dp[${i}] updated to ${dp[i]} (via index ${j})`));
            }
        }
    }
    steps.push(snap([dp], ['LIS-len'], colLabels, -1, -1, false, `Longest increasing subsequence length = ${Math.max(...dp)}`));
    return steps;
}

// ---------- Edit Distance ----------

export function editDistanceSteps(): DPStep[] {
    const a = 'kitten';
    const b = 'sitting';
    const n = a.length;
    const m = b.length;
    const dp: number[][] = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));
    for (let i = 0; i <= n; i++) dp[i][0] = i;
    for (let j = 0; j <= m; j++) dp[0][j] = j;
    const rowLabels = ['\u2205', ...a.split('')];
    const colLabels = ['\u2205', ...b.split('')];
    const steps: DPStep[] = [snap(dp, rowLabels, colLabels, -1, -1, false, `Edit distance: "${a}" \u2192 "${b}"`)];

    for (let i = 1; i <= n; i++) {
        for (let j = 1; j <= m; j++) {
            const match = a[i - 1] === b[j - 1];
            steps.push(snap(dp, rowLabels, colLabels, i, j, false, `Compare ${a[i - 1]} vs ${b[j - 1]}: ${match ? 'same, no cost' : 'differ, try insert/delete/replace'}`));
            dp[i][j] = match ? dp[i - 1][j - 1] : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
            steps.push(snap(dp, rowLabels, colLabels, i, j, true, `dp[${i}][${j}] = ${dp[i][j]}`));
        }
    }
    steps.push(snap(dp, rowLabels, colLabels, -1, -1, false, `Edit distance = ${dp[n][m]}`));
    return steps;
}

// ---------- Matrix Chain Multiplication ----------

export function matrixChainSteps(): DPStep[] {
    const dims = [10, 20, 30, 40, 30]; // 4 matrices
    const n = dims.length - 1;
    const dp: number[][] = Array.from({ length: n + 1 }, () => new Array(n + 1).fill(0));
    const labels = Array.from({ length: n }, (_, i) => `M${i + 1}`);
    const steps: DPStep[] = [snap(dp, ['\u2205', ...labels], ['\u2205', ...labels], -1, -1, false, `Matrix dims: ${dims.join(' x ')} (chain of ${n} matrices)`)];

    for (let len = 2; len <= n; len++) {
        for (let i = 1; i <= n - len + 1; i++) {
            const j = i + len - 1;
            dp[i][j] = Infinity;
            for (let k = i; k < j; k++) {
                const cost = dp[i][k] + dp[k + 1][j] + dims[i - 1] * dims[k] * dims[j];
                steps.push(snap(dp, ['\u2205', ...labels], ['\u2205', ...labels], i, j, false, `Try split at M${k}: cost = ${cost}`));
                if (cost < dp[i][j]) dp[i][j] = cost;
            }
            steps.push(snap(dp, ['\u2205', ...labels], ['\u2205', ...labels], i, j, true, `Best cost for M${i}..M${j} = ${dp[i][j]}`));
        }
    }
    steps.push(snap(dp, ['\u2205', ...labels], ['\u2205', ...labels], -1, -1, false, `Minimum multiplication cost = ${dp[1][n]}`));
    return steps;
}

// ---------- Coin Change (minimum coins) ----------

export function coinChangeSteps(): DPStep[] {
    const coins = [1, 3, 4];
    const amount = 6;
    const dp: number[] = new Array(amount + 1).fill(Infinity);
    dp[0] = 0;
    const colLabels = Array.from({ length: amount + 1 }, (_, i) => String(i));
    const fmt = (arr: number[]) => arr.map((v) => (v === Infinity ? '\u221E' : v));
    const steps: DPStep[] = [snap([fmt(dp)], ['min coins'], colLabels, -1, 0, false, `Coins: [${coins.join(', ')}], target amount ${amount}`)];

    for (let a = 1; a <= amount; a++) {
        for (const c of coins) {
            if (c <= a) {
                steps.push(snap([fmt(dp)], ['min coins'], colLabels, 0, a, false, `amount ${a}: try coin ${c} \u2192 dp[${a - c}] + 1`));
                if (dp[a - c] + 1 < dp[a]) dp[a] = dp[a - c] + 1;
            }
        }
        steps.push(snap([fmt(dp)], ['min coins'], colLabels, 0, a, true, `dp[${a}] = ${dp[a] === Infinity ? '\u221E' : dp[a]}`));
    }
    steps.push(snap([fmt(dp)], ['min coins'], colLabels, -1, -1, false, `Minimum coins for amount ${amount} = ${dp[amount]}`));
    return steps;
}

export const DP_GENERATORS: Record<string, () => DPStep[]> = {
    Fib: () => fibSteps(),
    Knp: () => knapsackSteps(),
    Lcs: () => lcsSteps(),
    Lis: () => lisSteps(),
    Edt: () => editDistanceSteps(),
    Mcm: () => matrixChainSteps(),
    Cch: () => coinChangeSteps(),
};

export class DPPlayer {
    private steps: DPStep[] = [];
    private idx = 0;
    private timer: number | null = null;
    private speedMs = 220;

    constructor(
        private container: HTMLElement,
        private captionEl: HTMLElement,
        private onStepChange?: (idx: number, total: number) => void,
    ) {}

    load(steps: DPStep[]): void {
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
        this.container.innerHTML = '';

        const table = document.createElement('table');
        table.className = 'fw-table dp-table';

        const headRow = document.createElement('tr');
        headRow.appendChild(document.createElement('th'));
        step.colLabels.forEach((label, j) => {
            const th = document.createElement('th');
            th.textContent = label;
            if (j === step.activeCol) th.classList.add('fw-k');
            headRow.appendChild(th);
        });
        table.appendChild(headRow);

        step.table.forEach((row, i) => {
            const tr = document.createElement('tr');
            const rh = document.createElement('th');
            rh.textContent = step.rowLabels[i] ?? '';
            if (i === step.activeRow) rh.classList.add('fw-k');
            tr.appendChild(rh);

            row.forEach((cell, j) => {
                const td = document.createElement('td');
                td.textContent = String(cell);
                if (i === step.activeRow && j === step.activeCol) {
                    td.classList.add(step.updated ? 'fw-updated' : 'fw-active');
                }
                tr.appendChild(td);
            });
            table.appendChild(tr);
        });

        this.container.appendChild(table);
        this.captionEl.textContent = step.caption;
        this.onStepChange?.(this.idx, this.steps.length - 1);
    }
}