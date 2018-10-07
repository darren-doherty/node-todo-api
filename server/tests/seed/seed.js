const jwt = require('jsonwebtoken');
const {ObjectID} = require('mongodb');

const {Todo} = require('./../../models/todo');
const {User} = require('./../../models/user');

const initTodos = [{
    _id: new ObjectID(),
    text: "First todo text"
}, {
    _id: new ObjectID(),
    text: "Second todo text"
}];

const UserOneId = new ObjectID();
const UserTwoId = new ObjectID();
const initUsers = [{
    _id: UserOneId,
    email: 'darren@example.com',
    password: 'userOnePass',
    tokens: [{
        access: 'auth',
        token: jwt.sign({_id: UserOneId, access: 'auth'}, 'abc123').toString()
    }]
}, {
    _id: UserTwoId,
    email: 'darren1@example.com',
    password: 'userTwoPass'
}];

const populateTodos = (done) => {
    Todo.remove({}).then(() => {
        Todo.insertMany(initTodos);
    })
    .then(() => done());
};

const populateUsers = (done) => {
    User.remove({}).then(() => {
       var userOne = new User(initUsers[0]).save();
       var userTwo = new User(initUsers[1]).save();

       return Promise.all([userOne, userTwo]);
    })
    .then(() => done());
};

module.exports = {initTodos, populateTodos, initUsers, populateUsers};