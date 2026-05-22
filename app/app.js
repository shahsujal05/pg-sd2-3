// Import express.js
const express = require("express");

// Create express app
var app = express();

// Add static files location
app.use(express.static("static"));

// Get the functions in the db.js file to use
const db = require('./services/db');

// -------------------------------------------------------
// WEEK 3 - BASIC ROUTES
// -------------------------------------------------------

// Exercise 1: Root route with your name
app.get("/", function(req, res) {
    res.send("Hello Sujal!");
});

// Exercise 2: /roehampton route
app.get("/roehampton", function(req, res) {
    console.log(req.url);               // Exercise 3: log the URL to terminal
    let path = req.url;
    res.send(path.substring(0, 3));     // Exercise 4: send only first 3 letters
});

// Goodbye route (from scaffolding)
app.get("/goodbye", function(req, res) {
    res.send("Goodbye world!");
});

// -------------------------------------------------------
// WEEK 3 - DYNAMIC ROUTES
// -------------------------------------------------------

// Existing dynamic route from scaffolding
app.get("/hello/:name", function(req, res) {
    console.log(req.params);
    res.send("Hello " + req.params.name);
});

// Exercise 2: /user/:id
app.get("/user/:id", function(req, res) {
    res.send("User ID: " + req.params.id);
});

// Exercise 3: /student/:name/:id  - output name and ID
app.get("/student/:name/:id", function(req, res) {
    var name = req.params.name;
    var id   = req.params.id;
    res.send("Name: " + name + ", ID: " + id);
});

// Exercise 4: /student/:name/:id in an HTML table
app.get("/student-table/:name/:id", function(req, res) {
    var name = req.params.name;
    var id   = req.params.id;
    var html = "<table border='1'>" +
               "<tr><th>Name</th><th>ID</th></tr>" +
               "<tr><td>" + name + "</td><td>" + id + "</td></tr>" +
               "</table>";
    res.send(html);
});

// -------------------------------------------------------
// WEEK 3 - DATABASE ROUTE WITH ID PARAMETER
// -------------------------------------------------------

// Original db_test route (from scaffolding)
app.get("/db_test", function(req, res) {
    var sql = 'select * from test_table';
    db.query(sql).then(results => {
        console.log(results);
        res.json(results);
    });
});

// Exercise 5: db_test with ID - returns just the name for that row
app.get("/db_test/:id", async function(req, res) {
    var id  = req.params.id;
    var sql = 'SELECT * FROM test_table WHERE id = ?';
    var results = await db.query(sql, [id]);
    if (results.length > 0) {
        res.send("<h2>Result for ID " + id + "</h2><p>" + JSON.stringify(results[0]) + "</p>");
    } else {
        res.send("No record found for ID: " + id);
    }
});

// -------------------------------------------------------
// Start server on port 3000
// -------------------------------------------------------
app.listen(3000, function() {
    console.log(`Server running at http://127.0.0.1:3000/`);
});