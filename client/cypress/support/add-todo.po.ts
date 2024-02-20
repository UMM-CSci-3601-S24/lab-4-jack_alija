import {Todo} from 'src/app/todo/todo';

export class AddTodoPage {

  private readonly url = '/todos/new';
  private readonly title = '.add-todo-title';
  private readonly button = '[data-test=confirmAddTodoButton]';
  private readonly snackBar = '.mat-mdc-simple-snack-bar';
  private readonly ownerFieldName = 'owner';
  private readonly statusFieldName = 'status';
  private readonly bodyFieldName = 'body';
  private readonly categoryFieldName = 'category';
  private readonly formFieldSelector = `mat-form-field`;
  private readonly dropDownSelector = `mat-option`;

  navigateTo() {
    return cy.visit(this.url);
  }

  getTitle() {
    return cy.get(this.title);
  }

  addTodoButton() {
    return cy.get(this.button);
  }

  selectMatSelectValue(select: Cypress.Chainable, value: string) {
    // Find and click the drop down
    return select.click()
      // Select and click the desired value from the resulting menu
      .get(`${this.dropDownSelector}[value="${value}"]`).click();
  }

  getFormField(fieldName: string) {
    return cy.get(`${this.formFieldSelector} [formcontrolname=${fieldName}]`);
  }

  getSnackBar() {
    return cy.get(this.snackBar);
  }

  addNewTodo(newTodo: Todo) {
    this.getFormField(this.ownerFieldName).type(newTodo.owner);
    this.getFormField(this.statusFieldName).type(newTodo.status.toString());
    this.getFormField(this.bodyFieldName).type(newTodo.body);
    this.getFormField(this.categoryFieldName).type(newTodo.category);
    return this.addTodoButton().click();
  }

}
