/**
 * InvestTrack - Aplikasi Pencatatan Portofolio Investasi Multi-Aset
 * Mendukung penambahan banyak aset untuk Saham, Reksadana, Crypto, Emas, dan Ringkasan Otomatis
 */

const STORAGE_KEY = 'investtrack_data_v2';

// Contoh data bawaan dengan multiple aset untuk setiap kategori
const defaultData = [
  // --- Kategori Saham (Multiple: 3 Saham) ---
  {
    id: 'saham-bbca',
    category: 'saham',
    name: 'BBCA',
    detailName: 'Bank Central Asia Tbk',
    lot: 10, // 10 lot = 1.000 lembar
    buyPrice: 9100, // Harga beli per lembar
    currentPrice: 10250, // Harga saat ini per lembar
    createdAt: new Date().toISOString()
  },
  {
    id: 'saham-bbri',
    category: 'saham',
    name: 'BBRI',
    detailName: 'Bank Rakyat Indonesia Tbk',
    lot: 25, // 25 lot = 2.500 lembar
    buyPrice: 4800,
    currentPrice: 4620,
    createdAt: new Date().toISOString()
  },
  {
    id: 'saham-tlkm',
    category: 'saham',
    name: 'TLKM',
    detailName: 'Telkom Indonesia Tbk',
    lot: 15, // 15 lot = 1.500 lembar
    buyPrice: 3100,
    currentPrice: 3450,
    createdAt: new Date().toISOString()
  },

  // --- Kategori Reksadana (Multiple: 3 Reksadana) ---
  {
    id: 'reksadana-sucor',
    category: 'reksadana',
    name: 'Sucorinvest Stable Fund',
    detailName: 'Reksadana Pendapatan Tetap',
    buyPrice: 10000000, // Modal awal
    currentPrice: 10680000, // Nilai saat ini
    createdAt: new Date().toISOString()
  },
  {
    id: 'reksadana-batavia',
    category: 'reksadana',
    name: 'Batavia Dana Kas Maxima',
    detailName: 'Reksadana Pasar Uang',
    buyPrice: 5000000,
    currentPrice: 5195000,
    createdAt: new Date().toISOString()
  },
  {
    id: 'reksadana-mandiri',
    category: 'reksadana',
    name: 'Mandiri Investa Ekuitas',
    detailName: 'Reksadana Saham',
    buyPrice: 7500000,
    currentPrice: 7120000,
    createdAt: new Date().toISOString()
  },

  // --- Kategori Crypto (Multiple: 3 Koin) ---
  {
    id: 'crypto-btc',
    category: 'crypto',
    name: 'BTC (Bitcoin)',
    detailName: 'Digital Gold / Store of Value',
    amount: 0.025, // 0.025 BTC
    buyPrice: 950000000, // Harga beli per koin (Rp)
    currentPrice: 1350000000, // Harga sekarang per koin (Rp)
    createdAt: new Date().toISOString()
  },
  {
    id: 'crypto-eth',
    category: 'crypto',
    name: 'ETH (Ethereum)',
    detailName: 'Smart Contract Platform',
    amount: 0.45,
    buyPrice: 42000000,
    currentPrice: 51200000,
    createdAt: new Date().toISOString()
  },
  {
    id: 'crypto-sol',
    category: 'crypto',
    name: 'SOL (Solana)',
    detailName: 'High Throughput L1',
    amount: 6.0,
    buyPrice: 2100000,
    currentPrice: 2850000,
    createdAt: new Date().toISOString()
  },

  // --- Kategori Emas (Multiple: 3 Aset Emas) ---
  {
    id: 'emas-antam-10g',
    category: 'emas',
    name: 'Emas Antam Logam Mulia',
    detailName: 'Emas Batangan Fisik CertiCard',
    amount: 10, // 10 gram
    buyPrice: 1250000, // Harga beli per gram
    currentPrice: 1480000, // Harga saat ini per gram
    createdAt: new Date().toISOString()
  },
  {
    id: 'emas-ubs-5g',
    category: 'emas',
    name: 'Emas Batangan UBS',
    detailName: 'Fisik 5 Gram',
    amount: 5, // 5 gram
    buyPrice: 1240000,
    currentPrice: 1465000,
    createdAt: new Date().toISOString()
  },
  {
    id: 'emas-digital-tabungan',
    category: 'emas',
    name: 'Tabungan Emas Digital',
    detailName: 'Saldo Pegadaian / E-Wallet',
    amount: 2.5, // 2.5 gram
    buyPrice: 1280000,
    currentPrice: 1480000,
    createdAt: new Date().toISOString()
  }
];

// State
let investments = loadInvestments();
let currentFilter = 'all';

// Load investments from LocalStorage
function loadInvestments() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    } catch (e) {
      console.error('Error parsing local storage data:', e);
    }
  }
  return defaultData;
}

// Save investments to LocalStorage
function saveInvestments() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(investments));
  renderApp();
}

// Utility: Format Rupiah
function formatIDR(value) {
  const num = Number(value) || 0;
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(num);
}

// Utility: Format Number
function formatNumber(value, maxDecimals = 4) {
  const num = Number(value) || 0;
  return new Intl.NumberFormat('id-ID', {
    maximumFractionDigits: maxDecimals
  }).format(num);
}

