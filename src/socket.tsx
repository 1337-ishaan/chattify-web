import { io } from "socket.io-client";

const URL = "http://143.110.246.44:3010";
const socket = io(URL, { autoConnect: false });

socket.onAny((event, ...args) => {
  console.log(event, args);
});

export default socket;
