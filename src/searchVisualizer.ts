export interface SearchStep {
    array: number[];
    active: number[]; // indices being compared/probed this step
    range: [number, number]; // current valid search window [lo, hi], inclusive
    found: number; // index of the found target, -1 if not yet found
    caption: string;
}

function snap(array: number[], active: number[], range: [number, number], found: number, caption: string): SearchStep {
    return { array: [...array], active: [...active], range, found, caption };
}

function sortedArray(size = 16, min = 5, max = 95): number[] {
    const arr = Array.from({ length: size }, () => Math.floor(Math.random() * (max - min + 1)) + min);
    arr.sort((a, b) => a - b);
    return arr;
}

export function linearSearchSteps(): SearchStep[] {
    const arr = sortedArray();
    const target = arr[Math.floor(arr.length * 0.7)];
    const steps: SearchStep[] = [snap(arr, [], [0, arr.length - 1], -1, `Searching for ${target} from the start`)];
    for (let i = 0; i < arr.length; i++) {
        steps.push(snap(arr, [i], [0, arr.length - 1], -1, `Check index ${i}: is ${arr[i]} = ${target}?`));
        if (arr[i] === target) {
            steps.push(snap(arr, [i], [0, arr.length - 1], i, `Found ${target} at index ${i}`));
            return steps;
        }
    }
    steps.push(snap(arr, [], [0, arr.length - 1], -1, `${target} not found`));
    return steps;
}

export function binarySearchSteps(): SearchStep[] {
    const arr = sortedArray();
    const target = arr[Math.floor(arr.length * 0.7)];
    const steps: SearchStep[] = [snap(arr, [], [0, arr.length - 1], -1, `Searching for ${target} in the full sorted range`)];
    let lo = 0;
    let hi = arr.length - 1;
    while (lo <= hi) {
        const mid = Math.floor((lo + hi) / 2);
        steps.push(snap(arr, [mid], [lo, hi], -1, `Check middle index ${mid}: is ${arr[mid]} = ${target}?`));
        if (arr[mid] === target) {
            steps.push(snap(arr, [mid], [lo, hi], mid, `Found ${target} at index ${mid}`));
            return steps;
        }
        if (arr[mid] < target) {
            lo = mid + 1;
            steps.push(snap(arr, [mid], [lo, hi], -1, `${arr[mid]} < ${target} \u2192 search the right half`));
        } else {
            hi = mid - 1;
            steps.push(snap(arr, [mid], [lo, hi], -1, `${arr[mid]} > ${target} \u2192 search the left half`));
        }
    }
    steps.push(snap(arr, [], [0, arr.length - 1], -1, `${target} not found`));
    return steps;
}

export function jumpSearchSteps(): SearchStep[] {
    const arr = sortedArray();
    const target = arr[Math.floor(arr.length * 0.7)];
    const n = arr.length;
    const step = Math.floor(Math.sqrt(n));
    const steps: SearchStep[] = [snap(arr, [], [0, n - 1], -1, `Searching for ${target}, block size = \u221A${n} \u2248 ${step}`)];

    let prev = 0;
    let curr = step;
    while (curr < n && arr[Math.min(curr, n - 1)] < target) {
        steps.push(snap(arr, [Math.min(curr, n - 1)], [prev, Math.min(curr, n - 1)], -1, `Block end ${Math.min(curr, n - 1)}: ${arr[Math.min(curr, n - 1)]} < ${target} \u2192 jump ahead`));
        prev = curr;
        curr += step;
    }
    const hi = Math.min(curr, n - 1);
    steps.push(snap(arr, [prev, hi], [prev, hi], -1, `Found the right block [${prev}..${hi}], now scan linearly`));

    for (let i = prev; i <= hi; i++) {
        steps.push(snap(arr, [i], [prev, hi], -1, `Check index ${i}: is ${arr[i]} = ${target}?`));
        if (arr[i] === target) {
            steps.push(snap(arr, [i], [prev, hi], i, `Found ${target} at index ${i}`));
            return steps;
        }
    }
    steps.push(snap(arr, [], [0, n - 1], -1, `${target} not found`));
    return steps;
}