// Perhitungan Nilai & Keuntungan per Item
function calculateItemValues(item) {
  let totalInvested = 0;
  let totalCurrent = 0;

  if (item.category === 'saham') {
    // 1 lot = 100 lembar
    const lot = Number(item.lot) || 0;
    const buyPrice = Number(item.buyPrice) || 0;
    const currentPrice = Number(item.currentPrice) || 0;
    totalInvested = lot * 100 * buyPrice;
    totalCurrent = lot * 100 * currentPrice;
  } else if (item.category === 'reksadana') {
    totalInvested = Number(item.buyPrice) || 0;
    totalCurrent = Number(item.currentPrice) || 0;
  } else if (item.category === 'crypto') {
    const amount = Number(item.amount) || 0;
    const buyPrice = Number(item.buyPrice) || 0;
    const currentPrice = Number(item.currentPrice) || 0;
    totalInvested = amount * buyPrice;
    totalCurrent = amount * currentPrice;
  } else if (item.category === 'emas') {
    const gram = Number(item.amount) || 0;
    const buyPrice = Number(item.buyPrice) || 0;
    const currentPrice = Number(item.currentPrice) || 0;
    totalInvested = gram * buyPrice;
    totalCurrent = gram * currentPrice;
  }

  const pnlNominal = totalCurrent - totalInvested;
  const pnlPercent = totalInvested > 0 ? (pnlNominal / totalInvested) * 100 : 0;

  return {
    totalInvested,
    totalCurrent,
    pnlNominal,
    pnlPercent,
    isProfit: pnlNominal >= 0
  };
}

// Render Seluruh Aplikasi
function renderApp() {
  renderSummary();
  renderList();
  if (window.lucide) {
    lucide.createIcons();
  }
}

// Render Summary Total Portofolio
function renderSummary() {
  let grandTotalInvested = 0;
  let grandTotalCurrent = 0;

  const categoryTotals = {
    saham: { current: 0, invested: 0, count: 0 },
    reksadana: { current: 0, invested: 0, count: 0 },
    crypto: { current: 0, invested: 0, count: 0 },
    emas: { current: 0, invested: 0, count: 0 }
  };

  investments.forEach(item => {
    const calc = calculateItemValues(item);
    grandTotalInvested += calc.totalInvested;
    grandTotalCurrent += calc.totalCurrent;

    if (categoryTotals[item.category]) {
      categoryTotals[item.category].invested += calc.totalInvested;
      categoryTotals[item.category].current += calc.totalCurrent;
      categoryTotals[item.category].count += 1;
    }
  });

  const grandPnlNominal = grandTotalCurrent - grandTotalInvested;
  const grandPnlPercent = grandTotalInvested > 0 ? (grandPnlNominal / grandTotalInvested) * 100 : 0;
  const isGrandProfit = grandPnlNominal >= 0;

  // Update DOM Elements
  document.getElementById('summary-asset-count').innerText = `${investments.length} Total Aset`;
  document.getElementById('total-current-value').innerText = formatIDR(grandTotalCurrent);
  document.getElementById('total-invested').innerText = formatIDR(grandTotalInvested);

  const pnlBadge = document.getElementById('summary-pnl-badge');
  const pnlNominal = document.getElementById('total-pnl-nominal');

  const pnlSign = isGrandProfit ? '+' : '';
  const percentText = `${pnlSign}${grandPnlPercent.toFixed(2)}%`;
  const nominalText = `${pnlSign}${formatIDR(grandPnlNominal)}`;

  pnlBadge.innerText = percentText;
  pnlNominal.innerHTML = `
    ${nominalText}
    <i data-lucide="${isGrandProfit ? 'trending-up' : 'trending-down'}" class="w-4 h-4 ${isGrandProfit ? 'text-emerald-400' : 'text-rose-400'}"></i>
  `;

  if (isGrandProfit) {
    pnlBadge.className = 'text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30';
    pnlNominal.className = 'text-sm font-bold text-emerald-400 flex items-center gap-1';
  } else {
    pnlBadge.className = 'text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/30';
    pnlNominal.className = 'text-sm font-bold text-rose-400 flex items-center gap-1';
  }

  // Update Allocation Bar
  const allocBar = document.getElementById('allocation-bar');
  if (allocBar) {
    const bars = allocBar.children;
    const cats = ['saham', 'reksadana', 'crypto', 'emas'];
    cats.forEach((cat, idx) => {
      const pct = grandTotalCurrent > 0 ? (categoryTotals[cat].current / grandTotalCurrent) * 100 : 0;
      bars[idx].style.width = `${pct}%`;
      bars[idx].title = `${cat.toUpperCase()}: ${pct.toFixed(1)}% (${categoryTotals[cat].count} Aset)`;
    });
  }

  // Update Category Stat Card
  const catLabel = document.getElementById('cat-label');
  const catSubtotal = document.getElementById('cat-subtotal');
  const catPnl = document.getElementById('cat-pnl');

  if (currentFilter === 'all') {
    catLabel.innerText = `Total Portofolio (${investments.length} Aset)`;
    catSubtotal.innerText = formatIDR(grandTotalCurrent);
    catPnl.innerHTML = `<span class="${isGrandProfit ? 'text-emerald-400' : 'text-rose-400'}">${nominalText} (${percentText})</span>`;
  } else {
    const cData = categoryTotals[currentFilter] || { current: 0, invested: 0, count: 0 };
    const cPnlNominal = cData.current - cData.invested;
    const cPnlPercent = cData.invested > 0 ? (cPnlNominal / cData.invested) * 100 : 0;
    const isCProfit = cPnlNominal >= 0;
    const cSign = isCProfit ? '+' : '';

    catLabel.innerText = `Subtotal ${getCategoryTitle(currentFilter)} (${cData.count} Aset)`;
    catSubtotal.innerText = formatIDR(cData.current);
    catPnl.innerHTML = `<span class="${isCProfit ? 'text-emerald-400' : 'text-rose-400'}">${cSign}${formatIDR(cPnlNominal)} (${cSign}${cPnlPercent.toFixed(2)}%)</span>`;
  }
}

