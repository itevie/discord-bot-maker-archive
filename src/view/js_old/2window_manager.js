let possibleWindows = [];
let staticWindows = {};

function Win(config = {}) {
  let winData = {

  };

  // Check defined events
  let configClose = config.onclose || null;
  if (config.onclose) delete config.onclose;

  
}

window.winManager = {
  defaults: {
    left: 40,
    oncreate: function() {
      setTimeout(() => {
        this.focus(true);
        possibleWindows.push(this);
      }, 10);
    }
  },

  loadWindowContents: (window_name, config = {}) => {
    let data = window.electron.loadWindowContents(window_name) || "";

    for (let i in config) {
      let regex = new RegExp(`%${i}%`, "g");
      data = data.replace(regex, config[i]);
    }

    return data;
  },

  closeAll: () => {
    for (let i in possibleWindows) {
      try {possibleWindows[i].close(true)}catch{}
      possibleWindows[i] = null;
    }

    possibleWindows = [];
  },

  loadStatic: (name, data = {}) => {
    if (!staticWindows[name]) {
      let html = window.winManager.loadWindowContents(name, data.htmlConfig);
      let winData = {
        ...window.winManager.defaults,
        html: html,
        onclose: function() {
          if (data.denyClose == true) return true;
          staticWindows[name] = null;
        }
      }

      if (data.width) winData.width = data.width;
      if (data.height) window.height = data.height;
      if (data.hideMaximize) 
        winData.class = ["no-full", "no-max"]; 
      if (data.denyClose) winData.class = ["no-close"];

      if (data.class) winData.class = data.class;
      if (data.denyReisize == true) {
        winData.minheight = data.height;
        winData.maxheight = data.height;
        winData.minwidth = data.width;
        winData.maxwidth = data.width;
      }

      staticWindows[name] = new WinBox(data.title || name, winData);
      if (data.duplicates) delete staticWindows[name];
    } else {
      setTimeout(() => {
        staticWindows[name].focus(true);
      }, 10);
    }
  }
}