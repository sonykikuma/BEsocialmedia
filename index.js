const express = require('express')
const app = express()
const cors = require("cors")
const corsOptions = {
  origin:"*",
  credentials:true,
  optionSuccessStatus: 200,
}

app.use(cors(corsOptions));

const {initializeDatabase} = require("./db")
//const fs = require('fs')
const Book = require("./models/books.models")
const Category = require("./models/category.models")
const Product = require("./models/products.models")

app.use(express.json())

 initializeDatabase();
app.get("/", (req, res) => {
  res.send("Hello, Express!");
});


// const jsonData = fs.readFileSync("products.json", "utf8")
// const productsData = JSON.parse(jsonData)
// function seedData() {
//   try {
//     for (const productData of productsData) {
//       const newProduct = new Product({
//         title: productData.title,
//         author: productData.author,
//         publishedYear: productData.publishedYear,
//         genre: productData.genre,
//         language: productData.language,
//         country: productData.country,
//         rating: productData.rating,
//         summary: productData.summary,
//         coverImageUrl: productData.coverImageUrl,
//       });
//       newProduct.save();
//       console.log("new product", newProduct.title);
//     }
//   } catch (error) {
//     console.log("error seeding the data", error);
//   }
// }

// seedData();


async function createProduct(newProduct){
  try{
    const product = new Product(newProduct)
    const savedProduct = await product.save()
    return savedProduct
  } catch(error){
    throw error
  }
}
app.post("/products", async (req,res)=>{
  try{
    const savedProduct = await createProduct(req.body)
    res.status(201).json({message:"Book added successfully.", product: savedProduct})
  } catch(error){
    console.log("error in saving book:", error)
    res.status(500).json({error: "failed to add new book.", details:error.message})
  }
})

//category adding
async function createCategory(newCategory){
  try{
    const category = new Category(newCategory)
    const savedCategory = await category.save()
    return savedCategory
  } catch(error){
    throw error
  }
}
app.post("/categories", async (req,res)=>{
  try{
    const savedCategory = await createCategory(req.body)
    res.status(201).json({message:"category added successfully.", category: savedCategory})
  } catch(error){
    console.log("error in saving category:", error)
    res.status(500).json({error: "failed to add new category.", details:error.message})
  }
})





//get products
async function getAllProducts(){
  try{
    const allProducts = await Product.find()
    return allProducts
  } catch(error){
    console.log('error in fetching books', error)
  }
}

app.get("/products", async(req,res)=>{
  try{
    const products = await getAllProducts()
    if(products.length != 0){
      res.json(products)
    } else {
      res.status(404).json({error: "No books found."})
    }
  } catch(error){
    res.status(500).json({error: "failed to fetch books."})
  }
})
//get categories
async function getAllCategories(){
  try{
    const allCategories = await Category.find()
    return allCategories
  } catch(error){
    console.log('error in fetching categories', error)
  }
}

app.get("/categories", async(req,res)=>{
  try{
    const categories = await getAllCategories()
    if(categories.length != 0){
      res.json(categories)
    } else {
      res.status(404).json({error: "No categories found."})
    }
  } catch(error){
    res.status(500).json({error: "failed to fetch categories."})
  }
})




//4.read book by title
// async function readBookByTitle(bookTitle){
//   try{
//     const bookByTitle = await Book.findOne({title: bookTitle})
//     return bookByTitle
//   } catch(error){
//     throw error
//   }
// }

// app.get("/books/:bookTitle", async (req, res)=>{
//   try{
//     const books = await readBookByTitle(req.params.bookTitle)
//     if(books.length != 0){
//       res.json(books)
//     } else {
//       res.status(404).json({error: "No books found."})
//     }
//   } catch(error){
//     res.status(500).json({error:"Failed to fetch books"})
//   }
// })

//5.read book by author
// async function readBookByAuthor(authorName) {
//   try {
//   const bookByAuthor = await Book.findOne({ author: authorName });
//     return bookByAuthor
//   } catch (error) {
//     throw error;
//   }
// }

// app.get("/books/author/:authorName", async (req,res)=>{
//   try{
//     const books = await readBookByAuthor(req.params.authorName)
//     if(books.length != 0){
//       res.json(books)
//     } else {
//       res.status(404).json({error: "No books found"})
//     }
//   } catch(error){
//     res.status(500).json({error: "Failed to fetch books."})
//   }
// })

