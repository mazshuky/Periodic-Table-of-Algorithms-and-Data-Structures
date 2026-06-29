import './style.css';
import { CATEGORIES, ITEMS } from './data';
import { sortByComplexity, buildSlots } from './layout';
import type { AlgoItem } from './types';

function renderKey(): void {
  const keyEl = document.getElementById('key')!;
  CATEGORIES.forEach((c) => {
    const div = document.createElement('div');
    div.className = 'key-item';
    div.innerHTML = `<span class="swatch" style="background:var(--${c.id})"></span>${c.label}`;
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
    overlay.classList.add('open');
  }

  function close(): void {
    overlay.classList.remove('open');
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

renderKey();
const openModal = setupModal();
renderTable(openModal);
