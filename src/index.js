const parseArgs = require('minimist');
const fs = require('graceful-fs');

const printHelp = require('./printHelp');
const cleanShrinkwrapDiff = require('./cleanShrinkwrapDiff');

const args = parseArgs(process.argv.slice(2));

if (args.h || args.help) {
  printHelp();
} else {
  args.color = args.color || args.c;
  if (args.color === undefined) {
    args.color = process.stdout.isTTY;
  } else if (args.color === 'false') {
    args.color = false;
  }

  args.file = args.file || args.f;
  if (args.file === undefined) {
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
