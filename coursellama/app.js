'use strict';

const express = require('express');
const cookieParser = require('cookie-parser');
const db = require('./db/db');
const errorHandler = require('./middleware/errorHandler');
const index = require('./routes/index');
const profile = require('./routes/profile');
const courses = require('./routes/courses');
const teachers = require('./routes/teachers');
const app = express();

//EXPRESS SETTING
app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static('public'));
app.disable('x-powered-by');

//ROUTING
app.use('/', index);
app.use('/profile', profile);
app.use('/courses', courses);
app.use('/teachers', teachers);
app.use(errorHandler);

//DEFAULT RESPONSE FOR INVALID URL
app.all('*', (req, res, next) => {
    res.status(404).render('error/400', {ctx: {info: {logged: req.cookies.au ? true : false}}});
});

//SQLITE - IF DB DOESN'T EXIST I CREATE IT - IF DB DOESN'T INIT CLOSE THE APP
db.init().catch((e) => {
    console.log(e);
    process.exit(0);
});

//EXPRESS PORT LISTEN
app.listen(process.env.PORT || 3000, () => {
    console.log(`Server started succesfully at localhost:${process.env.PORT || 3000}`);
});
