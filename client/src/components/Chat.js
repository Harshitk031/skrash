import React, { useRef, useEffect, useState } from 'react';
import './Chat.css';

const Chat = ({ messages, inputValue, onInputChange, onSubmit, disabled, wordCount }) => {
  const messagesEndRef = useRef(null);
  const chatMessagesRef = useRef(null);
  const [lastMessageTime, setLastMessageTime] = useState(0);
  const [isRateLimited, setIsRateLimited] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e) => {
    e.preventDefault();

    // Rate limiting
    const now = Date.now();
    if (now - lastMessageTime < 1000) {
      setIsRateLimited(true);
      setTimeout(() => setIsRateLimited(false), 1000);
      return;
    }

    if (inputValue.trim().length > 0) {
      const messageToSend = inputValue.trim();
      onSubmit(messageToSend);       // ✅ Only send string
      setLastMessageTime(now);
      onInputChange('');             // clear input
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      handleSubmit(e);
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h3>Chat</h3>
      </div>

      <div className="chat-messages" ref={chatMessagesRef}>
        {messages.length === 0 ? (
          <div className="no-messages">
            <p>No messages yet. Start chatting!</p>
          </div>
        ) : (
          messages.map((message) => (
            <div key={message.id} className="chat-message">
              <div className="message-header">
                <span className="message-player">{message.playerName}</span>
                <span className="message-time">{message.timestamp}</span>
              </div>
              <div className="message-content" style={{ color: message.color }}>
                {message.content}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="chat-input-form">
        <div className="input-container">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={disabled ? "You can't chat while drawing" : "Type your guess..."}
            disabled={disabled || isRateLimited}
            maxLength={50}
            className="chat-input"
          />
          {wordCount > 0 && <span className="word-counter">({wordCount})</span>}
        </div>
        <button
          type="submit"
          disabled={disabled || inputValue.trim().length === 0 || isRateLimited}
          className="send-button"
        >
          {isRateLimited ? "Wait..." : "Send"}
        </button>
        {isRateLimited && (
          <div className="rate-limit-warning">
            Please wait before sending another message
          </div>
        )}
      </form>
    </div>
  );
};

export default Chat;
