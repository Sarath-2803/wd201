/* eslint-disable no-undef */
const req = require("supertest");

const db = require("../models/index");
const app = require("../app");

let server, agent;

describe("Todo test suite", () => {
  beforeAll(async () => {
    await db.sequelize.sync({ force: true });
    server = app.listen(3000, () => {});
    agent = req.agent(server);
  });

  afterAll(async () => {
    await db.sequelize.close();
    server.close();
  });

  test("respond with JSON at /todos", async () => {
    const response = await agent.post("/todos").send({
      title: "Testing Todo",
      dueDate: new Date().toISOString(),
      completed: false,
    });
    expect(response.statusCode).toBe(200);
    expect(response.headers["content-type"]).toBe(
      "application/json; charset=utf-8"
    );
    const parsedResponse = JSON.parse(response.text);
    expect(parsedResponse.id).toBeDefined();
  });

  test("respond with JSON at /todos/:id/markAsCompleted", async () => {
    const response = await agent.post("/todos").send({
      title: "Testing Todo",
      dueDate: new Date().toISOString(),
      completed: false,
    });
    const parsedResponse = JSON.parse(response.text);
    const todoId = parsedResponse.id;
    expect(parsedResponse.completed).toBe(false);

    const markAsCompletedresponse = await agent
      .put(`/todos/${todoId}/markAsCompleted`)
      .send();
    const parsedUpdateResponse = JSON.parse(markAsCompletedresponse.text);
    expect(parsedUpdateResponse.completed).toBe(true);
  });
});
