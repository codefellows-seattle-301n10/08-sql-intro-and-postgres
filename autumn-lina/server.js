'use strict';

const fs = require('fs');
const express = require('express');
const pg = require('pg');

const PORT = process.env.PORT || 3000;
const app = express();

const conString = 'postgres://localhost:5432/lab8';

//Passing connection string to instantiate the client
//Client is a constructor function for the postgres client and it is available via the pg object
const client = new pg.Client(conString);

// REVIEWED: Use the client object to connect to our DB.
client.connect();

// REVIEWED: Install the middleware plugins so that our app can parse the request body
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(express.static('./public'));

// REVIEWED: Routes for requesting HTML resources
app.get('/new', (request, response) => {
  // COMMENTED: What number(s) of the full-stack-diagram.png image correspond to the following line of code? Which method of article.js, if any, is interacting with this particular piece of `server.js`? What part of CRUD, if any, is being enacted/managed by this particular piece of code?
  // Its a request and response, grabs a static resource that is made available. Its a request to the server to navigate to this route using get and the server returns new.html. It is using 2 and 5 of the diagram. READ is part of the CRUD which is used here.
  response.sendFile('new.html', {root: './public'});
});


// REVIEWED: Routes for making API calls to use CRUD Operations on our database
app.get('/articles', (request, response) => {
  // COMMENTED: What number(s) of the full-stack-diagram.png image correspond to the following line of code? Which method of article.js is interacting with this particular piece of `server.js`? What part of CRUD is being enacted/managed by this particular piece of code?
  // Its a request to the server to navigate to this route using get and server returns articles. The response coming back from the server and its returning a promise, its going to send back a result. Since the server doesn't have the article it makes a query to the database, and then the database makes the query available to the server, which is sent back by server to the client fulfilling the promise. Parts 2,3,4,5 of the diagram are being used in this web request response cycle. Read is part of the CRUD which is used here.
  
  client.query(`SELECT * FROM articles`)
    .then(function(result) {
      response.send(result.rows);
    })
    .catch(function(err) {
      console.error(err)
    })
});

app.post('/articles', (request, response) => {
  // COMMENTED: What number(s) of the full-stack-diagram.png image correspond to the following line of code? Which method of article.js is interacting with this particular piece of `server.js`? What part of CRUD is being enacted/managed by this particular piece of code?
  //$ signs show how this query method has different ways of interacting and one of them is giving a string. All you are doing is constructing a string ($1, $2...) these are all placeholders and whose values line up. You can also write title VALUES like ('${request.body.title}', $2, $3) this.
  //Post is sending data to populate the database and uses the Article constructor function's insertRecord method. This is specifically found in lines 62-68 in article.js. Parts 2,3,4,5 of the diagram are being used in this web request response cycle. Create and Read are part of the CRUD which is used here.
  client.query(
    `INSERT INTO
    articles(title, author, "authorUrl", category, "publishedOn", body)
    VALUES ($1, $2, $3, $4, $5, $6);
    `,
    [
      request.body.title,
      request.body.author,
      request.body.authorUrl,
      request.body.category,
      request.body.publishedOn,
      request.body.body
    ]
  )
    .then(function() {
      response.send('insert complete')
    })
    .catch(function(err) {
      console.error(err);
    });
});
//

app.put('/articles/:id', (request, response) => {
  // COMMENTED: What number(s) of the full-stack-diagram.png image correspond to the following line of code? Which method of article.js is interacting with this particular piece of `server.js`? What part of CRUD is being enacted/managed by this particular piece of code?
  // :id which is a placeholder, it doesn't have to be :id and can be foo it is request.params.id
  // Put is sending data to update the database and uses the Article constructor function's updateRecord method. This is specifically found in lines 81-98 in article.js. Parts 2,3,4,5 of the diagram are being used in this web request response cycle. Update and Read are part of the CRUD which is used here.
  client.query(
    `SELECT * FROM articles WHERE article_id=$1;`, []
  )
    .then(() => {
      response.send('update complete')
    })
    .catch(err => {
      console.error(err);
    });
});

