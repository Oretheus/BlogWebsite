const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');
const db = require('./db');
const authRoutes = require('./routes/auth');
const authorRoutes = require('./routes/author');
const readerRoutes = require('./routes/reader');

const app = express();
const PORT = 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
    secret: 'supersecret',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false } // Set to true if using HTTPS
}));

app.use((req, res, next) => {
    req.db = db;
    next();
});

app.use('/auth', authRoutes);
app.use('/author', authorRoutes);
app.use('/reader', readerRoutes);

app.get('/', (req, res) => {
    res.redirect('/reader/home');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
