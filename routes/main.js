'use strict'

const express = require('express')
let router = express.Router()

router.get('/', (req, res) => {
    const session = req.session
    if(session && session.Stu_ID) { // logged in
        res.render('main')
    }else{ // not logged in
        res.redirect('/login')
    }
})

module.exports = router