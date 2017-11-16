'use strict';

const express = require('express');
let router = express.Router();
const db = require('../database');
const sem = require('semaphore')(1);
const crypto = require('../crypto')

// current_round 0: betting session
// current_round +: voting session
let current_round = 0;
// applied to both betting and voting
let songfes_active = false;
const ADMIN_STR = "SONGFES_ADMIN"


router.get('/info', (req, res, next) => {
    if(req.session && req.session.Stu_ID) {
        let able = "disable"
        if(songfes_active) able = "able"
        var total_round=4;
        db.songTeams(current_round % (total_round + 1), (err, teams) => {
            if(current_round==0) db.songBettingCheck(req.session.Stu_ID, (can_bet) => {
                if(!can_bet) able = "already"
                res.send(`Bet\nBetting\n${able}${teams}`)
            })
            else if(current_round==1+total_round) db.songVotingCheck(req.session.Stu_ID,current_round,(err, can_vote)=>{
                if(!can_vote) able = "already"
                console.log(teams)
                res.send(`Vote\nTotal Vote\n${able}${teams}`)
            })
            else db.songVotingCheck(req.session.Stu_ID, current_round, (err, can_vote) => {
                if(!can_vote) able = "already"
                res.send(`Vote\nRound ${current_round}\n${able}${teams}`)
            })
        })
    }
    else res.redirect('/login')
});

router.post('/Bet', (req, res, next) => {
    if(req.session && req.session.Stu_ID) {
        // T#;money
        console.log(req.body.tempBet)
        const decrypted = crypto.RSA_decrypt(req.body.tempBet.split(","))
        if(decrypted[0]) {
            const i = decrypted[1].indexOf(';')
            if(i==2) {
                const winner = decrypted[1].substring(0, i)
                const money = decrypted[1].substring(i + 1)
                if(winner[0]!="T" || isNaN(Number(winner[1]))){
                    res.send("<script>alert('You must select a team to bet on.');location.replace('/main#SFest')</script>");
                }else if (!(isNaN(Number(money)))) {
                    if (!winner) res.send("<script>alert('투표할 팀을 골라주세요!');location.replace('/main#auction')</script>")
                    else if (!money || isNaN(money * 1)) res.send("<script>alert('올바른 베팅 금액을 입력해주세요!');location.replace('/main#auction')</script>")
                    db.getPosition(req.session.Stu_ID, (err, position) => {
                        if (err) {
                            next(err);
                        }
                        else if (position === 'SONGFES') sem.take(function () {
                            db.checkMoney(req.session.Stu_ID, (err, balance) => {
                                if (err) {
                                    next(err);
                                    sem.leave()
                                }
                                else if (balance >= money) db.songBettingCheck(req.session.Stu_ID, (can_bet) => {
                                    if (can_bet) {
                                        db.songBetting(req.session.Stu_ID, winner, money, (err) => {
                                            if (err) next(err);
                                            else db.updateMoney(req.session.Stu_ID, balance - money, (err) => {
                                                if (err) next(err)
                                                res.redirect('/main#SFest');
                                                sem.leave()
                                            })
                                        })
                                    } else {
                                        res.redirect('/main#SFest');
                                        sem.leave()
                                    }
                                })
                                else {
                                    res.redirect('/main#SFest');
                                    sem.leave()
                                }
                            })
                        })
                        else {
                            res.send("<script>alert('가요제에 있지 않은 사람은 참여가 불가능합니다!');location.replace('/main#SFest')</script>");
                        }
                    })
                }else{
                    res.send("<script>alert('Bet amount must be a number!');location.replace('/main#SFest')</script>");
                }
            }else{
                res.send("<script>alert('Incorrect format. Please try again..');location.replace('/main#SFest')</script>");
            }
        }
        else{
            res.send("<script>alert('Security error occurred. Please try again..');location.replace('/main#SFest')</script>");
        }
    }
    else res.redirect('/login')
});

