// Copied and modified from https://github.com/uber/npm-shrinkwrap/blob/master/bin/diff.js

const colorize = require('json-diff/lib/colorize');
const exec = require('child_process').exec;
const jsonDiff = require('json-diff');
const jsonParse = require('safe-json-parse');
const parallel = require('run-parallel');
const path = require('path');

const readJSON = require('./read-json');

function purgeIntegrityHashes(diff, visited = new Set()) {
  if (!diff || visited.has(diff)) return;
  visited.add(diff);

  if (typeof diff.integrity === 'string') {
    delete diff.integrity;
  }

  Object.keys(diff).forEach((key) => {
    purgeIntegrityHashes(diff[key], visited);
  });
}

function diffContent(oldContent, newContent, opts) {
  purgeIntegrityHashes(oldContent);
  purgeIntegrityHashes(newContent);

  const diff = jsonDiff.diff(oldContent, newContent);

  return colorize.colorize(diff, {
    color: opts.color,
  });
}

function gitShow(sha, cwd, callback) {
  function ongit(err, stdout, stderr) {
    if (stderr) {
      console.error(stderr);
    }

    if (err && err.message.indexOf("not in 'HEAD'") !== -1) {
      return callback(null, {});
    }

    if (err) {
      return callback(err);
    }

    jsonParse(stdout, callback);
  }

  exec(
    `git show ${sha}:./npm-shrinkwrap.json`,
    {
      cwd: cwd || process.cwd(),
      maxBuffer: 10000 * 1024,
    },
    ongit,
  );
}

function isFile(fileName) {
  const index = fileName.indexOf('.json');

  return index !== -1 && index === fileName.length - 5;
}

function run(opts, callback) {
  let fileA = opts._[0];
  let fileB = opts._[1];

  if (!fileB) {
    fileB = 'npm-shrinkwrap.json';
  }

  if (!fileA) {
    fileA = 'HEAD';
  }

  if (!('color' in opts)) {
    opts.color = process.stdout.isTTY;
  } else if (opts.color === 'false') {
    opts.color = false;
  }

  const cwd = process.cwd();

  parallel(
    [
      isFile(fileA)
        ? readJSON.bind(null, path.resolve(cwd, fileA))
        : gitShow.bind(null, fileA, cwd),
      isFile(fileB)
        ? readJSON.bind(null, path.resolve(cwd, fileB))
        : gitShow.bind(null, fileB, cwd),
    ],
    (err, files) => {
      if (err) {
        return callback(err);
      }

      callback(null, diffContent(files[0], files[1], opts));
    },
  );
}

const parseArgs = require('minimist');

const opts = parseArgs(process.argv.slice(2));
run(opts, (err, diff) => {
  if (err) {
    throw err;
  }
  console.log(diff);
});
