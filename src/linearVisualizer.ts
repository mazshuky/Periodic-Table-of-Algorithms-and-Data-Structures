// Shared "box row" renderer for linear structures.
// Each step shows a sequence of labelled cells + a pointer + caption.

export interface LinearStep {
    cells: LinearCell[];
    pointer?: number;   // index of the active cell (head, top, front, etc.)
    pointer2?: number;  // second pointer (tail, rear for deque)
    caption: string;
}

export interface LinearCell {
    value: string | number | null;
    label?: string;   // small label below cell (index, 'head', 'top', etc.)
    state: 'normal' | 'active' | 'new' | 'removed' | 'empty';
}

function cell(value: string | number | null, state: LinearCell['state'] = 'normal', label?: string): LinearCell {
    return { value, state, label };
}

function snap(cells: LinearCell[], caption: string, pointer?: number, pointer2?: number): LinearStep {
    return { cells: cells.map((c) => ({ ...c })), caption, pointer, pointer2 };
}

// ---------- Array ----------
export function arraySteps(): LinearStep[] {
    const arr: (number | null)[] = [12, 45, 7, 23, 56, 34, 8, 91];
    const steps: LinearStep[] = [];

    const base = () => arr.map((v, i) => cell(v, 'normal', String(i)));

    steps.push(snap(base(), 'Array: 8 elements in contiguous memory, each accessible by index in O(1)'));

    // Access index 5
    const access = base();
    access[5] = cell(arr[5], 'active', '5');
    steps.push(snap(access, 'Access index 5: jump directly to address (base + 5 × size) → value 34', 5));

    // Insert at index 3 (shift right)
    const beforeInsert = base();
    steps.push(snap(beforeInsert, 'Insert 99 at index 3: must shift elements 3..7 right by one', 3));
    for (let i = arr.length - 1; i >= 3; i--) {
        const s = base().map((c, j) => j >= 3 ? cell(c.value, 'active', String(j)) : c);
        steps.push(snap(s, `Shift index ${i} → ${i + 1}`, i));
    }
    arr.splice(3, 0, 99);
    const afterInsert = arr.map((v, i) => cell(v, i === 3 ? 'new' : 'normal', String(i)));
    steps.push(snap(afterInsert, 'Inserted 99 at index 3 — O(n) shift complete', 3));

    // Delete at index 5
    const beforeDel = arr.map((v, i) => cell(v, i === 5 ? 'active' : 'normal', String(i)));
    steps.push(snap(beforeDel, 'Delete index 5: mark for removal, then shift left', 5));
    arr.splice(5, 1);
    const afterDel = arr.map((v, i) => cell(v, 'normal', String(i)));
    steps.push(snap(afterDel, 'Deleted — O(n) shift complete. Array now has 8 elements'));

    return steps;
}

// ---------- Linked List ----------
export function linkedListSteps(): LinearStep[] {
    const steps: LinearStep[] = [];
    const list: number[] = [10, 20, 30, 40, 50];

    const toRow = (active = -1, newIdx = -1) =>
        list.map((v, i) => cell(v, i === newIdx ? 'new' : i === active ? 'active' : 'normal', i === 0 ? 'head' : undefined));

    steps.push(snap(toRow(), 'Singly linked list — each node holds a value and a pointer to the next node'));

    // Traverse
    for (let i = 0; i < list.length; i++) {
        steps.push(snap(toRow(i), `Traverse: visit node ${i} (value ${list[i]})`, i));
    }

    // Prepend
    list.unshift(5);
    steps.push(snap(toRow(-1, 0), 'Prepend 5: create node, point it to old head → new head. O(1)', 0));

    // Insert after index 2
    list.splice(3, 0, 25);
    steps.push(snap(toRow(-1, 3), 'Insert 25 after index 2: rewire two pointers. O(1) once at position', 3));

    // Delete head
    list.shift();
    steps.push(snap(toRow(-1, 0), 'Delete head: advance head pointer to next node. O(1)', 0));

    return steps;
}

// ---------- Stack ----------
export function stackSteps(): LinearStep[] {
    const steps: LinearStep[] = [];
    const stack: number[] = [];

    const toRow = (topIdx = -1, newIdx = -1) =>
        stack.map((v, i) => cell(v, i === newIdx ? 'new' : i === topIdx ? 'active' : 'normal', i === stack.length - 1 ? 'top' : undefined));

    steps.push(snap([], 'Stack: LIFO (last in, first out). All operations at the top in O(1)'));

    for (const v of [10, 20, 30, 40]) {
        stack.push(v);
        const row = toRow(-1, stack.length - 1);
        steps.push(snap(row, `Push ${v} → top of stack`, stack.length - 1));
    }

    // Peek
    const peek = toRow(stack.length - 1);
    steps.push(snap(peek, `Peek: top is ${stack[stack.length - 1]} — read without removing`, stack.length - 1));

    // Pop
    for (let i = 0; i < 2; i++) {
        const top = stack[stack.length - 1];
        const before = stack.map((v, j) => cell(v, j === stack.length - 1 ? 'removed' : 'normal', j === stack.length - 1 ? 'top' : undefined));
        steps.push(snap(before, `Pop: remove top value ${top}`, stack.length - 1));
        stack.pop();
        steps.push(snap(toRow(-1), `Popped ${top}. New top is ${stack[stack.length - 1]}`));
    }

    return steps;
}

