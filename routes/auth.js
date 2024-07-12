const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();

// Display the login page
router.get('/login', (req, res) => {
    res.render('login', { error: null, success: null, user: req.session.user || null });
});

// Handle login logic
router.post('/login', (req, res) => {
    const { username, password } = req.body;
    req.db.get('SELECT * FROM authors WHERE username = ?', [username], (err, author) => {
        if (err || !author) {
            return res.render('login', { error: 'Invalid username or password', success: null, user: null });
        }
        bcrypt.compare(password, author.password, (err, result) => {
            if (err || !result) {
                return res.render('login', { error: 'Invalid username or password', success: null, user: null });
            }
            req.session.user = { id: author.id, username: author.username, likedArticles: [] };
            res.redirect('/author/home');
        });
    });
});

// Logout logic
router.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/reader/home');
    });
});

// Display the registration page
router.get('/register', (req, res) => {
    res.render('register', { error: null, success: null, user: req.session.user || null });
});

// Handle registration logic
router.post('/register', async (req, res) => {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    req.db.run('INSERT INTO authors (username, password) VALUES (?, ?)', [username, hashedPassword], function(err) {
        if (err) {
            if (err.code === 'SQLITE_CONSTRAINT') {
                return res.render('register', { error: 'Username already taken', success: null, user: null });
            }
            return res.render('register', { error: 'An error occurred during registration', success: null, user: null });
        }
        res.render('login', { error: null, success: 'Successfully registered. Please log in.', user: null });
    });
});

module.exports = router;
