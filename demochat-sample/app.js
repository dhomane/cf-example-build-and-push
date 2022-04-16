//
// Let's Chat main file
//

'use strict';

process.title = 'letschat';

require('colors');

var _            = require('lodash'),
    path         = require('path'),
    fs           = require('fs'),
    express      = require('express.oi'),
    i18n         = require('i18n'),
    bodyParser   = require('body-parser'),
    cookieParser = require('cookie-parser'),
    compression  = require('compression'),
    helmet       = require('helmet'),
    http         = require('http'),
    nunjucks     = require('nunjucks'),
    mongoose     = require('mongoose'),
    migroose     = require('./migroose'),
    connectMongo = require('connect-mongo'),
    all          = require('require-tree'),
    psjon        = require('./package.json'),
    settings     = require('./app/config'),
    auth         = require('./app/auth/index'),
    core         = require('./app/core/index');

var MongoStore   = connectMongo(express.session),
    httpEnabled  = settings.http && settings.http.enable,
    httpsEnabled = settings.https && settings.https.enable,
    models       = all(path.resolve('./app/models')),
    middlewares  = all(path.resolve('./app/middlewares')),
    controllers  = all(path.resolve('./app/controllers')),
    app;

//
// express.oi Setup
//
if (httpsEnabled) {
    app = express().https({
        key:  fs.readFileSync(settings.https.key),
        cert: fs.readFileSync(settings.https.cert)
    }).io();
} else {
    app = express().http().io();
}

if (settings.env === 'production') {
    app.set('env', settings.env);
    app.set('json spaces', undefined);
    app.enable('view cache');
}

// Session
var sessionStore = new MongoStore({
    url:           settings.database.uri,
    autoReconnect: true
});

// Session
var session = {
    key:               'connect.sid',
    secret:            settings.secrets.cookie,
    store:             sessionStore,
    cookie:            { secure: httpsEnabled },
    resave:            false,
    saveUninitialized: true
};
debugger;
// Set compression before any routes
app.use(compression({ threshold: 512 }));

app.use(cookieParser());
app.io.session(session);

auth.setup(app, session, core);

// Security protections
app.use(helmet.frameguard());
app.use(helmet.hidePoweredBy());
app.use(helmet.ieNoOpen());
app.use(helmet.noSniff());
app.use(helmet.xssFilter());
app.use(helmet.hsts({
    maxAge:            31536000,
    includeSubdomains: true,
    force:             httpsEnabled,
    preload:           true
}));
app.use(helmet.contentSecurityPolicy({
    defaultSrc: ['\'none\''],
    connectSrc: ['*'],
    scriptSrc:  ['\'self\'', '\'unsafe-eval\''],
    styleSrc:   ['\'self\'', 'fonts.googleapis.com', '\'unsafe-inline\''],
    fontSrc:    ['\'self\'', 'fonts.gstatic.com'],
    mediaSrc:   ['\'self\''],
    objectSrc:  ['\'self\''],
    imgSrc:     ['*']
}));

var bundles = {};
app.use(require('connect-assets')({
    paths:          [
        'media/js',
        'media/less'
    ],
    helperContext:  bundles,
    build:          settings.env === 'production',
    fingerprinting: settings.env === 'production',
    servePath:      'media/dist'
}));

// Public
app.use('/media', express.static(__dirname + '/media', {
    maxAge: '364d'
}));

// Templates
var nun = nunjucks.configure('templates', {
    autoescape: true,
    express:    app,
    tags:       {
        blockStart:    '<%',
        blockEnd:      '%>',
        variableStart: '<$',
        variableEnd:   '$>',
        commentStart:  '<#',
        commentEnd:    '#>'
    }
});