function getCategoryTitle(cat) {
  switch (cat) {
    case 'saham': return 'Saham';
    case 'reksadana': return 'Reksadana';
    case 'crypto': return 'Crypto';
    case 'emas': return 'Emas';
    default: return 'Semua';
  }
}

function getCategoryIcon(cat) {
  switch (cat) {
    case 'saham': return 'candlestick-chart';
    case 'reksadana': return 'pie-chart';
    case 'crypto': return 'coins';
    case 'emas': return 'gem';
    default: return 'wallet';
  }
}

function getCategoryColorClass(cat) {
  switch (cat) {
    case 'saham': return 'text-blue-400 border-blue-500/30 bg-blue-500/10';
    case 'reksadana': return 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';
    case 'crypto': return 'text-purple-400 border-purple-500/30 bg-purple-500/10';
    case 'emas': return 'text-amber-400 border-amber-500/30 bg-amber-500/10';
    default: return 'text-slate-300 border-slate-700 bg-slate-800';
  }
}

function getCategoryBadge(cat) {
  switch (cat) {
    case 'saham':
      return `<span class="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20">Saham</span>`;
    case 'reksadana':
      return `<span class="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Reksadana</span>`;
    case 'crypto':
      return `<span class="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-400 border border-purple-500/20">Crypto</span>`;
    case 'emas':
      return `<span class="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20">Emas</span>`;
    default:
      return '';
  }
}

