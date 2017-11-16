'use strict'

const express = require('express')
let router = express.Router()
const crypto = require('../crypto')
const db = require('../database')

router.post('/login', (req, res) => {
    const body = req.body
    const id = body.Stu_ID
    console.log(body)
    try {
        const pass_decrypt = crypto.RSA_decrypt(body.Stu_Pass.split(','))
        if (!pass_decrypt[0]) {
            res.send("<script>alert('Login Failed: " + pass_decrypt[1] + "');location.replace('/login#login')</script>");
        } else {
            const pass = pass_decrypt[1]
            console.log(pass)
            db.checkPassword(id, pass, (err, loginRes) => {
                if (err) {
                    res.redirect('/login')
                } else if (loginRes) { // Login success!
                    const session = req.session
                    session.Stu_ID = id
                    session.Stu_Pass = pass
                    res.redirect('/main')
                } else { // Login failed...
                    res.send("<script>alert('Login Failed. Please retry.');location.replace('/login#login')</script>");
                }
            })
        }
    }catch(err){
        console.log(err)
        res.redirect('/login')
    }
})

router.post('/logout', (req, res, next) => {
    req.session.destroy((err) =>{
        if(err) next(err)
        else res.redirect('/login')
    })
})

router.get('/balance', (req, res, next)=>{
    if(req.session && req.session.Stu_ID) db.checkMoney(req.session.Stu_ID, (err, balance) => {
        if (err) {
            next(err)
        } else {
            res.send(`${balance}`)
        }
    })
    else res.redirect('/login')
})

router.get('/time', (req, res) => {
    res.send(String(new Date().getTime()));
})

router.get('/name', (req, res, next) => {
    if(req.session && req.session.Stu_ID) db.getUserName(req.session.Stu_ID, (err, name) => {
        if (err) {
            next(err)
        } else {
            res.send(`${name}`)
        }
    })
    else res.redirect('/login')
})

router.get('/status', (req, res, next) => {
    if(req.session && req.session.Stu_ID) db.getAccountStatus(req.session.Stu_ID, (err, stat) => {
        if (err) {
            next(err)
        } else {
            res.send(`${stat}`)
        }
    })
    else res.redirect('/login')
})

router.get('/info', (req, res, next) => {
    if(req.session && req.session.Stu_ID) {
        db.getUserName(req.session.Stu_ID, (err, userName) => {
            if (err) {
                next(err)
            } else {
                db.checkMoney(req.session.Stu_ID, (err, money) => {
                    if (err) {
                        next(err)
                    } else {
                        res.send(`${req.session.Stu_ID}\n${userName}\n${money}`)
                    }
                })
            }
        })
    } else res.redirect('/login')
})

router.post('/suspend', (req, res)=>{
    db.deleteCard(req.session.Stu_ID, (err)=>{
        if(err){
            res.send("<script>alert('Error Code: ' + err + ', please call SACMoney Team');location.replace('/main#contact')</script>");
        }else{
            res.send("<script>alert('Delete Success');location.replace('/main#help')</script>");
        }
    })
});

router.post('/pass_change', (req, res, next)=>{
    if(!req.body.Old_Pass || !req.body.New_Pass)  res.send("<script>alert('You must fill both old and new password!');location.replace('/main#account')</script>");
    else {
        const oldpass = crypto.RSA_decrypt(req.body.Old_Pass.split(","))
        const newpass = crypto.RSA_decrypt(req.body.New_Pass.split(","))
        console.log(oldpass)
        console.log(newpass)
        if (!oldpass[0] || !newpass[0]) {
            res.send("<script>alert('Security error has occurred. Please try later.');location.replace('/main#account')</script>");
        } else db.updatePassword(req.session.Stu_ID, oldpass[1], newpass[1], (err) => {
            if (err) {
                if (err === 402)
                    res.send("<script>alert('Old Password Is Wrong!');location.replace('/main#account')</script>");
                else {
                    res.send("<script>alert('Error Code: ' + err + ', please call SACMoney Team');location.replace('/main#contact')</script>");
                }
            } else {
                res.send("<script>alert('Successfully Changed');location.replace('/main#account')</script>");
            }
        })
    }
});

router.post('/pin_change', (req, res, next)=>{
    console.log(req.body.Old_Pin, req.body.New_Pin);
    if(!req.body.Old_Pin || !req.body.New_Pin) res.send("<script>alert('You must fill both old and new PIN!');location.replace('/main#account')</script>");
    else {
        const oldpin = crypto.RSA_decrypt(req.body.Old_Pin.split(","))
        const newpin = crypto.RSA_decrypt(req.body.New_Pin.split(","))
        if (!oldpin[0] || !newpin[0]) {
            res.send("<script>alert('Security error has occurred. Please try later.');location.replace('/main#account')</script>");
        } else db.updatePIN(req.session.Stu_ID, oldpin[1], newpin[1], (err) => {
            if (err) {
                if (err === 402)
                    res.send("<script>alert('Old PIN Is Wrong!');location.replace('/main#account')</script>");
                else {
                    res.send("<script>alert('Error Code: ' + err + ', please call SACMoney Team');location.replace('/main#contact')</script>");
                }
            } else {
                res.send("<script>alert('Successfully Changed');location.replace('/main#account')</script>");
            }
        })
    }
});


module.exports = router;