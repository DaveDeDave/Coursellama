'use strict';

const express = require('express');
const fs = require('fs');
const upload = require('../middleware/upload');
const auth = require('../middleware/auth');
const db = require('../db/db');
const csrf = require('csurf');
const csrfProtection = csrf({ cookie: true });
const router = express.Router();

router.get('/', auth.optional, (req, res, next) => {
    db.showCategory().then((category) => {
        db.showTeachers().then((teachers) => {
            const filter = {title: req.query.search ? `%${req.query.search}%` : '%', category: req.query.category ? req.query.category : '%', creator: req.query.teacher ? req.query.teacher : '%'};
            db.filterCourses(filter).then((courses) => {
                if(req.user)
                    res.render('courses/courses', ({ctx: {courses, category, teachers, info: {logged: true, active: 'courses'}}}));
                else
                    res.render('courses/courses', ({ctx: {courses, category, teachers, info: {logged: false, active: 'courses'}}}));
            }).catch(e => next(e));
        }).catch(e => next(e));
    }).catch(e => next(e));
});

router.post('/subscribe', auth.required, csrfProtection, (req, res, next) => {
    db.findCourse({id: req.body.courseid}).then((course) => {
        if(course.creator == req.user.username)
            return res.redirect('/profile');
        if(course) {
            db.subscribe(course.id, req.user.username).then(() => {
                res.redirect(`/courses/${course.id}`);
            }).catch(e => next(e));
        } else
            res.redirect('/courses');
    }).catch(e => next(e));
});

router.post('/unsubscribe', auth.required, csrfProtection, (req, res, next) => {
    db.findCourse({id: req.body.courseid}).then((course) => {
        if(course.creator == req.user.username)
            return res.redirect('/profile');
        if(course) {
            db.unsubscribe(course.id, req.user.username).then(() => {
                res.redirect('/courses');
            }).catch(e => next(e));
        } else
            res.redirect('/courses');
    }).catch(e => next(e));
});

router.get('/new', auth.required, csrfProtection, (req, res, next) => {
    const { query } = req;

    if(req.user.role != 'teacher')
        next({code: 'notAuthorized'});
    else {
        if(query.action == 'createCourse') {
            db.showCategory().then(category => {
                res.render('courses/newCourse', {ctx: {category, info: {logged: true, errors: ''}, csrfToken: req.csrfToken()}});
            }).catch(e => next(e));
        } else if(query.action == 'createLesson') {
            res.render('courses/newLesson', {ctx: {course: {id: query.c}, info: {logged: true, errors: ''}, csrfToken: req.csrfToken()}});
        } else if(query.action == 'loadMaterial') {
            res.render('courses/newMaterial', {ctx: {lesson: {id: query.l, courseid: query.c}, info: {logged: true}, csrfToken: req.csrfToken()}});
        } else
            next({code: 'notFound'});
    }
});

router.post('/new', auth.required, csrfProtection, (req, res, next) => {
    const { body } = req;

    if(req.user.role != 'teacher')
        next({code: 'notAuthorized'});
    else {
        if(body.action == 'createCourse') {
            if(!body.title || !body.category) {
                return db.showCategory().then(category => {
                    res.render('courses/newCourse', {ctx: {category, info: {logged: true, errors: 'titolo o categoria mancante'}, csrfToken: req.csrfToken()}});
                }).catch(e => next(e));
            }
    
            if(body.guest == undefined)
                body.guest = 0;

            if(body.description.length > 300)
                return db.showCategory().then(category => {
                    res.render('courses/newCourse', {ctx: {category, info: {logged: true, errors: 'La descrizione non può superare i 300 caratteri'}, csrfToken: req.csrfToken()}});
                }).catch(e => next(e));

            db.addCourse({title: body.title, description: body.description, guest: body.guest, category: body.category, creator: req.user.username}).then(() => {
                res.redirect('/profile');
            }).catch((e) => {
                if(e.message == 'titleAlreadyExists') {
                    db.showCategory().then((category) => {
                        res.render('courses/newCourse', {ctx: {category, info: {logged: true, errors: 'Hai tentato di inserire un corso con un nome già esistente'}, csrfToken: req.csrfToken()}});
                    }).catch(e => next(e));
                } else
                    next(e);
            });
        } else if(body.action == 'createLesson') {
            db.findCourse({id: body.c}).then((course) => {
                if(course.creator == req.user.username) {
                    if(typeof(body.titles) === 'object') {
                        let addAllLessons = [];
                        for(let i in body.titles) {
                            for(let title of body.titles.slice(i+1))
                                if(body.titles[i] == title)
                                    return res.render('courses/newLesson', {ctx: {course: {id: body.c}, info: {logged: true, errors: 'Hai tentato di inserire una o delle lezioni con un titolo già esistente'}, csrfToken: req.csrfToken()}});
                            addAllLessons.push(new Promise((resolve, reject) => {
                                db.addLesson({title: body.titles[i], courseid: body.c}).then(() => {
                                    resolve();
                                }).catch(e => reject(e));
                            }));
                        }

                        Promise.all(addAllLessons).then(() => {
                            res.redirect(`/courses/${body.c}`);
                        }).catch((e) => {
                            if(e.message == 'titleAlreadyExists')
                                res.render('courses/newLesson', {ctx: {course: {id: body.c}, info: {logged: true, errors: 'Hai tentato di inserire una o delle lezioni con un titolo già esistente'}, csrfToken: req.csrfToken()}});
                            else
                                next(e);
                        });
                    } else {
                        db.addLesson({title: body.titles, courseid: body.c}).then(() => {
                            res.redirect(`/courses/${body.c}`);
                        }).catch((e) => {
                            if(e.message == 'titleAlreadyExists')
                                res.render('courses/newLesson', {ctx: {course: {id: body.c}, info: {logged: true, errors: 'Hai tentato di inserire una o delle lezioni con un titolo già esistente'}, csrfToken: req.csrfToken()}});
                            else
                                next(e);
                        });
                    }
                } else
                    next({code: 'notAuthorized'})
            }).catch(e => next(e));
        } else {
            next({code: 'notFound'});
        }
        
    }
});

