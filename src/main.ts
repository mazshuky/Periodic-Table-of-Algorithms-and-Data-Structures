import './style.css';
import { CATEGORIES, ITEMS } from './data';
import { sortByComplexity, buildSlots } from './layout';
import type { AlgoItem } from './types';
import { SORT_GENERATORS, SortPlayer, randomArray } from './sortVisualizer';
import { GRAPH_GENERATORS, GraphPlayer } from './graphVisualizer';
import { floydWarshallSteps, MatrixPlayer, tarjanSteps, TarjanPlayer } from './matrixVisualizer';

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

    function open(item: AlgoItem): void {
        const cat = catMap[item.cat];
        (document.getElementById('mSym') as HTMLElement).textContent = item.sym;
        (document.getElementById('mSym') as HTMLElement).style.color = `var(--${item.cat})`;
        (document.getElementById('mName') as HTMLElement).textContent = item.name;
        const catEl = document.getElementById('mCat') as HTMLElement;
        catEl.textContent = cat.label;
        catEl.style.color = `var(--${item.cat})`;
        (document.getElementById('mTime') as HTMLElement).textContent = item.time;
        (document.getElementById('mSpace') as HTMLElement).textContent = item.space;
        (document.getElementById('mDesc') as HTMLElement).textContent = item.desc;

        const sortGenerator = SORT_GENERATORS[item.sym];
        const graphGenerator = GRAPH_GENERATORS[item.sym];
        const isFloydWarshall = item.sym === 'Fwl';
        const isTarjan = item.sym === 'Tar';

        function hideAllViz(): void {
            vizSection.classList.remove('show');
            vizGraphSection.classList.remove('show');
            vizMatrixSection.classList.remove('show');
            vizTarjanSection.classList.remove('show');
            player.pause();
            graphPlayer.pause();
            matrixPlayer.pause();
            tarjanPlayer.pause();
        }

        hideAllViz();

        if (sortGenerator) {
            vizSection.classList.add('show');
            const steps = sortGenerator(randomArray());
            player.load(steps);
            player.play();
            isPlaying = true;
            vizPlayPauseBtn.innerHTML = '&#10074;&#10074; Pause';
        } else if (graphGenerator) {
            vizGraphSection.classList.add('show');
            const steps = graphGenerator();
            graphPlayer.load(steps);
            graphPlayer.play();
            isGraphPlaying = true;
            vizGraphPlayPauseBtn.innerHTML = '&#10074;&#10074; Pause';
        } else if (isFloydWarshall) {
            vizMatrixSection.classList.add('show');
            matrixPlayer.load(floydWarshallSteps());
            matrixPlayer.play();
            isMatrixPlaying = true;
            vizMatrixPlayPauseBtn.innerHTML = '&#10074;&#10074; Pause';
        } else if (isTarjan) {
            vizTarjanSection.classList.add('show');
            tarjanPlayer.load(tarjanSteps());
            tarjanPlayer.play();
            isTarjanPlaying = true;
            vizTarjanPlayPauseBtn.innerHTML = '&#10074;&#10074; Pause';
        }

        overlay.classList.add('open');
    }

    function close(): void {
        overlay.classList.remove('open');
        player.pause();
        graphPlayer.pause();
        matrixPlayer.pause();
        tarjanPlayer.pause();
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