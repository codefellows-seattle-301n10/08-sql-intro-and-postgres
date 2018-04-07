'use strict';

const fs = require('fs');
const express = require('express');
const pg = require('pg');
const PORT = process.env.PORT || 3000;
const app = express();


// Windows and Linux users: You should have retained the user/password from the pre-work for this course.
// Your OS may require that your conString is composed of additional information including user and password.

// Windows
const conString = 'postgres://postgres:3874@localhost:5432/kilovolt';

// Mac:
// const conString = 'postgres://localhost:5432/kilovolt';

const client = new pg.Client(conString);

// REVIEW: Use the client object to connect to our DB.
client.connect();


// REVIEW: Install the middleware plugins so that our app can parse the request body
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(express.static('./public'));

// REVIEW: Routes for requesting HTML resources
app.get('/new', (request, response) => {
  // COMMENT: What number(s) of the full-stack-diagram.png image correspond to the following line of code? Which method of article.js, if any, is interacting with this particular piece of `server.js`? What part of CRUD, if any, is being enacted/managed by this particular piece of code?
  // These lines of code are interacting with the (2)request and response(5) portion of the full-stack-diagram.png. It is not interacting with article.js, Nor is any part of CRUD being enacted by these lines of code
  response.sendFile('new.html', {root: './public'});
});


// REVIEW: Routes for making API calls to use CRUD Operations on our database
app.get('/articles', (request, response) => {
  // COMMENT: What number(s) of the full-stack-diagram.png image correspond to the following line of code? Which method of article.js is interacting with this particular piece of `server.js`? What part of CRUD is being enacted/managed by this particular piece of code?
  // These lines of code are interacting with the (2)request, query(3), result(4), and response(5), portion of the full-stack-diagram.png. This interacts with the fetch all,  method in article.js, This is enacting the Read portion of CRUD.
  client.query(`SELECT * FROM articles;`)
    .then(function(result) {
      response.send(result.rows);
    })
    .catch(function(err) {
      console.error(err)
    })
});

app.post('/articles', (request, response) => {
  // COMMENT: What number(s) of the full-stack-diagram.png image correspond to the following line of code? Which method of article.js is interacting with this particular piece of `server.js`? What part of CRUD is being enacted/managed by this particular piece of code?
  // These lines of code are interacting with the (2)request, query(3), result(4), and response(5), portion of the full-stack-diagram.png. This interacts with the fetchall record method of article.js, This is enacting the Create portion of CRUD.
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

app.put('/articles/:id', (request, response) => {
  // COMMENT: What number(s) of the full-stack-diagram.png image correspond to the following line of code? Which method of article.js is interacting with this particular piece of `server.js`? What part of CRUD is being enacted/managed by this particular piece of code?
  // These lines of code are interacting with the (2)request, query(3), result(4), and response(5), portion of the full-stack-diagram.png. This interacts with the insert record method of article.js, This is enacting the Update portion of CRUD.
  client.query(
    `UPDATE articles
    SET
      title=$1,
      author=$2,
      "authorUrl"=$3,
      category=$4,
      "publishedOn"=$5,
      body=$6
    WHERE article_id=$7;`,
    [
      request.body.title,
      request.body.author,
      request.body.authorUrl,
      request.body.category,
      request.body.publishedOn,
      request.body.body,
      request.params.id
    ]
  )
    .then(() => {
      response.send('update complete')
    })
    .catch(err => {
      console.error(err);
    });
});

app.delete('/articles/:id', (request, response) => {
  // COMMENT: What number(s) of the full-stack-diagram.png image correspond to the following line of code? Which method of article.js is interacting with this particular piece of `server.js`? What part of CRUD is being enacted/managed by this particular piece of code?
  // These lines of code are interacting with the (2)request, query(3), result(4), and response(5), portion of the full-stack-diagram.png. This interacts with the truncateTable method of article.js, This is enacting the Delete portion of CRUD.
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
  // COMMENT: What number(s) of the full-stack-diagram.png image correspond to the following line of code? Which method of article.js is interacting with this particular piece of `server.js`? What part of CRUD is being enacted/managed by this particular piece of code?
  // These lines of code are interacting with the (2)request, query(3), result(4), and response(5), portion of the full-stack-diagram.png. This interacts with the insert record method of article.js, This is enacting the Delete portion of CRUD.
  client.query(
    'DROP TABLE articles;'
  )
    .then(() => {
      response.send('Delete complete')
    })
    .catch(err => {
      console.error(err);
    });
});

// COMMENT: What is this function invocation doing?
// This function creates the articles table and then if no rows exist, the function will grab the data from hackerIpsum.json and insert all the data into the table.
loadDB();

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}!`);
});


//////// ** DATABASE LOADER ** ////////
////////////////////////////////////////
function loadArticles() {
  console.log('excuting load articles');
  // COMMENT: What number(s) of the full-stack-diagram.png image correspond to the following line of code? Which method of article.js is interacting with this particular piece of `server.js`? What part of CRUD is being enacted/managed by this particular piece of code?
  // // These lines of code are interacting with the  query(3), and result(4) portion of the full-stack-diagram.png. This does not interact with any methods of article.js. This is enacting the create portion of CRUD.
  client.query('SELECT COUNT(*) FROM articles')
    .then(result => {
    // REVIEW: result.rows is an array of objects that PostgreSQL returns as a response to a query.
    // If there is nothing on the table, then result.rows[0] will be undefined, which will make count undefined. parseInt(undefined) returns NaN. !NaN evaluates to true.
    // Therefore, if there is nothing on the table, the conditional expression will evaluate to true and enter into the code block.
      if(!parseInt(result.rows[0].count)) {
        console.log('no rows found, executing load');
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
        console.log('load complete');
      }
    })
}

function loadDB() {
  // COMMENT: What number(s) of the full-stack-diagram.png image correspond to the following line of code? Which method of article.js is interacting with this particular piece of `server.js`? What part of CRUD is being enacted/managed by this particular piece of code?
  // //These lines correspond to the query portion full-stack-dagram, portion of the full-stack-diagram.png. This interacts with the insert record method of article.js, This is enacting the Create portion of CRUD.
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
      console.log('something went wrong');
      console.error(err);
    });
}
