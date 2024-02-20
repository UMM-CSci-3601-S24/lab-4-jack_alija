import { AddTodoPage } from 'cypress/support/add-todo.po';

describe('Add todo', () => {
  const page = new AddTodoPage();

  beforeEach(() => {
    page.navigateTo();
  });

  it('Should have the correct title', () => {
    page.getTitle().should('have.text', 'New Todo');
  });

  it('Should enable and disable the add todo button', () => {
    // ADD TODO button should be disabled until all the necessary fields
    // are filled. Once the last (`#categoryField`) is filled, then the button should
    // become enabled.
    page.addTodoButton().should('be.disabled');
    page.getFormField('owner').type('test');
    page.addTodoButton().should('be.disabled');
    page.getFormField('status').type('true');
    page.addTodoButton().should('be.disabled');
    page.getFormField('body').type('test');
    page.addTodoButton().should('be.disabled');
    page.getFormField('category').type('test');
    // all the required fields have valid input, then it should be enabled
    page.addTodoButton().should('be.enabled');
  });

  it('Should show error messages for invalid inputs', () => {
    // Before doing anything there shouldn't be an error
    cy.get('[data-test=ownerError]').should('not.exist');
    // Just clicking the owner field without entering anything should cause an error message
    page.getFormField('owner').click().blur();
    cy.get('[data-test=ownerError]').should('exist').and('be.visible');
    // Some more tests for various invalid owner inputs
    page.getFormField('owner').type('J').blur();
    cy.get('[data-test=ownerError]').should('exist').and('be.visible');
    page.getFormField('owner').clear().type('This is a very long name that goes beyond the 50 character limit').blur();
    cy.get('[data-test=ownerError]').should('exist').and('be.visible');
    // Entering a valid owner should remove the error.
    page.getFormField('owner').clear().type('John Smith').blur();
    cy.get('[data-test=ownerError]').should('not.exist');

    // Before doing anything there shouldn't be an error
    cy.get('[data-test=statusError]').should('not.exist');
    // Just clicking the status field without entering anything should cause an error message
    page.getFormField('status').click().blur();
    // Some more tests for various invalid status inputs
    cy.get('[data-test=statusError]').should('exist').and('be.visible');
    page.getFormField('status').type('5').blur();
    cy.get('[data-test=statusError]').should('exist').and('be.visible');
    page.getFormField('status').clear().type('500').blur();
    cy.get('[data-test=statusError]').should('exist').and('be.visible');
    page.getFormField('status').clear().type('asd').blur();
    cy.get('[data-test=statusError]').should('exist').and('be.visible');
    // Entering a valid status should remove the error.
    page.getFormField('status').clear().type('true').blur();
    cy.get('[data-test=statusError]').should('not.exist');

    // Before doing anything there shouldn't be an error
    cy.get('[data-test=bodyError]').should('not.exist');
    // Just clicking the body field without entering anything should cause an error message
    page.getFormField('body').click().blur();
    cy.get('[data]test=bodyError').should('exist').and('be.visible');

    // Before doing anything there shouldn't be an error
    cy.get('[data-test=categoryError]').should('not.exist');
    // Just clicking the category field without entering anything should cause an error message
    page.getFormField('category').click().blur();
    cy.get('[data-test=categoryError]').should('exist').and('be.visible');
    // Some more tests for various invalid category inputs
    page.getFormField('category').type('J').blur();
    cy.get('[data-test=categoryError]').should('exist').and('be.visible');
    page.getFormField('category').clear().type('This is a very long category that goes beyond the 50 character limit').blur();
    cy.get('[data-test=categoryError]').should('exist').and('be.visible');
    // Entering a valid category should remove the error.
    page.getFormField('category').clear().type('John Smith').blur();
    cy.get('[data-test=categoryError]').should('not.exist');
  });
});
