require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const mongoose = require("mongoose");

const { URL } = require("./utils/config");
const usersRouter = require("./Controller/userRoutes");

app.use(cors());
app.use(express.json());

mongoose.set("strictQuery", false);

mongoose
  .connect(URL)
  .then(() => {
    console.log("connected to Mongo DB");
  })
  .catch((err) => {
    console.error(err);
  });
  app.get("/", (req, res) => {
    res.send("password reset backend Task");
  });
  
  app.use(usersRouter);
  
  module.exports = app;