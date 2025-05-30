const express = require("express");
var csurf = require("tiny-csrf");
var cookieParser = require("cookie-parser");
const app = express();
const { Todo,User } = require("./models");
const bodyParser = require("body-parser"); 
const path = require("path");
const { request } = require("http");


const passport = require("passport");
const connectEnsureLogin = require("connect-ensure-login");
const session = require("express-session");
const LocalStrategy = require("passport-local");
const bcrypt = require("bcrypt");
const { title } = require("process");

const saltRounds = 10;

//set ejs as the view engine
app.set("view engine", "ejs");

app.use(bodyParser.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser("some string"));
app.use(csurf("this_should_be_32_chracters_long", ["POST", "PUT", "DELETE"]));

app.use(session({
  secret:"some secret super key",
  cookie:{
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}))

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy({
  usernameField: "email",
  passwordField: "password"
},(username,password,done)=>{
  User.findOne({ where: { email: username } })
  .then(async (user) => {
    const result = await bcrypt.compare(password, user.password)
    if(result){
      return done(null, user);
    } else{
      return done("invalid password")
    }
    
  }).catch((error) => {
    return error;
  });
}))

passport.serializeUser((user, done) => {
  console.log("Serializing user:", user.id);
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  // console.log("Deserializing user with ID:", id);
  User.findByPk(id)
    .then((user) => {
      done(null, user);
    })
    .catch((error) => {
      done(error, null);
    });
});

app.get("/",async function (request, response) {
  response.render('index',{ 
    csrfToken: request.csrfToken() });  
});

app.get("/todos",connectEnsureLogin.ensureLoggedIn(), async function (request, response) {
  const loggedInUser = request.user.id;
  const allTodos = await Todo.findAll();
  const overdue = await Todo.overdue(loggedInUser);
  const dueToday = await Todo.dueToday(loggedInUser);
  const dueLater = await Todo.dueLater(loggedInUser);
  const completed = await Todo.completed(loggedInUser);
  // const today = new Date().toISOString().split("T")[0];
  // const overdue = allTodos.filter(todo => todo.dueDate < today);
  // const dueToday = allTodos.filter(todo => todo.dueDate === today );
  // const dueLater = allTodos.filter(todo => todo.dueDate > today );
  // const completed = allTodos.filter(todo => todo.completed);
  if(request.accepts("html")) {
  response.render('todos',{ allTodos,
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

app.get("/signup",(request ,response) => {
  response.render("signup",{title: "Sign Up", csrfToken: request.csrfToken()});
});

app.post("/users",async (request, response) => {
  //hash the password
  const hashedPassword = await bcrypt.hash(request.body.password, saltRounds);
  //create a new user
  try {
    const user =await User.create({
      firstName: request.body.firstName,
      lastName: request.body.lastName,
      email: request.body.email,
      password: hashedPassword
    })
    request.login(user, (err) => {
      if (err) {
        console.log(err);
      }
      response.redirect("/todos");
    })
  } catch (error) {
    console.log(error);
  }
  
});

app.get("/login", (request, response) => {
  response.render("login",{
    title: "Login", 
    csrfToken: request.csrfToken()
  })
}
);

app.post('/session',passport.authenticate('local',{ failureRedirect: '/login' }),(request, response) => {
  response.redirect('/todos');
})

app.get("/signout",(request,response,next)=>{
  request.logout((err) =>{
    if (err) {
      return next(err);
    }
    response.redirect("/");
  })
})

app.use(express.static(path.join(__dirname, "public")));

app.get("/todos",connectEnsureLogin.ensureLoggedIn(), async function (request, response) {
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

app.get("/todos/:id",connectEnsureLogin.ensureLoggedIn(), async function (request, response) {
  try {
    const todo = await Todo.findByPk(request.params.id);
    return response.json(todo);
  } catch (error) {
    console.log(error);
    return response.status(422).json(error);
  }
});

app.post("/todos",connectEnsureLogin.ensureLoggedIn(), async function (request, response) {
  try {
    const todo = await Todo.addTodo({
      title: request.body.title,
      dueDate: request.body.dueDate,
      userId: request.user.id // Use the logged-in user's ID
    });
    return response.redirect("/todos");
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

app.put("/todos/:id",connectEnsureLogin.ensureLoggedIn(), async function (request, response) {
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

app.delete("/todos/:id",connectEnsureLogin.ensureLoggedIn(), async function (request, response) {
  console.log("We have to delete a Todo with ID: ", request.params.id);
  // FILL IN YOUR CODE HERE
  try {
    await Todo.remove(request.params.id,request.user.id);
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
