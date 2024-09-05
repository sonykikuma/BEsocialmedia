const mongoose = require("mongoose");

const mediaUserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    profilePic: {
      type: String,
      default: "",
    },
    bio: {
      type: String,
      default: "",
    },

    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "MediaUser" }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: "MediaUser" }],
    bookmarks: [{ type: mongoose.Schema.Types.ObjectId, ref: "Post" }],
    posts: [
      {
        postId: { type: mongoose.Schema.Types.ObjectId, ref: "Post" },
        content: String,
        createdAt: { type: Date, default: Date.now },
        images: [{ type: String }], // Add these fields
        videos: [{ type: String }], // Add these fields
      },
    ],
  },
  { timestamps: true }
);

const MediaUser = mongoose.model("MediaUser", mediaUserSchema, "mediausers");
module.exports = MediaUser;
