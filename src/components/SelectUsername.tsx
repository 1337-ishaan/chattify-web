import React, { useEffect, useState } from "react";
import socket from "../socket";
import Chat from "./Chat";

const SelectUsername = () => {
  const [usernameAlreadySelected, setUsernameAlreadySelected] = useState(false);
  const [username, setUsername] = useState("");

  useEffect(() => {
    socket.on("connect_error", (err) => {
      if (err.message === "invalid username") {
        setUsernameAlreadySelected(false);
      }
    });
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
