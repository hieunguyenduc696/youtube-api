const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const videoCommentSchema = new Schema({
  videoId: { type: String, required: true },
  comments: { type: Array, required: true },
});

module.exports = mongoose.model("VideoComment", videoCommentSchema);
