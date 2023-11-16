const express = require('express')
const app = express()
const fetch = (...args) =>
import("node-fetch").then(({ default: fetch }) => fetch(...args))

// constaints
const PORT = 3000 | process.env.PORT

app.use(express.json())

app.get("/handleNotification", (req, res) => {
    const datas = req.query
    console.log(`Title: ${datas?.title}`)
    console.log(`Text: ${datas?.text}`)
    res.status(200).send("ok")
})

app.listen(PORT, () => {
    console.log(`App is listening on port ${PORT}`)
})