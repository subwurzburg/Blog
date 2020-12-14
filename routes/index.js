var express = require('express');
var router = express.Router();
var firebaseAdminDb = require('../connection/firebase_admin.js');
var stringtags = require('striptags');
var moment = require('moment');
var page = require('../module/pagination')


const categoriesRef = firebaseAdminDb.ref('/categories/')
const articlesRef = firebaseAdminDb.ref('/articles/');


router.get('/', function (req, res, next) {
  let CurrentPage = Number.parseInt(req.query.page) || 1;
  const status = req.query.status || 'public';
  let categories = {};
  categoriesRef.once('value').then(function (snapshot) {
    categories = snapshot.val();
    return articlesRef.orderByChild('update_time').once('value');
  }).then(function (snapshot) {
    const articles = [];
    snapshot.forEach(function (snapshotChild) {
      if ('public' === snapshotChild.val().status) {
        articles.push(snapshotChild.val());
      }
    })
    articles.reverse();
    //分頁
    const data = page(articles, CurrentPage);
    console.log(data.page);
    res.render('index',
      {
        articles: data.data,
        categories,
        stringtags,
        moment,
        status,
        pagination: data.pagination
      });
  })
});

router.get('/category/:id', function (req, res, next) {
  let CurrentPage = Number.parseInt(req.query.page) || 1;
  const id = req.param('id');
  console.log(id);
  const status = req.query.status || 'public';
  let categories = {};
  categoriesRef.once('value').then(function (snapshot) {
    categories = snapshot.val();
    return articlesRef.orderByChild('update_time').once('value');
  }).then(function (snapshot) {
    const articles = [];
    snapshot.forEach(function (snapshotChild) {
      console.log(snapshotChild.val());
      if ('public' === snapshotChild.val().status && id == snapshotChild.val().category) {
        articles.push(snapshotChild.val());
      }
    })
    articles.reverse();
    //分頁
    const data = page(articles, CurrentPage);
    res.render('index',
      {
        articles: data.data,
        categories,
        stringtags,
        moment,
        status,
        pagination: data.pagination
      });
  })
  })

  router.get('/post/:id', function (req, res, next) {
    const id = req.param('id');
    let categories = {};
    categoriesRef.once('value').then(function (snapshot) {
      categories = snapshot.val();
      return articlesRef.child(id).once('value');
    }).then(function (snapshot) {
      const article = snapshot.val();
      res.render('post',
        {
          categories,
          article,
          moment,
          stringtags,
        });
    })
  });

  router.get('/dashboard/signup', function (req, res, next) {
    res.render('dashboard/signup', { title: 'Express' });
  });

  module.exports = router;
