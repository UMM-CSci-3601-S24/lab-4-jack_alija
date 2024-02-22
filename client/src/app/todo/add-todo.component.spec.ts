import { Location } from '@angular/common';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ComponentFixture, TestBed, fakeAsync, flush, tick, waitForAsync } from '@angular/core/testing';
import { AbstractControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of, throwError } from 'rxjs';
import { MockTodoService } from 'src/testing/todo.service.mock';
import { AddTodoComponent } from './add-todo.component';
import { TodoProfileComponent } from './todo-profile.component';
import { TodoService } from './todo.service';

describe('AddTodoComponent', () => {
  let addTodoComponent: AddTodoComponent;
  let addTodoForm: FormGroup;
  let fixture: ComponentFixture<AddTodoComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.overrideProvider(TodoService, { useValue: new MockTodoService() });
    TestBed.configureTestingModule({
    imports: [
        FormsModule,
        ReactiveFormsModule,
        MatSnackBarModule,
        MatCardModule,
        MatFormFieldModule,
        MatSelectModule,
        MatInputModule,
        BrowserAnimationsModule,
        RouterTestingModule,
        AddTodoComponent
    ],
}).compileComponents().catch(error => {
      expect(error).toBeNull();
    });
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddTodoComponent);
    addTodoComponent = fixture.componentInstance;
    fixture.detectChanges();
    addTodoForm = addTodoComponent.addTodoForm;
    expect(addTodoForm).toBeDefined();
    expect(addTodoForm.controls).toBeDefined();
  });

  // Not terribly important; if the component doesn't create
  // successfully that will probably blow up a lot of things.
  // Including it, though, does give us confidence that our
  // our component definitions don't have errors that would
  // prevent them from being successfully constructed.
  it('should create the component and form', () => {
    expect(addTodoComponent).toBeTruthy();
    expect(addTodoForm).toBeTruthy();
  });

  // Confirms that an initial, empty form is *not* valid, so
  // people can't submit an empty form.
  it('form should be invalid when empty', () => {
    expect(addTodoForm.valid).toBeFalsy();
  });

  describe('The owner field', () => {
    let ownerControl: AbstractControl;

    beforeEach(() => {
      ownerControl = addTodoComponent.addTodoForm.controls.owner;
    });

    it('should not allow empty names', () => {
      ownerControl.setValue('');
      expect(ownerControl.valid).toBeFalsy();
    });

    it('should be fine with "Chris Smith"', () => {
      ownerControl.setValue('Chris Smith');
      expect(ownerControl.valid).toBeTruthy();
    });

    it('should fail on single character names', () => {
      ownerControl.setValue('x');
      expect(ownerControl.valid).toBeFalsy();
      // Annoyingly, Angular uses lowercase 'l' here
      // when it's an upper case 'L' in `Validators.minLength(2)`.
      expect(ownerControl.hasError('minlength')).toBeTruthy();
    });

    // In the real world, you'd want to be pretty careful about
    // setting upper limits on things like name lengths just
    // because there are people with really long names.
    it('should fail on really long names', () => {
      ownerControl.setValue('x'.repeat(100));
      expect(ownerControl.valid).toBeFalsy();
      // Annoyingly, Angular uses lowercase 'l' here
      // when it's an upper case 'L' in `Validators.maxLength(2)`.
      expect(ownerControl.hasError('maxlength')).toBeTruthy();
    });

    it('should allow digits in the name', () => {
      ownerControl.setValue('Bad2Th3B0ne');
      expect(ownerControl.valid).toBeTruthy();
    });

    it('should fail if we provide an "existing" name', () => {
      // We're assuming that "abc123" and "123abc" already
      // exist so we disallow them.
      ownerControl.setValue('abc123');
      expect(ownerControl.valid).toBeFalsy();
      expect(ownerControl.hasError('existingName')).toBeTruthy();

      ownerControl.setValue('123abc');
      expect(ownerControl.valid).toBeFalsy();
      expect(ownerControl.hasError('existingName')).toBeTruthy();
    });
  });

  describe('The status field', () => {
    let statusControl: AbstractControl;

    beforeEach(() => {
      statusControl = addTodoComponent.addTodoForm.controls.status;
    });

    it('should not allow empty ages', () => {
      statusControl.setValue('');
      expect(statusControl.valid).toBeFalsy();
    });

    it('should be fine with true', () => {
      statusControl.setValue(true);
      expect(statusControl.valid).toBeTruthy();
    });

    it('should fail on status that are null', () => {
      statusControl.setValue(null);
      expect(statusControl.valid).toBeFalsy();
      expect(statusControl.hasError('min')).toBeFalsy();
    });
  });

  describe('The category field', () => {
    let categoryControl: AbstractControl;

    beforeEach(() => {
      categoryControl = addTodoForm.controls.category;
    });

    it('should not allow empty values', () => {
      categoryControl.setValue('');
      expect(categoryControl.valid).toBeFalsy();
      expect(categoryControl.hasError('required')).toBeTruthy();
    });

    it('should allow "homework"', () => {
      categoryControl.setValue('homework');
      expect(categoryControl.valid).toBeTruthy();
    });

    it('should allow "groceries"', () => {
      categoryControl.setValue('groceries');
      expect(categoryControl.valid).toBeTruthy();
    });

    it('should allow "video game"', () => {
      categoryControl.setValue('video game');
      expect(categoryControl.valid).toBeFalsy();
    });

    it('should allow "software design"', () => {
      categoryControl.setValue('software design');
      expect(categoryControl.valid).toBeTruthy();
    });

    it('should not allow "Supreme Overlord"', () => {
      categoryControl.setValue('Supreme Overlord');
      expect(categoryControl.valid).toBeFalsy();
    });
  });

  describe('getErrorMessage()', () => {
    it('should return the correct error message', () => {
      // The type statement is needed to ensure that `controlName` isn't just any
      // random string, but rather one of the keys of the `addTodoValidationMessages`
      // map in the component.
      let controlName: keyof typeof addTodoComponent.addTodoValidationMessages = 'owner';
      addTodoComponent.addTodoForm.get(controlName).setErrors({'required': true});
      expect(addTodoComponent.getErrorMessage(controlName)).toEqual('Owner is required');

      // We don't need the type statement here because we're not using the
      // same (previously typed) variable. We could use a `let` and the type statement
      // if we wanted to create a new variable, though.
      controlName = 'status';
      addTodoComponent.addTodoForm.get(controlName).setErrors({'required': true});
      expect(addTodoComponent.getErrorMessage(controlName)).toEqual('Email is required');

      controlName = 'status';
      addTodoComponent.addTodoForm.get(controlName).setErrors({'boolean': true});
      expect(addTodoComponent.getErrorMessage(controlName)).toEqual('Email must be formatted properly');
    });

    it('should return "Unknown error" if no error message is found', () => {
      // The type statement is needed to ensure that `controlName` isn't just any
      // random string, but rather one of the keys of the `addTodoValidationMessages`
      // map in the component.
      const controlName: keyof typeof addTodoComponent.addTodoValidationMessages = 'owner';
      addTodoComponent.addTodoForm.get(controlName).setErrors({'unknown': true});
      expect(addTodoComponent.getErrorMessage(controlName)).toEqual('Unknown error');
    });
  })
});

