const mongoose = require('mongoose')

const Schema  = mongoose.Schema
const adminSchema = new Schema ({
    username : {
        type : String
    },
    password : {
        type : String
    },
    seasionID : {
        type : String,
        default : ""
    }
}, {timestamps:true})

const adminModel = mongoose.model('Admin', adminSchema)

module.exports = adminModel