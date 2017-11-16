'use strict'

const express = require('express')
const app = express()
const logger = require('morgan')
const helmet = require('helmet')
const bodyParser = require('body-parser')
const session = require('express-session')

app.use(logger('dev'))
app.use(helmet.hidePoweredBy())
app.use(helmet.xssFilter())
app.use(bodyParser.urlencoded())
app.use(express.static('public'))

app.use(session({ secret: 'heroes of the storm' // TODO change secret key to some random value
    , resave: false, saveUninitialized: false, cookie: { secure: false } }));

app.engine('html', require('ejs').renderFile)
app.set('view engine', 'html')

app.use('/main', require('./routes/main'))
app.use('/login', require('./routes/login'))
app.use('/send', require('./routes/send'))
app.use('/account', require('./routes/account'))
app.use('/auction', require('./routes/auction'))
app.use('/exchange', require('./routes/exchange'))
app.use('/coupon', require('./routes/coupon'))
app.use('/schedule', require('./routes/schedule'))
app.use('/songFes', require('./routes/songFes'))
app.use('/checkin', require('./routes/checkin'))
app.use('/navi', require('./routes/navi'))

app.get('/', (req, res) => {
    res.redirect('/main')
})

// 404 catcher
app.use((req, res, next)=>{
    let err = new Error('Not Found')
    err.status = 404
    next(err)
})

// Error handler
app.use((err, req, res, next)=>{
    console.log(err)
    if(err.status){
        res.status(err.status)
        res.send(err.message)
    }else{
        res.status(500)
        res.send('Server Error')
    }
})

const port = process.env.PORT || 51028
app.listen(port, function(){
    console.log(`Server running on port ${port}`)
})