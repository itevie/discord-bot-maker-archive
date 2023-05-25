const {contextBridge, ipcRenderer} = require('electron');

const eventListeners = {};

contextBridge.exposeInMainWorld('ipcApi', {
  loadWindowContents: name => ipcRenderer.sendSync('loadWindowContents', name),

  createBot: data => ipcRenderer.sendSync('createBot', data),
  startBot: name => ipcRenderer.send('startBot', name),
  stopBot: name => ipcRenderer.send('stopBot', name),

  fetchBotList: () => ipcRenderer.sendSync('fetchBotList'),
  fetchBot: botName => ipcRenderer.sendSync('fetchBot', botName),
  fetchStartedList: () => ipcRenderer.sendSync('fetchStartedBots'),

  confirmFunctionResponse: data =>
    ipcRenderer.send('confirmFunctionResponse', data),

  registerEventListener: (name, callback) => {
    if (!eventListeners[name]) {
      eventListeners[name] = [];

      ipcRenderer.on(name, (event, data) => {
        for (const i in eventListeners[name]) {
          eventListeners[name][i](data);
        }
      });
    }

    eventListeners[name].push(callback);
  },
});

ipcRenderer.on('log', (event, data) => {
  const p = document.createElement('p');

  const tag = data.match(
    /^(\[[0-9]{2}:[0-9]{2}:[0-9]{2} *: *[a-zA-Z0-9\-_]+ *\])/
  )[0];
  data = data.replace(
    tag,
    `<label style="color: var(--primary)">${tag}</label>`
  );

  p.innerHTML = data;

  try {
    document.getElementById('log-div').appendChild(p);
    document.getElementById('log-div').scroll({
      top: document.getElementById('log-div').scrollHeight,
      behavior: 'smooth',
    });
  } catch {}
});
