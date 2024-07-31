const mongoose = require("mongoose");
const Category = require('./category.models')



const productsSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    author: {
      type: String,
      required: true,
    },
    publishedYear: {
      type: Number,
      required: true,
    },
    genre: [
      {
        type: String,
        //type: mongoose.Schema.Types.ObjectId,
       // ref: 'Category',
        required:true,

        enum: [
          "Fiction",
          "Non-Fiction",
          "Comedy",
          "Mystery",
          "Thriller",
          "Science Fiction",
          "Fantasy",
          "Romance",
          "Historical",
          "Autobiography",
          "Biography",
          "Self-help",
          "Business",
          "Kids",
          "Other",
        ],
      },
    ],
    language: {
      type: String,
      required: true,
    },
    country: {
      type: String,
      default: "United States",
    },
    rating: {
      type: Number,
      min: 0,
      max: 10,
      default: 0,
    },
    summary: {
      type: String,
    },
    coverImageUrl: {
      type: String,
    },
    price:{
      type:Number,
      required:true ,   },
  },
  { timestamps: true },
);

const Product = mongoose.model("Product", productsSchema);
module.exports = Product;


//     {
//         "title": "The Jungle Book",
//         "author": "Rudyard Kipling",
//         "publishedYear": 1894,
//         "genre": [
//             "Kids"
//         ],
//         "language": "English",
//         "country": "India",
//         "rating": 9,
//         "summary": "The stories tell mostly of Mowgli, an Indian boy who is raised by wolves and learns self-sufficiency and wisdom from the jungle animals.",
//         "coverImageUrl": "https://m.media-amazon.com/images/M/MV5BY2ZkYTJkZjMtYTI4Ni00YzY3LWEwOWEtZjUwOGZkZmNkYWYwXkEyXkFqcGdeQXVyMTMxODk2OTU@._V1_.jpg",
//     }
// ]