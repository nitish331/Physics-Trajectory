const express = require("express");
const passport = require("passport");
const cors = require("cors");
const http = require("http");
const socketio = require("socket.io");

require("dotenv").config();
const PORT = process.env.PORT || 5000;

const db = require("./config/mongoose");

const passportStratergy = require("./config/passport");
const routes = require("./routes/route");

const bodyParser = require("body-parser");
const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  next();
});

app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

app.use(routes);

const server = http.createServer(app);

const io = socketio(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// initialising socketIo connection
io.on("connection", (socket) => {
  console.log("new client connected");

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

server.listen(PORT, (err) => {
  if (err) {
    console.log("error in running the server");
    return;
  } else {
    console.log("server is up and running");
  }
});

// Handling Unhandled Promise Rejections
process.on("unhandledRejection", (err) => {
  console.log(`some error occured, -> ${err.message}`);

  // closing the server and exiting the process
  server.close(() => process.exit(1));
});

module.exports = app;
