const express = require("express");
const { check } = require("express-validator");

const videosControllers = require("../controllers/videos-controllers");

const router = express.Router();

router.get("/", videosControllers.getVideos)

router.get("/:vid", videosControllers.getVideoById);

router.get("/user/:uid", videosControllers.getVideosByUserId);

router.post(
  "/",
  [check("title").not().isEmpty(), check("description").isLength({ min: 5 })],
  videosControllers.createVideo
);

router.patch(
  "/:vid",
  [check("title").not().isEmpty(), check("description").isLength({ min: 5 })],
  videosControllers.updateVideo
);

router.delete("/:vid", videosControllers.deleteVideo);

module.exports = router;
