// ============================================
//   SAVE2PLAY — purchased.js
// ============================================

document.addEventListener('DOMContentLoaded', () => {
  renderPurchased();
  updatePurchasedSummary();
});

// ============================================
//   LOAD DATA
// ============================================
function getPurchased() {
  return JSON.parse(localStorage.getItem('save2play-purchased') || '[]');
}

function savePurchased(data) {
  localStorage.setItem('save2play-purchased', JSON.stringify(data));
}

// ============================================
//   RENDER
// ============================================
function renderPurchased(data = null) {
  const grid  = document.getElementById('purchased-grid');
  const empty = document.getElementById('purchased-empty');
  const items = data ?? getPurchased();

  if (!grid) return;

  const oldCards = grid.querySelectorAll('.purchased-card');
  oldCards.forEach(c => c.remove());

  if (items.length === 0) {
    if (empty) empty.style.display = 'block';
    return;
  }

  if (empty) empty.style.display = 'none';

  items.forEach(game => {
    const card = document.createElement('div');
    card.classList.add('purchased-card');
    card.setAttribute('data-id', game.id);
    card.innerHTML = `
      <div class="purchased-badge">✅ Goal Reached</div>
      <p class="purchased-title" title="${game.title}">${game.title}</p>
      <div class="purchased-meta">
        <div>
          <p class="stat-label">Final Price</p>
          <p class="purchased-price">${formatMoney(game.price)}</p>
        </div>
        <div class="purchased-date">
          <p class="stat-label">Purchased</p>
          <span>${game.purchasedAt ?? game.createdAt}</span>
        </div>
      </div>
      <div class="purchased-progress"></div>
      <button class="btn-remove-purchased" onclick="removePurchased(${game.id})">
        🗑️ Remove
      </button>
    `;
    grid.appendChild(card);
  });
}

// ============================================
//   FORMAT MONEY (local helper)
// ============================================
function formatMoney(amount) {
  return '₱' + amount.toLocaleString('en-PH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

// ============================================
//   SUMMARY STRIP
// ============================================
function updatePurchasedSummary() {
  const purchased     = getPurchased();
  const totalEl       = document.getElementById('total-purchased');
  const spentEl       = document.getElementById('total-spent');
  const latestEl      = document.getElementById('latest-purchase');

  if (!totalEl) return;

  const totalSpent = purchased.reduce((acc, g) => acc + g.price, 0);
  const latest     = purchased.length > 0 ? purchased[0].title : '—';

  totalEl.textContent  = purchased.length;
  spentEl.textContent  = formatMoney(totalSpent);
  latestEl.textContent = latest.length > 14 ? latest.slice(0, 14) + '…' : latest;
}

// ============================================
//   FILTER & SORT
// ============================================
function filterPurchased() {
  const query = document.getElementById('search-input').value.toLowerCase();
  const sort  = document.getElementById('sort-select').value;
  let   items = getPurchased();

  if (query) {
    items = items.filter(g => g.title.toLowerCase().includes(query));
  }

  switch (sort) {
    case 'oldest':  
      items.sort((a, b) => a.id - b.id);          
      break;
    case 'highest': 
      items.sort((a, b) => b.price - a.price);    
      break;
    case 'lowest':  
      items.sort((a, b) => a.price - b.price);    
      break;
    default:        
      items.sort((a, b) => b.id - a.id);          
      break;
  }
  renderPurchased(items);
}

// ============================================
//   REMOVE ONE
// ============================================
function removePurchased(id) {
  const purchased = getPurchased();
  const game      = purchased.find(g => g.id === id);
  if (!game) return;

  const confirmed = confirm(`Remove "${game.title}" from your trophy shelf?`);
  if (!confirmed) return;

  const updated = purchased.filter(g => g.id !== id);
  savePurchased(updated);
  renderPurchased();
  updatePurchasedSummary();
}

// ============================================
//   CLEAR ALL
// ============================================
function clearPurchased() {
  if (getPurchased().length === 0) {
    alert('Your trophy shelf is already empty!');
    return;
  }

  const confirmed = confirm('Clear your entire trophy shelf? This cannot be undone.');
  if (!confirmed) return;

  localStorage.removeItem('save2play-purchased');
  renderPurchased();
  updatePurchasedSummary();
}

// ============================================
//   ACTIVE NAV HIGHLIGHT
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  const links = document.querySelectorAll('.nav-links a');
  links.forEach(link => {
    if (link.href === window.location.href) {
      link.classList.add('active');
    }
  });
});