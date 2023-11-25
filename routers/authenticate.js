const express = require('express')
const authenRoute = express.Router()
const Users = require('../models/users')
const bodyParser = require('body-parser')
const bcrypt = require('bcrypt')

authenRoute.use(bodyParser.json({limit: '50mb'}))
authenRoute.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

authenRoute.get('/signup', (req, res) => {
    res.render('signup')
})

authenRoute.post("/signup", async (req, res) => {
    const {username, password} = req.body
    if(username == undefined || password == undefined) {
        console.log("auth/signup: username or password is empty")
        res.send("Username or password is empty")
        return
    }

    if(await Users.findOne({username}) !== null) {
        console.log("auth/signup: username has already used by another user!")
        res.send("This username has already used by another user!")
        return
    }

    const hashedPassword = bcrypt.hashSync(password, bcrypt.genSaltSync())
    const user = await Users.create({
        username,
        password : hashedPassword
    })

    res.render('signup_success')
    console.log("auth/signup: success")
})

authenRoute.post("/login", async (req, res) => {
        const {username, password} = req.body
        try {
            const user = await Users.findOne({username})

            if(user == null || !bcrypt.compareSync(password, user.password)) {
                console.log("auth/login: username or passwod is wrong")
                res.status(500).send("username or passwod is wrong")
                return                
            }
            
            req.session.loggedIn = true;
            console.log("auth/login: success")
            user.seasionID = req.sessionID
            user.save()
            res.redirect('/')
        } catch (err) {
            console.log(err)
            res.status(500).send(err)
        }
})

const authenticate = async (req, res, next) => {
    try {
        const user = await Users.findOne({seasionID : req.sessionID})
        if(user !== null && user.seasionID != "") {
            req.user = user
            next()
        }
        else {
            res.render('login')
        }
    } catch (err) {
        console.log(err)
    } 
}

module.exports = {authenRoute, authenticate}