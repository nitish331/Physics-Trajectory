const mongoose = require("mongoose");

mongoose.connect(process.env.MONGO_URL);

const db = mongoose.connection;

db.on("error", console.error.bind(console, "error in connecting with db"));

db.once("open", function () {
  console.log("connection with mongodb established succesfully");
});

module.exports = db;
