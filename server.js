const express = require('express')
const app = express()
const mongoose = require('mongoose')
const userRoute = require('./routers/user')
const {authenRoute, authenticate} = require('./routers/authenticate')
const systemRoute = require('./routers/system')
const session = require('express-session')

const SECRET_KEY = "R1IC7I58XKKXPPAJXAGMGDJ3KWUI7U"

app.use(express.json())
app.use(session({
    secret : SECRET_KEY,
    resave : false,
    saveUninitialized : false,
}))

// constaints
const PORT = 3000 | process.env.PORT

const dbUrl = "mongodb+srv://ngocrc:ndJ45DHQS37SeUm9@atlascluster.hks9agm.mongodb.net/Main?retryWrites=true&w=majority"

mongoose.connect(dbUrl)
    .then(() => {
            console.log("Connect to db")
            app.listen(PORT, () => {
                console.log(`Server is listening on port ${PORT}`)
        })
    })
    .catch((err) => console.log(err))

app.set('view engine', 'ejs')

app.use('/system', systemRoute)
app.use('/auth', authenRoute)
app.use(authenticate) // require user login 
app.use('/user', userRoute)

app.get('/', (req, res) => {
        res.render("home")
    })

