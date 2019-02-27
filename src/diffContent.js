/* eslint-disable no-underscore-dangle */
/* eslint-disable no-param-reassign */

const colorize = require('json-diff/lib/colorize');
const jsonDiff = require('json-diff');

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

function diffContent(oldContent, newContent, options = {}) {
  const color = options.color === undefined || !!options.color;
  let diff = jsonDiff.diff(oldContent, newContent);
  diff = cleanDiff(diff);
  return colorize.colorize(diff || '', { color });
}

module.exports = diffContent;
