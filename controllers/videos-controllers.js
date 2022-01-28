const uuid = require("uuid").v4;
const { validationResult } = require("express-validator");

const HttpError = require("../models/http-error");
const Video = require("../models/video");

let DUMMY_VIDEOS = [
  {
    id: "v1",
    image:
      "https://i.ytimg.com/vi/uZfcxvrsL28/hq720.jpg?sqp=-oaymwEcCNAFEJQDSFXyq4qpAw4IARUAAIhCGAFwAcABBg==&rs=AOn4CLCGh7xxQbMgq8h-39aXVLVjDym0Vw",
    title: "Neymar Jr & Ronaldinho Most Creative & Smart Plays",
    description:
      "Please Subscribe if you Enjoy my videos it gives me motivation to make more videos. Turn notifications on and you will never miss a video again.",
    author: "u1",
    views: 4.7,
    createdAt: "8 months ago",
    likes: 626,
  },
];

const getVideoById = async (req, res, next) => {
  const videoId = req.params.vid;

  let video;
  try {
    video = await Video.findById(videoId);
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not find a place.",
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
    throw new HttpError("Invalid inputs passed, please check your data", 422);
  }

  const { title, description, author } = req.body;
  const createdVideo = new Video({
    title,
    description,
    author,
    image:
      "https://i.ytimg.com/vi/uZfcxvrsL28/hq720.jpg?sqp=-oaymwEcCNAFEJQDSFXyq4qpAw4IARUAAIhCGAFwAcABBg==&rs=AOn4CLCGh7xxQbMgq8h-39aXVLVjDym0Vw",
  });

  try {
    await createdVideo.save();
  } catch (err) {
    const error = new HttpError(
      "Creating video failed, please try again.",
      500
    );
    return next(error);
  }

  res.status(201).json({ video: createdVideo });
};

const updateVideo = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new HttpError("Invalid inputs passed, please check your data", 422);
  }
  const { title, description } = req.body;
  const videoId = req.params.vid;

  const updatedVideo = { ...DUMMY_VIDEOS.find((v) => v.id === videoId) };
  const videoIndex = DUMMY_VIDEOS.findIndex((v) => v.id === videoId);
  updatedVideo.title = title;
  updatedVideo.description = description;

  DUMMY_VIDEOS[videoIndex] = updatedVideo;
  res.status(200).json({ video: updatedVideo });
};
const deleteVideo = (req, res, next) => {
  const videoId = req.params.vid;
  if (!DUMMY_VIDEOS.find((v) => v.id === videoId)) {
    throw new HttpError("Could not find video for that id.", 404);
  }
  DUMMY_VIDEOS = DUMMY_VIDEOS.filter((v) => v.id !== videoId);
  res.status(200).json({ message: "Delete video." });
};

exports.getVideoById = getVideoById;
exports.getVideosByUserId = getVideosByUserId;
exports.createVideo = createVideo;
exports.updateVideo = updateVideo;
exports.deleteVideo = deleteVideo;
