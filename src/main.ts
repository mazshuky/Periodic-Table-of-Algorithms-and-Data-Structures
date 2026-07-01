import './style.css';
import { CATEGORIES, ITEMS } from './data';
import { sortByComplexity, buildSlots } from './layout';
import type { AlgoItem } from './types';
import { SORT_GENERATORS, SortPlayer, randomArray } from './visualizer/sortVisualizer.ts';
import { GRAPH_GENERATORS, GraphPlayer } from './visualizer/graphVisualizer.ts';
import { floydWarshallSteps, MatrixPlayer, tarjanSteps, TarjanPlayer } from './visualizer/matrixVisualizer.ts';
import { TREE_GENERATORS, TreePlayer, fenwickSteps, FenwickPlayer } from './visualizer/treeVisualizer.ts';
import { DP_GENERATORS, DPPlayer } from './visualizer/dpVisualizer.ts';
import { SEARCH_GENERATORS, SearchPlayer } from './visualizer/searchVisualizer.ts';
import { huffmanSteps, HuffmanPlayer, activitySelectionSteps, ActivityPlayer, jobSchedulingSteps, JobSchedulingPlayer } from './visualizer/greedyVisualizer.ts';
import { LINEAR_GENERATORS, LinearPlayer } from './visualizer/linearVisualizer.ts';
import { hashTableSteps, HashTablePlayer, bloomFilterSteps, BloomFilterPlayer, lruCacheSteps, LRUCachePlayer, binaryHeapSteps, BinaryHeapPlayer, fibHeapSteps, FibHeapPlayer } from './visualizer/hashHeapVisualizer.ts';
import { karatsubaSteps, KaratsubaPlayer, closestPairSteps, ClosestPairPlayer, nQueensSteps, NQueensPlayer, sudokuSteps, SudokuPlayer, kmpSteps, KMPPlayer, rabinKarpSteps, RabinKarpPlayer, suffixArraySteps, SuffixArrayPlayer } from './visualizer/divBackStringVisualizer.ts';

function renderKey(): void {
    const keyEl = document.getElementById('key')!;
    CATEGORIES.forEach((c) => {
        const div = document.createElement('div');
        div.className = 'key-item';

        const swatch = document.createElement('span');
        swatch.className = 'swatch';
        swatch.style.setProperty('background', `var(--${c.id})`);

        div.appendChild(swatch);
        div.appendChild(document.createTextNode(c.label));
        keyEl.appendChild(div);
    });
}

function renderTable(onSelect: (item: AlgoItem) => void): void {
    const tableEl = document.getElementById('table')!;
    const sorted = sortByComplexity(ITEMS);
    const slots = buildSlots();

    sorted.forEach((item, i) => {
        const slot = slots[i];
        if (!slot) return; // ran out of table shape (shape holds up to 118)
        const tile = document.createElement('div');
        tile.className = `tile ${item.cat}`;
        tile.style.gridColumn = String(slot.col);
        tile.style.gridRow = String(slot.row);
        tile.innerHTML = `
      <div class="complexity">${item.time}</div>
      <div class="sym">${item.sym}</div>
      <div class="name">${item.name}</div>
    `;
        tile.addEventListener('click', () => onSelect(item));
        tableEl.appendChild(tile);
    });
}

