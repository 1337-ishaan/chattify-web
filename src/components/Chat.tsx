import React, { useEffect, useState } from "react";
import socket from "../socket";
import "../App.css";
import MessagePanel from "./MessagePanel";

const Chat = ({ logoutFunction }: any) => {
  const [usersList, setUsersList]: any = useState([]);
  const [selectedUser, setSelectedUser]: any = useState([]);

  const initReactiveProperties = (user: any) => {
    user.connected = true;
    user.messages = [];
    user.hasNewMessages = false;
    setUsersList((prevUsers: any) => [...prevUsers, user]);
  };

  useEffect(() => {
    socket.on("users", (users: any) => {
      users.forEach((user: any) => {
        user.self = user.userID === socket.id;
        initReactiveProperties(user);
        // setUsersList([user]);
      });
      // put the current user first, and then sort by username
      users = users.sort((a: any, b: any) => {
        if (a.self) return -1;
        if (b.self) return 1;
        if (a.username < b.username) return -1;
        return a.username > b.username ? 1 : 0;
      });
    });
    socket.on("user connected", (user) => {
      initReactiveProperties(user);
    });
    socket.on("connect", () => {
      usersList.forEach((user: any) => {
        if (user.self) {
          user.connected = true;
        }
      });
    });

    // socket.on("disconnect", () => {
    //   console.log("disconnected here  ");
    //   usersList.forEach((user: any) => {
    //     if (user.self) {
    //       user.connected = false;
    //     }
    //   });
    // });
    //eslint-disable-next-line
  }, [socket]);

  return (
    <>
      <div className="left-panel">
        {usersList.length > 0 &&
          usersList.map((user: any, i: number) => (
            <div onClick={() => setSelectedUser(user)} key={i}>
              {user.username}
              <br />
            </div>
          ))}
      </div>
      <div className="right-panel">
        <MessagePanel selectedUser={selectedUser} usersList={usersList} />
        <button onClick={logoutFunction}>LOGOUT</button>
      </div>
    </>
  );
};

export default Chat;
