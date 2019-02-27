const diffContent = require('../src/diffContent');

it('diffs two npm-shrinkwrap files', async () => {
  const oldLockfile = {
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
  };
  const newLockfile = {
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
  };

  const diff = await diffContent(oldLockfile, newLockfile, { color: false });

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

it('colorizes when the "color" option is set to true', async () => {
  const oldLockfile = { version: '0.0.1' };
  const newLockfile = { version: '0.0.2' };

  const diff = await diffContent(oldLockfile, newLockfile, { color: false });
  const coloredDiff = await diffContent(oldLockfile, newLockfile);

  expect(diff.length).toBeLessThan(coloredDiff.length);
});

it('hides integrity hash noise', async () => {
  const oldLockfile = {
    dependencies: {
      dep: {
        version: '0.0.1',
        integrity: 'sha1-adLdM1i2NM914eRmQ2gkBTPB3b4=',
      },
    },
  };
  const newLockfile = {
    dependencies: {
      dep: {
        version: '0.0.1',
        integrity:
          'sha512-79PTqMWGDva+GqClOqBV9s3SMh7MA3Mq0pJUdAoHuF65YoE7O0LermaZkVfT5/Ngfo18H4eYiyG7zKOtnEbxsw==',
      },
    },
  };

  const diff = await diffContent(oldLockfile, newLockfile);

  expect(diff.trim()).toBe(``);
});

it('shows integrity hash changes when sha encoding does not change', async () => {
  const oldLockfile = {
    dependencies: {
      dep: {
        version: '0.0.1',
        integrity: 'sha1-zdLdM1i2NM914eRmQ2gkBTPB3b4=',
      },
    },
  };
  const newLockfile = {
    dependencies: {
      dep: {
        version: '0.0.1',
        integrity: 'sha1-adLdM1i2NM914eRmq1gkBTPB3b4=',
      },
    },
  };

  const diff = await diffContent(oldLockfile, newLockfile);

  expect(/\+\s+integrity:/.test(diff)).toBe(true);
  expect(/-\s+integrity:/.test(diff)).toBe(true);
});

it('shows integrity hash changes when the package changes', async () => {
  const oldLockfile = {
    dependencies: {
      dep: {
        version: '0.0.1',
        integrity: 'sha1-zdLdM1i2NM914eRmQ2gkBTPB3b4=',
      },
    },
  };
  const newLockfile = {
    dependencies: {
      dep: {
        version: '0.0.2',
        integrity:
          'sha512-jrsuseXBo8pN197KnDwhhaaBzyZr2oicLHHTt2oDdQrej4Qp57dCCJafWx5ivU8/alEYDpssYqv1MUqcxwQlrA==',
      },
    },
  };

  const diff = await diffContent(oldLockfile, newLockfile);

  expect(/\+\s+integrity:/.test(diff)).toBe(true);
  expect(/-\s+integrity:/.test(diff)).toBe(true);
});
