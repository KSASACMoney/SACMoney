'use strict'

const express = require('express')
const navi_data = require('./navi_data')
let router = express.Router()

const Graph = require('node-dijkstra')
const dijk = new Graph()
const N = navi_data.length
let i = 0
while(i<N){
    let a = {}
    navi_data[i][3].split(";").forEach((p) => {
        let q = p.split(",")
        a[q[0]] = Number(q[1])
    })
    dijk.addNode(navi_data[i][0], a)
    i += 1
}

router.get('/', function(req, res) {
    const fromName = req.query.from
    const toName = req.query.to
    let i = 0
    let from = undefined
    let to = undefined
    if(!fromName) res.send("Empty")
    else{
        while(i < N){
            if(!from && (navi_data[i][0] == fromName || navi_data[i][2].indexOf(fromName)>=0)){
                from = navi_data[i][0]
                console.log(from)
            }
            if(!to && (navi_data[i][0] == toName || navi_data[i][2].indexOf(toName)>=0)){
                to = navi_data[i][0]
                console.log(to)
            }
            i += 1
        }
        if(!from) res.send("Invalid")
        else if(!to){
            res.status(500)
            console.log(`NAVI ERROR: From ${fromName} to ${toName}`)
        }
        else {
            let S = "<label class='center'>"
            console.log(S)
            dijk.path(from, to).forEach((node, i) => {
                if (i > 0) S += "<br/>  →&nbsp;"
                S += node
            })
            S+="</label>"
            res.send(S)
        }
    }
})

module.exports = router