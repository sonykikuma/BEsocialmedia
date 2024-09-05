const express = require("express");
const mongoose = require('mongoose');


//adding new things 
const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Folder to save uploaded files
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Unique file name
  },
});

const upload = multer({ storage: storage });
// up to here


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


app.use(express.json());
// Serve static files from the "uploads" directory
app.use("/uploads", express.static("uploads"));


initializeDatabase();
app.get("/", (req, res) => {
  res.send("Hello, Express!");
});

//The exec() method is used to explicitly execute a query and return a promise. When we chain methods like find(), select(), sort(), etc., in Mongoose, it doesn't immediately execute the query. Instead, it creates a query object that you can later execute using .exec().


//1. to get all the users
app.get("/media-users", async (req, res) => {
  try {
    const users = await MediaUser.find().exec();
    //select('username email').
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

//2.retrieving an user by userid
app.get("/media-user/:id", async (req, res) => {
  try {
    const user = await MediaUser.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

//3.to post or create a user
app.post("/media-users", async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new MediaUser({
      username,
      email,
      password: hashedPassword,
      followers: [],
      following: [],
      bookmarks: [],
      posts: [],
    });

    const savedUser = await newUser.save();

    res.status(201).json(savedUser);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

//4. to update a user's details
app.put("/media-user/:userId", async (req, res) => {
  const userId = req.params.userId;
  const {
    username,
    email,
    followers,
    following,
    bookmarks,
    postId,
    newContent,
    profilePic,
    bio,
  } = req.body;

  try {
    const user = await MediaUser.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (username) user.username = username;
    if (email) user.email = email;
    if (followers) user.followers = followers;
    if (following) user.following = following;
    if (bookmarks) user.bookmarks = bookmarks;
    if (profilePic) user.profilePic = profilePic; // profile pic
    if (bio) user.bio = bio;

    if (postId && newContent) {
      const postToUpdate = user.posts.find(
        (post) => post._id.toString() === postId
      );
      if (postToUpdate) {
        postToUpdate.content = newContent;

        if (!postToUpdate.content) {
          // if the post has no content
          postToUpdate.content = newContent;
        }
      } else {
        return res
          .status(404)
          .json({ message: "Post not found in user posts array" });
      }
    }

    const updatedUser = await user.save();
    res.status(200).json(updatedUser);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

//5. To add the post to the user

// app.post("/media-user/:userId/posts", async (req, res) => {
//   const userId = req.params.userId;
//   const { content } = req.body;

//   if (!content) {
//     return res.status(400).json({ message: "Content is required" });
//   }
//   try {
//     const user = await MediaUser.findById(userId);
//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     const newPost = new Post({
//       content: content,
//       author: user._id,
//     });

//     const savedPost = await newPost.save();
//     user.posts.push({
//       postId: savedPost._id,
//       content: savedPost.content,
//       createdAt: savedPost.createdAt,
//     });

//     const updatedUser = await user.save();

//     res.status(201).json(updatedUser);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });

//to handle images and videos while posting
app.post("/media-user/:userId/posts", async (req, res) => {
  const userId = req.params.userId;
  const { content, images, videos } = req.body;

  if (!content && (!images || !videos)) {
    return res.status(400).json({ message: "Content or media is required" });
  }

  try {
    const user = await MediaUser.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const newPost = new Post({
      content: content || "",
      author: user._id,
      images: images || [],
      videos: videos || [],
    });

    const savedPost = await newPost.save();

    user.posts.push({
      postId: savedPost._id,
      content: savedPost.content,
      createdAt: savedPost.createdAt,
      images: savedPost.images, // Include media fields
      videos: savedPost.videos, // Include media fields
    });

    const updatedUser = await user.save();

    res.status(201).json(updatedUser);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

//posts
//6.to get all posts
app.get("/posts", async (req, res) => {
  try {
    const posts = await Post.find().populate("author", "username").exec();
    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

//7. to create a new post
app.post("/media-user/posts", async (req, res) => {
  const { content, author } = req.body;

  try {
    const user = await MediaUser.findById(author);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const newPost = new Post({ content, author });
    await newPost.save();

    user.posts.push({
      postId: newPost._id,
      content: newPost.content,
      createdAt: new Date(),
    });

    await user.save();

    res.status(201).json(newPost);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

//8. to get a post by specific postid
app.get("/posts/:postId", async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId)
      .populate("author", "username")
      .exec();
    if (!post) return res.status(404).json({ message: "Post not found" });
    res.status(200).json(post);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

//to fix post which have no postid
const updatePostsWithMissingPostId = async () => {
  try {
    const users = await MediaUser.find({});
    for (const user of users) {
      let updated = false;
      for (const post of user.posts) {
        if (!post.postId) {
          post.postId = post._id; // Assign _id to postId
          updated = true;
        }
      }
      if (updated) {
        await user.save();
      }
    }
    console.log("All posts have postId.");
  } catch (error) {
    console.error("Error updating posts:", error);
  }
};

updatePostsWithMissingPostId();

//9. to update a post

app.put("/posts/:postId", async (req, res) => {
  const { content, images, videos } = req.body;
  const postId = req.params.postId;

  if (!mongoose.Types.ObjectId.isValid(postId)) {
    return res.status(400).json({ message: "Invalid postId format" });
  }

  try {
    const updatedPost = await Post.findByIdAndUpdate(
      postId,
      {
        content,
        images: images || [],
        videos: videos || [],
      },
      { new: true }
    );

    if (!updatedPost) {
      return res.status(404).json({ message: "Post not found" });
    }

    const user = await MediaUser.findById(updatedPost.author);

    if (user) {
      const postIndex = user.posts.findIndex(
        (post) => post.postId && post.postId.toString() === postId.toString()
      );

      if (postIndex !== -1) {
        user.posts[postIndex].content =
          content || user.posts[postIndex].content;
        user.posts[postIndex].images = images || user.posts[postIndex].images;
        user.posts[postIndex].videos = videos || user.posts[postIndex].videos;
        await user.save();
      } else {
        return res
          .status(404)
          .json({ message: "Post reference not found in user's posts array" });
      }
    } else {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(updatedPost);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
});

// app.put("/posts/:postId", async (req, res) => {
//   const { content } = req.body;
//   const postId = req.params.postId;

//   try {
//     const updatedPost = await Post.findByIdAndUpdate(
//       postId,
//       { content },
//       { new: true }
//     );
//     if (!updatedPost) {
//       return res.status(404).json({ message: "Post not found" });
//     }

//     res.status(200).json(updatedPost);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });

//10.  to like a post
app.post("/posts/like/:postId", async (req, res) => {
  const userId = req.body.userId;

  try {
    const post = await Post.findById(req.params.postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    if (!post.likes.includes(userId)) {
      post.likes.push(userId);
      post.dislikes.pull(userId);
    }

    await post.save();
    res.status(200).json(post);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

//11. to dislike a post
app.post("/posts/dislike/:postId", async (req, res) => {
  const userId = req.body.userId;

  try {
    const post = await Post.findById(req.params.postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    if (!post.dislikes.includes(userId)) {
      post.dislikes.push(userId);
      post.likes.pull(userId);
    }

    await post.save();
    res.status(200).json(post);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

//12.  to delete a post
app.delete("/posts/:postId", async (req, res) => {
  try {
    const deletePost = await Post.findByIdAndDelete(req.params.postId);

    if (!deletePost) {
      res.status(404).json({ message: "post not found" });
    }

    res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

//13. to add a post to user's bookmark
app.post("/media-user/bookmark/:postId", async (req, res) => {
  const userId = req.body.userId;
  const postId = req.params.postId;

  try {
    const user = await MediaUser.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (!user.bookmarks.includes(postId)) {
      user.bookmarks.push(postId);
      await user.save();
    }
    res.status(200).json(user.bookmarks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

//14. to get all the bookmarks of user
app.get("/media-user/bookmarks", async (req, res) => {
  const userId = req.body.userId;

  try {
    const user = await MediaUser.findById(userId).populate("bookmarks").exec();
    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json(user.bookmarks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

//15. to remove a post from user's bookmark
app.post("/media-user/remove-bookmark/:postId", async (req, res) => {
  const userId = req.body.userId;
  const postId = req.params.postId;

  try {
    const user = await MediaUser.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.bookmarks.pull(postId);
    await user.save();

    res.status(200).json(user.bookmarks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

//16. to follow a user
app.post("/media-user/follow/:userId", async (req, res) => {
  const currentUserId = req.body.userId; //
  const targetUserId = req.params.userId;

  try {
    const currentUser = await MediaUser.findById(currentUserId);
    const targetUser = await MediaUser.findById(targetUserId);

    if (!currentUser || !targetUser) {
      return res.status(404).json({ message: "User(s) not found" });
    }

    if (!currentUser.following.includes(targetUserId)) {
      currentUser.following.push(targetUserId);
      await currentUser.save();
    }

    if (!targetUser.followers.includes(currentUserId)) {
      targetUser.followers.push(currentUserId);
      await targetUser.save();
    }

    res.status(200).json({ message: "User followed successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

//17. to unfollow a user
app.post("/media-user/unfollow/:userId", async (req, res) => {
  const currentUserId = req.body.userId; // Assuming the logged-in user's ID is sent in the request body
  const targetUserId = req.params.userId;

  try {
    const currentUser = await MediaUser.findById(currentUserId);
    const targetUser = await MediaUser.findById(targetUserId);

    if (!currentUser || !targetUser) {
      return res.status(404).json({ message: "User(s) not found" });
    }

    currentUser.following.pull(targetUserId);
    targetUser.followers.pull(currentUserId);

    await currentUser.save();
    await targetUser.save();

    res.status(200).json({ message: "User unfollowed successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

//18. Route to get a user's followers
app.get("/media-user/:userId/followers", async (req, res) => {
  try {
    const user = await MediaUser.findById(req.params.userId)
      .populate("followers", "username")
      .exec();
    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json(user.followers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

//19. Route to get a user's following list
app.get("/media-user/:userId/following", async (req, res) => {
  try {
    const user = await MediaUser.findById(req.params.userId)
      .populate("following", "username")
      .exec();
    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json(user.following);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

const PORT = 3000;
app.listen(PORT, (req, res) => {
  console.log(`Server is running in port ${PORT}`);
});
