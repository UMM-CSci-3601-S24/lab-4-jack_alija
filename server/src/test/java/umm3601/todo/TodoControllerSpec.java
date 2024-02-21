package umm3601.todo;

import static com.mongodb.client.model.Filters.eq;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.io.IOException;
import java.security.NoSuchAlgorithmException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.bson.Document;
import org.bson.types.ObjectId;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.MockitoAnnotations;
import com.mongodb.MongoClientSettings;
import com.mongodb.ServerAddress;
import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoClients;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;

import io.javalin.Javalin;
import io.javalin.http.BadRequestResponse;
import io.javalin.http.Context;
import io.javalin.http.HttpStatus;
import io.javalin.http.NotFoundResponse;
import io.javalin.json.JavalinJackson;
import io.javalin.validation.BodyValidator;
import io.javalin.validation.Validator;
/**
 * Tests the logic of the UserController
 *
 * @throws IOException
 */
// The tests here include a ton of "magic numbers" (numeric constants).
// It wasn't clear to me that giving all of them names would actually
// help things. The fact that it wasn't obvious what to call some
// of them says a lot. Maybe what this ultimately means is that
// these tests can/should be restructured so the constants (there are
// also a lot of "magic strings" that Checkstyle doesn't actually
// flag as a problem) make more sense.
@SuppressWarnings({ "MagicNumber" })
class TodoControllerSpec {

  // An instance of the controller we're testing that is prepared in
  // `setupEach()`, and then exercised in the various tests below.
  private TodoController todoController;

  // A Mongo object ID that is initialized in `setupEach()` and used
  // in a few of the tests. It isn't used all that often, though,
  // which suggests that maybe we should extract the tests that
  // care about it into their own spec file?
  private ObjectId samsId;

  // The client and database that will be used
  // for all the tests in this spec file.
  private static MongoClient mongoClient;
  private static MongoDatabase db;

  // Used to translate between JSON and POJOs.
  private static JavalinJackson javalinJackson = new JavalinJackson();

  @Mock
  private Context ctx;

  @Captor
  private ArgumentCaptor<ArrayList<Todo>> todoArrayListCaptor;

  @Captor
  private ArgumentCaptor<Todo> todoCaptor;

  @Captor
  private ArgumentCaptor<Map<String, String>> mapCaptor;

/**
   * Sets up (the connection to the) DB once; that connection and DB will
   * then be (re)used for all the tests, and closed in the `teardown()`
   * method. It's somewhat expensive to establish a connection to the
   * database, and there are usually limits to how many connections
   * a database will support at once. Limiting ourselves to a single
   * connection that will be shared across all the tests in this spec
   * file helps both speed things up and reduce the load on the DB
   * engine.
   */
  @BeforeAll
  static void setupAll() {
    String mongoAddr = System.getenv().getOrDefault("MONGO_ADDR", "localhost");

    mongoClient = MongoClients.create(
        MongoClientSettings.builder()
            .applyToClusterSettings(builder -> builder.hosts(Arrays.asList(new ServerAddress(mongoAddr))))
            .build());
    db = mongoClient.getDatabase("test");
  }

  @AfterAll
  static void teardown() {
    db.drop();
    mongoClient.close();
  }

  @BeforeEach
  void setupEach() throws IOException {
    // Reset our mock context and argument captor (declared with Mockito annotations
    // @Mock and @Captor)
    MockitoAnnotations.openMocks(this);

    // setup the database
    MongoCollection<Document> todoDocuments = db.getCollection("todos");
    todoDocuments.drop();
    List<Document> testTodos = new ArrayList<>();
    testTodos.add(
        new Document()
            .append("owner", "Sam")
            .append("status", false)
            .append("category", "homework")
            .append("body", "I have to do my homework"));
    testTodos.add(
        new Document()
            .append("owner", "Jamie")
            .append("status", true)
            .append("category", "groceries")
            .append("body", "I have to buy groceries"));
    testTodos.add(
        new Document()
            .append("owner", "nullFrodo")
            .append("status", false)
            .append("category", "homework")
            .append("body", "I have to do my homework"));
    samsId = new ObjectId();
    Document sam = new Document()
        .append("_id", samsId)
        .append("owner", "Sam")
        .append("status", false)
        .append("category", "homework")
        .append("body", "I have to do my homework");

    todoDocuments.insertMany(testTodos);
    todoDocuments.insertOne(sam);

    todoController = new TodoController(db);
  }

  @Test
  public void canBuildController() throws IOException {
    Javalin mockServer = Mockito.mock(Javalin.class);
    todoController.addRoutes(mockServer);
    verify(mockServer, Mockito.atLeast(2)).get(any(), any());
  }

  @Test
  void canGetAllTodos() throws IOException {
    when(ctx.queryParamMap()).thenReturn(Collections.emptyMap());
    todoController.getTodos(ctx);
    verify(ctx).json(todoArrayListCaptor.capture());
    verify(ctx).status(HttpStatus.OK);
    assertEquals(db.getCollection("todos").countDocuments(), todoArrayListCaptor.getValue().size());
  }

