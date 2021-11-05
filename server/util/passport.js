const passport = require('passport');
const { Strategy: LocalStrategy } = require('passport-local');
const User = require('../models/User');

passport.use(new LocalStrategy({ usernameField: 'email' }, async function (email, password, done) {
    try {
        const user = await User.findOne({ email }, '+passwordHash');
        return done(null, user?.validPassword(password) && user.set('passwordHash', undefined));
    }
    catch (error) {
        return done(error);
    }
}));

passport.serializeUser(function (user, done) {
    done(null, user._id);
});

passport.deserializeUser(async function (id, done) {
    try {
        done(null, await User.findById(id));
    } catch (err) {
        done(err);
    }
});

passport.allow = (...roles) => function (req, res, next) {
    return (
        req.isAuthenticated() &&
            typeof req.user.role === 'string' &&
            roles.includes(req.user.role)
            ? next()
            : res.sendStatus(401)
    );
};

module.exports = passport;

