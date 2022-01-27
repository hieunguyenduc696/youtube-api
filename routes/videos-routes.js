const express = require("express");

const HttpError = require("../models/http-error");

const router = express.Router();

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

router.get("/:vid", (req, res, next) => {
  const videoId = req.params.vid;

  const video = DUMMY_VIDEOS.find((v) => v.id === videoId);

  if (!video) {
    throw new HttpError("Could not find a video for the provided id.", 404);
  }

  res.json({ video });
});

router.get("/user/:uid", (req, res, next) => {
  const userId = req.params.uid;
  const videos = DUMMY_VIDEOS.filter((v) => v.author === userId);

  if (!videos || videos.length === 0) {
    return next(
      new HttpError("Could not find videos for the provided user id.", 404)
    );
  }

  res.json({ videos });
});

module.exports = router;
