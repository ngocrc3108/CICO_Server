const express = require('express')
const app = express()
const mongoose = require('mongoose')
const userRoute = require('./routers/user')
const {authenRoute, authenticate} = require('./routers/authenticate')
const systemRoute = require('./routers/system')
const session = require('express-session')
require('dotenv').config()

// View engine setup
app.set('views', './views')
app.set("view engine", "pug")

app.use(express.json())
app.use(session({
    secret : process.env.SECRET_KEY,
    resave : false,
    saveUninitialized : false,
}))

// constaints
const PORT = 3000 | process.env.PORT

mongoose.connect(process.env.DATABASE_URL)
    .then(() => {
            console.log("Connect to db")
    })
    .catch((err) => console.log(err))

app.use('/system', systemRoute)
app.use('/auth', authenRoute)
app.use(authenticate) // require user login 
app.use('/user', userRoute)

app.get('/', (req, res) => {
    const {username, balance, formattedHistory} = req.user
        res.render("home", {
            username,
            balance,
            history : formattedHistory
        })
    })

app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`)
})