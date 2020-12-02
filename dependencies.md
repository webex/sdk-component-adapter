# Dependencies

This guide describes the dependencies of this repository and their purpose.

## Table of Contents
- [Table of Contents](#table-of-contents)
- [Development Dependencies](#development-dependencies)
  - [Babel](#babel)
  - [commitlint](#commitlint)
  - [Dotenv](#dotenv)
  - [ESLint](#eslint)
  - [Husky](#husky)
  - [nodemon](#nodemon)
  - [semantic-release](#semantic-release)

### Babel

[Babel](https://babeljs.io)
is a compiler that allows developers to use new JavaScript features that are not yet available in all browsers.

#### Babel Packages

- [@babel/core](https://www.npmjs.com/package/@babel/core):
  Compiler core package
- [@babel/node](https://www.npmjs.com/package/@babel/preset-react):
  Node.js CLI-like that compiles code using Babel before running
- [@babel/preset-env](https://www.npmjs.com/package/@babel/preset-env):
  Pre-set of JavaScript features babel should compile
- [@babel/plugin-transform-runtime](https://www.npmjs.com/package/@babel/plugin-transform-runtime):
  Allows for re-use of Babel's helper code when injected as part of a bundle

### Commitlint

[commitlint](https://commitlint.js.org/)
checks commit messages to make sure they follow
[commit message guidelines](https://github.com/webex/components/blob/master/CONTRIBUTING.md#git-commit).

#### Commitlint Packages

- [@commitlint/cli](https://www.npmjs.com/package/@commitlint/cli):
  commitlint core package
- [@commitlint/config-conventional](https://www.npmjs.com/package/@commitlint/config-conventional):
  commitlint enforcer of [conventional commit](https://conventionalcommits.org/) guidelines

### Dotenv

Dotenv is a zero-dependency module that loads environment variables from a `.env` file into `process.env`.

#### Dotenv Packages

- [dotenv](https://www.npmjs.com/package/dotenv):
  Core package

### ESLint

[ESLint](https://eslint.org/) is a static analysis tool that enforces code styles and patterns.

#### ESLint Packages

- [eslint](https://www.npmjs.com/package/eslint):
  ESLint core package
- [eslint-config-airbnb-base](https://www.npmjs.com/package/eslint-config-airbnb-base):
  Airbnb's
  [JavaScript style guide](https://github.com/airbnb/javascript#airbnb-javascript-style-guide-)
  configurations
- [eslint-plugin-import](https://www.npmjs.com/package/eslint-plugin-import):
  Plugin that enforces import/export styles
- [eslint-plugin-jest](https://www.npmjs.com/package/eslint-plugin-jest):
  Plugin that enforces standard [Jest](https://jestjs.io) styles
- [eslint-plugin-jsdoc](https://www.npmjs.com/package/eslint-plugin-jsdoc):
  Plugin that enforces standard [JSDoc](https://jsdoc.app) styles

### Husky

[Husky](https://github.com/typicode/husky#husky) simplifies running scripts in
[Git hooks](https://git-scm.com/book/en/v2/Customizing-Git-Git-Hooks).

### nodemon

[nodemon](https://nodemon.io/) is a tool that helps develop node.js based applications by
automatically restarting the node application when file changes in the directory are detected.

#### nodemon Packages

- [nodemon](https://www.npmjs.com/package/nodemon):
  CLI core package

### Semantic Release

[semantic-release](https://semantic-release.gitbook.io/semantic-release/)
automates the versioning and release process.
semantic-release using semantic versioning to find the next version.
It also takes care of updating all packages, pushing back to Git and publishing to NPM.

#### Semantic Release Packages

- [semantic-release](https://www.npmjs.com/package/semantic-release):
  semantic-release core package
- [@semantic-release/changelog](https://www.npmjs.com/package/@semantic-release/changelog):
  Plugin to generate the changelog
- [@semantic-release/git](https://www.npmjs.com/package/@semantic-release/git):
  Plugin to commit release assets into a Git repository
