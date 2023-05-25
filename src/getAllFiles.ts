import fs from 'fs';

function getAllFiles(directory: string, files_: string[] = []): string[] {
  const files = fs.readdirSync(directory);

  for (const i in files) {
    const name = directory + '/' + files[i];

    if (fs.statSync(name).isDirectory()) {
      getAllFiles(name, files_);
    } else {
      files_.push(name);
    }
  }

  return files_;
}

export default getAllFiles;