  @Test
  void canGetTodoById() throws IOException {
    String idString = samsId.toHexString();
    when(ctx.pathParam("id")).thenReturn(idString);
    todoController.getTodo(ctx);
    verify(ctx).json(todoCaptor.capture());
    verify(ctx).status(HttpStatus.OK);
    assertEquals("Sam", todoCaptor.getValue().owner);
  }

  @Test
  void getTodoByBadId() throws IOException {
    when(ctx.pathParam("id")).thenReturn("badID");
    assertThrows(BadRequestResponse.class, () -> {
      todoController.getTodo(ctx);
    });
  }

  @Test
  void getTodoByNonexistentId() throws IOException {
    when(ctx.pathParam("id")).thenReturn(new ObjectId().toHexString());
    assertThrows(NotFoundResponse.class, () -> {
      todoController.getTodo(ctx);
    });
  }

  // testing the get owner
  @Test
  void canGetOwner() throws IOException {
    Map<String, List<String>> queryParams = new HashMap<>();
    queryParams.put(TodoController.OWNER_KEY, Arrays.asList(new String[]{"Sam"}));
    when(ctx.queryParamMap()).thenReturn(queryParams);
    when(ctx.queryParamAsClass(TodoController.OWNER_KEY, String.class))
        .thenReturn(Validator.create(String.class, "Sam", TodoController.OWNER_KEY));

    todoController.getTodos(ctx);

    verify(ctx).json(todoArrayListCaptor.capture());
    verify(ctx).status(HttpStatus.OK);
    assertEquals(2, todoArrayListCaptor.getValue().size());
    for (Todo todo : todoArrayListCaptor.getValue()) {
      assertEquals("Sam", todo.owner);
    }
  }

  // testing the get owner
  @Test
  void canGetCategory() throws IOException {
    Map<String, List<String>> queryParams = new HashMap<>();
    queryParams.put(TodoController.CATEGORY_KEY, Arrays.asList(new String[]{"Software Design"}));
    when(ctx.queryParamMap()).thenReturn(queryParams);
    when(ctx.queryParamAsClass(TodoController.CATEGORY_KEY, String.class))
        .thenReturn(Validator.create(String.class, "Software Design", TodoController.CATEGORY_KEY));

    todoController.getTodos(ctx);

    verify(ctx).json(todoArrayListCaptor.capture());
    verify(ctx).status(HttpStatus.OK);
    assertEquals(0, todoArrayListCaptor.getValue().size());
    for (Todo todo : todoArrayListCaptor.getValue()) {
      assertEquals("Software Design", todo.owner);
    }
  }

  // testing sortby
  @Test
  void canSortByOwner() throws IOException {
    Map<String, List<String>> queryParams = new HashMap<>();
    queryParams.put(TodoController.SORT_ORDER_KEY, Arrays.asList(new String[]{"owner"}));
    when(ctx.queryParamMap()).thenReturn(queryParams);
    when(ctx.queryParamAsClass(TodoController.SORT_ORDER_KEY, String.class))
        .thenReturn(Validator.create(String.class, "owner", TodoController.SORT_ORDER_KEY));

    todoController.getTodos(ctx);

    verify(ctx).json(todoArrayListCaptor.capture());
    verify(ctx).status(HttpStatus.OK);
    assertEquals(4, todoArrayListCaptor.getValue().size());
    for (int i = 0; i < todoArrayListCaptor.getValue().size() - 1; i++) {
      assertTrue(todoArrayListCaptor.getValue().get(i).owner
      .compareTo(todoArrayListCaptor.getValue().get(i + 1).owner) <= 0);
    }
  }

  // testing getTodosGroupedByCategory
  @Test
  void canGetTodosGroupedByCategory() throws IOException {
    todoController.getTodosGroupedByCategory(ctx);
    verify(ctx).json(todoArrayListCaptor.capture());
    verify(ctx).status(HttpStatus.OK);
    assertEquals(2, todoArrayListCaptor.getValue().size());
  }

  // testing addTodo
  @Test
  void addTodo() throws IOException {
    String testNewTodo = """
        {
          "owner": "testOwner",
          "status": true,
          "category": "testCategory",
          "body": "testBody"
        }
        """;
    when(ctx.bodyValidator(Todo.class))
    .then(value -> new BodyValidator<>(testNewTodo, Todo.class, javalinJackson));

    todoController.addNewTodo(ctx);
    verify(ctx).json(mapCaptor.capture());
    verify(ctx).status(HttpStatus.CREATED);

    Document addedTodo = db.getCollection("todos")
    .find(eq("owner", "testOwner")).first();

    assertNotEquals("", addedTodo.get("_id"));
    assertEquals("testOwner", addedTodo.get("owner"));
    assertEquals(true, addedTodo.get("status"));
    assertEquals("testCategory", addedTodo.get("category"));
    assertEquals("testBody", addedTodo.get("body"));
  }

  // testing md5
    @Test
    void md5() throws NoSuchAlgorithmException {
      String testString = "testString";
      String testStringMD;
      testStringMD = todoController.md5(testString);
      assertEquals("d67c5cbf5b01c9f91932e3b8def5e5f8", testStringMD);
  };
}


