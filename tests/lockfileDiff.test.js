const mockFs = require('mock-fs');

require('./fixMockFs');
const lockfileDiff = require('../src/lockfileDiff');

it('diffs two npm-shrinkwrap files', async () => {
  mockFs({
    'old.json': JSON.stringify({
      name: 'my-app',
      dependencies: {
        dep: {
          version: '0.0.1',
          resolved: 'https://registry.npmjs.org/dep/-/dep-0.0.1.tgz',
          integrity:
            'sha512-jrsuseXBo8pN197KnDwhhaaBzyZr2oicLHHTt2oDdQrej4Qp57dCCJafWx5ivU8/alEYDpssYqv1MUqcxwQlrA==',
          dev: true,
        },
      },
    }),
    'new.json': JSON.stringify({
      name: 'my-app',
      dependencies: {
        dep: {
          version: '0.0.2',
          resolved: 'https://registry.npmjs.org/dep/-/dep-0.0.2.tgz',
          integrity:
            'sha512-jRauseaBo8pN197anAwhhaaBzyZr2oicLTHTt2oDdQrej4QF47dCCJafWx5ivU8/alEYDpssYqv1MUqcxwQlrA==',
          dev: true,
        },
        'new-dep': {
          version: '0.0.2',
          resolved: 'https://registry.npmjs.org/new-dep/-/new-dep-0.0.2.tgz',
          integrity:
            'sha512-zrauseaBo8pN197anAwhhaaBzzZr2oicLTHTt2oDdQrej4QF47dCCJafWx5ivU8/alEYDpssYqv1MUqcxwQlrA==',
        },
      },
    }),
  });

  const diff = await lockfileDiff({
    oldShaOrFile: 'old.json',
    newShaOrFile: 'new.json',
    color: false,
  });

  expect(diff.trim()).toBe(`{
   dependencies: {
+    new-dep: {
+      version: "0.0.2"
+      resolved: "https://registry.npmjs.org/new-dep/-/new-dep-0.0.2.tgz"
+      integrity: "sha512-zrauseaBo8pN197anAwhhaaBzzZr2oicLTHTt2oDdQrej4QF47dCCJafWx5ivU8/alEYDpssYqv1MUqcxwQlrA=="
+    }
     dep: {
-      version: "0.0.1"
+      version: "0.0.2"
-      resolved: "https://registry.npmjs.org/dep/-/dep-0.0.1.tgz"
+      resolved: "https://registry.npmjs.org/dep/-/dep-0.0.2.tgz"
-      integrity: "sha512-jrsuseXBo8pN197KnDwhhaaBzyZr2oicLHHTt2oDdQrej4Qp57dCCJafWx5ivU8/alEYDpssYqv1MUqcxwQlrA=="
+      integrity: "sha512-jRauseaBo8pN197anAwhhaaBzyZr2oicLTHTt2oDdQrej4QF47dCCJafWx5ivU8/alEYDpssYqv1MUqcxwQlrA=="
     }
   }
 }`);
});

it('hides integrity hash noise', async () => {
  mockFs({
    'old.json': JSON.stringify({
      dependencies: {
        dep: {
          version: '0.0.1',
          integrity: 'sha1-adLdM1i2NM914eRmQ2gkBTPB3b4=',
        },
      },
    }),
    'new.json': JSON.stringify({
      dependencies: {
        dep: {
          version: '0.0.1',
          integrity:
            'sha512-79PTqMWGDva+GqClOqBV9s3SMh7MA3Mq0pJUdAoHuF65YoE7O0LermaZkVfT5/Ngfo18H4eYiyG7zKOtnEbxsw==',
        },
      },
    }),
  });

  const diff = await lockfileDiff({
    oldShaOrFile: 'old.json',
    newShaOrFile: 'new.json',
    color: false,
  });

  expect(diff.trim()).toBe(``);
});

it('shows integrity hash changes when sha encoding does not change', async () => {
  mockFs({
    'old.json': JSON.stringify({
      dependencies: {
        dep: {
          version: '0.0.1',
          integrity: 'sha1-zdLdM1i2NM914eRmQ2gkBTPB3b4=',
        },
      },
    }),
    'new.json': JSON.stringify({
      dependencies: {
        dep: {
          version: '0.0.1',
          integrity: 'sha1-adLdM1i2NM914eRmq1gkBTPB3b4=',
        },
      },
    }),
  });

  const diff = await lockfileDiff({
    oldShaOrFile: 'old.json',
    newShaOrFile: 'new.json',
    color: false,
  });

  expect(/\+\s+integrity:/.test(diff)).toBe(true);
  expect(/-\s+integrity:/.test(diff)).toBe(true);
});

it('shows integrity hash changes when the package changes', async () => {
  mockFs({
    'old.json': JSON.stringify({
      dependencies: {
        dep: {
          version: '0.0.1',
          integrity: 'sha1-zdLdM1i2NM914eRmQ2gkBTPB3b4=',
        },
      },
    }),
    'new.json': JSON.stringify({
      dependencies: {
        dep: {
          version: '0.0.2',
          integrity:
            'sha512-jrsuseXBo8pN197KnDwhhaaBzyZr2oicLHHTt2oDdQrej4Qp57dCCJafWx5ivU8/alEYDpssYqv1MUqcxwQlrA==',
        },
      },
    }),
  });

  const diff = await lockfileDiff({
    oldShaOrFile: 'old.json',
    newShaOrFile: 'new.json',
    color: false,
  });

  expect(/\+\s+integrity:/.test(diff)).toBe(true);
  expect(/-\s+integrity:/.test(diff)).toBe(true);
});
