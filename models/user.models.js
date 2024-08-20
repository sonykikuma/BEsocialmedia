const mongoose = require('mongoose')


const mediaUserSchema = new mongoose.Schema({
  username:{
    type:String,
    required:true,
    unique:true
  },
  email:{
    type:String,
    required:true,
    unique:true
  },
  password:{
    type:String,
    required:true
  },
  followers:[{type:mongoose.Schema.Types.ObjectId, ref: 'MediaUser'}],
  following:[{type:mongoose.Schema.Types.ObjectId, ref: 'MediaUser'}],
  bookmarks:[{type:mongoose.Schema.Types.ObjectId, ref:"Post"}]
}, {timestamps:true})

const MediaUser = mongoose.model("MediaUser", mediaUserSchema, 'mediausers')
module.exports = MediaUser