// Render Item Card Tunggal
function renderItemCard(item) {
  const calc = calculateItemValues(item);
  const pnlSign = calc.isProfit ? '+' : '';
  const pnlColorClass = calc.isProfit ? 'text-emerald-400' : 'text-rose-400';
  const pnlBgClass = calc.isProfit ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-rose-500/10 border-rose-500/20';

  let metaHTML = '';
  if (item.category === 'saham') {
    metaHTML = `
      <div class="grid grid-cols-2 gap-2 text-xs py-2 my-2 border-y border-slate-800/80 text-slate-300">
        <div>
          <span class="text-[11px] text-slate-500 block">Jumlah Lot</span>
          <span class="font-semibold text-white">${formatNumber(item.lot)} Lot <span class="text-[10px] text-slate-400">(${formatNumber(item.lot * 100)} Lembar)</span></span>
        </div>
        <div>
          <span class="text-[11px] text-slate-500 block">Harga Beli / Lembar</span>
          <span class="font-semibold">${formatIDR(item.buyPrice)}</span>
        </div>
        <div>
          <span class="text-[11px] text-slate-500 block">Harga Saat Ini</span>
          <span class="font-semibold text-emerald-400">${formatIDR(item.currentPrice)}</span>
        </div>
        <div>
          <span class="text-[11px] text-slate-500 block">Total Modal Awal</span>
          <span class="font-semibold">${formatIDR(calc.totalInvested)}</span>
        </div>
      </div>
    `;
  } else if (item.category === 'reksadana') {
    metaHTML = `
      <div class="grid grid-cols-2 gap-2 text-xs py-2 my-2 border-y border-slate-800/80 text-slate-300">
        <div>
          <span class="text-[11px] text-slate-500 block">Harga Perolehan Awal</span>
          <span class="font-semibold">${formatIDR(item.buyPrice)}</span>
        </div>
        <div>
          <span class="text-[11px] text-slate-500 block">Harga / Nilai Saat Ini</span>
          <span class="font-semibold text-emerald-400">${formatIDR(item.currentPrice)}</span>
        </div>
      </div>
    `;
  } else if (item.category === 'crypto') {
    metaHTML = `
      <div class="grid grid-cols-2 gap-2 text-xs py-2 my-2 border-y border-slate-800/80 text-slate-300">
        <div>
          <span class="text-[11px] text-slate-500 block">Jumlah Koin</span>
          <span class="font-semibold text-white">${item.amount} Koin</span>
        </div>
        <div>
          <span class="text-[11px] text-slate-500 block">Harga Beli / Koin</span>
          <span class="font-semibold">${formatIDR(item.buyPrice)}</span>
        </div>
        <div>
          <span class="text-[11px] text-slate-500 block">Harga Saat Ini / Koin</span>
          <span class="font-semibold text-emerald-400">${formatIDR(item.currentPrice)}</span>
        </div>
        <div>
          <span class="text-[11px] text-slate-500 block">Total Modal Beli</span>
          <span class="font-semibold">${formatIDR(calc.totalInvested)}</span>
        </div>
      </div>
    `;
  } else if (item.category === 'emas') {
    metaHTML = `
      <div class="grid grid-cols-2 gap-2 text-xs py-2 my-2 border-y border-slate-800/80 text-slate-300">
        <div>
          <span class="text-[11px] text-slate-500 block">Berat Emas</span>
          <span class="font-semibold text-amber-400">${formatNumber(item.amount)} Gram</span>
        </div>
        <div>
          <span class="text-[11px] text-slate-500 block">Harga Beli / Gram</span>
          <span class="font-semibold">${formatIDR(item.buyPrice)}</span>
        </div>
        <div>
          <span class="text-[11px] text-slate-500 block">Harga Terkini / Gram</span>
          <span class="font-semibold text-emerald-400">${formatIDR(item.currentPrice)}</span>
        </div>
        <div>
          <span class="text-[11px] text-slate-500 block">Total Modal Beli</span>
          <span class="font-semibold">${formatIDR(calc.totalInvested)}</span>
        </div>
      </div>
    `;
  }

  return `
    <div class="bg-slate-900/90 hover:bg-slate-900 rounded-2xl p-4 border border-slate-800/90 shadow-md transition-all active:scale-[0.99] relative">
      <div class="flex items-start justify-between">
        <div class="flex-1 mr-2">
          <div class="flex items-center gap-2 mb-1">
            ${getCategoryBadge(item.category)}
            <h3 class="font-bold text-white text-base leading-tight">${item.name}</h3>
          </div>
          ${item.detailName ? `<p class="text-[11px] text-slate-400 truncate">${item.detailName}</p>` : ''}
        </div>

        <div class="flex items-center gap-1">
          <button onclick="duplicateItem('${item.id}')" title="Duplikat Aset" class="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition">
            <i data-lucide="copy" class="w-3.5 h-3.5"></i>
          </button>
          <button onclick="editItem('${item.id}')" title="Edit Aset" class="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition">
            <i data-lucide="edit-3" class="w-3.5 h-3.5"></i>
          </button>
          <button onclick="deleteItem('${item.id}')" title="Hapus Aset" class="p-1.5 rounded-lg bg-slate-800 text-rose-400 hover:bg-rose-500/20 transition">
            <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
          </button>
        </div>
      </div>

      ${metaHTML}

      <div class="flex items-end justify-between pt-1">
        <div>
          <span class="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">Nilai Saat Ini</span>
          <span class="text-base font-extrabold text-white">${formatIDR(calc.totalCurrent)}</span>
        </div>

        <div class="text-right">
          <span class="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">Untung / Rugi</span>
          <div class="flex items-center justify-end gap-1 font-bold text-sm ${pnlColorClass}">
            <span>${pnlSign}${formatIDR(calc.pnlNominal)}</span>
            <span class="text-xs px-1.5 py-0.2 rounded border ${pnlBgClass}">
              ${pnlSign}${calc.pnlPercent.toFixed(2)}%
            </span>
          </div>
        </div>
      </div>
    </div>
  `;
}

