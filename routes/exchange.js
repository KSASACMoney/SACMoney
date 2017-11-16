'use strict'

const express = require('express')
let router = express.Router()
const db = require('../database')
const sem = require('semaphore')(1)
const crypto = require('../crypto')
const fs = require('fs')

router.post('/cardID', (req, res, next) =>{
    if(!req.body.cardID || !req.body.cardPW){
        res.send('Missing data');
        return;
    }
    const cardID = req.body.cardID;
    const received = crypto.RSA_decrypt(req.body.cardPW);
    if(!received[0]) res.send(`Error: ${received[1]}`);
    else{
        const pass = received[1]
        console.log(`ID: ${cardID}, Pass: ${pass}`)
        db.checkPassword(cardID, pass, (err) => {
            if (err){
                res.send('NO');
            }else{
                db.getUserName(cardID, (err, name) => {
                    if(err){
                        res.send("NO");
                    }else{
                        db.getAuthority(cardID, (err, authority) => {
                            if(err){
                                res.send("NO");
                            }else{
                                console.log(name + ";" + authority);
                                res.send(name + ";" + authority);
                            }
                        })
                    }
                })
            }
        })
    }
});

router.post('/money', (req, res, next) =>{
    if(!req.body.booth || !req.body.data1 || !req.body.data1_s || !req.body.data2 || !req.body.data2_s){
        console.log('Missing data');
        res.send("NO");
        return;
    }
    let received1 = crypto.decrypt(req.body.data1, req.body.data1_s);
    let received2 = crypto.decrypt(req.body.data2, req.body.data2_s);
    if(!received1[0]){
        console.log(`Error: ${received1[1]}`);
        res.send("NO");
    }else if(!received2[0]){
        console.log(`Error: ${received2[1]}`);
        res.send("NO");
    }else {
        received1 = received1[1]
        received2 = received2[1]
        if(isNaN(Number(received2))){
            console.log('Amount must be a number')
            res.send("NO")
        }else{
            const booth = req.body.booth;
            const card = received1;
            const amount = received2 * 1; // - 는 부스 한테 주는 것
            console.log(booth, card, amount);
            db.getUserName(card, (err, cardName) => {
                db.getBoothMoney(booth, (err, money) => {
                    if(err){
                        res.send('NO');
                    }else{
                        db.updateBoothMoney(booth, (money-amount), (err) =>{
                            if(err){
                                res.send('NO');
                            }else{
                                db.checkMoney(card, (err, money2) => {
                                    if(err){
                                        res.send('NO Card Matched');
                                    }else{
                                        db.updateCardMoney(card, (money2+amount), (err) => {
                                            if(err){
                                                res.send('NO');
                                            }else{
                                                let s = "→"
                                                if(amount>=0){
                                                    s = `${booth}${s}${cardName}`
                                                    log2file("Booth", booth, card, cardName, amount)
                                                }else{
                                                    s = `${cardName}${s}${booth}`
                                                    log2file(card, cardName, "Booth", booth, -amount)
                                                }
                                                res.send(`SUCCESS\n${s}`);
                                            }
                                        })
                                    }
                                })
                            }
                        })
                    }
                })
            })
        }
    }
});

router.post('/money2', (req, res, next) =>{
    if(!req.body.card1 || !req.body.data1 || !req.body.data1_s || !req.body.data2 || !req.body.data2_s){
        console.log('Missing data');
        res.send("NO");
        return;
    }
    let received1 = crypto.decrypt(req.body.data1, req.body.data1_s);
    let received2 = crypto.decrypt(req.body.data2, req.body.data2_s);
    if(!received1[0]) res.send(`Error: ${received1[1]}`);
    else if(!received2[0]) res.send(`Error: ${received2[1]}`)
    else{
        received1 = received1[1]
        received2 = received2[1]
        if(isNaN(Number(received2))){
            res.send('Amount must be a number');
            return;
        }
        const card1 = req.body.card1
        const card2 = received1
        const amount = received2 * 1; // - 는 부스 한테 주는 것
        if(amount < 0){
            res.send("NO")
            return
        }
        console.log(card1, card2, amount);
        db.getUserName(card1, (err, name1) => {
            if(err){
                res.send("NO")
            }else{
                db.getUserName(card2, (err, name2) => {
                    if(err){
                        res.send("NO")
                    }else{
                        db.checkMoney(card1, (err, money) => {
                            if(err){
                                res.send('NO');
                                console.log(err)
                            }else if(money<amount){
                                res.send("NO")
                                console.log(err)
                            }else db.updateCardMoney(card1, (money-amount), (err) =>{
                                    if(err){
                                        res.send('NO');
                                        console.log(err)
                                    }else{
                                        db.checkMoney(card2, (err, money2) => {
                                            if(err){
                                                res.send('NO Card Matched');
                                                console.log(err)
                                            }else{
                                                db.updateCardMoney(card2, (money2+amount), (err) => {
                                                    if(err){
                                                        res.send('NO');
                                                        console.log(err)
                                                    }else{
                                                        let s = "→"
                                                        if(amount>=0){
                                                            s = `${name1}${s}${name2}`
                                                            log2file(card1 ,name1, card2, name2, amount)
                                                        }else{
                                                            s = `${name2}${s}${name1}`
                                                            log2file(card2, name2, card1, name1, -amount)
                                                        }
                                                        res.send(`SUCCESS\n${s}`);
                                                    }
                                                })
                                            }
                                        })
                                    }
                                })
                            })
                        }
                    })
                }
            })
        }
});

