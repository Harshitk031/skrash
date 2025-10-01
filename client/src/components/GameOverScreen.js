import React from 'react';
import './GameOverScreen.css';

const GameOverScreen = ({ winners, onStartNewGame }) => {
  return (
    <div className="game-over-screen">
      <div className="game-over-modal">
        <h2>🏆 Game Over 🏆</h2>
        <div className="winners-list">
          {winners.map((winner, index) => (
            <div key={index} className={`winner-item winner-${index + 1}`}>
              <div className="winner-rank">
                {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
              </div>
              <div className="winner-name">{winner[0]}</div>
              <div className="winner-score">{winner[1]} points</div>
            </div>
          ))}
        </div>
        <button className="new-game-btn" onClick={onStartNewGame}>
          🎉 Start New Game
        </button>
      </div>
    </div>
  );
};

export default GameOverScreen;