// Render List Portofolio (Mendukung pengelompokan rapi per jenis aset)
function renderList() {
  const listContainer = document.getElementById('investment-list');
  const emptyState = document.getElementById('empty-state');

  if (investments.length === 0) {
    listContainer.innerHTML = '';
    emptyState.classList.remove('hidden');
    return;
  }
  emptyState.classList.add('hidden');

  const categories = ['saham', 'reksadana', 'crypto', 'emas'];

  if (currentFilter === 'all') {
    // Mode Semua: Tampilkan dikelompokkan per kategori lengkap dengan tombol "+ Tambah" per kategori
    let html = '';

    categories.forEach(cat => {
      const itemsInCat = investments.filter(i => i.category === cat);
      let catInvested = 0;
      let catCurrent = 0;
      itemsInCat.forEach(it => {
        const c = calculateItemValues(it);
        catInvested += c.totalInvested;
        catCurrent += c.totalCurrent;
      });
      const catPnl = catCurrent - catInvested;
      const isProf = catPnl >= 0;
      const sign = isProf ? '+' : '';

      html += `
        <div class="mb-5">
          <!-- Category Section Header -->
          <div class="flex items-center justify-between py-2 px-1 mb-2">
            <div class="flex items-center gap-2">
              <span class="p-1 rounded-lg ${getCategoryColorClass(cat)} border">
                <i data-lucide="${getCategoryIcon(cat)}" class="w-4 h-4"></i>
              </span>
              <div>
                <h4 class="text-sm font-bold text-white flex items-center gap-1.5">
                  ${getCategoryTitle(cat)}
                  <span class="text-[11px] font-semibold text-slate-400 bg-slate-800/80 px-2 py-0.2 rounded-full border border-slate-700/60">${itemsInCat.length} Aset</span>
                </h4>
                <p class="text-[11px] text-slate-400">
                  Subtotal: <span class="font-semibold text-slate-200">${formatIDR(catCurrent)}</span> · 
                  <span class="${isProf ? 'text-emerald-400' : 'text-rose-400'} font-semibold">${sign}${formatIDR(catPnl)}</span>
                </p>
              </div>
            </div>
            
            <button onclick="openModal(null, '${cat}')" class="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 flex items-center gap-1 transition active:scale-95 shadow-sm">
              <i data-lucide="plus" class="w-3.5 h-3.5 text-emerald-400"></i> Tambah
            </button>
          </div>

          <!-- Cards in this category -->
          <div class="space-y-3">
            ${itemsInCat.length > 0 
              ? itemsInCat.map(item => renderItemCard(item)).join('') 
              : `<div class="p-4 rounded-xl border border-dashed border-slate-800 text-center text-xs text-slate-500">Belum ada aset ${getCategoryTitle(cat)}. Klik '+ Tambah' untuk mencatat.</div>`
            }
          </div>
        </div>
      `;
    });

    listContainer.innerHTML = html;
  } else {
    // Mode Tab Spesifik (Saham, Reksadana, Crypto, atau Emas)
    const itemsInCat = investments.filter(item => item.category === currentFilter);

    let headerHTML = `
      <div class="flex items-center justify-between py-2 px-1 mb-3">
        <div>
          <h3 class="text-sm font-bold text-white flex items-center gap-1.5">
            Daftar ${getCategoryTitle(currentFilter)}
            <span class="text-[11px] font-semibold text-slate-400 bg-slate-800 px-2 py-0.2 rounded-full border border-slate-700">${itemsInCat.length} Aset</span>
          </h3>
          <p class="text-[11px] text-slate-400">Anda dapat menambahkan aset ${getCategoryTitle(currentFilter)} sebanyak yang Anda miliki.</p>
        </div>
        <button onclick="openModal(null, '${currentFilter}')" class="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white shadow-md shadow-emerald-600/20 flex items-center gap-1.5 transition active:scale-95">
          <i data-lucide="plus" class="w-4 h-4"></i> Tambah ${getCategoryTitle(currentFilter)}
        </button>
      </div>
    `;

    if (itemsInCat.length === 0) {
      listContainer.innerHTML = headerHTML + `
        <div class="py-10 text-center">
          <p class="text-xs text-slate-400 mb-3">Belum ada portofolio ${getCategoryTitle(currentFilter)} yang dicatat.</p>
          <button onclick="openModal(null, '${currentFilter}')" class="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-600/30 inline-flex items-center gap-1.5">
            <i data-lucide="plus" class="w-4 h-4"></i> Tambah ${getCategoryTitle(currentFilter)} Pertama
          </button>
        </div>
      `;
    } else {
      listContainer.innerHTML = headerHTML + `<div class="space-y-3">${itemsInCat.map(item => renderItemCard(item)).join('')}</div>`;
    }
  }
}

