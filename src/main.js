const express = require('express')
const app = express()
const fetch = (...args) =>
import("node-fetch").then(({ default: fetch }) => fetch(...args))

// constaints
const PORT = 3000 | process.env.PORT

app.use(express.json())

app.get("/handleNotification", (req, res) => {
    const datas = req.query
    if(datas.secretKey != "R1IC7I58XKKXPPAJXAGMGDJ3KWUI7U") {
        console.log("Secret key is not correct")
        res.send("Secret key is not correct")
    }
    else {
        console.log(`Title: ${datas?.title}`)
        console.log(`Key: ${datas?.key}`)
        console.log(`Amount: ${datas?.amount}`)
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