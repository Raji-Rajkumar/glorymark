const bcrypt = require('bcrypt');
const saltRounds = 10;

//authentication packages
var session = require('express-session')
var passport = require('passport')

module.exports = {
    addUser: (req, res) => {

        //checks for validation errors
        req.checkBody('username', 'Username must be between 4-20 characters long.').len(4, 20);
        req.checkBody('pword', 'Password must be between 4-50 characters long.').len(4, 50);
        req.checkBody('pwordMatch', 'Passwords do not match, please try again.').equals(req.body.pword);

        const errors = req.validationErrors();

        if(errors) {
            //if there are errors redners sign up page with error messages displaying
            res.render('sign-up', {errArr: errors, errMsg: req.flash('errMsg')})
        } 
        else {
            var checkusername = db.query('SELECT b_id FROM better WHERE username = ?',req.body.username, function(err, result) {
                if(err) throw err;

                if(result.length != 0) {
                    //if user already exists, render signup page with error
                    req.flash('errMsg', "The username you entered already exists. Please try again");
                    res.redirect("/sign-up");

                } else {
                    //add new user to database
            
                    //hash password for extra security
                    bcrypt.hash(req.body.pword, saltRounds, function(err, hash) {
                        if(req.body.adminCode == '121199') {
                            var better = {
                                firstname: req.body.firstname,
                                lastname: req.body.lastname,
                                username: req.body.username,
                                pword: hash,
                                betterType: 'admin'
                            };
                        }
                        else {
                            if(req.body.adminCode != '') {
                                req.flash('errMsg', "The admin code you entered is incorrect. Please try again or register as normal user.");
                                res.redirect("/sign-up");
                            }
                            else {
                                var better = {
                                    firstname: req.body.firstname,
                                    lastname: req.body.lastname,
                                    username: req.body.username,
                                    pword: hash,
                                    betterType: 'normal'
                                };
                            }
                        }
                        db.query('INSERT INTO better SET ?', better, function(err, results, fields) {
                            if(err) throw err;
                            
                            db.query('SELECT LAST_INSERT_ID() as user_id', function(err, results, fields) {
                                if(err) throw err;

                                const user_id = results[0];

                                req.login(results[0], function(err) {
                                    res.redirect('/profile')
                                });

                            });
                        });
                    });
                } //end of else  
            }); 

        } //end of else 
        
    },

};

//passport attaches the profile information to req.user as a direct result of the serializeUser() and deserializeUser() functions.
passport.serializeUser(function(user_id, done) {
    done(null, user_id);
  });
  
  passport.deserializeUser(function(user_id, done) {
    done(null, user_id);
  });