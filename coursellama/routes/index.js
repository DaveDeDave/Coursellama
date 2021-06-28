'use strict';

const express = require('express');
const db = require('../db/db');
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');
const router = express.Router();

router.get('/', auth.optional, (req, res, next) => {
    if(req.user)
        res.render('index', {ctx: {info: {logged: true}}});
    else
        res.render('index', {ctx: {info: {logged: false}}});
});

router.get('/register', auth.optional, (req, res, next) => {
    if(req.user)
        res.redirect('/profile');
    else
        res.render('register', {ctx: {info: {logged: false, errors: ''}}});
});

router.post('/register', (req, res, next) => {
    const { body } = req;
    const isPasswordStrong = /(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!-\/ ||:-@ || [-` || {-~])(?=.{6,})/;

    if(!body.username)
        return res.render('register', {ctx: {info: {logged: false, errors: 'Username non inserito'}}});
    else if(!body.password || !body.passwordCheck)
        return res.render('register', {ctx: {info: {logged: false, errors: 'Password non inserita'}}});
    else if(body.password != body.passwordCheck)
        return res.render('register', {ctx: {info: {logged: false, errors: 'Le password non combaciano'}}});
    else if(!isPasswordStrong.test(body.password))
        return res.render('register', {ctx: {info: {logged: false, errors: 'La password deve essere almeno lunga sei caratteri, contenere una lettera maiuscola, una minuscola, un numero e un simbolo'}}});
    else if(!body.role || body.role != 'student' && body.role != 'teacher')
        return res.render('register', {ctx: {info: {logged: false, errors: 'Ruolo non riconosciuto'}}});

    db.addUser({username: body.username, password: body.password, role: body.role, name: body.name, surname: body.surname}).then(() => {
        res.redirect('/');
    }).catch((e) => {
        if(e.message == 'UserAlreadyExists')
            res.render('register', {ctx: {info: {logged: false, errors: 'Username già in uso'}}});
        else
            next(e);
    });
});

router.get('/login', auth.optional, (req, res, next) => {
    if(req.user)
        res.redirect('/profile');
    else
        res.render('login', {ctx: {info: {logged: false, errors: ''}}});
});

router.post('/login', (req, res, next) => {
    db.validateUser({username: req.body.username, password: req.body.password}).then((user) => {
        if(user) {
            authController.generateJWT(user).then((token) => {
                res.cookie('au', token, {sameSite: 'Strict'});
                res.redirect('/profile')
            });
        } else {
            res.render('login', {ctx: {info : {logged: false, errors: 'Credenziali sbagliate'}}});
        }
    }).catch(e => next(e));
});

router.get('/logout', (req, res, next) => {
    if(req.cookies.au)
        res.clearCookie("au");
    res.redirect('/');
});

router.get('/about', auth.optional, (req, res, next) => {
    if(req.user)
        res.render('about', {ctx: {info : {logged: true, active: 'about'}}});
    else
        res.render('about', {ctx: {info: {logged: false, active: 'about'}}});
});

module.exports = router;