router.post('/load', auth.required, csrfProtection, upload.array('materials'), (req, res, next) => {
    if(req.files.length != 0) {
        res.status(200).send('OK');
    } else {
        res.status(400).send('ERROR');
    }
});

router.post('/delete', auth.required, csrfProtection, (req, res, next) => {
    const { body } = req;

    db.findCourse({id: body.courseid}).then((course) => {
        if(course.creator == req.user.username) {
            if(body.action == 'deleteCourse') {
                db.deleteCourse({id: course.id}).then(() => {
                    res.redirect('/profile');
                }).catch(e => next(e));
            } else if(body.action == 'deleteLesson') {
                db.deleteLesson({courseid: course.id, id: body.lessonid}).then(() => {
                    res.redirect(`/courses/${body.courseid}`);
                }).catch(e => next(e));
            } else if(body.action == 'deleteMaterial') {
                db.deleteMaterial({courseid: course.id, lessonid: body.lessonid, id: body.materialid}).then(() => {
                    res.redirect(`/courses/${body.courseid}`);
                }).catch(e => next(e));
            } else
                next({code: 'notFound'});
        } else
            next({code: 'notAuthorized'})
    }).catch(e => next(e));
});

router.get('/:courseid', auth.optional, csrfProtection, (req, res, next) => {
    db.findCourse({id: req.params.courseid}).then((course) => {
        if(!course) {
            next({code: 'notFound'});
        } else {
            db.showLessons({id: course.id}).then((lessons) => {
                let showAllMaterial = [];
                for(let lesson of lessons) {
                    showAllMaterial.push(new Promise(resolve => {
                        db.showMaterials({id: lesson.id}).then((materials) => {
                            lesson.materials = materials;
                            resolve();
                        }).catch(e => reject(e));
                    }));
                }
                
                Promise.all(showAllMaterial).then(() => {
                    if(req.user) {
                        if(req.user.username == course.creator)
                            return res.render('courses/course', ({ctx: {course, lessons, user: req.user, info: {logged: true, subscribed: false, admin: true}, csrfToken: req.csrfToken()}}));
                        db.isSubscribed(course.id, req.user.username).then((subscribed) => {
                            if(!course.guest && !subscribed)
                                res.render('courses/subscribeCourse', ({ctx: {course: course, user: req.user, info: {logged: true, subscribed: false, admin: false}, csrfToken: req.csrfToken()}}));
                            else
                                res.render('courses/course', ({ctx: {course, lessons, user: req.user, info: {logged: true, subscribed, admin: false}, csrfToken: req.csrfToken()}}));
                        }).catch(e => next(e));
                    } else {
                        if(!course.guest)
                            next({code: 'notAuthorized'});
                        else
                            res.render('courses/course', ({ctx: {course, lessons, user: req.user, info: {logged: false, subscribed: false, admin: false}, csrfToken: req.csrfToken()}}));
                    }  
                }).catch(e => next(e));
            }).catch(e => next(e));
        }
    }).catch(e => next(e));
});

