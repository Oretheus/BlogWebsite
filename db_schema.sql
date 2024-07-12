PRAGMA foreign_keys=ON;

BEGIN TRANSACTION;

CREATE TABLE IF NOT EXISTS users (
    user_id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL,
    password TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS email_accounts (
    email_account_id INTEGER PRIMARY KEY AUTOINCREMENT,
    email_address TEXT NOT NULL,
    user_id INTEGER,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

CREATE TABLE IF NOT EXISTS settings (
    author_id INTEGER PRIMARY KEY,
    blogTitle TEXT,
    authorName TEXT,
    FOREIGN KEY (author_id) REFERENCES authors(id)
);

INSERT INTO users (username, password) VALUES ('Simon Star', 'password1');
INSERT INTO users (username, password) VALUES ('Dianne Dean', 'password2');
INSERT INTO users (username, password) VALUES ('Harry Hilbert', 'password3');

INSERT INTO email_accounts (email_address, user_id) VALUES ('simon@gmail.com', 1); 
INSERT INTO email_accounts (email_address, user_id) VALUES ('simon@hotmail.com', 1); 
INSERT INTO email_accounts (email_address, user_id) VALUES ('dianne@yahoo.co.uk', 2); 

CREATE TABLE IF NOT EXISTS articles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    author_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    published_at DATETIME,
    state TEXT CHECK(state IN ('draft', 'published')) NOT NULL DEFAULT 'draft',
    FOREIGN KEY (author_id) REFERENCES users(user_id)
);

CREATE TABLE comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    article_id INTEGER,
    author_name TEXT NOT NULL,
    comment TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(article_id) REFERENCES articles(id)
);

CREATE TABLE IF NOT EXISTS authors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS likes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    article_id INTEGER,
    user_id INTEGER,
    FOREIGN KEY (article_id) REFERENCES articles(id),
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    UNIQUE (article_id, user_id)
);

ALTER TABLE articles ADD COLUMN likes INTEGER DEFAULT 0;


COMMIT;
