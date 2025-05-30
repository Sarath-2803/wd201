const request = require("supertest");

const db = require("../models/index");
const app = require("../app");

var cheerio = require("cheerio");

let server, agent;

function extractCsrfToken(res) {
  var $ = cheerio.load(res.text);
  return $('[name="_csrf"]').val();
}

const login = async (agent, username, password) => {
  let res = await agent.get("/login");
  let csrfToken = extractCsrfToken(res);
  res = await agent.post("/session").send({
    email: username,
    password: password,
    _csrf: csrfToken,
  });
};

describe("Todo Application", function () {
  beforeAll(async () => {
    await db.sequelize.sync({ force: true });
    server = app.listen(4000, () => {});
    agent = request.agent(server);
  });

  afterAll(async () => {
    try {
      await db.sequelize.close();
      await server.close();
    } catch (error) {
      console.log(error);
    }
  });

  test("signup functionality", async () => {
    let res = await agent.get("/signup");
    let csrfToken = extractCsrfToken(res);
    res = await agent.post("/users").send({
      firstNam: "test",
      lastName: "user",
      email: "testuser@gmail.com",
      password: "testpassword",
      _csrf: csrfToken,
    });
    expect(res.statusCode).toBe(302);
  });

  test("signout functionality", async () => {
    let res = await agent.get("/todos");
    expect(res.statusCode).toBe(200);
    res = await agent.get("/signout");
    expect(res.statusCode).toBe(302);
    res = await agent.get("/todos");
    expect(res.statusCode).toBe(302);
  });

  test("Creates a todo and responds with json at /todos POST endpoint", async () => {
    const agent = request.agent(server);
    await login(agent, "testuser@gmail.com", "testpassword");
    const res = await agent.get("/todos");
    const csrfToken = extractCsrfToken(res);
    const response = await agent.post("/todos").send({
      title: "Buy milk",
      dueDate: new Date().toISOString(),
      completed: false,
      _csrf: csrfToken,
    });
    expect(response.statusCode).toBe(302);
  });

  test("Marks a todo with the given ID as complete", async () => {
    const agent = request.agent(server);
    await login(agent, "testuser@gmail.com", "testpassword");
    // Fetch the CSRF token
    let res = await agent.get("/todos");
    let csrfToken = extractCsrfToken(res);

    // Create a new todo
    const response = await agent.post("/todos").send({
      title: "Buy milk",
      dueDate: new Date().toISOString(),
      completed: false,
      _csrf: csrfToken,
    });
    expect(response.statusCode).toBe(302); // Ensure the todo is created successfully

    // Fetch all todos as JSON
    const groundResponse = await agent
      .get("/todos")
      .set("Accept", "application/json");
    const parsedGroundResponse = JSON.parse(groundResponse.text);

    // Get the latest todo (assuming the last todo in the list is the one just created)
    const latestTodo = parsedGroundResponse[parsedGroundResponse.length - 1];

    // Mark the latest todo as complete
    res = await agent.get("/todos");
    csrfToken = extractCsrfToken(res);
    const markCompleteResponse = await agent
      .put(`/todos/${latestTodo.id}`)
      .send({ completed: true, _csrf: csrfToken });

    const parsedUpdateResponse = JSON.parse(markCompleteResponse.text);
    expect(parsedUpdateResponse.completed).toBe(true); // Ensure the todo is marked as complete
  });

  test("Fetches all todos in the database using /todos endpoint", async () => {
    const agent = request.agent(server);
    await login(agent, "testuser@gmail.com", "testpassword");
    // await agent.post("/todos").send({
    //   title: "Buy xbox",
    //   dueDate: new Date().toISOString(),
    //   completed: false,
    // });
    const res = await agent.get("/todos");
    const csrfToken = extractCsrfToken(res);
    const res1 = await agent.post("/todos").send({
      title: "Buy milk",
      dueDate: new Date().toISOString(),
      completed: false,
      _csrf: csrfToken,
    });

    // const res2=await agent.post("/todos").send({
    //   title: "Buy ps3",
    //   dueDate: new Date().toISOString(),
    //   completed: false,
    //   "_csrf": csrfToken,
    // });
    // console.log("Response for Buy ps3:", res2.statusCode);

    const response = await agent
      .get("/todos")
      .set("Accept", "application/json");
    const parsedResponse = JSON.parse(response.text);
    console.log(parsedResponse);
    expect(parsedResponse.length).toBe(3);
  });

  test("Deletes a todo with the given ID if it exists and sends a boolean response", async () => {
    const agent = request.agent(server);
    await login(agent, "testuser@gmail.com", "testpassword");
    // Fetch CSRF token
    let res = await agent.get("/todos");
    let csrfToken = extractCsrfToken(res);

    // Create a new todo
    await agent.post("/todos").send({
      title: "Buy milk",
      dueDate: new Date().toISOString(),
      completed: false,
      _csrf: csrfToken,
    });

    // Fetch all todos as JSON
    const response = await agent
      .get("/todos")
      .set("Accept", "application/json");
    const parsedResponse = JSON.parse(response.text);

    // Ensure todos exist
    expect(parsedResponse.length).toBeGreaterThan(0);

    // Get the latest todo (assuming the last todo in the list is the one just created)
    const latestTodo = parsedResponse[parsedResponse.length - 1];

    // Fetch CSRF token again
    res = await agent.get("/todos");
    csrfToken = extractCsrfToken(res);

    // Delete the latest todo
    const deleteResponse = await agent
      .delete(`/todos/${latestTodo.id}`)
      .send({ _csrf: csrfToken });
    expect(deleteResponse.statusCode).toBe(200);

    // Verify the todo was deleted
    const afterDeleteResponse = await agent
      .get("/todos")
      .set("Accept", "application/json");
    const parsedAfterDeleteResponse = JSON.parse(afterDeleteResponse.text);

    // Ensure the deleted todo is no longer present
    const deletedTodo = parsedAfterDeleteResponse.find(
      (todo) => todo.id === latestTodo.id
    );
    expect(deletedTodo).toBeUndefined();
  });

  // test("Deletes a todo with the given ID if it exists and sends a boolean response", async () => {
  //   let res = await agent.get("/todos");
  //   let csrfToken = extractCsrfToken(res);

  //   await agent.post("/todos").send({
  //     title: "Buy milk",
  //     dueDate: new Date().toISOString(),
  //     completed: false,
  //     _csrf: csrfToken,
  //   });

  //   const response = await agent.get("/todos").set("Accept", "application/json");
  //   const parsedResponse = JSON.parse(response.text);
  //   expect(parsedResponse.dueToday).toBeDefined();

  //   const dueTodayCount = parsedResponse.dueToday.length;
  //   const latestTodo = parsedResponse.dueToday[dueTodayCount - 1];

  //   res = await agent.get("/todos");
  //   csrfToken = extractCsrfToken(res);

  //   const deleteResponse = await agent.delete(`/todos/${latestTodo.id}`).send({ "_csrf": csrfToken });
  //   expect(deleteResponse.statusCode).toBe(200);
  // const deleteResponse = await agent.delete(`/todos/${todoID}`).send({ "_csrf": csrfToken });
  // console.log("Delete Response:", deleteResponse.statusCode, deleteResponse.text);

  // expect(deleteResponse.statusCode).toBe(200);
  // expect(deleteResponse.text).toBe("true");
  // });
});
