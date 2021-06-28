'use strict';

const db = require('../db/db');
const multer  = require('multer');

const upload = multer({ 
    storage: multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, `data/${req.query.c}/${req.query.l}`);
        },
        filename: (req, file, cb) => {
            cb(null, `${file.originalname}`);
        }
    }),
    fileFilter: (req, file, cb) => {
        const { query } = req;

        if(!req.user)
            return cb(null, false);

        if(file.originalname.indexOf('/') != -1 || file.originalname.indexOf('\\') != -1)
            return cb(null, false);

        db.findCourse({id: query.c}).then((course) => {
            if(course.creator == req.user.username) {
                db.findLesson({id: query.l, courseid: query.c}).then((lesson) => {
                    if(lesson) {
                        db.findMaterial({name: file.originalname, lesson: lesson.id}).then((material) => {
                            if(material)
                                cb(new Error('fileAlreadyExist'), false);
                            else
                                db.addMaterial({title: file.originalname, lessonid: query.l}).then(() => {
                                    cb(null, true);
                                }).catch(e => cb(null, false));        

                        }).catch(e => cb(null, false));
         
                    } else
                        cb(null, false);
                }).catch((e) => {
                    cb(null, false);
                });
            } else
                cb(null, false);
        }).catch((e) => {
            cb(null, false);
        });
    }
});

module.exports = upload;
