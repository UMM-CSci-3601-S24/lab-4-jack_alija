import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Todo } from './todo';
import { TodoService } from './todo.service';

describe('TodoService', () => {
  // A small collection of test todos
  const testTodos: Todo[] = [
    {
      _id: "58895985a22c04e761776d54",
      owner: "Blanche",
      status: false,
      body: "In sunt ex non tempor cillum commodo amet incididunt anim qui commodo quis. Cillum non labore ex sint esse.",
      category: "software design"
    },
    {
      _id: "58895985c1849992336c219b",
      owner: "Fry",
      status: false,
      body: "Ipsum esse est ullamco magna tempor anim laborum non officia deserunt veniam commodo. Aute minim incididunt ex commodo.",
      category: "video games"
    },
    {
      _id: "58895985ae3b752b124e7663",
      owner: "Fry",
      status: true,
      body: "Ullamco irure laborum magna dolor non. Anim occaecat adipisicing cillum eu magna in.",
      category: "homework"
    },
    {
      _id: "58895985186754887e0381f5",
      owner: "Blanche",
      status: true,
      body: "Incididunt enim ea sit qui esse magna eu. Nisi sunt exercitation est Lorem consectetur incididunt cupidatat laboris commodo veniam do ut sint.",
      category: "software design"
    }
  ];
  let todoService: TodoService;
  // These are used to mock the HTTP requests so that we (a) don't have to
  // have the server running and (b) we can check exactly which HTTP
  // requests were made to ensure that we're making the correct requests.
  let httpClient: HttpClient;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    // Set up the mock handling of the HTTP requests
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });
    httpClient = TestBed.inject(HttpClient);
    httpTestingController = TestBed.inject(HttpTestingController);
    // Construct an instance of the service with the mock
    // HTTP client.
    todoService = new TodoService(httpClient);
  });

  afterEach(() => {
    // After every test, assert that there are no more pending requests.
    httpTestingController.verify();
  });

  describe('getTodos()', () => {
    it('calls api/todos', () => {
      // Assert that the users we get from this call to getTodos()
      // should be our set of test users. This is what we expect to
      // be the response for this call.
      todoService.getTodos().subscribe(
        todos => expect(todos).toBe(testTodos)
      );

      // Specify that (exactly) one request will be made to the specified URL.
      const req = httpTestingController.expectOne(todoService.todoUrl);
      // Check that the request made to that URL was a GET request.
      expect(req.request.method).toEqual('GET');
      // Respond with this data when the GET request is made.
      req.flush(testTodos);
    });
  });

  describe('getTodoById()', () => {
    it('calls api/todos/id', () => {
      const targetTodo: Todo = testTodos[1];
      const targetId: string = targetTodo._id;
      todoService.getTodoById(targetId).subscribe(
        todo => expect(todo).toBe(targetTodo)
      );

      const expectedUrl: string = todoService.todoUrl + '/' + targetId;
      const req = httpTestingController.expectOne(expectedUrl);
      expect(req.request.method).toEqual('GET');
      req.flush(targetTodo);
    });

  });

  describe('filterTodos()', () => {
    it('filters by owner', () => {
      const owner = 'Blanche';
      const filteredTodos = todoService.filterTodos(testTodos, { owner });
      expect(filteredTodos.length).toBe(2);
      expect(filteredTodos[0].owner).toBe(owner);
      expect(filteredTodos[1].owner).toBe(owner);
    });

    it('filters by status', () => {
      const status = false;
      const filteredTodos = todoService.filterTodos(testTodos, { status });
      expect(filteredTodos.length).toBe(2);
      expect(filteredTodos[0].status).toBe(status);
      expect(filteredTodos[1].status).toBe(status);
    });

    it('filters by category', () => {
      const category = 'software design';
      const filteredTodos = todoService.filterTodos(testTodos, { category });
      expect(filteredTodos.length).toBe(2);
      expect(filteredTodos[0].category).toBe(category);
      expect(filteredTodos[1].category).toBe(category);
    });

    it('filters by limit', () => {
      const limit = 2;
      const filteredTodos = todoService.filterTodos(testTodos, { limit });
      expect(filteredTodos.length).toBe(2);
    });

    it('filters by owner and status', () => {
      const owner = 'Blanche';
      const status = false;
      const filteredTodos = todoService.filterTodos(testTodos, { owner, status });
      expect(filteredTodos.length).toBe(1);
      expect(filteredTodos[0].owner).toBe(owner);
      expect(filteredTodos[0].status).toBe(status);
    });

    it('filters by body', () => {
      const body = "In sunt ex non tempor cillum commodo amet incididunt anim qui commodo quis. Cillum non labore ex sint esse.";
      const filteredTodos = todoService.filterTodos(testTodos, { body });
      expect(filteredTodos.length).toBe(1);
    });

    it('correctly calls api/todos with multiple filter parameters', () => {
      todoService.getTodos({owner: "Blanche",
                            category: "software design",
                            status: true,
                            body: "Incididunt enim ea sit qui esse magna eu. Nisi sunt exercitation est Lorem consectetur incididunt cupidatat laboris commodo veniam do ut sint.",
                            limit: 5}).subscribe(
        todos => expect(todos).toBe(testTodos)
      );

      // Specify that (exactly) one request will be made to the specified URL with the role parameter.
      const req = httpTestingController.expectOne(
        (request) => request.url.startsWith(todoService.todoUrl)
          && request.params.has('owner') && request.params.has('category') && request.params.has('status')
      );

      // Check that the request made to that URL was a GET request.
      expect(req.request.method).toEqual('GET');

      // Check that the role, company, and age parameters are correct
      expect(req.request.params.get('owner')).toEqual('Blanche');
      expect(req.request.params.get('category')).toEqual('software design');
      expect(req.request.params.get('body')).toEqual("Incididunt enim ea sit qui esse magna eu. Nisi sunt exercitation est Lorem consectetur incididunt cupidatat laboris commodo veniam do ut sint.");

      req.flush(testTodos);
    });
  });
});
