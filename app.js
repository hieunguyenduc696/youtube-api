const express = require("express");
const bodyParser = require("body-parser");

const videosRoutes = require("./routes/videos-routes");

const app = express();

app.use('/api/videos', videosRoutes);

app.listen(5000);
