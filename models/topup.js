const mongoose = require('mongoose')
const Schema  = mongoose.Schema
const topUpSchema = new Schema ({
    key : {type : String},
    userId : {type : String},
    isOk : {type : Boolean, default : false}
},
{timestamps:true})

const topUpModel = mongoose.model('Topup', topUpSchema)

module.exports = topUpModel