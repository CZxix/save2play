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
  document.getElementById('game-title').value = '';
  document.getElementById('game-price').value = '';
  document.getElementById('game-saved').value = '';
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

  // Automated Routing: If fully funded, send directly to the Purchased Vault
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