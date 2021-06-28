INSERT INTO user VALUES ('gianni96', '$2b$10$3WPiX0XsSGL86EDvkV9wxeNjDvAzigVwklJgF8NSVgA/KCtV/ydIq', 'student', NULL, NULL, 'https://i.ibb.co/xGNYGB0/download.png'); -- password: Password12#
INSERT INTO user VALUES ('Marco7', '$2b$10$3WPiX0XsSGL86EDvkV9wxeNjDvAzigVwklJgF8NSVgA/KCtV/ydIq', 'student', NULL, NULL, NULL); -- password: Password12#
INSERT INTO user VALUES ('bianchi', '$2b$10$3WPiX0XsSGL86EDvkV9wxeNjDvAzigVwklJgF8NSVgA/KCtV/ydIq', 'teacher', 'Mario', 'Bianchi', 'https://i.ibb.co/g7xyzvV/profile.jpg'); -- password: Password12#
INSERT INTO user VALUES ('rossi', '$2b$10$3WPiX0XsSGL86EDvkV9wxeNjDvAzigVwklJgF8NSVgA/KCtV/ydIq', 'teacher', 'Giorgio', 'Rossi', 'https://i.ibb.co/sW22m4x/test.jpg'); -- password: Password12#
INSERT INTO user VALUES ('milani', '$2b$10$3WPiX0XsSGL86EDvkV9wxeNjDvAzigVwklJgF8NSVgA/KCtV/ydIq', 'teacher', 'Marco', 'Milani', NULL); -- password: Password12#

INSERT INTO student VALUES ('gianni96');
INSERT INTO student VALUES ('Marco7');

INSERT INTO teacher VALUES ('bianchi', 'Insegno il corso di Analisi dal 2013 presso una famosa università.');
INSERT INTO teacher VALUES ('rossi', NULL);
INSERT INTO teacher VALUES ('milani', 'Grande passione per l informatica.');

INSERT INTO category VALUES ('Informatica');
INSERT INTO category VALUES ('Matematica');
INSERT INTO category VALUES ('Biologia');
INSERT INTO category VALUES ('Diritto');
INSERT INTO category VALUES ('Intelligenza artificiale');
INSERT INTO category VALUES ('Inglese');
INSERT INTO category VALUES ('Generale');

INSERT INTO course (title, description, guest, category, creator) VALUES ('Analisi 1 - 2021', 'Questo è il corso di analisi 1 (A.A. 2020/21).', 1, 'Matematica', 'bianchi');
INSERT INTO course (title, description, guest, category, creator) VALUES ('Basic English for CS', 'This is a basic english course. It provides a basic knowledge of english terms for computer science. ', 0, 'Inglese', 'bianchi');
INSERT INTO course (title, description, guest, category, creator) VALUES ('Open Day 2020', 'Materiale dell open day del corso di informatica.', 1, 'Generale', 'rossi');
INSERT INTO course (title, description, guest, category, creator) VALUES ('Analisi 1 - 2021 - Tutorato', 'Tutorato di analisi 1', 1, 'Matematica', 'milani');
INSERT INTO course (title, description, guest, category, creator) VALUES ('Programmazione 2 - 2021 - Tutorato', 'Tutorato di programmazione 1', 1, 'Informatica', 'milani');
INSERT INTO course (title, description, guest, category, creator) VALUES ('Algoritmi - 2021', 'Corso di algoritmi 2021. Il corso comincia a giugno.', 1, 'Informatica', 'milani');

INSERT INTO lesson (title, course) VALUES ('SETTIMANA 1', 1);
INSERT INTO lesson (title, course) VALUES ('SETTIMANA 2', 1);
INSERT INTO lesson (title, course) VALUES ('SETTIMANA 3', 1);
INSERT INTO lesson (title, course) VALUES ('Lezione 26 maggio', 2);
INSERT INTO lesson (title, course) VALUES ('Vario Materiale', 3);
INSERT INTO lesson (title, course) VALUES ('Prima Lezione', 6);

INSERT INTO material (name, lesson) VALUES ("intro.docx", 1);
INSERT INTO material (name, lesson) VALUES ("intro.pdf", 1);
INSERT INTO material (name, lesson) VALUES ("test.png", 1);

INSERT INTO user_course VALUES ('gianni96', 1);
INSERT INTO user_course VALUES ('gianni96', 3);
INSERT INTO user_course VALUES ('gianni96', 4);
INSERT INTO user_course VALUES ('gianni96', 6);
INSERT INTO user_course VALUES ('Marco7', 1);
INSERT INTO user_course VALUES ('Marco7', 6);
INSERT INTO user_course VALUES ('bianchi', 3);
INSERT INTO user_course VALUES ('bianchi', 4);

INSERT INTO question (question, answer, student, course) VALUES ('Quante lezioni ci saranno nel corso?', 'Il corso prevede 8 lezioni.', 'gianni96', 1);
INSERT INTO question (question, answer, student, course) VALUES ('Verrà fornito anche il materiale in lingua inglese?', 'No, questo corso è tenuto solo in italiano.', 'gianni96', 1);
INSERT INTO question (question, answer, student, course) VALUES ('Può fornire anche anche il codice dei programmi di esempio?', 'I codici verranno forniti alla fine del corso.', 'Marco7', 1);

INSERT INTO question (question, student, course) VALUES ('Dove possiamo consultare la documentazione?', 'gianni96', 1);
INSERT INTO question (question, student, course) VALUES ('Ci fornirà anche le registrazioni delle lezioni?', 'Marco7', 1);