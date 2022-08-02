const express = require('express') // brings in express and its methods
const app = express() // assigns app to express (makes this an express app)
const MongoClient = require('mongodb').MongoClient // brings in mongodb and its methods
const PORT = 2121 // assigns a port
require('dotenv').config() // uses dotenv which lets us keep our secrets from github & the world


let db, // creates an unassigned variable
    dbConnectionStr = process.env.DB_STRING, // creates a variable and assigns our database connection string to it
    dbName = 'todo' // creates and assigns a variable containing our database name

MongoClient.connect(dbConnectionStr, { useUnifiedTopology: true }) // removes a deprecation warning in our console, basically
    .then(client => { // promise fulfilled
        console.log(`Connected to ${dbName} Database`) // shows up in the console, lets us see that it's working
        db = client.db(dbName) // this whole thing is connecting us to our database
    })
    
app.set('view engine', 'ejs') // tells express to use ejs as our template engine
app.use(express.static('public')) // middleware that basically makes our public folder public
app.use(express.urlencoded({ extended: true })) // this is about how we want express to parse url encoded data, in this case json friendly
app.use(express.json()) // parses requests


app.get('/',async (request, response)=>{  // initializes our get function
    const todoItems = await db.collection('todos').find().toArray() // makes an array of todo items from our database
    const itemsLeft = await db.collection('todos').countDocuments({completed: false}) // makes a const with the number of 
    response.render('index.ejs', { items: todoItems, left: itemsLeft }) // sends todoItems & itemsLeft to index.js to be rendered in the dom
    // db.collection('todos').find().toArray()
    // .then(data => {
    //     db.collection('todos').countDocuments({completed: false})
    //     .then(itemsLeft => {
    //         response.render('index.ejs', { items: data, left: itemsLeft })
    //     })
    // })
    // .catch(error => console.error(error))
})

app.post('/addTodo', (request, response) => { // initializes a post function
    db.collection('todos').insertOne({thing: request.body.todoItem, completed: false}) // adds the new item to the database collection
    .then(result => {
        console.log('Todo Added')
        response.redirect('/')
    }) // if all went well, writes to the console & reloads the page
    .catch(error => console.error(error)) // if there's an error, write it to the console
})

app.put('/markComplete', (request, response) => { // initializes a put function
    db.collection('todos').updateOne({thing: request.body.itemFromJS},{ // updates the todo item
        $set: {
            completed: true
          }
    },{ // ^ updates completed to true
        sort: {_id: -1},
        upsert: false
    }) // sorts the database items
    .then(result => {
        console.log('Marked Complete')
        response.json('Marked Complete')
    }) // if all went well responds with a message so we can see
    .catch(error => console.error(error)) // if there's an error, write it to the console

})

app.put('/markUnComplete', (request, response) => { // initializes a put function
    db.collection('todos').updateOne({thing: request.body.itemFromJS},{
        $set: {
            completed: false
          }
    },{
        sort: {_id: -1},
        upsert: false
    })
    .then(result => {
        console.log('Marked Complete')
        response.json('Marked Complete')
    })
    .catch(error => console.error(error)) // if there's an error, write it to the console

})

app.delete('/deleteItem', (request, response) => { // initializes a delete function
    db.collection('todos').deleteOne({thing: request.body.itemFromJS})
    .then(result => {
        console.log('Todo Deleted')
        response.json('Todo Deleted')
    })
    .catch(error => console.error(error)) // if there's an error, write it to the console

})

app.listen(process.env.PORT || PORT, ()=>{
    console.log(`Server running on port ${PORT}`)
})