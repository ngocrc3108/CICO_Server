const express = require('express')
const app = express()
const fetch = (...args) =>
import("node-fetch").then(({ default: fetch }) => fetch(...args))

// constaints
const PORT = 3000 | process.env.PORT
const SECRET_KEY = "R1IC7I58XKKXPPAJXAGMGDJ3KWUI7U"

app.use(express.json())

app.get("/handleNotification", (req, res) => {
    let {title, key, secretKey, amount} = req.query
    amount = amount.replace(/,/g, '') // remove all comma

    if(secretKey != SECRET_KEY) {
        console.log("Secret key is not correct")
        res.send("Secret key is not correct")
    }
    else {
        console.log(`Title: ${title}`)
        console.log(`Key: ${key}`)
        console.log(`Amount: ${amount}`)
        res.status(200).send("ok")
    }
})

app.get("/", (req, res) => {
    console.log("GET")
    res.send("Welcome")
})

app.listen(PORT, () => {
    console.log(`App is listening on port ${PORT}`)
})