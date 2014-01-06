// web.js
var FACEBOOK_APP_ID = 207497116103821;
var FACEBOOK_APP_SECRET = "35f151155d0af455a217d291f919989b";
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

app.get('/auth/facebook', passport.authenticate('facebook-canvas'));
app.get('/auth/facebook/callback', passport.authenticate('facebook-canvas', {
    successRedirect : '/',
    failureRedirect : '/error'
}));

app.post('/auth/facebook/canvas', passport.authenticate('facebook-canvas', {
    successRedirect : '/',
    failureRedirect : '/auth/facebook/canvas/autologin'
}));

app.get('/auth/facebook/canvas/autologin', function(req, res) {
    res.send('<!DOCTYPE html><body><script type="text/javascript">'
            + 'top.location.href = "/auth/facebook";</script></body></html>');
});

app.all('/', function(req, res, next) {
    if (req.signedRequest && req.signedRequest.user_id) {
        graphMe(req.signedRequest, function(er, me) {
            if (er) {
                console.error(er);
                return sendLogin(req, res, next);
            }
            res.send(200, '<!doctype html>' + 'Welcome ' + me.name + ' with ID ' + me.id + '.<br>'
                    + '<button id="sample-logout">Logout</button> '
                    + '<button id="sample-disconnect">Disconnect</button>' + js({
                        reloadOnLogout : true
                    }));
        });
    } else {
        sendLogin(req, res, next);
    }
});

var port = process.env.PORT || 5000;
app.listen(port, function() {
    console.log("Listening on " + port);
});