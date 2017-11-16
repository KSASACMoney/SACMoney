'use strict';

const express = require('express');
let router = express.Router();
const db = require('../database');
const sem = require('semaphore')(1);

router.post('/use', (req, res, next)=>{
    let coupon_ID = req.body.Coup_Num;
    let Stu_ID = req.session.Stu_ID;
    db.getCouponMoney(coupon_ID, (err, money) => {
        if(err){
            if(err === 402)
                res.send("<script>alert('No Matched Coupon');location.replace('/main#coupon')</script>");
            else
                res.send("<script>alert('Error Code: ' + err + ', please call SACMoney Team');location.replace('/main#contact')</script>");
        }else{
            db.checkMoney(Stu_ID, (err, UserMoney) => {
                if(err){
                    res.send("<script>alert('Error Code: ' + err + ', please call SACMoney Team');location.replace('/main#contact')</script>");
                }else{
                    db.updateCouponMoney(Stu_ID, UserMoney + money, (err) => {
                        if(err){
                            res.send("<script>alert('Error Code: ' + err + ', please call SACMoney Team');location.replace('/main#contact')</script>");
                        }else{
                            db.deleteCouponID(coupon_ID, (err) => {
                                if(err){
                                    res.send("<script>alert('Error Code: ' + err + ', please call SACMoney Team');location.replace('/main#contact')</script>");
                                }else{
                                    res.send("<script>alert('Success');location.replace('/main#coupon')</script>");
                                }
                            })
                        }
                    })
                }
            })
        }
    })
});

module.exports = router;