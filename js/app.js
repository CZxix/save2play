// ============================================
//   SAVE2PLAY — app.js
// ============================================

// ---- STATE ----
let games = loadGames();

// ---- INIT ----
document.addEventListener('DOMContentLoaded', () => {
  renderGames();
  updateSidebarStats();
});

// ============================================
//   LOCAL STORAGE
// ============================================
function loadGames() {
  const data = localStorage.getItem('save2play-games');
  return data ? JSON.parse(data) : [];
}

function saveGames() {
  localStorage.setItem('save2play-games', JSON.stringify(games));
}

// ============================================
//   MODAL CONTROLS
// ============================================
function openModal() {
  document.getElementById('modal-overlay').classList.add('active');
  document.getElementById('game-title').focus();
}

function closeModal() {
  document.getElementById('modal-overlay').classList.remove('active');
  clearModalInputs();
}

function clearModalInputs() {
  const titleInput = document.getElementById('game-title');
  const priceInput = document.getElementById('game-price');
  const savedInput = document.getElementById('game-saved');
  
  if (titleInput) titleInput.value = '';
  if (priceInput) priceInput.value = '';
  if (savedInput) savedInput.value = '';
}

// Close modal when clicking outside
document.addEventListener('DOMContentLoaded', () => {
  const overlay = document.getElementById('modal-overlay');
  if (overlay) {
    overlay.addEventListener('click', function (e) {
      if (e.target === this) closeModal();
    });
  }
});

// ============================================
//   ADD GAME
// ============================================
function addGame() {
  const title  = document.getElementById('game-title').value.trim();
  const price  = parseFloat(document.getElementById('game-price').value);
  const saved  = parseFloat(document.getElementById('game-saved').value) || 0;

  // Validation Matrix
  if (!title) {
    alert('Please enter a game title.');
    return;
  }
  if (!price || price <= 0) {
    alert('Please enter a valid target price.');
    return;
  }
  if (saved < 0) {
    alert('Saved amount cannot be negative.');
    return;
  }
  if (saved > price) {
    alert('Saved amount cannot exceed the target price.');
    return;
  }

  const newGame = {
    id:        Date.now(),
    title:     title,
    price:     price,
    saved:     saved,
    createdAt: new Date().toLocaleDateString()
  };

  // Automated Routing
  if (saved >= price) {
    let purchased = JSON.parse(localStorage.getItem('save2play-purchased') || '[]');
    purchased.unshift({ ...newGame, purchasedAt: new Date().toLocaleDateString() });
    localStorage.setItem('save2play-purchased', JSON.stringify(purchased));
  } else {
    games.unshift(newGame);
    saveGames();
  }

  closeModal();
  renderGames();
  updateSidebarStats();
}

// ============================================
//   CALCULATIONS
// ============================================
function getRemaining(game) {
  return Math.max(game.price - game.saved, 0);
}

function getProgress(game) {
  return Math.min((game.saved / game.price) * 100, 100).toFixed(1);
}

