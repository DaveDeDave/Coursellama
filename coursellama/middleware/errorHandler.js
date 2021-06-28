'use strict';

module.exports = (err, req, res, next) => {
    if(err.code === 'credentialsRequired' || err.code === 'notAuthorized' || err.code == 'EBADCSRFTOKEN') {
        res.status(403).render('error/400', {ctx: {info: {logged: req.user ? true : false}}});
    } else if(err.name === 'TokenExpiredError') {
        res.render('login', {ctx: {info: {errors: 'Token scaduto. Rieseguire l\'accesso.'}}});
    } else if(err.name == 'JsonWebTokenError') {
        res.render('login', {ctx: {info: {errors: 'Token non valido. Rieseguire l\'accesso'}}});
    } else if(err.code == 'notFound') {
        res.status(404).render('error/400', {ctx: {info: {logged: req.user ? true : false}}});
    } else if(err.message == 'fileAlreadyExist') {
        res.status(400).send('fileAlreadyExist');
    } else {
        console.log(err);
        res.status(500).render('error/500', {ctx: {info: {logged: req.user ? true : false}}});
    }
}
