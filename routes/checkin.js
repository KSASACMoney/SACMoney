'use strict';


const express = require('express');
const db = require('../database');

let router = express.Router();

let S = "Activity1\nActivity2\nActivity3"
let i = 0
let j = 0

router.get('/info', (req, res, next)=>{
    if(req.session && req.session.Stu_ID) {
        db.getCheckIN(req.session.Stu_ID, (err, result)=>{
            if(err){
                res.redirect("main#checkin");
            }else{
                res.send(result);
            }
        })
    }
    else{
        res.send("<script>alert('The session has expired or is invalid.');location.replace('/login')</script>");
    }
    // if(i<30 && j%3==0){
    //     S += "\nRandom Activity"
    //     i += 1
    // }
    // j += 1
});


module.exports = router;