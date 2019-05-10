// const bcrypt = require('bcrypt');
// const saltRounds = 10;

//authentication packages
// var session = require('express-session')
// var passport = require('passport')



module.exports = {
    getAdmin: (req, res) => {
        
            if(req.isAuthenticated()) {
                var better_id = req.session.passport.user.user_id;
                db.query("SELECT betterType FROM better WHERE b_id = ?", better_id, function(err, result) {
                    var betterType = result[0].betterType;
                    if(betterType == 'admin') {
                        db.query("SELECT COUNT(DISTINCT better_id) AS count, SUM(betAmount) AS sum, e_id, eventName, href, isDisabled FROM sport LEFT JOIN bet ON sport.e_id= bet.event_id GROUP BY e_id ORDER BY eventName", function(err, results) {
                            if(err) throw err;
                            res.render('admin', {betInfo: results});
                        }); 
                    }
                    else {
                        res.redirect('/profile')
                    }
                });
        
                
                
            }
            else {
                res.redirect('/')
            }
        
    },

    getSelectWinnerPage: (req, res) => {
        
        if(req.isAuthenticated()) {
            var better_id = req.session.passport.user.user_id;
            db.query("SELECT betterType FROM better WHERE b_id = ?", better_id, function(err, result) {
                var betterType = result[0].betterType;
                if(betterType == 'admin') {
                    db.query("SELECT CONCAT(firstname, ' ', lastname) AS fullname, c_id FROM contestants", function(err, res1) {
                        if(err) throw err;
                        db.query("SELECT eventName, e_id FROM sport", function(err, res2) {
                            if(err) throw err;
                            db.query("SELECT CONCAT(firstname, ' ', lastname) AS fullname, eventName, winType, w_id FROM winners JOIN sport ON winners.event_id = sport.e_id JOIN contestants on winners.contestant_id = contestants.c_id", function(err, res3) {
                                if(err) throw err;
                                res.render('select-winner', {contestants: res1, events: res2, winners: res3});
                            });
                        });
                    }); 
                }
                else {
                    res.redirect('/profile')
                }
            });
    
            
            
        }
        else {
            res.redirect('/')
        }
    
    },
    getHomePage: (req, res) => {
        if (req.isAuthenticated()) {
            var better_id = req.session.passport.user.user_id;
            db.query("SELECT betterType FROM better WHERE b_id = ?", better_id, function(err, result) {
                var betterType = result[0].betterType;
                if(betterType == 'admin') {
                    res.redirect('/admin');
                }
                else {
                    res.redirect('/profile')
                }
            });
        } 
        else {
            res.render('home');
        } 
    },

    getSignUpPage: (req, res) => {
        if (req.isAuthenticated()) {
            var better_id = req.session.passport.user.user_id;
            db.query("SELECT betterType FROM better WHERE b_id = ?", better_id, function(err, result) {
                var betterType = result[0].betterType;
                if(betterType == 'admin') {
                    res.redirect('/admin');
                }
                else {
                    res.redirect('/profile');
                }
            });
        } 
        else {
            res.render('sign-up', {errArr: [], title: 'Sign Up', errMsg: req.flash('errMsg')});
        }  
        
    },

    getSignInPage: (req, res) => {
        if (req.isAuthenticated()) {
            var better_id = req.session.passport.user.user_id;
            db.query("SELECT betterType FROM better WHERE b_id = ?", better_id, function(err, result) {
                var betterType = result[0].betterType;
                if(betterType == 'admin') {
                    res.redirect('/admin');
                }
                else {
                    res.redirect('/profile');
                }
            });
        } 
        else {
            res.render('sign-in', {failureFlash: req.flash('failureFlash')});
        } 
         
        
    },

    getProfilePage: (req, res) => {
        if (req.isAuthenticated()) {
            var better_id = req.session.passport.user.user_id;
            db.query("SELECT betterType FROM better WHERE b_id = ?", better_id, function(err, result) {
                var betterType = result[0].betterType;
                if(betterType == 'admin') {
                    res.redirect('/admin');
                }
                else {
                    db.query("SELECT DISTINCT CONCAT(firstname, ' ', lastname) AS fullname FROM better WHERE b_id = ?", better_id, function(err, result) {
                        if(err) throw err;
                        var betterName = result[0].fullname;
                        db.query("SELECT COUNT(*) AS count FROM bet WHERE better_id = ?", better_id, function(err, result) {
                            var count = result[0].count;
                            db.query("SELECT DISTINCT CONCAT(firstname, ' ', lastname) AS fullname, betAmount, betType, eventName FROM bet JOIN contestants ON bet.contestant_id = contestants.c_id JOIN sport ON bet.event_id = sport.e_id WHERE better_id = ? ORDER BY eventName", better_id, function(err, results) {
                                if(err) throw err;
                                res.render('profile', {name: betterName, betInfo: results, count: count});
                            }); 
                        });
                    });
                }
            }); 
        } 
        else {
            res.redirect('/')
        } 
        
        
    },

    getEventPage: (req, res) => {
        if (req.isAuthenticated()) {
            var better_id = req.session.passport.user.user_id;
            db.query("SELECT betterType FROM better WHERE b_id = ?", better_id, function(err, result) {
                var betterType = result[0].betterType;
                if(betterType == 'admin') {
                    res.redirect('/admin');
                }
                else {
                    db.query("SELECT eventName, eventDesc, isDisabled, href FROM sport ORDER BY eventName", function(err, results) {
                        // console.log(results);
                        if(err) throw err;
                        res.render('events', {events: results});
                        
                    }); 
                }
            });
        } 
        else {
            
            res.redirect('/')
        } 
    },

    getManageBetPage: (req, res) => {
        if (req.isAuthenticated()) {
            var better_id = req.session.passport.user.user_id;
            db.query("SELECT betterType FROM better WHERE b_id = ?", better_id, function(err, result) {
                var betterType = result[0].betterType;
                if(betterType == 'admin') {
                    res.redirect('/admin');
                }
                else {
                    db.query("SELECT DISTINCT CONCAT(firstname, ' ', lastname) AS fullname, event1, stat1, event2, stat2, event3, stat3 FROM contestants ORDER BY fullname", function(err, results) {
                        // console.log(results);
                        if(err) {
                            res.redirect('/events');
                        }
                        
                        res.render('manage-bet', {contestants: results, title: req.flash('title'), betInfo: [], error: req.flash('error')});
                        
                    });
                }
            });
        } 
        else {
            
            res.redirect('/')
        } 
    },

    getAdminManageBetPage: (req, res) => {
        if (req.isAuthenticated()) {
            var better_id = req.session.passport.user.user_id;
            db.query("SELECT betterType FROM better WHERE b_id = ?", better_id, function(err, result) {
                var betterType = result[0].betterType;
                if(betterType == 'admin') {
                    res.render('admin-manage-bet', {title: req.flash('admin-title'), betInfo: []});
                }
                else {
                    res.redirect('/profile')
                }
            });
        } 
        else {
            
            res.redirect('/')
        } 

    },
    getBPRep: (req, res) => {
        if (req.isAuthenticated()) {
            var better_id = req.session.passport.user.user_id;

            db.query("SELECT betterType FROM better WHERE b_id = ?", better_id, function(err, result) {
                var betterType = result[0].betterType;
                if(betterType == 'admin') {
                    res.redirect('/admin');
                }
                else {
                    db.query("SELECT e_id, isDisabled FROM sport WHERE eventName = 'Bench Press (Max Reps)'", function(err, result) {
                        if(err) {
                            res.redirect('/events');
                        }
                        var isDisabled = result[0].isDisabled;
                        var event_id = result[0].e_id;
                        if(isDisabled == 'F') {
                            db.query("SELECT COUNT(*) AS count FROM bet WHERE better_id = ? AND event_id = ?", [better_id, event_id], function(err, result) {
                                if(err) {
                                    res.redirect('/events');
                                }
                                if(result[0].count == 0) {
                                    req.flash('title', 'Bench Press (Max Reps)');
                                    res.redirect('/manage-bet');
                                }
                                else {
                                    db.query("SELECT DISTINCT CONCAT(firstname, ' ', lastname) AS fullname, betAmount, betType, bet_id FROM bet JOIN contestants ON bet.contestant_id = contestants.c_id WHERE better_id = ? AND event_id = ?", [better_id, event_id], function(err, results) {
                                        if(err) {
                                            res.redirect('/events');
                                        }
                                        req.flash('title', 'Bench Press (Max Reps)');
                                        db.query("SELECT DISTINCT CONCAT(firstname, ' ', lastname) AS fullname, event1, stat1, event2, stat2, event3, stat3 FROM contestants ORDER BY fullname", function(err, results2) {
                                            // console.log(results);
                                            if(err) {
                                                res.redirect('/events');
                                            }
                                            
                                            res.render('manage-bet', {contestants: results2, title: req.flash('title'), betInfo: results, error: req.flash('error')});
                                            
                                        });
                                        
                                    });
                                }
                            });
                        }
                        else {
                            res.redirect('/events');
                        }
                    
                    });
                }
            });
            
        } 
        else {
            
            res.redirect('/')
        } 
    },

    getAdminBPRep: (req, res) => {
        if(req.isAuthenticated()) {
            var better_id = req.session.passport.user.user_id;
            db.query("SELECT betterType FROM better WHERE b_id = ?", better_id, function(err, result) {
                var betterType = result[0].betterType;
                if(betterType == 'admin') {
                    db.query("SELECT e_id FROM sport WHERE eventName = 'Bench Press (Max Reps)'", function(err, result) {
                        if(err) throw err;
                        
                        var event_id = result[0].e_id;
                        db.query("SELECT COUNT(*) AS count FROM bet WHERE event_id = ?", event_id, function(err, result) {
                            if(result[0].count == 0) {
                                req.flash('admin-title', 'Bench Press (Max Reps)');
                                res.redirect('/admin-manage-bet');
                            }
                            else {
                                db.query("SELECT CONCAT(c.firstname, ' ', c.lastname) AS c_fullname, betAmount, betType, bet_id, CONCAT(u.firstname, ' ', u.lastname) AS u_fullname FROM bet JOIN contestants c ON bet.contestant_id = c.c_id JOIN better u ON bet.better_id = u.b_id WHERE event_id = ?", event_id, function(err, results) {
                                    if(err) throw err;
                                    req.flash('admin-title', 'Bench Press (Max Reps)');
                                    res.render('admin-manage-bet', {title: req.flash('admin-title'), betInfo: results});
                                    
                                });
                            }
                        });
                    
                    });
                }
                else {
                    res.redirect('/profile');
                }
            });

        }
    },

    getMP: (req, res) => {
        if (req.isAuthenticated()) {
        
            var better_id = req.session.passport.user.user_id;

            db.query("SELECT betterType FROM better WHERE b_id = ?", better_id, function(err, result) {
                if(err) throw err;
                var betterType = result[0].betterType;
                if(betterType == 'admin') {
                    res.redirect('/admin');
                }
                else {
                    db.query("SELECT e_id, isDisabled FROM sport WHERE eventName = 'Military Press'", function(err, result) {
                        if(err) {
                            res.redirect('/events');
                        }
                        var isDisabled = result[0].isDisabled;
                        var event_id = result[0].e_id;
                        if(isDisabled == 'F') {
                            db.query("SELECT COUNT(*) AS count FROM bet WHERE better_id = ? AND event_id = ?", [better_id, event_id], function(err, result) {
                                if(err) {
                                    res.redirect('/events');
                                }
                                if(result[0].count == 0) {
                                    req.flash('title', 'Military Press');
                                    res.redirect('/manage-bet');
                                }
                                else {
                                    db.query("SELECT DISTINCT CONCAT(firstname, ' ', lastname) AS fullname, betAmount, betType, bet_id FROM bet JOIN contestants ON bet.contestant_id = contestants.c_id WHERE better_id = ? AND event_id = ?", [better_id, event_id], function(err, results) {
                                        if(err) {
                                            res.redirect('/events');
                                        }
                                        req.flash('title', 'Military Press');
                                        db.query("SELECT DISTINCT CONCAT(firstname, ' ', lastname) AS fullname, event1, stat1, event2, stat2, event3, stat3 FROM contestants ORDER BY fullname", function(err, results2) {
                                            // console.log(results);
                                            if(err) {
                                                res.redirect('/events');
                                            }
                                            
                                            res.render('manage-bet', {contestants: results2, title: req.flash('title'), betInfo: results, error: req.flash('error')});
                                            
                                        });
                                        
                                    });
                                }
                            });
                        }
                        else {
                            res.redirect('/events')
                        }
                    
                    });
                }
            });

        } 
        else {
            
            res.redirect('/')
        } 

    },

    getAdminMP: (req, res) => {
        if(req.isAuthenticated()) {
            var better_id = req.session.passport.user.user_id;
            db.query("SELECT betterType FROM better WHERE b_id = ?", better_id, function(err, result) {
                var betterType = result[0].betterType;
                if(betterType == 'admin') {
                    db.query("SELECT e_id FROM sport WHERE eventName = 'Military Press'", function(err, result) {
                        if(err) throw err;
                        
                        var event_id = result[0].e_id;
                        db.query("SELECT COUNT(*) AS count FROM bet WHERE event_id = ?", event_id, function(err, result) {
                            if(result[0].count == 0) {
                                req.flash('admin-title', 'Military Press');
                                res.redirect('/admin-manage-bet');
                            }
                            else {
                                db.query("SELECT CONCAT(c.firstname, ' ', c.lastname) AS c_fullname, betAmount, betType, bet_id, CONCAT(u.firstname, ' ', u.lastname) AS u_fullname FROM bet JOIN contestants c ON bet.contestant_id = c.c_id JOIN better u ON bet.better_id = u.b_id WHERE event_id = ?", event_id, function(err, results) {
                                    if(err) throw err;
                                    req.flash('admin-title', 'Military Press');
                                    res.render('admin-manage-bet', {title: req.flash('admin-title'), betInfo: results});
                                    
                                });
                            }
                        });
                    
                    });
                }
                else {
                    res.redirect('/profile');
                }
            });

        }
    },

    getPush: (req, res) => {
        if (req.isAuthenticated()) {

            var better_id = req.session.passport.user.user_id;

            db.query("SELECT betterType FROM better WHERE b_id = ?", better_id, function(err, result) {
                if(err) throw err;
                var betterType = result[0].betterType;
                if(betterType == 'admin') {
                    res.redirect('/admin');
                }
                else {
                    db.query("SELECT e_id, isDisabled FROM sport WHERE eventName = 'Push-Ups'", function(err, result) {
                        if(err) {
                            res.redirect('/events');
                        }
                        if(err) throw err;
                        var isDisabled = result[0].isDisabled;
                        var event_id = result[0].e_id;
                        if(isDisabled == 'F') {
                            db.query("SELECT COUNT(*) AS count FROM bet WHERE better_id = ? AND event_id = ?", [better_id, event_id], function(err, result) {
                                if(err) {
                                    res.redirect('/events');
                                }
                                if(result[0].count == 0) {
                                    req.flash('title', 'Push-Ups');
                                    res.redirect('/manage-bet');
                                }
                                else {
                                    db.query("SELECT DISTINCT CONCAT(firstname, ' ', lastname) AS fullname, betAmount, betType, bet_id FROM bet JOIN contestants ON bet.contestant_id = contestants.c_id WHERE better_id = ? AND event_id = ?", [better_id, event_id], function(err, results) {
                                        if(err) {
                                            res.redirect('/events');
                                        }
                                        req.flash('title', 'Push-Ups');
                                        db.query("SELECT DISTINCT CONCAT(firstname, ' ', lastname) AS fullname, event1, stat1, event2, stat2, event3, stat3 FROM contestants ORDER BY fullname", function(err, results2) {
                                            // console.log(results);
                                            if(err) {
                                                res.redirect('/events');
                                            }
                                            
                                            res.render('manage-bet', {contestants: results2, title: req.flash('title'), betInfo: results, error: req.flash('error')});
                                            
                                        });
                                        
                                    });
                                }
                            });
                        }
                        else {
                            res.redirect('/events')
                        }
                    
                    });
                }
            });
        } 
        else {
            
            res.redirect('/')
        } 

    },

    getAdminPush: (req, res) => {
        if(req.isAuthenticated()) {
            var better_id = req.session.passport.user.user_id;
            db.query("SELECT betterType FROM better WHERE b_id = ?", better_id, function(err, result) {
                var betterType = result[0].betterType;
                if(betterType == 'admin') {
                    db.query("SELECT e_id FROM sport WHERE eventName = 'Push-Ups'", function(err, result) {
                        if(err) throw err;
                        
                        var event_id = result[0].e_id;
                        db.query("SELECT COUNT(*) AS count FROM bet WHERE event_id = ?", event_id, function(err, result) {
                            if(result[0].count == 0) {
                                req.flash('admin-title', 'Push-Ups');
                                res.redirect('/admin-manage-bet');
                            }
                            else {
                                db.query("SELECT CONCAT(c.firstname, ' ', c.lastname) AS c_fullname, betAmount, betType, bet_id, CONCAT(u.firstname, ' ', u.lastname) AS u_fullname FROM bet JOIN contestants c ON bet.contestant_id = c.c_id JOIN better u ON bet.better_id = u.b_id WHERE event_id = ?", event_id, function(err, results) {
                                    if(err) throw err;
                                    req.flash('admin-title', 'Push-Ups');
                                    res.render('admin-manage-bet', {title: req.flash('admin-title'), betInfo: results});
                                    
                                });
                            }
                        });
                    
                    });
                }
                else {
                    res.redirect('/profile');
                }
            });

        }
    },

    getPull: (req, res) => {
        if (req.isAuthenticated()) {
            var better_id = req.session.passport.user.user_id;

            db.query("SELECT betterType FROM better WHERE b_id = ?", better_id, function(err, result) {
                var betterType = result[0].betterType;
                if(betterType == 'admin') {
                    res.redirect('/admin');
                }
                else {
                    db.query("SELECT e_id, isDisabled FROM sport WHERE eventName = 'Pull-Ups'", function(err, result) {
                        if(err) {
                            res.redirect('/events');
                        }
                        var isDisabled = result[0].isDisabled;
                        var event_id = result[0].e_id;
                        if(isDisabled == 'F') {
                            db.query("SELECT COUNT(*) AS count FROM bet WHERE better_id = ? AND event_id = ?", [better_id, event_id], function(err, result) {
                                if(err) {
                                    res.redirect('/events');
                                }
                                if(result[0].count == 0) {
                                    req.flash('title', 'Pull-Ups');
                                    res.redirect('/manage-bet');
                                }
                                else {
                                    db.query("SELECT DISTINCT CONCAT(firstname, ' ', lastname) AS fullname, betAmount, betType, bet_id FROM bet JOIN contestants ON bet.contestant_id = contestants.c_id WHERE better_id = ? AND event_id = ?", [better_id, event_id], function(err, results) {
                                        if(err) {
                                            res.redirect('/events');
                                        }
                                        req.flash('title', 'Pull-Ups');
                                        db.query("SELECT DISTINCT CONCAT(firstname, ' ', lastname) AS fullname, event1, stat1, event2, stat2, event3, stat3 FROM contestants ORDER BY fullname", function(err, results2) {
                                            // console.log(results);
                                            if(err) {
                                                res.redirect('/events');
                                            }
                                            
                                            res.render('manage-bet', {contestants: results2, title: req.flash('title'), betInfo: results, error: req.flash('error')});
                                            
                                        });
                                        
                                    });
                                }
                            });
                        }
                        else {
                            res.redirect('/events');
                        }
                    
                    });

                    
                }
            });
        } 
        else {
            
            res.redirect('/')
        } 

    },

    getAdminPull: (req, res) => {
        if(req.isAuthenticated()) {
            var better_id = req.session.passport.user.user_id;
            db.query("SELECT betterType FROM better WHERE b_id = ?", better_id, function(err, result) {
                var betterType = result[0].betterType;
                if(betterType == 'admin') {
                    db.query("SELECT e_id FROM sport WHERE eventName = 'Pull-Ups'", function(err, result) {
                        if(err) throw err;
                        
                        var event_id = result[0].e_id;
                        db.query("SELECT COUNT(*) AS count FROM bet WHERE event_id = ?", event_id, function(err, result) {
                            if(result[0].count == 0) {
                                req.flash('admin-title', 'Pull-Ups');
                                res.redirect('/admin-manage-bet');
                            }
                            else {
                                db.query("SELECT CONCAT(c.firstname, ' ', c.lastname) AS c_fullname, betAmount, betType, bet_id, CONCAT(u.firstname, ' ', u.lastname) AS u_fullname FROM bet JOIN contestants c ON bet.contestant_id = c.c_id JOIN better u ON bet.better_id = u.b_id WHERE event_id = ?", event_id, function(err, results) {
                                    if(err) throw err;
                                    req.flash('admin-title', 'Pull-Ups');
                                    res.render('admin-manage-bet', {title: req.flash('admin-title'), betInfo: results});
                                    
                                });
                            }
                        });
                    
                    });
                }
                else {
                    res.redirect('/profile');
                }
            });
      

        }
    },

    getChin: (req, res) => {
        if (req.isAuthenticated()) {
            var better_id = req.session.passport.user.user_id;

            db.query("SELECT betterType FROM better WHERE b_id = ?", better_id, function(err, result) {
                var betterType = result[0].betterType;
                if(betterType == 'admin') {
                    res.redirect('/admin');
                }
                else {
                    db.query("SELECT e_id, isDisabled FROM sport WHERE eventName = 'Chin-Ups'", function(err, result) {
                        if(err) {
                            res.redirect('/events');
                        }
                        var isDisabled = result[0].isDisabled;
                        var event_id = result[0].e_id;
                        if(isDisabled == 'F') {
                            db.query("SELECT COUNT(*) AS count FROM bet WHERE better_id = ? AND event_id = ?", [better_id, event_id], function(err, result) {
                                if(err) {
                                    res.redirect('/events');
                                }
                                if(result[0].count == 0) {
                                    req.flash('title', 'Chin-Ups');
                                    res.redirect('/manage-bet');
                                }
                                else {
                                    db.query("SELECT DISTINCT CONCAT(firstname, ' ', lastname) AS fullname, betAmount, betType, bet_id FROM bet JOIN contestants ON bet.contestant_id = contestants.c_id WHERE better_id = ? AND event_id = ?", [better_id, event_id], function(err, results) {
                                        if(err) {
                                            res.redirect('/events');
                                        }
                                        req.flash('title', 'Chin-Ups');
                                        db.query("SELECT DISTINCT CONCAT(firstname, ' ', lastname) AS fullname, event1, stat1, event2, stat2, event3, stat3 FROM contestants ORDER BY fullname", function(err, results2) {
                                            // console.log(results);
                                            if(err) {
                                                res.redirect('/events');
                                            }
                                            
                                            res.render('manage-bet', {contestants: results2, title: req.flash('title'), betInfo: results, error: req.flash('error')});
                                            
                                        });
                                        
                                    });
                                }
                            });  
                        }
                        else {
                            res.redirect('/events')
                        }
                    
                    });
                }
            });
        } 
        else {
            
            res.redirect('/')
        } 

    },

    getAdminChin: (req, res) => {
        if(req.isAuthenticated()) {
            var better_id = req.session.passport.user.user_id;
            db.query("SELECT betterType FROM better WHERE b_id = ?", better_id, function(err, result) {
                var betterType = result[0].betterType;
                if(betterType == 'admin') {
                    db.query("SELECT e_id FROM sport WHERE eventName = 'Chin-Ups'", function(err, result) {
                        if(err) throw err;
                        
                        var event_id = result[0].e_id;
                        db.query("SELECT COUNT(*) AS count FROM bet WHERE event_id = ?", event_id, function(err, result) {
                            if(result[0].count == 0) {
                                req.flash('admin-title', 'Chin-Ups');
                                res.redirect('/admin-manage-bet');
                            }
                            else {
                                db.query("SELECT CONCAT(c.firstname, ' ', c.lastname) AS c_fullname, betAmount, betType, bet_id, CONCAT(u.firstname, ' ', u.lastname) AS u_fullname FROM bet JOIN contestants c ON bet.contestant_id = c.c_id JOIN better u ON bet.better_id = u.b_id WHERE event_id = ?", event_id, function(err, results) {
                                    if(err) throw err;
                                    req.flash('admin-title', 'Chin-Ups');
                                    res.render('admin-manage-bet', {title: req.flash('admin-title'), betInfo: results});
                                    
                                });
                            }
                        });
                    
                    });
                }
                else {
                    res.redirect('/profile');
                }
            });

        }
    },

    getPlank: (req, res) => {
        if (req.isAuthenticated()) {
            var better_id = req.session.passport.user.user_id;

            db.query("SELECT betterType FROM better WHERE b_id = ?", better_id, function(err, result) {
                var betterType = result[0].betterType;
                if(betterType == 'admin') {
                    res.redirect('/admin');
                }
                else {
                    db.query("SELECT e_id, isDisabled FROM sport WHERE eventName = 'Planks'", function(err, result) {
                        if(err) {
                            res.redirect('/events');
                        }
                        var isDisabled = result[0].isDisabled;
                        var event_id = result[0].e_id;
                        if(isDisabled == 'F') {
                            db.query("SELECT COUNT(*) AS count FROM bet WHERE better_id = ? AND event_id = ?", [better_id, event_id], function(err, result) {
                                if(err) {
                                    res.redirect('/events');
                                }
                                if(result[0].count == 0) {
                                    req.flash('title', 'Planks');
                                    res.redirect('/manage-bet');
                                }
                                else {
                                    db.query("SELECT DISTINCT CONCAT(firstname, ' ', lastname) AS fullname, betAmount, betType, bet_id FROM bet JOIN contestants ON bet.contestant_id = contestants.c_id WHERE better_id = ? AND event_id = ?", [better_id, event_id], function(err, results) {
                                        if(err) {
                                            res.redirect('/events');
                                        }
                                        
                                        req.flash('title', 'Planks');
                                        db.query("SELECT DISTINCT CONCAT(firstname, ' ', lastname) AS fullname, event1, stat1, event2, stat2, event3, stat3 FROM contestants ORDER BY fullname", function(err, results2) {
                                            // console.log(results);
                                            if(err) {
                                                res.redirect('/events');
                                            }
                                            
                                            res.render('manage-bet', {contestants: results2, title: req.flash('title'), betInfo: results, error: req.flash('error')});
                                            
                                        });
                                        
                                    });
                                }
                            });
                        } 
                        else {
                            res.redirect('/events')
                        }
                    
                    });
                }
            });
        } 
        else {
            
            res.redirect('/')
        } 

    },

    getAdminPlank: (req, res) => {
        if(req.isAuthenticated()) {
            var better_id = req.session.passport.user.user_id;
            db.query("SELECT betterType FROM better WHERE b_id = ?", better_id, function(err, result) {
                var betterType = result[0].betterType;
                if(betterType == 'admin') {
                    db.query("SELECT e_id FROM sport WHERE eventName = 'Planks'", function(err, result) {
                        if(err) throw err;
                        
                        var event_id = result[0].e_id;
                        db.query("SELECT COUNT(*) AS count FROM bet WHERE event_id = ?", event_id, function(err, result) {
                            if(result[0].count == 0) {
                                req.flash('admin-title', 'Planks');
                                res.redirect('/admin-manage-bet');
                            }
                            else {
                                db.query("SELECT CONCAT(c.firstname, ' ', c.lastname) AS c_fullname, betAmount, betType, bet_id, CONCAT(u.firstname, ' ', u.lastname) AS u_fullname FROM bet JOIN contestants c ON bet.contestant_id = c.c_id JOIN better u ON bet.better_id = u.b_id WHERE event_id = ?", event_id, function(err, results) {
                                    if(err) throw err;
                                    req.flash('admin-title', 'Planks');
                                    res.render('admin-manage-bet', {title: req.flash('admin-title'), betInfo: results});
                                    
                                });
                            }
                        });
                    
                    });
                }
                else {
                    res.redirect('/profile');
                }
            });

        }
    },

    getWall: (req, res) => {
        if (req.isAuthenticated()) {
            var better_id = req.session.passport.user.user_id;

            db.query("SELECT betterType FROM better WHERE b_id = ?", better_id, function(err, result) {
                var betterType = result[0].betterType;
                if(betterType == 'admin') {
                    res.redirect('/admin');
                }
                else {
                    db.query("SELECT e_id, isDisabled FROM sport WHERE eventName = 'Wall-Sits'", function(err, result) {
                        if(err) {
                            res.redirect('/events');
                        }
                        var isDisabled = result[0].isDisabled;
                        var event_id = result[0].e_id;
                        if(isDisabled == 'F') {
                            db.query("SELECT COUNT(*) AS count FROM bet WHERE better_id = ? AND event_id = ?", [better_id, event_id], function(err, result) {
                                if(err) {
                                    res.redirect('/events');
                                }
                                if(result[0].count == 0) {
                                    req.flash('title', 'Wall-Sits');
                                    res.redirect('/manage-bet');
                                }
                                else {
                                    db.query("SELECT DISTINCT CONCAT(firstname, ' ', lastname) AS fullname, betAmount, betType, bet_id FROM bet JOIN contestants ON bet.contestant_id = contestants.c_id WHERE better_id = ? AND event_id = ?", [better_id, event_id], function(err, results) {
                                        if(err) {
                                            res.redirect('/events');
                                        }
                                        
                                        req.flash('title', 'Wall-Sits');
                                        db.query("SELECT DISTINCT CONCAT(firstname, ' ', lastname) AS fullname, event1, stat1, event2, stat2, event3, stat3 FROM contestants ORDER BY fullname", function(err, results2) {
                                            // console.log(results);
                                            if(err) {
                                                res.redirect('/events');
                                            }
                                            
                                            res.render('manage-bet', {contestants: results2, title: req.flash('title'), betInfo: results, error: req.flash('error')});
                                            
                                        });
                                        
                                    });
                                }
                            });
                        }
                        else {
                            res.redirect('/events');
                        }
                    
                    });
                }
            });
        } 
        else {
            
            res.redirect('/')
        } 

    },

    getAdminWall: (req, res) => {
        if(req.isAuthenticated()) {
            var better_id = req.session.passport.user.user_id;
            db.query("SELECT betterType FROM better WHERE b_id = ?", better_id, function(err, result) {
                var betterType = result[0].betterType;
                if(betterType == 'admin') {
                    db.query("SELECT e_id FROM sport WHERE eventName = 'Wall-Sits'", function(err, result) {
                        if(err) throw err;
                        
                        var event_id = result[0].e_id;
                        db.query("SELECT COUNT(*) AS count FROM bet WHERE event_id = ?", event_id, function(err, result) {
                            if(result[0].count == 0) {
                                req.flash('admin-title', 'Wall-Sits');
                                res.redirect('/admin-manage-bet');
                            }
                            else {
                                db.query("SELECT CONCAT(c.firstname, ' ', c.lastname) AS c_fullname, betAmount, betType, bet_id, CONCAT(u.firstname, ' ', u.lastname) AS u_fullname FROM bet JOIN contestants c ON bet.contestant_id = c.c_id JOIN better u ON bet.better_id = u.b_id WHERE event_id = ?", event_id, function(err, results) {
                                    if(err) throw err;
                                    req.flash('admin-title', 'Wall-Sits');
                                    res.render('admin-manage-bet', {title: req.flash('admin-title'), betInfo: results});
                                    
                                });
                            }
                        });
                    
                    });
                }
                else {
                    res.redirect('/profile');
                }
            });

        }
    },

    getJR: (req, res) => {
        if (req.isAuthenticated()) {
            var better_id = req.session.passport.user.user_id;

            db.query("SELECT betterType FROM better WHERE b_id = ?", better_id, function(err, result) {
                var betterType = result[0].betterType;
                if(betterType == 'admin') {
                    res.redirect('/admin');
                }
                else {
                    db.query("SELECT e_id, isDisabled FROM sport WHERE eventName = 'Jumprope'", function(err, result) {
                        if(err) {
                            res.redirect('/events');
                        }
                        var isDisabled = result[0].isDisabled;
                        var event_id = result[0].e_id;
                        if(isDisabled == 'F') {
                            db.query("SELECT COUNT(*) AS count FROM bet WHERE better_id = ? AND event_id = ?", [better_id, event_id], function(err, result) {
                                if(err) {
                                    res.redirect('/events');
                                }
                                if(result[0].count == 0) {
                                    req.flash('title', 'Jumprope');
                                    res.redirect('/manage-bet');
                                }
                                else {
                                    db.query("SELECT DISTINCT CONCAT(firstname, ' ', lastname) AS fullname, betAmount, betType, bet_id FROM bet JOIN contestants ON bet.contestant_id = contestants.c_id WHERE better_id = ? AND event_id = ?", [better_id, event_id], function(err, results) {
                                        if(err) {
                                            res.redirect('/events');
                                        }
                                        req.flash('title', 'Jumprope');
                                        db.query("SELECT DISTINCT CONCAT(firstname, ' ', lastname) AS fullname, event1, stat1, event2, stat2, event3, stat3 FROM contestants ORDER BY fullname", function(err, results2) {
                                            // console.log(results);
                                            if(err) {
                                                res.redirect('/events');
                                            }
                                            
                                            res.render('manage-bet', {contestants: results2, title: req.flash('title'), betInfo: results, error: req.flash('error')});
                                            
                                        });
                                        
                                    });
                                }
                            });
                        }
                        else {
                            res.redirect('/events')
                        }
                    
                    });
                }
            });
        } 
        else {
            
            res.redirect('/')
        } 

    },

    getAdminJR: (req, res) => {
        if(req.isAuthenticated()) {
            var better_id = req.session.passport.user.user_id;
            db.query("SELECT betterType FROM better WHERE b_id = ?", better_id, function(err, result) {
                var betterType = result[0].betterType;
                if(betterType == 'admin') {
                    db.query("SELECT e_id FROM sport WHERE eventName = 'Jumprope'", function(err, result) {
                        if(err) throw err;
                        
                        var event_id = result[0].e_id;
                        db.query("SELECT COUNT(*) AS count FROM bet WHERE event_id = ?", event_id, function(err, result) {
                            if(result[0].count == 0) {
                                req.flash('admin-title', 'Jumprope');
                                res.redirect('/admin-manage-bet');
                            }
                            else {
                                db.query("SELECT CONCAT(c.firstname, ' ', c.lastname) AS c_fullname, betAmount, betType, bet_id, CONCAT(u.firstname, ' ', u.lastname) AS u_fullname FROM bet JOIN contestants c ON bet.contestant_id = c.c_id JOIN better u ON bet.better_id = u.b_id WHERE event_id = ?", event_id, function(err, results) {
                                    if(err) throw err;
                                    req.flash('admin-title', 'Jumprope');
                                    res.render('admin-manage-bet', {title: req.flash('admin-title'), betInfo: results});
                                    
                                });
                            }
                        });
                    
                    });
                }
                else {
                    res.redirect('/profile');
                }
            });

        }
    },

    getMile: (req, res) => {
        if (req.isAuthenticated()) {
            var better_id = req.session.passport.user.user_id;

            db.query("SELECT betterType FROM better WHERE b_id = ?", better_id, function(err, result) {
                var betterType = result[0].betterType;
                if(betterType == 'admin') {
                    res.redirect('/admin');
                }
                else {
                    db.query("SELECT e_id, isDisabled FROM sport WHERE eventName = 'One Mile Run'", function(err, result) {
                        if(err) {
                            res.redirect('/events');
                        }
                        var isDisabled = result[0].isDisabled;
                        var event_id = result[0].e_id;
                        if(isDisabled == 'F') {
                            db.query("SELECT COUNT(*) AS count FROM bet WHERE better_id = ? AND event_id = ?", [better_id, event_id], function(err, result) {
                                if(err) {
                                    res.redirect('/events');
                                }
                                if(result[0].count == 0) {
                                    req.flash('title', 'One Mile Run');
                                    res.redirect('/manage-bet');
                                }
                                else {
                                    db.query("SELECT DISTINCT CONCAT(firstname, ' ', lastname) AS fullname, betAmount, betType, bet_id FROM bet JOIN contestants ON bet.contestant_id = contestants.c_id WHERE better_id = ? AND event_id = ?", [better_id, event_id], function(err, results) {
                                        if(err) {
                                            res.redirect('/events');
                                        }
                                        req.flash('title', 'One Mile Run');
                                        db.query("SELECT DISTINCT CONCAT(firstname, ' ', lastname) AS fullname, event1, stat1, event2, stat2, event3, stat3 FROM contestants ORDER BY fullname", function(err, results2) {
                                            // console.log(results);
                                            if(err) {
                                                res.redirect('/events');
                                            }
                                            
                                            res.render('manage-bet', {contestants: results2, title: req.flash('title'), betInfo: results, error: req.flash('error')});
                                            
                                        });
                                        
                                    });
                                }
                            });
                        }
                        else {
                            res.redirect('/events')
                        }
                    
                    });
                }
            });
        } 
        else {
            
            res.redirect('/')
        } 

    },

    getAdminMile: (req, res) => {
        if(req.isAuthenticated()) {
            var better_id = req.session.passport.user.user_id;
            db.query("SELECT betterType FROM better WHERE b_id = ?", better_id, function(err, result) {
                var betterType = result[0].betterType;
                if(betterType == 'admin') {
                    db.query("SELECT e_id FROM sport WHERE eventName = 'One Mile Run'", function(err, result) {
                        if(err) throw err;
                        
                        var event_id = result[0].e_id;
                        db.query("SELECT COUNT(*) AS count FROM bet WHERE event_id = ?", event_id, function(err, result) {
                            if(result[0].count == 0) {
                                req.flash('admin-title', 'One Mile Run');
                                res.redirect('/admin-manage-bet');
                            }
                            else {
                                db.query("SELECT CONCAT(c.firstname, ' ', c.lastname) AS c_fullname, betAmount, betType, bet_id, CONCAT(u.firstname, ' ', u.lastname) AS u_fullname FROM bet JOIN contestants c ON bet.contestant_id = c.c_id JOIN better u ON bet.better_id = u.b_id WHERE event_id = ?", event_id, function(err, results) {
                                    if(err) throw err;
                                    req.flash('admin-title', 'One Mile Run');
                                    res.render('admin-manage-bet', {title: req.flash('admin-title'), betInfo: results});
                                    
                                });
                            }
                        });
                    
                    });
                }
                else {
                    res.redirect('/profile');
                }
            });

        }
    },

    getMeter: (req, res) => {
        if (req.isAuthenticated()) {

            var better_id = req.session.passport.user.user_id;

            db.query("SELECT betterType FROM better WHERE b_id = ?", better_id, function(err, result) {
                var betterType = result[0].betterType;
                if(betterType == 'admin') {
                    res.redirect('/admin');
                }
                else {
                    db.query("SELECT e_id, isDisabled FROM sport WHERE eventName = '100 Meter Sprint'", function(err, result) {
                        if(err) {
                            res.redirect('/events');
                        }
                        var isDisabled = result[0].isDisabled;
                        var event_id = result[0].e_id;
                        if(isDisabled == 'F') {
                            db.query("SELECT COUNT(*) AS count FROM bet WHERE better_id = ? AND event_id = ?", [better_id, event_id], function(err, result) {
                                if(err) {
                                    res.redirect('/events');
                                }
                                if(result[0].count == 0) {
                                    req.flash('title', '100 Meter Sprint');
                                    res.redirect('/manage-bet');
                                }
                                else {
                                    db.query("SELECT DISTINCT CONCAT(firstname, ' ', lastname) AS fullname, betAmount, betType, bet_id FROM bet JOIN contestants ON bet.contestant_id = contestants.c_id WHERE better_id = ? AND event_id = ?", [better_id, event_id], function(err, results) {
                                        if(err) {
                                            res.redirect('/events');
                                        }
                                        req.flash('title', '100 Meter Sprint');
                                        db.query("SELECT DISTINCT CONCAT(firstname, ' ', lastname) AS fullname, event1, stat1, event2, stat2, event3, stat3 FROM contestants ORDER BY fullname", function(err, results2) {
                                            // console.log(results);
                                            if(err) {
                                                res.redirect('/events');
                                            }
                                            
                                            res.render('manage-bet', {contestants: results2, title: req.flash('title'), betInfo: results, error: req.flash('error')});
                                            
                                        });
                                        
                                    });
                                }
                            });
                        }
                        else {
                            res.redirect('/events')
                        }
                    
                    });
                }
            });
        } 
        else {
            
            res.redirect('/')
        } 

    },

    getAdminMeter: (req, res) => {
        if(req.isAuthenticated()) {
            var better_id = req.session.passport.user.user_id;
            db.query("SELECT betterType FROM better WHERE b_id = ?", better_id, function(err, result) {
                var betterType = result[0].betterType;
                if(betterType == 'admin') {
                    db.query("SELECT e_id FROM sport WHERE eventName = '100 Meter Sprint'", function(err, result) {
                        if(err) throw err;
                        
                        var event_id = result[0].e_id;
                        db.query("SELECT COUNT(*) AS count FROM bet WHERE event_id = ?", event_id, function(err, result) {
                            if(result[0].count == 0) {
                                req.flash('admin-title', '100 Meter Sprint');
                                res.redirect('/admin-manage-bet');
                            }
                            else {
                                db.query("SELECT CONCAT(c.firstname, ' ', c.lastname) AS c_fullname, betAmount, betType, bet_id, CONCAT(u.firstname, ' ', u.lastname) AS u_fullname FROM bet JOIN contestants c ON bet.contestant_id = c.c_id JOIN better u ON bet.better_id = u.b_id WHERE event_id = ?", event_id, function(err, results) {
                                    if(err) throw err;
                                    req.flash('admin-title', '100 Meter Sprint');
                                    res.render('admin-manage-bet', {title: req.flash('admin-title'), betInfo: results});
                                    
                                });
                            }
                        });
                    
                    });
                }
                else {
                    res.redirect('/profile');
                }
            });

        }
    },

    getBPWeight: (req, res) => {
        if (req.isAuthenticated()) {
            var better_id = req.session.passport.user.user_id;

            db.query("SELECT betterType FROM better WHERE b_id = ?", better_id, function(err, result) {
                var betterType = result[0].betterType;
                if(betterType == 'admin') {
                    res.redirect('/admin');
                }
                else {
                    db.query("SELECT e_id, isDisabled FROM sport WHERE eventName = 'Bench Press (Max Weight)'", function(err, result) {
                        if(err) {
                            res.redirect('/events');
                        }
                        
                        var isDisabled = result[0].isDisabled;
                        var event_id = result[0].e_id;
                        if(isDisabled == 'F') {
                            db.query("SELECT COUNT(*) AS count FROM bet WHERE better_id = ? AND event_id = ?", [better_id, event_id], function(err, result) {
                                if(err) {
                                    res.redirect('/events');
                                }
                                if(result[0].count == 0) {
                                    req.flash('title', 'Bench Press (Max Weight)');
                                    res.redirect('/manage-bet');
                                }
                                else {
                                    db.query("SELECT DISTINCT CONCAT(firstname, ' ', lastname) AS fullname, betAmount, betType, bet_id FROM bet JOIN contestants ON bet.contestant_id = contestants.c_id WHERE better_id = ? AND event_id = ?", [better_id, event_id], function(err, results) {
                                        if(err) {
                                            res.redirect('/events');
                                        }
                                        req.flash('title', 'Bench Press (Max Weight)');
                                        db.query("SELECT DISTINCT CONCAT(firstname, ' ', lastname) AS fullname, event1, stat1, event2, stat2, event3, stat3 FROM contestants ORDER BY fullname", function(err, results2) {
                                            // console.log(results);
                                            if(err) {
                                                res.redirect('/events');
                                            }
                                            
                                            res.render('manage-bet', {contestants: results2, title: req.flash('title'), betInfo: results, error: req.flash('error')});
                                            
                                        });
                                        
                                    });
                                }
                            });
                        }
                    
                    });
                }
            });
        } 
        else {
            
            res.redirect('/')
        } 

    },

    getAdminBPWeight: (req, res) => {
        if(req.isAuthenticated()) {
            var better_id = req.session.passport.user.user_id;
            db.query("SELECT betterType FROM better WHERE b_id = ?", better_id, function(err, result) {
                var betterType = result[0].betterType;
                if(betterType == 'admin') {
                    db.query("SELECT e_id FROM sport WHERE eventName = 'Bench Press (Max Weight)'", function(err, result) {
                        if(err) throw err;
                        
                        var event_id = result[0].e_id;
                        db.query("SELECT COUNT(*) AS count FROM bet WHERE event_id = ?", event_id, function(err, result) {
                            if(result[0].count == 0) {
                                req.flash('admin-title', 'Bench Press (Max Weight)');
                                res.redirect('/admin-manage-bet');
                            }
                            else {
                                db.query("SELECT CONCAT(c.firstname, ' ', c.lastname) AS c_fullname, betAmount, betType, bet_id, CONCAT(u.firstname, ' ', u.lastname) AS u_fullname FROM bet JOIN contestants c ON bet.contestant_id = c.c_id JOIN better u ON bet.better_id = u.b_id WHERE event_id = ?", event_id, function(err, results) {
                                    if(err) throw err;
                                    req.flash('admin-title', 'Bench Press (Max Weight)');
                                    res.render('admin-manage-bet', {title: req.flash('admin-title'), betInfo: results});
                                    
                                });
                            }
                        });
                    
                    });
                }
                else {
                    res.redirect('/profile');
                }
            });

        }
    },
    
};

