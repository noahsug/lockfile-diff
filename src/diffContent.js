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

function cleanContent(pkg, ignoreDev) {
  if (!pkg) return null;

  if (pkg.dependencies) {
    pkg.dependencies = Object.keys(pkg.dependencies).reduce((acc, key) => {
      const dep = pkg.dependencies[key];
      if (ignoreDev && dep.dev) {
        return acc;
      }

      const value = cleanContent(dep, ignoreDev);
      if (value) {
        acc[key] = value;
      }
      return acc;
    }, {});
  }

  return pkg;
}

function cleanDiff(diff, options) {
  if (!diff) return null;

  var depsKey = 'dependencies' in diff ?
    'dependencies' : 'dependencies__deleted' in diff ?
    'dependencies__deleted' : 'dependencies__added' in diff ?
    'dependencies__added' : null;
  if (!depsKey) {
    return diff;
  }

  var deps = diff[depsKey];
  if (!deps) {
    return diff;
  }

  if (deps) {
    deps = Object.keys(deps).reduce((acc, key) => {
      var deleted = options.deleted ? options.deleted :
        (key.indexOf('__deleted') !== -1 ||
        depsKey === 'dependencies__deleted');
      var added = options.added ? options.added :
        (key.indexOf('__added') !== -1 ||
        depsKey === 'dependencies__added');
      const dep = deps[key];

      let value

      if (deleted && options.ignoreDelete) {
        value = null
      } else if (deleted || added) {
        if (options.currentDepth >= options.maxDepth) {
          value = (deleted ? '[Deleted' : '[Added') +
            '@' + deps[key].version + ']';
        } else {
          value = cleanDiff(dep, {
            maxDepth: options.maxDepth,
            ignoreDelete: options.ignoreDelete,
            currentDepth: options.currentDepth + 1,
            added: added,
            deleted: deleted
          });
        }
      } else {
        value = cleanDiff(dep, {
          maxDepth: options.maxDepth,
          ignoreDelete: options.ignoreDelete,
          currentDepth: options.currentDepth + 1
        });
      }

      if (value) {
        acc[key] = value;
      }
      return acc;
    }, {});
    diff[depsKey] = deps
    if (Object.keys(diff[depsKey]).length === 0) {
      delete diff[depsKey]
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
  const ignoreDev = 'ignoreDev' in options ? !!options.ignoreDev : false
  const ignoreDelete = 'ignoreDelete' in options ?
    !!options.ignoreDelete : false
  const depth = 'depth' in options ? Number(options.depth) : 0

  const cleanOldContent = cleanContent(oldContent, ignoreDev)
  const cleanNewContent = cleanContent(newContent, ignoreDev)
  let diff = jsonDiff.diff(cleanOldContent, cleanNewContent);
  diff = cleanDiff(diff, {
    maxDepth: depth,
    ignoreDelete: ignoreDelete,
    currentDepth: 0
  });
  return colorize.colorize(diff || '', { color });
}

module.exports = diffContent;
