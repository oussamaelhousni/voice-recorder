const express = require("express");
const multer = require("multer");
const mongoose = require("mongoose");

const app = express();

app.use(express.json());
app.use(express.static("./public"));

const upload = multer({
  storage: multer.memoryStorage(),
});

const audioSchema = new mongoose.Schema({
  audio: {
    type: mongoose.Schema.Types.Buffer,
    required: [true, "please provide an audio"],
  },
});

const audioModel = mongoose.model("Audio", audioSchema);

app.get("/audios", async (req, res) => {
  const audios = await audioModel.find({});
  return res.status(200).json({
    status: "success",
    audios,
  });
});

app.post("/upload", upload.single("audio"), async (req, res) => {
  console.log("here in update");
  const audio = await audioModel.create({ audio: req.file.buffer });
  return res.status(200).json({ status: "success", audio });
});

mongoose.connect("mongodb://localhost:27017/audios").then(() => {
  app.listen(3000, () => {
    console.log("server running at port 300");
  });
});
