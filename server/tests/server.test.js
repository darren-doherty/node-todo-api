const expect = require('expect');
const request = require('supertest');
var { ObjectID } = require('mongodb');

const { app } = require('./../server');
const { Todo } = require('./../models/todo');

const sampleTodos = [{
    _id: new ObjectID(),
    text: "First todo text"
}, {
    _id: new ObjectID(),
    text: "Second todo text"
}];

beforeEach((done) => {
    Todo.remove({}).then(() => {
        Todo.insertMany(sampleTodos);
    })
    .then(() => done());
});

describe('POST /todos', () => {

    it('should create a new todo', (done) => {
        var text = "new todo text";

        request(app).post('/todos').send({ text })
            .expect(200)
            .expect((res) => {
                expect(res.body.text).toBe(text);
            })
            .end((err, res) => {
                if (err) {
                    return done(err);
                }

                Todo.find({text}).then((todos) => {
                    expect(todos.length).toBe(1);
                    expect(todos[0].text).toBe(text);
                    done();
                }).catch((err) => done(err));
            });
    });

    it('should NOT create a new todo with invalid data', (done) => {
        request(app).post('/todos').send({})
            .expect(400)
            .end((err, res) => {
                if (err) {
                    return done(err);
                }

                Todo.find().then((todos) => {
                    expect(todos.length).toBe(2);
                    done();
                }).catch((err) => done(err));
            });
    });
});


describe('GET /todos', () => {

    it('should get all todos', (done) => {
        request(app).get('/todos')
            .expect(200)
            .expect((res) => {
                expect(res.body.todos.length).toBe(2);
            })
            .end(done);
    });
});

describe('GET /todos/:id', () => {

    it('should get a specific todo', (done) => {
        const todoId = sampleTodos[0]._id.toHexString();
        request(app).get(`/todos/${todoId}`)
            .expect(200)
            .expect((res) => {
                expect(res.body.todo._id).toBe(todoId);
            })
            .end(done);
    });

    it('should return a 404 when todo does not exist', (done) => {
        const todoId = new ObjectID().toHexString();
        request(app).get(`/todos/${todoId}`)
            .expect(404)
            .end(done);
    });
    
    it('should return a 404 when id is invalid', (done) => {
        const todoId = '1234';
        request(app).get(`/todos/${todoId}`)
            .expect(404)
            .end(done);
    });
});

describe('DELETE /todos/:id', () => {

    it('should delete a specific todo', (done) => {
        const todoId = sampleTodos[0]._id.toHexString();
        request(app).delete(`/todos/${todoId}`)
            .expect(200)
            .expect((res) => {
                expect(res.body.todo._id).toBe(todoId);
            })
            .end((err, res) => {
                if (err) {
                    return done(err);
                }

                Todo.findById(todoId).then((todo) => {
                    expect(todo).toBeNull();
                    done();
                }).catch((err) => done(err));
            });
    });

    it('should return a 404 when todo does not exist', (done) => {
        const todoId = new ObjectID().toHexString();
        request(app).delete(`/todos/${todoId}`)
            .expect(404)
            .end(done);
    });
    
    it('should return a 404 when id is invalid', (done) => {
        const todoId = '1234';
        request(app).delete(`/todos/${todoId}`)
            .expect(404)
            .end(done);
    });
});

describe('PATCH /todos/:id', () => {

    it('should update a specific todo', (done) => {
        const todoId = sampleTodos[0]._id.toHexString();
        var body = {text: "new updated todo text", completed: true};
        request(app).patch(`/todos/${todoId}`)
            .send(body)
            .expect(200)
            .expect((res) => {
                expect(res.body.todo._id).toBe(todoId);
            })
            .end((err, res) => {
                if (err) {
                    return done(err);
                }

                Todo.findById(todoId).then((todo) => {
                    expect(todo.text).toBe(body.text);
                    expect(todo.completed).toBe(body.completed);
                    expect(typeof todo.completedAt).toBe('number');
                    done();
                }).catch((err) => done(err));
            });
    });

    it('should clear completedAt when todo is not completed', (done) => {
        const todoId = sampleTodos[0]._id.toHexString();
        var body = {text: "new updated todo text", completed: false};
        request(app).patch(`/todos/${todoId}`)
            .send(body)
            .expect(200)
            .expect((res) => {
                expect(res.body.todo._id).toBe(todoId);
            })
            .end((err, res) => {
                if (err) {
                    return done(err);
                }

                Todo.findById(todoId).then((todo) => {
                    expect(todo.text).toEqual(body.text);
                    expect(todo.completed).toBe(body.completed);
                    expect(todo.completedAt).toBeNull();
                    done();
                }).catch((err) => done(err));
            });
    });
    
    it('should return a 404 when todo does not exist', (done) => {
        const todoId = new ObjectID().toHexString();
        var body = {text: "new updated todo text", completed: true};
        request(app).patch(`/todos/${todoId}`)
            .send(body)
            .expect(404)
            .end(done);
    });
    
    it('should return a 404 when id is invalid', (done) => {
        const todoId = '1234';
        var body = {text: "new updated todo text", completed: true};
        request(app).patch(`/todos/${todoId}`)
            .send(body)
            .expect(404)
            .end(done);
    });
});
