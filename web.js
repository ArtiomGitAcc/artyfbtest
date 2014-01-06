// web.js
var express = require("express");
var logfmt = require("logfmt");
var passport = require("passport");
var FacebookStrategy = require('passport-facebook-canvas');
var app = express();

passport.use(new FacebookStrategy({
    clientID : FACEBOOK_APP_ID,
    clientSecret : FACEBOOK_APP_SECRET,
    callbackURL : "http://intense-basin-4765.herokuapp.com/auth/facebook/callback"
}, function(accessToken, refreshToken, profile, done) {
    User.findOrCreate({
        facebookID : profile.id
    }, function(err, user) {
        return done(err, user);
    });
}));

app.use(logfmt.requestLogger());
app.use(express.cookieParser());
app.use(express.bodyParser());
app.use(express.session({
    secret : 'SECRET'
}));
app.use(passport.initialize());
app.use(passport.session());

app.get('/auth/facebook', passport.authentificate('facebook-canvas'));
app.get('/auth/facebook/callback', passport.authentificate('facebook-canvas', {
    successRedirect : '/',
    failureRedirect : '/error'
}));

app.post('/auth/facebook/canvas', passport.authentificate('facebook-canvas', {
    successRedirect : '/',
    failureRedirect : '/auth/facebook/canvas/autologin'
}));

app.get('/auth/facebook/canvas/autologin', function(req, res) {
    res.send('<!DOCTYPE html><body><script type="text/javascript">'
            + 'top.location.href = "/auth/facebook";</script></body></html>');
});

// app.get('/', function(req, res) {
// res.send('Hello World!');
// });

var port = process.env.PORT || 5000;
app.listen(port, function() {
    console.log("Listening on " + port);
});