import { io } from "socket.io-client";

const socket = io("https://nofari7-backend.onrender.com", {
  transports: ["websocket"]
});

export default socket;