//6.  to get all the books which are of "Business" genre.
// async function readBookByGenre(bookGenre){
//   try{
//    const bookByGenre = await Book.find({genre:bookGenre }) 
//     return bookByGenre
// } catch(error){
//   throw error
// }
// }

// app.get("/books/genre/:bookGenre", async (req,res)=>{
//   try{
//     const books = await readBookByGenre(req.params.bookGenre)
//     if(books.length != 0){
//       res.json(books)
//     } else {
//       res.status(404).json({error: "No books found."})
//     }
//   } catch(error){
//     res.status(500).json({error: "Failed to fetch books."})
//   }
// })

//7. Create an API to get all the books which was released in the year 2012.

// async function readBooksByYear(bookPublishedYear){
//   try{
//     const bookByYear = await Book.find({publishedYear: bookPublishedYear})
//     return bookByYear
//   } catch(error){
//     throw error
//   }
// }

// app.get("/books/publishedYear/:bookPublishedYear", async (req,res)=>{
//   try{
//     const books = await readBooksByYear(req.params.bookPublishedYear)
//     if(books.length != 0){
//       res.json(books)
//     } else {
//       res.status(404).json({error: "No books found"})
//     }
//   } catch(error){
//     res.status(500).json({error: "Failed to fetch books.", details:error.message})
//   }
// })



//updating products
async function updateProduct(productId, dataToUpdate){
  try{
    const updatedProduct = await Product.findByIdAndUpdate(productId, dataToUpdate, {new:true})
    return updatedProduct
  } catch(error){
    console.log('error in updating book data.', error)
  }
}
app.post("/products/:productId", async (req,res)=>{
  try{
   const updatedProduct = await updateProduct(req.params.productId, req.body)
    if(updatedProduct){
      res.status(200).json({message:"Book updated successfully", updatedProduct: updatedProduct})
    } else {
      res.status(404).json({error:"Book does not exist."})
    }
  } catch(error){
    res.status(500).json({error:"failed to update book price."})

  }
})
//adding price
 async function updatePrice(productId, dataToUpdate){
   try{
    const updatedPrice =  await Product.findByIdAndUpdate(productId, dataToUpdate, {new:true})
return updatedPrice
  } catch(error){
console.log('error in updating book price.', error)
} 
 }
app.post("/products/:productId/price", async (req,res)=>{
  try{
    const updatedPrice = await updatePrice(req.params.productId, req.body)
    if(updatedPrice){
      res.status(200).json({message: "Book updated successfully.", updatedPrice:updatedPrice})
    } else {
      res.status(404).json({error:"book does not exist"})
    }
  } catch(error){
    res.status(500).json({error:"failed to update book price."})
  }
})


// async function updateBook(bookTitle, dataToUpdate){
//   try{
//     const updatedBook = await Book.findOneAndUpdate({title:bookTitle}, dataToUpdate, {new:true})
//     return updatedBook
//   } catch(error){
//     console.log('error in updating book data', error)
//   }
// }
// app.post("/books/title/:bookTitle", async(req,res)=>{
//   try{
//     const updatedBook = await updateBook(req.params.bookTitle, req.body)
//     if(updatedBook){
//       res.status(200).json({message:"Book updated successfully.", updatedBook:updatedBook})
//     } else {
//       res.status(404).json({error:"Book does not exist"})
//     }
//   } catch(error){
//     res.status(500).json({error: "Failed to update book data"})
//   }
// })

//10. Create an API to delete a book with the help of a book id, Send an error message "Book not found" in case the book does not exist. Make sure to do error handling.
async function deleteBook(bookId){
  try{
    const deletedBook = await Book.findByIdAndDelete(bookId)
    return deletedBook
  } catch(error){
    console.log(error)
  }
}
app.delete("/books/:bookId", async (req,res)=>{
  try{
    const deletedBook = await deleteBook(req.params.bookId)
    if(deletedBook){
      res.status(200).json({message:"Book deleted successfully."})
    } else {
      res.status(404).json({error: "Book not found."})
    }
  } catch(error){
    res.status(500).json({error:"Failed to delete book"})
  }
})

const PORT = 3000
app.listen(PORT, (req,res)=>{
  console.log(`Server is running in port ${PORT}`)
})