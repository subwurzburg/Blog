const { Router } = require('express');
var express = require('express');
var router = express.Router();
var firebase = require('../connection/firebase_client.js');
var firebaseDb = require('../connection/firebase_admin.js')
router.get('/register', function (req, res, next) {
    res.render('authentic/register',
        {
            error: req.flash('error')
        });
})

router.get('/signin', function (req, res, next) {
    res.render('authentic/signin',
        {
            error: req.flash('error')
        });
})

router.post('/signin', function (req, res, next) {
    email = req.body.email;
    password = req.body.password;
    confirm_password = req.body.confirm_password;
    if(confirm_password==password){
            firebase.auth().signInWithEmailAndPassword(email, password)
        .then(function (user) {
            console.log("成功");
            req.session.uid = user.user.uid
            console.log(req.session.uid);
            res.redirect('../dashboard/archives')
        })
        .catch(function (error) {
            var error_message = error.message;
            req.flash('error', error_message);
            res.redirect('/authentic/signin')
        })
    }
    else{
        res.redirect('/authentic/signin');
    }
})

router.get('/success', function (req, res, next) {
    var auth = req.session.uid;
    console.log(auth);
    res.render('authentic/success',{
        auth
    })
})

router.post('/register', function (req, res, next) {
    email = req.body.email;
    password = req.body.password;
    firebase.auth().createUserWithEmailAndPassword(email, password)
        .then(function (user) {
            var saveuser = {
                'email': email,
                'password': password,
                'uid': user.user.uid
            }
            firebaseDb.ref('/user/' + user.user.uid).set(saveuser).then(function () {
                res.redirect('/authentic/success');
            })
        })
        .catch(function (error) {
            var error_message = error.message;
            req.flash('error', error_message);
            res.redirect('/authentic/register')
        })

})




module.exports = router;
