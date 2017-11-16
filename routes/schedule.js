'use strict';


const express = require('express');
const db = require('../database');

let router = express.Router();
let event_data = ""

function syncEvent () {
    db.getSchedule(new Date().getDate()-9, (err, result)=>{
        if(err){
            setTimeout(syncEvent, 10000)
        }else{
            console.log(result);
            event_data = result
        }
    })
}
syncEvent()
setInterval(syncEvent, 60000);

router.get('/event', (req, res, next)=>{
    res.send(event_data)
});

let booth_data = ""

function syncBooth () {
    db.getBooth((err, result)=>{
        if(err){
            setTimeout(syncBooth, 10000)
        }else{
            console.log(result);
            booth_data = result
        }
    })
}
syncBooth()
setInterval(syncBooth, 60000);

router.get('/booth', (req, res, next)=>{
    res.send(booth_data)
});

module.exports = router;