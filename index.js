const parseArgs = require('minimist');
const fs = require('graceful-fs');

const printHelp = require('./printHelp');
const cleanShrinkwrapDiff = require('./cleanShrinkwrapDiff');

const args = parseArgs(process.argv.slice(2));

if (args.h || args.help) {
  printHelp();
} else {
  if (!('color' in args)) {
    args.color = process.stdout.isTTY;
  } else if (args.color === 'false') {
    args.color = false;
  }

  if (!('file' in args)) {
    args.file =
      ['npm-shrinkwrap.json', 'package-lock.json'].find((f) => fs.existsSync(f)) ||
      'npm-shrinkwrap.json';
  }

  cleanShrinkwrapDiff(args)
    .then((diff) => {
      console.log(diff);
    })
    .catch((e) => console.error(e));
}