// ---------- Queue ----------
export function queueSteps(): LinearStep[] {
    const steps: LinearStep[] = [];
    const queue: number[] = [];

    const toRow = (frontNew = false, rearNew = false) =>
        queue.map((v, i) => {
            const isFront = i === 0;
            const isRear = i === queue.length - 1;
            const state: LinearCell['state'] = (isFront && frontNew) || (isRear && rearNew) ? 'new' : 'normal';
            const label = isFront && isRear ? 'front/rear' : isFront ? 'front' : isRear ? 'rear' : undefined;
            return cell(v, state, label);
        });

    steps.push(snap([], 'Queue: FIFO (first in, first out). Enqueue at rear, dequeue from front'));

    for (const v of [10, 20, 30, 40]) {
        queue.push(v);
        steps.push(snap(toRow(false, true), `Enqueue ${v} → rear`, undefined, queue.length - 1));
    }

    // Dequeue
    for (let i = 0; i < 2; i++) {
        const front = queue[0];
        const before = queue.map((v, j) => cell(v, j === 0 ? 'removed' : 'normal', j === 0 ? 'front' : j === queue.length - 1 ? 'rear' : undefined));
        steps.push(snap(before, `Dequeue: remove front value ${front}`, 0));
        queue.shift();
        steps.push(snap(toRow(), `Dequeued ${front}. New front is ${queue[0]}`));
    }

    steps.push(snap(toRow(), `Queue has ${queue.length} remaining: [${queue.join(', ')}]`));
    return steps;
}

// ---------- Deque ----------
export function dequeSteps(): LinearStep[] {
    const steps: LinearStep[] = [];
    const deque: number[] = [];

    const toRow = (frontIdx?: number, rearIdx?: number) =>
        deque.map((v, i) => {
            const isFront = i === 0;
            const isRear = i === deque.length - 1;
            const state: LinearCell['state'] = i === frontIdx || i === rearIdx ? 'new' : 'normal';
            const label = isFront && isRear ? 'front/rear' : isFront ? 'front' : isRear ? 'rear' : undefined;
            return cell(v, state, label);
        });

    steps.push(snap([], 'Deque (double-ended queue): O(1) insert and remove at both ends'));

    deque.push(30);
    steps.push(snap(toRow(undefined, 0), 'Push rear: 30'));

    deque.push(40);
    steps.push(snap(toRow(undefined, 1), 'Push rear: 40'));

    deque.unshift(20);
    steps.push(snap(toRow(0), 'Push front: 20'));

    deque.unshift(10);
    steps.push(snap(toRow(0), 'Push front: 10'));

    deque.push(50);
    steps.push(snap(toRow(undefined, deque.length - 1), 'Push rear: 50'));

    const front = deque[0];
    const before = deque.map((v, i) => cell(v, i === 0 ? 'removed' : 'normal', i === 0 ? 'front' : i === deque.length - 1 ? 'rear' : undefined));
    steps.push(snap(before, `Pop front: remove ${front}`));
    deque.shift();
    steps.push(snap(toRow(), `Popped front ${front}. Deque: [${deque.join(', ')}]`));

    const rear = deque[deque.length - 1];
    const before2 = deque.map((v, i) => cell(v, i === deque.length - 1 ? 'removed' : 'normal', i === 0 ? 'front' : i === deque.length - 1 ? 'rear' : undefined));
    steps.push(snap(before2, `Pop rear: remove ${rear}`));
    deque.pop();
    steps.push(snap(toRow(), `Popped rear ${rear}. Deque: [${deque.join(', ')}]`));

    return steps;
}

export const LINEAR_GENERATORS: Record<string, () => LinearStep[]> = {
    Arr: arraySteps,
    Lkl: linkedListSteps,
    Stk: stackSteps,
    Que: queueSteps,
    Dql: dequeSteps,
};

export class LinearPlayer {
    private steps: LinearStep[] = [];
    private idx = 0;
    private timer: number | null = null;
    private speedMs = 850;

    constructor(
        private container: HTMLElement,
        private captionEl: HTMLElement,
        private onStepChange?: (idx: number, total: number) => void,
    ) {}

    load(steps: LinearStep[]): void { this.pause(); this.steps = steps; this.idx = 0; this.render(); }

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

        if (step.cells.length === 0) {
            const empty = document.createElement('div');
            empty.style.cssText = 'color:var(--muted); font-size:12px; text-align:center; padding:24px 0;';
            empty.textContent = '(empty)';
            this.container.appendChild(empty);
        } else {
            const row = document.createElement('div');
            row.style.cssText = 'display:flex; gap:4px; flex-wrap:wrap; align-items:flex-end;';

            step.cells.forEach((c, i) => {
                const wrap = document.createElement('div');
                wrap.style.cssText = 'display:flex; flex-direction:column; align-items:center; gap:2px;';

                const box = document.createElement('div');
                const isActive = c.state === 'active' || i === step.pointer || i === step.pointer2;
                const bg = c.state === 'new' ? 'var(--search-dim)' : c.state === 'removed' ? 'var(--back-dim)' : c.state === 'active' || isActive ? 'var(--greedy-dim)' : 'var(--panel)';
                const border = c.state === 'new' ? 'var(--search)' : c.state === 'removed' ? 'var(--back)' : c.state === 'active' || isActive ? 'var(--greedy)' : 'var(--grid-line)';
                box.style.cssText = `width:38px; height:38px; border-radius:5px; border:1.5px solid ${border}; background:${bg}; display:flex; align-items:center; justify-content:center; font-size:11px; font-weight:700; color:var(--text);`;
                box.textContent = c.value === null ? '' : String(c.value);
                wrap.appendChild(box);

                if (c.label) {
                    const lbl = document.createElement('div');
                    lbl.style.cssText = 'font-size:8px; color:var(--muted);';
                    lbl.textContent = c.label;
                    wrap.appendChild(lbl);
                }

                row.appendChild(wrap);
            });

            this.container.appendChild(row);
        }

        this.captionEl.textContent = step.caption;
        this.onStepChange?.(this.idx, this.steps.length - 1);
    }
}