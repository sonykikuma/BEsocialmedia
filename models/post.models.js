const mongoose = require('mongoose')


const postSchema = new mongoose.Schema({
content:{
  type:String,
  required:true,
},
  author:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"MediaUser",
    required:true
  },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'MediaUser' }],
  dislikes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'MediaUser' }],
  }, { timestamps: true });


const Post = mongoose.model("Post", postSchema)
module.exports = Post