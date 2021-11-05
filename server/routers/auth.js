const debug = require('debug');
const { Router } = require('express');
const passport = require('../util/passport');

const SIDNAME = process.env['SIDNAME'] || 'connect.sid';

const log = debug('server:auth');

const router = new Router();

/**
 * Get the current user (based on the session cookie)
 */
router.get('/', respondWithCurrentUser);

/**
 * Log in
 */
router.put('/', passport.authenticate('local'), respondWithCurrentUser);

/**
 * Log out
 */
router.delete('/', function (req, res) {
    req.session.destroy(function (err) {
        if (err) {
            return res.sendStatus(500);
        }
        req.logout();
        return res.clearCookie(SIDNAME).sendStatus(205);
    });
});

function respondWithCurrentUser(req, res) {
    return req.user ? res.json(req.user) : res.sendStatus(404);
}

module.exports = router;
