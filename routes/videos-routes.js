const express = require("express");
const { check } = require("express-validator");

const videosControllers = require("../controllers/videos-controllers");
const videoUpload = require("../middleware/video-upload");
const checkAuth = require('../middleware/check-auth')

const router = express.Router();

router.get("/", videosControllers.getVideos);

router.get("/:vid", videosControllers.getVideoById);

router.get("/user/:uid", videosControllers.getVideosByUserId);

router.use(checkAuth)

router.post(
  "/",
  videoUpload.fields([
    {
      name: "video",
      maxCount: 1,
    },
    { name: "image", maxCount: 1 },
  ]),
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