describe('AddTodoComponent#submitForm()', () => {
  let component: AddTodoComponent;
  let fixture: ComponentFixture<AddTodoComponent>;
  let todoService: TodoService;
  let location: Location;

  beforeEach(() => {
    TestBed.overrideProvider(TodoService, { useValue: new MockTodoService() });
    TestBed.configureTestingModule({
    imports: [
        ReactiveFormsModule,
        MatSnackBarModule,
        MatCardModule,
        MatSelectModule,
        MatInputModule,
        BrowserAnimationsModule,
        RouterTestingModule.withRoutes([
            { path: 'todos/1', component: TodoProfileComponent }
        ]),
        HttpClientTestingModule,
        AddTodoComponent, TodoProfileComponent
    ],
}).compileComponents().catch(error => {
      expect(error).toBeNull();
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddTodoComponent);
    component = fixture.componentInstance;
    todoService = TestBed.inject(TodoService);
    location = TestBed.inject(Location);
    // We need to inject the router and the HttpTestingController, but
    // never need to use them. So, we can just inject them into the TestBed
    // and ignore the returned values.
    TestBed.inject(Router);
    TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  beforeEach(() => {
    // Set up the form with valid values.
    // We don't actually have to do this, but it does mean that when we
    // check that `submitForm()` is called with the right arguments below,
    // we have some reason to believe that that wasn't passing "by accident".
    component.addTodoForm.controls.owner.setValue('Chris Smith');
    component.addTodoForm.controls.status.setValue(true);
    component.addTodoForm.controls.body.setValue('Est ullamco consequat consectetur velit dolor qui pariatur proident dolor commodo ex. Nostrud anim consectetur nisi minim');
    component.addTodoForm.controls.category.setValue('homework');
  });

  // The `fakeAsync()` wrapper is necessary because the `submitForm()` method
  // calls `navigate()` on the router, which is an asynchronous operation, and we
  // need to wait (using `tick()`) for that to complete before we can check the
  // new location.
  it('should call addTodo() and handle success response', fakeAsync(() => {
    // This use of `fixture.ngZone.run()` is necessary to avoid a warning when
    // we run the tests. `submitForm()` calls `.navigate()` when it succeeds,
    // and that apparently needs to be run in a separate Angular zone (a concept
    // I don't claim to understand well). The suggestion in this lengthy
    // thread: https://github.com/angular/angular/issues/25837
    // is to wrap the relevant part of the test in an Angular zone, and that
    // does seem to resolve the issue. Some people seem to feel that this is
    // actually a workaround for a bug in Angular, but I'm not clear enough
    // on the issues to know if that's true or not. - Nic
    fixture.ngZone.run(() => {
      // "Spy" on the `.addTodo()` method in the todo service. Here we basically
      // intercept any calls to that method and return a canned response ('1').
      // This means we don't have to worry about the details of the `.addTodo()`,
      // or actually have a server running to receive the HTTP request that
      // `.addTodo()` would typically generate. Note also that the particular values
      // we set up in our form (e.g., 'Chris Smith') are actually ignored
      // thanks to our `spyOn()` call.
      const addTodoSpy = spyOn(todoService, 'addTodo').and.returnValue(of('1'));
      component.submitForm();
      // Check that `.addTodo()` was called with the form's values which we set
      // up above.
      expect(addTodoSpy).toHaveBeenCalledWith(component.addTodoForm.value);
      // Wait for the router to navigate to the new page. This is necessary since
      // navigation is an asynchronous operation.
      tick();
      // Now we can check that the router actually navigated to the right place.
      expect(location.path()).toBe('/todos/1');
      // Flush any pending microtasks. This is necessary to ensure that the
      // timer generated by `fakeAsync()` completes before the test finishes.
      flush();
    });
  }));

  // This doesn't need `fakeAsync()`, `tick()`, or `flush() because the
  // error case doesn't navigate to another page. It just displays an error
  // message in the snackbar. So, we don't need to worry about the asynchronous
  // nature of navigation.
  it('should call addTodo() and handle error response', () => {
    // Save the original path so we can check that it doesn't change.
    const path = location.path();
    // A canned error response to be returned by the spy.
    const errorResponse = { status: 500, message: 'Server error' };
    // "Spy" on the `.addTodo()` method in the todo service. Here we basically
    // intercept any calls to that method and return the error response
    // defined above.
    const addTodoSpy = spyOn(todoService, 'addTodo')
      .and
      .returnValue(throwError(() => errorResponse));
    component.submitForm();
    // Check that `.addTodo()` was called with the form's values which we set
    // up above.
    expect(addTodoSpy).toHaveBeenCalledWith(component.addTodoForm.value);
    // Confirm that we're still at the same path.
    expect(location.path()).toBe(path);
  });
});
