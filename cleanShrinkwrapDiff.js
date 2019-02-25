const colorize = require('json-diff/lib/colorize');
const { exec } = require('child_process');
const jsonDiff = require('json-diff');
const jsonParse = require('safe-json-parse');
const parallel = require('run-parallel');
const path = require('path');

const readJSON = require('./read-json');

function purgeEmptyDeps(diff) {
  if (!diff || Object.keys(diff).length === 0) return null;

  const deps = diff.dependencies;
  if (!deps) return diff;

  // eslint-disable-next-line no-param-reassign
  diff.dependencies = Object.keys(deps).reduce((acc, key) => {
    const value = purgeEmptyDeps(deps[key]);
    if (value) {
      acc[key] = value;
    }
    return acc;
  }, {});

  if (Object.keys(diff.dependencies).length === 0) {
    // eslint-disable-next-line no-param-reassign
    delete diff.dependencies;
  }

  if (Object.keys(diff).length === 0) {
    return null;
  }

  return diff;
}

function purgeIntegrityHashes(diff, visited = new Set()) {
  if (!diff || visited.has(diff)) return null;
  visited.add(diff);

  if (
    diff.integrity &&
    // eslint-disable-next-line no-underscore-dangle
    typeof diff.integrity.__old === 'string' &&
    // eslint-disable-next-line no-underscore-dangle
    typeof diff.integrity.__new === 'string'
  ) {
    // eslint-disable-next-line no-param-reassign
    delete diff.integrity;
  }

  Object.keys(diff).forEach((key) => {
    purgeIntegrityHashes(diff[key], visited);
  });
  return diff;
}

function diffContent(oldContent, newContent, opts) {
  let diff = jsonDiff.diff(oldContent, newContent);

  diff = purgeIntegrityHashes(diff);
  diff = purgeEmptyDeps(diff);

  return colorize.colorize(diff || '', {
    color: opts.color,
  });
}

function gitShow(sha, { file }, callback) {
  function ongit(err, stdout, stderr) {
    if (stderr) {
      console.error(stderr);
    }

    if (err && err.message.indexOf("not in 'HEAD'") !== -1) {
      callback(null, {});
    } else if (err) {
      callback(err);
    } else {
      jsonParse(stdout, callback);
    }
  }

  exec(
    `git show ${sha}:./${file}`,
    {
      maxBuffer: 10000 * 1024,
    },
    ongit,
  );
}

function isFile(fileName) {
  const index = fileName.indexOf('.json');

  return index !== -1 && index === fileName.length - 5;
}

function run(opts) {
  let fileA = opts._[0];
  let fileB = opts._[1];

  if (!fileB) {
    fileB = opts.file;
  }

  if (!fileA) {
    fileA = 'HEAD';
  }

  return new Promise((resolve, reject) => {
    parallel(
      [
        isFile(fileA)
          ? readJSON.bind(null, path.resolve(process.cwd(), fileA))
          : gitShow.bind(null, fileA, opts),
        isFile(fileB)
          ? readJSON.bind(null, path.resolve(process.cwd(), fileB))
          : gitShow.bind(null, fileB, opts),
      ],
      (err, files) => {
        if (err) {
          reject(err);
        } else {
          resolve(diffContent(files[0], files[1], opts));
        }
      },
    );
  });
}

module.exports = run;
