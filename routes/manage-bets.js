module.exports = {
    deleteBet: (req,res) => {
        var better_id = req.session.passport.user.user_id;
        
        db.query("SELECT event_id FROM bet WHERE bet_id = ?", req.body.bet_id, function(err, result) {
            if(err) throw err;
            var event_id = result[0].event_id;
            
            db.query("DELETE FROM bet WHERE bet_id = ?", req.body.bet_id, function(err, result) {
                if(err) throw err;
                
                db.query("SELECT COUNT(*) AS count FROM bet WHERE better_id = ? AND event_id = ?", [better_id, event_id], function(err, result) {
                    if(err) throw err;
                    if(result[0].count == 0) {
                        db.query("SELECT eventName FROM sport WHERE e_id = ?", event_id, function(err, result) {
                            if(err) throw err;
                            var eventName = result[0].eventName;
                            req.flash('title', eventName);
                            res.redirect('/manage-bet');
                        });
                        
                    }
                    else {
                        db.query("SELECT DISTINCT CONCAT(firstname, ' ', lastname) AS fullname, betAmount, betType, bet_id FROM bet JOIN contestants ON bet.contestant_id = contestants.c_id WHERE better_id = ? AND event_id = ?", [better_id, event_id], function(err, results) {
                            if(err) throw err;
                            db.query("SELECT eventName FROM sport WHERE e_id = ?", event_id, function(err, result) {
                                if(err) throw err;
                                var eventName = result[0].eventName;
                                req.flash('title', eventName);
                                db.query("SELECT DISTINCT CONCAT(firstname, ' ', lastname) AS fullname, event1, stat1, event2, stat2, event3, stat3 FROM contestants ORDER BY fullname", function(err, results2) {
                                // console.log(results);
                                    if(err) throw err;
                                
                                    res.render('manage-bet', {contestants: results2, title: req.flash('title'), betInfo: results, error: req.flash('error')});
                                
                                });
                            });
                            
                        });
                    }
                });
            
            });
        });
    },

    adminDeleteBet: (req, res) => {
        db.query("SELECT event_id FROM bet WHERE bet_id = ?", req.body.bet_id, function(err, result) {
            if(err) throw err;
            var event_id = result[0].event_id;
            db.query("DELETE FROM bet WHERE bet_id = ?", req.body.bet_id, function(err, result) {
                if(err) throw err;
                db.query("SELECT COUNT(*) AS count FROM bet WHERE event_id = ?", event_id, function(err, result) {
                    if(err) throw err;
                    if(result[0].count == 0) {
                        db.query("SELECT eventName FROM sport WHERE e_id = ?", event_id, function(err, result) {
                            var eventName = result[0].eventName;
                            req.flash('admin-title', eventName);
                            res.redirect('/admin-manage-bet');
                        });
                    }
                    else {
                        db.query("SELECT CONCAT(c.firstname, ' ', c.lastname) AS c_fullname, betAmount, betType, bet_id, CONCAT(u.firstname, ' ', u.lastname) AS u_fullname FROM bet JOIN contestants c ON bet.contestant_id = c.c_id JOIN better u ON bet.better_id = u.b_id WHERE event_id = ?", event_id, function(err, results) {
                            if(err) throw err;
                            db.query("SELECT eventName FROM sport WHERE e_id = ?", event_id, function(err, result) {
                                var eventName = result[0].eventName;
                                req.flash('admin-title', eventName);
                                res.render('admin-manage-bet', {title: req.flash('admin-title'), betInfo: results});
                            });
                            
                            
                        });
                    }
                });
            });
        });
    },

    selectWinner: (req, res) => {
        console.log(req.body);
        var winType;
        if(req.body.winType == 1) {
            winType = 'Win';
        }
        else {
            winType = 'Place';
        }
        var winner = {
            winType: winType,
            event_id: req.body.event,
            contestant_id: req.body.contestant
        }
        db.query("INSERT INTO winners SET ?", winner, function(err, result) {
            if(err) throw err;
            res.redirect('/select-winner');
        });
    },

    deleteWinner: (req, res) =>
    {
        db.query("DELETE FROM winners WHERE w_id = ?", req.body.w_id, function(err, result) {
            if(err) throw err;
            res.redirect('/select-winner')

        });

    },

    addBet: (req,res) => {
        req.checkBody('betamount', 'Amount to bet must be an integer').isNumeric();
        const errors = req.validationErrors();
        if(errors) {
            req.flash('error', 'Amount to bet must be an integer');
            req.flash('title', req.body.eventName);
            res.redirect('/manage-bet');
        } else if(req.body.betamount < 25) {
            req.flash('error', 'You must bet at least $25');
            req.flash('title', req.body.eventName);
            res.redirect('/manage-bet');
        } else {
            db.query("SELECT c_id FROM contestants WHERE firstname = ? AND lastname = ?", [req.body.firstname, req.body.lastname], function(err, res1) {
                if(err) throw err;
                if(res1.length == 0) {
                    req.flash('error', 'The contestant you entered does not exist');
                    req.flash('title', req.body.eventName);
                    res.redirect('/manage-bet');
                } else {
                    var contestant_id = res1[0].c_id;
                    var better_id = req.session.passport.user.user_id;
                    db.query("SELECT e_id, isDisabled FROM sport WHERE eventName = ?", req.body.eventName, function(err, res2) {
                        console.log(res2);
                        var isDisabled = res2[0].isDisabled;
                        if(isDisabled == 'F') {
                            if(err) throw err;
                            var event_id = res2[0].e_id;
                            var betAmount = req.body.betamount;
                            var betType;
                            if(req.body.betType == 1) {
                                betType = "Win";
                            } else {
                                betType = "Place";
                            }
                            var bet = {
                                betAmount: betAmount,
                                event_id: event_id,
                                contestant_id: contestant_id,
                                better_id: better_id,
                                betType: betType
                            }
                            db.query("INSERT INTO bet SET ?", bet, function(err, res3) {
                                if(err) throw err;
                                db.query("SELECT DISTINCT CONCAT(firstname, ' ', lastname) AS fullname, betAmount, betType, bet_id FROM bet JOIN contestants ON bet.contestant_id = contestants.c_id WHERE better_id = ? AND event_id = ?", [better_id, event_id], function(err, res4) {
                                    if(err) throw err;
                                    req.flash('title', req.body.eventName);
                                    db.query("SELECT DISTINCT CONCAT(firstname, ' ', lastname) AS fullname, event1, stat1, event2, stat2, event3, stat3 FROM contestants ORDER BY fullname", function(err, res5) {
                                        // console.log(results);
                                        if(err) throw err;
                                        res.render('manage-bet', {contestants: res5, title: req.flash('title'), betInfo: res4, error: req.flash('error')});   
                                    });
                                    
                                });
                                
                                
                            }); 
                        }
                        else {
                            req.flash('error', 'The event you are trying to bet on has been disabled');
                            req.flash('title', req.body.eventName);
                            res.redirect('/manage-bet');
                        }
                        
                    });// end of select EID
                } //end of else
            });
        }


    },

    disableEvent: (req, res) => {
        console.log(req.body);
        db.query("DELETE FROM bet WHERE event_id = ?", req.body.e_id, function(err, result) {
            if(err) throw err;
            db.query("UPDATE sport SET isDisabled = 'T' WHERE e_id = ?", req.body.e_id, function(err, result) {
                if(err) throw err;
                res.redirect('/admin');
            });
            
        });
    }

};