const uuid = require("uuid").v4;

const HttpError = require("../models/http-error");

const DUMMY_VIDEOS = [
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

const getVideoById = (req, res, next) => {
  const videoId = req.params.vid;

  const video = DUMMY_VIDEOS.find((v) => v.id === videoId);

  if (!video) {
    throw new HttpError("Could not find a video for the provided id.", 404);
  }

  res.json({ video });
};

const getVideosByUserId = (req, res, next) => {
  const userId = req.params.uid;
  const videos = DUMMY_VIDEOS.filter((v) => v.author === userId);

  if (!videos || videos.length === 0) {
    return next(
      new HttpError("Could not find videos for the provided user id.", 404)
    );
  }

  res.json({ videos });
};

const createVideo = (req, res, next) => {
  const { title, description, author } = req.body;
  const createdVideo = {
    id: uuid(),
    title,
    description,
    author,
  };

  DUMMY_VIDEOS.push(createdVideo);
  res.status(201).json({ video: createdVideo });
};

const updateVideo = (req, res, next) => {
  const { title, description } = req.body;
  const videoId = req.params.vid;

  const updatedVideo = { ...DUMMY_VIDEOS.find((v) => v.id === videoId) };
  const videoIndex = DUMMY_VIDEOS.findIndex((v) => v.id === videoId);
  updatedVideo.title = title;
  updatedVideo.description = description;

  DUMMY_VIDEOS[videoIndex] = updatedVideo;
  res.status(200).json({ video: updatedVideo });
};
const deleteVideo = (req, res, next) => {};

exports.getVideoById = getVideoById;
exports.getVideosByUserId = getVideosByUserId;
exports.createVideo = createVideo;
exports.updateVideo = updateVideo;
exports.deleteVideo = deleteVideo;
