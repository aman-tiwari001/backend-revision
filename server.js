const express = require('express');
const model = require('./db');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const app = express();

//Middleware - It is a function that runs after request is made by user and before it gets forwarded to that particular route.

app.use(express.json());
app.use((req, res, next) => {
    console.log("Hi this is first middleware!");
    next();
});

app.use(express.static('./public'));

app.set('view engine', 'ejs');

app.use(cookieParser());

app.use(session({
    resave: false,
    saveUninitialized: false,
    secret: "random-key"
}));

//GET Routes

app.get('/', function (req, res) {
    res.send("Hello this is GET '/' route");
});

app.get('/about', function (req, res) {
    res.send("Hello this is GET '/about' route");
});

app.get('/post/likers', function (req, res) {
    res.json({ msg: "Likers list" });
});

//Serving html page using ejs template on route

app.get('/home', function (req, res) {
    res.render('home', { name: "AMAN TIWARI" });
});

app.get('/newpage', (req, res) => {
    res.render('new');
});

//Accessing the route params
app.get('/profile/:user', (req, res) => { // dynamic route
    console.log(req.params);
    res.send(`Hello from ${req.params.user}`);
});


//  DB related routes
app.get('/createUser', async function (req, res) {  // to create a new document in a collection.
    const createdUser = await model.userModel.create({
        name: "Aman Tiwari",
        age: 20,
        email: "aman@gmail.com"
    });
    res.send(createdUser);
});

app.get('/findalluser', async function (req, res) { // to get array of all documents of a collection.
    const results = await model.userModel.find();
    res.send(results);
});

app.get('/finduser', async function (req, res) { // to get array of all documents of a collection.
    const results = await model.userModel.findOne({ name: "Aman Tiwari" });
    res.send(results);
});

app.get('/deluser', async function (req, res) { // to delete a document in a collection
    const delUser = await model.userModel.findOneAndDelete({ name: "new" });
    res.send(delUser);
});

// Sessions - data stored in server (active till server-client communication is happening)

app.get('/ban', (req, res) => { // creating session on server
    req.session.ban = true;
    res.send('<h1>You are banned Now!</h1>');
});

app.get('/checkban', (req, res) => { // reading session from server
    if (req.session.ban)
        res.send('<h1>Yes, you are banned!</h1>');
    else
        res.send('<h1>Not banned!</h1>');
});

app.get('/removeban', (req, res) => { // deleting session from server
    req.session.destroy((err) => {
        if (err)
            throw err;
        res.send("<h1>Ban removed</h1>");
    });
});

// Cookies - stored in client side (locally in browser)
app.get('/cookie', (req, res) => { // create cookie on browser
    res.cookie('cookie', 'random');
    res.send('<h1>Cookie set</h1>')
});

app.get('/getcookie', (req, res) => { // read/get cookie from client browser and get it on server
    res.send(`<h1>${req.cookies.cookie}</h1>`)
});

app.get('/delcookie', (req, res) => { // sending req from server tp del cookie on client side
    res.clearCookie('cookie');
    res.send(`<h1>Cookie deleted</h1>`)
});

app.get('/update', async function (req, res) { // to update a document in a collection
    const updatedUser = await model.userModel.findOneAndUpdate({ name: "Aman Tiwari" }, { name: "random", age: 19, email: "random@gmail.com" });
    res.send(updatedUser);
});

// New routes for intermediate mongodb
app.get('/develop', async (req, res) => {
    const created = await model.testModel.create({
        username: "AMAN TIWARI",
        nickname: "kamath",
        description: "i am youngest billionaire in india",
        categories: ['business', 'talks', 'ceo', 'finance'],
    });
    res.send(created);
});

app.get('/search', async (req, res) => {
    const regex = new RegExp("^AMAN$", 'i');
    const resp = await model.testModel.find({ username: regex });
    res.send(resp);
});

app.get('/search/cat', async (req, res) => {
    const resp = await model.testModel.find({ categories: { $all: ["business"] } });
    res.send(resp);
});

app.get('/search/by/date', async (req, res) => {
    const date1 = new Date("2023-11-28");
    const date2 = new Date("2023-11-29");
    const resp = await model.testModel.find({ datacreated: { $gte: date1, $lte: date2 } });
    res.send(resp);
});

// Authentication
app.post('/register', async (req, res) => {
    const alreadyUser = await model.authModel.findOne({
        email: req.body.email
    });
    if (!req.body.name || !req.body.email || !req.body.password) {
        res.status(400).json({ msg: "All fields are required!" });
        return;
    }
    if (alreadyUser) {
        res.status(403).json({ msg: "User already exist with this email!" });
        return;
    }
    // email validation using regexp is left
    // name should contain only text (no numbers or symbols allowed)
    if (req.body.password.length < 6) {
        res.status(400).json({ msg: "Password must be atleast 6 chars long!" });
        return;
    }
    const user = await model.authModel.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
    });
    res.send(user);
});

app.post('/login', async (req, res) => {
    const user = await model.authModel.findOne({
        email: req.body.email,
    });
    if (!req.body.email || !req.body.password) {
        res.status(400).json({ msg: "All fields are required!" });
        return;
    }
    if (!user) {
        res.status(404).json({ msg: "Email doesn't exist!" });
        return;
    }
    if (user.password === req.body.password) {
        res.send({ ...user, msg: "You are logged in!" });
    }
    else {
        res.status(401).json({ msg: "Incorrect password" });
    }
});


//Express server listening on port 4000
app.listen(4000, () => {
    console.log('🚀 Server listening @ port 4000');
});