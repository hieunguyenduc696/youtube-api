const fs = require("fs");
const uuid = require("uuid").v1;
const jwt = require("jsonwebtoken");

const mongoose = require("mongoose");
const { validationResult } = require("express-validator");

const HttpError = require("../models/http-error");
const Video = require("../models/video");
const User = require("../models/user");
const VideoComment = require("../models/video-comment");

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

  video.views = video.views + 1
  await video.save()

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

  if (!videos) {
    return next(
      new HttpError("Could not find videos for the provided user id.", 404)
    );
  }

  if (videos.length === 0) {
    return res.json({ videos: [] });
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

  let date = new Date();
  let _date = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;

  const createdVideo = new Video({
    title,
    description,
    author: req.userData.userId,
    date: _date,
    image: req.files.image[0].path,
    video: req.files.video[0].path,
    views: 0
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
      "Something went wrong, could not update a video.",
      500
    );
    return next(error);
  }

  if (video.author.toString() !== req.userData.userId) {
    const error = new HttpError("You are not allowed to edit this video.", 403);
    return next(error);
  }

  video.title = title;
  video.description = description;

  try {
    await video.save();
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not update video",
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
      "Something went wrong, could not delete video.",
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
      "You are not allowed to delete this video.",
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
      "Something went wrong, could not delete video.",
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

const toggleLike = async (req, res, next) => {
  const videoId = req.params.vid;

  let video;
  try {
    video = await Video.findById(videoId);
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not toggle like video.",
      500
    );
    return next(error);
  }

  if (!video) {
    const error = new HttpError("Could not find video for this id.", 404);
    return next(error);
  }

  let _checkLike = video.likes.findIndex(
    (item) => item.user_id === req.userData.userId
  );
  if (_checkLike >= 0) {
    video.likes = video.likes.filter(
      (item) => item.user_id !== req.userData.userId
    );
    video.save();
    res.status(200).send({
      msg: "Success",
    });
  } else {
    video.likes = [...video.likes, { user_id: req.userData.userId }];
    video.save();
    res.status(200).send({
      msg: "Success",
    });
  }
};

const comment = async (req, res, next) => {
  const { content } = req.body;

  const videoId = req.params.vid;

  let video;
  try {
    video = await VideoComment.findOne({ videoId: videoId });
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not comment in this video.",
      500
    );
    return next(error);
  }

  let date = new Date();

  let _date = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
  let _time = `${date.getHours()}:${date.getMinutes()}`;

  let user;
  try {
    user = await User.findById(req.userData.userId);
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not get user.",
      500
    );
  }

  let obj = {
    id: uuid(),
    user_id: req.userData.userId,
    date: _date,
    time: _time,
    content,
    image: user.image,
    name: user.name,
  };

  if (video) {
    video.comments = [...video.comments, obj];
    await video.save();
  } else {
    let newComment = new VideoComment({
      videoId: videoId,
      comments: [obj],
    });
    await newComment.save();
  }
  res.status(200).send({
    msg: "Success",
    items: {
      id: obj.id,
      user_id: obj.user_id,
      date: obj.date,
      time: obj.time,
      content: obj.content,
      image: obj.image,
      name: obj.name,
    },
  });
};

const getComment = async (req, res, next) => {
  const videoId = req.params.vid;
  const commentId = req.params.cid;

  let _comment = await VideoComment.findOne({ videoId: videoId }).exec();

  let ans = _comment.comments.find((item) => item.id === commentId);

  res.status(200).send({
    msg: "Success",
    items: ans || {},
  });
};

const getComments = async (req, res, next) => {
  let token = req.headers.authorization;
  const videoId = req.params.vid;
  let _comment = await VideoComment.findOne({ videoId: videoId }).exec();

  let comments;
  if (_comment) {
    comments = _comment.comments;
    for (let index = 0; index < comments.length; index++) {
      let _user = await User.findById(comments[index].user_id);
      if (_user) {
        if (token) {
          token = req.headers.authorization.split(" ")[1];
          comments[index].editor = token === comments[index].user_id ? 1 : 0;
        }
      }
    }
  }

  res.status(200).send({
    msg: "Success",
    items: _comment
      ? {
          videoId: _comment.videoId,
          comments: comments.reverse(),
        }
      : {
          videoId: videoId,
          comments: [],
        },
  });
};

const deleteComment = async (req, res) => {
  const videoId = req.params.vid;

  let _user = await User.findById(req.userData.userId);

  let _comment = await VideoComment.findOne({ videoId: videoId });
  if (_comment) {
    let index = await _comment.comments.findIndex(
      (item) => item.id == req.body.id
    );

    if (index >= 0) {
      if (_user.id == _comment.comments[index].user_id) {
        _comment.comments = await _comment.comments.filter(
          (item) => item.id != req.body.id
        );
        await _comment.save();

        res.status(200).send({
          msg: "Success",
        });
      } else {
        res.status(400).send({
          msg: "Permission denied.",
        });
      }
    } else {
      res.status(400).send({
        msg: "Comment not found.",
      });
    }
  } else {
    res.status(400).send({
      msg: "Comment not found.",
    });
  }
};

const editComment = async (req, res) => {
  let _user = await User.findById(req.userData.userId);
  const videoId = req.params.vid;

  let _comment = await VideoComment.findOne({ videoId: videoId });

  if (_comment) {
    let index = await _comment.comments.findIndex(
      (item) => item.id == req.body.id
    );

    if (index >= 0) {
      if (_user.id == _comment.comments[index].user_id) {
        let _listCmt = [..._comment.comments];
        _listCmt[index].content = req.body.content;

        _comment.comments = [];
        await _comment.save();

        _comment.comments = _listCmt;
        await _comment.save();

        res.status(200).send({
          msg: "Success",
        });
      } else {
        res.status(400).send({
          msg: "Permission denied.",
        });
      }
    } else {
      res.status(400).send({
        msg: "Comment not found.",
      });
    }
  } else {
    res.status(400).send({
      msg: "Comment not found.",
    });
  }
};

exports.getVideos = getVideos;
exports.getVideoById = getVideoById;
exports.getVideosByUserId = getVideosByUserId;
exports.createVideo = createVideo;
exports.updateVideo = updateVideo;
exports.deleteVideo = deleteVideo;
exports.toggleLike = toggleLike;
exports.comment = comment;
exports.getComments = getComments;
exports.deleteComment = deleteComment;
exports.editComment = editComment;
exports.getComment = getComment;
