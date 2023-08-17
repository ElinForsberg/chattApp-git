const express = require("express");
const app = express();
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

let activeRooms = []; // Array för att lagra aktiva rum

io.on("connection", (socket) => {
  console.log(`User Connected: ${socket.id}`);

  socket.on("join_room", (data) => {
    socket.join(data);
    activeRooms.push(data); // Lägger till det anslutna rummet i arrayen
    io.emit("active_rooms", activeRooms); // Skicka listan över aktiva rum till alla anslutna klienter
    console.log(`User with ID: ${socket.id} joined room: ${data}`);
  });

  socket.on("send_message", (data) => {
    socket.to(data.room).emit("receive_message", data);
  });

  socket.on("disconnect", () => {
    activeRooms = activeRooms.filter((room) => {
      return io.sockets.adapter.rooms.get(room)?.size > 0; // Ta bort rummet från listan om ingen är kvar i det
    });
    io.emit("active_rooms", activeRooms); // Skickar lista på aktiva rum till alla 
    console.log("User Disconnected", socket.id);
  });
});

server.listen(3001, () => {
  console.log("SERVER RUNNING");
});
