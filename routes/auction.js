'use strict';

const express = require('express');
let router = express.Router();
const db = require('../database');
const sem = require('semaphore')(1);
const crypto = require('../crypto')

let auction_current_count = 1;
let auction_active = false;
const ADMIN_STR = "AUCTION_ADMIN"

var info="";

function syncAuc(){
    db.getAuctionProduct(auction_current_count, (err, arr) => {
        if (err) {
            next(err)
        } else {
            db.getAuction((err, auctionData) => {
                if(err){
                    next(err)
                }else{
                    let name
                    if(!auctionData[0]) name = ""
                    else name = `(${auctionData[0]})`
                    info = `/images/${arr[1]}\n${arr[0]}\n${auctionData[1]}\n${name}\n${auction_active}`
                }
            })
        }
    });
}

syncAuc();
setInterval(syncAuc,1000);

router.get('/info', (req, res, next) => {
    res.send(info);
});

router.post('/bid', (req, res, next) => {
    if(req.session && req.session.Stu_ID) {
        const decrypted = crypto.RSA_decrypt(req.body.tempBid.split(","))
        if(decrypted[0] && !isNaN(Number(decrypted[1]))) {
            const money = Number(decrypted[1])
            if (req.session && req.session.Stu_ID) sem.take(function () {
                if (auction_active) {
                    db.getPosition(req.session.Stu_ID, (err, position) => {
                        if (err) next(err);
                        else {
                            if (position === 'AUCTION') {
                                db.checkMoney(req.session.Stu_ID, (err, balance) => {
                                    if (err) next(err);
                                    else {
                                        if (balance >= money) db.getAuction((err, auctionData) => {
                                            console.log(auctionData);
                                            if (auctionData[1] < money) {
                                                db.setAuction(auctionData[0], req.session.Stu_ID, money, (err) => {
                                                    if (err) next(err);
                                                    else {
                                                        //res.status(200).end()
                                                        res.redirect('/main#auction');
                                                    }
                                                    sem.leave()
                                                })
                                            } else {
                                                res.send("<script>alert('You have to bid more than " + auctionData[1] + " SAC!');location.replace('/main#auction')</script>");
                                                sem.leave()
                                            }
                                        });
                                        else {
                                            res.send("<script>alert('You cannot bid more than you have!');location.replace('/main#auction')</script>");
                                            sem.leave()
                                        }
                                    }
                                })
                            } else {
                                res.send("<script>alert('You have to be in the auction house!');location.replace('/main#auction')</script>");
                                sem.leave();
                            }
                        }
                    })
                } else {
                    res.redirect('/main#auction');
                    sem.leave()
                }
            });
        }
        else{
            res.send("<script>alert('Security error occurred. Please try again..');location.replace('/login')</script>");
        }
    }
    else{
        res.send("<script>alert('The session has expired or is invalid.');location.replace('/login')</script>");
    }
});

router.post('/end', (req, res, next)=>{
    if(req.session && req.session.Stu_ID) db.getAuthority(req.session.Stu_ID, (err, auth) => {
        if(err) next(err);
        if(auth.includes(ADMIN_STR) || auth.includes("ADMIN")){
            sem.take(()=>{
                auction_active = false;
                db.getAuction((err, data) => {
                    if(err) {
                        next(err);
                        sem.leave()
                    }
                    else{
                        console.log(`[Processing transaction] Id: ${data[0]}, Amount: ${data[1]}`);
                        db.checkMoney(data[0], (err, balance) => {
                            db.updateMoney(data[0], balance - data[1], (err) => {
                                if(err){
                                    next(err);
                                    sem.leave()
                                }
                                else db.resetAuction((err) => {
                                    if(err){
                                        console.log(err)
                                    }else{
                                        let s = "[Transaction success] Yield the auction item to Id:" + data[0];
                                        res.send("<script>alert('" + s + "');location.replace('/auction/admin')</script>");
                                    }
                                    sem.leave()
                                })
                            })
                        })
                    }
                })
            })
        }
        else res.redirect('/main')
    });
    else{          
        res.send("<script>alert('The session has expired or is invalid.');location.replace('/login')</script>");     
    }
});

router.post('/next', (req, res, next) => {
    if(req.session && req.session.Stu_ID) db.getAuthority(req.session.Stu_ID, (err, auth) => {
        if(err) next(err);
        if(auth.includes(ADMIN_STR) || auth.includes("ADMIN")){
            sem.take(()=>{
                auction_active = false;
                auction_current_count += 1;
                res.send("<script>alert('Moved to next item!');location.replace('/auction/admin')</script>")
                sem.leave()
            })
        }
        else res.redirect('/main')
    });
    else{
        res.send("<script>alert('The session has expired or is invalid.');location.replace('/login')</script>");
    }
});

router.post('/start', (req, res, next) => {
    if(req.session && req.session.Stu_ID) db.getAuthority(req.session.Stu_ID, (err, auth) => {
        if(err) next(err);
        if(auth.includes(ADMIN_STR) || auth.includes("ADMIN")){
            sem.take(()=>{
                auction_active = true;
                sem.leave()
                res.redirect('/auction/admin')
            })
        }
        else res.redirect('/main')
    });
    else{
         res.send("<script>alert('The session has expired or is invalid.');location.replace('/login')</script>");
    }
});

router.post('/back', (req, res, next) => {
    if(req.session && req.session.Stu_ID) db.getAuthority(req.session.Stu_ID, (err, auth) => {
        if(err) next(err);
        if(auth.includes(ADMIN_STR) || auth.includes("ADMIN")){
            sem.take(()=>{
                auction_active = false;
                auction_current_count -= 1;
                res.send("<script>alert('Moved to previous item!');location.replace('/auction/admin')</script>")
                sem.leave()
            })
        }
        else res.redirect('/main')
    });
    else{
         res.send("<script>alert('The session has expired or is invalid.');location.replace('/login')</script>");
    }
});

router.get('/admin', (req, res, next) => {
    if(req.session && req.session.Stu_ID) db.getAuthority(req.session.Stu_ID, (err, auth) => {
        if(err) next(err);
        if(auth.includes(ADMIN_STR) || auth.includes("ADMIN")){
            res.render('event_admin', {
                event_full: "Auction",
                event: "auction",
                part: "item",
                current: auction_current_count,
                result: ""
            })
        }
        else res.redirect('/main')
    });
    else{
         res.send("<script>alert('The session has expired or is invalid.');location.replace('/login')</script>");
    }
})

module.exports = router;