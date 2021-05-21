import React, { useEffect, useState } from "react";
import socket from "../socket";
import Chat from "./Chat";
import { Socket } from "socket.io-client";

const SelectUsername = () => {
  const [usernameAlreadySelected, setUsernameAlreadySelected] = useState(false);
  const [username, setUsername] = useState("");

  interface ISocket extends Socket {
    userID?: any;
    sessionID?: any;
  }
  useEffect(() => {
    socket.on("connect_error", (err) => {
      if (err.message === "invalid username") {
        setUsernameAlreadySelected(false);
      }
    });
    console.log(socket, "SOCKET");
    socket.on("session", ({ sessionID, userID }: ISocket) => {
      // attach the session ID to the next reconnection attempts
      socket.auth = { sessionID };
      // store it in the localStorage
      localStorage.setItem("sessionID", sessionID);
      // save the ID of the user
      socket.auth.userID = { userID };
    });
    let sessionID = localStorage.getItem("sessionID");

    if (sessionID) {
      setUsernameAlreadySelected(true);
      socket.auth = { sessionID };
      socket.connect();
    }
  });
  const onUsernameSelection = (e: any, username: any) => {
    e.preventDefault();
    setUsernameAlreadySelected(true);
    socket.auth = { username };
    socket.connect();
  };

  return (
    <>
      {!usernameAlreadySelected ? (
        <form onSubmit={(e) => onUsernameSelection(e, username)}>
          <input onChange={(e) => setUsername(e.target.value)} type="text" />
          <button onClick={(e) => onUsernameSelection(e, username)}>
            Submit{" "}
          </button>
        </form>
      ) : (
        <Chat />
      )}
    </>
  );
};

export default SelectUsername;
