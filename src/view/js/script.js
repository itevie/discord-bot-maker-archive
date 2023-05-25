document.addEventListener('DOMContentLoaded', () => {
  // Show log window
  const logwindow = windowManager.createWindow('Log', {
    denyclosing: true,
    loadfrom: 'log',
  });

  // Minimize log window
  setTimeout(() => {
    logwindow.minimize();
  }, 1);

  windowManager.createWindow('Bot Manager', {
    denyclosing: true,
    loadfrom: 'bot_manager',
  });

  botManager.reloadLists();
});
