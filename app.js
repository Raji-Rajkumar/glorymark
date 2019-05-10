//import required packages (all listed in package.json)
const mysql = require('mysql'); //mysql driver
const express = require('express'); //creates a web application server
var favicon = require('serve-favicon');
var path = require('path'); //The Path module provides a way of working with directories and file paths.
var cookieParser = require('cookie-parser'); //needed for session storing
var bodyParser = require('body-parser'); //bodyparser parses incoming request bodies (inputs) before we use them
var expressValidator = require('express-validator'); //validates  input and reports any errors before creating user 
var flash = require('connect-flash'); //used for storing messages


//authentication packages
var session = require('express-session') //needed to store sessions (for user)
var passport = require('passport') 
var LocalStrategy = require('passport-local').Strategy;
var MySQLStore = require('express-mysql-session')(session);
const bcrypt = require('bcrypt');
const saltRounds = 10;

//create web app server
const app = express();

//create database connection
const db = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : 'F96NjP!x',
    database : 'glorymark'
  });

db.connect((err) => {
    if(err){
        throw err;
    }
    console.log('MySql Connected...');
});

global.db = db; //allows variable db to be accessed in all files

//creates a sessions table in glorymark and stores the session (when user is logged in) in it
var options = {
    host     : 'localhost',
    user     : 'root',
    password : 'F96NjP!x',
    database : 'glorymark'
};

var sessionStore = new MySQLStore(options);

app.set("view engine", "ejs"); //we are using ejs instead of html
app.set('views', __dirname + '/views'); // set express to look in this folder to render our view
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false })); 
app.use(expressValidator()); //(this line must be immediately after any of the bodyParser middlewares!)
app.use(cookieParser());
app.use(favicon(path.join(__dirname,'public', 'assets', 'img','favicon.ico')));
app.use(express.static(path.join(__dirname, 'public')));
app.use(flash());
app.use(session({
    secret: 'qsaeolilyffutif', //what we are using to hash our cookie
    store: sessionStore,
    resave: false, //only saving session whenever a change is made directly to it
    saveUninitialized: false, //only creating sessions for users that have LOGGED IN
    //cookie: { secure: true } //if we have https enable this to true
}));

app.use(passport.initialize()); //initialize the authentication module 
app.use(passport.session()); //  alters the value of the 'user' property in the req object to contain the deserialized identity of the user.

//verify callback for local authentication
passport.use(new LocalStrategy({ 
        usernameField: 'username',    
        passwordField: 'pword', //default is 'password' so we need to include this to change it
        passReqToCallback : true // lets us send error message using connect-flash package
    },
    
    function(req, username, pword, done) {

        db.query('SELECT b_id, pword FROM better WHERE username = ?', [username], function(err, results, fields) {
            if(err) {
                done(err);
            }
            if(results.length == 0) {
                //username doesn't exists in database => navigate you to failure option and stores failure message
                done(null, false, req.flash('failureFlash', "Username doesn't exist"));
            } else {
                //hash password and compare it to the hashed password in database
                const hash = results[0].pword.toString();
                bcrypt.compare(pword, hash, function(err, response) {
                    if(response == true) {
                        //password exists in database => navigates you to success options
                        return done(null, {user_id: results[0].b_id});

                    } else {
                        //password doesn't exist in database => => navigate you to failure option and stores failure message
                        return done(null, false, req.flash('failureFlash', "Wrong password"));
                    }
                });
            }  
        })    
    }
));

function populateIsCorrect(betArr, winArr) {
    for(var i = 0; i < betArr.length; i++) {
        for(var j = 0; j < winArr.length; j++) {
            if(winArr[j].winType == 'Win') {
                if(betArr[i].contestant_id == winArr[j].contestant_id && betArr[i].event_id == winArr[j].event_id) {
                    db.query("UPDATE bet SET isCorrect = 1 WHERE bet_id = ?", betArr[i].bet_id, function(err, result) {
                        if(err) throw err;
                    });
                    break;
                }
                else {
                    db.query("UPDATE bet SET isCorrect = 0 WHERE bet_id = ?", betArr[i].bet_id, function(err, result) {
                        if(err) throw err;
                    });
                }
            }
            else {
                if(betArr[i].contestant_id == winArr[j].contestant_id && betArr[i].event_id == winArr[j].event_id && winArr[j].winType == 'Place') {
                    db.query("UPDATE bet SET isCorrect = 1 WHERE bet_id = ?", betArr[i].bet_id, function(err, result) {
                        if(err) throw err;
                        
                    });
                    break;
                }
                else {
                    db.query("UPDATE bet SET isCorrect = 0 WHERE bet_id = ?", betArr[i].bet_id, function(err, result) {
                        if(err) throw err;
                        
                    });
                }

            }
        }
    }
    return 0;
}

