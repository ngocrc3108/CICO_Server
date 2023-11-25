const express = require('express')
const router = express.Router()
const randomstring = require("randomstring")
const Users = require('../models/users')
const Topup = require('../models/topup')
const session = require('express-session')
const bodyParser = require('body-parser')
const bcrypt = require('bcrypt')

const SECRET_KEY = "R1IC7I58XKKXPPAJXAGMGDJ3KWUI7U"

router.use(express.json())
router.use(session({
    secret : SECRET_KEY,
    resave : false,
    saveUninitialized : false,
}))
router.use(bodyParser.json({limit: '50mb'}))
router.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

router.post("/signup", async (req, res) => {
    const {username, password} = req.body
    if(username == undefined || password == undefined) {
        console.log("user/signup: username or password is empty")
        res.send("Username or password is empty")
        return
    }

    if(await Users.findOne({username}) !== null) {
        console.log("user/signup: username has already used by another user!")
        res.send("This username has already used by another user!")
        return
    }

    const hashedPassword = bcrypt.hashSync(password, bcrypt.genSaltSync())
    const user = await Users.create({
        username,
        password : hashedPassword
    })

    console.log("user/signup: success")
    res.send("success")
})

router.post("/login", async (req, res) => {
        const {username, password} = req.body
        try {
            const user = await Users.findOne({username})

            if(user == null || !bcrypt.compareSync(password, user.password)) {
                console.log("user/login: username or passwod is wrong")
                res.status(500).send("username or passwod is wrong")
                return                
            }
            
            req.session.loggedIn = true;
            console.log("user/login: success")
            user.seasionID = req.sessionID
            user.save()
            res.redirect('/user/home')
        } catch (err) {
            console.log(err)
            res.status(500).send(err)
        }
})

// middleware for authentication
router.use('/', async (req, res, next) => {
    try {
        const user = await Users.findOne({seasionID : req.sessionID})
        if(user !== null) {
            req.user = user
            next()
        }
        else {
            res.render('login')
        }
    } catch (err) {
        console.log(err)
    } 
})

router.get('/home', (req, res) => {
    res.render("home")
})

router.get("/data", (req, res) => {
    const {user} = req
    const {username, balance, history} = user
    res.json({username, balance, history})
})

router.get("/topup", async (req, res) => {
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

//for testing only
router.get('/visit', (req, res) => {
    const time = new Date();
    req.user.history.unshift({time, location : "Gate 1", fee : 3000})
    req.user.balance -= 3000
    res.send("visited")
    console.log("visited")
    req.user.save()
})

module.exports = router