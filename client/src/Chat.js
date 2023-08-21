import React, { useEffect, useState } from "react";

function Chat({ socket, username, room }) {
  const [currentMessage, setCurrentMessage] = useState("");
  const [messageList, setMessageList] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  const [isTyping, setIsTyping] = useState(false);

  const sendMessage = async () => {
    if (currentMessage !== "") {
      const messageData = {
        room: room,
        author: username,
        message: currentMessage,
        time:
          new Date(Date.now()).getHours() +
          ":" +
          new Date(Date.now()).getMinutes(),
      };

      await socket.emit("send_message", messageData);
      setMessageList((list) => [...list, messageData]);
      setCurrentMessage("");
      console.log(setMessageList);
    }
  };
  
  useEffect(() => {
    socket.on("receive_message", (data) => {
      setMessageList((list) => [...list, data]);
      setIsTyping(false);
    });
  }, [socket]);

  useEffect(() => {
    socket.on("typing", (username) => {
      if (!typingUsers.includes(username)) {
        setTypingUsers((prevTypingUsers) => [...prevTypingUsers, username]);
      }
      setIsTyping(true);
    });

    socket.on("not_typing", (username) => {
      setTypingUsers((prevTypingUsers) =>
        prevTypingUsers.filter((user) => user !== username)
      );    
      if (typingUsers.length === 0) {
        setIsTyping(false);
      }
    });

    return () => {
      socket.off("receive_message");
      socket.off("typing");
      socket.off("not_typing");
    };
  }, [socket, typingUsers]);

  const handleInput = (event) => {
    const inputMessage = event.target.value;
    setCurrentMessage(inputMessage);

    if (inputMessage.trim() !== "") {
      socket.emit("typing", username);
    } else {
      socket.emit("not_typing", username);
    }
  };

  return (
    <div className="chat-window">
      <div className="chat-header">
        <p>Live Chat</p>
      </div>
      <div className="chat-body">
        {/* ScrollToBottom */}
        <div className="message-container">
          <div className="feedback">
          {isTyping && (
              <p>
                {typingUsers.join(", ")}{" "}
                {typingUsers.length === 1 ? "is" : "are"} typing now...
              </p>
            )}
          </div>
          {messageList.map((messageContent) => {
            return (  
              <div
                className="message"
                id={username === messageContent.author ? "you" : "other"}
              >
                         
                <div>
                  <div className="message-content">
                    <p>{messageContent.message}</p>
                  </div>
                  <div className="message-meta">
                    <p id="time">{messageContent.time}</p>
                    <p id="author">{messageContent.author}</p>
                  </div>
                  
                </div>
              </div>
              
            );
          })}
        </div>
      </div>
      <div className="chat-footer">
        <input
          type="text"
          value={currentMessage}
          placeholder="Hey..."
          onChange={handleInput}
          onKeyPress={(event) => {
            event.key === "Enter" && sendMessage();
          }}
        />
        <button onClick={sendMessage}>&#9658;</button>
      </div>
      <div>
        <p>Du är i rum: {room}</p>
        <p>Alla aktiva rum: {room}</p>
      </div>
    </div>
  );
}

export default Chat;
