// ============================================
//   SAVE2PLAY — history.js
// ============================================

document.addEventListener('DOMContentLoaded', () => {
  renderHistory();
  updateSummary();
});

// ============================================
//   LOAD & RENDER
// ============================================
function getHistory() {
  return JSON.parse(localStorage.getItem('save2play-history') || '[]');
}

function renderHistory(data = null) {
  const list  = document.getElementById('history-list');
  const empty = document.getElementById('history-empty');
  const items = data ?? getHistory();

  if (!list) return;

  // Clear old rows safely (preserves the baseline empty state block)
  const oldRows = list.querySelectorAll('.history-item');
  oldRows.forEach(r => r.remove());

  if (items.length === 0) {
    if (empty) empty.style.display = 'block';
    return;
  }

  if (empty) empty.style.display = 'none';

  items.forEach(entry => {
    const item = document.createElement('div');
    item.classList.add('history-item');
    item.innerHTML = `
      <div class="history-left">
        <div class="history-icon">💰</div>
        <div class="history-info">
          <p class="history-game">${entry.game}</p>
          <p class="history-date">${entry.date}</p>
        </div>
      </div>
      <div class="history-amount green">+₱${entry.amount.toLocaleString('en-PH', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })}</div>
    `;
    list.appendChild(item);
  });
}

// ============================================
//   SUMMARY STRIP
// ============================================
function updateSummary() {
  const history     = getHistory();
  const totalDep    = document.getElementById('total-deposits');
  const totalAmt    = document.getElementById('total-amount');
  const uniqueGames = document.getElementById('unique-games');

  if (!totalDep) return;

  const sum    = history.reduce((acc, e) => acc + e.amount, 0);
  const unique = new Set(history.map(e => e.game)).size;

  totalDep.textContent    = history.length;
  totalAmt.textContent    = '₱' + sum.toLocaleString('en-PH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  uniqueGames.textContent = unique;
}

// ============================================
//   FILTER & SORT
// ============================================
function filterHistory() {
  const query  = document.getElementById('search-input').value.toLowerCase();
  const sort   = document.getElementById('sort-select').value;
  let   items  = getHistory();

  // Filter by search parameters
  if (query) {
    items = items.filter(e => e.game.toLowerCase().includes(query));
  }

  // Sort Metrics Machine
  switch (sort) {
    case 'oldest':  
      items.sort((a, b) => a.id - b.id);            
      break;
    case 'highest': 
      items.sort((a, b) => b.amount - a.amount);    
      break;
    case 'lowest':  
      items.sort((a, b) => a.amount - b.amount);    
      break;
    default:        
      items.sort((a, b) => b.id - a.id);            
      break;
  }
  renderHistory(items);
}

// ============================================
//   CLEAR HISTORY
// ============================================
function clearHistory() {
  if (getHistory().length === 0) {
    alert('History is already empty!');
    return;
  }

  const confirmed = confirm('Clear all transaction history? This cannot be undone.');
  if (!confirmed) return;

  localStorage.removeItem('save2play-history');
  renderHistory();
  updateSummary();
}