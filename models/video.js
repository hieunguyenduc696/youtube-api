const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const videoSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  image: { type: String, required: true },
  author: { type: String, required: true },
}, {timestamps: true});

module.exports = mongoose.model("Video", videoSchema);
