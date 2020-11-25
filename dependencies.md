# Dependencies

This guide describes the dependencies of this repository and their purpose.

## Table of Contents
- [Table of Contents](#table-of-contents)
- [Development Dependencies](#development-dependencies)
  - [Babel](#babel)
  - [commitlint](#commitlint)
  - [Husky](#husky)

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

### Husky

[Husky](https://github.com/typicode/husky#husky) simplifies running scripts in
[Git hooks](https://git-scm.com/book/en/v2/Customizing-Git-Git-Hooks).
