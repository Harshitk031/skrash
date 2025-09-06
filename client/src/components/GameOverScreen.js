import React from 'react';
import './GameOverScreen.css';

const GameOverScreen = ({ winners }) => {
  return (
    <div className="game-over-screen">
      <div className="game-over-modal">
        <h2>Game Over</h2>
        <div className="winners-list">
          {winners.map((winner, index) => (
            <div key={index} className={`winner-item winner-${index + 1}`}>
              <div className="winner-rank">{index + 1}</div>
              <div className="winner-name">{winner[0]}</div>
              <div className="winner-score">{winner[1]}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GameOverScreen;
