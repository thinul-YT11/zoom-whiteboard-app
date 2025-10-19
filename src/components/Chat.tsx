'use client';

import { useEffect, useState } from 'react';

const Chat = ({ socket }) => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    if (socket) {
      socket.on('chat-message', (message) => {
        setMessages((prevMessages) => [...prevMessages, message]);
      });
    }
  }, [socket]);

  const sendMessage = () => {
    if (socket && message) {
      socket.emit('chat-message', message);
      setMessage('');
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-grow bg-gray-100 p-4 overflow-y-auto">
        {messages.map((msg, index) => (
          <div key={index} className="mb-2">
            {msg}
          </div>
        ))}
      </div>
      <div className="p-4">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
          className="w-full px-4 py-2 border border-gray-300 rounded-md"
        />
        <button
          onClick={sendMessage}
          className="w-full px-4 py-2 mt-2 text-white bg-blue-500 rounded-md hover:bg-blue-600"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default Chat;
