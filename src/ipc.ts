import getAllFiles from './getAllFiles';
import Logger from './Logger';
const logger = new Logger('ipc');

const files = getAllFiles(__dirname + '/ipc');
for (const i in files) {
  // Check if it is valid
  if (files[i].endsWith('.js') === false) continue;
  logger.log(`Importing IPC file: ${files[i]}`);
  require(files[i]);
}
