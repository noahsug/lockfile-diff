const yargs = require('yargs');
const fs = require('graceful-fs');

const lockfileDiff = require('./lockfileDiff');

function getDefaultLockFile() {
  const lockFiles = ['npm-shrinkwrap.json', 'package-lock.json'];
  return lockFiles.find((f) => fs.existsSync(f)) || lockFiles[0];
}

const args = yargs
  .command('$0 [oldShaOrFile] [newShaOrFile]', 'print human readable shrinkwrap/package-lock diff')
  .options({
    color: { alias: 'c', default: process.stdout.isTTY, describe: 'whether to print with color' },
    lockfile: { alias: 'f', default: getDefaultLockFile(), describe: 'lockfile to parse' },
  })
  .help().argv;

if (!args.oldShaOrFile) {
  args.oldShaOrFile = args.lockfile;
}
if (!args.newShaOrFile) {
  args.newShaOrFile = 'HEAD';
}

lockfileDiff(args)
  .then((diff) => {
    console.log(diff);
  })
  .catch((e) => console.error(e));
