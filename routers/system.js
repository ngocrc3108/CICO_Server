const {Router} = require('express')
const Users = require('../models/users')
const Topup = require('../models/topup')
require('dotenv').config()
const systemRoute = Router()

systemRoute.use('/', (req, res, next) => {
    const {secretKey} = req.query
    if(secretKey == process.env.SECRET_KEY)
        next()
    else {
        console.log("system: key is wrong")
        res.send("system key is wrong")
    }
})

systemRoute.get("/topup", async (req, res) => {
    let {key, amount} = req.query
    const topup = await Topup.findOne({key}) 
    if(topup == null) {
        res.send("Topup is not found")
        console.log("system/topup: Topup is not found")
        return
    }

    if(topup.isOk) {
        res.send("This key has already been used")
        console.log(`system/topup: ${key} has already been used`)
        return
    }

    amount = amount.replace(/,/g, '') // remove all comma
    const user = await Users.findById(topup.userId)
    if(user == null) {
        res.send("User is not found")
        console.log("system/topup: User is not found")
        return
    }

    user.balance += Number(amount)
    user.save()
    res.send("success")
    console.log("system/topup: success")
    topup.isOk = true
    topup.save()
})

systemRoute.get("/ESP32/read", async (req, res) => {
    const {RFID} = req.query;
    const user = await Users.findById(RFID)

    if(user == null) {
        res.send("RFID is not found")
        console.log(`system/ESP32/read: RFID is not found`)
        return
    }

    const data = {
        time : new Date(),
        location : "Gate 1",
        fee : 3000}

    if(user.balance < data.fee) {
        res.send("cmd=deny&reason=Insufficient funds")
        console.log("system/ESP32/read: Insufficient funds")
        return
    }

    res.send(`cmd=open&name=${user.fullName}&fee=${data.fee}`)
    console.log(`system/ESP32/read: cmd=open&name=${user.fullName}&fee=${data.fee}`)

    user.history.unshift(data)
    user.balance -= data.fee
    user.save()    
})

module.exports = systemRoute