export function interpolationSearchSteps(): SearchStep[] {
    const arr = sortedArray();
    const target = arr[Math.floor(arr.length * 0.7)];
    const n = arr.length;
    const steps: SearchStep[] = [snap(arr, [], [0, n - 1], -1, `Searching for ${target} using value-based position estimates`)];

    let lo = 0;
    let hi = n - 1;
    while (lo <= hi && target >= arr[lo] && target <= arr[hi]) {
        if (arr[hi] === arr[lo]) {
            if (arr[lo] === target) {
                steps.push(snap(arr, [lo], [lo, hi], lo, `Found ${target} at index ${lo}`));
                return steps;
            }
            break;
        }
        const pos = lo + Math.floor(((target - arr[lo]) * (hi - lo)) / (arr[hi] - arr[lo]));
        const clamped = Math.max(lo, Math.min(hi, pos));
        steps.push(snap(arr, [clamped], [lo, hi], -1, `Estimated position ${clamped}: is ${arr[clamped]} = ${target}?`));
        if (arr[clamped] === target) {
            steps.push(snap(arr, [clamped], [lo, hi], clamped, `Found ${target} at index ${clamped}`));
            return steps;
        }
        if (arr[clamped] < target) {
            lo = clamped + 1;
            steps.push(snap(arr, [clamped], [lo, hi], -1, `${arr[clamped]} < ${target} \u2192 narrow to the right`));
        } else {
            hi = clamped - 1;
            steps.push(snap(arr, [clamped], [lo, hi], -1, `${arr[clamped]} > ${target} \u2192 narrow to the left`));
        }
    }
    steps.push(snap(arr, [], [0, n - 1], -1, `${target} not found`));
    return steps;
}

export function exponentialSearchSteps(): SearchStep[] {
    const arr = sortedArray();
    const target = arr[Math.floor(arr.length * 0.7)];
    const n = arr.length;
    const steps: SearchStep[] = [snap(arr, [0], [0, n - 1], -1, `Searching for ${target}, starting bound at index 1`)];

    if (arr[0] === target) {
        steps.push(snap(arr, [0], [0, n - 1], 0, `Found ${target} at index 0`));
        return steps;
    }

    let bound = 1;
    while (bound < n && arr[bound] < target) {
        steps.push(snap(arr, [bound], [0, n - 1], -1, `${arr[bound]} < ${target} \u2192 double the bound to ${Math.min(bound * 2, n - 1)}`));
        bound *= 2;
    }
    const lo = Math.floor(bound / 2);
    const hi = Math.min(bound, n - 1);
    steps.push(snap(arr, [lo, hi], [lo, hi], -1, `Bound found: binary search within [${lo}..${hi}]`));

    let a = lo;
    let b = hi;
    while (a <= b) {
        const mid = Math.floor((a + b) / 2);
        steps.push(snap(arr, [mid], [a, b], -1, `Check middle index ${mid}: is ${arr[mid]} = ${target}?`));
        if (arr[mid] === target) {
            steps.push(snap(arr, [mid], [a, b], mid, `Found ${target} at index ${mid}`));
            return steps;
        }
        if (arr[mid] < target) {
            a = mid + 1;
            steps.push(snap(arr, [mid], [a, b], -1, `${arr[mid]} < ${target} \u2192 search the right half`));
        } else {
            b = mid - 1;
            steps.push(snap(arr, [mid], [a, b], -1, `${arr[mid]} > ${target} \u2192 search the left half`));
        }
    }
    steps.push(snap(arr, [], [0, n - 1], -1, `${target} not found`));
    return steps;
}

export const SEARCH_GENERATORS: Record<string, () => SearchStep[]> = {
    Lin: linearSearchSteps,
    Bin: binarySearchSteps,
    Jmp: jumpSearchSteps,
    Ipl: interpolationSearchSteps,
    Ext: exponentialSearchSteps,
};

export class SearchPlayer {
    private steps: SearchStep[] = [];
    private idx = 0;
    private timer: number | null = null;
    private speedMs = 550;

    constructor(
        private container: HTMLElement,
        private captionEl: HTMLElement,
        private onStepChange?: (idx: number, total: number) => void,
    ) {}

    load(steps: SearchStep[]): void {
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
        const max = Math.max(...step.array, 1);
        this.container.innerHTML = '';

        step.array.forEach((value, i) => {
            const bar = document.createElement('div');
            bar.className = 'viz-bar';
            const inRange = i >= step.range[0] && i <= step.range[1];
            if (i === step.found) bar.classList.add('viz-sorted');
            else if (step.active.includes(i)) bar.classList.add('viz-active');
            bar.style.height = `${(value / max) * 100}%`;
            bar.style.opacity = inRange ? '1' : '0.25';
            const label = document.createElement('span');
            label.textContent = String(value);
            bar.appendChild(label);
            this.container.appendChild(bar);
        });

        this.captionEl.textContent = step.caption;
        this.onStepChange?.(this.idx, this.steps.length - 1);
    }
}