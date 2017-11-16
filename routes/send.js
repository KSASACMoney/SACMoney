'use strict'

const express = require('express')
let router = express.Router()
const crypto = require('../crypto')
const db = require('../database')
let sem = require('semaphore')(1);

router.post('/', (req, res, next)=>{
    console.log(req.body)
    const post_data = req.body || {}
    if(typeof(post_data)!=='object'){
        res.status(400)
        res.send('Wrong data format')
    }else{
        // Check fields
        const _sender_id = post_data.sender_id || ''
        const _sender_key = post_data.sender_key || ''
        const _receiver_id = post_data.receiver_id || ''
        const _amount = post_data.amount || ''
        if(_sender_id === ''){
            res.status(400)
            res.send('Empty field: sender_id')
        }else if(_sender_key === ''){
            res.status(400)
            res.send('Empty field: sender_key')
        }else if(_receiver_id === ''){
            res.status(400)
            res.send('Empty field: receiver_id')
        }else if(_amount === ''){
            res.status(400)
            res.send('Empty field: amount')
        }else{
            // TODO Decrypt functions
            const sender_id = crypto.decrypt(_sender_id)
            const sender_key = crypto.decrypt(_sender_key)
            const receiver_id = crypto.decrypt(_receiver_id)
            const amount = Number(crypto.decrypt(_amount))
            // To prevent SQL injection
            // Allow only numbers, alphabets, bars
            let flag = false;
            [sender_id, sender_key, receiver_id].forEach((v, i)=>{
                if(v.replace(/[0-9]|[a-z]|[A-Z]|-|_/g, '') !== '' && !flag){
                    res.send('Request contains restricted characters')
                    res.status(403)
                    flag = true
                    next()
                }
            })
            if(!flag) {
                sem.take(db.checkMoney(sender_id, (err, sender_balance) => {
                    if (err) {
                        sem.leave()
                        if (err == db.ERROR_CODE.DB_error) next(new Error())
                        else if (err == db.ERROR_CODE.No_matched_ID)
                            res.send(`No such user: ${sender_id}`)
                    } else {
                        db.checkMoney(receiver_id, (err, receiver_balance) => {
                            if (err) {
                                sem.leave()
                                if (err == db.ERROR_CODE.DB_error) next(new Error())
                                else if (err == db.ERROR_CODE.No_matched_ID)
                                    res.send(`No such user: ${receiver_id}`)
                            } else {
                                db.checkPassword(sender_id, sender_key, (err, loginRes) => {
                                    if (err){
                                        next(new Error()) // Only server error, already checked ID
                                        sem.leave()
                                    }
                                    else {
                                        if (!loginRes){
                                            res.send('Wrong sender key')
                                            sem.leave()
                                        }
                                        else {
                                            if (isNaN(amount) || amount <= 0){
                                                res.send('Invalid amount')
                                                sem.leave()
                                            }else if (sender_balance < amount){
                                                res.send('Sender balance low')
                                                sem.leave()
                                            }else {
                                                sender_balance -= amount
                                                receiver_balance += amount
                                                db.updateMoney(sender_id, sender_balance, (err) => {
                                                    if (err){
                                                        next(new Error())
                                                        sem.leave()
                                                    }else db.updateMoney(receiver_id, receiver_balance, (err) => {
                                                        if (err) {
                                                            next(new Error())
                                                            sem.leave()
                                                        }else {
                                                            res.send('Transaction success')
                                                            sem.leave()
                                                        }
                                                    })
                                                })
                                            }
                                        }
                                    }
                                })
                            }
                        })
                    }

                }))
            }
        }
    }
})

module.exports = router