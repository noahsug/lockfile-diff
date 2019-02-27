const fs = require('graceful-fs');
const path = require('path');

function getExistingLockfileName(cwd = '') {
  const lockFiles = ['npm-shrinkwrap.json', 'package-lock.json'];
  return lockFiles.find((f) => fs.existsSync(path.resolve(cwd, f))) || lockFiles[0];
}

module.exports = getExistingLockfileName;
