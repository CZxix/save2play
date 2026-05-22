// ============================================
//   DEPOSIT MODAL & TRANSACTION ENGINE
// ============================================
function openDepositModal(id) {
  const game = games.find(g => g.id === id);
  if (!game) return;

  // Reuse the add modal framework but dynamically repurpose it for deposits
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
      <input type="number" id="deposit-amount" placeholder="e.g. 500" />
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

  // Increment savings state safely capped at retail retail boundary limit
  games[index].saved = Math.min(games[index].saved + amount, games[index].price);

  // Log ledger information to systemic audit history
  logTransaction(games[index].title, amount);

  // Check if target boundary criteria is fully achieved
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