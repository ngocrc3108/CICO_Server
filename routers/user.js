const express = require('express')
const userRoute = express.Router()
const randomstring = require("randomstring")
const Topup = require('../models/topup')

userRoute.get("/data", (req, res) => {
    const {user} = req
    const {username, balance, history} = user
    res.json({username, balance, history})
})

userRoute.get("/topup", async (req, res) => {
    let string = ""
    do {
        string = "QLVR" + randomstring.generate({
            length : 6,
            capitalization : 'uppercase'
        })
    } while(await Topup.findOne({key : string}) !== null)

    Topup.create({
        key : string,
        userId : req.user._id,
        isOk : false
    })
    res.send({message : `Ngân hàng: BIDV\nSTK: 3149193588\nTên: Nguyen Tien Ngoc\nNội dung: ${string}`})
    console.log(`user/topup: key = ${string}`)
})

userRoute.get('/logout', async (req, res) => {
    console.log("user/logout")
    req.user.seasionID = ""
    await req.user.save()
    res.redirect('/')
})

//for testing only
// userRoute.get('/visit', (req, res) => {
//     const time = new Date();
//     req.user.history.unshift({time, location : "Gate 1", fee : 3000})
//     req.user.balance -= 3000
//     res.send("visited")
//     console.log("visited")
//     req.user.save()
// })

module.exports = userRoute