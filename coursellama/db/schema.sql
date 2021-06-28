CREATE TABLE user (
    username TEXT PRIMARY KEY,
    password TEXT NOT NULL,
    role TEXT NOT NULL,
    name TEXT,
    surname TEXT,
    profile_image TEXT 
);

CREATE TABLE teacher (
    username TEXT PRIMARY KEY,
    bio TEXT,
    FOREIGN KEY (username) REFERENCES user(username) ON DELETE CASCADE
);

CREATE TABLE student (
    username TEXT PRIMARY KEY,
    FOREIGN KEY (username) REFERENCES user(username) ON DELETE CASCADE
);

CREATE TABLE category (
    name TEXT PRIMARY KEY
);

CREATE TABLE course (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    guest INTEGER NOT NULL,
    category TEXT NOT NULL,
    creator TEXT,
    UNIQUE(title, creator),
    FOREIGN KEY (category) REFERENCES category(name),
    FOREIGN KEY (creator) REFERENCES teacher(username) ON DELETE CASCADE
);

CREATE TABLE user_course (
    username TEXT NOT NULL,
    course TEXT NOT NULL,
    FOREIGN KEY (username) REFERENCES user(username) ON DELETE CASCADE,
    FOREIGN KEY (course) REFERENCES course(id) ON DELETE CASCADE,
    PRIMARY KEY (username, course)
);

CREATE TABLE lesson (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    course INTEGER NOT NULL,
    UNIQUE(title, course),
    FOREIGN KEY (course) REFERENCES course(id) ON DELETE CASCADE
);

CREATE TABLE material (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    lesson INTEGER NOT NULL,
    FOREIGN KEY (lesson) REFERENCES lesson(id) ON DELETE CASCADE
);

CREATE TABLE question (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    question TEXT NOT NULL,
    answer TEXT,
    student TEXT,
    course INTEGER NOT NULL,
    FOREIGN KEY (student) REFERENCES student(username) ON DELETE SET NULL,
    FOREIGN KEY (course) REFERENCES course(id) ON DELETE CASCADE
);