router.post('/changecard', (req, res, next)=>{
    if(!req.body.id || !req.body.pw || !req.body.card){
        res.send('Missing data');
        return;
    }
    const id = req.body.id;
    const received = crypto.RSA_decrypt(req.body.pw);
    const card = req.body.card;
    if(!received[0]) res.send(`Error: ${received[1]}`);
    else{
        const pw = received[1]
        console.log(id, pw, card);
        db.checkPassword(id, pw, (err)=>{
            if(err){
                res.send("NO");
                console.log(err);
            }else{
                db.getUserName(id, (err2, name)=>{
                    db.newCard(id, card, (err3)=>{
                        if(err3){
                            res.send("NO");
                            console.log("Err3: " + err3);
                        }else{
                            res.send(name);
                        }
                    })
                })
            }
        })
    }
});

router.post('/checkadmin', (req, res, next)=>{
    if(!req.body.cardID || !req.body.cardPW){
        res.send('Missing data');
        return;
    }
    const cardID = req.body.cardID;
    const received = crypto.RSA_decrypt(req.body.cardPW);
    if(!received[0]) res.send(`Error: ${received[1]}`);
    else{
        const pass = received[1]
        db.checkPassword(cardID, pass, (err) => {
            if (err){
                res.send('NO');
            }else{
                db.getAuthority(cardID, (err, authority) =>{
                    if(err){
                        res.send("NO");
                    }else{
                        console.log(authority);
                        res.send(authority);
                    }
                })
            }
        })
    }
});

router.post('/checkin', (req, res, next)=>{
    let booth = req.body.booth;
    let card = req.body.card;
    console.log(booth, card);
    db.checkIN(booth, card, (err) =>{
        if(err){
            console.log(err);
            res.send("NO");
        }else{
            if(booth === "SongFes"){
                db.updatePosition(card, "SONGFES", (err)=>{
                    if(err){
                        console.log(err);
                        res.send("NO");
                    }else{
                        res.send("YES");
                    }
                })
            }else if(booth === "Party"){
                db.updatePosition(card, "AUCTION", (err)=>{
                    if(err){
                        console.log(err);
                        res.send("NO");
                    }else{
                        res.send("YES");
                    }
                })
            }else{
                res.send("YES");
            }
        }
    })
});

router.get('/balance', (req, res)=>{
    let card = req.body.card
    db.getUserName(card, (err, name) => {
        if (err) {
            res.send("NO")
            console.log(err)
        } else db.checkMoney(card, (err, balance) => {
            if (err) {
                res.send("NO")
                console.log(err)
            } else {
                res.send(`${name};${balance}`)
            }
        })
    })
})

let LOGFILE = fs.createWriteStream('exchange.log', {flags: "a"})
LOGFILE.on('error', (err)=>{
    console.log(err)
    LOGFILE = fs.createWriteStream('exchange.log', {flags: "a"})
})
// 거래를 로그 파일에 기록
// 출력 형식: 타임스탬프 보내는카드:보내는이름 받는카드:받는이름 금액
function log2file(fromCard, fromName, toCard, toName, money){
    LOGFILE.write(`${new Date().toString().replace('(대한민국 표준시)', '').replace('GMT+0900', '')} ${fromCard}:${fromName} ${toCard}:${toName} ${money}\r\n`)
}

module.exports = router;