import WinBox from 'winbox';
import * as windowManager from './window_manager';

let botManagerWindow: WinBox;

document.addEventListener('DOMContentLoaded', () => {
  botManagerWindow = windowManager.createWindow(
    'Log',
    {},
    {
      loadFrom: 'local_windows:log',
    }
  );
});
