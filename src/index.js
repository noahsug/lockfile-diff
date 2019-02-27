const yargs = require('yargs');

const getExistingLockfileName = require('./getExistingLockfileName');
const readLockfiles = require('./readLockfiles');
const diffContent = require('./diffContent');

const args = yargs
  .command(
    '$0 [oldShaOrFile] [newShaOrFile]',
    'print human readable shrinkwrap/package-lock diff',
    (cmd) => {
      cmd.positional('oldShaOrFile', {
        type: 'string',
        default: 'HEAD',
      });
      cmd.positional('newShaOrFile', {
        type: 'string',
        describe: 'defaults to existing lockfile or `--lockfile`',
      });
    },
  )
  .options({
    color: {
      alias: 'c',
      default: process.stdout.isTTY,
      describe: 'whether to print with color',
    },
    lockfile: {
      alias: 'f',
      default: getExistingLockfileName(),
      describe: 'lockfile to parse',
    },
  })
  .help().argv;

if (!args.oldShaOrFile) {
  args.oldShaOrFile = 'HEAD';
}
if (!args.newShaOrFile) {
  args.newShaOrFile = args.lockfile;
}

const { oldShaOrFile, newShaOrFile, lockfile, color } = args;

readLockfiles([oldShaOrFile, newShaOrFile], { lockfile })
  .then(([oldContent, newContent]) => {
    const diff = diffContent(oldContent, newContent, { color });
    console.log(diff);
  })
  .catch((e) => console.error(e));
