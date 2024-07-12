const session = require('express-session');

function checkAuth(req, res, next) {
    if (req.session && req.session.user) {
        next();
    } else {
        res.redirect('/auth/login');
    }
}

module.exports = { checkAuth };
