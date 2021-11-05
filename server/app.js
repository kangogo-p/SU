const mongoSession = require('connect-mongodb-session');
const cookieParser = require('cookie-parser');
const debug = require('debug');
const express = require('express');
const session = require('express-session');
const mongoose = require('mongoose');
const logger = require('morgan');
const path = require('path');
const passport = require('./util/passport');
const { allow } = require('./util/passport');

const MongoDBStore = mongoSession(session);

const MONGODBURL = process.env['MONGODBURL'] || 'mongodb://localhost/kwik-e-mart';
const SIDNAME = process.env['SIDNAME'] || 'connect.sid';
const SECRET = process.env['SECRET_FOR_SESSION'] || '';

global.staticFilesDir = path.join(__dirname, 'public', 'kwik-e-mart');

debug('server:mongodb')(`Connecting to ${MONGODBURL}...`);
mongoose.connect(MONGODBURL, {
    useUnifiedTopology: true,
    useFindAndModify: false,
    useNewUrlParser: true,
    useCreateIndex: true,
});
mongoose.connection.on('error', debug('server:mongodb'));
mongoose.connection.on('open', () => debug('server:mongodb')('Connected.'));

const app = express();

app.use(logger('dev'));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
    saveUninitialized: false,
    resave: false,
    name: SIDNAME,
    secret: SECRET,
    store: new MongoDBStore({
        uri: MONGODBURL,
        collection: 'sessions',
    }),
}));
app.use(passport.initialize());
app.use(passport.session());

app.use('/api/s3', allow('admin'), require('./routers/s3'));
app.use('/api/user', require('./routers/user'));
app.use('/api/auth', require('./routers/auth'));
app.use('/api/order', require('./routers/order'));
app.use('/api/category', require('./routers/category'));

app.use(express.static(global.staticFilesDir));

app.get('/*', function (req, res, next) {
    return '' === path.extname(req.path) && 'html' === req.accepts('html', 'json', 'xml')
        ? res.sendFile(path.join(global.staticFilesDir, 'index.html'))
        : next();
});

module.exports = app;