function setupModal(): (item: AlgoItem) => void {
    const overlay = document.getElementById('overlay')!;
    const catMap = Object.fromEntries(CATEGORIES.map((c) => [c.id, c]));

    const vizSection = document.getElementById('vizSection')!;
    const vizBars = document.getElementById('vizBars')!;
    const vizProgress = document.getElementById('vizProgress')!;
    const vizReplayBtn = document.getElementById('vizReplay') as HTMLButtonElement;
    const vizPlayPauseBtn = document.getElementById('vizPlayPause') as HTMLButtonElement;

    const player = new SortPlayer(vizBars, (idx, total) => {
        vizProgress.textContent = `step ${idx}/${total}`;
    });
    let isPlaying = true;

    vizReplayBtn.addEventListener('click', () => {
        player.restart();
        isPlaying = true;
        vizPlayPauseBtn.innerHTML = '&#10074;&#10074; Pause';
    });
    vizPlayPauseBtn.addEventListener('click', () => {
        if (isPlaying) {
            player.pause();
            vizPlayPauseBtn.innerHTML = '&#9654; Play';
        } else {
            player.play();
            vizPlayPauseBtn.innerHTML = '&#10074;&#10074; Pause';
        }
        isPlaying = !isPlaying;
    });

    const vizGraphSection = document.getElementById('vizGraphSection')!;
    const vizGraphSvg = document.getElementById('vizGraph') as unknown as SVGSVGElement;
    const vizGraphProgress = document.getElementById('vizGraphProgress')!;
    const vizGraphReplayBtn = document.getElementById('vizGraphReplay') as HTMLButtonElement;
    const vizGraphPlayPauseBtn = document.getElementById('vizGraphPlayPause') as HTMLButtonElement;

    const graphPlayer = new GraphPlayer(vizGraphSvg, (idx, total) => {
        vizGraphProgress.textContent = `step ${idx}/${total}`;
    });
    let isGraphPlaying = true;

    vizGraphReplayBtn.addEventListener('click', () => {
        graphPlayer.restart();
        isGraphPlaying = true;
        vizGraphPlayPauseBtn.innerHTML = '&#10074;&#10074; Pause';
    });
    vizGraphPlayPauseBtn.addEventListener('click', () => {
        if (isGraphPlaying) {
            graphPlayer.pause();
            vizGraphPlayPauseBtn.innerHTML = '&#9654; Play';
        } else {
            graphPlayer.play();
            vizGraphPlayPauseBtn.innerHTML = '&#10074;&#10074; Pause';
        }
        isGraphPlaying = !isGraphPlaying;
    });

    const vizMatrixSection = document.getElementById('vizMatrixSection')!;
    const vizMatrixEl = document.getElementById('vizMatrix')!;
    const vizMatrixProgress = document.getElementById('vizMatrixProgress')!;
    const vizMatrixReplayBtn = document.getElementById('vizMatrixReplay') as HTMLButtonElement;
    const vizMatrixPlayPauseBtn = document.getElementById('vizMatrixPlayPause') as HTMLButtonElement;

    const matrixPlayer = new MatrixPlayer(vizMatrixEl, (idx, total) => {
        vizMatrixProgress.textContent = `step ${idx}/${total}`;
    });
    let isMatrixPlaying = true;

    vizMatrixReplayBtn.addEventListener('click', () => {
        matrixPlayer.restart();
        isMatrixPlaying = true;
        vizMatrixPlayPauseBtn.innerHTML = '&#10074;&#10074; Pause';
    });
    vizMatrixPlayPauseBtn.addEventListener('click', () => {
        if (isMatrixPlaying) {
            matrixPlayer.pause();
            vizMatrixPlayPauseBtn.innerHTML = '&#9654; Play';
        } else {
            matrixPlayer.play();
            vizMatrixPlayPauseBtn.innerHTML = '&#10074;&#10074; Pause';
        }
        isMatrixPlaying = !isMatrixPlaying;
    });

    const vizTarjanSection = document.getElementById('vizTarjanSection')!;
    const vizTarjanSvg = document.getElementById('vizTarjan') as unknown as SVGSVGElement;
    const vizTarjanProgress = document.getElementById('vizTarjanProgress')!;
    const vizTarjanReplayBtn = document.getElementById('vizTarjanReplay') as HTMLButtonElement;
    const vizTarjanPlayPauseBtn = document.getElementById('vizTarjanPlayPause') as HTMLButtonElement;

    const tarjanPlayer = new TarjanPlayer(vizTarjanSvg, (idx, total) => {
        vizTarjanProgress.textContent = `step ${idx}/${total}`;
    });
    let isTarjanPlaying = true;

    vizTarjanReplayBtn.addEventListener('click', () => {
        tarjanPlayer.restart();
        isTarjanPlaying = true;
        vizTarjanPlayPauseBtn.innerHTML = '&#10074;&#10074; Pause';
    });
    vizTarjanPlayPauseBtn.addEventListener('click', () => {
        if (isTarjanPlaying) {
            tarjanPlayer.pause();
            vizTarjanPlayPauseBtn.innerHTML = '&#9654; Play';
        } else {
            tarjanPlayer.play();
            vizTarjanPlayPauseBtn.innerHTML = '&#10074;&#10074; Pause';
        }
        isTarjanPlaying = !isTarjanPlaying;
    });

    const vizTreeSection = document.getElementById('vizTreeSection')!;
    const vizTreeSvg = document.getElementById('vizTree') as unknown as SVGSVGElement;
    const vizTreeCaption = document.getElementById('vizTreeCaption')!;
    const vizTreeProgress = document.getElementById('vizTreeProgress')!;
    const vizTreeReplayBtn = document.getElementById('vizTreeReplay') as HTMLButtonElement;
    const vizTreePlayPauseBtn = document.getElementById('vizTreePlayPause') as HTMLButtonElement;

    const treePlayer = new TreePlayer(vizTreeSvg, vizTreeCaption, (idx, total) => {
        vizTreeProgress.textContent = `step ${idx}/${total}`;
    });
    let isTreePlaying = true;

    vizTreeReplayBtn.addEventListener('click', () => {
        treePlayer.restart();
        isTreePlaying = true;
        vizTreePlayPauseBtn.innerHTML = '&#10074;&#10074; Pause';
    });
    vizTreePlayPauseBtn.addEventListener('click', () => {
        if (isTreePlaying) {
            treePlayer.pause();
            vizTreePlayPauseBtn.innerHTML = '&#9654; Play';
        } else {
            treePlayer.play();
            vizTreePlayPauseBtn.innerHTML = '&#10074;&#10074; Pause';
        }
        isTreePlaying = !isTreePlaying;
    });

    const vizFenwickSection = document.getElementById('vizFenwickSection')!;
    const vizFenwickBars = document.getElementById('vizFenwickBars')!;
    const vizFenwickCaption = document.getElementById('vizFenwickCaption')!;
    const vizFenwickProgress = document.getElementById('vizFenwickProgress')!;
    const vizFenwickReplayBtn = document.getElementById('vizFenwickReplay') as HTMLButtonElement;
    const vizFenwickPlayPauseBtn = document.getElementById('vizFenwickPlayPause') as HTMLButtonElement;

    const fenwickPlayer = new FenwickPlayer(vizFenwickBars, vizFenwickCaption, (idx, total) => {
        vizFenwickProgress.textContent = `step ${idx}/${total}`;
    });
    let isFenwickPlaying = true;

    vizFenwickReplayBtn.addEventListener('click', () => {
        fenwickPlayer.restart();
        isFenwickPlaying = true;
        vizFenwickPlayPauseBtn.innerHTML = '&#10074;&#10074; Pause';
    });
    vizFenwickPlayPauseBtn.addEventListener('click', () => {
        if (isFenwickPlaying) {
            fenwickPlayer.pause();
            vizFenwickPlayPauseBtn.innerHTML = '&#9654; Play';
        } else {
            fenwickPlayer.play();
            vizFenwickPlayPauseBtn.innerHTML = '&#10074;&#10074; Pause';
        }
        isFenwickPlaying = !isFenwickPlaying;
    });

    const vizDPSection = document.getElementById('vizDPSection')!;
    const vizDPEl = document.getElementById('vizDP')!;
    const vizDPCaption = document.getElementById('vizDPCaption')!;
    const vizDPProgress = document.getElementById('vizDPProgress')!;
    const vizDPReplayBtn = document.getElementById('vizDPReplay') as HTMLButtonElement;
    const vizDPPlayPauseBtn = document.getElementById('vizDPPlayPause') as HTMLButtonElement;

    const dpPlayer = new DPPlayer(vizDPEl, vizDPCaption, (idx, total) => {
        vizDPProgress.textContent = `step ${idx}/${total}`;
    });
    let isDPPlaying = true;

    vizDPReplayBtn.addEventListener('click', () => {
        dpPlayer.restart();
        isDPPlaying = true;
        vizDPPlayPauseBtn.innerHTML = '&#10074;&#10074; Pause';
    });
    vizDPPlayPauseBtn.addEventListener('click', () => {
        if (isDPPlaying) {
            dpPlayer.pause();
            vizDPPlayPauseBtn.innerHTML = '&#9654; Play';
        } else {
            dpPlayer.play();
            vizDPPlayPauseBtn.innerHTML = '&#10074;&#10074; Pause';
        }
        isDPPlaying = !isDPPlaying;
    });

    const vizSearchSection = document.getElementById('vizSearchSection')!;
    const vizSearchBars = document.getElementById('vizSearchBars')!;
    const vizSearchCaption = document.getElementById('vizSearchCaption')!;
    const vizSearchProgress = document.getElementById('vizSearchProgress')!;
    const vizSearchReplayBtn = document.getElementById('vizSearchReplay') as HTMLButtonElement;
    const vizSearchPlayPauseBtn = document.getElementById('vizSearchPlayPause') as HTMLButtonElement;

    const searchPlayer = new SearchPlayer(vizSearchBars, vizSearchCaption, (idx, total) => {
        vizSearchProgress.textContent = `step ${idx}/${total}`;
    });
    let isSearchPlaying = true;

    vizSearchReplayBtn.addEventListener('click', () => {
        searchPlayer.restart();
        isSearchPlaying = true;
        vizSearchPlayPauseBtn.innerHTML = '&#10074;&#10074; Pause';
    });
    vizSearchPlayPauseBtn.addEventListener('click', () => {
        if (isSearchPlaying) {
            searchPlayer.pause();
            vizSearchPlayPauseBtn.innerHTML = '&#9654; Play';
        } else {
            searchPlayer.play();
            vizSearchPlayPauseBtn.innerHTML = '&#10074;&#10074; Pause';
        }
        isSearchPlaying = !isSearchPlaying;
    });

    // Huffman
    const vizHuffSection = document.getElementById('vizHuffSection')!;
    const vizHuffSvg = document.getElementById('vizHuff') as unknown as SVGSVGElement;
    const vizHuffCaption = document.getElementById('vizHuffCaption')!;
    const vizHuffProgress = document.getElementById('vizHuffProgress')!;
    const vizHuffReplayBtn = document.getElementById('vizHuffReplay') as HTMLButtonElement;
    const vizHuffPlayPauseBtn = document.getElementById('vizHuffPlayPause') as HTMLButtonElement;
    const huffPlayer = new HuffmanPlayer(vizHuffSvg, vizHuffCaption, (idx, total) => { vizHuffProgress.textContent = `step ${idx}/${total}`; });
    let isHuffPlaying = true;
    vizHuffReplayBtn.addEventListener('click', () => { huffPlayer.restart(); isHuffPlaying = true; vizHuffPlayPauseBtn.innerHTML = '&#10074;&#10074; Pause'; });
    vizHuffPlayPauseBtn.addEventListener('click', () => {
        if (isHuffPlaying) { huffPlayer.pause(); vizHuffPlayPauseBtn.innerHTML = '&#9654; Play'; }
        else { huffPlayer.play(); vizHuffPlayPauseBtn.innerHTML = '&#10074;&#10074; Pause'; }
        isHuffPlaying = !isHuffPlaying;
    });

    // Activity Selection
    const vizActivitySection = document.getElementById('vizActivitySection')!;
    const vizActivityEl = document.getElementById('vizActivity')!;
    const vizActivityCaption = document.getElementById('vizActivityCaption')!;
    const vizActivityProgress = document.getElementById('vizActivityProgress')!;
    const vizActivityReplayBtn = document.getElementById('vizActivityReplay') as HTMLButtonElement;
    const vizActivityPlayPauseBtn = document.getElementById('vizActivityPlayPause') as HTMLButtonElement;
    const activityPlayer = new ActivityPlayer(vizActivityEl, vizActivityCaption, (idx, total) => { vizActivityProgress.textContent = `step ${idx}/${total}`; });
    let isActivityPlaying = true;
    vizActivityReplayBtn.addEventListener('click', () => { activityPlayer.restart(); isActivityPlaying = true; vizActivityPlayPauseBtn.innerHTML = '&#10074;&#10074; Pause'; });
    vizActivityPlayPauseBtn.addEventListener('click', () => {
        if (isActivityPlaying) { activityPlayer.pause(); vizActivityPlayPauseBtn.innerHTML = '&#9654; Play'; }
        else { activityPlayer.play(); vizActivityPlayPauseBtn.innerHTML = '&#10074;&#10074; Pause'; }
        isActivityPlaying = !isActivityPlaying;
    });

    // Job Scheduling
    const vizJobSection = document.getElementById('vizJobSection')!;
    const vizJobEl = document.getElementById('vizJob')!;
    const vizJobCaption = document.getElementById('vizJobCaption')!;
    const vizJobProgress = document.getElementById('vizJobProgress')!;
    const vizJobReplayBtn = document.getElementById('vizJobReplay') as HTMLButtonElement;
    const vizJobPlayPauseBtn = document.getElementById('vizJobPlayPause') as HTMLButtonElement;
    const jobPlayer = new JobSchedulingPlayer(vizJobEl, vizJobCaption, (idx, total) => { vizJobProgress.textContent = `step ${idx}/${total}`; });
    let isJobPlaying = true;
    vizJobReplayBtn.addEventListener('click', () => { jobPlayer.restart(); isJobPlaying = true; vizJobPlayPauseBtn.innerHTML = '&#10074;&#10074; Pause'; });
    vizJobPlayPauseBtn.addEventListener('click', () => {
        if (isJobPlaying) { jobPlayer.pause(); vizJobPlayPauseBtn.innerHTML = '&#9654; Play'; }
        else { jobPlayer.play(); vizJobPlayPauseBtn.innerHTML = '&#10074;&#10074; Pause'; }
        isJobPlaying = !isJobPlaying;
    });

    // Helper to create a simple player registration (reduces boilerplate)
    function makePlayer<T>(
        sectionId: string, containerId: string, captionId: string, progressId: string,
        replayId: string, playPauseId: string,
        PlayerClass: new (c: HTMLElement, cap: HTMLElement, cb: (i: number, t: number) => void) => T & { load(s: unknown[]): void; play(): void; pause(): void; restart(): void },
    ): { player: T & { load(s: unknown[]): void; play(): void; pause(): void; restart(): void }; section: HTMLElement; playPauseBtn: HTMLButtonElement; isPlaying: { v: boolean } } {
        const section = document.getElementById(sectionId)!;
        const container = document.getElementById(containerId)!;
        const captionEl = document.getElementById(captionId)!;
        const progress = document.getElementById(progressId)!;
        const replayBtn = document.getElementById(replayId) as HTMLButtonElement;
        const playPauseBtn = document.getElementById(playPauseId) as HTMLButtonElement;
        const isPlaying = { v: true };
        const player = new PlayerClass(container, captionEl, (idx, total) => { progress.textContent = `step ${idx}/${total}`; });
        replayBtn.addEventListener('click', () => { player.restart(); isPlaying.v = true; playPauseBtn.innerHTML = '&#10074;&#10074; Pause'; });
        playPauseBtn.addEventListener('click', () => {
            if (isPlaying.v) { player.pause(); playPauseBtn.innerHTML = '&#9654; Play'; }
            else { player.play(); playPauseBtn.innerHTML = '&#10074;&#10074; Pause'; }
            isPlaying.v = !isPlaying.v;
        });
        return { player, section, playPauseBtn, isPlaying };
    }

    const linear = makePlayer('vizLinearSection', 'vizLinear', 'vizLinearCaption', 'vizLinearProgress', 'vizLinearReplay', 'vizLinearPlayPause', LinearPlayer);
    const hashTbl = makePlayer('vizHashSection', 'vizHash', 'vizHashCaption', 'vizHashProgress', 'vizHashReplay', 'vizHashPlayPause', HashTablePlayer);
    const bloom = makePlayer('vizBloomSection', 'vizBloom', 'vizBloomCaption', 'vizBloomProgress', 'vizBloomReplay', 'vizBloomPlayPause', BloomFilterPlayer);
    const lru = makePlayer('vizLruSection', 'vizLru', 'vizLruCaption', 'vizLruProgress', 'vizLruReplay', 'vizLruPlayPause', LRUCachePlayer);
    const bheap = makePlayer('vizBheapSection', 'vizBheap', 'vizBheapCaption', 'vizBheapProgress', 'vizBheapReplay', 'vizBheapPlayPause', BinaryHeapPlayer);
    const fibheap = makePlayer('vizFibheapSection', 'vizFibheap', 'vizFibheapCaption', 'vizFibheapProgress', 'vizFibheapReplay', 'vizFibheapPlayPause', FibHeapPlayer);
    const kara = makePlayer('vizKaraSection', 'vizKara', 'vizKaraCaption', 'vizKaraProgress', 'vizKaraReplay', 'vizKaraPlayPause', KaratsubaPlayer);
    const queens = makePlayer('vizQueensSection', 'vizQueens', 'vizQueensCaption', 'vizQueensProgress', 'vizQueensReplay', 'vizQueensPlayPause', NQueensPlayer);
    const sudoku = makePlayer('vizSudokuSection', 'vizSudoku', 'vizSudokuCaption', 'vizSudokuProgress', 'vizSudokuReplay', 'vizSudokuPlayPause', SudokuPlayer);
    const kmp = makePlayer('vizKmpSection', 'vizKmp', 'vizKmpCaption', 'vizKmpProgress', 'vizKmpReplay', 'vizKmpPlayPause', KMPPlayer);
    const rbk = makePlayer('vizRbkSection', 'vizRbk', 'vizRbkCaption', 'vizRbkProgress', 'vizRbkReplay', 'vizRbkPlayPause', RabinKarpPlayer);
    const sfx = makePlayer('vizSfxSection', 'vizSfx', 'vizSfxCaption', 'vizSfxProgress', 'vizSfxReplay', 'vizSfxPlayPause', SuffixArrayPlayer);

    // Closest Pair uses SVG, needs manual setup
    const vizClsSection = document.getElementById('vizClsSection')!;
    const vizClsSvg = document.getElementById('vizCls') as unknown as SVGSVGElement;
    const vizClsCaption = document.getElementById('vizClsCaption')!;
    const vizClsProgress = document.getElementById('vizClsProgress')!;
    const vizClsReplayBtn = document.getElementById('vizClsReplay') as HTMLButtonElement;
    const vizClsPlayPauseBtn = document.getElementById('vizClsPlayPause') as HTMLButtonElement;
    const clsPlayer = new ClosestPairPlayer(vizClsSvg, vizClsCaption, (idx, total) => { vizClsProgress.textContent = `step ${idx}/${total}`; });
    let isClsPlaying = true;
    vizClsReplayBtn.addEventListener('click', () => { clsPlayer.restart(); isClsPlaying = true; vizClsPlayPauseBtn.innerHTML = '&#10074;&#10074; Pause'; });
    vizClsPlayPauseBtn.addEventListener('click', () => {
        if (isClsPlaying) { clsPlayer.pause(); vizClsPlayPauseBtn.innerHTML = '&#9654; Play'; }
        else { clsPlayer.play(); vizClsPlayPauseBtn.innerHTML = '&#10074;&#10074; Pause'; }
        isClsPlaying = !isClsPlaying;
    });

    const allSections = [
        vizSection, vizGraphSection, vizMatrixSection, vizTarjanSection, vizTreeSection,
        vizFenwickSection, vizDPSection, vizSearchSection, vizHuffSection, vizActivitySection,
        vizJobSection, linear.section, hashTbl.section, bloom.section, lru.section,
        bheap.section, fibheap.section, kara.section, vizClsSection, queens.section,
        sudoku.section, kmp.section, rbk.section, sfx.section,
    ];

    const allPause = () => {
        player.pause(); graphPlayer.pause(); matrixPlayer.pause(); tarjanPlayer.pause();
        treePlayer.pause(); fenwickPlayer.pause(); dpPlayer.pause(); searchPlayer.pause();
        huffPlayer.pause(); activityPlayer.pause(); jobPlayer.pause();
        linear.player.pause(); hashTbl.player.pause(); bloom.player.pause(); lru.player.pause();
        bheap.player.pause(); fibheap.player.pause(); kara.player.pause(); clsPlayer.pause();
        queens.player.pause(); sudoku.player.pause(); kmp.player.pause(); rbk.player.pause(); sfx.player.pause();
    };

    function activate(section: HTMLElement, startFn: () => void): void {
        allSections.forEach((s) => s.classList.remove('show'));
        allPause();
        section.classList.add('show');
        startFn();
    }

    function open(item: AlgoItem): void {
        const cat = catMap[item.cat];
        (document.getElementById('mSym') as HTMLElement).textContent = item.sym;
        (document.getElementById('mSym') as HTMLElement).style.color = `var(--${item.cat})`;
        (document.getElementById('mName') as HTMLElement).textContent = item.name;
        const catEl = document.getElementById('mCat') as HTMLElement;
        catEl.textContent = cat.label;
        catEl.style.color = `var(--${item.cat})`;
        (document.getElementById('mBest') as HTMLElement).textContent = item.best ?? item.time;
        (document.getElementById('mAvg') as HTMLElement).textContent = item.average ?? item.time;
        (document.getElementById('mWorst') as HTMLElement).textContent = item.worst ?? item.time;
        (document.getElementById('mSpace') as HTMLElement).textContent = item.space;
        (document.getElementById('mDesc') as HTMLElement).textContent = item.desc;

        const sortGenerator = SORT_GENERATORS[item.sym];
        const graphGenerator = GRAPH_GENERATORS[item.sym];
        const treeGenerator = TREE_GENERATORS[item.sym];
        const dpGenerator = DP_GENERATORS[item.sym];
        const searchGenerator = SEARCH_GENERATORS[item.sym];
        const linearGenerator = LINEAR_GENERATORS[item.sym];

        if (sortGenerator) {
            activate(vizSection, () => { player.load(sortGenerator(randomArray())); player.play(); isPlaying = true; vizPlayPauseBtn.innerHTML = '&#10074;&#10074; Pause'; });
        } else if (searchGenerator) {
            activate(vizSearchSection, () => { searchPlayer.load(searchGenerator()); searchPlayer.play(); isSearchPlaying = true; vizSearchPlayPauseBtn.innerHTML = '&#10074;&#10074; Pause'; });
        } else if (item.sym === 'Huf') {
            activate(vizHuffSection, () => { huffPlayer.load(huffmanSteps()); huffPlayer.play(); isHuffPlaying = true; vizHuffPlayPauseBtn.innerHTML = '&#10074;&#10074; Pause'; });
        } else if (item.sym === 'Act') {
            activate(vizActivitySection, () => { activityPlayer.load(activitySelectionSteps()); activityPlayer.play(); isActivityPlaying = true; vizActivityPlayPauseBtn.innerHTML = '&#10074;&#10074; Pause'; });
        } else if (item.sym === 'Job') {
            activate(vizJobSection, () => { jobPlayer.load(jobSchedulingSteps()); jobPlayer.play(); isJobPlaying = true; vizJobPlayPauseBtn.innerHTML = '&#10074;&#10074; Pause'; });
        } else if (linearGenerator) {
            activate(linear.section, () => { linear.player.load(linearGenerator()); linear.player.play(); linear.isPlaying.v = true; linear.playPauseBtn.innerHTML = '&#10074;&#10074; Pause'; });
        } else if (item.sym === 'Has') {
            activate(hashTbl.section, () => { hashTbl.player.load(hashTableSteps()); hashTbl.player.play(); hashTbl.isPlaying.v = true; hashTbl.playPauseBtn.innerHTML = '&#10074;&#10074; Pause'; });
        } else if (item.sym === 'Blf') {
            activate(bloom.section, () => { bloom.player.load(bloomFilterSteps()); bloom.player.play(); bloom.isPlaying.v = true; bloom.playPauseBtn.innerHTML = '&#10074;&#10074; Pause'; });
        } else if (item.sym === 'Lru') {
            activate(lru.section, () => { lru.player.load(lruCacheSteps()); lru.player.play(); lru.isPlaying.v = true; lru.playPauseBtn.innerHTML = '&#10074;&#10074; Pause'; });
        } else if (item.sym === 'Bhp') {
            activate(bheap.section, () => { bheap.player.load(binaryHeapSteps()); bheap.player.play(); bheap.isPlaying.v = true; bheap.playPauseBtn.innerHTML = '&#10074;&#10074; Pause'; });
        } else if (item.sym === 'Fhp') {
            activate(fibheap.section, () => { fibheap.player.load(fibHeapSteps()); fibheap.player.play(); fibheap.isPlaying.v = true; fibheap.playPauseBtn.innerHTML = '&#10074;&#10074; Pause'; });
        } else if (item.sym === 'Kar') {
            activate(kara.section, () => { kara.player.load(karatsubaSteps()); kara.player.play(); kara.isPlaying.v = true; kara.playPauseBtn.innerHTML = '&#10074;&#10074; Pause'; });
        } else if (item.sym === 'Cls') {
            activate(vizClsSection, () => { clsPlayer.load(closestPairSteps()); clsPlayer.play(); isClsPlaying = true; vizClsPlayPauseBtn.innerHTML = '&#10074;&#10074; Pause'; });
        } else if (item.sym === 'Nqn') {
            activate(queens.section, () => { queens.player.load(nQueensSteps()); queens.player.play(); queens.isPlaying.v = true; queens.playPauseBtn.innerHTML = '&#10074;&#10074; Pause'; });
        } else if (item.sym === 'Sud') {
            activate(sudoku.section, () => { sudoku.player.load(sudokuSteps()); sudoku.player.play(); sudoku.isPlaying.v = true; sudoku.playPauseBtn.innerHTML = '&#10074;&#10074; Pause'; });
        } else if (item.sym === 'Kmp') {
            activate(kmp.section, () => { kmp.player.load(kmpSteps()); kmp.player.play(); kmp.isPlaying.v = true; kmp.playPauseBtn.innerHTML = '&#10074;&#10074; Pause'; });
        } else if (item.sym === 'Rbk') {
            activate(rbk.section, () => { rbk.player.load(rabinKarpSteps()); rbk.player.play(); rbk.isPlaying.v = true; rbk.playPauseBtn.innerHTML = '&#10074;&#10074; Pause'; });
        } else if (item.sym === 'Sfx') {
            activate(sfx.section, () => { sfx.player.load(suffixArraySteps()); sfx.player.play(); sfx.isPlaying.v = true; sfx.playPauseBtn.innerHTML = '&#10074;&#10074; Pause'; });
        } else if (graphGenerator) {
            activate(vizGraphSection, () => { graphPlayer.load(graphGenerator()); graphPlayer.play(); isGraphPlaying = true; vizGraphPlayPauseBtn.innerHTML = '&#10074;&#10074; Pause'; });
        } else if (item.sym === 'Fwl') {
            activate(vizMatrixSection, () => { matrixPlayer.load(floydWarshallSteps()); matrixPlayer.play(); isMatrixPlaying = true; vizMatrixPlayPauseBtn.innerHTML = '&#10074;&#10074; Pause'; });
        } else if (item.sym === 'Tar') {
            activate(vizTarjanSection, () => { tarjanPlayer.load(tarjanSteps()); tarjanPlayer.play(); isTarjanPlaying = true; vizTarjanPlayPauseBtn.innerHTML = '&#10074;&#10074; Pause'; });
        } else if (treeGenerator) {
            activate(vizTreeSection, () => { treePlayer.load(treeGenerator()); treePlayer.play(); isTreePlaying = true; vizTreePlayPauseBtn.innerHTML = '&#10074;&#10074; Pause'; });
        } else if (item.sym === 'Fwt') {
            activate(vizFenwickSection, () => { fenwickPlayer.load(fenwickSteps()); fenwickPlayer.play(); isFenwickPlaying = true; vizFenwickPlayPauseBtn.innerHTML = '&#10074;&#10074; Pause'; });
        } else if (dpGenerator) {
            activate(vizDPSection, () => { dpPlayer.load(dpGenerator()); dpPlayer.play(); isDPPlaying = true; vizDPPlayPauseBtn.innerHTML = '&#10074;&#10074; Pause'; });
        } else {
            allSections.forEach((s) => s.classList.remove('show'));
        }

        overlay.classList.add('open');
    }

    function close(): void {
        overlay.classList.remove('open');
        allPause();
    }

    document.getElementById('closeBtn')!.addEventListener('click', close);
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) close();
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') close();
    });

    return open;
}

function setupThemeToggle(): void {
    const root = document.documentElement;
    const btn = document.getElementById('themeToggle') as HTMLButtonElement;
    const stored = localStorage.getItem('theme');
    const prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
    const initial = stored ?? (prefersLight ? 'light' : 'dark');

    applyTheme(initial);

    btn.addEventListener('click', () => {
        const next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
        applyTheme(next);
        localStorage.setItem('theme', next);
    });

    function applyTheme(theme: string): void {
        if (theme === 'light') {
            root.setAttribute('data-theme', 'light');
            btn.innerHTML = '&#127769;'; // moon, click to go dark
        } else {
            root.removeAttribute('data-theme');
            btn.innerHTML = '&#9728;&#65039;'; // sun, click to go light
        }
    }
}

renderKey();
setupThemeToggle();
const openModal = setupModal();
renderTable(openModal);