function formatMoney(amount) {
  return '₱' + amount.toLocaleString('en-PH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

// ============================================
//   RENDER GAMES
// ============================================
function renderGames() {
  const grid       = document.getElementById('game-grid');
  const emptyState = document.getElementById('empty-state');
  const gameCount  = document.getElementById('game-count');

  if (!grid) return; 

  const oldCards = grid.querySelectorAll('.game-card');
  oldCards.forEach(c => c.remove());

  if (games.length === 0) {
    if (emptyState) emptyState.style.display = 'block';
    if (gameCount) gameCount.textContent = '0 games';
    return;
  }

  if (emptyState) emptyState.style.display = 'none';
  if (gameCount) gameCount.textContent = `${games.length} game${games.length > 1 ? 's' : ''}`;

  games.forEach(game => {
    const progress  = getProgress(game);
    const remaining = getRemaining(game);
    const card      = document.createElement('div');
    
    card.classList.add('game-card');
    card.setAttribute('data-id', game.id);
    card.innerHTML = `
      <div class="card-header">
        <h3 class="card-title" title="${game.title}">${game.title}</h3>
        <div class="card-actions">
          <button class="btn-icon" title="Edit"   onclick="openEditModal(${game.id})">✏️</button>
          <button class="btn-icon" title="Delete" onclick="deleteGame(${game.id})">🗑️</button>
        </div>
      </div>
      <div class="card-progress">
        <div class="progress-bar">
          <div class="progress-fill" style="width: ${progress}%"></div>
        </div>
        <span class="progress-percent">${progress}%</span>
      </div>
      <div class="card-stats">
        <div class="card-stat">
          <p class="stat-label">Saved</p>
          <p class="stat-value green">${formatMoney(game.saved)}</p>
        </div>
        <div class="card-stat">
          <p class="stat-label">Remaining</p>
          <p class="stat-value red">${formatMoney(remaining)}</p>
        </div>
        <div class="card-stat">
          <p class="stat-label">Goal</p>
          <p class="stat-value">${formatMoney(game.price)}</p>
        </div>
      </div>
      <button class="btn-deposit" onclick="openDepositModal(${game.id})">
        + Add Savings
      </button>
    `;
    grid.appendChild(card);
  });
}

// ============================================
//   SIDEBAR STATS
// ============================================
function updateSidebarStats() {
  const totalGoals = document.getElementById('total-goals');
  const totalSaved = document.getElementById('total-saved');

  if (!totalGoals) return;

  totalGoals.textContent = games.length;
  const sum = games.reduce((acc, g) => acc + g.saved, 0);
  if (totalSaved) totalSaved.textContent = formatMoney(sum);
}

// ============================================
//   DEPOSIT MODAL & TRANSACTION ENGINE
// ============================================
function openDepositModal(id) {
  const game = games.find(g => g.id === id);
  if (!game) return;

  const overlay = document.getElementById('modal-overlay');
  if (overlay) overlay.classList.add('active');

  const modal = document.querySelector('.modal');
  if (modal) {
    modal.setAttribute('data-mode', 'deposit');
    modal.setAttribute('data-id', id);
  }

  const modalHeader = document.querySelector('.modal-header h3');
  if (modalHeader) modalHeader.textContent = `Add Savings — ${game.title}`;

  const modalBody = document.querySelector('.modal-body');
  if (modalBody) {
    modalBody.innerHTML = `
      <label>Amount to Add (₱)</label>
      <input type="number" id="deposit-amount" placeholder="e.g. 500" min="1" />
      <p class="deposit-info">
        Current: <strong>${formatMoney(game.saved)}</strong> / 
        Goal: <strong>${formatMoney(game.price)}</strong> — 
        Remaining: <strong>${formatMoney(getRemaining(game))}</strong>
      </p>
    `;
  }

  const submitBtn = document.querySelector('.btn-primary-sm');
  if (submitBtn) submitBtn.setAttribute('onclick', `confirmDeposit(${id})`);
}

function confirmDeposit(id) {
  const amount = parseFloat(document.getElementById('deposit-amount').value);
  if (!amount || amount <= 0) {
    alert('Please enter a valid amount.');
    return;
  }

  const index = games.findIndex(g => g.id === id);
  if (index === -1) return;

  games[index].saved = Math.min(games[index].saved + amount, games[index].price);

  logTransaction(games[index].title, amount);

  if (games[index].saved >= games[index].price) {
    moveToPurchased(games[index]);
    games.splice(index, 1);
  }

  saveGames();
  closeModal();
  resetModal();
  renderGames();
  updateSidebarStats();
}

function logTransaction(gameTitle, amount) {
  const history = JSON.parse(localStorage.getItem('save2play-history') || '[]');
  history.unshift({
    id:     Date.now(),
    game:   gameTitle,
    amount: amount,
    date:   new Date().toLocaleDateString()
  });
  localStorage.setItem('save2play-history', JSON.stringify(history));
}

function moveToPurchased(game) {
  const purchased = JSON.parse(localStorage.getItem('save2play-purchased') || '[]');
  purchased.unshift({ ...game, purchasedAt: new Date().toLocaleDateString() });
  localStorage.setItem('save2play-purchased', JSON.stringify(purchased));
  alert(`🎉 Congrats! You can now buy "${game.title}"!`);
}

function resetModal() {
  const modalHeader = document.querySelector('.modal-header h3');
  if (modalHeader) modalHeader.textContent = 'Add New Game';

  const modalBody = document.querySelector('.modal-body');
  if (modalBody) {
    modalBody.innerHTML = `
      <label>Game Title</label>
      <input type="text" id="game-title" placeholder="e.g. Elden Ring DLC" />
      <label>Target Price (₱)</label>
      <input type="number" id="game-price" placeholder="e.g. 2000" />
      <label>Amount Already Saved (₱)</label>
      <input type="number" id="game-saved" placeholder="e.g. 500" />
    `;
  }

  const submitBtn = document.querySelector('.btn-primary-sm');
  if (submitBtn) submitBtn.setAttribute('onclick', 'addGame()');
}

// ============================================
//   DELETE GAME
// ============================================
function deleteGame(id) {
  const game = games.find(g => g.id === id);
  if (!game) return;

  const confirmed = confirm(`Delete "${game.title}"? This cannot be undone.`);
  if (!confirmed) return;

  games = games.filter(g => g.id !== id);
  saveGames();
  renderGames();
  updateSidebarStats();
}

// ============================================
//   EDIT GAME
// ============================================
function openEditModal(id) {
  const game = games.find(g => g.id === id);
  if (!game) return;

  const overlay = document.getElementById('modal-overlay');
  if (overlay) overlay.classList.add('active');
  
  const modalHeader = document.querySelector('.modal-header h3');
  if (modalHeader) modalHeader.textContent = `Edit — ${game.title}`;

  const modalBody = document.querySelector('.modal-body');
  if (modalBody) {
    modalBody.innerHTML = `
      <label>Game Title</label>
      <input type="text" id="edit-title" value="${game.title}" />
      <label>Target Price (₱)</label>
      <input type="number" id="edit-price" value="${game.price}" />
      <label>Amount Saved (₱)</label>
      <input type="number" id="edit-saved" value="${game.saved}" />
    `;
  }

  const submitBtn = document.querySelector('.btn-primary-sm');
  if (submitBtn) submitBtn.setAttribute('onclick', `confirmEdit(${id})`);
}

function confirmEdit(id) {
  const title = document.getElementById('edit-title').value.trim();
  const price = parseFloat(document.getElementById('edit-price').value);
  const saved = parseFloat(document.getElementById('edit-saved').value) || 0;

  if (!title) { alert('Title cannot be empty.'); return; }
  if (!price || price <= 0) { alert('Enter a valid price.'); return; }
  if (saved < 0) { alert('Saved amount cannot be negative.'); return; }
  if (saved > price) { alert('Saved cannot exceed the goal price.'); return; }

  const index = games.findIndex(g => g.id === id);
  if (index === -1) return;

  games[index] = { ...games[index], title, price, saved };
  
  saveGames();
  closeModal();
  resetModal();
  renderGames();
  updateSidebarStats();
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

// ============================================
//   ESCAPE KEY MODAL LISTENER
// ============================================
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeModal();
    resetModal();
  }
});