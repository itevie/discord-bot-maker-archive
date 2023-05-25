import * as WinBox from 'winbox';

document.addEventListener('DOMContentLoaded', () => {
  new WinBox.default('hello world', undefined);
});

const openWindows = new Map<WinBox, ExtraWindowData>();

export function createWindow(
  name: string,
  config: WinBox.Params,
  extra: ExtraWindowData
): WinBox {
  const winBox = new WinBox.default(name, config);

  // Overwrite some of the events
  if (config.onclose) {
    config.onclose = function (): boolean {
      if (extra.onclose) extra.onclose();

      // Check if it should be removed from the map
      if (extra.denyClosing !== true) {
        winBox.close();
        openWindows.delete(winBox);
      }

      if (extra.denyClosing !== undefined) {
        return extra.denyClosing;
      } else return false;
    };
  }

  // Register in openWindows
  openWindows.set(winBox, extra);

  return winBox;
}

export function loadWindowContents(windowName: string) {
  api.loadWindowContents(windowName);
}

export function closeAll() {
  openWindows.forEach((x, win: WinBox) => {
    win.close();
    openWindows.delete(win);
  });
}
