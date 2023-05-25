import clc from 'cli-color';
import * as cli from './cli';
import {mainWindow} from './index';

let longestName = 0;
enum logLevels {
  standard,
  debug,
  verbose,
}

const currentLogLevel: number =
  (logLevels[cli.flags.loglevel as number] as unknown as number) ||
  logLevels.standard;
if (cli.flags.loglevel && !logLevels[cli.flags.loglevel as number]) {
  cli.error({
    invalidFlag: 'loglevel',
    validOptions: Object.keys(logLevels),
  });
}

export default class Logger {
  type: string;
  logLevel: number;

  constructor(type: string, logLevel: number = logLevels.standard) {
    this.type = type;
    this.logLevel = logLevel;

    if (type.length > longestName) longestName = type.length;
  }

  private genDefaultText(content: string) {
    let text = content;
    const numbers = text.match(/([[/(= ])[0-9]+([\]/) ])/g) || [];

    for (let i = 0; i !== numbers?.length; i++) {
      const n = numbers[i].replace(/[^0-9]/g, '');
      text = text.replace(numbers[i], numbers[i].replace(n, clc.yellow(n)));
    }

    return `[${this.addPadding(
      new Date().toLocaleTimeString() + ' : ' + this.type
    )}] ${text}`;
  }

  private addPadding(content: string) {
    return `${content}${' '.repeat(longestName - this.type.length)}`;
  }

  public log(content: string) {
    if (currentLogLevel < this.logLevel) return;

    const text = this.genDefaultText(content);
    console.log(text);

    mainWindow?.webContents?.send('log', text);
  }

  error(content: string) {
    const text = clc.red(this.genDefaultText(content));
    console.log(text);

    mainWindow?.webContents?.send('log', text);
  }
}
