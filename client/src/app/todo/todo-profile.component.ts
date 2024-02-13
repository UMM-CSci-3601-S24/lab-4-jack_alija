import { NgIf } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { Subject, map, switchMap, takeUntil } from 'rxjs';
import { Todo } from './todo';
import { TodoService } from './todo.service';
import { TodoCardComponent } from './todo-card.component';

@Component({
    selector: 'app-todo-profile',
    templateUrl: './todo-profile.component.html',
    styleUrls: ['./todo-profile.component.scss'],
    standalone: true,
    imports: [NgIf, TodoCardComponent, MatCardModule]
})
export class TodoProfileComponent implements OnInit, OnDestroy {

  todo: Todo;
  error: { help: string, httpResponse: string, message: string }

  private ngUnsubscribe = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private todoService: TodoService) {}

  ngOnInit(): void {
    this.route.paramMap.pipe(
      map((paramMap: ParamMap) => paramMap.get('id')),
      switchMap((id: string) => this.todoService.getTodoById(id)),
      takeUntil(this.ngUnsubscribe)
    ).subscribe({
      next: todo => this.todo = todo,
      error: err => this.error = err
    });
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

}
