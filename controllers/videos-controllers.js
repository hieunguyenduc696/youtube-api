const fs = require("fs");

const mongoose = require("mongoose");
const { validationResult } = require("express-validator");

const HttpError = require("../models/http-error");
const Video = require("../models/video");
const User = require("../models/user");

const getVideos = async (req, res, next) => {
  let videos;
  try {
    videos = await Video.find({});
  } catch (err) {
    const error = new HttpError(
      "Fetching videos failed, please try again later.",
      500
    );
    return next(error);
  }
  res.json({
    videos: videos.map((video) => video.toObject({ getters: true })),
  });
};

const getVideoById = async (req, res, next) => {
  const videoId = req.params.vid;

  let video;
  try {
    video = await Video.findById(videoId);
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not find a video.",
      500
    );
    return next(error);
  }

  if (!video) {
    const error = new HttpError(
      "Could not find a video for the provided id.",
      404
    );
    return next(error);
  }

  res.json({ video: video.toObject({ getters: true }) });
};

const getVideosByUserId = async (req, res, next) => {
  const userId = req.params.uid;
  let videos;
  try {
    videos = await Video.find({ author: userId });
  } catch (err) {
    const error = new HttpError(
      "Fetching videos failed, please try again later.",
      500
    );
    return next(error);
  }

  if (!videos || videos.length === 0) {
    return next(
      new HttpError("Could not find videos for the provided user id.", 404)
    );
  }

  res.json({
    videos: videos.map((video) => video.toObject({ getters: true })),
  });
};

const createVideo = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError("Invalid inputs passed, please check your data", 422)
    );
  }

  const { title, description } = req.body;

  const createdVideo = new Video({
    title,
    description,
    author: req.userData.userId,
    image: req.files.image[0].path,
    video: req.files.video[0].path,
  });

  let user;
  try {
    user = await User.findById(req.userData.userId);
  } catch (err) {
    const error = new HttpError(
      "Creating video failed, please try again.",
      500
    );
    return next(error);
  }

  if (!user) {
    const error = new HttpError("Could not find user for provided id.", 404);
    return next(error);
  }

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await createdVideo.save({ session: sess });
    user.videos.push(createdVideo);
    await user.save({ session: sess });
    await sess.commitTransaction();
  } catch (err) {
    const error = new HttpError(
      "Creating video failed, please try again.",
      500
    );
    return next(error);
  }

  res.status(201).json({ video: createdVideo });
};

const updateVideo = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError("Invalid inputs passed, please check your data", 422)
    );
  }
  const { title, description } = req.body;
  const videoId = req.params.vid;

  let video;
  try {
    video = await Video.findById(videoId);
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not update a place.",
      500
    );
    return next(error);
  }

  if (video.author.toString() !== req.userData.userId) {
    const error = new HttpError("You are not allowed to edit this place.", 403);
    return next(error);
  }

  video.title = title;
  video.description = description;

  try {
    await video.save();
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not update place",
      500
    );
    return next(error);
  }

  res.status(200).json({ video: video.toObject({ getters: true }) });
};
const deleteVideo = async (req, res, next) => {
  const videoId = req.params.vid;

  let video;
  try {
    video = await Video.findById(videoId).populate("author");
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not delete place.",
      500
    );
    return next(error);
  }

  if (!video) {
    const error = new HttpError("Could not find video for this id.", 404);
    return next(error);
  }

  if (video.author.id !== req.userData.userId) {
    const error = new HttpError(
      "You are not allowed to delete this place.",
      403
    );
    return next(error);
  }

  const imagePath = video.image;
  const videoPath = video.video;

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await video.remove({ session: sess });
    video.author.videos.pull(video);
    await video.author.save({ session: sess });
    await sess.commitTransaction();
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not delete place.",
      500
    );
    return next(error);
  }

  fs.unlink(imagePath, (err) => {
    console.log(err);
  });
  fs.unlink(videoPath, (err) => {
    console.log(err);
  });

  res.status(200).json({ message: "Delete video." });
};

exports.getVideos = getVideos;
exports.getVideoById = getVideoById;
exports.getVideosByUserId = getVideosByUserId;
exports.createVideo = createVideo;
exports.updateVideo = updateVideo;
exports.deleteVideo = deleteVideo;
