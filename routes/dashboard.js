const { Router } = require('express');
var express = require('express');
var router = express.Router();
var firebaseAdminDb = require('../connection/firebase_admin.js');
var stringtags = require('striptags');
var moment = require('moment');


const categoriesRef = firebaseAdminDb.ref('/categories/')
const articlesRef = firebaseAdminDb.ref('/articles/');


router.get('/archives', function (req, res, next) {
    const status = req.query.status || 'public';
    console.log(status);
    let categories = {};
    categoriesRef.once('value').then(function (snapshot) {
        categories = snapshot.val();
        return articlesRef.orderByChild('update_time').once('value');
    }).then(function (snapshot) {
        const articles = [];
        snapshot.forEach(function (snapshotChild) {
            if (status === snapshotChild.val().status) {
                articles.push(snapshotChild.val());
            }
        })
        articles.reverse();
        res.render('dashboard/archives',
            {
                articles,
                categories,
                stringtags,
                moment,
                status
            });
    })
});

router.get('/article/create', function (req, res, next) {
    categoriesRef.once('value').then(function (snapshot) {
        const categories = snapshot.val();
        res.render('dashboard/article',
            {
                categories
            });
    })
});

router.get('/article/:id', function (req, res, next) {
    const id = req.param('id');
    let categories = {};
    categoriesRef.once('value').then(function (snapshot) {
        categories = snapshot.val();
        return articlesRef.child(id).once('value');
    }).then(function (snapshot) {
        const article = snapshot.val();
        res.render('dashboard/article',
            {
                categories,
                article
            });
    })
});

router.post('/article/create', function (req, res) {
    const data = req.body;
    const articleRef = articlesRef.push();
    const key = articleRef.key;
    const updateTime = Math.floor(Date.now() / 1000);
    data.id = key;
    data.update_time = updateTime;
    articleRef.set(data).then(function () {
        res.redirect('/dashboard/archives')
    })
})

router.post('/article/update/:id', function (req, res) {
    const data = req.body;
    const id = req.param('id');
    articlesRef.child(id).update(data).then(function () {
        res.redirect('/dashboard/archives');
    })
})

router.post('/article/delete/:id', function (req, res) {
    const id = req.param('id');
    articlesRef.child(id).remove();
    req.flash('info', '欄位已經刪除');
    res.send("文章已經刪除");
    res.end();
})


router.get('/categories', function (req, res, next) {
    const message = req.flash('info');
    categoriesRef.once('value').then(function (snapshot) {
        const categories = snapshot.val();
        res.render('dashboard/categories',
            {
                message,
                hasInfo: message.length > 0,
                categories
            });
    })
});

router.post('/categories/create', function (req, res) {
    const data = req.body;
    const categoryRef = categoriesRef.push();
    const key = categoryRef.key;
    data.id = key;
    categoriesRef.orderByChild('path').equalTo(data.path).once('value').then(function (snapshot) {
        if (snapshot.val() !== null) {
            req.flash('info', '已經有相同路徑')
            res.redirect('/dashboard/categories')
        } else {
            categoryRef.set(data).then(function () {
                res.redirect('/dashboard/categories')
            })
        }
    })
})

router.post('/categories/delete/:id', function (req, res) {
    const id = req.param('id');
    categoriesRef.child(id).remove();
    req.flash('info', '欄位已經刪除');
    res.redirect('/dashboard/categories')
})

router.get('/signout',function(req,res,next){
    req.session.destroy();
    res.redirect('dashboard/archives')
})


module.exports = router;