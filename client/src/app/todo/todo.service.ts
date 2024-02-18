import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Todo } from './todo';
import { map } from 'rxjs/operators';

/**
 * Service that provides the interface for getting information
 * about `Users` from the server.
 */
@Injectable({
  providedIn: `root`
})
export class TodoService {
  // The URL for the todos part of the server API.
  readonly todoUrl: string = environment.apiUrl + 'todos';

  // The private `HttpClient` is *injected* into the service
  // More information in user.service.ts
  constructor(private httpClient: HttpClient) {
  }

  /**
   * Get all the todos from the server, filtered by the information
   * in the `filters` map.
   *
   * @param filters a map that allows us to specify a target title, description, or category to filter by, or any combination of those
   * @returns an `Observable` of an array of `Todos`.
   */
  getTodos(filters?: { owner?: string; status?: boolean; body?: string; category?: string; limit?: number}): Observable<Todo[]> {
    let httpParams: HttpParams = new HttpParams();
    if (filters) {
      if (filters.owner) {
        httpParams = httpParams.set('owner', filters.owner);
      }
      if (filters.status) {
        httpParams = httpParams.set('status', filters.status);
      }
      if (filters.body) {
        httpParams = httpParams.set('body', filters.body);
      }
      if (filters.category) {
        httpParams = httpParams.set('category', filters.category);
      }
      if (filters.limit) {
        httpParams = httpParams.set('limit', filters.limit);
      }

    }
    return this.httpClient.get<Todo[]>(this.todoUrl, {
      params: httpParams,
    });
  }
/**
 * @param id The ID of the Todo to get
 * @returns an `Observable` of the `Todo` with the given ID
 */
  getTodoById(id: string): Observable<Todo> {
    return this.httpClient.get<Todo>(this.todoUrl + '/' + id);
  }

  filterTodos(todos: Todo[], filters: { owner?: string; status?: boolean; body?: string; category?: string; limit?: number}): Todo[] {
    let filteredTodos = todos;
    if (filters) {
      if (filters.owner) {
        filters.owner = filters.owner.toLowerCase();
        filteredTodos = filteredTodos.filter(todo => todo.owner.toLowerCase().indexOf(filters.owner) !== -1);
      }
      // make sure the status filter is working!
      if (filters.status !== undefined) {
        filteredTodos = filteredTodos.filter(todo => todo.status === filters.status);
      }
      if (filters.body) {
        filters.body = filters.body.toLowerCase();
        filteredTodos = filteredTodos.filter(todo => todo.body.toLowerCase().indexOf(filters.body) !== -1);
      }
      if (filters.category) {
        filters.category = filters.category.toLowerCase();
        filteredTodos = filteredTodos.filter(todo => todo.category.indexOf(filters.category) !== -1);
      }
      if (filters.limit) {
        filteredTodos = filteredTodos.slice(0, filters.limit);
      }

    }
    return filteredTodos;
  }
  addTodo(newTodo: Partial<Todo>): Observable<string> {
    // Send post request to add a new user with the user data as the body.
    return this.httpClient.post<{id: string}>(this.todoUrl, newTodo).pipe(map(res => res.id));
  }
}