function wrapBundler(func) {
    // This method ensures all assets paths start with "./"
    // Making them relative, and not absolute
    return function () {
        return func.apply(func, arguments)
            .replace(/href="\//g, 'href="./')
            .replace(/src="\//g, 'src="./');
    };
}

nun.addFilter('js', wrapBundler(bundles.js));
nun.addFilter('css', wrapBundler(bundles.css));
nun.addGlobal('text_search', false);

// i18n
i18n.configure({
    directory:     __dirname + '/locales',
    defaultLocale: settings.i18n && settings.i18n.locale || 'en'
});
app.use(i18n.init);

// HTTP Middlewares
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

// IE header
app.use(function (req, res, next) {
    res.setHeader('X-UA-Compatible', 'IE=Edge,chrome=1');
    next();
});

//
// Controllers
//
_.each(controllers, function (controller) {
    controller.apply({
        app:         app,
        core:        core,
        settings:    settings,
        middlewares: middlewares,
        models:      models,
        controllers: controllers
    });
});

//
// Mongo
//



//
// Go Time
//

function startApp() {
    var port = httpsEnabled && settings.https.port ||
        httpEnabled && settings.http.port;

    var host = httpsEnabled && settings.https.host ||
        httpEnabled && settings.http.host || '0.0.0.0';


    if (httpsEnabled && httpEnabled) {
        // Create an HTTP -> HTTPS redirect server
        var redirectServer = express();
        redirectServer.get('*', function (req, res) {
            var urlPort = port === 80 ? '' : ':' + port;
            res.redirect('https://' + req.hostname + urlPort + req.path);
        });
        http.createServer(redirectServer)
            .listen(settings.http.port || 5000, host);
    }

    app.listen(port, host);

    //
    // XMPP
    //
    if (settings.xmpp.enable) {
        var xmpp = require('./app/xmpp/index');
        xmpp(core);
    }

    var art = fs.readFileSync('./app/misc/art.txt', 'utf8');
    console.log('\n' + art + '\n\n' + 'Release ' + psjon.version.yellow + '\n');
}

function checkForMongoTextSearch() {
    if (!mongoose.mongo || !mongoose.mongo.Admin) {
        // MongoDB API has changed, assume text search is enabled
        nun.addGlobal('text_search', true);
        return;
    }
    console.log(JSON.stringify(mongoose.connection.db));
    var admin = new mongoose.mongo.Admin(mongoose.connection.db);
    admin.buildInfo(function (err, info) {
        if (err || !info) {
            return;
        }

        var version = info.version.split('.');
        if (version.length < 2) {
            return;
        }

        if (version[0] < 2) {
            return;
        }

        if (version[0] === '2' && version[1] < 6) {
            return;
        }

        nun.addGlobal('text_search', true);
    });
}

var connectionTries = 0;


function handleMongoConnectionState(err) {


  //checkForMongoTextSearch();

    migroose.needsMigration(function (err, migrationRequired) {

        if (err) {
            console.error(err);
        }

        else if (migrationRequired) {

            console.log('Database migration required'.red);
            console.log('Ensure you backup your database first.');
            console.log('');
            console.log(
                'Run the following command: ' + 'npm run migrate'.yellow
            );

            return process.exit();
        }

        console.log('starting app');
        startApp();
    });

}

const Kefir = require('kefir');
const interval = 2000;
const Promise = require('bluebird');
const retry = require('bluebird-retry')
const MongoClient = require('mongodb').MongoClient;
const chalk = require('chalk');
const debug = require('debug')('app');

function tryConnect(callback) {

    console.log(chalk.green('Connecting to database...'));
    console.log(chalk.green(new Date()));
    console.log(chalk.green(`connection is ${settings.database.uri}`));

    let p, wrapper = {}

try{

    p= MongoClient.connect(settings.database.uri,
       {connectTimeoutMS:3000, reconnectTries:1, promiseLibrary:Promise});
       console.log('!!');

    wrapper = new Promise((resolve, reject)=>{
         p.then(resolve, reject);
    });

    mongoose.connection.on('error', function (err) {
        console.log(chalk.red(`connection on error ${err}`));
        callback(err);
    });

    mongoose.connection.on('disconnected', function (err) {
        console.log(`disconnected from database error : ${err}`);
          callback("error");
    });
}catch(e){
  console.log(e + exception);
  return Promise.reject();
}
process.on('uncaughtException', function (err) {
  debug('uncaughtException: probably due to ' + err);
})

console.log(chalk.green('connection in progress'));
p.then(()=>{
  chalk.green('promise resolved ');
},()=>{
  chalk.green('promise rejected ');
})
return p;

}
let checkTimeout = ()=>{
  console.log('check timeout');
  return new Promise((resolve, reject)=>{
    setTimeout(1000, ()=>{
      console.log('rejected')
      return reject();
    })
  })
}

  let p = retry(tryConnect, { max_tries: 5, interval: 4000,timeout:30000 })
  .then(handleMongoConnectionState,()=>{
  console.log(chalk.red('we coudnt connect to DB check if its up'));
  process.exit();

});
