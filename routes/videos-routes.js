const express = require("express");

const videosControllers = require('../controllers/videos-controllers')

const router = express.Router();

router.get("/:vid", videosControllers.getVideoById);

router.get("/user/:uid", videosControllers.getVideosByUserId);

router.post("/", videosControllers.createVideo)

module.exports = router;
