// Import express.js
const express = require("express");

// Create express app
var app = express();

// Add static files location
app.use(express.static("static"));

// Use the Pug templating engine
app.set('view engine', 'pug');
app.set('views', './app/views');

// Get the functions in the db.js file to use
const db = require('./services/db');

// -------------------------------------------------------
// ROOT
// -------------------------------------------------------
app.get("/", function(req, res) {
    res.render("index");
});

// -------------------------------------------------------
// WEEK 4 - STUDENTS
// -------------------------------------------------------

// Task 1: JSON listing of all students
app.get("/all-students", function(req, res) {
    var sql = 'SELECT * FROM Students';
    db.query(sql).then(results => {
        console.log(results);
        res.json(results);
    });
});

// Task 2: HTML formatted list of all students (via PUG template)
app.get("/all-students-formatted", function(req, res) {
    var sql = 'SELECT * FROM Students';
    db.query(sql).then(results => {
        res.render('all-students', { data: results });
    });
});

// Task 3: Single student page - name, programme, modules
app.get("/student-single/:id", async function(req, res) {
    var stId = req.params.id;

    // Get student name and programme
    var stSql = "SELECT s.name as student, ps.name as programme, \
                 ps.id as pcode FROM Students s \
                 JOIN Student_Programme sp ON sp.id = s.id \
                 JOIN Programmes ps ON ps.id = sp.programme \
                 WHERE s.id = ?";
    var stResult = await db.query(stSql, [stId]);

    var pCode = stResult[0]['pcode'];

    // Get modules for this student via their programme
    var modSql = "SELECT * FROM Programme_Modules pm \
                  JOIN Modules m ON m.code = pm.module \
                  WHERE programme = ?";
    var modResult = await db.query(modSql, [pCode]);

    res.render('student-single', {
        student: stResult[0],
        modules: modResult
    });
});

// -------------------------------------------------------
// WEEK 4 - PROGRAMMES
// -------------------------------------------------------

// Independent Task 1: JSON listing of all programmes
app.get("/all-programmes", function(req, res) {
    var sql = 'SELECT * FROM Programmes';
    db.query(sql).then(results => {
        res.json(results);
    });
});

// Independent Task 2: HTML formatted list of programmes
app.get("/all-programmes-formatted", function(req, res) {
    var sql = 'SELECT * FROM Programmes';
    db.query(sql).then(results => {
        res.render('all-programmes', { data: results });
    });
});

// Independent Task 3: Single programme page with its modules
app.get("/programme-single/:id", async function(req, res) {
    var pCode = req.params.id;

    var pSql = "SELECT * FROM Programmes WHERE id = ?";
    var pResult = await db.query(pSql, [pCode]);

    var modSql = "SELECT * FROM Programme_Modules pm \
                  JOIN Modules m ON m.code = pm.module \
                  WHERE programme = ?";
    var modResult = await db.query(modSql, [pCode]);

    res.render('programme-single', {
        programme: pResult[0],
        modules: modResult
    });
});

// -------------------------------------------------------
// WEEK 4 - MODULES
// -------------------------------------------------------

// Independent Task 4: JSON listing of all modules
app.get("/all-modules", function(req, res) {
    var sql = 'SELECT * FROM Modules';
    db.query(sql).then(results => {
        res.json(results);
    });
});

// Independent Task 5: HTML formatted list of modules
app.get("/all-modules-formatted", function(req, res) {
    var sql = 'SELECT * FROM Modules';
    db.query(sql).then(results => {
        res.render('all-modules', { data: results });
    });
});

// Independent Task 6: Single module page - title, programme, students
app.get("/module-single/:code", async function(req, res) {
    var mCode = req.params.code;

    var mSql = "SELECT * FROM Modules WHERE code = ?";
    var mResult = await db.query(mSql, [mCode]);

    var progSql = "SELECT p.* FROM Programmes p \
                   JOIN Programme_Modules pm ON pm.programme = p.id \
                   WHERE pm.module = ?";
    var progResult = await db.query(progSql, [mCode]);

    var studSql = "SELECT s.* FROM Students s \
                   JOIN Student_Programme sp ON sp.id = s.id \
                   JOIN Programme_Modules pm ON pm.programme = sp.programme \
                   WHERE pm.module = ?";
    var studResult = await db.query(studSql, [mCode]);

    res.render('module-single', {
        module: mResult[0],
        programmes: progResult,
        students: studResult
    });
});

// -------------------------------------------------------
// Original db_test routes
// -------------------------------------------------------
app.get("/db_test", function(req, res) {
    var sql = 'SELECT * FROM test_table';
    db.query(sql).then(results => {
        console.log(results);
        res.json(results);
    });
});

app.get("/db_test/:id", async function(req, res) {
    var id = req.params.id;
    var sql = 'SELECT * FROM test_table WHERE id = ?';
    var results = await db.query(sql, [id]);
    res.send(results.length > 0 ? results[0].name : "Not found");
});

app.get("/goodbye", function(req, res) {
    res.send("Goodbye world!");
});

app.get("/hello/:name", function(req, res) {
    console.log(req.params);
    res.send("Hello " + req.params.name);
});

// Start server on port 3000
app.listen(3000, function() {
    console.log(`Server running at http://127.0.0.1:3000/`);
});