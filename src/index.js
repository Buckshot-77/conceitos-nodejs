const express = require("express");
const cors = require("cors");

const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

let users = [];

function checksExistsUserAccount(request, response, next) {
  const username = request.get("username");

  const matchUser = users.find((user) => {
    return user.username === username;
  });

  if (matchUser) {
    request.username = username;
    return next();
  }

  return response.status(404).json({ error: "User not found!" });
}

function get_todo_list(username) {
  return users.find((user) => user.username === username).todos;
}

app.post("/users", (request, response) => {
  const id = uuidv4();

  const { name, username } = request.body;

  const user = {
    id,
    name,
    username,
    todos: [],
  };

  if (users.find((user) => user.username === username)) {
    return response.status(400).json({ error: "Username already exists!" });
  }

  users.push(user);

  return response.status(201).json(user);
});

app.get("/todos", checksExistsUserAccount, (request, response) => {
  const todos = get_todo_list(request.username);

  return response.status(200).json(todos);
});

app.post("/todos", checksExistsUserAccount, (request, response) => {
  const todos = get_todo_list(request.username);
  const id = uuidv4();

  const { title, deadline } = request.body;

  const todo = {
    id,
    title,
    deadline: new Date(deadline),
    created_at: new Date(),
    done: false,
  };

  todos.push(todo);

  return response.status(201).json(todo);
});

app.put("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const id = request.params.id;

  if (!id) {
    return response.status(404).json({ message: "Id not informed" });
  }

  const todos = get_todo_list(request.username);
  if (!todos.find((todo) => todo.id === id)) {
    return response.status(404).json({ error: "Todo not found" });
  }

  if (!todos.find((todo) => todo.id === id)) {
    return response.status(404).json({ error: "Todo not found" });
  }

  let updatedTodo;

  const updatedTodoList = todos.map((todo) => {
    if (todo.id === id) {
      updatedTodo = {
        ...todo,
        title: title ? title : todo.title,
        deadline: deadline ? new Date(deadline) : todo.deadline,
      };

      return updatedTodo;
    }
    return todo;
  });

  const updatedUsers = users.map((user) => {
    if (user.username === request.username) {
      return { ...user, todos: updatedTodoList };
    }
    return user;
  });

  users = updatedUsers;

  return response.status(200).json(updatedTodo);
});

app.patch("/todos/:id/done", checksExistsUserAccount, (request, response) => {
  const id = request.params.id;

  if (!id) {
    return response.status(404).json({ message: "Id not informed" });
  }

  const todos = get_todo_list(request.username);

  if (!todos.find((todo) => todo.id === id)) {
    return response.status(404).json({ error: "Todo not found" });
  }

  let updatedTodo;

  const updatedTodoList = todos.map((todo) => {
    if (todo.id === id) {
      updatedTodo = {
        ...todo,
        done: true,
      };

      return updatedTodo;
    }
    return todo;
  });

  const updatedUsers = users.map((user) => {
    if (user.username === request.username) {
      return { ...user, todos: updatedTodoList };
    }
    return user;
  });

  users = updatedUsers;

  return response.status(200).json(updatedTodo);
});

app.delete("/todos/:id", checksExistsUserAccount, (request, response) => {
  const id = request.params.id;

  if (!id) {
    return response.status(404).json({ message: "Id not informed" });
  }

  const todos = get_todo_list(request.username);

  if (!todos.find((todo) => todo.id === id)) {
    return response.status(404).json({ error: "Todo not found" });
  }

  const updatedTodoList = todos.filter((todo) => {
    return todo.id !== id;
  });

  const updatedUsers = users.map((user) => {
    if (user.username === request.username) {
      return { ...user, todos: updatedTodoList };
    }
    return user;
  });

  users = updatedUsers;

  return response.status(204).send([]);
});

module.exports = app;
