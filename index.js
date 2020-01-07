/**
 * @file Node.jsサーバーの構築を行う設定ファイル
 */

const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const bodyParser = require('body-parser');
const authRouter = require('./routes/auth');
const appRouter = require('./routes/app');
const normalizePort = val => {
    const port = parseInt(val, 10);
    if(isNaN(port)) {return val;}
    if(port>=0) {return port;}
    return false;
}
const fs = require('fs');
const port = normalizePort(process.env.PORT || '3000');
const http = require('http');
const https = require('https');

let app = express();

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));
app.use(express.json());
app.use(express.urlencoded({extended:false}));
app.use(cookieParser());
app.set('public', path.join(__dirname, 'public'));
app.disable('x-powered-by');

const ALLOWED_METHODS = [
    'GET',
    'POST',
    'PUT',
    'DELETE',
    'OPTIONS'
];
const ALLOWED_ORIGINS = [
    process.env.NODE_CLIENT_ORIGIN,
    'http://localhost:9876'     //KarmaのOrigin
];
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (ALLOWED_ORIGINS.indexOf(origin) > -1) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Access-Control-Allow-Methods', ALLOWED_METHODS.join(','));
      res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
      res.setHeader('Access-Control-Allow-Credentials', false);
  }
  next();
});

app.use('/auth', authRouter);
app.use('/app', appRouter);

app.use((req, res, next) => {
    next(createError(404));
});

app.set('port', port);

let server;
if (app.get('env').trim() === 'production') {
    const serverOpts = {
        key: fs.readFileSync(process.env.NODE_KEY),
        cert: fs.readFileSync(process.env.NODE_CERT),
        ca: [
            fs.readFileSync(process.env.NODE_CHAIN),
            fs.readFileSync(process.env.NODE_FULLCHAIN)
        ]
    };
    server = https.createServer(serverOpts, app);
    console.log('create-https');
} else {
    server = http.createServer(app);
    console.log('create-http');
}

server.listen(port);
