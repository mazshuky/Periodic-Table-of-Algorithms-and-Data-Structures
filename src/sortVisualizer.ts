export interface SortStep {
    array: number[];
    active: number[]; // indices being compared/touched this step
    sorted: number[]; // indices considered finalized
}

function snap(array: number[], active: number[] = [], sorted: number[] = []): SortStep {
    return { array: [...array], active, sorted };
}

export function randomArray(size = 14, min = 8, max = 95): number[] {
    return Array.from({ length: size }, () => Math.floor(Math.random() * (max - min + 1)) + min);
}

export function bubbleSortSteps(input: number[]): SortStep[] {
    const arr = [...input];
    const steps: SortStep[] = [snap(arr)];
    const sorted: number[] = [];
    for (let i = 0; i < arr.length - 1; i++) {
        for (let j = 0; j < arr.length - i - 1; j++) {
            steps.push(snap(arr, [j, j + 1], sorted));
            if (arr[j] > arr[j + 1]) {
                [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
                steps.push(snap(arr, [j, j + 1], sorted));
            }
        }
        sorted.unshift(arr.length - i - 1);
    }
    sorted.unshift(0);
    steps.push(snap(arr, [], sorted));
    return steps;
}

export function selectionSortSteps(input: number[]): SortStep[] {
    const arr = [...input];
    const steps: SortStep[] = [snap(arr)];
    const sorted: number[] = [];
    for (let i = 0; i < arr.length; i++) {
        let min = i;
        for (let j = i + 1; j < arr.length; j++) {
            steps.push(snap(arr, [min, j], sorted));
            if (arr[j] < arr[min]) min = j;
        }
        [arr[i], arr[min]] = [arr[min], arr[i]];
        sorted.push(i);
        steps.push(snap(arr, [i, min], sorted));
    }
    return steps;
}

export function insertionSortSteps(input: number[]): SortStep[] {
    const arr = [...input];
    const steps: SortStep[] = [snap(arr, [], [0])];
    for (let i = 1; i < arr.length; i++) {
        const key = arr[i];
        let j = i - 1;
        while (j >= 0 && arr[j] > key) {
            steps.push(snap(arr, [j, j + 1], Array.from({ length: i }, (_, k) => k)));
            arr[j + 1] = arr[j];
            j--;
        }
        arr[j + 1] = key;
        steps.push(snap(arr, [j + 1], Array.from({ length: i + 1 }, (_, k) => k)));
    }
    return steps;
}

export function shellSortSteps(input: number[]): SortStep[] {
    const arr = [...input];
    const steps: SortStep[] = [snap(arr)];
    let gap = Math.floor(arr.length / 2);
    while (gap > 0) {
        for (let i = gap; i < arr.length; i++) {
            const temp = arr[i];
            let j = i;
            while (j >= gap && arr[j - gap] > temp) {
                steps.push(snap(arr, [j, j - gap]));
                arr[j] = arr[j - gap];
                j -= gap;
            }
            arr[j] = temp;
            steps.push(snap(arr, [j]));
        }
        gap = Math.floor(gap / 2);
    }
    steps.push(snap(arr, [], arr.map((_, i) => i)));
    return steps;
}

export function mergeSortSteps(input: number[]): SortStep[] {
    const arr = [...input];
    const steps: SortStep[] = [snap(arr)];

    function merge(lo: number, mid: number, hi: number): void {
        const left = arr.slice(lo, mid + 1);
        const right = arr.slice(mid + 1, hi + 1);
        let i = 0, j = 0, k = lo;
        while (i < left.length && j < right.length) {
            steps.push(snap(arr, [lo + i, mid + 1 + j]));
            if (left[i] <= right[j]) arr[k++] = left[i++];
            else arr[k++] = right[j++];
            steps.push(snap(arr, [k - 1]));
        }
        while (i < left.length) { arr[k++] = left[i++]; steps.push(snap(arr, [k - 1])); }
        while (j < right.length) { arr[k++] = right[j++]; steps.push(snap(arr, [k - 1])); }
    }

    function sort(lo: number, hi: number): void {
        if (lo >= hi) return;
        const mid = Math.floor((lo + hi) / 2);
        sort(lo, mid);
        sort(mid + 1, hi);
        merge(lo, mid, hi);
    }

    sort(0, arr.length - 1);
    steps.push(snap(arr, [], arr.map((_, i) => i)));
    return steps;
}

export function quickSortSteps(input: number[]): SortStep[] {
    const arr = [...input];
    const steps: SortStep[] = [snap(arr)];

    function partition(lo: number, hi: number): number {
        const pivot = arr[hi];
        let i = lo;
        for (let j = lo; j < hi; j++) {
            steps.push(snap(arr, [j, hi]));
            if (arr[j] < pivot) {
                [arr[i], arr[j]] = [arr[j], arr[i]];
                steps.push(snap(arr, [i, j]));
                i++;
            }
        }
        [arr[i], arr[hi]] = [arr[hi], arr[i]];
        steps.push(snap(arr, [i, hi]));
        return i;
    }

    function sort(lo: number, hi: number): void {
        if (lo >= hi) return;
        const p = partition(lo, hi);
        sort(lo, p - 1);
        sort(p + 1, hi);
    }

    sort(0, arr.length - 1);
    steps.push(snap(arr, [], arr.map((_, i) => i)));
    return steps;
}

export function heapSortSteps(input: number[]): SortStep[] {
    const arr = [...input];
    const steps: SortStep[] = [snap(arr)];
    const n = arr.length;

    function heapify(size: number, root: number): void {
        let largest = root;
        const l = 2 * root + 1;
        const r = 2 * root + 2;
        steps.push(snap(arr, [root, l, r].filter((x) => x < size)));
        if (l < size && arr[l] > arr[largest]) largest = l;
        if (r < size && arr[r] > arr[largest]) largest = r;
        if (largest !== root) {
            [arr[root], arr[largest]] = [arr[largest], arr[root]];
            steps.push(snap(arr, [root, largest]));
            heapify(size, largest);
        }
    }

    for (let i = Math.floor(n / 2) - 1; i >= 0; i--) heapify(n, i);

    const sorted: number[] = [];
    for (let end = n - 1; end > 0; end--) {
        [arr[0], arr[end]] = [arr[end], arr[0]];
        sorted.unshift(end);
        steps.push(snap(arr, [0, end], sorted));
        heapify(end, 0);
    }
    sorted.unshift(0);
    steps.push(snap(arr, [], sorted));
    return steps;
}

export function countingSortSteps(input: number[]): SortStep[] {
    const arr = [...input];
    const steps: SortStep[] = [snap(arr)];
    const max = Math.max(...arr);
    const count = new Array(max + 1).fill(0);
    for (const v of arr) count[v]++;
    let idx = 0;
    for (let v = 0; v <= max; v++) {
        for (let c = 0; c < count[v]; c++) {
            arr[idx] = v;
            steps.push(snap(arr, [idx], Array.from({ length: idx }, (_, k) => k)));
            idx++;
        }
    }
    steps.push(snap(arr, [], arr.map((_, i) => i)));
    return steps;
}

export function radixSortSteps(input: number[]): SortStep[] {
    const arr = [...input];
    const steps: SortStep[] = [snap(arr)];
    const max = Math.max(...arr);
    let exp = 1;
    while (Math.floor(max / exp) > 0) {
        const output = new Array(arr.length).fill(0);
        const count = new Array(10).fill(0);
        for (const v of arr) count[Math.floor(v / exp) % 10]++;
        for (let i = 1; i < 10; i++) count[i] += count[i - 1];
        for (let i = arr.length - 1; i >= 0; i--) {
            const digit = Math.floor(arr[i] / exp) % 10;
            output[--count[digit]] = arr[i];
            steps.push(snap(arr, [i]));
        }
        for (let i = 0; i < arr.length; i++) arr[i] = output[i];
        steps.push(snap(arr));
        exp *= 10;
    }
    steps.push(snap(arr, [], arr.map((_, i) => i)));
    return steps;
}

// TimSort is a hybrid of insertion sort (small runs) and merge sort (merging runs).
// We reuse merge sort's animation as a faithful-enough visual for the modal.
export const timSortSteps = mergeSortSteps;

export const SORT_GENERATORS: Record<string, (arr: number[]) => SortStep[]> = {
    Bub: bubbleSortSteps,
    Sel: selectionSortSteps,
    Ins: insertionSortSteps,
    Shl: shellSortSteps,
    Mrg: mergeSortSteps,
    Qck: quickSortSteps,
    Heq: heapSortSteps,
    Cnt: countingSortSteps,
    Rdx: radixSortSteps,
    Tim: timSortSteps,
};

export class SortPlayer {
    private steps: SortStep[] = [];
    private idx = 0;
    private timer: number | null = null;
    private speedMs = 220;

    constructor(
        private container: HTMLElement,
        private onStepChange?: (idx: number, total: number) => void,
    ) {}

    load(steps: SortStep[]): void {
        this.pause();
        this.steps = steps;
        this.idx = 0;
        this.render();
    }

    play(): void {
        if (this.timer !== null) return;
        this.timer = window.setInterval(() => {
            if (this.idx >= this.steps.length - 1) {
                this.pause();
                return;
            }
            this.idx++;
            this.render();
        }, this.speedMs);
    }

    pause(): void {
        if (this.timer !== null) {
            window.clearInterval(this.timer);
            this.timer = null;
        }
    }

    restart(): void {
        this.pause();
        this.idx = 0;
        this.render();
        this.play();
    }

    setSpeed(ms: number): void {
        this.speedMs = ms;
        if (this.timer !== null) {
            this.pause();
            this.play();
        }
    }

    private render(): void {
        const step = this.steps[this.idx];
        if (!step) return;
        const max = Math.max(...step.array, 1);
        this.container.innerHTML = '';
        step.array.forEach((value, i) => {
            const bar = document.createElement('div');
            bar.className = 'viz-bar';
            if (step.sorted.includes(i)) bar.classList.add('viz-sorted');
            else if (step.active.includes(i)) bar.classList.add('viz-active');
            bar.style.height = `${(value / max) * 100}%`;
            const label = document.createElement('span');
            label.textContent = String(value);
            bar.appendChild(label);
            this.container.appendChild(bar);
        });
        this.onStepChange?.(this.idx, this.steps.length - 1);
    }
}