// Handler Ganti Kategori Form Input
function onCategoryChanged() {
  const selectedCat = document.querySelector('input[name="category"]:checked')?.value || 'saham';
  const container = document.getElementById('input-fields-container');
  const lblName = document.getElementById('lbl-name');
  const inputName = document.getElementById('item-name');
  const modalBadge = document.getElementById('modal-icon-badge');

  if (selectedCat === 'saham') {
    lblName.innerText = 'Kode Saham (Ticker)';
    inputName.placeholder = 'Contoh: BBCA, BBRI, ASII, TLKM, BBNI, UNVR';
    modalBadge.className = 'w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20';

    container.innerHTML = `
      <div>
        <label class="block text-xs font-semibold text-slate-300 mb-1">Nama Perusahaan (Opsional)</label>
        <input type="text" id="item-detail" placeholder="Contoh: Bank Central Asia Tbk" class="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50">
      </div>
      <div class="grid grid-cols-2 gap-2.5">
        <div>
          <label class="block text-xs font-semibold text-slate-300 mb-1">Jumlah Lot</label>
          <div class="relative">
            <input type="number" id="item-lot" required min="1" step="1" placeholder="10" class="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl pl-3.5 pr-10 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50" oninput="updateModalPreview()">
            <span class="absolute right-3 top-2.5 text-xs text-slate-400">Lot</span>
          </div>
          <span class="text-[10px] text-slate-500 mt-0.5 block">1 Lot = 100 lembar</span>
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-300 mb-1">Harga Beli / Lembar</label>
          <div class="relative">
            <span class="absolute left-3 top-2.5 text-xs text-slate-400">Rp</span>
            <input type="number" id="item-buy-price" required min="1" step="1" placeholder="9100" class="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl pl-9 pr-3.5 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50" oninput="updateModalPreview()">
          </div>
        </div>
      </div>
      <div>
        <label class="block text-xs font-semibold text-slate-300 mb-1">Harga Terkini / Lembar</label>
        <div class="relative">
          <span class="absolute left-3 top-2.5 text-xs text-slate-400">Rp</span>
          <input type="number" id="item-current-price" required min="1" step="1" placeholder="10250" class="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl pl-9 pr-3.5 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50" oninput="updateModalPreview()">
        </div>
      </div>
    `;
  } else if (selectedCat === 'reksadana') {
    lblName.innerText = 'Nama Produk Reksadana';
    inputName.placeholder = 'Contoh: Sucorinvest Stable Fund, Batavia Dana Saham';
    modalBadge.className = 'w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20';

    container.innerHTML = `
      <div>
        <label class="block text-xs font-semibold text-slate-300 mb-1">Jenis Reksadana (Opsional)</label>
        <input type="text" id="item-detail" placeholder="Pasar Uang / Pendapatan Tetap / Campuran / Saham" class="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50">
      </div>
      <div>
        <label class="block text-xs font-semibold text-slate-300 mb-1">Harga Perolehan Awal (Modal Beli)</label>
        <div class="relative">
          <span class="absolute left-3 top-2.5 text-xs text-slate-400">Rp</span>
          <input type="number" id="item-buy-price" required min="1" step="1" placeholder="10000000" class="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl pl-9 pr-3.5 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50" oninput="updateModalPreview()">
        </div>
        <span class="text-[10px] text-slate-500 mt-0.5 block">Total uang/modal yang diinvestasikan pada produk ini</span>
      </div>
      <div>
        <label class="block text-xs font-semibold text-slate-300 mb-1">Harga / Nilai Saat Ini</label>
        <div class="relative">
          <span class="absolute left-3 top-2.5 text-xs text-slate-400">Rp</span>
          <input type="number" id="item-current-price" required min="0" step="1" placeholder="10680000" class="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl pl-9 pr-3.5 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50" oninput="updateModalPreview()">
        </div>
        <span class="text-[10px] text-slate-500 mt-0.5 block">Nilai portofolio reksadana terkini</span>
      </div>
    `;
  } else if (selectedCat === 'crypto') {
    lblName.innerText = 'Nama Koin Crypto';
    inputName.placeholder = 'Contoh: BTC, ETH, SOL, XRP, BNB, DOGE';
    modalBadge.className = 'w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center border border-purple-500/20';

    container.innerHTML = `
      <div>
        <label class="block text-xs font-semibold text-slate-300 mb-1">Jumlah Koin / Token</label>
        <div class="relative">
          <input type="number" id="item-amount" required min="0.00000001" step="any" placeholder="0.025" class="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50" oninput="updateModalPreview()">
        </div>
      </div>
      <div>
        <label class="block text-xs font-semibold text-slate-300 mb-1">Harga Perolehan Beli / Koin (Rp)</label>
        <div class="relative">
          <span class="absolute left-3 top-2.5 text-xs text-slate-400">Rp</span>
          <input type="number" id="item-buy-price" required min="1" step="any" placeholder="950000000" class="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl pl-9 pr-3.5 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50" oninput="updateModalPreview()">
        </div>
      </div>
      <div>
        <label class="block text-xs font-semibold text-slate-300 mb-1">Harga Saat Ini / Koin (Rp)</label>
        <div class="relative">
          <span class="absolute left-3 top-2.5 text-xs text-slate-400">Rp</span>
          <input type="number" id="item-current-price" required min="0" step="any" placeholder="1350000000" class="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl pl-9 pr-3.5 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50" oninput="updateModalPreview()">
        </div>
      </div>
    `;
  } else if (selectedCat === 'emas') {
    lblName.innerText = 'Nama / Jenis Emas';
    inputName.placeholder = 'Contoh: Emas Batangan Antam, UBS, Tabungan Emas Pegadaian';
    modalBadge.className = 'w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20';

    container.innerHTML = `
      <div>
        <label class="block text-xs font-semibold text-slate-300 mb-1">Berat Emas (Gram)</label>
        <div class="relative">
          <input type="number" id="item-amount" required min="0.001" step="any" placeholder="10" class="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl pl-3.5 pr-14 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50" oninput="updateModalPreview()">
          <span class="absolute right-3 top-2.5 text-xs text-slate-400">Gram</span>
        </div>
      </div>
      <div>
        <label class="block text-xs font-semibold text-slate-300 mb-1">Harga Beli / Gram</label>
        <div class="relative">
          <span class="absolute left-3 top-2.5 text-xs text-slate-400">Rp</span>
          <input type="number" id="item-buy-price" required min="1" step="any" placeholder="1250000" class="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl pl-9 pr-3.5 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50" oninput="updateModalPreview()">
        </div>
      </div>
      <div>
        <label class="block text-xs font-semibold text-slate-300 mb-1">Harga Terkini / Gram</label>
        <div class="relative">
          <span class="absolute left-3 top-2.5 text-xs text-slate-400">Rp</span>
          <input type="number" id="item-current-price" required min="0" step="any" placeholder="1480000" class="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl pl-9 pr-3.5 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50" oninput="updateModalPreview()">
        </div>
      </div>
    `;
  }

  updateModalPreview();
}

