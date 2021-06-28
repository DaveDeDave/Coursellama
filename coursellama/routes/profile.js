'use strict';

const express = require('express');
const auth = require('../middleware/auth');
const db = require('../db/db');
const csrf = require('csurf');
const csrfProtection = csrf({ cookie: true });
const router = express.Router();

router.get('/', auth.required, csrfProtection, (req, res, next) => {
    db.getUserInfo(req.user.username).then((userdata) => {
        req.user.name = userdata.name;
        req.user.surname = userdata.surname;
        req.user.profile_image = userdata.profile_image;
        if(req.user.role == 'teacher') {
            db.showTeacherCourses(req.user).then((teachedCourses) => {
                db.showSubscribedCourses(req.user).then((courses) => {
                    db.showUnrepliedQuestionsNumber(req.user.username).then((notification) => {
                        res.render('profile/profile', {ctx: {user: req.user, courses, teachedCourses, info: {logged: true, notification}, csrfToken: req.csrfToken()}});
                    }).catch(e => next(e));
                }).catch(e => next(e));
            }).catch(e => next(e));
        } else {
            db.showSubscribedCourses(req.user).then((courses) => {
                res.render('profile/profile', {ctx: {user: req.user, courses, info: {logged: true}, csrfToken: req.csrfToken()}});
            }).catch(e => next(e));
        }
    }).catch(e => next(e));
});

router.get('/change', auth.required, csrfProtection, (req, res, next) => {
    db.getUserInfo(req.user.username).then((userdata) => {
        req.user.name = userdata.name;
        req.user.surname = userdata.surname;
        req.user.profile_image = userdata.profile_image;
        if(req.user.role == 'teacher')
            db.filterTeacher(req.user.username).then((teacherdata) => {
                req.user.bio = teacherdata[0].bio;
                res.render('profile/changeInfo', {ctx: {user: req.user, info: {logged: true, errors: ''}, csrfToken: req.csrfToken()}});
            }).catch(e => next(e));
        else
            res.render('profile/changeInfo', {ctx: {user: req.user, info: {logged: true, errors: ''}, csrfToken: req.csrfToken()}});
    }).catch(e => next(e));
});

router.post('/change', auth.required, csrfProtection, (req, res, next) => {
    const { body } = req;
    
    req.user.name = body.name;
    req.user.surname = body.surname;
    req.user.profile_image = body.profile_image;
    db.changeInfo(req.user).then(() => {
        if(req.user.role == 'teacher') {
            if(body.bio.length > 300)
                return res.render('profile/changeInfo', {ctx: {user: req.user, info: {logged: true, errors: 'La biografia non può superare i 300 caratteri'}}});
            req.user.bio = body.bio;
            db.addBioTeacher(req.user).then(() => {
                res.redirect('/profile');
            }).catch(e => next(e));
        } else
            res.redirect('/profile');
    }).catch(e => next(e));
});

router.post('/delete', auth.required, csrfProtection, (req, res, next) => {
    if(req.user.role == 'teacher') {
        db.showTeacherCourses({username: req.user.username}).then((courses) => {
            let deleteAllCourses = []
            for(let course of courses)
                deleteAllCourses.push(new Promise((resolve, reject) => {
                    db.deleteCourse({id: course.id}).then(() => resolve()).catch(e => reject(e));
                }));
            Promise.all(deleteAllCourses).then(() => {
                db.deleteUser(req.user.username).then(() => {
                    res.clearCookie("au");
                    res.redirect('/');
                }).catch(e => next(e));
            }).catch(e => next(e));
        }).catch(e => next(e));
    } else
        db.deleteUser(req.user.username).then(() => {
            res.clearCookie("au");
            res.redirect('/');
        }).catch(e => next(e));
});

router.get('/questions', auth.required, csrfProtection, (req, res, next) => {
    if(req.user.role != 'teacher')
        next({code: 'notAuthorized'});
    else {
        db.showUnrepliedQuestions(req.user.username).then((questions) => {
            res.render('profile/questions', {ctx: {questions: questions, info: {logged: true}, csrfToken: req.csrfToken()}});
        }).catch(e => next(e));
    }
});

router.get('/questions/answer', auth.required, csrfProtection, (req, res, next) => {
    if(req.user.role != 'teacher')
        next({code: 'notAuthorized'});
    else {
        db.findQuestion(req.query.q, req.user.username).then((question) => {
            if(!question)
                next({code: 'notAuthorized'});
            else
                res.render('profile/answerQuestion', {ctx: {question, info: {logged: true, errors: ''}, csrfToken: req.csrfToken()}});
        }).catch(e => next(e));
    }
});

router.post('/questions/answer', auth.required, csrfProtection, (req, res, next) => {
    const { body } = req;

    if(req.user.role != 'teacher')
        next({code: 'notAuthorized'});
    else {
        db.findQuestion(body.q, req.user.username).then((question) => {
            if(!question)
                next({code: 'notAuthorized'});
            else {
                if(!body.message)
                    res.render('profile/answerQuestion', {ctx: {question, info: {logged: true, errors: 'Non hai inserito nessuna risposta'}}});
                else if(body.message.length > 300)
                    res.render('profile/answerQuestion', {ctx: {question, info: {logged: true, errors: 'La risposta non può superare i 300 caratteri'}}});
                else
                    db.answer({message: body.message, id: body.q}).then(() => {
                        res.redirect('/profile/questions');
                    }).catch(e => next(e));
            }
        }).catch(e => next(e));
    }
});

router.post('/questions/delete', auth.required, csrfProtection, (req, res, next) => {
    const { body } = req;

    if(req.user.role != 'teacher')
        next({code: 'notAuthorized'});
    else {
        db.findAnyQuestion(body.q, req.user.username).then((question) => {
            if(!question)
                next({code: 'notAuthorized'});
            else {
                db.deleteQuestion(body.q).then(() => {
                    res.redirect(`${body.previousLocation}`);
                }).catch(e => next(e));
            }
        }).catch(e => next(e));
    }
});

module.exports = router;
