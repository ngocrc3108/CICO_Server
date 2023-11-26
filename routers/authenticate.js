const express = require('express')
const authenRoute = express.Router()
const Users = require('../models/users')
const bodyParser = require('body-parser')
const bcrypt = require('bcrypt')
const { body, validationResult } = require("express-validator")

authenRoute.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

authenRoute.get('/signup', (req, res) => {
    res.render('signup')
})

authenRoute.post("/signup", [
    body("password", "Password must be between 5 and 20 characters")
    .trim()
    .isLength({min : 5, max : 20})
    .escape(),
    body("username", "Username must be between 5 and 20 characters")
    .trim()
    .isLength({min : 5, max : 20})
    .escape(),

    async (req, res) => {
        const errors = validationResult(req)

        if(!errors.isEmpty()) {
            res.render("signup", {
                messages : errors.array()
            })
            return
        }

        const {username, password} = req.body
    
        if(await Users.findOne({username}) !== null) {
            res.render("signup", {
                messages : [{msg : "This username has already been used by another user!"}]
            })
            console.log("auth/signup: username has already been used by another user!")
            return
        }
    
        const hashedPassword = bcrypt.hashSync(password, bcrypt.genSaltSync())
        await Users.create({
            username,
            password : hashedPassword
        })
    
        res.render("signup", {
            messages : [{msg : "Register successfully, login now!"}]
        })
        console.log("auth/signup: success")
    }
])

authenRoute.post("/login", async (req, res) => {
        const {username, password} = req.body
        try {
            const user = await Users.findOne({username})

            if(user == null || !bcrypt.compareSync(password, user.password)) {
                res.render("login", {
                    messages : [{msg : "Username or passwod is wrong"}]
                })
                console.log("auth/login: username or passwod is wrong")
                return                
            }
            
            req.session.loggedIn = true;
            console.log("auth/login: success")
            user.seasionID = req.sessionID
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