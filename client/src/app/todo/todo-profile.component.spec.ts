import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MatCardModule } from '@angular/material/card';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { throwError } from 'rxjs';
import { ActivatedRouteStub } from '../../testing/activated-route-stub';
import { MockTodoService } from '../../testing/todo.service.mock';
import { Todo } from './todo';
import { TodoCardComponent } from './todo-card.component';
import { TodoProfileComponent } from './todo-profile.component';
import { TodoService } from './todo.service';

describe('TodoProfileComponent', () => {
  let component: TodoProfileComponent;
  let fixture: ComponentFixture<TodoProfileComponent>;
  const mockTodoService = new MockTodoService();
  const todoId = '58895985a22c04e761776d54';
  const activatedRoute: ActivatedRouteStub = new ActivatedRouteStub({
    id: todoId
  });

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    imports: [
        RouterTestingModule,
        MatCardModule,
        TodoProfileComponent, TodoCardComponent
    ],
    providers: [
        { provide: TodoService, useValue: mockTodoService },
        { provide: ActivatedRoute, useValue: activatedRoute }
    ]
})
      .compileComponents();
  }
  ));

  beforeEach(() => {
    fixture = TestBed.createComponent(TodoProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should navigate to a specific todo profile', () => {
    const expectedTodo: Todo = MockTodoService.testTodos[0];
    // Setting this should cause anyone subscribing to the paramMap
    // to update. Our `TodoProfileComponent` subscribes to that, so
    // it should update right away.
    activatedRoute.setParamMap({ id: expectedTodo._id });
    expect(component.todo).toEqual(expectedTodo);
  });

  it('should navigate to correct todo when the id parameter changes', () => {
    let expectedTodo: Todo = MockTodoService.testTodos[0];
    // Setting this should cause anyone subscribing to the paramMap
    // to update. Our `TodoProfileComponent` subscribes to that, so
    // it should update right away.
    activatedRoute.setParamMap({ id: expectedTodo._id });
    expect(component.todo).toEqual(expectedTodo);

    expectedTodo = MockTodoService.testTodos[1];
    activatedRoute.setParamMap({ id: expectedTodo._id });
    expect(component.todo).toEqual(expectedTodo);
  });

  it('should handle a todo service error', () => {
    const expectedError = 'This is an error';
    spyOn(mockTodoService, 'getTodoById').and.returnValue(throwError(expectedError));
    activatedRoute.setParamMap({ id: todoId });
  });

  it('should display an error when the todo is not found', () => {
    const expectedError = 'Todo not found';
    spyOn(mockTodoService, 'getTodoById').and.returnValue(throwError(expectedError));
    activatedRoute.setParamMap({ id: todoId });
  });

  it('should display an error when the todo service errors', () => {
    const expectedError = 'This is an error';
    spyOn(mockTodoService, 'getTodoById').and.returnValue(throwError(expectedError));
    activatedRoute.setParamMap({ id: todoId });
  });

  it('should display the todo owner', () => {
    const compiled = fixture.debugElement.nativeElement;
    expect(compiled.querySelector('mat-card-title').textContent).toContain('Blanche');
  });

  it('should display the todo body', () => {
    const compiled = fixture.debugElement.nativeElement;
    expect(compiled.querySelector('mat-card-content').textContent).toContain("In sunt ex non tempor cillum commodo amet incididunt anim qui commodo quis. Cillum non labore ex sint esse.");
  });

  it('should display the todo status', () => {
    const compiled = fixture.debugElement.nativeElement;
    expect(compiled.querySelector('mat-card-subtitle').textContent).toContain('false');
  });

});
