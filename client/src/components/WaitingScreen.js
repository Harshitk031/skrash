import React from 'react';
import './WaitingScreen.css';

const WaitingScreen = ({ roomCode }) => {
  return (
    <div className="waiting-screen">
      <div className="waiting-container">
        <div className="waiting-content">
          <h1>⏳ Waiting for Host</h1>
          <p>Please wait while the host starts the game...</p>
          
          {roomCode && (
            <div className="room-info">
              <h3>🏠 Private Room</h3>
              <p>Room Code: <span className="room-code">{roomCode}</span></p>
              <p className="room-tip">Share this code with friends to join!</p>
            </div>
          )}
          
          <div className="loading-animation">
            <div className="spinner"></div>
          </div>
          
          <div className="game-tips">
            <h3>🎮 Game Tips:</h3>
            <ul>
              <li>🎨 One player will be chosen to draw</li>
              <li>💬 Others will guess the word in chat</li>
              <li>⏰ Beat the timer to score points</li>
              <li>🏆 Highest score wins the round!</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WaitingScreen;
