// Import express.js
const express = require("express");

// Create express app
var app = express();

// Add static files location
app.use(express.static("static"));

// Use the Pug templating engine
app.set('view engine', 'pug');
app.set('views', './app/views');

// Parse POST form data
app.use(express.urlencoded({ extended: true }));

// Get the functions in the db.js file to use
const db = require('./services/db');

// Get Models
const { Student }     = require("./models/student");
const { Programme }   = require("./models/programme");
const programmes      = require("./models/programmes");

// ROOT
app.get("/", function(req, res) {
    res.render("index", { title: "SD2 Student App" });
});

// All students JSON
app.get("/all-students", function(req, res) {
    var sql = 'SELECT * FROM Students';
    db.query(sql).then(results => {
        res.json(results);
    });
});

// All students formatted
app.get("/all-students-formatted", function(req, res) {
    var sql = 'SELECT * FROM Students';
    db.query(sql).then(results => {
        res.render('all-students', { title: 'All Students', data: results });
    });
});

// Single student page - Week 6 MVC version
app.get("/student-single/:id", async function(req, res) {
    var stId = req.params.id;
    var student = new Student(stId);
    await student.getStudentDetails();
    await student.getStudentProgramme();
    await student.getStudentModules();
    var allProgs = await programmes.getAllProgrammes();
    res.render('student', { title: student.name, student: student, programmes: allProgs });
});

// All programmes JSON
app.get("/all-programmes", function(req, res) {
    var sql = 'SELECT * FROM Programmes';
    db.query(sql).then(results => {
        res.json(results);
    });
});

// All programmes formatted
app.get("/all-programmes-formatted", function(req, res) {
    var sql = 'SELECT * FROM Programmes';
    db.query(sql).then(results => {
        res.render('all-programmes', { title: 'All Programmes', data: results });
    });
});

// Single programme page
app.get("/programme-single/:id", async function(req, res) {
    var pCode = req.params.id;
    var pSql = "SELECT * FROM Programmes WHERE id = ?";
    var pResult = await db.query(pSql, [pCode]);
    var modSql = "SELECT * FROM Programme_Modules pm \
                  JOIN Modules m ON m.code = pm.module \
                  WHERE programme = ?";
    var modResult = await db.query(modSql, [pCode]);
    res.render('programme-single', {
        title: pResult[0].name,
        programme: pResult[0],
        modules: modResult
    });
});

// All modules JSON
app.get("/all-modules", function(req, res) {
    var sql = 'SELECT * FROM Modules';
    db.query(sql).then(results => {
        res.json(results);
    });
});

// All modules formatted
app.get("/all-modules-formatted", function(req, res) {
    var sql = 'SELECT * FROM Modules';
    db.query(sql).then(results => {
        res.render('all-modules', { title: 'All Modules', data: results });
    });
});

// Single module page
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
        title: mResult[0].name,
        module: mResult[0],
        programmes: progResult,
        students: studResult
    });
});

// POST - Add note to student
app.post('/add-note', async function(req, res) {
    var params = req.body;
    var student = new Student(params.id);
    try {
        await student.addStudentNote(params.note);
        res.redirect('/student-single/' + params.id);
    } catch (err) {
        console.error('Error adding note', err.message);
        res.send('Error: ' + err.message);
    }
});

// POST - Change student programme
app.post('/allocate-programme', async function(req, res) {
    var params = req.body;
    var student = new Student(params.id);
    try {
        await student.updateStudentProgramme(params.programme);
        res.redirect('/student-single/' + params.id);
    } catch (err) {
        console.error('Error updating programme', err.message);
        res.send('Error: ' + err.message);
    }
});

// db_test routes
app.get("/db_test", function(req, res) {
    var sql = 'SELECT * FROM test_table';
    db.query(sql).then(results => {
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