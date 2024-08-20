const express = require("express");
const app = express();
const cors = require("cors");
const corsOptions = {
  origin: "*",
  credentials: true,
  optionSuccessStatus: 200,
};

app.use(cors(corsOptions));

const { initializeDatabase } = require("./db");
const Post = require("./models/post.models")
const MediaUser = require("./models/user.models")
const bcrypt = require('bcrypt');// for security reasons, it's important to hash the password before saving it to the database. 

//const fs = require('fs')

app.use(express.json());

initializeDatabase();
app.get("/", (req, res) => {
  res.send("Hello, Express!");
});

//The exec() method is used to explicitly execute a query and return a promise. When you chain methods like find(), select(), sort(), etc., in Mongoose, it doesn't immediately execute the query. Instead, it creates a query object that you can later execute using .exec().


//to get all posts
app.get("/posts", async(req,res)=>{
  try{
    const posts = await Post.find().populate('author', 'username').exec()
    res.status(200).json(posts)
  } catch(error){
    res.status(500).json({message: error.message})
  }
})


//to post a post
app.post("/media-user/posts", async (req, res)=>{
  const {content, author} = req.body
  try{
    const newPost = new Post({content, author})
    await newPost.save()
    res.status(201).json(newPost)
  } catch(error){
    res.status(400).json({message: error.message})
  }
})

//to get a post 
app.get('/posts/:postId', async (req, res) => {
    try {
        const post = await Post.findById(req.params.postId).populate('author', 'username').exec();
        if (!post) return res.status(404).json({ message: 'Post not found' });
        res.status(200).json(post);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

//to update a post
app.post("/posts/:postId", async(req,res)=>{
  const {content} = req.body
  const postId = req.params.postId

  try{
   const updatedPost = await Post.findByIdAndUpdate(postId, {content},{new:true}) 
if(!updatedPost){
  return res.status(404).json({message:"Post not found"})
}

   res.status(200).json(updatedPost) 
  } catch(error){
    res.status(500).json({message:error.message})
  }
})

//to like a post 
app.post('/posts/like/:postId', async (req, res) => {
    const userId = req.body.userId;

    try {
        const post = await Post.findById(req.params.postId);
        if (!post) return res.status(404).json({ message: 'Post not found' });

        if (!post.likes.includes(userId)) {
            post.likes.push(userId);
            post.dislikes.pull(userId); // Remove dislike if any
        }

        await post.save();
        res.status(200).json(post);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

//to dislike a post
app.post('/posts/dislike/:postId', async (req, res) => {
    const userId = req.body.userId;

    try {
        const post = await Post.findById(req.params.postId);
        if (!post) return res.status(404).json({ message: 'Post not found' });

        if (!post.dislikes.includes(userId)) {
            post.dislikes.push(userId);
            post.likes.pull(userId); // Remove like if any
        }

        await post.save();
        res.status(200).json(post);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


//to delete a post
app.delete("/posts/:postId", async (req, res)=>{

  try{
     const deletePost = await Post.findByIdAndDelete(req.params.postId)

    if(!deletePost){
      res.status(404).json({message:"post not found"})
    }

    res.status(200).json({message:"Post deleted successfully"})
  } catch(error){
    res.status(500).json({message: error.message})
  }
})

//8.to add a post to user's bookmark
app.post("/media-users/bookmark/:postId", async (req, res)=>{
const userId = req.body.userId
  const postId = req.params.postId

  try{
    const user = await MediaUser.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if(!user.bookmarks.includes(postId)){
      user.bookmarks.push(postId)
      await user.save()
    }
    res.status(200).json(user.bookmarks);

  } catch(error){
    res.status(500).json({message: error.message})
  }
})

//9. to get all the bookmarks of user
app.get('/media-users/bookmark', async (req, res) => {
    const userId = req.body.userId;

    try {
        const user = await MediaUser.findById(userId).populate('bookmarks').exec();
        if (!user) return res.status(404).json({ message: 'User not found' });

        res.status(200).json(user.bookmarks);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

//10. to remove a post from user's bookmark
app.post('/media-users/remove-bookmark/:postId', async (req, res) => {
    const userId = req.body.userId;
    const postId = req.params.postId;

    try {
        const user = await MediaUser.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        user.bookmarks.pull(postId);
        await user.save();

        res.status(200).json(user.bookmarks);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

//11. to get all the users
app.get('/media-users', async (req, res) => {
    try {
        const users = await MediaUser.find().select('username email').exec();
        res.status(200).json(users);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

//to post a user
app.post("/media-users", async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new MediaUser({ username, email, password: hashedPassword });
    await newUser.save();
    res.status(201).json(newUser);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});


const PORT = 3000;
app.listen(PORT, (req, res) => {
  console.log(`Server is running in port ${PORT}`);
});
