import React from 'react';
import './HostScreen.css';

const HostScreen = ({ onStartGame, roomCode }) => {
  return (
    <div className="host-screen">
      <div className="host-container">
        <div className="host-content">
          <h1>👑 You're the Host!</h1>
          <p>You control when the game starts</p>
          
          {roomCode && (
            <div className="room-info">
              <h3>🏠 Private Room</h3>
              <p>Room Code: <span className="room-code">{roomCode}</span></p>
              <p className="room-tip">Share this code with friends to join!</p>
            </div>
          )}
          
          <div className="start-game-section">
            <button 
              onClick={onStartGame}
              className="start-game-btn"
            >
              🚀 Start Game
            </button>
            <p className="start-tip">Click when you're ready to begin!</p>
          </div>
          
          <div className="host-tips">
            <h3>🎯 Host Tips:</h3>
            <ul>
              <li>👥 Wait for players to join</li>
              <li>🎮 Start when you have enough players</li>
              <li>⚡ You can start with 2+ players</li>
              <li>🔄 New players can join between rounds</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HostScreen;