router.get('/:courseid/ask', auth.required, csrfProtection, (req, res, next) => {
    if(req.user.role == 'teacher')
        return next({code: 'notAuthorized'});

    db.findCourse({id: req.params.courseid}).then((course) => {
        if(!course) {
            next({code: 'notFound'});
        } else {
            db.isSubscribed(course.id, req.user.username).then((subscribed) => {
                if(!subscribed)
                    next({code: 'notAuthorized'});
                else
                    res.render('courses/ask', ({ctx: {course, info: {logged: true, errors: ''}, csrfToken: req.csrfToken()}}));
            }).catch(e => next(e));
        }
    }).catch(e => next(e));
});

router.post('/:courseid/ask', auth.required, csrfProtection, (req, res, next) => {
    const { body } = req;

    if(req.user.role == 'teacher')
        return next({code: 'notAuthorized'});

    db.findCourse({id: req.params.courseid}).then((course) => {
        if(!course) {
            next({code: 'notFound'});
        } else {
            db.isSubscribed(course.id, req.user.username).then((subscribed) => {
                if(!subscribed)
                    next({code: 'notAuthorized'});
                else {
                    if(!body.question)
                        res.render('courses/ask', ({ctx: {course, info : {logged: true, errors: 'Non hai inserito nessuna domanda'}}}));
                    else if(body.question.length > 300)
                        res.render('courses/ask', ({ctx: {course, info: {logged: true, errors: 'La domanda supera 300 caratteri'}}}));
                    else
                        db.ask({message: body.question, student: req.user.username, courseid: course.id}).then(() => {
                            res.redirect(`/courses/${req.params.courseid}`);
                        }).catch(e => next(e));
                }
            }).catch(e => next(e));
        }
    }).catch(e => next(e));
});

router.get('/:courseid/questions', auth.optional, csrfProtection, (req, res, next) => {
    db.findCourse({id: req.params.courseid}).then((course) => {
        if(!course) {
            next({code: 'notFound'});
        } else {
            if(req.user) {
                if(req.user.username == course.creator)
                    return db.showQuestions(course.id).then((questions) => {
                        res.render('courses/questions', {ctx: {questions, course, info: {logged: true, admin: true}, csrfToken: req.csrfToken()}});
                    }).catch(e => next(e));
                db.isSubscribed(course.id, req.user.username).then((subscribed) => {
                    if(!course.guest && !subscribed)
                        next({code: 'notAuthorized'});
                    else {
                        db.showQuestions(course.id).then((questions) => {
                            res.render('courses/questions', {ctx: {questions, course, info: {logged: true, admin: false}}});
                        }).catch(e => next(e));
                    }
                }).catch(e => next(e));
            } else {
                if(!course.guest)
                    next({code: 'notAuthorized'});
                else
                    db.showQuestions(course.id).then((questions) => {
                        res.render('courses/questions', {ctx: {questions, course, info: {logged: false, admin: false}}});
                    }).catch(e => next(e));
                }
        }
    }).catch(e => next(e));
});

router.get('/:courseid/:lessonid/:filename', auth.optional, (req, res, next) => {
    const file = `./data/${req.params.courseid}/${req.params.lessonid}/${req.params.filename}`;

    db.findCourse({id: req.params.courseid}).then((course) => {
        if(!course) {
            next({code: 'notFound'});
        } else {
            if(!course.guest) {
                if(req.user) {
                    if(req.user.username == course.creator)
                        fs.readFile(file, (err, data) => {
                            if(err)
                                next(err);
                            else {
                                if(req.query.action == 'show')
                                    res.contentType('application/pdf');
                                res.send(data);
                            }
                        });
                    else
                        db.isSubscribed(course.id, req.user.username).then((subscribed) => {
                            if(subscribed)
                                fs.readFile(file, (err, data) => {
                                    if(err)
                                        next({code: 'notFound'});
                                    else {
                                        if(req.query.action == 'show')
                                            res.contentType('application/pdf');
                                        res.send(data);
                                    }
                                });
                            else
                                next({code: 'notAuthorized'});
                        }).catch(e => next(e));
                } else
                    next({code: 'notAuthorized'});
            } else {
                fs.readFile(file, (err, data) => {
                    if(err)
                        next({code: 'notFound'});
                    else {
                        if(req.query.action == 'show')
                            res.contentType('application/pdf');
                        res.send(data);
                    }
                });            
            }
        }
    }).catch(e => next(e));
});

module.exports = router;
