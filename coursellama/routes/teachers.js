'use strict';

const express = require('express');
const auth = require('../middleware/auth');
const db = require('../db/db');
const router = express.Router();

router.get('/', auth.optional, (req, res, next) => {
        const filter = req.query.search ? `%${req.query.search}%` : '%';
        db.filterTeacher(filter).then((teachers) => {
            if(req.user)
                res.render('teachers/teachers', {ctx: {teachers, info: {logged: true, active: 'teachers'}}});
            else
                res.render('teachers/teachers', {ctx: {teachers, info: {logged: false, active: 'teachers'}}});
        }).catch(e => next(e));
});

module.exports = router;
