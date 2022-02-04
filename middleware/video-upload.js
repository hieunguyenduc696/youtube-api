const multer = require("multer");
const uuid = require("uuid").v1;

const MIME_TYPE_MAP = {
  "video/x-matroska": "mkv",
  "video/mp4": "mp4",
  "image/png": "png",
  "image/jpeg": "jpeg",
  "image/jpg": "jpg",
};

const videoUpload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "uploads/videos");
    },
    filename: (req, file, cb) => {
      const ext = MIME_TYPE_MAP[file.mimetype];
      cb(null, uuid() + "." + ext);
    },
  }),
  fileFilter: (req, file, cb) => {
    const isValid = !!MIME_TYPE_MAP[file.mimetype];
    let error = isValid ? null : new Error("Invalid mime type!");
    cb(error, isValid);
  },
});

module.exports = videoUpload;
