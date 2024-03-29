import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { TodoService } from './todo.service';
import { MatButtonModule } from '@angular/material/button';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';

import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';

@Component({
    selector: 'app-add-todo',
    templateUrl: './add-todo.component.html',
    styleUrls: ['./add-todo.component.scss'],
    standalone: true,
    imports: [FormsModule, ReactiveFormsModule, MatCardModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatOptionModule, MatButtonModule]
})
export class AddTodoComponent {

  addTodoForm = new FormGroup({
    // We allow alphanumeric input and limit the length for name.
    owner: new FormControl('', Validators.compose([
      Validators.required,
      Validators.minLength(2),
      // In the real world you'd want to be very careful about having
      // an upper limit like this because people can sometimes have
      // very long names. This demonstrates that it's possible, though,
      // to have maximum length limits.
      Validators.maxLength(50),
      (fc) => {
        if (fc.value.toLowerCase() === 'abc123' || fc.value.toLowerCase() === '123abc') {
          return ({existingName: true});
        } else {
          return null;
        }
      },
    ])),

    // Since this is for a company, we need workers to be old enough to work, and probably not older than 200.
    status: new FormControl<boolean>(null, Validators.compose([
      Validators.required
      // In the HTML, we set type="number" on this field. That guarantees that the value of this field is numeric,
      // but not that it's a whole number. (The todo could still type -27.3232, for example.) So, we also need
      // to include this pattern.
    ])),

    // We don't care much about what is in the company field, so we just add it here as part of the form
    // without any particular validation.
    body: new FormControl(''),

    category: new FormControl('homework', Validators.compose([
      Validators.required,
      Validators.pattern('^(homework|groceries|video games|software design)$'),
    ])),
  });


  // We can only display one error at a time,
  // the order the messages are defined in is the order they will display in.
  readonly addTodoValidationMessages = {
    owner: [
      {type: 'required', message: 'Owner is required'},
      {type: 'minlength', message: 'Name must be at least 2 characters long'},
      {type: 'maxlength', message: 'Name cannot be more than 50 characters long'},
      {type: 'existingOwner', message: 'Name has already been taken'}
    ],

    status: [
      {type: 'required', message: 'Email is required'},
      {type: 'boolean', message: 'Email must be formatted properly'},
    ],

    body: [
    ],

    category: [
      { type: 'required', message: 'Category is required' },
      { type: 'pattern', message: 'Category must be Homework, Groceries, Video Games, or Software Design' },
    ]
  };

  constructor(
    private todoService: TodoService,
    private snackBar: MatSnackBar,
    private router: Router) {
  }

  formControlHasError(controlName: string): boolean {
    return this.addTodoForm.get(controlName).invalid &&
      (this.addTodoForm.get(controlName).dirty || this.addTodoForm.get(controlName).touched);
  }

  getErrorMessage(name: keyof typeof this.addTodoValidationMessages): string {
    for(const {type, message} of this.addTodoValidationMessages[name]) {
      if (this.addTodoForm.get(name).hasError(type)) {
        return message;
      }
    }
    return 'Unknown error';
  }

  submitForm() {
    this.todoService.addTodo(this.addTodoForm.value).subscribe({
      next: (newId) => {
        this.snackBar.open(
          `Added todo ${this.addTodoForm.value.owner}`,
          null,
          { duration: 2000 }
        );
        this.router.navigate(['/todos/', newId]);
      },
      error: err => {
        this.snackBar.open(
          `Problem contacting the server – Error Code: ${err.status}\nMessage: ${err.message}`,
          'OK',
          { duration: 5000 }
        );
      },
    });
  }

}
