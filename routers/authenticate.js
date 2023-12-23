const express = require('express')
const authenRoute = express.Router()
const Users = require('../models/users')
const bodyParser = require('body-parser')
const bcrypt = require('bcrypt')
const { body, validationResult } = require("express-validator")

authenRoute.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

authenRoute.get('/register', (req, res) => {
    res.render('register')
})

authenRoute.post("/register", [
    body("fullName", "Name must be between 1 and 16 characters")
    .isLength({min : 1, max : 16})
    .escape(),
    body("fullName", "Name must be english characters")
    .isAlpha('en-US', {ignore: ' '})
    .escape(),
    body("password", "Password must be between 5 and 20 characters")
    .trim()
    .isLength({min : 5, max : 20})
    .escape(),
    body("username", "Username must be between 5 and 20 characters")
    .trim()
    .isLength({min : 5, max : 20})
    .escape(),

    
    async (req, res) => {
        const {username, password, fullName} = req.body
        const errors = validationResult(req)

        if(!errors.isEmpty()) {
            res.render("register", {
                fullName,
                password,
                username, 
                messages : errors.array()
            })
            return
        }

    
        if(await Users.findOne({username}) !== null) {
            res.render("register", {
                fullName,
                password,
                username, 
                messages : [{msg : "This username has already been used by another user!"}]
            })
            console.log("auth/signup: username has already been used by another user!")
            return
        }
    
        const hashedPassword = bcrypt.hashSync(password, bcrypt.genSaltSync())
        await Users.create({
            fullName,
            username,
            password : hashedPassword
        })
    
        res.render("register", {
            messages : [{msg : "Register successfully, login now!"}]
        })
        console.log("auth/signup: success")
    }
])

authenRoute.get('/login', (req, res) => {
    res.render('login')
})

authenRoute.post("/login", async (req, res) => {
        const {username, password} = req.body
        try {
            const user = await Users.findOne({username})

            if(user == null || !bcrypt.compareSync(password, user.password)) {
                res.render("login", {
                    password,
                    username, 
                    messages : [{msg : "Username or passwod is wrong"}]
                })
                console.log("auth/login: username or passwod is wrong")
                return                
            }
            
            req.session.loggedIn = true;
            console.log("auth/login: success")
            user.seasionID = req.sessionID
            console.log(req.sessionID)
            await user.save()
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