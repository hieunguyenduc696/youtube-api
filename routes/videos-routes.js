const express = require("express");
const { check } = require("express-validator");

const videosControllers = require("../controllers/videos-controllers");
const videoUpload = require("../middleware/video-upload");
const checkAuth = require('../middleware/check-auth')

const router = express.Router();

router.get("/", videosControllers.getVideos);

router.get("/:vid", videosControllers.getVideoById);

router.get("/user/:uid", videosControllers.getVideosByUserId);

router.get('/comment/:vid', videosControllers.getComments)

router.get('/comment/:vid/:cid', videosControllers.getComment)

router.use(checkAuth)

router.post("/togglelike/:vid", videosControllers.toggleLike)

router.post("/comment/:vid", videosControllers.comment)

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

router.delete("/comment/:vid", videosControllers.deleteComment)

router.patch("/comment/:vid", videosControllers.editComment)

router.delete("/:vid", videosControllers.deleteVideo);


module.exports = router;
