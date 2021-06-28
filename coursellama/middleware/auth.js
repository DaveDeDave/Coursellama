'use strict';

const authController = require('../controllers/authController');
const db = require('../db/db');

const getToken = (req) => {
    if(req.cookies.au)
        return req.cookies.au
    else
        return null;
}

module.exports = {
    required(req, res, next) {
        const token = getToken(req);
        
        if(!token)
            return next({'code': 'credentialsRequired'});
        else {
            authController.verifyJWT(token).then((result) => {
                if(result.role == 'teacher')
                    db.findTeacher({username: result.username}).then(() => {
                        req.user = {username: result.username, role: result.role};
                        next();
                    }).catch((e) => {
                        if(e.message == 'UserNotExists') {
                            res.clearCookie("au");
                            next({code: 'credentialsRequired'});
                        }
                        else
                            next(e);
                    });
                else if(result.role == 'student')
                    db.findStudent({username: result.username}).then(() => {
                        req.user = {username: result.username, role: result.role};
                        next();
                    }).catch((e) => {
                        if(e.message == 'UserNotExists') {
                            res.clearCookie("au");
                            next({code: 'credentialsRequired'});
                        }
                        else
                            next(e);
                    });
                else {
                    res.clearCookie("au");
                    next({code: 'credentialsRequired'});
                }
            }).catch((e) => {
                res.clearCookie("au");
                next(e);
            });
        }
    },
    optional(req, res, next) {
        const token = getToken(req);

        if(!token)
            return next();
        else {
            authController.verifyJWT(token).then((result) => {
                if(result.role == 'teacher')
                    db.findTeacher({username: result.username}).then(() => {
                        req.user = {username: result.username, role: result.role};
                        next();
                    }).catch((e) => {
                        if(e.message == 'UserNotExists') {
                            res.clearCookie("au");
                            next({code: 'credentialsRequired'});
                        }
                        else
                            next(e);
                    });
                else if(result.role == 'student')
                    db.findStudent({username: result.username}).then(() => {
                        req.user = {username: result.username, role: result.role};
                        next();
                    }).catch((e) => {
                        if(e.message == 'UserNotExists') {
                            res.clearCookie("au");
                            next({code: 'credentialsRequired'});
                        }
                        else
                            next(e);
                    });
                else {
                    res.clearCookie("au");
                    next({code: 'credentialsRequired'});
                }
            }).catch((e) => {
                res.clearCookie("au");
                next(e);
            });
        }
    }
};
