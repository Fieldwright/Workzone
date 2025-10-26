/****************************************
 * PART 12 - UTILITIES
 * START
 * 
 * Helper functions and UI feedback:
 * - Quick notification toasts
 * - Confetti animation
 * - Success sounds
 * - Visual feedback effects
 ****************************************/

function showQuickNotification(message) {
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 80px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(34, 197, 94, 0.95);
    color: #000;
    padding: 12px 20px;
    border-radius: 8px;
    font-weight: bold;
    font-size: 14px;
    z-index: 10000;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    animation: slideDown 0.3s ease;
    backdrop-filter: blur(10px);
  `;
  notification.textContent = message;
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.style.animation = 'slideUp 0.3s ease';
    setTimeout(() => notification.remove(), 300);
  }, 2000);
}

function showConfetti() {
  const confettiCount = 50;
  const colors = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#a855f7'];
  
  for (let i = 0; i < confettiCount; i++) {
    const confetti = document.createElement('div');
    confetti.textContent = ['🎉', '✨', '⭐', '🎊'][Math.floor(Math.random() * 4)];
    confetti.style.cssText = `
      position: fixed;
      top: -20px;
      left: ${Math.random() * 100}%;
      font-size: 24px;
      z-index: 10001;
      pointer-events: none;
      animation: confettiFall ${2 + Math.random() * 2}s ease-out forwards;
    `;
    document.body.appendChild(confetti);
    
    setTimeout(() => confetti.remove(), 4000);
  }
}

/****************************************
 * PART 12 - UTILITIES
 * END
 ****************************************/
