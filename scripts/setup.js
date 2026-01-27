document.addEventListener('DOMContentLoaded', () => {
  // ensure global stylesheet is loaded
  if (!document.querySelector('link[href="css/global.css"]')) {
    const l = document.createElement('link');
    l.rel = 'stylesheet';
    l.href = 'css/global.css';
    document.head.appendChild(l);
  }
  // manifest link
  if (!document.querySelector('link[rel="manifest"]')) {
    const m = document.createElement('link');
    m.rel = 'manifest';
    m.href = 'manifest.json';
    document.head.appendChild(m);
  }
  // register service worker
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('service-worker.js').then(() => {
      console.log('Service Worker registered (via setup.js)');
    }).catch(() => {
      console.log('Service Worker registration failed (via setup.js)');
    });
  }
  // simple highscores scaffold
  if (!localStorage.getItem('nexus_highscores')) {
    localStorage.setItem('nexus_highscores', '{}');
  }
  window.updateHighScore = function(game, score) {
    try {
      const data = JSON.parse(localStorage.getItem('nexus_highscores') || '{}');
      const prev = data[game] || 0;
      if (score > prev) {
        data[game] = score;
        localStorage.setItem('nexus_highscores', JSON.stringify(data));
      }
    } catch (e) {
      // ignore
    }
  };
});
