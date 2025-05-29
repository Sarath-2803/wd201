const express = require("express");
var csurf = require("tiny-csrf");
var cookieParser = require("cookie-parser");
const app = express();
const { Todo } = require("./models");
const bodyParser = require("body-parser");
app.use(bodyParser.json());
const path = require("path");
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser("some string"));
app.use(csurf("this_should_be_32_chracters_long", ["POST", "PUT", "DELETE"]));

//set ejs as the view engine
app.set("view engine", "ejs");

app.get("/",async function (request, response) {
  const allTodos = await Todo.findAll();
  const today = new Date().toISOString().split("T")[0];
  const overdue = allTodos.filter(todo => todo.dueDate < today);
  const dueToday = allTodos.filter(todo => todo.dueDate === today );
  const dueLater = allTodos.filter(todo => todo.dueDate > today );
  const completed = allTodos.filter(todo => todo.completed);
  if(request.accepts("html")) {
  response.render('index',{ allTodos,
    overdue,
    dueToday,
    dueLater,
    completed,
    csrfToken: request.csrfToken() });
  }
  else{
    response.json(allTodos);
  }
});

app.use(express.static(path.join(__dirname, "public")));

app.get("/todos", async function (request, response) {
  console.log("Processing list of all Todos ...");
  // FILL IN YOUR CODE HERE
  try {
    const todos = await Todo.findAll();
    return response.json(todos);
  } catch (error) {
    console.log(error) ;
    return response.status(422).json(error); 
  }
  // First, we have to query our PostgerSQL database using Sequelize to get list of all Todos.
  // Then, we have to respond with all Todos, like:
  // response.send(todos)
});

app.get("/todos/:id", async function (request, response) {
  try {
    const todo = await Todo.findByPk(request.params.id);
    return response.json(todo);
  } catch (error) {
    console.log(error);
    return response.status(422).json(error);
  }
});

app.post("/todos", async function (request, response) {
  try {
    const todo = await Todo.addTodo(request.body);
    return response.redirect("/");
  } catch (error) {
    console.log(error);
    return response.status(422).json(error);
  }
});

// app.put("/todos/:id/markAsCompleted", async function (request, response) {
//   const todo = await Todo.findByPk(request.params.id);
//   try {
//     const updatedTodo = await todo.markAsCompleted();
//     return response.json(updatedTodo);
//   } catch (error) {
//     console.log(error);
//     return response.status(422).json(error);
//   }
// });

app.put("/todos/:id", async function (request, response) {
  try {
    const todo = await Todo.findByPk(request.params.id); // Find the todo by ID
    if (!todo) {
      return response.status(404).json({ error: "Todo not found" });
    }

    // Use the `completed` key from the request body to update the todo
     await Todo.update(
      { completed: request.body.completed },
      { where: { id: request.params.id } }
    );

    // Fetch the updated todo
    const updatedTodo = await Todo.findByPk(request.params.id);
    
    return response.json(updatedTodo); // Respond with the updated todo
  } catch (error) {
    console.log(error);
    return response.status(422).json(error); // Handle errors
  }
});

app.delete("/todos/:id", async function (request, response) {
  console.log("We have to delete a Todo with ID: ", request.params.id);
  // FILL IN YOUR CODE HERE
  try {
    await Todo.remove(request.params.id);
    return response.json({success: true});
    // if(deletedTodo) {
    //   return response.send(true);
    // }
    // else{
    //   return response.send(false);
    // }
  } catch (error) {
    console.log(error);
    return response.status(422).json(error);
    
  }
  // First, we have to query our database to delete a Todo by ID.
  // Then, we have to respond back with true/false based on whether the Todo was deleted or not.
  // response.send(true)
});

module.exports = app;
