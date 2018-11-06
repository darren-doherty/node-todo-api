const expect = require("expect");
const request = require("supertest");
const { ObjectID } = require("mongodb");

const { app } = require("./../server");
const { Todo } = require("./../models/todo");
const { User } = require("./../models/user");
const {
  initTodos,
  populateTodos,
  initUsers,
  populateUsers
} = require("./seed/seed");

beforeEach(populateUsers);
beforeEach(populateTodos);

describe("POST /todos", () => {
  it("should create a new todo", done => {
    var text = "new todo text";

    request(app)
      .post("/todos")
      .send({ text })
      .expect(200)
      .expect(res => {
        expect(res.body.text).toBe(text);
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        Todo.find({ text })
          .then(todos => {
            expect(todos.length).toBe(1);
            expect(todos[0].text).toBe(text);
            done();
          })
          .catch(err => done(err));
      });
  });

  it("should NOT create a new todo with invalid data", done => {
    request(app)
      .post("/todos")
      .send({})
      .expect(400)
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        Todo.find()
          .then(todos => {
            expect(todos.length).toBe(2);
            done();
          })
          .catch(err => done(err));
      });
  });
});

describe("GET /todos", () => {
  it("should get all todos", done => {
    request(app)
      .get("/todos")
      .expect(200)
      .expect(res => {
        expect(res.body.todos.length).toBe(2);
      })
      .end(done);
  });
});

describe("GET /todos/:id", () => {
  it("should get a specific todo", done => {
    const todoId = initTodos[0]._id.toHexString();
    request(app)
      .get(`/todos/${todoId}`)
      .expect(200)
      .expect(res => {
        expect(res.body.todo._id).toBe(todoId);
      })
      .end(done);
  });

  it("should return a 404 when todo does not exist", done => {
    const todoId = new ObjectID().toHexString();
    request(app)
      .get(`/todos/${todoId}`)
      .expect(404)
      .end(done);
  });

  it("should return a 404 when id is invalid", done => {
    const todoId = "1234";
    request(app)
      .get(`/todos/${todoId}`)
      .expect(404)
      .end(done);
  });
});

describe("DELETE /todos/:id", () => {
  it("should delete a specific todo", done => {
    const todoId = initTodos[0]._id.toHexString();
    request(app)
      .delete(`/todos/${todoId}`)
      .expect(200)
      .expect(res => {
        expect(res.body.todo._id).toBe(todoId);
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        Todo.findById(todoId)
          .then(todo => {
            expect(todo).toBeNull();
            done();
          })
          .catch(err => done(err));
      });
  });

  it("should return a 404 when todo does not exist", done => {
    const todoId = new ObjectID().toHexString();
    request(app)
      .delete(`/todos/${todoId}`)
      .expect(404)
      .end(done);
  });

  it("should return a 404 when id is invalid", done => {
    const todoId = "1234";
    request(app)
      .delete(`/todos/${todoId}`)
      .expect(404)
      .end(done);
  });
});

describe("PATCH /todos/:id", () => {
  it("should update a specific todo", done => {
    const todoId = initTodos[0]._id.toHexString();
    var body = { text: "new updated todo text", completed: true };
    request(app)
      .patch(`/todos/${todoId}`)
      .send(body)
      .expect(200)
      .expect(res => {
        expect(res.body.todo._id).toBe(todoId);
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        Todo.findById(todoId)
          .then(todo => {
            expect(todo.text).toBe(body.text);
            expect(todo.completed).toBe(body.completed);
            expect(typeof todo.completedAt).toBe("number");
            done();
          })
          .catch(err => done(err));
      });
  });

  it("should clear completedAt when todo is not completed", done => {
    const todoId = initTodos[0]._id.toHexString();
    var body = { text: "new updated todo text", completed: false };
    request(app)
      .patch(`/todos/${todoId}`)
      .send(body)
      .expect(200)
      .expect(res => {
        expect(res.body.todo._id).toBe(todoId);
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        Todo.findById(todoId)
          .then(todo => {
            expect(todo.text).toEqual(body.text);
            expect(todo.completed).toBe(body.completed);
            expect(todo.completedAt).toBeNull();
            done();
          })
          .catch(err => done(err));
      });
  });

  it("should return a 404 when todo does not exist", done => {
    const todoId = new ObjectID().toHexString();
    var body = { text: "new updated todo text", completed: true };
    request(app)
      .patch(`/todos/${todoId}`)
      .send(body)
      .expect(404)
      .end(done);
  });

  it("should return a 404 when id is invalid", done => {
    const todoId = "1234";
    var body = { text: "new updated todo text", completed: true };
    request(app)
      .patch(`/todos/${todoId}`)
      .send(body)
      .expect(404)
      .end(done);
  });
});