router.post('/Vote', (req, res, next) => {
    if(req.session && req.session.Stu_ID) {
        // TODO match with client
        console.log(req.body.tempBet)
        const decrypted = crypto.RSA_decrypt(req.body.tempBet.split(","))
        console.log(decrypted)
        if(!decrypted[0]) {
            res.send("<script>alert('Security error occurred. Please try again.');location.replace('/main#SFest')</script>");
        }else if(decrypted[1][0]!="T" || isNaN(Number(decrypted[1][1]))){
            res.send("<script>alert('You must select a team to bet on.');location.replace('/main#SFest')</script>");
        }else db.getPosition(req.session.Stu_ID, (err, position) => {
            if (err) {
                next(err);
            }
            else if (position === 'SONGFES') sem.take(function () {
                const winner = decrypted[1].substring(0, 2)
                console.log("TOOK SEMAPHORE")
                if (songfes_active && current_round > 0) db.songVotingCheck(req.session.Stu_ID, current_round, (err, can_vote) => {
                    console.log("VOTING CHECK")
                    console.log(can_vote)
                    if (can_vote) {
                        db.songVoting(req.session.Stu_ID, `R${current_round}${winner}`, (err) => {
                            console.log("VOTE")
                            if (err) next(err);
                            else {
                                res.redirect('/main#SFest');
                                sem.leave()
                            }
                        })
                    } else {
                        res.redirect('/main#SFest');
                        sem.leave()
                    }
                });
                else{
                    res.redirect('/main#SFest')
                    sem.leave()
                }
            });
            else {
                res.send('가요제에 있지 않은 사람은 참여가 불가능합니다!');
            }
        })
    }
    else res.redirect('/login')
})

router.post('/end', (req, res, next)=>{
    if(req.session && req.session.Stu_ID) db.getAuthority(req.session.Stu_ID, (err, auth) => {
        if(err) next(err);
        if(auth.includes(ADMIN_STR) || auth.includes("ADMIN")){
            sem.take(()=>{
                songfes_active = false;
                res.redirect('./admin');
                sem.leave()
            })
        }
        else res.redirect('/main')
    });
    else res.redirect('/login')
});

router.post('/next', (req, res, next) => {
    if(req.session && req.session.Stu_ID) db.getAuthority(req.session.Stu_ID, (err, auth) => {
        if(err) next(err);
        if(auth.includes(ADMIN_STR) || auth.includes("ADMIN")){
            sem.take(()=>{
                current_round += 1;
                songfes_active = false
                res.redirect('./admin');
                sem.leave()
            })
        }
        else res.redirect('/main')
    });
    else res.redirect('/login')
});

router.post('/start', (req, res, next) => {
    if(req.session && req.session.Stu_ID) db.getAuthority(req.session.Stu_ID, (err, auth) => {
        if(err) next(err);
        if(auth.includes(ADMIN_STR) || auth.includes("ADMIN")){
            sem.take(()=>{
                songfes_active = true;
                res.redirect('./admin');
                sem.leave()
            })
        }
        else res.redirect('/main')
    });
    else res.redirect('/login')
});

router.post('/back', (req, res, next) => {
    if(req.session && req.session.Stu_ID) db.getAuthority(req.session.Stu_ID, (err, auth) => {
        if(err) next(err);
        if(auth.includes(ADMIN_STR) || auth.includes("ADMIN")){
            sem.take(()=>{
                current_round -= 1;
                songfes_active = false
                res.redirect('./admin');
                sem.leave()
            })
        }
        else res.redirect('/main')
    });
    else res.redirect('/login')
});

router.get('/admin', (req, res, next) => {
    if(req.session && req.session.Stu_ID) db.getAuthority(req.session.Stu_ID, (err, auth) => {
        if(err) next(err);
        let this_part = "vote"
        if(current_round == 0) this_part = "betting"
        if(auth.includes(ADMIN_STR) || auth.includes("ADMIN")){
            db.calculVote((A, B, finalVote)=>{
                let s = "Round1-A:" + A[0] + " B:" + B[0] + "<br>Round2-A:" + A[1] + " B:" + B[1] + "<br>Round3-A:" + A[2] + " B:" + B[2] + "<br>Round4-A:" + A[3] + " B:" + B[3] + "<br>FinalVote: ";
                for (let i=0; i<8; i++){
                    s += (i+1) + " : " + finalVote[i] + " ";
                }
                res.render('event_admin', {
                    event_full: "Song Festival",
                    event: "songFes",
                    part: this_part,
                    current: current_round,
                    result: s
                })
            })
        }
        else res.redirect('/main')
    });
    else res.redirect('/login')
})

module.exports = router;