const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MediaUser",
      required: true,
    },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "MediaUser" }],
    dislikes: [{ type: mongoose.Schema.Types.ObjectId, ref: "MediaUser" }],
    images: [{ type: String }], // Array of image URLs
    videos: [{ type: String }], // Array of video URLs
  },
  { timestamps: true }
);

const Post = mongoose.model("Post", postSchema);
module.exports = Post;
