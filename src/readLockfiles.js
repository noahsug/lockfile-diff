const path = require('path');
const parallel = require('run-parallel');
const jsonParse = require('safe-json-parse');
const { exec } = require('child_process');

const readJSON = require('./readJson');

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

function readLockfiles(files, { lockfile }) {
  return new Promise((resolve, reject) => {
    parallel(
      files.map((file) => (callback) =>
        isLockfile(file)
          ? readJSON(path.resolve(process.cwd(), file), callback)
          : gitShow(file, { lockfile }, callback),
      ),
      (err, contentList) => {
        if (err) {
          reject(err);
        } else {
          resolve(contentList);
        }
      },
    );
  });
}

module.exports = readLockfiles;