// Live calculation preview inside modal
function updateModalPreview() {
  const selectedCat = document.querySelector('input[name="category"]:checked')?.value || 'saham';
  let totalInvested = 0;
  let totalCurrent = 0;

  if (selectedCat === 'saham') {
    const lot = parseFloat(document.getElementById('item-lot')?.value) || 0;
    const buyPrice = parseFloat(document.getElementById('item-buy-price')?.value) || 0;
    const currentPrice = parseFloat(document.getElementById('item-current-price')?.value) || 0;
    totalInvested = lot * 100 * buyPrice;
    totalCurrent = lot * 100 * currentPrice;
  } else if (selectedCat === 'reksadana') {
    totalInvested = parseFloat(document.getElementById('item-buy-price')?.value) || 0;
    totalCurrent = parseFloat(document.getElementById('item-current-price')?.value) || 0;
  } else if (selectedCat === 'crypto' || selectedCat === 'emas') {
    const amount = parseFloat(document.getElementById('item-amount')?.value) || 0;
    const buyPrice = parseFloat(document.getElementById('item-buy-price')?.value) || 0;
    const currentPrice = parseFloat(document.getElementById('item-current-price')?.value) || 0;
    totalInvested = amount * buyPrice;
    totalCurrent = amount * currentPrice;
  }

  const pnlNominal = totalCurrent - totalInvested;
  const pnlPercent = totalInvested > 0 ? (pnlNominal / totalInvested) * 100 : 0;
  const isProfit = pnlNominal >= 0;
  const pnlSign = isProfit ? '+' : '';

  document.getElementById('preview-total-invested').innerText = formatIDR(totalInvested);
  document.getElementById('preview-total-current').innerText = formatIDR(totalCurrent);

  const pnlEl = document.getElementById('preview-pnl');
  pnlEl.innerText = `${pnlSign}${formatIDR(pnlNominal)} (${pnlSign}${pnlPercent.toFixed(2)}%)`;
  pnlEl.className = `font-extrabold ${isProfit ? 'text-emerald-400' : 'text-rose-400'}`;
}

// Open modal for add or edit (supports preset category)
function openModal(editItemData = null, presetCategory = null) {
  const modal = document.getElementById('modal-backdrop');
  const container = document.getElementById('modal-container');
  const form = document.getElementById('investment-form');
  const modalTitle = document.getElementById('modal-title');
  const editIdInput = document.getElementById('edit-id');
  const btnSaveMore = document.getElementById('btn-save-and-more');

  form.reset();

  if (editItemData) {
    modalTitle.innerText = 'Edit Data Investasi';
    editIdInput.value = editItemData.id;
    if (btnSaveMore) btnSaveMore.classList.add('hidden'); // Sembunyikan saat mode edit

    const radio = document.querySelector(`input[name="category"][value="${editItemData.category}"]`);
    if (radio) radio.checked = true;
    onCategoryChanged();

    document.getElementById('item-name').value = editItemData.name;
    if (document.getElementById('item-detail')) {
      document.getElementById('item-detail').value = editItemData.detailName || '';
    }

    if (editItemData.category === 'saham') {
      document.getElementById('item-lot').value = editItemData.lot;
      document.getElementById('item-buy-price').value = editItemData.buyPrice;
      document.getElementById('item-current-price').value = editItemData.currentPrice;
    } else if (editItemData.category === 'reksadana') {
      document.getElementById('item-buy-price').value = editItemData.buyPrice;
      document.getElementById('item-current-price').value = editItemData.currentPrice;
    } else if (editItemData.category === 'crypto' || editItemData.category === 'emas') {
      document.getElementById('item-amount').value = editItemData.amount;
      document.getElementById('item-buy-price').value = editItemData.buyPrice;
      document.getElementById('item-current-price').value = editItemData.currentPrice;
    }
    updateModalPreview();
  } else {
    modalTitle.innerText = 'Catat Investasi Baru';
    editIdInput.value = '';
    if (btnSaveMore) btnSaveMore.classList.remove('hidden');

    const catToSelect = presetCategory || (currentFilter !== 'all' ? currentFilter : 'saham');
    const radio = document.querySelector(`input[name="category"][value="${catToSelect}"]`);
    if (radio) radio.checked = true;
    onCategoryChanged();
  }

  modal.classList.remove('hidden');
  setTimeout(() => {
    container.classList.remove('translate-y-full');
  }, 10);

  if (window.lucide) lucide.createIcons();
}

function closeModal() {
  const modal = document.getElementById('modal-backdrop');
  const container = document.getElementById('modal-container');
  container.classList.add('translate-y-full');
  setTimeout(() => {
    modal.classList.add('hidden');
  }, 250);
}

// Simpan data & reset form untuk langsung tambah item berikutnya
function submitFormAndAddMore(e) {
  e.preventDefault();
  const form = document.getElementById('investment-form');
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }
  processSave(true);
}

// Handler Submit Form Biasa
function handleFormSubmit(e) {
  e.preventDefault();
  processSave(false);
}

