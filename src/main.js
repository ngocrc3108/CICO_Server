const express = require('express')
const app = express()
const session = require('express-session')
const bodyParser = require('body-parser')
const randomstring = require("randomstring")
const fetch = (...args) => import("node-fetch").then(({ default: fetch }) => fetch(...args))

// constaints
const PORT = 3000 | process.env.PORT
const SECRET_KEY = "R1IC7I58XKKXPPAJXAGMGDJ3KWUI7U"

var users = [
    {
    username : "Ngoc",
    password : "123456",
    id : "ABCD",
    balance : 31000,
    history : [],
    sessionID : ""
    }
];

var topUpKey = []

app.set('view engine', 'ejs')
app.use(express.json())
app.use(session({
    secret : SECRET_KEY,
    resave : false,
    saveUninitialized : false
}))
app.use(bodyParser.json({limit: '50mb'}))
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

app.post("/login", (req, res) => {
    console.log(req.sessionID)
    if(req.session.user) {
        res.send("You have already logged in!");
        console.log(req.session.user);
    } else {
        const {username, password} = req.body;
        if(!username || !password)
            res.send("Username or password is empty!")
        else {
            const userIndex = users.findIndex((value) => value.username == username && value.password == password)
            const user = users[userIndex]
            if(user !== undefined) {
                req.session.user = user
                users[userIndex].sessionID = req.sessionID
                console.log("Login successfully")
                res.redirect('/')
            } else {
                console.log("User name or password is wrong!")
                res.send("User name or password is wrong!")
            }
        }
    }
})

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
        const topUpIndext = topUpKey.findIndex((element) => element.key == key)
        if(topUpIndext !== -1) {
            const username = topUpKey[topUpIndext].username
            const userIndex = users.findIndex((element) => element.username == username)
            if(userIndex !== -1) {
                console.log("top up successfully")
                users[userIndex].balance += parseInt(amount)
                topUpKey[topUpIndext].isOK = true
            }
            else
                console.log("User not found")
        }
        else
            console.log("Key not found in topUpKey")
        res.status(200).send("ok")
    }
})

app.get("/ESP32/read", (req, res) => {
    const {id} = req.query;
    if(id !== undefined) {
        const userIndex = users.findIndex((e) => e.id == id)
        if(userIndex !== -1) {
            if(users[userIndex].balance > 3000) {
                const info = {
                    time: new Date(),
                    fee: 3000,
                    location : "Gate 1"
                }
                users[userIndex].history.unshift(info);
                users[userIndex].balance = users[userIndex].balance - info.fee
                res.send(`cmd=open&name=${users[userIndex].username}&fee=3000`)
            }
            else {
                res.send("cmd=deny&reason=Insufficient funds")
            } 
        } else {
            res.send("cmd=deny&reason=User not found")
            console.log("user not found")
        }
    }
})

app.use((req, res, next) => {
    if(req.session.user === undefined)
        res.render("login")
    else {
        console.log("Log form middleware")
        console.log(req.sessionID)
        console.log(users)
        next()
    }
})

app.get("/", (req, res) => {
    res.render("home")
})

// app.get("/visit", (req, res) => {
//     console.log(req.sessionID)
//     const userIndex = users.findIndex((element) => element.sessionID == req.sessionID)
//     if(userIndex !== -1) {
//         const info = {
//             time: new Date(),
//             fee: 3000,
//             location : "Gate 1"
//         }
//         users[userIndex].history.unshift(info);
//         users[userIndex].balance = users[userIndex].balance - info.fee
//         res.send(info)
//         console.log(info)
//     }
// })

app.get("/user/data", (req, res) => {
    const user = users.find((element) => element.sessionID == req.sessionID)
    const {username, balance, history} = user
    res.send(JSON.stringify({username, balance, history}))
})

app.get("/user/topup", (req, res) => {
    const string = "QLVR" + randomstring.generate({
        length : 6,
        capitalization : 'uppercase'
    })
    res.send(JSON.stringify({message : `Ngân hàng: BIDV\nSTK: 3149193588\nTên: Nguyen Tien Ngoc\nNội dung: ${string}`}))
    topUpKey.unshift({
        key : string,
        username : req.session.user.username,
        isOK : false
    })
    console.log(topUpKey)
})

app.listen(PORT, () => {
    console.log(`App is listening on port ${PORT}`)
})

