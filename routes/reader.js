const express = require('express');
const router = express.Router();
const db = require('../db');

// Display all published articles
router.get('/home', (req, res) => {
    db.all('SELECT articles.*, authors.username AS author_name FROM articles LEFT JOIN authors ON articles.author_id = authors.id WHERE articles.state = "published" ORDER BY articles.published_at DESC', (err, articles) => {
        if (err) {
            res.status(500).render('reader-home', { user: req.session.user || null, articles: [], message: 'Failed to load articles.' });
            return;
        }
        res.render('reader-home', { user: req.session.user || null, articles: articles, message: articles.length ? null : 'No articles have been posted yet.' });
    });
});


// Detailed article view
router.get('/article/:id', (req, res) => {
    db.get('SELECT * FROM articles WHERE id = ?', [req.params.id], (err, article) => {
        if (err || !article) {
            res.status(500).send('Error fetching article');
            return;
        }
        db.all('SELECT * FROM comments WHERE article_id = ?', [req.params.id], (err, comments) => {
            if (err) {
                res.status(500).send('Error fetching comments');
                return;
            }
            const liked = req.session.user && req.session.user.likedArticles.includes(article.id);
            res.render('article', { user: req.session.user || null, article: article, comments: comments, liked: liked });
        });
    });
});

// Post a comment
router.post('/article/:id/comment', (req, res) => {
    if (!req.session.user) {
        res.redirect('/auth/login');
        return;
    }

    const { comment } = req.body;
    db.run('INSERT INTO comments (article_id, author_name, comment, created_at) VALUES (?, ?, ?, CURRENT_TIMESTAMP)',
           [req.params.id, req.session.user.username, comment], function(err) {
        if (err) {
            res.status(500).send('Error posting comment');
            return;
        }
        res.redirect(`/reader/article/${req.params.id}`);
    });
});

// Like or unlike an article
router.post('/article/:id/like', (req, res) => {
    if (!req.session.user) {
        res.status(401).json({ success: false, message: 'Not authenticated' });
        return;
    }

    const articleId = req.params.id;
    const userId = req.session.user.id;

    db.get('SELECT * FROM likes WHERE article_id = ? AND user_id = ?', [articleId, userId], (err, like) => {
        if (err) {
            res.status(500).json({ success: false, message: 'Error updating like counter' });
            return;
        }

        if (like) {
            // Unlike the article
            db.run('DELETE FROM likes WHERE article_id = ? AND user_id = ?', [articleId, userId], (err) => {
                if (err) {
                    res.status(500).json({ success: false, message: 'Error updating like counter' });
                    return;
                }
                db.run('UPDATE articles SET likes = likes - 1 WHERE id = ?', [articleId], (err) => {
                    if (err) {
                        res.status(500).json({ success: false, message: 'Error updating like counter' });
                        return;
                    }
                    req.session.user.likedArticles = req.session.user.likedArticles.filter(id => id !== articleId);
                    db.get('SELECT likes FROM articles WHERE id = ?', [articleId], (err, article) => {
                        if (err) {
                            res.status(500).json({ success: false, message: 'Error fetching updated like count' });
                            return;
                        }
                        res.json({ success: true, liked: false, likes: article.likes });
                    });
                });
            });
        } else {
            // Like the article
            db.run('INSERT INTO likes (article_id, user_id) VALUES (?, ?)', [articleId, userId], (err) => {
                if (err) {
                    res.status(500).json({ success: false, message: 'Error updating like counter' });
                    return;
                }
                db.run('UPDATE articles SET likes = likes + 1 WHERE id = ?', [articleId], (err) => {
                    if (err) {
                        res.status(500).json({ success: false, message: 'Error updating like counter' });
                        return;
                    }
                    req.session.user.likedArticles.push(articleId);
                    db.get('SELECT likes FROM articles WHERE id = ?', [articleId], (err, article) => {
                        if (err) {
                            res.status(500).json({ success: false, message: 'Error fetching updated like count' });
                            return;
                        }
                        res.json({ success: true, liked: true, likes: article.likes });
                    });
                });
            });
        }
    });
});


module.exports = router;