describe("GET /users/me", () => {
  it("should return user if authenticated", done => {
    request(app)
      .get(`/users/me`)
      .set("x-auth", initUsers[0].tokens[0].token)
      .expect(200)
      .expect(res => {
        expect(res.body._id).toBe(initUsers[0]._id.toHexString());
        expect(res.body.email).toBe(initUsers[0].email);
      })
      .end(done);
  });

  it("should return a 401 if not authenticated", done => {
    request(app)
      .get(`/users/me`)
      .expect(401)
      .expect(res => {
        expect(res.body).toEqual({});
      })
      .end(done);
  });
});

describe("POST /users", () => {
  it("should create a new user", done => {
    var email = "example@example.com";
    var password = "abcdefgh";

    request(app)
      .post("/users")
      .send({ email, password })
      .expect(200)
      .expect(res => {
        expect(typeof res.headers["x-auth"]).toBe("string");
        expect(typeof res.body._id).toBe("string");
        expect(res.body.email).toBe(email);
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        User.findOne({ email })
          .then(user => {
            expect(typeof user).toBe("object");
            expect(user.password).not.toEqual(password);
            expect(user.email).toBe(email);
            done();
          })
          .catch(err => done(err));
      });
  });

  it("should return validation errors if request invalid", done => {
    var email = "exampleexample.com";
    var password = "abcd";

    request(app)
      .post("/users")
      .send({ email, password })
      .expect(400)
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        User.find()
          .then(users => {
            expect(users.length).toBe(2);
            done();
          })
          .catch(err => done(err));
      });
  });

  it("should not create user if email in use", done => {
    var email = initUsers[0].email;
    var password = initUsers[0].password;

    request(app)
      .post("/users")
      .send({ email, password })
      .expect(400)
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        User.find()
          .then(users => {
            expect(users.length).toBe(2);
            done();
          })
          .catch(err => done(err));
      });
  });
});

describe("POST /users/login", () => {
  it("should login a user with valid credentials and return auth token", done => {
    var email = initUsers[0].email;
    var password = initUsers[0].password;

    request(app)
      .post("/users/login")
      .send({ email, password })
      .expect(200)
      .expect(res => {
        expect(typeof res.headers["x-auth"]).toBe("string");
        expect(typeof res.body._id).toBe("string");
        expect(res.body.email).toBe(email);
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        User.findById(initUsers[0]._id)
          .then(user => {
            expect(typeof user).toBe("object");
            expect(user.password).not.toEqual(password);
            expect(user.email).toBe(res.body.email);
            expect(user._id.toHexString()).toBe(res.body._id);
            done();
          })
          .catch(err => done(err));
      });
  });

  it("should reject invalid login credentials", done => {
    var email = "example@example.com";
    var password = "abcd";

    request(app)
      .post("/users/login")
      .send({ email, password })
      .expect(400)
      .end(done);
  });
});

describe("DELETE /users/me/token", () => {
  it("should logout a user if user is logged in and delete their token", done => {
    request(app)
      .delete("/users/me/token")
      .set("x-auth", initUsers[0].tokens[0].token)
      .send()
      .expect(200)
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        User.findById(initUsers[0]._id)
          .then(user => {
            expect(user.tokens.length).toBe(0);
            done();
          })
          .catch(err => done(err));
      });
  });

  it("should return authorisation error if not logged in", done => {
    request(app)
      .delete("/users/me/token")
      .set("x-auth", "invalid_token")
      .send()
      .expect(401)
      .end(done);
  });
});