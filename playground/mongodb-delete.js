//const MongoClient = require('mongodb').MongoClient;
const { MongoClient, ObjectID } = require('mongodb');

MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, client) => {
    if (err) {
        return console.log('Unable to connect to MongoDB server');
    }

    console.log('Successfully connected to MongoDB server');

    const db = client.db('TodoApp');

    // deleteMany
    // db.collection('ToDos').deleteMany({text: 'Eat lunch'}).then( (result) => {
    //     console.log(result);
    // }, (err) => {
    //     console.log('Unable to delete todos', err);
    // });

    // deleteOne
    // db.collection('ToDos').deleteOne({text: 'Eat lunch'}).then( (result) => {
    //     console.log(result);
    // }, (err) => {
    //     console.log('Unable to delete todos', err);
    // });

    // findOneAndDelete
    db.collection('ToDos').findOneAndDelete({ completed: false }).then((result) => {
        console.log(result);
    }, (err) => {
        console.log('Unable to delete todos', err);
    });

    client.close();
})