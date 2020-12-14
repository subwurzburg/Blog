var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var session = require('express-session')
var flash = require('connect-flash');
var logger = require('morgan');
var firebase = require('firebase');
var indexRouter = require('./routes/index');
var dashboard = require('./routes/dashboard');
const { auth } = require('firebase-admin');
var authentic = require('./routes/authentic')
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.engine('ejs', require('express-ejs-extend'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret:'keyla',
  resave:true,
  saveUninitialized:true,
  cookie:{maxAge:600*1000}
}))
app.use(flash());

const authcheck = function(req,res,next){
  console.log('middleware',res.session)
  if(req.session.uid === 'WaXJGuBBCVOAQ1pNJduOLSA7gpX2'){
    return next()
  }
  console.log("Do.01")
  return res.redirect('/authentic/signin');
}

app.use('/', indexRouter);
app.use('/dashboard',authcheck, dashboard);
app.use('/authentic',authentic)

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error("not Found");
  err.status = 404;
  res.render("error",{title:"您所查看的頁面不存在"});
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
