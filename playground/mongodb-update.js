//const MongoClient = require('mongodb').MongoClient;
const { MongoClient, ObjectID } = require('mongodb');

MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, client) => {
    if (err) {
        return console.log('Unable to connect to MongoDB server');
    }

    console.log('Successfully connected to MongoDB server');

    const db = client.db('TodoApp');

    // db.collection('ToDos').findOneAndUpdate(
    //     {
    //         _id: new ObjectID('5b3690c9d562ccf9fd698e09')
    //     },
    //     {
    //         $set: {
    //             completed: true
    //         }
    //     },
    //     {
    //         returnOriginal: false
    //     }
    // ).then((result) => {
    //     console.log(result);
    // }, (err) => {
    //     console.log('Unable to update todos', err);
    // });

    db.collection('Users').findOneAndUpdate(
        {
            _id: new ObjectID('5b2bc76b5f235d1e36a4a0f6')
        },
        {
            $set: {
                name: 'Darren Doherty'
            },
            $inc: {
                age: 1
            }
        },
        {
            returnOriginal: false
        }
    ).then((result) => {
        console.log(result);
    }, (err) => {
        console.log('Unable to update users', err);
    });

    client.close();
})