//initializes functions that will be called in the specified routes
const {getHomePage, getSignUpPage, getSignInPage, getProfilePage, getEventPage, getManageBetPage} = require('./routes/render-pages')
const {getBPRep, getMP, getPush, getChin, getPull, getAdmin, getResultsPage} = require('./routes/render-pages')
const {getPlank, getWall, getJR, getMile, getMeter, getBPWeight} = require('./routes/render-pages')
const {getSelectWinnerPage, getAdminManageBetPage, getAdminMeter, getAdminBPRep, getAdminBPWeight, getAdminChin} = require('./routes/render-pages')
const {getAdminJR, getAdminMP, getAdminMile, getAdminPlank, getAdminPull, getAdminPush, getAdminWall} = require('./routes/render-pages')
const {addUser} = require('./routes/login-users')
const {deleteBet, addBet, adminDeleteBet, disableEvent, selectWinner, deleteWinner} = require('./routes/manage-bets')

//routes for the app
app.get('/', getHomePage);
app.get('/sign-up', getSignUpPage);
app.get('/sign-in', getSignInPage);
app.get('/profile', getProfilePage);
app.get('/events', getEventPage);
app.get('/manage-bet', getManageBetPage);
app.get('/admin-manage-bet',getAdminManageBetPage);
app.get('/select-winner', getSelectWinnerPage);
app.get('/bp-rep', getBPRep);
app.get('/admin-bp-rep', getAdminBPRep);
app.get('/mp', getMP);
app.get('/admin-mp', getAdminMP);
app.get('/push', getPush);
app.get('/admin-push', getAdminPush);
app.get('/chin', getChin);
app.get('/admin-chin', getAdminChin);
app.get('/pull', getPull);
app.get('/admin-pull', getAdminPull);
app.get('/plank', getPlank);
app.get('/admin-plank', getAdminPlank);
app.get('/wall', getWall);
app.get('/admin-wall', getAdminWall);
app.get('/jr', getJR);
app.get('/admin-jr', getAdminJR);
app.get('/mile', getMile);
app.get('/admin-mile', getAdminMile);
app.get('/meter', getMeter);
app.get('/admin-meter', getAdminMeter);
app.get('/admin', getAdmin);
app.get('/bp-weight', getBPWeight);
app.get('/results', function(req, res) {
    if(req.isAuthenticated()) {
    var better_id = req.session.passport.user.user_id;
    db.query("SELECT betterType FROM better WHERE b_id = ?", better_id, function(err, result) {
        var betterType = result[0].betterType;
        if(betterType == 'admin') {
            db.query("SELECT * FROM bet", function(err, resB) {
                if(err) throw err;
                var betArr = resB;
                db.query("SELECT * FROM winners", function(err, resW) {
                    var winArr = resW;
                    populateIsCorrect(betArr, winArr);
                });
            });
            db.query("DELETE FROM results", function(err, result) {
                if(err) throw err;
            })
            db.query("INSERT INTO results(betAmount, better_name, contestant_name, event_name, bet_type, w_win, contrib) SELECT betAmount, CONCAT(better.firstname, ' ', better.lastname) as b_fullname, CONCAT(contestants.firstname, ' ', contestants.lastname) as c_fullname , eventName, betType, (SELECT IF(betType = 'Win', 1, 0)) * betAmount * isCorrect AS w_win, betAmount*isCorrect AS contrib FROM bet JOIN better ON  bet.better_id = better.b_id JOIN contestants ON bet.contestant_id = contestants.c_id JOIN sport ON bet.event_id = sport.e_id", function(err, result) {
                if(err) throw err;
            }); 
            db.query("call getAllWinnings()", function(err, result) {
                if(err) throw err;
            });
            db.query("SELECT * FROM results ORDER BY event_name", function(err, result) {
                if(err) throw err;
                db.query("SELECT better_name, Sum(winningMinusCut) AS sum FROM results GROUP BY better_name", function(err, result2) {
                    db.query("SELECT SUM(cut) AS sum FROM results", function(err, result3) {
                        if(err) throw err;
                        res.render('display-results', {results: result, totalPerBetter: result2, amountToCharity: result3});
                    });
                    
                });
                
            })

            
        }
        else {
            res.redirect('/profile')
        }
    }); 
    
}
else {
    res.redirect('/')
}
    
});
              
app.get('/admin-bp-weight', getAdminBPWeight);
app.get('/log-out', function(req, res) {
    req.logout();
    req.session.destroy(() => {
        res.clearCookie('connect.sid')
        res.redirect('/')
    })
});

app.post('/sign-up', addUser);
app.post('/delete-bet', deleteBet);
app.post('/admin-delete-bet', adminDeleteBet);
app.post('/delete-winner', deleteWinner)
app.post('/add-bet', addBet);
app.post('/disable-event', disableEvent);
app.post('/select-winner', selectWinner);
app.post('/sign-in', passport.authenticate('local', 
{ 
    successRedirect: '/profile', //success option
    failureRedirect: '/sign-in', //failure option
    failureFlash: true //allows you to store failure messages
}));

//set the app to listen on port 3000
app.listen('3000', () => {
    console.log('Server started on port 3000');
});
