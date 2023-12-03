const express = require('express')
const app = express()
const mongoose = require('mongoose')
const userRoute = require('./routers/user')
const {authenRoute, authenticate} = require('./routers/authenticate')
const systemRoute = require('./routers/system')
const session = require('express-session')
const adminRoute = require('./routers/admin')

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

app.use('/admin', adminRoute);

app.use('/system', systemRoute)
app.use('/auth', authenRoute)
app.use(authenticate) // require user login 
app.use('/user', userRoute)

app.get('/', (req, res) => {
    const {fullName, balance, formattedHistory} = req.user
    console.log(req.user.history)
        res.render("home", {
            fullName,
            balance,
            history : formattedHistory
        })
    })

app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`)
})