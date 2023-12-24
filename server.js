const express = require('express')
const app = express()
const mongoose = require('mongoose')
const userRoute = require('./routers/user')
const {authenRoute, authenticate} = require('./routers/authenticate')
const systemRoute = require('./routers/system')
const session = require('express-session')
const adminRoute = require('./routers/admin')

require('dotenv').config()

// constaints
const PORT = 3000 | process.env.PORT
const http = app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`)
})
const sessionMiddleware = session({
    secret : process.env.SECRET_KEY,
    resave : true,
    saveUninitialized : true,
})

global.io = require("socket.io")(http)
io.engine.use(sessionMiddleware)

io.on("connection", function(socket) {
    const sessionId = socket.request.session.id;
    socket.join(sessionId);
    console.log("socket connected")
})

mongoose.connect(process.env.DATABASE_URL)
    .then(() => {
            console.log("Connect to db")
    })
    .catch((err) => console.log(err))

// View engine setup
app.set('views', './views')
app.set("view engine", "pug")

// middleware
app.use(express.json())
app.use(sessionMiddleware)

// routers
app.use('/admin', adminRoute);
app.use('/system', systemRoute)
app.use('/auth', authenRoute)
app.use(authenticate) // require user login 
app.use('/user', userRoute)

app.get('/', (req, res) => {
    const {fullName, balance, formattedHistory, linked, codeToGetTag} = req.user
    res.render("home", {
        fullName,
        balance : balance.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " "),
        history : formattedHistory,
        linked,
        codeToGetTag
    })
})
