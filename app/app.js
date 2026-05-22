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

// Sessions
var session = require('express-session');
app.use(session({
    secret: 'secretkeysdfjsflyoifasd',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

// Get the functions in the db.js file to use
const db = require('./services/db');

// Get Models
const { Student }   = require("./models/student");
const { Programme } = require("./models/programme");
const programmes    = require("./models/programmes");
const { User }      = require("./models/user");

// -------------------------------------------------------
// ROOT
// -------------------------------------------------------
app.get("/", function(req, res) {
    if (req.session.uid) {
        res.send('Welcome back, user ' + req.session.uid + '! <a href="/logout">Logout</a>');
    } else {
        res.render("index", { title: "SD2 Student App" });
    }
});

// -------------------------------------------------------
// STUDENTS
// -------------------------------------------------------
app.get("/all-students", function(req, res) {
    var sql = 'SELECT * FROM Students';
    db.query(sql).then(results => {
        res.json(results);
    });
});

app.get("/all-students-formatted", function(req, res) {
    var sql = 'SELECT * FROM Students';
    db.query(sql).then(results => {
        res.render('all-students', { title: 'All Students', data: results });
    });
});

app.get("/student-single/:id", async function(req, res) {
    var stId = req.params.id;
    var student = new Student(stId);
    await student.getStudentDetails();
    await student.getStudentProgramme();
    await student.getStudentModules();
    var allProgs = await programmes.getAllProgrammes();
    res.render('student', { title: student.name, student: student, programmes: allProgs });
});

// -------------------------------------------------------
// PROGRAMMES
// -------------------------------------------------------
app.get("/all-programmes", function(req, res) {
    var sql = 'SELECT * FROM Programmes';
    db.query(sql).then(results => {
        res.json(results);
    });
});

app.get("/all-programmes-formatted", function(req, res) {
    var sql = 'SELECT * FROM Programmes';
    db.query(sql).then(results => {
        res.render('all-programmes', { title: 'All Programmes', data: results });
    });
});

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

// -------------------------------------------------------
// MODULES
// -------------------------------------------------------
app.get("/all-modules", function(req, res) {
    var sql = 'SELECT * FROM Modules';
    db.query(sql).then(results => {
        res.json(results);
    });
});

app.get("/all-modules-formatted", function(req, res) {
    var sql = 'SELECT * FROM Modules';
    db.query(sql).then(results => {
        res.render('all-modules', { title: 'All Modules', data: results });
    });
});

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

// -------------------------------------------------------
// WEEK 7 - CRUD
// -------------------------------------------------------
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

// -------------------------------------------------------
// WEEK 8 - AUTHENTICATION
// -------------------------------------------------------
app.get('/register', function(req, res) {
    res.render('register', { title: 'Register' });
});

app.get('/login', function(req, res) {
    res.render('login', { title: 'Login' });
});

app.post('/set-password', async function(req, res) {
    var params = req.body;
    var user = new User(params.email);
    try {
        var uId = await user.getIdFromEmail();
        if (uId) {
            await user.setUserPassword(params.password);
            res.send('Password set! <a href="/login">Login now</a>');
        } else {
            await user.addUser(params.password);
            res.send('Account created! <a href="/login">Login now</a>');
        }
    } catch (err) {
        console.error('Error setting password', err.message);
        res.send('Error: ' + err.message);
    }
});

app.post('/authenticate', async function(req, res) {
    var params = req.body;
    var user = new User(params.email);
    try {
        var uId = await user.getIdFromEmail();
        if (uId) {
            var match = await user.authenticate(params.password);
            if (match) {
                req.session.uid = uId;
                req.session.loggedIn = true;
                res.redirect('/student-single/' + uId);
            } else {
                res.send('Invalid password. <a href="/login">Try again</a>');
            }
        } else {
            res.send('Invalid email. <a href="/login">Try again</a>');
        }
    } catch (err) {
        console.error('Error during login', err.message);
        res.send('Error: ' + err.message);
    }
});

app.get('/logout', function(req, res) {
    req.session.destroy();
    res.redirect('/login');
});

// -------------------------------------------------------
// ORIGINAL ROUTES
// -------------------------------------------------------
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