const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const videosRoutes = require("./routes/videos-routes");
const usersRoutes = require("./routes/users-routes");

const HttpError = require("./models/http-error");

const app = express();

app.use(bodyParser.json());

app.use("/api/videos", videosRoutes);
app.use("/api/users", usersRoutes);

app.use((req, res, next) => {
  const error = new HttpError("Could not find this route", 404);
  throw error;
});

app.use((error, req, res, next) => {
  if (res.headerSent) {
    return next(error);
  }
  res.status(error.code || 500);
  res.json({ message: error.message || "An unknown error occurred!" });
});

mongoose
  .connect('mongodb+srv://Hieu:123@cluster0.b3wge.mongodb.net/youtube-app?retryWrites=true&w=majority')
  .then(() => {
    app.listen(5000);
  })
  .catch((err) => {
    console.log(err);
  });
