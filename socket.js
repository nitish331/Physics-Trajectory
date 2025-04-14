const socketIo = require("socket.io");

let io;

const socket = {
  init: (httpServer, options) => {
    io = socketIo(httpServer, options);
    return io;
  },
  getIO: () => {
    if (!io) {
      throw new Error("Socket.io not initialized!");
    }
    return io;
  },
};

module.exports = socket;
