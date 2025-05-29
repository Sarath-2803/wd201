const request = require("supertest");

const db = require("../models/index");
const app = require("../app");

var cheerio = require("cheerio");

let server, agent;

function extractCsrfToken(res) {
  var $ = cheerio.load(res.text);
  return $('[name="_csrf"]').val();
}

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

  test("Creates a todo and responds with json at /todos POST endpoint", async () => {
    const res= await agent.get("/");
    const csrfToken = extractCsrfToken(res);
    const response = await agent.post("/todos").send({
      title: "Buy milk",
      dueDate: new Date().toISOString(),
      completed: false,
      "_csrf": csrfToken,
    });
    expect(response.statusCode).toBe(302);
  });

  test("Marks a todo with the given ID as complete", async () => {
    // Fetch the CSRF token
    let res = await agent.get("/");
    let csrfToken = extractCsrfToken(res);

    // Create a new todo
    const response = await agent.post("/todos").send({
      title: "Buy milk",
      dueDate: new Date().toISOString(),
      completed: false,
      "_csrf": csrfToken,
    });
    expect(response.statusCode).toBe(302); // Ensure the todo is created successfully

    // Fetch all todos as JSON
    const groundResponse = await agent.get("/").set("Accept", "application/json");
    const parsedGroundResponse = JSON.parse(groundResponse.text);

    // Get the latest todo (assuming the last todo in the list is the one just created)
    const latestTodo = parsedGroundResponse[parsedGroundResponse.length - 1];

    // Mark the latest todo as complete
    res = await agent.get("/");
    csrfToken = extractCsrfToken(res);
    const markCompleteResponse = await agent
      .put(`/todos/${latestTodo.id}`)
      .send({completed:true ,"_csrf": csrfToken });

    const parsedUpdateResponse = JSON.parse(markCompleteResponse.text);
    expect(parsedUpdateResponse.completed).toBe(true); // Ensure the todo is marked as complete
  });

  test("Fetches all todos in the database using /todos endpoint", async () => {
    // await agent.post("/todos").send({
    //   title: "Buy xbox",
    //   dueDate: new Date().toISOString(),
    //   completed: false,
    // });
    const res= await agent.get("/");
    const csrfToken = extractCsrfToken(res);
    const res1=await agent.post("/todos").send({
      title: "Buy milk",
      dueDate: new Date().toISOString(),
      completed: false,
      "_csrf": csrfToken,
    });

    // const res2=await agent.post("/todos").send({
    //   title: "Buy ps3",
    //   dueDate: new Date().toISOString(),
    //   completed: false,
    //   "_csrf": csrfToken,
    // });
    // console.log("Response for Buy ps3:", res2.statusCode);

    const response = await agent.get("/todos").set("Accept", "application/json");
    const parsedResponse = JSON.parse(response.text);
    console.log(parsedResponse);
    expect(parsedResponse.length).toBe(3); 
  });

  // test("Deletes a todo with the given ID if it exists and sends a boolean response", async () => {
  //   const res = await agent.get("/");
  //   const csrfToken = extractCsrfToken(res);
  //   console.log("CSRF Token:", csrfToken);

  //   await agent.post("/todos").send({
  //     title: "Buy milk",
  //     dueDate: new Date().toISOString(),
  //     completed: false,
  //     "_csrf": csrfToken,
  //   });

  //   const response = await agent.get("/todos").set("Accept", "application/json");
  //   const parsedResponse = JSON.parse(response.text);
  //   const todoID = parsedResponse[0].id;
  //   console.log("Todo ID to delete:", todoID);

  //   const deleteResponse = await agent.delete(`/todos/${todoID}`).send({ "_csrf": csrfToken });
  //   console.log("Delete Response:", deleteResponse.statusCode, deleteResponse.text);

  //   expect(deleteResponse.statusCode).toBe(200);
  //   expect(deleteResponse.text).toBe("true");
  // });
});