app.delete('/articles/:id', (request, response) => {
  // COMMENTED: What number(s) of the full-stack-diagram.png image correspond to the following line of code? Which method of article.js is interacting with this particular piece of `server.js`? What part of CRUD is being enacted/managed by this particular piece of code?
  // Delete is sending data to delete specific rows in the database and uses the Article constructor function's deleteRecord method. This is specifically found in lines 70-79 in article.js. Parts 2,3,4,5 of the diagram are being used in this web request response cycle. Delete and Read are part of the CRUD which is used here.
  client.query(
    `DELETE FROM articles WHERE article_id=$1;`,
    [request.params.id]
  )
    .then(() => {
      response.send('Delete complete')
    })
    .catch(err => {
      console.error(err);
    });
});

app.delete('/articles', (request, response) => {
  // COMMENTED: What number(s) of the full-stack-diagram.png image correspond to the following line of code? Which method of article.js is interacting with this particular piece of `server.js`? What part of CRUD is being enacted/managed by this particular piece of code?
  // Delete is sending data to delete all rows in the database and uses the Article constructor function's deleteRecord method. This is specifically found in lines 70-79 in article.js. Parts 2,3,4,5 of the diagram are being used in this web request response cycle. Delete and Read are part of the CRUD which is used here.
  console.log('About to delete articles');
  client.query(
    'DELETE FROM articles;'
  )
    .then(() => {
      response.send('Delete complete')
      console.log('Delete complete');
    })
    .catch(err => {
      console.error(err);
    });
});

// COMMENTED: What is this function invocation doing?
// This function is loading the database everytime the app is opened or refreshed.
loadDB();

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}!`);
});


//////// ** DATABASE LOADER ** ////////
////////////////////////////////////////
function loadArticles() {
  // COMMENTED: What number(s) of the full-stack-diagram.png image correspond to the following line of code? Which method of article.js is interacting with this particular piece of `server.js`? What part of CRUD is being enacted/managed by this particular piece of code?
  // Load db creates table when its not there and then it calls load articles which checks any rows inside articles table and it gives rows to the table. Parts 1,3,4 of the diagram are being used in this web request response cycle. Update and Read are part of the CRUD which is used here.

  client.query('SELECT COUNT(*) FROM articles')
    .then(result => {
    // REVIEWED: result.rows is an array of objects that PostgreSQL returns as a response to a query.
    // If there is nothing on the table, then result.rows[0] will be undefined, which will make count undefined. parseInt(undefined) returns NaN. !NaN evaluates to true.
    // Therefore, if there is nothing on the table, the conditional expression will evaluate to true and enter into the code block.
    //we have to do parseInt because it will come back as a string hence need to do parseInt. it wants a truthy or falsy, string[0] is truthy. if you got here that means the count was 0 and that means you will read the hackeripsum file using the fs module. reading file parsing each portion of the file and using a client and constructing query and inserting data that corresponds with differnet elements in the hackeripsum file.
      if(!parseInt(result.rows[0].count)) {
        fs.readFile('./public/data/hackerIpsum.json', 'utf8', (err, fd) => {
          JSON.parse(fd).forEach(ele => {
            client.query(`
              INSERT INTO
              articles(title, author, "authorUrl", category, "publishedOn", body)
              VALUES ($1, $2, $3, $4, $5, $6);
             
            `,
              [ele.title, ele.author, ele.authorUrl, ele.category, ele.publishedOn, ele.body]
            )
          })
        })
      }
    })
}

function loadDB() {
  // COMMENTED: What number(s) of the full-stack-diagram.png image correspond to the following line of code? Which method of article.js is interacting with this particular piece of `server.js`? What part of CRUD is being enacted/managed by this particular piece of code?
  // We have instantiated the client up above and we are making a query on it. if it already exists it will skip it. Before we can populate the database the table needs to be set up the serial primary key which is the unique identiier for each id. This is an asynchronous calls which returns a promise and when it does it loads articles. Parts 1,3,4 of the diagram are being used in this web request response cycle. Create and Read are part of the CRUD which is used here.

  client.query(`
    CREATE TABLE IF NOT EXISTS articles (
      article_id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      author VARCHAR(255) NOT NULL,
      "authorUrl" VARCHAR (255),
      category VARCHAR(20),
      "publishedOn" DATE,
      body TEXT NOT NULL);`
  )
    .then(() => {
      loadArticles();
    })
    .catch(err => {
      console.error(err);
    });
}
