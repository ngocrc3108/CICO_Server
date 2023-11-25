const express = require('express')
const app = express()
const mongoose = require('mongoose')
const userRoute = require('./routers/user')
const systemRoute = require('./routers/system')
const bcrypt = require('bcrypt')
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

app.use('/user', userRoute)
app.use('/system', systemRoute)

