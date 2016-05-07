<!--@'# ' + package.name-->
# remark-mos
<!--/@-->

<!--@'> ' + package.description-->
> Inject parts of markdown via hidden JavaScript snippets
<!--/@-->

<!--@shields.flatSquare('npm', 'travis', 'coveralls')-->
[![NPM version](https://img.shields.io/npm/v/remark-mos.svg?style=flat-square)](https://www.npmjs.com/package/remark-mos)
[![Build status for master](https://img.shields.io/travis/zkochan/remark-mos/master.svg?style=flat-square)](https://travis-ci.org/zkochan/remark-mos)
[![Test coverage for master](https://img.shields.io/coveralls/zkochan/remark-mos/master.svg?style=flat-square)](https://coveralls.io/r/zkochan/remark-mos?branch=master)
<!--/@-->

<!--@installation()-->
## Installation

This module is installed via npm:

``` sh
npm install remark-mos --save
```
<!--/@-->

## Usage

<!--@example('./example.js')-->
``` js
'use strict'
const remark = require('@zkochan/remark')
const remarkMos = require('remark-mos')

const scope = {
  foo: () => 'Hello world!',
}

const processor = remark.use(remarkMos, { scope, useStrict: true })

const markdown = '<!--@foo()--><!--/@-->'
processor.process(markdown).then(res => console.log(res.result))
//> <!--@foo()-->
//  Hello world!
//  <!--/@-->
```
<!--/@-->

<!--@license()-->
## License

[MIT](./LICENSE) © [Zoltan Kochan](http://kochan.io)
<!--/@-->

* * *

<!--@dependencies({ shield: 'flat-square' })-->
## Dependencies [![Dependency status for master](https://img.shields.io/david/zkochan/remark-mos/master.svg?style=flat-square)](https://david-dm.org/zkochan/remark-mos/master)

- [run-async](https://github.com/sboudrias/run-async): Utility method to run function either synchronously or asynchronously using the common `this.async()` style.

<!--/@-->

<!--@devDependencies({ shield: 'flat-square' })-->
## Dev Dependencies [![devDependency status for master](https://img.shields.io/david/dev/zkochan/remark-mos/master.svg?style=flat-square)](https://david-dm.org/zkochan/remark-mos/master#info=devDependencies)

- [@zkochan/remark](https://github.com/wooorm/remark): Markdown processor powered by plugins
- [chai](https://github.com/chaijs/chai): BDD/TDD assertion library for node.js and the browser. Test framework agnostic.
- [cz-conventional-changelog](https://github.com/commitizen/cz-conventional-changelog): Commitizen adapter following the conventional-changelog format.
- [eslint](https://github.com/eslint/eslint): An AST-based pattern checker for JavaScript.
- [eslint-config-standard](https://github.com/feross/eslint-config-standard): JavaScript Standard Style - ESLint Shareable Config
- [eslint-plugin-promise](https://github.com/xjamundx/eslint-plugin-promise): Enforce best practices for JavaScript promises
- [eslint-plugin-standard](https://github.com/xjamundx/eslint-plugin-standard): ESlint Plugin for the Standard Linter
- [ghooks](https://github.com/gtramontina/ghooks): Simple git hooks
- [istanbul](https://github.com/gotwarlost/istanbul): Yet another JS code coverage tool that computes statement, line, function and branch coverage with module loader hooks to transparently add coverage when running tests. Supports all JS coverage use cases including unit tests, server side functional tests
- [mocha](https://github.com/mochajs/mocha): simple, flexible, fun test framework
- [mos](https://github.com/zkochan/mos): A pluggable module that injects content into your markdown files via hidden JavaScript snippets
- [semantic-release](https://github.com/semantic-release/semantic-release): automated semver compliant package publishing
- [tonic-example](https://github.com/zkochan/tonic-example): Tonic example generator
- [validate-commit-msg](https://github.com/kentcdodds/validate-commit-msg): Script to validate a commit message follows the conventional changelog standard

<!--/@-->
