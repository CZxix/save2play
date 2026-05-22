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

  if (!grid) return; // Guard clause if not on the dashboard view layout

  // Remove old cards safely (keeps the baseline empty state container)
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
        <h3 class="card-title">${game.title}</h3>
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