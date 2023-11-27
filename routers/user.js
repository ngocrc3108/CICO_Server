const express = require('express')
const router = express.Router()
const randomstring = require("randomstring")
const Topup = require('../models/topup')

router.get("/topup", async (req, res) => {
    let string = ""
    do {
        string = "CICO" + randomstring.generate({
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

router.get('/logout', async (req, res) => {
    console.log("user/logout")
    req.user.seasionID = ""
    await req.user.save()
    res.redirect('/')
})

module.exports = router