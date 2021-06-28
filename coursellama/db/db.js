'use strict';

const sqlite3 = require('sqlite3');
const bcrypt = require('bcrypt');
const fs = require('fs');
const fse = require('fs-extra');

const getDBInstance = () => {
    const db = new sqlite3.Database('./db/db.sqlite');
    db.run('PRAGMA foreign_keys = ON');
    return db;
};

const loadSampleData = () => {
    fs.rmdir(`./data`, {recursive: true}, async (err) => {
        await fse.copy('./data_sample', './data');
    });
};

module.exports = {
    async init() {
        fs.access('./db/db.sqlite', (err) => {
            if(err) {
                const db = getDBInstance();
                const query = fs.readFileSync('./db/schema.sql', 'utf8');
                const inputs = fs.readFileSync('./db/inputs.sql', 'utf8');
                db.serialize(() => {
                    db.exec(query);
                    db.exec(inputs, async (err) => {
                        if(err)
                            console.log(err);
                        await loadSampleData();
                        db.close();
                    });
                });
            } 
        });
    },
    async addUser(user) {
        const db = getDBInstance();
        const saltRounds = 10;
        const hash = await bcrypt.hash(user.password, saltRounds);
        return new Promise((resolve, reject) => {
            db.get('SELECT username FROM user WHERE username = ? ', user.username, (err, row) => {
                if(err) {
                    db.close();
                    reject(err);
                }
                if(row) {
                    db.close();
                    reject(new Error('UserAlreadyExists'));
                } else {
                    db.run('INSERT INTO user VALUES (?, ?, ?, ?, ?, NULL)', user.username, hash, user.role, user.name, user.surname, (err) => {
                        if(err) {
                            db.close();
                            reject(err);
                        } else {
                            if(user.role == 'student')
                                db.run('INSERT INTO student VALUES (?)', user.username, (err) => {
                                    if(err) {
                                        db.run('DELETE FROM user where username = ?', user.username, () => {
                                            db.close();
                                            reject(err);
                                        });
                                    } else {
                                        db.close();
                                        resolve();
                                    }
                                });
                            else
                                db.run('INSERT INTO teacher VALUES (?, NULL)', user.username, () => {
                                    if(err) {
                                        db.run('DELETE FROM user where username = ?', user.username, () => {
                                            db.close();
                                            reject(err);
                                        });
                                    } else {
                                        db.close();
                                        resolve();
                                    }
                                });
                        }
                    });
                }
            });
        });
    },
    findStudent(student) {
        const db = getDBInstance();
        return new Promise((resolve, reject) => {
            db.get('SELECT username FROM student WHERE username = ?', student.username, (err, row) => {
                db.close();
                if(err)
                    reject(err);
                if(!row)
                    reject(new Error('UserNotExists'));
                else
                    resolve();
            });
        });
    },
    findTeacher(teacher) {
        const db = getDBInstance();
        return new Promise((resolve, reject) => {
            db.get('SELECT username FROM teacher WHERE username = ?', teacher.username, (err, row) => {
                db.close();
                if(err)
                    reject(err);
                if(!row)
                    reject(new Error('UserNotExists'));
                else
                    resolve();
            });
        });
    },
    async validateUser(user) {
        const db = getDBInstance();
        return new Promise((resolve, reject) =>  {
            db.get('SELECT password, role FROM user WHERE username = ? ', user.username, async (err, row) => {
                db.close();
                if(err)
                    reject(err);
                if(!row) {
                    resolve(false);
                } else {
                    const result = await bcrypt.compare(user.password, row.password);
                    if(result)
                        return resolve({username: user.username, password: row.password, role: row.role});
                    else
                        return resolve(false);
                }
            });
        });
    },
    getUserInfo(username) {
        const db = getDBInstance();
        return new Promise((resolve, reject) => {
            db.get('SELECT name, surname, profile_image FROM user WHERE username = ?', username, (err, row) => {
                if(err)
                    reject(err);
                if(row)
                    resolve(row);
                else
                    reject({code: 'notFound'});
            });
        });
    },
    changeInfo(user) {
        const db = getDBInstance();
        return new Promise((resolve, reject) => {
            db.run('UPDATE user SET name = ?, surname = ?, profile_image = ? WHERE username = ?', user.name, user.surname, user.profile_image, user.username, (err) => {
                if(err)
                    reject(err);
                else
                    resolve();
            });
        });
    },
    addBioTeacher(user) {
        const db = getDBInstance();
        return new Promise((resolve, reject) => {
            db.run('UPDATE teacher SET bio = ? WHERE username = ?', user.bio, user.username, (err) => {
                if(err)
                    reject(err);
                else
                    resolve();
            });
        });
    },
    deleteUser(username) {
        const db = getDBInstance();
        return new Promise((resolve, reject) => {
            db.run('DELETE FROM user WHERE username = ?', username, (err) => {
                if(err)
                    reject(err);
                else
                    resolve();
            });
        });
    },
    addCourse(course) {
        const db = getDBInstance();
        return new Promise((resolve, reject) => {
            db.get('SELECT * FROM course WHERE title = ? and creator = ?', course.title, course.creator, (err, row) => {
                if(err) {
                    db.close();
                    reject(err);
                }
                if(row) {
                    db.close();
                    reject(new Error('titleAlreadyExists'));
                } else {
                    db.run('INSERT INTO course (title, description, guest, category, creator) VALUES (?, ?, ?, ?, ?)', course.title, course.description, course.guest, course.category, course.creator, (err) => {
                        if(err) {
                            db.close();
                            reject(err);
                        }
                        db.get('SELECT id from course where title = ?', course.title, (err, row) => {
                            db.close();
                            if(err)
                                reject(err);
                            if(row) {
                                fs.access(`./data/${row.id}`, (err) => {
                                    if(err) {
                                        fs.mkdir(`./data/${row.id}`, (err) => {
                                            if(err)
                                                reject(err);
                                            else
                                                resolve();
                                        });
                                    } else
                                        resolve();
                                });
                            } else
                                reject({code: 'addFailed'});
                        });
                    });
                }
            });
        });
    },
    findCourse(course) {
        const db = getDBInstance();
        return new Promise((resolve, reject) => {
            db.get('SELECT * FROM course WHERE id = ?', course.id, (err, row) => {
                db.close();
                if(err)
                    reject(err);
                if(!row)
                    resolve(false);
                else
                    resolve(row);
            });
        });
    },
    deleteCourse(course) {
        const db = getDBInstance();
        return new Promise((resolve, reject) => {
            db.run('DELETE FROM course WHERE id = ?', course.id, (err) => {
                db.close();
                if(err)
                    reject(err);
                fs.access(`./data/${course.id}`, (err) => {
                    if(!err) {
                        fs.rmdir(`./data/${course.id}`, {recursive: true}, (err) => {
                            if(err)
                                reject(err);
                            else
                                resolve();
                        });
                    } else
                        resolve();
                });
            });
        });
    },
    addLesson(lesson) {
        const db = getDBInstance();
        return new Promise((resolve, reject) => {
            db.get('SELECT * FROM lesson where title = ? and course = ?', lesson.title, lesson.courseid, (err, row) => {
                if(err) {
                    db.close();
                    reject(err);
                }
                if(row) {
                    db.close();
                    reject(new Error('titleAlreadyExists'));
                } else {
                    db.run('INSERT INTO lesson (title, course) VALUES (?, ?)', lesson.title, lesson.courseid, (err) => {
                        if(err) {
                            db.close();
                            reject(err);
                        }
                        db.get('SELECT id FROM lesson where title = ? and course = ?', lesson.title, lesson.courseid, (err, row) => {
                            db.close();
                            if(err)
                                reject(err);
                            if(row) {
                                fs.access(`./data/${lesson.courseid}/${row.id}`, (err) => {
                                    if(err) {
                                        fs.mkdir(`./data/${lesson.courseid}/${row.id}`, (err) => {
                                            if(err)
                                                reject(err);
                                            else
                                                resolve();
                                        });
                                    }
                                });
                            } else
                                reject({code: 'addFailed'});
                        });
                    });
                }
            });
        });
    },
    findLesson(lesson) {
        const db = getDBInstance();
        return new Promise((resolve, reject) => {
            db.get('SELECT * FROM lesson WHERE id = ? and course = ?', lesson.id, lesson.courseid, (err, row) => {
                db.close();
                if(err)
                    reject(err);
                if(!row)
                    resolve(false);
                else
                    resolve(row);
            });
        });
    },
    deleteLesson(lesson) {
        const db = getDBInstance();
        return new Promise((resolve, reject) => {
            db.run('DELETE FROM lesson WHERE id = ? and course = ?', lesson.id, lesson.courseid, (err) => {
                db.close();
                if(err)
                    reject(err);
                fs.access(`./data/${lesson.courseid}/${lesson.id}`, (err) => {
                    if(!err) {
                        fs.rmdir(`./data/${lesson.courseid}/${lesson.id}`, {recursive: true}, (err) => {
                            if(err)
                                reject(err);
                            else
                                resolve();
                        });
                    } else
                        resolve();
                });
            });
        });
    },
    findMaterial(material) {
        const db = getDBInstance();
        return new Promise((resolve, reject) => {
            db.get('SELECT * FROM material JOIN lesson ON (material.lesson = lesson.id) WHERE material.name = ? and lesson.id = ?', material.name, material.lesson, (err, row) => {
                db.close();
                if(err)
                    reject(err);
                if(row)
                    resolve(true);
                else
                    resolve(false);
            });
        });
    },
    addMaterial(material) {
        const db = getDBInstance();
        return new Promise((resolve, reject) => {
            db.run('INSERT INTO material (name, lesson) VALUES (?, ?)', material.title, material.lessonid, (err) => {
                db.close();
                if(err)
                    reject(err);
                else
                    resolve();
            });
        });
    },
    deleteMaterial(material) {
        const db = getDBInstance();
        return new Promise((resolve, reject) => {
            db.get('SELECT * FROM lesson WHERE id = ? and course = ?', material.lessonid, material.courseid, (err, row) => {
                if(err) {
                    db.close();
                    reject(err);
                }
                if(!row) {
                    db.close();
                    resolve();
                } else {
                    db.get('SELECT * FROM material WHERE id = ? and lesson = ?', material.id, material.lessonid, (err, row) => {
                        if(err) {
                            db.close();
                            reject(err);
                        }
                        if(!row) {
                            db.close();
                            resolve();
                        } else {
                            db.run('DELETE FROM material WHERE id = ? and lesson = ?', material.id, material.lessonid, (err) => {
                                db.close();
                                if(err)
                                    reject(err);
                                fs.access(`./data/${material.courseid}/${material.lessonid}/${row.name}`, (err) => {
                                    if(!err) {
                                        fs.unlink(`./data/${material.courseid}/${material.lessonid}/${row.name}`, (err) => {
                                            if(err)
                                                reject(err)
                                            else
                                                resolve();
                                        });
                                    } else {
                                        resolve();
                                    }
                                });
                            });
                        }
                    });
                }
            });
        });
    },
    isSubscribed(courseid, username) {
        const db = getDBInstance();
        return new Promise((resolve, reject) => {
            db.get('SELECT username, title FROM course JOIN user_course ON (course.id = user_course.course) WHERE username = ? and course = ?', username, courseid, (err, row) => {
                db.close();
                if(err)
                    reject(err);
                if(!row)
                    resolve(false);
                else
                    resolve(true);
            });
        });
    },
    subscribe(courseid, username) {
        const db = getDBInstance();
        return new Promise((resolve, reject) => {
            db.run('INSERT INTO user_course VALUES (?, ?)', username, courseid, (err) => {
                db.close();
                if(err)
                    reject(err);
                else
                    resolve();
            });
        });
    },
    unsubscribe(courseid, username) {
        const db = getDBInstance();
        return new Promise((resolve, reject) => {
            db.run('DELETE FROM user_course WHERE username = ? and course = ?', username, courseid, (err) => {
                db.close();
                if(err)
                    reject(err);
                else
                    resolve();
            });
        });
    },
    ask(question) {
        const db = getDBInstance();
        return new Promise((resolve, reject) => {
            db.run('INSERT INTO question (question, student, course) VALUES (?, ?, ?)', question.message, question.student, question.courseid, (err) => {
                db.close();
                if(err)
                    reject(err);
                else
                    resolve();
            });
        });
    },
    answer(answer) {
        const db = getDBInstance();
        return new Promise((resolve, reject) => {
            db.run('UPDATE question SET answer = ? WHERE id = ?', answer.message, answer.id, (err) => {
                db.close();
                if(err)
                    reject(err);
                else
                    resolve();
            });
        });
    },
    deleteQuestion(questionid) {
        const db = getDBInstance();
        return new Promise((resolve, reject) => {
            db.run('DELETE FROM question WHERE id = ?', questionid, (err) => {
                db.close();
                if(err)
                    reject(err);
                else
                    resolve();
            });
        });
    },
    showQuestions(courseid) {
        const db = getDBInstance();
        return new Promise((resolve, reject) => {
            db.all('SELECT * FROM question WHERE course = ? and answer IS NOT NULL', courseid, (err, rows) => {
                db.close();
                if(err)
                    reject(err);
                else
                    resolve(rows);
            });
        });
    },
    showUnrepliedQuestions(creator) {
        const db = getDBInstance();
        return new Promise((resolve, reject) => {
            db.all('SELECT question.*, course.title FROM question JOIN course ON (question.course=course.id) WHERE creator = ? and answer IS NULL', creator, (err, rows) => {
                db.close();
                if(err)
                    reject(err);
                else
                    resolve(rows);
            });
        });
    },
    showUnrepliedQuestionsNumber(creator) {
        const db = getDBInstance();
        return new Promise((resolve, reject) => {
            db.all('SELECT count(*) AS notification FROM question JOIN course ON (question.course=course.id) WHERE creator = ? and answer IS NULL', creator, (err, row) => {
                db.close();
                if(err)
                    reject(err);
                else
                    resolve(row[0].notification);
            });
        });
    },
    findQuestion(questionid, creator) {
        const db = getDBInstance();
        return new Promise((resolve, reject) => {
            db.get('SELECT question.*, course.title FROM question JOIN course ON (question.course=course.id) WHERE question.id = ? and creator = ? and answer IS NULL', questionid, creator, (err, row) => {
                db.close();
                if(err)
                    reject(err);
                if(row)
                    resolve(row);
                else
                    resolve(false);
            });
        });
    },
    findAnyQuestion(questionid, creator) {
        const db = getDBInstance();
        return new Promise((resolve, reject) => {
            db.get('SELECT question.* FROM question JOIN course ON (question.course=course.id) WHERE question.id = ? and creator = ?', questionid, creator, (err, row) => {
                db.close();
                if(err)
                    reject(err);
                if(row)
                    resolve(row);
                else
                    resolve(false);
            });
        });
    },
    showCategory() {
        const db = getDBInstance();
        return new Promise((resolve, reject) => {
            db.all('SELECT name FROM category', (err, rows) => {
                db.close();
                if(err)
                    reject(err);
                else
                    resolve(rows.map(e => e.name));
            });
        })
    },
    showTeachers() {
        const db = getDBInstance();
        return new Promise((resolve, reject) => {
            db.all('SELECT * FROM teacher', (err, rows) => {
                db.close();
                if(err)
                    reject(err);
                else
                    resolve(rows.map(e => e.username));
            });
        });
    },
    filterCourses(course) {
        const db = getDBInstance();
        return new Promise((resolve, reject) => {
            db.all('SELECT * FROM course where title LIKE ? and category LIKE ? and creator LIKE ?', course.title, course.category, course.creator, (err, rows) => {
                db.close();
                if(err)
                    reject(err);
                else
                    resolve(rows);
            });
        });
    },
    filterTeacher(teacher) {
        const db = getDBInstance();
        return new Promise((resolve, reject) => {
            db.all('SELECT teacher.*, user.profile_image, user.name, user.surname FROM teacher JOIN user ON (teacher.username=user.username) where teacher.username LIKE ?', teacher, (err, rows) => {
                db.close();
                if(err)
                    reject(err);
                else
                    resolve(rows);
            });
        });
    },
    showLessons(course) {
        const db = getDBInstance();
        return new Promise((resolve, reject) => {
            db.all('SELECT * FROM lesson WHERE course = ?', course.id, (err, row) => {
                db.close();
                if(err)
                    reject(err);
                if(!row)
                    resolve(false);
                else
                    resolve(row);
            });
        });
    },
    showMaterials(lesson) {
        const db = getDBInstance();
        return new Promise((resolve, reject) => {
            db.all('SELECT * FROM material WHERE lesson = ?', lesson.id, (err, row) => {
                db.close();
                if(err)
                    reject(err);
                if(!row)
                    resolve(false);
                else
                    resolve(row);
            });
        });
    },
    showTeacherCourses(user) {
        const db = getDBInstance();
        return new Promise((resolve, reject) => {
            db.all('SELECT * FROM course where creator = ?', user.username, (err, rows) => {
                db.close();
                if(err)
                    reject(err);
                else
                    resolve(rows);
            });
        });
    },
    showSubscribedCourses(user) {
        const db = getDBInstance();
        return new Promise((resolve, reject) => {
            db.all('SELECT * FROM course JOIN user_course ON (course.id = user_course.course) where username = ?', user.username, (err, rows) => {
                db.close();
                if(err)
                    reject(err);
                else
                    resolve(rows);
            });
        }); 
    }
};
