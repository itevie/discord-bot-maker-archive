import clc from 'cli-color';

// Parse flags
interface Dictionary<TValue> {
  [id: string]: TValue;
}

interface CLIFlagError {
  invalidFlag: string;
  validOptions: string[] | string;
}

const flags: Dictionary<unknown> = {
  loglevel: 1,
};

for (const i in process.argv) {
  let arg: string = process.argv[i];

  if (arg.startsWith('--')) {
    arg = arg.replace('--', '');

    const argComponents: string[] = arg.split('=');
    const flagName: string = argComponents[0].toLocaleLowerCase().toString();

    flags[flagName] = argComponents[1] || '';
  }
}

export {flags};

export function error(data: CLIFlagError) {
  console.log(
    clc.red(`
     Your provided CLI flag ${clc.blue('--' + data.invalidFlag)} is invalid!
          You provided: ${clc.blue(flags[data.invalidFlag])}
          But the valid options are: ${clc.blue(
            Array.isArray(data.validOptions)
              ? data.validOptions.join(', ')
              : data.validOptions
          )}
`)
  );

  // eslint-disable-next-line no-process-exit
  process.exit(0);
}
