import React, { useEffect, useState } from "react";
import socket from "../socket";

const MessagePanel = (props: any) => {
  const [messageToSend, setMessageToSend] = useState("");
  const { selectedUser, usersList } = props;

  const messageHandler = ({ content, from }: any) => {
    console.log(content, from, "content & form");
    var user;
    for (let i = 0; i < usersList.length; i++) {
      user = usersList[i];
    }
    if (user && user.userID === from) {
      console.log("user from");
      user.messages.push({
        content,
        fromSelf: false,
      });
      if (user !== selectedUser) {
        console.log("user to");
        user.hasNewMessages = true;
      }
    }
  };

  useEffect(() => {
    socket.on("private message", messageHandler);
  }, [usersList]);

  const onMessage = (e: any, content: any) => {
    e.preventDefault();
    if (selectedUser) {
      socket.emit("private message", {
        content,
        to: selectedUser.userID,
      });
      selectedUser.messages.push({
        content,
        fromSelf: true,
      });
    }
    setMessageToSend("");
  };

  return (
    <>
      <div className="chat_screen">
        <h3>{selectedUser && selectedUser.username}</h3>
        <br />
        <div className="chat-window">
          <ul className="messages">
            {selectedUser.messages &&
              selectedUser.messages.map((t: any, i: any) => (
                <li>
                  <div>{t.content}</div>
                </li>
              ))}
          </ul>
        </div>
        <form onSubmit={(e) => onMessage(e, messageToSend)}>
          <input
            onChange={(e) => setMessageToSend(e.target.value)}
            type="text"
          />
          <button
            onClick={(e) => onMessage(e, messageToSend)}
            className="send-button"
          >
            SEND
          </button>
        </form>
      </div>
    </>
  );
};

export default MessagePanel;
