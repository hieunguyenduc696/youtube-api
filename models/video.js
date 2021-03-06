const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const videoSchema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    image: { type: String, required: true },
    author: { type: mongoose.Types.ObjectId, required: true, ref: "User" },
    video: { type: String, required: true },
    date: { type: String, required: true },
    likes: { type: Array, required: true },
    views: { type: Number, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Video", videoSchema);
