const express = require('express');
const router = express.Router();
const { checkAuth } = require('../middleware/auth');

// Author's dashboard showing their articles
router.get('/home', checkAuth, (req, res) => {
    const authorId = req.session.user.id; // Ensure this matches the logged-in user's ID
    req.db.all('SELECT * FROM articles WHERE author_id = ?', [authorId], (err, articles) => {
        if (err) {
            console.error(err);
            res.render('author-home', { user: req.session.user, articles: [], error: 'Error fetching articles. Please try again.' });
            return;
        }
        res.render('author-home', { user: req.session.user, articles: articles, error: null });
    });
});

// Route to display the form for creating a new article
router.get('/new-article', checkAuth, (req, res) => {
    res.render('edit-article', {
        article: { id: null, title: '', content: '' },
        user: req.session.user
    });
});

// Route to display the form pre-filled for editing an existing article
router.get('/edit-article/:id', checkAuth, (req, res) => {
    req.db.get('SELECT * FROM articles WHERE id = ?', [req.params.id], (err, article) => {
        if (err) {
            res.status(500).send('Error fetching article');
            return;
        }
        if (article) {
            res.render('edit-article', { user: req.session.user, article: article });
        } else {
            res.status(404).send('Article not found');
        }
    });
});

// Route to handle the submission of the form and create a new article
router.post('/new-article', checkAuth, (req, res) => {
    const { title, content } = req.body;
    if (!title || !content) {
        return res.render('edit-article', {
            error: 'Title and content are required.',
            article: { title, content },
            user: req.session.user
        });
    }
    req.db.run('INSERT INTO articles (title, content, author_id, created_at, updated_at, state) VALUES (?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, "draft")',
        [title, content, req.session.user.id], function(err) {
        if (err) {
            res.status(500).send('Error creating article');
            return;
        }
        res.redirect('/author/home');
    });
});

// Handle updating an existing article
router.post('/edit-article/:id', checkAuth, (req, res) => {
    const { title, content } = req.body;
    req.db.run('UPDATE articles SET title = ?, content = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [title, content, req.params.id], function(err) {
        if (err) {
            res.status(500).send('Error updating article');
            return;
        }
        res.redirect('/author/home');
    });
});

// Publish an article
router.post('/publish-article/:id', checkAuth, (req, res) => {
    req.db.run('UPDATE articles SET state = "published", published_at = CURRENT_TIMESTAMP WHERE id = ?', [req.params.id], function(err) {
        if (err) {
            res.status(500).send('Error publishing article');
            return;
        }
        res.redirect('/author/home');
    });
});

// Delete an article
router.post('/delete-article/:id', checkAuth, (req, res) => {
    req.db.run('DELETE FROM articles WHERE id = ?', [req.params.id], function(err) {
        if (err) {
            res.render('author-home', { user: req.session.user, articles: [], error: 'Error deleting article. Please try again.' });
            return;
        }
        res.redirect('/author/home');
    });
});

// Display the settings page
router.get('/settings', checkAuth, (req, res) => {
    req.db.get('SELECT * FROM settings WHERE author_id = ?', [req.session.user.id], (err, settings) => {
        if (err) {
            res.status(500).send("Error retrieving settings");
            return;
        }
        if (!settings) {
            settings = { blogTitle: '', authorName: '' };
        }
        res.render('author-settings', { user: req.session.user, settings: settings });
    });
});

// Update the settings
router.post('/settings', checkAuth, (req, res) => {
    const { blogTitle, authorName } = req.body;
    req.db.run('REPLACE INTO settings (author_id, blogTitle, authorName) VALUES (?, ?, ?)', 
        [req.session.user.id, blogTitle, authorName], (err) => {
        if (err) {
            res.status(500).send("Error updating settings");
            return;
        }
        res.redirect('/author/settings');
    });
});

module.exports = router;
