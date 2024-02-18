package umm3601.todo;

import static com.mongodb.client.model.Filters.eq;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.argThat;
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
import org.mockito.ArgumentMatcher;
import org.mockito.Captor;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.MockitoAnnotations;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonMappingException;
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
import io.javalin.validation.ValidationException;
import io.javalin.validation.Validator;

/**
 * Tests the logic of the TodoController
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

  @Mock
  private Context ctx;

  private TodoController todoController;

  private static MongoClient mongoClient;
  private static MongoDatabase db;

  @BeforeAll
  public static void setUpServer() {
    mongoClient = MongoClients.create(MongoClientSettings.builder()
      .applyToClusterSettings(builder ->
        builder.hosts(Arrays.asList(new ServerAddress("localhost", 27017))))
      .build());

    db = mongoClient.getDatabase("test");
  }

  @AfterAll
  public static void tearDownServer() {
    db.drop();
    mongoClient.close();
  }

  @BeforeEach
  public void setUp() {
    MockitoAnnotations.initMocks(this);
    todoController = new TodoController(db);
  }

  @Test
  public void testGetTodoByID() {
    // Create a new todo
    ObjectId newID = new ObjectId();
    String newIDString = newID.toHexString();
    String text = "Test todo";
    String owner = "Test owner";
    boolean status = false;
    String category = "Test category";

    Document newTodo = new Document()
      .append("_id", newID)
      .append("text", text)
      .append("owner", owner)
      .append("status", status)
      .append("category", category);
    db.getCollection("todos").insertOne(newTodo);

    // Create a context and add the new todo's ID to it
    when(ctx.pathParam("id")).thenReturn(newIDString);

    todoController.getTodoByID(ctx);

    // Verify that the response has the correct ID
    ArgumentCaptor<String> idCaptor = ArgumentCaptor.forClass(String.class);
    verify(ctx).json(idCaptor.capture());

    assertEquals(newIDString, idCaptor.getValue(), "ID in response should match the requested ID");
  }

  @Test
  public void testGetTodoByIDWithInvalidID() {
    // Create a context and add an invalid ID to it
    when(ctx.pathParam("id")).thenReturn("this is not a valid ID");

    assertThrows(BadRequestResponse.class, () -> {
      todoController.getTodoByID(ctx);
    });
  }

  @Test
  public void testGetTodoByIDWithNotFoundID() {
    // Create a context and add a valid ID to it
    when(ctx.pathParam("id")).thenReturn(new ObjectId().toHexString());

    assertThrows(NotFoundResponse.class, () -> {
      todoController.getTodoByID(ctx);
    });
  }

  @Test
  public void testGetTodosByOwner() {
    // Create a new todo
    ObjectId newID = new ObjectId();
    String newIDString = newID.toHexString();
    String text = "Test todo";
    String owner = "Test owner";
    boolean status = false;
    String category = "Test category";

    Document newTodo = new Document()
      .append("_id", newID)
      .append("text", text)
      .append("owner", owner)
      .append("status", status)
      .append("category", category);
    db.getCollection("todos").insertOne(newTodo);

    // Create a context and add the new todo's owner to it
    when(ctx.queryParam("owner")).thenReturn(owner);

    todoController.getTodosByOwner(ctx);

    // Verify that the response has the correct owner
    ArgumentCaptor<String> ownerCaptor = ArgumentCaptor.forClass(String.class);
    verify(ctx).json(ownerCaptor.capture());

    assertEquals(owner, ownerCaptor.getValue(), "Owner in response should match the requested owner");
  }
}
