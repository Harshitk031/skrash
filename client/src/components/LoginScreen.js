import React, { useState } from 'react';
import './LoginScreen.css';

const LoginScreen = ({ onLogin }) => {
  const [playerName, setPlayerName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [isJoiningRoom, setIsJoiningRoom] = useState(false);
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);
  const [error, setError] = useState('');

  const generateRoomCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  const handleCreateRoom = () => {
    if (playerName.trim()) {
      const newRoomCode = generateRoomCode();
      setRoomCode(newRoomCode);
      setIsCreatingRoom(true);
      onLogin(playerName, newRoomCode, 'create');
    }
  };

  const handleJoinRoom = () => {
    if (playerName.trim() && roomCode.trim()) {
      setIsJoiningRoom(true);
      onLogin(playerName, roomCode, 'join');
    }
  };

  const handleRandomName = () => {
    const adjectives = ['Happy', 'Clever', 'Brave', 'Witty', 'Smart', 'Funny', 'Cool', 'Amazing'];
    const nouns = ['Player', 'Gamer', 'Artist', 'Hero', 'Star', 'Champion', 'Legend', 'Master'];
    const randomName = adjectives[Math.floor(Math.random() * adjectives.length)] + 
                      nouns[Math.floor(Math.random() * nouns.length)] + 
                      Math.floor(Math.random() * 100);
    setPlayerName(randomName);
  };

  return (
    <div className="login-screen">
      <div className="login-container">
        <div className="game-title">
          <h1>🎨 Skrash</h1>
          <p>Draw & Guess with Friends</p>
        </div>

        <div className="login-form">
          <div className="input-group">
            <label htmlFor="playerName">Your Name:</label>
            <div className="name-input-container">
              <input
                type="text"
                id="playerName"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Enter your name"
                maxLength="20"
              />
              <button 
                type="button" 
                onClick={handleRandomName}
                className="random-name-btn"
                title="Generate random name"
              >
                🎲
              </button>
            </div>
          </div>

          <div className="room-options">
            <h3>Choose Game Mode:</h3>
            
            {/* Create Private Room */}
            <div className="room-option">
              <h4>🏠 Create Private Room</h4>
              <p>Start a private game with friends</p>
              <button 
                onClick={handleCreateRoom}
                disabled={!playerName.trim()}
                className="btn btn-success"
              >
                Create Private Room
              </button>
            </div>

            {/* Join Private Room */}
            <div className="room-option">
              <h4>🔑 Join Private Room</h4>
              <p>Enter a room code from a friend</p>
              <div className="room-code-input">
                <input
                  type="text"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                  placeholder="Enter room code"
                  maxLength="6"
                  className="room-code-field"
                />
                <button 
                  onClick={handleJoinRoom}
                  disabled={!playerName.trim() || !roomCode.trim()}
                  className="btn btn-secondary"
                >
                  Join Room
                </button>
              </div>
              {isJoiningRoom && (
                <div className="joining-room">
                  <div className="loading-spinner"></div>
                  <p>Joining room...</p>
                </div>
              )}
            </div>
          </div>

          {isCreatingRoom && (
            <div className="room-created">
              <h4>🎉 Room Created!</h4>
              <p>Share this code with your friends:</p>
              <div className="room-code-display">
                <span className="room-code">{roomCode}</span>
                <button 
                  onClick={() => navigator.clipboard.writeText(roomCode)}
                  className="copy-btn"
                  title="Copy to clipboard"
                >
                  📋
                </button>
              </div>
              <p className="waiting-text">Waiting for players to join...</p>
            </div>
          )}

          {isJoiningRoom && (
            <div className="joining-room">
              <h4>🔑 Joining Room...</h4>
              <p>Room Code: <span className="room-code">{roomCode}</span></p>
              <div className="loading-spinner"></div>
            </div>
          )}
        </div>

        <div className="game-info">
          <h3>How to Play:</h3>
          <ul>
            <li>🎨 One player draws while others guess</li>
            <li>💬 Use the chat to submit your guesses</li>
            <li>⏰ Beat the timer to score points</li>
            <li>🏆 Highest score wins!</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