// Core Save Logic
function processSave(keepOpenAndAddMore = false) {
  const editId = document.getElementById('edit-id').value;
  const category = document.querySelector('input[name="category"]:checked').value;
  const name = document.getElementById('item-name').value.trim();
  const detailName = document.getElementById('item-detail')?.value.trim() || '';

  let newItem = {
    id: editId || `${category}-${Date.now()}`,
    category,
    name,
    detailName,
    createdAt: editId ? (investments.find(i => i.id === editId)?.createdAt || new Date().toISOString()) : new Date().toISOString()
  };

  if (category === 'saham') {
    newItem.lot = parseFloat(document.getElementById('item-lot').value) || 0;
    newItem.buyPrice = parseFloat(document.getElementById('item-buy-price').value) || 0;
    newItem.currentPrice = parseFloat(document.getElementById('item-current-price').value) || 0;
  } else if (category === 'reksadana') {
    newItem.buyPrice = parseFloat(document.getElementById('item-buy-price').value) || 0;
    newItem.currentPrice = parseFloat(document.getElementById('item-current-price').value) || 0;
  } else if (category === 'crypto' || category === 'emas') {
    newItem.amount = parseFloat(document.getElementById('item-amount').value) || 0;
    newItem.buyPrice = parseFloat(document.getElementById('item-buy-price').value) || 0;
    newItem.currentPrice = parseFloat(document.getElementById('item-current-price').value) || 0;
  }

  if (editId) {
    const idx = investments.findIndex(i => i.id === editId);
    if (idx !== -1) {
      investments[idx] = newItem;
      showToast(`${newItem.name} berhasil diperbarui`);
    }
  } else {
    investments.unshift(newItem);
    showToast(`${newItem.name} berhasil dicatat`);
  }

  saveInvestments();

  if (keepOpenAndAddMore) {
    // Reset field nama dan angka agar user langsung bisa input aset berikutnya
    document.getElementById('item-name').value = '';
    if (document.getElementById('item-detail')) document.getElementById('item-detail').value = '';
    if (document.getElementById('item-lot')) document.getElementById('item-lot').value = '';
    if (document.getElementById('item-amount')) document.getElementById('item-amount').value = '';
    if (document.getElementById('item-buy-price')) document.getElementById('item-buy-price').value = '';
    if (document.getElementById('item-current-price')) document.getElementById('item-current-price').value = '';
    document.getElementById('edit-id').value = '';
    updateModalPreview();
    document.getElementById('item-name').focus();
  } else {
    closeModal();
  }
}

// Duplikat Item (Memudahkan tambah aset serupa)
function duplicateItem(id) {
  const item = investments.find(i => i.id === id);
  if (!item) return;

  const duplicated = {
    ...item,
    id: `${item.category}-${Date.now()}`,
    name: `${item.name} (Baru)`,
    createdAt: new Date().toISOString()
  };

  investments.unshift(duplicated);
  saveInvestments();
  showToast(`Aset ${item.name} berhasil diduplikasi. Silakan edit detailnya.`);
}

// Edit item
function editItem(id) {
  const item = investments.find(i => i.id === id);
  if (item) {
    openModal(item);
  }
}

// Delete item
function deleteItem(id) {
  const item = investments.find(i => i.id === id);
  if (!item) return;

  if (confirm(`Yakin ingin menghapus catatan "${item.name}"?`)) {
    investments = investments.filter(i => i.id !== id);
    saveInvestments();
    showToast('Aset telah dihapus');
  }
}

// Reset ke contoh portofolio lengkap multi-aset
document.getElementById('btn-reset-demo')?.addEventListener('click', () => {
  if (confirm('Muat ulang contoh portofolio lengkap (berisi banyak pilihan Saham, Reksadana, Crypto, dan Emas)?')) {
    investments = JSON.parse(JSON.stringify(defaultData));
    saveInvestments();
    showToast('Contoh portofolio multi-aset berhasil dimuat');
  }
});

// Toast Notification
function showToast(message) {
  const toast = document.getElementById('toast');
  const toastMsg = document.getElementById('toast-msg');
  toastMsg.innerText = message;
  toast.classList.remove('opacity-0', '-translate-y-20');
  toast.classList.add('opacity-100', 'translate-y-0');

  setTimeout(() => {
    toast.classList.remove('opacity-100', 'translate-y-0');
    toast.classList.add('opacity-0', '-translate-y-20');
  }, 2500);
}

// Tab Switching
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach(b => {
      b.classList.remove('active', 'bg-emerald-500', 'text-white', 'shadow-md', 'shadow-emerald-500/20');
      b.classList.add('bg-slate-900/90', 'text-slate-400');
    });

    btn.classList.add('active', 'bg-emerald-500', 'text-white', 'shadow-md', 'shadow-emerald-500/20');
    btn.classList.remove('bg-slate-900/90', 'text-slate-400');

    currentFilter = btn.getAttribute('data-cat');
    renderApp();
  });
});

// Backup Data (Export JSON)
document.getElementById('btn-export').addEventListener('click', () => {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(investments, null, 2));
  const downloadAnchor = document.createElement('a');
  const dateStr = new Date().toISOString().slice(0, 10);
  downloadAnchor.setAttribute("href", dataStr);
  downloadAnchor.setAttribute("download", `portofolio-investasi-${dateStr}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
  showToast('Data portofolio berhasil diekspor');
});

// Restore Data (Import JSON)
document.getElementById('btn-import-trigger').addEventListener('click', () => {
  document.getElementById('file-import').click();
});

document.getElementById('file-import').addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (event) => {
    try {
      const imported = JSON.parse(event.target.result);
      if (Array.isArray(imported)) {
        investments = imported;
        saveInvestments();
        showToast('Data portofolio berhasil dipulihkan');
      } else {
        alert('Format file JSON tidak sesuai.');
      }
    } catch (err) {
      alert('Gagal membaca file: ' + err.message);
    }
  };
  reader.readAsText(file);
});

// Close modal when clicking backdrop
document.getElementById('modal-backdrop').addEventListener('click', (e) => {
  if (e.target.id === 'modal-backdrop') {
    closeModal();
  }
});

// Initialize on Load
document.addEventListener('DOMContentLoaded', () => {
  onCategoryChanged();
  renderApp();
});
