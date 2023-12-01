const express = require('express')
const router = express.Router()
const Admin = require('../models/admin')
const User = require('../models/users')
require('dotenv').config()
const bodyParser = require('body-parser')

var writeRequest = {status : 0, id : "", username : "", time : 0}

router.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

router.get("/reg", async (req, res) => {
    const admin = await Admin.create({
        username : "ngocrc12",
        password : 123456
    })
    console.log(admin)
})

router.get("/login", async (req, res) => {
    res.render("admin_login");
})

router.post("/login", async (req, res) => {
        const {username, password} = req.body
        console.log(username)
        console.log(password)
        try {
            const admin = await Admin.findOne({username})

            if(admin == null || password != admin.password) {
                res.render("admin_login", {
                    password,
                    username, 
                    messages : [{msg : "Username or passwod is wrong"}]
                })
                console.log("admin/login: username or passwod is wrong")
                return                
            }
            
            req.session.loggedIn = true;
            console.log("admin/login: success")
            admin.seasionID = req.sessionID
            await admin.save()
            res.redirect('/admin/')
        } catch (err) {
            console.log(err)
            res.status(500).send(err)
        }
})

router.get("/ESP32/write", (req, res) => {
    console.log(writeRequest)
    const {secretKey, cmd} = req.query

    if(secretKey != process.env.SECRET_KEY) {
        console.log("admin/ESP32/write: system: key is wrong")
        res.send("system key is wrong").status(201)
        return
    }

    if(cmd == "request") {
        if(writeRequest.status == 1) {
            const {username, id} = writeRequest
            res.send(`cmd=write&username=${username}&id=${id}`)
            writeRequest.status = 2; // writing
            return
        }

        // no new request, new request must have status = 1
        res.send("No request")
        return

    } else if(cmd == "response") {
        writeRequest.status = 0; // ok
        res.send("ok")
    }
})

router.use("/", async (req, res, next) => {
    const admin = await Admin.findOne({seasionID : req.sessionID})
    if(admin !== null && admin.seasionID != "") 
        next()
    else
        res.render('admin_login')
})

router.get("/", async (req, res) => {
    const users = await User.find({fullName : "Ngoc"})
    res.render("admin_home", {
        users : users
    });
})

router.get("/write", async (req, res) => {
    if(writeRequest.status == 0 || new Date() - 20*1000 > writeRequest.time) {
        const {id} = req.query
        const user = await User.findById(id)
        if(user === undefined) {
            res.send("user does not exist")
            console.log("admin/write: user does not exist")
            return
        }
        writeRequest = {
                        status : 1,
                        username : user.username,
                        id,
                        time : new Date()
        }
        res.send("request ok")
        console.log("admin/write: ok")
        console.log(writeRequest)
        return
    }

    res.send("writing for another user")
    console.log("admin/write: writing for another user")
})

module.exports = router