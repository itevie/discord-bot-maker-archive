/**
 * @typedef {Object} WindowConfig
 * @property {number} x The X position of the window
 * @property {number} y The Y position of the window
 * @property {number} width The width of the window
 * @property {number} height The height of the window
 * @property {number} minwidth The minimum width of the window
 * @property {number} minheight The minimum height of the window
 * @property {number} maxwidth The maximum width of the window
 * @property {number} maxheight The maximum height of the window
 * @property {function} onclose Executed when the window is created
 *
 * @property {string} internal Internal ID for use in coding
 * @property {boolean} denyclosing Whether or not the window should be allowed to be closed by the user
 * @property {boolean} denyresize Whether or not the window can be resized
 * @property {string} loadfrom Where to load the window's HTML file from
 * @property {object} htmlconfig
 */

/**
 * @type {Map<WinBox, WindowConfig>}
 */
const openWindows = new Map();

const windowManager = {
  /**
   * Creates a new winbox window.
   * @param {string} windowName The name of the window title
   * @param {WindowConfig} config The config of the window
   * @returns {WinBox}
   */
  createWindow: (windowName, config) => {
    // Add placeholders
    if (!config.class) {
      config.class = [];
    }

    let isClosing = false;

    // Overwrite some config
    const oldOnClose = config.onclose || null;
    config.onclose = function () {
      if (isClosing === true) {
        openWindows.delete(this);
        return;
      }

      if (oldOnClose) oldOnClose();

      if (config.denyclosing === true) return true;

      // Add closing class
      document.getElementById(winBox.id).style['animation-duration'] = '0.1s';
      document.getElementById(winBox.id).style['animation-name'] =
        'windowManager-container-show-backwards';

      setTimeout(() => {
        isClosing = true;
        this.close();
      }, 100);

      return true;
    };

    // Hide buttons if denyclosing is on
    if (config.denyclosing) {
      config.class.push('no-close');
    }

    // Check for deny resize
    if (config.denyresize) {
      // Set min and max widths and heights
      config.minwidth = config.width;
      config.minheight = config.height;
      config.maxwidth = config.width;
      config.maxheight = config.height;

      // Hide full screen buttons
      config.class.push('no-full');
      config.class.push('no-max');
    }

    // Check for loadFrom
    if (config.loadfrom) {
      config.html = windowManager.loadWindowContents(config.loadfrom);
    }

    // Update html
    if (config.htmlconfig) {
      for (const i in config.htmlconfig) {
        const regex = new RegExp(`%${i}%`, 'g');
        config.html = config.html.replace(regex, config.htmlconfig[i]);
      }
    }

    // Add defaults
    if (!config.left) config.left = 40;

    // Create window
    const winBox = new WinBox(windowName, config);

    // Check if it should be focused
    setTimeout(() => {
      winBox.focus();
    }, 10);

    // Set in open windows
    openWindows.set(winBox, config);

    // Return the window
    return winBox;
  },

  /**
   * Attempts to close all open windows
   */
  closeAllWindows: () => {
    openWindows.forEach((config, winBox) => {
      // Check if the window is allowed to be closed
      if (config.denyclosing === true) return;

      // Close the window
      winBox.close();
    });
  },

  /**
   * Fetched a window file
   * @param {*} windowFileName The window's name in the directory
   * @param {*} config Key value place for replacing text in the given HTML, e.g. { id: "2" }, all %id% in document would be replaced with "2"
   * @returns {string} The data returned
   */
  loadWindowContents: (windowFileName, config) => {
    // Fetch content from ipc
    let data = window.ipcApi.loadWindowContents(windowFileName) || '';

    // Replace the given content
    for (const i in config) {
      const regex = new RegExp(`%${i}%`, 'g');
      data = data.replace(regex, config[i]);
    }

    // Return data
    return data;
  },

  /**
   * Checks if a window exists by the given internal ID
   * @param {*} name The internal ID
   * @returns {bool} True or false
   */
  checkExistsByInternal: name => {
    let exists = false;

    openWindows.forEach(config => {
      if (config.internal === name) exists = true;
    });

    return exists;
  },

  /**
   * Bring a window to the foreground
   * @param {string} internalName The given internal ID
   */
  focusWindow: internalName => {
    openWindows.forEach((config, winBox) => {
      if (config.internal === internalName) {
        setTimeout(() => {
          winBox.focus(true);
          winBox.restore();
        }, 10);
      }
    });
  },

  /**
   * Fetch a window
   * @param {string} internalName The given internal ID
   * @returns {WinBox} The window
   */
  fetchWindow: internalName => {
    let finishedWinBox = null;
    openWindows.forEach((config, winBox) => {
      if (config.internal === internalName) finishedWinBox = winBox;
    });

    return finishedWinBox;
  },
};
