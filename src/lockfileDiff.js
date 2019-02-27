// copied from https://github.com/uber/npm-shrinkwrap/blob/master/bin/diff.js with heavy modification.

/* eslint-disable no-underscore-dangle */
/* eslint-disable no-param-reassign */

const colorize = require('json-diff/lib/colorize');
const { exec } = require('child_process');
const jsonDiff = require('json-diff');
const jsonParse = require('safe-json-parse');
const parallel = require('run-parallel');
const path = require('path');

const readJSON = require('./readJson');

// remove integrity hashes only when:
//  1) sha encoding has changed
//  2) no other changes exist
function purgeIntegrityHashNoise(diff) {
  if (
    diff.integrity &&
    typeof diff.integrity.__old === 'string' &&
    typeof diff.integrity.__new === 'string' &&
    diff.integrity.__old.length !== diff.integrity.__new.length
  ) {
    delete diff.integrity;
  }
}

function cleanDiff(diff) {
  if (!diff) return null;

  if (diff.dependencies) {
    diff.dependencies = Object.keys(diff.dependencies).reduce((acc, key) => {
      const value = cleanDiff(diff.dependencies[key]);
      if (value) {
        acc[key] = value;
      }
      return acc;
    }, {});
    if (Object.keys(diff.dependencies).length === 0) {
      delete diff.dependencies;
    }
  }

  if (Object.keys(diff).length === 1) {
    purgeIntegrityHashNoise(diff);
  }

  if (Object.keys(diff).length === 0) {
    return null;
  }

  return diff;
}

function diffContent(oldContent, newContent, options) {
  let diff = jsonDiff.diff(oldContent, newContent);
  diff = cleanDiff(diff);
  return colorize.colorize(diff || '', {
    color: options.color,
  });
}

function gitShow(sha, { lockfile }, callback) {
  function ongit(err, stdout, stderr) {
    if (stderr) {
      console.error(stderr);
    }

    if (err && err.message.indexOf(`not in 'HEAD'`) !== -1) {
      callback(null, []);
    } else if (err) {
      callback(err);
    } else {
      jsonParse(stdout, callback);
    }
  }

  exec(
    `git show ${sha}:${lockfile}`,
    {
      maxBuffer: 10000 * 1024,
    },
    ongit,
  );
}

function isLockfile(fileName) {
  return fileName.endsWith('.json');
}

function run(options) {
  const { oldShaOrFile, newShaOrFile } = options;

  return new Promise((resolve, reject) => {
    parallel(
      [
        isLockfile(oldShaOrFile)
          ? readJSON.bind(null, path.resolve(process.cwd(), oldShaOrFile))
          : gitShow.bind(null, oldShaOrFile, options),
        isLockfile(newShaOrFile)
          ? readJSON.bind(null, path.resolve(process.cwd(), newShaOrFile))
          : gitShow.bind(null, newShaOrFile, options),
      ],
      (err, [oldFile, newFile] = []) => {
        if (err) {
          reject(err);
        } else {
          resolve(diffContent(oldFile, newFile, options));
        }
      },
    );
  });
}

module.exports = run;
