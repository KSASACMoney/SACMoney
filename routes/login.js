'use strict'

const express = require('express')
let router = express.Router()

router.get('/', (req, res) => {
    const session = req.session
    if(session && session.Stu_ID) { // already logged in
        res.redirect('/main')
    }else{ // need to login
        res.render('login')
    }
})

module.exports = router