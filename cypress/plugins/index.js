/* eslint-disable import/no-extraneous-dependencies */
/// <reference types="cypress" />
// ***********************************************************
// This example plugins/index.js can be used to load plugins
//
// You can change the location of this file or turn off loading
// the plugins file with the 'pluginsFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/plugins-guide
// ***********************************************************

// This function is called when a project is opened or re-opened (e.g. due to
// the project's config changing)

require('dotenv').config();

const codeCoverageTask = require('@cypress/code-coverage/task');

/**
 * @type {Cypress.PluginConfig}
 */
module.exports = (on, config) => {
  // `config` is the resolved Cypress config

  // Webpack is the default preprocessor for Cypress
  on('file:preprocessor', webpackPreprocessor(options));

  // Enable Code Coverage in Cypress
  codeCoverageTask(on, config);

  // config.env, which is made accessible to tests via `Cypress.env()`
  // eslint-disable-next-line no-param-reassign
  config.env = {
    ...process.env,
    // Don't overwrite existing values set by Cypress (i.e. `codeCoverageTasksRegistered`  via `@cypress/code-coverage/task`)
    ...config.env,
  };

  return config;
};
