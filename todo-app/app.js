/* eslint-disable no-unused-vars */
const { req, res } = require("express");
const express = require("express");
const app = express();
const { Todo } = require("./models");
const bodyParser = require("body-parser");
app.use(bodyParser.json());

app.get("/todos", (req, res) => {
  //res.send('Hello World!');
  console.log("Todo list");
});

app.post("/todos", async (req, res) => {
  console.log("creating a Todo", req.body);
  try {
    const todo = await Todo.addTodo({
      title: req.body.title,
      dueDate: req.body.dueDate,
      completed: false,
    });
    return res.json(todo);
  } catch (error) {
    console.error(error);
    res.status(422).json(error);
  }
});

app.put("/todos/:id/markAsCompleted", async (req, res) => {
  console.log("update todo with id", req.params.id);
  const todo = await Todo.findByPk(req.params.id);
  try {
    const updatedTodo = await todo.markAsCompleted();
    return res.json(updatedTodo);
  } catch (error) {
    console.error(error);
    res.status(422).json(error);
  }
});

app.delete("/todos/:id", (req, res) => {
  console.log("delete todo with id", req.params.id);
});

module.exports = app;
