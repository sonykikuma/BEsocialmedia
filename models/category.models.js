const mongoose = require('mongoose')


const categories = ["Fiction", "Non-Fiction", "Science Fiction", "Fantasy", "Romance", "Mystery", "Business","Kids","Comedy"];


const categorySchema = new mongoose.Schema({
  name:{
    type:String,
    enum:categories,
    required:true,
    unique:true,
    trim: true
  },
  imageUrl:{
    type:String,
  required:true
  }
})

const Category = mongoose.model("Category", categorySchema)
module.exports = Category