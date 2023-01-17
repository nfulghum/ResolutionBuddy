"use strict";

/** middleware to handle common auth cases in routes */

const jwt = require('jsonwebtoken');
const { SECRET_KEY } = require('../config');
const { UnauthorizedError } = require('../expressError');

/** Middleware: Authentice user.
 * 
 * If a token was provided, verify it, and, if valid, store the token payload on
 * res.locals (this will include username and isAdmin field.)
 * 
 * It's not an error if no token was provided or if the token is not valid.
 */

const authenticateJWT = (req, res, next) => {
    try {
        const authHeader = req.headers && req.headers.authorization;
        if (authHeader) {
            const token = authHeader.replace(/^[Bb]earer /, "").trim();
            res.locals.user = jwt.verify(token, SECRET_KEY);
        }
        return next();
    } catch (err) {
        return next();
    }
}

/** Middleware to use when they must be logged in.
 * 
 *  If not, raises Unauthorized.
 */

const ensureLoggedIn = (req, res, next) => {
    try {
        if (!res.locals.user) throw new UnauthorizedError();
        return next();
    } catch (err) {
        return next(err);
    }
}

/** Middleware to use when they are logged in as an admin user.
 * 
 *  If not, raises Unauthorized.
 */

const ensureAdmin = (req, res, next) => {
    try {
        if (!res.locals.user || !res.locals.user.isAdmin) {
            throw new UnauthorizedError();
        }
        return next();
    } catch (err) {
        return next(err);
    }
}

/** Middleware to use when they must provide a valid token & be user matching
 *  username provided as route param.
 * 
 *  If not, raises Unauthorized.
 */

const ensureCorrectUserOrAdmin = (req, res, next) => {
    try {
        const user = res.locals.user;
        if (!(user && (user.isAdmin || user.username === req.params.username))) {
            throw new UnauthorizedError();
        }
        return next();
    } catch (err) {
        return next(err);
    }
}

module.exports = {
    authenticateJWT,
    ensureLoggedIn,
    ensureAdmin,
    ensureCorrectUserOrAdmin,
};