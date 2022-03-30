/* eslint-disable no-unused-vars */
// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })

// if you want to debug when any test fails
// You likely want to put this in a support file,
// or at the top of an individual spec file
Cypress.on('fail', (error, runnable) => {
  // eslint-disable-next-line no-debugger
  debugger;

  // we now have access to the err instance
  // and the mocha runnable this failed on

  throw error; // throw error to have test still fail
});

// Ignore ALL Uncaught Exceptions
Cypress.on('uncaught:exception', (err, runnable) => false);
// returning false here prevents Cypress from failing the test
