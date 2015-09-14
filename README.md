# git-describe

[![npm version](https://img.shields.io/npm/v/git-describe.svg)](https://www.npmjs.com/package/git-describe)
[![npm license](https://img.shields.io/npm/l/git-describe.svg)](https://www.npmjs.com/package/git-describe)

This Node.js module runs [`git describe`][1] on the working directory or any
other directory and parses the output to individual components. Additionally,
if your tags follow [semantic versioning][2] the semver will be parsed and
supplemented with the `git describe` information as build metadata.

Because this module is primarily meant for init sequences and the like, it only
offers a straightforward synchronous API.

## Installation

Available from npm:
`npm install git-describe`

## Usage

The module exports a function taking an optional `directory` (defaults to
working directory) and an optional `options` object. It returns an object
containing the parsed information, or throws an `Error` if the git command
fails.

```javascript
var gitDescribe = require('git-describe');

// Target working directory
var gitInfo = gitDescribe();

// Target the directory of the calling script
// Do this when you want to target the repo your app resides in
var gitInfo = gitDescribe(__dirname);

// With options (see below)
var gitInfo = gitDescribe(__dirname, {
    longSemver: true,
    dirtySemver: false
});

// Another example: working directory, use 16 character commit hash abbreviation
var gitInfo = gitDescribe({
    customArguments: ['--abbrev=16']
});
```

## Example output
```javascript
{ dirty: false,
  hash: 'g3c9c15b',
  distance: 6,
  tag: 'v2.1.0-beta',
  semver: SemVer, // SemVer instance, see https://github.com/npm/node-semver
  suffix: '6-g3c9c15b',
  raw: 'v2.1.0-beta-6-g3c9c15b',
  semverString: 'v2.1.0-beta+6.g3c9c15b' }
```

## Options

Option             | Default     | Description
------------------ | ----------- | -----------
`dirtySemver`      | `true`      | Appends `'.dirty'` to `semverString` if repo state is dirty (similar to `--dirty`).
`longSemver`       | `false`     | Always add commit distance and hash to `semverString` (similar to `--long`).
`requireAnnotated` | `false`     | Uses `--tags` if false, so that simple git tags are allowed.
`match`            | `'v[0-9]*'` | Uses `--match` to filter tag names. By default only tags resembling a version number are considered.
`customArguments`  | `[]`        | Array of additional arguments to pass to `git describe`. Not all arguments are useful and some may even break the library, but things like `--abbrev` and `--candidates` should be safe to add.

[1]: https://git-scm.com/docs/git-describe
[2]: http://semver.org/
