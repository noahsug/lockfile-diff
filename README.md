# lockfile-diff
> human readable npm-shrinkwrap and package-lock diff

Based on [uber/npm-shrinkwrap](https://github.com/uber/npm-shrinkwrap) with a few additions:
 * supports `package-lock.json`
 * hides integrity hash noise (from flipping between different sha encodings)

## Install
```
npm i -g lockfile-diff
```

## Usage
```
lockfile-diff [OldShaOrFile] [NewShaOrFile]
```

For example
```
lockfile-diff origin/master
```

```
lockfile-diff origin/master HEAD --lock-file-name package-lock.json
```

Options:
```
    --file, -f     file to parse [defaults to `npm-shrinkwrap.json`]
    --color, -c    whether to print with color [defaults to `stdout.isTTY`]
```

To negate an option, pass `no-` before it. For example: `lockfile-diff --no-color`

## Example
**Using git:**
```
git diff npm-shrinkwrap.json master
```

```diff
diff --git a/npm-shrinkwrap.json b/npm-shrinkwrap.json
index 4b4142c49f63..9f541569ac01 100644
--- a/npm-shrinkwrap.json
+++ b/npm-shrinkwrap.json
@@ -3893,9 +3893,9 @@
       "dev": true
     },
     "fast-replace": {
-      "version": "0.51.16",
-      "integrity": "sha1-7HC1yvewi9BFMkF5vP+PRw8oQ54=",
+      "version": "0.51.17",
+      "integrity": "sha1-SCU1fIF/sMYkGjsspmhvrZ+ZhHQ=",
       "requires": {
         "@babel/core": "^7.0.0",
         "@babel/parser": "^7.0.0",
@@ -7295,7 +7295,7 @@
     },
     "json5-writer": {
       "version": "1.7.2",
-      "integrity": "sha1-4Qx/rKKXaelxMeDgMI73z7Zvtww=",
+      "integrity": "sha512-GD4OYJ8GsayVhIg306sfgckDk9j8YfuSKIAWvdB/g7IDlw0pDgueONALVEEE2XWJtCwcsUyDtCYzXFgCBWLEjA==",
       "dev": true,
       "requires": {
         "@babel/core": "^7.0.0",
```

**Using lockfile-diff:**
```
lockfile-diff master
```

```diff
@@ -3893,9 +3893,9 @@
 {
   dependencies: {
     fast-replace: {
-      "version": "0.51.16",
-      "integrity": "sha1-7HC1yvewi9BFMkF5vP+PRw8oQ54=",
+      "version": "0.51.17",
+      "integrity": "sha1-SCU1fIF/sMYkGjsspmhvrZ+ZhHQ=",
     }
   }
 }
```
