import {randomID} from './quick_func';
import {mainWindow} from '../index';
import Logger from '../Logger';
const logger = new Logger('ui-conditionals');

interface Confirmer {
  successCallback: Function;
  negativeCallback?: Function;
}

const callbacks = new Map<string, Confirmer>();

export function confirmRunFunction(
  message: string,
  successCallback: Function,
  negativeCallback?: Function
): void {
  const id: string = randomID(30);
  callbacks.set(id, {
    successCallback,
    negativeCallback,
  });

  mainWindow.webContents.send('confirmRun', {
    id,
    text: message,
  });

  logger.log(`Registered confirm run function: ${id}`);
}

export function response(id: string, response: boolean): void {
  if (callbacks.has(id)) {
    const callback = callbacks.get(id);

    if (response === true) return callback?.successCallback();
    else if (callback?.negativeCallback) return callback?.negativeCallback();
  }
}
