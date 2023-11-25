const mongoose = require('mongoose')
const Schema  = mongoose.Schema
const usersSchema = new Schema ({
    username : {
        type : String
    },
    password : {
        type : String
    },
    seasionID : {
        type : String,
        default : ""
    },
    RFID : {
        type : String,
        default : ""
    },
    balance : {
        type : Number,
        default : 0
    },
    history : {
        type : Array,
        default : []
    }
}, {timestamps:true})
const usersModel = mongoose.model('Users', usersSchema)

module.exports = usersModel